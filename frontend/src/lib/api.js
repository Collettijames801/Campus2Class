export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function bookingCalendarUrl(booking) {
  return `${API_URL}/api/bookings/${encodeURIComponent(booking.id)}/calendar.ics?token=${encodeURIComponent(booking.calendar_token)}`;
}
const REQUEST_TIMEOUT_MS = 12000;

async function request(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The request timed out. Check the connection and try again.');
    throw new Error('Unable to reach Campus2Class. Check your connection and try again.');
  } finally {
    clearTimeout(timeout);
  }
}

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export async function fetchCourses() {
  return handle(await request(`${API_URL}/api/courses`));
}

export async function fetchQuote(payload) {
  return handle(
    await request(`${API_URL}/api/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  );
}

export async function fetchClientHistory(email) {
  return handle(await request(`${API_URL}/api/client/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  }));
}

export async function fetchAvailability() {
  return handle(await request(`${API_URL}/api/availability`));
}

export async function createPaypalOrder(payload) {
  return handle(
    await request(`${API_URL}/api/paypal/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  );
}

export async function capturePaypalOrder(orderId, booking) {
  return handle(
    await request(`${API_URL}/api/paypal/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, booking }),
    })
  );
}

export async function tutorLogin(email, password) {
  return handle(
    await request(`${API_URL}/api/tutor/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  );
}

function tutorHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('tutorToken') || ''}` };
}

export async function fetchTutorAvailability() {
  return handle(await request(`${API_URL}/api/tutor/availability`, { headers: tutorHeaders() }));
}

export async function saveTutorAvailability(blocks) {
  return handle(
    await request(`${API_URL}/api/tutor/availability`, {
      method: 'PUT',
      headers: { ...tutorHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    })
  );
}

export async function fetchTutorBookings() {
  return handle(await request(`${API_URL}/api/tutor/bookings`, { headers: tutorHeaders() }));
}
