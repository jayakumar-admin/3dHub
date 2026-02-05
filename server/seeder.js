require('dotenv').config();
const db = require('./db');
const { users, categories, products, orders, order_items, settings, contact_submissions } = require('./seed-data');

// Function to clear all data from the tables
const destroyData = async () => {
  const client = await db.getClient();
  try {
    console.log('Destroying existing data...');
    // The order of deletion is important due to foreign key constraints
    await client.query('DELETE FROM contact_submissions');
    await client.query('DELETE FROM reviews');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM categories');
    await client.query('DELETE FROM users');
    await client.query('DELETE FROM settings');
    console.log('Data destroyed successfully.');
  } catch (error) {
    console.error('Error destroying data:', error);
  } finally {
    client.release();
  }
};

// Function to import all seed data into the tables
const importData = async () => {
  const client = await db.getClient();
  try {
    await destroyData(); // Start with a clean slate

    console.log('Seeding new data...');

    // 1. Seed users
    for (const user of users) {
      await client.query(
        'INSERT INTO users (id, name, email, password, avatar, phone, role, joined_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [user.id, user.name, user.email, user.password, user.avatar, user.phone, user.role, user.joined_date]
      );
    }
    console.log('Users seeded.');

    // 2. Seed categories
    for (const category of categories) {
      await client.query(
        'INSERT INTO categories (id, name, icon) VALUES ($1, $2, $3)',
        [category.id, category.name, category.icon]
      );
    }
    console.log('Categories seeded.');

    // 3. Seed products
    for (const product of products) {
      await client.query(
        'INSERT INTO products (id, name, description, price, old_price, stock, category_id, images, sku, enabled, tags, weight_kg, dimensions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        [product.id, product.name, product.description, product.price, product.old_price, product.stock, product.category_id, product.images, product.sku, product.enabled, product.tags, product.weight_kg, JSON.stringify(product.dimensions)]
      );
    }
    console.log('Products seeded.');

    // 4. Seed orders
    for (const order of orders) {
      await client.query(
        'INSERT INTO orders (id, order_date, customer_name, customer_email, shipping_address, total_amount, status, user_id, shipping_info) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [order.id, order.order_date, order.customer_name, order.customer_email, JSON.stringify(order.shipping_address), order.total_amount, order.status, order.user_id, JSON.stringify(order.shipping_info)]
      );
    }
    console.log('Orders seeded.');

    // 5. Seed order items
    for (const item of order_items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price, old_price, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [item.order_id, item.product_id, item.product_name, item.quantity, item.price, item.old_price, item.image]
      );
    }
    console.log('Order items seeded.');

    // 6. Seed settings
    await client.query(
      'INSERT INTO settings (id, data) VALUES ($1, $2)',
      [1, JSON.stringify(settings)]
    );
    console.log('Settings seeded.');

    // 7. Seed contact submissions
    for (const submission of contact_submissions) {
      await client.query(
        'INSERT INTO contact_submissions (name, email, message, status) VALUES ($1, $2, $3, $4)',
        [submission.name, submission.email, submission.message, submission.status]
      );
    }
    console.log('Contact submissions seeded.');


    console.log('Data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    client.release();
  }
};

// Main execution logic
const main = async () => {
  // Check for command-line argument to decide whether to import or destroy data
  if (process.argv[2] === '-d') {
    await destroyData();
  } else {
    await importData();
  }
  // End the pool connection to allow the script to exit
  await db.pool.end();
};

main();