# Shaik Productivity Tracker

A full-stack Personal Schedule, Task & Progress Tracker with advanced recurrence capabilities.

## Setup

1. **Environment Variables**:
   Copy the example environment variables to an active `.env` file.
   ```bash
   cp .env.example .env
   ```
   (Or just copy manually on Windows)

2. **Start Docker**:
   We use Docker Compose to manage PostgreSQL, Backend, and Frontend. Ensure Docker Desktop is running.
   ```bash
   docker compose up --build
   ```

## Services

* **Frontend URL**: [http://localhost:5173](http://localhost:5173)
* **Backend URL**: [http://localhost:8000](http://localhost:8000)
* **Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **PostgreSQL Database**: `localhost:5432`

## Migrations

The backend database schemas are handled by Alembic. 
To run all migrations (if not already handled automatically by the backend startup script):
```bash
docker compose exec backend alembic upgrade head
```

## Seed Data

To populate the tracker with development seed data (users, categories, predefined activities, and schedule items):
```bash
docker compose exec backend python seed.py
```
