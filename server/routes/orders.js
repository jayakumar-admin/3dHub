
const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const queries = require('../queries').orders;

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { items, customerDetails, totalAmount, shippingAddress, userId } = req.body;
  
  const client = await db.getClient();
  try {
    // Begin a database transaction
    await client.query('BEGIN');

    // 1. Insert into the main 'orders' table
    const orderId = `ORD-${Date.now()}`;
    const orderData = await client.query(queries.createOrder, [
      orderId,
      customerDetails.name,
      customerDetails.email,
      totalAmount,
      shippingAddress,
      userId, // Can be null for guest checkouts
    ]);
    const newOrder = orderData.rows[0];

    // 2. Insert each item into the 'order_items' table
    for (const item of items) {
      await client.query(queries.createOrderItem, [
        newOrder.id,
        item.productId,
        item.productName,
        item.quantity,
        item.price,
        item.oldPrice,
        item.image,
      ]);
      // Optional: Decrement product stock here
    }

    // Commit the transaction
    await client.query('COMMIT');
    res.status(201).json({ success: true, order: newOrder });

  } catch (err) {
    // If any error occurs, rollback the transaction
    await client.query('ROLLBACK');
    console.error('Order creation error:', err.message);
    res.status(500).send('Server Error');
  } finally {
    // Release the client back to the pool
    client.release();
  }
});

// --- Protected Admin Routes ---

/**
 * @route   GET /api/orders
 * @desc    Get all orders
 * @access  Private (Admin only)
 */
router.get('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access Denied.');

  try {
    const { rows } = await db.query(queries.getAllOrders);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get a single order with its items
 * @access  Private (Admin only)
 */
router.get('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access Denied.');
  
  try {
    const orderResult = await db.query(queries.getOrderById, [req.params.id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    const order = orderResult.rows[0];

    const itemsResult = await db.query(queries.getOrderItemsByOrderId, [req.params.id]);
    order.items = itemsResult.rows;

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update the status of an order
 * @access  Private (Admin only)
 */
router.put('/:id/status', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access Denied.');

  const { status, shippingInfo } = req.body;
  const { id } = req.params;

  try {
    let result;
    if (status === 'Shipped' && shippingInfo) {
      result = await db.query(queries.updateOrderStatusWithShipping, [status, JSON.stringify(shippingInfo), id]);
    } else {
      result = await db.query(queries.updateOrderStatus, [status, id]);
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    res.json({ msg: 'Order status updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
