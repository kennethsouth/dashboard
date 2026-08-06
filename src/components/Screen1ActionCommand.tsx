import React, { useEffect } from 'react';
import { ActionType } from '../types';
import { ArrowDownLeft, ArrowUpRight, CheckSquare } from 'lucide-react';

interface Screen1ActionCommandProps {
  onSelectAction: (action: ActionType) => void;
  selectedAction: ActionType;
}

export const Screen1ActionCommand: React.FC<Screen1ActionCommandProps> = ({
  onSelectAction,
  selectedAction,
}) => {
  // Listen for physical keyboard hotkeys (1 or I for INTAKE, 2 or O for OUTTAKE)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === '1' || e.key === 'i' || e.key === 'I') {
        onSelectAction('INTAKE');
      } else if (e.key === '2' || e.key === 'o' || e.key === 'O') {
        onSelectAction('OUTTAKE');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectAction]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 theme-bg-app theme-text-body select-none transition-colors">
      {/* Screen Heading & Instruction */}
      <div className="text-center mb-6">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#1f6feb] font-bold theme-bg-subtle px-3 py-1 rounded-full border theme-border mb-2 inline-block shadow-sm">
          Screen 1 of 5 • Step 1
        </span>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight theme-text-primary uppercase mb-2">
          Select Action Command
        </h2>
        <p className="theme-text-muted text-sm max-w-lg mx-auto font-medium">
          Choose whether this equipment transaction is a check-in record (<strong className="text-[#3fb950]">INTAKE</strong>) or check-out record (<strong className="text-[#1f6feb]">OUTTAKE</strong>).
        </p>
      </div>

      {/* Massive Touch Buttons Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl h-72">
        {/* INTAKE Button */}
        <button
          onClick={() => onSelectAction('INTAKE')}
          className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-150 cursor-pointer shadow-lg active:scale-[0.98] ${
            selectedAction === 'INTAKE'
              ? 'bg-[#238636] border-[#3fb950] text-white ring-4 ring-[#238636]/40'
              : 'theme-bg-card theme-border hover:border-[#238636] hover:theme-bg-subtle theme-text-body'
          }`}
        >
          <div className="absolute top-4 right-4 theme-bg-subtle theme-text-muted border theme-border px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wider">
            [ Key 1 ]
          </div>
          
          <div className="w-20 h-20 rounded-full bg-[#238636]/20 text-[#3fb950] group-hover:bg-[#238636] group-hover:text-white flex items-center justify-center mb-4 transition-all duration-200 shadow-inner border border-[#238636]/40">
            <ArrowDownLeft className="w-12 h-12 stroke-[2.5]" />
          </div>

          <span className="text-4xl font-extrabold tracking-wider uppercase mb-1 group-hover:scale-105 transition-transform">
            INTAKE
          </span>
          <span className="text-xs font-semibold theme-text-muted tracking-wide uppercase">
            Check-In New Record
          </span>
        </button>

        {/* OUTTAKE Button */}
        <button
          onClick={() => onSelectAction('OUTTAKE')}
          className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-150 cursor-pointer shadow-lg active:scale-[0.98] ${
            selectedAction === 'OUTTAKE'
              ? 'bg-[#1f6feb] border-[#58A6FF] text-white ring-4 ring-[#1f6feb]/40'
              : 'theme-bg-card theme-border hover:border-[#1f6feb] hover:theme-bg-subtle theme-text-body'
          }`}
        >
          <div className="absolute top-4 right-4 theme-bg-subtle theme-text-muted border theme-border px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wider">
            [ Key 2 ]
          </div>

          <div className="w-20 h-20 rounded-full bg-[#1f6feb]/20 text-[#1f6feb] group-hover:bg-[#1f6feb] group-hover:text-white flex items-center justify-center mb-4 transition-all duration-200 shadow-inner border border-[#1f6feb]/40">
            <ArrowUpRight className="w-12 h-12 stroke-[2.5]" />
          </div>

          <span className="text-4xl font-extrabold tracking-wider uppercase mb-1 group-hover:scale-105 transition-transform">
            OUTTAKE
          </span>
          <span className="text-xs font-semibold theme-text-muted tracking-wide uppercase">
            Check-Out Record
          </span>
        </button>
      </div>

      {/* Auto-advance helper footer */}
      <div className="mt-6 flex items-center gap-2 theme-text-muted text-xs font-semibold">
        <CheckSquare className="w-4 h-4 text-[#1f6feb]" />
        <span>Selecting either option will automatically save state & advance to Screen 2 (TDMA Verification).</span>
      </div>
    </div>
  );
};
