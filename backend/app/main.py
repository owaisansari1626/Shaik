from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import (
    custom_http_exception_handler,
    validation_exception_handler,
    generic_exception_handler
)

def create_app() -> FastAPI:
    app = FastAPI(
        title="Personal Schedule, Task & Progress Tracker API",
        description="A highly flexible productivity tracking API.",
        version="1.0.0"
    )

    # Set up CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception Handlers
    app.add_exception_handler(StarletteHTTPException, custom_http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)

    # Routers
    from app.api import auth, categories, tasks, activities, calendar, schedule, analytics, templates, workouts, exercises, projects
    app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
    app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
    app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
    app.include_router(activities.router, prefix="/api/activities", tags=["Activities"])
    app.include_router(calendar.router, prefix="/api/calendar", tags=["Calendar"])
    app.include_router(schedule.router, prefix="/api/schedule", tags=["Schedule"])
    app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
    app.include_router(templates.router, prefix="/api/templates", tags=["Templates"])
    app.include_router(workouts.router, prefix="/api/workouts", tags=["Workouts"])
    app.include_router(exercises.router, prefix="/api/exercises", tags=["Exercises"])
    app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])

    @app.get("/api/health")
    async def health_check():
        from app.core.responses import SuccessResponse
        return SuccessResponse(data={"status": "ok", "message": "API is running"}).dict()

    return app

app = create_app()
