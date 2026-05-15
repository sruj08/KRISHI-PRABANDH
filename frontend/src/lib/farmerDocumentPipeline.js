/**
 * Client-side farmer document pipeline: PDF/image rasterize, enhance, compress,
 * quality metrics, Tesseract OCR, lightweight field extraction, registry cross-check.
 * Intended for live demo (no mocked compression/OCR).
 */

import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import farmerRegistry from '../mock/puneAgristackFarmers.sahayak.json';

import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

let pdfWorkerConfigured = false;

function ensurePdfWorker() {
  if (!pdfWorkerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    pdfWorkerConfigured = true;
  }
}

const MAX_INPUT_BYTES = 80 * 1024 * 1024;
const DEFAULT_MAX_OUTPUT_BYTES = 1024 * 1024;
const MAX_PDF_PAGES = 20;
const PREVIEW_MAX_EDGE = 1400;
/** Small fixed raster for Laplacian / “OpenCV-style” sharpness (fast pre-check). */
const SHARP_SCAN_EDGE = 360;
const SHARP_ANALYSIS_LONG_EDGE = 256;

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/** @param {ArrayBuffer} buf */
function sniffKind(buf) {
  const u8 = new Uint8Array(buf.slice(0, 8));
  if (u8[0] === 0x25 && u8[1] === 0x50 && u8[2] === 0x44 && u8[3] === 0x46) return 'pdf';
  if (u8[0] === 0xff && u8[1] === 0xd8 && u8[2] === 0xff) return 'jpeg';
  if (u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4e && u8[3] === 0x47) return 'png';
  return 'unknown';
}

export function validateFarmerUploadFile(file) {
  if (!file || !(file instanceof File)) return 'No file selected';
  if (file.size > MAX_INPUT_BYTES) return 'File is too large for browser processing (max 80 MB)';
  const name = (file.name || '').toLowerCase();
  const ext = name.split('.').pop() || '';
  const mime = file.type || '';
  const okExt = ['pdf', 'jpg', 'jpeg', 'png'].includes(ext);
  const okMime =
    mime === 'application/pdf' ||
    mime === 'image/jpeg' ||
    mime === 'image/png' ||
    mime === 'image/jpg';
  if (!okExt && !okMime) return 'Only PDF, JPG, or PNG uploads are allowed';
  if (mime && mime.startsWith('text/')) return 'Executable or text payloads are not allowed';
  if (mime && mime.includes('javascript')) return 'Invalid file type';
  return null;
}

function imageDataToGrayStats(imageData) {
  const { data, width, height } = imageData;
  let sum = 0;
  let sumSq = 0;
  let min = 255;
  let max = 0;
  const n = width * height;
  for (let i = 0; i < data.length; i += 4) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    sum += g;
    sumSq += g * g;
    if (g < min) min = g;
    if (g > max) max = g;
  }
  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  const std = Math.sqrt(Math.max(0, variance));
  return { mean, std, min, max, width, height };
}

/** Laplacian variance on grayscale (focus / blur proxy). */
function laplacianVarianceFromImageData(imageData) {
  const { data, width, height } = imageData;
  const gray = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      gray[y * width + x] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
  }
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const v =
        4 * gray[idx] -
        gray[idx - width] -
        gray[idx + width] -
        gray[idx - 1] -
        gray[idx + 1];
      sum += v;
      sumSq += v * v;
      count++;
    }
  }
  if (!count) return 0;
  const mean = sum / count;
  return sumSq / count - mean * mean;
}

/** Border vs interior difference heuristic for “cut off” scans. */
function edgeCutoffScore(imageData) {
  const { data, width, height } = imageData;
  const band = Math.max(2, Math.floor(Math.min(width, height) * 0.02));
  let border = 0;
  let inner = 0;
  let cb = 0;
  let ci = 0;
  const lum = (x, y) => {
    const i = (y * width + x) * 4;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const onBorder = x < band || y < band || x >= width - band || y >= height - band;
      const L = lum(x, y);
      if (onBorder) {
        border += L;
        cb++;
      } else if (x > band && x < width - band && y > band && y < height - band) {
        inner += L;
        ci++;
      }
    }
  }
  if (!cb || !ci) return 0;
  return Math.abs(border / cb - inner / ci);
}

