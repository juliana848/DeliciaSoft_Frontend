// AgregarRellenosModal.jsx - VERSIÓN CON ESTILO UNIFICADO
import React, { useState, useEffect } from 'react';
import './EstilosModalesComunes.css';

const API_URLS = {
  rellenos: 'https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-relleno',
  insumos: 'https://deliciasoft-backend-i6g9.onrender.com/api/insumos',
  imagenes: 'https://deliciasoft-backend-i6g9.onrender.com/api/imagenes'
};

const AgregarRellenosModal = ({ onClose, onAgregar, limiteMaximo = null }) => {
  const [selectedRellenos, setSelectedRellenos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rellenosData, setRellenosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRellenosConImagenes();
  }, []);

  const getImagenInsumo = async (idinsumos) => {
    if (!idinsumos) return null;
    try {
      const insumosRes = await fetch(API_URLS.insumos);
      if (!insumosRes.ok) return null;
      const insumosData = await insumosRes.json();
      const insumo = Array.isArray(insumosData) 
        ? insumosData.find(i => parseInt(i.idinsumo) === parseInt(idinsumos))
        : null;
      if (!insumo) return null;
      if (insumo.idimagen) {
        try {
          const imageUrl = `${API_URLS.imagenes}/${insumo.idimagen}`;
          const imageResponse = await fetch(imageUrl);
          if (imageResponse.ok) {
            const contentType = imageResponse.headers.get('content-type');
            if (contentType && contentType.startsWith('image/')) return imageUrl;
            if (contentType && contentType.includes('json')) {
              const imageData = await imageResponse.json();
              const imageUrlFromData = imageData.urlimg || imageData.url || imageData.ruta || 
                imageData.urlimagen || imageData.imagenUrl || imageData.imagen ||
                imageData.path || imageData.src;
              if (imageUrlFromData) {
                if (imageUrlFromData.startsWith('/')) {
                  return `https://deliciasoft-backend-i6g9.onrender.com${imageUrlFromData}`;
                }
                if (imageUrlFromData.startsWith('data:image')) return imageUrlFromData;
                return imageUrlFromData;
              }
              if (imageData.data && imageData.data.url) return imageData.data.url;
            }
          }
        } catch (error) {
          console.error(`Error obteniendo imagen:`, error);
        }
        return `${API_URLS.imagenes}/${insumo.idimagen}`;
      }
      if (insumo.imagenes) {
        if (insumo.imagenes.idimagenes) return `${API_URLS.imagenes}/${insumo.imagenes.idimagenes}`;
        if (insumo.imagenes.url || insumo.imagenes.ruta) return insumo.imagenes.url || insumo.imagenes.ruta;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener imagen del insumo:', error);
      return null;
    }
  };

  const getPlaceholderImage = (nombre) => {
    const inicial = nombre?.charAt(0).toUpperCase() || 'R';
    return `https://via.placeholder.com/100x100/9C27B0/FFFFFF?text=${encodeURIComponent(inicial)}`;
  };

  const fetchRellenosConImagenes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(API_URLS.rellenos, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const rellenosActivos = data.filter(relleno => relleno.estado === true);
      const rellenosPromises = rellenosActivos.map(async (r) => {
        const imagenInsumo = await getImagenInsumo(r.idinsumos);
        const rellenoId = String(r.idrelleno || r.id);
        return {
          id: rellenoId,
          nombre: r.nombre,
          precio: 0,
          imagen: imagenInsumo || getPlaceholderImage(r.nombre),
          unidad: 'g',
          cantidad: 1
        };
      });
      const rellenosConImagenes = await Promise.all(rellenosPromises);
      setRellenosData(rellenosConImagenes);
    } catch (error) {
      console.error('Error al obtener rellenos:', error);
      setError('Error al cargar rellenos');
      setRellenosData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRellenos = rellenosData.filter(relleno =>
    relleno.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRelleno = (relleno) => {
    setSelectedRellenos(prev => {
      const existe = prev.find(r => r.id === relleno.id);
      if (existe) {
        return prev.filter(r => r.id !== relleno.id);
      } else {
        if (limiteMaximo !== null && prev.length >= limiteMaximo) {
          alert(`⚠️ Solo puedes seleccionar máximo ${limiteMaximo} relleno${limiteMaximo > 1 ? 's' : ''}`);
          return prev;
        }
        return [...prev, { ...relleno, cantidad: 1 }];
      }
    });
  };

  const handleAgregar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedRellenos.length === 0) {
      alert('Por favor selecciona al menos un relleno');
      return;
    }
    console.log('✅ Agregando rellenos:', selectedRellenos);
    onAgregar(selectedRellenos);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-catalogo-overlay')) {
      onClose();
    }
  };

  const esRellenoDisabled = (relleno) => {
    const yaSeleccionado = selectedRellenos.some(r => r.id === relleno.id);
    return !yaSeleccionado && limiteMaximo !== null && selectedRellenos.length >= limiteMaximo;
  };

  return (
    <div className="modal-catalogo-overlay" onClick={handleOverlayClick}>
      <div className="modal-catalogo-container" onClick={(e) => e.stopPropagation()}>
        <button 
          type="button" 
          onClick={onClose} 
          className="modal-catalogo-close"
        >
          ✕
        </button>

        <h2 className="modal-catalogo-title">🥧 Seleccionar Rellenos</h2>

        {limiteMaximo !== null && limiteMaximo > 0 && (
          <div className="modal-catalogo-banner">
            <span className="modal-catalogo-banner-text">📊 Límite de rellenos configurado</span>
            <span className={`modal-catalogo-contador-banner ${selectedRellenos.length >= limiteMaximo ? 'limite-alcanzado' : ''}`}>
              {selectedRellenos.length} / {limiteMaximo}
            </span>
          </div>
        )}

        <div className="modal-catalogo-controles">
          <input
            type="text"
            placeholder="Buscar relleno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="modal-catalogo-input"
            disabled={loading}
          />
        </div>

        <div className="modal-catalogo-info">
          Mostrando {filteredRellenos.length} de {rellenosData.length} rellenos
        </div>

        {loading ? (
          <div className="modal-catalogo-loading">
            <div className="modal-catalogo-loading-spinner"></div>
            <p>Cargando rellenos...</p>
          </div>
        ) : (
          <div className="modal-catalogo-grid-wrapper">
            <div className="modal-catalogo-grid">
              {error ? (
                <div className="modal-catalogo-empty">
                  <p>{error}</p>
                </div>
              ) : filteredRellenos.length === 0 ? (
                <div className="modal-catalogo-empty">
                  No se encontraron rellenos
                </div>
              ) : (
                filteredRellenos.map(relleno => {
                  const isSelected = selectedRellenos.some(r => r.id === relleno.id);
                  const isDisabled = esRellenoDisabled(relleno);
                  return (
                    <div
                      key={relleno.id}
                      onClick={() => !isDisabled && toggleRelleno(relleno)}
                      className={`modal-catalogo-card ${isSelected ? 'modal-catalogo-card-seleccionado' : ''} ${isDisabled ? 'modal-catalogo-card-disabled' : ''}`}
                    >
                      {isSelected && <div className="modal-catalogo-check-icon">✓</div>}
                      <img 
                        src={relleno.imagen} 
                        alt={relleno.nombre}
                        onError={(e) => { 
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100x100/9C27B0/FFFFFF?text=R'; 
                        }}
                      />
                      <span className="modal-catalogo-nombre">{relleno.nombre}</span>
                      <span className="modal-catalogo-precio gratis">Gratis</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div className="modal-catalogo-footer">
          <div className="modal-catalogo-contador">
            Seleccionados: {selectedRellenos.length}
          </div>

          <div></div>

          <div className="modal-catalogo-footer-acciones">
            <button className="modal-catalogo-cancel-btn" onClick={onClose} type="button">
              Cancelar
            </button>
            <button 
              className="modal-catalogo-save-btn" 
              onClick={handleAgregar}
              disabled={selectedRellenos.length === 0 || loading}
              type="button"
            >
              Agregar ({selectedRellenos.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarRellenosModal;