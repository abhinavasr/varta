from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.post import Post
from app.models.token_balance import TokenBalance
from app import db

users_bp = Blueprint('users', __name__)

@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user profile
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        
        # Get token balance
        token_balance = TokenBalance.query.filter_by(user_id=user_id).first()
        
        user_data = user.to_dict()
        if profile:
            user_data['profile'] = profile.to_dict()
        if token_balance:
            user_data['token_balance'] = token_balance.to_dict()
        
        return jsonify({
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        # Get user profile
        profile = UserProfile.query.filter_by(user_id=current_user_id).first()
        
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
        
        # Update profile fields
        if 'display_name' in data:
            profile.display_name = data['display_name']
        
        if 'bio' in data:
            profile.bio = data['bio']
        
        if 'avatar_url' in data:
            profile.avatar_url = data['avatar_url']
        
        if 'location' in data:
            profile.location = data['location']
        
        if 'website' in data:
            profile.website = data['website']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': profile.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<int:user_id>/posts', methods=['GET'])
def get_user_posts(user_id):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Check if user exists
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user posts with pagination
        posts_query = Post.query.filter_by(user_id=user_id, is_published=True).order_by(Post.created_at.desc())
        posts_paginated = posts_query.paginate(page=page, per_page=per_page)
        
        posts_data = []
        for post in posts_paginated.items:
            post_dict = post.to_dict()
            posts_data.append(post_dict)
        
        return jsonify({
            'posts': posts_data,
            'total': posts_paginated.total,
            'pages': posts_paginated.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
