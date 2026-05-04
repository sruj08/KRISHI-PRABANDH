from fastapi import APIRouter, UploadFile, File, HTTPException
import re
import io
import unicodedata
from utils.loader import load_applications

router = APIRouter(prefix="/gr", tags=["GR Parser"])


def ok(data):
    return {"success": True, "data": data}


# ──────────────────────────────────────────────
# Step 2 & 3: Text Extraction + Cleaning
# ──────────────────────────────────────────────

def extract_text(file_bytes: bytes) -> str:
    """
    Three-tier Devanagari-aware PDF extraction:

    Tier 1 — PyMuPDF (fitz): best Unicode/CMap handling for complex scripts;
              correctly remaps custom Devanagari font glyph IDs to Unicode.
    Tier 2 — pdfplumber: good for simple/embedded-font PDFs.
    Tier 3 — PyPDF2: last-resort ASCII-level fallback.
    """
    # ── Tier 1: PyMuPDF ──────────────────────────────────────────────────────
    try:
        import fitz  # pymupdf
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages = []
        for page in doc:
            # get_text("text") returns proper Unicode for most Devanagari fonts
            pages.append(page.get_text("text"))
        doc.close()
        text = "\n".join(pages)
        if text.strip():
            return text
    except Exception:
        pass

    # ── Tier 2: pdfplumber ───────────────────────────────────────────────────
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages = [page.extract_text() or "" for page in pdf.pages]
        text = "\n".join(pages)
        if text.strip():
            return text
    except Exception:
        pass

    # ── Tier 3: PyPDF2 ───────────────────────────────────────────────────────
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"PDF text extraction failed: {e}")


def clean_text(text: str) -> str:
    """
    Post-extraction Unicode normalization for Devanagari text:

    Step 1 — NFC normalization: combines decomposed Devanagari combining marks
              (matras, anusvara, chandrabindu) with their base consonants so
              characters render as single proper glyphs instead of broken pieces.
    Step 2 — UTF-8 round-trip: silently drops any remaining corrupt byte sequences.
    Step 3 — Whitespace normalization: collapses runs of spaces/tabs; limits
              blank lines to two consecutive; strips non-printable control chars.
    """
    # Step 1 — Unicode NFC: fixes glyph reordering / broken matras
    text = unicodedata.normalize("NFC", text)
    # Step 2 — UTF-8 safety
    text = text.encode("utf-8", errors="ignore").decode("utf-8")
    # Step 3 — whitespace cleanup
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    return text.strip()


# ──────────────────────────────────────────────
# Step 4: Scoring-based Classification (clusters)
# ──────────────────────────────────────────────

# Each cluster maps a category label to a list of Marathi keyword signals.
# Multiple keywords can match — the category with the highest total score wins.
CLUSTERS: dict[str, list[str]] = {
    "Administrative": [
        "बदली", "पदस्थापना", "नियुक्ती", "कार्यभार", "प्रतिनियुक्ती",
        "सेवा", "अधिकारी", "कर्मचारी",
    ],
    "Subsidy": [
        "अनुदान", "सबसिडी", "अर्थसहाय्य", "आर्थिक मदत",
        "अनुदानित", "लाभ", "रक्कम", "निधी",
    ],
    "Scheme": [
        "योजना", "लाभार्थी", "प्रकल्प", "मोहीम",
        "अंमलबजावणी", "पात्र शेतकरी", "कार्यक्रम",
    ],
}

# Minimum score gap required for a decisive classification
_MIN_SCORE = 1


def classify_gr(text: str) -> str:
    """
    Score each category cluster against the full text.
    Returns the highest-scoring label; ties favour order Scheme > Subsidy > Administrative.
    Falls back to 'Unknown' if no cluster reaches _MIN_SCORE.
    """
    scores: dict[str, int] = {}
    for label, keywords in CLUSTERS.items():
        scores[label] = sum(1 for kw in keywords if kw in text)

    best_label = max(scores, key=lambda k: scores[k])
    if scores[best_label] >= _MIN_SCORE:
        return best_label
    return "Unknown"


# ──────────────────────────────────────────────
# Step 4b: Structured Section Extraction (NEW)
# ──────────────────────────────────────────────

