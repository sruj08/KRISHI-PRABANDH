import re

CLUSTERS: dict[str, list[str]] = {
    "Administrative": ["बदली", "पदस्थापना", "नियुक्ती", "कार्यभार", "प्रतिनियुक्ती", "सेवा", "अधिकारी", "कर्मचारी"],
    "Subsidy": ["अनुदान", "सबसिडी", "अर्थसहाय्य", "आर्थिक मदत", "अनुदानित", "लाभ", "रक्कम", "निधी"],
    "Scheme": ["योजना", "लाभार्थी", "प्रकल्प", "मोहीम", "अंमलबजावणी", "पात्र शेतकरी", "कार्यक्रम"],
}
_MIN_SCORE = 1

def classify_gr(text: str) -> str:
    scores = {label: sum(1 for kw in keywords if kw in text) for label, keywords in CLUSTERS.items()}
    best_label = max(scores, key=lambda k: scores[k])
    if scores[best_label] >= _MIN_SCORE:
        return best_label
    return "Unknown"

_DEPT_KEYWORDS = {
    "कृषी": "कृषी विभाग", "महसूल": "महसूल विभाग", "वित्त": "वित्त विभाग",
    "सहकार": "सहकार विभाग", "जलसंपदा": "जलसंपदा विभाग", "ऊर्जा": "ऊर्जा विभाग",
}

_IMPORTANT_PHRASES = ["मान्यता", "निर्णय", "आदेश", "योजना", "लाभार्थी", "अनुदान", "उद्दिष्ट", "अंमलबजावणी", "निधी", "रक्कम", "प्रकल्प", "पात्र", "शेतकरी", "विभाग", "सबसिडी"]

def _score_sentence(sentence: str) -> int:
    score = sum(1 for phrase in _IMPORTANT_PHRASES if phrase in sentence)
    if 30 <= len(sentence) <= 200:
        score += 2
    return score

def extract_sections(text: str) -> dict[str, str]:
    sections = {"numbered": [], "purpose": [], "implementation": [], "beneficiaries": [], "other": []}
    _SECTION_RE = re.compile(r"(?:^|\n)\s*(?:[१२३४५६७८९\d][\.|\)]|\*|–|-)\s*")
    lines = text.split("\n")
    for line in lines:
        stripped = line.strip()
        if not stripped: continue
        if _SECTION_RE.match(line) or re.match(r"^[१२३४५६७८९\d][\.|\)]", stripped):
            sections["numbered"].append(stripped)
        elif any(sig in stripped for sig in ["उद्देश", "हेतू", "संदर्भ"]):
            sections["purpose"].append(stripped)
        elif any(sig in stripped for sig in ["अंमलबजावणी", "कार्यपद्धती"]):
            sections["implementation"].append(stripped)
        elif any(sig in stripped for sig in ["लाभार्थी", "पात्र"]):
            sections["beneficiaries"].append(stripped)
        else:
            sections["other"].append(stripped)
    return {k: "\n".join(v) for k, v in sections.items()}

def summarize_gr(text: str) -> str:
    dept = next((label for kw, label in _DEPT_KEYWORDS.items() if kw in text), "शासन विभाग")
    sections = extract_sections(text)
    
    def _best(section_text: str, n: int = 1) -> list[str]:
        sents = [s.strip() for s in re.split(r"[।\n]", section_text) if len(s.strip()) > 20]
        return sorted(sents, key=_score_sentence, reverse=True)[:n]

    chosen, seen = [], set()
    def _add(s: str):
        s = s.strip()[:180]
        if s and s not in seen:
            seen.add(s)
            chosen.append(s)

    for sec_key in ("purpose", "implementation", "beneficiaries"):
        for sent in _best(sections.get(sec_key, "")): _add(sent)
            
    for sent in _best(sections.get("numbered", ""), 3):
        _add(sent)
        if len(chosen) >= 5: break

    if len(chosen) < 3:
        all_sents = [s.strip() for s in re.split(r"[।\n]", text) if len(s.strip()) > 25]
        for _, sent in sorted(enumerate(all_sents), key=lambda idx_s: _score_sentence(idx_s[1]), reverse=True):
            _add(sent)
            if len(chosen) >= 5: break

    if not chosen: return "सारांश उपलब्ध नाही."
    return f"ही शासन निर्णय {dept}मार्फत जारी करण्यात आली आहे. " + "। ".join(chosen[:5]) + "।"
