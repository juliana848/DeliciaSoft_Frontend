import React, { useState, useEffect } from "react";
import SeleccionarRecetaModal from "./components_recetas/SeleccionarRecetaModal";
import productoApiService from "../../../services/productos_services";
import "../../../adminStyles.css";
import Notification from "../../../components/Notification";
import "./css/productos.css";

export default function ProductosEdit({ producto, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombreproducto: producto?.nombreproducto || "",
    precioproducto: producto?.precioproducto || "",
    cantidadproducto: producto?.cantidadproducto || "",
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
        showNotification(
          "Error al cargar categorías: " + error.message,
          "error"
        );
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

  // === NUEVO USEEFFECT PARA TRAER LA RECETA REAL ===
  useEffect(() => {
    const cargarReceta = async () => {
      if (!producto?.idreceta) return;

      try {
        const res = await fetch(
          "https://deliciasoft-backend.onrender.com/api/receta/recetas"
        );
        if (!res.ok) throw new Error("No se pudo cargar las recetas");
        const data = await res.json();

        const recetaProducto = data.find(r => r.idreceta === producto.idreceta);
        if (recetaProducto) {
          setFormData(prev => ({
            ...prev,
            recetaSeleccionada: recetaProducto,
          }));
        } else {
          showNotification("No se encontró la receta del producto", "error");
        }
      } catch (err) {
        console.error(err);
        showNotification("No se pudo cargar la receta: " + err.message, "error");
      }
    };

    cargarReceta();

    // Mantener la imagen preview actual
    if (producto) {
      setFormData((prev) => ({
        ...prev,
        imagenPreview: producto.urlimagen || producto.imagenes?.urlimg || null,
        idimagen: producto.idimagen || null,
      }));
    }
  }, [producto]);

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
        return;
      }
      if (archivo.size > 5 * 1024 * 1024) {
        showNotification("El archivo es demasiado grande (máx 5MB)", "error");
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
    }
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

  const validateForm = () => {
    const errores = {};
    if (!formData.nombreproducto.trim())
      errores.nombreproducto = "El nombre es requerido";
    if (!formData.idcategoriaproducto)
      errores.idcategoriaproducto = "Debe seleccionar una categoría";
    if (!formData.precioproducto || isNaN(formData.precioproducto))
      errores.precioproducto = "El precio debe ser válido";
    if (!formData.cantidadproducto || isNaN(formData.cantidadproducto))
      errores.cantidadproducto = "La cantidad debe ser válida";
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
        setSubiendoImagen(true);
        const resultadoImagen = await productoApiService.subirImagen(
          formData.imagenArchivo
        );
        idImagenSubida = resultadoImagen.idimagen;
        setSubiendoImagen(false);
      }
      const payload = {
        idproductogeneral: producto.id,
        nombreproducto: formData.nombreproducto.trim(),
        precioproducto: String(formData.precioproducto),
        cantidadproducto: String(formData.cantidadproducto),
        estado: formData.estado,
        idcategoriaproducto: parseInt(formData.idcategoriaproducto),
        idimagen: idImagenSubida,
        idreceta: formData.idreceta,
      };
      await productoApiService.actualizarProducto(producto.id, payload);
      showNotification("Producto actualizado exitosamente", "success");
      if (onSave) onSave();
    } catch (err) {
      console.error("Error actualizando:", err);
      showNotification("Error al actualizar producto: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!producto) {
    return (
      <div className="compra-form-container">No se pudo cargar el producto</div>
    );
  }

  return (
    <div className="compra-form-container">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <h1>Editar Producto</h1>
      <form onSubmit={handleSubmit}>
        {/* === EL RESTO DEL FORMULARIO QUEDA EXACTAMENTE IGUAL === */}
        <div className="compra-fields-grid">
          {/* Nombre */}
          <div
            className={`field-group ${
              erroresValidacion.nombreproducto ? "has-error" : ""
            }`}
          >
            <label>
              Nombre <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="nombreproducto"
              value={formData.nombreproducto}
              onChange={handleInputChange}
              className={
                erroresValidacion.nombreproducto ? "field-error" : ""
              }
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
              className={
                erroresValidacion.precioproducto ? "field-error" : ""
              }
              min="0"
              step="0.01"
            />
            {erroresValidacion.precioproducto && (
              <span className="error-message">
                {erroresValidacion.precioproducto}
              </span>
            )}
          </div>

          {/* Cantidad */}
          <div
            className={`field-group ${
              erroresValidacion.cantidadproducto ? "has-error" : ""
            }`}
          >
            <label>
              Cantidad <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="number"
              name="cantidadproducto"
              value={formData.cantidadproducto}
              onChange={handleInputChange}
              className={
                erroresValidacion.cantidadproducto ? "field-error" : ""
              }
              min="0"
              step="1"
            />
            {erroresValidacion.cantidadproducto && (
              <span className="error-message">
                {erroresValidacion.cantidadproducto}
              </span>
            )}
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
                <option>Cargando...</option>
              </select>
            ) : (
              <select
                name="idcategoriaproducto"
                value={formData.idcategoriaproducto}
                onChange={handleInputChange}
                className={
                  erroresValidacion.idcategoriaproducto ? "field-error" : ""
                }
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((cat) => (
                  <option
                    key={cat.idcategoriaproducto}
                    value={cat.idcategoriaproducto}
                  >
                    {cat.nombrecategoria || cat.nombre}
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

          {/* Estado */}
          <div className="field-group">
            <label>Estado</label>
            <select
              name="estado"
              value={formData.estado ? "activo" : "inactivo"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estado: e.target.value === "activo",
                }))
              }
              className="field-input"
            >
              <option value="activo">Activo ✅</option>
              <option value="inactivo">Inactivo ⛔</option>
            </select>
          </div>
        </div>

        <div className="section-divider"></div>

        {/* Imagen */}
        <div className="detalle-section">
          <h2>Imagen del Producto:</h2>
          {formData.imagenPreview ? (
            <div>
              <img
                src={formData.imagenPreview}
                alt="Preview"
                style={{ width: 80, borderRadius: 6 }}
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
            <p>No hay imagen</p>
          )}
          <input
            id="imagen-upload"
            type="file"
            accept="image/*"
            onChange={handleImagenChange}
            style={{ display: "none" }}
          />
          <label htmlFor="imagen-upload" className="btn-agregar-insumos">
            {formData.imagenPreview ? "Cambiar" : "Subir"}
          </label>
        </div>

        <div className="section-divider"></div>

        {/* Receta */}
        <div className="detalle-section">
          <h2>Receta:</h2>
          {formData.recetaSeleccionada ? (
            <div>
              <h4>{formData.recetaSeleccionada.nombrereceta}</h4>
              <p>{formData.recetaSeleccionada.especificaciones}</p>
              <button
                type="button"
                className="btn-eliminar"
                onClick={removerReceta}
              >
                Eliminar
              </button>
            </div>
          ) : (
            <p>No hay receta asignada</p>
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
            {loading ? "Actualizando..." : "Actualizar"}
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
