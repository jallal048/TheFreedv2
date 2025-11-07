// ProfilePreviewToggle - Toggle para alternar entre vista personal y pública del perfil
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Eye, User, Settings, Shield, Share, MessageCircle, Heart, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContextSupabase';

interface PublicProfileViewProps {
  user: any;
  isPublicView: boolean;
}

const PublicProfilePreview: React.FC<PublicProfileViewProps> = ({ 
  user, 
  isPublicView 
}) => {
  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay datos de usuario para mostrar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header del perfil público */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
          {user.profile?.avatarUrl ? (
            <img
              src={user.profile.avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
              {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {user.profile?.displayName || `${user.firstName} ${user.lastName}`}
            </h2>
            {user.isEmailVerified && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                ✓ Verificado
              </Badge>
            )}
            {user.profile?.isVerified && (
              <Badge className="bg-blue-500 text-white">
                ⭐ Verificado
              </Badge>
            )}
          </div>
          
          <p className="text-gray-600 mb-2">@{user.username}</p>
          
          {user.profile?.bio && (
            <p className="text-gray-700 text-sm mb-3 max-w-md">
              {user.profile.bio}
            </p>
          )}
          
          {user.profile?.website && (
            <a
              href={user.profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm flex items-center gap-1 justify-center sm:justify-start"
            >
              🌐 {user.profile.website}
            </a>
          )}
        </div>
      </div>

      {/* Estadísticas públicas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {user.profile?.totalContent || 0}
          </p>
          <p className="text-sm text-gray-600">Posts</p>
        </div>
        
        <div className="bg-white border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {user.profile?.followerCount || 0}
          </p>
          <p className="text-sm text-gray-600">Seguidores</p>
        </div>
        
        <div className="bg-white border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            0 {/* Following count would come from follow relationships */}
          </p>
          <p className="text-sm text-gray-600">Siguiendo</p>
        </div>
        
        <div className="bg-white border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {(user.profile?.totalViews || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Vistas</p>
        </div>
      </div>

      {/* Categorías públicas */}
      {user.profile?.categories && user.profile.categories.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Categorías</h4>
          <div className="flex flex-wrap gap-2">
            {user.profile.categories.map((category: string) => (
              <Badge key={category} variant="secondary" className="capitalize">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Grid de contenido público simulado */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Contenido Público
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-1"></div>
                <p className="text-xs text-gray-500">Post {item}</p>
                <div className="flex items-center gap-2 justify-center mt-1">
                  <Heart className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {Math.floor(Math.random() * 50) + 5}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de acción pública */}
      <div className="flex gap-3 pt-4 border-t">
        <Button className="flex-1" variant="default">
          <MessageCircle className="h-4 w-4 mr-2" />
          Seguir
        </Button>
        <Button className="flex-1" variant="outline">
          <MessageCircle className="h-4 w-4 mr-2" />
          Mensaje
        </Button>
        <Button size="sm" variant="ghost">
          <Share className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface ProfilePreviewToggleProps {
  user: any;
  className?: string;
}

const ProfilePreviewToggle: React.FC<ProfilePreviewToggleProps> = ({ 
  user, 
  className = "" 
}) => {
  const [isPublicView, setIsPublicView] = useState(false);
  const { user: currentUser } = useAuth();

  const handleToggle = () => {
    setIsPublicView(!isPublicView);
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vista Previa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No hay datos de usuario para mostrar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Vista Previa del Perfil
          </CardTitle>
          
          <Button
            onClick={handleToggle}
            variant={isPublicView ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
          >
            {isPublicView ? (
              <>
                <User className="h-4 w-4" />
                Vista Personal
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Vista Pública
              </>
            )}
          </Button>
        </div>
        
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {isPublicView 
              ? "Esta es la vista que otros usuarios verán de tu perfil público." 
              : "Esta es tu vista personal donde puedes ver y editar tu información."}
          </AlertDescription>
        </Alert>
      </CardHeader>
      
      <CardContent>
        {isPublicView ? (
          <PublicProfilePreview user={user} isPublicView={true} />
        ) : (
          <div className="space-y-4">
            {/* Vista personal destacada */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Settings className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Vista Personal</h3>
                  <p className="text-sm text-gray-600">Esta es tu información privada</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo de cuenta:</span>
                  <Badge variant="secondary" className="capitalize">
                    {user.userType?.toLowerCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-gray-900">
                      {user.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verificación email:</span>
                  <Badge variant={user.isEmailVerified ? "default" : "secondary"}>
                    {user.isEmailVerified ? "Verificado" : "No verificado"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Información pública destacada */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">Información que ven otros</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-600">Nombre visible:</p>
                  <p className="font-medium">
                    {user.profile?.displayName || `${user.firstName} ${user.lastName}`}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">Seguidores:</p>
                  <p className="font-medium">{user.profile?.followerCount || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">Biografía:</p>
                  <p className="font-medium text-gray-500">
                    {user.profile?.bio ? `${user.profile.bio.substring(0, 50)}...` : 'Sin biografía'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">Sitio web:</p>
                  <p className="font-medium text-gray-500">
                    {user.profile?.website ? 'Visible' : 'No especificado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Consejos para mejorar perfil */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm text-blue-900 mb-2">💡 Consejos para tu perfil público</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                {!user.profile?.displayName && (
                  <li>• Agrega un nombre para mostrar más atractivo</li>
                )}
                {!user.profile?.bio && (
                  <li>• Escribe una biografía que te describa</li>
                )}
                {user.profile?.categories?.length === 0 && (
                  <li>• Selecciona categorías para que te encuentren más fácilmente</li>
                )}
                {user.profile?.website && (
                  <li>• Tu sitio web está visible para todos los visitantes</li>
                )}
                {user.profile?.bio && user.profile?.displayName && user.profile?.categories?.length > 0 && (
                  <li>• ¡Tu perfil público se ve completo!</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfilePreviewToggle;
