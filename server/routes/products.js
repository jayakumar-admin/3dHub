
const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const queries = require('../queries').products;

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(queries.getAllProducts);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: `Server Error: ${err.message}` });
  }
});

/**
 * @route   GET /api/products/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/categories', async (req, res) => {
    try {
        const { rows } = await db.query(queries.getAllCategories);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: `Server Error: ${err.message}` });
    }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(queries.getProductById, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: `Server Error: ${err.message}` });
  }
});

// --- Protected Admin Routes ---

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Admin only)
 */
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access Denied.');
  
  const { id, name, description, price, oldPrice, stock, category, images, sku, enabled, tags, weight, dimensions } = req.body;
  try {
    const { rows } = await db.query(queries.createProduct, [
      id, name, description, price, oldPrice, stock, category, images, sku, enabled, tags, weight, JSON.stringify(dimensions)
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: `Server Error: ${err.message}` });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product
 * @access  Private (Admin only)
 */
router.put('/:id', verifyToken, async (req, res) => {
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
    console.error(err.message);
    res.status(500).json({ message: `Server Error: ${err.message}` });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Admin only)
 */
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access Denied.');
  
  try {
    const result = await db.query(queries.deleteProduct, [req.params.id]);
    if (result.rowCount === 0) {
        return res.status(404).json({ msg: 'Product not found' });
    }
    res.json({ msg: 'Product deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: `Server Error: ${err.message}` });
  }
});

module.exports = router;
