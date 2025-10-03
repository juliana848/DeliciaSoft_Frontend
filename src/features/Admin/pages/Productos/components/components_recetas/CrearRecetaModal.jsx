import React, { useState } from "react";
import AgregarInsumosModal from "./AgregarInsumosModal";
import recetaApiService from "../../../../services/Receta_services";

export default function CrearRecetaModal({ onClose, onGuardar }) {
  const [formData, setFormData] = useState({
    nombrereceta: "",
    especificaciones: ""
  });
  const [insumosReceta, setInsumosReceta] = useState([]);
  const [mostrarModalInsumos, setMostrarModalInsumos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores de validación
    if (erroresValidacion[name]) {
      setErroresValidacion(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const agregarInsumos = (nuevosInsumos) => {
    console.log('Agregando insumos:', nuevosInsumos);
    
    // Filtrar insumos que no estén ya en la receta
    const insumosNuevos = nuevosInsumos.filter(nuevoInsumo => 
      !insumosReceta.some(existente => existente.id === nuevoInsumo.id)
    );
    
    // Agregar insumos con datos más completos
    const insumosConDatos = insumosNuevos.map(insumo => ({
      ...insumo,
      idinsumo: insumo.id,
      cantidad: insumo.cantidad || 1,
      idunidadmedida: insumo.idunidadmedida || 1,
      nombreinsumo: insumo.nombre || insumo.nombreinsumo,
      unidadmedida: insumo.unidadmedida || 'Unidad'
    }));
    
    setInsumosReceta(prev => [...prev, ...insumosConDatos]);
    console.log('Insumos después de agregar:', [...insumosReceta, ...insumosConDatos]);
  };

  const removeInsumo = (insumoId) => {
    console.log('Removiendo insumo ID:', insumoId);
    setInsumosReceta(prev => prev.filter(insumo => insumo.id !== insumoId));
  };

  const handleCantidadChange = (insumoId, nuevaCantidad) => {
    const cantidad = parseFloat(nuevaCantidad) || 1;
    setInsumosReceta(prev =>
      prev.map(insumo =>
        insumo.id === insumoId
          ? { ...insumo, cantidad: cantidad }
          : insumo
      )
    );
    console.log('Cantidad actualizada para insumo', insumoId, ':', cantidad);
  };

  const handleUnidadChange = (insumoId, nuevaUnidad) => {
    setInsumosReceta(prev =>
      prev.map(insumo =>
        insumo.id === insumoId
          ? { ...insumo, idunidadmedida: parseInt(nuevaUnidad) || 1 }
          : insumo
      )
    );
    console.log('Unidad actualizada para insumo', insumoId, ':', nuevaUnidad);
  };

  const validateForm = () => {
    const errores = {};

    if (!formData.nombrereceta.trim()) {
      errores.nombrereceta = 'El nombre de la receta es requerido';
    }

    if (formData.nombrereceta.trim().length > 50) {
      errores.nombrereceta = 'El nombre no puede exceder 50 caracteres';
    }

    if (formData.especificaciones && formData.especificaciones.length > 80) {
      errores.especificaciones = 'Las especificaciones no pueden exceder 80 caracteres';
    }

    if (insumosReceta.length === 0) {
      errores.insumos = 'Debe agregar al menos un insumo a la receta';
    }

    // Validar que todos los insumos tengan cantidad válida
    const insumosInvalidos = insumosReceta.filter(insumo => 
      !insumo.cantidad || isNaN(parseFloat(insumo.cantidad)) || parseFloat(insumo.cantidad) <= 0
    );

    if (insumosInvalidos.length > 0) {
      errores.cantidades = 'Todos los insumos deben tener una cantidad válida mayor a 0';
    }

    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('=== CREANDO RECETA ===');
      console.log('Datos del formulario:', formData);
      console.log('Insumos de la receta:', insumosReceta);

      // Preparar datos para el servicio
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

      console.log('Datos preparados para el servicio:', datosReceta);

      // Usar el servicio para crear la receta
      const recetaCompleta = await recetaApiService.crearReceta(datosReceta);
      
      console.log('=== RECETA CREADA EXITOSAMENTE ===');
      console.log(recetaCompleta);

      alert(`Receta "${recetaCompleta.nombrereceta}" creada exitosamente con ${recetaCompleta.cantidadInsumos || insumosReceta.length} insumos`);
      
      // Llamar al callback con la receta completa
      onGuardar(recetaCompleta);
      
    } catch (error) {
      console.error('Error al crear receta:', error);
      alert('Error al crear la receta: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  // Unidades de medida disponibles
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
    <div className="modal-overlay-fixed" style={{ zIndex: 1002 }}>
      <div className="modal-content-fixed">
        <div style={{ padding: "2rem" }}>
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            borderBottom: "2px solid #f1f1f1",
            paddingBottom: "1rem",
          }}>
            <h2 style={{
              color: "#2c3e50",
              margin: 0,
              fontSize: "1.8rem",
              fontWeight: "600",
            }}>
              Crear Nueva Receta
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                background: "#ff6b6b",
                border: "none",
                fontSize: "1.2rem",
                cursor: loading ? "not-allowed" : "pointer",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontWeight: "600",
                opacity: loading ? 0.6 : 1
              }}
            >
              Cerrar
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Campos del formulario */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}>
              {/* Nombre de la Receta */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#34495e",
                  marginBottom: "0.5rem",
                }}>
                  Nombre de la Receta <span style={{ color: "#e74c3c" }}>*</span>
                </label>
                <input
                  type="text"
                  name="nombrereceta"
                  value={formData.nombrereceta}
                  onChange={handleInputChange}
                  required
                  maxLength="50"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: erroresValidacion.nombrereceta ? "2px solid #e74c3c" : "2px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                  placeholder="Ej: Café Especial, Brownie Chocolate..."
                />
                {erroresValidacion.nombrereceta && (
                  <span style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {erroresValidacion.nombrereceta}
                  </span>
                )}
                <small style={{ color: "#666", fontSize: "0.8rem" }}>
                  {formData.nombrereceta.length}/50 caracteres
                </small>
              </div>

              {/* Especificaciones */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#34495e",
                  marginBottom: "0.5rem",
                }}>
                  Especificaciones
                </label>
                <textarea
                  name="especificaciones"
                  value={formData.especificaciones}
                  onChange={handleInputChange}
                  rows="3"
                  maxLength="400"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: erroresValidacion.especificaciones ? "2px solid #e74c3c" : "2px solid #e9ecef",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                  placeholder="Describe las características y preparación de la receta..."
                />
                {erroresValidacion.especificaciones && (
                  <span style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {erroresValidacion.especificaciones}
                  </span>
                )}
                <small style={{ color: "#666", fontSize: "0.8rem" }}>
                  {formData.especificaciones.length}/80 caracteres
                </small>
              </div>
            </div>

            <div className="section-divider" style={{ margin: "1.5rem 0", borderTop: "1px solid #e9ecef" }}></div>

            {/* Sección de Insumos */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ color: "#2c3e50", margin: 0 }}>
                  Insumos de la Receta ({insumosReceta.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setMostrarModalInsumos(true)}
                  disabled={loading}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  + Agregar Insumos
                </button>
              </div>

              {/* Mostrar errores de validación */}
              {erroresValidacion.insumos && (
                <div style={{ 
                  color: "#e74c3c", 
                  fontSize: "0.85rem", 
                  marginBottom: "1rem",
                  padding: "0.5rem",
                  backgroundColor: "#fdf2f2",
                  border: "1px solid #e74c3c",
                  borderRadius: "4px"
                }}>
                  {erroresValidacion.insumos}
                </div>
              )}

              {erroresValidacion.cantidades && (
                <div style={{ 
                  color: "#e74c3c", 
                  fontSize: "0.85rem", 
                  marginBottom: "1rem",
                  padding: "0.5rem",
                  backgroundColor: "#fdf2f2",
                  border: "1px solid #e74c3c",
                  borderRadius: "4px"
                }}>
                  {erroresValidacion.cantidades}
                </div>
              )}
              
              {/* Tabla de insumos o mensaje vacío */}
              {insumosReceta.length > 0 ? (
                <div style={{ 
                  border: "1px solid #e9ecef", 
                  borderRadius: "8px", 
                  overflow: "hidden",
                  maxHeight: "400px",
                  overflowY: "auto"
                }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8f9fa", position: "sticky", top: 0 }}>
                        <th style={{ 
                          padding: "0.75rem", 
                          textAlign: "left", 
                          borderBottom: "1px solid #e9ecef",
                          fontWeight: "600",
                          color: "#2c3e50",
                          fontSize: "0.9rem"
                        }}>
                          Insumo
                        </th>
                        <th style={{ 
                          padding: "0.75rem", 
                          textAlign: "left", 
                          borderBottom: "1px solid #e9ecef",
                          fontWeight: "600",
                          color: "#2c3e50",
                          fontSize: "0.9rem",
                          width: "120px"
                        }}>
                          Cantidad
                        </th>
                        <th style={{ 
                          padding: "0.75rem", 
                          textAlign: "left", 
                          borderBottom: "1px solid #e9ecef",
                          fontWeight: "600",
                          color: "#2c3e50",
                          fontSize: "0.9rem",
                          width: "140px"
                        }}>
                          Unidad
                        </th>
                        <th style={{ 
                          padding: "0.75rem", 
                          textAlign: "left", 
                          borderBottom: "1px solid #e9ecef",
                          fontWeight: "600",
                          color: "#2c3e50",
                          fontSize: "0.9rem",
                          width: "100px"
                        }}>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {insumosReceta.map((insumo, index) => (
                        <tr key={insumo.id || index} style={{ 
                          backgroundColor: index % 2 === 0 ? "white" : "#f9f9f9"
                        }}>
                          <td style={{ 
                            padding: "0.75rem", 
                            borderBottom: "1px solid #f0f0f0",
                            fontSize: "0.9rem"
                          }}>
                            <div>
                              <strong>{insumo.nombre || insumo.nombreinsumo}</strong>
                              <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.2rem" }}>
                                {insumo.categoria} • ${insumo.precio?.toLocaleString('es-CO') || 0}
                              </div>
                            </div>
                          </td>
                          <td style={{ 
                            padding: "0.75rem", 
                            borderBottom: "1px solid #f0f0f0"
                          }}>
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={insumo.cantidad || 1}
                              onChange={(e) => handleCantidadChange(insumo.id, e.target.value)}
                              disabled={loading}
                              style={{
                                width: "80px",
                                padding: "0.4rem",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "0.9rem",
                                textAlign: "center"
                              }}
                            />
                          </td>
                          <td style={{ 
                            padding: "0.75rem", 
                            borderBottom: "1px solid #f0f0f0"
                          }}>
                            <select
                              value={insumo.idunidadmedida || 1}
                              onChange={(e) => handleUnidadChange(insumo.id, e.target.value)}
                              disabled={loading}
                              style={{
                                width: "100%",
                                padding: "0.4rem",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "0.85rem"
                              }}
                            >
                              {unidadesMedida.map(unidad => (
                                <option key={unidad.id} value={unidad.id}>
                                  {unidad.nombre}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ 
                            padding: "0.75rem", 
                            borderBottom: "1px solid #f0f0f0"
                          }}>
                            <button
                              type="button"
                              onClick={() => removeInsumo(insumo.id)}
                              disabled={loading}
                              style={{
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                padding: "0.3rem 0.6rem",
                                borderRadius: "4px",
                                cursor: loading ? "not-allowed" : "pointer",
                                fontSize: "0.8rem",
                                opacity: loading ? 0.6 : 1
                              }}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{
                  border: "2px dashed #ddd",
                  borderRadius: "8px",
                  padding: "3rem 2rem",
                  textAlign: "center",
                  backgroundColor: "#f8f9fa",
                  marginBottom: "1rem"
                }}>
                  <p style={{ color: "#666", margin: "0 0 1rem 0", fontSize: "1rem" }}>
                    No hay insumos agregados a esta receta
                  </p>
                  <button
                    type="button"
                    onClick={() => setMostrarModalInsumos(true)}
                    disabled={loading}
                    style={{
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#17a2b8",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    + Agregar Primer Insumo
                  </button>
                </div>
              )}

              {/* Resumen de costos */}
              {insumosReceta.length > 0 && (
                <div style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #e9ecef"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "600", color: "#2c3e50" }}>
                      Costo Estimado Total:
                    </span>
                    <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "#28a745" }}>
                      ${recetaApiService.calcularCostoReceta({ insumos: insumosReceta }).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <small style={{ color: "#666", fontSize: "0.8rem" }}>
                    *Basado en precios y cantidades de insumos
                  </small>
                </div>
              )}
            </div>

            {/* Botones */}
            <div style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "flex-end",
              borderTop: "1px solid #e9ecef",
              paddingTop: "1.5rem",
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "2px solid #6c757d",
                  backgroundColor: "transparent",
                  color: "#6c757d",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1
                }}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading || insumosReceta.length === 0}
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  backgroundColor: loading || insumosReceta.length === 0 ? "#6c757d" : "#28a745",
                  color: "white",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: loading || insumosReceta.length === 0 ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Guardando..." : `Guardar Receta (${insumosReceta.length} insumos)`}
              </button>
            </div>
          </form>

          {/* Modal Agregar Insumos */}
          {mostrarModalInsumos && (
            <AgregarInsumosModal
              onClose={() => setMostrarModalInsumos(false)}
              onAgregar={agregarInsumos}
              insumosSeleccionados={insumosReceta}
            />
          )}
        </div>

        <style jsx>{`
          .modal-overlay-fixed {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1002;
          }

          .modal-content-fixed {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }

          .section-divider {
            border-top: 1px solid #e9ecef;
            margin: 1.5rem 0;
          }
        `}</style>
      </div>
    </div>
  );
}