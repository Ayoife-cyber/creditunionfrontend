export default function ComingSoonModal({ open, onClose, title, message }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md" onClick={onClose} />
      <div className="modal-card relative bg-[#1E293B] rounded-3xl p-6 w-full max-w-sm shadow-2xl z-10 border border-white/10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-100">{message ? title : 'Coming Soon'}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors border border-white/5"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/10 mb-4">
            <svg className="w-8 h-8 text-brand-accent opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm text-slate-300">
            {message || `${title} is currently under development. We'll have it ready for you soon!`}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-700 text-white font-semibold text-sm py-3 rounded-2xl hover:bg-slate-600 transition-all shadow-lg shadow-slate-900/20"
        >
          Close
        </button>
      </div>
    </div>
  );
}
