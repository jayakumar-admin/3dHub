require('dotenv').config();

const functions = require("firebase-functions");
const express = require('express');
const cors = require('cors');

const app = express();

// --------------------
// CORS FIRST
// --------------------
app.use(cors());
app.options("*", cors());

// --------------------
// 🚨 UPLOAD ROUTES FIRST (NO BODY PARSER HERE)
// --------------------
app.use('/api/upload', require('./routes/upload'));

// --------------------
// BODY PARSERS AFTER UPLOAD ROUTES
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// OTHER ROUTES
// --------------------
app.get('/api', (req, res) => {
  res.send('3D Hub E-Commerce API is running...');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/settings', require('./routes/settings'));
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
