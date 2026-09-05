require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const db = require('./db');
const { COURSES, getQuote } = require('./pricing');
const {
  getAvailability,
  validateTimeRange,
  createSlotHold,
  attachOrderToHold,
  getHoldForOrder,
  releaseSlotHold,
} = require('./availability');
const paypal = require('./paypal');
const { sendConfirmationEmail } = require('./email');
const { hashPassword, checkPassword, createToken, requireTutor } = require('./tutorAuth');

const app = express();
app.use(cors());
app.use(express.json());

// ---- Catalog ----
app.get('/api/courses', (req, res) => {
  res.json(COURSES);
});

// ---- Quote ----
app.post('/api/quote', (req, res) => {
  try {
    const { subject, courseId, struggle, format } = req.body;
    const quote = getQuote({ subject, courseId, struggle, format });
    res.json(quote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- Availability ----
app.get('/api/availability', (req, res) => {
  res.json(getAvailability());
});

// ---- Tutor authentication and management ----
app.post('/api/tutor/setup', async (req, res) => {
  try {
    const { name, email, password, subjects = [] } = req.body;
    const tutorCount = db.prepare('SELECT COUNT(*) AS count FROM tutors').get().count;
    if (!process.env.TUTOR_SETUP_KEY || req.headers['x-tutor-setup-key'] !== process.env.TUTOR_SETUP_KEY) {
      return res.status(403).json({ error: 'Tutor setup is not available' });
    }
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ error: 'Name, email, and a password of at least 8 characters are required' });
    }
    const id = uuidv4();
    db.prepare(`
      INSERT INTO tutors (id, name, email, password_hash, subjects)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name.trim(), email.trim().toLowerCase(), await hashPassword(password), JSON.stringify(subjects));
    res.status(201).json({ id, name, email: email.trim().toLowerCase(), subjects });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/tutor/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const tutor = db.prepare('SELECT * FROM tutors WHERE email = ? AND active = 1').get(email);
  if (!tutor || !(await checkPassword(String(req.body.password || ''), tutor.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({
    token: createToken(tutor),
    tutor: { id: tutor.id, name: tutor.name, email: tutor.email, subjects: JSON.parse(tutor.subjects) },
  });
});

app.get('/api/tutor/me', requireTutor, (req, res) => {
  const tutor = db.prepare('SELECT id, name, email, subjects, active FROM tutors WHERE id = ?').get(req.tutorId);
  if (!tutor || !tutor.active) return res.status(401).json({ error: 'Tutor account is inactive' });
  res.json({ ...tutor, subjects: JSON.parse(tutor.subjects) });
});

app.get('/api/tutor/availability', requireTutor, (req, res) => {
  const rows = db.prepare(`
    SELECT id, day_of_week, start_time, end_time
    FROM tutor_availability WHERE tutor_id = ? ORDER BY day_of_week, start_time
  `).all(req.tutorId);
  res.json(rows);
});

app.put('/api/tutor/availability', requireTutor, (req, res) => {
  const blocks = Array.isArray(req.body.blocks) ? req.body.blocks : [];
  const replace = db.transaction(() => {
    db.prepare('DELETE FROM tutor_availability WHERE tutor_id = ?').run(req.tutorId);
    const insert = db.prepare(`
      INSERT INTO tutor_availability (id, tutor_id, day_of_week, start_time, end_time)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const block of blocks) {
      const day = Number(block.dayOfWeek);
      if (!Number.isInteger(day) || day < 0 || day > 6 || !block.startTime || !block.endTime) {
        throw new Error('Each availability block needs a day, start time, and end time');
      }
      validateTimeRange(block.startTime, block.endTime);
      insert.run(uuidv4(), req.tutorId, day, block.startTime, block.endTime);
    }
  });
  try {
    replace();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/tutor/bookings', requireTutor, (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, c.name AS client_name, c.email AS client_email, c.phone AS client_phone
    FROM bookings b JOIN clients c ON c.id = b.client_id
    WHERE b.tutor_id = ? OR b.tutor_id IS NULL
    ORDER BY b.session_date, b.session_time
  `).all(req.tutorId);
  res.json(bookings);
});

// ---- PayPal: create order ----
app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const {
      subject,
      courseId,
      struggle,
      format,
      sessionLength, // in hours, e.g. 1 or 1.5
      date,
      time,
    } = req.body;

    const quote = getQuote({ subject, courseId, struggle, format });
    const total = quote.ratePerHour * Number(sessionLength);
    const holdId = createSlotHold(date, time);
    if (!holdId) {
      return res.status(409).json({ error: 'That time slot is no longer available. Please pick another.' });
    }

    let order;
    try {
      order = await paypal.createOrder(
        total,
        `Campus2Class tutoring: ${quote.course.label} (${sessionLength} hr, ${format})`
      );
      attachOrderToHold(holdId, order.id);
    } catch (error) {
      releaseSlotHold(holdId);
      throw error;
    }

    res.json({ orderId: order.id, total, ratePerHour: quote.ratePerHour });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- PayPal: capture order + save booking ----
app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderId, booking } = req.body;
    const {
      parentName,
      parentEmail,
      parentPhone,
      studentName,
      gradeLevel,
      subject,
      courseId,
      struggle,
      format,
      sessionLength,
      date,
      time,
      notes,
    } = booking;

    const hold = getHoldForOrder(orderId);
    if (!hold || hold.session_date !== date || hold.session_time !== time) {
      return res.status(409).json({ error: 'That time slot was just booked by someone else. You have not been charged twice; please contact us.' });
    }

    let capture;
    try {
      capture = await paypal.captureOrder(orderId);
    } catch (error) {
      releaseSlotHold(orderId);
      throw error;
    }
    const quote = getQuote({ subject, courseId, struggle, format });
    const total = quote.ratePerHour * Number(sessionLength);

    const id = uuidv4();
    const clientId = uuidv4();
    const captureDetails = capture.purchase_units?.[0]?.payments?.captures?.[0];
    const saveBooking = db.transaction(() => {
      const existingClient = db.prepare('SELECT id FROM clients WHERE email = ?').get(parentEmail.trim().toLowerCase());
      const resolvedClientId = existingClient?.id || clientId;
      if (!existingClient) {
        db.prepare('INSERT INTO clients (id, name, email, phone) VALUES (?, ?, ?, ?)')
          .run(clientId, parentName, parentEmail.trim().toLowerCase(), parentPhone);
      } else {
        db.prepare('UPDATE clients SET name = ?, phone = ? WHERE id = ?').run(parentName, parentPhone, resolvedClientId);
      }
      db.prepare(
      `INSERT INTO bookings (
        id, client_id, student_name, grade_level,
        subject, course, struggle, format, session_length, rate_per_hour, total_price,
        session_date, session_time, notes, payment_status
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).run(
      id,
      resolvedClientId,
      studentName,
      gradeLevel,
      subject,
      quote.course.label,
      struggle,
      format,
      sessionLength,
      quote.ratePerHour,
      total,
      date,
      time,
      notes || '',
      'paid'
      );
      db.prepare(`
        INSERT INTO payments (
          id, booking_id, client_id, paypal_order_id, paypal_capture_id,
          amount, currency, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(), id, resolvedClientId, orderId, captureDetails?.id || null,
        total, captureDetails?.amount?.currency_code || 'USD', capture.status || 'COMPLETED'
      );
      releaseSlotHold(orderId);
      return { id, clientId: resolvedClientId };
    });
    const saved = saveBooking();

    let emailSent = false;
    try {
      emailSent = await sendConfirmationEmail({
        parentEmail,
        parentName,
        studentName,
        course: quote.course.label,
        format,
        sessionLength,
        date,
        time,
        total,
      });
    } catch (emailError) {
      console.error(emailError);
    }

    res.json({ success: true, bookingId: saved.id, capture, emailSent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Simple admin listing (protect with a shared secret header) ----
app.get('/api/bookings', (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const bookings = db
    .prepare('SELECT * FROM bookings ORDER BY session_date, session_time')
    .all();
  res.json(bookings);
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, paypalEnv: paypal.PAYPAL_ENV });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Campus2Class API running on port ${PORT} (PayPal env: ${paypal.PAYPAL_ENV})`);
});
