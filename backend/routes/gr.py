from fastapi import APIRouter, UploadFile, File, HTTPException
import re
import io
from utils.loader import load_applications

router = APIRouter(prefix="/gr", tags=["GR Parser"])


def ok(data):
    return {"success": True, "data": data}


# ──────────────────────────────────────────────
# Step 2 & 3: Text Extraction + Cleaning
# ──────────────────────────────────────────────

def extract_text(file_bytes: bytes) -> str:
    """Try pdfplumber first, fall back to PyPDF2."""
    # Attempt 1 — pdfplumber (better Marathi Unicode handling)
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages = [page.extract_text() or "" for page in pdf.pages]
        text = "\n".join(pages)
        if text.strip():
            return text
    except Exception:
        pass

    # Attempt 2 — PyPDF2
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"PDF text extraction failed: {e}")


def clean_text(text: str) -> str:
    """Normalize whitespace while preserving Marathi content."""
    text = re.sub(r"[ \t]+", " ", text)        # collapse spaces/tabs
    text = re.sub(r"\n{3,}", "\n\n", text)      # max 2 blank lines
    return text.strip()


# ──────────────────────────────────────────────
# Step 4: Classification (Marathi keyword rules)
# ──────────────────────────────────────────────

CLASSIFICATION_RULES = [
    (["बदली", "पदस्थापना"],          "Administrative"),
    (["अनुदान", "सबसिडी"],           "Subsidy"),
    (["योजना", "लाभार्थी"],          "Scheme"),
]


def classify_gr(text: str) -> str:
    for keywords, label in CLASSIFICATION_RULES:
        if any(kw in text for kw in keywords):
            return label
    return "Unknown"


# ──────────────────────────────────────────────
# Step 5: Summary (Marathi – first 2–3 sentences)
# ──────────────────────────────────────────────

def summarize_gr(text: str) -> str:
    # Try paragraph-level first
    paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 40]
    if paragraphs:
        first = paragraphs[0]
        sentences = re.split(r"[।\n]", first)
        meaningful = [s.strip() for s in sentences if len(s.strip()) > 20][:3]
        if meaningful:
            return "। ".join(meaningful) + "।"

    # Fall back to first few lines
    lines = [l.strip() for l in text.split("\n") if len(l.strip()) > 30]
    if lines:
        return " ".join(lines[:3])[:400]

    return "सारांश उपलब्ध नाही."


# ──────────────────────────────────────────────
# Step 6: Impact (Marathi)
# ──────────────────────────────────────────────

_IMPACT = {
    "Administrative": "शेतकऱ्यांवर थेट परिणाम नाही",
    "Subsidy":        "शेतकऱ्यांना आर्थिक मदत मिळते",
    "Scheme":         "शेतकऱ्यांसाठी योजना लागू आहे",
}


def get_impact(gr_type: str) -> str:
    return _IMPACT.get(gr_type, "तपासणी आवश्यक")


# ──────────────────────────────────────────────
# Step 7: Action (Marathi)
# ──────────────────────────────────────────────

_ACTION = {
    "Administrative": "कोणतीही कारवाई आवश्यक नाही",
    "Subsidy":        "पात्र शेतकरी ओळखा",
    "Scheme":         "शेतकऱ्यांना अर्जासाठी मदत करा",
}


def get_action(gr_type: str) -> str:
    return _ACTION.get(gr_type, "तपासणी करा")


# ──────────────────────────────────────────────
# Step 9: Relevance Engine (MANDATORY)
# ──────────────────────────────────────────────

# Marathi keyword → application component mapping
KEYWORD_COMPONENT_MAP = {
    "सिंचन":    "Irrigation Devices",
    "पंप":      "Irrigation Devices",
    "बियाणे":   "Seeds/Input",
    "खते":      "Seeds/Input",
    "यंत्र":    "Farm Mechanization",
    "ट्रॅक्टर": "Farm Mechanization",
    "फळबाग":   "Horticulture",
    "बाग":     "Horticulture",
}


