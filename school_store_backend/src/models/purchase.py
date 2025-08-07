from src.models.user import db
from datetime import datetime


class Purchase(db.Model):
    __tablename__ = 'purchases'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey(
        'store_items.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    # Size purchased (xsmall, small, medium, large, xlarge)
    size = db.Column(db.String(10), nullable=False, default='medium')
    total_cost = db.Column(db.Integer, nullable=False)  # Total points spent
    status = db.Column(db.Enum('pending', 'completed', 'cancelled',
                       name='purchase_status'), default='completed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Purchase {self.id}: User {self.user_id} bought {self.quantity}x Item {self.item_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'item_id': self.item_id,
            'quantity': self.quantity,
            'size': self.size,
            'total_cost': self.total_cost,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def to_dict_with_item(self):
        """Include item details in the response"""
        result = self.to_dict()
        if self.item:
            result['item'] = self.item.to_dict()
        return result
