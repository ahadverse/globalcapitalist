const mongoose = require('mongoose');
const SiteContent = require('../models/SiteContent');

const getSiteContent = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Site content is temporarily unavailable' });
  }

  const siteContent = await SiteContent.findOne({ key: 'globalcapitalist' }).lean();
  if (!siteContent) {
    return res.status(404).json({ error: 'Site content has not been seeded' });
  }

  return res.json(siteContent.content);
};

module.exports = { getSiteContent };
