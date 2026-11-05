import { Ticket, Technician, InventoryItem } from '../types';

export function formatWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

export function generateTicketCreatedMessage(ticket: Ticket): string {
  return (
    `🔧 *FixFlow Maintenance Update*\n\n` +
    `Hello ${ticket.tenantName}!\n` +
    `Your maintenance request *#${ticket.id}* has been logged.\n\n` +
    `🏢 Location: ${ticket.unit}, ${ticket.building}\n` +
    `📌 Issue: ${ticket.title}\n` +
    `⚡ Priority: ${ticket.priority.toUpperCase()}\n` +
    `⏰ Preferred Hours: ${ticket.preferredTime}\n\n` +
    `Our dispatch team will assign a technician shortly. Updates will arrive here automatically!`
  );
}

export function generateTechAssignedMessage(ticket: Ticket, technician: Technician): string {
  return (
    `👷 *Technician Dispatched!*\n\n` +
    `Good news ${ticket.tenantName}! *${technician.name}* (${technician.specialties.join(', ').toUpperCase()} · ⭐ ${technician.rating}) has been assigned to ticket *#${ticket.id}*.\n\n` +
    `📞 Direct Contact: ${technician.phone}\n` +
    `Status: Work order queued for dispatch.`
  );
}

export function generateStatusUpdateMessage(ticket: Ticket, newStatus: string, notes?: string): string {
  const statusDisplay: Record<string, string> = {
    in_progress: '🔨 Work is currently IN PROGRESS on site',
    parts_pending: '📦 Technician is retrieving parts from building inventory',
    resolved: '✅ Work Order RESOLVED and complete',
  };

  let msg = `📋 *Ticket Update: #${ticket.id}*\n\nStatus: *${statusDisplay[newStatus] || newStatus}*`;
  if (notes) {
    msg += `\n\nNotes from Technician: "${notes}"`;
  }
  return msg;
}

export function generateResolvedMessage(ticket: Ticket, technicianName?: string): string {
  return (
    `🎉 *Maintenance Completed!*\n\n` +
    `Ticket *#${ticket.id}* (${ticket.title}) for ${ticket.unit} has been marked as *RESOLVED* by ${technicianName || 'our technician'}.\n\n` +
    `📝 Work Summary: ${ticket.resolutionNotes || 'All repairs tested and verified.'}\n\n` +
    `Please rate your technician's service (1-5 stars) to help us maintain high service standards!`
  );
}

export function generateInventoryCheckoutMessage(ticket: Ticket, parts: { part: InventoryItem; quantity: number }[]): string {
  const partsList = parts.map(p => `• ${p.quantity}x ${p.part.name} (${p.part.sku})`).join('\n');
  return (
    `📦 *Inventory Checked Out for #${ticket.id}*\n\n` +
    `The following parts were allocated from warehouse:\n${partsList}\n\n` +
    `Stock deducted automatically.`
  );
}
