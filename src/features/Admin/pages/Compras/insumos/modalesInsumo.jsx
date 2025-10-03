import React, { useState, useEffect, useRef } from "react";
import Modal from "../../../components/modal";
import { InputSwitch } from "primereact/inputswitch";
import insumoApiService from "../../../services/insumos";
import SearchableSelect from "./SearchableSelect";
import StyledSelect from "./StyledSelect";

export default function ModalInsumo({
  modal,
  cerrar,
  categorias,
  unidades,
  cargarInsumos,
  showNotification,
  abriragregarCategoria,
}) {
  const [form, setForm] = useState({
    nombreInsumo: "",
    idCategoriaInsumos: "",
    cantidad: "",
    idUnidadMedida: "",
    stockMinimo: 5,
    precio: "",
    estado: true,
    imagen: null,
    imagenPreview: null,
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (modal.tipo === "editar" && modal.insumo) {
      setForm({
        nombreInsumo: modal.insumo.nombreInsumo || modal.insumo.nombreinsumo || "",
        idCategoriaInsumos: modal.insumo.idCategoriaInsumos || modal.insumo.idcategoriainsumos || "",
        cantidad: modal.insumo.cantidad || "",
        idUnidadMedida: modal.insumo.idUnidadMedida || modal.insumo.idunidadmedida || "",
        stockMinimo: modal.insumo.stockMinimo || 5,
        precio: modal.insumo.precio || "",
        estado: modal.insumo.estado !== undefined ? modal.insumo.estado : true,
        imagen: null,
        imagenPreview: modal.insumo.idImagen || null,
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
        imagen: null,
        imagenPreview: null,
      });
    }
  }, [modal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification("Por favor selecciona un archivo de imagen válido", "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showNotification("La imagen no debe superar los 5MB", "error");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          imagen: file,
          imagenPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removerImagen = () => {
    setForm(prev => ({
      ...prev,
      imagen: null,
      imagenPreview: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertirImagenABase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getNombreCategoria = (insumo) => {
    if (insumo.nombreCategoria) return insumo.nombreCategoria;
    if (insumo.categoriainsumos?.nombrecategoria) return insumo.categoriainsumos.nombrecategoria;
    
    const categoriaId = insumo.idCategoriaInsumos || insumo.idcategoriainsumos;
    if (categoriaId && categorias.length > 0) {
      const categoria = categorias.find(cat => cat.id === parseInt(categoriaId));
      return categoria ? categoria.nombreCategoria : "Sin categoría";
    }
    
    return "Sin categoría";
  };

  const getNombreUnidad = (insumo) => {
    if (insumo.nombreUnidadMedida) return insumo.nombreUnidadMedida;
    if (insumo.unidadmedida?.unidadmedida) return insumo.unidadmedida.unidadmedida;
    
    const unidadId = insumo.idUnidadMedida || insumo.idunidadmedida;
    if (unidadId && unidades.length > 0) {
      const unidad = unidades.find(uni => uni.idunidadmedida === parseInt(unidadId));
      return unidad ? unidad.unidadmedida : "Sin unidad";
    }
    
    return "Sin unidad";
  };

  const verificarNombreDuplicado = async (nombre, idActual = null) => {
    try {
      const insumos = await insumoApiService.obtenerInsumos();
      const nombreNormalizado = nombre.trim().toLowerCase();
      
      const duplicado = insumos.find(insumo => {
        const idInsumo = insumo.id || insumo.idinsumo;
        const nombreInsumo = (insumo.nombreInsumo || insumo.nombreinsumo || '').trim().toLowerCase();
        
        // Si estamos editando, excluir el insumo actual de la búsqueda
        if (idActual && idInsumo === idActual) {
          return false;
        }
        
        return nombreInsumo === nombreNormalizado;
      });
      
      return duplicado !== undefined;
    } catch (error) {
      console.error("Error al verificar duplicados:", error);
      return false;
    }
  };

  const guardar = async () => {
    try {
      if (!form.nombreInsumo.trim()) {
        showNotification("El nombre del insumo es obligatorio", "error");
        return;
      }

      // Verificar si el nombre ya existe
      const idActual = modal.tipo === "editar" ? (modal.insumo.id || modal.insumo.idinsumo) : null;
      const existeDuplicado = await verificarNombreDuplicado(form.nombreInsumo, idActual);
      
      if (existeDuplicado) {
        showNotification(
          `Ya existe un insumo con el nombre "${form.nombreInsumo}". Por favor, usa un nombre diferente.`,
          "error"
        );
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
      if (!form.precio || form.precio < 1000) {
        showNotification("El precio debe ser mínimo $1,000 COP", "error");
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

      if (form.imagen) {
        const imagenBase64 = await convertirImagenABase64(form.imagen);
        datosEnvio.idImagen = imagenBase64;
      }

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
      const cantidadActual = parseFloat(modal.insumo.cantidad) || 0;
      
      if (cantidadActual > 0) {
        showNotification(
          `No se puede eliminar este insumo porque tiene ${cantidadActual} unidades en stock. ` +
          `Para eliminarlo, primero debe reducir el stock a 0.`,
          "error"
        );
        return;
      }

      const insumoId = modal.insumo.id || modal.insumo.idinsumo;
      await insumoApiService.eliminarInsumo(insumoId);
      showNotification("Insumo eliminado exitosamente");
      await cargarInsumos();
      cerrar();
    } catch (error) {
      console.error("Error al eliminar:", error);
      
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
              <strong>{modal.insumo?.nombreInsumo || modal.insumo?.nombreinsumo}</strong>?
            </p>
          </div>
        ) : modal.tipo === "ver" ? (
          <div className="modal-form-grid">
            <label>
              Nombre
              <input 
                value={modal.insumo?.nombreInsumo || modal.insumo?.nombreinsumo || ""} 
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
                value={modal.insumo?.cantidad || 0} 
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
                  type="text"
                  value={modal.insumo?.precio ? new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(modal.insumo.precio) : '$0'} 
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

            {form.imagenPreview && (
              <div style={{ 
                gridColumn: "1 / -1",
                textAlign: "center",
                marginTop: "10px"
              }}>
                <img 
                  src={form.imagenPreview} 
                  alt="Insumo" 
                  style={{ 
                    maxWidth: "200px", 
                    maxHeight: "200px",
                    borderRadius: "8px",
                    border: "2px solid #ddd"
                  }} 
                />
              </div>
            )}
            
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
              <SearchableSelect
                categorias={categorias.map(cat => ({ 
                  _id: cat.id, 
                  nombreCategoria: cat.nombreCategoria 
                }))}
                valorSeleccionado={form.idCategoriaInsumos}
                onChange={(id) => setForm({ ...form, idCategoriaInsumos: id })}
                onAgregarNueva={abriragregarCategoria}
                placeholder="Selecciona una categoría"
                error={false}
              />
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
              <StyledSelect
                opciones={unidades}
                valorSeleccionado={form.idUnidadMedida}
                onChange={(id) => setForm({ ...form, idUnidadMedida: id })}
                placeholder="Selecciona una unidad"
                error={false}
                campoValor="idunidadmedida"
                campoTexto="unidadmedida"
              />
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
                  min="1000"
                  step="100"
                  placeholder="1,000"
                  style={{ paddingLeft: "25px" }}
                />
                <small style={{
                  display: "block",
                  marginTop: "4px",
                  color: "#6c757d",
                  fontSize: "12px"
                }}>
                  Mínimo: $1,000 COP
                </small>
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
              backgroundColor: "#ff4081",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#fbbf24";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#ff4081";
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