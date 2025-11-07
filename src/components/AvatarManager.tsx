// AvatarManager - Sistema avanzado de gestión de múltiples avatares
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Camera, 
  Upload, 
  Image, 
  X, 
  Check, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Crop,
  Filter,
  Plus,
  Star,
  Trash2,
  Download
} from 'lucide-react';

interface Avatar {
  id: string;
  url: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  size: number; // en bytes
  dimensions: { width: number; height: number };
  filter?: string;
}

interface AvatarManagerProps {
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string, avatarData?: any) => void;
  className?: string;
}

const AvatarManager: React.FC<AvatarManagerProps> = ({
  currentAvatar,
  onAvatarChange,
  className = ""
}) => {
  const [avatars, setAvatars] = useState<Avatar[]>([
    {
      id: '1',
      url: currentAvatar || '',
      name: 'Avatar actual',
      isDefault: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      size: 0,
      dimensions: { width: 0, height: 0 }
    }
  ]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropData, setCropData] = useState({ x: 0, y: 0, width: 0, height: 0, zoom: 1 });
  const [appliedFilter, setAppliedFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'edit'>('gallery');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Filtros disponibles
  const availableFilters = useMemo(() => [
    { id: 'none', name: 'Sin filtro', css: 'none' },
    { id: 'grayscale', name: 'Blanco y negro', css: 'grayscale(100%)' },
    { id: 'sepia', name: 'Sepia', css: 'sepia(100%)' },
    { id: 'contrast', name: 'Alto contraste', css: 'contrast(150%)' },
    { id: 'brightness', name: 'Brillante', css: 'brightness(120%)' },
    { id: 'vintage', name: 'Vintage', css: 'sepia(50%) contrast(120%) brightness(90%)' },
    { id: 'cool', name: 'Frío', css: 'hue-rotate(180deg) saturate(120%)' },
    { id: 'warm', name: 'Cálido', css: 'hue-rotate(30deg) saturate(110%)' }
  ], []);

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      setActiveTab('edit');
      setShowCropper(true);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Aplicar filtro
  const applyFilter = (filterId: string) => {
    setAppliedFilter(filterId === 'none' ? null : filterId);
  };

  // Guardar avatar editado
  const saveEditedAvatar = async () => {
    if (!previewUrl || !canvasRef.current) return;

    setIsUploading(true);

    try {
      // Simular procesamiento de imagen
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAvatar: Avatar = {
        id: Date.now().toString(),
        url: previewUrl,
        name: `Avatar ${new Date().toLocaleDateString()}`,
        isDefault: false,
        isActive: false,
        createdAt: new Date().toISOString(),
        size: selectedFile?.size || 0,
        dimensions: { width: 400, height: 400 },
        filter: appliedFilter || undefined
      };

      setAvatars(prev => [...prev, newAvatar]);
      setActiveTab('gallery');
      setShowCropper(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setAppliedFilter(null);
      
      onAvatarChange(previewUrl, newAvatar);
    } catch (error) {
      console.error('Error saving avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Seleccionar avatar
  const selectAvatar = (avatar: Avatar) => {
    setAvatars(prev => prev.map(a => ({
      ...a,
      isActive: a.id === avatar.id
    })));
    onAvatarChange(avatar.url, avatar);
  };

  // Eliminar avatar
  const deleteAvatar = (avatarId: string) => {
    if (avatars.length <= 1) {
      alert('No puedes eliminar el último avatar');
      return;
    }

    setAvatars(prev => {
      const filtered = prev.filter(a => a.id !== avatarId);
      const activeAvatar = filtered.find(a => a.id === avatarId) || filtered[0];
      if (activeAvatar) {
        onAvatarChange(activeAvatar.url, activeAvatar);
      }
      return filtered;
    });
  };

  // Establecer como default
  const setAsDefault = (avatar: Avatar) => {
    setAvatars(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === avatar.id
    })));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Gestión de Avatares
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === 'gallery' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('gallery')}
            className="rounded-b-none"
          >
            <Image className="h-4 w-4 mr-2" />
            Galería
          </Button>
          <Button
            variant={activeTab === 'upload' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('upload')}
            className="rounded-b-none"
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir
          </Button>
          {previewUrl && (
            <Button
              variant={activeTab === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('edit')}
              className="rounded-b-none"
            >
              <Crop className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>

        {/* Tab: Galería */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    avatar.isActive ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => selectAvatar(avatar)}
                >
                  <div className="aspect-square bg-gray-100">
                    {avatar.url ? (
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                        style={{
                          filter: avatar.filter ? availableFilters.find(f => f.id === avatar.filter)?.css : 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Camera className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  
                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      {avatar.isActive ? (
                        <Badge className="bg-primary">Activo</Badge>
                      ) : (
                        <Button size="sm" variant="secondary">
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {avatar.isDefault && (
                        <Badge variant="outline" className="bg-white">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Acciones en hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      {!avatar.isDefault && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAsDefault(avatar);
                          }}
                          title="Establecer como predeterminado"
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                      )}
                      {avatars.length > 1 && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAvatar(avatar.id);
                          }}
                          title="Eliminar"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setActiveTab('upload')}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar nuevo avatar
            </Button>
          </div>
        )}

        {/* Tab: Subir */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Subir nueva imagen
              </h3>
              <p className="text-gray-600 mb-4">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <Button variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Seleccionar imagen
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG hasta 5MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Alert>
              <Image className="h-4 w-4" />
              <AlertDescription>
                <strong>Consejos:</strong> Usa una imagen cuadrada para mejores resultados. 
                Las imágenes se procesarán automáticamente para optimizar el tamaño.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Tab: Editar */}
        {activeTab === 'edit' && previewUrl && (
          <div className="space-y-4">
            {/* Editor de imagen */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="w-full max-w-sm mx-auto block"
                style={{
                  filter: appliedFilter ? availableFilters.find(f => f.id === appliedFilter)?.css : 'none'
                }}
              />
              
              {/* Controles de imagen */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button size="sm" variant="secondary">
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {availableFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => applyFilter(filter.id)}
                    className={`p-2 text-xs border rounded-lg transition-colors ${
                      appliedFilter === filter.id || (!appliedFilter && filter.id === 'none')
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={saveEditedAvatar}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  'Guardando...'
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Guardar Avatar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setActiveTab('gallery');
                  setPreviewUrl(null);
                  setSelectedFile(null);
                  setAppliedFilter(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2">📊 Estadísticas</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total avatares</p>
              <p className="font-medium">{avatars.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Tamaño promedio</p>
              <p className="font-medium">
                {avatars.length > 0 
                  ? `${Math.round(avatars.reduce((acc, a) => acc + a.size, 0) / avatars.length / 1024)}KB`
                  : '0KB'
                }
              </p>
            </div>
            <div>
              <p className="text-gray-600">Activo</p>
              <p className="font-medium">
                {avatars.find(a => a.isActive)?.name || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarManager;