# Devanagari ordinal numerals used in GR section headers
_SECTION_RE = re.compile(
    r"(?:^|\n)\s*(?:[१२३४५६७८९\d][\.|\)]|\*|–|-)\s*",
)

_PURPOSE_SIGNALS   = ["उद्देश", "हेतू", "संदर्भ", "विषय", "प्रयोजन"]
_IMPL_SIGNALS      = ["अंमलबजावणी", "कार्यपद्धती", "प्रक्रिया", "तरतूद", "निर्देश"]
_BENEF_SIGNALS     = ["लाभार्थी", "पात्र", "शेतकरी", "लाभधारक", "उपभोक्ता"]


def extract_sections(text: str) -> dict[str, str]:
    """
    Split the GR into logical sections:
      - purpose   : opening / objective
      - numbered  : ordered clause lines (१., २., …)
      - implementation : implementation / procedure lines
      - beneficiaries  : who benefits
      - other     : everything else
    """
    lines = text.split("\n")
    sections: dict[str, list[str]] = {
        "purpose": [], "numbered": [],
        "implementation": [], "beneficiaries": [], "other": [],
    }

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if _SECTION_RE.match(line) or re.match(r"^[१२३४५६७८९\d][\.|\)]", stripped):
            sections["numbered"].append(stripped)
        elif any(sig in stripped for sig in _PURPOSE_SIGNALS):
            sections["purpose"].append(stripped)
        elif any(sig in stripped for sig in _IMPL_SIGNALS):
            sections["implementation"].append(stripped)
        elif any(sig in stripped for sig in _BENEF_SIGNALS):
            sections["beneficiaries"].append(stripped)
        else:
            sections["other"].append(stripped)

    return {k: "\n".join(v) for k, v in sections.items()}


# ──────────────────────────────────────────────
# Step 5: Dynamic Summary (section-aware)
# ──────────────────────────────────────────────

# Department keyword detection
_DEPT_KEYWORDS = {
    "कृषी": "कृषी विभाग",
    "महसूल": "महसूल विभाग",
    "वित्त": "वित्त विभाग",
    "सहकार": "सहकार विभाग",
    "जलसंपदा": "जलसंपदा विभाग",
    "ऊर्जा": "ऊर्जा विभाग",
    "सामाजिक": "सामाजिक न्याय विभाग",
    "उद्योग": "उद्योग विभाग",
    "शिक्षण": "शिक्षण विभाग",
}

# Sentence importance signals
_IMPORTANT_PHRASES = [
    "मान्यता", "निर्णय", "आदेश", "योजना", "लाभार्थी", "अनुदान",
    "उद्दिष्ट", "अंमलबजावणी", "निधी", "रक्कम", "प्रकल्प",
    "पात्र", "शेतकरी", "विभाग", "सबसिडी",
]


def _detect_department(text: str) -> str:
    for kw, label in _DEPT_KEYWORDS.items():
        if kw in text:
            return label
    return "शासन विभाग"


def _score_sentence(sentence: str) -> int:
    score = 0
    for phrase in _IMPORTANT_PHRASES:
        if phrase in sentence:
            score += 1
    # Prefer sentences of moderate length
    length = len(sentence)
    if 30 <= length <= 200:
        score += 2
    return score


def summarize_gr(text: str) -> str:
    """
    Dynamic, section-aware summary:
    1. Pull the best purpose sentence.
    2. Pull top implementation sentence.
    3. Pull top beneficiary sentence.
    4. Fill remaining slots with highest-scored sentences from anywhere.
    Result feels varied and natural, not a static template.
    """
    dept     = _detect_department(text)
    sections = extract_sections(text)

    def _best(section_text: str, n: int = 1) -> list[str]:
        sents = re.split(r"[।\n]", section_text)
        sents = [s.strip() for s in sents if len(s.strip()) > 20]
        ranked = sorted(sents, key=_score_sentence, reverse=True)
        return ranked[:n]

    chosen: list[str] = []
    seen: set[str]    = set()

    def _add(s: str) -> None:
        s = s.strip()[:180]
        if s and s not in seen:
            seen.add(s)
            chosen.append(s)

    # Layer 1 — pull from each meaningful section
    for sec_key in ("purpose", "implementation", "beneficiaries"):
        for sent in _best(sections.get(sec_key, "")):
            _add(sent)

    # Layer 2 — fill from numbered clauses (most informative in GRs)
    for sent in _best(sections.get("numbered", ""), 3):
        _add(sent)
        if len(chosen) >= 5:
            break

    # Layer 3 — fall back to globally scored sentences
    if len(chosen) < 3:
        all_sents = re.split(r"[।\n]", text)
        all_sents = [s.strip() for s in all_sents if len(s.strip()) > 25]
        ranked_global = sorted(
            enumerate(all_sents),
            key=lambda idx_s: _score_sentence(idx_s[1]),
            reverse=True,
        )
        for _, sent in ranked_global:
            _add(sent)
            if len(chosen) >= 5:
                break

    if not chosen:
        return "सारांश उपलब्ध नाही."

    combined = "। ".join(chosen[:5]) + "।"
    intro    = f"ही शासन निर्णय {dept}मार्फत जारी करण्यात आली आहे. "
    return intro + combined


