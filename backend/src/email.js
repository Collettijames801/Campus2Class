async function sendConfirmationEmail({
  parentEmail,
  parentName,
  studentName,
  course,
  format,
  sessionLength,
  date,
  time,
  total,
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) return false;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [parentEmail],
      subject: `Campus2Class booking confirmed for ${studentName}`,
      text: [
        `Hi ${parentName},`,
        '',
        `${studentName}'s Campus2Class tutoring session is confirmed.`,
        `Course: ${course}`,
        `When: ${date} at ${time}`,
        `Format: ${format === 'in-person' ? 'In-person' : 'Zoom'}`,
        `Length: ${sessionLength} hour${Number(sessionLength) === 1 ? '' : 's'}`,
        `Total: $${Number(total).toFixed(2)}`,
        '',
        'Thank you,',
        'Campus2Class',
      ].join('\n'),
    }),
  });

  if (!res.ok) {
    throw new Error(`Confirmation email failed: ${res.status} ${await res.text()}`);
  }

  return true;
}

module.exports = { sendConfirmationEmail };