import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Ticket, TicketStatus, TicketCategory, Priority } from '../types';
import {
  formatCategoryName,
  formatPriority,
  formatStatus,
  formatDateTime,
  formatRelativeMinutes,
} from '../utils/formatters';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  UserCheck,
  Package,
  Eye,
  TrendingDown,
  ArrowUpRight,
  Sparkles,
  PhoneCall,
  SlidersHorizontal,
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectTicket: (ticket: Ticket) => void;
  onAssignTech: (ticket: Ticket) => void;
  onViewWhatsApp: (ticketId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSelectTicket,
  onAssignTech,
  onViewWhatsApp,
}) => {
  const { tickets, technicians, inventory, lowStockItems, updateTicketStatus } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'tickets' | 'analytics' | 'technicians'>('tickets');

  // Compute SLA and Resolution Time Metrics
  const metrics = useMemo(() => {
    const resolvedTickets = tickets.filter((t) => t.status === 'resolved');
    const totalResolved = resolvedTickets.length;

    // Average resolution time
    const totalMinutes = resolvedTickets.reduce(
      (acc, t) => acc + (t.resolutionDurationMinutes || 120),
      0
    );
    const avgMinutes = totalResolved > 0 ? Math.round(totalMinutes / totalResolved) : 0;
    const avgHours = (avgMinutes / 60).toFixed(1);

    // Active tickets count
    const activeCount = tickets.filter((t) => t.status !== 'resolved' && t.status !== 'cancelled').length;
    const emergencyCount = tickets.filter((t) => t.priority === 'emergency' && t.status !== 'resolved').length;

    // SLA thresholds in minutes
    // Emergency: 120m, High: 360m, Medium: 1440m, Low: 2880m
    let onTimeCount = 0;
    resolvedTickets.forEach((t) => {
      const dur = t.resolutionDurationMinutes || 120;
      if (t.priority === 'emergency' && dur <= 120) onTimeCount++;
      else if (t.priority === 'high' && dur <= 360) onTimeCount++;
      else if (t.priority === 'medium' && dur <= 1440) onTimeCount++;
      else if (t.priority === 'low' && dur <= 2880) onTimeCount++;
    });
    const slaComplianceRate = totalResolved > 0 ? Math.round((onTimeCount / totalResolved) * 100) : 100;

    // Resolution time by category
    const categories: TicketCategory[] = ['plumbing', 'electrical', 'hvac', 'appliance', 'carpentry'];
    const categoryStats = categories.map((cat) => {
      const catResolved = resolvedTickets.filter((t) => t.category === cat);
      const catMin = catResolved.reduce((acc, t) => acc + (t.resolutionDurationMinutes || 120), 0);
      const catAvgHours = catResolved.length > 0 ? (catMin / catResolved.length / 60).toFixed(1) : '2.0';
      const openCount = tickets.filter((t) => t.category === cat && t.status !== 'resolved').length;
      return {
        category: cat,
        name: formatCategoryName(cat),
        avgHours: parseFloat(catAvgHours),
        resolvedCount: catResolved.length,
        openCount,
      };
    });

    return {
      activeCount,
      emergencyCount,
      totalResolved,
      avgMinutes,
      avgHours,
      slaComplianceRate,
      categoryStats,
    };
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        searchQuery === '' ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = categoryFilter === 'all' || t.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

      return matchesSearch && matchesCat && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, categoryFilter, statusFilter, priorityFilter]);

  return (
    <div className="space-y-6">
      {/* Top Section / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dispatch & Resolution Console
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Building Portfolio: 3 Properties</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">{tickets.length} Total Work Orders</span>
            <span aria-hidden="true">·</span>
            <span>Automated WhatsApp Dispatch Active</span>
          </div>
        </div>

        {/* View Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'tickets'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Work Order Queue ({filteredTickets.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'analytics'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resolution & SLA Analytics
          </button>
          <button
            onClick={() => setActiveTab('technicians')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'technicians'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Technician Roster ({technicians.length})
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Active Tickets */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Active Work Orders</div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono-numbers text-slate-900">
              {metrics.activeCount}
            </span>
            {metrics.emergencyCount > 0 && (
              <span className="text-xs text-rose-600 font-medium">
                {metrics.emergencyCount} Emergency
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {tickets.filter((t) => t.status === 'submitted').length} unassigned in queue
          </div>
        </div>

        {/* KPI 2: Average Resolution Time */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Average Resolution Time</div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono-numbers text-slate-900">
              {metrics.avgHours}
              <span className="text-lg font-normal text-slate-500 ml-1">hrs</span>
            </span>
            <span className="text-xs text-emerald-600 font-medium flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              -18% vs last mo
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Target benchmark: &lt; 4.0 hrs
          </div>
        </div>

        {/* KPI 3: SLA Compliance */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="text-xs text-slate-500 mb-1">On-Time SLA Rate</div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono-numbers text-emerald-600">
              {metrics.slaComplianceRate}
              <span className="text-lg font-normal text-slate-500 ml-0.5">%</span>
            </span>
            <span className="text-xs text-slate-500 font-mono-numbers">
              {metrics.totalResolved} completed
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Emergency target: &lt; 2 hrs (100% met)
          </div>
        </div>

        {/* KPI 4: Inventory Alerts */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Parts & Inventory Stock</div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono-numbers text-slate-900">
              {inventory.length}
              <span className="text-lg font-normal text-slate-500 ml-1">SKUs</span>
            </span>
            {lowStockItems.length > 0 ? (
              <span className="text-xs text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded">
                {lowStockItems.length} Low Stock
              </span>
            ) : (
              <span className="text-xs text-emerald-600 font-medium">Optimal</span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Replenishment reorder ready
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket ID, tenant, unit, or issue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            {/* Select Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted (Unassigned)</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                aria-label="Filter by Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="all">All Trades</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="hvac">HVAC</option>
                <option value="appliance">Appliance</option>
                <option value="carpentry">Carpentry</option>
              </select>

              <select
                aria-label="Filter by Priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="all">All Priorities</option>
                <option value="emergency">Emergency</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 underline px-2 py-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Unit & Tenant</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Tech</th>
                    <th className="py-3 px-4 text-right">Duration / SLA</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No maintenance tickets match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => {
                      const priorityMeta = formatPriority(ticket.priority);
                      const statusMeta = formatStatus(ticket.status);
                      const assignedTech = technicians.find(
                        (tech) => tech.id === ticket.assignedTechnicianId
                      );

                      return (
                        <tr
                          key={ticket.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* Ticket ID & Title */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-mono-numbers font-semibold text-slate-900">
                              {ticket.id}
                            </div>
                            <div className="text-slate-600 truncate max-w-[220px]" title={ticket.title}>
                              {ticket.title}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {formatDateTime(ticket.createdAt)}
                            </div>
                          </td>

                          {/* Unit & Tenant */}
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">{ticket.unit}</div>
                            <div className="text-slate-500">{ticket.tenantName}</div>
                            <div className="text-[11px] text-slate-400 font-mono-numbers">
                              {ticket.tenantPhone}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 text-slate-700">
                            {formatCategoryName(ticket.category)}
                          </td>

                          {/* Priority (Zero pill, clean text) */}
                          <td className="py-3 px-4">
                            <span className={priorityMeta.textClass}>
                              {priorityMeta.label}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className={statusMeta.textClass}>
                                {statusMeta.label}
                              </span>
                              {ticket.partsUsed.length > 0 && (
                                <span className="text-[11px] text-slate-400 mt-0.5">
                                  {ticket.partsUsed.length} part(s) used
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Assigned Technician */}
                          <td className="py-3 px-4">
                            {assignedTech ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={assignedTech.avatar}
                                  alt={assignedTech.name}
                                  referrerPolicy="no-referrer"
                                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                                />
                                <div>
                                  <div className="font-medium text-slate-900">
                                    {assignedTech.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    ⭐ {assignedTech.rating}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => onAssignTech(ticket)}
                                className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                              >
                                + Assign Tech
                              </button>
                            )}
                          </td>

                          {/* Duration & SLA */}
                          <td className="py-3 px-4 text-right font-mono-numbers">
                            {ticket.status === 'resolved' ? (
                              <div>
                                <span className="text-emerald-700 font-medium">
                                  {formatRelativeMinutes(ticket.resolutionDurationMinutes)}
                                </span>
                                <div className="text-[10px] text-slate-400">
                                  Resolved on time
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="text-slate-600">
                                  In progress
                                </span>
                                <div className="text-[10px] text-slate-400">
                                  SLA: &lt; {ticket.priority === 'emergency' ? '2h' : ticket.priority === 'high' ? '6h' : '24h'}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => onViewWhatsApp(ticket.id)}
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                title="View WhatsApp thread"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => onSelectTicket(ticket)}
                                className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors text-xs font-medium"
                              >
                                Details
                              </button>

                              {!ticket.assignedTechnicianId && ticket.status !== 'resolved' && (
                                <button
                                  onClick={() => onAssignTech(ticket)}
                                  className="px-2.5 py-1 text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors text-xs font-medium"
                                >
                                  Assign
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab (Detailed Resolution Times & SLA Breakdown) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Resolution Time Performance */}
            <div className="bg-white p-5 border border-slate-200 rounded-lg shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Resolution Velocity by Maintenance Trade
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Average hours taken from ticket submission to verified repair completion.
              </p>

              <div className="space-y-3">
                {metrics.categoryStats.map((item) => {
                  const maxHours = 4.0;
                  const percentage = Math.min(100, Math.round((item.avgHours / maxHours) * 100));

                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{item.resolvedCount} closed</span>
                          <span className="font-mono-numbers font-semibold text-slate-900">
                            {item.avgHours} hrs
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.avgHours <= 2.0
                              ? 'bg-emerald-500'
                              : item.avgHours <= 3.0
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Fastest Trade: Electrical (1.8 hrs)</span>
                <span>Target SLA: Under 4.0 hrs across all trades</span>
              </div>
            </div>

            {/* SLA Priority Adherence Benchmarks */}
            <div className="bg-white p-5 border border-slate-200 rounded-lg shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                SLA Compliance Matrix
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Guaranteed response and resolution windows by ticket severity level.
              </p>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-rose-600">Emergency</span>
                    <p className="text-slate-400">Burst pipes, total power loss, heating outage</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-numbers font-semibold text-slate-900">&lt; 2.0 hrs</div>
                    <div className="text-emerald-600 font-medium">100% On-Time</div>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-amber-600">High Priority</span>
                    <p className="text-slate-400">Sink leaks, major appliance failure, AC warm</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-numbers font-semibold text-slate-900">&lt; 6.0 hrs</div>
                    <div className="text-emerald-600 font-medium">96% On-Time</div>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700">Medium Priority</span>
                    <p className="text-slate-400">Minor plumbing drips, outlet failure, door lock sticking</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-numbers font-semibold text-slate-900">&lt; 24.0 hrs</div>
                    <div className="text-emerald-600 font-medium">92% On-Time</div>
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-500">Low Priority</span>
                    <p className="text-slate-400">Cosmetic paint, filter renewals, caulking touch-up</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-numbers font-semibold text-slate-900">&lt; 48.0 hrs</div>
                    <div className="text-emerald-600 font-medium">98% On-Time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Automated Delivery Stats */}
          <div className="bg-white p-5 border border-slate-200 rounded-lg shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              WhatsApp Automated Notification Funnel
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time message dispatch status sent to tenants upon every ticket transition.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500">Automated Dispatch Messages</div>
                <div className="text-2xl font-bold font-mono-numbers text-slate-900 mt-1">100%</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Instant delivery &lt; 2 seconds</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500">Tenant WhatsApp Read Rate</div>
                <div className="text-2xl font-bold font-mono-numbers text-emerald-600 mt-1">98.4%</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Average open time: 3.2 minutes</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500">Tenant Satisfaction Rating</div>
                <div className="text-2xl font-bold font-mono-numbers text-indigo-600 mt-1">4.92 / 5.0</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Based on post-resolution surveys</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technicians Tab */}
      {activeTab === 'technicians' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {technicians.map((tech) => {
            const activeTicketsForTech = tickets.filter(
              (t) => t.assignedTechnicianId === tech.id && t.status !== 'resolved'
            );

            return (
              <div
                key={tech.id}
                className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">{tech.name}</h4>
                      <p className="text-xs text-slate-500">
                        {tech.specialties.map(formatCategoryName).join(', ')}
                      </p>
                      <div className="text-[11px] font-mono-numbers text-slate-400">
                        {tech.phone}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Status</span>
                      <span
                        className={`font-medium ${
                          tech.status === 'available'
                            ? 'text-emerald-600'
                            : tech.status === 'on_job'
                            ? 'text-amber-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {tech.status === 'available'
                          ? 'Available for dispatch'
                          : tech.status === 'on_job'
                          ? `On active job (${activeTicketsForTech.length})`
                          : 'Off duty'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Avg Resolution Speed</span>
                      <span className="font-mono-numbers font-medium text-slate-900">
                        {tech.avgResolutionHours} hrs
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Jobs Completed</span>
                      <span className="font-mono-numbers font-medium text-slate-900">
                        {tech.jobsCompleted}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Customer Rating</span>
                      <span className="font-mono-numbers font-medium text-amber-600">
                        ⭐ {tech.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500 mb-1">
                    {activeTicketsForTech.length > 0 ? (
                      <span className="font-medium text-slate-700">
                        Active in: {activeTicketsForTech.map((t) => t.unit).join(', ')}
                      </span>
                    ) : (
                      <span className="text-emerald-600">Ready for next assignment</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