# ──────────────────────────────────────────────
# Step 5b: Extract Key Points (NEW)
# ──────────────────────────────────────────────

_KEY_POINT_PATTERNS = [
    r"(.*?मान्यता.*?)",
    r"(.*?अंमलबजावणी.*?)",
    r"(.*?लाभार्थी.*?)",
    r"(.*?निधी.*?)",
    r"(.*?पात्र.*?)",
    r"(.*?उद्दिष्ट.*?)",
    r"(.*?अनुदान.*?)",
    r"(.*?रक्कम.*?)",
]

_FALLBACK_KEY_POINTS = {
    "Administrative": [
        "प्रशासकीय आदेश जारी करण्यात आला आहे",
        "संबंधित अधिकाऱ्यांना सूचना देण्यात आल्या आहेत",
        "शेतकऱ्यांवर थेट आर्थिक परिणाम नाही",
    ],
    "Subsidy": [
        "अर्थसहाय्य योजनेला मान्यता देण्यात आली आहे",
        "पात्र शेतकऱ्यांना आर्थिक लाभ मिळणार",
        "अंमलबजावणी कृषी विभागामार्फत होणार",
        "अर्ज प्रक्रिया सुरू करण्यात येईल",
    ],
    "Scheme": [
        "नवीन शेतकरी योजना जाहीर करण्यात आली आहे",
        "लाभार्थी शेतकरी असतील",
        "अर्ज करण्याची संधी उपलब्ध होणार",
        "योजनेची अंमलबजावणी तात्काळ सुरू होईल",
    ],
    "Unknown": [
        "शासन निर्णय प्राप्त झाला आहे",
        "सविस्तर वाचन करण्याची शिफारस आहे",
        "संबंधित विभागाशी संपर्क साधावा",
    ],
}


def extract_key_points(text: str, gr_type: str) -> list[str]:
    """
    Smarter extraction — three-pass strategy:
    Pass 1: Prefer numbered lines ("१.", "२.", "1.") — most structured.
    Pass 2: Pattern-match keyword-rich sentences.
    Pass 3: Pad with score-ranked sentences; fallback to static bullets.
    """
    lines = text.split("\n")
    key_points: list[str] = []
    seen: set[str]        = set()

    def _add(s: str) -> bool:
        s = s.strip()[:150]
        if s and s not in seen and len(s) > 15:
            seen.add(s)
            key_points.append(s)
            return True
        return False

    # Pass 1 — numbered / bulleted lines
    _num_re = re.compile(r"^(?:[१२३४५६७८९\d][\.|\)]|\*|–|-)\s*")
    for line in lines:
        s = line.strip()
        if _num_re.match(s):
            clean = _num_re.sub("", s).strip()
            _add(clean)
        if len(key_points) >= 5:
            break

    # Pass 2 — pattern-match keyword sentences
    if len(key_points) < 5:
        all_sentences = re.split(r"[।\n]", text)
        all_sentences = [s.strip() for s in all_sentences if len(s.strip()) > 20]
        for pattern in _KEY_POINT_PATTERNS:
            for sentence in all_sentences:
                if re.search(pattern, sentence):
                    _add(sentence[:150])
                if len(key_points) >= 5:
                    break
            if len(key_points) >= 5:
                break

    # Pass 3 — score-ranked fallback
    if len(key_points) < 3:
        all_sentences = re.split(r"[।\n]", text)
        all_sentences = [s.strip() for s in all_sentences if len(s.strip()) > 20]
        ranked = sorted(all_sentences, key=_score_sentence, reverse=True)
        for s in ranked:
            _add(s)
            if len(key_points) >= 5:
                break

    # Static fallback if still sparse
    if len(key_points) < 3:
        fallbacks = _FALLBACK_KEY_POINTS.get(gr_type, _FALLBACK_KEY_POINTS["Unknown"])
        for fb in fallbacks:
            _add(fb)

    return key_points[:5]


