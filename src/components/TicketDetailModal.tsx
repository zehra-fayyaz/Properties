import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Ticket, TicketStatus } from '../types';
import {
  formatCategoryName,
  formatPriority,
  formatStatus,
  formatDateTime,
  formatCurrency,
  formatRelativeMinutes,
} from '../utils/formatters';
import { formatWhatsAppUrl } from '../utils/whatsapp';
import {
  X,
  MessageSquare,
  Package,
  Wrench,
  Clock,
  Phone,
  User,
  Star,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onAssignTech: (ticket: Ticket) => void;
  onViewWhatsApp: (ticketId: string) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  onAssignTech,
  onViewWhatsApp,
}) => {
  const { technicians, messages, updateTicketStatus } = useApp();
  const [newStatus, setNewStatus] = useState<TicketStatus | ''>('');
  const [notes, setNotes] = useState('');

  if (!ticket) return null;

  const assignedTech = technicians.find((t) => t.id === ticket.assignedTechnicianId);
  const ticketMessages = messages.filter((m) => m.ticketId === ticket.id);
  const priorityMeta = formatPriority(ticket.priority);
  const statusMeta = formatStatus(ticket.status);

  const totalPartsCost = ticket.partsUsed.reduce(
    (sum, p) => sum + p.quantity * p.unitCost,
    0
  );

  const handleUpdateStatus = () => {
    if (!newStatus) return;
    updateTicketStatus(ticket.id, newStatus, notes || undefined);
    setNewStatus('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono-numbers font-bold text-base text-slate-900">
              #{ticket.id}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">{ticket.unit}, {ticket.building}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className={priorityMeta.textClass}>{priorityMeta.label}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title & Description */}
          <div>
            <h2 className="text-base font-bold text-slate-900">{ticket.title}</h2>
            <div className="text-xs text-slate-600 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100 leading-relaxed">
              {ticket.description}
            </div>

            {ticket.imageUrl && (
              <div className="mt-3">
                <span className="text-[11px] font-medium text-slate-700 block mb-1">
                  Attached Issue Photo:
                </span>
                <img
                  src={ticket.imageUrl}
                  alt="Repair context"
                  referrerPolicy="no-referrer"
                  className="max-h-56 rounded-lg border border-slate-200 object-cover"
                />
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <div>
              <span className="text-slate-400 block">Category</span>
              <span className="font-medium text-slate-900 mt-0.5 block">
                {formatCategoryName(ticket.category)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Current Status</span>
              <span className={`mt-0.5 block ${statusMeta.textClass}`}>
                {statusMeta.label}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Preferred Time</span>
              <span className="text-slate-700 mt-0.5 block line-clamp-1" title={ticket.preferredTime}>
                {ticket.preferredTime}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Submitted At</span>
              <span className="font-mono-numbers text-slate-700 mt-0.5 block">
                {formatDateTime(ticket.createdAt)}
              </span>
            </div>
          </div>

          {/* Tenant Contact & WhatsApp Deep Link */}
          <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-slate-500" />
              <div>
                <span className="font-semibold text-slate-900">{ticket.tenantName}</span>
                <span className="text-slate-500 font-mono-numbers ml-2">
                  {ticket.tenantPhone}
                </span>
              </div>
            </div>

            <a
              href={formatWhatsAppUrl(
                ticket.tenantPhone,
                `Hi ${ticket.tenantName}, regarding your maintenance request #${ticket.id}...`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center gap-1 shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Tenant</span>
            </a>
          </div>

          {/* Assigned Technician */}
          <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900">Assigned Technician</span>
              {!assignedTech && (
                <button
                  onClick={() => onAssignTech(ticket)}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  + Assign Now
                </button>
              )}
            </div>

            {assignedTech ? (
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <img
                    src={assignedTech.avatar}
                    alt={assignedTech.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      {assignedTech.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {assignedTech.specialties.map(formatCategoryName).join(', ')} · ⭐ {assignedTech.rating}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onAssignTech(ticket)}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded text-xs font-medium"
                >
                  Reassign
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No technician assigned yet. Work order is unallocated.
              </p>
            )}
          </div>

          {/* Parts Used & Inventory Cost */}
          {ticket.partsUsed.length > 0 && (
            <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-slate-500" />
                  <span>Inventory Replacement Parts Used</span>
                </span>
                <span className="font-mono-numbers font-semibold text-slate-900">
                  Total: {formatCurrency(totalPartsCost)}
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {ticket.partsUsed.map((p, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between">
                    <span className="text-slate-700">
                      {p.quantity}x {p.partName}
                    </span>
                    <span className="font-mono-numbers text-slate-500">
                      {formatCurrency(p.quantity * p.unitCost)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution & Rating if resolved */}
          {ticket.status === 'resolved' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-900 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Work Completed & Verified</span>
                </span>
                <span className="font-mono-numbers">
                  Resolution Duration: {formatRelativeMinutes(ticket.resolutionDurationMinutes)}
                </span>
              </div>

              {ticket.resolutionNotes && (
                <p className="text-emerald-800 italic">"{ticket.resolutionNotes}"</p>
              )}

              {ticket.tenantRating && (
                <div className="flex items-center gap-1.5 pt-1 text-emerald-900">
                  <span>Tenant Rating:</span>
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < ticket.tenantRating!
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  {ticket.tenantFeedback && (
                    <span className="text-slate-600">· "{ticket.tenantFeedback}"</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Update Status Form */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-900">
              Update Work Order Status
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                aria-label="Change Work Order Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-800"
              >
                <option value="">Select new status...</option>
                <option value="submitted">Submitted</option>
                <option value="assigned">Dispatched / Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="parts_pending">Parts Pending</option>
                <option value="resolved">Resolved</option>
              </select>

              <input
                type="text"
                placeholder="Optional status notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
              />

              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={!newStatus}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-md text-xs font-semibold whitespace-nowrap shadow-xs"
              >
                Update Status
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              * Changing status sends an automatic WhatsApp notification update to {ticket.tenantPhone}.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onViewWhatsApp(ticket.id);
              onClose();
            }}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>View WhatsApp Message Stream ({ticketMessages.length})</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
