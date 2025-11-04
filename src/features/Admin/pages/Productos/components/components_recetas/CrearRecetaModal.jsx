import React, { useState } from "react";
import AgregarInsumosModal from "./AgregarInsumosModal";
import recetaApiService from "../../../../services/Receta_services";
import Notification from "../../../../components/Notification";
import "../css/recetacrear.css";

export default function CrearRecetaModal({ onClose, onGuardar, onNotificar }) {
  const [formData, setFormData] = useState({
    nombrereceta: "",
    especificaciones: ""
  });
  const [insumosReceta, setInsumosReceta] = useState([]);
  const [mostrarModalInsumos, setMostrarModalInsumos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [notification, setNotification] = useState({ visible: false, mensaje: "", tipo: "success" });

  const showNotification = (mensaje, tipo = "success") => {
    setNotification({ visible: true, mensaje, tipo });
    if (onNotificar) onNotificar(mensaje, tipo);
  };
  const hideNotification = () => setNotification({ visible: false, mensaje: "", tipo: "success" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (erroresValidacion[name]) {
      setErroresValidacion(prev => ({ ...prev, [name]: "" }));
    }
  };

  const agregarInsumos = (nuevosInsumos) => {
    const insumosNuevos = nuevosInsumos.filter(nuevoInsumo =>
      !insumosReceta.some(existente => existente.id === nuevoInsumo.id)
    );
    const insumosConDatos = insumosNuevos.map(insumo => ({
      ...insumo,
      idinsumo: insumo.id,
      cantidad: insumo.cantidad || 1,
      idunidadmedida: insumo.idunidadmedida || 1,
      nombreinsumo: insumo.nombre || insumo.nombreinsumo,
      unidadmedida: insumo.unidadmedida || 'Unidad'
    }));
    setInsumosReceta(prev => [...prev, ...insumosConDatos]);
  };

  const removeInsumo = (insumoId) => {
    setInsumosReceta(prev => prev.filter(insumo => insumo.id !== insumoId));
  };

  const handleCantidadChange = (insumoId, nuevaCantidad) => {
    const cantidad = parseFloat(nuevaCantidad) || 1;
    setInsumosReceta(prev =>
      prev.map(insumo =>
        insumo.id === insumoId ? { ...insumo, cantidad } : insumo
      )
    );
  };

  const handleUnidadChange = (insumoId, nuevaUnidad) => {
    setInsumosReceta(prev =>
      prev.map(insumo =>
        insumo.id === insumoId ? { ...insumo, idunidadmedida: parseInt(nuevaUnidad) || 1 } : insumo
      )
    );
  };

  const validateForm = () => {
    const errores = {};
    if (!formData.nombrereceta.trim()) errores.nombrereceta = 'El nombre de la receta es requerido';
    if (formData.nombrereceta.trim().length > 50) errores.nombrereceta = 'El nombre no puede exceder 50 caracteres';
    if (formData.especificaciones && formData.especificaciones.length > 80) errores.especificaciones = 'Las especificaciones no pueden exceder 80 caracteres';
    if (insumosReceta.length === 0) errores.insumos = 'Debe agregar al menos un insumo a la receta';
    const insumosInvalidos = insumosReceta.filter(insumo => !insumo.cantidad || isNaN(parseFloat(insumo.cantidad)) || parseFloat(insumo.cantidad) <= 0);
    if (insumosInvalidos.length > 0) errores.cantidades = 'Todos los insumos deben tener una cantidad válida mayor a 0';
    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const datosReceta = {
        nombrereceta: formData.nombrereceta.trim(),
        especificaciones: formData.especificaciones.trim() || "Sin especificaciones",
        insumos: insumosReceta.map(insumo => ({
          id: insumo.id || insumo.idinsumo,
          idinsumo: insumo.id || insumo.idinsumo,
          nombre: insumo.nombre || insumo.nombreinsumo,
          nombreinsumo: insumo.nombre || insumo.nombreinsumo,
          cantidad: parseFloat(insumo.cantidad),
          idunidadmedida: insumo.idunidadmedida || 1,
          unidadmedida: insumo.unidadmedida || 'Unidad',
          precio: insumo.precio || 0,
          categoria: insumo.categoria || 'Sin categoría'
        }))
      };

      const recetaCompleta = await recetaApiService.crearReceta(datosReceta);

      const recetaNormalizada = {
        ...recetaCompleta,
        idreceta: recetaCompleta.idreceta || recetaCompleta.id,
        nombrereceta: recetaCompleta.nombrereceta || recetaCompleta.nombre,
        especificaciones: recetaCompleta.especificaciones || recetaCompleta.especificacionesreceta,
      };

      showNotification(`Receta "${recetaNormalizada.nombrereceta}" creada exitosamente con ${recetaNormalizada.insumos?.length || insumosReceta.length} insumos`, "success");

      onGuardar(recetaNormalizada);

    } catch (error) {
      showNotification('Error al crear la receta: ' + (error.message || error), "error");
    } finally {
      setLoading(false);
    }
  };

  const unidadesMedida = [
    { id: 1, nombre: 'Unidad' },
    { id: 2, nombre: 'Gramos' },
    { id: 3, nombre: 'Kilogramos' },
    { id: 4, nombre: 'Litros' },
    { id: 5, nombre: 'Mililitros' },
    { id: 6, nombre: 'Cucharadas' },
    { id: 7, nombre: 'Tazas' },
    { id: 8, nombre: 'Cucharaditas' }
  ];

  return (
    <div className="modal-overlay-fixed">
      <div className="modal-content-fixed">
        <Notification {...notification} onClose={hideNotification} />
        <div className="modal-inner">
          <div className="modal-header">
            <h2>Crear Nueva Receta</h2>
            <button className="btn-cerrar" onClick={onClose} disabled={loading}>Cerrar</button>
          </div>

          <form onSubmit={handleSubmit} className="receta-form">
            <div className="form-campos">
              <div className="campo">
                <label>Nombre de la Receta *</label>
                <input
                  type="text"
                  name="nombrereceta"
                  value={formData.nombrereceta}
                  onChange={handleInputChange}
                  required
                  maxLength="50"
                  className={erroresValidacion.nombrereceta ? "error" : ""}
                  placeholder="Ej: Café Especial, Brownie Chocolate..."
                />
                {erroresValidacion.nombrereceta && <span className="error-text">{erroresValidacion.nombrereceta}</span>}
              </div>

              <div className="campo">
                <label>Especificaciones</label>
                <textarea
                  name="especificaciones"
                  value={formData.especificaciones}
                  onChange={handleInputChange}
                  rows="3"
                  maxLength="400"
                  className={erroresValidacion.especificaciones ? "error" : ""}
                  placeholder="Describe las características y preparación de la receta..."
                />
                {erroresValidacion.especificaciones && <span className="error-text">{erroresValidacion.especificaciones}</span>}
              </div>
            </div>

            <div className="section-divider"></div>

            <div className="insumos-section">
              <div className="insumos-header">
                <h3>Insumos de la Receta ({insumosReceta.length})</h3>
                <button type="button" className="btn-agregar" onClick={() => setMostrarModalInsumos(true)} disabled={loading}>
                  + Agregar Insumos
                </button>
              </div>

              {erroresValidacion.insumos && <div className="error-text">{erroresValidacion.insumos}</div>}
              {erroresValidacion.cantidades && <div className="error-text">{erroresValidacion.cantidades}</div>}

              {insumosReceta.length > 0 ? (
                <table className="tabla-insumos">
                  <thead>
                    <tr>
                      <th>Insumo</th>
                      <th>Cantidad</th>
                      <th>Unidad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insumosReceta.map((insumo, index) => (
                      <tr key={insumo.id || index}>
                        <td>
                          <strong>{insumo.nombre || insumo.nombreinsumo}</strong>
                          <div>{insumo.categoria} • ${insumo.precio || 0}</div>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={insumo.cantidad || 1}
                            onChange={(e) => handleCantidadChange(insumo.id, e.target.value)}
                            disabled={loading}
                          />
                        </td>
                        <td>
                          <select
                            value={insumo.idunidadmedida || 1}
                            onChange={(e) => handleUnidadChange(insumo.id, e.target.value)}
                            disabled={loading}
                          >
                            {unidadesMedida.map(unidad => (
                              <option key={unidad.id} value={unidad.id}>{unidad.nombre}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button type="button" className="btn-eliminar" onClick={() => removeInsumo(insumo.id)} disabled={loading}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="sin-insumos">
                  <p>No hay insumos agregados a esta receta</p>
                  <button type="button" className="btn-agregar" onClick={() => setMostrarModalInsumos(true)} disabled={loading}>
                    + Agregar Primer Insumo
                  </button>
                </div>
              )}
            </div>

            <div className="botones-form">
              <button type="button" className="btn-cancelar" onClick={onClose} disabled={loading}>Cancelar</button>
              <button type="submit" className="btn-guardar" disabled={loading || insumosReceta.length === 0}>
                {loading ? "Guardando..." : `Guardar Receta (${insumosReceta.length} insumos)`}
              </button>
            </div>
          </form>

          {mostrarModalInsumos && (
            <AgregarInsumosModal
              onClose={() => setMostrarModalInsumos(false)}
              onAgregar={agregarInsumos}
              insumosSeleccionados={insumosReceta}
            />
          )}
        </div>
      </div>
    </div>
  );
}
