// AgregarToppingsModal.jsx - TOTALMENTE FUNCIONAL
import React, { useState, useEffect } from 'react';

const ToppingCard = ({ topping, selected, onToggle, disabled }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onToggle();
    }
  };

  return (
    <div
      className={`topping-modal-card ${selected ? 'topping-modal-card-selected' : ''} ${disabled ? 'topping-modal-card-disabled' : ''}`}
      onClick={handleClick}
      style={{ 
        opacity: disabled ? 0.5 : 1, 
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none'
      }}
    >
      <img 
        src={topping.imagen || 'https://via.placeholder.com/100x100?text=Topping'} 
        alt={topping.nombre}
        onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=Topping'; }}
        draggable="false"
      />
      <h4>{topping.nombre}</h4>
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

const AgregarToppingsModal = ({ onClose, onAgregar, limiteMaximo = null }) => {
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [toppingsData, setToppingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchToppings();
  }, []);

  const fetchToppings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-toppings', {
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
      console.log('🍫 Toppings obtenidos desde API:', data);
      
      const toppingsActivos = data
        .filter(topping => topping.estado === true)
        .map(topping => ({
          id: topping.idtopping || topping.id,
          nombre: topping.nombre,
          precio: 0,
          imagen: topping.imagen || null,
          unidad: 'g',
          cantidad: 1
        }));
      
      setToppingsData(toppingsActivos);
      
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

  const handleAgregar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selectedToppings.length === 0) {
      alert('Por favor selecciona al menos un topping');
      return;
    }
    
    console.log('✅ Agregando toppings:', selectedToppings);
    onAgregar(selectedToppings);
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

  const esToppingDisabled = (topping) => {
    const yaSeleccionado = selectedToppings.some(t => t.id === topping.id);
    return !yaSeleccionado && limiteMaximo !== null && selectedToppings.length >= limiteMaximo;
  };

  return (
    <div className="topping-modal-overlay" onClick={handleOverlayClick}>
      <div className="topping-modal-container" onClick={(e) => e.stopPropagation()}>
        <style>{`
          .topping-modal-overlay {
            background-color: rgba(0, 0, 0, 0.5);
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
          }

          .topping-modal-container {
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

          .topping-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }

          .topping-modal-close-btn {
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

          .topping-modal-close-btn:hover {
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

          .topping-modal-search-container {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            position: relative;
          }

          .topping-modal-search-container input {
            flex-grow: 1;
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #ffb6c1;
            font-size: 16px;
          }

          .topping-modal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 20px;
            margin: 20px 0;
            min-height: 200px;
          }

          .topping-modal-card {
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

          .topping-modal-card:hover:not(.topping-modal-card-disabled) {
            transform: translateY(-4px);
            border-color: #ff69b4;
          }

          .topping-modal-card-selected {
            border-color: #d63384;
            background: #ffe4ec;
          }

          .topping-modal-card-disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .topping-modal-card img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 8px;
            pointer-events: none;
          }

          .topping-modal-card h4 {
            font-size: 16px;
            color: #d63384;
            margin: 0;
            pointer-events: none;
          }

          .topping-modal-card p {
            font-size: 14px;
            color: #28a745;
            font-weight: bold;
            margin: 4px 0 0 0;
            pointer-events: none;
          }

          .topping-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
          }

          .topping-modal-btn {
            padding: 10px 18px;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s;
          }

          .topping-modal-btn-cancel {
            background-color: #f8d7da;
            color: #721c24;
          }

          .topping-modal-btn-cancel:hover {
            background-color: #f1b0b7;
          }

          .topping-modal-btn-add {
            background-color: #ff69b4;
            color: white;
          }

          .topping-modal-btn-add:hover:not(:disabled) {
            background-color: #d63384;
            transform: translateY(-2px);
          }

          .topping-modal-btn:disabled {
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

        <div className="topping-modal-header">
          <h2>🍫 Seleccionar Toppings</h2>
          <button 
            onClick={handleCancelar} 
            className="topping-modal-close-btn"
            type="button"
          >
            ×
          </button>
        </div>

        {limiteMaximo !== null && limiteMaximo > 0 && (
          <div className="limite-info">
            <span className="limite-info-text">
              📊 Límite de toppings configurado
            </span>
            <span className={`limite-contador ${selectedToppings.length >= limiteMaximo ? 'limite-alcanzado' : ''}`}>
              {selectedToppings.length} / {limiteMaximo}
            </span>
          </div>
        )}

        <div className="topping-modal-search-container">
          <input
            type="text"
            placeholder="Buscar topping..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="topping-modal-grid">
          {loading ? (
            <div className="loading-container" style={{ gridColumn: '1 / -1' }}>
              <div className="loading-spinner"></div>
              <p>Cargando toppings...</p>
            </div>
          ) : error ? (
            <div className="error-container" style={{ gridColumn: '1 / -1' }}>
              <p>{error}</p>
              <button onClick={fetchToppings} type="button">Reintentar</button>
            </div>
          ) : filteredToppings.length === 0 ? (
            <div className="error-container" style={{ gridColumn: '1 / -1' }}>
              <p>No se encontraron toppings</p>
            </div>
          ) : (
            filteredToppings.map(topping => (
              <ToppingCard
                key={topping.id}
                topping={topping}
                selected={selectedToppings.some(t => t.id === topping.id)}
                onToggle={() => toggleTopping(topping)}
                disabled={esToppingDisabled(topping)}
              />
            ))
          )}
        </div>

        <div className="topping-modal-footer">
          <button 
            className="topping-modal-btn topping-modal-btn-cancel" 
            onClick={handleCancelar}
            type="button"
          >
            Cancelar
          </button>
          <button 
            className="topping-modal-btn topping-modal-btn-add" 
            onClick={handleAgregar}
            disabled={selectedToppings.length === 0 || loading}
            type="button"
          >
            Agregar ({selectedToppings.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarToppingsModal;