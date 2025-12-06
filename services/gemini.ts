
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { DatasetSummary, AgentStep, AgentActionType } from "../types";

let ai: GoogleGenAI | null = null;

export const initGemini = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing from environment variables");
    return;
  }
  try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  } catch (error) {
    console.error("Failed to initialize Gemini:", error);
  }
};

const SYSTEM_INSTRUCTION = `
You are ProcessumAir, an elite Autonomous Data Engineering Agent. 
Your mission is to transform raw, messy datasets into high-quality, production-ready assets for Machine Learning.
Your target Data Quality Score is **90+**.

### CAPABILITIES & TECHNIQUES
1.  **Exploratory Data Analysis (EDA)**: Detect schema anomalies, mixed types, and distribution skews.
2.  **Advanced Imputation**:
    -   *Numeric*: Beyond Mean/Median. Use **KNNImputer** or **IterativeImputer** for high precision if correlated.
    -   *Categorical*: Mode or "Unknown" token.
    -   *Time-series*: Interpolation or Forward-fill.
3.  **Outlier Management**:
    -   *Detection*: Z-Score (>3), IQR (1.5x), or **Isolation Forest**.
    -   *Treatment*: Winsorization (Capping), Log transformation (to reduce skew), or Removal (only if row count permits).
4.  **Feature Engineering**:
    -   *Encoding*: One-Hot (low cardinality), Target Encoding (high cardinality), Frequency Encoding.
    -   *Scaling*: StandardScaler (Normal), MinMaxScaler (Bounded), RobustScaler (Outlier-heavy).
    -   *Extraction*: Date parts, Text length, Regex pattern extraction.
    -   *Interaction*: Polynomial features if relevant to goal.
5.  **Data Hygiene**:
    -   Drop ID/Constant columns (Zero Variance).
    -   Deduplication.
    -   String normalization (lower, strip, regex clean).

### CORNER CASE RULES
-   **High Missingness**: If a column is >50% null, drop it unless it's the Target.
-   **IDs/Metadata**: Identify and drop columns that are unique identifiers (e.g., "Customer_ID") as they add noise.
-   **Data Leakage**: Do not impute the Target column; drop rows where Target is missing.
-   **Low Quality Data**: If the dataset is too small (<50 rows) or has excessive missing data, acknowledge that a 90+ score is impossible and explain why in the Final Validation step.

### OUTPUT INSTRUCTIONS
-   Generate a sequence of 5-7 highly specific steps.
-   Assign 'qualityScoreImpact' (0-20) to each step. 
    -   *High (15-20)*: Critical fixes (Imputation, Encoding, Outliers).
    -   *Medium (5-15)*: Scaling, Transformation.
    -   *Low (0-5)*: Dropping cols, Renaming.
-   **Goal**: The sum of 'qualityScoreImpact' + 30 (Base) should ideally exceed 90. 
-   **Gap Analysis**: If the data is fundamentally broken and the score is < 90, the final step must be 'Quality Assessment' explaining the deficit.
`;

