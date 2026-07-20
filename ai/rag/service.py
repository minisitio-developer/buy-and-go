import os
from typing import Optional, List
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

class RAGService:
    def __init__(self):
        self.qdrant = QdrantClient(
            url=os.getenv("QDRANT_URL", "http://localhost:6333"),
        )
        self.encoder = SentenceTransformer("all-MiniLM-L6-v2")
        self.collections = {
            "event_knowledge": "Best practices for event configuration",
            "sponsor_database": "Sponsor profiles and categories",
            "marketing_templates": "Email and campaign templates",
            "support_faq": "Frequently asked questions",
        }

    async def retrieve(self, query: str, event_id: Optional[str] = None) -> str:
        try:
            query_vector = self.encoder.encode(query).tolist()
            results = []
            for collection in self.collections:
                hits = self.qdrant.search(
                    collection_name=collection,
                    query_vector=query_vector,
                    limit=3,
                )
                for hit in hits:
                    if hasattr(hit, 'payload') and hit.payload:
                        results.append(hit.payload.get("content", ""))

            context = "\n\n".join(results[:5]) if results else ""
            if event_id:
                try:
                    event_hits = self.qdrant.search(
                        collection_name="event_knowledge",
                        query_vector=query_vector,
                        query_filter={"must": [{"key": "event_id", "match": {"value": event_id}}]},
                        limit=3,
                    )
                    for hit in event_hits:
                        if hasattr(hit, 'payload') and hit.payload:
                            context += f"\n\n{hit.payload.get('content', '')}"
                except Exception:
                    pass
            return context
        except Exception:
            return ""

    async def index(self, collection: str, content: str, metadata: dict = None):
        try:
            vector = self.encoder.encode(content).tolist()
            self.qdrant.upsert(
                collection_name=collection,
                points=[{
                    "id": hash(content),
                    "vector": vector,
                    "payload": {"content": content, "metadata": metadata or {}},
                }],
            )
        except Exception:
            pass
