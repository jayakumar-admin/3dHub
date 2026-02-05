const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const queries = require('../queries').users;

// All routes in this file are protected and for Admin use only unless specified otherwise.

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/', verifyToken, async (req, res, next) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access Denied.');

  try {
    const { rows } = await db.query(queries.getAllUsers);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update the logged-in user's own profile
 * @access  Private (Any authenticated user)
 */
router.put('/profile', verifyToken, async (req, res, next) => {
  const userId = req.user.id;
  const { name, email, phone, avatar } = req.body;
  
  // Basic validation
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }

  try {
    // We need the current user's avatar in case it's not being updated
    const currentUserData = await db.query('SELECT avatar FROM users WHERE id = $1', [userId]);
    const currentAvatar = currentUserData.rows[0].avatar;

    const { rows } = await db.query(queries.updateUserProfile, [
        name,
        email,
        phone,
        avatar || currentAvatar, // Use new avatar if provided, else keep old one
        userId
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    // Handle unique constraint violation for email
    if (err.code === '23505') {
        return res.status(400).json({ message: 'This email is already in use by another account.' });
    }
    next(err);
  }
});


/**
 * @route   PUT /api/users/:id
 * @desc    Update a user's details (name, email, role)
 * @access  Private (Admin only)
 */
router.put('/:id', verifyToken, async (req, res, next) => {
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
    next(err);
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private (Admin only)
 */
router.delete('/:id', verifyToken, async (req, res, next) => {
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
    next(err);
  }
});

module.exports = router;