// Helper for retry logic
async function withRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      console.warn(`Attempt ${i + 1} failed:`, error);
      lastError = error;
      
      // Check for various error shapes (Network, 5xx, Nested errors)
      const errorMsg = error?.message || '';
      const isNetworkError = 
        errorMsg.includes('xhr') || 
        errorMsg.includes('fetch') || 
        errorMsg.includes('network') ||
        errorMsg.includes('Rpc failed');
        
      const isServerError = 
        error?.code === 500 || 
        error?.status === 500 || 
        error?.error?.code === 500 || 
        error?.error?.status === 500;

      if (i < retries - 1 && (isNetworkError || isServerError)) {
         const delay = 1000 * Math.pow(2, i);
         console.log(`Retrying in ${delay}ms...`);
         await new Promise(resolve => setTimeout(resolve, delay)); // Exponential backoff
         continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const generateCleaningPlan = async (
  summary: DatasetSummary,
  goal: string
): Promise<AgentStep[]> => {
  if (!ai) initGemini();
  if (!ai) throw new Error("AI not initialized");

  // Payload Optimization - Strict limits to avoid RPC errors
  const limitedColumns = summary.columns.slice(0, 15).map(c => ({
    name: c.name,
    type: c.type,
    missing: c.missingCount,
    unique: c.uniqueCount,
    samples: c.sampleValues.slice(0, 3).map(v => String(v).slice(0, 20)) 
  }));

  const context = `
    DATASET PROFILE:
    - Rows: ${summary.rowCount}
    - Total Columns: ${summary.columns.length}
    - Columns Preview: ${JSON.stringify(limitedColumns)}
    
    USER OBJECTIVE: "${goal}"
    
    TASK:
    Analyze the dataset structure and user goal. Create a rigorous Data Engineering Pipeline.
    1. Identify critical issues (Missing values, Outliers, Wrong types).
    2. Select the *best* technique for each (e.g., "Use KNNImputer for 'Age' because...").
    3. Generate production-grade Python code (pandas/sklearn).
    4. Ensure the pipeline handles corner cases (e.g., empty columns).
    
    The last step must be 'Final Validation & Quality Report'.
  `;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: Object.values(AgentActionType) },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        reasoning: { type: Type.STRING, description: "Explain WHY this technique was chosen (e.g., 'Selected RobustScaler due to high outlier count')." },
        pythonCode: { type: Type.STRING, description: "Executable Python snippet. Assume 'df' is loaded. Import what you need inside the snippet if specific." },
        qualityScoreImpact: { type: Type.NUMBER, description: "Points (0-20) this step adds to data quality." },
        affectedColumns: { type: Type.ARRAY, items: { type: Type.STRING } },
        traceThoughts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 granular internal thoughts: [Check Nulls, Select Strategy, Apply Code]" }
      },
      required: ["type", "title", "description", "reasoning", "pythonCode", "qualityScoreImpact", "affectedColumns", "traceThoughts"]
    }
  };

  try {
    const response = await withRetry<GenerateContentResponse>(() => ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    }));

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    const steps = JSON.parse(text);
    return steps.map((s: any, index: number) => ({
      ...s,
      id: `step-${index}`,
      status: 'pending'
    }));

  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const generateDatasetSuggestions = async (
  summary: DatasetSummary
): Promise<{ prompts: string[], targetColumn: string }> => {
  if (!ai) initGemini();
  if (!ai) throw new Error("AI not initialized");

  const limitedColumns = summary.columns.slice(0, 15).map(c => ({ name: c.name, type: c.type, unique: c.uniqueCount }));

  const context = `
    Dataset Statistics:
    Columns: ${JSON.stringify(limitedColumns)}
    
    Task: 
    1. Suggest 3 data science goals/prompts (e.g. "Predict [Target]", "Cluster users by...").
    2. Identify the likely Target Column.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      prompts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 short prompts" },
      targetColumn: { type: Type.STRING, description: "Likely target column name" }
    },
    required: ["prompts", "targetColumn"]
  };

  try {
    const response = await withRetry<GenerateContentResponse>(() => ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    }));

    return JSON.parse(response.text || '{"prompts": [], "targetColumn": ""}');
  } catch (error) {
    console.error("Suggestion Error:", error);
    return { prompts: [], targetColumn: "" };
  }
};

export const generateFinalReport = async (
  steps: AgentStep[],
  summary: DatasetSummary,
  goal: string
): Promise<string> => {
  if (!ai) initGemini();
  if (!ai) throw new Error("AI not initialized");

  const stepsSummary = steps.map(s => `- ${s.title}: ${s.description}`).join('\n');

  const prompt = `
    Generate a very concise Executive Summary (strictly 3-4 lines).
    
    Goal: ${goal}
    Data: ${summary.rowCount} rows, ${summary.columns.length} cols.
    Pipeline: ${steps.length} steps executed.
    
    Output:
    A single professional paragraph (3-4 sentences max) summarizing the data health, major actions taken, and final readiness for modeling.
    Do not use markdown headers, bullet points, or bold text. Just the plain text paragraph.
  `;

  const response = await withRetry<GenerateContentResponse>(() => ai!.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  }));

  return response.text || "Report generation failed.";
};
