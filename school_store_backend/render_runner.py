from src.main import app
import os
import sys

# Add the backend directory to Python path for module resolution
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Import the Flask app from src.main (AFTER path setup)

# Optional: Add any production-specific configuration here
if os.environ.get('FLASK_ENV') == 'production':
    app.config['DEBUG'] = False
    app.config['TESTING'] = False
