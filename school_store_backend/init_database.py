#!/usr/bin/env python3
"""
Database Initialization Script for School Store Backend
Run this script to initialize the database tables on Render or other deployments.

Usage:
    python init_database.py
    
Environment Variables:
    DATABASE_URL: PostgreSQL connection string (required for production)
"""

from src.models.user import db, User
from src.models.store_item import StoreItem
from src.models.purchase import Purchase
from src.models.points_transaction import PointsTransaction
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, text
import os
import sys
import logging

# Add the school_store_backend directory to Python path before imports
sys.path.insert(0, os.path.dirname(__file__))


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_database_url():
    """Get database URL from environment or use default SQLite."""
    DATABASE_URL = os.environ.get('DATABASE_URL')

    # Fix postgres:// to postgresql:// for SQLAlchemy compatibility
    if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

    # Default to SQLite for local development
    if not DATABASE_URL:
        db_path = os.path.join(os.path.dirname(
            __file__), 'src', 'database', 'app.db')
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        DATABASE_URL = f"sqlite:///{db_path}"

    return DATABASE_URL


def test_connection(engine):
    """Test database connection."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            logger.info("✅ Database connection successful")
            return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False


def create_tables(engine):
    """Create all database tables."""
    try:
        # Import all models to ensure they're registered
        from src.models.user import User
        from src.models.store_item import StoreItem
        from src.models.purchase import Purchase
        from src.models.points_transaction import PointsTransaction

        # Create all tables
        db.metadata.create_all(engine)
        logger.info("✅ Database tables created successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to create tables: {e}")
        return False


def verify_tables(engine):
    """Verify that all required tables exist."""
    try:
        with engine.connect() as conn:
            # Check for each table
            tables = ['user', 'store_item', 'purchase', 'points_transaction']
            missing_tables = []

            for table in tables:
                try:
                    conn.execute(text(f"SELECT 1 FROM {table} LIMIT 1"))
                    logger.info(f"✅ Table '{table}' exists")
                except Exception:
                    missing_tables.append(table)
                    logger.warning(f"⚠️ Table '{table}' not found")

            if missing_tables:
                logger.warning(f"Missing tables: {', '.join(missing_tables)}")
                return False

            logger.info("✅ All required tables verified")
            return True
    except Exception as e:
        logger.error(f"❌ Table verification failed: {e}")
        return False


def create_default_teacher(engine):
    """Create a default teacher account if no users exist."""
    try:
        Session = sessionmaker(bind=engine)
        session = Session()

        # Check if any users exist
        user_count = session.query(User).count()

        if user_count == 0:
            # Create default teacher
            teacher = User(
                username='teacher',
                email='teacher@school.edu',
                first_name='Default',
                last_name='Teacher',
                role='teacher',
                points_balance=0
            )
            teacher.set_password('teacher123')

            session.add(teacher)
            session.commit()
            logger.info(
                "✅ Default teacher account created (username: teacher, password: teacher123)")
        else:
            logger.info(
                f"ℹ️ {user_count} user(s) already exist, skipping default teacher creation")

        session.close()
        return True
    except Exception as e:
        logger.error(f"❌ Failed to create default teacher: {e}")
        return False


def main():
    """Main initialization function."""
    logger.info("=" * 60)
    logger.info("School Store Database Initialization")
    logger.info("=" * 60)

    # Get database URL
    DATABASE_URL = get_database_url()
    logger.info(f"Database URL: {DATABASE_URL[:50]}...")

    # Create engine
    try:
        engine = create_engine(DATABASE_URL)
        logger.info("✅ Database engine created")
    except Exception as e:
        logger.error(f"❌ Failed to create database engine: {e}")
        sys.exit(1)

    # Test connection
    if not test_connection(engine):
        logger.error("Cannot proceed without database connection")
        sys.exit(1)

    # Create tables
    if not create_tables(engine):
        logger.error("Failed to create tables")
        sys.exit(1)

    # Verify tables
    if not verify_tables(engine):
        logger.warning("Some tables may be missing")

    # Create default teacher account
    create_default_teacher(engine)

    logger.info("=" * 60)
    logger.info("✅ Database initialization complete!")
    logger.info("=" * 60)

    # Instructions for Render
    if 'RENDER' in os.environ:
        logger.info("\n📝 Render Deployment Notes:")
        logger.info(
            "1. This script should be run as a build command or manually")
        logger.info(
            "2. The DATABASE_URL environment variable is automatically set by Render")
        logger.info("3. You can run this script from the Render shell:")
        logger.info("   cd school_store_backend && python init_database.py")


if __name__ == "__main__":
    main()
