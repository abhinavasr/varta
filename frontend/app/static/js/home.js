// home.js - Home page functionality

document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.getElementById('posts-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Load posts when page loads
    loadPosts();
    
    function loadPosts(page = 1) {
        if (loadingSpinner) {
            loadingSpinner.style.display = 'flex';
        }
        
        fetch(`/api/proxy/posts?page=${page}&per_page=10`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }
                return response.json();
            })
            .then(data => {
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'none';
                }
                
                if (data.posts.length === 0) {
                    postsContainer.innerHTML = '<p class="no-posts-message">No posts yet. Be the first to create a post!</p>';
                    return;
                }
                
                // Clear loading spinner
                postsContainer.innerHTML = '';
                
                // Render posts
                data.posts.forEach(post => {
                    const postElement = createPostElement(post);
                    postsContainer.appendChild(postElement);
                });
                
                // Add pagination if needed
                if (data.pages > 1) {
                    const paginationElement = createPaginationElement(data.current_page, data.pages);
                    postsContainer.appendChild(paginationElement);
                }
            })
            .catch(error => {
                console.error('Error loading posts:', error);
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'none';
                }
                postsContainer.innerHTML = '<p class="error-message">Failed to load posts. Please try again later.</p>';
            });
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
                    <img src="${post.author.profile?.avatar_url || '/static/img/default-avatar.png'}" alt="Avatar" class="author-avatar">
                    <div class="author-info">
                        <h4>${post.author.profile?.display_name || post.author.username}</h4>
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
                    <span><i class="material-icons">favorite</i> ${post.like_count}</span>
                    <span><i class="material-icons">visibility</i> ${post.view_count}</span>
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
        
        // Add event listeners
        const likeButton = postElement.querySelector('.like-button');
        if (likeButton) {
            likeButton.addEventListener('click', () => handleLikePost(post.id, likeButton));
        }
        
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
    
    function createPaginationElement(currentPage, totalPages) {
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
                    loadPosts(parseInt(button.dataset.page));
                    window.scrollTo(0, 0);
                });
            }
        });
        
        return paginationElement;
    }
    
    function handleLikePost(postId, likeButton) {
        if (!isAuthenticated()) {
            window.location.href = '/login';
            return;
        }
        
        const isLiked = likeButton.classList.contains('liked');
        const method = isLiked ? 'DELETE' : 'POST';
        
        fetch(`/api/proxy/posts/${postId}/like`, {
            method: method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to like post');
                });
            }
            return response.json();
        })
        .then(data => {
            if (isLiked) {
                likeButton.classList.remove('liked');
                likeButton.innerHTML = '<i class="material-icons">favorite_border</i> Like';
                
                // Update like count
                const likeCountElement = likeButton.closest('.post-footer').querySelector('.post-stats span:first-child');
                const currentCount = parseInt(likeCountElement.textContent.trim().split(' ')[1]);
                likeCountElement.innerHTML = `<i class="material-icons">favorite</i> ${currentCount - 1}`;
            } else {
                likeButton.classList.add('liked');
                likeButton.innerHTML = '<i class="material-icons">favorite</i> Liked';
                
                // Update like count
                const likeCountElement = likeButton.closest('.post-footer').querySelector('.post-stats span:first-child');
                const currentCount = parseInt(likeCountElement.textContent.trim().split(' ')[1]);
                likeCountElement.innerHTML = `<i class="material-icons">favorite</i> ${currentCount + 1}`;
                
                // Update token balance
                fetchTokenBalance();
            }
        })
        .catch(error => {
            console.error('Error liking post:', error);
            alert(error.message);
        });
    }
});