function enhanceImageData(imageData) {
  const { width, height, data: src } = imageData;
  const data = new Uint8ClampedArray(src);
  const stats = imageDataToGrayStats({ data, width, height });
  const lo = stats.min;
  const hi = stats.max;
  const range = Math.max(24, hi - lo);
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const r = clamp(((data[i] - lo) / range) * 255, 0, 255);
    const g = clamp(((data[i + 1] - lo) / range) * 255, 0, 255);
    const b = clamp(((data[i + 2] - lo) / range) * 255, 0, 255);
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const lift = y < 95 ? 18 : y < 130 ? 10 : 0;
    out[i] = clamp(r + lift * 0.35, 0, 255);
    out[i + 1] = clamp(g + lift * 0.35, 0, 255);
    out[i + 2] = clamp(b + lift * 0.35, 0, 255);
    out[i + 3] = data[i + 3];
  }
  // Mild unsharp on luminance
  const tmp = new Uint8ClampedArray(out);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const blur =
        (tmp[i] +
          tmp[i - 4] +
          tmp[i + 4] +
          tmp[i - width * 4] +
          tmp[i + width * 4]) /
        5;
      const k = 0.35;
      out[i] = clamp(tmp[i] + k * (tmp[i] - blur), 0, 255);
      out[i + 1] = clamp(tmp[i + 1] + k * (tmp[i + 1] - blur), 0, 255);
      out[i + 2] = clamp(tmp[i + 2] + k * (tmp[i + 2] - blur), 0, 255);
    }
  }
  return new ImageData(out, width, height);
}

async function canvasToJpegBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Could not encode image'));
      },
      'image/jpeg',
      quality,
    );
  });
}