def check_relevance(text: str, gr_type: str, applications: list) -> dict:
    if gr_type == "Administrative":
        return {
            "relevance":     "लागू नाही",
            "reason":        "प्रशासकीय आदेश आहे",
            "matched_count": 0,
        }

    # Detect which application components are referenced in the GR
    matched_components: set[str] = set()
    for keyword, component in KEYWORD_COMPONENT_MAP.items():
        if keyword in text:
            matched_components.add(component)

    if not matched_components:
        return {
            "relevance":     "संभाव्य लागू",
            "reason":        "GR मध्ये ठराविक घटक सापडले नाहीत",
            "matched_count": 0,
        }

    count = sum(
        1 for app in applications
        if app.get("component", "") in matched_components
    )

    if count > 0:
        component_str = ", ".join(matched_components)
        return {
            "relevance":     "लागू आहे",
            "reason":        f"{component_str} संबंधित {count} अर्ज सापडले",
            "matched_count": count,
        }

    return {
        "relevance":     "संभाव्य लागू",
        "reason":        "संबंधित अर्ज सापडले नाहीत",
        "matched_count": 0,
    }


# ──────────────────────────────────────────────
# Step 10: English Translation (rule-based)
# ──────────────────────────────────────────────

_TYPE_EN = {
    "Administrative": "Administrative Order",
    "Subsidy":        "Subsidy Scheme",
    "Scheme":         "Government Scheme",
    "Unknown":        "Unknown / Unclassified",
}
_IMPACT_EN = {
    "शेतकऱ्यांवर थेट परिणाम नाही": "No direct impact on farmers",
    "शेतकऱ्यांना आर्थिक मदत मिळते": "Financial assistance available to eligible farmers",
    "शेतकऱ्यांसाठी योजना लागू आहे": "Scheme is applicable for farmers",
    "तपासणी आवश्यक":                "Needs manual review",
}
_ACTION_EN = {
    "कोणतीही कारवाई आवश्यक नाही":    "No action required",
    "पात्र शेतकरी ओळखा":             "Identify eligible farmers",
    "शेतकऱ्यांना अर्जासाठी मदत करा": "Assist farmers in the application process",
    "तपासणी करा":                     "Conduct manual review",
}
_RELEVANCE_EN = {
    "लागू नाही":     "Not Applicable",
    "लागू आहे":      "Applicable",
    "संभाव्य लागू": "Possibly Applicable",
}


def translate_basic(mr: dict) -> dict:
    reason_mr = mr["reason"]
    matched   = mr["matched_applications"]

    # Dynamic reason for "लागू आहे" contains count — just translate structurally
    if mr["relevance"] == "लागू आहे":
        reason_en = f"Matching applications found in database ({matched} records)"
    elif reason_mr == "प्रशासकीय आदेश आहे":
        reason_en = "This is an administrative / transfer order"
    elif reason_mr == "GR मध्ये ठराविक घटक सापडले नाहीत":
        reason_en = "No specific scheme components detected in this GR"
    elif reason_mr == "संबंधित अर्ज सापडले नाहीत":
        reason_en = "No matching applications found in current data"
    else:
        reason_en = reason_mr  # keep original if not mapped

    return {
        "type":                _TYPE_EN.get(mr["type"], mr["type"]),
        "summary":             (
            "GR document processed. Please refer to the Marathi section for full content."
        ),
        "impact":              _IMPACT_EN.get(mr["impact"], mr["impact"]),
        "action":              _ACTION_EN.get(mr["action"], mr["action"]),
        "relevance":           _RELEVANCE_EN.get(mr["relevance"], mr["relevance"]),
        "matched_applications": matched,
        "reason":              reason_en,
    }


# ──────────────────────────────────────────────
# Endpoint: POST /gr/parse
# ──────────────────────────────────────────────

@router.post("/parse")
async def parse_gr(file: UploadFile = File(...)):
    """
    Accept a Marathi Government Resolution PDF.
    Returns structured Marathi output + optional English translation.
    """
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="केवळ PDF फाइल स्वीकार केली जाते / Only PDF files are accepted",
        )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    raw_text = extract_text(file_bytes)
    text     = clean_text(raw_text)

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="PDF मधून मजकूर काढता आला नाही / No text could be extracted from the PDF",
        )

    gr_type = classify_gr(text)
    summary = summarize_gr(text)
    impact  = get_impact(gr_type)
    action  = get_action(gr_type)

    applications = load_applications()
    rel = check_relevance(text, gr_type, applications)

    marathi = {
        "type":                 gr_type,
        "summary":              summary,
        "impact":               impact,
        "action":               action,
        "relevance":            rel["relevance"],
        "matched_applications": rel["matched_count"],
        "reason":               rel["reason"],
    }
    english = translate_basic(marathi)

    return ok({"marathi": marathi, "english": english})
