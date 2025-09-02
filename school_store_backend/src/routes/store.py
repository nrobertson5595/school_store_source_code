from flask import Blueprint, jsonify, request, session
from src.models.user import User, db
from src.models.store_item import StoreItem
from src.models.purchase import Purchase
from src.models.points_transaction import PointsTransaction
from functools import wraps
import os
from werkzeug.utils import secure_filename

store_bp = Blueprint('store', __name__)

# Authentication decorators


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

# Store Item Management Routes


@store_bp.route('/store/items', methods=['GET'])
@login_required
def get_store_items():
    print(f"DEBUG: /store/items called by user_id: {session.get('user_id')}")

    # Get query parameters
    category = request.args.get('category')
    available_only = request.args.get(
        'available_only', 'true').lower() == 'true'

    query = StoreItem.query

    if category:
        query = query.filter_by(category=category)

    if available_only:
        query = query.filter_by(is_available=True)

    items = query.order_by(StoreItem.name).all()
    items_list = [item.to_dict() for item in items]

    print(f"DEBUG: Returning {len(items_list)} items")
    print(
        f"DEBUG: First item (if any): {items_list[0] if items_list else 'No items'}")

    # The frontend expects {success: true, items: [...]} but backend returns just [...]
    # This is the issue - let's confirm with logging first
    response_data = items_list  # Currently returning array directly
    print(
        f"DEBUG: Response structure - is list: {isinstance(response_data, list)}")

    return jsonify(response_data)


@store_bp.route('/store/items/<int:item_id>', methods=['GET'])
@login_required
def get_store_item(item_id):
    item = StoreItem.query.get_or_404(item_id)
    return jsonify(item.to_dict())


@store_bp.route('/store/items', methods=['POST'])
@teacher_required
def create_store_item():
    data = request.json

    # Debug logging

    # Validate required fields
    required_fields = ['name']
    for field in required_fields:
        if field not in data:

            return jsonify({'error': f'{field} is required'}), 400
        if not data[field]:

            return jsonify({'error': f'{field} cannot be empty'}), 400

    # Get available_sizes and convert from uppercase to lowercase
    available_sizes = data.get('available_sizes', ['medium'])

    # Convert sizes to lowercase (frontend sends 'XS', 'S', 'M', 'L', 'XL')
    if isinstance(available_sizes, list):
        size_mapping = {
            'XS': 'xsmall',
            'S': 'small',
            'M': 'medium',
            'L': 'large',
            'XL': 'xlarge'
        }
        available_sizes = [size_mapping.get(
            size.upper(), size.lower()) for size in available_sizes]

    valid_sizes = set(StoreItem.SIZE_PRICES.keys())

    if not isinstance(available_sizes, list) or not available_sizes:

        return jsonify({'error': 'available_sizes must be a non-empty list'}), 400

    # Check for invalid sizes
    invalid_sizes = [
        size for size in available_sizes if size not in valid_sizes]
    if invalid_sizes:

        return jsonify({
            'error': f'Invalid sizes: {invalid_sizes}. Valid sizes are: {list(valid_sizes)}'
        }), 400

    # Create the item
    item = StoreItem(
        name=data['name'],
        description=data.get('description'),
        category=data.get('category'),
        image_url=data.get('image_url'),
        is_available=data.get('is_available', True)
    )

    # Set available sizes
    item.set_available_sizes(available_sizes)

    db.session.add(item)
    db.session.commit()

    return jsonify(item.to_dict()), 201


@store_bp.route('/store/items/<int:item_id>', methods=['PUT'])
@teacher_required
def update_store_item(item_id):
    item = StoreItem.query.get_or_404(item_id)
    data = request.json

    item.name = data.get('name', item.name)
    item.description = data.get('description', item.description)
    item.category = data.get('category', item.category)
    item.image_url = data.get('image_url', item.image_url)
    item.is_available = data.get('is_available', item.is_available)

    # Update available sizes if provided
    if 'available_sizes' in data:
        available_sizes = data['available_sizes']

        # Convert sizes from frontend format to backend format
        if isinstance(available_sizes, list):
            size_mapping = {
                'XS': 'xsmall',
                'S': 'small',
                'M': 'medium',
                'L': 'large',
                'XL': 'xlarge'
            }
            # Convert each size, falling back to lowercase if not in mapping
            available_sizes = [size_mapping.get(
                size.upper(), size.lower()) for size in available_sizes]

        valid_sizes = set(StoreItem.SIZE_PRICES.keys())

        if not isinstance(available_sizes, list) or not available_sizes:
            return jsonify({'error': 'available_sizes must be a non-empty list'}), 400

        invalid_sizes = [
            size for size in available_sizes if size not in valid_sizes]
        if invalid_sizes:
            return jsonify({
                'error': f'Invalid sizes: {invalid_sizes}. Valid sizes are: {list(valid_sizes)}'
            }), 400

        item.set_available_sizes(available_sizes)

    db.session.commit()
    return jsonify(item.to_dict())


