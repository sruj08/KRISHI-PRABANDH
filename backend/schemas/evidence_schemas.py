from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class OCRResult(BaseModel):
    raw_text: str
    fields: Dict[str, Any]
    engine_used: str
    confidence: float
    document_type: str


class VerificationCheck(BaseModel):
    check_name: str
    passed: bool
    expected: str
    found: str
    is_critical: bool = False


class VerificationResult(BaseModel):
    checks: List[VerificationCheck]
    all_passed: bool
    critical_failures: List[str]
    summary: str


class RiskScore(BaseModel):
    score: int = Field(ge=0, le=100)
    level: str  # "safe" | "review" | "high_risk"
    factors: List[str]


class EvidenceRecord(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    survey_id: str
    farmer_id: Optional[str] = None
    filename: str = ""
    document_type: str = "unknown"
    ocr_fields: Dict[str, Any] = Field(default_factory=dict)
    ocr_engine_used: str = ""
    ocr_confidence: float = 0.0
    verification_result: Dict[str, Any] = Field(default_factory=dict)
    risk_score: int = 0
    risk_level: str = "unknown"
    risk_factors: List[str] = Field(default_factory=list)
    requires_manual_review: bool = False
    uploaded_by: Optional[str] = None
    created_at: Optional[datetime] = None


class GRSummary(BaseModel):
    """Structured GR insights for Krishi Sahayak (no raw OCR body)."""

    scheme_name: Optional[str] = None
    eligibility: Optional[str] = None
    deadline: Optional[str] = None
    subsidy_percentage: Optional[str] = None
    required_documents: Optional[str] = None
    conditions: Optional[str] = None
    confidence: float = 0.0


class OfficerInsightCard(BaseModel):
    """TAO-style dashboard card — structured fields and verification, not raw OCR text."""

    farmer_name: Optional[str] = None
    survey_number: Optional[str] = None
    village: Optional[str] = None
    bank_account: Optional[str] = None
    risk_score: int = 0
    risk_level: str = "unknown"
    risk_factors: List[str] = Field(default_factory=list)
    verification_summary: str = ""
    verification_checks: List[VerificationCheck] = Field(default_factory=list)
    requires_field_visit: bool = False
    action_required: str = "review"  # "approve" | "review" | "reject" | "field_visit"
