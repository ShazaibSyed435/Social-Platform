import { X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const colors = {
    info: 'border-brand-100 bg-brand-50 text-brand-700',
    success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    error: 'border-red-100 bg-red-50 text-red-700',
  };

  return (
    <div className={`fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-panel ${colors[type]}`}>
      <span className="leading-6">{message}</span>
      <button className="mt-0.5 rounded p-1 hover:bg-white/70" onClick={onClose} type="button">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
