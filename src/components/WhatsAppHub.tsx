import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/formatters';
import { formatWhatsAppUrl } from '../utils/whatsapp';
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Check,
  Sparkles,
  ExternalLink,
  Bot,
  User,
  Wrench,
  ShieldCheck,
  Code2,
} from 'lucide-react';

interface WhatsAppHubProps {
  initialTicketId?: string;
}

export const WhatsAppHub: React.FC<WhatsAppHubProps> = ({ initialTicketId }) => {
  const {
    tickets,
    technicians,
    messages,
    sendDirectWhatsAppMessage,
    currentTechId,
  } = useApp();

  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    initialTicketId || tickets[0]?.id || ''
  );

  const [replyText, setReplyText] = useState('');
  const [replyRole, setReplyRole] = useState<'tenant' | 'technician' | 'system'>('technician');
  const [activeTab, setActiveTab] = useState<'chat' | 'templates' | 'api_logs'>('chat');

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];
  const assignedTech = technicians.find((t) => t.id === selectedTicket?.assignedTechnicianId);

  // Messages for this ticket
  const ticketMessages = messages.filter((m) => m.ticketId === selectedTicket?.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    let senderName = 'FixFlow Bot';
    if (replyRole === 'technician') {
      senderName = assignedTech?.name || 'Assigned Technician';
    } else if (replyRole === 'tenant') {
      senderName = selectedTicket.tenantName;
    }

    sendDirectWhatsAppMessage(
      selectedTicket.id,
      selectedTicket.tenantPhone,
      selectedTicket.tenantName,
      replyRole,
      senderName,
      replyText
    );

    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            WhatsApp Live Dispatch Hub
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Automated Notification Gateway</span>
            <span aria-hidden="true">·</span>
            <span>2-Way Tenant & Technician Messaging</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">{messages.length} Dispatched Messages</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'chat'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Device Simulator
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'templates'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Message Templates
          </button>
          <button
            onClick={() => setActiveTab('api_logs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'api_logs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Webhook & API Logs
          </button>
        </div>
      </div>

      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Ticket Selector & Direct Links */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
                Select Active Work Order Thread
              </h3>
              <div className="space-y-2">
                {tickets.map((t) => {
                  const isSelected = t.id === selectedTicket?.id;
                  const msgCount = messages.filter((m) => m.ticketId === t.id).length;

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono-numbers font-bold text-slate-900">
                            #{t.id}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="font-medium text-slate-700">{t.unit}</span>
                        </div>
                        <span className="font-mono-numbers text-[11px] text-emerald-700 font-medium">
                          {msgCount} messages
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-900 truncate mt-1">
                        {t.title}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>{t.tenantName}</span>
                        <span className="font-mono-numbers">{t.tenantPhone}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct WhatsApp Web Action Card */}
            {selectedTicket && (
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                  <ExternalLink className="w-4 h-4 text-emerald-600" />
                  <span>Launch WhatsApp Application</span>
                </div>
                <p className="text-xs text-slate-500">
                  You can open a real WhatsApp conversation with {selectedTicket.tenantName} at{' '}
                  <span className="font-mono-numbers font-medium text-slate-700">
                    {selectedTicket.tenantPhone}
                  </span>.
                </p>
                <a
                  href={formatWhatsAppUrl(
                    selectedTicket.tenantPhone,
                    `Hello ${selectedTicket.tenantName}, FixFlow Maintenance update regarding ticket #${selectedTicket.id}...`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open wa.me Deep Link</span>
                </a>
              </div>
            )}
          </div>

          {/* Right Column: WhatsApp Phone Simulator */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="max-w-md mx-auto bg-slate-900 rounded-[28px] p-3 shadow-xl border-4 border-slate-800">
                {/* Phone Speaker Notch */}
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

                {/* WhatsApp Device Screen */}
                <div className="bg-[#efeae2] rounded-[20px] overflow-hidden flex flex-col h-[620px] border border-slate-700/40">
                  {/* WhatsApp Header */}
                  <div className="bg-[#075e54] text-white px-3 py-2.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                        FF
                      </div>
                      <div>
                        <div className="font-semibold text-xs leading-tight">
                          FixFlow Dispatch · {selectedTicket.unit}
                        </div>
                        <div className="text-[10px] text-emerald-200 leading-tight">
                          Online · Automated Dispatcher
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-white/90">
                      <Phone className="w-4 h-4 cursor-pointer" />
                      <Video className="w-4 h-4 cursor-pointer" />
                      <MoreVertical className="w-4 h-4 cursor-pointer" />
                    </div>
                  </div>

                  {/* Messages Area with chat bubbles */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {/* Date Divider */}
                    <div className="text-center my-1">
                      <span className="bg-white/80 text-slate-600 text-[10px] px-2 py-0.5 rounded shadow-xs font-mono-numbers">
                        Today · Ticket #{selectedTicket.id}
                      </span>
                    </div>

                    {ticketMessages.map((msg) => {
                      const isOutgoing = msg.sender === 'system' || msg.sender === 'technician';

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg p-2.5 text-xs shadow-xs relative ${
                              isOutgoing
                                ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none'
                                : 'bg-white text-slate-900 rounded-tl-none'
                            }`}
                          >
                            {/* Sender Label */}
                            <div className="text-[10px] font-bold text-[#075e54] mb-1 flex items-center gap-1">
                              {msg.sender === 'system' ? (
                                <>
                                  <Bot className="w-3 h-3 text-emerald-700" />
                                  <span>FixFlow Dispatch Bot</span>
                                </>
                              ) : msg.sender === 'technician' ? (
                                <>
                                  <Wrench className="w-3 h-3 text-indigo-700" />
                                  <span>{msg.senderName} (Technician)</span>
                                </>
                              ) : (
                                <>
                                  <User className="w-3 h-3 text-amber-700" />
                                  <span>{msg.senderName} (Tenant)</span>
                                </>
                              )}
                            </div>

                            {/* Message Text (with simple newline preservation) */}
                            <div className="whitespace-pre-line text-slate-800 leading-relaxed text-[11.5px]">
                              {msg.message}
                            </div>

                            {/* Timestamp & Read ticks */}
                            <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 mt-1 font-mono-numbers">
                              <span>{formatDateTime(msg.timestamp).split(',')[1] || 'Just now'}</span>
                              {isOutgoing && (
                                <CheckCheck className="w-3 h-3 text-blue-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive Reply Bar */}
                  <div className="bg-[#f0f2f5] p-2 border-t border-slate-200">
                    {/* Role toggle */}
                    <div className="flex items-center gap-1.5 mb-1.5 px-1">
                      <span className="text-[10px] text-slate-500">Reply as:</span>
                      <button
                        type="button"
                        onClick={() => setReplyRole('technician')}
                        className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                          replyRole === 'technician'
                            ? 'bg-slate-900 text-white font-semibold'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        Technician
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyRole('tenant')}
                        className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                          replyRole === 'tenant'
                            ? 'bg-slate-900 text-white font-semibold'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        Tenant
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyRole('system')}
                        className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                          replyRole === 'system'
                            ? 'bg-slate-900 text-white font-semibold'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        System Bot
                      </button>
                    </div>

                    <form onSubmit={handleSend} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder={`Message as ${replyRole}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim()}
                        className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#008f72] disabled:bg-slate-300 text-white flex items-center justify-center shrink-0 shadow-xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs">
                No tickets available.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              WhatsApp Business Approved Templates
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated message templates dispatched on specific maintenance lifecycle events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">1. ticket_received_v1</span>
                <span className="text-emerald-600 font-medium text-[11px]">Meta Approved</span>
              </div>
              <p className="text-xs font-mono-numbers text-slate-600 bg-white p-3 rounded border border-slate-200 leading-relaxed whitespace-pre-line">
                {`🔧 FixFlow Maintenance Update\n\nHello {{tenant_name}}!\nYour maintenance request #{{ticket_id}} ({{issue_title}}) has been received.\n\n📍 Unit: {{unit_location}}\n⚡ Priority: {{priority}}\n\nOur maintenance team will assign a certified technician shortly.`}
              </p>
              <div className="text-[11px] text-slate-400">
                Trigger: Instant on tenant submission
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">2. technician_dispatched_v1</span>
                <span className="text-emerald-600 font-medium text-[11px]">Meta Approved</span>
              </div>
              <p className="text-xs font-mono-numbers text-slate-600 bg-white p-3 rounded border border-slate-200 leading-relaxed whitespace-pre-line">
                {`👷 Technician Assigned!\n\n{{technician_name}} ({{trade_specialty}} · ⭐ {{rating}}) has been assigned to your ticket.\n\nEstimated Arrival: {{service_window}}\nDirect Contact: {{technician_phone}}`}
              </p>
              <div className="text-[11px] text-slate-400">
                Trigger: On admin dispatch or auto-match
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">3. parts_allocated_notice</span>
                <span className="text-emerald-600 font-medium text-[11px]">Meta Approved</span>
              </div>
              <p className="text-xs font-mono-numbers text-slate-600 bg-white p-3 rounded border border-slate-200 leading-relaxed whitespace-pre-line">
                {`📦 Inventory Update for #{{ticket_id}}\n\nReplacement parts ({{parts_list}}) have been checked out from warehouse. Technician is proceeding with installation.`}
              </p>
              <div className="text-[11px] text-slate-400">
                Trigger: When technician deducts inventory stock
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">4. repair_resolved_survey</span>
                <span className="text-emerald-600 font-medium text-[11px]">Meta Approved</span>
              </div>
              <p className="text-xs font-mono-numbers text-slate-600 bg-white p-3 rounded border border-slate-200 leading-relaxed whitespace-pre-line">
                {`🎉 Maintenance Completed!\n\nTicket #{{ticket_id}} has been marked as RESOLVED by {{technician_name}}.\n\nSummary: {{notes}}\nPlease rate your service: 1 to 5 stars.`}
              </p>
              <div className="text-[11px] text-slate-400">
                Trigger: Work order marked complete
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Webhook & API Logs Tab */}
      {activeTab === 'api_logs' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                WhatsApp Cloud API Outbound Event Stream
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time payload inspection for webhooks sent to WhatsApp Graph API.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono-numbers">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Gateway: graph.facebook.com/v19.0</span>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono-numbers text-xs overflow-x-auto space-y-2">
            <div className="text-emerald-400 font-semibold">
              // Recent Automated Dispatch Payload:
            </div>
            <pre className="text-slate-300">
{JSON.stringify(
  {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: selectedTicket?.tenantPhone || '+15554819023',
    type: 'template',
    template: {
      name: 'fixflow_ticket_update',
      language: { code: 'en_US' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: selectedTicket?.tenantName || 'Sarah' },
            { type: 'text', text: selectedTicket?.id || 'TICK-1042' },
            { type: 'text', text: selectedTicket?.status || 'in_progress' },
          ],
        },
      ],
    },
    meta: {
      applet_id: 'FixFlow-Dispatch-Engine',
      delivery_status: 'delivered',
      timestamp: new Date().toISOString(),
    },
  },
  null,
  2
)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
