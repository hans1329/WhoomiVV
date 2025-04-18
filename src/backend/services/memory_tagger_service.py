import logging
import random
from typing import List, Dict, Any, Optional, Tuple
import json
import os
import openai
from datetime import datetime

logger = logging.getLogger(__name__)

# Configure OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")

# Common emotion categories
EMOTIONS = [
    "happy", "sad", "angry", "surprised", "afraid", 
    "disgusted", "neutral", "curious", "excited", "thoughtful"
]

# Common topic categories
TOPICS = [
    "personal", "work", "family", "relationships", "hobbies", 
    "education", "health", "entertainment", "technology", "philosophy",
    "art", "science", "ethics"
]

# Common personality traits
TRAITS = [
    "creative", "analytical", "empathetic", "logical", "decisive",
    "adaptable", "optimistic", "pessimistic", "curious", "cautious",
    "adventurous", "organized", "spontaneous"
]

class MemoryTaggerService:
    """Service for tagging memories with emotions, topics, and personality traits"""
    
    @staticmethod
    def mock_tag_memory(text: str) -> Dict[str, List[str]]:
        """
        Generate mock tags for a memory text
        
        Args:
            text: The text to tag
            
        Returns:
            Dict with keys 'emotions', 'topics', 'traits' and list values
        """
        # Randomly select 1-2 emotions
        num_emotions = random.randint(1, 2)
        selected_emotions = random.sample(EMOTIONS, num_emotions)
        
        # Randomly select 1-3 topics
        num_topics = random.randint(1, 3)
        selected_topics = random.sample(TOPICS, num_topics)
        
        # Randomly select 1-2 personality traits
        num_traits = random.randint(1, 2)
        selected_traits = random.sample(TRAITS, num_traits)
        
        return {
            "emotions": selected_emotions,
            "topics": selected_topics,
            "traits": selected_traits,
            "importance": random.randint(3, 8)  # Random importance score
        }
    
    @staticmethod
    def tag_memory_with_openai(text: str) -> Dict[str, List[str]]:
        """
        Tag memory using OpenAI's API
        
        Args:
            text: The text to tag
            
        Returns:
            Dict with keys 'emotions', 'topics', 'traits', 'importance' and appropriate values
        """
        try:
            # Prepare the prompt
            prompt = f"""
            Analyze the following text and identify:
            1. Emotions expressed or evoked (limit to 1-2)
            2. Topics discussed (limit to 1-3)
            3. Personality traits reflected (limit to 1-2)
            4. Importance level (1-10 scale, where 10 is extremely important)
            
            Only select from the following predefined categories:
            - Emotions: {', '.join(EMOTIONS)}
            - Topics: {', '.join(TOPICS)}
            - Traits: {', '.join(TRAITS)}
            
            Format your response as a JSON object with keys 'emotions', 'topics', 'traits', and 'importance'.
            
            Text to analyze: "{text}"
            """
            
            # Call OpenAI API
            response = openai.ChatCompletion.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that analyzes text and extracts structured information."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=300
            )
            
            # Extract JSON response
            response_text = response.choices[0].message.content
            
            # Try to parse JSON from response
            # First, try to extract JSON if it's wrapped in code blocks
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].strip()
            else:
                json_str = response_text.strip()
            
            result = json.loads(json_str)
            
            # Validate response format
            required_keys = ['emotions', 'topics', 'traits', 'importance']
            for key in required_keys:
                if key not in result:
                    result[key] = []
            
            # Ensure all values are valid
            result['emotions'] = [e for e in result.get('emotions', []) if e in EMOTIONS]
            result['topics'] = [t for t in result.get('topics', []) if t in TOPICS]
            result['traits'] = [t for t in result.get('traits', []) if t in TRAITS]
            
            # Ensure importance is an integer between 1 and 10
            if 'importance' in result:
                try:
                    importance = int(result['importance'])
                    result['importance'] = max(1, min(10, importance))  # Clamp between 1-10
                except (ValueError, TypeError):
                    result['importance'] = 5  # Default to 5 if invalid
            else:
                result['importance'] = 5
            
            return result
            
        except Exception as e:
            logger.error(f"Error tagging memory with OpenAI: {str(e)}")
            # Fall back to mock implementation
            return MemoryTaggerService.mock_tag_memory(text)
    
    @staticmethod
    def tag_memory(text: str, use_mock: bool = False) -> Dict[str, List[str]]:
        """
        Tag memory with emotions, topics, and personality traits
        
        Args:
            text: The text to tag
            use_mock: Whether to use mock implementation instead of API
            
        Returns:
            Dict with keys 'emotions', 'topics', 'traits', 'importance' and appropriate values
        """
        if use_mock or not openai.api_key:
            return MemoryTaggerService.mock_tag_memory(text)
        else:
            return MemoryTaggerService.tag_memory_with_openai(text)
    
    @staticmethod
    def analyze_conversation(conversation_history: List[Dict]) -> Dict:
        """
        Analyze a conversation to extract emotional trends and key topics
        
        Args:
            conversation_history: List of message dictionaries with 'text' and 'role' keys
            
        Returns:
            Dictionary with analysis results
        """
        # In a real implementation, this would call an LLM to analyze the conversation
        # For now, we'll implement a simple mock analysis
        
        all_emotions = []
        all_topics = []
        all_traits = []
        
        # Process each message
        for message in conversation_history:
            # Tag the message
            tags = MemoryTaggerService.tag_memory(message['text'], use_mock=True)
            
            # Collect all tags
            all_emotions.extend(tags['emotions'])
            all_topics.extend(tags['topics'])
            all_traits.extend(tags['traits'])
        
        # Count occurrences
        emotion_counts = {}
        for emotion in all_emotions:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        topic_counts = {}
        for topic in all_topics:
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
        trait_counts = {}
        for trait in all_traits:
            trait_counts[trait] = trait_counts.get(trait, 0) + 1
        
        # Sort by count (descending)
        top_emotions = sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        top_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        top_traits = sorted(trait_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            "top_emotions": [{"name": name, "count": count} for name, count in top_emotions],
            "top_topics": [{"name": name, "count": count} for name, count in top_topics],
            "top_traits": [{"name": name, "count": count} for name, count in top_traits],
            "message_count": len(conversation_history),
            "timestamp": datetime.utcnow().isoformat()
        } 