import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { InventoryItem, TicketCategory } from '../types';
import {
  formatCategoryName,
  formatCurrency,
  formatDateTime,
} from '../utils/formatters';
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  RefreshCw,
  ArrowDownRight,
  TrendingDown,
  Layers,
  Archive,
} from 'lucide-react';

interface InventoryManagerProps {
  onOpenAddModal: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ onOpenAddModal }) => {
  const { inventory, tickets, restockInventoryItem, lowStockItems } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [restockSuccessId, setRestockSuccessId] = useState<string | null>(null);

  // Compute inventory KPIs
  const stats = useMemo(() => {
    const totalValuation = inventory.reduce((acc, item) => acc + item.stock * item.unitCost, 0);
    const totalUnits = inventory.reduce((acc, item) => acc + item.stock, 0);

    // Compute parts used in work orders
    const allUsedParts: {
      ticketId: string;
      unit: string;
      partName: string;
      quantity: number;
      unitCost: number;
      date: string;
    }[] = [];

    tickets.forEach((t) => {
      t.partsUsed.forEach((p) => {
        allUsedParts.push({
          ticketId: t.id,
          unit: t.unit,
          partName: p.partName,
          quantity: p.quantity,
          unitCost: p.unitCost,
          date: t.startedAt || t.createdAt,
        });
      });
    });

    const totalPartsCostUsed = allUsedParts.reduce(
      (acc, item) => acc + item.quantity * item.unitCost,
      0
    );

    return {
      totalValuation,
      totalUnits,
      allUsedParts,
      totalPartsCostUsed,
    };
  }, [inventory, tickets]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [inventory, searchQuery, categoryFilter]);

  const handleQuickRestock = (id: string, amount: number) => {
    restockInventoryItem(id, amount);
    setRestockSuccessId(id);
    setTimeout(() => setRestockSuccessId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Maintenance Inventory & Parts Warehouse
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Central Maintenance Depot · Bay 4</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">{inventory.length} Active SKUs</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Work Order Stock Deduction</span>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Part SKU</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Total Warehouse Value</div>
          <div className="text-3xl font-bold font-mono-numbers text-slate-900">
            {formatCurrency(stats.totalValuation)}
          </div>
          <div className="text-xs text-slate-400 mt-2 font-mono-numbers">
            {stats.totalUnits} items in physical stock
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Low Stock Alerts</div>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-3xl font-bold font-mono-numbers ${
                lowStockItems.length > 0 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {lowStockItems.length}
            </span>
            <span className="text-xs text-slate-500">
              Min threshold breached
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Automated reorder triggers ready
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Parts Used (This Month)</div>
          <div className="text-3xl font-bold font-mono-numbers text-slate-900">
            {stats.allUsedParts.length}
            <span className="text-lg font-normal text-slate-500 ml-1">items</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Allocated across {tickets.filter((t) => t.partsUsed.length > 0).length} tickets
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Parts Cost Allocated</div>
          <div className="text-3xl font-bold font-mono-numbers text-slate-900">
            {formatCurrency(stats.totalPartsCostUsed)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Billed to property operations
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Attention: {lowStockItems.length} Critical Items Below Reorder Point
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  The following items have dropped to or below minimum buffer: {lowStockItems.map((i) => `${i.name} (${i.stock} left)`).join(', ')}.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                lowStockItems.forEach((i) => handleQuickRestock(i.id, 10));
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold whitespace-nowrap self-start sm:self-auto shadow-xs"
            >
              Restock All (+10 each)
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search parts by name, SKU, or aisle location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Filter parts by Trade"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Trade Categories</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="hvac">HVAC</option>
            <option value="appliance">Appliance</option>
            <option value="carpentry">Carpentry</option>
          </select>

          {(searchQuery || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              className="text-xs text-slate-500 hover:text-slate-900 underline px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="py-3 px-4">SKU & Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Warehouse Location</th>
                <th className="py-3 px-4 text-center">In Stock / Min</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-right">Total Value</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No inventory items match your search.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLow = item.stock <= item.minThreshold;
                  const isSuccess = restockSuccessId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isLow ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* SKU & Name */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{item.name}</div>
                        <div className="text-[11px] font-mono-numbers text-slate-400 mt-0.5">
                          {item.sku}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-700">
                        {formatCategoryName(item.category)}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-slate-600 font-mono-numbers">
                        {item.location}
                      </td>

                      {/* Stock vs Min */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`font-mono-numbers font-bold text-sm ${
                              isLow ? 'text-amber-600' : 'text-slate-900'
                            }`}
                          >
                            {item.stock}
                          </span>
                          <span className="text-slate-400 text-xs">/</span>
                          <span className="font-mono-numbers text-xs text-slate-500">
                            {item.minThreshold} {item.unit}
                          </span>
                        </div>
                        {isLow && (
                          <div className="text-[10px] text-amber-600 font-medium">
                            Low Buffer
                          </div>
                        )}
                      </td>

                      {/* Unit Cost */}
                      <td className="py-3 px-4 text-right font-mono-numbers text-slate-700">
                        {formatCurrency(item.unitCost)}
                      </td>

                      {/* Total Value */}
                      <td className="py-3 px-4 text-right font-mono-numbers font-medium text-slate-900">
                        {formatCurrency(item.stock * item.unitCost)}
                      </td>

                      {/* Supplier & Restock */}
                      <td className="py-3 px-4">
                        <div className="text-slate-700">{item.supplier}</div>
                        <div className="text-[10px] text-slate-400 font-mono-numbers">
                          Restocked: {item.lastRestocked}
                        </div>
                      </td>

                      {/* Quick Restock Action Buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleQuickRestock(item.id, 5)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-mono-numbers transition-colors"
                            title="Add 5 units"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleQuickRestock(item.id, 10)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-mono-numbers transition-colors"
                            title="Add 10 units"
                          >
                            +10
                          </button>
                          {isSuccess && (
                            <span className="text-emerald-600 text-[11px] font-medium ml-1">
                              Added!
                            </span>
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

      {/* Parts Usage Ledger (Audit Trail linked to work orders) */}
      <div className="bg-white p-5 border border-slate-200 rounded-lg shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Recent Inventory Allocation by Work Order
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Direct audit log of parts deducted when technicians fulfill maintenance requests.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">Part Checked Out</th>
                <th className="py-2.5 px-3 text-center">Quantity</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.allUsedParts.map((usage, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-mono-numbers font-medium text-slate-900">
                    {usage.ticketId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">{usage.unit}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{usage.partName}</td>
                  <td className="py-2.5 px-3 text-center font-mono-numbers text-slate-800">
                    {usage.quantity}x
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-numbers text-slate-600">
                    {formatCurrency(usage.unitCost)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-numbers font-semibold text-slate-900">
                    {formatCurrency(usage.quantity * usage.unitCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
