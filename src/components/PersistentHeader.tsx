import React, { useState, useEffect } from 'react';
import { WorkflowState, ThemeMode } from '../types';
import { 
  CheckCircle2, 
  FileSpreadsheet, 
  Grid, 
  Moon, 
  Sun, 
  Clock, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface PersistentHeaderProps {
  workflow: WorkflowState;
  onReset: () => void;
  onStepClick: (stepNumber: number) => void;
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  onOpenHistory: () => void;
  onOpenDivisions: () => void;
  columnCount: number;
  setColumnCount: (cols: number) => void;
}

const STEPS = [
  { id: 1, label: '1. Action Command', desc: 'Intake / Outtake' },
  { id: 2, label: '2. TDMA Verification', desc: 'Yes / No' },
  { id: 3, label: '3. Hand Scanner', desc: 'Scan Serial Barcode' },
  { id: 4, label: '4. Division Grid', desc: 'Select Department' },
  { id: 5, label: '5. Finalization', desc: 'Confirm & Submit' },
];

export const PersistentHeader: React.FC<PersistentHeaderProps> = ({
  workflow,
  onReset,
  onStepClick,
  theme,
  setTheme,
  onOpenHistory,
  onOpenDivisions,
  columnCount,
  setColumnCount,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExcelLogsClick = () => {
    // Open the history modal (downloads are triggered via the explicit buttons inside the modal)
    onOpenHistory();
  };

  return (
    <header className="w-full theme-bg-header border-b-2 theme-border theme-text-body shadow-md select-none z-30 flex flex-col transition-colors">
      {/* Top Bar: Title, Live Clock, System Control Buttons */}
      <div className="px-5 py-2 flex items-center justify-between border-b theme-border theme-bg-subtle">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-0.5 rounded-full bg-white/10 shadow-sm shrink-0 border theme-border overflow-hidden">
            <img 
              src="/spartanburg_logo.jpg" 
              alt="Spartanburg County Communications Radio Shop" 
              className="w-9 h-9 object-contain rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight theme-text-primary uppercase">
              Radio Shop Dashboard
            </h1>
            <p className="text-[11px] theme-text-muted font-medium">
              Equipment Tracking & Check-In / Out Terminal System
            </p>
          </div>
        </div>

        {/* Live Date & Time Clock */}
        <div className="flex items-center gap-2.5 theme-bg-card border theme-border px-3 py-1 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-[#58A6FF] animate-pulse" />
          <div className="text-right">
            <div className="text-sm font-mono font-bold theme-text-primary tracking-wider">
              {currentTime || '--:--:--'}
            </div>
            <div className="text-[9px] theme-text-muted uppercase tracking-widest font-semibold">
              {currentDate || '---'}
            </div>
          </div>
        </div>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-2">
          {/* Database History & Export Button */}
          <button
            onClick={handleExcelLogsClick}
            className="flex items-center gap-1.5 bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Export & View Excel / CSV Database Logs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel Logs</span>
          </button>

          {/* Division Manager */}
          <button
            onClick={onOpenDivisions}
            className="flex items-center gap-1.5 bg-[#1f6feb] hover:bg-[#388bfd] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Manage Divisions Grid List"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Divisions</span>
          </button>

          {/* Grid Columns Toggle (5 or 7 cols) */}
          <button
            onClick={() => setColumnCount(columnCount === 5 ? 7 : 5)}
            className="flex items-center gap-1 theme-bg-subtle hover:opacity-80 border theme-border theme-text-body px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            title="Toggle Grid Columns (5 vs 7 columns)"
          >
            <SlidersHorizontal className="w-3 h-3 theme-text-muted" />
            <span>{columnCount} Cols</span>
          </button>

          {/* Theme Selector */}
          <div className="flex items-center theme-bg-subtle p-0.5 rounded-lg border theme-border">
            <button
              onClick={() => setTheme('dark')}
              className={`p-1 rounded transition-colors ${theme === 'dark' ? 'bg-[#1f6feb] text-white font-bold' : 'theme-text-muted hover:theme-text-primary'}`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-1 rounded transition-colors ${theme === 'light' ? 'bg-[#1f6feb] text-white font-bold' : 'theme-text-muted hover:theme-text-primary'}`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('high-contrast')}
              className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded transition-colors ${theme === 'high-contrast' ? 'bg-yellow-400 text-black shadow' : 'theme-text-muted hover:theme-text-primary'}`}
              title="High Contrast Touch Mode"
            >
              HC
            </button>
          </div>
        </div>
      </div>

      {/* Sequential Workflow Breadcrumbs Bar */}
      <div className="px-5 py-1.5 theme-bg-subtle flex items-center justify-between gap-1.5 overflow-x-auto">
        <div className="flex items-center w-full justify-between gap-1">
          {STEPS.map((step, idx) => {
            const isCurrent = workflow.currentStep === step.id;
            const isCompleted = workflow.currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => {
                    if (isCompleted || isCurrent) {
                      onStepClick(step.id);
                    }
                  }}
                  disabled={!isCompleted && !isCurrent}
                  className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left transition-all duration-150 select-none ${
                    isCurrent
                      ? 'bg-[#1f6feb]/15 border-[#1f6feb] theme-text-primary shadow-sm font-semibold ring-1 ring-[#1f6feb]/50'
                      : isCompleted
                      ? 'bg-[#238636]/15 border-[#238636]/60 text-[#3fb950] hover:bg-[#238636]/25 cursor-pointer'
                      : 'theme-bg-subtle theme-border theme-text-muted opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      isCurrent
                        ? 'bg-[#1f6feb] text-white shadow-sm'
                        : isCompleted
                        ? 'bg-[#238636] text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : step.id}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold truncate tracking-tight">{step.label}</div>
                    <div className="text-[9px] truncate theme-text-muted">
                      {step.desc}
                    </div>
                  </div>
                </button>
                {idx < STEPS.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 theme-text-muted shrink-0 mx-0.5" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </header>
  );
};
