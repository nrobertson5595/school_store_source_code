import os
import sys
from pathlib import Path

# Create a debug log to track the startup process
debug_logs = []

try:
    debug_logs.append("Starting serverless function initialization")

    # Fix 1: Add paths BEFORE any imports
    backend_dir = Path(__file__).parent.parent / "school_store_backend"
    debug_logs.append(f"Backend dir: {backend_dir}")
    debug_logs.append(f"Backend dir exists: {backend_dir.exists()}")

    sys.path.insert(0, str(backend_dir))
    sys.path.insert(0, str(backend_dir / "src"))
    debug_logs.append(f"Updated sys.path: {sys.path[:3]}")

    # Fix 2: Set environment variables BEFORE importing the app
    if not os.environ.get('DATABASE_URL'):
        os.environ['DATABASE_URL'] = 'sqlite:///app.db'
        debug_logs.append("Set default DATABASE_URL")
    else:
        debug_logs.append(
            f"DATABASE_URL found: {os.environ.get('DATABASE_URL')[:30]}...")

    if not os.environ.get('SECRET_KEY'):
        os.environ['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'
        debug_logs.append("Set default SECRET_KEY")

    # Fix 3: Now import the Flask app AFTER path and env setup
    debug_logs.append("Attempting to import Flask app...")
    from src.main import app
    debug_logs.append("Successfully imported Flask app")

    # Add debug endpoint
    @app.route('/api/debug')
    def debug_info():
        return {
            'status': 'operational',
            'debug_logs': debug_logs,
            'sys_path': sys.path[:5],
            'env_vars': {
                'DATABASE_URL': bool(os.environ.get('DATABASE_URL')),
                'SECRET_KEY': bool(os.environ.get('SECRET_KEY')),
            },
            'working_dir': os.getcwd(),
            'file_location': __file__
        }, 200

    # Add health check
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'debug_logs': debug_logs}, 200

except Exception as e:
    debug_logs.append(f"ERROR during initialization: {str(e)}")
    import traceback
    debug_logs.append(f"Traceback: {traceback.format_exc()}")

    # Create a minimal Flask app that returns the error
    from flask import Flask
    app = Flask(__name__)

    @app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    def error_handler(path):
        return {
            'error': 'Serverless function initialization failed',
            'message': str(e),
            'debug_logs': debug_logs
        }, 500

# Vercel expects the app to be exposed as 'app'
