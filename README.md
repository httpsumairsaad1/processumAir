# ProcessumAir 

**Autonomous Data Cleaning & Feature Engineering Agent**

ProcessumAir is a next-generation Data Engineering Agent designed to democratize the data preparation process. Powered by **Google Gemini 2.5 Flash**, it acts as an intelligent autonomous loop that ingests raw datasets (CSV/Excel), identifies quality issues, creates a rigorous cleaning strategy, and executes it to produce Machine Learning-ready data.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-v18+-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/typescript-v5-3178C6.svg)


ProcessumAir is an autonomous agent that inspects, cleans, and engineers features for your datasets. From raw CSV to ML-ready code in seconds.
<img width="800" height="500" alt="useC-Pu drawio" src="https://github.com/user-attachments/assets/3ad50a77-b8ff-4cc9-9731-68fb5ba28720" />
<img width="800" height="500" alt="useC-Pu drawio" src="https://github.com/user-attachments/assets/9a7a5a01-c253-4bd9-b575-10acde777e42" />

## 🚀 Key Features

*   **Autonomous Reasoning**: Analyzes dataset schema and user goals (e.g., "Predict Churn") to formulate a tailored cleaning plan.
*   **Universal Import**: Drag-and-drop support for **CSV** and **Excel (.xlsx)** files.
*   **Smart Profiling**: Automatic detection of data types, missing values, and outliers.
*   **Trace Visibility**: A visual "Decision Trace Graph" showing the agent's internal thought process (Input → Reasoning → Code).
*   **Client-Side Processing**: Data parsing and heuristic cleaning happen locally in the browser for speed and privacy.
*   **Deliverables**:
    *   **Cleaned Dataset**: Download the processed file as `.xlsx`.
    *   **Python Script**: Get a reproducible Pandas/Scikit-Learn script.
    *   **Executive Audit Report**: A professional PDF certificate of data health.

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript, Tailwind CSS
*   **AI Engine**: Google Gemini API (`@google/genai`)
*   **Data Engine**: SheetJS (`xlsx`)
*   **Visualization**: Recharts
*   **Reporting**: jsPDF

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/processum-air.git
    cd processum-air
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Key**
    ProcessumAir requires a Google Gemini API Key.
    
    Create a `.env` file in the root directory:
    ```env
    # Note: In a Vite setup, you might need to configure 'define' in vite.config.ts 
    # to support 'process.env.API_KEY' or switch to 'import.meta.env'.
    API_KEY=your_google_gemini_api_key_here
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

## 📂 Project Structure

```
processum-air/
├── src/
│   ├── components/       # UI Components (Dashboard, Charts, Modals)
│   ├── services/         # Gemini AI Service & Prompt Engineering
│   ├── utils/            # CSV/Excel Parsers & Cleaning Logic
│   ├── types.ts          # TypeScript Interfaces
│   └── App.tsx           # Main Application State & Routing
├── public/
└── package.json
```

## 🧠 System Architecture

**1. Profiling Phase**:
The app uses `SheetJS` to parse the file locally. It generates a statistical metadata summary (Row count, Null %, Types) without sending raw rows to the cloud.

**2. Planning Phase**:
This metadata + User Goal is sent to **Gemini 2.5 Flash**. The LLM returns a JSON Cleaning Plan (List of steps with reasoning and Python code).

**3. Execution Phase**:
The dashboard simulates the execution. The `cleanAndExportData` utility replicates the logic (Imputation, Dropping columns) on the full dataset in the browser memory.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
*Verified by ProcessumAir*

