#!/usr/bin/env python3
"""
Test script to verify the Flask app can start correctly.
This simulates what Render will do when starting the application.
"""

import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)


def test_import():
    """Test that we can import the app from render_runner"""
    try:
        from render_runner import app
        print("✓ Successfully imported app from render_runner")
        return app
    except ImportError as e:
        print(f"✗ Failed to import app: {e}")
        return None


def test_flask_app(app):
    """Test that the app is a Flask instance"""
    from flask import Flask
    if isinstance(app, Flask):
        print("✓ App is a Flask instance")
        return True
    else:
        print(f"✗ App is not a Flask instance: {type(app)}")
        return False


def test_health_endpoint(app):
    """Test that the health endpoint exists"""
    with app.test_client() as client:
        response = client.get('/api/health')
        if response.status_code == 200:
            print(f"✓ Health endpoint works: {response.json}")
            return True
        else:
            print(f"✗ Health endpoint failed: {response.status_code}")
            return False


def test_database_config(app):
    """Test database configuration"""
    try:
        db_uri = app.config.get('SQLALCHEMY_DATABASE_URI')
        if db_uri:
            print(f"✓ Database URI configured: {db_uri[:30]}...")
            return True
        else:
            print("✗ Database URI not configured")
            return False
    except Exception as e:
        print(f"✗ Error checking database config: {e}")
        return False


def main():
    print("=" * 50)
    print("Testing Flask App Startup")
    print("=" * 50)

    # Test import
    app = test_import()
    if not app:
        sys.exit(1)

    # Test Flask instance
    if not test_flask_app(app):
        sys.exit(1)

    # Test health endpoint
    if not test_health_endpoint(app):
        sys.exit(1)

    # Test database config
    test_database_config(app)

    print("=" * 50)
    print("All critical tests passed!")
    print("The app should work on Render.")
    print("=" * 50)


if __name__ == "__main__":
    main()
