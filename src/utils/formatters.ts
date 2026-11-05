import { Priority, TicketCategory, TicketStatus } from '../types';

export function formatCategoryName(category: TicketCategory): string {
  switch (category) {
    case 'plumbing':
      return 'Plumbing';
    case 'electrical':
      return 'Electrical';
    case 'hvac':
      return 'HVAC & Climate';
    case 'appliance':
      return 'Appliances';
    case 'carpentry':
      return 'Carpentry & Locks';
    case 'general':
      return 'General Building';
    default:
      return category;
  }
}

export function formatPriority(priority: Priority): { label: string; textClass: string } {
  switch (priority) {
    case 'emergency':
      return { label: 'Emergency', textClass: 'text-rose-600 font-semibold' };
    case 'high':
      return { label: 'High Priority', textClass: 'text-amber-600 font-semibold' };
    case 'medium':
      return { label: 'Medium', textClass: 'text-slate-700 font-medium' };
    case 'low':
      return { label: 'Low', textClass: 'text-slate-500 font-medium' };
  }
}

export function formatStatus(status: TicketStatus): { label: string; textClass: string } {
  switch (status) {
    case 'submitted':
      return { label: 'Submitted', textClass: 'text-blue-600 font-medium' };
    case 'assigned':
      return { label: 'Dispatched', textClass: 'text-indigo-600 font-medium' };
    case 'in_progress':
      return { label: 'In Progress', textClass: 'text-amber-600 font-medium' };
    case 'parts_pending':
      return { label: 'Parts Pending', textClass: 'text-purple-600 font-medium' };
    case 'resolved':
      return { label: 'Resolved', textClass: 'text-emerald-600 font-medium' };
    case 'cancelled':
      return { label: 'Cancelled', textClass: 'text-slate-400 font-medium' };
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function formatRelativeMinutes(minutes?: number): string {
  if (!minutes) return 'Pending';
  if (minutes < 60) return `${minutes} min`;
  const hours = (minutes / 60).toFixed(1);
  return `${hours} hrs`;
}
