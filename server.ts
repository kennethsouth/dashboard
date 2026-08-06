import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import * as XLSXModule from "xlsx";

const XLSX = (XLSXModule as any).default || XLSXModule;

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const EXCEL_PATH = path.join(DATA_DIR, "records.xlsx");
const CSV_PATH = path.join(DATA_DIR, "records.csv");
const DIVISIONS_PATH = path.join(DATA_DIR, "divisions.json");

// Default Divisions list from requirements
const DEFAULT_DIVISIONS: string[] = [
  "9-1-1 Communications", "Animal Control", "Aviation", "BOMB", "Civil",
  "Coroner", "Court", "Detention", "Emergency Management", "EMS",
  "Environmental Enforcement", "Gang", "Investigation", "K-9", "NARC",
  "Pet Resource Center", "Radio Shop", "Roads & Bridges", "SCC", "SCSDB",
  "Sheriff - Admin", "Sheriff - Patrol", "Sheriff - Spec Services",
  "Sheriff - SRO", "Sheriff - Traffic", "Sheriff - Training", "Sheriff - Warrants",
  "Solicitor", "Solid Waste", "Spartanburg PD", "Spartanburg Water", "SRO",
  "SWAT", "Trinity FD", "USCU"
];

interface ServerRecord {
  id: string;
  timestamp: string;
  action: 'INTAKE' | 'OUTTAKE';
  tdma: 'YES' | 'NO';
  serialNumber: string;
  division: string;
}

// Load or initialize divisions
function getDivisions(): string[] {
  if (fs.existsSync(DIVISIONS_PATH)) {
    try {
      const data = fs.readFileSync(DIVISIONS_PATH, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading divisions.json", err);
    }
  }
  fs.writeFileSync(DIVISIONS_PATH, JSON.stringify(DEFAULT_DIVISIONS, null, 2));
  return DEFAULT_DIVISIONS;
}

function saveDivisions(divisions: string[]) {
  fs.writeFileSync(DIVISIONS_PATH, JSON.stringify(divisions, null, 2));
}

// Read records from Excel / CSV
function getRecords(): ServerRecord[] {
  if (!fs.existsSync(EXCEL_PATH)) {
    return [];
  }
  try {
    const fileBuffer = fs.readFileSync(EXCEL_PATH);
    const readFunc = XLSX.read || (XLSX.default && XLSX.default.read);
    const workbook = readFunc ? readFunc(fileBuffer, { type: 'buffer' }) : XLSX.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    const worksheet = workbook.Sheets[sheetName];
    const utils = XLSX.utils || (XLSX.default && XLSX.default.utils);
    const rawRecords = (utils.sheet_to_json(worksheet) || []) as any[];
    return rawRecords.map((r: any, idx: number) => ({
      id: String(r["Record ID"] || r.ID || r.id || `REC-${idx + 1}`),
      timestamp: String(r["Date & Time"] || r.Timestamp || r.timestamp || new Date().toLocaleString()),
      action: (String(r["Action Command"] || r.Action || r.action || "INTAKE").toUpperCase().includes('OUT') ? 'OUTTAKE' : 'INTAKE') as 'INTAKE' | 'OUTTAKE',
      tdma: (String(r["TDMA Status"] || r.TDMA || r.tdma || "NO").toUpperCase().includes('Y') ? 'YES' : 'NO') as 'YES' | 'NO',
      serialNumber: String(r["Serial Number"] || r.SerialNumber || r.serialNumber || ""),
      division: String(r.Division || r.division || "Unassigned")
    }));
  } catch (err) {
    console.error("Error reading Excel records file", err);
    return [];
  }
}

// Sync records to both .xlsx and .csv
function writeRecordsToFile(records: ServerRecord[]) {
  const formattedData = records.map((rec) => ({
    "Record ID": rec.id,
    "Date & Time": rec.timestamp,
    "Action Command": rec.action,
    "TDMA Status": rec.tdma,
    "Serial Number": rec.serialNumber,
    "Division": rec.division
  }));

  const utils = XLSX.utils || (XLSX.default && XLSX.default.utils);
  const worksheet = utils.json_to_sheet(formattedData);
  
  // Set column widths for readable Excel columns
  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 24 },
    { wch: 16 },
    { wch: 14 },
    { wch: 24 },
    { wch: 28 }
  ];

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Equipment Log");

  // Write Excel file
  const writeFunc = XLSX.write || (XLSX.default && XLSX.default.write);
  if (writeFunc) {
    const excelBuffer = writeFunc(workbook, { type: 'buffer', bookType: 'xlsx' });
    fs.writeFileSync(EXCEL_PATH, excelBuffer);
  } else if (XLSX.writeFile) {
    XLSX.writeFile(workbook, EXCEL_PATH);
  }

  // Write CSV file
  const csvContent = utils.sheet_to_csv(worksheet);
  fs.writeFileSync(CSV_PATH, csvContent, "utf-8");
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get all logged records
app.get("/api/records", (_req, res) => {
  const records = getRecords();
  res.json({ success: true, count: records.length, records });
});

