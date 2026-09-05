const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function getSecret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return process.env.JWT_SECRET;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function checkPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function createToken(tutor) {
  return jwt.sign({ tutorId: tutor.id }, getSecret(), { expiresIn: '7d' });
}

function requireTutor(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const payload = jwt.verify(token, getSecret());
    req.tutorId = payload.tutorId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Tutor authentication required' });
  }
}

module.exports = { hashPassword, checkPassword, createToken, requireTutor };