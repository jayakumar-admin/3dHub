
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).send('Access Denied. No token provided.');

  const token = authHeader.split(' ')[1]; // Expects "Bearer <token>"
  if (!token) return res.status(401).send('Access Denied. Token format is invalid.');

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};
