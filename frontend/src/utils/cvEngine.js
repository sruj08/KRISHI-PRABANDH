/**
 * Document sharpness + JPEG optimization for farmer uploads.
 * Always resolves (no throws). Low-quality images still get a blob + qualityTier: 'risky'
 * so the farmer can choose retake or attach anyway.
 */

function laplacianVarianceOnImage(cv, img, maxSide) {
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  if (!w || !h) return 0;
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const tw = Math.max(1, Math.round(w * scale));
  const th = Math.max(1, Math.round(h * scale));
  const c = document.createElement('canvas');
  c.width = tw;
  c.height = th;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, tw, th);

  let src = null;
  let gray = null;
  let lap = null;
  let mean = null;
  let stddev = null;
  try {
    src = cv.imread(c);
    gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    lap = new cv.Mat();
    cv.Laplacian(gray, lap, cv.CV_64F);
    mean = new cv.Mat();
    stddev = new cv.Mat();
    cv.meanStdDev(lap, mean, stddev);
    const sd = stddev.data64F[0];
    return sd * sd;
  } finally {
    try { src?.delete(); } catch (_) {}
    try { gray?.delete(); } catch (_) {}
    try { lap?.delete(); } catch (_) {}
    try { mean?.delete(); } catch (_) {}
    try { stddev?.delete(); } catch (_) {}
  }
}

function varianceToReadabilityScore(v) {
  if (!Number.isFinite(v) || v <= 0) return 0;
  return Math.min(100, Math.round((100 * v) / (v + 900)));
}

function dataUrlToApproxBytes(dataUrl) {
  let b = Math.round((dataUrl.length * 3) / 4);
  if (dataUrl.endsWith('==')) b -= 2;
  else if (dataUrl.endsWith('=')) b -= 1;
  return b;
}

const BLUR_GATE_ORIG = 2000;
const BLUR_GATE_COMP = 1250;
const SCORE_CLEAR_MIN = 72;

function classifyQuality(vOrig, vComp, score) {
  const clear =
    vOrig >= BLUR_GATE_ORIG && vComp >= BLUR_GATE_COMP && score >= SCORE_CLEAR_MIN;
  return clear ? 'clear' : 'risky';
}

