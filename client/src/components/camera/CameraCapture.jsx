import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, RotateCw, Image, Upload, AlertCircle } from 'lucide-react';

export default function CameraCapture({ onCapture, onClose }) {
  const [streamActive, setStreamActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // environment = rear camera
  const [capturedImage, setCapturedImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start camera stream only on user action
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamActive(true);
    } catch (err) {
      console.warn('Camera permission denied or unsupported:', err);
      setErrorMsg('Camera access unavailable. Please use file upload below or check camera permissions.');
      setStreamActive(false);
    }
  };

  // Stop camera tracks cleanly
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
  };

  // Clean up tracks when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Switch between front and rear cameras
  const toggleCameraFacing = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
    if (streamActive) {
      setTimeout(startCamera, 100);
    }
  };

  // Capture frame from live video
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Compress to WebP / JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Rotate captured photo by 90 degrees
  const rotatePhoto = () => {
    if (!capturedImage) return;
    setIsCompressing(true);
    const img = new window.Image();
    img.src = capturedImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      const rotated = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(rotated);
      setRotation(prev => (prev + 90) % 360);
      setIsCompressing(false);
    };
  };

  // Handle local file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (<10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10MB limit. Please select a smaller photo.');
      return;
    }

    // Validate MIME
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Invalid file format. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  // Confirm photo and send to parent
  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      if (onClose) onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '560px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AgriNex Crop Lens</h3>
          </div>
          {onClose && (
            <button
              onClick={() => { stopCamera(); onClose(); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Viewport / Preview Area */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '360px',
          background: '#090d16',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured Harvest"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          ) : streamActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Viewfinder Target Framing Box */}
              <div style={{
                position: 'absolute',
                inset: '30px',
                border: '2px dashed rgba(16, 185, 129, 0.8)',
                borderRadius: '16px',
                pointerEvents: 'none',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0, 0, 0, 0.65)',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Align Crop in Center
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Camera size={32} />
              </div>
              <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
                Camera Ready for Crop Capture
              </p>
              <p style={{ fontSize: '0.8125rem', maxWidth: '320px', margin: '0 auto 20px', color: '#94a3b8' }}>
                Explicit camera permission required. Tap below to activate viewfinder or select an image from your device.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={startCamera} className="btn btn-primary btn-sm">
                  <Camera size={16} /> Open Camera
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary btn-sm">
                  <Upload size={16} /> Choose Photo
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '10px 16px',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Control Toolbar */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          {capturedImage ? (
            <>
              <button
                onClick={() => { setCapturedImage(null); startCamera(); }}
                className="btn btn-secondary btn-sm"
              >
                <RefreshCw size={16} /> Retake
              </button>

              <button
                onClick={rotatePhoto}
                disabled={isCompressing}
                className="btn btn-secondary btn-sm"
                title="Rotate 90 degrees"
              >
                <RotateCw size={16} /> Rotate
              </button>

              <button
                onClick={confirmPhoto}
                className="btn btn-primary"
                style={{ marginLeft: 'auto' }}
              >
                <Check size={18} /> Use Crop Photo
              </button>
            </>
          ) : streamActive ? (
            <>
              <button
                onClick={toggleCameraFacing}
                className="btn btn-secondary btn-sm"
                title="Switch Camera (Front/Rear)"
              >
                <RefreshCw size={16} /> Switch Lens
              </button>

              <button
                onClick={takeSnapshot}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  border: '4px solid #ffffff',
                  boxShadow: '0 0 0 2px #10b981, 0 4px 12px rgba(16, 185, 129, 0.4)',
                  cursor: 'pointer',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Camera size={24} />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary btn-sm"
              >
                <Image size={16} /> Gallery
              </button>
            </>
          ) : (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-outline btn-sm">
                <Upload size={16} /> Upload Local Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
