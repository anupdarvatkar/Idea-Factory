#!/usr/bin/env python3
"""
Test script to check available Gemini models.
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure API key
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# List available models
print("Available models:")
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"- {model.name}")
        print(f"  Display name: {model.display_name}")
        print(f"  Description: {model.description}")
        print()