
export interface CSVRow {
  [key: string]: string | number | null;
}

export interface ColumnStats {
  name: string;
  type: string; // 'numeric' | 'string' | 'boolean'
  missingCount: number;
  uniqueCount: number;
  sampleValues: (string | number)[];
}

export interface DatasetSummary {
  rowCount: number;
  columns: ColumnStats[];
  preview: CSVRow[];
  allRows?: CSVRow[]; // Added for export functionality
}

export enum AgentActionType {
  ANALYZE = 'ANALYZE',
  CLEAN = 'CLEAN',
  IMPUTE = 'IMPUTE',
  ENGINEER = 'ENGINEER',
  FINISH = 'FINISH'
}

export interface AgentStep {
  id: string;
  type: AgentActionType;
  title: string;
  description: string;
  reasoning: string;
  pythonCode: string;
  status: 'pending' | 'running' | 'completed';
  qualityScoreImpact?: number; // Simulated score improvement
  affectedColumns: string[];
  traceThoughts: string[]; // Granular logical steps for trace graph
}

export interface AgentPlan {
  steps: AgentStep[];
  finalReport: string;
}

export enum AppState {
  LANDING = 'LANDING',
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  PROCESSING = 'PROCESSING',
  FINISHED = 'FINISHED'
}