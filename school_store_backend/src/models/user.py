from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(100), unique=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.Enum('student', 'teacher',
                     name='user_roles'), nullable=False)
    points_balance = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    points_transactions = db.relationship(
        'PointsTransaction', foreign_keys='PointsTransaction.user_id', backref='user', lazy='dynamic')
    awarded_transactions = db.relationship(
        'PointsTransaction', foreign_keys='PointsTransaction.created_by', backref='teacher', lazy='dynamic')
    purchases = db.relationship('Purchase', backref='user', lazy='dynamic')

    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        self.password = password
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'password': self.password,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'points_balance': self.points_balance,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def to_dict_safe(self):
        """Safe version for student view - excludes sensitive info"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,  # Include role so frontend can determine navigation
            'points_balance': self.points_balance
        }
