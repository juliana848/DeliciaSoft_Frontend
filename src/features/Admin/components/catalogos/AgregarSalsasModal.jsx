// AgregarSalsasModal.jsx - VERSIÓN CON ESTILO UNIFICADO
import React, { useState, useEffect } from 'react';
import './EstilosModalesComunes.css';

const API_URLS = {
  salsas: 'https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-salsas',
  insumos: 'https://deliciasoft-backend-i6g9.onrender.com/api/insumos',
  imagenes: 'https://deliciasoft-backend-i6g9.onrender.com/api/imagenes'
};

const AgregarSalsasModal = ({ onClose, onAgregar, limiteMaximo = null }) => {
  const [selectedSalsas, setSelectedSalsas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [salsasData, setSalsasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSalsasConImagenes();
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
      return null;
    }
  };

  const getPlaceholderImage = (nombre) => {
    const inicial = nombre?.charAt(0).toUpperCase() || 'S';
    return `https://via.placeholder.com/100x100/FF5722/FFFFFF?text=${encodeURIComponent(inicial)}`;
  };

  const fetchSalsasConImagenes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(API_URLS.salsas);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const salsasActivas = data.filter(salsa => salsa.estado === true);
      const salsasPromises = salsasActivas.map(async (s) => {
        const imagenInsumo = await getImagenInsumo(s.idinsumos);
        const salsaId = String(s.idsalsa || s.id);
        return {
          id: salsaId,
          nombre: s.nombre,
          precio: 0,
          imagen: imagenInsumo || getPlaceholderImage(s.nombre),
          unidad: 'ml',
          cantidad: 1
        };
      });
      const salsasConImagenes = await Promise.all(salsasPromises);
      setSalsasData(salsasConImagenes);
    } catch (error) {
      console.error('Error al obtener salsas:', error);
      setError('Error al cargar salsas');
      setSalsasData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSalsas = salsasData.filter(salsa =>
    salsa.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSalsa = (salsa) => {
    setSelectedSalsas(prev => {
      const existe = prev.find(s => s.id === salsa.id);
      if (existe) {
        return prev.filter(s => s.id !== salsa.id);
      } else {
        if (limiteMaximo !== null && prev.length >= limiteMaximo) {
          alert(`⚠️ Solo puedes seleccionar máximo ${limiteMaximo} salsa${limiteMaximo > 1 ? 's' : ''}`);
          return prev;
        }
        return [...prev, { ...salsa, cantidad: 1 }];
      }
    });
  };

  const handleAgregar = () => {
    if (selectedSalsas.length === 0) {
      alert('Por favor selecciona al menos una salsa');
      return;
    }
    console.log('✅ Agregando salsas:', selectedSalsas);
    onAgregar(selectedSalsas);
    setTimeout(() => {
      onClose();
    }, 0);
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-catalogo-overlay') {
      onClose();
    }
  };

  const esSalsaDisabled = (salsa) => {
    const yaSeleccionado = selectedSalsas.some(s => s.id === salsa.id);
    return !yaSeleccionado && limiteMaximo !== null && selectedSalsas.length >= limiteMaximo;
  };

  return (
    <div className="modal-catalogo-overlay" onClick={handleOverlayClick}>
      <div 
        className="modal-catalogo-container"
        onClick={(e) => e.stopPropagation()} 
      >
        <button 
          type="button" 
          onClick={onClose} 
          className="modal-catalogo-close"
        >
          ✕
        </button>

        <h2 className="modal-catalogo-title">🍯 Seleccionar Salsas</h2>

        {limiteMaximo !== null && limiteMaximo > 0 && (
          <div className="modal-catalogo-banner">
            <span className="modal-catalogo-banner-text">📊 Límite de salsas configurado</span>
            <span className={`modal-catalogo-contador-banner ${selectedSalsas.length >= limiteMaximo ? 'limite-alcanzado' : ''}`}>
              {selectedSalsas.length} / {limiteMaximo}
            </span>
          </div>
        )}

        <div className="modal-catalogo-controles">
          <input
            type="text"
            placeholder="Buscar salsa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="modal-catalogo-input"
            disabled={loading}
          />
        </div>

        <div className="modal-catalogo-info">
          Mostrando {filteredSalsas.length} de {salsasData.length} salsas
        </div>

        {loading ? (
          <div className="modal-catalogo-loading">
            <div className="modal-catalogo-loading-spinner"></div>
            <p>Cargando salsas...</p>
          </div>
        ) : (
          <div className="modal-catalogo-grid-wrapper">
            <div className="modal-catalogo-grid">
              {error ? (
                <div className="modal-catalogo-empty">
                  <p>{error}</p>
                </div>
              ) : filteredSalsas.length === 0 ? (
                <div className="modal-catalogo-empty">
                  No se encontraron salsas
                </div>
              ) : (
                filteredSalsas.map(salsa => {
                  const isSelected = selectedSalsas.some(s => s.id === salsa.id);
                  const isDisabled = esSalsaDisabled(salsa);
                  return (
                    <div
                      key={salsa.id}
                      onClick={() => !isDisabled && toggleSalsa(salsa)}
                      className={`modal-catalogo-card ${isSelected ? 'modal-catalogo-card-seleccionado' : ''} ${isDisabled ? 'modal-catalogo-card-disabled' : ''}`}
                    >
                      {isSelected && <div className="modal-catalogo-check-icon">✓</div>}
                      <img 
                        src={salsa.imagen} 
                        alt={salsa.nombre}
                        onError={(e) => { 
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100x100/FF5722/FFFFFF?text=S'; 
                        }}
                      />
                      <span className="modal-catalogo-nombre">{salsa.nombre}</span>
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
            Seleccionados: {selectedSalsas.length}
          </div>

          <div></div>

          <div className="modal-catalogo-footer-acciones">
            <button 
              className="modal-catalogo-cancel-btn" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              className="modal-catalogo-save-btn" 
              onClick={handleAgregar}
              disabled={selectedSalsas.length === 0 || loading}
            >
              Agregar ({selectedSalsas.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarSalsasModal;