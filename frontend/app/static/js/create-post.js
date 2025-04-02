// create-post.js - Create post page functionality

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }
    
    // Elements
    const postContent = document.getElementById('post-content');
    const mediaUrl = document.getElementById('media-url');
    const mediaType = document.getElementById('media-type');
    const addMediaButton = document.getElementById('add-media-button');
    const mediaPreview = document.getElementById('media-preview');
    const createPostButton = document.getElementById('create-post-button');
    const createPostError = document.getElementById('create-post-error');
    
    // Media items array
    const mediaItems = [];
    
    // Setup add media button
    if (addMediaButton) {
        addMediaButton.addEventListener('click', addMedia);
    }
    
    // Setup create post button
    if (createPostButton) {
        createPostButton.addEventListener('click', createPost);
    }
    
    function addMedia() {
        // Validate media URL
        if (!mediaUrl.value.trim()) {
            createPostError.textContent = 'Please enter a media URL';
            return;
        }
        
        const url = mediaUrl.value.trim();
        const type = mediaType.value;
        
        // Add to media items array
        mediaItems.push({
            media_type: type,
            media_url: url
        });
        
        // Update preview
        updateMediaPreview();
        
        // Clear input
        mediaUrl.value = '';
    }
    
    function updateMediaPreview() {
        if (!mediaPreview) return;
        
        // Clear preview
        mediaPreview.innerHTML = '';
        
        // Add media items to preview
        mediaItems.forEach((item, index) => {
            const mediaItemElement = document.createElement('div');
            mediaItemElement.className = 'media-preview-item';
            
            if (item.media_type === 'image') {
                mediaItemElement.innerHTML = `
                    <img src="${item.media_url}" alt="Media preview" class="media-preview-image">
                    <button type="button" class="remove-media-button" data-index="${index}">
                        <i class="material-icons">close</i>
                    </button>
                `;
            } else if (item.media_type === 'video') {
                mediaItemElement.innerHTML = `
                    <div class="video-preview">
                        <i class="material-icons">videocam</i>
                        <span>${item.media_url}</span>
                    </div>
                    <button type="button" class="remove-media-button" data-index="${index}">
                        <i class="material-icons">close</i>
                    </button>
                `;
            }
            
            mediaPreview.appendChild(mediaItemElement);
            
            // Add event listener to remove button
            const removeButton = mediaItemElement.querySelector('.remove-media-button');
            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    mediaItems.splice(index, 1);
                    updateMediaPreview();
                });
            }
        });
    }
    
    function createPost() {
        // Clear error
        createPostError.textContent = '';
        
        // Validate content
        if (!postContent.value.trim()) {
            createPostError.textContent = 'Please enter some content for your post';
            return;
        }
        
        // Disable button and show loading state
        createPostButton.disabled = true;
        createPostButton.textContent = 'Posting...';
        
        // Prepare post data
        const postData = {
            content: postContent.value.trim(),
            media: mediaItems
        };
        
        // Send create post request
        fetch('/api/proxy/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify(postData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to create post');
                });
            }
            return response.json();
        })
        .then(data => {
            // Redirect to post details or home page
            window.location.href = `/post/${data.post.id}`;
        })
        .catch(error => {
            createPostError.textContent = error.message;
            
            // Reset button state
            createPostButton.disabled = false;
            createPostButton.textContent = 'Post';
        });
    }
});
