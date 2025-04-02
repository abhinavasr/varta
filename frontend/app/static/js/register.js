// register.js - Register page functionality

document.addEventListener('DOMContentLoaded', () => {
    const registerButton = document.getElementById('register-button');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const registerError = document.getElementById('register-error');
    
    if (registerButton) {
        registerButton.addEventListener('click', handleRegister);
    }
    
    // Handle Enter key press
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleRegister();
            }
        });
    }
    
    function handleRegister() {
        // Clear previous error
        registerError.textContent = '';
        
        // Validate inputs
        if (!usernameInput.value.trim()) {
            registerError.textContent = 'Username is required';
            return;
        }
        
        if (!emailInput.value.trim()) {
            registerError.textContent = 'Email is required';
            return;
        }
        
        if (!isValidEmail(emailInput.value.trim())) {
            registerError.textContent = 'Please enter a valid email address';
            return;
        }
        
        if (!passwordInput.value) {
            registerError.textContent = 'Password is required';
            return;
        }
        
        if (passwordInput.value.length < 6) {
            registerError.textContent = 'Password must be at least 6 characters';
            return;
        }
        
        if (passwordInput.value !== confirmPasswordInput.value) {
            registerError.textContent = 'Passwords do not match';
            return;
        }
        
        // Disable button and show loading state
        registerButton.disabled = true;
        registerButton.textContent = 'Registering...';
        
        // Prepare registration data
        const registerData = {
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value
        };
        
        // Send registration request
        fetch('/api/proxy/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Registration failed');
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
            registerError.textContent = error.message;
            
            // Reset button state
            registerButton.disabled = false;
            registerButton.textContent = 'Register';
        });
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});
