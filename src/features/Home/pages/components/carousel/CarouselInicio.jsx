import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './CarouselInicio.css';
import imagenesApiService from '../../../../Admin/services/imagenesService';

function CarouselInicio({ buttonStyle }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);

  // Cargar imágenes del carrusel desde la API
  useEffect(() => {
    const cargarImagenesCarrusel = async () => {
      try {
        setLoading(true);
        const imagenesCarrusel = await imagenesApiService.obtenerImagenesCarrusel();
        
        if (imagenesCarrusel && imagenesCarrusel.length > 0) {
          // Extraer solo las URLs de las imágenes
          const urls = imagenesCarrusel.map(img => img.urlimg);
          setImages(urls);
        } else {
          // Fallback a imágenes locales si no hay imágenes en la API
          setImages([
            '/imagenes/Carousel/slider1.png',
            '/imagenes/Carousel/slider2.png',
            '/imagenes/Carousel/slider3.png',
          ]);
        }
        setError(null);
      } catch (error) {
        console.error('Error al cargar imágenes del carrusel:', error);
        setError('Error al cargar imágenes');
        // Fallback a imágenes locales en caso de error
        setImages([
          '/imagenes/Carousel/slider1.png',
          '/imagenes/Carousel/slider2.png',
          '/imagenes/Carousel/slider3.png',
        ]);
      } finally {
        setLoading(false);
      }
    };

    cargarImagenesCarrusel();
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.clientX || e.touches?.[0]?.clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) {
      return;
    }

    const touchEndX = e.clientX || e.changedTouches?.[0]?.clientX;
    const deltaX = touchStartX.current - touchEndX;

    if (deltaX > 50) {
      // Deslizar hacia la izquierda (siguiente)
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    } else if (deltaX < -50) {
      // Deslizar hacia la derecha (anterior)
      setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }

    touchStartX.current = null;
  };

  useEffect(() => {
    if (images.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const goToIndex = (newIndex) => {
    setActiveIndex(newIndex);
  };

  if (loading) {
    return (
      <div className="carousel slide" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Cargando carrusel...</div>
      </div>
    );
  }

  if (error && images.length === 0) {
    return (
      <div className="carousel slide" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Error al cargar el carrusel</div>
      </div>
    );
  }

  return (
    <div
      id="carouselExampleControls"
      className="carousel slide"
      data-bs-ride="carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <div className="carousel-indicators">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            data-bs-target="#carouselExampleControls"
            data-bs-slide-to={index}
            className={index === activeIndex ? 'active' : ''}
            aria-current={index === activeIndex ? 'true' : undefined}
            aria-label={`Slide ${index + 1}`}
            onClick={() => goToIndex(index)}
          ></button>
        ))}
      </div>
      <div className="carousel-inner">
        {images.map((image, index) => (
          <div key={index} className={`carousel-item ${index === activeIndex ? 'active' : ''}`}>
            <img 
              src={image} 
              className="d-block w-100" 
              alt={`Imagen ${index + 1}`} 
              draggable="false"
              onError={(e) => {
                console.error('Error al cargar imagen:', image);
                e.target.src = '/imagenes/Carousel/slider1.png'; // Imagen de fallback
              }}
            />
            {index === images.length - 1 && (
              <div className="carousel-caption d-none d-md-block">
                <Link to="/cartas" className="btn btn-primary btn-sm" style={buttonStyle}>Ver Productos</Link>
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleControls"
        data-bs-slide="prev"
        onClick={() => goToIndex((activeIndex - 1 + images.length) % images.length)}
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Anterior</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleControls"
        data-bs-slide="next"
        onClick={() => goToIndex((activeIndex + 1) % images.length)}
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Siguiente</span>
      </button>
    </div>
  );
}

export default CarouselInicio;