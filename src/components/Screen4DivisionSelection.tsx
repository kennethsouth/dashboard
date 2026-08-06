import React, { useState } from 'react';
import { Search, Plus, Building2, CheckCircle2 } from 'lucide-react';

interface Screen4DivisionSelectionProps {
  divisions: string[];
  onSelectDivision: (divisionName: string) => void;
  selectedDivision: string | null;
  onAddDivision: (newDivisionName: string) => void;
  columnCount: number; // 5 or 7 columns
}

export const Screen4DivisionSelection: React.FC<Screen4DivisionSelectionProps> = ({
  divisions,
  onSelectDivision,
  selectedDivision,
  onAddDivision,
  columnCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDivisionInput, setNewDivisionInput] = useState('');

  // Filter divisions based on search query
  const filteredDivisions = divisions.filter((div) =>
    div.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleCreateDivision = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDivisionInput.trim();
    if (trimmed) {
      onAddDivision(trimmed);
      setNewDivisionInput('');
      setShowAddModal(false);
      // Auto-select the newly created division
      onSelectDivision(trimmed);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-5 theme-bg-app theme-text-body select-none overflow-hidden transition-colors">
      {/* Top Controls: Screen Header & Search + Add Division */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4 pb-3 border-b theme-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#1f6feb] font-bold theme-bg-subtle px-2.5 py-0.5 rounded-full border theme-border">
              Screen 4 of 5 • Step 4
            </span>
            <span className="text-[11px] theme-text-muted font-semibold">
              {divisions.length} Divisions
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight theme-text-primary uppercase">
            Division Selection Grid
          </h2>
        </div>

        {/* Search Bar & Add Division Button */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Quick Filter */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search division..."
              className="w-full theme-bg-subtle theme-text-primary pl-9 pr-3 py-2 rounded-lg border theme-border text-xs font-semibold focus:outline-none focus:border-[#1f6feb]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold theme-text-muted hover:theme-text-primary cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Add Division Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-[#238636] hover:bg-[#2ea043] text-white px-3.5 py-2 rounded-lg font-bold text-xs shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Division</span>
          </button>
        </div>
      </div>

      {/* Division Grid Container */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div
          className={`grid gap-3 ${
            columnCount === 7
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
          }`}
        >
          {filteredDivisions.map((divisionName) => {
            const isSelected = selectedDivision === divisionName;

            return (
              <button
                key={divisionName}
                onClick={() => onSelectDivision(divisionName)}
                className={`relative flex flex-col justify-between p-3 rounded-xl border font-bold text-left transition-all duration-150 cursor-pointer shadow-sm active:scale-95 h-22 ${
                  isSelected
                    ? 'bg-[#1f6feb] border-[#58A6FF] text-white ring-4 ring-[#1f6feb]/40 scale-[1.01]'
                    : 'theme-bg-card theme-border hover:border-[#1f6feb] hover:theme-bg-subtle theme-text-body'
                }`}
              >
                <div className="flex items-start justify-between">
                  <Building2
                    className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#1f6feb]'}`}
                  />
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#3fb950]" />}
                </div>

                <span className="text-xs lg:text-sm font-bold tracking-tight leading-tight line-clamp-2 uppercase">
                  {divisionName}
                </span>
              </button>
            );
          })}
        </div>

        {filteredDivisions.length === 0 && (
          <div className="flex flex-col items-center justify-center p-10 theme-text-muted">
            <p className="text-base font-bold mb-2">No division found matching "{searchQuery}"</p>
            <button
              onClick={() => {
                setNewDivisionInput(searchQuery);
                setShowAddModal(true);
              }}
              className="text-[#1f6feb] underline font-bold cursor-pointer text-sm"
            >
              Click here to add "{searchQuery}" as a new division
            </button>
          </div>
        )}
      </div>

      {/* Add New Division Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="theme-bg-card border-2 theme-border rounded-xl p-5 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold theme-text-primary uppercase mb-1">
              Add New Division
            </h3>
            <p className="theme-text-muted text-xs mb-3">
              Enter the department or division name to add it to the selection grid.
            </p>

            <form onSubmit={handleCreateDivision} className="flex flex-col gap-3">
              <input
                type="text"
                value={newDivisionInput}
                onChange={(e) => setNewDivisionInput(e.target.value)}
                placeholder="e.g. Traffic Safety Unit..."
                autoFocus
                className="w-full theme-bg-subtle theme-text-primary px-3.5 py-2.5 rounded-lg border theme-border text-sm font-bold focus:outline-none focus:border-[#1f6feb]"
              />

              <div className="flex justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-lg theme-bg-subtle border theme-border theme-text-body text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newDivisionInput.trim()}
                  className="px-4 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold shadow cursor-pointer"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
