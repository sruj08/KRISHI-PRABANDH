import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../hooks/useToast.jsx';
import { uploadPhoto } from '../utils/api';

const CapturePhoto = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // Read applicationId from query params: /capture-photo?appId=APP-001
  const applicationId = searchParams.get('appId');

  // ── Camera setup ────────────────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      setCameraError(false);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(true);
      addToast(t('Camera not available - use file picker instead', lang), 'error');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Wire the stream into the video element whenever stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup: stop all tracks on unmount
      setStream(prev => {
        if (prev) prev.getTracks().forEach(track => track.stop());
        return null;
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopStream = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  // ── Capture frame from live video ────────────────────────────────────────────

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) {
        addToast(t('Could not capture frame - try again', lang), 'error');
        setIsCapturing(false);
        return;
      }
      setCapturedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setIsCapturing(false);
      addToast(t('Photo captured!', lang), 'success');
    }, 'image/jpeg', 0.9);
  };

  // ── File picker fallback ─────────────────────────────────────────────────────

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      addToast(t('Please select an image file', lang), 'error');
      return;
    }
    setCapturedBlob(f);
    setPreviewUrl(URL.createObjectURL(f));
    addToast(t('Image selected', lang), 'info');
  };

  const handleRetake = () => {
    setCapturedBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // Restart camera if it was working
    if (!cameraError) startCamera();
  };

  // Revoke object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // ── Upload to backend ────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!capturedBlob) {
      addToast(t('Capture or select a photo first', lang), 'error');
      return;
    }
    if (!applicationId) {
      addToast(t('No application selected - go back and select one', lang), 'error');
      return;
    }

    setIsUploading(true);
    try {
      // Wrap raw Blob as a named File so mulitpart/form-data has a filename
      const file =
        capturedBlob instanceof File
          ? capturedBlob
          : new File([capturedBlob], 'field-photo.jpg', { type: 'image/jpeg' });

      await uploadPhoto(applicationId, file, 'Photo uploaded for verification');
      /* await postLog({
        action: 'PHOTO_UPLOAD',
        application_id: applicationId,
        details: 'Field photo captured and uploaded',
      }); */

      addToast(t('Photo uploaded successfully!', lang), 'success');
      stopStream();
      navigate('/applications');
    } catch (err) {
      console.error('Upload error:', err);
      addToast(err.message || t('Upload failed - please retry', lang), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    stopStream();
    navigate(-1);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ backgroundColor: '#000', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Hidden canvas used for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Top Controls */}
      <div className="flex justify-between items-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 }}>
        <button className="btn-icon" style={{ color: 'white', backgroundColor: 'transparent' }} onClick={handleBack}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center gap-2">
          {isCapturing && <div className="recording-indicator" />}
          {applicationId
            ? <span className="text-sm fw-bold" style={{ color: '#4CAF50' }}>{t('App', lang)}: {applicationId}</span>
            : <span className="text-sm" style={{ color: '#ef5350' }}>{t('⚠ No application selected', lang)}</span>
          }
        </div>
        <button
          className="btn-icon"
          style={{ color: 'white', backgroundColor: 'transparent' }}
          onClick={() => fileInputRef.current?.click()}
          title={t('Pick from gallery', lang)}
        >
          <span className="material-symbols-outlined">photo_library</span>
        </button>
      </div>

      {/* Camera / Preview Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Show preview if a photo was captured */}
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Captured"
            style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute' }}
          />
        ) : (
          <>
            {!cameraError ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: '#aaa' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '64px', opacity: 0.4 }}>no_photography</span>
                <p className="text-sm">{t('Camera unavailable', lang)}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="material-symbols-outlined">upload_file</span>
                  {t('Choose from Gallery', lang)}
                </button>
              </div>
            )}

            {/* Alignment frame overlay */}
            {!cameraError && (
              <div style={{
                position: 'absolute', inset: '10%',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '16px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                <div className="flex justify-between p-2">
                  <div style={{ width: '20px', height: '20px', borderTop: '4px solid #4CAF50', borderLeft: '4px solid #4CAF50' }} />
                  <div style={{ width: '20px', height: '20px', borderTop: '4px solid #4CAF50', borderRight: '4px solid #4CAF50' }} />
                </div>
                <div className="text-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', margin: '0 20px' }}>
                  <p className="text-sm fw-bold">{t('Align subject in frame', lang)}</p>
                </div>
                <div className="flex justify-between p-2">
                  <div style={{ width: '20px', height: '20px', borderBottom: '4px solid #4CAF50', borderLeft: '4px solid #4CAF50' }} />
                  <div style={{ width: '20px', height: '20px', borderBottom: '4px solid #4CAF50', borderRight: '4px solid #4CAF50' }} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-around items-center p-6" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>

        {previewUrl ? (
          /* After capture: Retake or Upload */
          <>
            <button
              className="btn text-white bg-transparent"
              onClick={handleRetake}
              disabled={isUploading}
            >
              {t('Retake', lang)}
            </button>

            <button
              onClick={handleUpload}
              disabled={isUploading}
              style={{
                padding: '12px 28px',
                borderRadius: '999px',
                backgroundColor: isUploading ? '#555' : '#4CAF50',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <span className="material-symbols-outlined">
                {isUploading ? 'hourglass_top' : 'cloud_upload'}
              </span>
              {isUploading ? t('Uploading…', lang) : t('Upload', lang)}
            </button>
          </>
        ) : (
          /* Before capture: Shutter button */
          <>
            <button
              className="btn text-white bg-transparent"
              onClick={() => fileInputRef.current?.click()}
            >
              {t('Gallery', lang)}
            </button>

            <button
              onClick={handleCapture}
              disabled={isCapturing || cameraError}
              style={{
                width: '72px', height: '72px', borderRadius: '50%',
                backgroundColor: isCapturing ? '#aaa' : 'white',
                border: '4px solid #4CAF50',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isCapturing ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.1)' }} />
            </button>

            <div style={{ width: '70px' }} /> {/* spacer */}
          </>
        )}
      </div>

    </div>
  );
};

export default CapturePhoto;
