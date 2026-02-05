const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const queries = require('../queries').products;

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await db.query(queries.getAllProducts);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/products/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/categories', async (req, res, next) => {
    try {
        const { rows } = await db.query(queries.getAllCategories);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await db.query(queries.getProductById, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});


/**
 * @route   GET /api/products/:id/reviews
 * @desc    Get all reviews for a specific product
 * @access  Public
 */
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const { rows } = await db.query(queries.getReviewsByProductId, [req.params.id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/products/:id/reviews
 * @desc    Submit a review for a product
 * @access  Private (Customer)
 */
router.post('/:id/reviews', verifyToken, async (req, res, next) => {
  const { orderId, rating, comment } = req.body;
  const productId = req.params.id;
  const userId = req.user.id;

  if (!orderId || !rating) {
    return res.status(400).json({ message: 'Order ID and rating are required.' });
  }

  try {
    const { rows } = await db.query(queries.createReview, [
      productId,
      userId,
      orderId,
      rating,
      comment,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    // Handle unique constraint violation (user reviewing same product in same order twice)
    if (err.code === '23505') {
        return res.status(400).json({ message: 'You have already reviewed this product for this order.' });
    }
    next(err);
  }
});


// --- Protected Admin Routes ---

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Admin only)
 */
router.post('/', verifyToken, async (req, res, next) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access Denied.');
  
  const { id, name, description, price, oldPrice, stock, category, images, sku, enabled, tags, weight, dimensions } = req.body;
  try {
    const { rows } = await db.query(queries.createProduct, [
      id, name, description, price, oldPrice, stock, category, images, sku, enabled, tags, weight, JSON.stringify(dimensions)
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product
 * @access  Private (Admin only)
 */
router.put('/:id', verifyToken, async (req, res, next) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access Denied.');

  const { name, description, price, oldPrice, stock, category, images, sku, enabled, tags, weight, dimensions } = req.body;
  try {
    const { rows } = await db.query(queries.updateProduct, [
      name, description, price, oldPrice, stock, category, images, sku, enabled, tags, weight, JSON.stringify(dimensions), req.params.id
    ]);
    if (rows.length === 0) {
        return res.status(404).json({ msg: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Admin only)
 */
router.delete('/:id', verifyToken, async (req, res, next) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access Denied.');
  
  try {
    const result = await db.query(queries.deleteProduct, [req.params.id]);
    if (result.rowCount === 0) {
        return res.status(404).json({ msg: 'Product not found' });
    }
    res.json({ msg: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;