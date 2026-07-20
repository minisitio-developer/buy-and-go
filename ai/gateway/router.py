import os
from typing import Optional
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic

class LLMRouter:
    def __init__(self):
        self.openai = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.anthropic = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

        self.model_map = {
            "organizer": {"provider": "openai", "model": "gpt-4o"},
            "marketing": {"provider": "openai", "model": "gpt-4o"},
            "analytics": {"provider": "openai", "model": "gpt-4o"},
            "crm": {"provider": "openai", "model": "gpt-4o"},
            "support": {"provider": "openai", "model": "gpt-4o-mini"},
            "sponsor": {"provider": "openai", "model": "gpt-4o"},
        }

    async def chat(
        self,
        agent_type: str,
        system_prompt: str,
        messages: list,
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> str:
        config = self.model_map.get(agent_type, self.model_map["support"])

        if config["provider"] == "openai":
            return await self._call_openai(
                model=config["model"],
                system_prompt=system_prompt,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
        else:
            return await self._call_anthropic(
                model=config["model"],
                system_prompt=system_prompt,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )

    async def _call_openai(
        self, model: str, system_prompt: str, messages: list,
        temperature: float, max_tokens: int,
    ) -> str:
        response = await self.openai.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                *[{"role": m["role"], "content": m["content"]} for m in messages],
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""

    async def _call_anthropic(
        self, model: str, system_prompt: str, messages: list,
        temperature: float, max_tokens: int,
    ) -> str:
        response = await self.anthropic.messages.create(
            model=model,
            system=system_prompt,
            messages=[{"role": m["role"], "content": m["content"]} for m in messages],
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return response.content[0].text if response.content else ""


class GatewayRouter:
    def __init__(self):
        self.llm = LLMRouter()
