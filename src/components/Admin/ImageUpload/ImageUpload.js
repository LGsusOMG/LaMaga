// src/components/ImageUpload.js
import React, { useState } from 'react';
import { supabase } from '../../../data/supabaseClient';
import './ImageUpload.scss';

const ImageUpload = ({ currentImageUrl, onImageUpload, productId }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (event) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const file = event.target.files[0];
      if (!file) return;

      // Validaciones...
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Por favor selecciona una imagen válida (JPG, PNG, WEBP)');
        setUploading(false);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        setUploading(false);
        return;
      }

      // Preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Generar nombre único
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 9);
      const fileName = `${timestamp}-${random}.${fileExt}`;
      const filePath = `products/${fileName}`;

      console.log('📤 Subiendo archivo:', filePath);

      // Subir a Supabase
      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Error de upload:', uploadError);
        throw uploadError;
      }

      console.log('✅ Archivo subido:', data);
      setUploadProgress(100);

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log('🌐 URL pública generada:', publicUrl);

      // Verificar que la URL funciona
      const testImage = new Image();
      testImage.onload = () => {
        console.log('✅ Imagen accesible en:', publicUrl);
        setPreview(publicUrl); // Actualizar preview con URL real
        onImageUpload(publicUrl, filePath);
        setTimeout(() => {
          setUploadProgress(0);
          setUploading(false);
        }, 500);
      };

      testImage.onerror = () => {
        console.error('❌ La imagen no es accesible. El bucket debe ser público.');
        alert('Error: La imagen se subió pero no es accesible. Verifica que el bucket sea público.');
        setUploading(false);
        setUploadProgress(0);
      };

      testImage.src = publicUrl;

    } catch (error) {
      console.error('❌ Error completo:', error);
      alert('Error al subir la imagen: ' + (error.message || 'Error desconocido'));
      setUploading(false);
      setUploadProgress(0);
      setPreview(currentImageUrl);
    }
  };

  const removeImage = async () => {
    if (window.confirm('¿Estás seguro de eliminar esta imagen?')) {
      setPreview(null);
      onImageUpload(null, null);
    }
  };

  return (
    <div className="image-upload">
      <label className="upload-label">Imagen del producto</label>

      <div className="upload-container">
        {preview ? (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
            <div className="image-overlay">
              <label htmlFor="image-input" className="change-btn">
                <i className="bi bi-camera"></i>
                Cambiar
              </label>
              <button type="button" onClick={removeImage} className="remove-btn">
                <i className="bi bi-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <label htmlFor="image-input" className="upload-area">
            <div className="upload-icon">
              <i className="bi bi-cloud-upload"></i>
            </div>
            <div className="upload-text">
              <p className="main-text">Haz clic para subir una imagen</p>
              <p className="sub-text">PNG, JPG, WEBP hasta 5MB</p>
            </div>
          </label>
        )}

        <input
          id="image-input"
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={uploadImage}
          disabled={uploading}
          style={{ display: 'none' }}
        />

        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="progress-text">Subiendo... {uploadProgress}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;