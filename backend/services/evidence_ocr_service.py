"""
Evidence OCR Service — wraps ocr_engine with domain intelligence.
Called when evidence files are attached to a survey (via API layer).
Never exposed as its own public HTTP router.
"""

from __future__ import annotations

import asyncio
from enum import Enum
from typing import Any, Dict, Optional

from db.repositories.audit_repository import AuditRepository
from db.repositories.evidence_repository import EvidenceRepository
from schemas.evidence_schemas import EvidenceRecord, OCRResult
from services.mock_verification_service import MockVerificationService
from services.ocr_engine import extract, list_schemas, ocr, postprocess
from services.ocr_engine.utils import allowed_file, cleanup, save_upload
from services.risk_engine_service import RiskEngineService


__all__ = ["EvidenceOCRService", "DocumentType"]


class DocumentType(str, Enum):
    AADHAAR = "aadhaar"
    SATBARA = "satbara"
    EIGHT_A = "eight_a"
    BHADE_KHAT = "bhade_khat"
    BANK_PASSBOOK = "bank_passbook"
    CROP_SOWING = "crop_sowing"
    EQUIPMENT_INVOICE = "equipment_invoice"
    GEO_PHOTO = "geo_photo"
    ELECTRICITY_BILL = "electricity_bill"
    CASTE_CERTIFICATE = "caste_certificate"
    INCOME_CERTIFICATE = "income_certificate"
    GR_DOCUMENT = "gr_document"
    CROP_LOSS = "crop_loss_application"
    INSURANCE = "insurance_document"
    UNKNOWN = "unknown"


