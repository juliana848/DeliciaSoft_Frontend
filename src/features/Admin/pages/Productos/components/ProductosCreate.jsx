import React, { useState, useEffect } from "react";
import AgregarInsumosModal from "./components_recetas/AgregarInsumosModal";
import ConfiguracionProducto from "./ConfiguracionProducto";
import productoApiService from "../../../services/productos_services";
import recetaApiService from "../../../services/Receta_services";
import Notification from "../../../components/Notification";
import "./css/productoscss.css";
import ModalCategoria from "./ModalCategoria";
import categoriaProductoApiService from "../../../services/categoriaProductosService";

export default function ProductosCreate({ onSave, onCancel }) {
  const [paso, setPaso] = useState(1);
  const [productoCreado, setProductoCreado] = useState(null);
  const [mostrarModalInsumos, setMostrarModalInsumos] = useState(false);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loading, setLoading] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [notification, setNotification] = useState({ visible: false, mensaje: "", tipo: "success" });
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nombrereceta: "",
    especificaciones: "",
    precioproducto: "",
    cantidadproducto: 1,
    idcategoriaproducto: "",
    imagenArchivo: null,
    imagenPreview: null,
  });


  const [insumosReceta, setInsumosReceta] = useState([]);
  const showNotification = (mensaje, tipo = "success") => setNotification({ visible: true, mensaje, tipo });
  const hideNotification = () => setNotification({ visible: false, mensaje: "", tipo: "success" });

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

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const res = await fetch(
          "https://deliciasoft-backend-i6g9.onrender.com/api/categorias-productos"
        );
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
    if (erroresValidacion[name])
      setErroresValidacion((p) => ({ ...p, [name]: "" }));
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
      setFormData((p) => ({
        ...p,
        imagenArchivo: file,
        imagenPreview: ev.target.result,
      }));
    reader.readAsDataURL(file);
  };

  const removerImagen = () => {
    setFormData((p) => ({ ...p, imagenArchivo: null, imagenPreview: null }));
    const fileInput = document.getElementById("imagen-upload");
    if (fileInput) fileInput.value = "";
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

  const abrirModalCategoria = () => setModalCategoriaVisible(true);
  const cerrarModalCategoria = () => setModalCategoriaVisible(false);

  const guardarCategoria = async (nuevaCategoria) => {
    const categoriaCreada =
      await categoriaProductoApiService.crearCategoria(nuevaCategoria);

    setCategorias((p) => [...p, categoriaCreada]);
    setFormData((p) => ({
      ...p,
      idcategoriaproducto: categoriaCreada.idcategoriaproducto,
    }));
    cerrarModalCategoria();
  };

  const validateForm = () => {
    const err = {};
    if (!formData.nombrereceta.trim()) err.nombrereceta = "Requerido";
    if (formData.nombrereceta.trim().length > 50) err.nombrereceta = 'El nombre no puede exceder 50 caracteres';
    if (!formData.idcategoriaproducto) err.idcategoriaproducto = "Seleccione una categoría";
    const precio = parseFloat(formData.precioproducto);
    if (!formData.precioproducto || isNaN(precio) || precio < 0) err.precioproducto = "Precio inválido";
    if (insumosReceta.length === 0) err.insumos = 'Debe agregar al menos un insumo';
    const insumosInvalidos = insumosReceta.filter(insumo => !insumo.cantidad || isNaN(parseFloat(insumo.cantidad)) || parseFloat(insumo.cantidad) <= 0);
    if (insumosInvalidos.length > 0) err.cantidades = 'Todos los insumos deben tener una cantidad válida mayor a 0';
    setErroresValidacion(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    let idImagen = null;
    let idReceta = null;

    try {
      if (formData.imagenArchivo) {
        setSubiendoImagen(true);
        const img = await productoApiService.subirImagen(
          formData.imagenArchivo
        );
        idImagen = img.idimagen;
        setSubiendoImagen(false);
      }
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

      const recetaCreada = await recetaApiService.crearReceta(datosReceta);
      idReceta = recetaCreada.idreceta || recetaCreada.id;
      const payload = {
        nombreproducto: formData.nombrereceta.trim(),
        precioproducto: parseFloat(formData.precioproducto),
        cantidadproducto: 1,
        estado: true,
        idcategoriaproducto: parseInt(formData.idcategoriaproducto),
        idimagen: idImagen,
        idreceta: idReceta,
      };

      const prod = await productoApiService.crearProducto(payload);
      setProductoCreado(prod);
      showNotification("Producto y receta creados exitosamente", "success");
      
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

  const handleSkipConfiguracion = () =>
    onSave && onSave(productoCreado);

  if (paso === 2 && productoCreado)
    return (
      <ConfiguracionProducto
        idProducto={
          productoCreado.id || productoCreado.idproductogeneral
        }
        nombreProducto={
          productoCreado.nombre || productoCreado.nombreproducto
        }
        onSave={handleSaveConfiguracion}
        onCancel={handleSkipConfiguracion}
      />
    );

  return (
    <div className="compra-form-container">
      <Notification {...notification} onClose={hideNotification} />
      <div onSubmit={handleSubmit}>
        {/* Información del Producto/Receta con Imagen Integrada */}
        <div className="form-card">
          <h2 className="section-title">📦 Información del Producto</h2>   
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: "24px", alignItems: "start" }}>
            {/* Columna izquierda: Campos del formulario */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="field-group">
                  <label>Nombre del Producto (Receta) *</label>
                  <input
                    type="text"
                    name="nombrereceta"
                    value={formData.nombrereceta}
                    onChange={handleInputChange}
                    className={`form-input ${erroresValidacion.nombrereceta ? "error" : ""}`}
                    placeholder="Ej: Café Especial, Brownie..."
                    maxLength="50"
                  />
                  {erroresValidacion.nombrereceta && <span className="error-message">{erroresValidacion.nombrereceta}</span>}
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
                  {erroresValidacion.precioproducto && <span className="error-message">{erroresValidacion.precioproducto}</span>}
                </div>
              </div>

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
          // Si borra todo, limpiar la selección
          if (!text) {
            setFormData(p => ({ ...p, idcategoriaproducto: "" }));
          }
        }}
        onFocus={() => {
          const dropdown = document.getElementById("categoria-dropdown");
          if (dropdown) dropdown.style.display = "block";
        }}
        className={`form-input ${erroresValidacion.idcategoriaproducto ? "error" : ""}`}
      />

      {/* Dropdown */}
      <div
        id="categoria-dropdown"
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
            const dropdown = document.getElementById("categoria-dropdown");
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

                const dropdown = document.getElementById("categoria-dropdown");
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
              
              <div className="field-group">
                <label>Especificaciones</label>
                <textarea
                  name="especificaciones"
                  value={formData.especificaciones}
                  onChange={handleInputChange}
                  rows="4"
                  maxLength="400"
                  className="form-input"
                  placeholder="Describe las características y preparación..."
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>

            {/* Columna derecha: Imagen del producto */}
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
                {formData.imagenPreview ? "Cambiar Imagen" : "📁 Subir Imagen"}
              </label>
            </div>
          </div>
        </div>

        {/* Tabla de Insumos */}
        <div className="form-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>📋 Insumos de la Receta ({insumosReceta.length})</h2>
            <button type="button" className="add-products-btn" onClick={() => setMostrarModalInsumos(true)} disabled={loading}>
              Agregar Insumos
            </button>
          </div>

          {erroresValidacion.insumos && <div className="error-message" style={{ marginBottom: "1rem" }}>{erroresValidacion.insumos}</div>}
          {erroresValidacion.cantidades && <div className="error-message" style={{ marginBottom: "1rem" }}>{erroresValidacion.cantidades}</div>}

          {insumosReceta.length > 0 ? (
            <div className="table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Nombre Producto</th>
                    <th style={{ textAlign: "center" }}>Cantidad</th>
                    <th style={{ textAlign: "center" }}>Unidad Medida</th>
                    <th style={{ textAlign: "center" }}>Precio unitario</th>
                    <th style={{ textAlign: "center" }}>Subtotal</th>
                    <th style={{ textAlign: "center" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {insumosReceta.map((insumo, index) => (
                    <tr key={insumo.id || index} className="product-row">
                      <td className="product-name">
                        <strong>{insumo.nombre || insumo.nombreinsumo}</strong>
                        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                          {insumo.categoria}
                        </div>
                      </td>
                      <td className="quantity-cell">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={insumo.cantidad || 1}
                          onChange={(e) => handleCantidadChange(insumo.id, e.target.value)}
                          disabled={loading}
                          className="quantity-input"
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <select
                          value={insumo.idunidadmedida || 1}
                          onChange={(e) => handleUnidadChange(insumo.id, e.target.value)}
                          disabled={loading}
                          className="form-input"
                          style={{ padding: "8px", fontSize: "14px" }}
                        >
                          {unidadesMedida.map(unidad => (
                            <option key={unidad.id} value={unidad.id}>{unidad.nombre}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        $ {(insumo.precio || 0).toLocaleString('es-CO')}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: "600" }}>
                        $ {((insumo.precio || 0) * (insumo.cantidad || 1)).toLocaleString('es-CO')}
                      </td>
                      <td className="action-cell">
                        <button 
                          type="button" 
                          className="delete-btn" 
                          onClick={() => removeInsumo(insumo.id)} 
                          disabled={loading}
                          style={{ margin: "0 auto" }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ 
              border: "2px dashed #d1d5db", 
              borderRadius: "10px", 
              padding: "2rem", 
              textAlign: "center", 
              background: "#f9fafb",
              color: "#6b7280"
            }}>
              <p style={{ marginBottom: "1rem" }}>No hay insumos agregados a esta receta</p>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="action-buttons">
          <button
            type="button"
            className="btn btn-cancel"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button type="button" className="btn btn-save" onClick={handleSubmit} disabled={loading || subiendoImagen || insumosReceta.length === 0}>
            {loading ? "Guardando..." : `💾 Guardar (${insumosReceta.length} insumos)`}
          </button>
        </div>
      </div>
      {/* Modal de Agregar Insumos */}
      {mostrarModalInsumos && (
        <AgregarInsumosModal
          onClose={() => setMostrarModalInsumos(false)}
          onAgregar={agregarInsumos}
          insumosSeleccionados={insumosReceta}
        />
      )}

      {/* Modal de Categoría */}
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