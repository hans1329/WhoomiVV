from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table, Text, Boolean, JSON, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

Base = declarative_base()

# Association tables for many-to-many relationships
memory_emotion_association = Table(
    'memory_emotion', Base.metadata,
    Column('memory_id', String, ForeignKey('memories.id')),
    Column('emotion_id', String, ForeignKey('emotions.id'))
)

memory_topic_association = Table(
    'memory_topic', Base.metadata,
    Column('memory_id', String, ForeignKey('memories.id')),
    Column('topic_id', String, ForeignKey('topics.id'))
)

memory_trait_association = Table(
    'memory_trait', Base.metadata,
    Column('memory_id', String, ForeignKey('memories.id')),
    Column('trait_id', String, ForeignKey('personality_traits.id'))
)


class Memory(Base):
    """Memory model for storing conversation fragments"""
    __tablename__ = 'memories'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    dopple_id = Column(String, nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    text = Column(Text, nullable=False)
    role = Column(String, nullable=False)  # 'user' or 'dopple'
    timestamp = Column(DateTime, default=datetime.utcnow)
    importance = Column(Integer, default=5)  # 1-10 scale
    
    # Relationship to the embedding
    embedding = relationship("Embedding", uselist=False, back_populates="memory", cascade="all, delete-orphan")
    
    # Relationships to metadata
    emotions = relationship("Emotion", secondary=memory_emotion_association, back_populates="memories")
    topics = relationship("Topic", secondary=memory_topic_association, back_populates="memories")
    traits = relationship("PersonalityTrait", secondary=memory_trait_association, back_populates="memories")
    
    # Additional metadata as JSON
    metadata = Column(JSON, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "dopple_id": self.dopple_id,
            "user_id": self.user_id,
            "text": self.text,
            "role": self.role,
            "timestamp": self.timestamp.isoformat(),
            "importance": self.importance,
            "emotions": [emotion.name for emotion in self.emotions],
            "topics": [topic.name for topic in self.topics],
            "traits": [trait.name for trait in self.traits],
            "metadata": self.metadata
        }


class Embedding(Base):
    """Store vector embeddings for memories"""
    __tablename__ = 'embeddings'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    memory_id = Column(String, ForeignKey('memories.id'), nullable=False, unique=True)
    # Store embedding vector as a list of floats (will be converted to pgvector in Supabase)
    vector = Column(JSON, nullable=False)  
    model = Column(String, nullable=False)  # Which embedding model was used
    
    memory = relationship("Memory", back_populates="embedding")


class Emotion(Base):
    """Emotion tags for memories"""
    __tablename__ = 'emotions'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    intensity = Column(Integer, default=5)  # 1-10 scale
    
    memories = relationship("Memory", secondary=memory_emotion_association, back_populates="emotions")


class Topic(Base):
    """Topic tags for memories"""
    __tablename__ = 'topics'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    memories = relationship("Memory", secondary=memory_topic_association, back_populates="topics")


class PersonalityTrait(Base):
    """Personality trait tags for memories"""
    __tablename__ = 'personality_traits'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    intensity = Column(Integer, default=5)  # 1-10 scale
    
    memories = relationship("Memory", secondary=memory_trait_association, back_populates="traits") 