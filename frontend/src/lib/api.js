const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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
  return handle(await fetch(`${API_URL}/api/courses`));
}

export async function fetchQuote(payload) {
  return handle(
    await fetch(`${API_URL}/api/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  );
}

export async function fetchAvailability() {
  return handle(await fetch(`${API_URL}/api/availability`));
}

export async function createPaypalOrder(payload) {
  return handle(
    await fetch(`${API_URL}/api/paypal/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  );
}

export async function capturePaypalOrder(orderId, booking) {
  return handle(
    await fetch(`${API_URL}/api/paypal/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, booking }),
    })
  );
}

export async function tutorLogin(email, password) {
  return handle(
    await fetch(`${API_URL}/api/tutor/login`, {
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
  return handle(await fetch(`${API_URL}/api/tutor/availability`, { headers: tutorHeaders() }));
}

export async function saveTutorAvailability(blocks) {
  return handle(
    await fetch(`${API_URL}/api/tutor/availability`, {
      method: 'PUT',
      headers: { ...tutorHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    })
  );
}

export async function fetchTutorBookings() {
  return handle(await fetch(`${API_URL}/api/tutor/bookings`, { headers: tutorHeaders() }));
}
