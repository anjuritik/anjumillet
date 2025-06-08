<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { user, isAuthenticated, initAuth, clearAuth } from '$lib/stores/auth';
    import { cartItemCount } from '$lib/stores/cart';
  
    onMount(() => {
      initAuth();
    });
  
    function handleLogout() {
      clearAuth();
      goto('/');
    }
  </script>
  
  <nav class="navbar">
    <div class="nav-container">

      <a href="/" class="nav-brand">Home</a>
      
      <div class="nav-links">
        <a href="/products" class="nav-link">Products</a>
        
        {#if $isAuthenticated}
          <a href="/cart" class="nav-link">
            Cart ({$cartItemCount})
          </a>
          <span class="nav-user">Welcome, {$user?.username}</span>
          <button on:click={handleLogout} class="nav-button">Logout</button>
        {:else}
          <a href="/login" class="nav-link">Login</a>
          <a href="/register" class="nav-link">Register</a>
        {/if}
      </div>
    </div>
  </nav>
  
  <main class="main-content">
    <slot />
  </main>
  
  <style>
    .navbar {
      background-color: #667eea;
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1rem;
    }
  
    .nav-brand {
      font-size: 1.5rem;
      font-weight: bold;
      text-decoration: none;
      color: white;
    }
  
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
  
    .nav-link {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
  
    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  
    .nav-user {
      color: #e5e7eb;
      font-size: 0.9rem;
    }
  
    .nav-button {
      background-color: #dc2626;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
  
    .nav-button:hover {
      background-color: #b91c1c;
    }
  
    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
  
    @media (max-width: 768px) {
      .nav-container {
        flex-direction: column;
        gap: 1rem;
      }
      
      .nav-links {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  </style>