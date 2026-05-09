import io
from fastapi import HTTPException

def extract_text(file_bytes: bytes) -> str:
    """
    Three-tier Devanagari-aware PDF extraction:
    Tier 1 — PyMuPDF (fitz)
    Tier 2 — pdfplumber
    Tier 3 — PyPDF2
    """
    try:
        import fitz
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages = [page.get_text("text") for page in doc]
        doc.close()
        text = "\n".join(pages)
        if text.strip():
            return text
    except Exception:
        pass

    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages = [page.extract_text() or "" for page in pdf.pages]
        text = "\n".join(pages)
        if text.strip():
            return text
    except Exception:
        pass

    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"PDF text extraction failed: {e}")
