<script lang="ts">
    import { goto } from '$app/navigation';
    import { authAPI } from '$lib/api';
    import type { RegisterData } from '$lib/types';
  
    let userData: RegisterData = {
      username: '',
      email: '',
      password: ''
    };
  
    let confirmPassword = '';
let loading = false;
let error = '';
let success = '';

async function handleRegister() {
  // Clear previous messages
  error = '';
  success = '';
  
  // Validation
  if (!userData.username || !userData.email || !userData.password) {
    error = 'Please fill in all fields';
    return;
  }

  if (userData.password !== confirmPassword) {
    error = 'Passwords do not match';
    return;
  }

  if (userData.password.length < 6) {
    error = 'Password must be at least 6 characters long';
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    error = 'Please enter a valid email address';
    return;
  }

  // Username validation (optional - adjust as needed)
  if (userData.username.length < 3) {
    error = 'Username must be at least 3 characters long';
    return;
  }

  loading = true;

  try {
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userData.username.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Registration successful
    success = 'Registration successful! Redirecting to login...';
    
    // Optional: Store the token if you want to auto-login
    // localStorage.setItem('token', data.token);
    // localStorage.setItem('user', JSON.stringify(data.user));

    // Clear form data
    userData = { username: '', email: '', password: '' };
    confirmPassword = '';

    // Redirect to login after 2 seconds
    setTimeout(() => {
      goto('/login');
    }, 2000);

  } catch (err) {
    console.error('Registration error:', err);
    error = err.message || 'Registration failed. Please try again.';
  } finally {
    loading = false;
  }
}
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        handleRegister();
      }
    }
  </script>
  
  <svelte:head>
    <title>Register - ShopApp</title>
  </svelte:head>
  
  <div class="register-container">
    <div class="register-card">
      <h1>Create Account</h1>
      
      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}
  
      {#if success}
        <div class="success-message">
          {success}
        </div>
      {/if}
  
      <form on:submit|preventDefault={handleRegister}>
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            bind:value={userData.username}
            on:keydown={handleKeydown}
            placeholder="Enter your username"
            required
          />
        </div>
  
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            bind:value={userData.email}
            on:keydown={handleKeydown}
            placeholder="Enter your email"
            required
          />
        </div>
  
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            bind:value={userData.password}
            on:keydown={handleKeydown}
            placeholder="Enter your password"
            required
          />
        </div>
  
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            bind:value={confirmPassword}
            on:keydown={handleKeydown}
            placeholder="Confirm your password"
            required
          />
        </div>
  
        <button type="submit" class="register-button" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
  
      <div class="register-footer">
        <p>Already have an account? <a href="/login">Login here</a></p>
      </div>
    </div>
  </div>
  
  <style>
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 1rem;
    }
  
    .register-card {
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
  
    .register-button {
      width: 100%;
      background-color: #059669;
      color: white;
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
  
    .register-button:hover:not(:disabled) {
      background-color: #047857;
    }
  
    .register-button:disabled {
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
  
    .success-message {
      background-color: #f0fdf4;
      color: #059669;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      border: 1px solid #bbf7d0;
    }
  
    .register-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }
  
    .register-footer a {
      color: #2563eb;
      text-decoration: none;
    }
  
    .register-footer a:hover {
      text-decoration: underline;
    }
  </style>