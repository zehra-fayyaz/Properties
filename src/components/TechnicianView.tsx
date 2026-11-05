import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Ticket, TicketStatus } from '../types';
import {
  formatCategoryName,
  formatPriority,
  formatStatus,
  formatDateTime,
  formatCurrency,
} from '../utils/formatters';
import { formatWhatsAppUrl } from '../utils/whatsapp';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Package,
  MessageSquare,
  Send,
  Plus,
  Trash2,
  MapPin,
  Phone,
  AlertTriangle,
} from 'lucide-react';

interface TechnicianViewProps {
  onViewWhatsApp: (ticketId: string) => void;
}

export const TechnicianView: React.FC<TechnicianViewProps> = ({ onViewWhatsApp }) => {
  const {
    technicians,
    tickets,
    inventory,
    currentTechId,
    setCurrentTechId,
    updateTicketStatus,
    checkoutPartsForTicket,
    sendDirectWhatsAppMessage,
  } = useApp();

  const currentTech = technicians.find((t) => t.id === currentTechId) || technicians[0];

  // Assigned tickets for this technician
  const assignedTickets = tickets.filter(
    (t) => t.assignedTechnicianId === currentTech.id && t.status !== 'resolved'
  );
  const completedTickets = tickets.filter(
    (t) => t.assignedTechnicianId === currentTech.id && t.status === 'resolved'
  );

  const [activeTicketId, setActiveTicketId] = useState<string>(
    assignedTickets[0]?.id || ''
  );

  const selectedTicket =
    tickets.find((t) => t.id === activeTicketId) || assignedTickets[0];

  // Work order execution state
  const [resolutionNote, setResolutionNote] = useState('');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [customMsg, setCustomMsg] = useState('');
  const [msgSentNotice, setMsgSentNotice] = useState(false);

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, newStatus, resolutionNote);
  };

  const handleAddPartToTicket = () => {
    if (!selectedTicket || !selectedPartId) return;
    checkoutPartsForTicket(selectedTicket.id, [
      { inventoryItemId: selectedPartId, quantity: partQty },
    ]);
    setSelectedPartId('');
    setPartQty(1);
  };

  const handleSendPing = (text: string) => {
    if (!selectedTicket) return;
    sendDirectWhatsAppMessage(
      selectedTicket.id,
      selectedTicket.tenantPhone,
      selectedTicket.tenantName,
      'technician',
      currentTech.name,
      text
    );
    setMsgSentNotice(true);
    setCustomMsg('');
    setTimeout(() => setMsgSentNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Technician Profile Switcher */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={currentTech.avatar}
              alt={currentTech.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full object-cover border-2 border-slate-900 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{currentTech.name}</h1>
                <span className="text-xs text-amber-600 font-medium">
                  ⭐ {currentTech.rating}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {currentTech.specialties.map(formatCategoryName).join(', ')} · Field Technician
              </p>
              <div className="text-[11px] font-mono-numbers text-slate-400 mt-0.5">
                {currentTech.phone} · {currentTech.jobsCompleted} total repairs completed
              </div>
            </div>
          </div>

          {/* Switch technician dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-500">Active Roster:</span>
            <select
              aria-label="Active Technician Persona"
              value={currentTechId}
              onChange={(e) => {
                setCurrentTechId(e.target.value);
                const nextTech = technicians.find((t) => t.id === e.target.value);
                const firstTicket = tickets.find(
                  (t) => t.assignedTechnicianId === nextTech?.id && t.status !== 'resolved'
                );
                if (firstTicket) setActiveTicketId(firstTicket.id);
              }}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800"
            >
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.specialties.join(', ')})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: My Queue on Left, Active Work Order on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Work Order Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                My Assigned Work Orders ({assignedTickets.length})
              </h3>
              <span className="text-xs text-slate-400 font-mono-numbers">
                {completedTickets.length} completed
              </span>
            </div>

            {assignedTickets.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No active work orders assigned. Check the Admin dispatch queue!
              </div>
            ) : (
              <div className="space-y-2.5">
                {assignedTickets.map((ticket) => {
                  const isSelected = selectedTicket?.id === ticket.id;
                  const priorityMeta = formatPriority(ticket.priority);
                  const statusMeta = formatStatus(ticket.status);

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setActiveTicketId(ticket.id)}
                      className={`p-3.5 rounded-lg border text-left cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono-numbers font-bold text-slate-900">
                            {ticket.id}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="font-medium text-slate-700">{ticket.unit}</span>
                        </div>
                        <span className={priorityMeta.textClass}>{priorityMeta.label}</span>
                      </div>

                      <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                        {ticket.title}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span>{ticket.tenantName}</span>
                        <span className={statusMeta.textClass}>{statusMeta.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Execution Console */}
        <div className="lg:col-span-7 space-y-4">
          {selectedTicket ? (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-6">
              {/* Ticket Summary Header */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-numbers font-bold text-slate-900">
                      Work Order #{selectedTicket.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatCategoryName(selectedTicket.category)}</span>
                  </div>
                  <span className={formatPriority(selectedTicket.priority).textClass}>
                    {formatPriority(selectedTicket.priority).label}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900">{selectedTicket.title}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400">Unit Location:</span>
                    <p className="font-medium text-slate-900">
                      {selectedTicket.unit}, {selectedTicket.building}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Tenant Contact:</span>
                    <p className="font-medium text-slate-900 font-mono-numbers">
                      {selectedTicket.tenantName} ({selectedTicket.tenantPhone})
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400">Access Instructions:</span>
                    <p className="text-slate-700">{selectedTicket.preferredTime}</p>
                  </div>
                </div>

                {/* Problem Description & Attached Image */}
                <div className="mt-3 text-xs text-slate-700">
                  <span className="font-medium text-slate-900">Reported Problem:</span>
                  <p className="mt-0.5 bg-slate-50 p-2.5 rounded border border-slate-100">
                    {selectedTicket.description}
                  </p>

                  {selectedTicket.imageUrl && (
                    <div className="mt-3">
                      <span className="font-medium text-slate-900 block mb-1">
                        Tenant Photo Evidence:
                      </span>
                      <img
                        src={selectedTicket.imageUrl}
                        alt="Issue photo"
                        referrerPolicy="no-referrer"
                        className="max-h-48 rounded border border-slate-200 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Status Progression Workflow */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
                  Update Work Status (Triggers WhatsApp Tenant Alert)
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
                      selectedTicket.status === 'in_progress'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🔨 In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange('parts_pending')}
                    className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
                      selectedTicket.status === 'parts_pending'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    📦 Getting Parts
                  </button>
                  <button
                    onClick={() => handleStatusChange('resolved')}
                    className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
                      selectedTicket.status === 'resolved'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ✅ Mark Resolved
                  </button>
                </div>
              </div>

              {/* Spare Parts Checkout Tool */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-slate-700" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Checkout Replacement Parts from Inventory
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500">Auto-deducts warehouse stock</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    aria-label="Select replacement part from inventory"
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-800"
                  >
                    <option value="">Select replacement part...</option>
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id} disabled={item.stock === 0}>
                        {item.name} ({item.stock} in stock) · {formatCurrency(item.unitCost)}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      aria-label="Part quantity"
                      min={1}
                      max={10}
                      value={partQty}
                      onChange={(e) => setPartQty(parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-center font-mono-numbers"
                    />
                    <button
                      type="button"
                      onClick={handleAddPartToTicket}
                      disabled={!selectedPartId}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-md text-xs font-semibold whitespace-nowrap"
                    >
                      + Use Part
                    </button>
                  </div>
                </div>

                {/* Parts currently allocated to this ticket */}
                {selectedTicket.partsUsed.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-700 block">
                      Allocated to this repair:
                    </span>
                    {selectedTicket.partsUsed.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-200"
                      >
                        <span className="font-medium text-slate-800">
                          {p.quantity}x {p.partName}
                        </span>
                        <span className="font-mono-numbers text-slate-600">
                          {formatCurrency(p.quantity * p.unitCost)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick WhatsApp Ping to Tenant */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-xs">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Direct Ping to Tenant ({selectedTicket.tenantName})</span>
                  </div>
                  {msgSentNotice && (
                    <span className="text-[11px] font-semibold text-emerald-700 animate-pulse">
                      ✓ Dispatched to WhatsApp!
                    </span>
                  )}
                </div>

                {/* 1-Tap Presets */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleSendPing(
                        `Hi ${selectedTicket.tenantName}, ${currentTech.name} here. I have grabbed the replacement parts and am en route to ${selectedTicket.unit} now!`
                      )
                    }
                    className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded text-xs transition-colors"
                  >
                    "On my way with parts"
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSendPing(
                        `Hi ${selectedTicket.tenantName}, I am outside ${selectedTicket.unit}. Ringing the buzzer now.`
                      )
                    }
                    className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded text-xs transition-colors"
                  >
                    "Arrived at unit door"
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSendPing(
                        `Repairs for ticket #${selectedTicket.id} are complete and tested. Let me know if you need anything else!`
                      )
                    }
                    className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded text-xs transition-colors"
                  >
                    "Repairs complete & tested"
                  </button>
                </div>

                {/* Custom Message Field */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type custom WhatsApp update..."
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-emerald-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendPing(customMsg)}
                    disabled={!customMsg.trim()}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-emerald-800">
                  <button
                    type="button"
                    onClick={() => onViewWhatsApp(selectedTicket.id)}
                    className="underline hover:text-emerald-950 font-medium"
                  >
                    Open Full WhatsApp Conversation
                  </button>

                  <a
                    href={formatWhatsAppUrl(
                      selectedTicket.tenantPhone,
                      `Hi ${selectedTicket.tenantName}, ${currentTech.name} from maintenance regarding ticket #${selectedTicket.id}...`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline font-medium flex items-center gap-1"
                  >
                    <span>Open in WhatsApp Web/App</span>
                  </a>
                </div>
              </div>

              {/* Resolution Notes Field */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-900">
                  Technician Work Summary & Resolution Notes
                </label>
                <textarea
                  rows={2}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Cleared P-Trap obstruction, replaced damaged rubber flange, verified seal with 5 minute flow test..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => handleStatusChange('resolved')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors"
                >
                  Save Notes & Complete Work Order #{selectedTicket.id}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-500 shadow-xs">
              Select a work order from the queue to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
