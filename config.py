import os

class Config:
    """Configuration class for the Flask application."""
    # Base directory of the project
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    
    # SQLite Database URI configuration
    # Stores the database file 'typing_class.db' in the project root directory
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'typing_class.db')}"
    
    # Disable tracking modifications to save memory and performance
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Secret key for session security (use a default for student simplicity)
    SECRET_KEY = os.environ.get('SECRET_KEY', 'kids-typing-class-secret-key-12345')