// Append a new equipment record
app.post("/api/records", (req, res) => {
  const { action, tdma, serialNumber, division, timestamp } = req.body;

  if (!action || !tdma || !serialNumber || !division) {
    res.status(400).json({ success: false, error: "Missing required fields" });
    return;
  }

  const records = getRecords();
  const newRecord: ServerRecord = {
    id: `REC-${Date.now().toString(36).toUpperCase()}`,
    timestamp: timestamp || new Date().toLocaleString(),
    action,
    tdma,
    serialNumber,
    division
  };

  records.unshift(newRecord); // latest at top
  writeRecordsToFile(records);

  res.json({
    success: true,
    message: "Record successfully appended to Excel and CSV backend database",
    record: newRecord
  });
});

// Get divisions list
app.get("/api/divisions", (_req, res) => {
  const divisions = getDivisions();
  res.json({ success: true, divisions });
});

// Add / Update divisions list
app.post("/api/divisions", (req, res) => {
  const { divisions } = req.body;
  if (!Array.isArray(divisions)) {
    res.status(400).json({ success: false, error: "Divisions must be an array of strings" });
    return;
  }
  saveDivisions(divisions);
  res.json({ success: true, divisions });
});

// Export Annual Excel (.xlsx) file download
app.get("/api/export/annual-excel", (req, res) => {
  const currentYear = new Date().getFullYear();
  const yearParam = req.query.year || currentYear;
  const filename = `Annual full pull (${yearParam}).xlsx`;
  const records = getRecords();
  if (records.length === 0) {
    writeRecordsToFile([]);
  }
  res.download(EXCEL_PATH, filename, (err) => {
    if (err && !res.headersSent) {
      res.status(500).send("Error downloading Annual Excel file");
    }
  });
});

// Clear / Reset all records for new annual cycle
app.post("/api/records/reset", (_req, res) => {
  try {
    writeRecordsToFile([]);
    res.json({ success: true, message: "All records cleared successfully for the new annual cycle" });
  } catch (err) {
    console.error("Error resetting records", err);
    res.status(500).json({ success: false, error: "Failed to reset records" });
  }
});

// Export Excel (.xlsx) file download
app.get("/api/export/excel", (_req, res) => {
  const records = getRecords();
  if (records.length === 0) {
    // Create empty file if not exists
    writeRecordsToFile([]);
  }
  res.download(EXCEL_PATH, "Equipment_Log_Database.xlsx", (err) => {
    if (err && !res.headersSent) {
      res.status(500).send("Error downloading Excel file");
    }
  });
});

// Export CSV (.csv) file download
app.get("/api/export/csv", (_req, res) => {
  const records = getRecords();
  if (records.length === 0) {
    writeRecordsToFile([]);
  }
  res.download(CSV_PATH, "Equipment_Log_Database.csv", (err) => {
    if (err && !res.headersSent) {
      res.status(500).send("Error downloading CSV file");
    }
  });
});

// Generate Windows EXE packaging bundle / Python PyInstaller launcher file
app.get("/api/export/build-script", (_req, res) => {
  const pythonScript = `import os
import sys
import webview

# PyInstaller single-file Windows .exe packager for Equipment Check-In/Out Dashboard
# To compile to standalone .exe:
# 1. Install Python 3.10+
# 2. Run: pip install pywebview pyinstaller
# 3. Run: pyinstaller --onefile --noconsole --name "Equipment_Dashboard" build_exe.py

def main():
    # URL of your dashboard or local server
    app_url = "https://ais-dev-vrkn5z4azqkkqvnmwmo2xg-657430861282.us-west2.run.app"
    
    # Launch native Windows frameless / kiosk desktop window
    window = webview.create_window(
        'Operating Procedure / Workflow Dashboard',
        app_url,
        width=1920,
        height=1080,
        fullscreen=False,
        resizable=True
    )
    webview.start()

if __name__ == '__main__':
    main()
`;
  res.setHeader("Content-Disposition", 'attachment; filename="build_exe.py"');
  res.setHeader("Content-Type", "text/x-python");
  res.send(pythonScript);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Dashboard Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
