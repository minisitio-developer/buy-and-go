import os
import cv2
import numpy as np
from deepface import DeepFace
from typing import Dict, List, Optional, Tuple
from core.qdrant import QdrantService
import logging

logger = logging.getLogger(__name__)

class FaceRecognitionService:
    def __init__(self, qdrant: Optional[QdrantService] = None):
        self.backend = os.getenv("FACE_DETECTOR_BACKEND", "opencv")
        self.model = os.getenv("FACE_EMBEDDING_MODEL", "Facenet")
        self.metric = "cosine"
        self.qdrant = qdrant or QdrantService()
        self._collection = "face_templates"

    async def _decode_image(self, image: bytes) -> np.ndarray:
        arr = np.frombuffer(image, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Invalid image data")
        return img

    async def _extract_embedding(self, image: np.ndarray) -> Tuple[np.ndarray, float]:
        try:
            embedding = DeepFace.represent(
                img_path=image,
                model_name=self.model,
                detector_backend=self.backend,
                enforce_detection=True,
                align=True,
            )
            if not embedding:
                raise ValueError("No face detected")
            emb = np.array(embedding[0]["embedding"], dtype=np.float32)
            area = embedding[0].get("area", 0)
            confidence = embedding[0].get("confidence", 0.0)
            facial_area = embedding[0].get("facial_area", {})
            quality_score = min(1.0, (confidence * 0.6) + (min(area / 50000, 1.0) * 0.4))
            return emb, quality_score
        except Exception as e:
            logger.error(f"Embedding extraction failed: {e}")
            raise ValueError(f"Face embedding extraction failed: {str(e)}")

    async def enroll_face(self, user_id: str, image: bytes) -> Dict:
        img = await self._decode_image(image)
        embedding, quality = await self._extract_embedding(img)

        if quality < 0.3:
            return {
                "success": False,
                "error": "Image quality too low for enrollment",
                "quality_score": round(quality, 4),
            }

        template_id = f"face_{user_id}_{os.urandom(4).hex()}"

        await self.qdrant.upsert(
            collection=self._collection,
            points=[{
                "id": template_id,
                "vector": embedding.tolist(),
                "payload": {
                    "user_id": user_id,
                    "algorithm": self.model,
                    "quality_score": round(quality, 4),
                    "enrolled_at": str(np.datetime64("now")),
                },
            }],
        )

        return {
            "success": True,
            "template_id": template_id,
            "user_id": user_id,
            "algorithm": self.model,
            "quality_score": round(quality, 4),
        }

    async def verify_face(self, user_id: str, image: bytes, threshold: float = 0.4) -> Dict:
        img = await self._decode_image(image)
        embedding, quality = await self._extract_embedding(img)

        templates = await self.qdrant.search(
            collection=self._collection,
            query_vector=embedding.tolist(),
            limit=5,
            score_threshold=threshold,
            filter_payload={"user_id": user_id},
        )

        if not templates:
            return {
                "verified": False,
                "score": 0.0,
                "quality_score": round(quality, 4),
                "message": "No matching template found",
            }

        best = templates[0]
        score = 1.0 - best.score

        return {
            "verified": score >= (1.0 - threshold),
            "score": round(score, 4),
            "quality_score": round(quality, 4),
            "template_id": best.id,
            "algorithm": self.model,
        }

    async def identify_face(self, image: bytes, event_id: str, threshold: float = 0.4) -> Dict:
        img = await self._decode_image(image)
        embedding, quality = await self._extract_embedding(img)

        templates = await self.qdrant.search(
            collection=self._collection,
            query_vector=embedding.tolist(),
            limit=1,
            score_threshold=threshold,
            filter_payload={"event_id": event_id} if event_id else None,
        )

        if not templates:
            return {
                "identified": False,
                "score": 0.0,
                "quality_score": round(quality, 4),
                "user_id": None,
                "message": "No matching identity found",
            }

        best = templates[0]
        score = 1.0 - best.score

        return {
            "identified": score >= (1.0 - threshold),
            "score": round(score, 4),
            "quality_score": round(quality, 4),
            "user_id": best.payload.get("user_id"),
            "template_id": best.id,
        }

    async def liveness_check(self, image: bytes) -> Dict:
        img = await self._decode_image(image)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 50:
            return {"live": False, "confidence": 0.0, "reason": "Blurred image - possible spoof"}

        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        faces = face_cascade.detectMultiScale(gray, 1.1, 5)
        if len(faces) == 0:
            return {"live": False, "confidence": 0.0, "reason": "No face detected"}

        eye_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_eye.xml"
        )
        eyes = eye_cascade.detectMultiScale(gray, 1.1, 5)
        has_eyes = len(eyes) >= 2

        texture_score = self._texture_analysis(gray)
        liveness_score = 0.0
        if has_eyes:
            liveness_score += 0.5
        liveness_score += texture_score * 0.5

        return {
            "live": liveness_score >= 0.5,
            "confidence": round(liveness_score, 4),
            "details": {
                "eyes_detected": len(eyes),
                "sharpness_score": round(min(laplacian_var / 500, 1.0), 4),
                "texture_score": round(texture_score, 4),
            },
        }

    def _texture_analysis(self, gray: np.ndarray) -> float:
        lbp = self._local_binary_pattern(gray)
        hist = cv2.calcHist([lbp.astype(np.uint8)], [0], None, [256], [0, 256])
        hist = cv2.normalize(hist, hist).flatten()

        entropy = -np.sum(hist * np.log2(hist + 1e-10))
        score = min(1.0, entropy / 5.0)
        return score

    def _local_binary_pattern(self, gray: np.ndarray, radius: int = 1, n_points: int = 8) -> np.ndarray:
        h, w = gray.shape
        lbp = np.zeros_like(gray, dtype=np.int32)
        for i in range(radius, h - radius):
            for j in range(radius, w - radius):
                center = gray[i, j]
                pattern = 0
                for k in range(n_points):
                    y = i + int(round(radius * np.cos(2 * np.pi * k / n_points)))
                    x = j + int(round(radius * np.sin(2 * np.pi * k / n_points)))
                    y = np.clip(y, 0, h - 1)
                    x = np.clip(x, 0, w - 1)
                    if gray[y, x] >= center:
                        pattern |= 1 << k
                lbp[i, j] = pattern
        return lbp

    async def detect_faces(self, image: bytes) -> List[Dict]:
        img = await self._decode_image(image)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(100, 100))

        results = []
        for x, y, w, h in faces:
            face_img = img[y:y + h, x:x + w]
            embedding, quality = await self._extract_embedding(face_img)
            results.append({
                "bbox": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
                "quality_score": round(quality, 4),
                "landmarks": {"left_eye": None, "right_eye": None, "nose": None, "mouth_left": None, "mouth_right": None},
            })

        return {"face_count": len(results), "faces": results}
