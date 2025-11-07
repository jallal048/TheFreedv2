import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Lock, 
  Bell, 
  Shield, 
  User, 
  Palette, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Mail,
  MessageSquare,
  Save,
  RefreshCw,
  Trash2,
  Database,
  Download,
  Accessibility,
  Code
} from 'lucide-react';

interface SettingsData {
  privacy: {
    profileVisibility: 'public' | 'private' | 'followers';
    allowFollowRequests: boolean;
    showOnlineStatus: boolean;
    allowDirectMessages: 'everyone' | 'followers' | 'none';
    showActivityStatus: boolean;
    searchable: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    inAppEnabled: boolean;
    marketingEmails: boolean;
    securityAlerts: boolean;
    weeklyDigest: boolean;
    newFollowers: boolean;
    likes: boolean;
    comments: boolean;
    mentions: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    sessionTimeout: 30 | 60 | 120 | 240;
    lastPasswordChange: string;
    activeSessions: Array<{
      id: string;
      device: string;
      location: string;
      lastActive: string;
      current: boolean;
    }>;
  };
  account: {
    email: string;
    emailVerified: boolean;
    username: string;
    accountCreated: string;
    subscriptionPlan: string;
    deletionRequested: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    fontSize: 'small' | 'medium' | 'large';
    showAnimations: boolean;
    compactMode: boolean;
    showEmojis: boolean;
  };
}

const defaultSettings: SettingsData = {
  privacy: {
    profileVisibility: 'public',
    allowFollowRequests: true,
    showOnlineStatus: true,
    allowDirectMessages: 'followers',
    showActivityStatus: true,
    searchable: true,
  },
  notifications: {
    emailEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
    marketingEmails: false,
    securityAlerts: true,
    weeklyDigest: true,
    newFollowers: true,
    likes: true,
    comments: true,
    mentions: true,
  },
  security: {
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 60,
    lastPasswordChange: '2024-01-15',
    activeSessions: [
      {
        id: '1',
        device: 'Chrome en Windows',
        location: 'Madrid, España',
        lastActive: 'Ahora',
        current: true,
      },
      {
        id: '2',
        device: 'Safari en iPhone',
        location: 'Madrid, España',
        lastActive: 'Hace 2 horas',
        current: false,
      },
    ],
  },
  account: {
    email: 'usuario@ejemplo.com',
    emailVerified: true,
    username: 'usuario123',
    accountCreated: '2023-06-15',
    subscriptionPlan: 'Gratuito',
    deletionRequested: false,
  },
  appearance: {
    theme: 'system',
    language: 'es',
    fontSize: 'medium',
    showAnimations: true,
    compactMode: false,
    showEmojis: true,
  },
};

