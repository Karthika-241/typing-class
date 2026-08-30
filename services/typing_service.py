from models.user import User
from models.exam_result import ExamResult
from models import db

class TypingService:
    """Service class containing business logic, validations, and leaderboard queries."""

    @staticmethod
    def validate_user_data(name, age):
        """Validate child's user registration data.
        
        Args:
            name (str): User name
            age (int/str): User age
        Returns:
            dict: Dictionary with 'is_valid' boolean and 'message' string.
        """
        if not name or not isinstance(name, str) or len(name.strip()) < 2:
            return {"is_valid": False, "message": "Name must be at least 2 characters long!"}
            
        try:
            age_int = int(age)
            if age_int < 3 or age_int > 100:
                return {"is_valid": False, "message": "Age must be between 3 and 100!"}
        except (ValueError, TypeError):
            return {"is_valid": False, "message": "Age must be a valid number!"}
            
        return {"is_valid": True, "message": "Valid"}

    @staticmethod
    def validate_progress_data(user_id, level, wpm, accuracy):
        """Validate progress payload metrics."""
        # Confirm user exists
        user = db.session.get(User, user_id)
        if not user:
            return {"is_valid": False, "message": "User not found!"}
            
        # Check ranges
        if not (0 <= wpm <= 250):
            return {"is_valid": False, "message": "WPM must be between 0 and 250!"}
            
        if not (0 <= accuracy <= 100):
            return {"is_valid": False, "message": "Accuracy must be between 0 and 100!"}
            
        return {"is_valid": True, "message": "Valid"}

    @staticmethod
    def calculate_and_validate_exam(user_id, typed_chars, errors, duration_seconds):
        """Backend calculation and validation of exam metrics.
        
        Re-calculates the WPM, Accuracy, and Score on the backend using the raw input 
        parameters. This prevents cheating or corruption from the client-side.
        """
        user = db.session.get(User, user_id)
        if not user:
            return {"is_valid": False, "message": "User not found!"}
            
        if typed_chars <= 0:
            return {"is_valid": False, "message": "Characters typed must be greater than zero!"}
            
        if duration_seconds <= 0:
            return {"is_valid": False, "message": "Exam duration must be greater than zero!"}

        if errors < 0 or errors > typed_chars:
            return {"is_valid": False, "message": "Errors count is invalid."}

        # WPM standard typing formula: (characters / 5) / (duration in minutes)
        duration_minutes = duration_seconds / 60.0
        calculated_wpm = (typed_chars / 5.0) / duration_minutes

        # Accuracy standard formula: ((total - errors) / total) * 100
        calculated_accuracy = ((typed_chars - errors) / typed_chars) * 100.0

        # Score calculation: 70% weight on accuracy, 30% weight on speed (capped at 60 WPM for children)
        # Perfect typing at reasonable speed yields 100.
        speed_points = min(calculated_wpm, 60.0) / 60.0 * 30.0
        accuracy_points = calculated_accuracy * 0.7
        calculated_score = int(round(speed_points + accuracy_points))
        calculated_score = max(0, min(100, calculated_score)) # clamp between 0 and 100

        return {
            "is_valid": True,
            "wpm": round(calculated_wpm, 2),
            "accuracy": round(calculated_accuracy, 2),
            "score": calculated_score,
            "errors": errors,
            "duration": duration_seconds
        }

    @staticmethod
    def get_leaderboard(limit=10):
        """Query the SQLite database to rank users by their highest WPM and accuracy."""
        # Subquery to find the best exam result for each user
        # We will fetch user exam scores and join with User table
        results = db.session.query(
            User.name,
            User.age,
            db.func.max(ExamResult.wpm).label("max_wpm"),
            db.func.max(ExamResult.accuracy).label("max_accuracy"),
            db.func.max(ExamResult.score).label("max_score")
        ).join(
            ExamResult, User.id == ExamResult.user_id
        ).group_by(
            User.id
        ).order_by(
            db.text("max_wpm DESC, max_accuracy DESC")
        ).limit(limit).all()

        leaderboard = []
        for i, row in enumerate(results, 1):
            leaderboard.append({
                "rank": i,
                "name": row.name,
                "age": row.age,
                "wpm": round(row.max_wpm, 2),
                "accuracy": round(row.max_accuracy, 2),
                "score": row.max_score
            })
            
        return leaderboard
