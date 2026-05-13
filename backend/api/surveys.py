from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile

from api.dependencies import get_evidence_ocr_service, get_evidence_repo, get_survey_actor
from config.constants import (
    CIRCLE_AUTHORITY,
    DISTRICT_AUTHORITY,
    FARMER,
    KRUSHI_SAHAYAK,
    STATE_AUTHORITY,
    TALUKA_AUTHORITY,
    VILLAGE_AUTHORITY,
)
from db.repositories.farm_repository import FarmRepository
from middleware.auth import get_current_user
from schemas.auth import JwtUserClaims
from schemas.survey import SurveyCreate
from services.evidence_ocr_service import EvidenceOCRService
from services.survey_service import SurveyService
from utils.evidence_geo import extract_geo_context
from utils.response import failure, success

router = APIRouter(prefix="/surveys", tags=["Surveys"])

_EVIDENCE_UPLOAD_ROLES = (
    FARMER,
    KRUSHI_SAHAYAK,
    VILLAGE_AUTHORITY,
    CIRCLE_AUTHORITY,
    TALUKA_AUTHORITY,
    DISTRICT_AUTHORITY,
    STATE_AUTHORITY,
)


@router.post("/")
def create_survey(body: SurveyCreate, user: JwtUserClaims = Depends(get_current_user)):
    try:
        created = SurveyService().create(body, user)
        return success("Survey created", created, status_code=201)
    except ValueError as e:
        return failure(str(e), status_code=400)


@router.get("/")
def list_surveys(
    user: JwtUserClaims = Depends(get_current_user),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=200),
    status: Optional[str] = None,
    farm_id: Optional[UUID] = None,
):
    rows = SurveyService().list_surveys(user, offset=offset, limit=limit, status=status, farm_id=farm_id)
    return success("Surveys", {"items": rows, "offset": offset, "limit": limit})


@router.get("/evidence/flagged")
def list_flagged_evidence(
    assigned_to_me: Optional[bool] = Query(None),
    user: JwtUserClaims = Depends(get_survey_actor),
    evidence_repo: Any = Depends(get_evidence_repo),
):
    """Flagged survey evidence for officer dashboards (structured; no raw OCR text)."""
    taluka_id = user.taluka_id if assigned_to_me else None
    district_id = user.district_id if assigned_to_me else None
    rows = evidence_repo.get_flagged(min_risk_score=20, taluka_id=taluka_id, district_id=district_id)
    items: List[dict[str, Any]] = []
    for r in rows:
        fields = r.get("ocr_fields") if isinstance(r.get("ocr_fields"), dict) else {}
        vrf = r.get("verification_result") if isinstance(r.get("verification_result"), dict) else {}
        vname, _, _ = extract_geo_context(r)
        farmer_name = (
            fields.get("farmer_name")
            or fields.get("name")
            or fields.get("applicant_name")
            or fields.get("insured_name")
            or fields.get("consumer_name")
            or "—"
        )
        survey_no = fields.get("survey_number") or "—"
        items.append(
            {
                "evidence_id": str(r.get("id")),
                "survey_id": str(r.get("survey_id")),
                "document_type": r.get("document_type") or "unknown",
                "farmer_name": farmer_name,
                "scheme": fields.get("crop_type") or r.get("document_type") or "—",
                "village": vname or "—",
                "survey_number": survey_no,
                "risk_score": int(r.get("risk_score") or 0),
                "risk_level": r.get("risk_level") or "unknown",
                "verification_summary": vrf.get("summary") or "",
                "verification_checks": vrf.get("checks") or [],
                "risk_factors": r.get("risk_factors") or [],
            }
        )
    return success("Flagged evidence", {"items": items})


@router.get("/{survey_id}")
def get_survey(survey_id: UUID, user: JwtUserClaims = Depends(get_current_user)):
    row = SurveyService().get(survey_id, user)
    if not row:
        return failure("Survey not found or forbidden", status_code=404)
    return success("Survey", row)


@router.post("/{survey_id}/evidence")
async def attach_evidence(
    survey_id: UUID,
    file: UploadFile = File(...),
    document_type: Optional[str] = Form(default=None),
    user: JwtUserClaims = Depends(get_survey_actor),
    evidence_ocr_service: EvidenceOCRService = Depends(get_evidence_ocr_service),
):
    """
    Attach evidence file to a survey. OCR runs server-side; response is officer-safe
    (structured fields + verification + risk — no raw OCR text).
    """
    if user.role not in _EVIDENCE_UPLOAD_ROLES:
        raise HTTPException(status_code=403, detail="Insufficient permissions for this operation")
    survey_row = SurveyService().get(survey_id, user)
    if not survey_row:
        return failure("Survey not found or forbidden", status_code=404)

    farm = FarmRepository().get_by_id(str(survey_row["farm_id"]))
    farmer_id = ""
    if farm and farm.get("farmer_profile_id") is not None:
        farmer_id = str(farm["farmer_profile_id"])

    raw_bytes = await file.read()
    try:
        record = await evidence_ocr_service.process_evidence(
            file_bytes=raw_bytes,
            filename=file.filename or "upload.bin",
            survey_id=str(survey_id),
            farmer_id=farmer_id,
            document_type=document_type,
            uploaded_by=user.sub,
        )
    except ValueError as e:
        return failure(str(e), status_code=400)
    except RuntimeError as e:
        return failure(str(e), status_code=500)

    vr = record.verification_result or {}
    return success(
        "Evidence analyzed",
        {
            "evidence_id": record.id,
            "document_type": record.document_type,
            "risk_score": record.risk_score,
            "risk_level": record.risk_level,
            "risk_factors": record.risk_factors,
            "requires_manual_review": record.requires_manual_review,
            "ocr_confidence": record.ocr_confidence,
            "extracted_fields": record.ocr_fields,
            "verification_summary": vr.get("summary"),
            "verification_checks": vr.get("checks", []),
        },
        status_code=201,
    )


@router.post("/gr-assistant")
async def gr_assistant(
    file: UploadFile = File(...),
    user: JwtUserClaims = Depends(get_survey_actor),
    evidence_ocr_service: EvidenceOCRService = Depends(get_evidence_ocr_service),
):
    """GR PDF upload for Krishi Sahayak — structured GR fields only (no raw OCR text)."""
    if user.role != KRUSHI_SAHAYAK:
        raise HTTPException(status_code=403, detail="Insufficient permissions for this operation")
    raw_bytes = await file.read()
    try:
        result = await evidence_ocr_service.process_gr_document(
            file_bytes=raw_bytes,
            filename=file.filename or "gr.pdf",
            uploaded_by=user.sub,
        )
    except ValueError as e:
        return failure(str(e), status_code=400)
    return success("GR insights", result)
