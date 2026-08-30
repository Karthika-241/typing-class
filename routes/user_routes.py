from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from services.typing_service import TypingService

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/api/users', methods=['POST'])
def create_or_find_user():
    """Endpoint to sign up or log in a kid.
    
    If the name and age match an existing user, it logs them in (returns the user).
    Otherwise, it creates a new user database record.
    """
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    age = data.get('age')

    # Validate using the TypingService
    validation = TypingService.validate_user_data(name, age)
    if not validation['is_valid']:
        return jsonify({
            "success": False,
            "message": validation['message']
        }), 400

    # Search for an existing user with the same name and age
    existing_user = User.query.filter_by(name=name, age=int(age)).first()
    
    if existing_user:
        return jsonify({
            "success": True,
            "message": "Welcome back!",
            "user": existing_user.to_dict()
        }), 200

    # Create new user
    try:
        new_user = User(name=name, age=int(age))
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "User profile created successfully!",
            "user": new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Error saving user to database: {str(e)}"
        }), 500


@user_bp.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Retrieve details of a user by ID."""
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({
            "success": False,
            "message": "User not found!"
        }), 404

    return jsonify({
        "success": True,
        "user": user.to_dict()
    }), 200
