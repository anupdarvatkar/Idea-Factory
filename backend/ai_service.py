import os
import json
import google.generativeai as genai
from typing import List, Dict, Any
from dotenv import load_dotenv
import asyncio

load_dotenv()

class AIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('models/gemini-1.5-flash')
    
    async def evaluate_idea(self, idea_data: Dict[str, str], criteria: Dict[str, str]) -> Dict[str, Any]:
        """Evaluate a single idea using AI"""
        prompt = f"""
        Please evaluate the following business/product idea based on the provided criteria.
        
        Idea Title: "{idea_data['title']}"
        Idea Description: "{idea_data['description']}"

        Evaluation Criteria:
        1. Desirability: {criteria['desirability']}
        2. Feasibility: {criteria['feasibility']}
        3. Viability: {criteria['viability']}

        Provide a score from 1-10 for each criterion, with 1 being the lowest and 10 being the highest.
        Also provide detailed reasoning for each score.
        
        Return your response as a JSON object with the following structure:
        {{
            "summary": "A brief, one-paragraph summary of the AI's overall impression of the idea.",
            "desirability": {{
                "score": <number between 1-10>,
                "reasoning": "Detailed reasoning for the score, based on the provided criteria."
            }},
            "feasibility": {{
                "score": <number between 1-10>,
                "reasoning": "Detailed reasoning for the score, based on the provided criteria."
            }},
            "viability": {{
                "score": <number between 1-10>,
                "reasoning": "Detailed reasoning for the score, based on the provided criteria."
            }}
        }}
        """
        
        try:
            # Use synchronous call since the async version might not be available
            response = self.model.generate_content(prompt)
            
            # Parse the JSON response
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]
            
            evaluation_result = json.loads(response_text)
            return evaluation_result
        except Exception as e:
            print(f"Error in evaluate_idea: {e}")
            # Fallback if JSON parsing fails or API call fails
            return {
                "summary": "AI evaluation completed but response format was unexpected.",
                "desirability": {"score": 5, "reasoning": "Unable to parse detailed reasoning."},
                "feasibility": {"score": 5, "reasoning": "Unable to parse detailed reasoning."},
                "viability": {"score": 5, "reasoning": "Unable to parse detailed reasoning."}
            }
    
    async def cluster_ideas(self, ideas: List[Dict[str, str]], config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Cluster ideas using AI"""
        ideas_json = json.dumps(ideas, indent=2)
        
        prompt = f"""
        Analyze the following list of ideas and group them into {config['numberOfClusters']} distinct clusters.
        The primary basis for clustering should be: "{config['clusteringBasis']}".
        
        For each cluster, provide a descriptive name, a brief summary of the theme, and a list of the IDs of the ideas that belong to it.
        Ensure every idea is assigned to exactly one cluster.

        Here is the list of ideas in JSON format:
        {ideas_json}

        Return your response as a JSON array with the following structure:
        [
            {{
                "clusterName": "A short, descriptive name for this cluster (e.g., 'Sustainable Living Tech')",
                "clusterDescription": "A one-sentence summary of the common theme in this cluster",
                "ideaIds": ["list", "of", "idea", "ids"]
            }}
        ]
        """
        
        try:
            response = self.model.generate_content(prompt)
            
            # Clean the response text to extract JSON
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]
            
            clusters = json.loads(response_text)
            return clusters
        except Exception as e:
            print(f"Error in cluster_ideas: {e}")
            # Fallback clustering if AI response fails
            cluster_size = len(ideas) // config['numberOfClusters']
            clusters = []
            for i in range(config['numberOfClusters']):
                start_idx = i * cluster_size
                end_idx = start_idx + cluster_size if i < config['numberOfClusters'] - 1 else len(ideas)
                cluster_ideas = ideas[start_idx:end_idx]
                
                clusters.append({
                    "clusterName": f"Cluster {i + 1}",
                    "clusterDescription": f"Auto-generated cluster {i + 1}",
                    "ideaIds": [idea['id'] for idea in cluster_ideas]
                })
            
            return clusters
    
    async def classify_single_idea(self, idea_data: Dict[str, str], existing_clusters: Dict[str, List[str]]) -> Dict[str, Any]:
        """Classify a single idea into existing clusters or suggest a new cluster"""
        cluster_descriptions = []
        for name, titles in existing_clusters.items():
            sample_titles = titles[:2] if len(titles) >= 2 else titles
            cluster_descriptions.append(f"- {name}: (Includes ideas like: {', '.join(sample_titles)}, etc.)")
        
        clusters_text = '\n'.join(cluster_descriptions)
        
        prompt = f"""
        I have a new idea and I need to classify it into my existing organizational clusters.

        Here are my existing clusters and some example ideas within them:
        {clusters_text}

        Here is the new idea to classify:
        - Title: "{idea_data['title']}"
        - Description: "{idea_data['description']}"

        Your task:
        1. Analyze the new idea.
        2. Decide if it fits well into one of the existing clusters.
        3. If it doesn't fit, suggest a new, appropriate cluster name for it.
        4. Provide a brief reasoning for your decision.

        Return your suggestion as a JSON object with the following structure:
        {{
            "reasoning": "A brief explanation for why the idea fits an existing cluster or needs a new one.",
            "suggestionType": "EXISTING_CLUSTER" or "NEW_CLUSTER",
            "clusterName": "The name of the suggested cluster. If it's a new cluster, provide a suitable new name."
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            
            # Clean the response text to extract JSON
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]
            
            suggestion = json.loads(response_text)
            return suggestion
        except Exception as e:
            print(f"Error in classify_single_idea: {e}")
            # Fallback suggestion
            return {
                "reasoning": "Unable to parse AI response, suggesting new cluster.",
                "suggestionType": "NEW_CLUSTER",
                "clusterName": "Uncategorized Ideas"
            }