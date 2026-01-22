
const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const queries = require('../queries').contact;

/**
 * @route   POST /api/contact
 * @desc    Create a new contact submission
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  try {
    const { rows } = await db.query(queries.createSubmission, [name, email, message]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Contact submission error:', err.message);
    res.status(500).json({ message: `Server Error: ${err.message}` });
  }
});

/**
 * @route   GET /api/contact
 * @desc    Get all contact submissions
 * @access  Private (Admin only)
 */
router.get('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access Denied.' });
  }

  try {
    const { rows } = await db.query(queries.getAllSubmissions);
    res.json(rows);
  } catch (err) {
    console.error('Get submissions error:', err.message);
    res.status(500).json({ message: `Server Error: ${err.message}` });
  }
});

/**
 * @route   PUT /api/contact/:id/status
 * @desc    Update the status of a contact submission
 * @access  Private (Admin only)
 */
router.put('/:id/status', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access Denied.' });
  }

  const { status } = req.body;
  const { id } = req.params;

  if (!['New', 'Read', 'Archived'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    const { rows } = await db.query(queries.updateStatus, [status, id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Submission not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Update submission status error:', err.message);
    res.status(500).json({ message: `Server Error: ${err.message}` });
  }
});

module.exports = router;
