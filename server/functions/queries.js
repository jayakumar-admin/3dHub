// This file centralizes all SQL queries for the application.

const queries = {
  auth: {
    findAdminByEmail: 'SELECT * FROM users WHERE email = $1 AND role = \'Admin\'',
    findUserByEmail: 'SELECT * FROM users WHERE email = $1',
    createUser: `
      INSERT INTO users (id, name, email, password, avatar, role, joined_date) 
      VALUES ($1, $2, $3, $4, $5, 'Customer', CURRENT_DATE)
      RETURNING id, name, email, avatar, role, joined_date AS "joinedDate"
    `
  },
  products: {
    getAllProducts: `
      SELECT 
        id, name, description, price, old_price AS "oldPrice", stock, category_id AS "category", 
        images, sku, enabled, tags, weight_kg AS "weight", dimensions, created_at, updated_at 
      FROM products ORDER BY created_at DESC`,
    getProductById: `
      SELECT 
        id, name, description, price, old_price AS "oldPrice", stock, category_id AS "category", 
        images, sku, enabled, tags, weight_kg AS "weight", dimensions, created_at, updated_at
      FROM products WHERE id = $1`,
    createProduct: `
      INSERT INTO products (id, name, description, price, old_price, stock, category_id, images, sku, enabled, tags, weight_kg, dimensions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING 
        id, name, description, price, old_price AS "oldPrice", stock, category_id AS "category", 
        images, sku, enabled, tags, weight_kg AS "weight", dimensions, created_at, updated_at
    `,
    updateProduct: `
      UPDATE products
      SET name = $1, description = $2, price = $3, old_price = $4, stock = $5, category_id = $6, images = $7, sku = $8, enabled = $9, tags = $10, weight_kg = $11, dimensions = $12, updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING 
        id, name, description, price, old_price AS "oldPrice", stock, category_id AS "category", 
        images, sku, enabled, tags, weight_kg AS "weight", dimensions, created_at, updated_at
    `,
    deleteProduct: 'DELETE FROM products WHERE id = $1',
    getAllCategories: 'SELECT * FROM categories ORDER BY name ASC',
  },
  orders: {
    getAllOrders: `
      SELECT 
        id, order_date AS "orderDate", customer_name AS "customerName", customer_email AS "customerEmail", 
        total_amount AS "totalAmount", shipping_address AS "shippingAddress", status, user_id, 
        shipping_info AS "shippingInfo", created_at, updated_at 
      FROM orders ORDER BY order_date DESC`,
    getOrderById: `
      SELECT
        id, order_date AS "orderDate", customer_name AS "customerName", customer_email AS "customerEmail", 
        total_amount AS "totalAmount", shipping_address AS "shippingAddress", status, user_id, 
        shipping_info AS "shippingInfo", created_at, updated_at 
      FROM orders WHERE id = $1`,
    getOrderItemsByOrderId: `
      SELECT 
        id, order_id, product_id AS "productId", product_name AS "productName", quantity, price, 
        old_price as "oldPrice", image 
      FROM order_items WHERE order_id = $1`,
    createOrder: `
      INSERT INTO orders (id, customer_name, customer_email, total_amount, shipping_address, status, user_id)
      VALUES ($1, $2, $3, $4, $5, 'Pending', $6)
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
        id, name, email, avatar, role, joined_date AS "joinedDate" 
      FROM users ORDER BY joined_date DESC`,
    updateUser: `
      UPDATE users SET name = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $4 
      RETURNING id, name, email, avatar, role, joined_date AS "joinedDate"`,
    deleteUser: 'DELETE FROM users WHERE id = $1',
  },
  settings: {
    getSettings: 'SELECT data FROM settings WHERE id = 1',
    updateSettings: 'UPDATE settings SET data = $1 WHERE id = 1',
  },
  contact: {
    createSubmission: 'INSERT INTO contact_submissions (name, email, message) VALUES ($1, $2, $3) RETURNING *',
    getAllSubmissions: 'SELECT * FROM contact_submissions ORDER BY submitted_at DESC',
    updateStatus: 'UPDATE contact_submissions SET status = $1 WHERE id = $2 RETURNING *',
  }
};

module.exports = queries;