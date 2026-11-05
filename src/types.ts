export type TicketCategory =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'appliance'
  | 'carpentry'
  | 'general';

export type Priority = 'emergency' | 'high' | 'medium' | 'low';

export type TicketStatus =
  | 'submitted'
  | 'assigned'
  | 'in_progress'
  | 'parts_pending'
  | 'resolved'
  | 'cancelled';

export interface PartUsage {
  inventoryItemId: string;
  partName: string;
  quantity: number;
  unitCost: number;
}

export interface Ticket {
  id: string;
  unit: string;
  building: string;
  tenantName: string;
  tenantPhone: string;
  category: TicketCategory;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  imageUrl?: string;
  preferredTime: string;
  createdAt: string;
  assignedTechnicianId?: string;
  assignedAt?: string;
  startedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  resolutionDurationMinutes?: number;
  partsUsed: PartUsage[];
  tenantRating?: number;
  tenantFeedback?: string;
}

export interface Technician {
  id: string;
  name: string;
  specialties: TicketCategory[];
  phone: string;
  status: 'available' | 'on_job' | 'off_duty';
  avatar: string;
  rating: number;
  jobsCompleted: number;
  avgResolutionHours: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: TicketCategory;
  stock: number;
  minThreshold: number;
  unitCost: number;
  location: string;
  supplier: string;
  unit: string;
  lastRestocked: string;
}

export interface WhatsAppMessage {
  id: string;
  ticketId: string;
  recipientPhone: string;
  recipientName: string;
  sender: 'system' | 'technician' | 'tenant';
  senderName: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'status_update' | 'technician_ping' | 'tenant_reply' | 'completion';
}

export type ActiveView = 'admin' | 'tenant' | 'technician' | 'inventory' | 'whatsapp';
