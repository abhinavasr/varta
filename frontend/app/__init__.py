from flask import Flask, render_template, redirect, url_for, request, jsonify, session, flash
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev_key')

# Configure CORS
CORS(app)

# Backend API URL
BACKEND_URL = os.environ.get('BACKEND_URL', 'http://localhost:8080/api')

@app.route('/')
def index():
    """Home page route"""
    return render_template('index.html')

@app.route('/login')
def login():
    """Login page route"""
    return render_template('login.html')

@app.route('/register')
def register():
    """Register page route"""
    return render_template('register.html')

@app.route('/profile')
def profile():
    """User profile page route"""
    return render_template('profile.html')

@app.route('/create-post')
def create_post():
    """Create post page route"""
    return render_template('create_post.html')

@app.route('/post/<int:post_id>')
def post_details(post_id):
    """Post details page route"""
    return render_template('post_details.html', post_id=post_id)

@app.route('/logout')
def logout():
    """Logout route"""
    session.clear()
    return redirect(url_for('index'))

@app.route('/api/proxy/<path:endpoint>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy_api(endpoint):
    """
    Proxy API requests to the backend
    This helps avoid CORS issues during development and deployment
    """
    url = f"{BACKEND_URL}/{endpoint}"
    
    # Get the authorization header from localStorage via request headers
    headers = {}
    auth_header = request.headers.get('Authorization')
    if auth_header:
        headers['Authorization'] = auth_header
    
    # Forward the request to the backend API
    if request.method == 'GET':
        response = requests.get(url, headers=headers, params=request.args)
    elif request.method == 'POST':
        response = requests.post(url, headers=headers, json=request.get_json())
    elif request.method == 'PUT':
        response = requests.put(url, headers=headers, json=request.get_json())
    elif request.method == 'DELETE':
        response = requests.delete(url, headers=headers)
    
    # Return the response from the backend API
    return jsonify(response.json()), response.status_code

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')