async function compressCanvasToMaxBytes(canvas, maxBytes, onAttempt, depth = 0) {
  if (depth > 10) {
    const blob = await canvasToJpegBlob(canvas, 0.28);
    return { blob, quality: 0.28 };
  }
  let lo = 0.35;
  let hi = 0.92;
  let best = await canvasToJpegBlob(canvas, hi);
  onAttempt?.(hi, best.size);
  if (best.size <= maxBytes) return { blob: best, quality: hi };
  for (let iter = 0; iter < 14; iter++) {
    const mid = (lo + hi) / 2;
    const blob = await canvasToJpegBlob(canvas, mid);
    onAttempt?.(mid, blob.size);
    if (blob.size <= maxBytes) {
      best = blob;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  if (best.size > maxBytes) {
    const scaleDown = Math.sqrt(maxBytes / best.size) * 0.92;
    const w = Math.max(360, Math.floor(canvas.width * scaleDown));
    const h = Math.max(360, Math.floor(canvas.height * scaleDown));
    const c2 = document.createElement('canvas');
    c2.width = w;
    c2.height = h;
    const ctx2 = c2.getContext('2d');
    ctx2.imageSmoothingEnabled = true;
    ctx2.imageSmoothingQuality = 'high';
    ctx2.drawImage(canvas, 0, 0, w, h);
    return compressCanvasToMaxBytes(c2, maxBytes, onAttempt, depth + 1);
  }
  return { blob: best, quality: lo };
}

function drawImageData(ctx, imageData) {
  ctx.putImageData(imageData, 0, 0);
}

async function fileToImageBitmap(file) {
  return createImageBitmap(file, { imageOrientation: 'from-image' });
}

/**
 * Fast sharpness pre-scan (Laplacian variance on a normalised small canvas — same class of metric as OpenCV Laplacian blur detection).
 * @returns {Promise<{ laplacianVariance: number, severity: 'ok'|'warn'|'severe', headline: string, detail: string }>}
 */
export async function quickSharpnessScan(file) {
  const err = validateFarmerUploadFile(file);
  if (err) throw new Error(err);
  const buf = await file.arrayBuffer();
  const kind = sniffKind(buf);
  if (kind === 'unknown') throw new Error('Unrecognised file format');

  let canvas;
  if (kind === 'pdf') {
    const { canvases } = await rasterizePdfToCanvases(buf, 1, () => {}, SHARP_SCAN_EDGE);
    canvas = canvases[0];
  } else {
    const bmp = await fileToImageBitmap(file);
    const scale = Math.min(1, SHARP_SCAN_EDGE / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.floor(bmp.width * scale));
    const h = Math.max(1, Math.floor(bmp.height * scale));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    canvas = c;
  }

  const long = Math.max(canvas.width, canvas.height);
  const scale2 = Math.min(1, SHARP_ANALYSIS_LONG_EDGE / long);
  const tw = Math.max(48, Math.floor(canvas.width * scale2));
  const th = Math.max(48, Math.floor(canvas.height * scale2));
  const ac = document.createElement('canvas');
  ac.width = tw;
  ac.height = th;
  ac.getContext('2d').drawImage(canvas, 0, 0, tw, th);
  const id = ac.getContext('2d').getImageData(0, 0, tw, th);
  const laplacianVariance = laplacianVarianceFromImageData(id);

  let severity = 'ok';
  if (laplacianVariance < 52) severity = 'severe';
  else if (laplacianVariance < 118) severity = 'warn';

  const headline =
    severity === 'severe'
      ? 'Document looks very unclear (blur)'
      : severity === 'warn'
        ? 'Document may be unclear (slight blur)'
        : 'Document clarity looks acceptable';

  const detail =
    severity === 'severe'
      ? 'Such uploads are often rejected in government verification and can delay your subsidy. We still auto-enhance contrast and compress to the required size — please upload a sharper photo or scan if possible.'
      : severity === 'warn'
        ? 'Officers may ask for a clearer copy later, which can slow approval. We are optimising this file automatically for the portal limit.'
        : 'We will still enhance contrast and compress to the official upload size.';

  return { laplacianVariance: Math.round(laplacianVariance * 10) / 10, severity, headline, detail };
}

async function rasterizePdfToCanvases(arrayBuffer, maxPages, onPage, maxEdge = PREVIEW_MAX_EDGE) {
  ensurePdfWorker();
  const data = new Uint8Array(arrayBuffer.slice(0));
  const pdf = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;
  const num = Math.min(pdf.numPages, maxPages);
  const canvases = [];
  for (let p = 1; p <= num; p++) {
    const page = await pdf.getPage(p);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(1, maxEdge / Math.max(base.width, base.height));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d', { alpha: false });
    const task = page.render({ canvasContext: ctx, viewport, intent: 'display' });
    await (task.promise ?? task);
    canvases.push(canvas);
    onPage?.(p, num);
  }
  return { canvases, pageCount: pdf.numPages };
}

async function buildPdfFromJpegBlobs(blobs) {
  const pdfDoc = await PDFDocument.create();
  for (const blob of blobs) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const img = await pdfDoc.embedJpg(bytes);
    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const out = await pdfDoc.save();
  return new Blob([out], { type: 'application/pdf' });
}

function detectDocType(text) {
  const t = text || '';
  const lower = t.toLowerCase();
  if (t.includes('आधार') || lower.includes('aadhaar') || lower.includes('uidai')) return 'Aadhaar';
  if (t.includes('खाते') || t.includes('७/१२') || t.includes('7/12') || lower.includes('satbara') || lower.includes('survey'))
    return '7/12 extract';
  if (lower.includes('panchanama') || t.includes('पंचनामा')) return 'Panchanama';
  if (lower.includes('invoice') || lower.includes('tax invoice') || t.includes('चलान')) return 'Invoice';
  if (lower.includes('passbook') || t.includes('बँक') || t.includes('बैंक') || lower.includes('ifsc')) return 'Bank passbook';
  if (lower.includes('latitude') || lower.includes('longitude') || lower.includes('geo')) return 'Geo-tagged photo';
  return 'Unknown document';
}

function extractFields(text) {
  const out = {
    farmerName: '',
    surveyNumber: '',
    aadhaarLast4: '',
    bankAccountName: '',
    invoiceNumber: '',
    village: '',
    landDetails: '',
  };
  if (!text) return out;
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  out.farmerName = lines.find((l) => /^(name|नाव|farmer)/i.test(l))?.replace(/^(name|नाव|farmer)\s*[:\-]?\s*/i, '') || lines[0] || '';

  const surv = text.match(/(?:survey|सर्वे)\s*(?:no\.?|number|क्र\.?)?\s*[:\-]?\s*([0-9A-Za-z\/\-]{2,20})/i);
  if (surv) out.surveyNumber = surv[1];

  const aad = text.match(/\b(\d{4})\s*(\d{4})\s*(\d{4})\b/);
  if (aad) out.aadhaarLast4 = aad[3];

  const inv = text.match(/(?:invoice|inv)\s*#?\s*[:\-]?\s*([A-Z0-9\-\/]{4,24})/i);
  if (inv) out.invoiceNumber = inv[1];

  const vil = text.match(/(?:village|गाव)\s*[:\-]?\s*([A-Za-z0-9\u0900-\u0D7F\s]{3,40})/i);
  if (vil) out.village = vil[1].trim();

  const ifscLine = lines.find((l) => /ifsc/i.test(l));
  if (ifscLine) out.bankAccountName = lines[lines.indexOf(ifscLine) - 1] || ifscLine;

  out.landDetails = lines.find((l) => /(hectare|ha\.?|area|क्षेत्रफळ)/i.test(l)) || '';
  return out;
}

function crossCheckRegistry(fields) {
  const last4 = (fields.aadhaarLast4 || '').replace(/\D/g, '').slice(-4);
  if (last4.length !== 4) {
    return { status: 'no_match', message: 'Aadhaar last 4 not detected — manual verification required.' };
  }
  const matches = farmerRegistry.filter((r) => String(r.aadhaar_last4) === last4);
  if (matches.length === 0) {
    return { status: 'unverified', message: 'No matching AgriStack seed record for this Aadhaar tail (demo registry).' };
  }
  const nameHit = matches.find((r) => {
    const fn = (fields.farmerName || '').toLowerCase();
    const rn = (r.name || '').toLowerCase();
    return fn && (rn.includes(fn.slice(0, 4)) || fn.includes(rn.slice(0, 4)));
  });
  if (nameHit) {
    return {
      status: 'verified',
      message: `Cross-check OK with AgriStack seed record (${nameHit.farmer_id}).`,
      record: nameHit,
    };
  }
  return {
    status: 'partial',
    message: 'Aadhaar tail matches seed data but name differs — please confirm spelling.',
    record: matches[0],
  };
}

function readabilityFromOcr(confidence, blurVar, darkMean, contrastStd, edgeScore) {
  let score = confidence;
  if (blurVar < 80) score -= 18;
  if (blurVar < 40) score -= 25;
  if (darkMean < 72) score -= 8;
  if (contrastStd < 18) score -= 6;
  if (edgeScore > 42) score -= 6;
  score = clamp(score, 0, 100);
  let label = 'Poor';
  if (score >= 85) label = 'Excellent';
  else if (score >= 70) label = 'Good';
  else if (score >= 50) label = 'Poor';
  else label = 'Reject';
  return { score, label };
}

function qualityNarrative({ blurVar, darkMean, contrastStd, edgeScore, ocrConfidence }, passedAsIs) {
  const issues = [];
  if (blurVar < 80) issues.push('Image appears soft or blurry');
  if (darkMean < 72) issues.push('Scan is unusually dark');
  if (contrastStd < 20) issues.push('Low contrast — text may be faint');
  if (edgeScore > 45) issues.push('Possible cut-off edges');
  if (ocrConfidence < 50) issues.push('OCR confidence is low');
  if (!issues.length) {
    return {
      level: 'ok',
      text: passedAsIs
        ? 'Within portal size (1 MB) — file kept as uploaded.'
        : 'Document verified and readable',
    };
  }
  if (passedAsIs && ocrConfidence >= 50 && issues.length <= 2) {
    return {
      level: 'warn',
      text: 'File was kept as-is (under 1 MB). Some text may still be unclear to officers — consider a sharper copy.',
    };
  }
  if (ocrConfidence >= 50 && issues.length <= 2) {
    return { level: 'warn', text: 'Some text unclear. Enhancement applied — please verify detected fields.' };
  }
  return { level: 'bad', text: 'Document unreadable. Please re-upload a clearer scan or photo.' };
}

/**
 * @typedef {Object} PipelineProgress
 * @property {string} stage
 * @property {number} pct
 */

/**
 * @param {File} file
 * @param {{ maxBytes?: number, maxPdfPages?: number, onProgress?: (p: PipelineProgress) => void }} [options]
 */
export async function processFarmerDocument(file, options = {}) {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_OUTPUT_BYTES;
  const maxPdfPages = options.maxPdfPages ?? MAX_PDF_PAGES;
  const onProgress = options.onProgress ?? (() => {});

  const report = (stage, pct) => onProgress({ stage, pct });

  report('reading', 4);
  const err = validateFarmerUploadFile(file);
  if (err) throw new Error(err);

  const buf = await file.arrayBuffer();
  const kind = sniffKind(buf);
  if (kind === 'unknown') throw new Error('Unrecognized file format (corrupt or unsupported)');

  report('analyzing', 12);

  /** @type {HTMLCanvasElement[]} */
  let originalCanvases = [];
  let logicalPageCount = 1;

  if (kind === 'pdf') {
    const { canvases, pageCount } = await rasterizePdfToCanvases(buf, maxPdfPages, (p, tot) => {
      report('rasterizing_pdf', 12 + Math.floor((p / tot) * 22));
    });
    originalCanvases = canvases;
    logicalPageCount = pageCount;
  } else {
    const bmp = await fileToImageBitmap(file);
    const scale = Math.min(1, PREVIEW_MAX_EDGE / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.floor(bmp.width * scale));
    const h = Math.max(1, Math.floor(bmp.height * scale));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    originalCanvases = [c];
  }

  const primary = originalCanvases[0];
  const ctx0 = primary.getContext('2d');
  const originalSample = ctx0.getImageData(0, 0, primary.width, primary.height);
  const origStats = imageDataToGrayStats(originalSample);
  const smallW = Math.max(160, Math.floor(primary.width / 4));
  const smallH = Math.max(160, Math.floor(primary.height / 4));
  const sc = document.createElement('canvas');
  sc.width = smallW;
  sc.height = smallH;
  const scx = sc.getContext('2d');
  scx.drawImage(primary, 0, 0, smallW, smallH);
  const smallImg = scx.getImageData(0, 0, smallW, smallH);
  const blurVar = laplacianVarianceFromImageData(smallImg);
  const edgeScore = edgeCutoffScore(smallImg);

  /** Demo / workflow: if already within portal limit, keep original bytes — no re-compression. */
  const passedAsIs = file.size <= maxBytes;

  /** @type {HTMLCanvasElement[]} */
  let enhancedCanvases;
  /** @type {Blob} */
  let optimizedBlob;

  if (passedAsIs) {
    report('skipped_optimisation', 34);
    enhancedCanvases = originalCanvases.map((c) => {
      const out = document.createElement('canvas');
      out.width = c.width;
      out.height = c.height;
      out.getContext('2d').drawImage(c, 0, 0);
      return out;
    });
    report('compressing', 55);
    const outMime =
      kind === 'pdf'
        ? 'application/pdf'
        : kind === 'jpeg'
          ? 'image/jpeg'
          : kind === 'png'
            ? 'image/png'
            : file.type || 'application/octet-stream';
    optimizedBlob = new Blob([buf], { type: outMime });
  } else {
    report('enhancing', 38);
    enhancedCanvases = originalCanvases.map((c) => {
      const ctx = c.getContext('2d');
      const id = ctx.getImageData(0, 0, c.width, c.height);
      const en = enhanceImageData(id);
      const out = document.createElement('canvas');
      out.width = c.width;
      out.height = c.height;
      out.getContext('2d').putImageData(en, 0, 0);
      return out;
    });

    report('compressing', 48);
    const perPageBudget = Math.max(120_000, Math.floor(maxBytes / Math.max(1, enhancedCanvases.length)));
    const jpegBlobs = [];
    for (let i = 0; i < enhancedCanvases.length; i++) {
      const { blob } = await compressCanvasToMaxBytes(enhancedCanvases[i], perPageBudget, () => {
        report('compressing', 48 + Math.floor(((i + 0.5) / enhancedCanvases.length) * 12));
      });
      jpegBlobs.push(blob);
    }

    if (kind === 'pdf') {
      optimizedBlob = await buildPdfFromJpegBlobs(jpegBlobs);
      let guard = 0;
      while (optimizedBlob.size > maxBytes && guard < 4) {
        guard++;
        const factor = Math.sqrt((maxBytes * 0.95) / optimizedBlob.size);
        const resized = await Promise.all(
          enhancedCanvases.map(async (c) => {
            const w = Math.max(360, Math.floor(c.width * factor));
            const h = Math.max(360, Math.floor(c.height * factor));
            const c2 = document.createElement('canvas');
            c2.width = w;
            c2.height = h;
            const x = c2.getContext('2d');
            x.drawImage(c, 0, 0, w, h);
            const { blob } = await compressCanvasToMaxBytes(c2, perPageBudget, () => {});
            return blob;
          }),
        );
        optimizedBlob = await buildPdfFromJpegBlobs(resized);
      }
    } else {
      optimizedBlob = jpegBlobs[0];
      const c = enhancedCanvases[0];
      let guard = 0;
      while (optimizedBlob.size > maxBytes && guard < 6) {
        guard++;
        const w = Math.max(320, Math.floor(c.width * 0.88));
        const h = Math.max(320, Math.floor(c.height * 0.88));
        const c2 = document.createElement('canvas');
        c2.width = w;
        c2.height = h;
        c2.getContext('2d').drawImage(c, 0, 0, w, h);
        const r = await compressCanvasToMaxBytes(c2, maxBytes, () => {});
        optimizedBlob = r.blob;
      }
    }
  }

  const beforeUrl = primary.toDataURL('image/jpeg', 0.82);
  const afterUrl = passedAsIs ? beforeUrl : enhancedCanvases[0].toDataURL('image/jpeg', 0.88);

  report('ocr', 72);
  const ocrCanvas = passedAsIs ? primary : enhancedCanvases[0];
  let ocrText = '';
  let ocrConfidence = 0;
  let detectedLang = 'eng';

  const ocrLogger = (m) => {
    if (m.status === 'recognizing text' && typeof m.progress === 'number') {
      report('ocr', 72 + Math.floor(m.progress * 18));
    }
  };

  let worker;
  try {
    worker = await createWorker('eng+hin+mar', 1, { logger: ocrLogger });
  } catch {
    try {
      worker = await createWorker('eng+hin', 1, { logger: ocrLogger });
    } catch {
      worker = await createWorker('eng', 1, { logger: ocrLogger });
    }
  }

  function meanWordConfidence(data) {
    const scores = [];
    const visitWords = (words) => {
      if (!words) return;
      for (const w of words) {
        if (typeof w.confidence === 'number' && w.confidence > 0) scores.push(w.confidence);
      }
    };
    const walkBlocks = (blocks) => {
      if (!blocks) return;
      for (const b of blocks) {
        for (const p of b.paragraphs || []) {
          for (const line of p.lines || []) visitWords(line.words);
        }
      }
    };
    walkBlocks(data.blocks);
    if (scores.length) return scores.reduce((a, b) => a + b, 0) / scores.length;
    if (typeof data.confidence === 'number' && data.confidence > 0) return data.confidence;
    return 0;
  }

  try {
    const ret = await worker.recognize(ocrCanvas, { rotateAuto: true });
    ocrText = ret.data.text || '';
    ocrConfidence = meanWordConfidence(ret.data);
    const script = (ret.data.text || '').match(/[\u0900-\u0D7F]/);
    if (script) detectedLang = 'hin+mar (Devanagari detected)';
  } finally {
    await worker.terminate();
  }

  report('validating', 92);
  const { score: readabilityScore, label: readabilityLabel } = readabilityFromOcr(
    ocrConfidence,
    blurVar,
    origStats.mean,
    origStats.std,
    edgeScore,
  );
  const qn = qualityNarrative(
    {
      blurVar,
      darkMean: origStats.mean,
      contrastStd: origStats.std,
      edgeScore,
      ocrConfidence,
    },
    passedAsIs,
  );

  const reject = readabilityLabel === 'Reject' || ocrConfidence < 50;
  const detectedType = detectDocType(ocrText);
  const extractedFields = extractFields(ocrText);
  const crossCheck = reject ? null : crossCheckRegistry(extractedFields);

  const compressionPct =
    file.size > 0 && !passedAsIs ? Math.round((1 - optimizedBlob.size / file.size) * 1000) / 10 : 0;

  const enhancementTags = passedAsIs
    ? ['Within 1 MB — original file retained', 'OCR checked']
    : (() => {
        const tags = ['Noise Reduced', 'Contrast Enhanced'];
        if (kind === 'pdf' || file.size > maxBytes) tags.push('File Compressed');
        tags.push('OCR Optimized');
        return tags;
      })();

  const pages = originalCanvases.map((oc, idx) => ({
    beforeUrl: oc.toDataURL('image/jpeg', 0.78),
    afterUrl: passedAsIs ? oc.toDataURL('image/jpeg', 0.78) : enhancedCanvases[idx].toDataURL('image/jpeg', 0.85),
    width: oc.width,
    height: oc.height,
  }));

  report('finalizing', 100);

  return {
    ok: !reject,
    passedAsIs,
    rejectReason: reject ? qn.text : null,
    originalFileName: file.name,
    originalSize: file.size,
    originalSizeLabel: formatBytes(file.size),
    optimizedSize: optimizedBlob.size,
    optimizedSizeLabel: formatBytes(optimizedBlob.size),
    optimizedBlob,
    compressionPct,
    mimeOut: optimizedBlob.type,
    pageCount: logicalPageCount,
    processedPages: enhancedCanvases.length,
    originalPreviewUrl: beforeUrl,
    optimizedPreviewUrl: afterUrl,
    pages,
    blurScore: Math.round(blurVar),
    meanBrightness: Math.round(origStats.mean),
    contrastStd: Math.round(origStats.std * 10) / 10,
    edgeCutoffScore: Math.round(edgeScore * 10) / 10,
    ocrConfidence: Math.round(ocrConfidence * 10) / 10,
    ocrTextPreview: (ocrText || '').slice(0, 1200),
    detectedLang,
    readabilityScore: Math.round(readabilityScore * 10) / 10,
    readabilityLabel,
    qualityMessage: qn,
    enhancementTags,
    detectedType,
    extractedFields,
    crossCheck,
  };
}

export { formatBytes, farmerRegistry };
