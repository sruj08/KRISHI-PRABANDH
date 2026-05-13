"""
Risk Engine Service.
Generates fraud probability scores (0-100) and risk factors.
0-20: Safe, 20-50: Needs Review, 50-100: High Risk.
"""

from __future__ import annotations

from typing import Any, Dict, List, Union

from schemas.evidence_schemas import RiskScore, VerificationResult


class RiskEngineService:
    async def score(
        self,
        fields: Dict[str, Any],
        verification: VerificationResult,
        doc_type: Union[str, Any],
        survey_id: str,
    ) -> RiskScore:
        del survey_id
        risk_points = 0
        factors: List[str] = []

        for failure in verification.critical_failures:
            risk_points += 30
            factors.append(f"Critical mismatch: {failure}")

        non_critical_failed = [c for c in verification.checks if not c.passed and not c.is_critical]
        for check in non_critical_failed:
            risk_points += 10
            factors.append(f"Issue: {check.check_name}")

        critical_fields_by_doc: Dict[str, List[str]] = {
            "aadhaar": ["name", "aadhaar_number"],
            "satbara": ["survey_number", "farmer_name"],
            "bank_passbook": ["account_number", "ifsc"],
            "equipment_invoice": ["gst_number", "invoice_amount"],
            "eight_a": ["ownership_details", "land_holding_data"],
            "bhade_khat": ["tenant_name", "owner_name", "survey_number"],
            "crop_sowing": ["crop_type", "sowing_date", "area"],
            "geo_photo": ["gps_coords", "timestamp"],
            "electricity_bill": ["consumer_name", "consumer_number"],
            "caste_certificate": ["applicant_name", "caste"],
            "income_certificate": ["applicant_name", "annual_income"],
            "gr_document": ["scheme_name"],
            "crop_loss_application": ["farmer_name", "survey_number", "claimed_amount"],
            "insurance_document": ["policy_number", "insured_name"],
        }
        doc_name = doc_type.value if hasattr(doc_type, "value") else str(doc_type)
        required = critical_fields_by_doc.get(doc_name, [])
        for field in required:
            val = fields.get(field)
            if val in (None, "", []):
                risk_points += 15
                factors.append(f"Missing field: {field}")

        final_score = min(100, risk_points)

        if final_score <= 20:
            level = "safe"
        elif final_score <= 50:
            level = "review"
        else:
            level = "high_risk"

        return RiskScore(score=final_score, level=level, factors=factors)
