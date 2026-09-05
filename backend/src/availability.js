const db = require('./db');

// Weekly availability template. 0 = Sunday ... 6 = Saturday.
// These are just sensible defaults for a college student's schedule;
// easy to change as your class schedule changes.
const WEEKLY_TEMPLATE = {
  0: ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'], // Sunday afternoon
  1: ['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'], // Monday evening
  2: ['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'], // Tuesday
  3: ['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'], // Wednesday
  4: ['4:00 PM', '5:00 PM', '6:00 PM'], // Thursday
  5: [], // Friday - off
  6: ['10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'], // Saturday
};

const DAYS_AHEAD = 21;

function formatDateISO(d) {
  return d.toISOString().slice(0, 10);
}

function getAvailability() {
  const bookedStmt = db.prepare(
    `SELECT session_date, session_time FROM bookings WHERE payment_status = 'paid'`
  );
  const booked = new Set(
    bookedStmt.all().map((b) => `${b.session_date}|${b.session_time}`)
  );

  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    const template = WEEKLY_TEMPLATE[dow] || [];
    if (template.length === 0) continue;

    const iso = formatDateISO(d);
    const slots = template.filter((t) => !booked.has(`${iso}|${t}`));
    if (slots.length > 0) {
      days.push({
        date: iso,
        label: d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        }),
        slots,
      });
    }
  }

  return days;
}

function isSlotAvailable(date, time) {
  const days = getAvailability();
  const day = days.find((d) => d.date === date);
  return Boolean(day && day.slots.includes(time));
}

module.exports = { getAvailability, isSlotAvailable };
