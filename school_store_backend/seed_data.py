#!/usr/bin/env python3
"""
Database seeding script for the School Store application.
This script creates sample users, store items, and initial data for testing.
"""

from src.models.points_transaction import PointsTransaction
from src.models.store_item import StoreItem
from src.models.user import User, db
from src.main import app
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))


def seed_database():
    with app.app_context():
        # Clear existing data
        print("Clearing existing data...")
        db.drop_all()
        db.create_all()

        # Create teacher account
        print("Creating teacher account...")
        teacher = User(
            username='teacher1',
            first_name='Ms.',
            last_name='Honaker',
            role='teacher',
            email='teacher@school.edu'
        )
        teacher.set_password('teacher123')
        db.session.add(teacher)

        # Create student accounts
        print("Creating student accounts...")
        students_data = [
            {'username': 'alex_s', 'first_name': 'Alex',
                'last_name': 'Smith', 'points': 150},
            {'username': 'emma_j', 'first_name': 'Emma',
                'last_name': 'Johnson', 'points': 200},
            {'username': 'noah_b', 'first_name': 'Noah',
                'last_name': 'Brown', 'points': 75},
            {'username': 'sophia_d', 'first_name': 'Sophia',
                'last_name': 'Davis', 'points': 300},
            {'username': 'liam_w', 'first_name': 'Liam',
                'last_name': 'Wilson', 'points': 125},
            {'username': 'olivia_m', 'first_name': 'Olivia',
                'last_name': 'Miller', 'points': 180},
            {'username': 'ethan_g', 'first_name': 'Ethan',
                'last_name': 'Garcia', 'points': 90},
            {'username': 'ava_r', 'first_name': 'Ava',
                'last_name': 'Rodriguez', 'points': 250},
        ]

        students = []
        for student_data in students_data:
            student = User(
                username=student_data['username'],
                first_name=student_data['first_name'],
                last_name=student_data['last_name'],
                role='student',
                points_balance=student_data['points']
            )
            student.set_password('student123')  # Simple password for demo
            students.append(student)
            db.session.add(student)

        # Commit users first to get their IDs
        db.session.commit()

        # Create initial points transactions for students
        print("Creating initial points transactions...")
        for student in students:
            transaction = PointsTransaction(
                user_id=student.id,
                transaction_type='earned',
                amount=student.points_balance,
                reason='Initial points allocation',
                created_by=teacher.id
            )
            db.session.add(transaction)

        # Create store items
        print("Creating store items...")
        store_items = [
            {
                'name': '🎨 Art Supplies Set',
                'description': 'Complete set of colored pencils, markers, and drawing paper',
                # 50, 100, 250 points
                'available_sizes': ['xsmall', 'small', 'medium'],
                'category': 'Art & Crafts',
                'image_url': '/uploads/art_supplies.jpg'
            },
            {
                'name': '📚 Book: Adventure Stories',
                'description': 'Exciting collection of adventure stories for young readers',
                'available_sizes': ['small', 'medium'],  # 100, 250 points
                'category': 'Books',
                'image_url': '/uploads/adventure_book.jpg'
            },
            {
                'name': '🎮 Educational Game',
                'description': 'Fun learning game that makes math and science exciting',
                # 100, 250, 500 points
                'available_sizes': ['small', 'medium', 'large'],
                'category': 'Games',
                'image_url': '/uploads/edu_game.jpg'
            },
            {
                'name': '✏️ Premium Pencil Set',
                'description': 'Set of high-quality pencils with fun designs',
                'available_sizes': ['xsmall', 'small'],  # 50, 100 points
                'category': 'School Supplies',
                'image_url': '/uploads/pencil_set.jpg'
            },
            {
                'name': '🏆 Achievement Stickers',
                'description': 'Pack of colorful achievement and motivation stickers',
                'available_sizes': ['xsmall'],  # 50 points
                'category': 'Rewards',
                'image_url': '/uploads/stickers.jpg'
            },
            {
                'name': '🧩 Puzzle Challenge',
                'description': '100-piece puzzle with beautiful artwork',
                'available_sizes': ['small', 'medium'],  # 100, 250 points
                'category': 'Games',
                'image_url': '/uploads/puzzle.jpg'
            },
            {
                'name': '🎵 Music Notebook',
                'description': 'Special notebook for music notes and compositions',
                'available_sizes': ['xsmall', 'small'],  # 50, 100 points
                'category': 'School Supplies',
                'image_url': '/uploads/music_notebook.jpg'
            },
            {
                'name': '🌟 Star Student Badge',
                'description': 'Special badge to show off your achievements',
                'available_sizes': ['xsmall', 'small'],  # 50, 100 points
                'category': 'Rewards',
                'image_url': '/uploads/star_badge.jpg'
            },
            {
                'name': '📐 Geometry Set',
                'description': 'Complete geometry set with ruler, compass, and protractor',
                # 50, 100, 250 points
                'available_sizes': ['xsmall', 'small', 'medium'],
                'category': 'School Supplies',
                'image_url': '/uploads/geometry_set.jpg'
            },
            {
                'name': '🎪 Fun Activity Book',
                'description': 'Book full of puzzles, mazes, and fun activities',
                'available_sizes': ['xsmall', 'small'],  # 50, 100 points
                'category': 'Books',
                'image_url': '/uploads/activity_book.jpg'
            },
            {
                'name': '🎯 Premium Learning Kit',
                'description': 'Comprehensive learning kit with advanced materials',
                'available_sizes': ['large', 'xlarge'],  # 500, 1000 points
                'category': 'Educational',
                'image_url': '/uploads/learning_kit.jpg'
            },
            {
                'name': '🏅 Excellence Certificate',
                'description': 'Beautiful personalized certificate of achievement',
                'available_sizes': ['medium', 'large'],  # 250, 500 points
                'category': 'Rewards',
                'image_url': '/uploads/certificate.jpg'
            }
        ]

        for item_data in store_items:
            item = StoreItem(
                name=item_data['name'],
                description=item_data['description'],
                category=item_data['category'],
                image_url=item_data['image_url'],
                is_available=item_data.get('is_available', True)
            )
            # Set available sizes using the model method
            item.set_available_sizes(item_data['available_sizes'])
            db.session.add(item)

        # Commit all changes
        db.session.commit()

        print("Database seeded successfully!")
        print(f"Created:")
        print(f"  - 1 teacher account (username: teacher1, password: teacher123)")
        print(f"  - {len(students_data)} student accounts (password: student123)")
        print(f"  - {len(store_items)} store items")
        print(f"  - Initial points transactions")

        print("\nSample student accounts:")
        for student_data in students_data:
            print(
                f"  - {student_data['username']}: {student_data['first_name']} {student_data['last_name']} ({student_data['points']} points)")


if __name__ == '__main__':
    seed_database()
