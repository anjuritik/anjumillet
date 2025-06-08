<!-- frontend/src/routes/products/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { cartStore } from '$lib/stores/cart.js';
  
  let products = [];
  let loading = true;
  let error = null;
  
  // API configuration
  const API_BASE_URL = 'http://localhost:5000/api'; // Adjust to your backend URL
  
  
// Enhanced fetch function with detailed debugging
async function fetchProducts() {
  try {
    console.log('🔄 Starting fetch products...');
    console.log('📍 API URL:', `${API_BASE_URL}/products`);
    
    // Check if backend is reachable
    const response = await fetch(`${API_BASE_URL}/products`);
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    console.log('📡 Response headers:', [...response.headers.entries()]);
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get response text first to see raw data
    const responseText = await response.text();
    console.log('📄 Raw response:', responseText);
    
    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ Parsed JSON data:', data);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('❌ Response was not valid JSON:', responseText);
      throw new Error('Invalid JSON response from server');
    }
    
    if (data.success) {
      console.log('✅ Products loaded successfully:', data.products.length, 'items');
      products = data.products;
      error = null; // Clear any previous errors
      console.log('products', products);
    } else {
      console.error('❌ API returned error:', data.error);
      error = data.error || 'Failed to fetch products';
    }
    
  } catch (err) {
    console.error('💥 Fetch error details:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    // Check specific error types
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      error = 'Cannot connect to server. Check if backend is running on port 5000.';
      console.error('🔥 Network error - backend might be down');
    } else if (err.name === 'SyntaxError') {
      error = 'Server returned invalid data format';
      console.error('🔥 JSON parsing error - check backend response format');
    } else {
      error = `Connection failed: ${err.message}`;
    }
  } finally {
    loading = false;
    console.log('🏁 Fetch complete. Loading:', loading, 'Error:', error);
  }
}

// Test backend connectivity separately
async function testBackendConnection() {
  try {
    console.log('🧪 Testing backend connection...');
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/`); // Test root endpoint
    console.log('🧪 Backend root response:', response.status, response.statusText);
    
    if (response.ok) {
      const text = await response.text();
      console.log('🧪 Backend root content:', text);
    }
  } catch (err) {
    console.error('🧪 Backend connection test failed:', err.message);
  }
}
/* async function handleAddToCart(product) {
  console.log('Adding to cart:', product);
  // Implement your cart logic here
  alert(`Added ${product.name} to cart!`);
}
 */// Handle add to cart - THIS IS THE KEY FUNCTION
  function handleAddToCart(product) {
    try {
      // Create a normalized product object for the cart
      const cartProduct = {
        id: product.id,
        name: product.NAME || product.name, // Handle both NAME and name
        price: product.PRICE || product.price, // Handle both PRICE and price
        image: product.IMAGE || product.image || '/placeholder-image.jpg', // Handle image
        STOCKQUANTITY: product.STOCKQUANTITY || product.stockQuantity || 0
      };
      
      cartStore.addItem(cartProduct, 1);
      
      // Optional: Show success message
      alert(`${cartProduct.name} added to cart!`);
      
    } catch (err) {
      // Show error message
      alert(err.message);
      console.error('Error adding to cart:', err);
    }
  }



// Call this in onMount for additional debugging
onMount(async () => {
  console.log('🚀 Component mounted, starting debug...');
 // await testBackendConnection(); // Test basic connectivity first
  await fetchProducts(); // Then fetch products
});




</script>

<div class="container">
  <h1>Our Products</h1>
       
  {#if loading}
    <div class="loading">
      <p>Loading products...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>Error loading products: {error}</p>
      <button on:click={fetchProducts}>Retry</button>
    </div>
  {:else if products.length === 0}
    <div class="no-products">
      <p>No products available at the moment.</p>
    </div>
  {:else}
    <div class="products-grid">
      {#each products as product}
      <div class="product-card">
        <img src={product.image} alt={product.NAME} />
        <div class="product-info">
          <h3>{product.name}</h3>
          <p class="description">{product.description}</p>
          <div class="product-footer">
            <span class="price">₹{product.price}</span>
            <div class="product-actions">
              <button
                class="add-to-cart-btn"
                on:click={() => handleAddToCart(product)}
                disabled={product.STOCKQUANTITY === 0}
              >
                {product.STOCKQUANTITY === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              {#if product.STOCKQUANTITY > 0 && product.STOCKQUANTITY <= 5}
                <span class="low-stock">Only {product.STOCKQUANTITY} left!</span>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/each}
    </div>
    
    <div class="products-info">
      <p>Showing {products.length} product{products.length !== 1 ? 's' : ''}</p>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }
  
  .product-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.2s;
  }
  
  .product-card:hover {
    transform: translateY(-4px);
  }
  
  .product-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .product-info {
    padding: 1rem;
  }
  
  .product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
  }
  
  .price {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2563eb;
  }
  
  .add-to-cart-btn {
    padding: 0.5rem 1rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .add-to-cart-btn:disabled {
    background: #6b7280;
    cursor: not-allowed;
  }
  
  .low-stock {
    color: #dc2626;
    font-size: 0.8rem;
    font-weight: bold;
  }
  
  .loading, .error, .no-products {
    text-align: center;
    padding: 2rem;
  }
  
  .error button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>