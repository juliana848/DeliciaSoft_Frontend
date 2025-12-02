import React, { useState, useEffect } from "react";
import CrearRecetaModal from "./CrearRecetaModal";
import recetaApiService from "../../../../services/Receta_services";

const RecetaCard = ({ receta, selected, onSelect }) => {
  return (
    <div
      className={`modal-agregar-card ${selected ? "seleccionado" : ""}`}
      onClick={() => onSelect(receta)}
    >
      {selected && <div className="check-icon">✓</div>}

      {/* Cuadro más cuadrado y grande */}
      <div className="insumo-placeholder receta-cuadro">
        <span className="insumo-icon">📋</span>
      </div>

      <span>{receta.nombrereceta}</span>

      <div style={{ fontSize: "10px", color: "#999", marginTop: "2px" }}>
        {receta.especificaciones || "Sin especificaciones"}
      </div>

      {receta.cantidadInsumos && (
        <div style={{ fontSize: "9px", color: "#28a745", marginTop: "3px" }}>
          📦 {receta.cantidadInsumos} insumo
          {receta.cantidadInsumos !== 1 ? "s" : ""}
        </div>
      )}

      {receta.costoEstimado && (
        <div style={{ fontSize: "9px", color: "#ff69b4", marginTop: "2px" }}>
          💰 ${receta.costoEstimado.toLocaleString("es-CO")}
        </div>
      )}
    </div>
  );
};

