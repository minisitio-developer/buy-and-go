import os
from typing import Optional, List, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import PointStruct, Filter, FieldCondition, MatchValue
import logging

logger = logging.getLogger(__name__)


class QdrantService:
    def __init__(self):
        self.url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self.api_key = os.getenv("QDRANT_API_KEY")
        self.client = QdrantClient(url=self.url, api_key=self.api_key)

    async def ensure_collection(self, collection: str, vector_size: int = 128):
        collections = self.client.get_collections().collections
        if not any(c.name == collection for c in collections):
            self.client.create_collection(
                collection_name=collection,
                vectors_config=models.VectorParams(
                    size=vector_size,
                    distance=models.Distance.COSINE,
                ),
            )
            logger.info(f"Created collection '{collection}' with size {vector_size}")

    async def upsert(self, collection: str, points: List[Dict[str, Any]]):
        await self.ensure_collection(collection, vector_size=len(points[0]["vector"]))
        self.client.upsert(
            collection_name=collection,
            points=[
                PointStruct(
                    id=p["id"],
                    vector=p["vector"],
                    payload=p.get("payload", {}),
                )
                for p in points
            ],
        )

    async def search(
        self,
        collection: str,
        query_vector: List[float],
        limit: int = 10,
        score_threshold: Optional[float] = None,
        filter_payload: Optional[Dict[str, Any]] = None,
    ) -> List[Any]:
        try:
            qfilter = None
            if filter_payload:
                conditions = [
                    FieldCondition(key=k, match=MatchValue(value=v))
                    for k, v in filter_payload.items()
                ]
                qfilter = Filter(must=conditions)

            results = self.client.search(
                collection_name=collection,
                query_vector=query_vector,
                limit=limit,
                score_threshold=score_threshold,
                query_filter=qfilter,
            )
            return results
        except Exception as e:
            logger.error(f"Qdrant search failed: {e}")
            return []

    async def delete_by_filter(self, collection: str, filter_payload: Dict[str, Any]):
        conditions = [
            FieldCondition(key=k, match=MatchValue(value=v))
            for k, v in filter_payload.items()
        ]
        self.client.delete(
            collection_name=collection,
            points_selector=models.FilterSelector(
                filter=Filter(must=conditions),
            ),
        )
