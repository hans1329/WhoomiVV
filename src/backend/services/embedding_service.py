import os
import openai
import numpy as np
from typing import List, Dict, Any, Optional, Union
import logging
import json
import time

# Configure OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")

# Constants
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536  # Dimensionality of text-embedding-3-small
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds

logger = logging.getLogger(__name__)

class EmbeddingService:
    """Service for generating and manipulating text embeddings"""
    
    @staticmethod
    def generate_embedding(text: str) -> List[float]:
        """
        Generate embedding vector for a text using OpenAI's text-embedding-3-small model
        
        Args:
            text: The text to embed
            
        Returns:
            List of float values representing the embedding vector
        """
        if not text.strip():
            raise ValueError("Empty text cannot be embedded")
        
        retries = 0
        while retries < MAX_RETRIES:
            try:
                # Make API call to OpenAI
                response = openai.Embedding.create(
                    input=text,
                    model=EMBEDDING_MODEL
                )
                
                # Extract the embedding from the response
                embedding = response["data"][0]["embedding"]
                
                return embedding
            
            except Exception as e:
                retries += 1
                logger.warning(f"Embedding generation attempt {retries} failed: {str(e)}")
                if retries < MAX_RETRIES:
                    time.sleep(RETRY_DELAY)
                else:
                    logger.error(f"Failed to generate embedding after {MAX_RETRIES} attempts: {str(e)}")
                    raise
    
    @staticmethod
    def cosine_similarity(embedding1: List[float], embedding2: List[float]) -> float:
        """
        Calculate cosine similarity between two embedding vectors
        
        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector
            
        Returns:
            Cosine similarity as a float between -1 and 1
        """
        # Convert to numpy arrays for efficiency
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        # Calculate cosine similarity
        similarity = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
        
        return float(similarity)
    
    @staticmethod
    def batch_generate_embeddings(texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embedding vectors
        """
        embeddings = []
        for text in texts:
            embedding = EmbeddingService.generate_embedding(text)
            embeddings.append(embedding)
        return embeddings
    
    @staticmethod
    def mock_embedding(dimension: int = EMBEDDING_DIMENSIONS) -> List[float]:
        """
        Generate a mock embedding vector for testing
        
        Args:
            dimension: Size of the embedding vector
            
        Returns:
            A random unit vector of specified dimension
        """
        # Generate random vector
        random_vector = np.random.randn(dimension)
        # Normalize to unit length
        unit_vector = random_vector / np.linalg.norm(random_vector)
        return unit_vector.tolist()
    
    @staticmethod
    def serialize_embedding(embedding: List[float]) -> str:
        """
        Serialize embedding to JSON string for storage
        
        Args:
            embedding: Embedding vector
            
        Returns:
            JSON string
        """
        return json.dumps(embedding)
    
    @staticmethod
    def deserialize_embedding(serialized: str) -> List[float]:
        """
        Deserialize embedding from JSON string
        
        Args:
            serialized: JSON string
            
        Returns:
            Embedding vector
        """
        return json.loads(serialized) 