# ──────────────────────────────────────────────
# Step 6: Enhanced Impact
# ──────────────────────────────────────────────

_IMPACT = {
    "Administrative": "हा प्रशासकीय आदेश असून शेतकऱ्यांवर थेट परिणाम होत नाही. अधिकाऱ्यांच्या पदस्थापना किंवा विभागांतर्गत बदलांशी संबंधित आहे.",
    "Subsidy":        "या निर्णयामुळे शेतकऱ्यांना आर्थिक सहाय्य मिळू शकते. पात्र शेतकऱ्यांनी अर्ज करून अनुदानाचा लाभ घेऊ शकतात.",
    "Scheme":         "ही योजना शेतकऱ्यांसाठी अत्यंत लाभदायक असून अर्ज करण्याची संधी उपलब्ध आहे. या निर्णयामुळे शेतकऱ्यांच्या उत्पन्नात वाढ होण्यास मदत होईल.",
    "Unknown":        "या GR चे विश्लेषण करण्यासाठी तज्ञांची तपासणी आवश्यक आहे. अधिक माहितीसाठी संबंधित विभागाशी संपर्क साधा.",
}


def get_impact(gr_type: str) -> str:
    return _IMPACT.get(gr_type, _IMPACT["Unknown"])


# ──────────────────────────────────────────────
# Step 7: Enhanced Action
# ──────────────────────────────────────────────

_ACTION = {
    "Administrative": "या प्रशासकीय आदेशाची नोंद घ्या. शेतकऱ्यांसाठी कोणतीही तात्काळ कारवाई आवश्यक नाही. विभागांतर्गत सूचना पालन करावी.",
    "Subsidy":        "पात्र शेतकऱ्यांची ओळख करून त्यांना अर्ज प्रक्रियेत मदत करावी. आवश्यक कागदपत्रे गोळा करण्यास सहाय्य करा आणि अर्ज वेळेत सादर करण्यासाठी मार्गदर्शन करा.",
    "Scheme":         "शेतकऱ्यांना योजनेची माहिती देऊन अर्ज करण्यास मार्गदर्शन करावे. गाव पातळीवर जागृती मोहीम राबवा आणि जास्तीत जास्त शेतकऱ्यांना लाभ मिळवून द्या.",
    "Unknown":        "या GR ची सखोल तपासणी करा आणि वरिष्ठ अधिकाऱ्यांशी सल्लामसलत करा. आवश्यकतेनुसार पुढील कारवाई निश्चित करा.",
}


def get_action(gr_type: str) -> str:
    return _ACTION.get(gr_type, _ACTION["Unknown"])


# ──────────────────────────────────────────────
# Step 9: Enhanced Relevance Engine (MANDATORY)
# ──────────────────────────────────────────────

# ── Keyword cluster → component mapping (expanded) ──────────────────────────
# Each component maps to a list of Marathi signal words.
# A component is "matched" if its cluster scores ≥ _REL_THRESHOLD.
COMPONENT_CLUSTERS: dict[str, list[str]] = {
    "Irrigation Devices": [
        "सिंचन", "ठिबक", "पाणी", "जल", "सूक्ष्म सिंचन",
        "पंप", "विहीर", "बोअर", "नळ",
    ],
    "Seeds/Input": [
        "बियाणे", "बीज", "रोप", "इनपुट", "खते",
        "कीटकनाशक", "उत्पादन साहित्य",
    ],
    "Farm Mechanization": [
        "यंत्र", "ट्रॅक्टर", "मशीन", "उपकरण",
        "यंत्रसामग्री", "कृषी यंत्र",
    ],
    "Horticulture": [
        "फळबाग", "बाग", "उद्यान", "फळपीक",
        "फळे", "भाजीपाला", "फलोत्पादन",
    ],
}
_REL_THRESHOLD = 1  # minimum keyword hits per cluster to count as a match


