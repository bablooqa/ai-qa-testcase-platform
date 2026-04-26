"""
Enhanced AI Service for AI QA Platform
Includes test case generation, analysis/improvement, and automation script generation
"""

import httpx
import json
import os
from typing import List, Dict, Any

class AIService:
    def __init__(self):
        # Check for Mistral API key first, then OpenAI, then Anthropic
        if os.getenv("MISTRAL_API_KEY"):
            self.api_key = os.getenv("MISTRAL_API_KEY")
            self.provider = "mistral"
        elif os.getenv("OPENAI_API_KEY"):
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.provider = "openai"
        elif os.getenv("ANTHROPIC_API_KEY"):
            self.api_key = os.getenv("ANTHROPIC_API_KEY")
            self.provider = "anthropic"
        else:
            self.api_key = None
            self.provider = None
        
        self.base_url = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
    
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
                    "steps": "Step 1\nStep 2\nStep 3",
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
            if self.provider == "mistral":
                return await self._call_mistral(prompt)
            elif self.provider == "anthropic":
                return await self._call_claude(prompt)
            elif self.provider == "openai":
                return await self._call_openai(prompt)
            else:
                print("No AI provider configured. Please set MISTRAL_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY")
                return []
        except Exception as e:
            print(f"Error generating test cases: {e}")
            return []
    
    async def analyze_and_improve_test_cases(self, test_cases: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze existing test cases and provide improvement suggestions
        Returns suggestions for missing edge cases, duplicates, and weak coverage
        """
        
        test_cases_text = json.dumps(test_cases, indent=2)
        
        prompt = f"""
        You are a senior QA architect. Analyze the following test cases and provide improvement suggestions:

        Test Cases:
        {test_cases_text}

        Please analyze and provide suggestions in this JSON format:
        {{
            "analysis": {{
                "total_test_cases": <number>,
                "coverage_assessment": "good|fair|poor",
                "strengths": ["<strength 1>", "<strength 2>"],
                "weaknesses": ["<weakness 1>", "<weakness 2>"]
            }},
            "suggestions": [
                {{
                    "test_case_id": <id or null>,
                    "test_case_title": "<title>",
                    "suggestion_type": "missing_edge_case|duplicate|weak_coverage|unclear_steps|missing_negative",
                    "description": "<detailed description of the issue>",
                    "recommended_action": "<specific action to take>",
                    "priority": "high|medium|low"
                }}
            ],
            "missing_scenarios": [
                {{
                    "category": "edge_case|negative|security|performance|api",
                    "description": "<what's missing>",
                    "suggested_test_case": {{
                        "title": "<title>",
                        "steps": "<steps>",
                        "expected_result": "<expected>",
                        "priority": "<priority>"
                    }}
                }}
            ],
            "summary": {{
                "critical_issues": <count>,
                "warnings": <count>,
                "recommendations": <count>,
                "overall_quality_score": <score 0-100>
            }}
        }}

        Analysis Guidelines:
        1. Check for missing edge cases (empty inputs, boundary values, special characters)
        2. Identify duplicate or overlapping test cases
        3. Look for weak test coverage in critical paths
        4. Check for unclear or vague steps
        5. Identify missing negative test scenarios
        6. Suggest API-specific tests if applicable
        7. Recommend security and performance tests if missing

        Return ONLY valid JSON, no additional text.
        """
        
        try:
            if self.provider == "mistral":
                return await self._call_mistral_analysis(prompt)
            elif self.provider == "anthropic":
                return await self._call_claude_analysis(prompt)
            elif self.provider == "openai":
                return await self._call_openai_analysis(prompt)
            else:
                return {"error": "No AI provider configured"}
        except Exception as e:
            return {"error": str(e)}

    async def generate_automation_script(
        self, 
        test_case: Dict[str, Any], 
        script_type: str = "playwright",
        application_url: str = "",
        additional_context: str = ""
    ) -> Dict[str, Any]:
        """
        Generate automation script for a test case
        Supports: playwright, selenium, pytest, cypress
        """
        
        # Script type-specific templates
        script_templates = {
            "playwright": {
                "language": "TypeScript",
                "framework": "Playwright",
                "run_cmd": "npx playwright test"
            },
            "selenium": {
                "language": "Python",
                "framework": "Selenium WebDriver",
                "run_cmd": "python test_script.py"
            },
            "pytest": {
                "language": "Python",
                "framework": "Pytest with Requests",
                "run_cmd": "pytest test_script.py -v"
            },
            "cypress": {
                "language": "JavaScript",
                "framework": "Cypress",
                "run_cmd": "npx cypress run"
            }
        }
        
        template = script_templates.get(script_type, script_templates["playwright"])
        
        prompt = f"""
        You are an automation expert. Generate a complete, production-ready {template['framework']} test script.

        Test Case Details:
        Title: {test_case.get('title', 'Untitled')}
        Steps: {test_case.get('steps', 'No steps provided')}
        Expected Result: {test_case.get('expected_result', 'No expected result')}
        
        Script Type: {script_type} ({template['language']})
        Application URL: {application_url or 'http://localhost:3000'}
        Additional Context: {additional_context or 'None'}

        Requirements:
        1. Generate complete, executable code in {template['language']}
        2. Include all necessary imports
        3. Add detailed comments explaining each step
        4. Include proper error handling
        5. Add setup and teardown (if needed)
        6. Use best practices for {template['framework']}
        7. Include assertions for the expected result
        8. Add wait conditions where appropriate
        9. Make selectors robust (prefer data-testid or stable attributes)

        Return the response in this JSON format:
        {{
            "script_type": "{script_type}",
            "language": "{template['language']}",
            "script_content": "<complete code here>",
            "setup_instructions": ["<step 1>", "<step 2>"],
            "run_command": "{template['run_cmd']}",
            "dependencies": ["<dependency 1>", "<dependency 2>"],
            "notes": ["<important note 1>"],
            "selectors_used": ["<selector 1> - <what it targets>"]
        }}

        Return ONLY valid JSON, no additional text outside the JSON.
        """
        
        try:
            if self.provider == "mistral":
                return await self._call_mistral_script(prompt)
            elif self.provider == "anthropic":
                return await self._call_claude_script(prompt)
            elif self.provider == "openai":
                return await self._call_openai_script(prompt)
            else:
                return {
                    "error": "No AI provider configured",
                    "script_type": script_type,
                    "language": template['language'],
                    "script_content": "# Please configure an AI provider"
                }
        except Exception as e:
            return {"error": str(e)}
    
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
            
            try:
                parsed = json.loads(content)
                return parsed.get("test_cases", [])
            except json.JSONDecodeError:
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
            "messages": [{"role": "user", "content": prompt}]
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
            
            try:
                parsed = json.loads(content)
                return parsed.get("test_cases", [])
            except json.JSONDecodeError:
                start = content.find("{")
                end = content.rfind("}") + 1
                if start != -1 and end != -1:
                    json_str = content[start:end]
                    parsed = json.loads(json_str)
                    return parsed.get("test_cases", [])
                raise ValueError("Could not parse JSON from AI response")
    
    async def _call_mistral(self, prompt: str) -> List[Dict[str, Any]]:
        """Call Mistral API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "mistral-large-latest",
            "messages": [
                {"role": "system", "content": "You are a senior QA engineer generating test cases."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.mistral.ai/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=60.0
            )
            response.raise_for_status()
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            try:
                parsed = json.loads(content)
                return parsed.get("test_cases", [])
            except json.JSONDecodeError:
                start = content.find("{")
                end = content.rfind("}") + 1
                if start != -1 and end != -1:
                    json_str = content[start:end]
                    parsed = json.loads(json_str)
                    return parsed.get("test_cases", [])
                raise ValueError("Could not parse JSON from AI response")

    async def _call_openai_analysis(self, prompt: str) -> Dict[str, Any]:
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        data = {"model": "gpt-4", "messages": [{"role": "user", "content": prompt}], "temperature": 0.3}
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=data, timeout=60.0)
            content = response.json()["choices"][0]["message"]["content"]
            return json.loads(content)

    async def _call_mistral_analysis(self, prompt: str) -> Dict[str, Any]:
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        data = {"model": "mistral-large-latest", "messages": [{"role": "user", "content": prompt}], "temperature": 0.3}
        async with httpx.AsyncClient() as client:
            response = await client.post("https://api.mistral.ai/v1/chat/completions", headers=headers, json=data, timeout=60.0)
            content = response.json()["choices"][0]["message"]["content"]
            return json.loads(content)

    async def _call_claude_analysis(self, prompt: str) -> Dict[str, Any]:
        headers = {"x-api-key": self.api_key, "Content-Type": "application/json", "anthropic-version": "2023-06-01"}
        data = {"model": "claude-3-sonnet-20240229", "max_tokens": 4000, "messages": [{"role": "user", "content": prompt}]}
        async with httpx.AsyncClient() as client:
            response = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=data, timeout=60.0)
            content = response.json()["content"][0]["text"]
            return json.loads(content)

    async def _call_openai_script(self, prompt: str) -> Dict[str, Any]:
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        data = {"model": "gpt-4", "messages": [{"role": "user", "content": prompt}], "temperature": 0.2}
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=data, timeout=60.0)
            content = response.json()["choices"][0]["message"]["content"]
            return json.loads(content)

    async def _call_mistral_script(self, prompt: str) -> Dict[str, Any]:
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        data = {"model": "mistral-large-latest", "messages": [{"role": "user", "content": prompt}], "temperature": 0.2}
        async with httpx.AsyncClient() as client:
            response = await client.post("https://api.mistral.ai/v1/chat/completions", headers=headers, json=data, timeout=60.0)
            content = response.json()["choices"][0]["message"]["content"]
            return json.loads(content)

    async def _call_claude_script(self, prompt: str) -> Dict[str, Any]:
        headers = {"x-api-key": self.api_key, "Content-Type": "application/json", "anthropic-version": "2023-06-01"}
        data = {"model": "claude-3-sonnet-20240229", "max_tokens": 4000, "messages": [{"role": "user", "content": prompt}]}
        async with httpx.AsyncClient() as client:
            response = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=data, timeout=60.0)
            content = response.json()["content"][0]["text"]
            return json.loads(content)
