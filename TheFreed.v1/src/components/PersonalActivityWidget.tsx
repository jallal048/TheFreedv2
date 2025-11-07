// PersonalActivityWidget - Widget dashboard con métricas personales avanzadas
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { TrendingUp, MessageCircle, Heart, Clock, Calendar, Target, Award, Flame, Activity } from 'lucide-react';

interface ActivityData {
  postsCreated: number;
  postsLiked: number;
  commentsMade: number;
  timeOnPlatform: number; // en días
  currentStreak: number; // días de actividad consecutiva
  longestStreak: number;
  viewsReceived: number;
  followers: number;
  following: number;
  engagementRate: number; // porcentaje
  lastActive: string;
  accountAge: number; // en días
}

interface PersonalActivityWidgetProps {
  userId: string;
  className?: string;
}

const PersonalActivityWidget: React.FC<PersonalActivityWidgetProps> = ({ 
  userId, 
  className = "" 
}) => {
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos de actividad (simulado con API call)
  useEffect(() => {
    const loadActivityData = async () => {
      setLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Datos mock para desarrollo
      const mockData: ActivityData = {
        postsCreated: 47,
        postsLiked: 234,
        commentsMade: 89,
        timeOnPlatform: 156, // días
        currentStreak: 12, // días
        longestStreak: 45,
        viewsReceived: 1280,
        followers: 156,
        following: 89,
        engagementRate: 7.8,
        lastActive: new Date().toISOString(),
        accountAge: 180 // días
      };
      
      setActivityData(mockData);
      setLoading(false);
    };

    if (userId) {
      loadActivityData();
    }
  }, [userId]);

  // Formatear tiempo en plataforma
  const formattedTime = useMemo(() => {
    if (!activityData) return '';
    const { timeOnPlatform } = activityData;
    
    if (timeOnPlatform < 30) {
      return `${timeOnPlatform} días`;
    } else if (timeOnPlatform < 365) {
      const months = Math.floor(timeOnPlatform / 30);
      const days = timeOnPlatform % 30;
      return `${months} mes${months > 1 ? 'es' : ''}${days > 0 ? ` ${days} días` : ''}`;
    } else {
      const years = Math.floor(timeOnPlatform / 365);
      const remainingDays = timeOnPlatform % 365;
      return `${years} año${years > 1 ? 's' : ''}${remainingDays > 0 ? ` ${remainingDays} días` : ''}`;
    }
  }, [activityData]);

  // Determinar nivel de racha
  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { level: 'Legendario', color: 'bg-purple-500', icon: Award };
    if (streak >= 14) return { level: 'Excelente', color: 'bg-blue-500', icon: TrendingUp };
    if (streak >= 7) return { level: 'Bueno', color: 'bg-green-500', icon: Target };
    if (streak >= 3) return { level: 'Activo', color: 'bg-yellow-500', icon: Flame };
    return { level: 'Iniciando', color: 'bg-gray-500', icon: Clock };
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activityData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No se pudieron cargar los datos de actividad</p>
        </CardContent>
      </Card>
    );
  }

  const streakInfo = getStreakLevel(activityData.currentStreak);
  const StreakIcon = streakInfo.icon;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Actividad Personal
          <Badge variant="secondary" className="ml-auto">
            Últimos {activityData.timeOnPlatform} días
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Racha de actividad */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <StreakIcon className="h-4 w-4" />
              Racha de Actividad
            </h4>
            <Badge className={`${streakInfo.color} text-white`}>
              {streakInfo.level}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-gray-600">Actual</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {activityData.currentStreak}
              </p>
              <p className="text-xs text-gray-500">días consecutivos</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Mejor</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {activityData.longestStreak}
              </p>
              <p className="text-xs text-gray-500">récord personal</p>
            </div>
          </div>
          
          {/* Progreso hacia próximo nivel */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progreso hacia {activityData.currentStreak >= 7 ? 'Legendario' : activityData.currentStreak >= 3 ? 'Excelente' : 'Bueno'}</span>
              <span className="text-gray-900 font-medium">
                {activityData.currentStreak >= 7 ? 0 : activityData.currentStreak >= 3 ? 7 - activityData.currentStreak : 3 - activityData.currentStreak} días
              </span>
            </div>
            <Progress 
              value={Math.min(100, (activityData.currentStreak / (activityData.currentStreak >= 7 ? 30 : activityData.currentStreak >= 3 ? 7 : 3)) * 100)} 
              className="h-2"
            />
          </div>
        </div>

        {/* Métricas de actividad */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Actividad de Contenido
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Posts Creados</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {activityData.postsCreated}
              </p>
              <Progress value={(activityData.postsCreated / 50) * 100} className="h-1" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Posts Gustados</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {activityData.postsLiked}
              </p>
              <Progress value={Math.min(100, (activityData.postsLiked / 300) * 100)} className="h-1" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Comentarios</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {activityData.commentsMade}
              </p>
              <Progress value={Math.min(100, (activityData.commentsMade / 100) * 100)} className="h-1" />
            </div>
          </div>
        </div>

        {/* Engagement y alcance */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Engagement
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-pink-50 to-red-50 p-3 rounded-lg text-center">
              <Heart className="h-4 w-4 text-pink-500 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Vistas Recibidas</p>
              <p className="text-lg font-bold text-gray-900">
                {activityData.viewsReceived.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg text-center">
              <TrendingUp className="h-4 w-4 text-blue-500 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Seguidores</p>
              <p className="text-lg font-bold text-gray-900">
                {activityData.followers}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg text-center">
              <MessageCircle className="h-4 w-4 text-green-500 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Siguiendo</p>
              <p className="text-lg font-bold text-gray-900">
                {activityData.following}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-3 rounded-lg text-center">
              <Target className="h-4 w-4 text-purple-500 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Engagement</p>
              <p className="text-lg font-bold text-gray-900">
                {activityData.engagementRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Tiempo en plataforma */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Tiempo en la Plataforma</h4>
                <p className="text-sm text-gray-600">
                  Miembro desde {new Date(Date.now() - (activityData.accountAge * 24 * 60 * 60 * 1000)).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formattedTime}
              </p>
              <p className="text-sm text-gray-600">de actividad total</p>
            </div>
          </div>
        </div>

        {/* Consejos para mejorar */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">💡 Consejos para mejorar</h4>
          <div className="text-sm text-gray-600 space-y-1">
            {activityData.currentStreak < 3 && (
              <p>• Mantén tu racha activa iniciando sesión diariamente</p>
            )}
            {activityData.postsCreated < 20 && (
              <p>• Crea más contenido para aumentar tu visibilidad</p>
            )}
            {activityData.engagementRate < 5 && (
              <p>• Interactúa más con la comunidad para mejorar tu engagement</p>
            )}
            {activityData.currentStreak >= 3 && activityData.postsCreated >= 20 && activityData.engagementRate >= 5 && (
              <p>• ¡Excelente trabajo! Sigue así para mantener tu crecimiento</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalActivityWidget;
