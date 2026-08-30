from flask import Blueprint, request, jsonify
from models import db
from models.progress import Progress
from services.typing_service import TypingService

progress_bp = Blueprint('progress_bp', __name__)

@progress_bp.route('/api/progress/<int:user_id>', methods=['GET'])
def get_user_progress(user_id):
    """Retrieve all progress records for a given user."""
    progress_records = Progress.query.filter_by(user_id=user_id).all()
    return jsonify({
        "success": True,
        "progress": [p.to_dict() for p in progress_records]
    }), 200

@progress_bp.route('/api/progress', methods=['POST'])
def save_progress():
    """Upsert user progress for a specific level.
    
    Receives typing progress statistics from the front-end, validates them,
    and updates or inserts a record tracking the student's level stats.
    """
    data = request.get_json() or {}
    user_id = data.get('user_id')
    level = data.get('level', '').strip().lower() # 'beginner' or 'intermediate'
    lesson = data.get('lesson', '').strip()
    words_completed = data.get('words_completed', 0)
    accuracy = data.get('accuracy', 0.0)
    wpm = data.get('wpm', 0.0)

    # Basic validations
    if not user_id or not level or not lesson:
        return jsonify({
            "success": False,
            "message": "Missing required fields: user_id, level, and lesson are mandatory."
        }), 400

    validation = TypingService.validate_progress_data(user_id, level, wpm, accuracy)
    if not validation['is_valid']:
        return jsonify({
            "success": False,
            "message": validation['message']
        }), 400

    # Search for an existing progress record for this level
    progress = Progress.query.filter_by(user_id=user_id, level=level).first()

    try:
        if progress:
            # Update existing progress record
            progress.lesson = lesson
            progress.words_completed = max(progress.words_completed, words_completed)
            progress.accuracy = (progress.accuracy + accuracy) / 2.0  # average accuracy
            progress.wpm = wpm
            progress.best_wpm = max(progress.best_wpm, wpm)
        else:
            # Insert a new progress record
            progress = Progress(
                user_id=user_id,
                level=level,
                lesson=lesson,
                words_completed=words_completed,
                accuracy=accuracy,
                wpm=wpm,
                best_wpm=wpm
            )
            db.session.add(progress)

        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Progress saved successfully!",
            "progress": progress.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to save progress: {str(e)}"
        }), 500