const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [emailForm, setEmailForm] = useState({ newEmail: '', confirmEmail: '' });
  const [deletionConfirm, setDeletionConfirm] = useState('');

  // Memoizar el estado de cambios para optimizar renders
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(defaultSettings);
  }, [settings]);

  // Función para guardar configuraciones
  const saveSettings = useCallback(async (section?: keyof SettingsData) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En una aplicación real, aquí iría la llamada a la API
      console.log('Guardando configuración:', section || 'todo', settings);
      
      setLastSaved(new Date());
      setSuccess(section ? `Configuración de ${section} guardada correctamente` : 'Configuración guardada correctamente');
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al guardar la configuración. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }, [settings]);

  // Función para actualizar configuraciones
  const updateSetting = useCallback(<T extends keyof SettingsData>(
    section: T,
    key: keyof SettingsData[T],
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  }, []);

  // Funciones de validación
  const validatePassword = (password: string): boolean => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handlers para formularios
  const handlePasswordChange = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (!validatePassword(passwordForm.new)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Simular cambio de contraseña
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPasswordForm({ current: '', new: '', confirm: '' });
      setSuccess('Contraseña cambiada correctamente');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = async () => {
    if (!emailForm.newEmail || !emailForm.confirmEmail) {
      setError('Ambos campos de email son obligatorios');
      return;
    }

    if (emailForm.newEmail !== emailForm.confirmEmail) {
      setError('Los emails no coinciden');
      return;
    }

    if (!validateEmail(emailForm.newEmail)) {
      setError('Email no válido');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Simular cambio de email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSettings(prev => ({
        ...prev,
        account: { ...prev.account, email: emailForm.newEmail, emailVerified: false }
      }));
      
      setEmailForm({ newEmail: '', confirmEmail: '' });
      setSuccess('Email cambiado correctamente. Revisa tu bandeja de entrada para verificar.');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al cambiar el email');
    } finally {
      setSaving(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (deletionConfirm !== 'ELIMINAR') {
      setError('Debes escribir "ELIMINAR" para confirmar');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Simular solicitud de eliminación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSettings(prev => ({
        ...prev,
        account: { ...prev.account, deletionRequested: true }
      }));
      
      setDeletionConfirm('');
      setSuccess('Solicitud de eliminación enviada. Tienes 30 días para cancelarla.');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al solicitar la eliminación de la cuenta');
    } finally {
      setSaving(false);
    }
  };

  // Componente para cada sección
  const PrivacySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Visibilidad del Perfil
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">¿Quién puede ver tu perfil?</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {[
                { value: 'public', label: 'Público', desc: 'Cualquier persona puede ver tu perfil' },
                { value: 'private', label: 'Privado', desc: 'Solo seguidores aprobados' },
                { value: 'followers', label: 'Seguidores', desc: 'Solo tus seguidores' },
              ].map(option => (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value={option.value}
                    checked={settings.privacy.profileVisibility === option.value}
                    onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Interacciones</h3>
        <div className="space-y-4">
          {[
            { key: 'allowFollowRequests', label: 'Permitir solicitudes de seguimiento', desc: 'Otros usuarios pueden solicitar seguirte' },
            { key: 'showOnlineStatus', label: 'Mostrar estado en línea', desc: 'Otros usuarios pueden ver si estás activo' },
            { key: 'showActivityStatus', label: 'Mostrar actividad reciente', desc: 'Mostrar cuándo publicaste por última vez' },
            { key: 'searchable', label: 'Perfil buscable', desc: 'Tu perfil aparece en búsquedas' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy[item.key as keyof typeof settings.privacy] as boolean}
                onChange={(e) => updateSetting('privacy', item.key, e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Mensajes Directos</h3>
        <div>
          <label className="text-sm font-medium mb-2 block">¿Quién puede enviarte mensajes directos?</label>
          <select
            value={settings.privacy.allowDirectMessages}
            onChange={(e) => updateSetting('privacy', 'allowDirectMessages', e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="everyone">Todos</option>
            <option value="followers">Solo seguidores</option>
            <option value="none">Nadie</option>
          </select>
        </div>
      </div>
    </div>
  );

  const NotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Canales de Notificación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'emailEnabled', label: 'Email', icon: Mail, desc: 'Recibe notificaciones por correo' },
            { key: 'pushEnabled', label: 'Push', icon: Smartphone, desc: 'Notificaciones push del navegador' },
            { key: 'inAppEnabled', label: 'In-app', icon: MessageSquare, desc: 'Notificaciones en la aplicación' },
          ].map(item => (
            <Card key={item.key} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                  onChange={(e) => updateSetting('notifications', item.key, e.target.checked)}
                />
              </div>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Tipos de Notificación</h3>
        <div className="space-y-4">
          {[
            { key: 'newFollowers', label: 'Nuevos seguidores', desc: 'Cuando alguien te sigue' },
            { key: 'likes', label: 'Me gusta', desc: 'Cuando alguien da me gusta a tus posts' },
            { key: 'comments', label: 'Comentarios', desc: 'Cuando alguien comenta en tus posts' },
            { key: 'mentions', label: 'Menciones', desc: 'Cuando alguien te menciona' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                onChange={(e) => updateSetting('notifications', item.key, e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Notificaciones de Sistema</h3>
        <div className="space-y-4">
          {[
            { key: 'securityAlerts', label: 'Alertas de seguridad', desc: 'Notificaciones importantes de seguridad' },
            { key: 'weeklyDigest', label: 'Resumen semanal', desc: 'Un resumen de tu actividad semanal' },
            { key: 'marketingEmails', label: 'Emails de marketing', desc: 'Ofertas y noticias de la plataforma' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                onChange={(e) => updateSetting('notifications', item.key, e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SecuritySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Autenticación de Dos Factores
        </h3>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium">2FA</h4>
              <p className="text-sm text-muted-foreground">
                Añade una capa extra de seguridad a tu cuenta
              </p>
            </div>
            <Badge variant={settings.security.twoFactorEnabled ? 'default' : 'secondary'}>
              {settings.security.twoFactorEnabled ? 'Activado' : 'Desactivado'}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant={settings.security.twoFactorEnabled ? 'destructive' : 'default'}
              onClick={() => updateSetting('security', 'twoFactorEnabled', !settings.security.twoFactorEnabled)}
            >
              {settings.security.twoFactorEnabled ? 'Desactivar 2FA' : 'Activar 2FA'}
            </Button>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Cambiar Contraseña</h3>
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Contraseña actual</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                  className="w-full p-2 border rounded-md pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                  className="w-full p-2 border rounded-md pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                  className="w-full p-2 border rounded-md pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <Button onClick={handlePasswordChange} disabled={saving}>
            {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
            Cambiar Contraseña
          </Button>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Configuración de Sesiones</h3>
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notificaciones de inicio de sesión</h4>
              <p className="text-sm text-muted-foreground">
                Recibe alertas cuando alguien inicie sesión en tu cuenta
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.security.loginNotifications}
              onChange={(e) => updateSetting('security', 'loginNotifications', e.target.checked)}
              className="h-4 w-4"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Tiempo de espera de sesión (minutos)</label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSetting('security', 'sessionTimeout', Number(e.target.value))}
              className="w-full p-2 border rounded-md max-w-xs"
            >
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={120}>2 horas</option>
              <option value={240}>4 horas</option>
            </select>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Sesiones Activas</h3>
        <Card className="p-6">
          <div className="space-y-4">
            {settings.security.activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full ${session.current ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {session.device}
                      {session.current && <Badge variant="default">Actual</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {session.location} • {session.lastActive}
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="outline" size="sm">
                    Cerrar sesión
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const AccountSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Información de la Cuenta
        </h3>
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nombre de usuario</label>
              <input
                type="text"
                value={settings.account.username}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  account: { ...prev.account, username: e.target.value }
                }))}
                className="w-full p-2 border rounded-md"
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                El nombre de usuario no se puede cambiar
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Plan de suscripción</label>
              <div className="p-2 border rounded-md bg-muted">
                {settings.account.subscriptionPlan}
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Miembro desde</label>
            <div className="p-2 border rounded-md bg-muted">
              {new Date(settings.account.accountCreated).toLocaleDateString('es-ES')}
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Cambiar Email</h3>
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium">Email actual:</span>
            <span className="text-sm">{settings.account.email}</span>
            {settings.account.emailVerified ? (
              <Badge variant="default" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verificado
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <XCircle className="h-3 w-3 mr-1" />
                No verificado
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nuevo email</label>
              <input
                type="email"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                className="w-full p-2 border rounded-md"
                placeholder="nuevo@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Confirmar email</label>
              <input
                type="email"
                value={emailForm.confirmEmail}
                onChange={(e) => setEmailForm(prev => ({ ...prev, confirmEmail: e.target.value }))}
                className="w-full p-2 border rounded-md"
                placeholder="nuevo@email.com"
              />
            </div>
          </div>
          <Button onClick={handleEmailChange} disabled={saving}>
            {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            Cambiar Email
          </Button>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Zona de Peligro
        </h3>
        <Card className="p-6 border-destructive">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-destructive mb-2">Eliminar Cuenta</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Una vez que elimines tu cuenta, no hay vuelta atrás. Esto eliminará permanentemente tu perfil, 
                todos tus posts y toda la actividad asociada.
              </p>
              
              {settings.account.deletionRequested ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Solicitud de eliminación pendiente</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Tienes 30 días para cancelar esta solicitud. Después de este período, tu cuenta será eliminada permanentemente.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Cancelar solicitud
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Escribe "ELIMINAR" para confirmar
                    </label>
                    <input
                      type="text"
                      value={deletionConfirm}
                      onChange={(e) => setDeletionConfirm(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="ELIMINAR"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleAccountDeletion}
                    disabled={deletionConfirm !== 'ELIMINAR' || saving}
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Eliminar mi cuenta
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const AdvancedSection = () => (
    <div className="space-y-6">
      {/* Gestión de Datos */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gestión de Datos
        </h3>
        <Card className="p-6 space-y-4">
          <div>
            <h4 className="font-medium mb-2">Exportar mis datos</h4>
            <p className="text-sm text-gray-600 mb-4">
              Descarga una copia de todos tus datos, incluyendo posts, mensajes, configuraciones y más.
            </p>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar datos (JSON)
            </Button>
            <Button variant="outline" className="ml-2">
              <Download className="h-4 w-4 mr-2" />
              Exportar datos (CSV)
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Última exportación: {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Programar eliminación de cuenta</h4>
            <p className="text-sm text-gray-600 mb-4">
              Programa la eliminación de tu cuenta para una fecha futura. Puedes cancelar en cualquier momento.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="date"
                min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="p-2 border rounded-md"
              />
              <Button variant="outline">
                Programar eliminación
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Configuraciones de Accesibilidad */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Accessibility className="h-5 w-5" />
          Accesibilidad
        </h3>
        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tamaño de fuente</label>
            <select className="w-full p-2 border rounded-md max-w-xs">
              <option value="small">Pequeño</option>
              <option value="medium" selected>Mediano</option>
              <option value="large">Grande</option>
              <option value="xl">Extra grande</option>
            </select>
          </div>
          
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Alto contraste</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">Mejora la visibilidad de los elementos</p>
          </div>
          
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Lector de pantalla</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">Optimiza para lectores de pantalla</p>
          </div>
          
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Reducir animaciones</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">Minimiza efectos de movimiento</p>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Modo de daltonismo</label>
            <select className="w-full p-2 border rounded-md max-w-xs">
              <option value="none">Ninguno</option>
              <option value="protanopia">Protanopia (rojo)</option>
              <option value="deuteranopia">Deuteranopia (verde)</option>
              <option value="tritanopia">Tritanopia (azul)</option>
            </select>
          </div>
        </Card>
      </div>

      {/* Configuraciones Avanzadas de Privacidad */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacidad Avanzada
        </h3>
        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Visibilidad del estado</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="radio" name="status" value="everyone" defaultChecked className="rounded" />
                <span className="text-sm">Todos pueden ver si estoy en línea</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="status" value="followers" className="rounded" />
                <span className="text-sm">Solo seguidores</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="status" value="nobody" className="rounded" />
                <span className="text-sm">Nadie</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Permitir que otros me encuentren</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Por nombre de usuario</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Por email</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Por número de teléfono</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Configuración de mensajes</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="radio" name="messages" value="everyone" className="rounded" />
                <span className="text-sm">Todos pueden enviar mensajes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="messages" value="followers" defaultChecked className="rounded" />
                <span className="text-sm">Solo seguidores</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="messages" value="nobody" className="rounded" />
                <span className="text-sm">Nadie</span>
              </label>
            </div>
          </div>
        </Card>
      </div>

      {/* Herramientas de Desarrollo */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Code className="h-5 w-5" />
          Herramientas de Debug
        </h3>
        <Card className="p-6 space-y-4">
          <Alert>
            <Code className="h-4 w-4" />
            <AlertDescription>
              Estas herramientas son solo para desarrollo. No las uses en producción.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Descargar logs de sesión
            </Button>
            
            <Button variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Ver estado de la base de datos
            </Button>
            
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerar tokens
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const AppearanceSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Tema y Apariencia
        </h3>
        <Card className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Tema</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Claro', icon: Sun, desc: 'Tema claro' },
                { value: 'dark', label: 'Oscuro', icon: Moon, desc: 'Tema oscuro' },
                { value: 'system', label: 'Sistema', icon: Monitor, desc: 'Seguir configuración del sistema' },
              ].map(theme => (
                <label key={theme.value} className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-accent">
                  <input
                    type="radio"
                    name="theme"
                    value={theme.value}
                    checked={settings.appearance.theme === theme.value}
                    onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                    className="sr-only"
                  />
                  <theme.icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{theme.label}</div>
                    <div className="text-xs text-muted-foreground">{theme.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Tamaño de fuente</label>
            <select
              value={settings.appearance.fontSize}
              onChange={(e) => updateSetting('appearance', 'fontSize', e.target.value)}
              className="w-full p-2 border rounded-md max-w-xs"
            >
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
            </select>
          </div>

          <div className="space-y-4">
            {[
              { key: 'showAnimations', label: 'Mostrar animaciones', desc: 'Animaciones y transiciones' },
              { key: 'compactMode', label: 'Modo compacto', desc: 'Interfaz más compacta' },
              { key: 'showEmojis', label: 'Mostrar emojis', desc: 'Mostrar emojis en posts y comentarios' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.appearance[item.key as keyof typeof settings.appearance] as boolean}
                  onChange={(e) => updateSetting('appearance', item.key, e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Configuración</h1>
          </div>
          <p className="text-muted-foreground">
            Gestiona la configuración de tu cuenta y preferencias de la aplicación
          </p>
        </div>

        {/* Alertas */}
        {error && (
          <Alert className="mb-6 border-destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de navegación */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4">
              <nav className="space-y-2">
                {[
                  { id: 'privacy', label: 'Privacidad', icon: Eye },
                  { id: 'notifications', label: 'Notificaciones', icon: Bell },
                  { id: 'security', label: 'Seguridad', icon: Shield },
                  { id: 'account', label: 'Cuenta', icon: User },
                  { id: 'advanced', label: 'Avanzado', icon: SettingsIcon },
                  { id: 'appearance', label: 'Apariencia', icon: Palette },
                ].map(item => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </a>
                ))}
              </nav>
            </Card>
          </div>

          {/* Contenido de las secciones */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="privacy" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="privacy" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Privacidad
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notificaciones
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Seguridad
                    </TabsTrigger>
                    <TabsTrigger value="account" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Cuenta
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Avanzado
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Apariencia
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="privacy">
                    <PrivacySection />
                  </TabsContent>

                  <TabsContent value="notifications">
                    <NotificationsSection />
                  </TabsContent>

                  <TabsContent value="security">
                    <SecuritySection />
                  </TabsContent>

                  <TabsContent value="account">
                    <AccountSection />
                  </TabsContent>

                  <TabsContent value="advanced">
                    <AdvancedSection />
                  </TabsContent>

                  <TabsContent value="appearance">
                    <AppearanceSection />
                  </TabsContent>
                </Tabs>

                {/* Botón de guardar global */}
                {hasUnsavedChanges && (
                  <div className="mt-8 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Tienes cambios sin guardar
                        {lastSaved && (
                          <span className="ml-2">
                            • Último guardado: {lastSaved.toLocaleTimeString('es-ES')}
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => saveSettings()}
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        {saving ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;