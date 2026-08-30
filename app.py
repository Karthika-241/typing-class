import os
from flask import Flask, render_template
from flask_cors import CORS
from config import Config
from models import db

# Import database models to ensure SQLAlchemy registers their schemas
from models.user import User
from models.progress import Progress
from models.exam_result import ExamResult

# Import route blueprints
from routes.user_routes import user_bp
from routes.progress_routes import progress_bp
from routes.exam_routes import exam_bp

def create_app():
    """Application factory function to initialize Flask."""
    app = Flask(
        __name__, 
        template_folder='templates',
        static_folder='static'
    )
    
    # Load configuration settings
    app.config.from_object(Config)
    
    # Enable CORS for robust cross-origin calls (e.g. testing index.html directly)
    CORS(app)
    
    # Initialize the database instance
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(user_bp)
    app.register_blueprint(progress_bp)
    app.register_blueprint(exam_bp)

    # Route to serve the main HTML page
    @app.route('/')
    def index():
        return render_template('index.html')

    # Automatically create database tables when starting
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    # Runs the Flask server on port 5000 in debug mode
    app.run(host='127.0.0.1', port=5000, debug=True)
