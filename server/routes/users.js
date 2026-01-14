
const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const queries = require('../queries').users;

// All routes in this file are protected and for Admin use only.

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access Denied.');

  try {
    const { rows } = await db.query(queries.getAllUsers);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update a user's details (name, email, role)
 * @access  Private (Admin only)
 */
router.put('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access Denied.');
  
  const { name, email, role } = req.body;
  const { id } = req.params;
  
  try {
    const { rows } = await db.query(queries.updateUser, [name, email, role, id]);
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private (Admin only)
 */
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access Denied.');

  // Prevent admin from deleting their own account via this endpoint for safety.
  if (req.user.id === req.params.id) {
    return res.status(400).send('Admin users cannot be deleted through this endpoint.');
  }

  try {
    const result = await db.query(queries.deleteUser, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
