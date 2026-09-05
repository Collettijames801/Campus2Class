require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const db = require('./db');
const { COURSES, getQuote } = require('./pricing');
const { getAvailability, isSlotAvailable } = require('./availability');
const paypal = require('./paypal');
const { sendConfirmationEmail } = require('./email');

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

    if (!isSlotAvailable(date, time)) {
      return res.status(409).json({ error: 'That time slot is no longer available. Please pick another.' });
    }

    const quote = getQuote({ subject, courseId, struggle, format });
    const total = quote.ratePerHour * Number(sessionLength);

    const order = await paypal.createOrder(
      total,
      `Campus2Class tutoring: ${quote.course.label} (${sessionLength} hr, ${format})`
    );

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

    if (!isSlotAvailable(date, time)) {
      return res.status(409).json({ error: 'That time slot was just booked by someone else. You have not been charged twice; please contact us.' });
    }

    const capture = await paypal.captureOrder(orderId);
    const quote = getQuote({ subject, courseId, struggle, format });
    const total = quote.ratePerHour * Number(sessionLength);

    const id = uuidv4();
    db.prepare(
      `INSERT INTO bookings (
        id, parent_name, parent_email, parent_phone, student_name, grade_level,
        subject, course, struggle, format, session_length, rate_per_hour, total_price,
        session_date, session_time, notes, paypal_order_id, payment_status
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(
      id,
      parentName,
      parentEmail,
      parentPhone,
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
      orderId,
      'paid'
    );

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

    res.json({ success: true, bookingId: id, capture, emailSent });
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
