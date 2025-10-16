import React, { useState, useEffect } from 'react';
import './Sedes.css';
import { MapPin, Phone, Clock, Home, Navigation, Maximize2 } from 'lucide-react';
import sedeApiService from '../../Admin/services/sedes_services';

function Sedes() {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const [mostrarMapa, setMostrarMapa] = useState({});

  useEffect(() => {
    cargarSedes();
  }, []);

  const cargarSedes = async () => {
    try {
      setLoading(true);
      const sedesData = await sedeApiService.obtenerSedes();
      const sedesActivas = sedesData.filter(sede => sede.estado || sede.activo);
      setSedes(sedesActivas);
      setError(null);
    } catch (err) {
      console.error('Error al cargar sedes:', err);
      setError('No se pudieron cargar las sedes. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const geocodificarDireccion = async (direccion) => {
    try {
      const direccionCompleta = `${direccion}, Medellín, Colombia`;
      const encodedAddress = encodeURIComponent(direccionCompleta);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      
      return { lat: 6.2442, lng: -75.5812 };
    } catch (error) {
      console.error('Error en geocodificación:', error);
      return { lat: 6.2442, lng: -75.5812 };
    }
  };

  const toggleMapa = async (sede, e) => {
    if (e) e.stopPropagation();
    const sedeId = sede.id;
    setMostrarMapa(prev => ({
      ...prev,
      [sedeId]: !prev[sedeId]
    }));
  };

  const abrirModalMapa = (sede, e) => {
    if (e) e.stopPropagation();
    setSedeSeleccionada(sede);
  };

  const cerrarModal = () => {
    setSedeSeleccionada(null);
  };

  const abrirEnGoogleMaps = (direccion) => {
    const direccionEncoded = encodeURIComponent(`${direccion}, Medellín, Colombia`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${direccionEncoded}`, '_blank');
  };

  const MapaEmbed = ({ direccion, esModal = false }) => {
    const [coords, setCoords] = useState(null);

    useEffect(() => {
      geocodificarDireccion(direccion).then(setCoords);
    }, [direccion]);

    if (!coords) {
      return (
        <div className="mapa-loading">
          <div className="mapa-spinner"></div>
        </div>
      );
    }

    return (
      <div className="mapa-iframe-container">
        <iframe
          title="Mapa de ubicación"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=16&output=embed`}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="sedes-container">
        <h2 className="sedes-titulo">NUESTRAS SEDES</h2>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando sedes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sedes-container">
        <h2 className="sedes-titulo">NUESTRAS SEDES</h2>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={cargarSedes}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (sedes.length === 0) {
    return (
      <div className="sedes-container">
        <h2 className="sedes-titulo">NUESTRAS SEDES</h2>
        <div className="no-sedes-container">
          <p>No hay sedes disponibles en este momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sedes-container">
      <h2 className="sedes-titulo">NUESTRAS SEDES</h2>
      
      <div className="sedes-grid">
        {sedes.map((sede) => (
          <div key={sede.id} className="sede-card">
            <div className="sede-header">
              <h3 className="sede-nombre">{sede.nombre}</h3>
            </div>
            
            <div className="sede-visual-container">
              {!mostrarMapa[sede.id] ? (
                <div className="imagen-container">
                  <img 
                    src={sede.imagenUrl || 'https://via.placeholder.com/400x280/FFB6D9/FFFFFF?text=Sin+Imagen'} 
                    alt={sede.nombre}
                    className="sede-imagen"
                    onClick={() => abrirModalMapa(sede)}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x280/FFB6D9/FFFFFF?text=Imagen+no+disponible';
                    }}
                  />
                  <div className="imagen-overlay">
                    <button 
                      className="ver-mapa-overlay-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMapa(sede, e);
                      }}
                    >
                      <MapPin size={18} />
                      Ver Mapa
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mapa-wrapper" onClick={() => abrirModalMapa(sede)}>
                  <MapaEmbed direccion={sede.Direccion || sede.direccion} />
                  <button 
                    className="ampliar-mapa-icono"
                    onClick={(e) => abrirModalMapa(sede, e)}
                    title="Ampliar mapa"
                  >
                    <Maximize2 size={18} />
                  </button>
                  <button 
                    className="ver-imagen-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMapa(sede, e);
                    }}
                  >
                    Ver Imagen
                  </button>
                </div>
              )}
            </div>

            <div className="sede-info-container">
              <ul className="sede-info">
                <li>
                  <MapPin size={16} className="icon" />
                  <span>{sede.Direccion || sede.direccion}</span>
                </li>
                <li>
                  <Phone size={16} className="icon" />
                  <span>{sedeApiService.formatearTelefono(sede.Telefono || sede.telefono)}</span>
                </li>
                <li>
                  <Clock size={16} className="icon" />
                  <span>Lunes a viernes 10:30am - 05:30pm</span>
                </li>
                <li>
                  <Home size={16} className="icon" />
                  <span>Medellín - Antioquia</span>
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Modal compacto y centrado */}
      {sedeSeleccionada && (
        <div className="modal-overlay-compact" onClick={cerrarModal}>
          <div className="modal-mapa-compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-compact">
              <div className="modal-info-compact">
                <h3 className="modal-titulo-compact">{sedeSeleccionada.nombre}</h3>
                <p className="modal-direccion-compact">
                  <MapPin size={14} />
                  {sedeSeleccionada.Direccion || sedeSeleccionada.direccion}
                </p>
              </div>
              <button className="modal-cerrar-btn-compact" onClick={cerrarModal}>
                ×
              </button>
            </div>
            
            <div className="modal-body-compact">
              <MapaEmbed 
                direccion={sedeSeleccionada.Direccion || sedeSeleccionada.direccion}
                esModal={true}
              />
            </div>

            <div className="modal-footer-compact">
              <button 
                className="modal-google-maps-btn-compact"
                onClick={() => abrirEnGoogleMaps(sedeSeleccionada.Direccion || sedeSeleccionada.direccion)}
              >
                <Navigation size={16} />
                Abrir en Google Maps
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sedes;