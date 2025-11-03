// AgregarAdicionesModal.jsx - VERSIÓN CON DISEÑO UNIFICADO
import React, { useState, useEffect } from 'react';
import './EstilosModalesComunes.css';

const API_URLS = {
  adiciones: 'https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-adiciones',
  insumos: 'https://deliciasoft-backend-i6g9.onrender.com/api/insumos',
  imagenes: 'https://deliciasoft-backend-i6g9.onrender.com/api/imagenes'
};

const AgregarAdicionesModal = ({ onClose, onAgregar }) => {
  const [selectedAdiciones, setSelectedAdiciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [adicionesData, setAdicionesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdicionesConImagenes();
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
    const inicial = nombre?.charAt(0).toUpperCase() || 'A';
    return `https://via.placeholder.com/100x100/FFC107/FFFFFF?text=${encodeURIComponent(inicial)}`;
  };

  const fetchAdicionesConImagenes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(API_URLS.adiciones);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const adicionesActivas = data.filter(adicion => adicion.estado === true);
      const adicionesPromises = adicionesActivas.map(async (a) => {
        const imagenInsumo = await getImagenInsumo(a.idinsumos);
        return {
          id: String(a.idadiciones || a.id),
          nombre: a.nombre,
          precio: parseFloat(a.precioadicion || 0),
          imagen: imagenInsumo || getPlaceholderImage(a.nombre),
          unidad: 'g',
          cantidad: 1
        };
      });
      const adicionesConImagenes = await Promise.all(adicionesPromises);
      setAdicionesData(adicionesConImagenes);
    } catch (error) {
      console.error('Error al obtener adiciones:', error);
      setError('Error al cargar adiciones');
      setAdicionesData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdiciones = adicionesData.filter(adicion =>
    adicion.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAdicion = (adicion) => {
    setSelectedAdiciones(prev => {
      const existe = prev.find(a => a.id === adicion.id);
      if (existe) {
        return prev.filter(a => a.id !== adicion.id);
      } else {
        return [...prev, { ...adicion, cantidad: 1 }];
      }
    });
  };

  const handleAgregar = () => {
    if (selectedAdiciones.length === 0) {
      alert('Por favor selecciona al menos una adición');
      return;
    }
    console.log('✅ Agregando adiciones:', selectedAdiciones);
    onAgregar(selectedAdiciones);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-catalogo-overlay') {
      onClose();
    }
  };

  return (
    <div className="modal-catalogo-overlay" onClick={handleOverlayClick}>
      <div className="modal-catalogo-container">
        <button className="modal-catalogo-close" onClick={onClose}>
          ✕
        </button>

        <h2 className="modal-catalogo-title">✨ Seleccionar Adiciones</h2>

        <div className="modal-catalogo-controles">
          <input
            type="text"
            placeholder="Buscar adición..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="modal-catalogo-input"
            disabled={loading}
          />
        </div>

        <div className="modal-catalogo-info">
          Mostrando {filteredAdiciones.length} de {adicionesData.length} adiciones
        </div>

        {loading ? (
          <div className="modal-catalogo-loading">
            <div className="modal-catalogo-loading-spinner"></div>
            <p>Cargando adiciones...</p>
          </div>
        ) : (
          <div className="modal-catalogo-grid-wrapper">
            <div className="modal-catalogo-grid">
              {error ? (
                <div className="modal-catalogo-empty">
                  <p>{error}</p>
                </div>
              ) : filteredAdiciones.length === 0 ? (
                <div className="modal-catalogo-empty">
                  No se encontraron adiciones
                </div>
              ) : (
                filteredAdiciones.map(adicion => {
                  const isSelected = selectedAdiciones.some(a => a.id === adicion.id);
                  return (
                    <div
                      key={adicion.id}
                      onClick={() => toggleAdicion(adicion)}
                      className={`modal-catalogo-card ${isSelected ? 'modal-catalogo-card-seleccionado' : ''}`}
                    >
                      {isSelected && <div className="modal-catalogo-check-icon">✓</div>}
                      <img 
                        src={adicion.imagen} 
                        alt={adicion.nombre}
                        onError={(e) => { 
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100x100/FFC107/FFFFFF?text=A'; 
                        }}
                      />
                      <span className="modal-catalogo-nombre">{adicion.nombre}</span>
                      <span className="modal-catalogo-precio">${adicion.precio.toLocaleString('es-CO')}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div className="modal-catalogo-footer">
          <div className="modal-catalogo-contador">
            Seleccionados: {selectedAdiciones.length}
          </div>

          <div className="modal-catalogo-footer-acciones">
            <button className="modal-catalogo-cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button 
              className="modal-catalogo-save-btn" 
              onClick={handleAgregar}
              disabled={selectedAdiciones.length === 0 || loading}
            >
              Agregar ({selectedAdiciones.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarAdicionesModal;