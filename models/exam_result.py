from datetime import datetime
from models import db

class ExamResult(db.Model):
    """ExamResult database model to store timed exam completions."""
    __tablename__ = 'exam_results'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    exam_type = db.Column(db.String(100), nullable=False)  # Name/topic of the exam paragraph
    wpm = db.Column(db.Float, nullable=False)
    accuracy = db.Column(db.Float, nullable=False)
    score = db.Column(db.Integer, nullable=False)          # Score out of 100
    errors = db.Column(db.Integer, nullable=False)
    duration = db.Column(db.Integer, nullable=False)        # Time taken in seconds
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Convert the exam results model to a dictionary representation."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'exam_type': self.exam_type,
            'wpm': round(self.wpm, 2),
            'accuracy': round(self.accuracy, 2),
            'score': self.score,
            'errors': self.errors,
            'duration': self.duration,
            'completed_at': self.completed_at.isoformat()
        }
