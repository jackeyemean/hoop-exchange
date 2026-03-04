"""
Environment variables and connection helpers for the engine.
Provides DATABASE_URL, REDIS_URL, SCALING_FACTOR, get_db_connection(), and get_redis().
"""

import os

import psycopg2
import redis
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("ENGINE_DATABASE_URL", os.getenv("DATABASE_URL", ""))
REDIS_URL = os.getenv("ENGINE_REDIS_URL", os.getenv("REDIS_URL", "redis://localhost:6379/0"))
SCALING_FACTOR = float(os.getenv("SCALING_FACTOR", "2.08"))


def get_db_connection():
    """Return a new PostgreSQL connection."""
    return psycopg2.connect(DATABASE_URL)


def get_redis():
    """Return a Redis client with decode_responses=True."""
    return redis.Redis.from_url(REDIS_URL, decode_responses=True)
