from flask import Blueprint, jsonify, request, session
from src.models.user import User, db
from src.models.points_transaction import PointsTransaction
from src.models.store_item import StoreItem
from src.models.purchase import Purchase
from functools import wraps
from sqlalchemy.exc import SQLAlchemyError, OperationalError
import logging

logger = logging.getLogger(__name__)
user_bp = Blueprint('user', __name__)

# Database error handler decorator


def handle_db_errors(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except OperationalError as e:
            logger.error(f"Database connection error: {e}")
            return jsonify({'error': 'Database connection error. Please try again later.'}), 503
        except SQLAlchemyError as e:
            logger.error(f"Database error: {e}")
            db.session.rollback()
            return jsonify({'error': 'Database operation failed. Please try again.'}), 500
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return jsonify({'error': 'An unexpected error occurred.'}), 500
    return decorated_function

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
        try:
            user = User.query.get(session['user_id'])
            if not user or user.role != 'teacher':
                return jsonify({'error': 'Teacher access required'}), 403
        except (OperationalError, SQLAlchemyError) as e:
            logger.error(f"Database error in teacher_required: {e}")
            return jsonify({'error': 'Database connection error'}), 503
        return f(*args, **kwargs)
    return decorated_function

# Authentication Routes


@user_bp.route('/auth/login', methods=['POST'])
@handle_db_errors
def login():
    print(
        f"[DEBUG] Login endpoint called with method: {request.method}", flush=True)
    print(f"[DEBUG] Request path: {request.path}", flush=True)
    print(
        f"[DEBUG] Request headers: Content-Type={request.headers.get('Content-Type')}", flush=True)

    data = request.json
    print(f"[DEBUG] Login data received: {data}", flush=True)

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        print("[DEBUG] Missing username or password", flush=True)
        return jsonify({'error': 'Username and password required'}), 400

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        session['user_id'] = user.id
        session['user_role'] = user.role
        response_data = {
            'message': 'Login successful',
            'user': user.to_dict_safe() if user.role == 'student' else user.to_dict()
        }
        print(
            f"[DEBUG] Login successful, returning: {response_data}", flush=True)
        return jsonify(response_data)

    print("[DEBUG] Invalid credentials", flush=True)
    return jsonify({'error': 'Invalid credentials'}), 401


@user_bp.route('/auth/logout', methods=['POST'])
@login_required
def logout():
    session.clear()
    return jsonify({'message': 'Logout successful'})


@user_bp.route('/auth/me', methods=['GET'])
@login_required
@handle_db_errors
def get_current_user():
    print(f"[DEBUG] /auth/me endpoint called", flush=True)
    print(
        f"[DEBUG] Session data: user_id={session.get('user_id')}, user_role={session.get('user_role')}", flush=True)

    user = User.query.get(session['user_id'])
    if not user:
        print("[DEBUG] User not found in database", flush=True)
        return jsonify({'error': 'User not found'}), 404

    print(
        f"[DEBUG] User found: {user.username}, role: {user.role}", flush=True)
    return jsonify(user.to_dict_safe() if user.role == 'student' else user.to_dict())

# User Management Routes


@user_bp.route('/users', methods=['GET'])
@teacher_required
@handle_db_errors
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])


@user_bp.route('/users', methods=['POST'])
@teacher_required
@handle_db_errors
def create_user():
    data = request.json

    # Validate required fields
    required_fields = ['username', 'password',
                       'first_name', 'last_name', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400

    # Handle email uniqueness - if email is empty or None, don't set it
    email = data.get('email')
    if email and email.strip():
        # Check if email already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400
    else:
        email = None  # Don't set email if it's empty

    user = User(
        username=data['username'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        role=data['role'],
        email=email,
        points_balance=data.get('points_balance', 0)
    )
    user.set_password(data['password'])

    try:
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Failed to create user: {e}")
        return jsonify({'error': 'Failed to create user'}), 500


@user_bp.route('/users/<int:user_id>', methods=['GET'])
@login_required
@handle_db_errors
def get_user(user_id):
    current_user = User.query.get(session['user_id'])

    # Students can only view their own profile
    if current_user.role == 'student' and current_user.id != user_id:
        return jsonify({'error': 'Access denied'}), 403

    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict_safe() if current_user.role == 'student' else user.to_dict())


@user_bp.route('/users/<int:user_id>', methods=['PUT'])
@teacher_required
@handle_db_errors
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

    try:
        db.session.commit()
        return jsonify(user.to_dict())
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Failed to update user: {e}")
        return jsonify({'error': 'Failed to update user'}), 500


@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@teacher_required
@handle_db_errors
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    try:
        db.session.delete(user)
        db.session.commit()
        return '', 204
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Failed to delete user: {e}")
        return jsonify({'error': 'Failed to delete user'}), 500
