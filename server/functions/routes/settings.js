
const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const queries = require('../queries').settings;

/**
 * @route   GET /api/settings
 * @desc    Get the website settings
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Settings are stored as a single JSONB object in a table, identified by id=1.
    const result = await db.query(queries.getSettings);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Settings not found.' });
    }
    res.json(result.rows[0].data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: `Server Error: ${err.message}` });
  }
});

/**
 * @route   PUT /api/settings
 * @desc    Update the website settings
 * @access  Private (Admin only)
 */
router.put('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access Denied.');

  try {
    const newSettings = req.body;
    await db.query(queries.updateSettings, [newSettings]);
    res.json({ msg: 'Settings updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: `Server Error: ${err.message}` });
  }
});

module.exports = router;
