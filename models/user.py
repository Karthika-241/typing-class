from datetime import datetime
from models import db

class User(db.Model):
    """User database model to store child profiles."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships to clean up child progress/exams if user is deleted
    progress = db.relationship('Progress', backref='user', lazy=True, cascade="all, delete-orphan")
    exam_results = db.relationship('ExamResult', backref='user', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        """Convert the model instance to a dictionary for JSON API responses."""
        return {
            'id': self.id,
            'name': self.name,
            'age': self.age,
            'created_at': self.created_at.isoformat()
        }
