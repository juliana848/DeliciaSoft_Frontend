import React, { useEffect, useState } from "react";
import { FaWhatsapp, FaTiktok, FaInstagram } from "react-icons/fa";

function Footer() {
  const [logoUrl, setLogoUrl] = useState(null);

  // Cargar logo con id 3 desde la API
  useEffect(() => {
    fetch("https://deliciasoft-backend.onrender.com/api/imagenes")
      .then((res) => res.json())
      .then((data) => {
        // Busca el item con idimagen 3
        const logoItem = data.find((item) => item.idimagen === 3);
        if (logoItem) setLogoUrl(logoItem.urlimg);
      })
      .catch((err) => console.error("Error cargando logo:", err));
  }, []);

  return (
    <footer className="relative bg-gradient-to-r from-pink-100 via-pink-200 to-yellow-100 overflow-hidden">
      {/* Ondas decorativas superiores */}
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-white">
          <path d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,0 L0,0 Z"></path>
        </svg>
      </div>

      {/* Elementos decorativos */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-20 h-20 bg-pink-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-yellow-300 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-pink-400 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-1/3 right-1/4 w-18 h-18 bg-yellow-400 rounded-full animate-bounce delay-500"></div>
      </div>

      {/* Patrón de puntos */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" viewBox="0 0 60 60">
          <defs>
            <pattern id="footer-dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-dots)" className="text-gray-600" />
        </svg>
      </div>

      <div className="relative z-10 pt-8 pb-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
            {/* Logo */}
            <div className="text-center lg:text-left">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Delicias Darsy"
                  className="h-40 w-auto mx-auto lg:mx-0 rounded-xl"
                  style={{ backgroundColor: "transparent" }}
                />
              )}
              <div className="flex justify-center lg:justify-start space-x-2 mt-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>

            {/* Acerca de */}
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center justify-center lg:justify-start">
                <span className="mr-2">🧁</span>
                Delicias Darsy
              </h3>
              <p className="text-gray-700 text-base leading-relaxed">
                Descubre sabores únicos que{" "}
                <span className="text-pink-600 font-semibold">endulzan</span> cada momento.
              </p>
            </div>

            {/* Empresa */}
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center justify-center lg:justify-start">
                <span className="mr-2">🏪</span>
                Nuestra Empresa
              </h3>
              <div className="space-y-1">
                <a
                  href="../../../Sedes"
                  rel="noopener noreferrer"
                  className="flex items-center gap-x-2 text-gray-800 text-base font-medium hover:text-pink-600 transition-colors duration-300 justify-center lg:justify-start"
                >
                  <span>📍</span>
                  Nuestras Sedes
                </a>
                <a
                  href="../../../Conocenos"
                  rel="noopener noreferrer"
                  className="flex items-center gap-x-2 text-gray-800 text-base font-medium hover:text-pink-600 transition-colors duration-300 justify-center lg:justify-start"
                >
                  <span>💝</span>
                  Conócenos
                </a>
              </div>
            </div>

            {/* Contacto */}
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center justify-center lg:justify-start">
                <span className="mr-2">📞</span>
                Contacto
              </h3>
              <div className="space-y-1">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/573213098504"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-x-2 text-gray-800 text-base font-medium hover:text-pink-600 transition-colors duration-300 justify-center lg:justify-start"
                >
                  <FaWhatsapp className="text-green-500 text-xl" />
                  +57 321 309 85 04
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@delicias_darsy?_t=ZS-8waDD3RfXJk&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-x-2 text-gray-800 text-base font-medium hover:text-pink-600 transition-colors duration-300 justify-center lg:justify-start"
                >
                  <FaTiktok className="text-black text-xl" />
                  Delicias_Darsy
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/delicias_darsy?igsh=MTYwOWJoOTQ2djMwcg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-x-2 text-gray-800 text-base font-medium hover:text-pink-600 transition-colors duration-300 justify-center lg:justify-start"
                >
                  <FaInstagram className="text-pink-500 text-xl" />
                  @delicias_darsy
                </a>
              </div>
            </div>
          </div>

          {/* Línea divisoria */}
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
                © 2024 Delicias Darsy -{" "}
                <span className="text-pink-600 font-bold">Hecho con mucho amor</span> ✨
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
