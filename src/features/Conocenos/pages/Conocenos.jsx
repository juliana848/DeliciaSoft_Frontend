import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import './conocenos.css';

const Conocenos = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalContenido, setModalContenido] = useState(null);
  const [imagenes, setImagenes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    cargarImagenes();
  }, []);

  // Cargar las imágenes desde la API
  const cargarImagenes = async () => {
    try {
      const response = await fetch('https://deliciasoft-backend.onrender.com/api/imagenes');
      const data = await response.json();
      
      // Mapear las imágenes por ID para fácil acceso
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

  const modalInfo = [
    {
      id: 1,
      titulo: "¿Quienes somos?",
      boton: "Quiénes Somos",
      contenido: (
        <div className="modal-content modal-decorative-border">
          <h2>En Delicias Darsy nacimos de la pasión</h2>
          <p>
            Por endulzar la vida de las personas con nuestros postres artesanales elaborados con amor y dedicación. Desde nuestros inicios en el 2015 hasta el día de hoy, trabajamos para brindar experiencias únicas en cada bocado.
          </p>
        </div>
      ),
    },
    {
      id: 2,
      titulo: "Sobre nuestras sedes",
      boton: "Sedes",
      contenido: (
        <div className="modal-content modal-decorative-border">
          <h2>Contamos con diversas sedes donde</h2>
          <p>
            Podrás disfrutar de un ambiente acogedor y de toda nuestra variedad de productos frescos y de calidad. Nuestro compromiso es crear experiencias deliciosas para cualquier ocasión.
          </p>
        </div>
      ),
    },
    {
      id: 3,
      titulo: "Cotizaciones y pedidos",
      boton: "Cotizaciones personalizadas",
      contenido: (
        <div className="modal-content modal-decorative-border">
          <h2>Cotizaciones personalizadas para tus eventos</h2>
          <p>
            Te ofrecemos cotizaciones personalizadas para cualquier ocasión especial. Nuestro equipo está listo para ayudarte a crear el postre perfecto para tu evento.
          </p>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="conocenos-container">
        <div className="page-content">
          <h1 className="page-title">¡Conócenos somos Delicias Darsy!</h1>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Cargando contenido...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="conocenos-container">
      <div className={`page-content ${isVisible ? 'fade-in' : ''}`}>
        <h1 className="page-title">¡Conócenos somos Delicias Darsy!</h1>
        
        <div className="zigzag-timeline">
          <div className="center-line"></div>
          
          <div className="zigzag-item right-item">
            <div className="zigzag-marker">
              <span>1</span>
            </div>
            <h2 className="zigzag-title title-left">{modalInfo[0].titulo}</h2>
            
            <div className="zigzag-content">
              <div className="logo-circle">
                <img 
                  src={imagenes[3] || 'https://via.placeholder.com/150x150?text=Logo'} 
                  alt="Logo" 
                  className="logo-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150x150?text=Error+logo';
                  }}
                />
              </div>
              <div className="item-info">
                <p className="social-handle">@delicias_Darsy</p>
                <p className="phone-number">321 309 65 04</p>
              </div>
              <button 
                className="pink-button"
                onClick={() => abrirModal(modalInfo[0].contenido)}
              >
                {modalInfo[0].boton}
              </button>
            </div>
          </div>
          
          <div className="zigzag-item left-item">
            <div className="zigzag-marker">
              <span>2</span>
            </div>
            <h2 className="zigzag-title title-right">{modalInfo[1].titulo}</h2>
            
            <div className="zigzag-content">
              <div className="image-container">
                <img 
                  src={imagenes[4] || 'https://via.placeholder.com/300x200?text=Tienda'} 
                  alt="Tienda" 
                  className="item-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Error+tienda';
                  }}
                />
              </div>
              <button 
                className="pink-button"
                onClick={() => abrirModal(modalInfo[1].contenido)}
              >
                {modalInfo[1].boton}
              </button>
            </div>
          </div>
          
          <div className="zigzag-item right-item">
            <div className="zigzag-marker">
              <span>3</span>
            </div>
            <h2 className="zigzag-title title-left">{modalInfo[2].titulo}</h2>
            
            <div className="zigzag-content">
              <div className="image-container">
                <img 
                  src={imagenes[5] || 'https://via.placeholder.com/300x200?text=Postre'} 
                  alt="Postre" 
                  className="item-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Error+postre';
                  }}
                />
              </div>
              <button 
                className="pink-button"
                onClick={() => abrirModal(modalInfo[2].contenido)}
              >
                {modalInfo[2].boton}
              </button>
            </div>
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

export default Conocenos;