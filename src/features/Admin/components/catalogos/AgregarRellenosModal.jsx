// AgregarRellenosModal.jsx - TOTALMENTE FUNCIONAL
import React, { useState, useEffect } from 'react';

const RellenoCard = ({ relleno, selected, onToggle, disabled }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onToggle();
    }
  };

  return (
    <div
      className={`relleno-modal-card ${selected ? 'relleno-modal-card-selected' : ''} ${disabled ? 'relleno-modal-card-disabled' : ''}`}
      onClick={handleClick}
      style={{ 
        opacity: disabled ? 0.5 : 1, 
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none'
      }}
    >
      <img 
        src={relleno.imagen || 'https://via.placeholder.com/100x100?text=Relleno'} 
        alt={relleno.nombre}
        onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=Relleno'; }}
        draggable="false"
      />
      <h4>{relleno.nombre}</h4>
      <p>Gratis</p>
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

const AgregarRellenosModal = ({ onClose, onAgregar, limiteMaximo = null }) => {
  const [selectedRellenos, setSelectedRellenos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rellenosData, setRellenosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRellenos();
  }, []);

  const fetchRellenos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-relleno', {
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
      console.log('🥧 Rellenos obtenidos desde API:', data);
      
      const rellenosActivos = data
        .filter(relleno => relleno.estado === true)
        .map(relleno => ({
          id: relleno.idrelleno || relleno.id,
          nombre: relleno.nombre,
          precio: 0,
          imagen: relleno.imagen || null,
          unidad: 'g',
          cantidad: 1
        }));
      
      setRellenosData(rellenosActivos);
      
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

  const esRellenoDisabled = (relleno) => {
    const yaSeleccionado = selectedRellenos.some(r => r.id === relleno.id);
    return !yaSeleccionado && limiteMaximo !== null && selectedRellenos.length >= limiteMaximo;
  };

  return (
    <div className="relleno-modal-overlay" onClick={handleOverlayClick}>
      <div className="relleno-modal-container" onClick={(e) => e.stopPropagation()}>
        <style>{`
          .relleno-modal-overlay {
            background-color: rgba(0, 0, 0, 0.5);
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
          }

          .relleno-modal-container {
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

          .relleno-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }

          .relleno-modal-close-btn {
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

          .relleno-modal-close-btn:hover {
            transform: scale(1.2);
          }

          .limite-info {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-left: 4px solid #2196f3;
          }

          .limite-info-text {
            font-size: 14px;
            color: #1565c0;
            font-weight: 600;
          }

          .limite-contador {
            font-size: 18px;
            font-weight: bold;
            color: #0d47a1;
          }

          .limite-contador.limite-alcanzado {
            color: #d32f2f;
          }

          .relleno-modal-search-container {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            position: relative;
          }

          .relleno-modal-search-container input {
            flex-grow: 1;
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #ffb6c1;
            font-size: 16px;
          }

          .relleno-modal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 20px;
            margin: 20px 0;
            min-height: 200px;
          }

          .relleno-modal-card {
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

          .relleno-modal-card:hover:not(.relleno-modal-card-disabled) {
            transform: translateY(-4px);
            border-color: #ff69b4;
          }

          .relleno-modal-card-selected {
            border-color: #d63384;
            background: #ffe4ec;
          }

          .relleno-modal-card-disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .relleno-modal-card img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 8px;
            pointer-events: none;
          }

          .relleno-modal-card h4 {
            font-size: 16px;
            color: #d63384;
            margin: 0;
            pointer-events: none;
          }

          .relleno-modal-card p {
            font-size: 14px;
            color: #28a745;
            font-weight: bold;
            margin: 4px 0 0 0;
            pointer-events: none;
          }

          .relleno-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
          }

          .relleno-modal-btn {
            padding: 10px 18px;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s;
          }

          .relleno-modal-btn-cancel {
            background-color: #f8d7da;
            color: #721c24;
          }

          .relleno-modal-btn-cancel:hover {
            background-color: #f1b0b7;
          }

          .relleno-modal-btn-add {
            background-color: #ff69b4;
            color: white;
          }

          .relleno-modal-btn-add:hover:not(:disabled) {
            background-color: #d63384;
            transform: translateY(-2px);
          }

          .relleno-modal-btn:disabled {
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

        <div className="relleno-modal-header">
          <h2>🥧 Seleccionar Rellenos</h2>
          <button 
            onClick={handleCancelar} 
            className="relleno-modal-close-btn"
            type="button"
          >
            ×
          </button>
        </div>

        {limiteMaximo !== null && limiteMaximo > 0 && (
          <div className="limite-info">
            <span className="limite-info-text">
              📊 Límite de rellenos configurado
            </span>
            <span className={`limite-contador ${selectedRellenos.length >= limiteMaximo ? 'limite-alcanzado' : ''}`}>
              {selectedRellenos.length} / {limiteMaximo}
            </span>
          </div>
        )}

        <div className="relleno-modal-search-container">
          <input
            type="text"
            placeholder="Buscar relleno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="relleno-modal-grid">
          {loading ? (
            <div className="loading-container" style={{ gridColumn: '1 / -1' }}>
              <div className="loading-spinner"></div>
              <p>Cargando rellenos...</p>
            </div>
          ) : error ? (
            <div className="error-container" style={{ gridColumn: '1 / -1' }}>
              <p>{error}</p>
              <button onClick={fetchRellenos} type="button">Reintentar</button>
            </div>
          ) : filteredRellenos.length === 0 ? (
            <div className="error-container" style={{ gridColumn: '1 / -1' }}>
              <p>No se encontraron rellenos</p>
            </div>
          ) : (
            filteredRellenos.map(relleno => (
              <RellenoCard
                key={relleno.id}
                relleno={relleno}
                selected={selectedRellenos.some(r => r.id === relleno.id)}
                onToggle={() => toggleRelleno(relleno)}
                disabled={esRellenoDisabled(relleno)}
              />
            ))
          )}
        </div>

        <div className="relleno-modal-footer">
          <button 
            className="relleno-modal-btn relleno-modal-btn-cancel" 
            onClick={handleCancelar}
            type="button"
          >
            Cancelar
          </button>
          <button 
            className="relleno-modal-btn relleno-modal-btn-add" 
            onClick={handleAgregar}
            disabled={selectedRellenos.length === 0 || loading}
            type="button"
          >
            Agregar ({selectedRellenos.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarRellenosModal;