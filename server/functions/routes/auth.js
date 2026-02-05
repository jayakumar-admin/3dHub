const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const queries = require('../queries').auth;
const verifyToken = require('../middleware/verifyToken');


/**
 * @route   POST /api/auth/login
 * @desc    Authenticate an admin user and return a JWT.
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).send('Please provide both email and password.');
  }

  try {
    // 1. Find the admin user by email in the database.
    const userResult = await db.query(queries.findAdminByEmail, [email]);
    
    // Check if an admin user with that email exists.
    if (userResult.rows.length === 0) {
      return res.status(400).send('Invalid credentials.');
    }
    
    const user = userResult.rows[0];

    // 2. Compare the provided password with the hashed password stored in the database.
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).send('Invalid credentials.');
    }

    // 3. If credentials are valid, create and sign a JSON Web Token (JWT).
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1h' }); // Token expires in 1 hour

    // 4. Send the token and user object back to the client.
    const { password: _, ...userToSend } = user;
    res.json({ token, user: userToSend });

  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/user/signup
 * @desc    Register a new customer.
 * @access  Public
 */
router.post('/user/signup', async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const existingUser = await db.query(queries.findUserByEmail, [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUserId = `user${Date.now()}`;
    
    const newUserResult = await db.query(queries.createUser, [
        newUserId, name, email, hashedPassword, null, phone
    ]);

    res.status(201).json(newUserResult.rows[0]);

  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/user/login
 * @desc    Authenticate a customer and return a JWT and user object.
 * @access  Public
 */
router.post('/user/login', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password.' });
  }

  try {
    const userResult = await db.query(queries.findUserByEmail, [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    
    const user = userResult.rows[0];
    
    if (!user.password) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '8h' });

    const { password: _, ...userToSend } = user;

    res.json({ token, user: userToSend });

  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change a logged-in user's password.
 * @access  Private
 */
router.post('/change-password', verifyToken, async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All password fields are required.' });
  }
  
  if (newPassword.length < 8) {
     return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
  }

  try {
    const userResult = await db.query(queries.getUserPasswordById, [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const { password: hashedPassword } = userResult.rows[0];

    const isPasswordValid = await bcrypt.compare(currentPassword, hashedPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query(queries.changePassword, [newHashedPassword, userId]);

    res.json({ message: 'Password changed successfully.' });

  } catch (err) {
    next(err);
  }
});


module.exports = router;