def _score_component(text: str, keywords: list[str]) -> int:
    """Count how many cluster keywords appear in the text."""
    return sum(1 for kw in keywords if kw in text)


def check_relevance(text: str, gr_type: str, applications: list) -> dict:
    """
    Cluster-scored relevance:
    - Each component cluster is scored against the GR text.
    - Components that exceed _REL_THRESHOLD are 'matched'.
    - Returns dynamic reason string with component names and count.
    """
    if gr_type == "Administrative":
        return {
            "relevance":            "लागू नाही",
            "reason":               "हा प्रशासकीय आदेश असून शेतकऱ्यांच्या अर्जांशी थेट संबंध नाही",
            "matched_count":        0,
            "matched_components":   [],
            "matched_applications": [],
        }

    # Score every component cluster
    matched_components: set[str] = set()
    for component, keywords in COMPONENT_CLUSTERS.items():
        if _score_component(text, keywords) >= _REL_THRESHOLD:
            matched_components.add(component)

    if not matched_components:
        return {
            "relevance":            "संभाव्य लागू",
            "reason":               "GR मध्ये ठराविक घटक सापडले नाहीत, परंतु योजनेशी संबंधित असू शकतो",
            "matched_count":        0,
            "matched_components":   [],
            "matched_applications": [],
        }

    # Filter applications by matched components
    matched_apps = [
        app for app in applications
        if app.get("component", "") in matched_components
    ]
    count = len(matched_apps)
    comp_list    = sorted(matched_components)
    component_str = " आणि ".join(comp_list)

    if count > 0:
        return {
            "relevance":            "लागू आहे",
            "reason":               f"ही GR {component_str} संबंधित असून सध्या {count} अर्ज आढळले आहेत",
            "matched_count":        count,
            "matched_components":   comp_list,
            "matched_applications": matched_apps,
        }

    return {
        "relevance":            "संभाव्य लागू",
        "reason":               f"{component_str} घटकाशी संबंधित आहे, परंतु सध्या कोणतेही अर्ज आढळले नाहीत",
        "matched_count":        0,
        "matched_components":   comp_list,
        "matched_applications": [],
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
    "Administrative": "This is an administrative/transfer order with no direct financial impact on farmers.",
    "Subsidy":        "This GR makes financial assistance available to eligible farmers who apply through the designated process.",
    "Scheme":         "This scheme is highly beneficial for farmers and provides an opportunity to apply for benefits that can increase income.",
    "Unknown":        "Expert review required to determine the impact. Contact the relevant department for clarification.",
}
_ACTION_EN = {
    "Administrative": "Note this administrative order. No immediate action required for farmers. Follow departmental instructions.",
    "Subsidy":        "Identify eligible farmers and assist them through the application process. Help gather documents and ensure timely submission.",
    "Scheme":         "Inform farmers about this scheme and guide them through the application. Conduct awareness drives at the village level.",
    "Unknown":        "Review this GR thoroughly and consult senior officers. Determine further action based on review.",
}
_RELEVANCE_EN = {
    "लागू नाही":     "Not Applicable",
    "लागू आहे":      "Applicable",
    "संभाव्य लागू": "Possibly Applicable",
}

_KEY_POINTS_EN = {
    "Administrative": [
        "Administrative order has been issued",
        "Instructions given to concerned officers",
        "No direct financial impact on farmers",
    ],
    "Subsidy": [
        "Financial assistance scheme has been approved",
        "Eligible farmers will receive economic benefits",
        "Implementation will be done through Agriculture Department",
        "Application process will commence",
    ],
    "Scheme": [
        "New farmer scheme has been announced",
        "Farmers are the intended beneficiaries",
        "Opportunity to apply for benefits will be available",
        "Implementation will begin immediately",
    ],
    "Unknown": [
        "Government resolution has been received",
        "Detailed reading is recommended",
        "Contact the relevant department for more information",
    ],
}


