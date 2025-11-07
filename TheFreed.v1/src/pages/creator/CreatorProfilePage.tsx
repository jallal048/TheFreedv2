import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Switch } from '../../components/ui/switch';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  MessageCircle, 
  Users, 
  DollarSign, 
  PlayCircle, 
  Image, 
  FileText, 
  Music, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Share2, 
  Download, 
  Filter, 
  Search,
  Calendar,
  Clock,
  Star,
  Shield,
  Lock,
  Globe,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Upload,
  CheckCircle,
  AlertCircle,
  Bell,
  UserPlus,
  Video,
  Mic,
  Camera,
  FileVideo
} from 'lucide-react';
import { mockUsers, mockContent, mockSubscriptions } from '../../services/mockData';
import { Content, CreatorProfile, User } from '../../types';

export default function CreatorProfilePage() {
  // Estado del dashboard
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Datos del creador (mock - tomar el primer usuario CREATOR)
  const creator = mockUsers.find(user => user.userType === 'CREATOR') as User;
  const creatorProfile = creator?.profile as CreatorProfile;
  const creatorContent = mockContent.filter(content => content.creatorId === creator?.id);
  const creatorSubscriptions = mockSubscriptions.filter(sub => sub.creatorId === creator?.id && sub.status === 'ACTIVE');

  // Estadísticas calculadas
  const stats = {
    totalContent: creatorContent.length,
    totalViews: creatorContent.reduce((sum, content) => sum + content.views, 0),
    totalLikes: creatorContent.reduce((sum, content) => sum + content.likesCount, 0),
    totalFollowers: creatorProfile?.followerCount || 0,
    totalEarnings: creatorProfile?.totalEarnings || 0,
    totalSubscribers: creatorSubscriptions.length,
    averageEngagement: Math.round((creatorContent.reduce((sum, content) => sum + content.likesCount, 0) / creatorContent.length) * 100) / 100,
    monthlyGrowth: Math.floor(Math.random() * 20) + 5,
    weeklyViews: Math.floor(Math.random() * 50000) + 10000,
    conversionRate: Math.round((creatorSubscriptions.length / creatorProfile?.followerCount! * 100) * 100) / 100
  };

  // Datos de gráficos simulados
  const engagementData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    views: Math.floor(Math.random() * 1000) + 500,
    likes: Math.floor(Math.random() * 200) + 50,
    comments: Math.floor(Math.random() * 50) + 10,
    revenue: Math.floor(Math.random() * 100) + 20
  }));

  const contentTypeData = [
    { type: 'Videos', count: creatorContent.filter(c => c.contentType === 'VIDEO').length, color: '#3b82f6' },
    { type: 'Imágenes', count: creatorContent.filter(c => c.contentType === 'IMAGE').length, color: '#10b981' },
    { type: 'Audio', count: creatorContent.filter(c => c.contentType === 'AUDIO').length, color: '#f59e0b' },
    { type: 'Texto', count: creatorContent.filter(c => c.contentType === 'TEXT').length, color: '#ef4444' }
  ];

  // Función para formatear números
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Filtrar contenido del creador
  const filteredContent = creatorContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || content.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Creador */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 border-4 border-white">
                <AvatarImage src={creatorProfile?.avatarUrl} alt={creatorProfile?.displayName} />
                <AvatarFallback className="bg-white text-blue-600 text-xl font-bold">
                  {creator?.firstName?.charAt(0)}{creator?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{creatorProfile?.displayName || creator?.username}</h1>
                  {creatorProfile?.isVerified && (
                    <CheckCircle className="w-6 h-6 text-yellow-300" />
                  )}
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <Star className="w-3 h-3 mr-1" />
                    {creatorProfile?.verificationLevel}
                  </Badge>
                </div>
                <p className="text-blue-100 mt-1 max-w-2xl">{creatorProfile?.bio}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{formatNumber(stats.totalFollowers)} seguidores</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <PlayCircle className="w-4 h-4" />
                    <span>{formatNumber(stats.totalContent)} contenidos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatCurrency(stats.totalEarnings)} ganados</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
              <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs principales */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="content">Contenido</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="monetization">Monetización</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
            <TabsTrigger value="tools">Herramientas</TabsTrigger>
          </TabsList>

          {/* TAB: RESUMEN */}
          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* Métricas principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Vistas</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(stats.totalViews)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{stats.monthlyGrowth}%
                      </span>
                      vs mes anterior
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Likes Totales</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(stats.totalLikes)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{Math.floor(Math.random() * 15) + 3}%
                      </span>
                      engagement rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Seguidores</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(stats.totalFollowers)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{Math.floor(Math.random() * 500) + 100}
                      </span>
                      nuevos esta semana
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{Math.floor(Math.random() * 25) + 8}%
                      </span>
                      vs mes anterior
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos principales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement último mes</CardTitle>
                    <CardDescription>
                      Vistas, likes y comentarios diarios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Gráfico de engagement</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Implementar con Recharts o similar
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tipos de Contenido</CardTitle>
                    <CardDescription>
                      Distribución por formato
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Gráfico de distribución</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {contentTypeData.map(item => `${item.type}: ${item.count}`).join(', ')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contenido reciente destacado */}
              <Card>
                <CardHeader>
                  <CardTitle>Contenido Más Popular</CardTitle>
                  <CardDescription>
                    Tus publicaciones con mejor rendimiento esta semana
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {creatorContent.slice(0, 3).map((content) => (
                      <div key={content.id} className="border rounded-lg p-4">
                        <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                          {content.contentType === 'VIDEO' && <Video className="w-8 h-8 text-gray-400" />}
                          {content.contentType === 'IMAGE' && <Image className="w-8 h-8 text-gray-400" />}
                          {content.contentType === 'AUDIO' && <Music className="w-8 h-8 text-gray-400" />}
                          {content.contentType === 'TEXT' && <FileText className="w-8 h-8 text-gray-400" />}
                        </div>
                        <h4 className="font-medium text-sm mb-2 line-clamp-2">{content.title}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatNumber(content.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {formatNumber(content.likesCount)}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {content.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB: CONTENIDO */}
          <TabsContent value="content" className="mt-6">
            <div className="space-y-6">
              {/* Controles de contenido */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestión de Contenido</CardTitle>
                      <CardDescription>
                        Administra todos tus contenidos publicados
                      </CardDescription>
                    </div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Contenido
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Buscar contenido..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filtrar por categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="cooking">Cocina</SelectItem>
                        <SelectItem value="music">Música</SelectItem>
                        <SelectItem value="art">Arte</SelectItem>
                        <SelectItem value="travel">Viajes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lista de contenido */}
                  <div className="space-y-4">
                    {filteredContent.map((content) => (
                      <Card key={content.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {content.contentType === 'VIDEO' && <Video className="w-6 h-6 text-gray-400" />}
                              {content.contentType === 'IMAGE' && <Image className="w-6 h-6 text-gray-400" />}
                              {content.contentType === 'AUDIO' && <Music className="w-6 h-6 text-gray-400" />}
                              {content.contentType === 'TEXT' && <FileText className="w-6 h-6 text-gray-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg mb-1">{content.title}</h3>
                                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{content.description}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(content.createdAt).toLocaleDateString()}
                                    </span>
                                    {content.duration && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, '0')}
                                      </span>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                      {content.category}
                                    </Badge>
                                    {content.isPremium && (
                                      <Badge variant="default" className="text-xs bg-yellow-500">
                                        Premium
                                      </Badge>
                                    )}
                                    {content.isNSFW && (
                                      <Badge variant="destructive" className="text-xs">
                                        18+
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-3 h-3 mr-1" />
                                    Editar
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Share2 className="w-3 h-3 mr-1" />
                                    Compartir
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Eliminar
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="flex items-center gap-6 text-sm">
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Eye className="w-4 h-4" />
                                    <span>{formatNumber(content.views)} vistas</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Heart className="w-4 h-4" />
                                    <span>{formatNumber(content.likesCount)} likes</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>{Math.floor(Math.random() * 100)} comentarios</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Download className="w-4 h-4" />
                                    <span>{content.downloads} descargas</span>
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-green-600">
                                  {content.isPremium ? formatCurrency(content.price || 0) : 'Gratuito'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB: ANALYTICS */}
          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              {/* Selector de tiempo */}
              <Card>
                <CardHeader>
                  <CardTitle>Análisis Detallado</CardTitle>
                  <CardDescription>
                    Métricas y estadísticas de tu contenido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-sm font-medium">Período:</span>
                    <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">7 días</SelectItem>
                        <SelectItem value="30d">30 días</SelectItem>
                        <SelectItem value="90d">90 días</SelectItem>
                        <SelectItem value="1y">1 año</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Vistas por Día
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Gráfico de vistas</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Promedio: {Math.floor(stats.weeklyViews / 30)} vistas/día
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Métricas de Conversión
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Seguidores → Suscriptores</span>
                            <span>{stats.conversionRate}%</span>
                          </div>
                          <Progress value={stats.conversionRate} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Engagement Rate</span>
                            <span>{Math.round((stats.totalLikes / stats.totalViews) * 100)}%</span>
                          </div>
                          <Progress value={(stats.totalLikes / stats.totalViews) * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Retención de Audiencia</span>
                            <span>{Math.floor(Math.random() * 30) + 60}%</span>
                          </div>
                          <Progress value={Math.floor(Math.random() * 30) + 60} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top contenido */}
              <Card>
                <CardHeader>
                  <CardTitle>Contenido con Mejor Rendimiento</CardTitle>
                  <CardDescription>
                    Tus publicaciones más exitosas ordenadas por engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {creatorContent
                      .sort((a, b) => (b.likesCount + b.views) - (a.likesCount + a.views))
                      .slice(0, 5)
                      .map((content, index) => (
                        <div key={content.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                            {index + 1}
                          </div>
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            {content.contentType === 'VIDEO' && <Video className="w-5 h-5 text-gray-400" />}
                            {content.contentType === 'IMAGE' && <Image className="w-5 h-5 text-gray-400" />}
                            {content.contentType === 'AUDIO' && <Music className="w-5 h-5 text-gray-400" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{content.title}</h4>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span>{formatNumber(content.views)} vistas</span>
                              <span>{formatNumber(content.likesCount)} likes</span>
                              <span>{(content.likesCount / content.views * 100).toFixed(1)}% engagement</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {content.category}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB: MONETIZACIÓN */}
          <TabsContent value="monetization" className="mt-6">
            <div className="space-y-6">
              {/* Resumen financiero */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings * 0.3)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12.5%
                      </span>
                      vs mes anterior
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Suscriptores Activos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{Math.floor(Math.random() * 20) + 5}
                      </span>
                      nuevos este mes
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(creatorProfile?.monthlyPrice || 15)}</div>
                    <p className="text-xs text-muted-foreground">
                      por suscripción mensual
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Configuración de precios */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Precios</CardTitle>
                  <CardDescription>
                    Gestiona tus planes de suscripción y precios
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Plan Mensual</label>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          placeholder="15"
                          defaultValue={creatorProfile?.monthlyPrice}
                        />
                        <p className="text-xs text-gray-500">USD por mes</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Plan Anual</label>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          placeholder="150"
                          defaultValue={creatorProfile?.yearlyPrice}
                        />
                        <p className="text-xs text-gray-500">USD por año (2 meses gratis)</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Plan Personalizado</label>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          placeholder="25"
                          defaultValue={creatorProfile?.customPrice}
                        />
                        <p className="text-xs text-gray-500">USD personalizado</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Descripción de tu contenido premium</label>
                    <Textarea
                      placeholder="Describe qué tipo de contenido exclusivo ofreces a tus suscriptores..."
                      defaultValue="Contenido exclusivo, tutoriales avanzados, sesiones en vivo, acceso prioritario y más..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Tasa de Comisión</h4>
                      <p className="text-sm text-gray-600">{creatorProfile?.commissionRate || 15}% de comisión en la plataforma</p>
                    </div>
                    <Badge variant="outline">
                      {formatCurrency(stats.totalEarnings * 0.15)} comisión mensual
                    </Badge>
                  </div>

                  <Button className="w-full">
                    Actualizar Configuración de Precios
                  </Button>
                </CardContent>
              </Card>

              {/* Historial de pagos */}
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Ingresos</CardTitle>
                  <CardDescription>
                    Detalle de pagos recibidos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: 5 }, (_, i) => {
                      const amount = Math.floor(Math.random() * 500) + 100;
                      const date = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
                      return (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Pago de suscripción</p>
                              <p className="text-xs text-gray-500">{date.toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">+{formatCurrency(amount)}</p>
                            <p className="text-xs text-gray-500">Completado</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB: CONFIGURACIÓN */}
          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              {/* Configuración de perfil */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Perfil</CardTitle>
                  <CardDescription>
                    Actualiza tu información personal y de creador
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={creatorProfile?.avatarUrl} />
                      <AvatarFallback>
                        {creator?.firstName?.charAt(0)}{creator?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Cambiar Avatar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nombre a Mostrar</label>
                      <Input defaultValue={creatorProfile?.displayName} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Website</label>
                      <Input defaultValue={creatorProfile?.website} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Biografía</label>
                    <Textarea
                      defaultValue={creatorProfile?.bio}
                      rows={3}
                      placeholder="Cuéntale a tu audiencia sobre ti..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Categorías</label>
                    <div className="flex flex-wrap gap-2">
                      {['lifestyle', 'fitness', 'cooking', 'music', 'art', 'travel'].map(category => (
                        <Badge key={category} variant={creatorProfile?.categories.includes(category) ? "default" : "outline"}>
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button>Actualizar Perfil</Button>
                </CardContent>
              </Card>

              {/* Configuración de privacidad */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Privacidad</CardTitle>
                  <CardDescription>
                    Controla quién puede ver tu contenido
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Perfil Público</h4>
                        <p className="text-sm text-gray-600">Permitir que otros encuentren tu perfil</p>
                      </div>
                      <Switch defaultChecked={creatorProfile?.isPublic} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Contenido para Adultos</h4>
                        <p className="text-sm text-gray-600">Marcar contenido como NSFW (18+)</p>
                      </div>
                      <Switch defaultChecked={creatorProfile?.isAdultContent} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Permitir Mensajes Directos</h4>
                        <p className="text-sm text-gray-600">Recibir mensajes de seguidores</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notificaciones de Nuevos Seguidores</h4>
                        <p className="text-sm text-gray-600">Recibir alertas cuando alguien te siga</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Configuración de Edad</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Para contenido 18+, asegúrate de tener más de 18 años y configurar correctamente las restricciones de edad.
                    </p>
                  </div>

                  <Button>Guardar Configuración de Privacidad</Button>
                </CardContent>
              </Card>

              {/* Configuración de notificaciones */}
              <Card>
                <CardHeader>
                  <CardTitle>Notificaciones</CardTitle>
                  <CardDescription>
                    Configura cómo y cuándo recibir notificaciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: UserPlus, title: 'Nuevos Seguidores', description: 'Cuando alguien comienza a seguirte' },
                    { icon: Heart, title: 'Nuevos Likes', description: 'Cuando alguien da like a tu contenido' },
                    { icon: MessageCircle, title: 'Nuevos Comentarios', description: 'Cuando alguien comenta en tu contenido' },
                    { icon: DollarSign, title: 'Pagos Recibidos', description: 'Cuando recibes pagos de suscriptores' },
                    { icon: Bell, title: 'Recordatorios de Publicación', description: 'Recordatorios para crear contenido' }
                  ].map((notification, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <notification.icon className="w-4 h-4 text-gray-600" />
                        <div>
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-xs text-gray-600">{notification.description}</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB: HERRAMIENTAS */}
          <TabsContent value="tools" className="mt-6">
            <div className="space-y-6">
              {/* Herramientas de contenido */}
              <Card>
                <CardHeader>
                  <CardTitle>Herramientas de Creación</CardTitle>
                  <CardDescription>
                    Herramientas y recursos para mejorar tu contenido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { icon: Video, title: 'Editor de Video', description: 'Edita tus videos directamente en la plataforma', color: 'blue' },
                      { icon: Music, title: 'Biblioteca de Música', description: 'Música libre de derechos para tus videos', color: 'purple' },
                      { icon: Camera, title: 'Filtros y Efectos', description: 'Mejora tus imágenes con filtros profesionales', color: 'green' },
                      { icon: FileVideo, title: 'Plantillas', description: 'Plantillas pre-diseñadas para tu contenido', color: 'orange' },
                      { icon: BarChart3, title: 'Análisis SEO', description: 'Optimiza tu contenido para mejor alcance', color: 'red' },
                      { icon: Target, title: 'Programador de Posts', description: 'Programa tu contenido para el mejor momento', color: 'indigo' }
                    ].map((tool, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center bg-${tool.color}-100`}>
                          <tool.icon className={`w-5 h-5 text-${tool.color}-600`} />
                        </div>
                        <h3 className="font-medium text-sm mb-1">{tool.title}</h3>
                        <p className="text-xs text-gray-600">{tool.description}</p>
                        <Button variant="outline" size="sm" className="w-full mt-3">
                          Usar Herramienta
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Exportar datos */}
              <Card>
                <CardHeader>
                  <CardTitle>Exportar Datos</CardTitle>
                  <CardDescription>
                    Descarga tus datos y analíticos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: 'Datos de Analytics', description: 'Exporta todas tus métricas y estadísticas', format: 'CSV, Excel' },
                    { title: 'Lista de Seguidores', description: 'Descarga la lista completa de tus seguidores', format: 'CSV' },
                    { title: 'Ingresos Detallados', description: 'Historial completo de pagos y comisiones', format: 'PDF, Excel' },
                    { title: 'Contenido Publicado', description: 'Backup de todo tu contenido publicado', format: 'JSON, ZIP' }
                  ].map((exportOption, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{exportOption.title}</h4>
                        <p className="text-xs text-gray-600">{exportOption.description}</p>
                        <Badge variant="outline" className="text-xs mt-1">{exportOption.format}</Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-3 h-3 mr-1" />
                        Exportar
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Atajos rápidos */}
              <Card>
                <CardHeader>
                  <CardTitle>Atajos Rápidos</CardTitle>
                  <CardDescription>
                    Acciones frecuentes para creadores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: Plus, label: 'Nuevo Post', action: () => console.log('Nuevo post') },
                      { icon: Video, label: 'Subir Video', action: () => console.log('Subir video') },
                      { icon: Image, label: 'Subir Foto', action: () => console.log('Subir foto') },
                      { icon: Bell, label: 'Programar', action: () => console.log('Programar') }
                    ].map((shortcut, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-20 flex flex-col gap-2"
                        onClick={shortcut.action}
                      >
                        <shortcut.icon className="w-5 h-5" />
                        <span className="text-xs">{shortcut.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}