
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
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

    // 4. Send the token back to the client.
    // It's common to send it in the response body. Sending it in a header is another option.
    res.json({ token });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error during authentication.');
  }
});

module.exports = router;
