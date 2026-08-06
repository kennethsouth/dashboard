var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var XLSXModule = __toESM(require("xlsx"), 1);
var XLSX = XLSXModule.default || XLSXModule;
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var DATA_DIR = import_path.default.join(process.cwd(), "data");
if (!import_fs.default.existsSync(DATA_DIR)) {
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
}
var EXCEL_PATH = import_path.default.join(DATA_DIR, "records.xlsx");
var CSV_PATH = import_path.default.join(DATA_DIR, "records.csv");
var DIVISIONS_PATH = import_path.default.join(DATA_DIR, "divisions.json");
var DEFAULT_DIVISIONS = [
  "9-1-1 Communications",
  "Animal Control",
  "Aviation",
  "BOMB",
  "Civil",
  "Coroner",
  "Court",
  "Detention",
  "Emergency Management",
  "EMS",
  "Environmental Enforcement",
  "Gang",
  "Investigation",
  "K-9",
  "NARC",
  "Pet Resource Center",
  "Radio Shop",
  "Roads & Bridges",
  "SCC",
  "SCSDB",
  "Sheriff - Admin",
  "Sheriff - Patrol",
  "Sheriff - Spec Services",
  "Sheriff - SRO",
  "Sheriff - Traffic",
  "Sheriff - Training",
  "Sheriff - Warrants",
  "Solicitor",
  "Solid Waste",
  "Spartanburg PD",
  "Spartanburg Water",
  "SRO",
  "SWAT",
  "Trinity FD",
  "USCU"
];
function getDivisions() {
  if (import_fs.default.existsSync(DIVISIONS_PATH)) {
    try {
      const data = import_fs.default.readFileSync(DIVISIONS_PATH, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading divisions.json", err);
    }
  }
  import_fs.default.writeFileSync(DIVISIONS_PATH, JSON.stringify(DEFAULT_DIVISIONS, null, 2));
  return DEFAULT_DIVISIONS;
}
function saveDivisions(divisions) {
  import_fs.default.writeFileSync(DIVISIONS_PATH, JSON.stringify(divisions, null, 2));
}
function getRecords() {
  if (!import_fs.default.existsSync(EXCEL_PATH)) {
    return [];
  }
  try {
    const fileBuffer = import_fs.default.readFileSync(EXCEL_PATH);
    const readFunc = XLSX.read || XLSX.default && XLSX.default.read;
    const workbook = readFunc ? readFunc(fileBuffer, { type: "buffer" }) : XLSX.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    const worksheet = workbook.Sheets[sheetName];
    const utils = XLSX.utils || XLSX.default && XLSX.default.utils;
    const rawRecords = utils.sheet_to_json(worksheet) || [];
    return rawRecords.map((r, idx) => ({
      id: String(r["Record ID"] || r.ID || r.id || `REC-${idx + 1}`),
      timestamp: String(r["Date & Time"] || r.Timestamp || r.timestamp || (/* @__PURE__ */ new Date()).toLocaleString()),
      action: String(r["Action Command"] || r.Action || r.action || "INTAKE").toUpperCase().includes("OUT") ? "OUTTAKE" : "INTAKE",
      tdma: String(r["TDMA Status"] || r.TDMA || r.tdma || "NO").toUpperCase().includes("Y") ? "YES" : "NO",
      serialNumber: String(r["Serial Number"] || r.SerialNumber || r.serialNumber || ""),
      division: String(r.Division || r.division || "Unassigned")
    }));
  } catch (err) {
    console.error("Error reading Excel records file", err);
    return [];
  }
}
function writeRecordsToFile(records) {
  const formattedData = records.map((rec) => ({
    "Record ID": rec.id,
    "Date & Time": rec.timestamp,
    "Action Command": rec.action,
    "TDMA Status": rec.tdma,
    "Serial Number": rec.serialNumber,
    "Division": rec.division
  }));
  const utils = XLSX.utils || XLSX.default && XLSX.default.utils;
  const worksheet = utils.json_to_sheet(formattedData);
  worksheet["!cols"] = [
    { wch: 18 },
    { wch: 24 },
    { wch: 16 },
    { wch: 14 },
    { wch: 24 },
    { wch: 28 }
  ];
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Equipment Log");
  const writeFunc = XLSX.write || XLSX.default && XLSX.default.write;
  if (writeFunc) {
    const excelBuffer = writeFunc(workbook, { type: "buffer", bookType: "xlsx" });
    import_fs.default.writeFileSync(EXCEL_PATH, excelBuffer);
  } else if (XLSX.writeFile) {
    XLSX.writeFile(workbook, EXCEL_PATH);
  }
  const csvContent = utils.sheet_to_csv(worksheet);
  import_fs.default.writeFileSync(CSV_PATH, csvContent, "utf-8");
}
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/records", (_req, res) => {
  const records = getRecords();
  res.json({ success: true, count: records.length, records });
});
app.post("/api/records", (req, res) => {
  const { action, tdma, serialNumber, division, timestamp } = req.body;
  if (!action || !tdma || !serialNumber || !division) {
    res.status(400).json({ success: false, error: "Missing required fields" });
    return;
  }
  const records = getRecords();
  const newRecord = {
    id: `REC-${Date.now().toString(36).toUpperCase()}`,
    timestamp: timestamp || (/* @__PURE__ */ new Date()).toLocaleString(),
    action,
    tdma,
    serialNumber,
    division
  };
  records.unshift(newRecord);
  writeRecordsToFile(records);
  res.json({
    success: true,
    message: "Record successfully appended to Excel and CSV backend database",
    record: newRecord
  });
});
app.get("/api/divisions", (_req, res) => {
  const divisions = getDivisions();
  res.json({ success: true, divisions });
});
app.post("/api/divisions", (req, res) => {
  const { divisions } = req.body;
  if (!Array.isArray(divisions)) {
    res.status(400).json({ success: false, error: "Divisions must be an array of strings" });
    return;
  }
  saveDivisions(divisions);
  res.json({ success: true, divisions });
});
app.get("/api/export/annual-excel", (req, res) => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
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
app.post("/api/records/reset", (_req, res) => {
  try {
    writeRecordsToFile([]);
    res.json({ success: true, message: "All records cleared successfully for the new annual cycle" });
  } catch (err) {
    console.error("Error resetting records", err);
    res.status(500).json({ success: false, error: "Failed to reset records" });
  }
});
app.get("/api/export/excel", (_req, res) => {
  const records = getRecords();
  if (records.length === 0) {
    writeRecordsToFile([]);
  }
  res.download(EXCEL_PATH, "Equipment_Log_Database.xlsx", (err) => {
    if (err && !res.headersSent) {
      res.status(500).send("Error downloading Excel file");
    }
  });
});
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
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Dashboard Server] Running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
