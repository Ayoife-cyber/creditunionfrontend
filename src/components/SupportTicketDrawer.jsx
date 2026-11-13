import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../api/client.js';
import { formatTelegramUrl, formatWhatsappUrl } from '../utils/contactConfig.js';

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

  const [contactSettings, setContactSettings] = useState({ telegramHandle: '', whatsappNumber: '', prefilledMessage: '' });

  useEffect(() => {
    if (open && (!user?.globalTelegramHandle || !user?.globalWhatsappNumber)) {
      authApi.getPublicSettings()
        .then(res => {
          if (res) {
            setContactSettings({
              telegramHandle: res.telegramHandle || '',
              whatsappNumber: res.whatsappNumber || '',
              prefilledMessage: res.prefilledMessage || '',
            });
          }
        })
        .catch(() => {});
    }
  }, [open, user?.globalTelegramHandle, user?.globalWhatsappNumber]);

  const telegramTarget = user?.globalTelegramHandle || contactSettings.telegramHandle || '';
  const whatsappTarget = user?.globalWhatsappNumber || contactSettings.whatsappNumber || '';
  const prefilledText  = user?.globalPrefilledMessage || contactSettings.prefilledMessage || 'Hello, I need assistance with my account support ticket.';

  const handleOpenWhatsApp = () => {
    const url = formatWhatsappUrl(whatsappTarget, prefilledText);
    window.open(url || 'https://wa.me/', '_blank', 'noopener,noreferrer');
  };

  const handleOpenTelegram = () => {
    const url = formatTelegramUrl(telegramTarget, prefilledText);
    window.open(url || 'https://t.me/', '_blank', 'noopener,noreferrer');
  };

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
      <div className="support-drawer w-full max-w-md bg-slate-900 border-l border-white/10 shadow-2xl overflow-y-auto">
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
            <div className="space-y-5">
              {/* Instant Channels Callout */}
              <div
                className="p-3.5 rounded-2xl"
                style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.18)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                    Instant Live Assistance
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online 24/7
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Need an urgent answer? Chat directly with an authorized representative:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all cursor-pointer group"
                    style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.25)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.12)'}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-white">WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenTelegram}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all cursor-pointer group"
                    style={{ background: 'rgba(34,158,217,0.12)', border: '1px solid rgba(34,158,217,0.25)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,158,217,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,158,217,0.12)'}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#229ED9] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.56 8.16l-2.02 9.54c-.15.68-.56.84-1.12.52l-3.08-2.27-1.49 1.43c-.16.17-.3.3-.62.3l.22-3.13 5.7-5.15c.25-.22-.05-.34-.38-.12l-7.05 4.44-3.04-.95c-.66-.21-.67-.66.14-.98l11.89-4.58c.55-.2 1.03.13.85.95z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-white">Telegram</span>
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-white/10" />
                <span className="absolute px-3 text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-slate-500">
                  Or submit ticket
                </span>
              </div>

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
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
