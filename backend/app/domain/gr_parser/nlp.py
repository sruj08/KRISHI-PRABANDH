import re
import unicodedata

def clean_text(text: str) -> str:
    text = unicodedata.normalize("NFC", text)
    text = text.encode("utf-8", errors="ignore").decode("utf-8")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    return text.strip()
