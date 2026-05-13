"""Reusable OCR backend: preprocessing, engines, extraction, and API helpers."""

from . import engines, extractor, postprocessor, preprocessor, utils
from .engines import easyocr_ocr, ocr, tesseract_ocr
from .extractor import extract, list_schemas
from .postprocessor import postprocess
from .preprocessor import load_image_bgr, preprocess, preprocess_easyocr, preprocess_tesseract
from .utils import allowed_file, cleanup, get_upload_dir, save_upload

__all__ = [
    "engines",
    "extractor",
    "postprocessor",
    "preprocessor",
    "utils",
    "preprocess",
    "preprocess_easyocr",
    "preprocess_tesseract",
    "load_image_bgr",
    "tesseract_ocr",
    "easyocr_ocr",
    "ocr",
    "postprocess",
    "extract",
    "list_schemas",
    "save_upload",
    "cleanup",
    "allowed_file",
    "get_upload_dir",
]
