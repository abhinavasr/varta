from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

def admin_required(fn):
    """
    Decorator to check if the current user is an admin
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        # Here you would check if the user has admin privileges
        # For now, we'll just verify the JWT is valid
        return fn(*args, **kwargs)
    return wrapper

def validate_request_data(required_fields):
    """
    Decorator to validate request data contains required fields
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator
