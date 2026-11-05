import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Ticket, Technician } from '../types';
import { formatCategoryName } from '../utils/formatters';
import { X, Check, Star, Wrench, AlertCircle } from 'lucide-react';

interface AssignTechnicianModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onAssigned: () => void;
}

export const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({
  ticket,
  onClose,
  onAssigned,
}) => {
  const { technicians, assignTechnician, tickets } = useApp();
  const [selectedTechId, setSelectedTechId] = useState<string>('');

  if (!ticket) return null;

  // Filter or prioritize technicians with matching specialty
  const sortedTechs = [...technicians].sort((a, b) => {
    const aMatch = a.specialties.includes(ticket.category);
    const bMatch = b.specialties.includes(ticket.category);
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return b.rating - a.rating;
  });

  const handleAssign = () => {
    if (!selectedTechId) return;
    assignTechnician(ticket.id, selectedTechId);
    onAssigned();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Assign Technician to #{ticket.id}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {ticket.unit} · {formatCategoryName(ticket.category)} · {ticket.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="text-xs text-slate-600 mb-1">
            Select technician from duty roster. Matching trade specialists are highlighted:
          </div>

          <div className="space-y-2">
            {sortedTechs.map((tech) => {
              const isMatch = tech.specialties.includes(ticket.category);
              const activeCount = tickets.filter(
                (t) => t.assignedTechnicianId === tech.id && t.status !== 'resolved'
              ).length;
              const isSelected = selectedTechId === tech.id;

              return (
                <div
                  key={tech.id}
                  onClick={() => setSelectedTechId(tech.id)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">
                          {tech.name}
                        </span>
                        {isMatch && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                            Trade Match
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {tech.specialties.map(formatCategoryName).join(', ')} · ⭐ {tech.rating}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono-numbers">
                        {activeCount === 0
                          ? 'Available now'
                          : `${activeCount} active job(s) in progress`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Dispatches automated WhatsApp notification to tenant.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={!selectedTechId}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-md text-xs font-semibold transition-colors shadow-xs"
            >
              Confirm Dispatch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
