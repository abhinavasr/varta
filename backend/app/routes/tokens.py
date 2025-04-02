from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from app import db
from app.models.user import User
from app.models.token_balance import TokenBalance
from app.models.token_transaction import TokenTransaction
import datetime

tokens_bp = Blueprint('tokens', __name__)

@tokens_bp.route('/balance', methods=['GET'])
@cross_origin()
def get_token_balance():
    # Get user ID from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authorization header is missing or invalid'}), 401
    
    # Extract token from header
    token = auth_header.split(' ')[1]
    
    # For simplicity in this example, we'll extract user_id from the token
    # In a real app, you would use JWT verification
    try:
        import jwt
        from app import app
        decoded = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        user_id = decoded['sub']
    except Exception as e:
        print(f"Token decode error: {str(e)}")
        return jsonify({'error': 'Invalid token'}), 401
    
    try:
        token_balance = TokenBalance.query.filter_by(user_id=user_id).first()
        
        if not token_balance:
            return jsonify({'error': 'Token balance not found'}), 404
        
        return jsonify({
            'token_balance': token_balance.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Get balance error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@tokens_bp.route('/transactions', methods=['GET'])
@cross_origin()
def get_token_transactions():
    # Get user ID from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authorization header is missing or invalid'}), 401
    
    # Extract token from header
    token = auth_header.split(' ')[1]
    
    # For simplicity in this example, we'll extract user_id from the token
    # In a real app, you would use JWT verification
    try:
        import jwt
        from app import app
        decoded = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        user_id = decoded['sub']
    except Exception as e:
        print(f"Token decode error: {str(e)}")
        return jsonify({'error': 'Invalid token'}), 401
    
    try:
        transactions = TokenTransaction.query.filter_by(user_id=user_id).order_by(TokenTransaction.created_at.desc()).all()
        
        return jsonify({
            'transactions': [transaction.to_dict() for transaction in transactions]
        }), 200
        
    except Exception as e:
        print(f"Get transactions error: {str(e)}")
        return jsonify({'error': str(e)}), 500
