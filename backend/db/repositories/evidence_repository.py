"""
Evidence Repository — JSON file-backed implementation.
"""

from __future__ import annotations

from typing import Any, List, Optional

import db.json_store as store
from utils.evidence_geo import extract_geo_context


class EvidenceRepository:
    def create(self, **kwargs: Any) -> dict[str, Any]:
        row = {k: v for k, v in kwargs.items() if v is not None}
        return store.insert("survey_evidence", row)

    def get_by_survey(self, survey_id: str) -> List[dict[str, Any]]:
        rows = store.find_many("survey_evidence", survey_id=survey_id)
        return sorted(rows, key=lambda r: r.get("created_at", ""), reverse=True)

    def get_flagged(
        self,
        min_risk_score: int = 20,
        taluka_id: Optional[str] = None,
        district_id: Optional[str] = None,
    ) -> List[dict[str, Any]]:
        """Evidence rows flagged for manual review, optionally filtered by jurisdiction."""
        all_rows = store.load("survey_evidence")
        rows = [
            r for r in all_rows
            if r.get("requires_manual_review") is True
            and (r.get("risk_score") or 0) >= min_risk_score
        ]
        rows = sorted(rows, key=lambda r: r.get("risk_score", 0), reverse=True)

        if not taluka_id and not district_id:
            return rows

        filtered: List[dict[str, Any]] = []
        for rec in rows:
            _, t_id, d_id = extract_geo_context(rec)
            if district_id and d_id != district_id:
                continue
            if taluka_id and t_id != taluka_id:
                continue
            filtered.append(rec)
        return filtered

    def list_for_risk_summary(
        self,
        taluka_id: Optional[str] = None,
        district_id: Optional[str] = None,
    ) -> List[dict[str, Any]]:
        """All processed evidence rows (risk_score >= 1) for dashboard aggregates."""
        all_rows = store.load("survey_evidence")
        rows = [r for r in all_rows if (r.get("risk_score") or 0) >= 1]

        if not taluka_id and not district_id:
            return rows

        out: List[dict[str, Any]] = []
        for rec in rows:
            _, t_id, d_id = extract_geo_context(rec)
            if district_id and d_id != district_id:
                continue
            if taluka_id and t_id != taluka_id:
                continue
            out.append(rec)
        return out

    def get_officer_insight_cards(self, survey_id: str) -> List[dict[str, Any]]:
        """TAO-facing payloads — excludes raw OCR text."""
        records = self.get_by_survey(survey_id)
        return [
            {
                "document_type": r.get("document_type"),
                "risk_score": r.get("risk_score"),
                "risk_level": r.get("risk_level"),
                "risk_factors": r.get("risk_factors"),
                "ocr_fields": r.get("ocr_fields"),
                "verification_result": r.get("verification_result"),
                "requires_manual_review": r.get("requires_manual_review"),
            }
            for r in records
        ]
