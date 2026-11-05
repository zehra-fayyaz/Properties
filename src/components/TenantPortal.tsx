import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TicketCategory, Priority, Ticket } from '../types';
import {
  formatCategoryName,
  formatPriority,
  formatStatus,
  formatDateTime,
} from '../utils/formatters';
import { formatWhatsAppUrl } from '../utils/whatsapp';
import {
  Wrench,
  AlertCircle,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  Upload,
  Camera,
  Star,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface TenantPortalProps {
  onViewWhatsApp: (ticketId: string) => void;
}

export const TenantPortal: React.FC<TenantPortalProps> = ({ onViewWhatsApp }) => {
  const {
    tickets,
    technicians,
    messages,
    createTicket,
    updateTicketStatus,
    currentTenantPhone,
    setCurrentTenantPhone,
  } = useApp();

  // New Ticket Form State
  const [building, setBuilding] = useState('Elmwood Tower');
  const [unit, setUnit] = useState('Apt 4B');
  const [tenantName, setTenantName] = useState('Sarah Jenkins');
  const [tenantPhone, setTenantPhone] = useState(currentTenantPhone);
  const [category, setCategory] = useState<TicketCategory>('plumbing');
  const [priority, setPriority] = useState<Priority>('high');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (9:00 AM - 12:00 PM)');
  const [permissionToEnter, setPermissionToEnter] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [submittedTicket, setSubmittedTicket] = useState<Ticket | null>(null);

  // Review state
  const [ratingInput, setRatingInput] = useState<Record<string, number>>({});
  const [feedbackInput, setFeedbackInput] = useState<Record<string, string>>({});

  // Filter tickets for this tenant phone or unit
  const myTickets = tickets.filter(
    (t) =>
      t.tenantPhone === tenantPhone ||
      (t.tenantName.toLowerCase() === tenantName.toLowerCase() && t.unit === unit)
  );

  const activeTickets = myTickets.filter((t) => t.status !== 'resolved' && t.status !== 'cancelled');
  const resolvedTickets = myTickets.filter((t) => t.status === 'resolved');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newTicket = createTicket({
      building,
      unit,
      tenantName,
      tenantPhone,
      category,
      priority,
      title,
      description,
      preferredTime: permissionToEnter
        ? `${preferredTime} · Permission granted to enter with master key`
        : `${preferredTime} · Tenant must be present`,
      imageUrl: selectedImage,
    });

    setSubmittedTicket(newTicket);
    setTitle('');
    setDescription('');
    setSelectedImage(undefined);
  };

  const handleRatingSubmit = (ticketId: string) => {
    const r = ratingInput[ticketId] || 5;
    const f = feedbackInput[ticketId] || '';
    updateTicketStatus(ticketId, 'resolved', undefined, r, f);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Live Updates Enabled</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tenant Maintenance Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Submit apartment repair requests and track technician dispatch in real time via WhatsApp.
            </p>
          </div>

          {/* Quick Tenant Switcher (Demo helper) */}
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80 text-xs">
            <label className="text-[11px] text-slate-400 block mb-1">
              Switch Sample Tenant Profile:
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTenantName('Sarah Jenkins');
                  setUnit('Apt 4B');
                  setBuilding('Elmwood Tower');
                  setTenantPhone('+1 555-481-9023');
                  setCurrentTenantPhone('+1 555-481-9023');
                }}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  tenantName === 'Sarah Jenkins'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Sarah (Apt 4B)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTenantName('David & Rachel Miller');
                  setUnit('Apt 2A');
                  setBuilding('Maple Court');
                  setTenantPhone('+1 555-392-1847');
                  setCurrentTenantPhone('+1 555-392-1847');
                }}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  tenantName === 'David & Rachel Miller'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                David Miller (Apt 2A)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTenantName('Jonathan Wu');
                  setUnit('Apt 6C');
                  setBuilding('Elmwood Tower');
                  setTenantPhone('+1 555-720-3341');
                  setCurrentTenantPhone('+1 555-720-3341');
                }}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  tenantName === 'Jonathan Wu'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Jonathan (Apt 6C)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Success Alert */}
      {submittedTicket && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                Issue Submitted Successfully — Ticket #{submittedTicket.id}
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Confirmation sent to {submittedTicket.tenantPhone}. You will receive a WhatsApp message as soon as a technician is dispatched.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewWhatsApp(submittedTicket.id)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold whitespace-nowrap shadow-xs"
            >
              View WhatsApp Thread
            </button>
            <button
              onClick={() => setSubmittedTicket(null)}
              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Submit Form (Left) & My Tickets (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Submit New Issue Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
            <h2 className="text-base font-semibold text-slate-900 mb-1">
              Submit a Maintenance Request
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Please describe the issue in detail. For emergencies like gas leaks or major floods, contact building emergency immediately.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Unit & Building */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Building
                  </label>
                  <select
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Elmwood Tower">Elmwood Tower (120 Units)</option>
                    <option value="Maple Court">Maple Court (84 Units)</option>
                    <option value="Oak Ridge Suites">Oak Ridge Suites (64 Units)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Apartment / Unit Number
                  </label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. Apt 4B"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Tenant Name & WhatsApp Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    WhatsApp Mobile Number (for status updates)
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      placeholder="+1 555-481-9023"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900 font-mono-numbers"
                    />
                  </div>
                </div>
              </div>

              {/* Maintenance Category */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Issue Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'plumbing', label: 'Plumbing', desc: 'Leaks, drains, toilet, faucets' },
                      { id: 'electrical', label: 'Electrical', desc: 'Outlets, breakers, fixtures' },
                      { id: 'hvac', label: 'HVAC / Climate', desc: 'AC cooling, heat, airflow' },
                      { id: 'appliance', label: 'Appliances', desc: 'Fridge, oven, dishwasher' },
                      { id: 'carpentry', label: 'Doors & Locks', desc: 'Deadbolts, hinges, cabinets' },
                      { id: 'general', label: 'General / Other', desc: 'Drywall, windows, blinds' },
                    ] as const
                  ).map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${
                        category === cat.id
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-semibold">{cat.label}</div>
                      <div
                        className={`text-[10px] mt-0.5 truncate ${
                          category === cat.id ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {cat.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Urgency / Priority */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Urgency Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'emergency', label: 'Emergency', sub: '< 2 hrs SLA' },
                      { id: 'high', label: 'High Priority', sub: '< 6 hrs SLA' },
                      { id: 'medium', label: 'Medium', sub: '< 24 hrs SLA' },
                      { id: 'low', label: 'Routine / Low', sub: '< 48 hrs SLA' },
                    ] as const
                  ).map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPriority(p.id)}
                      className={`p-2 rounded-md border text-center transition-colors ${
                        priority === p.id
                          ? p.id === 'emergency'
                            ? 'bg-rose-50 border-rose-600 text-rose-700 font-semibold'
                            : 'bg-slate-900 border-slate-900 text-white font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs">{p.label}</div>
                      <div className="text-[10px] opacity-75">{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Issue Title */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Issue Summary
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Kitchen sink pipe joint leaking under cabinet"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Detailed Description & Location in Unit
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened, any sounds/smells, and exact location inside the apartment..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Photo Evidence Attachment */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Photo Evidence (Helps technician bring correct parts)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage(
                        selectedImage
                          ? undefined
                          : '/images/maintenance-repair.jpg'
                      )
                    }
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs border transition-colors ${
                      selectedImage
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Camera className="w-4 h-4 text-slate-500" />
                    <span>
                      {selectedImage ? '✓ Pipe Photo Attached' : '+ Attach Sample Repair Photo'}
                    </span>
                  </button>

                  {selectedImage && (
                    <div className="relative w-12 h-12 rounded border border-slate-200 overflow-hidden">
                      <img
                        src={selectedImage}
                        alt="Issue preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Preferred Time & Entry Permission */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Preferred Service Window
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-700"
                  >
                    <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                    <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                    <option value="Immediate / Urgent Access">Immediate / Urgent Access Granted</option>
                  </select>
                </div>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissionToEnter}
                    onChange={(e) => setPermissionToEnter(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <div className="text-xs text-slate-600">
                    <span className="font-medium text-slate-900">
                      Permission to enter with Master Key
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Technician may enter if tenant is away to resolve issue faster.
                    </p>
                  </div>
                </label>
              </div>

              {/* WhatsApp Notification preview disclaimer */}
              <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  You will instantly receive automated WhatsApp dispatch updates & ETA tracking.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Submit Maintenance Ticket & Trigger WhatsApp Notice
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Tenant's Active & Past Tickets */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Work Orders */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Active Maintenance Requests ({activeTickets.length})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time dispatch timeline and technician status for {unit}.
            </p>

            {activeTickets.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No open maintenance tickets for {unit}. Everything is running smoothly!
              </div>
            ) : (
              <div className="space-y-4">
                {activeTickets.map((ticket) => {
                  const tech = technicians.find((t) => t.id === ticket.assignedTechnicianId);
                  const statusMeta = formatStatus(ticket.status);
                  const priorityMeta = formatPriority(ticket.priority);

                  return (
                    <div
                      key={ticket.id}
                      className="p-4 border border-slate-200 rounded-lg space-y-3 hover:border-slate-300 transition-colors"
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono-numbers font-semibold text-slate-900">
                              #{ticket.id}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{formatCategoryName(ticket.category)}</span>
                            <span aria-hidden="true">·</span>
                            <span className={priorityMeta.textClass}>{priorityMeta.label}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-900 mt-1">
                            {ticket.title}
                          </h4>
                        </div>
                        <span className={statusMeta.textClass}>{statusMeta.label}</span>
                      </div>

                      {/* Timeline Stepper */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span
                            className={
                              ticket.status === 'submitted' ? 'font-semibold text-blue-600' : ''
                            }
                          >
                            1. Logged
                          </span>
                          <span
                            className={
                              ticket.status === 'assigned' ? 'font-semibold text-indigo-600' : ''
                            }
                          >
                            2. Dispatched
                          </span>
                          <span
                            className={
                              ticket.status === 'in_progress' ? 'font-semibold text-amber-600' : ''
                            }
                          >
                            3. In Progress
                          </span>
                          <span className={ticket.status === 'resolved' ? 'font-semibold text-emerald-600' : ''}>
                            4. Resolved
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-900 rounded-full transition-all duration-300"
                            style={{
                              width:
                                ticket.status === 'submitted'
                                  ? '25%'
                                  : ticket.status === 'assigned'
                                  ? '50%'
                                  : ticket.status === 'in_progress'
                                  ? '75%'
                                  : '100%',
                            }}
                          />
                        </div>
                      </div>

                      {/* Assigned Tech Card if assigned */}
                      {tech && (
                        <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={tech.avatar}
                              alt={tech.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="text-xs font-semibold text-slate-900">
                                {tech.name}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {tech.specialties.map(formatCategoryName).join(', ')} · ⭐ {tech.rating}
                              </div>
                              <div className="text-[11px] font-mono-numbers text-slate-400">
                                {tech.phone}
                              </div>
                            </div>
                          </div>

                          <a
                            href={formatWhatsAppUrl(
                              tech.phone,
                              `Hi ${tech.name}, regarding maintenance ticket #${ticket.id} for ${ticket.unit}...`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center gap-1 shadow-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}

                      {/* WhatsApp Feed Link */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <span className="text-slate-400 font-mono-numbers">
                          Logged: {formatDateTime(ticket.createdAt)}
                        </span>
                        <button
                          onClick={() => onViewWhatsApp(ticket.id)}
                          className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                        >
                          <span>Live WhatsApp Logs</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Resolved History & Feedback */}
          {resolvedTickets.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Completed Repairs ({resolvedTickets.length})
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Service history and satisfaction rating.
              </p>

              <div className="space-y-3">
                {resolvedTickets.map((ticket) => (
                  <div key={ticket.id} className="p-3 bg-slate-50 rounded-lg text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{ticket.title}</span>
                      <span className="text-emerald-600 font-medium">✓ Resolved</span>
                    </div>

                    {ticket.resolutionNotes && (
                      <p className="text-slate-600 italic">
                        "{ticket.resolutionNotes}"
                      </p>
                    )}

                    {ticket.tenantRating ? (
                      <div className="flex items-center gap-2 text-slate-600">
                        <span>Your Rating:</span>
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
                          <span className="text-slate-500">· "{ticket.tenantFeedback}"</span>
                        )}
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-200 space-y-2">
                        <label className="text-[11px] font-medium text-slate-700 block">
                          Rate Carlos & Service Experience:
                        </label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setRatingInput((prev) => ({ ...prev, [ticket.id]: star }))
                              }
                              className="text-amber-400 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= (ratingInput[ticket.id] || 5)
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Optional feedback..."
                            value={feedbackInput[ticket.id] || ''}
                            onChange={(e) =>
                              setFeedbackInput((prev) => ({
                                ...prev,
                                [ticket.id]: e.target.value,
                              }))
                            }
                            className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleRatingSubmit(ticket.id)}
                            className="px-3 py-1 bg-slate-900 text-white rounded text-xs font-medium"
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
