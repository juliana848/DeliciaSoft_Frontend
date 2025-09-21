import React, { useState, useEffect } from "react";
import SeleccionarRecetaModal from "./components_recetas/SeleccionarRecetaModal";
import productoApiService from "../../../services/productos_services";
import "../../../adminStyles.css";
import Notification from "../../../components/Notification";

export default function ProductosCreate({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombreproducto: "",
    precioproducto: "",
    cantidadproducto: 1, // 🔹 siempre 1
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
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  // Notificaciones
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
        setCategorias([
          { idcategoriaproducto: 1, nombrecategoria: "Bebidas" },
          { idcategoriaproducto: 2, nombrecategoria: "Postres" },
          { idcategoriaproducto: 3, nombrecategoria: "Panadería" },
          { idcategoriaproducto: 4, nombrecategoria: "Repostería" },
        ]);
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
      setErroresValidacion((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImagenChange = (e) => {
    const archivo = e.target.files[0];

    if (archivo) {
      const tiposPermitidos = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!tiposPermitidos.includes(archivo.type)) {
        showNotification("Tipo de archivo no permitido", "error");
        e.target.value = "";
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (archivo.size > maxSize) {
        showNotification("El archivo es demasiado grande (máx 5MB)", "error");
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          imagenArchivo: archivo,
          imagenPreview: e.target.result,
        }));
      };
      reader.readAsDataURL(archivo);

      if (erroresValidacion.imagen) {
        setErroresValidacion((prev) => ({
          ...prev,
          imagen: "",
        }));
      }
    }
  };

  const removerImagen = () => {
    setFormData((prev) => ({
      ...prev,
      imagenArchivo: null,
      imagenPreview: null,
    }));
    const fileInput = document.getElementById("imagen-upload");
    if (fileInput) fileInput.value = "";
  };

  const handleSeleccionarReceta = (receta) => {
    setFormData((prev) => ({
      ...prev,
      idreceta: receta.idreceta,
      recetaSeleccionada: {
        ...receta,
        cantidadInsumos: receta.cantidadInsumos || receta.insumos?.length || 0,
      },
    }));
    setMostrarModalReceta(false);
  };

  const removerReceta = () => {
    setFormData((prev) => ({
      ...prev,
      idreceta: null,
      recetaSeleccionada: null,
    }));
  };

  const validateForm = () => {
    const errores = {};

    if (!formData.nombreproducto.trim()) {
      errores.nombreproducto = "El nombre del producto es requerido";
    }

    if (!formData.idcategoriaproducto) {
      errores.idcategoriaproducto = "Debe seleccionar una categoría";
    }

    const precio = parseFloat(formData.precioproducto);
    if (!formData.precioproducto || isNaN(precio) || precio < 0) {
      errores.precioproducto =
        "El precio debe ser un número válido mayor o igual a 0";
    }

    // Cantidad ya no se valida porque siempre es 1 fijo
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
          const resultadoImagen = await productoApiService.subirImagen(
            formData.imagenArchivo
          );
          idImagenSubida = resultadoImagen.idimagen;
        } catch (errorImagen) {
          console.error("Error al subir imagen:", errorImagen);
          showNotification("Error al subir la imagen", "error");
          return;
        } finally {
          setSubiendoImagen(false);
        }
      }

      const payload = {
        nombreproducto: formData.nombreproducto.trim(),
        precioproducto: parseFloat(formData.precioproducto),
        cantidadproducto: 1, // 🔹 siempre guardar como 1
        estado: true,
        idcategoriaproducto: parseInt(formData.idcategoriaproducto),
        idimagen: idImagenSubida,
        idreceta: formData.idreceta,
      };

      const productoCreado = await productoApiService.crearProducto(payload);
      showNotification("Producto creado exitosamente", "success");
      if (onSave) onSave(productoCreado);
    } catch (error) {
      console.error("Error creando producto:", error);
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

      <h1>Agregar Producto</h1>

      <form onSubmit={handleSubmit}>
        <div className="compra-fields-grid">
          {/* Nombre */}
          <div
            className={`field-group ${
              erroresValidacion.nombreproducto ? "has-error" : ""
            }`}
          >
            <label>
              Nombre del Producto <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="nombreproducto"
              value={formData.nombreproducto}
              onChange={handleInputChange}
              className={erroresValidacion.nombreproducto ? "field-error" : ""}
              required
            />
            {erroresValidacion.nombreproducto && (
              <span className="error-message">
                {erroresValidacion.nombreproducto}
              </span>
            )}
          </div>

          {/* Precio */}
          <div
            className={`field-group ${
              erroresValidacion.precioproducto ? "has-error" : ""
            }`}
          >
            <label>
              Precio <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="number"
              name="precioproducto"
              value={formData.precioproducto}
              onChange={handleInputChange}
              className={erroresValidacion.precioproducto ? "field-error" : ""}
              min="0"
              step="0.01"
              required
            />
            {erroresValidacion.precioproducto && (
              <span className="error-message">
                {erroresValidacion.precioproducto}
              </span>
            )}
          </div>

          {/* Cantidad (fija en 1) */}
          <div className="field-group">
            <label>Cantidad Inicial</label>
            <input
              type="number"
              name="cantidadproducto"
              value={formData.cantidadproducto}
              readOnly
              disabled
              className="field-disabled"
            />
            <span className="info-message">Se crea siempre con 1 unidad</span>
          </div>

          {/* Categoría */}
          <div
            className={`field-group ${
              erroresValidacion.idcategoriaproducto ? "has-error" : ""
            }`}
          >
            <label>
              Categoría <span style={{ color: "red" }}>*</span>
            </label>
            {loadingCategorias ? (
              <select disabled className="field-disabled">
                <option>Cargando categorías...</option>
              </select>
            ) : (
              <select
                name="idcategoriaproducto"
                value={formData.idcategoriaproducto}
                onChange={handleInputChange}
                className={
                  erroresValidacion.idcategoriaproducto ? "field-error" : ""
                }
                required
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((categoria) => (
                  <option
                    key={categoria.idcategoriaproducto}
                    value={categoria.idcategoriaproducto}
                  >
                    {categoria.nombrecategoria || categoria.nombre}
                  </option>
                ))}
              </select>
            )}
            {erroresValidacion.idcategoriaproducto && (
              <span className="error-message">
                {erroresValidacion.idcategoriaproducto}
              </span>
            )}
          </div>
        </div>

        <div className="section-divider"></div>

        {/* Imagen */}
        <div className="detalle-section">
          <h2>Imagen del Producto:</h2>
          <div className="imagen-upload-small">
            {formData.imagenPreview ? (
              <div className="imagen-preview-container">
                <img
                  src={formData.imagenPreview}
                  alt="Preview"
                  className="imagen-preview-small"
                />
                <button
                  type="button"
                  className="btn-eliminar"
                  onClick={removerImagen}
                >
                  Eliminar
                </button>
              </div>
            ) : (
              <p>No se ha subido imagen</p>
            )}
            <div className="upload-button-container">
              <input
                id="imagen-upload"
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
                style={{ display: "none" }}
              />
              <label htmlFor="imagen-upload" className="btn-agregar-insumos">
                {subiendoImagen
                  ? "..."
                  : formData.imagenPreview
                  ? "Cambiar"
                  : "Subir"}
              </label>
            </div>
          </div>
        </div>

        <div className="section-divider"></div>

        {/* Receta */}
        <div className="detalle-section">
          <h2>Receta del Producto:</h2>
          {formData.recetaSeleccionada ? (
            <div className="receta-seleccionada">
              <div className="receta-info">
                <h4>{formData.recetaSeleccionada.nombrereceta}</h4>
                <p>{formData.recetaSeleccionada.especificaciones}</p>
              </div>
              <button
                type="button"
                className="btn-eliminar"
                onClick={removerReceta}
              >
                Eliminar
              </button>
            </div>
          ) : (
            <p>No hay receta asignada a este producto</p>
          )}

          <button
            type="button"
            className="btn-agregar-insumos"
            onClick={() => setMostrarModalReceta(true)}
          >
            {formData.recetaSeleccionada ? "Cambiar Receta" : "+ Agregar Receta"}
          </button>
        </div>

        <div className="compra-header-actions">
          <button
            type="button"
            className="modal-btn cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="modal-btn save-btn"
            disabled={loading || subiendoImagen}
          >
            {loading ? "Guardando..." : subiendoImagen ? "Subiendo..." : "Guardar"}
          </button>
        </div>
      </form>

      {mostrarModalReceta && (
        <SeleccionarRecetaModal
          onClose={() => setMostrarModalReceta(false)}
          onSeleccionar={handleSeleccionarReceta}
        />
      )}
    </div>
  );
}
