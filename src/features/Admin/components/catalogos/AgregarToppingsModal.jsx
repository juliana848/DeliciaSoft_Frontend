// AgregarToppingsModal.jsx - VERSIÓN CON ESTILO UNIFICADO
import React, { useState, useEffect } from 'react';
import './EstilosModalesComunes.css';

const API_URLS_TOPPINGS = {
  toppings: 'https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-toppings',
  insumos: 'https://deliciasoft-backend-i6g9.onrender.com/api/insumos',
  imagenes: 'https://deliciasoft-backend-i6g9.onrender.com/api/imagenes'
};

const AgregarToppingsModal = ({ onClose, onAgregar, limiteMaximo = null }) => {
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [toppingsData, setToppingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchToppingsConImagenes();
  }, []);

  const getImagenInsumo = async (idinsumos) => {
    if (!idinsumos) return null;
    try {
      const insumosRes = await fetch(API_URLS_TOPPINGS.insumos);
      if (!insumosRes.ok) return null;
      const insumosData = await insumosRes.json();
      const insumo = Array.isArray(insumosData) 
        ? insumosData.find(i => parseInt(i.idinsumo) === parseInt(idinsumos))
        : null;
      if (!insumo) return null;
      if (insumo.idimagen) {
        try {
          const imageUrl = `${API_URLS_TOPPINGS.imagenes}/${insumo.idimagen}`;
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
        return `${API_URLS_TOPPINGS.imagenes}/${insumo.idimagen}`;
      }
      if (insumo.imagenes) {
        if (insumo.imagenes.idimagenes) return `${API_URLS_TOPPINGS.imagenes}/${insumo.imagenes.idimagenes}`;
        if (insumo.imagenes.url || insumo.imagenes.ruta) return insumo.imagenes.url || insumo.imagenes.ruta;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const getPlaceholderImage = (nombre) => {
    const inicial = nombre?.charAt(0).toUpperCase() || 'T';
    return `https://via.placeholder.com/100x100/8B4513/FFFFFF?text=${encodeURIComponent(inicial)}`;
  };

  const fetchToppingsConImagenes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(API_URLS_TOPPINGS.toppings);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const toppingsActivos = data.filter(topping => topping.estado === true);
      const toppingsPromises = toppingsActivos.map(async (t, idx) => {
        const imagenInsumo = await getImagenInsumo(t.idinsumos);
        const toppingId = String(
          t.idtopping || t.id || t.idtoppings ||
          t.catalogotoppingId || t.idinsumos || `topping-${idx}`
        );
        return {
          id: toppingId,
          nombre: t.nombre,
          precio: 0,
          imagen: imagenInsumo || getPlaceholderImage(t.nombre),
          unidad: 'g',
          cantidad: 1
        };
      });
      const toppingsConImagenes = await Promise.all(toppingsPromises);
      setToppingsData(toppingsConImagenes);
    } catch (error) {
      console.error('Error al obtener toppings:', error);
      setError('Error al cargar toppings');
      setToppingsData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredToppings = toppingsData.filter(topping =>
    topping.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTopping = (topping) => {
    setSelectedToppings(prev => {
      const existe = prev.find(t => t.id === topping.id);
      if (existe) {
        return prev.filter(t => t.id !== topping.id);
      } else {
        if (limiteMaximo !== null && prev.length >= limiteMaximo) {
          alert(`⚠️ Solo puedes seleccionar máximo ${limiteMaximo} topping${limiteMaximo > 1 ? 's' : ''}`);
          return prev;
        }
        return [...prev, { ...topping, cantidad: 1 }];
      }
    });
  };

  const handleAgregar = () => {
    if (selectedToppings.length === 0) {
      alert('Por favor selecciona al menos un topping');
      return;
    }
    console.log('✅ Agregando toppings:', selectedToppings);
    onAgregar(selectedToppings);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-catalogo-overlay') {
      onClose();
    }
  };

  const esToppingDisabled = (topping) => {
    const yaSeleccionado = selectedToppings.some(t => t.id === topping.id);
    return !yaSeleccionado && limiteMaximo !== null && selectedToppings.length >= limiteMaximo;
  };

  return (
    <div className="modal-catalogo-overlay" onClick={handleOverlayClick}>
      <div className="modal-catalogo-container">
        <button onClick={onClose} className="modal-catalogo-close">
          ✕
        </button>

        <h2 className="modal-catalogo-title">🍫 Seleccionar Toppings</h2>

        {limiteMaximo !== null && limiteMaximo > 0 && (
          <div className="modal-catalogo-banner">
            <span className="modal-catalogo-banner-text">📊 Límite de toppings configurado</span>
            <span className={`modal-catalogo-contador-banner ${selectedToppings.length >= limiteMaximo ? 'limite-alcanzado' : ''}`}>
              {selectedToppings.length} / {limiteMaximo}
            </span>
          </div>
        )}

        <div className="modal-catalogo-controles">
          <input
            type="text"
            placeholder="Buscar topping..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="modal-catalogo-input"
            disabled={loading}
          />
        </div>

        <div className="modal-catalogo-info">
          Mostrando {filteredToppings.length} de {toppingsData.length} toppings
        </div>

        {loading ? (
          <div className="modal-catalogo-loading">
            <div className="modal-catalogo-loading-spinner"></div>
            <p>Cargando toppings...</p>
          </div>
        ) : (
          <div className="modal-catalogo-grid-wrapper">
            <div className="modal-catalogo-grid">
              {error ? (
                <div className="modal-catalogo-empty">
                  <p>{error}</p>
                </div>
              ) : filteredToppings.length === 0 ? (
                <div className="modal-catalogo-empty">
                  No se encontraron toppings
                </div>
              ) : (
                filteredToppings.map(topping => {
                  const isSelected = selectedToppings.some(t => t.id === topping.id);
                  const isDisabled = esToppingDisabled(topping);
                  return (
                    <div
                      key={topping.id}
                      onClick={() => !isDisabled && toggleTopping(topping)}
                      className={`modal-catalogo-card ${isSelected ? 'modal-catalogo-card-seleccionado' : ''} ${isDisabled ? 'modal-catalogo-card-disabled' : ''}`}
                    >
                      {isSelected && <div className="modal-catalogo-check-icon">✓</div>}
                      <img 
                        src={topping.imagen} 
                        alt={topping.nombre}
                        onError={(e) => { 
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100x100/8B4513/FFFFFF?text=T'; 
                        }}
                      />
                      <span className="modal-catalogo-nombre">{topping.nombre}</span>
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
            Seleccionados: {selectedToppings.length}
          </div>

          <div></div>

          <div className="modal-catalogo-footer-acciones">
            <button className="modal-catalogo-cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button 
              className="modal-catalogo-save-btn" 
              onClick={handleAgregar}
              disabled={selectedToppings.length === 0 || loading}
            >
              Agregar ({selectedToppings.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarToppingsModal;