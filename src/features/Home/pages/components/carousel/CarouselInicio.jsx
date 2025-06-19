import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './CarouselInicio.css';
<link href="https://fonts.googleapis.com/css2?family=Fredoka&display=swap" rel="stylesheet" />

function CarouselInicio({ buttonStyle }) {
  const images = [
    '/imagenes/Carousel/slider1.png',
    '/imagenes/Carousel/slider2.png',
    '/imagenes/Carousel/slider3.png',
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);

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
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const goToIndex = (newIndex) => {
    setActiveIndex(newIndex);
  };

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
            <img src={image} className="d-block w-100" alt={`Imagen ${index + 1}`} draggable="false" />
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