@store_bp.route('/store/items/<int:item_id>', methods=['DELETE'])
@teacher_required
def delete_store_item(item_id):
    item = StoreItem.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return '', 204


@store_bp.route('/store/categories', methods=['GET'])
@login_required
def get_categories():
    # Get unique categories from store items
    categories = db.session.query(StoreItem.category)\
        .filter(StoreItem.category.isnot(None))\
        .distinct().all()

    return jsonify([cat[0] for cat in categories if cat[0]])

# Purchase Management Routes


@store_bp.route('/store/purchase', methods=['POST'])
@login_required
def purchase_item():
    data = request.json
    user_id = session['user_id']

    # Validate required fields
    required_fields = ['item_id', 'quantity', 'size']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    item_id = data['item_id']
    quantity = data['quantity']
    size = data['size']

    if quantity <= 0:
        return jsonify({'error': 'Quantity must be positive'}), 400

    # Get the item and user
    item = StoreItem.query.get_or_404(item_id)
    user = User.query.get_or_404(user_id)

    # Check if item is available
    if not item.is_available:
        return jsonify({'error': 'Item is not available'}), 400

    # Validate size and get price
    item_price = item.get_price_for_size(size)
    if item_price is None:
        available_sizes = item.get_available_sizes()
        return jsonify({
            'error': f'Size "{size}" is not available for this item',
            'available_sizes': available_sizes
        }), 400

    # Calculate total cost
    total_cost = item_price * quantity

    # Check if user has enough points
    if user.points_balance < total_cost:
        return jsonify({
            'error': 'Insufficient points',
            'required': total_cost,
            'available': user.points_balance
        }), 400

    # Create purchase record
    purchase = Purchase(
        user_id=user_id,
        item_id=item_id,
        quantity=quantity,
        size=size,
        total_cost=total_cost,
        status='completed'
    )

    # Create points transaction record
    transaction = PointsTransaction(
        user_id=user_id,
        transaction_type='spent',
        amount=total_cost,
        reason=f"Purchased {quantity}x {item.name} ({size})",
        reference_id=None  # Will be set to purchase.id after commit
    )

    # Update user's points balance
    user.points_balance -= total_cost

    db.session.add(purchase)
    db.session.add(transaction)
    db.session.commit()

    # Update transaction with purchase reference
    transaction.reference_id = purchase.id
    db.session.commit()

    return jsonify({
        'message': 'Purchase successful',
        'purchase': purchase.to_dict_with_item(),
        'new_balance': user.points_balance
    }), 201


@store_bp.route('/store/purchases', methods=['GET'])
@login_required
def get_purchases():
    current_user = User.query.get(session['user_id'])

    # Get query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    user_id = request.args.get('user_id', type=int)

    query = Purchase.query

    # Students can only view their own purchases
    if current_user.role == 'student':
        query = query.filter_by(user_id=current_user.id)
    elif user_id:  # Teachers can filter by user_id
        query = query.filter_by(user_id=user_id)

    purchases = query.order_by(Purchase.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    # Include item and user information
    result = []
    for purchase in purchases.items:
        purchase_dict = purchase.to_dict_with_item()

        # Add user information for teachers
        if current_user.role == 'teacher':
            user = User.query.get(purchase.user_id)
            if user:
                purchase_dict['user_name'] = f"{user.first_name} {user.last_name}"

        result.append(purchase_dict)

    return jsonify({
        'purchases': result,
        'total': purchases.total,
        'pages': purchases.pages,
        'current_page': page
    })


@store_bp.route('/store/purchases/<int:purchase_id>', methods=['GET'])
@login_required
def get_purchase(purchase_id):
    current_user = User.query.get(session['user_id'])
    purchase = Purchase.query.get_or_404(purchase_id)

    # Students can only view their own purchases
    if current_user.role == 'student' and purchase.user_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403

    return jsonify(purchase.to_dict_with_item())

# File Upload Route (for item images)


@store_bp.route('/upload/image', methods=['POST'])
@teacher_required
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Check file extension
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    if '.' not in file.filename or \
       file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({'error': 'Invalid file type'}), 400

    # Create uploads directory if it doesn't exist
    upload_dir = os.path.join(os.path.dirname(
        __file__), '..', 'static', 'uploads')
    os.makedirs(upload_dir, exist_ok=True)

    # Save file with secure filename
    filename = secure_filename(file.filename)
    file_path = os.path.join(upload_dir, filename)
    file.save(file_path)

    # Return the URL path for the uploaded file
    image_url = f'/uploads/{filename}'

    return jsonify({
        'message': 'File uploaded successfully',
        'image_url': image_url
    }), 201
