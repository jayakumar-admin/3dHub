
// This file centralizes all SQL queries for the application.

const queries = {
  auth: {
    findAdminByEmail: 'SELECT * FROM users WHERE email = $1 AND role = \'Admin\'',
    findUserByEmail: 'SELECT * FROM users WHERE email = $1',
    createUser: `
      INSERT INTO users (id, name, email, password, avatar, phone, role, joined_date) 
      VALUES ($1, $2, $3, $4, $5, $6, 'Customer', CURRENT_DATE)
      RETURNING id, name, email, avatar, phone, role, joined_date AS "joinedDate"
    `,
    getUserPasswordById: 'SELECT password FROM users WHERE id = $1',
    changePassword: 'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
  },
  products: {
    getAllProducts: `
      SELECT 
        p.id, p.name, p.description, p.price, p.old_price AS "oldPrice", p.stock, 
        p.category_id AS "category", p.images, p.sku, p.enabled, p.tags, 
        p.weight_kg AS "weight", p.dimensions,
        COALESCE(rev.review_count, 0) AS "reviews", 
        COALESCE(rev.avg_rating, 0) AS "rating"
      FROM products p
      LEFT JOIN (
          SELECT product_id, COUNT(*) AS review_count, AVG(rating) AS avg_rating
          FROM reviews
          GROUP BY product_id
      ) rev ON p.id = rev.product_id
      ORDER BY p.created_at DESC`,
    getProductById: `
      SELECT 
        p.id, p.name, p.description, p.price, p.old_price AS "oldPrice", p.stock, 
        p.category_id AS "category", p.images, p.sku, p.enabled, p.tags, 
        p.weight_kg AS "weight", p.dimensions,
        COALESCE(rev.review_count, 0) AS "reviews", 
        COALESCE(rev.avg_rating, 0) AS "rating"
      FROM products p
      LEFT JOIN (
          SELECT product_id, COUNT(*) AS review_count, AVG(rating) AS avg_rating
          FROM reviews
          GROUP BY product_id
      ) rev ON p.id = rev.product_id
      WHERE p.id = $1`,
    createProduct: `
      INSERT INTO products (id, name, description, price, old_price, stock, category_id, images, sku, enabled, tags, weight_kg, dimensions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, name, description, price, old_price AS "oldPrice", stock, category_id AS "category", images, sku, enabled, tags, weight_kg AS "weight", dimensions
    `,
    updateProduct: `
      UPDATE products
      SET name = $1, description = $2, price = $3, old_price = $4, stock = $5, category_id = $6, images = $7, sku = $8, enabled = $9, tags = $10, weight_kg = $11, dimensions = $12, updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING id, name, description, price, old_price AS "oldPrice", stock, category_id AS "category", images, sku, enabled, tags, weight_kg AS "weight", dimensions
    `,
    deleteProduct: 'DELETE FROM products WHERE id = $1',
    getAllCategories: 'SELECT * FROM categories ORDER BY name ASC',
    getReviewsByProductId: `
      SELECT r.id, r.product_id AS "productId", r.rating, r.comment, r.created_at AS "createdAt",
             u.id AS "userId", u.name AS "userName", u.avatar AS "userAvatar"
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `,
    createReview: `
      INSERT INTO reviews (product_id, user_id, order_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
  },
  orders: {
    getAllOrders: `
      SELECT
          o.id,
          o.order_date AS "orderDate",
          o.customer_name AS "customerName",
          o.customer_email AS "customerEmail",
          o.customer_phone AS "customerPhone",
          u.avatar AS "customerAvatar",
          o.total_amount AS "totalAmount",
          o.shipping_address AS "shippingAddress",
          o.status,
          o.user_id,
          o.shipping_info AS "shippingInfo",
          o.payment_details AS "paymentDetails",
          COALESCE(json_agg(
              json_build_object(
                  'productId', oi.product_id,
                  'productName', oi.product_name,
                  'quantity', oi.quantity,
                  'price', oi.price,
                  'oldPrice', oi.old_price,
                  'image', oi.image
              )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) AS items
      FROM
          orders o
      LEFT JOIN
          order_items oi ON o.id = oi.order_id
      LEFT JOIN
          users u ON o.user_id = u.id
      GROUP BY
          o.id, u.avatar
      ORDER BY
          o.order_date DESC
    `,
    getOrdersByUserId: `
      SELECT
          o.id,
          o.order_date AS "orderDate",
          o.customer_name AS "customerName",
          o.customer_email AS "customerEmail",
          o.customer_phone AS "customerPhone",
          u.avatar AS "customerAvatar",
          o.total_amount AS "totalAmount",
          o.shipping_address AS "shippingAddress",
          o.status,
          o.user_id,
          o.shipping_info AS "shippingInfo",
          o.payment_details AS "paymentDetails",
          COALESCE(json_agg(
              json_build_object(
                  'productId', oi.product_id,
                  'productName', oi.product_name,
                  'quantity', oi.quantity,
                  'price', oi.price,
                  'oldPrice', oi.old_price,
                  'image', oi.image
              )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) AS items
      FROM
          orders o
      LEFT JOIN
          order_items oi ON o.id = oi.order_id
      LEFT JOIN
          users u ON o.user_id = u.id
      WHERE
          o.user_id = $1
      GROUP BY
          o.id, u.avatar
      ORDER BY
          o.order_date DESC
    `,
    getOrderById: `
      SELECT 
        o.id, 
        o.order_date as "orderDate",
        o.customer_name as "customerName",
        o.customer_email as "customerEmail",
        o.customer_phone as "customerPhone",
        u.avatar AS "customerAvatar",
        o.total_amount as "totalAmount",
        o.shipping_address as "shippingAddress",
        o.status,
        o.user_id,
        o.shipping_info as "shippingInfo",
        o.payment_details as "paymentDetails"
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1`,
    getOrderItemsByOrderId: `
      SELECT 
        id, order_id, product_id AS "productId", product_name AS "productName", quantity, price, 
        old_price as "oldPrice", image 
      FROM order_items WHERE order_id = $1`,
    getReviewedProductIdsByOrderId: `SELECT DISTINCT product_id FROM reviews WHERE order_id = $1`,
    createOrder: `
      INSERT INTO orders (id, customer_name, customer_email, customer_phone, total_amount, shipping_address, status, user_id, payment_details)
      VALUES ($1, $2, $3, $4, $5, $6, 'Pending', $7, $8)
      RETURNING id
    `,
    createOrderItem: `
      INSERT INTO order_items (order_id, product_id, product_name, quantity, price, old_price, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    updateOrderStatus: 'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    updateOrderStatusWithShipping: 'UPDATE orders SET status = $1, shipping_info = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
  },
  users: {
    getAllUsers: `
      SELECT 
        id, name, email, avatar, phone, role, joined_date AS "joinedDate" 
      FROM users ORDER BY joined_date DESC`,
    updateUser: `
      UPDATE users SET name = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $4 
      RETURNING id, name, email, avatar, phone, role, joined_date AS "joinedDate"`,
    updateUserProfile: `
      UPDATE users SET name = $1, email = $2, phone = $3, avatar = $4, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $5 
      RETURNING id, name, email, avatar, phone, role, joined_date AS "joinedDate"`,
    deleteUser: 'DELETE FROM users WHERE id = $1',
  },
  settings: {
    getSettings: 'SELECT data FROM settings WHERE id = 1',
    updateSettings: 'UPDATE settings SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
  },
  contact: {
    createSubmission: 'INSERT INTO contact_submissions (name, email, message) VALUES ($1, $2, $3) RETURNING *',
    getAllSubmissions: 'SELECT * FROM contact_submissions ORDER BY submitted_at DESC',
    updateStatus: 'UPDATE contact_submissions SET status = $1 WHERE id = $2 RETURNING *',
  }
};

module.exports = queries;
