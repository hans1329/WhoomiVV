import logging
from typing import List, Dict, Any, Optional, Tuple, Union
import numpy as np
from datetime import datetime
import json
from sqlalchemy.orm import Session
from sqlalchemy import desc

from src.backend.db.database import get_db
from src.backend.models.semantic_memory import Memory, Embedding, Emotion, Topic, PersonalityTrait
from src.backend.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)

class MemoryService:
    """Service for managing semantic memories"""
    
    @staticmethod
    def store_memory(
        text: str,
        dopple_id: str,
        user_id: str,
        role: str,
        emotions: List[str] = None,
        topics: List[str] = None,
        traits: List[str] = None,
        importance: int = 5,
        metadata: Dict = None,
        generate_embedding: bool = True,
        mock_embedding: bool = False
    ) -> str:
        """
        Store a new memory with optional embedding
        
        Args:
            text: The text content of the memory
            dopple_id: ID of the dopple involved
            user_id: ID of the user involved
            role: 'user' or 'dopple'
            emotions: List of emotion names to tag
            topics: List of topic names to tag
            traits: List of personality trait names to tag
            importance: Importance level from 1-10
            metadata: Additional metadata as dictionary
            generate_embedding: Whether to generate embedding for the text
            mock_embedding: Use mock embedding instead of calling API (for testing)
            
        Returns:
            ID of the created memory
        """
        with get_db() as db:
            # Create memory instance
            memory = Memory(
                dopple_id=dopple_id,
                user_id=user_id,
                text=text,
                role=role,
                importance=importance,
                metadata=metadata
            )
            
            # Add emotions if provided
            if emotions:
                emotion_objs = db.query(Emotion).filter(Emotion.name.in_(emotions)).all()
                memory.emotions = emotion_objs
            
            # Add topics if provided
            if topics:
                topic_objs = db.query(Topic).filter(Topic.name.in_(topics)).all()
                memory.topics = topic_objs
            
            # Add traits if provided
            if traits:
                trait_objs = db.query(PersonalityTrait).filter(PersonalityTrait.name.in_(traits)).all()
                memory.traits = trait_objs
            
            # Add memory to session
            db.add(memory)
            db.flush()  # Flush to get ID
            
            # Generate and store embedding
            if generate_embedding:
                vector = None
                if mock_embedding:
                    vector = EmbeddingService.mock_embedding()
                else:
                    try:
                        vector = EmbeddingService.generate_embedding(text)
                    except Exception as e:
                        logger.error(f"Failed to generate embedding: {str(e)}")
                
                if vector:
                    embedding = Embedding(
                        memory_id=memory.id,
                        vector=vector,
                        model=EmbeddingService.EMBEDDING_MODEL
                    )
                    db.add(embedding)
            
            db.commit()
            return memory.id
    
    @staticmethod
    def get_memory(memory_id: str) -> Optional[Dict]:
        """
        Get a memory by ID
        
        Args:
            memory_id: ID of the memory
            
        Returns:
            Memory as a dictionary or None if not found
        """
        with get_db() as db:
            memory = db.query(Memory).filter(Memory.id == memory_id).first()
            if memory:
                return memory.to_dict()
            return None
    
    @staticmethod
    def find_similar_memories(
        query_text: str,
        dopple_id: Optional[str] = None,
        user_id: Optional[str] = None,
        top_k: int = 5,
        similarity_threshold: float = 0.7,
        mock: bool = False
    ) -> List[Dict]:
        """
        Find memories similar to the query text using embedding similarity
        
        Args:
            query_text: Text to find similar memories for
            dopple_id: Optional filter by dopple ID
            user_id: Optional filter by user ID
            top_k: Maximum number of results to return
            similarity_threshold: Minimum similarity score (0-1)
            mock: Whether to use mock functionality (for testing)
            
        Returns:
            List of memory dictionaries with similarity scores
        """
        # Generate embedding for query text
        try:
            if mock:
                query_embedding = EmbeddingService.mock_embedding()
            else:
                query_embedding = EmbeddingService.generate_embedding(query_text)
        except Exception as e:
            logger.error(f"Failed to generate embedding for query: {str(e)}")
            return []
        
        similar_memories = []
        
        with get_db() as db:
            # Build query
            query = db.query(Memory).join(Embedding)
            
            # Apply filters if provided
            if dopple_id:
                query = query.filter(Memory.dopple_id == dopple_id)
            if user_id:
                query = query.filter(Memory.user_id == user_id)
            
            # Get all memories with embeddings
            memories = query.all()
            
            # Calculate similarity scores
            for memory in memories:
                if memory.embedding and memory.embedding.vector:
                    # Get vector from embedding
                    memory_vector = memory.embedding.vector
                    
                    # Calculate similarity
                    similarity = EmbeddingService.cosine_similarity(query_embedding, memory_vector)
                    
                    # Add to results if above threshold
                    if similarity >= similarity_threshold:
                        memory_dict = memory.to_dict()
                        memory_dict["similarity"] = similarity
                        similar_memories.append(memory_dict)
            
            # Sort by similarity (descending) and limit to top_k
            similar_memories.sort(key=lambda x: x["similarity"], reverse=True)
            return similar_memories[:top_k]
    
    @staticmethod
    def search_memories_by_metadata(
        dopple_id: Optional[str] = None,
        user_id: Optional[str] = None,
        emotions: List[str] = None,
        topics: List[str] = None,
        traits: List[str] = None,
        min_importance: int = None,
        start_date: datetime = None,
        end_date: datetime = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[Dict]:
        """
        Search memories by metadata filters
        
        Args:
            dopple_id: Filter by dopple ID
            user_id: Filter by user ID
            emotions: Filter by emotions
            topics: Filter by topics
            traits: Filter by personality traits
            min_importance: Minimum importance level
            start_date: Start date for time range
            end_date: End date for time range
            limit: Maximum number of results
            offset: Offset for pagination
            
        Returns:
            List of memory dictionaries
        """
        with get_db() as db:
            # Build base query
            query = db.query(Memory)
            
            # Apply filters
            if dopple_id:
                query = query.filter(Memory.dopple_id == dopple_id)
            if user_id:
                query = query.filter(Memory.user_id == user_id)
            if min_importance is not None:
                query = query.filter(Memory.importance >= min_importance)
            if start_date:
                query = query.filter(Memory.timestamp >= start_date)
            if end_date:
                query = query.filter(Memory.timestamp <= end_date)
            
            # Apply relationship filters
            if emotions:
                query = query.join(Memory.emotions).filter(Emotion.name.in_(emotions))
            if topics:
                query = query.join(Memory.topics).filter(Topic.name.in_(topics))
            if traits:
                query = query.join(Memory.traits).filter(PersonalityTrait.name.in_(traits))
            
            # Order by timestamp (newest first)
            query = query.order_by(desc(Memory.timestamp))
            
            # Apply pagination
            query = query.limit(limit).offset(offset)
            
            # Execute query
            memories = query.all()
            
            # Convert to dictionaries
            return [memory.to_dict() for memory in memories]
    
    @staticmethod
    def get_memory_stats(dopple_id: str, user_id: Optional[str] = None) -> Dict:
        """
        Get statistics about memories
        
        Args:
            dopple_id: Dopple ID
            user_id: Optional user ID filter
            
        Returns:
            Dictionary with statistics
        """
        with get_db() as db:
            # Base query
            query = db.query(Memory).filter(Memory.dopple_id == dopple_id)
            
            # Add user filter if provided
            if user_id:
                query = query.filter(Memory.user_id == user_id)
            
            # Get total count
            total_count = query.count()
            
            # Get counts by role
            user_count = query.filter(Memory.role == 'user').count()
            dopple_count = query.filter(Memory.role == 'dopple').count()
            
            # Get top emotions
            emotion_query = db.query(Emotion.name, db.func.count(Emotion.id).label('count')).\
                join(Memory.emotions).\
                filter(Memory.dopple_id == dopple_id)
            
            if user_id:
                emotion_query = emotion_query.filter(Memory.user_id == user_id)
            
            top_emotions = emotion_query.group_by(Emotion.name).\
                order_by(desc('count')).limit(5).all()
            
            # Get top topics
            topic_query = db.query(Topic.name, db.func.count(Topic.id).label('count')).\
                join(Memory.topics).\
                filter(Memory.dopple_id == dopple_id)
            
            if user_id:
                topic_query = topic_query.filter(Memory.user_id == user_id)
            
            top_topics = topic_query.group_by(Topic.name).\
                order_by(desc('count')).limit(5).all()
            
            # Get top traits
            trait_query = db.query(PersonalityTrait.name, db.func.count(PersonalityTrait.id).label('count')).\
                join(Memory.traits).\
                filter(Memory.dopple_id == dopple_id)
            
            if user_id:
                trait_query = trait_query.filter(Memory.user_id == user_id)
            
            top_traits = trait_query.group_by(PersonalityTrait.name).\
                order_by(desc('count')).limit(5).all()
            
            # Return statistics
            return {
                "total_memories": total_count,
                "user_memories": user_count,
                "dopple_memories": dopple_count,
                "top_emotions": [{"name": name, "count": count} for name, count in top_emotions],
                "top_topics": [{"name": name, "count": count} for name, count in top_topics],
                "top_traits": [{"name": name, "count": count} for name, count in top_traits]
            } 