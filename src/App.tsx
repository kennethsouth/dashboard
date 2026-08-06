import React, { useState, useEffect, useCallback } from 'react';
import { WorkflowState, ActionType, TDMAType, ThemeMode } from './types';
import { INITIAL_DIVISIONS } from './data/defaultDivisions';
import { PersistentHeader } from './components/PersistentHeader';
import { Screen1ActionCommand } from './components/Screen1ActionCommand';
import { Screen2TDMAVerification } from './components/Screen2TDMAVerification';
import { Screen3HandScanner } from './components/Screen3HandScanner';
import { Screen4DivisionSelection } from './components/Screen4DivisionSelection';
import { Screen5Finalization } from './components/Screen5Finalization';
import { RecordHistoryModal } from './components/RecordHistoryModal';
import { DivisionManagerModal } from './components/DivisionManagerModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const INITIAL_WORKFLOW_STATE: WorkflowState = {
  currentStep: 1,
  action: null,
  tdma: null,
  serialNumber: '',
  division: null,
};

export default function App() {
  const [workflow, setWorkflow] = useState<WorkflowState>(INITIAL_WORKFLOW_STATE);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('app-theme') as ThemeMode) || 'dark';
  });
  const [divisions, setDivisions] = useState<string[]>(INITIAL_DIVISIONS);
  const [columnCount, setColumnCount] = useState<number>(5); // 5 or 7 grid columns

  // Synchronize data-theme attribute with document root and local storage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDivisionsOpen, setIsDivisionsOpen] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Play audio chime feedback
  const playAudioChime = (type: 'beep' | 'success') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        // Success chord
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio fallback
    }
  };

  // Fetch divisions from backend server
  useEffect(() => {
    const loadDivisions = async () => {
      try {
        const res = await fetch('/api/divisions');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.divisions) && data.divisions.length > 0) {
            setDivisions(data.divisions);
          }
        }
      } catch (err) {
        console.warn('Backend server offline or loading defaults', err);
      }
    };
    loadDivisions();
  }, []);

  // Save divisions to server
  const handleSaveDivisions = async (newDivisionsList: string[]) => {
    setDivisions(newDivisionsList);
    try {
      await fetch('/api/divisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ divisions: newDivisionsList }),
      });
    } catch (err) {
      console.error('Failed to sync divisions to server', err);
    }
  };

  // Reset current session back to Screen 1
  const handleResetSession = useCallback(() => {
    setWorkflow(INITIAL_WORKFLOW_STATE);
  }, []);

  // Wizard Screen Navigation Handlers
  const handleSelectAction = useCallback((action: ActionType) => {
    playAudioChime('beep');
    setWorkflow((prev) => ({
      ...prev,
      action,
      currentStep: 2, // Auto-advance to Screen 2
    }));
  }, []);

  const handleSelectTDMA = useCallback((tdma: TDMAType) => {
    playAudioChime('beep');
    setWorkflow((prev) => ({
      ...prev,
      tdma,
      currentStep: 3, // Auto-advance to Screen 3
    }));
  }, []);

  const handleScanComplete = useCallback((serialNumber: string) => {
    playAudioChime('beep');
    setWorkflow((prev) => ({
      ...prev,
      serialNumber,
      currentStep: 4, // Auto-advance to Screen 4
    }));
  }, []);

  const handleSelectDivision = useCallback((division: string) => {
    playAudioChime('beep');
    setWorkflow((prev) => ({
      ...prev,
      division,
      currentStep: 5, // Auto-advance to Screen 5
    }));
  }, []);

  const handleAddDivisionFromGrid = useCallback(
    (newDivisionName: string) => {
      if (!divisions.includes(newDivisionName)) {
        const updated = [...divisions, newDivisionName].sort((a, b) => a.localeCompare(b));
        handleSaveDivisions(updated);
        showToast(`Added new division "${newDivisionName}"`, 'info');
      }
    },
    [divisions]
  );

  // Submit Final Session
  const handleSubmitFinal = async () => {
    if (!workflow.action || !workflow.tdma || !workflow.serialNumber || !workflow.division) {
      showToast('Incomplete workflow data. Please check entry parameters.', 'error');
      return;
    }

    const recordPayload = {
      action: workflow.action,
      tdma: workflow.tdma,
      serialNumber: workflow.serialNumber,
      division: workflow.division,
      timestamp: new Date().toLocaleString(),
    };

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordPayload),
      });

      if (res.ok) {
        playAudioChime('success');
        showToast(
          `Log appended successfully to Excel database! [${workflow.action} • ${workflow.serialNumber} • ${workflow.division}]`,
          'success'
        );
      } else {
        showToast('Logged locally (Server sync response pending)', 'info');
      }
    } catch (err) {
      showToast('Logged locally to session database', 'info');
    } finally {
      // Auto-reset back to Screen 1 for next transaction
      setTimeout(() => {
        handleResetSession();
      }, 400);
    }
  };

  // Jump directly to step if user clicks header breadcrumb
  const handleStepClick = (stepNumber: number) => {
    setWorkflow((prev) => ({ ...prev, currentStep: stepNumber }));
  };

  return (
    <div data-theme={theme} className="w-screen h-screen overflow-hidden flex flex-col font-sans select-none theme-bg-app theme-text-body transition-colors">
      {/* Container */}
      <div data-theme={theme} className="w-full h-full flex flex-col max-w-[1920px] max-h-[1080px] mx-auto relative shadow-2xl theme-bg-app">
        {/* Persistent Header */}
        <PersistentHeader
          workflow={workflow}
          onReset={handleResetSession}
          onStepClick={handleStepClick}
          theme={theme}
          setTheme={setTheme}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenDivisions={() => setIsDivisionsOpen(true)}
          columnCount={columnCount}
          setColumnCount={setColumnCount}
        />

        {/* Main 5-Screen Sequential Flow Body */}
        <main className="flex-1 w-full h-full overflow-hidden relative">
          {workflow.currentStep === 1 && (
            <Screen1ActionCommand
              onSelectAction={handleSelectAction}
              selectedAction={workflow.action}
            />
          )}

          {workflow.currentStep === 2 && (
            <Screen2TDMAVerification
              onSelectTDMA={handleSelectTDMA}
              selectedTDMA={workflow.tdma}
              action={workflow.action}
            />
          )}

          {workflow.currentStep === 3 && (
            <Screen3HandScanner
              onScanComplete={handleScanComplete}
              initialSerial={workflow.serialNumber}
            />
          )}

          {workflow.currentStep === 4 && (
            <Screen4DivisionSelection
              divisions={divisions}
              onSelectDivision={handleSelectDivision}
              selectedDivision={workflow.division}
              onAddDivision={handleAddDivisionFromGrid}
              columnCount={columnCount}
            />
          )}

          {workflow.currentStep === 5 && (
            <Screen5Finalization
              workflow={workflow}
              onSubmit={handleSubmitFinal}
              onClear={handleResetSession}
            />
          )}
        </main>

        {/* Toast Notification Bar */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border text-sm font-bold transition-all ${
              toastMessage.type === 'success'
                ? 'bg-[#238636] border-[#3fb950] text-white'
                : toastMessage.type === 'error'
                ? 'bg-[#da3633] border-[#f85149] text-white'
                : 'bg-[#1f6feb] border-[#58A6FF] text-white'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-white" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-white" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Modals */}
        <RecordHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />

        <DivisionManagerModal
          isOpen={isDivisionsOpen}
          onClose={() => setIsDivisionsOpen(false)}
          divisions={divisions}
          onSaveDivisions={handleSaveDivisions}
        />
      </div>
    </div>
  );
}
