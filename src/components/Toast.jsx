const ICONS = {
  success: 'M5 13l4 4L19 7',
  error: 'M6 18L18 6M6 6l12 12',
  info: 'M13 16h-1v-4h-1m1-4h.01',
};

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-4 z-50">
      <div className={`flex items-center gap-2 bg-slate-800 border border-white/10 text-white text-sm px-4 py-3 rounded-2xl shadow-2xl max-w-xs ${toast.hiding ? 'toast-hide' : 'toast-show'}`}>
        <svg className={`w-4 h-4 flex-shrink-0 ${toast.type === 'success' ? 'text-emerald-400' : toast.type === 'error' ? 'text-brand-red' : 'text-brand-accent'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={toast.type === 'error' ? '2' : '2.5'} d={ICONS[toast.type] || ICONS.info} />
        </svg>
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}
