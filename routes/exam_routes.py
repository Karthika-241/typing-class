from flask import Blueprint, request, jsonify
from models import db
from models.exam_result import ExamResult
from services.typing_service import TypingService

exam_bp = Blueprint('exam_bp', __name__)

@exam_bp.route('/api/exam-results/<int:user_id>', methods=['GET'])
def get_user_exams(user_id):
    """Retrieve all exam results for a given user."""
    results = ExamResult.query.filter_by(user_id=user_id).order_by(ExamResult.completed_at.desc()).all()
    return jsonify({
        "success": True,
        "results": [r.to_dict() for r in results]
    }), 200

@exam_bp.route('/api/exam-results', methods=['POST'])
def submit_exam_result():
    """Submit a completed exam.
    
    Receives raw stats (chars, errors, duration), re-calculates/validates the metrics 
    on the backend, and saves the verified result into SQLite database.
    """
    data = request.get_json() or {}
    user_id = data.get('user_id')
    exam_type = data.get('exam_type', 'Time Cadet').strip()
    typed_chars = data.get('typed_chars', 0)
    errors = data.get('errors', 0)
    duration = data.get('duration', 0) # in seconds

    if not user_id or not exam_type:
        return jsonify({
            "success": False,
            "message": "Missing user_id or exam_type in request data."
        }), 400

    # Calculate and validate calculations on backend using TypingService
    result = TypingService.calculate_and_validate_exam(user_id, typed_chars, errors, duration)
    
    if not result['is_valid']:
        return jsonify({
            "success": False,
            "message": result.get('message', 'Invalid exam payload.')
        }), 400

    try:
        # Create new exam result record with validated parameters
        exam_result = ExamResult(
            user_id=user_id,
            exam_type=exam_type,
            wpm=result['wpm'],
            accuracy=result['accuracy'],
            score=result['score'],
            errors=result['errors'],
            duration=result['duration']
        )
        db.session.add(exam_result)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Exam result saved successfully!",
            "result": exam_result.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Failed to record exam: {str(e)}"
        }), 500

@exam_bp.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Retrieve the top typing ranks from the server."""
    try:
        leaderboard_data = TypingService.get_leaderboard()
        return jsonify({
            "success": True,
            "leaderboard": leaderboard_data
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to load leaderboard: {str(e)}"
        }), 500
