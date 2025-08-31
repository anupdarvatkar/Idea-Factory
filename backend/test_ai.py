#!/usr/bin/env python3
"""
Test script for the AI service to debug evaluation issues.
"""

import asyncio
import os
from dotenv import load_dotenv
from ai_service import AIService

load_dotenv()

async def test_evaluation():
    try:
        print("Testing AI Service...")
        
        # Check API key
        api_key = os.getenv("GEMINI_API_KEY")
        print(f"API Key present: {'Yes' if api_key else 'No'}")
        
        # Create AI service
        ai_service = AIService()
        print("AI Service created successfully")
        
        # Test data
        idea_data = {
            "title": "Smart Plant Monitor",
            "description": "An IoT device that monitors plant health and sends notifications to your phone"
        }
        
        criteria = {
            "desirability": "Does this solve a real problem?",
            "feasibility": "Can this be built with current technology?",
            "viability": "Is there a clear business model?"
        }
        
        print("Starting evaluation...")
        result = await ai_service.evaluate_idea(idea_data, criteria)
        print("Evaluation result:")
        print(result)
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_evaluation())