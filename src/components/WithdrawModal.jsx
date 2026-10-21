export default function WithdrawModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md" onClick={onClose} />
      <div className="modal-card relative bg-[#1E293B] rounded-3xl p-6 w-full max-w-sm shadow-2xl z-10 border border-white/10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-100">Withdraw Funds</h3>
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
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-sm text-slate-300">
            Withdrawals are currently restricted for your account tier. Please contact support to upgrade your account and unlock withdrawals.
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
