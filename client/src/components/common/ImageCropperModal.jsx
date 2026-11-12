import { useState, useRef, useEffect } from 'react';
import { 
  HiOutlineX, 
  HiOutlineCheck, 
  HiOutlineZoomIn, 
  HiOutlineZoomOut, 
  HiOutlineRefresh 
} from 'react-icons/hi';
import './ImageCropperModal.css';

const CROP_SIZE = 240; // Diameter of crop circle in px

const ImageCropperModal = ({ isOpen, imageSrc, onClose, onCropComplete }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });

      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      };
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const isRotated = (rotation / 90) % 2 !== 0;
  const effWidth = isRotated ? naturalSize.height : naturalSize.width;
  const effHeight = isRotated ? naturalSize.width : naturalSize.height;
  const baseScale = (effWidth && effHeight) 
    ? Math.max(CROP_SIZE / effWidth, CROP_SIZE / effHeight) 
    : 1;

  const renderedWidth = naturalSize.width * baseScale * zoom;
  const renderedHeight = naturalSize.height * baseScale * zoom;

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApplyCrop = () => {
    if (!naturalSize.width || !naturalSize.height) return;

    const outputSize = 400; // Output 400x400 canvas
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');

    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.src = imageSrc;

    tempImg.onload = () => {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, outputSize, outputSize);

      ctx.save();
      // Move context to canvas center
      ctx.translate(outputSize / 2, outputSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      const ratio = outputSize / CROP_SIZE; // Ratio between viewport crop box and output canvas
      const drawWidth = naturalSize.width * baseScale * zoom * ratio;
      const drawHeight = naturalSize.height * baseScale * zoom * ratio;

      const drawX = -drawWidth / 2 + (position.x * ratio);
      const drawY = -drawHeight / 2 + (position.y * ratio);

      ctx.drawImage(tempImg, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();

      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], `profile-crop-${Date.now()}.png`, { type: 'image/png' });
        const previewUrl = URL.createObjectURL(blob);
        onCropComplete({ file, previewUrl });
        onClose();
      }, 'image/png', 0.95);
    };
  };

  return (
    <div className="cropper-modal-backdrop" onClick={onClose}>
      <div 
        className="cropper-modal-container animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cropper-modal-header">
          <h3>Crop Profile Picture</h3>
          <button type="button" className="cropper-close-btn" onClick={onClose}>
            <HiOutlineX size={20} />
          </button>
        </div>

        {/* Crop Area Viewport */}
        <div 
          className="cropper-viewport-wrapper"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Draggable & Rotatable Image */}
          {naturalSize.width > 0 && (
            <img
              src={imageSrc}
              alt="To Crop"
              className="cropper-source-image"
              style={{
                width: `${renderedWidth}px`,
                height: `${renderedHeight}px`,
                maxWidth: 'none',
                maxHeight: 'none',
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              draggable={false}
            />
          )}

          {/* Circular Crop Target Overlay */}
          <div className="cropper-crop-box-overlay">
            <div className="cropper-crop-circle" />
          </div>
        </div>

        {/* Controls */}
        <div className="cropper-controls">
          <div className="cropper-zoom-slider-group">
            <HiOutlineZoomOut className="cropper-icon" size={18} />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="cropper-range-input"
            />
            <HiOutlineZoomIn className="cropper-icon" size={18} />
          </div>

          <button 
            type="button" 
            className="cropper-action-btn rotate-btn"
            onClick={handleRotate}
            title="Rotate 90°"
          >
            <HiOutlineRefresh size={18} />
            <span>Rotate</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="cropper-modal-footer">
          <button type="button" className="cropper-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="cropper-apply-btn" onClick={handleApplyCrop}>
            <HiOutlineCheck size={18} />
            <span>Crop & Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
