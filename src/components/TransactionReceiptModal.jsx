// Transaction detail / receipt modal
// Tapping any transaction row opens this with full details + a download option

import { useRef } from 'react';

const STATUS_STYLE = {
  completed: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', color: '#10B981', label: 'Completed' },
  pending:   { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  color: '#F59E0B', label: 'Pending'   },
  failed:    { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   color: '#EF4444', label: 'Failed'    },
};

const TYPE_ICON = {
  deposit:    'M7 11l5-5m0 0l5 5m-5-5v12',
  withdrawal: 'M17 13l-5 5m0 0l-5-5m5 5V6',
  crypto:     'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  swap:       'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
};

function generateRef(id) {
  // deterministic short ref from id
  const base = String(id || Math.random()).replace(/\D/g, '').padStart(6, '0');
  return `TXN-${base.slice(-6).toUpperCase()}${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

export default function TransactionReceiptModal({ tx, onClose }) {
  const receiptRef = useRef(null);
  if (!tx) return null;

  const status = STATUS_STYLE[tx.status] || STATUS_STYLE.completed;
  const ref    = generateRef(tx.id);
  const icon   = TYPE_ICON[tx.type] || TYPE_ICON.deposit;
  const isCredit = tx.tag === 'deposit' || String(tx.amount).startsWith('+');

  async function handleDownload() {
    // Lazy-load jsPDF so it doesn't bloat the initial bundle
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a5' });
    const W = doc.internal.pageSize.getWidth();

    // Header bar
    doc.setFillColor(10, 22, 40);
    doc.rect(0, 0, W, 80, 'F');
    doc.setTextColor(241, 245, 249);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SHUGHAR Credit Union', W / 2, 35, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Transaction Receipt', W / 2, 54, { align: 'center' });

    // Status badge area
    doc.setFillColor(isCredit ? 16 : 239, isCredit ? 185 : 68, isCredit ? 129 : 68, 0.15);
    doc.roundedRect(W / 2 - 50, 88, 100, 22, 4, 4, 'F');
    doc.setTextColor(isCredit ? 16 : 239, isCredit ? 185 : 68, isCredit ? 129 : 68);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(tx.status.toUpperCase(), W / 2, 103, { align: 'center' });

    // Amount
    doc.setTextColor(241, 245, 249);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(tx.amount, W / 2, 145, { align: 'center' });

    // Divider
    doc.setDrawColor(30, 41, 59);
    doc.line(40, 160, W - 40, 160);

    // Details table
    const rows = [
      ['Transaction ID', ref],
      ['Description',    tx.label],
      ['Type',           tx.type.charAt(0).toUpperCase() + tx.type.slice(1)],
      ['Date & Time',    tx.date],
      ['Status',         status.label],
    ];

    let y = 185;
    doc.setFontSize(9);
    rows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(label, 50, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(226, 232, 240);
      doc.text(String(value), W - 50, y, { align: 'right' });
      y += 26;
    });

    // Footer
    doc.setDrawColor(30, 41, 59);
    doc.line(40, y + 10, W - 40, y + 10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('This is an auto-generated receipt. For disputes contact support@shughar.com', W / 2, y + 26, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, W / 2, y + 40, { align: 'center' });

    doc.save(`Shughar-Receipt-${ref}.pdf`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        ref={receiptRef}
        className="relative z-10 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl animate-slideInUp"
        style={{ background: '#0D1F35', border: '1px solid rgba(6,182,212,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-display font-bold text-slate-100 text-base">Transaction Receipt</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Icon + amount */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: `${tx.color}18`, border: `1px solid ${tx.color}30` }}
            >
              <svg className="w-6 h-6" fill="none" stroke={tx.color} strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </div>
            <p className="font-display text-3xl font-extrabold" style={{ color: tx.color }}>{tx.amount}</p>
            <p className="text-sm text-slate-400 mt-1">{tx.label}</p>

            {/* Status badge */}
            <div
              className="mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
              style={{ background: status.bg, border: `1px solid ${status.border}`, color: status.color }}
            >
              {status.label}
            </div>
          </div>

          {/* Detail rows */}
          <div className="space-y-3 mb-5">
            {[
              { label: 'Reference',  value: ref },
              { label: 'Type',       value: tx.type.charAt(0).toUpperCase() + tx.type.slice(1) },
              { label: 'Date',       value: tx.date },
              { label: 'Direction',  value: isCredit ? 'Credit (incoming)' : 'Debit (outgoing)' },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-xs font-semibold text-slate-200">{value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all hover-scale"
              style={{ background: 'linear-gradient(135deg, #0369A1, #06B6D4)', boxShadow: '0 4px 16px rgba(6,182,212,0.25)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold text-slate-300 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
