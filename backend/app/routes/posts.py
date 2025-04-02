from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.post import Post
from app.models.post_media import PostMedia
from app.models.post_like import PostLike
from app.models.user import User
from app.models.token_balance import TokenBalance
from app.models.token_transaction import TokenTransaction
from app import db
from sqlalchemy import desc

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/', methods=['GET'])
def get_posts():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Get posts with pagination
        posts_query = Post.query.filter_by(is_published=True).order_by(desc(Post.created_at))
        posts_paginated = posts_query.paginate(page=page, per_page=per_page)
        
        posts_data = []
        for post in posts_paginated.items:
            post_dict = post.to_dict(include_user=True)
            posts_data.append(post_dict)
        
        return jsonify({
            'posts': posts_data,
            'total': posts_paginated.total,
            'pages': posts_paginated.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/<int:post_id>', methods=['GET'])
def get_post(post_id):
    try:
        post = Post.query.get(post_id)
        
        if not post or not post.is_published:
            return jsonify({'error': 'Post not found'}), 404
        
        # Increment view count
        post.view_count += 1
        db.session.commit()
        
        return jsonify({
            'post': post.to_dict(include_user=True)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/', methods=['POST'])
@jwt_required()
def create_post():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    if 'content' not in data:
        return jsonify({'error': 'Content is required'}), 400
    
    try:
        # Create new post
        new_post = Post(
            user_id=current_user_id,
            content=data['content'],
            is_reshare=data.get('is_reshare', False),
            original_post_id=data.get('original_post_id')
        )
        db.session.add(new_post)
        db.session.flush()  # Flush to get the post ID
        
        # Add media if provided
        if 'media' in data and isinstance(data['media'], list):
            for media_item in data['media']:
                if 'media_type' in media_item and 'media_url' in media_item:
                    new_media = PostMedia(
                        post_id=new_post.id,
                        media_type=media_item['media_type'],
                        media_url=media_item['media_url']
                    )
                    db.session.add(new_media)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Post created successfully',
            'post': new_post.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        post = Post.query.get(post_id)
        
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        if post.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized to update this post'}), 403
        
        # Update post fields
        if 'content' in data:
            post.content = data['content']
        
        if 'is_published' in data:
            post.is_published = data['is_published']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Post updated successfully',
            'post': post.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    current_user_id = get_jwt_identity()
    
    try:
        post = Post.query.get(post_id)
        
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        if post.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized to delete this post'}), 403
        
        db.session.delete(post)
        db.session.commit()
        
        return jsonify({
            'message': 'Post deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    current_user_id = get_jwt_identity()
    
    try:
        post = Post.query.get(post_id)
        
        if not post or not post.is_published:
            return jsonify({'error': 'Post not found'}), 404
        
        # Check if user already liked the post
        existing_like = PostLike.query.filter_by(
            post_id=post_id,
            user_id=current_user_id
        ).first()
        
        if existing_like:
            return jsonify({'error': 'You have already liked this post'}), 400
        
        # Check if user has enough tokens
        token_balance = TokenBalance.query.filter_by(user_id=current_user_id).first()
        
        if not token_balance or token_balance.balance < 0.1:
            return jsonify({'error': 'Insufficient token balance'}), 400
        
        # Create transaction for token deduction
        debit_transaction = TokenTransaction(
            user_id=current_user_id,
            amount=-0.1,
            transaction_type='like_debit',
            description='Token deduction for liking a post',
            reference_id=post_id
        )
        db.session.add(debit_transaction)
        
        # Update user's token balance
        token_balance.balance -= 0.1
        
        # Create transaction for token credit to post owner
        credit_transaction = TokenTransaction(
            user_id=post.user_id,
            amount=0.1,
            transaction_type='like_credit',
            description='Token credit for post being liked',
            reference_id=post_id
        )
        db.session.add(credit_transaction)
        
        # Update post owner's token balance
        owner_balance = TokenBalance.query.filter_by(user_id=post.user_id).first()
        if owner_balance:
            owner_balance.balance += 0.1
        
        # Create the like
        new_like = PostLike(
            post_id=post_id,
            user_id=current_user_id
        )
        db.session.add(new_like)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Post liked successfully',
            'like': new_like.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/<int:post_id>/like', methods=['DELETE'])
@jwt_required()
def unlike_post(post_id):
    current_user_id = get_jwt_identity()
    
    try:
        # Find the like
        like = PostLike.query.filter_by(
            post_id=post_id,
            user_id=current_user_id
        ).first()
        
        if not like:
            return jsonify({'error': 'You have not liked this post'}), 404
        
        # Delete the like
        db.session.delete(like)
        db.session.commit()
        
        return jsonify({
            'message': 'Post unliked successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
