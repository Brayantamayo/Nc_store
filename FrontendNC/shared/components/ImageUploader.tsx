import React, { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/shared/api/api';
import styles from '../../src/features/panel/css/Admin.module.css';

interface ImageUploaderProps {
  value: string; // single URL or comma-separated URLs
  onChange: (url: string) => void;
  multiple?: boolean;
  label?: string;
}

export const ImageUploader = ({
  value,
  onChange,
  multiple = false,
  label = 'Subir Imagen',
}: ImageUploaderProps) => {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Parse URLs
  const urls = value
    ? value.split(',').map((u) => u.trim()).filter(Boolean)
    : [];

  const handleUpload = async (files: FileList) => {
    setLoading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('image', file);

        const { data } = await api.post<{ url: string; public_id: string }>(
          '/imagenes/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        uploadedUrls.push(data.url);
      }

      if (multiple) {
        const updated = [...urls, ...uploadedUrls].join(', ');
        onChange(updated);
      } else {
        onChange(uploadedUrls[0] || '');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al subir la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      void handleUpload(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updated = urls.filter((_, idx) => idx !== indexToRemove).join(', ');
    onChange(updated);
  };

  return (
    <div className={styles.formGroup} style={{ width: '100%' }}>
      <label className={styles.formLabel}>{label}</label>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        style={{
          border: dragActive
            ? '2px dashed #c2185b'
            : '2px dashed rgba(248, 187, 208, 0.65)',
          borderRadius: '16px',
          background: dragActive
            ? 'rgba(248, 187, 208, 0.12)'
            : 'rgba(255, 255, 255, 0.6)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.25s ease',
          gap: '0.5rem',
        }}
      >
        <input
          type="file"
          multiple={multiple}
          onChange={handleFileChange}
          accept="image/*"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'pointer',
          }}
          disabled={loading}
        />

        {loading ? (
          <>
            <Loader2 className={styles.loadingSpinner} style={{ margin: 0, width: 28, height: 28 }} />
            <span style={{ fontSize: '0.85rem', color: '#c2185b', fontWeight: 600 }}>
              Subiendo imagen...
            </span>
          </>
        ) : (
          <>
            <Upload size={28} style={{ color: '#c2185b', opacity: 0.85 }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#4a142c' }}>
              Arrastra una imagen o haz clic para subir
            </span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(74, 20, 44, 0.6)' }}>
              PNG, JPG, JPEG, WEBP hasta 5MB
            </span>
          </>
        )}
      </div>

      {/* Preview Area */}
      {urls.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.8rem',
            marginTop: '1rem',
          }}
        >
          {urls.map((url, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                border: '1px solid rgba(248, 187, 208, 0.4)',
                background: '#fff',
                padding: '4px',
                boxShadow: '0 4px 12px rgba(74, 20, 44, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={url}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '999px',
                  background: 'rgba(198, 40, 40, 0.9)',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                  padding: 0,
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
