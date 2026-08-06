import React, { useState } from 'react';
import { X, Plus, Trash2, Grid, RotateCcw, Building2 } from 'lucide-react';
import { INITIAL_DIVISIONS } from '../data/defaultDivisions';

interface DivisionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  divisions: string[];
  onSaveDivisions: (newDivisionsList: string[]) => void;
}

export const DivisionManagerModal: React.FC<DivisionManagerModalProps> = ({
  isOpen,
  onClose,
  divisions,
  onSaveDivisions,
}) => {
  const [divisionList, setDivisionList] = useState<string[]>(divisions);
  const [newDivisionInput, setNewDivisionInput] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDivisionInput.trim();
    if (trimmed && !divisionList.includes(trimmed)) {
      const updated = [...divisionList, trimmed].sort((a, b) => a.localeCompare(b));
      setDivisionList(updated);
      onSaveDivisions(updated);
      setNewDivisionInput('');
    }
  };

  const handleDelete = (nameToRemove: string) => {
    const updated = divisionList.filter((d) => d !== nameToRemove);
    setDivisionList(updated);
    onSaveDivisions(updated);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset division list back to the default 35 divisions?')) {
      setDivisionList(INITIAL_DIVISIONS);
      onSaveDivisions(INITIAL_DIVISIONS);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="theme-bg-card border-2 theme-border rounded-2xl w-full max-w-3xl max-h-[82vh] flex flex-col shadow-2xl overflow-hidden theme-text-body">
        {/* Modal Header */}
        <div className="px-6 py-4 theme-bg-subtle border-b theme-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1f6feb] text-white rounded-xl font-bold shadow-sm">
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight theme-text-primary">
                Division Grid Manager
              </h2>
              <p className="text-xs theme-text-muted font-medium">
                Add, remove, or customize divisions displayed on Screen 4
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

        {/* Add New Division Form */}
        <div className="px-6 py-3.5 theme-bg-subtle border-b theme-border">
          <form onSubmit={handleAdd} className="flex items-center gap-2.5">
            <input
              type="text"
              value={newDivisionInput}
              onChange={(e) => setNewDivisionInput(e.target.value)}
              placeholder="Enter new division name (e.g., Code Enforcement)..."
              className="flex-1 theme-bg-card border theme-border theme-text-primary px-3.5 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#1f6feb]"
            />
            <button
              type="submit"
              disabled={!newDivisionInput.trim()}
              className="flex items-center gap-1.5 bg-[#1f6feb] hover:bg-[#388bfd] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold shadow transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Division</span>
            </button>
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="flex items-center gap-1.5 theme-bg-card border theme-border hover:theme-bg-subtle theme-text-body px-3 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer"
              title="Reset to 35 Default Divisions"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </form>
        </div>

        {/* Divisions List Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {divisionList.map((divName) => (
              <div
                key={divName}
                className="theme-bg-subtle border theme-border hover:border-[#1f6feb] p-3 rounded-lg flex items-center justify-between text-xs font-bold theme-text-primary"
              >
                <span className="flex items-center gap-2 truncate">
                  <Building2 className="w-4 h-4 text-[#1f6feb] shrink-0" />
                  <span className="truncate">{divName}</span>
                </span>
                <button
                  onClick={() => handleDelete(divName)}
                  className="p-1 rounded-lg theme-text-muted hover:text-[#da3633] hover:bg-[#da3633]/10 transition-colors ml-2 shrink-0 cursor-pointer"
                  title={`Delete ${divName}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
