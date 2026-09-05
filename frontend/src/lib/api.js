const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
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
