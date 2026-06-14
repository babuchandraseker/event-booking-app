export const BOOKING_CONTEXT_EVENT = 'vn_booking_context_changed';

function notifyBookingContextChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(BOOKING_CONTEXT_EVENT));
  }
}

export function clearQuickReserveContext() {
  try {
    const existing = JSON.parse(sessionStorage.getItem('vn_booking_context') || '{}');
    const rest = { ...existing };

    delete rest.quickReserve;
    delete rest.date;
    delete rest.dateInput;
    delete rest.slot;
    delete rest.phone;
    delete rest.whatsapp;

    if (Object.keys(rest).length > 0) {
      sessionStorage.setItem('vn_booking_context', JSON.stringify(rest));
    } else {
      sessionStorage.removeItem('vn_booking_context');
    }
  } catch {
    sessionStorage.removeItem('vn_booking_context');
  }

  notifyBookingContextChanged();
}
