// login.js - Login page functionality

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    
    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    }
    
    // Handle Enter key press
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    
    function handleLogin() {
        // Clear previous error
        loginError.textContent = '';
        
        // Validate inputs
        if (!usernameInput.value.trim()) {
            loginError.textContent = 'Username or email is required';
            return;
        }
        
        if (!passwordInput.value) {
            loginError.textContent = 'Password is required';
            return;
        }
        
        // Disable button and show loading state
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';
        
        // Prepare login data
        const loginData = {
            password: passwordInput.value
        };
        
        // Check if input is email or username
        if (usernameInput.value.includes('@')) {
            loginData.email = usernameInput.value.trim();
        } else {
            loginData.username = usernameInput.value.trim();
        }
        
        // Send login request
        fetch('/api/proxy/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Login failed');
                });
            }
            return response.json();
        })
        .then(data => {
            // Store token and user data
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to home page
            window.location.href = '/';
        })
        .catch(error => {
            loginError.textContent = error.message;
            
            // Reset button state
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
        });
    }
});
