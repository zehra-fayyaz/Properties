import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TicketCategory, Priority } from '../types';
import { X, Plus, Camera, CheckCircle2 } from 'lucide-react';

interface NewTicketModalProps {
  onClose: () => void;
  onCreated: (ticketId: string) => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ onClose, onCreated }) => {
  const { createTicket } = useApp();

  const [building, setBuilding] = useState('Elmwood Tower');
  const [unit, setUnit] = useState('Apt 3C');
  const [tenantName, setTenantName] = useState('Marcus Aurelius');
  const [tenantPhone, setTenantPhone] = useState('+1 555-920-1188');
  const [category, setCategory] = useState<TicketCategory>('plumbing');
  const [priority, setPriority] = useState<Priority>('high');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (9:00 AM - 12:00 PM)');
  const [hasPhoto, setHasPhoto] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newTicket = createTicket({
      building,
      unit,
      tenantName,
      tenantPhone,
      category,
      priority,
      title: title.trim(),
      description: description.trim(),
      preferredTime: `${preferredTime} · Entry permission granted`,
      imageUrl: hasPhoto
        ? '/images/maintenance-repair.jpg'
        : undefined,
    });

    onCreated(newTicket.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-slate-900" />
            <h3 className="text-sm font-bold text-slate-900">
              Submit New Maintenance Ticket
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Building</label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white"
              >
                <option value="Elmwood Tower">Elmwood Tower</option>
                <option value="Maple Court">Maple Court</option>
                <option value="Oak Ridge Suites">Oak Ridge Suites</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Unit Number</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Apt 3C"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tenant Name</label>
              <input
                type="text"
                required
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">WhatsApp Phone</label>
              <input
                type="tel"
                required
                value={tenantPhone}
                onChange={(e) => setTenantPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-mono-numbers"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Category</label>
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
              <label className="block font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white font-medium"
              >
                <option value="emergency">🚨 Emergency (&lt; 2 hrs)</option>
                <option value="high">High (&lt; 6 hrs)</option>
                <option value="medium">Medium (&lt; 24 hrs)</option>
                <option value="low">Low (&lt; 48 hrs)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Issue Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master bathroom sink drain clogged"
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide symptoms, location in apartment..."
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-700">Attach Sample Photo</span>
            </div>
            <button
              type="button"
              onClick={() => setHasPhoto(!hasPhoto)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                hasPhoto
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {hasPhoto ? '✓ Photo Attached' : '+ Attach'}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
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
              Submit & Send WhatsApp Notice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
