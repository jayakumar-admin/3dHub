// Load environment variables from a .env file into process.env
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Initialize the Express application
const app = express();

// --- Middleware ---

// Enable Cross-Origin Resource Sharing (CORS)
// This allows the frontend application (running on a different origin) to make requests to this backend API.
app.use(cors());

// Parse incoming requests with JSON payloads.
// This middleware is based on body-parser and allows the server to read JSON data from request bodies (e.g., in POST or PUT requests).
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


// --- Start Server ---

// Set the port for the server. It will use the port from the .env file, or default to 3000 if not specified.
const PORT = process.env.PORT || 3000;

// Start listening for incoming requests on the specified port.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});