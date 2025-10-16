import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import './conocenos.css';

const Conocenos = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalContenido, setModalContenido] = useState(null);
  const [imagenes, setImagenes] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    cargarImagenes();
  }, []);

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

  const abrirModal = (contenido) => {
    setModalContenido(contenido);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const slides = [
    {
      id: 1,
      number: "01",
      title: "¿Quiénes somos?",
      content: {
        logo: imagenes[3],
        socialHandle: "@delicias_Darsy",
        phone: "321 309 65 04",
        textTitle: "Nuestra Historia",
        text: "En Delicias Darsy nacimos en 2015 de la pasión por endulzar la vida de las personas. Desde entonces, hemos crecido hasta convertirnos en un referente de postres artesanales en la región.",
        highlights: [
          "Más de 9 años de experiencia",
          "Productos 100% artesanales",
          "Ingredientes de primera calidad",
          "Atención personalizada"
        ],
        images: [
          imagenes[3],
          imagenes[4],
        ],
        buttonText: "Conoce más sobre nosotros",
        modalContent: {
          title: "Nuestra Pasión por los Postres",
          subtitle: "Una historia de amor y dedicación",
          description: "Desde nuestros inicios en 2015, en Delicias Darsy hemos trabajado incansablemente para crear experiencias únicas a través de nuestros postres artesanales. Cada receta es elaborada con amor, dedicación y los mejores ingredientes.",
          features: [
            {
              icon: "🎂",
              title: "Tradición Familiar",
              text: "Recetas transmitidas de generación en generación"
            },
            {
              icon: "✨",
              title: "Innovación",
              text: "Siempre buscando nuevos sabores"
            },
            {
              icon: "❤️",
              title: "Hecho con Amor",
              text: "Cada postre con dedicación"
            }
          ],
          gallery: [
            imagenes[3],
            imagenes[4],
            imagenes[5],
            imagenes[6]
          ].filter(Boolean)
        }
      }
    },
    {
      id: 2,
      number: "02",
      title: "Nuestras Sedes",
      content: {
        textTitle: "Encuéntranos",
        text: "Contamos con varias sedes estratégicamente ubicadas para que puedas disfrutar de nuestros productos frescos en un ambiente acogedor y familiar.",
        highlights: [
          "Ambientes cómodos y modernos",
          "Atención de calidad",
          "Productos siempre frescos",
          "Fácil acceso y parqueadero"
        ],
        images: [
          imagenes[4],
          imagenes[5],
          imagenes[6],
        ].filter(Boolean),
        stats: [
          { number: "4+", label: "Sedes" },
          { number: "10k+", label: "Clientes" },
          { number: "9+", label: "Años" }
        ],
        buttonText: "Ver nuestras sedes",
        modalContent: {
          title: "Nuestras Sedes",
          subtitle: "Visítanos y vive la experiencia Delicias Darsy",
          description: "Cada una de nuestras sedes está diseñada para brindarte la mejor experiencia. Desde el momento en que entras, te recibimos con una sonrisa y el aroma delicioso de nuestros productos recién horneados.",
          locations: [
            {
              name: "Sede Principal",
              address: "Medellín, Antioquia",
              hours: "Lun - Sáb: 8:00 AM - 8:00 PM",
              phone: "321 309 65 04"
            },
            {
              name: "Sede Centro",
              address: "Centro comercial",
              hours: "Lun - Dom: 10:00 AM - 9:00 PM",
              phone: "321 309 65 04"
            }
          ],
          gallery: [
            imagenes[4],
            imagenes[5],
            imagenes[6],
            imagenes[7]
          ].filter(Boolean)
        }
      }
    },
    {
      id: 3,
      number: "03",
      title: "Cotizaciones y Pedidos",
      content: {
        textTitle: "Pedidos Personalizados",
        text: "Creamos el postre perfecto para tu evento especial. Trabajamos contigo para diseñar postres únicos que superen tus expectativas y hagan de tu celebración un momento inolvidable.",
        highlights: [
          "Diseños personalizados",
          "Cotización sin compromiso",
          "Entrega puntual garantizada",
          "Asesoría personalizada"
        ],
        images: [
          imagenes[5],
          imagenes[6],
          imagenes[7],
        ].filter(Boolean),
        stats: [
          { number: "500+", label: "Eventos" },
          { number: "100%", label: "Satisfacción" },
          { number: "24h", label: "Respuesta" }
        ],
        buttonText: "Solicitar cotización",
        modalContent: {
          title: "Cotizaciones Personalizadas",
          subtitle: "Tu evento merece el mejor postre",
          description: "Nuestro equipo de expertos está listo para ayudarte a crear el postre perfecto para cualquier ocasión: bodas, cumpleaños, eventos corporativos, baby showers y mucho más.",
          services: [
            {
              icon: "🎂",
              title: "Tortas de Ocasión",
              text: "Diseños únicos para celebraciones"
            },
            {
              icon: "🧁",
              title: "Mesas de Postres",
              text: "Variedad para tus invitados"
            },
            {
              icon: "🍪",
              title: "Catering",
              text: "Servicio completo para eventos"
            }
          ],
          process: [
            "Cuéntanos sobre tu evento",
            "Diseñamos una propuesta personalizada",
            "Aprobamos detalles y confirmamos",
            "Entregamos en la fecha acordada"
          ],
          gallery: [
            imagenes[5],
            imagenes[6],
            imagenes[7],
            imagenes[8]
          ].filter(Boolean)
        }
      }
    }
  ];

  if (loading) {
    return (
      <div className="conocenos-container">
        <div className="page-content">
          <h1 className="page-title">¡Conócenos somos Delicias Darsy!</h1>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🍰</div>
            Cargando contenido delicioso...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="conocenos-container">
      <div className={`page-content ${isVisible ? 'fade-in' : ''}`}>
        <h1 className="page-title">¡Conócenos somos Delicias Darsy!</h1>
        <p className="page-subtitle">
          Descubre nuestra historia, visita nuestras sedes y conoce cómo podemos hacer realidad el postre de tus sueños
        </p>
        
        <div className="timeline-carousel-wrapper">
          <div className="timeline-carousel-container">
            <div 
              className="timeline-carousel"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide) => (
                <div key={slide.id} className="timeline-slide">
                  <div className="timeline-card">
                    <div className="card-header">
                      <div className="card-number">{slide.number}</div>
                      <h2 className="card-title">{slide.title}</h2>
                    </div>
                    
                    <div className="card-content">
                      <div className="card-left">
                        {slide.content.logo && (
                          <div className="logo-section">
                            <div className="logo-circle">
                              <img 
                                src={slide.content.logo} 
                                alt="Logo Delicias Darsy" 
                                className="logo-image"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/110x110?text=Logo';
                                }}
                              />
                            </div>
                            {slide.content.socialHandle && (
                              <div className="contact-info">
                                <p className="social-handle">{slide.content.socialHandle}</p>
                                <p className="phone-number">{slide.content.phone}</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="text-section">
                          <h3>{slide.content.textTitle}</h3>
                          <p>{slide.content.text}</p>
                          {slide.content.highlights && (
                            <ul>
                              {slide.content.highlights.map((highlight, i) => (
                                <li key={i}>{highlight}</li>
                              ))}
                            </ul>
                          )}
                          <button 
                            className="pink-button"
                            onClick={() => abrirModal(
                              <ModalContentComponent content={slide.content.modalContent} />
                            )}
                          >
                            {slide.content.buttonText}
                          </button>
                        </div>
                      </div>
                      
                      <div className="card-right">
                        {slide.content.images && slide.content.images.length > 0 && (
                          <div className="image-gallery">
                            {slide.content.images.slice(0, 3).map((img, i) => (
                              <div 
                                key={i} 
                                className={`gallery-item ${i === 0 ? 'featured' : ''}`}
                              >
                                <img 
                                  src={img || `https://via.placeholder.com/300x200?text=Imagen+${i + 1}`} 
                                  alt={`${slide.title} ${i + 1}`} 
                                  className="gallery-image"
                                  onError={(e) => {
                                    e.target.src = `https://via.placeholder.com/300x200?text=Imagen+${i + 1}`;
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {slide.content.stats && (
                          <div className="stats-section">
                            {slide.content.stats.map((stat, i) => (
                              <div key={i} className="stat-item">
                                <span className="stat-number">{stat.number}</span>
                                <span className="stat-label">{stat.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="carousel-controls">
            <button 
              className="carousel-button" 
              onClick={prevSlide}
              disabled={currentSlide === 0}
              aria-label="Anterior"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            <div className="carousel-dots">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              className="carousel-button" 
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              aria-label="Siguiente"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {modalAbierto && (
        <Modal onClose={cerrarModal}>
          {modalContenido}
        </Modal>
      )}
    </div>
  );
};

// Componente para el contenido del modal
const ModalContentComponent = ({ content }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!content) return null;

  const gallery = content.gallery || [];
  const hasGallery = gallery.length > 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div>
      <h2>{content.title}</h2>
      {content.subtitle && (
        <p className="modal-subtitle">{content.subtitle}</p>
      )}
      
      <p style={{ marginBottom: '1.25rem' }}>
        {content.description}
      </p>

      {hasGallery && (
        <div className="modal-carousel">
          <img 
            src={gallery[currentImageIndex] || 'https://via.placeholder.com/600x240'}
            alt={`Galería ${currentImageIndex + 1}`}
            className="modal-carousel-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x240?text=Imagen';
            }}
          />
          {gallery.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="modal-carousel-button prev"
                aria-label="Imagen anterior"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="modal-carousel-button next"
                aria-label="Siguiente imagen"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              <div className="modal-carousel-dots">
                {gallery.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`modal-carousel-dot ${currentImageIndex === index ? 'active' : ''}`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {content.features && (
        <div className="modal-features">
          {content.features.map((feature, index) => (
            <div key={index} className="modal-feature-item">
              <div className="modal-feature-icon">{feature.icon}</div>
              <div className="modal-feature-title">{feature.title}</div>
              <div className="modal-feature-text">{feature.text}</div>
            </div>
          ))}
        </div>
      )}

      {content.services && (
        <>
          <h3>Nuestros Servicios</h3>
          <div className="modal-services">
            {content.services.map((service, index) => (
              <div key={index} className="modal-service-item">
                <div className="modal-service-icon">{service.icon}</div>
                <div>
                  <div className="modal-service-title">{service.title}</div>
                  <div className="modal-service-text">{service.text}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {content.locations && (
        <>
          <h3>Nuestras Ubicaciones</h3>
          <div className="modal-locations">
            {content.locations.map((location, index) => (
              <div key={index} className="modal-location-item">
                <div className="modal-location-title">📍 {location.name}</div>
                <div className="modal-location-info">
                  <strong>Dirección:</strong> {location.address}
                </div>
                <div className="modal-location-info">
                  <strong>Horario:</strong> {location.hours}
                </div>
                <div className="modal-location-info">
                  <strong>Teléfono:</strong> {location.phone}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {content.process && (
        <>
          <h3>¿Cómo Funciona?</h3>
          <div className="modal-process">
            {content.process.map((step, index) => (
              <div key={index} className="modal-process-step">
                <div className="modal-process-number">{index + 1}</div>
                <p className="modal-process-text">{step}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="modal-cta">
        <p className="modal-cta-title">¿Listo para endulzar tu vida? 🍰</p>
        <p className="modal-cta-text">Contáctanos: 321 309 65 04</p>
      </div>
    </div>
  );
};

export default Conocenos;