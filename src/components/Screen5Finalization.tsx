import React, { useState } from 'react';
import { WorkflowState } from '../types';
import { 
  CheckCircle, 
  Trash2, 
  Clock, 
  FileCheck2, 
  Barcode, 
  Building2, 
  Radio, 
  ArrowRightLeft,
  Loader2
} from 'lucide-react';

interface Screen5FinalizationProps {
  workflow: WorkflowState;
  onSubmit: () => Promise<void>;
  onClear: () => void;
}

export const Screen5Finalization: React.FC<Screen5FinalizationProps> = ({
  workflow,
  onSubmit,
  onClear,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime] = useState<string>(new Date().toLocaleString());

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 theme-bg-app theme-text-body select-none transition-colors">
      {/* Screen Heading */}
      <div className="text-center mb-5">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#1f6feb] font-bold theme-bg-subtle px-3 py-1 rounded-full border theme-border mb-2 inline-block shadow-sm">
          Screen 5 of 5 • Final Step
        </span>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight theme-text-primary uppercase mb-1">
          Record Finalization & Logging
        </h2>
        <p className="theme-text-muted text-sm max-w-lg mx-auto font-medium">
          Review session parameters. Clicking <strong className="text-[#3fb950]">SUBMIT LOG</strong> will append this transaction directly to the Excel (.xlsx) database.
        </p>
      </div>

      {/* Summary Record Card */}
      <div className="w-full max-w-3xl theme-bg-card border-2 theme-border rounded-2xl p-6 shadow-xl mb-6 relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b theme-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1f6feb] text-white rounded-xl font-bold shadow-sm">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase theme-text-primary">
                Equipment Transaction Summary
              </h3>
              <p className="text-xs theme-text-muted font-medium">
                Auto-stamped timestamp will be appended on submission
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 theme-bg-subtle px-3 py-1.5 rounded-lg border theme-border text-xs font-mono font-bold theme-text-body">
            <Clock className="w-3.5 h-3.5 text-[#1f6feb]" />
            <span>{currentTime}</span>
          </div>
        </div>

        {/* 4 Core Parameter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 my-4">
          {/* Action Command */}
          <div className="theme-bg-subtle p-3 rounded-xl border theme-border flex flex-col gap-0.5">
            <span className="text-[10px] font-mono theme-text-muted uppercase font-bold flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3 text-[#1f6feb]" />
              1. Action
            </span>
            <span className={`text-xl font-bold uppercase ${
              workflow.action === 'INTAKE' ? 'text-[#3fb950]' : 'text-[#1f6feb]'
            }`}>
              {workflow.action || '---'}
            </span>
          </div>

          {/* TDMA Status */}
          <div className="theme-bg-subtle p-3 rounded-xl border theme-border flex flex-col gap-0.5">
            <span className="text-[10px] font-mono theme-text-muted uppercase font-bold flex items-center gap-1">
              <Radio className="w-3 h-3 text-[#1f6feb]" />
              2. TDMA
            </span>
            <span className={`text-xl font-bold uppercase ${
              workflow.tdma === 'YES' ? 'text-[#3fb950]' : 'text-[#f85149]'
            }`}>
              {workflow.tdma || '---'}
            </span>
          </div>

          {/* Serial Number */}
          <div className="theme-bg-subtle p-3 rounded-xl border theme-border flex flex-col gap-0.5">
            <span className="text-[10px] font-mono theme-text-muted uppercase font-bold flex items-center gap-1">
              <Barcode className="w-3 h-3 text-[#1f6feb]" />
              3. Serial No.
            </span>
            <span className="text-lg font-mono font-bold text-amber-500 truncate">
              {workflow.serialNumber || '---'}
            </span>
          </div>

          {/* Division */}
          <div className="theme-bg-subtle p-3 rounded-xl border theme-border flex flex-col gap-0.5">
            <span className="text-[10px] font-mono theme-text-muted uppercase font-bold flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[#1f6feb]" />
              4. Division
            </span>
            <span className="text-lg font-bold uppercase theme-text-primary truncate">
              {workflow.division || '---'}
            </span>
          </div>
        </div>
      </div>

      {/* Two Action Buttons: SUBMIT & CLEAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl h-28">
        {/* SUBMIT Button */}
        <button
          onClick={handleFinalSubmit}
          disabled={isSubmitting}
          className="group relative flex items-center justify-center gap-3 bg-[#238636] hover:bg-[#2ea043] border-2 border-[#3fb950] text-white rounded-2xl font-bold text-2xl uppercase tracking-wider shadow-lg transition-all duration-150 cursor-pointer active:scale-95 ring-4 ring-[#238636]/40"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-7 h-7 animate-spin text-white" />
              <span>Logging...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              <span>SUBMIT LOG</span>
            </>
          )}
        </button>

        {/* CLEAR Button */}
        <button
          onClick={onClear}
          disabled={isSubmitting}
          className="group relative flex items-center justify-center gap-3 bg-[#da3633] hover:bg-[#f85149] border-2 border-[#f85149] text-white rounded-2xl font-bold text-2xl uppercase tracking-wider shadow-lg transition-all duration-150 cursor-pointer active:scale-95 ring-4 ring-[#da3633]/40"
        >
          <Trash2 className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          <span>CLEAR / CANCEL</span>
        </button>
      </div>
    </div>
  );
};
