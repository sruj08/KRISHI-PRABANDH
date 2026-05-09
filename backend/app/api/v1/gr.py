from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.domain.gr_parser.extractor import extract_text
from app.domain.gr_parser.nlp import clean_text
from app.domain.gr_parser.service import GrParserService
from app.domain.applications.repository import ApplicationRepository

router = APIRouter(prefix="/gr", tags=["GR Parser"])

def ok(data):
    return {"success": True, "data": data}

@router.post("/parse")
async def parse_gr(
    file: UploadFile = File(...),
    sahayak_id: Optional[str] = Form(None),
    mandal_id: Optional[str] = Form(None),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    raw_text = extract_text(file_bytes)
    if not raw_text:
        raise HTTPException(status_code=422, detail="No text could be extracted from the PDF")
        
    text = clean_text(raw_text)
    if not text.strip():
        raise HTTPException(status_code=422, detail="No valid text found after cleaning")

    # Scope applications based on officer context
    scope = "all"
    apps = ApplicationRepository.get_all(limit=10000)
    
    if sahayak_id:
        apps = [a for a in apps if a.get("sahayak_id") == sahayak_id]
        scope = "sahayak"
    elif mandal_id:
        apps = [a for a in apps if a.get("mandal_id") == mandal_id]
        scope = "mandal"

    result = GrParserService.process_gr(text, apps, scope)
    return ok(result)
