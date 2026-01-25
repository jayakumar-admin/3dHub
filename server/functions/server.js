// Load environment variables (LOCAL only)
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Initialize the Express application
const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.get('/api', (req, res) => {
  res.send('3D Hub E-Commerce API is running...');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/contact', require('./routes/contact'));

// --- LOCAL SERVER ONLY ---
// if (require.main === module) {
//   const PORT = process.env.PORT || 8080;
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// }

// 👇 THIS IS THE KEY LINE FOR FIREBASE
module.exports = app;
