from __future__ import annotations

from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile

from api.dependencies import get_evidence_ocr_service, get_evidence_repo, get_survey_actor
from config.constants import (
    CIRCLE_AUTHORITY,
    DISTRICT_AUTHORITY,
    FARMER,
    KRUSHI_SAHAYAK,
    ROLE_SAHAYAK,
    STATE_AUTHORITY,
    TALUKA_AUTHORITY,
    VILLAGE_AUTHORITY,
)
from db.repositories.farm_repository import FarmRepository
from middleware.auth import get_current_user
from schemas.auth import JwtUserClaims
from schemas.survey import SurveyCreate
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


@router.get("/queue")
def list_survey_queue(
    assigned_to_me: Optional[bool] = Query(None),
    user: JwtUserClaims = Depends(get_survey_actor),
    evidence_repo: Any = Depends(get_evidence_repo),
):
    """Pending queue of flagged evidence."""
    taluka_id = user.taluka_id if assigned_to_me else None
    district_id = user.district_id if assigned_to_me else None
    rows = evidence_repo.get_flagged(min_risk_score=20, taluka_id=taluka_id, district_id=district_id)
    items: List[dict[str, Any]] = []
    
    # Return mock data for pending queue demo if db is empty
    if not rows:
        return success("Pending Queue", {
            "items": [
                {
                    "id": "SRV-552E6D58",
                    "farmerName": "Mamta Kulkarni",
                    "damageType": "Cyclone",
                    "village": "Hadgaon_Village_48",
                    "status": "AI_PROCESSING",
                    "createdAt": "2026-05-15T08:52:00Z",
                    "severity": "High",
                    "aiRemarks": "Loss claim due to Cyclone",
                    "estPayout": "Rs. 25,000",
                    "aiConfidence": "92.5%",
                    "cropExtent": "~8.0 of 12.0 Hectares",
                    "farmerComments": "Heavy winds and rain damaged the entire field.",
                    "media": [
                        {"type": "image", "url": "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=400", "lat": "18.4580", "lon": "73.8513"},
                        {"type": "video", "url": "https://www.w3schools.com/html/mov_bbb.mp4", "lat": "18.4581", "lon": "73.8514"}
                    ],
                    "documents": [
                        {"name": "Claim_Form.pdf"},
                        {"name": "7_12_Extract.pdf"}
                    ]
                },
                {
                    "id": "P-105",
                    "farmerName": "Babanrao Patil",
                    "damageType": "Drought",
                    "village": "Wagholi",
                    "status": "PROCESSING",
                    "createdAt": "2026-05-14T10:00:00Z",
                    "severity": "Medium",
                    "aiRemarks": "Drought impact detected in geo-tagged images.",
                    "estPayout": "Rs. 12,000",
                    "aiConfidence": "85.0%",
                    "cropExtent": "~4.5 of 10.0 Hectares",
                    "farmerComments": "Lack of rain has ruined the crops.",
                    "media": [
                        {"type": "image", "url": "https://images.unsplash.com/photo-1584485509930-7411bc215037?auto=format&fit=crop&q=80&w=400", "lat": "19.0760", "lon": "72.8777"}
                    ],
                    "documents": [
                        {"name": "Survey_Report.pdf"}
                    ]
                },
                {
                    "id": "KP/EPP/2026/7681573780",
                    "farmerName": "Ramesh Chavan",
                    "damageType": "Flood",
                    "village": "Shirur",
                    "status": "PROCESSING",
                    "createdAt": "2026-05-13T18:52:00Z",
                    "severity": "High",
                    "aiRemarks": "Damage Score: 65% (Moderate-High). Disaster: Flood. Est Payout: Rs.19,500. Image Authenticity Verified (99.1%). Crop: Paddy (Bhaat).",
                    "estPayout": "Rs. 19,500",
                    "aiConfidence": "87.3%",
                    "cropExtent": "~6.5 of 10.12 Hectares",
                    "farmerComments": "\"standing water caused complete lodging of Paddy crop\"",
                    "media": [
                        {"type": "image", "url": "https://images.unsplash.com/photo-1473655584856-f08e4210a54d?auto=format&fit=crop&q=80&w=400", "lat": "18.5204", "lon": "73.8567"},
                        {"type": "image", "url": "https://images.unsplash.com/photo-1468276311594-df7cb65d8df6?auto=format&fit=crop&q=80&w=400", "lat": "18.5205", "lon": "73.8568"}
                    ],
                    "documents": [
                        {"name": "Land_Record.pdf"},
                        {"name": "Flood_Assessment.pdf"}
                    ]
                }
            ]
        })

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
                "id": str(r.get("id")),
                "farmerName": farmer_name,
                "damageType": fields.get("crop_type") or r.get("document_type") or "—",
                "village": vname or "—",
                "status": "PROCESSING",
                "createdAt": "2026-05-13T10:00:00Z",
                "severity": r.get("risk_level") or "Medium",
                "aiRemarks": vrf.get("summary") or "Pending Review",
            }
        )
    return success("Pending Queue", {"items": items})

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
    evidence_ocr_service: Any = Depends(get_evidence_ocr_service),
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
):
    """GR PDF upload for Krishi Sahayak — PDF text + keyword summary + eligible farmers (local registry)."""
    if user.role not in (ROLE_SAHAYAK, KRUSHI_SAHAYAK, "officer"):
        raise HTTPException(status_code=403, detail="Insufficient permissions for this operation")
    if not file.filename:
        return failure("Uploaded file must include a filename")
    raw_bytes = await file.read()
    if not raw_bytes:
        return failure("Uploaded file is empty")

    from services.gr_assistant_service import process_gr_pdf

    result = process_gr_pdf(raw_bytes)
    if not result.get("ok"):
        code = result.get("error") or "failed"
        status = 503 if code == "missing_dependency" else 422 if code == "no_text" else 400
        return failure(result.get("detail", "GR parse failed"), status_code=status)

    result["actor_sub"] = user.sub
    return success("GR parsed", result)
