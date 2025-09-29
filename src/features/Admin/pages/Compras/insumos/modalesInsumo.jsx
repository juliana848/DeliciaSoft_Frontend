import React, { useState, useEffect } from "react";
import Modal from "../../../components/modal";
import { InputSwitch } from "primereact/inputswitch";
import insumoApiService from "../../../services/insumos";

export default function ModalInsumo({
  modal,
  cerrar,
  categorias,
  unidades,
  cargarInsumos,
  showNotification,
}) {
  const [form, setForm] = useState({
    nombreInsumo: "",
    idCategoriaInsumos: "",
    cantidad: "",
    idUnidadMedida: "",
    stockMinimo: 5,
    precio: "",
    estado: true,
  });

  useEffect(() => {
    if (modal.tipo === "editar" && modal.insumo) {
      setForm({
        nombreInsumo: modal.insumo.nombreInsumo || "",
        idCategoriaInsumos: modal.insumo.idCategoriaInsumos || modal.insumo.idcategoriainsumos || "",
        cantidad: modal.insumo.cantidad || "",
        idUnidadMedida: modal.insumo.idUnidadMedida || modal.insumo.idunidadmedida || "",
        stockMinimo: modal.insumo.stockMinimo || 5,
        precio: modal.insumo.precio || "",
        estado: modal.insumo.estado !== undefined ? modal.insumo.estado : true,
      });
    } else if (modal.tipo === "agregar") {
      setForm({
        nombreInsumo: "",
        idCategoriaInsumos: "",
        cantidad: "",
        idUnidadMedida: "",
        stockMinimo: 5,
        precio: "",
        estado: true,
      });
    }
  }, [modal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Función helper para obtener el nombre de la categoría
  const getNombreCategoria = (insumo) => {
    if (insumo.nombreCategoria) return insumo.nombreCategoria;
    if (insumo.categoriainsumos?.nombrecategoria) return insumo.categoriainsumos.nombrecategoria;
    
    // Buscar en la lista de categorías
    const categoriaId = insumo.idCategoriaInsumos || insumo.idcategoriainsumos;
    if (categoriaId && categorias.length > 0) {
      const categoria = categorias.find(cat => cat.id === parseInt(categoriaId));
      return categoria ? categoria.nombreCategoria : "Sin categoría";
    }
    
    return "Sin categoría";
  };

  // Función helper para obtener el nombre de la unidad
  const getNombreUnidad = (insumo) => {
    if (insumo.nombreUnidadMedida) return insumo.nombreUnidadMedida;
    if (insumo.unidadmedida?.unidadmedida) return insumo.unidadmedida.unidadmedida;
    
    // Buscar en la lista de unidades
    const unidadId = insumo.idUnidadMedida || insumo.idunidadmedida;
    if (unidadId && unidades.length > 0) {
      const unidad = unidades.find(uni => uni.idunidadmedida === parseInt(unidadId));
      return unidad ? unidad.unidadmedida : "Sin unidad";
    }
    
    return "Sin unidad";
  };

  const guardar = async () => {
    try {
      // Validación básica
      if (!form.nombreInsumo.trim()) {
        showNotification("El nombre del insumo es obligatorio", "error");
        return;
      }
      if (!form.idCategoriaInsumos) {
        showNotification("La categoría es obligatoria", "error");
        return;
      }
      if (!form.cantidad || form.cantidad <= 0) {
        showNotification("La cantidad debe ser mayor a 0", "error");
        return;
      }
      if (!form.precio || form.precio <= 0) {
        showNotification("El precio debe ser mayor a 0", "error");
        return;
      }

      const datosEnvio = {
        ...form,
        idCategoriaInsumos: parseInt(form.idCategoriaInsumos),
        idUnidadMedida: parseInt(form.idUnidadMedida),
        cantidad: parseFloat(form.cantidad),
        stockMinimo: parseInt(form.stockMinimo),
        precio: parseFloat(form.precio),
      };

      if (modal.tipo === "agregar") {
        await insumoApiService.crearInsumo(datosEnvio);
        showNotification("Insumo agregado exitosamente");
      } else if (modal.tipo === "editar") {
        const insumoId = modal.insumo.id || modal.insumo.idinsumo;
        await insumoApiService.actualizarInsumo(insumoId, datosEnvio);
        showNotification("Insumo actualizado exitosamente");
      }
      
      await cargarInsumos();
      cerrar();
    } catch (error) {
      console.error("Error al guardar:", error);
      showNotification("Error al guardar: " + error.message, "error");
    }
  };

  const eliminar = async () => {
    try {
      const insumoId = modal.insumo.id || modal.insumo.idinsumo;
      await insumoApiService.eliminarInsumo(insumoId);
      showNotification("Insumo eliminado exitosamente");
      await cargarInsumos();
      cerrar();
    } catch (error) {
      console.error("Error al eliminar:", error);
      
      // Mensajes más claros según el tipo de error
      let mensajeError = "Error al eliminar el insumo";
      
      if (error.message?.includes("asociado") || 
          error.message?.includes("referencia") || 
          error.message?.includes("constraint") ||
          error.message?.includes("foreign key") ||
          error.status === 409) {
        mensajeError = "No se puede eliminar este insumo porque está siendo usado en productos, recetas o pedidos. Primero debe desvincularlo de esos registros.";
      } else if (error.status === 404) {
        mensajeError = "El insumo no existe o ya fue eliminado";
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      showNotification(mensajeError, "error");
    }
  };

  return (
    <Modal visible={modal.visible} onClose={cerrar}>
      <h2 className="modal-title">
        {modal.tipo === "agregar" && "Agregar Insumo"}
        {modal.tipo === "editar" && "Editar Insumo"}
        {modal.tipo === "ver" && "Detalles del Insumo"}
        {modal.tipo === "eliminar" && "Eliminar Insumo"}
      </h2>

      <div className="modal-body">
        {modal.tipo === "eliminar" ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontSize: "16px", margin: 0 }}>
              ¿Seguro que quieres eliminar el insumo{" "}
              <strong>{modal.insumo?.nombreInsumo}</strong>?
            </p>
          </div>
        ) : modal.tipo === "ver" ? (
          <div className="modal-form-grid">
            <label>
              Nombre
              <input 
                value={modal.insumo?.nombreInsumo || modal.insumo?.nombre || ""} 
                readOnly 
                className="modal-input"
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
              />
            </label>
            
            <label>
              Categoría
              <input 
                value={
                  modal.insumo?.nombreCategoria || 
                  modal.insumo?.categoria ||
                  modal.insumo?.categoriainsumos?.nombrecategoria ||
                  (categorias.find(cat => cat.id === parseInt(modal.insumo?.idCategoriaInsumos || modal.insumo?.idcategoriainsumos))?.nombreCategoria) ||
                  "Sin categoría"
                } 
                readOnly 
                className="modal-input"
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
              />
            </label>
            
            <label>
              Cantidad
              <input 
                type="number" 
                value={modal.insumo?.cantidad || ""} 
                readOnly 
                className="modal-input"
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
              />
            </label>
            
            <label>
              Unidad
              <input 
                value={
                  modal.insumo?.nombreUnidadMedida ||
                  modal.insumo?.unidad ||
                  modal.insumo?.unidadmedida?.unidadmedida ||
                  (unidades.find(uni => uni.idunidadmedida === parseInt(modal.insumo?.idUnidadMedida || modal.insumo?.idunidadmedida))?.unidadmedida) ||
                  "Sin unidad"
                } 
                readOnly 
                className="modal-input"
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
              />
            </label>
            
            <label>
              Stock Mínimo
              <input 
                type="number" 
                value={modal.insumo?.stockMinimo || 5} 
                readOnly 
                className="modal-input"
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
              />
            </label>
            
            <label>
              Precio
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6c757d"
                }}>$</span>
                <input 
                  type="number" 
                  value={modal.insumo?.precio || ""} 
                  readOnly 
                  className="modal-input"
                  style={{ 
                    backgroundColor: "#f5f5f5", 
                    cursor: "not-allowed",
                    paddingLeft: "25px"
                  }}
                />
              </div>
            </label>
            
            <div style={{ 
              gridColumn: "1 / -1", 
              display: "flex", 
              alignItems: "center", 
              gap: "10px",
              marginTop: "10px"
            }}>
              <span>Estado:</span>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 12px",
                borderRadius: "12px",
                backgroundColor: modal.insumo?.estado ? "#e8f5e9" : "#ffebee",
                color: modal.insumo?.estado ? "#2e7d32" : "#c62828",
                fontWeight: "500"
              }}>
                {modal.insumo?.estado ? "✅ Activo" : "❌ Inactivo"}
              </div>
            </div>
          </div>
        ) : (
          <div className="modal-form-grid">
            <label>
              Nombre*
              <input
                name="nombreInsumo"
                value={form.nombreInsumo}
                onChange={handleChange}
                className="modal-input"
                placeholder="Ingrese el nombre del insumo"
              />
            </label>

            <label>
              Categoría*
              <select
                name="idCategoriaInsumos"
                value={form.idCategoriaInsumos}
                onChange={handleChange}
                className="modal-input"
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombreCategoria}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Cantidad*
              <input
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                className="modal-input"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </label>

            <label>
              Unidad*
              <select
                name="idUnidadMedida"
                value={form.idUnidadMedida}
                onChange={handleChange}
                className="modal-input"
              >
                <option value="">Selecciona una unidad</option>
                {unidades.map((uni) => (
                  <option key={uni.idunidadmedida} value={uni.idunidadmedida}>
                    {uni.unidadmedida}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Stock Mínimo*
              <input
                type="number"
                name="stockMinimo"
                value={form.stockMinimo}
                onChange={handleChange}
                className="modal-input"
                min="0"
                step="1"
                placeholder="5"
              />
            </label>

            <label>
              Precio*
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6c757d",
                  fontSize: "14px",
                  fontWeight: "500"
                }}>$</span>
                <input
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                  className="modal-input"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  style={{ paddingLeft: "25px" }}
                />
              </div>
            </label>

            {modal.tipo !== "agregar" && (
              <div style={{ 
                gridColumn: "1 / -1", 
                display: "flex", 
                alignItems: "center", 
                gap: "10px",
                marginTop: "10px"
              }}>
                <span>Estado:</span>
                <InputSwitch
                  checked={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.value })}
                />
                <span style={{ 
                  color: form.estado ? "#28a745" : "#dc3545",
                  fontWeight: "500"
                }}>
                  {form.estado ? "Activo" : "Inactivo"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button className="modal-btn cancel-btn" onClick={cerrar}>
          {modal.tipo === "ver" ? "Cerrar" : modal.tipo === "eliminar" ? "Cancelar" : "Cancelar"}
        </button>
        
        {modal.tipo === "eliminar" && (
          <button
            className="modal-btn"
            onClick={eliminar}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none"
            }}
          >
            Eliminar
          </button>
        )}
        
        {(modal.tipo === "agregar" || modal.tipo === "editar") && (
          <button
            className="modal-btn save-btn"
            onClick={guardar}
          >
            Guardar
          </button>
        )}
      </div>
    </Modal>
  );
}