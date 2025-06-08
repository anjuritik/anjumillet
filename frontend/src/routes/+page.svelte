<script lang="ts">
    import { onMount } from 'svelte';
    import { isAuthenticated, initAuth } from '$lib/stores/auth';
  
    onMount(() => {
      initAuth();
    });
  </script>
  
  <svelte:head>
    <title>Welcome to ShopApp</title>
  </svelte:head>
  
  <div class="hero">
    <div class="hero-content">
      <h1>Welcome to ShopApp</h1>
      <p>Your one-stop destination for online shopping</p>
      
      {#if $isAuthenticated}
        <div class="action-buttons">
          <a href="/products" class="cta-button">Browse Products</a>
        </div>
      {:else}
        <div class="action-buttons">
          <a href="/login" class="cta-button">Login</a>
          <a href="/register" class="cta-button secondary">Register</a>
        </div>
      {/if}

      
    </div>
  </div>
  
  <div class="features">
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🛍️</div>
        <h3>Wide Selection</h3>
        <p>Thousands of products across multiple categories</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🚚</div>
        <h3>Fast Delivery</h3>
        <p>Quick and reliable shipping to your doorstep</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🔒</div>
        <h3>Secure Shopping</h3>
        <p>Safe and secure payment processing</p>
      </div>
    </div>
  </div>
  
  <style>
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4rem 1rem;
      text-align: center;
    }
  
    .hero-content h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      font-weight: bold;
    }
  
    .hero-content p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
  
    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
  
    .cta-button {
      display: inline-block;
      padding: 1rem 2rem;
      background-color: #ffffff;
      color: #667eea;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }
  
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }
  
    .cta-button.secondary {
      background-color: transparent;
      color: white;
      border: 2px solid white;
    }
  
    .features {
      padding: 4rem 1rem;
      background-color: #f8fafc;
    }
  
    .features-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
  
    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    }
  
    .feature-card:hover {
      transform: translateY(-4px);
    }
  
    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
  
    .feature-card h3 {
      margin-bottom: 1rem;
      color: #1f2937;
    }
  
    .feature-card p {
      color: #6b7280;
      line-height: 1.6;
    }
  
    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }
      
      .action-buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .cta-button {
        width: 200px;
      }
    }
  </style>