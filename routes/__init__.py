from routes.user_routes import user_bp
from routes.progress_routes import progress_bp
from routes.exam_routes import exam_bp

# This makes it easy to import blueprints from the routes package
__all__ = ['user_bp', 'progress_bp', 'exam_bp']
