# main.py
import os

# from dotenv import load_dotenv
# load_dotenv()  # must be first — loads .env before anything reads os.environ

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import engine, Base
import app.models.orm_models  # registers ORM models with Base

from app.routes.auth import router as auth_router
from app.routes.applications import router as app_router

# Create tables in Neon if they don't exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Credit Risk API",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "https://finrisk.pages.dev/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)   # /auth/signup  /auth/login
app.include_router(app_router)    # /predict  /my-applications  /applications


@app.get("/")
def home():
    return {"message": "Credit Risk API running", "docs": "/docs"}