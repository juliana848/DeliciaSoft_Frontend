// src/features/Admin/pages/Productos/ProductosEdit.jsx
import React, { useState, useEffect } from "react";
import SeleccionarRecetaModal from "./components_recetas/SeleccionarRecetaModal";
import productoApiService from "../../../services/productos_services";
import Notification from "../../../components/Notification";
import "./css/productoscss.css";
import ModalCategoria from "./ModalCategoria";
import categoriaProductoApiService from "../../../services/categoriaProductosService";

export default function ProductosEdit({ producto, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombreproducto: producto?.nombreproducto || "",
    precioproducto: producto?.precioproducto || "",
    cantidadproducto: producto?.cantidadproducto || 1,
    idcategoriaproducto: producto?.idcategoriaproducto || "",
    estado: producto?.estado ?? true,
    idreceta: producto?.idreceta || null,
    recetaSeleccionada: null,
    imagenArchivo: null,
    imagenPreview: producto?.urlimagen || producto?.imagenes?.urlimg || null,
    idimagen: producto?.idimagen || null,
  });

  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mostrarModalReceta, setMostrarModalReceta] = useState(false);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });

  const showNotification = (mensaje, tipo = "success") =>
    setNotification({ visible: true, mensaje, tipo });
  const hideNotification = () =>
    setNotification({ visible: false, mensaje: "", tipo: "success" });

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const response = await fetch("https://deliciasoft-backend.onrender.com/api/categorias-productos");
        if (!response.ok) throw new Error("No se pudo obtener las categorías");
        const data = await response.json();
        setCategorias(data);
        
        if (producto?.idcategoriaproducto) {
          const categoriaActual = data.find(c => c.idcategoriaproducto === producto.idcategoriaproducto);
          if (categoriaActual) {
            setSearchTerm(categoriaActual.nombrecategoria || categoriaActual.nombre);
          }
        }
      } catch (error) {
        showNotification("Error al cargar categorías: " + error.message, "error");
        setCategorias([]);
      } finally {
        setLoadingCategorias(false);
      }
    };
    cargarCategorias();
  }, [producto]);

  useEffect(() => {
    if (producto?.idreceta) {
      fetch("https://deliciasoft-backend.onrender.com/api/receta/recetas")
        .then(res => res.json())
        .then(data => {
          const receta = data.find(r => r.idreceta === producto.idreceta);
          if (receta) setFormData(prev => ({ ...prev, recetaSeleccionada: receta }));
        })
        .catch(() => showNotification("Error al cargar la receta", "error"));
    }
  }, [producto]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (erroresValidacion[name]) {
      setErroresValidacion(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImagenChange = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onload = ev =>
        setFormData(prev => ({ ...prev, imagenArchivo: archivo, imagenPreview: ev.target.result }));
      reader.readAsDataURL(archivo);
    }
  };

  const removerImagen = () => {
    setFormData(prev => ({ ...prev, imagenArchivo: null, imagenPreview: null }));
    const input = document.getElementById("imagen-upload");
    if (input) input.value = "";
  };

  const removerReceta = () => {
    setFormData(prev => ({ ...prev, idreceta: null, recetaSeleccionada: null }));
  };

  const abrirModalCategoria = () => setModalCategoriaVisible(true);
  const cerrarModalCategoria = () => setModalCategoriaVisible(false);

  const guardarCategoria = async (nuevaCategoria) => {
    const categoriaCreada = await categoriaProductoApiService.crearCategoria(nuevaCategoria);
    setCategorias((p) => [...p, categoriaCreada]);
    setFormData((p) => ({
      ...p,
      idcategoriaproducto: categoriaCreada.idcategoriaproducto,
    }));
    setSearchTerm(categoriaCreada.nombrecategoria || categoriaCreada.nombre);
    cerrarModalCategoria();
  };

  const validateForm = () => {
    const errores = {};
    if (!formData.nombreproducto.trim()) errores.nombreproducto = "El nombre es requerido";
    if (formData.nombreproducto.trim().length > 50) errores.nombreproducto = 'El nombre no puede exceder 50 caracteres';
    if (!formData.idcategoriaproducto) errores.idcategoriaproducto = "Seleccione categoría";
    if (!formData.precioproducto || isNaN(formData.precioproducto)) errores.precioproducto = "Precio inválido";
    if (!formData.cantidadproducto || isNaN(formData.cantidadproducto)) errores.cantidadproducto = "Cantidad inválida";
    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    let idImagenSubida = formData.idimagen;

    try {
      if (formData.imagenArchivo) {
        const resultadoImagen = await productoApiService.subirImagen(formData.imagenArchivo);
        idImagenSubida = resultadoImagen.idimagen;
      }
      const payload = {
        idproductogeneral: producto.id,
        nombreproducto: formData.nombreproducto.trim(),
        precioproducto: parseFloat(formData.precioproducto),
        cantidadproducto: parseInt(formData.cantidadproducto),
        estado: formData.estado,
        idcategoriaproducto: parseInt(formData.idcategoriaproducto),
        idimagen: idImagenSubida,
        idreceta: formData.idreceta,
      };
      await productoApiService.actualizarProducto(producto.id, payload);
      showNotification("Producto actualizado exitosamente", "success");
      if (onSave) onSave();
    } catch (err) {
      showNotification("Error al actualizar: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!producto) return <div className="compra-form-container">No se pudo cargar el producto</div>;

  return (
    <div className="compra-form-container">
      <Notification {...notification} onClose={hideNotification} />

      <form onSubmit={handleSubmit}>
        <div className="form-card">
          <h2 className="section-title"><span className="title-icon">✏️</span> Editar Producto</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: "24px", alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* --- CAMPOS --- */}
              <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="field-group">
                  <label className="field-label">Nombre<span style={{ color: "red" }}>*</span></label>
                  <input 
                    type="text" 
                    name="nombreproducto" 
                    value={formData.nombreproducto} 
                    onChange={handleInputChange} 
                    className={`form-input ${erroresValidacion.nombreproducto ? "error" : ""}`}
                    maxLength="50"
                  />
                  {erroresValidacion.nombreproducto && <span className="error-message">{erroresValidacion.nombreproducto}</span>}
                </div>

                <div className="field-group">
                  <label className="field-label">Precio<span style={{ color: "red" }}>*</span></label>
                  <input 
                    type="number" 
                    name="precioproducto" 
                    value={formData.precioproducto} 
                    onChange={handleInputChange}
                    className={`form-input ${erroresValidacion.precioproducto ? "error" : ""}`} 
                    min="0" 
                    step="0.01" 
                  />
                  {erroresValidacion.precioproducto && <span className="error-message">{erroresValidacion.precioproducto}</span>}
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="field-group">
                  <label className="field-label">Cantidad</label>
                  <input 
                    type="number" 
                    name="cantidadproducto" 
                    value={formData.cantidadproducto} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    min="0" 
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Estado</label>
                  <select 
                    name="estado" 
                    value={formData.estado ? "activo" : "inactivo"} 
                    onChange={e => setFormData(prev => ({ ...prev, estado: e.target.value === "activo" }))} 
                    className="form-input"
                  >
                    <option value="activo">Activo ✅</option>
                    <option value="inactivo">Inactivo ⛔</option>
                  </select>
                </div>
              </div>

              {/* Categoría */}
              <div className="field-group">
                <label>Categoría *</label>
                <div style={{ display: "flex", gap: "8px", position: "relative" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Buscar o seleccionar categoría..."
                      value={searchTerm}
                      onChange={(e) => {
                        const text = e.target.value;
                        setSearchTerm(text);
                        if (!text) {
                          setFormData(p => ({ ...p, idcategoriaproducto: "" }));
                        }
                      }}
                      onFocus={() => {
                        const dropdown = document.getElementById("categoria-dropdown-edit");
                        if (dropdown) dropdown.style.display = "block";
                      }}
                      className={`form-input ${erroresValidacion.idcategoriaproducto ? "error" : ""}`}
                    />

                    <div
                      id="categoria-dropdown-edit"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "white",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        marginTop: "4px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                        display: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                      }}
                      onMouseLeave={() => {
                        setTimeout(() => {
                          const dropdown = document.getElementById("categoria-dropdown-edit");
                          if (dropdown) dropdown.style.display = "none";
                        }, 200);
                      }}
                    >
                      {categorias
                        .filter(c =>
                          (c.nombrecategoria || c.nombre || "")
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                        .map((c) => (
                          <div
                            key={c.idcategoriaproducto}
                            onClick={() => {
                              setFormData(p => ({
                                ...p,
                                idcategoriaproducto: c.idcategoriaproducto
                              }));
                              setSearchTerm(c.nombrecategoria || c.nombre);

                              const dropdown = document.getElementById("categoria-dropdown-edit");
                              if (dropdown) dropdown.style.display = "none";

                              if (erroresValidacion.idcategoriaproducto) {
                                setErroresValidacion(p => ({ ...p, idcategoriaproducto: "" }));
                              }
                            }}
                            style={{
                              padding: "10px 12px",
                              cursor: "pointer",
                              borderBottom: "1px solid #f3f4f6",
                              transition: "background 0.2s"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                          >
                            {c.nombrecategoria || c.nombre}
                          </div>
                        ))}

                      {categorias.length === 0 && (
                        <div style={{ padding: "12px", color: "#6b7280", textAlign: "center" }}>
                          No hay categorías disponibles
                        </div>
                      )}
                    </div>
                  </div>

                  <button type="button" className="btn-small" onClick={abrirModalCategoria}>
                    +
                  </button>
                </div>
                {erroresValidacion.idcategoriaproducto && (
                  <span className="error-message">{erroresValidacion.idcategoriaproducto}</span>
                )}
              </div>
            </div>

            {/* Imagen */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ fontWeight: "600", color: "#374151", fontSize: "14px" }}>Imagen del Producto</label>
              
              {formData.imagenPreview ? (
                <div style={{ position: "relative" }}>
                  <img 
                    src={formData.imagenPreview} 
                    alt="preview" 
                    style={{ 
                      width: "100%", 
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      border: "2px solid #e5e7eb"
                    }} 
                  />
                  <button 
                    type="button" 
                    onClick={removerImagen}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "18px",
                      fontWeight: "bold",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div 
                  style={{ 
                    width: "100%", 
                    height: "200px",
                    border: "2px dashed #d1d5db",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    background: "#f9fafb",
                    color: "#6b7280"
                  }}
                >
                  <div style={{ fontSize: "48px" }}>📷</div>
                  <p style={{ margin: 0, fontSize: "13px", textAlign: "center", padding: "0 10px" }}>
                    No hay imagen
                  </p>
                </div>
              )}
              
              <input 
                id="imagen-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleImagenChange} 
                style={{ display: "none" }} 
              />
              <label 
                htmlFor="imagen-upload" 
                className="btn-small" 
                style={{ 
                  cursor: "pointer", 
                  display: "block",
                  textAlign: "center",
                  padding: "8px 12px"
                }}
              >
                {formData.imagenPreview ? "Cambiar Imagen" : "📎 Subir Imagen"}
              </label>
            </div>
          </div>
        </div>

        {/* Receta */}
        <div className="form-card">
          <h2 className="section-title"><span className="title-icon">📋</span> Resumen de Receta</h2>

          {formData.recetaSeleccionada ? (
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <strong style={{ fontSize: "16px", color: "#1f2937" }}>
                  {formData.recetaSeleccionada.nombrereceta}
                </strong>
                <p style={{ marginTop: "8px", color: "#6b7280", fontSize: "14px" }}>
                  {formData.recetaSeleccionada.especificaciones}
                </p>
              </div>

              {(formData.recetaSeleccionada.insumos || []).length > 0 && (
                <div className="table-container" style={{ marginBottom: "1rem" }}>
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Insumo</th>
                        <th style={{ textAlign: "center" }}>Cantidad</th>
                        <th style={{ textAlign: "center" }}>Unidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.recetaSeleccionada.insumos.map((i) => (
                        <tr key={i.id || i.iddetallereceta} className="product-row">
                          <td className="product-name">
                            <strong>{i.nombre || i.nombreinsumo}</strong>
                          </td>
                          <td style={{ textAlign: "center", fontWeight: "600" }}>
                            {i.cantidad}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {i.unidad || i.unidadmedida}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* --- BOTONES lado a lado --- */}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="btn-small"
                  onClick={() => setMostrarModalReceta(true)}
                >
                  Cambiar Receta
                </button>

                <button
                  type="button"
                  className="btn-small"
                  onClick={removerReceta}
                  style={{
                    background: "#dc2626",
                    color: "white",
                    border: "1px solid #b91c1c"
                  }}
                >
                  Eliminar Receta
                </button>
              </div>
            </div>

          ) : (
            <button
              type="button"
              className="btn-small"
              onClick={() => setMostrarModalReceta(true)}
              style={{ marginTop: "10px" }}
            >
              + Agregar Receta
            </button>
          )}
        </div>

        <div className="action-buttons">
          <button type="button" className="btn btn-cancel" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button type="submit" className="btn btn-save" disabled={loading || subiendoImagen}>
            {loading ? "Actualizando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>

      {mostrarModalReceta && (
        <SeleccionarRecetaModal 
          onClose={() => setMostrarModalReceta(false)} 
          onSeleccionar={(r) => setFormData(prev => ({ ...prev, idreceta: r.idreceta, recetaSeleccionada: r }))} 
        />
      )}

      {modalCategoriaVisible && (
        <ModalCategoria 
          visible={modalCategoriaVisible} 
          onClose={cerrarModalCategoria} 
          tipo="agregar" 
          onGuardar={guardarCategoria} 
        />
      )}
    </div>
  );
}