export const cvEngine = {
  /**
   * @param {File} file
   * @returns {Promise<{
   *   ok: boolean,
   *   reason?: string,
   *   blob: Blob | null,
   *   preview: string | null,
   *   originalPreview: string | null,
   *   originalSize: number,
   *   optimizedSize: number,
   *   readabilityScore: number,
   *   rawVariance: number,
   *   isReadable: boolean,
   *   qualityTier: 'clear' | 'risky',
   * }>}
   */
  process: (file) => {
    return new Promise((resolve) => {
      const originalSize = file.size || 0;
      const origUrl = URL.createObjectURL(file);
      let settled = false;

      const finish = (partial) => {
        if (settled) return;
        settled = true;
        const tier = partial.qualityTier ?? (partial.isReadable ? 'clear' : 'risky');
        resolve({
          ok: partial.ok !== false,
          reason: partial.reason,
          blob: partial.blob ?? null,
          preview: partial.preview ?? null,
          originalPreview: partial.originalPreview ?? origUrl,
          originalSize,
          optimizedSize: partial.optimizedSize ?? 0,
          readabilityScore: partial.readabilityScore ?? 0,
          rawVariance: partial.rawVariance ?? 0,
          isReadable: Boolean(partial.isReadable),
          qualityTier: tier === 'clear' ? 'clear' : 'risky',
        });
      };

      if (!window.cvReady || !window.cv) {
        return finish({
          ok: false,
          reason: 'OPENCV_NOT_READY',
          originalPreview: origUrl,
          isReadable: false,
          qualityTier: 'risky',
          readabilityScore: 0,
          rawVariance: 0,
          optimizedSize: 0,
        });
      }

      const img = new Image();
      const TIMEOUT_MS = 25000;
      const timer = setTimeout(() => {
        if (settled) return;
        finish({
          ok: false,
          reason: 'TIMEOUT',
          originalPreview: origUrl,
          isReadable: false,
          qualityTier: 'risky',
          readabilityScore: 0,
          rawVariance: 0,
          optimizedSize: 0,
        });
      }, TIMEOUT_MS);

      const done = (payload) => {
        clearTimeout(timer);
        finish(payload);
      };

      img.onerror = () => {
        done({
          ok: false,
          reason: 'LOAD_ERROR',
          originalPreview: origUrl,
          isReadable: false,
          qualityTier: 'risky',
          readabilityScore: 0,
          rawVariance: 0,
          optimizedSize: 0,
        });
      };

      img.onload = () => {
        try {
          const cv = window.cv;
          const vOrig = laplacianVarianceOnImage(cv, img, 960);

          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          let src = cv.imread(canvas);
          let enhanced = new cv.Mat();
          try {
            src.convertTo(enhanced, -1, 1.06, 4);
            cv.imshow(canvas, enhanced);
          } finally {
            try { src.delete(); } catch (_) {}
            try { enhanced.delete(); } catch (_) {}
          }

          let minQ = 0.12;
          let maxQ = 0.95;
          let quality = 0.72;
          let finalDataUrl = null;
          for (let attempt = 0; attempt < 18; attempt += 1) {
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            const kb = dataUrlToApproxBytes(dataUrl) / 1024;
            if (kb > 495) {
              maxQ = quality;
              quality = (minQ + maxQ) / 2;
            } else if (kb < 380 && quality < 0.92) {
              minQ = quality;
              quality = Math.min(0.95, (minQ + maxQ) / 2);
            } else {
              finalDataUrl = dataUrl;
              break;
            }
            finalDataUrl = dataUrl;
          }
          if (!finalDataUrl) {
            finalDataUrl = canvas.toDataURL('image/jpeg', 0.5);
          }

          const packResult = (jpegBlob, vCompRounded, score, tier) => {
            let outBlob = jpegBlob;
            let outPreview = finalDataUrl;
            let outSize = jpegBlob.size;

            if (originalSize > 0 && originalSize <= 500 * 1024 && jpegBlob.size > originalSize * 1.08) {
              outBlob = file;
              outPreview = origUrl;
              outSize = originalSize;
            }

            const isClear = tier === 'clear';
            done({
              ok: true,
              blob: outBlob,
              preview: outPreview,
              originalPreview: origUrl,
              isReadable: isClear,
              qualityTier: tier,
              readabilityScore: score,
              rawVariance: vCompRounded,
              optimizedSize: outSize,
            });
          };

          const compImg = new Image();
          compImg.onload = () => {
            try {
              const vComp = laplacianVarianceOnImage(cv, compImg, 520);
              const score = varianceToReadabilityScore(vComp);
              const tier = classifyQuality(vOrig, vComp, score);

              fetch(finalDataUrl)
                .then((r) => r.blob())
                .then((jpegBlob) => {
                  packResult(jpegBlob, Math.round(vComp), score, tier);
                })
                .catch(() => {
                  done({
                    ok: false,
                    reason: 'ENCODE_ERROR',
                    originalPreview: origUrl,
                    isReadable: false,
                    qualityTier: 'risky',
                    readabilityScore: score,
                    rawVariance: Math.round(vComp),
                    optimizedSize: 0,
                  });
                });
            } catch (_) {
              done({
                ok: false,
                reason: 'ANALYSIS_ERROR',
                originalPreview: origUrl,
                isReadable: false,
                qualityTier: 'risky',
                readabilityScore: 0,
                rawVariance: 0,
                optimizedSize: 0,
              });
            }
          };

          compImg.onerror = () => {
            fetch(finalDataUrl)
              .then((r) => r.blob())
              .then((jpegBlob) => {
                done({
                  ok: true,
                  blob: jpegBlob,
                  preview: finalDataUrl,
                  originalPreview: origUrl,
                  isReadable: false,
                  qualityTier: 'risky',
                  readabilityScore: varianceToReadabilityScore(0),
                  rawVariance: 0,
                  optimizedSize: jpegBlob.size,
                });
              })
              .catch(() => {
                done({
                  ok: false,
                  reason: 'ENCODE_ERROR',
                  originalPreview: origUrl,
                  isReadable: false,
                  qualityTier: 'risky',
                  optimizedSize: 0,
                });
              });
          };

          compImg.src = finalDataUrl;
        } catch (_) {
          done({
            ok: false,
            reason: 'PROCESSING_ERROR',
            originalPreview: origUrl,
            isReadable: false,
            qualityTier: 'risky',
            readabilityScore: 0,
            rawVariance: 0,
            optimizedSize: 0,
          });
        }
      };

      img.src = origUrl;
    });
  },
};
