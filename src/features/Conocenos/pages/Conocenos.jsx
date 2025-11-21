import React, { useState, useEffect } from 'react';
import './conocenos.css';
import cup from "./cup.png";
import cup2 from "./cup2.png";

// Estados para controlar visibilidad, imágenes y carga
const Conocenos = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [imagenes, setImagenes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    cargarImagenes();
  }, []);

  // Función para obtener las imágenes desde el backend
  const cargarImagenes = async () => {
    try {
      const response = await fetch('https://deliciasoft-backend.onrender.com/api/imagenes');
      const data = await response.json();
      
      const imagenesMap = {};
      data.forEach(imagen => {
        imagenesMap[imagen.idimagen] = imagen.urlimg;
      });
      
      setImagenes(imagenesMap);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar las imágenes:', error);
      setLoading(false);
    }
  };

  // Pantalla de carga
  if (loading) {
    return (
      <div className="conocenos-container">
        <div className="hero-header">
          <h1 className="hero-title">Conócenos</h1>
          <p className="hero-subtitle">
            Descubre nuestra historia de amor por la repostería y cómo cada postre lleva un pedacito de nuestro corazón
          </p>
        </div>
        <div className="page-content">
          <div style={{ textAlign: 'center', padding: '2rem', color: '#ec4899' }}>
            <div style={{ 
              display: 'inline-block', 
              width: '40px', 
              height: '40px', 
              border: '4px solid #fbcfe8',
              borderTop: '4px solid #ec4899',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '1rem' }}>Cargando contenido...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="conocenos-container">
      {/* Hero Header */}
      <div className="hero-header">
      <div className="floating-decorations">
          <img src={cup2} alt="" className="float-cupcake float-1" />
          <img src={cup2} alt="" className="float-cupcake float-2" />
          <img src={cup2} alt="" className="float-cupcake float-3" />
          <img src={cup2} alt="" className="float-cupcake float-4" />
          <img src={cup2} alt="" className="float-cupcake float-5" />
          <img src={cup2} alt="" className="float-cupcake float-6" />
          <img src={cup2} alt="" className="float-cupcake float-7" />
          <img src={cup2} alt="" className="float-cupcake float-8" />
        </div>
        <h1 className="hero-title">Conócenos</h1>
        <p className="hero-subtitle">
          Descubre nuestra historia de amor por la repostería y cómo cada postre lleva un pedacito de nuestro corazón
        </p>
      </div>

     <div className={`page-content ${isVisible ? 'fade-in' : ''}`}>
  <div className="section-header">
    <h2
      style={{
        fontSize: "2.5rem",
        fontWeight: "700",
        textAlign: "center",
        color: "#2C3E50",
        position: "relative",
        display: "inline-block",
        marginBottom: "1rem",
      }}
    >
      Nuestra Historia
      <span
        style={{
          display: "block",
          width: "80px",
          height: "4px",
          background: "linear-gradient(90deg, #FF1493, #FFCC00)",
          borderRadius: "2px",
          margin: "0.5rem auto 0 auto",
        }}
      ></span>
    </h2>
          <div className="title-underline"></div>
          <p className="section-subtitle">Una historia de pasión, dedicación y mucho amor por crear momentos dulces</p>
        </div>
        
        <div className="zigzag-timeline">
          <div className="center-line"></div>
          
          {/* 2020 - Nuestros Inicios */}
          <div className="timeline-row">
            <div className="timeline-left">
              <div className="timeline-year">2020</div>
              <h3 className="timeline-title">Nuestros Inicios</h3>
              <div className="timeline-card">
                <div className="card-image-container">
                  <img 
                    src={imagenes[3] || 'https://via.placeholder.com/270x180?text=Inicios'} 
                    alt="Nuestros Inicios" 
                    className="card-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/270x180?text=Inicios';
                    }}
                  />
                </div>
                <p className="card-text">
                  Hace cuatro años, en el 2020, todo empezó con ventas por pedido. Cada postre era preparado con amor desde casa, llevando dulzura directamente a nuestros primeros clientes.
                </p>
              </div>
            </div>

            <div className="timeline-center">
              <div className="timeline-marker">
                <svg className="marker-icon" viewBox="0 0 24 24" fill="white">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>

            <div className="timeline-right">
              <div className="side-card">
                <div className="side-icon-wrapper">
                  <svg className="side-icon" viewBox="0 0 24 24" fill="#ec4899">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <h4 className="side-title">Desde Casa</h4>
                <p className="side-text">Cada postre hecho con dedicación y cariño familiar</p>
              </div>
            </div>
          </div>

          {/* Feb 2023 - Primer Carrito */}
          <div className="timeline-row">
            <div className="timeline-left">
              <div className="side-card">
                <div className="side-icon-wrapper">
                  <svg className="side-icon" viewBox="0 0 24 24" fill="#ec4899">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                </div>
                <h4 className="side-title">Primera Expansión</h4>
                <p className="side-text">El primer paso hacia nuestro sueño de llegar a más personas</p>
              </div>
            </div>

            <div className="timeline-center">
              <div className="timeline-marker">
                <svg className="marker-icon" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
            </div>

            <div className="timeline-right">
              <div className="timeline-year">Feb 2023</div>
              <h3 className="timeline-title">Primer Carrito - San Pablo</h3>
              <div className="timeline-card">
                <div className="card-image-container">
                  <img 
                    src={imagenes[4] || 'https://via.placeholder.com/270x180?text=San+Pablo'} 
                    alt="Carrito San Pablo" 
                    className="card-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/270x180?text=San+Pablo';
                    }}
                  />
                </div>
                <p className="card-text">
                  El año pasado en febrero dimos el gran paso: colocamos nuestro primer carrito en San Pablo. Fue emocionante ver cómo la gente se acercaba a probar nuestros postres.
                </p>
              </div>
            </div>
          </div>

          {/* Jun 2023 - Segundo Carrito */}
          <div className="timeline-row">
            <div className="timeline-left">
              <div className="timeline-year">Jun 2023</div>
              <h3 className="timeline-title">Segundo Carrito - San Benito</h3>
              <div className="timeline-card">
                <div className="card-image-container">
                  <img 
                    src="https://res.cloudinary.com/dagnilue0/image/upload/v1759362122/sedes/ndt1wkrxwe083ft7qadb.jpg"
                    alt="Carrito San Benito" 
                    className="card-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/270x180?text=San+Benito';
                    }}
                  />
                </div>
                <p className="card-text">
                  En junio del año pasado expandimos con nuestro segundo carrito en San Benito. Cada nueva ubicación nos permitía compartir nuestro amor por los postres con más familias.
                </p>
              </div>
            </div>

            <div className="timeline-center">
              <div className="timeline-marker">
                <svg className="marker-icon" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            </div>

            <div className="timeline-right">
              <div className="side-card">
                <div className="side-icon-wrapper">
                  <svg className="side-icon" viewBox="0 0 24 24" fill="#ec4899">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <h4 className="side-title">Crecimiento Continuo</h4>
                <p className="side-text">Expandiendo la alegría a nuevos rincones de la ciudad</p>
              </div>
            </div>
          </div>

          {/* 2024 - Presente */}
          <div className="timeline-row">
            <div className="timeline-left">
              <div className="side-card">
                <div className="side-icon-wrapper">
                  <svg className="side-icon" viewBox="0 0 24 24" fill="#ec4899">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h4 className="side-title">Nuestro Presente</h4>
                <p className="side-text">Construyendo una comunidad dulce día a día</p>
              </div>
            </div>

            <div className="timeline-center">
              <div className="timeline-marker">
                <svg className="marker-icon" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>

            <div className="timeline-right">
              <div className="timeline-year">2024</div>
              <h3 className="timeline-title">Dulces Momentos</h3>
              <div className="timeline-card">
                <div className="card-image-container">
                  <img 
                    src={imagenes[5] || 'https://via.placeholder.com/270x180?text=Presente'} 
                    alt="Delicias Darsy Hoy" 
                    className="card-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/270x180?text=Presente';
                    }}
                  />
                </div>
                <p className="card-text">
                  Hoy seguimos creciendo y creando momentos especiales a través de nuestros postres. Cada cliente es parte de nuestra gran familia dulce. ¡Gracias por acompañarnos en este camino!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conocenos;