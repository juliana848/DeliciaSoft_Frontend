import React, { useState, useEffect } from "react";
import CrearRecetaModal from "./components_recetas/CrearRecetaModal";
import ConfiguracionProducto from "./ConfiguracionProducto";
import productoApiService from "../../../services/productos_services";
import Notification from "../../../components/Notification";
import "./css/productoscss.css";
import ModalCategoria from "./ModalCategoria";
import categoriaProductoApiService from "../../../services/categoriaProductosService";

export default function ProductosCreate({ onSave, onCancel }) {
  const [paso, setPaso] = useState(1);
  const [productoCreado, setProductoCreado] = useState(null);
  const [mostrarModalReceta, setMostrarModalReceta] = useState(false);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loading, setLoading] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [notification, setNotification] = useState({ visible: false, mensaje: "", tipo: "success" });

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

  const showNotification = (mensaje, tipo = "success") => setNotification({ visible: true, mensaje, tipo });
  const hideNotification = () => setNotification({ visible: false, mensaje: "", tipo: "success" });

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const res = await fetch("https://deliciasoft-backend-i6g9.onrender.com/api/categorias-productos");
        const data = await res.json();
        setCategorias(data);
      } catch {
        showNotification("Error al cargar categorías", "error");
      } finally {
        setLoadingCategorias(false);
      }
    };
    cargarCategorias();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (erroresValidacion[name]) setErroresValidacion((p) => ({ ...p, [name]: "" }));
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showNotification("Tipo de archivo no permitido", "error");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification("El archivo es demasiado grande (máx 5MB)", "error");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) =>
      setFormData((p) => ({ ...p, imagenArchivo: file, imagenPreview: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const removerImagen = () => {
    setFormData((p) => ({ ...p, imagenArchivo: null, imagenPreview: null }));
    const fileInput = document.getElementById("imagen-upload");
    if (fileInput) fileInput.value = "";
  };

  const handleGuardarReceta = (receta) => {
    const idReceta = receta.idreceta || receta.id || null;
    const nombreReceta = receta.nombrereceta || receta.nombre || "";
    const especificaciones = receta.especificaciones || receta.especificacionesreceta || "";

    setFormData((p) => ({
      ...p,
      idreceta: idReceta,
      recetaSeleccionada: {
        ...receta,
        idreceta: idReceta,
        nombrereceta: nombreReceta,
        especificaciones: especificaciones,
      },
    }));

    setMostrarModalReceta(false);
  };


  const removerReceta = () => setFormData((p) => ({ ...p, idreceta: null, recetaSeleccionada: null }));

  const abrirModalCategoria = () => setModalCategoriaVisible(true);
  const cerrarModalCategoria = () => setModalCategoriaVisible(false);

  const guardarCategoria = async (nuevaCategoria) => {
    const categoriaCreada = await categoriaProductoApiService.crearCategoria(nuevaCategoria);
    setCategorias((p) => [...p, categoriaCreada]);
    setFormData((p) => ({ ...p, idcategoriaproducto: categoriaCreada.idcategoriaproducto }));
    cerrarModalCategoria();
  };

  const validateForm = () => {
    const err = {};
    if (!formData.nombreproducto.trim()) err.nombreproducto = "Requerido";
    if (!formData.idcategoriaproducto) err.idcategoriaproducto = "Seleccione una categoría";
    const precio = parseFloat(formData.precioproducto);
    if (!formData.precioproducto || isNaN(precio) || precio < 0) err.precioproducto = "Precio inválido";
    setErroresValidacion(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    let idImagen = null;
    try {
      if (formData.imagenArchivo) {
        setSubiendoImagen(true);
        const img = await productoApiService.subirImagen(formData.imagenArchivo);
        idImagen = img.idimagen;
        setSubiendoImagen(false);
      }
      const payload = {
        nombreproducto: formData.nombreproducto.trim(),
        precioproducto: parseFloat(formData.precioproducto),
        cantidadproducto: 1,
        estado: true,
        idcategoriaproducto: parseInt(formData.idcategoriaproducto),
        idimagen: idImagen,
        idreceta: formData.idreceta,
      };
      const prod = await productoApiService.crearProducto(payload);
      setProductoCreado(prod);
      showNotification("Producto creado exitosamente", "success");
      setTimeout(() => {
        const conf = window.confirm("¿Desea configurar personalización?");
        if (conf) setPaso(2);
        else if (onSave) onSave(prod);
      }, 1000);
    } catch (err) {
      showNotification("Error al crear producto: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguracion = (config) => {
    showNotification("¡Producto guardado exitosamente!", "success");
    setTimeout(() => onSave && onSave(productoCreado), 1500);
  };

  const handleSkipConfiguracion = () => onSave && onSave(productoCreado);

  if (paso === 2 && productoCreado)
    return (
      <ConfiguracionProducto
        idProducto={productoCreado.id || productoCreado.idproductogeneral}
        nombreProducto={productoCreado.nombre || productoCreado.nombreproducto}
        onSave={handleSaveConfiguracion}
        onCancel={handleSkipConfiguracion}
      />
    );

  return (
    <div className="compra-form-container">
      <Notification {...notification} onClose={hideNotification} />
      <form onSubmit={handleSubmit}>
        <div className="form-card">
          <h2 className="section-title">📦 Información del Producto</h2>
          <div className="form-grid">
            <div className="field-group">
              <label>Nombre del Producto *</label>
              <input
                type="text"
                name="nombreproducto"
                value={formData.nombreproducto}
                onChange={handleInputChange}
                className={`form-input ${erroresValidacion.nombreproducto ? "error" : ""}`}
                placeholder="Ej: Pan de yuca"
              />
            </div>
            <div className="field-group">
              <label>Precio *</label>
              <input
                type="number"
                name="precioproducto"
                value={formData.precioproducto}
                onChange={handleInputChange}
                className={`form-input ${erroresValidacion.precioproducto ? "error" : ""}`}
                placeholder="Ej: 5000"
              />
            </div>
            <div className="field-group">
              <label>Categoría *</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  name="idcategoriaproducto"
                  value={formData.idcategoriaproducto}
                  onChange={handleInputChange}
                  className={`form-input ${erroresValidacion.idcategoriaproducto ? "error" : ""}`}
                >
                  <option value="">Seleccione una categoría</option>
                  {categorias.map((c) => (
                    <option key={c.idcategoriaproducto} value={c.idcategoriaproducto}>
                      {c.nombrecategoria || c.nombre}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn-small" onClick={abrirModalCategoria}>
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h2 className="section-title">🖼️ Imagen del Producto</h2>
          {formData.imagenPreview ? (
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <img src={formData.imagenPreview} alt="preview" style={{ width: 120, borderRadius: 10 }} />
              <button type="button" className="delete-btn" onClick={removerImagen}>
                Eliminar
              </button>
            </div>
          ) : (
            <p style={{ color: "#6b7280" }}>No se ha subido imagen</p>
          )}
          <input id="imagen-upload" type="file" accept="image/*" onChange={handleImagenChange} style={{ display: "none" }} />
          <label htmlFor="imagen-upload" className="btn-small" style={{ marginTop: "10px" }}>
            {formData.imagenPreview ? "Cambiar Imagen" : "Subir Imagen"}
          </label>
        </div>

        <div className="form-card">
          <h2 className="section-title">📋 Receta del Producto</h2>
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
            {formData.recetaSeleccionada ? "Cambiar Receta" : "+ Crear Receta"}
          </button>
        </div>

        <div className="action-buttons">
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-save" disabled={loading || subiendoImagen}>
            {loading ? "Guardando..." : "💾 Guardar"}
          </button>
        </div>
      </form>

      {mostrarModalReceta && <CrearRecetaModal onClose={() => setMostrarModalReceta(false)} onGuardar={handleGuardarReceta} />}

      {modalCategoriaVisible && (
        <ModalCategoria visible={modalCategoriaVisible} onClose={cerrarModalCategoria} tipo="agregar" onGuardar={guardarCategoria} />
      )}
    </div>
  );
}
