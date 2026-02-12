
const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const queries = require('../queries').orders;
const settingsQueries = require('../queries').settings;


// Helper function for sending notifications to avoid code duplication.
// This is a "fire-and-forget" function. It shouldn't block the API response.
const sendWhatsappStatusUpdate = async (orderId, newStatus, shippingInfo) => {
  try {
    const settingsResult = await db.query(settingsQueries.getSettings);
    if (settingsResult.rows.length === 0) return;
    
    const settings = settingsResult.rows[0].data;
    const notificationSettings = settings.whatsappNotifications;

    if (!notificationSettings?.enableOrderNotifications || notificationSettings.apiProvider !== 'mock_server') {
      return;
    }

    const orderResult = await db.query(queries.getOrderById, [orderId]);
    if (orderResult.rows.length === 0) return;
    const order = orderResult.rows[0];

    let customerMessageTemplate = '';
    switch(newStatus) {
      case 'Processing':
        customerMessageTemplate = notificationSettings.customerOrderProcessingMessage;
        break;
      case 'Shipped':
        customerMessageTemplate = notificationSettings.customerOrderShippedMessage;
        break;
      case 'Delivered':
        customerMessageTemplate = notificationSettings.customerOrderDeliveredMessage;
        break;
      case 'Cancelled':
        customerMessageTemplate = notificationSettings.customerOrderCancelledMessage;
        break;
      default:
        return; // Don't send notifications for 'Pending' or other statuses
    }

    if (!customerMessageTemplate || !order.customerPhone) {
        return;
    }

    const placeholders = {
        '[ORDER_ID]': order.id,
        '[CUSTOMER_NAME]': order.customerName,
        '[TOTAL_AMOUNT]': order.totalAmount.toString(),
        '[CARRIER]': shippingInfo?.carrier || 'our courier',
        '[TRACKING_NUMBER]': shippingInfo?.trackingNumber || 'N/A',
    };
    
    const customerMessage = customerMessageTemplate.replace(/\[ORDER_ID\]|\[CUSTOMER_NAME\]|\[TOTAL_AMOUNT\]|\[CARRIER\]|\[TRACKING_NUMBER\]/g, match => placeholders[match]);

    console.log(`\n--- [SERVER] SIMULATING WHATSAPP STATUS UPDATE (${newStatus}) ---`);
    console.log(`[SERVER] To Customer (${order.customerPhone}): ${customerMessage}`);
    console.log(`[SERVER] Using API Key: ${notificationSettings.apiKey.substring(0, 5)}...`);
    console.log(`[SERVER] From Sender Number: ${notificationSettings.senderNumber}`);
    console.log('--- SIMULATION END ---\n');

  } catch (error) {
    console.error(`[SERVER] Failed to process status update notification for order ${orderId}:`, error);
  }
};


/**
 * @route   POST /api/orders
 * @desc    Create a new order and trigger notifications
 * @access  Public
 */
router.post('/', async (req, res, next) => {
  const { items, customerDetails, customerPhone, totalAmount, shippingAddress, userId, paymentDetails } = req.body;
  
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const orderId = `ORD-${Date.now()}`;
    const orderData = await client.query(queries.createOrder, [
      orderId,
      customerDetails.name,
      customerDetails.email,
      customerPhone,
      totalAmount,
      shippingAddress,
      userId,
      paymentDetails ? JSON.stringify(paymentDetails) : null,
    ]);
    const newOrder = orderData.rows[0];

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
    }

    await client.query('COMMIT');
    
    // Fetch full order details to return to frontend
    const fullOrderResult = await client.query(queries.getOrderById, [newOrder.id]);
    const fullOrder = fullOrderResult.rows[0];
    fullOrder.items = items; // Add items since the query doesn't join them

    // --- Server-Side Notification Logic ---
    try {
      const settingsResult = await client.query(settingsQueries.getSettings);
      if (settingsResult.rows.length > 0) {
        const settings = settingsResult.rows[0].data;
        const notificationSettings = settings.whatsappNotifications;

        if (notificationSettings?.enableOrderNotifications && notificationSettings.apiProvider === 'mock_server') {
          console.log('\n--- [SERVER] SIMULATING WHATSAPP NOTIFICATION (NEW ORDER) ---');
          
          const placeholders = {
            '[ORDER_ID]': newOrder.id,
            '[CUSTOMER_NAME]': customerDetails.name,
            '[TOTAL_AMOUNT]': totalAmount.toString(),
          };
          const replacePlaceholders = (template) => template.replace(/\[ORDER_ID\]|\[CUSTOMER_NAME\]|\[TOTAL_AMOUNT\]/g, match => placeholders[match]);

          // 1. Customer Notification (Order Placed)
          if (customerPhone && notificationSettings.customerOrderMessage) {
            const customerMessage = replacePlaceholders(notificationSettings.customerOrderMessage);
            console.log(`[SERVER] To Customer (${customerPhone}): ${customerMessage}`);
          }
          
          // 2. Admin Notification (New Order)
          if (notificationSettings.adminPhoneNumber && notificationSettings.adminOrderMessage) {
            const adminMessage = replacePlaceholders(notificationSettings.adminOrderMessage);
            console.log(`[SERVER] To Admin (${notificationSettings.adminPhoneNumber}): ${adminMessage}`);
          }

          console.log(`[SERVER] Using API Key: ${notificationSettings.apiKey.substring(0, 5)}...`);
          console.log(`[SERVER] From Sender Number: ${notificationSettings.senderNumber}`);
          console.log('--- SIMULATION END ---\n');
        }
      }
    } catch (notificationError) {
      // Log notification error but don't fail the transaction
      console.error('[SERVER] Failed to process notifications after order creation:', notificationError);
    }
    // --- End Notification Logic ---

    res.status(201).json({ success: true, order: fullOrder });

  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});


/**
 * @route   GET /api/orders/my-orders
 * @desc    Get all orders for the logged-in user
 * @access  Private (Customer)
 */
router.get('/my-orders', verifyToken, async (req, res, next) => {
  const userId = req.user.id;
  try {
    const { rows } = await db.query(queries.getOrdersByUserId, [userId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});


// --- Protected Admin Routes ---

/**
 * @route   GET /api/orders
 * @desc    Get all orders
 * @access  Private (Admin only)
 */
router.get('/', verifyToken, async (req, res, next) => {
  if (req.user.role !== 'Admin') return res.status(403).send('Access Denied.');

  try {
    const { rows } = await db.query(queries.getAllOrders);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get a single order with its items
 * @access  Private (Admin or Customer who owns order)
 */
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const orderResult = await db.query(queries.getOrderById, [req.params.id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    const order = orderResult.rows[0];
    
    // Security check: Allow admins OR the user who owns the order
    if (req.user.role !== 'Admin' && order.user_id !== req.user.id) {
        return res.status(403).json({ msg: 'Access denied to this order.' });
    }

    const itemsResult = await db.query(queries.getOrderItemsByOrderId, [req.params.id]);
    const reviewsResult = await db.query(queries.getReviewedProductIdsByOrderId, [req.params.id]);

    order.items = itemsResult.rows;
    order.reviewedProductIds = reviewsResult.rows.map(r => r.product_id);

    res.json(order);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update the status of an order and trigger notifications
 * @access  Private (Admin only)
 */
router.put('/:id/status', verifyToken, async (req, res, next) => {
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

    // Fire-and-forget the notification. Don't await it.
    sendWhatsappStatusUpdate(id, status, shippingInfo);

    res.json({ msg: 'Order status updated' });
  } catch (err) {
    next(err);
  }
});


module.exports = router;
