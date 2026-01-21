
const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const queries = require('../queries').auth;

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate an admin user and return a JWT.
 * @access  Public
 */
router.post('/login', async (req, res) => {
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
    console.error('Admin login error:', err);
    res.status(500).send('Server error during authentication.');
  }
});

/**
 * @route   POST /api/auth/user/signup
 * @desc    Register a new customer.
 * @access  Public
 */
router.post('/user/signup', async (req, res) => {
  const { name, email, password } = req.body;

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
    const avatar = `https://picsum.photos/seed/${name}/100/100`;
    
    const newUserResult = await db.query(queries.createUser, [
        newUserId, name, email, hashedPassword, avatar
    ]);

    res.status(201).json(newUserResult.rows[0]);

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

/**
 * @route   POST /api/auth/user/login
 * @desc    Authenticate a customer and return a JWT and user object.
 * @access  Public
 */
router.post('/user/login', async (req, res) => {
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
    console.error('User login error:', err);
    res.status(500).json({ message: 'Server error during authentication.' });
  }
});


module.exports = router;