def translate_basic(mr: dict, gr_type: str) -> dict:
    matched      = mr["matched_applications"]
    rel_mr       = mr["relevance"]

    if rel_mr == "लागू आहे":
        components = mr.get("matched_components", [])
        comp_str   = ", ".join(components) if components else "relevant components"
        reason_en  = f"This GR is related to {comp_str} — {matched} matching application(s) found in the database"
    elif rel_mr == "लागू नाही":
        reason_en  = "This is an administrative/transfer order with no direct relevance to farmer applications"
    elif "ठराविक घटक सापडले नाहीत" in mr["reason"]:
        reason_en  = "No specific scheme components detected in this GR, but may be related to a broader scheme"
    elif "अर्ज आढळले नाहीत" in mr["reason"]:
        comps = mr.get("matched_components", [])
        comp_str = ", ".join(comps) if comps else "identified components"
        reason_en = f"GR is related to {comp_str}, but no matching applications found currently"
    else:
        reason_en = mr["reason"]

    return {
        "type":                 _TYPE_EN.get(gr_type, mr["type"]),
        "summary":              (
            "This Government Resolution has been issued by the Agriculture Department. "
            "Please refer to the Marathi section for the complete text. "
            "The key decisions and their implications are summarized below."
        ),
        "impact":               _IMPACT_EN.get(gr_type, "Review required"),
        "action":               _ACTION_EN.get(gr_type, "Conduct manual review"),
        "key_points":           _KEY_POINTS_EN.get(gr_type, _KEY_POINTS_EN["Unknown"]),
        "relevance":            _RELEVANCE_EN.get(rel_mr, rel_mr),
        "matched_applications": matched,
        "matched_components":   mr.get("matched_components", []),
        "reason":               reason_en,
    }


# ──────────────────────────────────────────────
# Endpoint: POST /gr/parse
# ──────────────────────────────────────────────

@router.post("/parse")
async def parse_gr(
    file: UploadFile = File(...),
    sahayak_id: str | None = None,
    mandal_id: str | None = None,
):
    """
    Accept a Marathi Government Resolution PDF.
    Optional query params sahayak_id / mandal_id scope the relevance check.
    Returns structured Marathi output + English translation.
    """
    from fastapi import Query as FQuery
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

    gr_type    = classify_gr(text)
    summary    = summarize_gr(text)
    key_points = extract_key_points(text, gr_type)
    impact     = get_impact(gr_type)
    action     = get_action(gr_type)

    # ── Scope the relevance check to the current officer context ──────────────
    all_applications = load_applications()
    if sahayak_id:
        scoped_apps = [a for a in all_applications if a.get("sahayak_id") == sahayak_id]
        scope_label = "तुमच्या क्षेत्रातील"  # "in your area"
    elif mandal_id:
        scoped_apps = [a for a in all_applications if a.get("mandal_id") == mandal_id]
        scope_label = "तुमच्या मंडलातील"  # "in your mandal"
    else:
        scoped_apps = all_applications
        scope_label = "एकूण"

    rel = check_relevance(text, gr_type, scoped_apps)

    # Enrich reason string with scope label
    if rel["matched_count"] > 0 and scope_label != "एकूण":
        rel["reason"] = rel["reason"].replace(
            f"{rel['matched_count']} अर्ज",
            f"{scope_label} {rel['matched_count']} अर्ज",
        )

    marathi = {
        "type":                 gr_type,
        "summary":              summary,
        "key_points":           key_points,
        "impact":               impact,
        "action":               action,
        "relevance":            rel["relevance"],
        "matched_applications": rel["matched_count"],
        "matched_components":   rel["matched_components"],
        "matched_apps_list":    rel["matched_applications"][:50],  # cap at 50 for UI
        "reason":               rel["reason"],
        "scope":                "sahayak" if sahayak_id else ("mandal" if mandal_id else "all"),
    }
    english = translate_basic(marathi, gr_type)
    english["matched_apps_list"] = marathi["matched_apps_list"]

    # Append scope note to English reason
    if sahayak_id and rel["matched_count"] > 0:
        english["reason"] += f" (scoped to your assigned applications)"
    elif mandal_id and rel["matched_count"] > 0:
        english["reason"] += f" (scoped to your mandal)"

    return ok({"marathi": marathi, "english": english})
