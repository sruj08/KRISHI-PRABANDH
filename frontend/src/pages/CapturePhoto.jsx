import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../hooks/useToast.jsx';

const CapturePhoto = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Start camera on mount
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        addToast("Camera access denied or not available", "error");
      }
    };
    startCamera();

    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCapture = () => {
    setIsRecording(true);
    addToast("Capturing GPS tagged photo...", "info", 1500);
    setTimeout(() => {
      setIsRecording(false);
      addToast("Photo captured successfully!", "success");
      // In a real app, we'd save the image data here
    }, 1500);
  };

  const handleUpload = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    navigate('/confirm-verification');
  };

  const handleBack = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    navigate(-1);
  };

  return (
    <div style={{ backgroundColor: '#000', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Controls */}
      <div className="flex justify-between items-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 }}>
        <button className="btn-icon" style={{ color: 'white', backgroundColor: 'transparent' }} onClick={handleBack}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center gap-2">
          {isRecording && <div className="recording-indicator" />}
          <span className="text-sm fw-bold">LAT: 18.5204 N | LNG: 73.8567 E</span>
        </div>
        <button className="btn-icon" style={{ color: 'white', backgroundColor: 'transparent' }}>
          <span className="material-symbols-outlined">flash_on</span>
        </button>
      </div>

      {/* Camera View Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}
        />
        
        {/* Alignment Frame */}
        <div style={{ 
          position: 'absolute', inset: '10%', 
          border: '2px solid rgba(255, 255, 255, 0.4)', 
          borderRadius: '16px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div className="flex justify-between p-2">
            <div style={{ width: '20px', height: '20px', borderTop: '4px solid #4CAF50', borderLeft: '4px solid #4CAF50' }} />
            <div style={{ width: '20px', height: '20px', borderTop: '4px solid #4CAF50', borderRight: '4px solid #4CAF50' }} />
          </div>
          <div className="text-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', margin: '0 20px' }}>
            <p className="text-sm fw-bold">{t("Align subject in frame", lang)}</p>
          </div>
          <div className="flex justify-between p-2">
            <div style={{ width: '20px', height: '20px', borderBottom: '4px solid #4CAF50', borderLeft: '4px solid #4CAF50' }} />
            <div style={{ width: '20px', height: '20px', borderBottom: '4px solid #4CAF50', borderRight: '4px solid #4CAF50' }} />
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-around items-center p-6" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
        <button className="btn text-white bg-transparent" onClick={() => addToast("Retaking photo", "info")}>
          {t("Retake", lang)}
        </button>
        
        <button 
          onClick={handleCapture}
          style={{
            width: '72px', height: '72px', borderRadius: '50%',
            backgroundColor: 'white', border: '4px solid #4CAF50',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.1)' }} />
        </button>

        <button className="btn btn-primary" onClick={handleUpload}>
          <span className="material-symbols-outlined">cloud_upload</span>
          {t("Upload", lang)}
        </button>
      </div>

    </div>
  );
};

export default CapturePhoto;
