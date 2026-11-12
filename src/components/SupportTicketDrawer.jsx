import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function SupportTicketDrawer({ open, onClose }) {
  const { user } = useAuth() || {};

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketRef, setTicketRef] = useState('');
  const [copied, setCopied] = useState(false);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (open && !submitted) {
      setForm((prev) => ({
        name: prev.name || user?.fullName || '',
        email: prev.email || user?.email || '',
        phone: prev.phone || user?.mobileNumber || '',
        message: prev.message || '',
      }));
    }
  }, [open, user, submitted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyRef = async () => {
    if (!ticketRef) return;
    try {
      await navigator.clipboard.writeText(ticketRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setTicketRef('');
    setCopied(false);
    onClose();
  };

  const generateReferenceId = () => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `TCK-${randomDigits}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const refId = generateReferenceId();

    try {
      const response = await fetch('https://formspree.io/f/mdegnnpa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          referenceId: refId,
          ticketId: refId,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setTicketRef(refId);
        setSubmitted(true);
        setForm({ name: '', email: '', phone: '', message: '' });
      } else {
        alert('Failed to submit. Please try again.');
      }
    } catch (error) {
      alert('Error submitting form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Drawer Panel */}
      <div className="support-drawer w-full max-w-md max-w-[100vw] bg-slate-900 border-l border-white/10 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/95 backdrop-blur">
          <h2 className="font-display font-bold text-xl text-slate-100">Support Ticket</h2>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 animate-scaleIn">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-xl text-slate-100 mb-1">Ticket Submitted!</h3>
              <p className="text-slate-400 text-xs mb-5">Your support request has been logged with our team.</p>

              {/* Reference ID Card */}
              <div
                className="rounded-2xl p-4 mb-5 text-left transition-all"
                style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.25)' }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                    Ticket Reference ID
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy ID
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-mono font-bold text-white tracking-wider">
                    {ticketRef}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Please quote this reference ID whenever following up with our support team.
                </p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 mb-6 text-left flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-emerald-300 text-xs leading-relaxed">
                  An agent will review your issue and reach out to your email within 2 hours during business working hours.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent/50 transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent/50 transition-all"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-slate-300 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent/50 transition-all"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-semibold text-slate-300 mb-2">
                  Your Issue / Complaint
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  placeholder="Please describe your issue in detail..."
                  rows="5"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent/50 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
