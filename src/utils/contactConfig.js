/**
 * Contact & Support Channels Configuration (Telegram & WhatsApp)
 * Provides URL formatting and link handlers with prefilled support messages.
 */

export const DEFAULT_TELEGRAM_HANDLE = '';
export const DEFAULT_WHATSAPP_NUMBER = '';
export const DEFAULT_PREFILLED_MESSAGE = 'Hello, I need assistance with my account.';

/**
 * Formats a Telegram input (phone number, username, or link) with an optional prefilled message.
 * Supports:
 * - "+16162389105" or "@+16162389105" -> "https://t.me/+16162389105?text=..."
 * - "@support" or "support" -> "https://t.me/support?text=..."
 * - "https://t.me/support" -> "https://t.me/support?text=..."
 */
export function formatTelegramUrl(input, prefilledText = DEFAULT_PREFILLED_MESSAGE) {
  if (!input) return '';
  const trimmed = String(input).trim();
  if (!trimmed) return '';

  let baseUrl = '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    baseUrl = trimmed;
  } else if (trimmed.startsWith('t.me/')) {
    baseUrl = `https://${trimmed}`;
  } else {
    // Strip leading @ (e.g. '@+16162389105' or '@username')
    const clean = trimmed.replace(/^@/, '').trim();

    if (clean.startsWith('+')) {
      const digits = clean.replace(/[^\d]/g, '');
      baseUrl = digits ? `https://t.me/+${digits}` : '';
    } else if (/^\d{8,15}$/.test(clean)) {
      baseUrl = `https://t.me/+${clean}`;
    } else {
      baseUrl = `https://t.me/${clean}`;
    }
  }

  if (!baseUrl) return '';

  if (prefilledText && typeof prefilledText === 'string' && prefilledText.trim()) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}text=${encodeURIComponent(prefilledText.trim())}`;
  }

  return baseUrl;
}

/**
 * Formats a WhatsApp phone number into a wa.me URL with a prefilled direct message.
 */
export function formatWhatsappUrl(input, prefilledText = DEFAULT_PREFILLED_MESSAGE) {
  if (!input) return '';
  const trimmed = String(input).trim();
  if (!trimmed) return '';

  let baseUrl = '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    baseUrl = trimmed;
  } else if (trimmed.startsWith('wa.me/')) {
    baseUrl = `https://${trimmed}`;
  } else {
    // Extract digits only
    const digits = trimmed.replace(/[^\d]/g, '');
    if (!digits) return '';
    baseUrl = `https://wa.me/${digits}`;
  }

  if (!baseUrl) return '';

  if (prefilledText && typeof prefilledText === 'string' && prefilledText.trim()) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}text=${encodeURIComponent(prefilledText.trim())}`;
  }

  return baseUrl;
}
