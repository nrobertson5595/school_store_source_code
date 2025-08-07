from flask import Blueprint, jsonify, request, session
from src.models.user import User, db
from src.models.points_transaction import PointsTransaction
from src.models.store_item import StoreItem
from src.models.purchase import Purchase
from functools import wraps

user_bp = Blueprint('user', __name__)

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def teacher_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        user = User.query.get(session['user_id'])
        if not user or user.role != 'teacher':
            return jsonify({'error': 'Teacher access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Authentication Routes
@user_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        session['user_id'] = user.id
        session['user_role'] = user.role
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict_safe() if user.role == 'student' else user.to_dict()
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@user_bp.route('/auth/logout', methods=['POST'])
@login_required
def logout():
    session.clear()
    return jsonify({'message': 'Logout successful'})

@user_bp.route('/auth/me', methods=['GET'])
@login_required
def get_current_user():
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict_safe() if user.role == 'student' else user.to_dict())

# User Management Routes
@user_bp.route('/users', methods=['GET'])
@teacher_required
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users', methods=['POST'])
@teacher_required
def create_user():
    data = request.json
    
    # Validate required fields
    required_fields = ['username', 'password', 'first_name', 'last_name', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    user = User(
        username=data['username'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        role=data['role'],
        email=data.get('email'),
        points_balance=data.get('points_balance', 0)
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@user_bp.route('/users/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    current_user = User.query.get(session['user_id'])
    
    # Students can only view their own profile
    if current_user.role == 'student' and current_user.id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict_safe() if current_user.role == 'student' else user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
@teacher_required
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.role = data.get('role', user.role)
    
    if 'password' in data:
        user.set_password(data['password'])
    
    db.session.commit()
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@teacher_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204
