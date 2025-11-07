// OnboardingFlow - Wizard de setup inicial para nuevos usuarios
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { 
  User, 
  Camera, 
  Settings, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Shield,
  Target,
  Heart,
  Upload
} from 'lucide-react';

interface OnboardingData {
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  categories: string[];
  avatar: string | null;
  privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  emailNotifications: boolean;
  goals: string[];
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
  className?: string;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onSkip,
  className = ""
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    categories: [],
    avatar: null,
    privacy: 'PUBLIC',
    emailNotifications: true,
    goals: []
  });

  const totalSteps = 5;

  // Datos mock para desarrollo
  const availableCategories = [
    'lifestyle', 'fitness', 'cooking', 'music', 'art', 'travel', 
    'tech', 'beauty', 'fashion', 'photography', 'business', 'education',
    'gaming', 'science', 'health', 'finance', 'parenting', 'sports'
  ];

  const availableGoals = [
    'Conectar con otros usuarios',
    'Compartir mi contenido',
    'Encontrar inspiración',
    'Aprender cosas nuevas',
    'Crear una audiencia',
    'Monetizar mi contenido',
    'Hacer amigos',
    'Encontrar colaboración'
  ];

  const steps = [
    { id: 1, title: 'Bienvenida', icon: Sparkles },
    { id: 2, title: 'Información Personal', icon: User },
    { id: 3, title: 'Foto de Perfil', icon: Camera },
    { id: 4, title: 'Intereses y Configuración', icon: Settings },
    { id: 5, title: '¡Listo para empezar!', icon: CheckCircle }
  ];

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(data);
  };

  // Renderizar cada step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¡Bienvenido a TheFreed! 🎉
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Te ayudaremos a configurar tu perfil en pocos pasos
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">¿Qué harás en TheFreed?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Comparte contenido único y conecta con otros</li>
                  <li>• Descubre contenido que te inspire</li>
                  <li>• Monetiza tu creatividad si eres creador</li>
                  <li>• Construye una comunidad alrededor de tus intereses</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Cuéntanos sobre ti
              </h2>
              <p className="text-gray-600">
                Esta información aparecerá en tu perfil público
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <Input
                  value={data.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos *
                </label>
                <Input
                  value={data.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Tus apellidos"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario *
              </label>
              <Input
                value={data.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="tu_nombre_usuario"
              />
              <p className="text-xs text-gray-500 mt-1">
                Este será tu identificador único en la plataforma
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biografía
              </label>
              <Textarea
                value={data.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Cuéntanos sobre ti, tus intereses, lo que haces..."
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {data.bio.length}/200 caracteres
              </p>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Privacidad:</strong> Toda esta información será pública por defecto. 
                Puedes cambiar la configuración de privacidad en cualquier momento desde tu perfil.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Camera className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tu foto de perfil
              </h2>
              <p className="text-gray-600">
                Una buena foto te ayuda a conectar con otros usuarios
              </p>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-dashed border-gray-300">
                  {data.avatar ? (
                    <img
                      src={data.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Camera className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <Button
                  className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                  onClick={() => {
                    // Simular selección de imagen
                    const mockAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username || 'user'}`;
                    handleInputChange('avatar', mockAvatar);
                  }}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-center">
              <Button variant="outline" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Seleccionar imagen
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                O puedes continuar sin foto por ahora
              </p>
            </div>

            <Alert>
              <Heart className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Tip:</strong> Las fotos de perfil reales generan 3x más conexiones. 
                Puedes cambiarla o agregar más avatares después.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Settings className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Personaliza tu experiencia
              </h2>
              <p className="text-gray-600">
                Ayúdanos a entender mejor lo que te interesa
              </p>
            </div>

            {/* Intereses */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Target className="h-5 w-5" />
                ¿Qué te interesa? (selecciona al menos 3)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={data.categories.includes(category) ? "default" : "outline"}
                    className="cursor-pointer text-center justify-center py-2"
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {data.categories.length} categorías seleccionadas
              </p>
            </div>

            {/* Objetivos */}
            <div>
              <h3 className="text-lg font-medium mb-3">¿Cuáles son tus objetivos?</h3>
              <div className="space-y-2">
                {availableGoals.map((goal) => (
                  <label key={goal} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.goals.includes(goal)}
                      onChange={() => handleGoalToggle(goal)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{goal}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Configuraciones */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Configuraciones iniciales</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibilidad del perfil
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'PUBLIC', label: 'Público - Todos pueden ver tu perfil' },
                    { value: 'FRIENDS', label: 'Amigos - Solo amigos pueden ver' },
                    { value: 'PRIVATE', label: 'Privado - Solo tú puedes ver' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="privacy"
                        value={option.value}
                        checked={data.privacy === option.value}
                        onChange={(e) => handleInputChange('privacy', e.target.value)}
                        className="border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={data.emailNotifications}
                  onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  Recibir notificaciones por email
                </span>
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¡Todo listo! 🚀
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Tu perfil está configurado y ya puedes empezar a disfrutar de TheFreed
              </p>
            </div>

            {/* Resumen de configuración */}
            <div className="bg-gray-50 p-6 rounded-lg text-left">
              <h3 className="font-medium text-gray-900 mb-4">Tu configuración:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium">{data.firstName} {data.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Usuario:</span>
                  <span className="font-medium">@{data.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Intereses:</span>
                  <span className="font-medium">{data.categories.length} categorías</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Perfil:</span>
                  <span className="font-medium capitalize">{data.privacy.toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Notificaciones:</span>
                  <span className="font-medium">{data.emailNotifications ? 'Activadas' : 'Desactivadas'}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Próximos pasos sugeridos:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Explora el contenido recomendado para ti</li>
                <li>• Conecta con otros usuarios que compartan tus intereses</li>
                <li>• Si eres creador, configura tu monetización</li>
                <li>• Personaliza tu feed de discovery</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Configuración Inicial
          </CardTitle>
          <Badge variant="secondary">
            Paso {currentStep} de {totalSteps}
          </Badge>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Steps indicator */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isActive ? 'bg-primary text-white' : 
                    isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className={`ml-2 text-xs ${isActive ? 'text-primary font-medium' : 'text-gray-500'}`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-300 mx-4" />
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {onSkip && currentStep === 1 && (
              <Button variant="ghost" onClick={onSkip}>
                Saltar por ahora
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button 
                onClick={nextStep}
                disabled={
                  (currentStep === 1) || 
                  (currentStep === 2 && (!data.firstName || !data.lastName || !data.username)) ||
                  (currentStep === 4 && data.categories.length < 3)
                }
              >
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Completar Configuración
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingFlow;
