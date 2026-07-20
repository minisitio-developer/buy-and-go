from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from typing import Optional
from services.face_recognition import FaceRecognitionService
from core.qdrant import QdrantService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/face", tags=["face"])

face_service = FaceRecognitionService(qdrant=QdrantService())


@router.post("/enroll")
async def enroll_face(
    user_id: str = Form(...),
    image: UploadFile = File(...),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image format")

    try:
        image_bytes = await image.read()
        result = await face_service.enroll_face(user_id=user_id, image=image_bytes)
        if not result.get("success"):
            raise HTTPException(status_code=422, detail=result.get("error", "Enrollment failed"))
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception("Face enrollment error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/verify")
async def verify_face(
    user_id: str = Form(...),
    image: UploadFile = File(...),
    threshold: float = Form(0.4),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image format")

    try:
        image_bytes = await image.read()
        result = await face_service.verify_face(
            user_id=user_id, image=image_bytes, threshold=threshold,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception("Face verification error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/identify")
async def identify_face(
    image: UploadFile = File(...),
    event_id: Optional[str] = Form(None),
    threshold: float = Form(0.4),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image format")

    try:
        image_bytes = await image.read()
        result = await face_service.identify_face(
            image=image_bytes, event_id=event_id or "", threshold=threshold,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception("Face identification error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/liveness")
async def liveness_check(
    image: UploadFile = File(...),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image format")

    try:
        image_bytes = await image.read()
        result = await face_service.liveness_check(image=image_bytes)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception("Liveness check error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/templates/{user_id}")
async def get_templates(user_id: str):
    try:
        templates = await face_service.qdrant.search(
            collection=face_service._collection,
            query_vector=[0.0] * 128,
            limit=100,
            filter_payload={"user_id": user_id},
        )
        return {
            "templates": [
                {
                    "template_id": t.id,
                    "user_id": t.payload.get("user_id"),
                    "algorithm": t.payload.get("algorithm"),
                    "quality_score": t.payload.get("quality_score"),
                    "enrolled_at": t.payload.get("enrolled_at"),
                }
                for t in templates
            ]
        }
    except Exception as e:
        logger.exception("Get templates error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/detect")
async def detect_faces(
    image: UploadFile = File(...),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image format")

    try:
        image_bytes = await image.read()
        result = await face_service.detect_faces(image=image_bytes)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception("Face detection error")
        raise HTTPException(status_code=500, detail="Internal server error")
