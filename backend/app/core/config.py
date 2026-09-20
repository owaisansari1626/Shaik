import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Personal Productivity API"
    JWT_SECRET: str = os.getenv("JWT_SECRET", "this-is-a-strong-secret-key-replace-in-prod")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://appuser:apppassword@localhost:5432/productivity_db")
    SYNC_DATABASE_URL: str = os.getenv("SYNC_DATABASE_URL", "postgresql://appuser:apppassword@localhost:5432/productivity_db")
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
