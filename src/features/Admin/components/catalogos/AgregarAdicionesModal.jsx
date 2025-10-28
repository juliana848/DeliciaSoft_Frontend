// AgregarAdicionesModal.jsx - TOTALMENTE FUNCIONAL
import React, { useState, useEffect } from 'react';

const AdicionCard = ({ adicion, selected, onToggle }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  return (
    <div
      className={`adicion-modal-card ${selected ? 'adicion-modal-card-selected' : ''}`}
      onClick={handleClick}
      style={{ userSelect: 'none' }}
    >
      <img 
        src={adicion.imagen || 'https://via.placeholder.com/100x100?text=Adicion'} 
        alt={adicion.nombre}
        onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=Adicion'; }}
        draggable="false"
      />
      <h4>{adicion.nombre}</h4>
      <p>${adicion.precio.toLocaleString('es-CO')}</p>
      {selected && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: '#ec4899',
          color: 'white',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '14px',
          pointerEvents: 'none'
        }}>
          ✓
        </div>
      )}
    </div>
  );
};

const AgregarAdicionesModal = ({ onClose, onAgregar }) => {
  const [selectedAdiciones, setSelectedAdiciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [adicionesData, setAdicionesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdiciones();
  }, []);

  const fetchAdiciones = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-adiciones', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✨ Adiciones obtenidas desde API:', data);
      
      const adicionesActivas = data
        .filter(adicion => adicion.estado === true)
        .map(adicion => ({
          id: adicion.idadiciones || adicion.id,
          nombre: adicion.nombre,
          precio: parseFloat(adicion.precioadicion || 0),
          imagen: adicion.imagen || null,
          unidad: 'g',
          cantidad: 1
        }));
      
      setAdicionesData(adicionesActivas);
      
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

  const handleAgregar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selectedAdiciones.length === 0) {
      alert('Por favor selecciona al menos una adición');
      return;
    }
    
    console.log('✅ Agregando adiciones:', selectedAdiciones);
    onAgregar(selectedAdiciones);
    onClose();
  };

  const handleCancelar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="adicion-modal-overlay" onClick={handleOverlayClick}>
      <div className="adicion-modal-container" onClick={(e) => e.stopPropagation()}>
        <style>{`
          .adicion-modal-overlay {
            background-color: rgba(0, 0, 0, 0.5);
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
          }

          .adicion-modal-container {
            background: #fff0f5;
            border-radius: 20px;
            padding: 25px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s ease-in-out;
          }

          .adicion-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }

          .adicion-modal-close-btn {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #d63384;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
          }

          .adicion-modal-close-btn:hover {
            transform: scale(1.2);
          }

          .adicion-modal-search-container {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            position: relative;
          }

          .adicion-modal-search-container input {
            flex-grow: 1;
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #ffb6c1;
            font-size: 16px;
          }

          .adicion-modal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 20px;
            margin: 20px 0;
            min-height: 200px;
          }

          .adicion-modal-card {
            background: #fff;
            border-radius: 16px;
            padding: 10px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: transform 0.2s;
            cursor: pointer;
            border: 3px solid transparent;
            position: relative;
          }

          .adicion-modal-card:hover {
            transform: translateY(-4px);
            border-color: #ff69b4;
          }

          .adicion-modal-card-selected {
            border-color: #d63384;
            background: #ffe4ec;
          }

          .adicion-modal-card img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 8px;
            pointer-events: none;
          }

          .adicion-modal-card h4 {
            font-size: 16px;
            color: #d63384;
            margin: 0;
            pointer-events: none;
          }

          .adicion-modal-card p {
            font-size: 14px;
            color: #e67e22;
            font-weight: bold;
            margin: 4px 0 0 0;
            pointer-events: none;
          }

          .adicion-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
          }

          .adicion-modal-btn {
            padding: 10px 18px;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s;
          }

          .adicion-modal-btn-cancel {
            background-color: #f8d7da;
            color: #721c24;
          }

          .adicion-modal-btn-cancel:hover {
            background-color: #f1b0b7;
          }

          .adicion-modal-btn-add {
            background-color: #ff69b4;
            color: white;
          }

          .adicion-modal-btn-add:hover:not(:disabled) {
            background-color: #d63384;
            transform: translateY(-2px);
          }

          .adicion-modal-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .loading-container, .error-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 250px;
            flex-direction: column;
            gap: 15px;
          }

          .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #ff69b4;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
          }

          .error-container {
            color: #d63384;
          }

          .error-container button {
            background-color: #ff69b4;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        <div className="adicion-modal-header">
          <h2>✨ Seleccionar Adiciones</h2>
          <button 
            onClick={handleCancelar} 
            className="adicion-modal-close-btn"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="adicion-modal-search-container">
          <input
            type="text"
            placeholder="Buscar adición..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="adicion-modal-grid">
          {loading ? (
            <div className="loading-container" style={{ gridColumn: '1 / -1' }}>
              <div className="loading-spinner"></div>
              <p>Cargando adiciones...</p>
            </div>
          ) : error ? (
            <div className="error-container" style={{ gridColumn: '1 / -1' }}>
              <p>{error}</p>
              <button onClick={fetchAdiciones} type="button">Reintentar</button>
            </div>
          ) : filteredAdiciones.length === 0 ? (
            <div className="error-container" style={{ gridColumn: '1 / -1' }}>
              <p>No se encontraron adiciones</p>
            </div>
          ) : (
            filteredAdiciones.map(adicion => (
              <AdicionCard
                key={adicion.id}
                adicion={adicion}
                selected={selectedAdiciones.some(a => a.id === adicion.id)}
                onToggle={() => toggleAdicion(adicion)}
              />
            ))
          )}
        </div>

        <div className="adicion-modal-footer">
          <button 
            className="adicion-modal-btn adicion-modal-btn-cancel" 
            onClick={handleCancelar}
            type="button"
          >
            Cancelar
          </button>
          <button 
            className="adicion-modal-btn adicion-modal-btn-add" 
            onClick={handleAgregar}
            disabled={selectedAdiciones.length === 0 || loading}
            type="button"
          >
            Agregar ({selectedAdiciones.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarAdicionesModal;