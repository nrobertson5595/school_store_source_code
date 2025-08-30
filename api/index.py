from src.main import app
import os
import sys
from pathlib import Path

# Add the school_store_backend directory to path
backend_dir = Path(__file__).parent.parent / "school_store_backend"
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir / "src"))

# Set environment variable for database if not set
if not os.environ.get('DATABASE_URL'):
    os.environ['DATABASE_URL'] = 'sqlite:///app.db'

# Now import the Flask app

# Add health check endpoint for Vercel


@app.route('/api/health')
def health_check():
    return {'status': 'healthy'}, 200

# Vercel expects the app to be exposed as 'app'
# The Flask app is already named 'app' so we're good
