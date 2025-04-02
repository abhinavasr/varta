// auth.js - Authentication related functionality

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('access_token') !== null;
}

// Update UI based on authentication status
function updateAuthUI() {
    const body = document.body;
    
    if (isAuthenticated()) {
        body.classList.add('is-authenticated');
        fetchTokenBalance();
    } else {
        body.classList.remove('is-authenticated');
    }
}

// Fetch token balance for authenticated user
function fetchTokenBalance() {
    if (!isAuthenticated()) return;
    
    fetch('/api/proxy/tokens/balance', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch token balance');
        }
        return response.json();
    })
    .then(data => {
        const headerTokenBalance = document.getElementById('header-token-balance');
        const mobileTokenBalance = document.getElementById('mobile-token-balance');
        const tokenBalanceCard = document.getElementById('token-balance-card');
        
        if (headerTokenBalance) {
            headerTokenBalance.textContent = data.token_balance.balance.toFixed(1);
        }
        
        if (mobileTokenBalance) {
            mobileTokenBalance.textContent = data.token_balance.balance.toFixed(1);
        }
        
        if (tokenBalanceCard) {
            tokenBalanceCard.innerHTML = `
                <h3>Token Balance</h3>
                <div class="token-balance-amount">${data.token_balance.balance.toFixed(1)}</div>
                <p>Use tokens to like posts and support content creators.</p>
            `;
        }
    })
    .catch(error => {
        console.error('Error fetching token balance:', error);
    });
}

// Handle logout
function setupLogout() {
    const logoutButton = document.getElementById('logout-button');
    const mobileLogoutButton = document.getElementById('mobile-logout-button');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    
    if (mobileLogoutButton) {
        mobileLogoutButton.addEventListener('click', logout);
    }
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    updateAuthUI();
    window.location.href = '/';
}

// Mobile menu toggle
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('show');
        });
    }
}

// Initialize auth functionality
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    setupLogout();
    setupMobileMenu();
});
