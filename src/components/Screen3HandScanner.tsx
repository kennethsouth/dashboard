import React, { useRef, useEffect, useState } from 'react';
import { Barcode, Scan, ArrowRight, CornerDownLeft, Sparkles, RefreshCw } from 'lucide-react';

interface Screen3HandScannerProps {
  onScanComplete: (serialNumber: string) => void;
  initialSerial?: string;
}

export const Screen3HandScanner: React.FC<Screen3HandScannerProps> = ({
  onScanComplete,
  initialSerial = '',
}) => {
  const [serialNumber, setSerialNumber] = useState<string>(initialSerial);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount and keep focus ready for USB Hand Scanner
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 100);

    // Keep focus locked onto scanner input if user clicks background
    const handleGlobalClick = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        e.target instanceof HTMLElement &&
        !e.target.closest('button') &&
        !e.target.closest('input')
      ) {
        inputRef.current.focus();
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // Listen for Enter key (which USB Hand Barcode Scanners automatically output)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = serialNumber.trim();
      if (trimmed) {
        onScanComplete(trimmed);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = serialNumber.trim();
    if (trimmed) {
      onScanComplete(trimmed);
    }
  };

  // Helper function to simulate scanning a test serial number code
  const handleQuickScanTest = (code: string) => {
    setSerialNumber(code);
    setTimeout(() => {
      onScanComplete(code);
    }, 300);
  };

  const generateRandomSerial = () => {
    const prefixes = ['RAD', 'MOT', 'HARRIS', 'XPR', 'SER', 'EQUIP'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const code = `${randomPrefix}-${randomDigits}`;
    handleQuickScanTest(code);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 theme-bg-app theme-text-body select-none transition-colors">
      {/* Screen Heading */}
      <div className="text-center mb-5">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#1f6feb] font-bold theme-bg-subtle px-3 py-1 rounded-full border theme-border mb-2 inline-block shadow-sm">
          Screen 3 of 5 • Step 3
        </span>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight theme-text-primary uppercase mb-2 flex items-center justify-center gap-2">
          <Scan className="w-8 h-8 text-[#1f6feb] animate-pulse" />
          Hand Scanner Input
        </h2>
        <p className="theme-text-muted text-sm max-w-lg mx-auto font-medium">
          Scan equipment barcode with physical USB scanner. System listens for automatic <strong className="text-[#1f6feb] font-mono">Enter/Carriage Return</strong> keystroke.
        </p>
      </div>

      {/* Scanner Input Card */}
      <div className="w-full max-w-2xl theme-bg-card border-2 theme-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Active Laser Pulse Effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1f6feb] to-transparent animate-pulse" />

        <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono uppercase tracking-widest theme-text-primary font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Barcode className="w-4 h-4 text-[#1f6feb]" />
                Equipment Serial Number / Barcode ID
              </span>
              <span className="text-[#3fb950] text-[11px] font-bold flex items-center gap-1 bg-[#238636]/20 px-2.5 py-0.5 rounded border border-[#238636]/50">
                <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-ping" />
                Scanner Active
              </span>
            </label>

            {/* Input Box */}
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Point scanner & scan, or type serial..."
                autoFocus
                className="w-full theme-bg-subtle text-[#3fb950] font-mono font-bold text-2xl lg:text-3xl px-5 py-4 rounded-xl border-2 border-[#1f6feb] focus:border-[#1f6feb] focus:outline-none focus:ring-4 focus:ring-[#1f6feb]/30 tracking-wider shadow-inner placeholder:theme-text-muted placeholder:text-xl"
              />
              {serialNumber && (
                <button
                  type="button"
                  onClick={() => {
                    setSerialNumber('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 theme-bg-card hover:theme-bg-subtle border theme-border theme-text-body px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Manual Submit & Advance Button */}
          <button
            type="submit"
            disabled={!serialNumber.trim()}
            className={`w-full py-3.5 rounded-xl font-bold text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 shadow-md ${
              serialNumber.trim()
                ? 'bg-[#1f6feb] hover:bg-[#388bfd] text-white cursor-pointer active:scale-[0.99] ring-4 ring-[#1f6feb]/30'
                : 'theme-bg-subtle theme-text-muted cursor-not-allowed border theme-border'
            }`}
          >
            <span>Proceed to Division Selection</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Quick Simulator Test Panel for browser demo without physical hardware */}
        <div className="mt-6 pt-5 border-t theme-border flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs theme-text-muted font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 theme-text-primary">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Quick Scan Simulator:
            </span>
            <span>Click test serial:</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['RAD-890123', 'MOT-559102', 'HARRIS-7740', 'XPR-99201'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleQuickScanTest(code)}
                className="theme-bg-subtle hover:theme-bg-card hover:border-[#1f6feb] border theme-border theme-text-primary px-2.5 py-2 rounded-lg font-mono text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Barcode className="w-3.5 h-3.5 text-[#1f6feb] shrink-0" />
                <span className="truncate">{code}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={generateRandomSerial}
            className="mt-0.5 flex items-center justify-center gap-2 text-xs font-bold text-[#1f6feb] hover:underline theme-bg-subtle py-1.5 rounded-lg border theme-border hover:border-[#1f6feb] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate & Auto-Scan Random Serial</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-5 flex items-center gap-2 theme-text-muted text-xs font-semibold">
        <CornerDownLeft className="w-4 h-4 text-[#1f6feb]" />
        <span>Hardware scanner automatic Enter key triggers save & auto-advance to Screen 4.</span>
      </div>
    </div>
  );
};
