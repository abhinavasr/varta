// post-details.js - Post details page functionality

document.addEventListener('DOMContentLoaded', () => {
    // Get post ID from URL
    const postId = window.location.pathname.split('/').pop();
    
    // Elements
    const postDetails = document.getElementById('post-details');
    const postLoadingSpinner = document.getElementById('post-loading-spinner');
    const relatedPostsContainer = document.getElementById('related-posts-container');
    const relatedPostsLoadingSpinner = document.getElementById('related-posts-loading-spinner');
    
    // Load post details
    loadPostDetails();
    
    function loadPostDetails() {
        if (!postId || isNaN(postId)) {
            window.location.href = '/';
            return;
        }
        
        if (postLoadingSpinner) {
            postLoadingSpinner.style.display = 'flex';
        }
        
        fetch(`/api/proxy/posts/${postId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch post');
                }
                return response.json();
            })
            .then(data => {
                if (postLoadingSpinner) {
                    postLoadingSpinner.style.display = 'none';
                }
                
                renderPostDetails(data.post);
                loadRelatedPosts(data.post.user_id);
            })
            .catch(error => {
                console.error('Error loading post:', error);
                if (postLoadingSpinner) {
                    postLoadingSpinner.style.display = 'none';
                }
                postDetails.innerHTML = '<p class="error-message">Failed to load post. Please try again later.</p>';
            });
    }
    
    function renderPostDetails(post) {
        if (!postDetails) return;
        
        // Format date
        const postDate = new Date(post.created_at);
        const formattedDate = postDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Create post HTML
        postDetails.innerHTML = `
            <div class="post-header">
                <div class="post-author">
                    <img src="${post.author.profile?.avatar_url || '/static/img/default-avatar.png'}" alt="Avatar" class="author-avatar">
                    <div class="author-info">
                        <h4>${post.author.profile?.display_name || post.author.username}</h4>
                        <a href="/profile?user_id=${post.author.id}" class="author-username">@${post.author.username}</a>
                    </div>
                </div>
                <div class="post-date">
                    <span>${formattedDate}</span>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
                ${createMediaElements(post.media)}
            </div>
            <div class="post-stats-detailed">
                <div class="stat">
                    <i class="material-icons">favorite</i>
                    <span id="like-count">${post.like_count || 0}</span>
                    <span>Likes</span>
                </div>
                <div class="stat">
                    <i class="material-icons">visibility</i>
                    <span>${post.view_count || 0}</span>
                    <span>Views</span>
                </div>
                ${post.is_reshare ? `
                <div class="reshare-info">
                    <i class="material-icons">repeat</i>
                    <span>Reshared from <a href="/post/${post.original_post_id}">original post</a></span>
                </div>
                ` : ''}
            </div>
            <div class="post-actions">
                <button id="like-button" class="action-button" data-post-id="${post.id}">
                    <i class="material-icons">favorite_border</i>
                    <span>Like</span>
                </button>
                <button id="share-button" class="action-button" data-post-id="${post.id}">
                    <i class="material-icons">share</i>
                    <span>Share</span>
                </button>
                <button id="reshare-button" class="action-button" data-post-id="${post.id}">
                    <i class="material-icons">repeat</i>
                    <span>Reshare</span>
                </button>
            </div>
        `;
        
        // Setup like button
        const likeButton = document.getElementById('like-button');
        if (likeButton) {
            likeButton.addEventListener('click', () => handleLikePost(post.id));
        }
        
        // Setup share button
        const shareButton = document.getElementById('share-button');
        if (shareButton) {
            shareButton.addEventListener('click', () => {
                const postUrl = window.location.origin + '/post/' + post.id;
                
                // Check if Web Share API is available
                if (navigator.share) {
                    navigator.share({
                        title: 'Varta Post',
                        text: post.content.substring(0, 100) + '...',
                        url: postUrl
                    })
                    .catch(error => {
                        console.error('Error sharing:', error);
                        // Fallback to clipboard
                        copyToClipboard(postUrl);
                    });
                } else {
                    // Fallback to clipboard
                    copyToClipboard(postUrl);
                }
            });
        }
        
        // Setup reshare button
        const reshareButton = document.getElementById('reshare-button');
        if (reshareButton) {
            reshareButton.addEventListener('click', () => {
                if (!isAuthenticated()) {
                    window.location.href = '/login';
                    return;
                }
                
                window.location.href = `/create-post?reshare=${post.id}`;
            });
        }
    }
    
    function loadRelatedPosts(userId) {
        if (!relatedPostsContainer || !userId) return;
        
        if (relatedPostsLoadingSpinner) {
            relatedPostsLoadingSpinner.style.display = 'flex';
        }
        
        fetch(`/api/proxy/users/${userId}/posts?per_page=3`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch related posts');
                }
                return response.json();
            })
            .then(data => {
                if (relatedPostsLoadingSpinner) {
                    relatedPostsLoadingSpinner.style.display = 'none';
                }
                
                if (data.posts.length === 0) {
                    relatedPostsContainer.innerHTML = '<p class="no-posts-message">No related posts found.</p>';
                    return;
                }
                
                // Filter out current post
                const filteredPosts = data.posts.filter(post => post.id != postId);
                
                if (filteredPosts.length === 0) {
                    relatedPostsContainer.innerHTML = '<p class="no-posts-message">No other posts from this user.</p>';
                    return;
                }
                
                // Clear container
                relatedPostsContainer.innerHTML = '';
                
                // Render related posts
                filteredPosts.slice(0, 3).forEach(post => {
                    const postElement = createRelatedPostElement(post);
                    relatedPostsContainer.appendChild(postElement);
                });
            })
            .catch(error => {
                console.error('Error loading related posts:', error);
                if (relatedPostsLoadingSpinner) {
                    relatedPostsLoadingSpinner.style.display = 'none';
                }
                relatedPostsContainer.innerHTML = '<p class="error-message">Failed to load related posts.</p>';
            });
    }
    
    function createRelatedPostElement(post) {
        const postElement = document.createElement('div');
        postElement.className = 'related-post-card';
        
        // Format date
        const postDate = new Date(post.created_at);
        const formattedDate = postDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        // Truncate content
        const truncatedContent = post.content.length > 100 
            ? post.content.substring(0, 100) + '...' 
            : post.content;
        
        // Create post HTML
        postElement.innerHTML = `
            <div class="related-post-content">
                <p>${truncatedContent}</p>
            </div>
            <div class="related-post-footer">
                <span class="related-post-date">${formattedDate}</span>
                <a href="/post/${post.id}" class="related-post-link">Read more</a>
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
    
    function handleLikePost(postId) {
        if (!isAuthenticated()) {
            window.location.href = '/login';
            return;
        }
        
        const likeButton = document.getElementById('like-button');
        const likeCount = document.getElementById('like-count');
        
        if (!likeButton || !likeCount) return;
        
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
                likeButton.innerHTML = '<i class="material-icons">favorite_border</i><span>Like</span>';
                
                // Update like count
                const currentCount = parseInt(likeCount.textContent);
                likeCount.textContent = currentCount - 1;
            } else {
                likeButton.classList.add('liked');
                likeButton.innerHTML = '<i class="material-icons">favorite</i><span>Liked</span>';
                
                // Update like count
                const currentCount = parseInt(likeCount.textContent);
                likeCount.textContent = currentCount + 1;
                
                // Update token balance
                fetchTokenBalance();
            }
        })
        .catch(error => {
            console.error('Error liking post:', error);
            alert(error.message);
        });
    }
    
    function copyToClipboard(text) {
        // Create temporary input element
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        
        // Show toast notification
        alert('Link copied to clipboard!');
    }
});
