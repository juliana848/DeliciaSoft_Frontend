import React, { useState, useEffect } from 'react';
import './Css/ModalAgregarProductos.css'; // Reutilizamos el estilo de productos

export default function ModalRecetas({
  recetasDisponibles = [],
  productoEditandoReceta,
  setProductosSeleccionados,
  setMostrarModalRecetas,
  setMostrarModalRecetaDetalle,
  setRecetaSeleccionada
}) {
  // Estado local para manejar la receta seleccionada mientras se navega en el modal
  const [seleccionTemporal, setSeleccionTemporal] = useState(null);

  useEffect(() => {
    // Inicialmente cargar receta asociada (si ya hay una)
    setSeleccionTemporal(productoEditandoReceta?.receta || null);
  }, [productoEditandoReceta]);

  const toggleSeleccion = (receta) => {
    setSeleccionTemporal(prev =>
      prev?.id === receta.id ? null : receta
    );
  };

  const confirmarAsignacion = () => {
    setProductosSeleccionados(prev =>
      prev.map(p =>
        p.id === productoEditandoReceta.id ? { ...p, receta: seleccionTemporal } : p
      )
    );
    setMostrarModalRecetas(false);
  };

  return (
    <div className="modal-agregar-container">
      <h2 className="modal-agregar-title">Recetas disponibles</h2>

      <div className="modal-agregar-grid">
        {recetasDisponibles.map((receta) => {
          const seleccionada = seleccionTemporal?.id === receta.id;
          return (
            <div
              key={receta.id}
              className={`modal-agregar-card ${seleccionada ? 'seleccionado' : ''}`}
              onClick={() => toggleSeleccion(receta)}
            >
              <img
                src={receta.imagen}
                alt={receta.nombre}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/120?text=Receta';
                }}
              />
              <span>{receta.nombre}</span>
              <button
                className="btn-ver-verabajo"
                onClick={(e) => {
                  e.stopPropagation(); // ← esto evita que se seleccione la receta al hacer clic
                  setMostrarModalRecetaDetalle(true);
                  setRecetaSeleccionada(receta);
                }}
              >
                👁️ Ver
              </button>
            </div>
          );
        })}
      </div>

      <div className="modal-agregar-footer">
        <button className="cancel-btn" onClick={() => setMostrarModalRecetas(false)}>Cerrar</button>
        <button
          className="save-btn"
          onClick={confirmarAsignacion}
          disabled={!seleccionTemporal}
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
