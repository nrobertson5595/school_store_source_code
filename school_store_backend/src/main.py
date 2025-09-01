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
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


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
# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL or f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Create uploads directory
uploads_dir = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
os.makedirs(uploads_dir, exist_ok=True)

with app.app_context():
    db.create_all()


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
    print("[DEBUG] Health check endpoint called", flush=True)
    return {"status": "healthy", "message": "School Store API is running"}, 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
