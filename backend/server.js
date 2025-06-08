// backend/server.js - Clean implementation to fix path-to-regexp error
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Add this import
const jwt = require('jsonwebtoken'); // Add this import
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
// Basic middleware setup
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import database connection
const db = require('./config/database');
// For login
// Helper function to validate user credentials
async function validateCredentials(username, password) {
  try {
    // Query the database to find the user
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = rows[0];
    
    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    
    return user;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// Authentication route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('step1');
  console.log('Received credentials:', { username, password: password ? '[HIDDEN]' : 'undefined' });
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide both username and password' });
  }

  try {
    // Validate the credentials
    const user = await validateCredentials(username, password);
    
    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || '1234567890', // Use environment variable
      { expiresIn: '1h' }
    );

    // Send the response with the user details and the token
    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, username: user.username },
      token
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({ message: error.message });
  }
});


// Test database connection function
async function testDatabaseConnection() {
  try {
    const [result] = await db.execute('SELECT 1 as test');
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Simple root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running!', 
    timestamp: new Date().toISOString() 
  });
});


// Products route - directly defined (not using router)
app.get('/api/products', async (req, res) => {
  console.log('🛍️ Products endpoint called');
  
  try {
    console.log('📊 Executing database query...');
    
    const [products] = await db.execute(`
      SELECT 
        product_id, 
        name, 
        base_price as price, 
        image_url as image, 
        description,
        stock_quantity, 
        created_at
      FROM products 
      WHERE is_active = 1 
      ORDER BY created_at DESC
    `);
    
    console.log(`📦 Found ${products.length} products in database`);
    
    const formattedProducts = products.map(product => ({
      id: product.product_id,
      name: product.name,
      price: parseFloat(product.price),
      image: `/images/${product.product_id}.jpg`,
      description: product.description,
      stockQuantity: product.stock_quantity,
      categoryId: product.category_id,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));
    
    console.log('✅ Sending products response');
    res.json({
      success: true,
      products: formattedProducts,
      count: formattedProducts.length
    });
    
  } catch (error) {
    console.error('💥 Products endpoint error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// Add this to your server.js after your login endpoint

// Registration route
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  console.log('Registration attempt:', { username, email, password: password ? '[HIDDEN]' : 'undefined' });
  
  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide username, email, and password' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  try {
    // Check if user already exists (username or email)
    const [existingUsers] = await db.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?', 
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.username === username) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      if (existingUser.email === email) {
        return res.status(409).json({ message: 'Email already registered' });
      }
    }
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert new user into database
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, NOW())',
      [username, email, hashedPassword]
    );
    
    // Generate JWT token for immediate login after registration
    const token = jwt.sign(
      { id: result.insertId, username: username },
      process.env.JWT_SECRET || '1234567890',
      { expiresIn: '1h' }
    );
    
    // Send success response
    res.status(201).json({
      message: 'Registration successful',
      user: { 
        id: result.insertId, 
        username: username, 
        email: email 
      },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// Health check
app.get('/health', async (req, res) => {
  const dbStatus = await testDatabaseConnection();
  res.json({
    status: 'ok',
    database: dbStatus ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});
// Add these endpoints to your server.js
// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  jwt.verify(token, process.env.JWT_SECRET || '1234567890', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Get single product
app.get('/api/products/:id', async (req, res) => {
  const productId = req.params.id;
  
  try {
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [productId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});
// Create order
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Order items are required' });
  }
  if (!shippingAddress) {
    return res.status(400).json({ message: 'Shipping address is required' });
  }

  try {
    // Start transaction
    await db.execute('START TRANSACTION');

    // Calculate total and validate stock
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      // Get current product info
      const [productRows] = await db.execute(
        'SELECT * FROM products WHERE id = ?', 
        [item.productId]
      );

      if (productRows.length === 0) {
        await db.execute('ROLLBACK');
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }

      const product = productRows[0];

      // Check stock availability
      if (product.STOCKQUANTITY < item.quantity) {
        await db.execute('ROLLBACK');
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.NAME}. Available: ${product.STOCKQUANTITY}, Requested: ${item.quantity}` 
        });
      }

      // Calculate item total
      const itemTotal = product.PRICE * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.PRICE,
        total: itemTotal
      });

      // Update stock quantity
      await db.execute(
        'UPDATE products SET STOCKQUANTITY = STOCKQUANTITY - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    // Create order record
    const [orderResult] = await db.execute(
      'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, totalAmount, JSON.stringify(shippingAddress), paymentMethod, 'pending']
    );

    const orderId = orderResult.insertId;

    // Create order items
    for (const orderItem of orderItems) {
      await db.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price, total) VALUES (?, ?, ?, ?, ?)',
        [orderId, orderItem.productId, orderItem.quantity, orderItem.price, orderItem.total]
      );
    }

    // Commit transaction
    await db.execute('COMMIT');

    res.status(201).json({
      message: 'Order created successfully',
      orderId: orderId,
      totalAmount: totalAmount,
      items: orderItems
    });

  } catch (error) {
    // Rollback transaction on error
    await db.execute('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});
// Get user's orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [orders] = await db.execute(
      `SELECT o.*, 
       GROUP_CONCAT(
         JSON_OBJECT(
           'productId', oi.product_id,
           'productName', p.NAME,
           'quantity', oi.quantity,
           'price', oi.price,
           'total', oi.total
         )
       ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    // Parse the items JSON for each order
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.items ? JSON.parse(`[${order.items}]`) : [],
      shipping_address: JSON.parse(order.shipping_address)
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get single order
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  try {
    const [orderRows] = await db.execute(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderRows[0];

    // Get order items
    const [itemRows] = await db.execute(
      `SELECT oi.*, p.NAME as product_name, p.DESCRIPTION as product_description
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.json({
      ...order,
      shipping_address: JSON.parse(order.shipping_address),
      items: itemRows
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});


// Start server
async function startServer() {
  try {
    // Test database connection
    await testDatabaseConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Test at: http://localhost:${PORT}`);
      console.log(`📍 Products API: http://localhost:${PORT}/api/products`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();