export default function SeleccionarRecetaModal({ onClose, onSeleccionar }) {
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [mostrarModalCrearReceta, setMostrarModalCrearReceta] = useState(false);

  // PAGINACIÓN
  const recetasPorPagina = 8;
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    const fetchRecetas = async () => {
      setLoading(true);
      setError(null);

      try {
        const recetasData = await recetaApiService.obtenerRecetas();
        setRecetas(recetasData);
      } catch (error) {
        setError(error.message);

        const fallback = [
          {
            idreceta: 1,
            nombrereceta: "Cupcakes de Vainilla",
            especificaciones: "Cupcakes suaves con frosting de vainilla",
            cantidadInsumos: 6,
            costoEstimado: 12500,
          },
          {
            idreceta: 2,
            nombrereceta: "Brownies de Chocolate",
            especificaciones: "Brownies húmedos con chocolate intenso",
            cantidadInsumos: 5,
            costoEstimado: 15000,
          },
        ];

        setRecetas(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchRecetas();
  }, []);

  const recetasFiltradas = recetas.filter(
    (receta) =>
      receta.nombrereceta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receta.especificaciones?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculo de paginación
  const inicio = (paginaActual - 1) * recetasPorPagina;
  const fin = inicio + recetasPorPagina;
  const recetasPaginadas = recetasFiltradas.slice(inicio, fin);
  const totalPaginas = Math.ceil(recetasFiltradas.length / recetasPorPagina);

  const handleSeleccionarReceta = async (receta) => {
    try {
      setSelectedId(receta.idreceta);

      let recetaCompleta = receta;

      if (!receta.insumos || receta.insumos.length === 0) {
        try {
          recetaCompleta = await recetaApiService.obtenerRecetaPorId(
            receta.idreceta
          );
        } catch {}
      }

      onSeleccionar(recetaCompleta);
      onClose();
    } catch (error) {
      alert("Error al seleccionar: " + error.message);
    }
  };

  const handleCrearReceta = (nuevaReceta) => {
    setRecetas((prev) => [nuevaReceta, ...prev]);
    setMostrarModalCrearReceta(false);
    onSeleccionar(nuevaReceta);
  };

  return (
    <div className="modal-agregar-overlay">
      <div className="modal-agregar-container">
        <style>{`
          .modal-agregar-overlay {
            background-color: rgba(0, 0, 0, 0.45);
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
          }

          .modal-agregar-container {
            background: #fff0f5;
            border-radius: 20px;
            padding: 25px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 10px 25px rgba(0,0,0,0.25);
          }

          .modal-agregar-close {
            background: none;
            border: none;
            font-size: 30px;
            cursor: pointer;
            color: #d63384;
            position: absolute;
            right: 15px;
            top: 10px;
          }

          .modal-agregar-title {
            text-align: center;
            font-size: 26px;
            font-weight: 700;
            color: #d63384;
            margin-bottom: 10px;
          }

          .modal-agregar-info {
            text-align: center;
            margin-bottom: 20px;
            font-size: 14px;
            color: #555;
          }

          .modal-agregar-controles {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
          }

          .modal-agregar-input {
            flex-grow: 1;
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #ffb6c1;
            font-size: 16px;
          }

          .modal-agregar-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 20px;
          }

          .modal-agregar-card {
            background: white;
            border-radius: 16px;
            padding: 12px;
            text-align: center;
            cursor: pointer;
            border: 3px solid transparent;
            position: relative;
            transition: 0.2s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          .modal-agregar-card:hover {
            transform: translateY(-4px);
            border-color: #ff69b4;
          }

          .modal-agregar-card.seleccionado {
            border-color: #ff69b4;
            box-shadow: 0 6px 18px rgba(255,105,180,0.4);
          }

          .check-icon {
            position: absolute;
            top: 8px;
            left: 8px;
            background: #ff69b4;
            color: white;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
          }

          /* Nuevo: imagen cuadrada mejor proporcionada */
          .receta-cuadro {
            width: 110px;
            height: 110px;
            background: linear-gradient(135deg, #ff69b4, #ffc1cc);
            border-radius: 12px;
            margin: 0 auto 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .insumo-icon {
            font-size: 45px;
          }

          /* PAGINACIÓN */
          .modal-agregar-paginacion {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            gap: 12px;
            align-items: center;
          }

          .paginacion-btn {
            background: #ff69b4;
            color: white;
            border: none;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 18px;
            cursor: pointer;
          }

          .paginacion-info {
            font-size: 14px;
            color: #444;
          }

          .modal-agregar-footer {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }

          .cancel-btn {
            background: #f8d7da;
            color: #721c24;
            border: none;
            padding: 10px 18px;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
          }

          .crear-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 10px;
            font-size: 15px;
            cursor: pointer;
            font-weight: 600;
          }
        `}</style>

        <button className="modal-agregar-close" onClick={onClose}>
          ×
        </button>

        <h2 className="modal-agregar-title">📋 Seleccionar Receta</h2>

        <div className="modal-agregar-info">
          Selecciona la receta que quieras usar
        </div>

        <div className="modal-agregar-controles">
          <input
            type="text"
            className="modal-agregar-input"
            placeholder="🔍 Buscar receta..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPaginaActual(1);
            }}
            disabled={loading}
          />

          <button
            className="crear-btn"
            onClick={() => setMostrarModalCrearReceta(true)}
          >
            + Crear Receta
          </button>
        </div>

        <div className="modal-agregar-grid">
          {loading ? (
            <p style={{ gridColumn: "1 / -1" }}>⏳ Cargando recetas...</p>
          ) : recetasFiltradas.length === 0 ? (
            <p style={{ gridColumn: "1 / -1" }}>No se encontraron recetas</p>
          ) : (
            recetasPaginadas.map((receta) => (
              <RecetaCard
                key={receta.idreceta}
                receta={receta}
                selected={selectedId === receta.idreceta}
                onSelect={handleSeleccionarReceta}
              />
            ))
          )}
        </div>

        {/* PAGINACIÓN */}
        {totalPaginas > 1 && (
          <div className="modal-agregar-paginacion">
            <button
              className="paginacion-btn"
              onClick={() =>
                setPaginaActual((prev) => Math.max(prev - 1, 1))
              }
            >
              ◀
            </button>

            <span className="paginacion-info">
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              className="paginacion-btn"
              onClick={() =>
                setPaginaActual((prev) =>
                  Math.min(prev + 1, totalPaginas)
                )
              }
            >
              ▶
            </button>
          </div>
        )}

        <div className="modal-agregar-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
        </div>

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
