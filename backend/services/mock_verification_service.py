"""
Mock Verification Service.
Simulates AgriStack, land records, scheme, and payment database checks.
Replace mock data with real API calls when actual databases are available.
"""

from __future__ import annotations

import hashlib
import re
from typing import Any, Dict, List, Union

from schemas.evidence_schemas import VerificationCheck, VerificationResult


class MockVerificationService:
    # Mock farmer registry: aadhaar_number → name
    _FARMER_REGISTRY: Dict[str, str] = {
        "2345 6789 0123": "Ramesh Patil",
        "3456 7890 1234": "Sunita Jadhav",
        "4567 8901 2345": "Vijay Kulkarni",
    }

    # Mock land records: survey_number → owner_name
    _LAND_RECORDS: Dict[str, str] = {
        "123/A": "Ramesh Patil",
        "456/B": "Sunita Jadhav",
        "789/C": "Vijay Kulkarni",
    }

    # Mock active bank accounts
    _ACTIVE_ACCOUNTS: frozenset[str] = frozenset(
        {
            "00112233445566",
            "11223344556677",
            "22334455667788",
        }
    )

    # Track used invoices for duplicate detection: gst+amount+date hash
    _USED_INVOICES: set[str] = set()

    async def verify(
        self,
        fields: Dict[str, Any],
        doc_type: Union[str, Any],
        farmer_id: str,
        survey_id: str,
    ) -> VerificationResult:
        checks: List[VerificationCheck] = []
        doc_name = doc_type.value if hasattr(doc_type, "value") else str(doc_type)

        if doc_name == "aadhaar":
            checks.extend(self._verify_aadhaar(fields))
        elif doc_name == "satbara":
            checks.extend(self._verify_satbara(fields, farmer_id))
        elif doc_name == "bank_passbook":
            checks.extend(self._verify_bank(fields))
        elif doc_name == "equipment_invoice":
            checks.extend(self._verify_invoice(fields, survey_id))
        elif doc_name == "crop_loss_application":
            checks.extend(self._verify_crop_loss(fields))
        elif doc_name == "insurance_document":
            checks.extend(self._verify_insurance(fields))
        elif doc_name == "gr_document":
            checks.extend(self._verify_gr(fields))
        else:
            checks.extend(self._verify_generic_presence(doc_name, fields))

        all_passed = all(c.passed for c in checks) if checks else True
        critical_failed = [c for c in checks if not c.passed and c.is_critical]

        return VerificationResult(
            checks=checks,
            all_passed=all_passed,
            critical_failures=[c.check_name for c in critical_failed],
            summary=self._summarize(checks),
        )

    def _verify_aadhaar(self, fields: Dict[str, Any]) -> List[VerificationCheck]:
        aadhaar_no = str(fields.get("aadhaar_number") or "").strip()
        name = str(fields.get("name") or "").strip()
        registry_name = self._FARMER_REGISTRY.get(aadhaar_no)

        name_match = (
            registry_name is not None and name.strip().lower() in registry_name.lower()
        ) if name and aadhaar_no else False

        return [
            VerificationCheck(
                check_name="Aadhaar Name Match",
                passed=name_match,
                expected=registry_name or "Not Found",
                found=name,
                is_critical=True,
            ),
            VerificationCheck(
                check_name="Aadhaar Number Valid",
                passed=bool(aadhaar_no and len(re.sub(r"\s+", "", aadhaar_no)) == 12),
                expected="12 digits",
                found=aadhaar_no,
                is_critical=True,
            ),
        ]

    def _verify_satbara(self, fields: Dict[str, Any], farmer_id: str) -> List[VerificationCheck]:
        del farmer_id
        survey_no = str(fields.get("survey_number") or "").strip()
        farmer_name = str(fields.get("farmer_name") or "").strip()
        land_owner = self._LAND_RECORDS.get(survey_no)

        return [
            VerificationCheck(
                check_name="Survey Number Exists",
                passed=land_owner is not None,
                expected="Valid survey number in land records",
                found=survey_no,
                is_critical=True,
            ),
            VerificationCheck(
                check_name="Land Ownership Match",
                passed=(
                    land_owner is not None and farmer_name.strip().lower() in land_owner.lower()
                )
                if farmer_name
                else False,
                expected=land_owner or "Unknown",
                found=farmer_name,
                is_critical=True,
            ),
        ]

    def _verify_bank(self, fields: Dict[str, Any]) -> List[VerificationCheck]:
        account_no = str(fields.get("account_number") or "").replace(" ", "")
        ifsc = str(fields.get("ifsc") or "").strip().upper()
        return [
            VerificationCheck(
                check_name="Bank Account Active",
                passed=account_no in self._ACTIVE_ACCOUNTS,
                expected="Active account",
                found=account_no,
                is_critical=False,
            ),
            VerificationCheck(
                check_name="IFSC Format Valid",
                passed=bool(ifsc and len(ifsc) == 11 and ifsc[4] == "0"),
                expected="Valid IFSC (11 chars, 5th char = 0)",
                found=ifsc,
                is_critical=False,
            ),
        ]

    def _verify_invoice(self, fields: Dict[str, Any], survey_id: str) -> List[VerificationCheck]:
        del survey_id
        gst = str(fields.get("gst_number") or "").strip().upper()
        amount = str(fields.get("invoice_amount") or "").strip()
        date = str(fields.get("invoice_date") or "").strip()
        invoice_hash = hashlib.md5(f"{gst}{amount}{date}".encode()).hexdigest()
        is_duplicate = invoice_hash in self._USED_INVOICES
        if not is_duplicate:
            self._USED_INVOICES.add(invoice_hash)

        return [
            VerificationCheck(
                check_name="Duplicate Invoice",
                passed=not is_duplicate,
                expected="Invoice not used before",
                found="DUPLICATE" if is_duplicate else "UNIQUE",
                is_critical=True,
            ),
            VerificationCheck(
                check_name="GST Number Format",
                passed=bool(gst and len(gst) == 15),
                expected="15-character GST number",
                found=gst,
                is_critical=False,
            ),
        ]

    def _verify_crop_loss(self, fields: Dict[str, Any]) -> List[VerificationCheck]:
        loss = str(fields.get("loss_percentage") or "").strip()
        amount = str(fields.get("claimed_amount") or "").strip()
        digits_loss = re.sub(r"[^\d]", "", loss)
        loss_val = int(digits_loss) if digits_loss else 0
        return [
            VerificationCheck(
                check_name="Loss Percentage Plausible",
                passed=0 < loss_val <= 100,
                expected="Between 1 and 100",
                found=loss,
                is_critical=False,
            ),
            VerificationCheck(
                check_name="Claim Amount Present",
                passed=bool(amount),
                expected="Non-empty amount",
                found=amount or "(empty)",
                is_critical=True,
            ),
        ]

    def _verify_insurance(self, fields: Dict[str, Any]) -> List[VerificationCheck]:
        policy = str(fields.get("policy_number") or "").strip()
        insured = str(fields.get("insured_name") or "").strip()
        return [
            VerificationCheck(
                check_name="Policy Number Present",
                passed=bool(policy),
                expected="Non-empty policy number",
                found=policy or "(empty)",
                is_critical=False,
            ),
            VerificationCheck(
                check_name="Insured Name Present",
                passed=bool(insured),
                expected="Non-empty insured name",
                found=insured or "(empty)",
                is_critical=False,
            ),
        ]

    def _verify_gr(self, fields: Dict[str, Any]) -> List[VerificationCheck]:
        scheme = str(fields.get("scheme_name") or "").strip()
        return [
            VerificationCheck(
                check_name="Scheme Title Extracted",
                passed=len(scheme) >= 5,
                expected="At least 5 characters",
                found=scheme[:120] if scheme else "(empty)",
                is_critical=False,
            ),
        ]

    def _verify_generic_presence(self, doc_name: str, fields: Dict[str, Any]) -> List[VerificationCheck]:
        """Lightweight checks for document types without dedicated mock DB rows."""
        if not fields:
            return [
                VerificationCheck(
                    check_name="Structured Fields Extracted",
                    passed=False,
                    expected="At least one OCR field",
                    found="(none)",
                    is_critical=False,
                )
            ]
        filled = sum(1 for v in fields.values() if v not in (None, "", []))
        return [
            VerificationCheck(
                check_name=f"{doc_name}: fields populated",
                passed=filled > 0,
                expected=">=1 non-empty field",
                found=str(filled),
                is_critical=False,
            )
        ]

    def _summarize(self, checks: List[VerificationCheck]) -> str:
        if not checks:
            return "No automated checks for this document type"
        passed = sum(1 for c in checks if c.passed)
        total = len(checks)
        return f"{passed}/{total} checks passed"
