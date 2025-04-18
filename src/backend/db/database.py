from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from contextlib import contextmanager
from typing import Generator, Any

# Environment variables or config
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./semantic_memory.db")
USE_SQLITE = DATABASE_URL.startswith("sqlite")

# Create SQLAlchemy engine
if USE_SQLITE:
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

@contextmanager
def get_db() -> Generator[Any, None, None]:
    """Context manager to get a database session"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def init_db():
    """Initialize database with tables"""
    # Import all models to ensure they're registered with Base.metadata
    from src.backend.models.semantic_memory import Memory, Embedding, Emotion, Topic, PersonalityTrait
    
    # Create tables
    Base.metadata.create_all(bind=engine)

def seed_metadata():
    """Seed the database with initial metadata (emotions, topics, traits)"""
    from src.backend.models.semantic_memory import Emotion, Topic, PersonalityTrait
    
    with get_db() as db:
        # Seed emotions if they don't exist
        emotions = [
            {"name": "happy", "description": "Feeling or showing pleasure or contentment", "intensity": 7},
            {"name": "sad", "description": "Feeling or showing sorrow; unhappy", "intensity": 6},
            {"name": "angry", "description": "Feeling or showing strong annoyance, displeasure, or hostility", "intensity": 8},
            {"name": "surprised", "description": "Feeling or showing surprise", "intensity": 5},
            {"name": "afraid", "description": "Feeling fear or anxiety", "intensity": 7},
            {"name": "disgusted", "description": "Feeling or showing strong dislike or disapproval", "intensity": 6},
            {"name": "neutral", "description": "Not feeling or showing any strong emotion", "intensity": 3},
            {"name": "curious", "description": "Eager to know or learn something", "intensity": 6},
            {"name": "excited", "description": "Very enthusiastic and eager", "intensity": 8},
            {"name": "thoughtful", "description": "Absorbed in or involving thought", "intensity": 5},
        ]
        
        for emotion_data in emotions:
            emotion = db.query(Emotion).filter_by(name=emotion_data["name"]).first()
            if not emotion:
                db.add(Emotion(**emotion_data))
        
        # Seed topics if they don't exist
        topics = [
            {"name": "personal", "description": "Personal information about the user or dopple"},
            {"name": "work", "description": "Discussion about work-related topics"},
            {"name": "family", "description": "Discussion about family members or family relations"},
            {"name": "relationships", "description": "Discussion about relationships"},
            {"name": "hobbies", "description": "Discussion about hobbies and interests"},
            {"name": "education", "description": "Discussion about education or learning"},
            {"name": "health", "description": "Discussion about health and wellness"},
            {"name": "entertainment", "description": "Discussion about movies, games, books, etc."},
            {"name": "technology", "description": "Discussion about technology topics"},
            {"name": "philosophy", "description": "Discussion about philosophical concepts"},
            {"name": "art", "description": "Discussion about art and creativity"},
            {"name": "science", "description": "Discussion about scientific topics"},
            {"name": "ethics", "description": "Discussion about ethical dilemmas and concepts"},
        ]
        
        for topic_data in topics:
            topic = db.query(Topic).filter_by(name=topic_data["name"]).first()
            if not topic:
                db.add(Topic(**topic_data))
        
        # Seed personality traits if they don't exist
        traits = [
            {"name": "creative", "description": "Showing creativity and imagination", "intensity": 7},
            {"name": "analytical", "description": "Relating to or using analysis", "intensity": 6},
            {"name": "empathetic", "description": "Showing an ability to understand and share the feelings of another", "intensity": 8},
            {"name": "logical", "description": "Characterized by clear, sound reasoning", "intensity": 7},
            {"name": "decisive", "description": "Having or showing the ability to make decisions quickly and effectively", "intensity": 6},
            {"name": "adaptable", "description": "Able to adjust to new conditions or situations", "intensity": 7},
            {"name": "optimistic", "description": "Hopeful and confident about the future", "intensity": 6},
            {"name": "pessimistic", "description": "Tending to see the worst aspect of things", "intensity": 4},
            {"name": "curious", "description": "Eager to know or learn something", "intensity": 8},
            {"name": "cautious", "description": "Careful to avoid potential problems or dangers", "intensity": 5},
            {"name": "adventurous", "description": "Willing to take risks and try new experiences", "intensity": 7},
            {"name": "organized", "description": "Arranged in a systematic way", "intensity": 6},
            {"name": "spontaneous", "description": "Done or occurring as a result of a sudden impulse", "intensity": 7},
        ]
        
        for trait_data in traits:
            trait = db.query(PersonalityTrait).filter_by(name=trait_data["name"]).first()
            if not trait:
                db.add(PersonalityTrait(**trait_data))
        
        db.commit() 