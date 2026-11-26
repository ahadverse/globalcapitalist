const ContactInquiry = require('../models/ContactInquiry');

const fieldLimits = {
  name: 100,
  email: 254,
  subject: 150,
  message: 5000,
};

const createContactInquiry = async (req, res) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body
    : {};
  const inquiry = {};

  for (const [field, maxLength] of Object.entries(fieldLimits)) {
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      return res.status(400).json({ error: `${field} is required` });
    }
    inquiry[field] = body[field].trim();
    if (inquiry[field].length > maxLength) {
      return res.status(400).json({ error: `${field} must be ${maxLength} characters or fewer` });
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) {
    return res.status(400).json({ error: 'Enter a valid email address' });
  }

  await ContactInquiry.create(inquiry);
  return res.status(201).json({ received: true });
};

const getContactInquiries = async (req, res) => {
  const requestedPage = Number.parseInt(req.query.page, 10);
  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
    ? Math.min(requestedLimit, 100)
    : 25;

  const [inquiries, total] = await Promise.all([
    ContactInquiry.find()
      .select('name email subject message createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ContactInquiry.countDocuments(),
  ]);

  return res.json({
    inquiries,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};

module.exports = { createContactInquiry, getContactInquiries };
