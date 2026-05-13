"""OCR text cleanup: character substitutions, medical vocabulary, noise lines, field artifacts."""

from __future__ import annotations

import re
from typing import List, Tuple, Union

__all__ = [
    "postprocess",
    "remove_noise_lines",
    "MEDICAL_CORRECTIONS",
    "CHAR_SUBS",
]

CharSubItem = Union[Tuple[str, str], Tuple[str, str, int]]

CHAR_SUBS: List[CharSubItem] = [
    (r"§", "S"),
    (r"^\s*[\|\[\]\{\}—\-=:]+\s*$", "", re.MULTILINE),
    (r"(?<=[A-Za-z]),(?=\s)", ""),
    (r"\b([A-Z]+)l([A-Z]+)\b", r"\1I\2"),
    (r"\b([A-Z]+)0([A-Z]+)\b", r"\1O\2"),
    (r"rn(?=[a-z])", "m"),
    (r"vv", "w"),
    ("ﬁ", "fi"),
    ("ﬂ", "fl"),
]

MEDICAL_CORRECTIONS: dict[str, str] = {
    "REFORT": "REPORT",
    "REPOFT": "REPORT",
    "DIGIFAL": "DIGITAL",
    "RADIOGRAGH": "RADIOGRAPH",
    "RADIOGRAPCH": "RADIOGRAPH",
    "BRONCHILIS": "BRONCHITIS",
    "BRGNCHITIS": "BRONCHITIS",
    "ERGNCHITIS": "BRONCHITIS",
    "B\u0420ONCHITIS": "BRONCHITIS",
    "DIAPHRAOM": "DIAPHRAGM",
    "DIAPHRAGNI": "DIAPHRAGM",
    "MEDIASTNAL": "MEDIASTINAL",
    "VASEVLAR": "VASCULAR",
    "VASCLLAR": "VASCULAR",
    "NORMAJ": "NORMAL",
    "NORMAI": "NORMAL",
    "NERMAI": "NORMAL",
    "NORNAL": "NORMAL",
    "INPRESSION": "IMPRESSION",
    "INMPRESSION": "IMPRESSION",
    "PATHLOGICAL": "PATHOLOGICAL",
    "PATHALOGICAL": "PATHOLOGICAL",
    "EXAMINATON": "EXAMINATION",
    "EXAMINAFION": "EXAMINATION",
    "PHYSICLAN": "PHYSICIAN",
    "PHYSICAN": "PHYSICIAN",
    "PROMINENF": "PROMINENT",
    "PROMINENI": "PROMINENT",
    "REPORL": "REPORT",
    "REPOBT": "REPORT",
    "CARDLAC": "CARDIAC",
    "BRONCHOVASCULAR": "BRONCHO-VASCULAR",
}


def _apply_char_subs(text: str) -> str:
    for item in CHAR_SUBS:
        if len(item) == 3:
            pat, repl, flags = item[0], item[1], item[2]
            text = re.sub(pat, repl, text, flags=flags)
        else:
            pat, repl = item[0], item[1]
            text = re.sub(pat, repl, text)
    return text


def _apply_correction(text: str, wrong: str, right: str) -> str:
    """Replace wrong with right, preserving ALL_CAPS or Title_Case."""

    def replacer(m: re.Match[str]) -> str:
        matched = m.group(0)
        if matched.isupper():
            return right.upper()
        if matched.istitle():
            return right.title()
        return right

    return re.sub(re.escape(wrong), replacer, text, flags=re.IGNORECASE)


def _apply_medical_corrections(text: str) -> str:
    for wrong in sorted(MEDICAL_CORRECTIONS.keys(), key=len, reverse=True):
        right = MEDICAL_CORRECTIONS[wrong]
        text = _apply_correction(text, wrong, right)
    return text


def remove_noise_lines(text: str) -> str:
    """Remove lines that are clearly OCR artifacts (very tight patterns only)."""
    pure_punct = re.compile(r"^[\s|\[\]{}\\\/\-—=~`#@^*_.,:;!]+$")
    lines = text.splitlines()
    cleaned: List[str] = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            cleaned.append(line)
            continue
        if len(stripped) <= 2 and not any(c.isalnum() for c in stripped):
            continue
        if pure_punct.match(stripped) and not any(c.isalnum() for c in stripped):
            continue
        cleaned.append(line)

    result: List[str] = []
    blank_count = 0
    for line in cleaned:
        if not line.strip():
            blank_count += 1
            if blank_count <= 1:
                result.append(line)
        else:
            blank_count = 0
            result.append(line)
    return "\n".join(result)


def _clean_field_values(text: str) -> str:
    """Strip bracket/pipe/equals artifacts around field values and dates."""
    text = re.sub(r"(?<=:\s)[\s=:\(\[\|]+(?=[A-Za-z0-9])", "", text)
    text = re.sub(r"(?<=[A-Za-z0-9\-\/])\s*[\|\)\]]+\s*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*\|\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*\|\s*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*=\s*:", ":", text)
    return text


def _merge_split_caps_words(text: str) -> str:
    """Merge split ALL-CAPS words only when the shorter token has no vowels (consonant fragment)."""
    vowels = set("AEIOU")

    def is_caps_alpha(t: str) -> bool:
        return t.isalpha() and t.isupper()

    def has_vowel(t: str) -> bool:
        return any(c in vowels for c in t.upper())

    def should_merge(w1: str, w2: str) -> bool:
        if not (is_caps_alpha(w1) and is_caps_alpha(w2)):
            return False
        if len(w1) < 2 or len(w2) < 2:
            return False
        if len(w1) + len(w2) > 15:
            return False
        shorter = w1 if len(w1) <= len(w2) else w2
        return not has_vowel(shorter)

    lines = text.splitlines()
    result: List[str] = []
    for line in lines:
        tokens = line.split()
        merged: List[str] = []
        i = 0
        while i < len(tokens):
            if i + 1 < len(tokens) and should_merge(tokens[i], tokens[i + 1]):
                merged.append(tokens[i] + tokens[i + 1])
                i += 2
            else:
                merged.append(tokens[i])
                i += 1
        result.append(" ".join(merged))
    return "\n".join(result)


def postprocess(text: str) -> str:
    """Run all post-processing steps in order. Call this after OCR, before extraction."""
    text = _apply_char_subs(text)
    text = _apply_medical_corrections(text)
    text = remove_noise_lines(text)
    text = _clean_field_values(text)
    text = _merge_split_caps_words(text)
    return text.strip()
