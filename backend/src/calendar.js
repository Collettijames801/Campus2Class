function escapeText(value) {
  return String(value || '').replace(/([,;\\])/g, '\\$1').replace(/\r?\n/g, '\\n');
}

function toUtcStamp(date, time) {
  const parsed = new Date(`${date} ${time}`);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function bookingToIcs(booking, baseUrl) {
  const start = toUtcStamp(booking.session_date, booking.session_time);
  const end = new Date(new Date(`${booking.session_date} ${booking.session_time}`).getTime() + Number(booking.session_length) * 60 * 60 * 1000);
  const endStamp = Number.isNaN(end.getTime()) ? start : end.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const location = booking.format === 'in-person'
    ? [booking.address_street, booking.address_town, booking.address_zip].filter(Boolean).join(', ')
    : 'Zoom (link to be sent by tutor)';
  const url = `${baseUrl}/api/bookings/${encodeURIComponent(booking.id)}/calendar.ics?token=${encodeURIComponent(booking.calendar_token)}`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campus2Class//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${escapeText(booking.id)}@campus2class`,
    `DTSTAMP:${toUtcStamp(new Date().toISOString().slice(0, 10), '12:00 AM')}`,
    `DTSTART:${start}`,
    `DTEND:${endStamp}`,
    `SUMMARY:${escapeText(`Campus2Class tutoring: ${booking.course}`)}`,
    `DESCRIPTION:${escapeText(`${booking.student_name}'s ${booking.format} tutoring session`)}`,
    `LOCATION:${escapeText(location)}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

module.exports = { bookingToIcs };