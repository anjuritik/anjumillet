// backend/routes/products.js - Fixed version
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/products - Fetch all active products
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Fetching products from database...');
    
    // Fixed: Use execute instead of query, fixed column aliases and typo
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
    
    console.log(`📦 Found ${products.length} products`);
    
    
    const formattedProducts = products.map(product => ({
      id: product.id,
      pid: product.product_id,
      name: product.name,
      price: parseFloat(product.price),
      image: `/images/${product.product_id}.jpg`, // assumes .jpg format
      description: product.description,
      stockQuantity: product.stock_quantity,
      createdAt: product.created_at
    }));
    console.log('✅ Products formatted successfully');
    
    res.json({
      success: true,
      products: formattedProducts,
      count: formattedProducts.length
    });
    
  } catch (error) {
    console.error('💥 Database error details:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('SQL State:', error.sqlState);
    console.error('Full error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;