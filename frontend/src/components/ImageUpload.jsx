import React, { useRef, useState } from 'react';
import './ImageUpload.css';

export default function ImageUpload({ onImageSelect, preview }) {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  return (
    <div className="form-group">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div
        className={`image-upload-zone ${isDragActive ? 'drag-active' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="preview-container" onClick={(e) => e.stopPropagation()}>
            <img src={preview} alt="Upload preview" className="image-preview" />
            <button
              type="button"
              className="change-image-btn"
              onClick={handleClick}
            >
              Change Image
            </button>
          </div>
        ) : (
          <div className="upload-placeholder">
            <span className="upload-icon">📷</span>
            <div className="upload-text">Drag &amp; drop or click to upload</div>
            <div className="upload-subtext">Supports PNG, JPG, JPEG, WEBP</div>
          </div>
        )}
      </div>
    </div>
  );
}
