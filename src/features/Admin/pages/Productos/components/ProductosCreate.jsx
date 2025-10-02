// src/features/Admin/pages/Productos/ProductosCreate.jsx
import React, { useState, useEffect } from "react";
import SeleccionarRecetaModal from "./components_recetas/SeleccionarRecetaModal";
import productoApiService from "../../../services/productos_services";
import Notification from "../../../components/Notification";
import "./css/productoscss.css"; 
import ModalCategoria from "./ModalCategoria";
import categoriaProductoApiService from "../../../services/categoriaProductosService";

export default function ProductosCreate({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombreproducto: "",
    precioproducto: "",
    cantidadproducto: 1,
    idcategoriaproducto: "",
    idreceta: null,
    recetaSeleccionada: null,
    imagenArchivo: null,
    imagenPreview: null,
  });


  
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mostrarModalReceta, setMostrarModalReceta] = useState(false);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
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
        const response = await fetch(
          "https://deliciasoft-backend.onrender.com/api/categorias-productos"
        );
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (erroresValidacion[name]) {
      setErroresValidacion((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImagenChange = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!tiposPermitidos.includes(archivo.type)) {
      showNotification("Tipo de archivo no permitido", "error");
      e.target.value = "";
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      showNotification("El archivo es demasiado grande (máx 5MB)", "error");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({
        ...prev,
        imagenArchivo: archivo,
        imagenPreview: ev.target.result,
      }));
    };
    reader.readAsDataURL(archivo);
  };

  const removerImagen = () => {
    setFormData((prev) => ({ ...prev, imagenArchivo: null, imagenPreview: null }));
    const fileInput = document.getElementById("imagen-upload");
    if (fileInput) fileInput.value = "";
  };

  const handleSeleccionarReceta = (receta) => {
    setFormData((prev) => ({
      ...prev,
      idreceta: receta.idreceta,
      recetaSeleccionada: receta,
    }));
    setMostrarModalReceta(false);
  };

  const removerReceta = () => {
    setFormData((prev) => ({ ...prev, idreceta: null, recetaSeleccionada: null }));
  };

  const abrirModalCategoria = () => setModalCategoriaVisible(true);
  const cerrarModalCategoria = () => setModalCategoriaVisible(false);

  const guardarCategoria = async (nuevaCategoria) => {
    try {
      // Usamos el servicio correcto de categorías
      const categoriaCreada = await categoriaProductoApiService.crearCategoria(nuevaCategoria);

      // Actualizamos la lista de categorías
      setCategorias((prev) => [...prev, categoriaCreada]);

      // Seleccionamos la nueva categoría en el formulario
      setFormData((prev) => ({
        ...prev,
        idcategoriaproducto: categoriaCreada.idcategoriaproducto,
      }));

      // Notificación de éxito
      showNotification("Categoría creada correctamente", "success");

      // Cerramos el modal
      cerrarModalCategoria();
    } catch (error) {
      // console.error('Error al crear categoría:', error);
      throw error;
    }
  };


  const validateForm = () => {
    const errores = {};
    if (!formData.nombreproducto.trim()) errores.nombreproducto = "El nombre del producto es requerido";
    if (!formData.idcategoriaproducto) errores.idcategoriaproducto = "Debe seleccionar una categoría";

    const precio = parseFloat(formData.precioproducto);
    if (!formData.precioproducto || isNaN(precio) || precio < 0)
      errores.precioproducto = "El precio debe ser un número válido mayor o igual a 0";

    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    let idImagenSubida = null;

    try {
      if (formData.imagenArchivo) {
        setSubiendoImagen(true);
        try {
          const resultadoImagen = await productoApiService.subirImagen(formData.imagenArchivo);
          idImagenSubida = resultadoImagen.idimagen;
        } catch {
          showNotification("Error al subir la imagen", "error");
          return;
        } finally {
          setSubiendoImagen(false);
        }
      }

      const payload = {
        nombreproducto: formData.nombreproducto.trim(),
        precioproducto: parseFloat(formData.precioproducto),
        cantidadproducto: 1,
        estado: true,
        idcategoriaproducto: parseInt(formData.idcategoriaproducto),
        idimagen: idImagenSubida,
        idreceta: formData.idreceta,
      };

      const productoCreado = await productoApiService.crearProducto(payload);
      showNotification("Producto creado exitosamente", "success");
      if (onSave) onSave(productoCreado);
    } catch (error) {
      showNotification("Error al crear producto: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compra-form-container">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <form onSubmit={handleSubmit}>
        {/* Información del Producto */}
        <div className="form-card">
          <h2 className="section-title">
            <span className="title-icon">📦</span> Información del Producto
          </h2>

          <div className="form-grid">
            {/* Nombre */}
            <div className="field-group">
              <label className="field-label">
                Nombre del Producto <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="nombreproducto"
                value={formData.nombreproducto}
                onChange={handleInputChange}
                className={`form-input ${erroresValidacion.nombreproducto ? "error" : ""}`}
                placeholder="Ej: Pan de yuca"
                required
              />
              {erroresValidacion.nombreproducto && (
                <span className="error-message">{erroresValidacion.nombreproducto}</span>
              )}
            </div>

            {/* Precio */}
            <div className="field-group">
              <label className="field-label">
                Precio <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="number"
                name="precioproducto"
                value={formData.precioproducto}
                onChange={handleInputChange}
                className={`form-input ${erroresValidacion.precioproducto ? "error" : ""}`}
                min="0"
                step="0.01"
                placeholder="Ej: 5000"
                required
              />
              {erroresValidacion.precioproducto && (
                <span className="error-message">{erroresValidacion.precioproducto}</span>
              )}
            </div>

            {/* Cantidad */}
            <div className="field-group">
              <label className="field-label">Cantidad Inicial</label>
              <input
                type="number"
                name="cantidadproducto"
                value={formData.cantidadproducto}
                className="form-input"
                readOnly
                disabled
              />
              <small className="info-message">Siempre se crea con 1 unidad</small>
            </div>

            {/* Categoría */}
            <div className="field-group">
              <label className="field-label">
                Categoría <span style={{ color: "red" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {loadingCategorias ? (
                  <select disabled className="form-input" style={{ flex: 1 }}>
                    <option>Cargando categorías...</option>
                  </select>
                ) : (
                  <select
                    name="idcategoriaproducto"
                    value={formData.idcategoriaproducto}
                    onChange={handleInputChange}
                    className={`form-input ${erroresValidacion.idcategoriaproducto ? "error" : ""}`}
                    required
                    style={{ flex: 1 }}
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.idcategoriaproducto} value={categoria.idcategoriaproducto}>
                        {categoria.nombrecategoria || categoria.nombre}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  className="btn-small"
                  onClick={abrirModalCategoria}
                >
                  +
                </button>
              </div>
              {erroresValidacion.idcategoriaproducto && (
                <span className="error-message">{erroresValidacion.idcategoriaproducto}</span>
              )}
            </div>
          </div>
        </div>

        {/* Imagen */}
        <div className="form-card">
          <h2 className="section-title">
            <span className="title-icon">🖼️</span> Imagen del Producto
          </h2>
          <div>
            {formData.imagenPreview ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src={formData.imagenPreview}
                  alt="Preview"
                  style={{ width: "120px", borderRadius: "10px" }}
                />
                <button type="button" className="delete-btn" onClick={removerImagen}>
                  Eliminar
                </button>
              </div>
            ) : (
              <p style={{ color: "#6b7280" }}>No se ha subido imagen</p>
            )}
            <input
              id="imagen-upload"
              type="file"
              accept="image/*"
              onChange={handleImagenChange}
              style={{ display: "none" }}
            />
            <label htmlFor="imagen-upload" className="btn-small" style={{ marginTop: "10px" }}>
              {formData.imagenPreview ? "Cambiar Imagen" : "Subir Imagen"}
            </label>
          </div>
        </div>

        {/* Receta */}
        <div className="form-card">
          <h2 className="section-title">
            <span className="title-icon">📋</span> Receta del Producto
          </h2>
          {formData.recetaSeleccionada ? (
            <div className="nested-item-list">
              <strong>{formData.recetaSeleccionada.nombrereceta}</strong>
              <p>{formData.recetaSeleccionada.especificaciones}</p>
              <button type="button" className="delete-btn" onClick={removerReceta}>
                Eliminar Receta
              </button>
            </div>
          ) : (
            <p style={{ color: "#6b7280" }}>No hay receta asignada</p>
          )}
          <button type="button" className="btn-small" onClick={() => setMostrarModalReceta(true)}>
            {formData.recetaSeleccionada ? "Cambiar Receta" : "+ Agregar Receta"}
          </button>
        </div>

        {/* Botones */}
        <div className="action-buttons">
          <button type="button" className="btn btn-cancel" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-save" disabled={loading || subiendoImagen}>
            {loading ? "Guardando..." : subiendoImagen ? "Subiendo..." : "💾 Guardar"}
          </button>
        </div>
      </form>

      {mostrarModalReceta && (
        <SeleccionarRecetaModal
          onClose={() => setMostrarModalReceta(false)}
          onSeleccionar={handleSeleccionarReceta}
        />
      )}

      {/* Modal Categoría */}
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
