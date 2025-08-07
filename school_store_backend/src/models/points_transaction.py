from src.models.user import db
from datetime import datetime

class PointsTransaction(db.Model):
    __tablename__ = 'points_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    transaction_type = db.Column(db.Enum('earned', 'spent', name='transaction_types'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.String(255))
    reference_id = db.Column(db.Integer)  # Links to purchase ID or other reference
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))  # Teacher who awarded points
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<PointsTransaction {self.transaction_type}: {self.amount} points for user {self.user_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'transaction_type': self.transaction_type,
            'amount': self.amount,
            'reason': self.reason,
            'reference_id': self.reference_id,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

