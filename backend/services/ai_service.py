import httpx
import json
import os
from typing import List, Dict, Any
from models.schemas import TestCaseCreate

class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")
        self.base_url = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
        
        if os.getenv("ANTHROPIC_API_KEY"):
            self.provider = "anthropic"
        else:
            self.provider = "openai"
    
    async def generate_test_cases(self, requirement: str, feature_name: str) -> List[Dict[str, Any]]:
        """Generate test cases using AI based on requirement and feature name"""
        
        prompt = f"""
        You are a senior QA engineer. Generate comprehensive test cases for the following requirement:

        Feature: {feature_name}
        Requirement: {requirement}

        Please generate test cases in JSON format with the following structure:
        {{
            "test_cases": [
                {{
                    "title": "Test case title",
                    "steps": "Step 1\\nStep 2\\nStep 3",
                    "expected_result": "Expected outcome",
                    "priority": "low|medium|high|critical"
                }}
            ]
        }}

        Guidelines:
        - Generate 5-10 comprehensive test cases
        - Cover positive, negative, and edge cases
        - Include UI, functional, and basic performance scenarios
        - Make steps clear and actionable
        - Expected results should be specific and measurable
        - Assign appropriate priority levels

        Return ONLY valid JSON, no additional text.
        """

        try:
            if self.provider == "anthropic":
                return await self._call_claude(prompt)
            else:
                return await self._call_openai(prompt)
        except Exception as e:
            print(f"Error generating test cases: {e}")
            return []
    
    async def _call_openai(self, prompt: str) -> List[Dict[str, Any]]:
        """Call OpenAI API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "gpt-4",
            "messages": [
                {"role": "system", "content": "You are a senior QA engineer generating test cases."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=data,
                timeout=60.0
            )
            response.raise_for_status()
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            # Parse JSON response
            try:
                parsed = json.loads(content)
                return parsed.get("test_cases", [])
            except json.JSONDecodeError:
                # Try to extract JSON from response
                start = content.find("{")
                end = content.rfind("}") + 1
                if start != -1 and end != -1:
                    json_str = content[start:end]
                    parsed = json.loads(json_str)
                    return parsed.get("test_cases", [])
                raise ValueError("Could not parse JSON from AI response")
    
    async def _call_claude(self, prompt: str) -> List[Dict[str, Any]]:
        """Call Claude API"""
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        
        data = {
            "model": "claude-3-sonnet-20240229",
            "max_tokens": 4000,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=data,
                timeout=60.0
            )
            response.raise_for_status()
            
            result = response.json()
            content = result["content"][0]["text"]
            
            # Parse JSON response
            try:
                parsed = json.loads(content)
                return parsed.get("test_cases", [])
            except json.JSONDecodeError:
                # Try to extract JSON from response
                start = content.find("{")
                end = content.rfind("}") + 1
                if start != -1 and end != -1:
                    json_str = content[start:end]
                    parsed = json.loads(json_str)
                    return parsed.get("test_cases", [])
                raise ValueError("Could not parse JSON from AI response")