import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TicketCategory } from '../types';
import { X, Package, Plus } from 'lucide-react';

interface AddInventoryModalProps {
  onClose: () => void;
}

export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({ onClose }) => {
  const { addInventoryItem } = useApp();

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TicketCategory>('plumbing');
  const [stock, setStock] = useState(10);
  const [minThreshold, setMinThreshold] = useState(5);
  const [unitCost, setUnitCost] = useState(15.0);
  const [location, setLocation] = useState('Aisle 2 · Bin 05');
  const [supplier, setSupplier] = useState('Apex Plumbing Supply');
  const [unit, setUnit] = useState('pcs');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) return;

    addInventoryItem({
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      stock,
      minThreshold,
      unitCost,
      location: location.trim(),
      supplier: supplier.trim(),
      unit,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Add Inventory Part SKU</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Part SKU / Code</label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. PLM-VALVE-50"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono-numbers uppercase"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Part Name & Specification</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Brass 1/2-inch Angle Stop Valve"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Trade Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white"
              >
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="hvac">HVAC</option>
                <option value="appliance">Appliance</option>
                <option value="carpentry">Carpentry</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Unit of Measure</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="pcs / kits / packs"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Initial Stock</label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-mono-numbers"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Min Threshold</label>
              <input
                type="number"
                required
                min={1}
                value={minThreshold}
                onChange={(e) => setMinThreshold(parseInt(e.target.value) || 1)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-mono-numbers"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Unit Cost ($)</label>
              <input
                type="number"
                step="0.01"
                required
                min={0}
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-mono-numbers"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Warehouse Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Aisle 2 · Bin 08"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Supplier</label>
              <input
                type="text"
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Apex Plumbing Supply"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold transition-colors shadow-xs"
            >
              Add to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
