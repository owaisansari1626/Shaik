# Shaik Productivity Tracker

> **Plan your time. Track your progress. Stay in control.**

A full-stack personal **Schedule, Task & Progress Tracker** designed for flexible planning, recurring activities, workouts, projects, and productivity tracking.

Unlike traditional habit trackers, schedules can be customized for different weekdays, weekends, specific dates, recurring activities, and one-time changes.

## ✨ Features

* 📅 Day, week & month scheduling
* 🔄 Advanced recurring activities
* ✏️ Individual schedule overrides
* ✅ Task management & deadlines
* 🏋️ Gym & workout tracking
* 🏃 Running & fitness tracking
* 📁 Project & task management
* 📊 Progress & productivity analytics
* 🔔 Reminders & notifications
* 🔎 Global search
* 📝 Notes
* 🌙 Light & dark mode
* 📱 Responsive PWA support

## 🧠 How Scheduling Works

The system separates an **Activity** from its actual scheduled **Occurrences**.

```text
┌─────────────────────┐
│      Activity       │
│   Example: Gym      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Recurrence Rule   │
│ Mon • Wed • Fri     │
│ Different times     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Activity Occurrences│
│                     │
│ Mon → 6:00 PM       │
│ Wed → 5:30 PM       │
│ Fri → 7:00 PM       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Occurrence Override │
│                     │
│ Wed → 8:00 PM       │
└─────────────────────┘
```

Changing Wednesday's schedule only changes that occurrence without affecting Monday or Friday.

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    │   Web / Mobile      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + TypeScript  │
                    │   Vite + Tailwind   │
                    └──────────┬──────────┘
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   FastAPI Backend   │
                    │                     │
                    │ Auth • Tasks        │
                    │ Schedule • Workout  │
                    │ Projects • Analytics│
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │                     │
                    │ Users • Tasks       │
                    │ Activities          │
                    │ Occurrences         │
                    │ Projects • Progress │
                    └─────────────────────┘
```

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* TanStack Query
* Recharts

### Backend

* Python
* FastAPI
* Pydantic
* SQLAlchemy
* Alembic
* JWT Authentication

### Database & Infrastructure

* PostgreSQL
* Docker
* Docker Compose
* Progressive Web App (PWA)

## 🚀 Setup

### 1. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows, you can copy `.env.example` manually and rename it to `.env`.

### 2. Start Docker

Make sure **Docker Desktop** is running.

```bash
docker compose up --build
```

Docker Compose starts the:

* PostgreSQL database
* FastAPI backend
* React frontend

## 🌐 Services

| Service          | URL                        |
| ---------------- | -------------------------- |
| Frontend         | http://localhost:5173      |
| Backend          | http://localhost:8000      |
| Swagger API Docs | http://localhost:8000/docs |
| PostgreSQL       | localhost:5432             |

## 🗄️ Database Migrations

Database schemas are managed using **Alembic**.

Run all migrations:

```bash
docker compose exec backend alembic upgrade head
```

If migrations are already executed automatically during startup, this step may not be required.

## 🌱 Seed Data

To populate the application with development data such as users, categories, activities, and schedules:

```bash
docker compose exec backend python seed.py
```

## 📱 PWA

The application is designed as a **Progressive Web App**, allowing it to be installed on supported desktop and mobile browsers.

This provides an app-like experience without requiring a separate native application.

## 🎯 Philosophy

> **The application organizes your decisions — it doesn't make them for you.**

You control your:

* Schedule
* Activities
* Tasks
* Workouts
* Projects
* Goals
* Progress

## 👨‍💻 Author

**Owais Ansari**

---

**Shaik Productivity Tracker**
*Plan your time. Track your progress. Stay in control.*
