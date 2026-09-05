const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'campus2class.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    student_name TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    subject TEXT NOT NULL,
    course TEXT NOT NULL,
    struggle TEXT NOT NULL,
    format TEXT NOT NULL,
    session_length INTEGER NOT NULL,
    rate_per_hour REAL NOT NULL,
    total_price REAL NOT NULL,
    session_date TEXT NOT NULL,
    session_time TEXT NOT NULL,
    notes TEXT,
    paypal_order_id TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
