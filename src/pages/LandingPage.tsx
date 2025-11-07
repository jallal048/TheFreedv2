import { Link } from 'react-router-dom';
import { Sparkles, Star, Users, Shield, Zap, Heart, ArrowRight, Play, TrendingUp, Award } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              TheFreed
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Plataforma Revolucionaria
            </span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Libera tu 
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> potencial</span>
            <br />
            Descubre contenido 
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> sin límites</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            La primera plataforma que revoluciona la forma de descubrir, crear y monetizar contenido. 
            Conecta con tu audiencia de manera auténtica y alcanza tu máximo potencial creativo.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <Link 
              to="/register" 
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center"
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="group flex items-center text-gray-600 hover:text-gray-900 font-medium text-lg">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg mr-3 group-hover:shadow-xl transition-shadow">
                <Play className="w-5 h-5 text-indigo-600 ml-1" />
              </div>
              Ver Demo
            </button>
          </div>

          {/* Social Proof Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">50K+</div>
              <div className="text-gray-600">Creadores Activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">2M+</div>
              <div className="text-gray-600">Usuarios Únicos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600">Satisfacción</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              ¿Por qué elegir TheFreed?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Una plataforma diseñada para el futuro del contenido digital, 
              con herramientas que potencian tu creatividad y maximizan tus ingresos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="group bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-indigo-100">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Algoritmo Inteligente</h3>
              <p className="text-gray-600 leading-relaxed">
                Nuestro sistema de recomendación IA aprende de tus preferencias para mostrarte contenido que realmente te importa.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-purple-100">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Comunidad Auténtica</h3>
              <p className="text-gray-600 leading-relaxed">
                Conecta con creadores y audiencia real. Sin bots, sin fake engagement, solo conexiones genuinas.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="group bg-gradient-to-br from-pink-50 to-red-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-pink-100">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Monetización Superior</h3>
              <p className="text-gray-600 leading-relaxed">
                Gana más con nuestras comisiones optimizadas y herramientas de análisis avanzadas para maximizar tus ingresos.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-green-100">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Privacidad Total</h3>
              <p className="text-gray-600 leading-relaxed">
                Tus datos están seguros con nosotros. Controla completamente tu privacidad y información personal.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-blue-100">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Soporte 24/7</h3>
              <p className="text-gray-600 leading-relaxed">
                Nuestro equipo está siempre disponible para ayudarte a maximizar tu experiencia en la plataforma.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-yellow-100">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Herramientas Pro</h3>
              <p className="text-gray-600 leading-relaxed">
                Accede a analytics avanzados, herramientas de crecimiento y recursos exclusivos para creadores profesionales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Miles de creadores ya han transformado su forma de trabajar con contenido
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "TheFreed revolucionó mi forma de crear contenido. Mis ingresos aumentaron 300% en solo 3 meses."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  M
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">María González</div>
                  <div className="text-gray-500 text-sm">Creadora Digital</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "La comunidad es increíble. Finalmente encontré un lugar donde ser auténtico y conectar con mi audiencia."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  C
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">Carlos Rodríguez</div>
                  <div className="text-gray-500 text-sm">Influencer</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Las herramientas de análisis me ayudaron a entender mejor a mi audiencia y optimizar mi contenido."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">Ana Martín</div>
                  <div className="text-gray-500 text-sm">Creadora de Contenido</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            ¿Listo para liberar tu potencial?
          </h2>
          <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
            Únete a miles de creadores que ya han transformado su forma de trabajar con contenido. 
            Es gratis empezar y tú decides cuánto quieres crecer.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/register" 
              className="group bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center"
            >
              Empezar Gratis Ahora
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-indigo-200 text-sm">
              Sin tarjeta de crédito requerida • Cancela cuando quieras
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">TheFreed</span>
              </div>
              <p className="text-gray-400">
                La plataforma que revoluciona la creación y monetización de contenido.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Acerca de</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 TheFreed. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;