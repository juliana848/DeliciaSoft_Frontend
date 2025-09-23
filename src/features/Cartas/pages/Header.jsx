import React, { useState, useEffect } from "react";

function Header() {
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Traer imágenes desde la API
  useEffect(() => {
    fetch("https://deliciasoft-backend.onrender.com/api/imagenes")
      .then((res) => res.json())
      .then((data) => {
        let arr = [];
        if (Array.isArray(data)) {
          arr = data.map((item) => item.urlimg);
        } else if (data.urlimg) {
          arr = [data.urlimg];
        } else if (data.imagenes) {
          arr = data.imagenes.map((item) => item.urlimg);
        }
        setImages(arr);
      })
      .catch((err) => console.error("Error cargando imágenes", err));
  }, []);

  // Rotar imágenes cada 3s
  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="header bg-gradient-to-r from-pink-200 via-pink-300 to-yellow-200 relative overflow-hidden min-h-[500px] flex items-center justify-center">
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
              <circle cx="5" cy="5" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="container mx-auto px-3 flex flex-col lg:flex-row items-center justify-between relative z-10">
        {/* Sección de imágenes */}
        <div className="flex-1 relative mb-6 lg:mb-0">
          <div className="relative group">
            {/* Card + imagen */}
            <div className="bg-white rounded-3xl p-3 shadow-xl">
              {images.length > 0 && (
                <img
                  src={images[currentImageIndex]}
                  alt="Productos artesanales"
                  className="w-full h-80 object-cover rounded-3xl transform group-hover:scale-105 transition-all duration-500"
                />
              )}

              {/* Indicadores */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? "bg-pink-500 w-6"
                        : "bg-pink-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Elementos flotantes alrededor */}
            <div className="absolute -top-6 -left-6 bg-white rounded-full p-2 shadow-lg animate-bounce">
              <span className="text-xl">🍩</span>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-2 shadow-lg animate-bounce delay-300">
              <span className="text-xl">🧁</span>
            </div>
            <div className="absolute top-1/2 -left-8 bg-white rounded-full p-1 shadow-lg animate-pulse">
              <span className="text-lg">🍰</span>
            </div>
          </div>
        </div>

        {/* Sección de texto */}
        <div className="flex-1 text-center lg:text-left lg:pl-12">
          <div className="mb-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-black drop-shadow-lg">
              <span className="text-black">En Delicias Darsy</span>
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-pink-400 to-yellow-400 mx-auto lg:mx-0 mt-3 rounded-full"></div>
          </div>

          {/* Descripción */}
          <div className="mb-4">
            <p className="text-lg lg:text-xl text-white drop-shadow-md mb-3 font-medium">
              Descubre sabores únicos que{" "}
              <span className="text-yellow-200 font-bold">endulzan</span> cada
              momento.
            </p>

            <div className="bg-white bg-opacity-90 rounded-full px-4 py-2 inline-block shadow-lg transform hover:scale-105 transition-transform duration-300">
              <p className="text-base text-pink-600 font-bold">
                ✨ "Hechos con mucho amor" ✨
              </p>
            </div>
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
