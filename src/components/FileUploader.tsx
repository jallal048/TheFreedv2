import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, File, Image, Video, Music, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void | Promise<void>;
  onFileRemove: () => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  currentFile?: string | null;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  onFileRemove,
  acceptedTypes = ['image/*', 'video/*', 'audio/*'],
  maxSizeMB = 50,
  currentFile = null,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentFile);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validar tamaño
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `El archivo excede el tamaño máximo de ${maxSizeMB}MB`;
    }

    // Validar tipo
    const fileType = file.type;
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', ''));
      }
      return fileType === type;
    });

    if (!isValidType) {
      return `Tipo de archivo no permitido. Solo se aceptan: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    
    // Validar archivo
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Crear preview local inmediato
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Subir archivo
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simular progreso inicial
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 20;
        });
      }, 300);

      // Llamar al callback del padre que maneja el upload
      await onFileUpload(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
        
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Error al subir el archivo. Por favor, intenta de nuevo.');
      setIsUploading(false);
      setPreview(null);
      setFileInfo(null);
      
      // Limpiar el preview local
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    }
  }, [validateFile, onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    setPreview(null);
    setFileInfo(null);
    setError(null);
    setUploadProgress(0);
    onFileRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFileRemove]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8" />;
    if (type.startsWith('video/')) return <Video className="h-8 w-8" />;
    if (type.startsWith('audio/')) return <Music className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 bg-white'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <Upload className={`mx-auto h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {isDragging ? 'Suelta el archivo aquí' : 'Sube un archivo multimedia'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Arrastra y suelta o haz clic para seleccionar
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Formatos: {acceptedTypes.join(', ')} | Máximo {maxSizeMB}MB
          </p>
        </div>
      ) : (
        <div className="relative border-2 border-gray-200 rounded-xl p-6 bg-white">
          {/* Preview */}
          <div className="flex items-start space-x-4">
            {/* Thumbnail/Icon */}
            <div className="flex-shrink-0">
              {fileInfo?.type.startsWith('image/') ? (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="h-20 w-20 object-cover rounded-lg"
                />
              ) : fileInfo?.type.startsWith('video/') ? (
                <video 
                  src={preview} 
                  className="h-20 w-20 object-cover rounded-lg"
                />
              ) : (
                <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                  {fileInfo && getFileIcon(fileInfo.type)}
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {fileInfo?.name}
              </h4>
              <p className="text-sm text-gray-500">
                {fileInfo && formatFileSize(fileInfo.size)}
              </p>

              {/* Progress Bar */}
              {isUploading && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Subiendo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Message */}
              {!isUploading && uploadProgress === 100 && (
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span>Archivo subido exitosamente</span>
                </div>
              )}
            </div>

            {/* Remove Button */}
            {!isUploading && (
              <button
                onClick={handleRemoveFile}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                disabled={disabled}
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Loading Spinner */}
            {isUploading && (
              <div className="flex-shrink-0">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
