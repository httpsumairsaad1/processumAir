import { CSVRow, ColumnStats, DatasetSummary, AgentStep, AgentActionType } from '../types';
import { read, utils, writeFile } from 'xlsx';

// Helper: Calculate statistics (shared by CSV and Excel parsers)
const generateStats = (headers: string[], rows: CSVRow[]): DatasetSummary => {
  const columns: ColumnStats[] = headers.map(header => {
    const values = rows.map(r => r[header]);
    const definedValues = values.filter(v => v !== null && v !== '' && v !== undefined);
    const uniqueValues = new Set(definedValues);
    
    // Determine type
    const numericCount = definedValues.filter(v => typeof v === 'number').length;
    const type = numericCount > definedValues.length * 0.8 ? 'numeric' : 'string';

    return {
      name: header,
      type,
      missingCount: values.length - definedValues.length,
      uniqueCount: uniqueValues.size,
      sampleValues: Array.from(uniqueValues).slice(0, 5) as (string | number)[]
    };
  });

  return {
    rowCount: rows.length,
    columns,
    preview: rows.slice(0, 5),
    allRows: rows // Retain all rows for export
  };
};

export const parseCSV = (csvText: string): DatasetSummary => {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) {
    throw new Error("Empty CSV file");
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: CSVRow[] = [];
  
  // Parse up to 100,000 rows to support larger datasets while maintaining browser performance
  const limit = Math.min(lines.length, 100000);
  
  for (let i = 1; i < limit; i++) {
    // Simple regex for CSV parsing dealing with quotes
    const rowValues = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    // Fallback split if simple match fails (this is a basic parser)
    const values = rowValues 
      ? rowValues.map(v => v.replace(/^"|"$/g, '').trim())
      : lines[i].split(',').map(v => v.trim());

    if (values.length === headers.length) {
       const row: CSVRow = {};
       headers.forEach((h, index) => {
         const val = values[index];
         const numVal = Number(val);
         row[h] = isNaN(numVal) || val === '' ? val : numVal;
       });
       rows.push(row);
    }
  }

  return generateStats(headers, rows);
};

export const parseExcel = (buffer: ArrayBuffer): DatasetSummary => {
  const workbook = read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Excel file has no sheets");
  
  const worksheet = workbook.Sheets[sheetName];
  // Convert to array of arrays first to get headers cleanly
  const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
  
  if (jsonData.length === 0) throw new Error("Empty Excel sheet");

  const headers = (jsonData[0] as any[]).map(h => String(h || '').trim()).filter(h => h);
  const rows: CSVRow[] = [];

  // Limit processing to 100,000 rows
  const limit = Math.min(jsonData.length, 100000);

  for (let i = 1; i < limit; i++) {
    const rowValues = jsonData[i] as any[];
    if (!rowValues || rowValues.length === 0) continue;

    const row: CSVRow = {};
    headers.forEach((h, idx) => {
      let val = rowValues[idx];
      
      // Clean up values
      if (val === undefined || val === null) {
        val = null;
      } else if (typeof val === 'boolean') {
        val = val ? 1 : 0; // Normalize booleans to numeric for ML
      } else if (val instanceof Date) {
        val = val.toISOString().split('T')[0];
      }
      
      // Attempt numeric conversion if it looks like a number but is string
      if (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '') {
         val = Number(val);
      }

      row[h] = val;
    });
    rows.push(row);
  }

  return generateStats(headers, rows);
};

export const cleanAndExportData = (steps: AgentStep[], summary: DatasetSummary) => {
  if (!summary.allRows || summary.allRows.length === 0) {
    console.warn("No data available to export");
    return;
  }
  
  // Deep copy to avoid mutating state
  let data = JSON.parse(JSON.stringify(summary.allRows));
  let currentHeaders = summary.columns.map(c => c.name);

  steps.forEach(step => {
    // 1. DROP LOGIC (Heuristic: if desc contains drop/remove)
    if (step.type === AgentActionType.CLEAN && 
       (step.description.toLowerCase().includes('drop') || step.description.toLowerCase().includes('remove'))) {
       step.affectedColumns.forEach(colName => {
         const idx = currentHeaders.indexOf(colName);
         if (idx > -1) {
            // Remove from data
            data.forEach((row: any) => delete row[colName]);
            // Remove from headers list tracking
            currentHeaders.splice(idx, 1);
         }
       });
    }

    // 2. IMPUTATION LOGIC
    if (step.type === AgentActionType.IMPUTE) {
        step.affectedColumns.forEach(colName => {
           // Skip if column was dropped (shouldn't happen in logic but safety check)
           if (!currentHeaders.includes(colName)) return;

           // Calculate simple strategy (Mean for numeric, Mode for string)
           const colValues = data.map((r: any) => r[colName]).filter((v: any) => v !== null && v !== '' && v !== undefined);
           const isNumeric = colValues.every((v: any) => !isNaN(Number(v)));
           
           let fillValue: any;
           
           if (colValues.length > 0) {
              if (isNumeric) {
                  const sum = colValues.reduce((a: number, b: any) => a + Number(b), 0);
                  fillValue = Number((sum / colValues.length).toFixed(2)); // Mean
              } else {
                  // Mode
                  const counts: Record<string, number> = {};
                  colValues.forEach((v: any) => counts[String(v)] = (counts[String(v)] || 0) + 1);
                  fillValue = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
              }
           } else {
               fillValue = isNumeric ? 0 : "Unknown";
           }

           // Apply fill
           data.forEach((row: any) => {
               if (row[colName] === null || row[colName] === '' || row[colName] === undefined) {
                   row[colName] = fillValue;
               }
           });
        });
    }
  });

  // Export using SheetJS
  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "CleanedData");
  writeFile(workbook, "ProcessumAir_Cleaned_Data.xlsx");
};