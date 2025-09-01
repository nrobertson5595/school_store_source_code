from src.routes.store import store_bp
from src.routes.points import points_bp
from src.routes.user import user_bp
from src.models.purchase import Purchase
from src.models.points_transaction import PointsTransaction
from src.models.store_item import StoreItem
from src.models.user import db
from flask_cors import CORS
from flask import Flask, send_from_directory
import os
import sys
import logging
from sqlalchemy import text
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app = Flask(__name__, static_folder=os.path.join(
    os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for all routes
CORS(app,
     resources={r"/api/*": {
         "origins": "*",
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"],
         "supports_credentials": True
     }},
     supports_credentials=True)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(points_bp, url_prefix='/api')
app.register_blueprint(store_bp, url_prefix='/api')

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL or f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database with proper error handling
try:
    db.init_app(app)
    logger.info(
        f"Database initialized with URI: {app.config['SQLALCHEMY_DATABASE_URI'][:50]}...")
except Exception as e:
    logger.error(f"Failed to initialize database: {e}")
    # Continue running without database - app will handle errors gracefully

# Create uploads directory
uploads_dir = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
os.makedirs(uploads_dir, exist_ok=True)

# Attempt to create tables, but don't fail if database isn't ready


def init_database():
    """Initialize database tables with proper error handling."""
    try:
        with app.app_context():
            # Test database connection first - using session.execute for compatibility
            db.session.execute(text("SELECT 1"))
            db.session.commit()
            logger.info("Database connection successful")

            # Create tables
            db.create_all()
            logger.info("Database tables created successfully")
            return True
    except Exception as e:
        logger.warning(f"Database initialization deferred: {e}")
        logger.warning(
            "Tables will be created when database becomes available")
        return False


# Try to initialize database but don't fail the app if it doesn't work
database_ready = init_database()


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # DEBUG: Log incoming path
    print(f"[DEBUG] serve() called with path: '{path}'", flush=True)

    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    # CRITICAL BUG FIX: Don't intercept API routes - let Flask blueprints handle them
    # The issue was that path.startswith('api/') was catching all API routes
    # and returning 404 before they could reach the blueprints
    if path.startswith('api/'):
        print(
            f"[DEBUG] Path starts with 'api/', NOT serving static - letting Flask handle it", flush=True)
        # Instead of returning 404, we need to let Flask continue routing
        # The blueprints registered with /api prefix will handle these
        from werkzeug.exceptions import NotFound
        raise NotFound()  # This lets Flask continue looking for matching routes

    # Try to serve the file if it exists
    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        print(f"[DEBUG] Serving static file: {path}", flush=True)
        return send_from_directory(static_folder_path, path)

    # For any non-file route, serve index.html (React SPA routing)
    index_path = os.path.join(static_folder_path, 'index.html')
    if os.path.exists(index_path):
        print(f"[DEBUG] Serving index.html for SPA route: {path}", flush=True)
        return send_from_directory(static_folder_path, 'index.html')
    else:
        return "index.html not found - please run build script", 404


@app.route('/api/health')
def health_check():
    """Health check endpoint with database status."""
    print("[DEBUG] Health check endpoint called", flush=True)

    # Check database connectivity
    db_status = "connected"
    try:
        with app.app_context():
            db.session.execute(text("SELECT 1"))
            db.session.commit()
    except Exception as e:
        db_status = f"error: {str(e)[:100]}"
        logger.error(f"Database health check failed: {e}")

    return {
        "status": "healthy",
        "message": "School Store API is running",
        "database": db_status
    }, 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
