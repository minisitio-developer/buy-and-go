import os
import json
from typing import Optional, List
import redis.asyncio as redis

class MemoryService:
    def __init__(self):
        self.redis = None

    async def connect(self):
        self.redis = redis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379"),
            decode_responses=True,
        )

    async def get_conversation(self, conversation_id: str) -> List[dict]:
        if not self.redis:
            await self.connect()
        data = await self.redis.get(f"conversation:{conversation_id}")
        return json.loads(data) if data else []

    async def add_message(self, conversation_id: str, role: str, content: str):
        if not self.redis:
            await self.connect()
        key = f"conversation:{conversation_id}"
        messages = await self.get_conversation(conversation_id)
        messages.append({"role": role, "content": content, "timestamp": str(__import__('datetime').datetime.now())})
        await self.redis.set(key, json.dumps(messages))
        await self.redis.sadd("conversations:index", conversation_id)

    async def list_conversations(self) -> List[dict]:
        if not self.redis:
            await self.connect()
        ids = await self.redis.smembers("conversations:index")
        result = []
        for cid in ids:
            msgs = await self.get_conversation(cid)
            if msgs:
                result.append({
                    "id": cid,
                    "message_count": len(msgs),
                    "last_message": msgs[-1].get("content", "")[:100] if msgs else "",
                    "created_at": msgs[0].get("timestamp", "") if msgs else "",
                })
        return sorted(result, key=lambda x: x.get("created_at", ""), reverse=True)

    async def clear_conversation(self, conversation_id: str):
        if not self.redis:
            await self.connect()
        await self.redis.delete(f"conversation:{conversation_id}")
        await self.redis.srem("conversations:index", conversation_id)
