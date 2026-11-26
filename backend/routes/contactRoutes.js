const express = require('express');
const contactController = require('../controllers/contactController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/admin', authenticate, contactController.getContactInquiries);
router.post('/', contactController.createContactInquiry);

module.exports = router;
