from flask import Blueprint, jsonify, request, session
from src.models.user import User, db
from src.models.points_transaction import PointsTransaction
from functools import wraps

points_bp = Blueprint('points', __name__)

# Authentication decorators (duplicated for modularity)
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

# Points Management Routes
@points_bp.route('/points/<int:user_id>', methods=['GET'])
@login_required
def get_user_points(user_id):
    current_user = User.query.get(session['user_id'])
    
    # Students can only view their own points
    if current_user.role == 'student' and current_user.id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    user = User.query.get_or_404(user_id)
    return jsonify({
        'user_id': user.id,
        'points_balance': user.points_balance,
        'first_name': user.first_name,
        'last_name': user.last_name
    })

@points_bp.route('/points/award', methods=['POST'])
@teacher_required
def award_points():
    data = request.json
    teacher_id = session['user_id']
    
    # Validate required fields
    required_fields = ['user_id', 'amount', 'reason']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    user_id = data['user_id']
    amount = data['amount']
    reason = data['reason']
    
    if amount <= 0:
        return jsonify({'error': 'Amount must be positive'}), 400
    
    # Get the student
    student = User.query.get_or_404(user_id)
    if student.role != 'student':
        return jsonify({'error': 'Can only award points to students'}), 400
    
    # Create transaction record
    transaction = PointsTransaction(
        user_id=user_id,
        transaction_type='earned',
        amount=amount,
        reason=reason,
        created_by=teacher_id
    )
    
    # Update student's points balance
    student.points_balance += amount
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Points awarded successfully',
        'transaction': transaction.to_dict(),
        'new_balance': student.points_balance
    }), 201

@points_bp.route('/points/transactions/<int:user_id>', methods=['GET'])
@login_required
def get_user_transactions(user_id):
    current_user = User.query.get(session['user_id'])
    
    # Students can only view their own transactions
    if current_user.role == 'student' and current_user.id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    transactions = PointsTransaction.query.filter_by(user_id=user_id)\
        .order_by(PointsTransaction.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'transactions': [t.to_dict() for t in transactions.items],
        'total': transactions.total,
        'pages': transactions.pages,
        'current_page': page
    })

@points_bp.route('/points/transactions', methods=['GET'])
@teacher_required
def get_all_transactions():
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    user_id = request.args.get('user_id', type=int)
    
    query = PointsTransaction.query
    
    if user_id:
        query = query.filter_by(user_id=user_id)
    
    transactions = query.order_by(PointsTransaction.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    # Include user information in the response
    result = []
    for transaction in transactions.items:
        transaction_dict = transaction.to_dict()
        user = User.query.get(transaction.user_id)
        if user:
            transaction_dict['user_name'] = f"{user.first_name} {user.last_name}"
        
        if transaction.created_by:
            teacher = User.query.get(transaction.created_by)
            if teacher:
                transaction_dict['teacher_name'] = f"{teacher.first_name} {teacher.last_name}"
        
        result.append(transaction_dict)
    
    return jsonify({
        'transactions': result,
        'total': transactions.total,
        'pages': transactions.pages,
        'current_page': page
    })

@points_bp.route('/points/leaderboard', methods=['GET'])
@teacher_required
def get_points_leaderboard():
    # Get top students by points balance
    limit = request.args.get('limit', 10, type=int)
    
    students = User.query.filter_by(role='student')\
        .order_by(User.points_balance.desc())\
        .limit(limit).all()
    
    leaderboard = []
    for i, student in enumerate(students, 1):
        leaderboard.append({
            'rank': i,
            'user_id': student.id,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'points_balance': student.points_balance
        })
    
    return jsonify({'leaderboard': leaderboard})

