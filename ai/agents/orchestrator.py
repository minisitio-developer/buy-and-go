import os
import httpx
from typing import Optional, Any
from gateway.router import LLMRouter
from agents.prompts import AGENT_PROMPTS

class AgentOrchestrator:
    def __init__(self):
        self.llm = LLMRouter()
        self._http = httpx.AsyncClient(timeout=30.0)
        self.backend_urls = {
            "event": os.getenv("EVENT_SERVICE_URL", "http://localhost:3002/v1"),
            "ticket": os.getenv("TICKET_SERVICE_URL", "http://localhost:3003/v1"),
            "checkin": os.getenv("CHECKIN_SERVICE_URL", "http://localhost:3004/v1"),
        }

    async def process(
        self,
        agent_type: str,
        message: str,
        context: Optional[str] = None,
        conversation_id: Optional[str] = None,
        history: Optional[list] = None,
    ) -> dict:
        system_prompt = AGENT_PROMPTS.get(agent_type, AGENT_PROMPTS["support"])

        if context:
            system_prompt += f"\n\nContext information:\n{context}"

        messages = list(history or [])
        messages.append({"role": "user", "content": message})

        response = await self.llm.chat(
            agent_type=agent_type,
            system_prompt=system_prompt,
            messages=messages,
        )

        return {
            "response": response,
            "agent_type": agent_type,
            "conversation_id": conversation_id,
        }

    async def execute_tool(self, agent_type: str, tool: str, params: dict) -> Any:
        tool_handlers = {
            "organizer": OrganizerTools(self._http, self.backend_urls),
            "marketing": MarketingTools(),
            "analytics": AnalyticsTools(),
        }

        handler = tool_handlers.get(agent_type)
        if not handler:
            raise ValueError(f"Unknown agent type: {agent_type}")

        method = getattr(handler, tool, None)
        if not method:
            raise ValueError(f"Unknown tool: {tool}")

        return await method(**params)


class OrganizerTools:
    def __init__(self, http: httpx.AsyncClient, backend_urls: dict):
        self._http = http
        self.urls = backend_urls

    async def create_event(self, name: str, type: str, start_date: str, end_date: str, capacity: int = 0, **kwargs):
        try:
            r = await self._http.post(f"{self.urls['event']}/events", json={
                "name": name, "type": type,
                "startDate": start_date, "endDate": end_date,
                "capacity": capacity, **kwargs,
            })
            r.raise_for_status()
            return {"action": "create_event", "status": "ok", "data": r.json()}
        except Exception as e:
            return {"action": "create_event", "status": "error", "message": str(e)}

    async def create_ticket_type(self, event_id: str, name: str, price: float, quantity: int):
        try:
            r = await self._http.post(f"{self.urls['ticket']}/events/{event_id}/ticket-types", json={
                "name": name, "price": price, "quantity": quantity,
            })
            r.raise_for_status()
            return {"action": "create_ticket_type", "status": "ok"}
        except Exception as e:
            return {"action": "create_ticket_type", "status": "error", "message": str(e)}

    async def publish_event(self, event_id: str):
        try:
            r = await self._http.post(f"{self.urls['event']}/events/{event_id}/publish")
            r.raise_for_status()
            return {"action": "publish_event", "status": "ok"}
        except Exception as e:
            return {"action": "publish_event", "status": "error", "message": str(e)}

    async def suggest_sponsors(self, event_category: str, city: str):
        return {"action": "suggest_sponsors", "suggestions": [
            {"name": "Banco XYZ", "tier": "diamond"},
            {"name": "Tech ABC", "tier": "gold"},
        ]}

    async def generate_budget(self, event_type: str, capacity: int, days: int):
        return {"action": "generate_budget", "estimated_cost": 250000, "currency": "BRL"}


class MarketingTools:
    async def create_email_campaign(self, event_id: str, subject: str, template: str):
        return {"action": "create_email_campaign", "status": "simulated", "note": "Email service not integrated"}

    async def generate_social_post(self, event_id: str, platform: str, message: str):
        return {"action": "generate_social_post", "platform": platform, "message": message}


class AnalyticsTools:
    async def query_data(self, event_id: str, query: str):
        return {"action": "query_data", "result": f"Simulated result for: {query}"}

    async def generate_report(self, event_id: str, format: str = "pdf"):
        return {"action": "generate_report", "format": format, "status": "simulated"}
