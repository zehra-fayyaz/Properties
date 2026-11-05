import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveView } from '../types';
import {
  Wrench,
  AlertTriangle,
  MessageSquare,
  Package,
  LayoutDashboard,
  UserCheck,
  Plus,
} from 'lucide-react';

interface HeaderProps {
  onOpenNewTicket: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewTicket }) => {
  const { activeView, setActiveView, lowStockItems, messages } = useApp();

  const navItems: { id: ActiveView; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'admin',
      label: 'Admin & SLA',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'tenant',
      label: 'Tenant Portal',
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      id: 'technician',
      label: 'Technician Field',
      icon: <Wrench className="w-4 h-4" />,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package className="w-4 h-4" />,
      badge: lowStockItems.length > 0 ? lowStockItems.length : undefined,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp Hub',
      icon: <MessageSquare className="w-4 h-4" />,
      badge: messages.length,
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold shadow-sm">
              <Wrench className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                FixFlow
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase -mt-1">
                Maintenance & WhatsApp Dispatch
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links / Segmented View Switcher */}
          <nav className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        item.id === 'inventory'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {lowStockItems.length > 0 && activeView !== 'inventory' && (
              <button
                onClick={() => setActiveView('inventory')}
                className="hidden xl:flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1.5 rounded-md hover:bg-amber-100 transition-colors"
                title={`${lowStockItems.length} parts below minimum stock threshold`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-medium">{lowStockItems.length} Low Stock</span>
              </button>
            )}

            <button
              onClick={onOpenNewTicket}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:bg-slate-950 transition-colors shadow-xs whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Issue</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
