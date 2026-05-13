"""
Evidence Repository — Supabase `survey_evidence` operations (OCR + verification + risk).
"""

from __future__ import annotations

from typing import Any, List, Optional

from db.supabase import get_supabase
from utils.evidence_geo import extract_geo_context


class EvidenceRepository:
    def __init__(self) -> None:
        self._sb = get_supabase()

    def create(self, **kwargs: Any) -> dict[str, Any]:
        row = {k: v for k, v in kwargs.items() if v is not None}
        res = self._sb.table("survey_evidence").insert(row).execute()
        if not res.data:
            raise RuntimeError("Evidence insert returned no data")
        return res.data[0]

    def get_by_survey(self, survey_id: str) -> List[dict[str, Any]]:
        res = (
            self._sb.table("survey_evidence")
            .select("*")
            .eq("survey_id", survey_id)
            .order("created_at", desc=True)
            .execute()
        )
        return list(res.data or [])

    def get_flagged(
        self,
        min_risk_score: int = 20,
        taluka_id: Optional[str] = None,
        district_id: Optional[str] = None,
    ) -> List[dict[str, Any]]:
        """Evidence rows flagged for manual review, optionally filtered by jurisdiction."""
        select_embed = (
            "*, surveys(farms(villages(name, circles(talukas(id, name, districts(id, name))))))"
        )
        try:
            q = (
                self._sb.table("survey_evidence")
                .select(select_embed)
                .eq("requires_manual_review", True)
                .gte("risk_score", min_risk_score)
                .order("risk_score", desc=True)
            )
            res = q.execute()
            rows: List[dict[str, Any]] = list(res.data or [])
        except Exception:
            try:
                q = (
                    self._sb.table("survey_evidence")
                    .select("*")
                    .eq("requires_manual_review", True)
                    .gte("risk_score", min_risk_score)
                    .order("risk_score", desc=True)
                )
                res = q.execute()
                rows = list(res.data or [])
            except Exception:
                return []

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
        select_embed = (
            "*, surveys(farms(villages(name, circles(talukas(id, name, districts(id, name))))))"
        )
        try:
            res = (
                self._sb.table("survey_evidence")
                .select(select_embed)
                .gte("risk_score", 1)
                .execute()
            )
            rows = list(res.data or [])
        except Exception:
            try:
                res = self._sb.table("survey_evidence").select("*").gte("risk_score", 1).execute()
                rows = list(res.data or [])
            except Exception:
                return []

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

