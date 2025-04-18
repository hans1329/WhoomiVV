from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from src.backend.services.memory_service import MemoryService
from src.backend.services.memory_tagger_service import MemoryTaggerService
from src.backend.services.embedding_service import EmbeddingService
from src.backend.db.database import get_db, init_db, seed_metadata

# Initialize router
router = APIRouter(
    prefix="/api/memory",
    tags=["memory"],
    responses={404: {"description": "Not found"}},
)

# Pydantic models for API requests and responses
class MemoryCreate(BaseModel):
    text: str
    dopple_id: str
    user_id: str
    role: str = Field(..., description="Either 'user' or 'dopple'")
    emotions: Optional[List[str]] = None
    topics: Optional[List[str]] = None
    traits: Optional[List[str]] = None
    importance: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None
    auto_tag: bool = True
    mock_tag: bool = False

class MemoryResponse(BaseModel):
    id: str
    text: str
    dopple_id: str
    user_id: str
    role: str
    timestamp: str
    emotions: List[str]
    topics: List[str]
    traits: List[str]
    importance: int
    metadata: Optional[Dict[str, Any]]
    similarity: Optional[float] = None

class MemorySearchQuery(BaseModel):
    text: str
    dopple_id: Optional[str] = None
    user_id: Optional[str] = None
    top_k: int = 5
    similarity_threshold: float = 0.7
    mock: bool = False

class MemoryMetadataSearchQuery(BaseModel):
    dopple_id: Optional[str] = None
    user_id: Optional[str] = None
    emotions: Optional[List[str]] = None
    topics: Optional[List[str]] = None
    traits: Optional[List[str]] = None
    min_importance: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = 20
    offset: int = 0

class MemoryStatsResponse(BaseModel):
    total_memories: int
    user_memories: int
    dopple_memories: int
    top_emotions: List[Dict[str, Any]]
    top_topics: List[Dict[str, Any]]
    top_traits: List[Dict[str, Any]]

class TagResponse(BaseModel):
    emotions: List[str]
    topics: List[str]
    traits: List[str]
    importance: int

class ConversationAnalysisRequest(BaseModel):
    conversation: List[Dict[str, Any]]

# ---- Endpoints ----

@router.post("/init")
async def initialize_memory_system():
    """
    Initialize the memory system database and seed metadata
    """
    try:
        init_db()
        seed_metadata()
        return {"status": "success", "message": "Memory system initialized successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize memory system: {str(e)}")

@router.post("/store", response_model=str)
async def store_memory(memory: MemoryCreate):
    """
    Store a new memory and generate embedding
    """
    try:
        # Auto-tag memory if requested
        if memory.auto_tag:
            tags = MemoryTaggerService.tag_memory(memory.text, use_mock=memory.mock_tag)
            if not memory.emotions:
                memory.emotions = tags.get('emotions', [])
            if not memory.topics:
                memory.topics = tags.get('topics', [])
            if not memory.traits:
                memory.traits = tags.get('traits', [])
            if not memory.importance:
                memory.importance = tags.get('importance', 5)
        
        # Store the memory
        memory_id = MemoryService.store_memory(
            text=memory.text,
            dopple_id=memory.dopple_id,
            user_id=memory.user_id,
            role=memory.role,
            emotions=memory.emotions,
            topics=memory.topics,
            traits=memory.traits,
            importance=memory.importance,
            metadata=memory.metadata,
            generate_embedding=True,
            mock_embedding=False
        )
        
        return memory_id
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store memory: {str(e)}")

@router.get("/get/{memory_id}", response_model=MemoryResponse)
async def get_memory(memory_id: str):
    """
    Get memory by ID
    """
    memory = MemoryService.get_memory(memory_id)
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    return memory

@router.post("/search/similar", response_model=List[MemoryResponse])
async def search_similar_memories(query: MemorySearchQuery):
    """
    Search for memories similar to the provided text
    """
    memories = MemoryService.find_similar_memories(
        query_text=query.text,
        dopple_id=query.dopple_id,
        user_id=query.user_id,
        top_k=query.top_k,
        similarity_threshold=query.similarity_threshold,
        mock=query.mock
    )
    return memories

@router.post("/search/metadata", response_model=List[MemoryResponse])
async def search_memories_by_metadata(query: MemoryMetadataSearchQuery):
    """
    Search for memories by metadata filters
    """
    memories = MemoryService.search_memories_by_metadata(
        dopple_id=query.dopple_id,
        user_id=query.user_id,
        emotions=query.emotions,
        topics=query.topics,
        traits=query.traits,
        min_importance=query.min_importance,
        start_date=query.start_date,
        end_date=query.end_date,
        limit=query.limit,
        offset=query.offset
    )
    return memories

@router.get("/stats/{dopple_id}", response_model=MemoryStatsResponse)
async def get_memory_stats(
    dopple_id: str,
    user_id: Optional[str] = None
):
    """
    Get memory statistics for a dopple
    """
    stats = MemoryService.get_memory_stats(dopple_id, user_id)
    return stats

@router.post("/tag", response_model=TagResponse)
async def tag_text(
    text: str = Body(..., embed=True),
    use_mock: bool = Body(False, embed=True)
):
    """
    Tag text with emotions, topics, and personality traits
    """
    tags = MemoryTaggerService.tag_memory(text, use_mock=use_mock)
    return tags

@router.post("/analyze-conversation")
async def analyze_conversation(request: ConversationAnalysisRequest):
    """
    Analyze a conversation to extract trends and insights
    """
    analysis = MemoryTaggerService.analyze_conversation(request.conversation)
    return analysis 