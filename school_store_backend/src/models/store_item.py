from src.models.user import db
from datetime import datetime
import json


class StoreItem(db.Model):
    __tablename__ = 'store_items'

    # Fixed size pricing constants
    SIZE_PRICES = {
        'xsmall': 50,
        'small': 100,
        'medium': 250,
        'large': 500,
        'xlarge': 1000
    }

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    # Remove the single price field and replace with available_sizes JSON field
    # JSON array of available sizes
    available_sizes = db.Column(db.Text, nullable=False, default='["medium"]')
    image_url = db.Column(db.String(255))
    category = db.Column(db.String(50))
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    purchases = db.relationship('Purchase', backref='item', lazy='dynamic')

    def __repr__(self):
        return f'<StoreItem {self.name}>'

    def get_available_sizes(self):
        """Get list of available sizes for this item"""
        try:
            return json.loads(self.available_sizes)
        except (json.JSONDecodeError, TypeError):
            return ['medium']  # Default fallback

    def set_available_sizes(self, sizes):
        """Set available sizes for this item"""
        # Validate that all sizes are valid
        valid_sizes = set(self.SIZE_PRICES.keys())
        if isinstance(sizes, list):
            # Filter to only include valid sizes
            valid_input_sizes = [size for size in sizes if size in valid_sizes]
            if valid_input_sizes:
                self.available_sizes = json.dumps(valid_input_sizes)
            else:
                self.available_sizes = json.dumps(
                    ['medium'])  # Default if no valid sizes
        else:
            self.available_sizes = json.dumps(['medium'])  # Default fallback

    def get_price_for_size(self, size):
        """Get price for a specific size"""
        if size in self.SIZE_PRICES and size in self.get_available_sizes():
            return self.SIZE_PRICES[size]
        return None

    def get_size_pricing(self):
        """Get all available sizes with their prices"""
        available = self.get_available_sizes()
        return {size: self.SIZE_PRICES[size] for size in available if size in self.SIZE_PRICES}

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'available_sizes': self.get_available_sizes(),
            'size_pricing': self.get_size_pricing(),
            'image_url': self.image_url,
            'category': self.category,
            'is_available': self.is_available,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
