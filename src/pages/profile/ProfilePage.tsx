// ProfilePage - Componente para ver y editar información personal del usuario
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { User, UserSettings, CreatorProfile } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';
import { apiService } from '../../services/api';
import { mockUsers } from '../../services/mockData';
import PersonalActivityWidget from '../../components/PersonalActivityWidget';
import ProfilePreviewToggle from '../../components/ProfilePreviewToggle';
import BioEditor from '../../components/BioEditor';
import AvatarManager from '../../components/AvatarManager';

// Interfaz para datos del formulario
interface ProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  bio: string;
  website: string;
  displayName: string;
  categories: string[];
  isAdultContent: boolean;
  monthlyPrice: number;
  yearlyPrice: number;
}

// Interfaz para configuraciones de cuenta
interface AccountSettings {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  privacyLevel: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  contentVisibility: 'ALL' | 'SUBSCRIBERS' | 'PREMIUM' | 'PRIVATE';
  darkMode: boolean;
  currency: string;
  twoFactorEnabled: boolean;
}

// Categorías disponibles
const AVAILABLE_CATEGORIES = [
  'lifestyle', 'fitness', 'cooking', 'music', 'art', 'travel', 
  'tech', 'beauty', 'fashion', 'photography', 'business', 'education'
];

// Idiomas disponibles
const LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' }
];

