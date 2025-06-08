<script lang="ts">
    import { goto } from '$app/navigation';
    import { authAPI } from '$lib/api';
    import { setAuth } from '$lib/stores/auth';
    import type { LoginCredentials } from '$lib/types';
  
    let credentials: LoginCredentials = {
      username: '',
      password: ''
    };
  
    let loading = false;
    let error = '';
  
   async function handleLogin() {
  if (!credentials.username || !credentials.password) {
    error = 'Please fill in all fields';
    return;
  }

  loading = true;
  error = '';

  try {
    console.log('enter into handlelogin')
    console.log(credentials)
    // Send a POST request to /api/auth with the login credentials
    const response = await fetch('http://localhost:5000/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(credentials), // Send credentials in the request body
});


    // Check if the response is successful (status 200-299)
    if (!response.ok) {
      throw new Error('Login failed');
    }

    // Parse the response JSON (contains user data and token)
    const data = await response.json();

    // Assuming the response contains 'user' and 'token'
    setAuth(data.user, data.token);

    // Redirect to the products page
    goto('/products');
  } catch (err: any) {
    // Handle errors (e.g., invalid credentials)
    error = err.message || 'Login failed. Please try again.';
  } finally {
    loading = false;
  }
}

  
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        handleLogin();
      }
    }
  </script>
  
  <svelte:head>
    <title>Login - ShopApp</title>
  </svelte:head>
  
  <div class="login-container">
    <div class="login-card">
      <h1>Login</h1>
      
      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}
  
      <form on:submit|preventDefault={handleLogin}>
        <div class="form-group">
          <label for="username">UserName</label>
          <input
            type="username"
            id="username"
            bind:value={credentials.username}
            on:keydown={handleKeydown}
            placeholder="Enter your username"
            required
          />
        </div>
  
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            bind:value={credentials.password}
            on:keydown={handleKeydown}
            placeholder="Enter your password"
            required
          />
        </div>
  
        <button type="submit" class="login-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
  
      <div class="login-footer">
        <p>Don't have an account? <a href="/register">Register here</a></p>
      </div>
    </div>
  </div>
  
  <style>
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 1rem;
    }
  
    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }
  
    h1 {
      text-align: center;
      margin-bottom: 2rem;
      color: #1f2937;
    }
  
    .form-group {
      margin-bottom: 1.5rem;
    }
  
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }
  
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }
  
    input:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  
    .login-button {
      width: 100%;
      background-color: #2563eb;
      color: white;
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
  
    .login-button:hover:not(:disabled) {
      background-color: #1d4ed8;
    }
  
    .login-button:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
  
    .error-message {
      background-color: #fef2f2;
      color: #dc2626;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      border: 1px solid #fecaca;
    }
  
    .login-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }
  
    .login-footer a {
      color: #2563eb;
      text-decoration: none;
    }
  
    .login-footer a:hover {
      text-decoration: underline;
    }
  </style>