class EvidenceOCRService:
    """
    Orchestrates the full pipeline:
    upload → preprocess → OCR → extract fields → verify → risk score → store

    Heavy OCR and blocking Supabase calls run in a worker thread to avoid blocking
    the asyncio event loop.
    """

    def __init__(
        self,
        evidence_repo: EvidenceRepository,
        audit_repo: AuditRepository,
        verification_service: MockVerificationService,
        risk_engine: RiskEngineService,
    ) -> None:
        self._evidence_repo = evidence_repo
        self._audit_repo = audit_repo
        self._verification = verification_service
        self._risk = risk_engine

    async def process_evidence(
        self,
        file_bytes: bytes,
        filename: str,
        survey_id: str,
        farmer_id: str,
        document_type: Optional[str] = None,
        uploaded_by: str = "system",
    ) -> EvidenceRecord:
        """
        Full pipeline. Returns EvidenceRecord with ocr_fields, verification_result, risk_score.
        Raises ValueError for unsupported file types.
        """
        if not allowed_file(filename or ""):
            raise ValueError(f"Unsupported file type: {filename}")

        saved_path = await asyncio.to_thread(save_upload, file_bytes, filename or "upload.bin")
        try:
            doc_type = self._classify_document(filename or "", document_type)

            ocr_result = await asyncio.to_thread(self._run_ocr_pipeline, saved_path, doc_type)

            verification = await self._verification.verify(
                ocr_result.fields,
                doc_type,
                farmer_id,
                survey_id,
            )

            risk = await self._risk.score(
                ocr_result.fields,
                verification,
                doc_type,
                survey_id,
            )

            storage_path = f"ocr://{survey_id}/{filename or 'file'}"

            record_row = await asyncio.to_thread(
                lambda: self._evidence_repo.create(
                    survey_id=survey_id,
                    farmer_id=farmer_id or None,
                    filename=filename or "unknown",
                    document_type=doc_type.value,
                    storage_path=storage_path,
                    ocr_raw_text=ocr_result.raw_text,
                    ocr_fields=ocr_result.fields,
                    ocr_engine_used=ocr_result.engine_used,
                    ocr_confidence=float(ocr_result.confidence or 0.0),
                    verification_result=verification.model_dump(mode="json"),
                    risk_score=int(risk.score),
                    risk_level=risk.level,
                    risk_factors=risk.factors,
                    requires_manual_review=risk.score >= 20,
                    uploaded_by=uploaded_by or None,
                ),
            )

            await asyncio.to_thread(
                self._audit_repo.append,
                {
                    "actor_id": str(uploaded_by),
                    "action": "EVIDENCE_PROCESSED",
                    "entity_type": "survey_evidence",
                    "entity_id": str(record_row.get("id")),
                    "payload": {
                        "doc_type": doc_type.value,
                        "risk_score": risk.score,
                        "engine": ocr_result.engine_used,
                        "survey_id": survey_id,
                    },
                },
            )

            return EvidenceRecord.model_validate(record_row)

        finally:
            await asyncio.to_thread(cleanup, saved_path)

    def _run_ocr_pipeline(self, img_path: str, doc_type: DocumentType) -> OCRResult:
        """Synchronous OCR pipeline — runs in a worker thread."""
        ocr_out = ocr(img_path)
        raw_text = str(ocr_out.get("text") or "")
        engine_used = str(ocr_out.get("engine_used") or "none")
        confidence = float(ocr_out.get("confidence") or 0.0)

        cleaned = postprocess(raw_text)

        fields: Dict[str, Any] = {}
        schema_name = doc_type.value
        available = set(list_schemas())
        if schema_name in available:
            fields = extract(cleaned, schema_name)

        return OCRResult(
            raw_text=cleaned,
            fields=fields,
            engine_used=engine_used,
            confidence=confidence,
            document_type=doc_type.value,
        )

    def _classify_document(self, filename: str, hint: Optional[str]) -> DocumentType:
        """Classify document type from hint or filename keywords."""
        allowed = {e.value for e in DocumentType}
        if hint and str(hint).lower() in allowed:
            return DocumentType(str(hint).lower())

        fname = (filename or "").lower()
        keyword_map: List[tuple[str, DocumentType]] = [
            ("aadhaar", DocumentType.AADHAAR),
            ("satbara", DocumentType.SATBARA),
            ("7_12", DocumentType.SATBARA),
            ("7-12", DocumentType.SATBARA),
            ("712", DocumentType.SATBARA),
            ("8a", DocumentType.EIGHT_A),
            ("eight_a", DocumentType.EIGHT_A),
            ("bhade", DocumentType.BHADE_KHAT),
            ("lease", DocumentType.BHADE_KHAT),
            ("bank", DocumentType.BANK_PASSBOOK),
            ("passbook", DocumentType.BANK_PASSBOOK),
            ("cheque", DocumentType.BANK_PASSBOOK),
            ("cancelled", DocumentType.BANK_PASSBOOK),
            ("equipment", DocumentType.EQUIPMENT_INVOICE),
            ("invoice", DocumentType.EQUIPMENT_INVOICE),
            ("gr_", DocumentType.GR_DOCUMENT),
            ("gr-", DocumentType.GR_DOCUMENT),
            ("resolution", DocumentType.GR_DOCUMENT),
            ("geo", DocumentType.GEO_PHOTO),
            ("gps", DocumentType.GEO_PHOTO),
            ("electric", DocumentType.ELECTRICITY_BILL),
            ("mseb", DocumentType.ELECTRICITY_BILL),
            ("caste", DocumentType.CASTE_CERTIFICATE),
            ("income", DocumentType.INCOME_CERTIFICATE),
            ("crop_loss", DocumentType.CROP_LOSS),
            ("loss_app", DocumentType.CROP_LOSS),
            ("insurance", DocumentType.INSURANCE),
            ("policy", DocumentType.INSURANCE),
            ("sowing", DocumentType.CROP_SOWING),
            ("declaration", DocumentType.CROP_SOWING),
        ]
        for kw, dtype in keyword_map:
            if kw in fname:
                return dtype
        return DocumentType.UNKNOWN

    async def process_gr_document(
        self,
        file_bytes: bytes,
        filename: str,
        uploaded_by: str,
    ) -> Dict[str, Any]:
        """
        Special GR pipeline for Krishi Sahayak GR Assistant.
        Returns structured GR insights only (no raw OCR text in the payload).
        """
        del uploaded_by
        if not allowed_file(filename or ""):
            raise ValueError(f"Unsupported file type: {filename}")

        saved_path = await asyncio.to_thread(save_upload, file_bytes, filename or "gr.pdf")
        try:

            def _run() -> tuple[Dict[str, Any], float]:
                ocr_out = ocr(saved_path)
                raw_text = str(ocr_out.get("text") or "")
                cleaned = postprocess(raw_text)
                fields = extract(cleaned, "gr_document") if "gr_document" in set(list_schemas()) else {}
                conf = float(ocr_out.get("confidence") or 0.0)
                return fields, conf

            fields, conf = await asyncio.to_thread(_run)

            return {
                "scheme_name": fields.get("scheme_name"),
                "eligibility": fields.get("eligibility"),
                "deadline": fields.get("deadline"),
                "subsidy_percentage": fields.get("subsidy_percentage"),
                "required_documents": fields.get("required_documents"),
                "conditions": fields.get("conditions"),
                "confidence": conf,
            }
        finally:
            await asyncio.to_thread(cleanup, saved_path)
