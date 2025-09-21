import React, { useState, useEffect } from "react";

function Header() {
  // Array de imágenes que se van a rotar
  const images = [
    "/imagenes/Cartas/donas.png",
    "/imagenes/Cartas/arrozConLeche.jpg",
    "/imagenes/Cartas/obleas.jpeg",
    "/imagenes/Cartas/sandwches.jpeg",
    "/imagenes/Cartas/Logo.jpeg"
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Cambiar imagen automáticamente cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Función para manejar el clic del botón
  const handleVerPedidos = () => {
    // Aquí puedes agregar la navegación a la sección de pedidos
    // Por ejemplo, usando React Router: navigate('/pedidos')
    // O scroll a una sección: document.getElementById('pedidos').scrollIntoView()
    console.log("Navegando a pedidos...");
    
    // Ejemplo de scroll suave a una sección
    const pedidosSection = document.getElementById('pedidos');
    if (pedidosSection) {
      pedidosSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="header bg-gradient-to-r from-pink-200 via-pink-300 to-yellow-200 relative overflow-hidden min-h-[300px] flex items-center justify-center">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-16 h-16 bg-pink-400 rounded-full animate-bounce"></div>
        <div className="absolute top-20 right-20 w-12 h-12 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-purple-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-pink-500 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Patrón de puntos decorativos */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <defs>
            <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="1" fill="white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>
      </div>

      <div className="container mx-auto px-3 flex flex-col lg:flex-row items-center justify-between relative z-10">
        {/* Sección de imágenes */}
        <div className="flex-1 relative mb-8 lg:mb-0">
          <div className="relative">
            {/* Imagen principal que cambia automáticamente */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-4 shadow-xl">
                <img 
                  src={images[currentImageIndex]} 
                  alt="Productos artesanales" 
                  className="w-full h-64 object-contain rounded-xl transform group-hover:scale-105 transition-all duration-500" 
                />
                
                {/* Indicador de transición */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-pink-500 w-6' 
                          : 'bg-pink-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {/* Brillo decorativo */}
              <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-300 rounded-full opacity-80 animate-ping"></div>
            </div>

            {/* Elementos flotantes alrededor de la imagen */}
            <div className="absolute -top-6 -left-6 bg-white rounded-full p-3 shadow-lg animate-bounce">
              <span className="text-2xl">🍩</span>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg animate-bounce delay-300">
              <span className="text-2xl">🧁</span>
            </div>
            <div className="absolute top-1/2 -left-8 bg-white rounded-full p-2 shadow-lg animate-pulse">
              <span className="text-xl">🍰</span>
            </div>
          </div>
        </div>

        {/* Sección de texto */}
        <div className="flex-1 text-center lg:text-left lg:pl-12">
          {/* Título principal */}
          <div className="mb-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-black drop-shadow-lg">
              <span className="text-black">
                En Delicias
              </span>
            </h1>

            <h1 className="text-4xl lg:text-5xl font-bold text-black drop-shadow-lg">
              <span className="text-black">
                Darsy
              </span>
            </h1>

            {/* Línea decorativa */}
            <div className="w-20 h-1 bg-gradient-to-r from-pink-400 to-yellow-400 mx-auto lg:mx-0 mt-3 rounded-full"></div>
          </div>

          {/* Descripción */}
          <div className="mb-4">
            <p className="text-lg lg:text-xl text-white drop-shadow-md mb-3 font-medium">
              Descubre sabores únicos que 
              <span className="text-yellow-200 font-bold"> endulzan </span>
              cada momento.
            </p>
            
            {/* Frase especial con diseño destacado */}
            <div className="bg-white bg-opacity-90 rounded-full px-4 py-2 inline-block shadow-lg transform hover:scale-105 transition-transform duration-300">
              <p className="text-base text-pink-600 font-bold">
                ✨ "Hechos con mucho amor" ✨
              </p>
            </div>
          </div>

          {/* Botón Ver Pedidos */}
          <div className="text-center">
            <button 
              onClick={handleVerPedidos}
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-3xl group"
            >
              <div className="flex items-center justify-center">
                <span className="text-xl mr-3 group-hover:animate-bounce">🛍️</span>
                <span className="text-xl">Ver Pedidos</span>
              </div>
              <div className="text-sm opacity-90 mt-1">
                Explora nuestros deliciosos productos
              </div>
            </button>
            
            {/* Información adicional */}
            <p className="text-sm text-white drop-shadow-md mt-3 opacity-90">
              📞 Contacto: 321 309 85 04
            </p>
          </div>
        </div>
      </div>

      {/* Ondas decorativas en la parte inferior */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 fill-white">
          <path d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z"></path>
        </svg>
      </div>
    </div>
  );
}

export default Header;