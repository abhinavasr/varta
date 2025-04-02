// profile.js - Profile page functionality

document.addEventListener('DOMContentLoaded', () => {
    // Get profile ID from URL if available, otherwise use current user
    const urlParams = new URLSearchParams(window.location.search);
    const profileUserId = urlParams.get('user_id');
    
    // Elements
    const profileDisplayName = document.getElementById('profile-display-name');
    const profileUsername = document.getElementById('profile-username');
    const profileBio = document.getElementById('profile-bio');
    const profileAvatar = document.getElementById('profile-avatar');
    const postsCount = document.getElementById('posts-count');
    const tokenBalance = document.getElementById('token-balance');
    const profileActions = document.getElementById('profile-actions');
    const userPostsContainer = document.getElementById('user-posts-container');
    const postsLoadingSpinner = document.getElementById('posts-loading-spinner');
    const transactionsContainer = document.getElementById('transactions-container');
    const transactionsLoadingSpinner = document.getElementById('transactions-loading-spinner');
    
    // Tab elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Modal elements
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const saveProfileButton = document.getElementById('save-profile-button');
    const editDisplayName = document.getElementById('edit-display-name');
    const editBio = document.getElementById('edit-bio');
    const editAvatarUrl = document.getElementById('edit-avatar-url');
    const editLocation = document.getElementById('edit-location');
    const editWebsite = document.getElementById('edit-website');
    const editProfileError = document.getElementById('edit-profile-error');
    
    // Initialize profile
    loadProfile();
    
    // Setup tab switching
    if (tabButtons && tabContents) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show selected tab content
                tabContents.forEach(content => {
                    if (content.id === `${tabName}-tab`) {
                        content.classList.remove('hidden');
                    } else {
                        content.classList.add('hidden');
                    }
                });
                
                // Load tab content if needed
                if (tabName === 'posts' && userPostsContainer.innerHTML === '') {
                    loadUserPosts();
                } else if (tabName === 'transactions' && transactionsContainer.innerHTML === '') {
                    loadTokenTransactions();
                }
            });
        });
    }
    
    // Setup modal close buttons
    if (closeModalButtons) {
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (editProfileModal) {
                    editProfileModal.classList.remove('show');
                }
            });
        });
    }
    
    // Setup save profile button
    if (saveProfileButton) {
        saveProfileButton.addEventListener('click', saveProfile);
    }
    
    function loadProfile() {
        const userId = profileUserId || (isAuthenticated() ? JSON.parse(localStorage.getItem('user')).id : null);
        
        if (!userId) {
            window.location.href = '/login';
            return;
        }
        
        fetch(`/api/proxy/users/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }
                return response.json();
            })
            .then(data => {
                const user = data.user;
                const profile = user.profile || {};
                
                // Update profile info
                if (profileDisplayName) {
                    profileDisplayName.textContent = profile.display_name || user.username;
                }
                
                if (profileUsername) {
                    profileUsername.textContent = `@${user.username}`;
                }
                
                if (profileBio) {
                    profileBio.textContent = profile.bio || 'No bio yet.';
                }
                
                if (profileAvatar) {
                    profileAvatar.src = profile.avatar_url || '/static/img/default-avatar.png';
                }
                
                if (tokenBalance && user.token_balance) {
                    tokenBalance.textContent = user.token_balance.balance.toFixed(1);
                }
                
                // Show edit button if it's the current user's profile
                if (profileActions && isAuthenticated()) {
                    const currentUser = JSON.parse(localStorage.getItem('user'));
                    if (currentUser.id === user.id) {
                        profileActions.innerHTML = `
                            <button id="edit-profile-button" class="btn btn-secondary">
                                <i class="material-icons">edit</i> Edit Profile
                            </button>
                        `;
                        
                        // Setup edit profile button
                        const editProfileButton = document.getElementById('edit-profile-button');
                        if (editProfileButton) {
                            editProfileButton.addEventListener('click', () => {
                                openEditProfileModal(profile);
                            });
                        }
                    }
                }
                
                // Load user posts
                loadUserPosts();
            })
            .catch(error => {
                console.error('Error loading profile:', error);
                alert('Failed to load profile. Please try again later.');
            });
    }
    
    function loadUserPosts(page = 1) {
        const userId = profileUserId || (isAuthenticated() ? JSON.parse(localStorage.getItem('user')).id : null);
        
        if (!userId) {
            return;
        }
        
        if (postsLoadingSpinner) {
            postsLoadingSpinner.style.display = 'flex';
        }
        
        fetch(`/api/proxy/users/${userId}/posts?page=${page}&per_page=10`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }
                return response.json();
            })
            .then(data => {
                if (postsLoadingSpinner) {
                    postsLoadingSpinner.style.display = 'none';
                }
                
                if (postsCount) {
                    postsCount.textContent = data.total || 0;
                }
                
                if (data.posts.length === 0) {
                    userPostsContainer.innerHTML = '<p class="no-posts-message">No posts yet.</p>';
                    return;
                }
                
                // Clear loading spinner
                userPostsContainer.innerHTML = '';
                
                // Render posts
                data.posts.forEach(post => {
                    const postElement = createPostElement(post);
                    userPostsContainer.appendChild(postElement);
                });
                
                // Add pagination if needed
                if (data.pages > 1) {
                    const paginationElement = createPaginationElement(data.current_page, data.pages, loadUserPosts);
                    userPostsContainer.appendChild(paginationElement);
                }
            })
            .catch(error => {
                console.error('Error loading posts:', error);
                if (postsLoadingSpinner) {
                    postsLoadingSpinner.style.display = 'none';
                }
                userPostsContainer.innerHTML = '<p class="error-message">Failed to load posts. Please try again later.</p>';
            });
    }
    
    function loadTokenTransactions(page = 1) {
        if (!isAuthenticated()) {
            return;
        }
        
        if (transactionsLoadingSpinner) {
            transactionsLoadingSpinner.style.display = 'flex';
        }
        
        fetch(`/api/proxy/tokens/transactions?page=${page}&per_page=10`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch transactions');
                }
                return response.json();
            })
            .then(data => {
                if (transactionsLoadingSpinner) {
                    transactionsLoadingSpinner.style.display = 'none';
                }
                
                if (data.transactions.length === 0) {
                    transactionsContainer.innerHTML = '<p class="no-transactions-message">No transactions yet.</p>';
                    return;
                }
                
                // Clear loading spinner
                transactionsContainer.innerHTML = '';
                
                // Create transactions table
                const tableElement = document.createElement('table');
                tableElement.className = 'transactions-table';
                
                // Add table header
                tableElement.innerHTML = `
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody id="transactions-tbody"></tbody>
                `;
                
                transactionsContainer.appendChild(tableElement);
                const tbody = document.getElementById('transactions-tbody');
                
                // Render transactions
                data.transactions.forEach(transaction => {
                    const row = document.createElement('tr');
                    
                    // Format date
                    const transactionDate = new Date(transaction.created_at);
                    const formattedDate = transactionDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                    
                    // Format amount with color based on positive/negative
                    const amountClass = transaction.amount >= 0 ? 'positive-amount' : 'negative-amount';
                    
                    row.innerHTML = `
                        <td>${formattedDate}</td>
                        <td>${formatTransactionType(transaction.transaction_type)}</td>
                        <td class="${amountClass}">${transaction.amount.toFixed(1)}</td>
                        <td>${transaction.description || '-'}</td>
                    `;
                    
                    tbody.appendChild(row);
                });
                
                // Add pagination if needed
                if (data.pages > 1) {
                    const paginationElement = createPaginationElement(data.current_page, data.pages, loadTokenTransactions);
                    transactionsContainer.appendChild(paginationElement);
                }
            })
            .catch(error => {
                console.error('Error loading transactions:', error);
                if (transactionsLoadingSpinner) {
                    transactionsLoadingSpinner.style.display = 'none';
                }
                transactionsContainer.innerHTML = '<p class="error-message">Failed to load transactions. Please try again later.</p>';
            });
    }
    
    function formatTransactionType(type) {
        switch (type) {
            case 'like_credit':
                return 'Like Received';
            case 'like_debit':
                return 'Like Given';
            case 'transfer_credit':
                return 'Transfer Received';
            case 'transfer_debit':
                return 'Transfer Sent';
            default:
                return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    }
    
    function createPostElement(post) {
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        
        // Format date
        const postDate = new Date(post.created_at);
        const formattedDate = postDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Create post HTML
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-author">
                    <img src="${post.author?.profile?.avatar_url || '/static/img/default-avatar.png'}" alt="Avatar" class="author-avatar">
                    <div class="author-info">
                        <h4>${post.author?.profile?.display_name || post.author?.username || 'Unknown User'}</h4>
                        <span class="post-date">${formattedDate}</span>
                    </div>
                </div>
                <div class="post-actions">
                    <button class="post-menu-button">
                        <i class="material-icons">more_vert</i>
                    </button>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
                ${createMediaElements(post.media)}
            </div>
            <div class="post-footer">
                <div class="post-stats">
                    <span><i class="material-icons">favorite</i> ${post.like_count || 0}</span>
                    <span><i class="material-icons">visibility</i> ${post.view_count || 0}</span>
                </div>
                <div class="post-buttons">
                    <button class="like-button" data-post-id="${post.id}">
                        <i class="material-icons">favorite_border</i> Like
                    </button>
                    <a href="/post/${post.id}" class="comment-button">
                        <i class="material-icons">comment</i> Comment
                    </a>
                    <button class="share-button" data-post-id="${post.id}">
                        <i class="material-icons">share</i> Share
                    </button>
                </div>
            </div>
        `;
        
        return postElement;
    }
    
    function createMediaElements(mediaItems) {
        if (!mediaItems || mediaItems.length === 0) {
            return '';
        }
        
        let mediaHtml = '<div class="post-media">';
        
        mediaItems.forEach(media => {
            if (media.media_type === 'image') {
                mediaHtml += `<img src="${media.media_url}" alt="Post image" class="post-image">`;
            } else if (media.media_type === 'video') {
                mediaHtml += `
                    <video controls class="post-video">
                        <source src="${media.media_url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
            }
        });
        
        mediaHtml += '</div>';
        return mediaHtml;
    }
    
    function createPaginationElement(currentPage, totalPages, loadFunction) {
        const paginationElement = document.createElement('div');
        paginationElement.className = 'pagination';
        
        let paginationHtml = '';
        
        if (currentPage > 1) {
            paginationHtml += `<button class="pagination-button" data-page="${currentPage - 1}">Previous</button>`;
        }
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHtml += `<button class="pagination-button active" data-page="${i}">${i}</button>`;
            } else if (
                i === 1 || 
                i === totalPages || 
                (i >= currentPage - 1 && i <= currentPage + 1)
            ) {
                paginationHtml += `<button class="pagination-button" data-page="${i}">${i}</button>`;
            } else if (
                i === currentPage - 2 || 
                i === currentPage + 2
            ) {
                paginationHtml += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        if (currentPage < totalPages) {
            paginationHtml += `<button class="pagination-button" data-page="${currentPage + 1}">Next</button>`;
        }
        
        paginationElement.innerHTML = paginationHtml;
        
        // Add event listeners to pagination buttons
        paginationElement.querySelectorAll('.pagination-button').forEach(button => {
            if (button.dataset.page) {
                button.addEventListener('click', () => {
                    loadFunction(parseInt(button.dataset.page));
                    window.scrollTo(0, 0);
                });
            }
        });
        
        return paginationElement;
    }
    
    function openEditProfileModal(profile) {
        if (!editProfileModal) return;
        
        // Fill form with current profile data
        if (editDisplayName) {
            editDisplayName.value = profile.display_name || '';
        }
        
        if (editBio) {
            editBio.value = profile.bio || '';
        }
        
        if (editAvatarUrl) {
            editAvatarUrl.value = profile.avatar_url || '';
        }
        
        if (editLocation) {
            editLocation.value = profile.location || '';
        }
        
        if (editWebsite) {
            editWebsite.value = profile.website || '';
        }
        
        // Clear error message
        if (editProfileError) {
            editProfileError.textContent = '';
        }
        
        // Show modal
        editProfileModal.classList.add('show');
    }
    
    function saveProfile() {
        if (!isAuthenticated()) {
            return;
        }
        
        // Clear error message
        if (editProfileError) {
            editProfileError.textContent = '';
        }
        
        // Disable button and show loading state
        saveProfileButton.disabled = true;
        saveProfileButton.textContent = 'Saving...';
        
        // Prepare profile data
        const profileData = {
            display_name: editDisplayName.value.trim(),
            bio: editBio.value.trim(),
            avatar_url: editAvatarUrl.value.trim(),
            location: editLocation.value.trim(),
            website: editWebsite.value.trim()
        };
        
        // Send update request
        fetch('/api/proxy/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify(profileData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to update profile');
                });
            }
            return response.json();
        })
        .then(data => {
            // Close modal
            editProfileModal.classList.remove('show');
            
            // Reload profile
            loadProfile();
            
            // Reset button state
            saveProfileButton.disabled = false;
            saveProfileButton.textContent = 'Save Changes';
        })
        .catch(error => {
            if (editProfileError) {
                editProfileError.textContent = error.message;
            }
            
            // Reset button state
            saveProfileButton.disabled = false;
            saveProfileButton.textContent = 'Save Changes';
        });
    }
});
