import React, { useState, useEffect } from "react";
import SeleccionarRecetaModal from "./components_recetas/SeleccionarRecetaModal";
import productoApiService from "../../../services/productos_services";
import "../../../adminStyles.css";
import recetaApiService from "../../../services/Receta_Services";

export default function ProductosCreate({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombreproducto: "",
    precioproducto: "",
    cantidadproducto: "",
    idcategoriaproducto: "",
    idreceta: null,
    recetaSeleccionada: null,
    imagenArchivo: null,
    imagenPreview: null
  });

  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mostrarModalReceta, setMostrarModalReceta] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const response = await fetch(
          "https://deliciasoft-backend.onrender.com/api/categorias-productos"
        );
        if (!response.ok) {
          throw new Error("No se pudo obtener las categorías");
        }
        const data = await response.json();
        console.log('Categorías cargadas:', data);
        setCategorias(data);
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
        const categoriasFallback = [
          { idcategoriaproducto: 1, nombrecategoria: "Bebidas" },
          { idcategoriaproducto: 2, nombrecategoria: "Postres" },
          { idcategoriaproducto: 3, nombrecategoria: "Panadería" },
          { idcategoriaproducto: 4, nombrecategoria: "Repostería" }
        ];
        setCategorias(categoriasFallback);
      } finally {
        setLoadingCategorias(false);
      }
    };

    cargarCategorias();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    if (erroresValidacion[name]) {
      setErroresValidacion(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleImagenChange = (e) => {
    const archivo = e.target.files[0];
    
    if (archivo) {
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!tiposPermitidos.includes(archivo.type)) {
        alert('Tipo de archivo no permitido. Solo se aceptan: JPG, JPEG, PNG, GIF, WebP');
        e.target.value = '';
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (archivo.size > maxSize) {
        alert('El archivo es demasiado grande. Tamaño máximo: 5MB');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          imagenArchivo: archivo,
          imagenPreview: e.target.result
        }));
      };
      reader.readAsDataURL(archivo);

      if (erroresValidacion.imagen) {
        setErroresValidacion(prev => ({
          ...prev,
          imagen: ""
        }));
      }
    }
  };

  const removerImagen = () => {
    setFormData(prev => ({
      ...prev,
      imagenArchivo: null,
      imagenPreview: null
    }));
    const fileInput = document.getElementById('imagen-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSeleccionarReceta = (receta) => {
    setFormData(prev => ({
      ...prev,
      idreceta: receta.idreceta,
      recetaSeleccionada: {
        ...receta,
        cantidadInsumos: receta.cantidadInsumos || receta.insumos?.length || 0
      }
    }));
    setMostrarModalReceta(false);
  };

  const removerReceta = () => {
    setFormData(prev => ({
      ...prev,
      idreceta: null,
      recetaSeleccionada: null
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
      errores.precioproducto = "El precio debe ser un número válido mayor o igual a 0";
    }

    const cantidad = parseFloat(formData.cantidadproducto);
    if (!formData.cantidadproducto || isNaN(cantidad) || cantidad < 0) {
      errores.cantidadproducto = "La cantidad debe ser un número válido mayor o igual a 0";
    }

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
        console.log('Subiendo imagen...');
        setSubiendoImagen(true);
        
        try {
          const resultadoImagen = await productoApiService.subirImagen(formData.imagenArchivo);
          idImagenSubida = resultadoImagen.idimagen;
          console.log('Imagen subida exitosamente, ID:', idImagenSubida);
        } catch (errorImagen) {
          console.error('Error al subir imagen:', errorImagen);
          
          let mensajeError = 'Error al subir la imagen: ';
          if (errorImagen.message.includes('Failed to fetch')) {
            mensajeError += 'No se pudo conectar con el servidor.';
          } else if (errorImagen.message.includes('timeout')) {
            mensajeError += 'La subida tardó demasiado tiempo.';
          } else {
            mensajeError += errorImagen.message;
          }
          
          alert(mensajeError);
          return;
        } finally {
          setSubiendoImagen(false);
        }
      }

      const payload = {
        nombreproducto: formData.nombreproducto.trim(),
        precioproducto: parseFloat(formData.precioproducto),
        cantidadproducto: parseFloat(formData.cantidadproducto),
        estado: true,
        idcategoriaproducto: parseInt(formData.idcategoriaproducto),
        idimagen: idImagenSubida,
        idreceta: formData.idreceta
      };

      console.log('Datos del producto a crear:', payload);
      
      const productoCreado = await productoApiService.crearProducto(payload);
      
      console.log('Producto creado exitosamente:', productoCreado);
      alert("Producto creado exitosamente");
      
      if (onSave) {
        onSave(productoCreado);
      }
      
    } catch (error) {
      console.error("Error creando producto:", error);
      
      let mensajeError = "Error al crear producto";
      if (error.message) {
        mensajeError = error.message;
      }
      
      alert(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compra-form-container">
      <h1>Agregar Producto</h1>

      <form onSubmit={handleSubmit}>
        <div className="compra-fields-grid">
          {/* Nombre del Producto */}
          <div className={`field-group ${erroresValidacion.nombreproducto ? 'has-error' : ''}`}>
            <label>Nombre del Producto <span className="required">*</span></label>
            <input
              type="text"
              name="nombreproducto"
              value={formData.nombreproducto}
              onChange={handleInputChange}
              className={erroresValidacion.nombreproducto ? 'field-error' : ''}
              placeholder="Ingrese el nombre del producto"
              required
            />
            {erroresValidacion.nombreproducto && (
              <span className="error-message">{erroresValidacion.nombreproducto}</span>
            )}
          </div>

          {/* Precio */}
          <div className={`field-group ${erroresValidacion.precioproducto ? 'has-error' : ''}`}>
            <label>Precio <span className="required">*</span></label>
            <input
              type="number"
              name="precioproducto"
              value={formData.precioproducto}
              onChange={handleInputChange}
              className={erroresValidacion.precioproducto ? 'field-error' : ''}
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
            {erroresValidacion.precioproducto && (
              <span className="error-message">{erroresValidacion.precioproducto}</span>
            )}
          </div>

          {/* Cantidad Inicial */}
          <div className={`field-group ${erroresValidacion.cantidadproducto ? 'has-error' : ''}`}>
            <label>Cantidad Inicial <span className="required">*</span></label>
            <input
              type="number"
              name="cantidadproducto"
              value={formData.cantidadproducto}
              onChange={handleInputChange}
              className={erroresValidacion.cantidadproducto ? 'field-error' : ''}
              min="0"
              step="0.01"
              placeholder="0"
              required
            />
            {erroresValidacion.cantidadproducto && (
              <span className="error-message">{erroresValidacion.cantidadproducto}</span>
            )}
          </div>

          {/* Categoría */}
          <div className={`field-group ${erroresValidacion.idcategoriaproducto ? 'has-error' : ''}`}>
            <label>Categoría <span className="required">*</span></label>
            {loadingCategorias ? (
              <select disabled className="field-disabled">
                <option>Cargando categorías...</option>
              </select>
            ) : (
              <select
                name="idcategoriaproducto"
                value={formData.idcategoriaproducto}
                onChange={handleInputChange}
                className={erroresValidacion.idcategoriaproducto ? 'field-error' : ''}
                required
              >
                <option value="">Seleccionar categoría</option>
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
              <span className="error-message">{erroresValidacion.idcategoriaproducto}</span>
            )}
          </div>

          {/* Imagen del Producto - CAMPO PEQUEÑO */}
          <div className="field-group">
            <label>Imagen del Producto</label>
            <div className="imagen-upload-small">
              {formData.imagenPreview ? (
                <div className="imagen-preview-container">
                  <img 
                    src={formData.imagenPreview} 
                    alt="Preview" 
                    className="imagen-preview-small"
                  />
                  <div className="imagen-info-small">
                    <span className="imagen-nombre">{formData.imagenArchivo?.name}</span>
                    <button
                      type="button"
                      className="btn-eliminar-imagen"
                      onClick={removerImagen}
                      title="Eliminar imagen"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ) : (
                <div className="sin-imagen-container">
                  <span className="sin-imagen-text">Sin imagen</span>
                </div>
              )}
              <div className="upload-button-container">
                <input
                  id="imagen-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImagenChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="imagen-upload" className="btn-upload-imagen">
                  {subiendoImagen ? "..." : (formData.imagenPreview ? "Cambiar" : "Subir")}
                </label>
              </div>
            </div>
          </div>

          {/* Campo vacío para mantener el grid */}
          <div></div>
        </div>

        <div className="section-divider"></div>

        {/* Sección de Receta */}
        <div className="detalle-section">
          <h2>Receta del Producto:</h2>
          
          {formData.recetaSeleccionada ? (
            <div className="receta-seleccionada">
              <div className="receta-info">
                <h4>{formData.recetaSeleccionada.nombrereceta}</h4>
                <p>{formData.recetaSeleccionada.especificaciones}</p>
                <small>ID Receta: {formData.recetaSeleccionada.idreceta}</small>
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
            <div className="sin-receta">
              <p>No hay receta asignada a este producto</p>
            </div>
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
            {loading ? "Guardando..." : subiendoImagen ? "Subiendo imagen..." : "Guardar"}
          </button>
        </div>
      </form>

      {/* Modal de Recetas */}
      {mostrarModalReceta && (
        <SeleccionarRecetaModal
          onClose={() => setMostrarModalReceta(false)}
          onSeleccionar={handleSeleccionarReceta}
        />
      )}

      {/* Estilos adicionales solo para la sección de imagen pequeña */}
      <style jsx>{`
        .imagen-upload-small {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 2px dashed #e9ecef;
          border-radius: 8px;
          background-color: #f8f9fa;
          min-height: 60px;
        }

        .imagen-preview-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .imagen-preview-small {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 6px;
          border: 2px solid #28a745;
        }

        .imagen-info-small {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          max-width: 120px;
        }

        .imagen-nombre {
          font-size: 0.75rem;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .btn-eliminar-imagen {
          background-color: #e74c3c;
          color: white;
          border: none;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          cursor: pointer;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          align-self: flex-start;
        }

        .btn-eliminar-imagen:hover {
          background-color: #c0392b;
        }

        .sin-imagen-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sin-imagen-text {
          color: #666;
          font-style: italic;
          font-size: 0.85rem;
        }

        .upload-button-container {
          display: flex;
          align-items: center;
        }

        .btn-upload-imagen {
          background: linear-gradient(135deg, #17a2b8, #20c997);
          color: white;
          border: none;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 6px rgba(23, 162, 184, 0.3);
          display: inline-block;
          min-width: 60px;
          text-align: center;
        }

        .btn-upload-imagen:hover {
          background: linear-gradient(135deg, #138496, #1e7e34);
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(23, 162, 184, 0.4);
        }
      `}</style>
    </div>
  );
}