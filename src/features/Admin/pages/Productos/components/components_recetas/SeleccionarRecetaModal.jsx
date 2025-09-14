import React, { useState, useEffect } from "react";
import CrearRecetaModal from "./CrearRecetaModal";
import recetaApiService from "../../../../services/Receta_Services";

const RecetaCard = ({ receta, onSelect }) => {
  return (
    <div
      className="producto-modal-card"
      onClick={() => onSelect(receta)}
    >
      <div className="receta-placeholder">
        <span className="receta-icon">📋</span>
      </div>
      <h4>{receta.nombrereceta}</h4>
      <p style={{ fontSize: '12px', color: '#666', margin: '4px 0', lineHeight: '1.3' }}>
        {receta.especificaciones || "Sin especificaciones"}
      </p>
      <small>ID: {receta.idreceta}</small>
      
      {receta.cantidadInsumos && (
        <div style={{ fontSize: '10px', color: '#28a745', marginTop: '4px' }}>
          📦 {receta.cantidadInsumos} insumo{receta.cantidadInsumos !== 1 ? 's' : ''}
        </div>
      )}
      
      {receta.costoEstimado && (
        <div style={{ fontSize: '10px', color: '#ff69b4', marginTop: '2px' }}>
          💰 ${receta.costoEstimado.toLocaleString('es-CO')}
        </div>
      )}
    </div>
  );
};

