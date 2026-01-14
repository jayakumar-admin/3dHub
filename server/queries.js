
// This file centralizes all SQL queries for the application.

const queries = {
  auth: {
    findAdminByEmail: 'SELECT * FROM users WHERE email = $1 AND role = \'Admin\'',
  },
  products: {
    getAllProducts: 'SELECT * FROM products ORDER BY created_at DESC',
    getProductById: 'SELECT * FROM products WHERE id = $1',
    createProduct: `
      INSERT INTO products (id, name, description, price, old_price, stock, category_id, images, sku, enabled, tags, weight_kg, dimensions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `,
    updateProduct: `
      UPDATE products
      SET name = $1, description = $2, price = $3, old_price = $4, stock = $5, category_id = $6, images = $7, sku = $8, enabled = $9, tags = $10, weight_kg = $11, dimensions = $12, updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `,
    deleteProduct: 'DELETE FROM products WHERE id = $1',
    getAllCategories: 'SELECT * FROM categories ORDER BY name ASC',
  },
  orders: {
    getAllOrders: 'SELECT * FROM orders ORDER BY order_date DESC',
    getOrderById: 'SELECT * FROM orders WHERE id = $1',
    getOrderItemsByOrderId: 'SELECT * FROM order_items WHERE order_id = $1',
    createOrder: `
      INSERT INTO orders (id, customer_name, customer_email, total_amount, shipping_address, status, user_id)
      VALUES ($1, $2, $3, $4, $5, 'Pending', $6)
      RETURNING *
    `,
    createOrderItem: `
      INSERT INTO order_items (order_id, product_id, product_name, quantity, price, old_price, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    updateOrderStatus: 'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    updateOrderStatusWithShipping: 'UPDATE orders SET status = $1, shipping_info = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
  },
  users: {
    getAllUsers: 'SELECT id, name, email, avatar, role, joined_date FROM users ORDER BY joined_date DESC',
    updateUser: 'UPDATE users SET name = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, name, email, avatar, role, joined_date',
    deleteUser: 'DELETE FROM users WHERE id = $1',
  },
  settings: {
    getSettings: 'SELECT data FROM settings WHERE id = 1',
    updateSettings: 'UPDATE settings SET data = $1 WHERE id = 1',
  }
};

module.exports = queries;
