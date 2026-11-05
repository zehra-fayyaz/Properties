import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AdminDashboard } from './components/AdminDashboard';
import { TenantPortal } from './components/TenantPortal';
import { TechnicianView } from './components/TechnicianView';
import { InventoryManager } from './components/InventoryManager';
import { WhatsAppHub } from './components/WhatsAppHub';
import { AssignTechnicianModal } from './components/AssignTechnicianModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { AddInventoryModal } from './components/AddInventoryModal';
import { NewTicketModal } from './components/NewTicketModal';
import { Ticket } from './types';
import { RotateCcw } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, setActiveView, resetAllData } = useApp();

  // Modal states
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [selectedTicketForAssign, setSelectedTicketForAssign] = useState<Ticket | null>(null);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<Ticket | null>(null);
  const [whatsAppFocusTicketId, setWhatsAppFocusTicketId] = useState<string | undefined>(undefined);

  const handleViewWhatsApp = (ticketId: string) => {
    setWhatsAppFocusTicketId(ticketId);
    setActiveView('whatsapp');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 3-zone Top Bar Contract Header */}
      <Header onOpenNewTicket={() => setIsNewTicketOpen(true)} />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'admin' && (
          <AdminDashboard
            onSelectTicket={(ticket) => setSelectedTicketForDetail(ticket)}
            onAssignTech={(ticket) => setSelectedTicketForAssign(ticket)}
            onViewWhatsApp={handleViewWhatsApp}
          />
        )}

        {activeView === 'tenant' && (
          <TenantPortal onViewWhatsApp={handleViewWhatsApp} />
        )}

        {activeView === 'technician' && (
          <TechnicianView onViewWhatsApp={handleViewWhatsApp} />
        )}

        {activeView === 'inventory' && (
          <InventoryManager onOpenAddModal={() => setIsAddInventoryOpen(true)} />
        )}

        {activeView === 'whatsapp' && (
          <WhatsAppHub initialTicketId={whatsAppFocusTicketId} />
        )}
      </main>

      {/* Modals */}
      {isNewTicketOpen && (
        <NewTicketModal
          onClose={() => setIsNewTicketOpen(false)}
          onCreated={(ticketId) => {
            setWhatsAppFocusTicketId(ticketId);
          }}
        />
      )}

      {isAddInventoryOpen && (
        <AddInventoryModal onClose={() => setIsAddInventoryOpen(false)} />
      )}

      {selectedTicketForAssign && (
        <AssignTechnicianModal
          ticket={selectedTicketForAssign}
          onClose={() => setSelectedTicketForAssign(null)}
          onAssigned={() => {}}
        />
      )}

      {selectedTicketForDetail && (
        <TicketDetailModal
          ticket={selectedTicketForDetail}
          onClose={() => setSelectedTicketForDetail(null)}
          onAssignTech={(ticket) => {
            setSelectedTicketForDetail(null);
            setSelectedTicketForAssign(ticket);
          }}
          onViewWhatsApp={handleViewWhatsApp}
        />
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-900">FixFlow</span>
            <span className="mx-2">·</span>
            <span>Automated Maintenance Dispatch & WhatsApp Notification System</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (window.confirm('Reset all demo data back to clean initial state?')) {
                  resetAllData();
                }
              }}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors"
              title="Reset demonstration data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
            <span>·</span>
            <span>Resolution SLA Target: &lt; 4.0 hrs</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
