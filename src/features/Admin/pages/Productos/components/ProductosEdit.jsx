// src/features/Admin/pages/Productos/ProductosEdit.jsx
import React, { useState, useEffect } from "react";
import SeleccionarRecetaModal from "./components_recetas/SeleccionarRecetaModal";
import productoApiService from "../../../services/productos_services";
import Notification from "../../../components/Notification";
import "./css/productoscss.css"; 

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
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [subiendoImagen, setSubiendoImagen] = useState(false);

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
      } catch (error) {
        showNotification("Error al cargar categorías: " + error.message, "error");
        setCategorias([]);
      } finally {
        setLoadingCategorias(false);
      }
    };
    cargarCategorias();
  }, []);

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

  const validateForm = () => {
    const errores = {};
    if (!formData.nombreproducto.trim()) errores.nombreproducto = "El nombre es requerido";
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
          <div className="form-grid">
            {/* Nombre */}
            <div className="field-group">
              <label className="field-label">Nombre<span style={{ color: "red" }}>*</span></label>
              <input type="text" name="nombreproducto" value={formData.nombreproducto} 
                onChange={handleInputChange} className={`form-input ${erroresValidacion.nombreproducto ? "error" : ""}`} />
              {erroresValidacion.nombreproducto && <span className="error-message">{erroresValidacion.nombreproducto}</span>}
            </div>
            {/* Precio */}
            <div className="field-group">
              <label className="field-label">Precio<span style={{ color: "red" }}>*</span></label>
              <input type="number" name="precioproducto" value={formData.precioproducto} onChange={handleInputChange}
                className={`form-input ${erroresValidacion.precioproducto ? "error" : ""}`} min="0" step="0.01" />
              {erroresValidacion.precioproducto && <span className="error-message">{erroresValidacion.precioproducto}</span>}
            </div>
            {/* Cantidad */}
            <div className="field-group">
              <label className="field-label">Cantidad</label>
              <input type="number" name="cantidadproducto" value={formData.cantidadproducto} 
                onChange={handleInputChange} className="form-input" min="0" />
            </div>
            {/* Categoría */}
            <div className="field-group">
              <label className="field-label">Categoría<span style={{ color: "red" }}>*</span></label>
              <select name="idcategoriaproducto" value={formData.idcategoriaproducto} onChange={handleInputChange} className="form-input">
                <option value="">Seleccione</option>
                {categorias.map(cat => <option key={cat.idcategoriaproducto} value={cat.idcategoriaproducto}>{cat.nombrecategoria}</option>)}
              </select>
            </div>
            {/* Estado */}
            <div className="field-group">
              <label className="field-label">Estado</label>
              <select name="estado" value={formData.estado ? "activo" : "inactivo"} 
                onChange={e => setFormData(prev => ({ ...prev, estado: e.target.value === "activo" }))} className="form-input">
                <option value="activo">Activo ✅</option>
                <option value="inactivo">Inactivo ⛔</option>
              </select>
            </div>
          </div>
        </div>

        {/* Imagen */}
        <div className="form-card">
          <h2 className="section-title"><span className="title-icon">🖼️</span> Imagen</h2>
          {formData.imagenPreview && <img src={formData.imagenPreview} alt="preview" style={{ width: "120px", borderRadius: "10px" }} />}
          <input id="imagen-upload" type="file" accept="image/*" onChange={handleImagenChange} style={{ display: "none" }} />
          <label htmlFor="imagen-upload" className="btn-small" style={{ marginTop: "10px" }}>
            {formData.imagenPreview ? "Cambiar" : "Subir"}
          </label>
          {formData.imagenPreview && <button type="button" className="delete-btn" onClick={removerImagen}>Eliminar</button>}
        </div>

        {/* Receta */}
        <div className="form-card">
          <h2 className="section-title"><span className="title-icon">📋</span> Receta</h2>
          {formData.recetaSeleccionada ? (
            <div className="nested-item-list">
              <strong>{formData.recetaSeleccionada.nombrereceta}</strong>
              <p>{formData.recetaSeleccionada.especificaciones}</p>
              <button type="button" className="delete-btn" onClick={removerReceta}>Eliminar Receta</button>
            </div>
          ) : <p>No hay receta asignada</p>}
          <button type="button" className="btn-small" onClick={() => setMostrarModalReceta(true)}>
            {formData.recetaSeleccionada ? "Cambiar Receta" : "+ Agregar Receta"}
          </button>
        </div>

        {/* Botones */}
        <div className="action-buttons">
          <button type="button" className="btn btn-cancel" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button type="submit" className="btn btn-save" disabled={loading || subiendoImagen}>
            {loading ? "Actualizando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>

      {mostrarModalReceta && (
        <SeleccionarRecetaModal onClose={() => setMostrarModalReceta(false)} onSeleccionar={(r) => setFormData(prev => ({ ...prev, idreceta: r.idreceta, recetaSeleccionada: r }))} />
      )}
    </div>
  );
}
