# School Store

This application is a school store system that uses a points-based currency. It has two main parts: a Flask backend and a React frontend.

## Overview

### Backend

A Flask API that manages users (students and teachers), store items, and point transactions. It handles authentication and data persistence.

### Frontend

A React application with two user roles:

*   **Student View:** Allows students to log in, browse items, and use points to make purchases.
*   **Teacher View:** Provides an admin dashboard for teachers to manage students and award points.

## Backend Setup

1.  Navigate to the `school_store_backend` directory.
    ```bash
    cd school_store_backend
    ```
2.  Install dependencies using pip:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the development server:
    ```bash
    flask run
    ```

## Frontend Setup

1.  Navigate to the `school_store_frontend` directory.
    ```bash
    cd school_store_frontend
    ```
2.  Install dependencies using pnpm:
    ```bash
    pnpm install
    ```
3.  Run the development server:
    ```bash
    pnpm dev