export default function SeleccionarRecetaModal({ onClose, onSeleccionar }) {
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mostrarModalCrearReceta, setMostrarModalCrearReceta] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecetas = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔄 Cargando recetas desde el servicio...');
        
        const recetasData = await recetaApiService.obtenerRecetas();
        console.log('✅ Recetas cargadas:', recetasData);
        
        setRecetas(recetasData);
        
      } catch (error) {
        console.error('❌ Error al cargar recetas:', error);
        setError(error.message);
        
        // Fallback con datos de prueba
        const recetasFallback = [
          {
            idreceta: 1,
            nombrereceta: 'Cupcakes de Vainilla',
            especificaciones: 'Cupcakes suaves con frosting de vainilla',
            cantidadInsumos: 6,
            costoEstimado: 12500
          },
          {
            idreceta: 2,
            nombrereceta: 'Brownies de Chocolate',
            especificaciones: 'Brownies húmedos con chocolate intenso',
            cantidadInsumos: 5,
            costoEstimado: 15000
          },
          {
            idreceta: 3,
            nombrereceta: 'Galletas con Chispas',
            especificaciones: 'Galletas crujientes con chispas de chocolate',
            cantidadInsumos: 7,
            costoEstimado: 8500
          },
          {
            idreceta: 4,
            nombrereceta: 'Pastel de Limón',
            especificaciones: 'Pastel esponjoso con glaseado de limón',
            cantidadInsumos: 8,
            costoEstimado: 18000
          },
          {
            idreceta: 5,
            nombrereceta: 'Muffins de Arándanos',
            especificaciones: 'Muffins tiernos con arándanos frescos',
            cantidadInsumos: 6,
            costoEstimado: 14000
          },
          {
            idreceta: 6,
            nombrereceta: 'Donas Glaseadas',
            especificaciones: 'Donas esponjosas con glaseado dulce',
            cantidadInsumos: 5,
            costoEstimado: 10500
          }
        ];
        
        setRecetas(recetasFallback);
      } finally {
        setLoading(false);
      }
    };

    fetchRecetas();
  }, []);

  const recetasFiltradas = recetas.filter(receta =>
    !searchTerm || receta.nombrereceta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receta.especificaciones?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCrearReceta = (nuevaReceta) => {
    console.log('🍰 Nueva receta creada:', nuevaReceta);
    
    setRecetas(prev => [nuevaReceta, ...prev]);
    setMostrarModalCrearReceta(false);
    
    onSeleccionar(nuevaReceta);
  };

  const handleSeleccionarReceta = async (receta) => {
    try {
      console.log('🎯 Seleccionando receta:', receta);
      
      let recetaCompleta = receta;
      
      if (!receta.insumos || receta.insumos.length === 0) {
        console.log('📋 Obteniendo detalles de la receta...');
        try {
          recetaCompleta = await recetaApiService.obtenerRecetaPorId(receta.idreceta);
        } catch (error) {
          console.warn('⚠️ No se pudieron obtener detalles adicionales:', error);
        }
      }
      
      console.log('✅ Receta seleccionada completa:', recetaCompleta);
      onSeleccionar(recetaCompleta);
      onClose();
      
    } catch (error) {
      console.error('❌ Error al seleccionar receta:', error);
      alert('Error al seleccionar la receta: ' + error.message);
    }
  };

  return (
    <div className="producto-modal-overlay">
      <div className="producto-modal-container">
        <style>{`
          .producto-modal-overlay {
            background-color: rgba(0, 0, 0, 0.4);
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1001;
          }

          .producto-modal-container {
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

          .producto-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }

          .producto-modal-close-btn {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #d63384;
          }

          .producto-modal-search-container {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
          }

          .producto-modal-search-container input {
            flex-grow: 1;
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #ffb6c1;
            font-size: 16px;
          }

          .crear-receta-btn {
            padding: 10px 15px;
            border: none;
            border-radius: 10px;
            background-color: #28a745;
            color: white;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            white-space: nowrap;
          }

          .crear-receta-btn:hover {
            background-color: #218838;
          }

          .crear-receta-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .producto-modal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 20px;
            margin: 20px 0;
            min-height: 200px;
          }

          .producto-modal-card {
            background: #fff;
            border-radius: 16px;
            padding: 10px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: transform 0.2s, border-color 0.2s;
            cursor: pointer;
            border: 3px solid transparent;
          }

          .producto-modal-card:hover {
            transform: translateY(-4px);
            border-color: #ff69b4;
          }

          .receta-placeholder {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #ff69b4, #ffc1cc);
            border-radius: 12px;
            margin: 0 auto 8px auto;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .receta-icon {
            font-size: 40px;
          }

          .producto-modal-card h4 {
            font-size: 16px;
            color: #d63384;
            margin: 0 0 4px 0;
          }

          .producto-modal-card small {
            color: #666;
            font-size: 12px;
          }

          .producto-modal-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
          }

          .footer-info {
            font-size: 14px;
            color: #666;
          }

          .producto-modal-btn {
            padding: 10px 18px;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
          }

          .producto-modal-btn-cancel {
            background-color: #f8d7da;
            color: #721c24;
          }

          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 200px;
            flex-direction: column;
            gap: 10px;
          }

          .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #ff69b4;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 2s linear infinite;
          }

          .error-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 200px;
            flex-direction: column;
            gap: 10px;
            color: #d63384;
          }

          .error-container button {
            background-color: #ff69b4;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
          }

          .error-message {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
            color: #dc2626;
          }

          .error-message strong {
            display: block;
            margin-bottom: 5px;
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

        <div className="producto-modal-header">
          <h2>Seleccionar Receta</h2>
          <button onClick={onClose} className="producto-modal-close-btn">&times;</button>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>
              Se están mostrando datos de prueba.
            </p>
          </div>
        )}

        <div className="producto-modal-search-container">
          <input
            type="text"
            placeholder="Buscar receta por nombre o especificaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          <button
            className="crear-receta-btn"
            onClick={() => setMostrarModalCrearReceta(true)}
            disabled={loading}
          >
            + Crear Nueva Receta
          </button>
        </div>

        <div className="producto-modal-grid">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando recetas...</p>
            </div>
          ) : recetasFiltradas.length === 0 ? (
            <div className="error-container">
              <p>
                {searchTerm 
                  ? `No se encontraron recetas que coincidan con "${searchTerm}"`
                  : "No hay recetas disponibles"
                }
              </p>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}>
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            recetasFiltradas.map(receta => (
              <RecetaCard
                key={receta.idreceta}
                receta={receta}
                onSelect={handleSeleccionarReceta}
              />
            ))
          )}
        </div>

        <div className="producto-modal-footer">
          <div className="footer-info">
            {loading ? "Cargando..." : `${recetasFiltradas.length} receta${recetasFiltradas.length !== 1 ? 's' : ''} ${searchTerm ? 'encontrada' + (recetasFiltradas.length !== 1 ? 's' : '') : 'disponible' + (recetasFiltradas.length !== 1 ? 's' : '')}`}
          </div>
          
          <button className="producto-modal-btn producto-modal-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
        </div>

        {/* Modal Crear Receta */}
        {mostrarModalCrearReceta && (
          <CrearRecetaModal
            onClose={() => setMostrarModalCrearReceta(false)}
            onGuardar={handleCrearReceta}
          />
        )}
      </div>
    </div>
  );
}