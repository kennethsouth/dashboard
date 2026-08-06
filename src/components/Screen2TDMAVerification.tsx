import React, { useEffect } from 'react';
import { TDMAType } from '../types';
import { Check, X, ShieldAlert } from 'lucide-react';

interface Screen2TDMAVerificationProps {
  onSelectTDMA: (tdma: TDMAType) => void;
  selectedTDMA: TDMAType;
  action: string | null;
}

export const Screen2TDMAVerification: React.FC<Screen2TDMAVerificationProps> = ({
  onSelectTDMA,
  selectedTDMA,
  action,
}) => {
  // Listen for physical keyboard hotkeys (Y / 1 for YES, N / 2 for NO)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'y' || e.key === 'Y' || e.key === '1') {
        onSelectTDMA('YES');
      } else if (e.key === 'n' || e.key === 'N' || e.key === '2') {
        onSelectTDMA('NO');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectTDMA]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 theme-bg-app theme-text-body select-none transition-colors">
      {/* Screen Heading */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#1f6feb] font-bold theme-bg-subtle px-3 py-1 rounded-full border theme-border shadow-sm">
            Screen 2 of 5 • Step 2
          </span>
          {action && (
            <span className={`text-[11px] font-mono uppercase font-bold px-3 py-1 rounded-full border ${
              action === 'INTAKE' ? 'bg-[#238636]/20 text-[#3fb950] border-[#238636]/50' : 'bg-[#1f6feb]/20 text-[#1f6feb] border-[#1f6feb]/50'
            }`}>
              Current Action: {action}
            </span>
          )}
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight theme-text-primary uppercase mb-2">
          TDMA Verification
        </h2>
        <p className="theme-text-muted text-sm max-w-lg mx-auto font-medium">
          Is TDMA encryption / radio programming required for this radio / equipment record?
        </p>
      </div>

      {/* Two Large Touch Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl h-72">
        {/* YES Button */}
        <button
          onClick={() => onSelectTDMA('YES')}
          className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-150 cursor-pointer shadow-lg active:scale-[0.98] ${
            selectedTDMA === 'YES'
              ? 'bg-[#238636] border-[#3fb950] text-white ring-4 ring-[#238636]/40'
              : 'theme-bg-card theme-border hover:border-[#3fb950] hover:theme-bg-subtle theme-text-body'
          }`}
        >
          <div className="absolute top-4 right-4 theme-bg-subtle theme-text-muted border theme-border px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wider">
            [ Key Y / 1 ]
          </div>

          <div className="w-20 h-20 rounded-full bg-[#238636]/20 text-[#3fb950] group-hover:bg-[#238636] group-hover:text-white flex items-center justify-center mb-3 transition-all duration-200 shadow-inner border border-[#238636]/40">
            <Check className="w-12 h-12 stroke-[3]" />
          </div>

          <span className="text-4xl font-extrabold tracking-wider uppercase mb-1 group-hover:scale-105 transition-transform">
            YES
          </span>
          <span className="text-xs font-semibold theme-text-muted tracking-wide uppercase">
            TDMA Verified / Required
          </span>
        </button>

        {/* NO Button */}
        <button
          onClick={() => onSelectTDMA('NO')}
          className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-150 cursor-pointer shadow-lg active:scale-[0.98] ${
            selectedTDMA === 'NO'
              ? 'bg-[#da3633] border-[#f85149] text-white ring-4 ring-[#da3633]/40'
              : 'theme-bg-card theme-border hover:border-[#f85149] hover:theme-bg-subtle theme-text-body'
          }`}
        >
          <div className="absolute top-4 right-4 theme-bg-subtle theme-text-muted border theme-border px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wider">
            [ Key N / 2 ]
          </div>

          <div className="w-20 h-20 rounded-full bg-[#da3633]/20 text-[#da3633] group-hover:bg-[#da3633] group-hover:text-white flex items-center justify-center mb-3 transition-all duration-200 shadow-inner border border-[#da3633]/40">
            <X className="w-12 h-12 stroke-[3]" />
          </div>

          <span className="text-4xl font-extrabold tracking-wider uppercase mb-1 group-hover:scale-105 transition-transform">
            NO
          </span>
          <span className="text-xs font-semibold theme-text-muted tracking-wide uppercase">
            Not TDMA Verified / Standard
          </span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-6 flex items-center gap-2 theme-text-muted text-xs font-semibold">
        <ShieldAlert className="w-4 h-4 text-[#1f6feb]" />
        <span>Selecting YES or NO will save selection and auto-advance to Screen 3 (Hand Scanner).</span>
      </div>
    </div>
  );
};
