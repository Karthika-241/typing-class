from datetime import datetime
from models import db

class Progress(db.Model):
    """Progress database model to track child learning status."""
    __tablename__ = 'progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    # level: 'beginner' or 'intermediate'
    level = db.Column(db.String(50), nullable=False)
    
    # lesson: name/number of key-drills or word categories
    lesson = db.Column(db.String(100), nullable=False)
    
    words_completed = db.Column(db.Integer, default=0)
    accuracy = db.Column(db.Float, default=0.0)
    wpm = db.Column(db.Float, default=0.0)
    best_wpm = db.Column(db.Float, default=0.0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert the progress model to a dictionary representation."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'level': self.level,
            'lesson': self.lesson,
            'words_completed': self.words_completed,
            'accuracy': round(self.accuracy, 2),
            'wpm': round(self.wpm, 2),
            'best_wpm': round(self.best_wpm, 2),
            'updated_at': self.updated_at.isoformat()
        }
