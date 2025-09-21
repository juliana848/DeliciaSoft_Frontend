import React from "react";

function Footer() {
  return (
    <footer className="relative bg-gradient-to-r from-pink-100 via-pink-200 to-yellow-100 overflow-hidden">
      {/* Ondas decorativas superiores */}
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-white">
          <path d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,0 L0,0 Z"></path>
        </svg>
      </div>

      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-20 h-20 bg-pink-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-yellow-300 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-pink-400 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-1/3 right-1/4 w-18 h-18 bg-yellow-400 rounded-full animate-bounce delay-500"></div>
      </div>

      {/* Patrón de puntos sutil */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" viewBox="0 0 60 60">
          <defs>
            <pattern id="footer-dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="2" fill="currentColor"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-dots)" className="text-gray-600"/>
        </svg>
      </div>

      <div className="relative z-10 pt-8 pb-4">
        <div className="container mx-auto px-4">
          {/* Contenido principal del footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
            
            {/* Sección Logo */}
            <div className="text-center lg:text-left">
              <div className="bg-white bg-opacity-90 rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-all duration-300 mb-2">
                <img 
                  src="/imagenes/logo-delicias-darsy.png" 
                  alt="Delicias Darsy" 
                  className="h-16 w-auto mx-auto lg:mx-0 filter drop-shadow-md"
                />
              </div>
              <div className="flex justify-center lg:justify-start space-x-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>

            {/* Sección Acerca de */}
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center justify-center lg:justify-start">
                <span className="mr-2">🧁</span>
                Delicias Darsy
              </h3>
              <div className="bg-white bg-opacity-80 rounded-xl p-3 shadow-md">
                <p className="text-gray-700 text-sm leading-relaxed">
                  Descubre sabores únicos que 
                  <span className="text-pink-600 font-semibold"> endulzan </span>
                  cada momento.
                </p>
              </div>
            </div>

            {/* Sección Empresa */}
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center justify-center lg:justify-start">
                <span className="mr-2">🏪</span>
                Nuestra Empresa
              </h3>
              <div className="space-y-2">
                <div className="bg-white bg-opacity-80 rounded-lg p-2 shadow-md transform hover:scale-105 transition-all duration-300">
                  <a 
                    href="../../../Sedes" 
                    rel="noopener noreferrer"
                    className="text-gray-700 text-sm font-medium hover:text-pink-600 transition-colors duration-300 flex items-center justify-center lg:justify-start"
                  >
                    <span className="mr-2">📍</span>
                    Nuestras Sedes
                  </a>
                </div>
                <div className="bg-white bg-opacity-80 rounded-lg p-2 shadow-md transform hover:scale-105 transition-all duration-300">
                  <a 
                    href="../../../Conocenos" 
                    rel="noopener noreferrer"
                    className="text-gray-700 text-sm font-medium hover:text-pink-600 transition-colors duration-300 flex items-center justify-center lg:justify-start"
                  >
                    <span className="mr-2">💝</span>
                    Conócenos
                  </a>
                </div>
              </div>
            </div>

            {/* Sección Contacto */}
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center justify-center lg:justify-start">
                <span className="mr-2">📞</span>
                Contacto
              </h3>
              <div className="space-y-2">
                
                {/* WhatsApp */}
                <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-lg p-2 shadow-md transform hover:scale-105 transition-all duration-300">
                  <a 
                    href="https://wa.me/573213098504" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white text-sm font-medium flex items-center justify-center lg:justify-start"
                  >
                    <span className="mr-2">💬</span>
                    +57 321 309 85 04
                  </a>
                </div>

                {/* TikTok */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-2 shadow-md transform hover:scale-105 transition-all duration-300">
                  <a 
                    href="https://www.tiktok.com/@delicias_darsy?_t=ZS-8waDD3RfXJk&_r=1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white text-sm font-medium flex items-center justify-center lg:justify-start"
                  >
                    <span className="mr-2">🎵</span>
                    Delicias_Darsy
                  </a>
                </div>

                {/* Instagram */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-2 shadow-md transform hover:scale-105 transition-all duration-300">
                  <a 
                    href="https://www.instagram.com/delicias_darsy?igsh=MTYwOWJoOTQ2djMwcg==" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white text-sm font-medium flex items-center justify-center lg:justify-start"
                  >
                    <span className="mr-2">📸</span>
                    @delicias_darsy
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Línea divisoria decorativa */}
          <div className="flex items-center justify-center mb-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>
            <div className="mx-4 flex space-x-1">
              <span className="text-lg animate-bounce">🍩</span>
              <span className="text-lg animate-bounce delay-100">🧁</span>
              <span className="text-lg animate-bounce delay-200">🍰</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-300 to-transparent"></div>
          </div>

          {/* Footer inferior */}
          <div className="text-center">
            <div className="bg-white bg-opacity-90 rounded-full px-6 py-2 inline-block shadow-lg">
              <p className="text-gray-700 text-sm font-medium">
                © 2024 Delicias Darsy - 
                <span className="text-pink-600 font-bold"> Hecho con mucho amor </span>
                ✨
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Elementos decorativos flotantes */}
      <div className="absolute bottom-4 left-4 opacity-60">
        <div className="w-8 h-8 bg-pink-300 rounded-full animate-ping"></div>
      </div>
      <div className="absolute bottom-8 right-8 opacity-60">
        <div className="w-6 h-6 bg-yellow-300 rounded-full animate-pulse"></div>
      </div>
    </footer>
  );
}

export default Footer;