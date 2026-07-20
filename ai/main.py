import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from gateway.router import GatewayRouter
from agents.orchestrator import AgentOrchestrator
from rag.service import RAGService
from mcp.server import MCPServer
from memory.service import MemoryService
from api.face_routes import router as face_router

load_dotenv()

memory = MemoryService()
gateway = GatewayRouter()
orchestrator = AgentOrchestrator()
rag = RAGService()
mcp = MCPServer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await memory.connect()
    yield
    await mcp.close()

app = FastAPI(title="EventOS AI Service", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGIN", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(face_router)

@app.get("/v1/health")
async def health():
    return {"status": "ok", "service": "ai"}

@app.post("/v1/ai/chat")
async def chat(request: dict):
    agent_type = request.get("agent_type", "organizer")
    message = request.get("message", "")
    event_id = request.get("event_id")
    conversation_id = request.get("conversation_id")

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    context = await rag.retrieve(message, event_id)

    if conversation_id:
        history = await memory.get_conversation(conversation_id)
    else:
        history = []

    response = await orchestrator.process(
        agent_type=agent_type,
        message=message,
        context=context,
        history=history,
    )

    if conversation_id:
        await memory.add_message(conversation_id, "user", message)
        await memory.add_message(conversation_id, "assistant", response.get("response", ""))

    return response

@app.post("/v1/ai/agents/{agent_type}/execute")
async def execute_agent(agent_type: str, request: dict):
    result = await orchestrator.execute_tool(
        agent_type=agent_type,
        tool=request.get("tool"),
        params=request.get("params", {}),
    )
    return {"result": result}

@app.get("/v1/ai/conversations")
async def list_conversations():
    try:
        conversations = await memory.list_conversations()
        return {"conversations": conversations}
    except Exception:
        return {"conversations": []}

@app.get("/v1/ai/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str):
    try:
        messages = await memory.get_conversation(conversation_id)
        return {"messages": messages}
    except Exception:
        return {"messages": []}

@app.post("/v1/mcp/tools/{tool_name}")
async def mcp_tool(tool_name: str, request: dict):
    try:
        result = await mcp.execute(tool_name, request.get("params", {}))
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/v1/mcp/tools")
async def list_mcp_tools():
    return {"tools": mcp.list_tools()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
