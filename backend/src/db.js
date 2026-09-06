const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'campus2class.db'));
db.pragma('foreign_keys = ON');

const bookingColumns = db
  .prepare("PRAGMA table_info('bookings')")
  .all()
  .map((column) => column.name);

// The original schema stored client details directly on bookings. This project
// has not launched, so reset that pre-launch schema rather than carrying it
// forward with a partial migration.
if (bookingColumns.length > 0 && !bookingColumns.includes('client_id')) {
  db.exec('DROP TABLE IF EXISTS bookings');
}

db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tutors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    subjects TEXT NOT NULL DEFAULT '[]',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tutor_availability (
    id TEXT PRIMARY KEY,
    tutor_id TEXT NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    UNIQUE (tutor_id, day_of_week, start_time, end_time)
  );

  CREATE TABLE IF NOT EXISTS slot_holds (
    id TEXT PRIMARY KEY,
    session_date TEXT NOT NULL,
    session_time TEXT NOT NULL,
    paypal_order_id TEXT UNIQUE,
    hold_group_id TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (session_date, session_time)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id),
    tutor_id TEXT REFERENCES tutors(id),
    student_name TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    subject TEXT NOT NULL,
    course_id TEXT,
    course TEXT NOT NULL,
    struggle TEXT NOT NULL,
    format TEXT NOT NULL,
    session_length REAL NOT NULL,
    rate_per_hour REAL NOT NULL,
    total_price REAL NOT NULL,
    session_date TEXT NOT NULL,
    session_time TEXT NOT NULL,
    address_street TEXT,
    address_town TEXT,
    address_zip TEXT,
    series_id TEXT,
    series_index INTEGER NOT NULL DEFAULT 1,
    series_total INTEGER NOT NULL DEFAULT 1,
    calendar_token TEXT UNIQUE,
    notes TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL REFERENCES bookings(id),
    client_id TEXT NOT NULL REFERENCES clients(id),
    paypal_order_id TEXT NOT NULL UNIQUE,
    paypal_capture_id TEXT,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_bookings_session ON bookings(session_date, session_time);
  CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
`);

const bookingTableColumns = db.prepare("PRAGMA table_info('bookings')").all().map((column) => column.name);
const holdTableColumns = db.prepare("PRAGMA table_info('slot_holds')").all().map((column) => column.name);
const addColumn = (table, column, definition, columns) => {
  if (!columns.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
};

addColumn('bookings', 'address_street', 'TEXT', bookingTableColumns);
addColumn('bookings', 'course_id', 'TEXT', bookingTableColumns);
addColumn('bookings', 'address_town', 'TEXT', bookingTableColumns);
addColumn('bookings', 'address_zip', 'TEXT', bookingTableColumns);
addColumn('bookings', 'series_id', 'TEXT', bookingTableColumns);
addColumn('bookings', 'series_index', 'INTEGER NOT NULL DEFAULT 1', bookingTableColumns);
addColumn('bookings', 'series_total', 'INTEGER NOT NULL DEFAULT 1', bookingTableColumns);
addColumn('bookings', 'calendar_token', 'TEXT', bookingTableColumns);
addColumn('slot_holds', 'hold_group_id', 'TEXT', holdTableColumns);
db.exec('CREATE INDEX IF NOT EXISTS idx_slot_holds_group ON slot_holds(hold_group_id)');

module.exports = db;
