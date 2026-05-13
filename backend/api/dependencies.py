"""FastAPI dependency factories (lazy imports to avoid loading Supabase at import time)."""

from __future__ import annotations

from typing import Optional

from fastapi import Header, HTTPException


async def get_survey_actor(authorization: Optional[str] = Header(None)) -> JwtUserClaims:
    """
    Resolve JWT for survey OCR routes. In DEBUG, allow unauthenticated local UI
    (mock login) by synthesizing a Krushi Sahayak principal.
    """
    from config.constants import KRUSHI_SAHAYAK
    from config.settings import get_settings
    from schemas.auth import JwtUserClaims
    from services.auth_service import AuthService

    s = get_settings()
    auth = authorization or ""
    if s.debug and (not auth or not auth.lower().startswith("bearer ")):
        return JwtUserClaims(sub="00000000-0000-0000-0000-000000000001", role=KRUSHI_SAHAYAK)
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth.split(" ", 1)[1].strip()
    try:
        return AuthService().decode_token(token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e


def get_evidence_ocr_service():
    from db.repositories.audit_repository import AuditRepository
    from db.repositories.evidence_repository import EvidenceRepository
    from services.evidence_ocr_service import EvidenceOCRService
    from services.mock_verification_service import MockVerificationService
    from services.risk_engine_service import RiskEngineService

    return EvidenceOCRService(
        evidence_repo=EvidenceRepository(),
        audit_repo=AuditRepository(),
        verification_service=MockVerificationService(),
        risk_engine=RiskEngineService(),
    )


def get_evidence_repo():
    from db.repositories.evidence_repository import EvidenceRepository

    return EvidenceRepository()
