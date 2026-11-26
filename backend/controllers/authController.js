const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const Admin = require('../models/Admin');

const login = async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const admin = await Admin.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  if (!admin || !(await bcryptjs.compare(password, admin.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: admin._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  return res.json({ token, admin: { id: admin._id.toString(), email: admin.email } });
};

module.exports = { login };
