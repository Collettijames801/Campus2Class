const db = require('./db');
const { v4: uuidv4 } = require('uuid');

const DAYS_AHEAD = 35;
const HOLD_MINUTES = 10;

function formatDateISO(date) {
  return date.toISOString().slice(0, 10);
}

function formatSqlDate(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function parseTime(value) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) throw new Error('Time must use a format such as 4:00 PM');
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return hour * 60 + Number(match[2]);
}

function validateTimeRange(startTime, endTime) {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  if (end <= start) throw new Error('End time must be later than start time');
}

function formatTime(minutes) {
  const hour24 = Math.floor(minutes / 60);
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minutes % 60).padStart(2, '0')} ${suffix}`;
}

function cleanupExpiredHolds() {
  db.prepare("DELETE FROM slot_holds WHERE expires_at <= datetime('now')").run();
}

function getWeeklySlots() {
  const slots = new Map();
  const rows = db.prepare(`
    SELECT ta.day_of_week, ta.start_time, ta.end_time
    FROM tutor_availability ta
    JOIN tutors t ON t.id = ta.tutor_id
    WHERE t.active = 1
    ORDER BY ta.day_of_week, ta.start_time
  `).all();

  for (const row of rows) {
    const daySlots = slots.get(row.day_of_week) || new Set();
    for (let time = parseTime(row.start_time); time < parseTime(row.end_time); time += 60) {
      daySlots.add(formatTime(time));
    }
    slots.set(row.day_of_week, daySlots);
  }
  return slots;
}

function getAvailability() {
  cleanupExpiredHolds();
  const weeklySlots = getWeeklySlots();
  const booked = new Set(
    db.prepare("SELECT session_date, session_time FROM bookings WHERE payment_status = 'paid'")
      .all()
      .map((booking) => `${booking.session_date}|${booking.session_time}`)
  );
  const held = new Set(
    db.prepare("SELECT session_date, session_time FROM slot_holds WHERE expires_at > datetime('now')")
      .all()
      .map((hold) => `${hold.session_date}|${hold.session_time}`)
  );

  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= DAYS_AHEAD; i += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const template = weeklySlots.get(date.getDay()) || new Set();
    const iso = formatDateISO(date);
    const slots = [...template].filter((time) => {
      const key = `${iso}|${time}`;
      return !booked.has(key) && !held.has(key);
    });
    if (slots.length > 0) {
      days.push({
        date: iso,
        label: date.toLocaleDateString('en-US', {
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
  return getAvailability().some((day) => day.date === date && day.slots.includes(time));
}

function createSlotHold(date, time) {
  cleanupExpiredHolds();
  if (!isSlotAvailable(date, time)) return null;
  const id = uuidv4();
  const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
  try {
    db.prepare(`
      INSERT INTO slot_holds (id, session_date, session_time, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(id, date, time, formatSqlDate(expiresAt));
    return id;
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return null;
    throw error;
  }
}

function createSlotHolds(slots) {
  const ids = [];
  try {
    for (const slot of slots) {
      const id = createSlotHold(slot.date, slot.time);
      if (!id) throw new Error('That time slot is no longer available.');
      ids.push(id);
    }
    return ids;
  } catch (error) {
    ids.forEach((id) => releaseSlotHold(id));
    return null;
  }
}

function attachOrderToHold(holdId, orderId) {
  db.prepare('UPDATE slot_holds SET paypal_order_id = ?, hold_group_id = ? WHERE id = ?').run(orderId, orderId, holdId);
}

function attachOrderToHolds(holdIds, orderId) {
  const update = db.prepare('UPDATE slot_holds SET paypal_order_id = ?, hold_group_id = ? WHERE id = ?');
  db.transaction(() => {
    holdIds.forEach((holdId, index) => {
      update.run(index === 0 ? orderId : null, orderId, holdId);
    });
  })();
}

function getHoldsForOrder(orderId) {
  cleanupExpiredHolds();
  return db.prepare('SELECT * FROM slot_holds WHERE hold_group_id = ? OR paypal_order_id = ? ORDER BY session_date').all(orderId, orderId);
}

function releaseSlotHold(value) {
  if (value) {
    db.prepare('DELETE FROM slot_holds WHERE paypal_order_id = ? OR hold_group_id = ? OR id = ?').run(value, value, value);
  }
}

module.exports = {
  getAvailability,
  isSlotAvailable,
  validateTimeRange,
  createSlotHold,
  createSlotHolds,
  attachOrderToHold,
  attachOrderToHolds,
  getHoldsForOrder,
  releaseSlotHold,
};