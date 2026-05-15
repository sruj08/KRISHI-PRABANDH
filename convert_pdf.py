import fitz # PyMuPDF
import sys
import os

def convert(pdf_path, output_img):
    doc = fitz.open(pdf_path)
    page = doc.load_page(0)
    pix = page.get_pixmap(dpi=150)
    pix.save(output_img)
    print(f"Saved {output_img}")

if __name__ == '__main__':
    convert(sys.argv[1], sys.argv[2])
