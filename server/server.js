require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

// --- Middleware ---

// Enable Cross-Origin Resource Sharing (CORS)
// This allows the frontend application (running on a different origin) to make requests to this backend API.
app.use(cors());

// --------------------
// 🚨 UPLOAD ROUTES FIRST (VERY IMPORTANT)
// --------------------
app.use('/api/upload', require('./routes/upload'));

// --------------------
// BODY PARSERS AFTER
// --------------------
app.use(express.json());


// --- API Routes ---

// A simple test route to confirm the API is running.
app.get('/api', (req, res) => {
  res.send('3D Hub E-Commerce API is running...');
});

// Mount the different parts of the API under specific base paths.
// Each file in './routes/' defines the endpoints for a specific resource (e.g., auth, products).
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/contact', require('./routes/contact'));

// --------------------
// LOCAL ONLY
// --------------------
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
