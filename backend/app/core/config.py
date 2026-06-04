import os
from pathlib import Path

# Custom dotenv loader for maximum reliability
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                # Remove quotes if they exist around the value
                val = val.strip()
                if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                    val = val[1:-1]
                os.environ[key.strip()] = val

class Settings:
    BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
    raw_database_url: str = os.getenv("DATABASE_URL", "sqlite:///./questions.db")

    if raw_database_url.startswith("sqlite:///"):
        sqlite_path = raw_database_url[10:]
        if sqlite_path.startswith("./") or sqlite_path.startswith("../"):
            sqlite_file = (BACKEND_DIR / sqlite_path).resolve()
            DATABASE_URL: str = f"sqlite:///{sqlite_file}"
        else:
            DATABASE_URL: str = raw_database_url
    else:
        DATABASE_URL: str = raw_database_url

    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkeyforquestionsmanagementapp12345")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

settings = Settings()
