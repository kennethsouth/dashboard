import React, { useState, useEffect } from 'react';
import { EquipmentRecord } from '../types';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Search, 
  RefreshCw, 
  ArrowDownLeft, 
  ArrowUpRight,
  Database,
  Lock,
  KeyRound,
  ShieldAlert
} from 'lucide-react';

interface RecordHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordHistoryModal: React.FC<RecordHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [records, setRecords] = useState<EquipmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [actionFilter, setActionFilter] = useState<'ALL' | 'INTAKE' | 'OUTTAKE'>('ALL');

  // Security PIN Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isExecutingReset, setIsExecutingReset] = useState(false);

  const REQUIRED_PIN = '0108';

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/records');
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch (err) {
      console.error('Failed to fetch equipment records', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecords();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.serialNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.division.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.id.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || r.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const totalIntakes = records.filter((r) => r.action === 'INTAKE').length;
  const totalOuttakes = records.filter((r) => r.action === 'OUTTAKE').length;

  const handleOpenPinModal = () => {
    setPinInput('');
    setPinError('');
    setIsPinModalOpen(true);
  };

  const handleConfirmPinAndExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() !== REQUIRED_PIN) {
      setPinError('Incorrect PIN code. Access denied.');
      return;
    }

    setPinError('');
    setIsExecutingReset(true);

    try {
      const currentYear = new Date().getFullYear();
      const filename = `Annual full pull (${currentYear}).xlsx`;

      // 1. Fetch file as Blob & trigger browser download
      const downloadRes = await fetch(`/api/export/annual-excel?year=${currentYear}`);
      if (!downloadRes.ok) {
        throw new Error('Failed to generate annual export file');
      }
      const blob = await downloadRes.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      // 2. Reset server records database
      const resetRes = await fetch('/api/records/reset', { method: 'POST' });
      if (resetRes.ok) {
        setRecords([]);
        setIsPinModalOpen(false);
        alert(`Success!\n\n1. Downloaded: "${filename}"\n2. Database reset complete for the ${currentYear} annual cycle.`);
      } else {
        setPinError('Download succeeded, but resetting server records failed.');
      }
    } catch (err: any) {
      console.error('Annual Download Error:', err);
      setPinError(err?.message || 'An unexpected error occurred during annual download.');
    } finally {
      setIsExecutingReset(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="theme-bg-card border-2 theme-border rounded-2xl w-full max-w-5xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden theme-text-body relative">
        {/* Modal Header */}
        <div className="px-6 py-4 theme-bg-subtle border-b theme-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#238636] text-white rounded-xl font-bold shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight theme-text-primary flex items-center gap-2">
                Excel & CSV Database Logs
                <span className="text-xs font-mono font-bold bg-[#238636]/20 text-[#3fb950] border border-[#238636]/50 px-2 py-0.5 rounded-full">
                  records.xlsx
                </span>
              </h2>
              <p className="text-xs theme-text-muted font-medium">
                Linked to on-device Excel spreadsheet database (records.xlsx)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg theme-bg-card hover:theme-bg-subtle border theme-border theme-text-muted hover:theme-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats & Search Toolbar */}
        <div className="px-6 py-3 theme-bg-card border-b theme-border flex flex-wrap items-center justify-between gap-3">
          {/* Summary Pills */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 theme-bg-subtle px-3 py-1.5 rounded-lg border theme-border text-xs font-bold theme-text-body">
              <Database className="w-3.5 h-3.5 text-[#1f6feb]" />
              <span>Total Logs: {records.length}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#238636]/20 px-3 py-1.5 rounded-lg border border-[#238636]/50 text-xs font-bold text-[#3fb950]">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Intakes: {totalIntakes}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#1f6feb]/20 px-3 py-1.5 rounded-lg border border-[#1f6feb]/50 text-xs font-bold text-[#1f6feb]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Outtakes: {totalOuttakes}</span>
            </div>
          </div>

          {/* Search & Download Buttons */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search..."
                className="w-full theme-bg-subtle theme-text-primary pl-8 pr-3 py-1.5 rounded-lg border theme-border text-xs font-semibold focus:outline-none focus:border-[#1f6feb]"
              />
            </div>

            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e: any) => setActionFilter(e.target.value)}
              className="theme-bg-subtle theme-text-primary border theme-border rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Commands</option>
              <option value="INTAKE">Intake Only</option>
              <option value="OUTTAKE">Outtake Only</option>
            </select>

            <button
              onClick={fetchRecords}
              className="p-1.5 theme-bg-subtle hover:theme-bg-card border theme-border rounded-lg theme-text-primary cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Download Excel (.xlsx) */}
            <a
              href="/api/export/excel"
              download="Equipment_Log_Database.xlsx"
              className="flex items-center gap-1.5 bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .XLSX</span>
            </a>

            {/* Download CSV (.csv) */}
            <a
              href="/api/export/csv"
              download="Equipment_Log_Database.csv"
              className="flex items-center gap-1.5 bg-[#1f6feb] hover:bg-[#388bfd] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .CSV</span>
            </a>

            {/* Red Annual Download Button */}
            <button
              onClick={handleOpenPinModal}
              className="flex items-center gap-1.5 bg-[#da3633] hover:bg-[#f85149] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition-all cursor-pointer shrink-0"
              title={`Protected: Requires PIN code (0108) to download annual archive and reset records`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Annual Download ({new Date().getFullYear()})</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 theme-text-muted">
              <FileSpreadsheet className="w-12 h-12 theme-text-muted mb-2 opacity-50" />
              <p className="text-lg font-bold mb-1 theme-text-primary">No equipment records logged yet.</p>
              <p className="text-xs theme-text-muted">
                Complete a wizard transaction to automatically log data to the Excel spreadsheet database.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border theme-border rounded-xl theme-bg-subtle">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="theme-bg-card theme-text-muted font-mono text-[11px] uppercase border-b theme-border">
                    <th className="py-2.5 px-3 font-bold">Record ID</th>
                    <th className="py-2.5 px-3 font-bold">Date & Time</th>
                    <th className="py-2.5 px-3 font-bold">Action Command</th>
                    <th className="py-2.5 px-3 font-bold">TDMA Status</th>
                    <th className="py-2.5 px-3 font-bold">Serial Number</th>
                    <th className="py-2.5 px-3 font-bold">Division</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border font-medium text-xs theme-text-body">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:theme-bg-card transition-colors">
                      <td className="py-2.5 px-3 font-mono theme-text-muted text-[11px]">{rec.id}</td>
                      <td className="py-2.5 px-3 theme-text-body font-mono text-[11px]">{rec.timestamp}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          rec.action === 'INTAKE' ? 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/50' : 'bg-[#1f6feb]/20 text-[#1f6feb] border border-[#1f6feb]/50'
                        }`}>
                          {rec.action === 'INTAKE' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {rec.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          rec.tdma === 'YES' ? 'text-[#3fb950] font-mono' : 'theme-text-muted font-mono'
                        }`}>
                          {rec.tdma}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-500">{rec.serialNumber}</td>
                      <td className="py-2.5 px-3 theme-text-primary font-bold">{rec.division}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PIN Code Verification Modal Pop-up */}
        {isPinModalOpen && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="theme-bg-card border-2 border-[#da3633] rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b theme-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#da3633] text-white rounded-lg">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold theme-text-primary uppercase tracking-wide">
                      Security PIN Required
                    </h3>
                    <p className="text-[11px] theme-text-muted">
                      Annual Download & Database Reset
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPinModalOpen(false)}
                  className="p-1 rounded theme-text-muted hover:theme-text-primary cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs theme-text-body">
                Please enter the 4-digit supervisor PIN code to download <strong className="theme-text-primary">Annual full pull ({new Date().getFullYear()}).xlsx</strong> and clear in-app database records.
              </p>

              <form onSubmit={handleConfirmPinAndExecute} className="flex flex-col gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider theme-text-muted mb-1.5">
                    Security PIN Code
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError('');
                    }}
                    placeholder="Enter 4-digit PIN"
                    autoFocus
                    className="w-full theme-bg-subtle theme-text-primary border-2 theme-border focus:border-[#da3633] px-4 py-2.5 rounded-xl text-center text-xl tracking-widest font-mono font-bold focus:outline-none transition-colors"
                  />
                </div>

                {pinError && (
                  <div className="flex items-center gap-1.5 text-xs text-[#f85149] bg-[#da3633]/15 border border-[#da3633]/40 p-2.5 rounded-lg font-bold">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsPinModalOpen(false)}
                    className="px-4 py-2 theme-bg-subtle hover:theme-bg-card border theme-border rounded-xl text-xs font-bold theme-text-body cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isExecutingReset || !pinInput.trim()}
                    className="flex items-center gap-2 bg-[#da3633] hover:bg-[#f85149] disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold shadow cursor-pointer transition-all"
                  >
                    {isExecutingReset ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Confirm & Reset ({new Date().getFullYear()})</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

