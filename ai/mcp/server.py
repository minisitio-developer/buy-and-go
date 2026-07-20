import os
import httpx
from typing import Any, Optional

class MCPServer:
    def __init__(self):
        self._tools = self._register_tools()
        self.backend_urls = {
            "event": os.getenv("EVENT_SERVICE_URL", "http://localhost:3002/v1"),
            "ticket": os.getenv("TICKET_SERVICE_URL", "http://localhost:3003/v1"),
            "checkin": os.getenv("CHECKIN_SERVICE_URL", "http://localhost:3004/v1"),
            "crm": os.getenv("CRM_SERVICE_URL", "http://localhost:3005/v1"),
        }
        self._http = httpx.AsyncClient(timeout=30.0)

    def _register_tools(self) -> dict:
        return {
            "create_event": {
                "description": "Create a new event",
                "params": {
                    "name": "string",
                    "type": "string: presential, hybrid, online",
                    "start_date": "string (ISO 8601)",
                    "end_date": "string (ISO 8601)",
                    "capacity": "integer (optional)",
                },
                "handler": self._handle_create_event,
            },
            "issue_certificate": {
                "description": "Generate certificates for attendees",
                "params": {"event_id": "string", "attendee_ids": "array of strings"},
                "handler": self._handle_issue_certificate,
            },
            "create_credentials": {
                "description": "Generate credentials/QR codes for attendees",
                "params": {"event_id": "string", "attendee_ids": "array of strings"},
                "handler": self._handle_create_credentials,
            },
            "get_dashboard": {
                "description": "Query event dashboard data",
                "params": {"event_id": "string"},
                "handler": self._handle_get_dashboard,
            },
            "register_sponsor": {
                "description": "Add a sponsor to an event",
                "params": {"event_id": "string", "name": "string", "tier": "string"},
                "handler": self._handle_register_sponsor,
            },
            "generate_report": {
                "description": "Generate executive report",
                "params": {"event_id": "string", "format": "string: pdf, csv"},
                "handler": self._handle_generate_report,
            },
            "send_whatsapp": {
                "description": "Send WhatsApp campaign",
                "params": {"event_id": "string", "message": "string"},
                "handler": self._handle_send_whatsapp,
            },
            "create_campaign": {
                "description": "Create marketing campaign",
                "params": {"event_id": "string", "type": "string", "name": "string"},
                "handler": self._handle_create_campaign,
            },
            "analyze_roi": {
                "description": "Analyze sponsor ROI",
                "params": {"sponsor_id": "string", "event_id": "string"},
                "handler": self._handle_analyze_roi,
            },
            "query_bi": {
                "description": "Natural language BI query",
                "params": {"event_id": "string", "query": "string"},
                "handler": self._handle_query_bi,
            },
            "create_qr": {
                "description": "Generate QR code",
                "params": {"event_id": "string", "attendee_id": "string"},
                "handler": self._handle_create_qr,
            },
            "create_app": {
                "description": "Configure event mobile app",
                "params": {"event_id": "string"},
                "handler": self._handle_create_app,
            },
            "create_schedule": {
                "description": "Add agenda items",
                "params": {"event_id": "string", "items": "array of schedule objects"},
                "handler": self._handle_create_schedule,
            },
            "create_survey": {
                "description": "Create attendee survey",
                "params": {"event_id": "string", "title": "string"},
                "handler": self._handle_create_survey,
            },
        }

    def list_tools(self) -> list:
        return [
            {"name": name, "description": info["description"], "params": info["params"]}
            for name, info in self._tools.items()
        ]

    async def execute(self, tool_name: str, params: dict) -> Any:
        tool = self._tools.get(tool_name)
        if not tool:
            raise ValueError(f"Unknown tool: {tool_name}")

        handler = tool["handler"]
        return await handler(**params)

    async def _handle_create_event(self, **kwargs) -> dict:
        try:
            r = await self._http.post(f"{self.backend_urls['event']}/events", json=kwargs)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            return {"status": "error", "message": str(e), "action": "create_event"}

    async def _handle_issue_certificate(self, **kwargs) -> dict:
        event_id = kwargs.get("event_id")
        attendee_ids = kwargs.get("attendee_ids", [])
        return {"status": "simulated", "certificates_generated": len(attendee_ids), "note": "Real certificate generation requires PDF service"}

    async def _handle_create_credentials(self, **kwargs) -> dict:
        event_id = kwargs.get("event_id")
        attendee_ids = kwargs.get("attendee_ids", [])
        return {"status": "simulated", "credentials_created": len(attendee_ids), "note": "Real credential generation requires PDF/QR service"}

    async def _handle_get_dashboard(self, **kwargs) -> dict:
        event_id = kwargs.get("event_id")
        try:
            r = await self._http.get(f"{self.backend_urls['checkin']}/events/{event_id}/check-ins/stats")
            r.raise_for_status()
            checkin_stats = r.json()
            return {"status": "ok", "data": checkin_stats}
        except Exception:
            return {"status": "simulated", "data": {"check_ins": 0, "occupancy": "0%"}}

    async def _handle_register_sponsor(self, **kwargs) -> dict:
        return {"status": "simulated", "sponsor": kwargs.get("name"), "note": "Sponsor module not yet implemented"}

    async def _handle_generate_report(self, **kwargs) -> dict:
        return {"status": "simulated", "url": None, "note": "Report generation requires BI service integration"}

    async def _handle_send_whatsapp(self, **kwargs) -> dict:
        return {"status": "simulated", "sent": True, "note": "WhatsApp integration requires Twilio/WhatsApp API key"}

    async def _handle_create_campaign(self, **kwargs) -> dict:
        return {"status": "simulated", "campaign_id": None, "note": "Marketing campaign requires email/SMS service"}

    async def _handle_analyze_roi(self, **kwargs) -> dict:
        return {"roi": 0, "visits": 0, "avg_stay": "0m0s", "note": "ROI analysis requires event data"}

    async def _handle_query_bi(self, **kwargs) -> dict:
        return {"answer": "BI query requires data warehouse connection", "query": kwargs.get("query")}

    async def _handle_create_qr(self, **kwargs) -> dict:
        return {"status": "simulated", "qr_code": None, "note": "QR generation requires image service"}

    async def _handle_create_app(self, **kwargs) -> dict:
        return {"status": "simulated", "app_url": None, "note": "App generation requires mobile build pipeline"}

    async def _handle_create_schedule(self, **kwargs) -> dict:
        event_id = kwargs.get("event_id")
        items = kwargs.get("items", [])
        try:
            created = []
            for item in items:
                r = await self._http.post(f"{self.backend_urls['event']}/events/{event_id}/schedules", json=item)
                if r.is_success:
                    created.append(r.json())
            return {"status": "ok", "items_created": len(created)}
        except Exception as e:
            return {"status": "error", "message": str(e), "items_created": 0}

    async def _handle_create_survey(self, **kwargs) -> dict:
        return {"status": "simulated", "survey_id": None, "note": "Survey module not yet implemented"}

    async def close(self):
        await self._http.aclose()
