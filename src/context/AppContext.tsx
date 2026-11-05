import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Ticket,
  Technician,
  InventoryItem,
  WhatsAppMessage,
  ActiveView,
  TicketCategory,
  Priority,
  TicketStatus,
} from '../types';
import {
  INITIAL_TECHNICIANS,
  INITIAL_TICKETS,
  INITIAL_INVENTORY,
  INITIAL_MESSAGES,
} from '../data/mockData';
import {
  generateTicketCreatedMessage,
  generateTechAssignedMessage,
  generateStatusUpdateMessage,
  generateResolvedMessage,
  generateInventoryCheckoutMessage,
} from '../utils/whatsapp';

interface AppContextType {
  tickets: Ticket[];
  technicians: Technician[];
  inventory: InventoryItem[];
  messages: WhatsAppMessage[];
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  currentTechId: string;
  setCurrentTechId: (id: string) => void;
  currentTenantPhone: string;
  setCurrentTenantPhone: (phone: string) => void;
  // Ticket actions
  createTicket: (data: {
    unit: string;
    building: string;
    tenantName: string;
    tenantPhone: string;
    category: TicketCategory;
    title: string;
    description: string;
    priority: Priority;
    preferredTime: string;
    imageUrl?: string;
  }) => Ticket;
  assignTechnician: (ticketId: string, technicianId: string) => void;
  updateTicketStatus: (
    ticketId: string,
    status: TicketStatus,
    notes?: string,
    rating?: number,
    feedback?: string
  ) => void;
  checkoutPartsForTicket: (
    ticketId: string,
    items: { inventoryItemId: string; quantity: number }[]
  ) => void;
  // Inventory actions
  restockInventoryItem: (id: string, amount: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastRestocked'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  // WhatsApp actions
  sendDirectWhatsAppMessage: (
    ticketId: string,
    recipientPhone: string,
    recipientName: string,
    sender: 'system' | 'technician' | 'tenant',
    senderName: string,
    text: string
  ) => void;
  resetAllData: () => void;
  // Helper getters
  lowStockItems: InventoryItem[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TICKETS: 'fixflow_tickets_v1',
  TECHNICIANS: 'fixflow_technicians_v1',
  INVENTORY: 'fixflow_inventory_v1',
  MESSAGES: 'fixflow_messages_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TECHNICIANS);
    return saved ? JSON.parse(saved) : INITIAL_TECHNICIANS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [messages, setMessages] = useState<WhatsAppMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [activeView, setActiveView] = useState<ActiveView>('admin');
  const [currentTechId, setCurrentTechId] = useState<string>('tech-1');
  const [currentTenantPhone, setCurrentTenantPhone] = useState<string>('+1 555-481-9023');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  const lowStockItems = inventory.filter((item) => item.stock <= item.minThreshold);

  // Create Ticket
  const createTicket = (data: {
    unit: string;
    building: string;
    tenantName: string;
    tenantPhone: string;
    category: TicketCategory;
    title: string;
    description: string;
    priority: Priority;
    preferredTime: string;
    imageUrl?: string;
  }): Ticket => {
    const newId = `TICK-${1043 + tickets.length}`;
    const newTicket: Ticket = {
      id: newId,
      ...data,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      partsUsed: [],
    };

    setTickets((prev) => [newTicket, ...prev]);

    // Dispatch automated WhatsApp notification
    const waText = generateTicketCreatedMessage(newTicket);
    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      ticketId: newId,
      recipientPhone: newTicket.tenantPhone,
      recipientName: newTicket.tenantName,
      sender: 'system',
      senderName: 'FixFlow Dispatch Bot',
      message: waText,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      type: 'status_update',
    };
    setMessages((prev) => [...prev, newMsg]);

    return newTicket;
  };

  // Assign Technician
  const assignTechnician = (ticketId: string, technicianId: string) => {
    const targetTicket = tickets.find((t) => t.id === ticketId);
    const targetTech = technicians.find((t) => t.id === technicianId);
    if (!targetTicket || !targetTech) return;

    const now = new Date().toISOString();

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              assignedTechnicianId: technicianId,
              assignedAt: now,
              status: t.status === 'submitted' ? 'assigned' : t.status,
            }
          : t
      )
    );

    // Update technician status to on_job
    setTechnicians((prev) =>
      prev.map((tech) =>
        tech.id === technicianId ? { ...tech, status: 'on_job' } : tech
      )
    );

    // Automated WhatsApp message to tenant
    const waText = generateTechAssignedMessage(targetTicket, targetTech);
    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      ticketId: ticketId,
      recipientPhone: targetTicket.tenantPhone,
      recipientName: targetTicket.tenantName,
      sender: 'system',
      senderName: 'FixFlow Dispatch Bot',
      message: waText,
      timestamp: now,
      status: 'delivered',
      type: 'status_update',
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  // Update Status & Resolution
  const updateTicketStatus = (
    ticketId: string,
    status: TicketStatus,
    notes?: string,
    rating?: number,
    feedback?: string
  ) => {
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    const now = new Date().toISOString();
    let durationMinutes = targetTicket.resolutionDurationMinutes;

    if (status === 'resolved' && !durationMinutes) {
      const createdTime = new Date(targetTicket.createdAt).getTime();
      const resolvedTime = new Date(now).getTime();
      const diffMin = Math.round((resolvedTime - createdTime) / (1000 * 60));
      // Cap minimum to reasonable realistic demonstration minutes (e.g., 45 - 180 min if created just now)
      durationMinutes = diffMin > 10 ? diffMin : 75;
    }

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status,
            startedAt: status === 'in_progress' && !t.startedAt ? now : t.startedAt,
            resolvedAt: status === 'resolved' ? now : t.resolvedAt,
            resolutionNotes: notes ?? t.resolutionNotes,
            resolutionDurationMinutes: durationMinutes,
            tenantRating: rating ?? t.tenantRating,
            tenantFeedback: feedback ?? t.tenantFeedback,
          };
        }
        return t;
      })
    );

    // If resolved, update tech's completed count
    if (status === 'resolved' && targetTicket.assignedTechnicianId) {
      setTechnicians((prev) =>
        prev.map((tech) =>
          tech.id === targetTicket.assignedTechnicianId
            ? { ...tech, jobsCompleted: tech.jobsCompleted + 1, status: 'available' }
            : tech
        )
      );
    }

    // Automated WhatsApp message
    const assignedTech = technicians.find((t) => t.id === targetTicket.assignedTechnicianId);
    let waText = '';
    if (status === 'resolved') {
      waText = generateResolvedMessage(
        { ...targetTicket, resolutionNotes: notes || targetTicket.resolutionNotes },
        assignedTech?.name
      );
    } else {
      waText = generateStatusUpdateMessage(targetTicket, status, notes);
    }

    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      ticketId: ticketId,
      recipientPhone: targetTicket.tenantPhone,
      recipientName: targetTicket.tenantName,
      sender: 'system',
      senderName: 'FixFlow Dispatch Bot',
      message: waText,
      timestamp: now,
      status: 'delivered',
      type: 'status_update',
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  // Checkout Parts (Technician using parts from inventory)
  const checkoutPartsForTicket = (
    ticketId: string,
    items: { inventoryItemId: string; quantity: number }[]
  ) => {
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    const usedPartsRecord: { part: InventoryItem; quantity: number }[] = [];

    // Deduct stock
    setInventory((prev) =>
      prev.map((inv) => {
        const itemUse = items.find((i) => i.inventoryItemId === inv.id);
        if (itemUse) {
          const newStock = Math.max(0, inv.stock - itemUse.quantity);
          usedPartsRecord.push({ part: inv, quantity: itemUse.quantity });
          return { ...inv, stock: newStock };
        }
        return inv;
      })
    );

    // Append to ticket partsUsed
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const newParts = items.map((i) => {
            const inv = inventory.find((x) => x.id === i.inventoryItemId);
            return {
              inventoryItemId: i.inventoryItemId,
              partName: inv?.name || 'Standard Replacement Part',
              quantity: i.quantity,
              unitCost: inv?.unitCost || 0,
            };
          });
          return {
            ...t,
            partsUsed: [...t.partsUsed, ...newParts],
          };
        }
        return t;
      })
    );

    // Send WhatsApp notification about parts checkout
    if (usedPartsRecord.length > 0) {
      const waText = generateInventoryCheckoutMessage(targetTicket, usedPartsRecord);
      const newMsg: WhatsAppMessage = {
        id: `msg-${Date.now()}`,
        ticketId: ticketId,
        recipientPhone: targetTicket.tenantPhone,
        recipientName: targetTicket.tenantName,
        sender: 'system',
        senderName: 'FixFlow Inventory Bot',
        message: waText,
        timestamp: new Date().toISOString(),
        status: 'delivered',
        type: 'status_update',
      };
      setMessages((prev) => [...prev, newMsg]);
    }
  };

  // Restock inventory item
  const restockInventoryItem = (id: string, amount: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              stock: item.stock + amount,
              lastRestocked: new Date().toISOString().split('T')[0],
            }
          : item
      )
    );
  };

  // Add new inventory item
  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'lastRestocked'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    setInventory((prev) => [newItem, ...prev]);
  };

  // Update existing inventory item
  const updateInventoryItem = (item: InventoryItem) => {
    setInventory((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  };

  // Send Direct / Custom WhatsApp message
  const sendDirectWhatsAppMessage = (
    ticketId: string,
    recipientPhone: string,
    recipientName: string,
    sender: 'system' | 'technician' | 'tenant',
    senderName: string,
    text: string
  ) => {
    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      ticketId,
      recipientPhone,
      recipientName,
      sender,
      senderName,
      message: text,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      type: sender === 'tenant' ? 'tenant_reply' : sender === 'technician' ? 'technician_ping' : 'status_update',
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.TECHNICIANS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    setTickets(INITIAL_TICKETS);
    setTechnicians(INITIAL_TECHNICIANS);
    setInventory(INITIAL_INVENTORY);
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <AppContext.Provider
      value={{
        tickets,
        technicians,
        inventory,
        messages,
        activeView,
        setActiveView,
        currentTechId,
        setCurrentTechId,
        currentTenantPhone,
        setCurrentTenantPhone,
        createTicket,
        assignTechnician,
        updateTicketStatus,
        checkoutPartsForTicket,
        restockInventoryItem,
        addInventoryItem,
        updateInventoryItem,
        sendDirectWhatsAppMessage,
        resetAllData,
        lowStockItems,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