// Zonas horarias disponibles
const TIMEZONES = [
  'America/Mexico_City',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/Madrid',
  'Europe/Paris'
];

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  
  // Estados para el componente
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    bio: '',
    website: '',
    displayName: '',
    categories: [],
    isAdultContent: false,
    monthlyPrice: 0,
    yearlyPrice: 0
  });
  
  // Estado de configuraciones de cuenta
  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    language: 'es',
    timezone: 'America/Mexico_City',
    emailNotifications: true,
    pushNotifications: true,
    privacyLevel: 'PUBLIC',
    contentVisibility: 'ALL',
    darkMode: false,
    currency: 'USD',
    twoFactorEnabled: false
  });

  // Cargar datos del usuario
  const loadUserData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular datos mock para desarrollo
      const mockUser = mockUsers.find(u => u.id === user.id) || user;
      
      // Cargar configuraciones del usuario
      const settingsResponse = await apiService.getUserSettings(user.id);
      
      if (settingsResponse.success) {
        setSettings(settingsResponse.data?.settings || null);
      }
      
      // Cargar datos del formulario
      setFormData({
        firstName: mockUser.firstName || '',
        lastName: mockUser.lastName || '',
        username: mockUser.username || '',
        email: mockUser.email || '',
        bio: mockUser.profile?.bio || '',
        website: mockUser.profile?.website || '',
        displayName: mockUser.profile?.displayName || '',
        categories: mockUser.profile?.categories || [],
        isAdultContent: mockUser.profile?.isAdultContent || false,
        monthlyPrice: mockUser.profile?.monthlyPrice || 0,
        yearlyPrice: mockUser.profile?.yearlyPrice || 0
      });
      
      // Cargar configuraciones de cuenta
      if (settingsResponse.data?.settings) {
        setAccountSettings({
          language: settingsResponse.data.settings.language || 'es',
          timezone: settingsResponse.data.settings.timezone || 'America/Mexico_City',
          emailNotifications: settingsResponse.data.settings.emailNotifications ?? true,
          pushNotifications: settingsResponse.data.settings.pushNotifications ?? true,
          privacyLevel: settingsResponse.data.settings.privacyLevel || 'PUBLIC',
          contentVisibility: settingsResponse.data.settings.contentVisibility || 'ALL',
          darkMode: settingsResponse.data.settings.darkMode ?? false,
          currency: settingsResponse.data.settings.currency || 'USD',
          twoFactorEnabled: settingsResponse.data.settings.twoFactorEnabled ?? false
        });
      }
      
    } catch (err: any) {
      setError('Error al cargar los datos del perfil');
      console.error('Error loading user data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  // Validaciones del formulario
  const validateForm = useMemo(() => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'El nombre es obligatorio';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Los apellidos son obligatorios';
    }
    
    if (!formData.username.trim()) {
      errors.username = 'El nombre de usuario es obligatorio';
    } else if (formData.username.length < 3) {
      errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }
    
    if (formData.monthlyPrice < 0) {
      errors.monthlyPrice = 'El precio mensual no puede ser negativo';
    }
    
    if (formData.yearlyPrice < 0) {
      errors.yearlyPrice = 'El precio anual no puede ser negativo';
    }
    
    return errors;
  }, [formData]);

  const isFormValid = useMemo(() => {
    return Object.keys(validateForm).length === 0;
  }, [validateForm]);

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar cambio de categorías
  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  // Manejar cambio de imagen de perfil
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar perfil
  const handleSaveProfile = async () => {
    if (!user || !isFormValid) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Simular subida de avatar
      if (avatarFile) {
        // En una implementación real, aquí se subiría el archivo
      }
      
      // Actualizar datos del usuario
      const updateData: Partial<User & { profile: Partial<CreatorProfile> }> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        profile: {
          bio: formData.bio,
          website: formData.website,
          displayName: formData.displayName,
          categories: formData.categories,
          isAdultContent: formData.isAdultContent,
          monthlyPrice: formData.monthlyPrice,
          yearlyPrice: formData.yearlyPrice
        }
      };
      
      const response = await apiService.updateUser(user.id, updateData);
      
      if (response.success) {
        setSuccess('Perfil actualizado exitosamente');
        setIsEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        
        // Refrescar datos del usuario
        await refreshUser();
      } else {
        setError(response.error?.message || 'Error al actualizar el perfil');
      }
      
    } catch (err: any) {
      setError('Error al guardar el perfil');
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Guardar configuraciones de cuenta
  const handleSaveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await apiService.updateUserSettings(user.id, {
        ...accountSettings,
        userId: user.id
      } as any);
      
      if (response.success) {
        setSuccess('Configuraciones guardadas exitosamente');
      } else {
        setError(response.error?.message || 'Error al guardar las configuraciones');
      }
      
    } catch (err: any) {
      setError('Error al guardar las configuraciones');
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Verificar si el usuario es creador
  const isCreator = user?.userType === 'CREATOR';

  // Manejar cambio de configuraciones
  const handleSettingsChange = (field: keyof AccountSettings, value: any) => {
    setAccountSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso requerido
          </h1>
          <p className="text-gray-600">
            Debes iniciar sesión para ver tu perfil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mi Perfil
          </h1>
          <p className="text-gray-600">
            Gestiona tu información personal y configuraciones de cuenta
          </p>
        </div>

        {/* Alertas */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
            <TabsTrigger value="account">Cuenta</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          </TabsList>

          {/* Tab de Perfil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>
                      Actualiza tu información básica y de creador
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                      >
                        Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setAvatarFile(null);
                            setAvatarPreview(null);
                            loadUserData();
                          }}
                          disabled={isSaving}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={!isFormValid || isSaving}
                        >
                          {isSaving ? 'Guardando...' : 'Guardar'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {avatarPreview || user.profile?.avatarUrl ? (
                        <img
                          src={avatarPreview || user.profile?.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                          {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </label>
                    )}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-gray-600">@{user.username}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="capitalize">
                        {user.userType.toLowerCase()}
                      </Badge>
                      {user.isEmailVerified && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          ✓ Verificado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gestor Avanzado de Avatares */}
                <AvatarManager
                  currentAvatar={user.profile?.avatarUrl}
                  onAvatarChange={(avatarUrl, avatarData) => {
                    // Actualizar el avatar del usuario
                    if (avatarData) {
                    }
                    // Actualizar localmente para mostrar el cambio inmediatamente
                    setFormData(prev => ({ ...prev, avatarUrl }));
                  }}
                />

                {/* Formulario */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Tu nombre"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.firstName}</p>
                    )}
                    {isEditing && validateForm.firstName && (
                      <p className="text-sm text-red-600 mt-1">{validateForm.firstName}</p>
                    )}
                  </div>

                  {/* Apellidos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Tus apellidos"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.lastName}</p>
                    )}
                    {isEditing && validateForm.lastName && (
                      <p className="text-sm text-red-600 mt-1">{validateForm.lastName}</p>
                    )}
                  </div>

                  {/* Nombre de usuario */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de usuario
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="nombre_usuario"
                      />
                    ) : (
                      <p className="text-gray-900">@{formData.username}</p>
                    )}
                    {isEditing && validateForm.username && (
                      <p className="text-sm text-red-600 mt-1">{validateForm.username}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="tu@email.com"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.email}</p>
                    )}
                    {isEditing && validateForm.email && (
                      <p className="text-sm text-red-600 mt-1">{validateForm.email}</p>
                    )}
                  </div>
                </div>

                {/* Bio con Editor Rico */}
                <BioEditor
                  value={formData.bio}
                  onChange={(value) => handleInputChange('bio', value)}
                  placeholder="Cuéntanos sobre ti..."
                  maxLength={500}
                />

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sitio web
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://tu-sitio.com"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {formData.website ? (
                        <a
                          href={formData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {formData.website}
                        </a>
                      ) : (
                        'No especificado'
                      )}
                    </p>
                  )}
                </div>

                {/* Campos específicos para creadores */}
                {isCreator && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-lg font-semibold">Información de Creador</h4>
                    
                    {/* Nombre para mostrar */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre para mostrar
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => handleInputChange('displayName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Como quieres que te vean"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.displayName || 'No especificado'}</p>
                      )}
                    </div>

                    {/* Categorías */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categorías
                      </label>
                      {isEditing ? (
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_CATEGORIES.map((category) => (
                            <Badge
                              key={category}
                              variant={formData.categories.includes(category) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => handleCategoryToggle(category)}
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {formData.categories.length > 0 ? (
                            formData.categories.map((category) => (
                              <Badge key={category} variant="secondary">
                                {category}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">No hay categorías seleccionadas</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Precios */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio mensual (USD)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.monthlyPrice}
                            onChange={(e) => handleInputChange('monthlyPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">${formData.monthlyPrice || 0}</p>
                        )}
                        {isEditing && validateForm.monthlyPrice && (
                          <p className="text-sm text-red-600 mt-1">{validateForm.monthlyPrice}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio anual (USD)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.yearlyPrice}
                            onChange={(e) => handleInputChange('yearlyPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">${formData.yearlyPrice || 0}</p>
                        )}
                        {isEditing && validateForm.yearlyPrice && (
                          <p className="text-sm text-red-600 mt-1">{validateForm.yearlyPrice}</p>
                        )}
                      </div>
                    </div>

                    {/* Contenido adulto */}
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.isAdultContent}
                          onChange={(e) => handleInputChange('isAdultContent', e.target.checked)}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">
                          Contenido para adultos (18+)
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Actividad Personal */}
          <TabsContent value="activity" className="space-y-6">
            <PersonalActivityWidget 
              userId={user?.id || ''} 
              className="w-full"
            />
          </TabsContent>

          {/* Tab de Vista Previa */}
          <TabsContent value="preview" className="space-y-6">
            <ProfilePreviewToggle 
              user={user}
              className="w-full"
            />
          </TabsContent>

          {/* Tab de Cuenta */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Configuraciones de Cuenta</CardTitle>
                    <CardDescription>
                      Personaliza tu experiencia en la plataforma
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Idioma */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma
                  </label>
                  <select
                    value={accountSettings.language}
                    onChange={(e) => handleSettingsChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zona horaria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona horaria
                  </label>
                  <select
                    value={accountSettings.timezone}
                    onChange={(e) => handleSettingsChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Moneda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda preferida
                  </label>
                  <select
                    value={accountSettings.currency}
                    onChange={(e) => handleSettingsChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="USD">USD - Dólar estadounidense</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="MXN">MXN - Peso mexicano</option>
                    <option value="ARS">ARS - Peso argentino</option>
                  </select>
                </div>

                {/* Nivel de privacidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de privacidad
                  </label>
                  <select
                    value={accountSettings.privacyLevel}
                    onChange={(e) => handleSettingsChange('privacyLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="PUBLIC">Público - Todos pueden ver tu perfil</option>
                    <option value="FRIENDS">Amigos - Solo amigos pueden ver</option>
                    <option value="PRIVATE">Privado - Solo tú puedes ver</option>
                  </select>
                </div>

                {/* Visibilidad del contenido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibilidad del contenido
                  </label>
                  <select
                    value={accountSettings.contentVisibility}
                    onChange={(e) => handleSettingsChange('contentVisibility', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="ALL">Todo el mundo</option>
                    <option value="SUBSCRIBERS">Solo suscriptores</option>
                    <option value="PREMIUM">Solo premium</option>
                    <option value="PRIVATE">Privado</option>
                  </select>
                </div>

                {/* Notificaciones */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Notificaciones</h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Notificaciones por email</span>
                      <input
                        type="checkbox"
                        checked={accountSettings.emailNotifications}
                        onChange={(e) => handleSettingsChange('emailNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Notificaciones push</span>
                      <input
                        type="checkbox"
                        checked={accountSettings.pushNotifications}
                        onChange={(e) => handleSettingsChange('pushNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </label>
                  </div>
                </div>

                {/* Apariencia */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Apariencia</h4>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Modo oscuro</span>
                    <input
                      type="checkbox"
                      checked={accountSettings.darkMode}
                      onChange={(e) => handleSettingsChange('darkMode', e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </label>
                </div>

                {/* Seguridad */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Seguridad</h4>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-700">Autenticación de dos factores</span>
                      <p className="text-xs text-gray-500">Añade una capa extra de seguridad a tu cuenta</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={accountSettings.twoFactorEnabled}
                      onChange={(e) => handleSettingsChange('twoFactorEnabled', e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Estadísticas */}
          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de la Cuenta</CardTitle>
                <CardDescription>
                  Resumen de tu actividad en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Estadísticas básicas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-600">Miembro desde</h3>
                    <p className="text-2xl font-bold text-blue-900">
                      {new Date(user.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-600">Última actividad</h3>
                    <p className="text-2xl font-bold text-green-900">
                      {new Date(user.lastActive).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-600">Estado de la cuenta</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <p className="text-lg font-bold text-purple-900">
                        {user.isActive ? 'Activa' : 'Inactiva'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estadísticas del creador */}
                {isCreator && user.profile && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Estadísticas de Creador</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Seguidores</span>
                          <span className="text-sm font-medium">{user.profile.followerCount.toLocaleString()}</span>
                        </div>
                        <Progress value={Math.min(100, (user.profile.followerCount / 1000) * 100)} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total de vistas</span>
                          <span className="text-sm font-medium">{user.profile.totalViews.toLocaleString()}</span>
                        </div>
                        <Progress value={Math.min(100, (user.profile.totalViews / 10000) * 100)} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Contenido publicado</span>
                          <span className="text-sm font-medium">{user.profile.totalContent}</span>
                        </div>
                        <Progress value={Math.min(100, (user.profile.totalContent / 50) * 100)} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Ganancias totales</span>
                          <span className="text-sm font-medium">${user.profile.totalEarnings.toLocaleString()}</span>
                        </div>
                        <Progress value={Math.min(100, (user.profile.totalEarnings / 10000) * 100)} className="h-2" />
                      </div>
                    </div>

                    {/* Verificación */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="font-medium">Estado de verificación</h5>
                        <p className="text-sm text-gray-600">
                          {user.profile.isVerified ? 'Cuenta verificada' : 'Cuenta no verificada'}
                        </p>
                      </div>
                      <Badge variant={user.profile.isVerified ? "default" : "secondary"}>
                        {user.profile.verificationLevel}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Configuraciones de cuenta */}
                {settings && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Configuraciones Actuales</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Idioma</span>
                          <span className="text-sm font-medium">
                            {LANGUAGES.find(l => l.code === settings.language)?.name || settings.language}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Notificaciones email</span>
                          <span className="text-sm font-medium">
                            {settings.emailNotifications ? 'Activadas' : 'Desactivadas'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Notificaciones push</span>
                          <span className="text-sm font-medium">
                            {settings.pushNotifications ? 'Activadas' : 'Desactivadas'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Autenticación 2FA</span>
                          <span className="text-sm font-medium">
                            {settings.twoFactorEnabled ? 'Activada' : 'Desactivada'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;