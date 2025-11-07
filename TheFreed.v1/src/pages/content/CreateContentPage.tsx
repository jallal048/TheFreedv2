import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { FileUploader } from '../../components/FileUploader';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  Lock,
  Globe,
  DollarSign,
  Shield
} from 'lucide-react';

interface FormData {
  title: string;
  description: string;
  contentType: 'VIDEO' | 'AUDIO' | 'IMAGE' | 'TEXT';
  category: string;
  tags: string[];
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  isPremium: boolean;
  isFree: boolean;
  price: number;
  isPrivate: boolean;
  isNSFW: boolean;
  ageRestriction: number;
}

const CATEGORIES = [
  'lifestyle', 'fitness', 'cooking', 'music', 'art', 
  'travel', 'tech', 'beauty', 'fashion', 'photography',
  'business', 'education', 'entertainment', 'gaming', 'sports'
];

const CONTENT_TYPES = [
  { value: 'VIDEO', label: 'Video', accept: ['video/*'] },
  { value: 'AUDIO', label: 'Audio', accept: ['audio/*'] },
  { value: 'IMAGE', label: 'Imagen', accept: ['image/*'] },
  { value: 'TEXT', label: 'Texto', accept: [] }
];

export const CreateContentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    contentType: 'IMAGE',
    category: 'lifestyle',
    tags: [],
    mediaUrl: null,
    thumbnailUrl: null,
    isPremium: false,
    isFree: true,
    price: 0,
    isPrivate: false,
    isNSFW: false,
    ageRestriction: 0
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Validar que el usuario sea creador
  if (user?.userType !== 'CREATOR') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">
            Solo los creadores pueden publicar contenido. Por favor, actualiza tu tipo de cuenta.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const handleFileUpload = useCallback((fileUrl: string, fileName: string, fileSize: number, mimeType: string) => {
    setFormData(prev => ({ ...prev, mediaUrl: fileUrl }));
  }, []);

  const handleFileRemove = useCallback(() => {
    setFormData(prev => ({ ...prev, mediaUrl: null }));
  }, []);

  const handleAddTag = useCallback(() => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  }, []);

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'El título es requerido';
    if (formData.title.length < 3) return 'El título debe tener al menos 3 caracteres';
    if (!formData.description.trim()) return 'La descripción es requerida';
    if (formData.description.length < 10) return 'La descripción debe tener al menos 10 caracteres';
    if (formData.contentType !== 'TEXT' && !formData.mediaUrl) return 'Debes subir un archivo multimedia';
    if (formData.isPremium && !formData.isFree && formData.price <= 0) return 'El precio debe ser mayor a 0 para contenido premium';
    if (formData.tags.length === 0) return 'Agrega al menos una etiqueta';
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.createContent({
        ...formData,
        mediaUrl: formData.mediaUrl || undefined,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        price: formData.isPremium && !formData.isFree ? formData.price : undefined,
        ageRestriction: formData.ageRestriction > 0 ? formData.ageRestriction : undefined
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(response.error?.message || 'Error al crear el contenido');
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear el contenido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentContentType = CONTENT_TYPES.find(ct => ct.value === formData.contentType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Volver</span>
            </button>

            <h1 className="text-xl font-bold text-gray-900">Crear Contenido</h1>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>Vista Previa</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Publicar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <p className="text-sm text-green-700">Contenido publicado exitosamente. Redirigiendo...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Título atractivo para tu contenido"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={100}
                  />
                  <p className="mt-1 text-xs text-gray-500">{formData.title.length}/100 caracteres</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe tu contenido en detalle..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-gray-500">{formData.description.length}/500 caracteres</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Contenido <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.contentType}
                      onChange={(e) => handleInputChange('contentType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CONTENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiquetas <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Agrega etiquetas (presiona Enter)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={20}
                    />
                    <button
                      onClick={handleAddTag}
                      disabled={formData.tags.length >= 10}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{formData.tags.length}/10 etiquetas</p>
                </div>
              </div>
            </div>

            {/* File Upload */}
            {formData.contentType !== 'TEXT' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Archivo Multimedia <span className="text-red-500">*</span>
                </h2>
                <FileUploader
                  onFileUpload={handleFileUpload}
                  onFileRemove={handleFileRemove}
                  acceptedTypes={currentContentType?.accept || []}
                  maxSizeMB={50}
                  currentFile={formData.mediaUrl}
                />
              </div>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Privacy Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacidad</span>
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPrivate}
                    onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <Lock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Privado</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNSFW}
                    onChange={(e) => handleInputChange('isNSFW', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <AlertCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Contenido Sensible</span>
                  </div>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restricción de Edad
                  </label>
                  <select
                    value={formData.ageRestriction}
                    onChange={(e) => handleInputChange('ageRestriction', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value={0}>Sin restricción</option>
                    <option value={13}>13+</option>
                    <option value={16}>16+</option>
                    <option value={18}>18+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Monetization Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Monetización</span>
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => handleInputChange('isFree', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Contenido Gratuito</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPremium}
                    onChange={(e) => handleInputChange('isPremium', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Contenido Premium</span>
                </label>

                {formData.isPremium && !formData.isFree && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio (USD)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateContentPage;
