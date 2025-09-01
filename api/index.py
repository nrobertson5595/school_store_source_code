import os
import sys
from pathlib import Path

# CRITICAL: Set up paths BEFORE any imports
backend_dir = Path(__file__).parent.parent / "school_store_backend"
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir / "src"))

# Set environment variables BEFORE importing the app
# This ensures they're available when the app initializes
if not os.environ.get('DATABASE_URL'):
    # For Vercel, use PostgreSQL from environment variables
    # POSTGRES_URL is automatically provided by Vercel Postgres
    os.environ['DATABASE_URL'] = os.environ.get(
        'POSTGRES_URL', 'sqlite:///tmp/app.db')

if not os.environ.get('SECRET_KEY'):
    # Use environment variable or fallback to default
    os.environ['SECRET_KEY'] = os.environ.get(
        'SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')

# Disable SQLAlchemy modifications tracking in serverless
os.environ['SQLALCHEMY_TRACK_MODIFICATIONS'] = 'False'

# Set a flag to indicate we're running in serverless mode
os.environ['IS_SERVERLESS'] = 'true'

# Now import and modify the Flask app AFTER all setup is complete
try:
    # Temporarily override functions that might fail in serverless
    import src.main

    # Store original functions
    original_makedirs = os.makedirs
    original_create_all = None

    # Override makedirs to ignore directory creation errors
    def safe_makedirs(path, *args, **kwargs):
        try:
            return original_makedirs(path, *args, **kwargs)
        except (OSError, PermissionError):
            pass  # Ignore in serverless environment

    os.makedirs = safe_makedirs

    # Import the app
    from src.main import app, db

    # Restore original makedirs
    os.makedirs = original_makedirs

    # Override db.create_all to prevent it from running in serverless
    # The database should already exist in production
    original_create_all = db.create_all

    def noop_create_all(*args, **kwargs):
        pass  # Don't create tables in serverless

    # Temporarily disable create_all during import
    db.create_all = noop_create_all

    # Re-initialize the app with serverless-safe configuration
    @app.before_request
    def before_request():
        # Ensure database URL is properly configured for each request
        if 'DATABASE_URL' in os.environ:
            url = os.environ['DATABASE_URL']
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            app.config['SQLALCHEMY_DATABASE_URI'] = url

    # Add health check endpoint for Vercel
    @app.route('/api/health')
    def health_check():
        try:
            # Test database connection
            from src.models.user import User
            User.query.first()
            db_status = 'connected'
        except Exception as e:
            db_status = f'error: {str(e)}'

        return {
            'status': 'healthy',
            'database': db_status,
            'environment': 'serverless'
        }, 200

    # Add debug endpoint for troubleshooting
    @app.route('/api/debug')
    def debug_info():
        return {
            'status': 'operational',
            'env_vars': {
                'DATABASE_URL': bool(os.environ.get('DATABASE_URL')),
                'POSTGRES_URL': bool(os.environ.get('POSTGRES_URL')),
                'SECRET_KEY': bool(os.environ.get('SECRET_KEY')),
            },
            'database_uri': app.config.get('SQLALCHEMY_DATABASE_URI', 'not set')[:50] + '...',
            'sys_path': sys.path[:3]
        }, 200

    # Enhanced error handler for better debugging
    @app.errorhandler(500)
    def internal_error(error):
        import traceback
        return {
            'error': 'Internal Server Error',
            'message': str(error),
            'traceback': traceback.format_exc() if app.debug else None,
            'database_configured': bool(app.config.get('SQLALCHEMY_DATABASE_URI'))
        }, 500

    @app.errorhandler(Exception)
    def handle_exception(e):
        import traceback
        return {
            'error': e.__class__.__name__,
            'message': str(e),
            'traceback': traceback.format_exc() if app.debug else None
        }, 500

except Exception as e:
    # If imports fail, create a minimal error response app
    import traceback
    from flask import Flask
    app = Flask(__name__)

    @app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    def import_error_handler(path):
        return {
            'error': 'Serverless Function Initialization Failed',
            'message': str(e),
            'type': e.__class__.__name__,
            'traceback': traceback.format_exc(),
            'sys_path': sys.path[:5],
            'working_dir': os.getcwd(),
            'env_vars': {
                'DATABASE_URL': bool(os.environ.get('DATABASE_URL')),
                'POSTGRES_URL': bool(os.environ.get('POSTGRES_URL')),
                'SECRET_KEY': bool(os.environ.get('SECRET_KEY')),
            }
        }, 500

# Vercel expects the app to be exposed as 'app'
