import React, { useState, useEffect, useRef } from "react";
import Modal from "../../components/modal";
import { InputSwitch } from "primereact/inputswitch";
import { MultiSelect } from "primereact/multiselect";
import insumoApiService from "../../services/insumos";
import imagenesApiService from "../../services/imagenes";
import SearchableSelect from "./SearchableSelect";
import StyledSelect from "./StyledSelect";
import './styles.css'


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
    idImagenExistente: null,
    catalogosSeleccionados: [],
    nombreCatalogo: "",
    precioadicion: "",
    estadoCatalogo: true,
  });

  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [catalogosExistentes, setCatalogosExistentes] = useState([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(false);
  const fileInputRef = useRef(null);

  const opcionesCatalogos = [
    { label: '🍬 Adiciones', value: 'adicion' },
    { label: '🍫 Toppings', value: 'topping' },
    { label: '🌶️ Salsas', value: 'salsa' },
    { label: '🎨 Sabores', value: 'sabor' },
    { label: '🥧 Rellenos', value: 'relleno' }
  ];

  const esCategoriaEspecial = (categoriaId) => {
    if (!categoriaId || categorias.length === 0) return false;
    
    const categoria = categorias.find(cat => cat.id === parseInt(categoriaId));
    if (!categoria) return false;
    
    const especiales = [
      'toppings', 'topping', 
      'adiciones', 'adicion',
      'salsas', 'salsa',     
      'sabores', 'sabor', 
      'rellenos', 'relleno'
    ];
    
    return especiales.some(especial => 
      categoria.nombreCategoria?.toLowerCase().includes(especial)
    );
  };

  const cargarImagenDesdeAPI = async (idImagen) => {
    if (!idImagen) return null;
    
    try {
      console.log('📥 Cargando imagen con ID:', idImagen);
      const imagenData = await imagenesApiService.obtenerImagenPorId(idImagen);
      console.log('✅ Imagen obtenida:', imagenData);
      return imagenData.urlimg || null;
    } catch (error) {
      console.error('❌ Error al cargar imagen:', error);
      return null;
    }
  };

  const cargarCatalogosDelInsumo = async (insumoId) => {
    setCargandoCatalogos(true);
    const catalogos = [];
    
    try {
      const tipos = ['adicion', 'topping', 'salsa', 'sabor', 'relleno'];
      
      for (const tipo of tipos) {
        try {
          const catalogosTipo = await insumoApiService.obtenerCatalogos(tipo);
          const catalogosDelInsumo = catalogosTipo.filter(cat => 
            parseInt(cat.idinsumos) === parseInt(insumoId)
          );
          
          catalogosDelInsumo.forEach(cat => {
            catalogos.push({
              tipo: tipo,
              id: cat.idadiciones || cat.idtoppings || cat.idsalsa || cat.idcatalogosabor || cat.idcatalogorrelleno,
              nombre: cat.nombre,
              precio: cat.precioadicion,
              estado: cat.estado
            });
          });
        } catch (error) {
          console.log(`No se encontraron catálogos de tipo ${tipo}:`, error);
        }
      }
      
      console.log('📦 Catálogos encontrados:', catalogos);
      setCatalogosExistentes(catalogos);
      
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
    } finally {
      setCargandoCatalogos(false);
    }
  };

  useEffect(() => {
    const cargarDatosModal = async () => {
      if (modal.tipo === "editar" && modal.insumo) {
        const insumoId = modal.insumo.id || modal.insumo.idinsumo;
        
        let urlImagen = null;
        if (modal.insumo.idImagen || modal.insumo.idimagen) {
          const idImagen = modal.insumo.idImagen || modal.insumo.idimagen;
          urlImagen = await cargarImagenDesdeAPI(idImagen);
        }
        
        if (esCategoriaEspecial(modal.insumo.idCategoriaInsumos || modal.insumo.idcategoriainsumos)) {
          await cargarCatalogosDelInsumo(insumoId);
        }
        
        setForm({
          nombreInsumo: modal.insumo.nombreInsumo || modal.insumo.nombreinsumo || "",
          idCategoriaInsumos: modal.insumo.idCategoriaInsumos || modal.insumo.idcategoriainsumos || "",
          cantidad: modal.insumo.cantidad || "",
          idUnidadMedida: modal.insumo.idUnidadMedida || modal.insumo.idunidadmedida || "",
          stockMinimo: modal.insumo.stockMinimo || modal.insumo.stockminimo || 5,
          precio: modal.insumo.precio || "",
          estado: modal.insumo.estado !== undefined ? modal.insumo.estado : true,
          imagen: null,
          imagenPreview: urlImagen,
          idImagenExistente: modal.insumo.idImagen || modal.insumo.idimagen || null,
          catalogosSeleccionados: [],
          nombreCatalogo: modal.insumo.nombreInsumo || modal.insumo.nombreinsumo || "",
          precioadicion: "",
          estadoCatalogo: true,
        });
      } else if (modal.tipo === "ver" && modal.insumo) {
        const insumoId = modal.insumo.id || modal.insumo.idinsumo;
        
        let urlImagen = null;
        if (modal.insumo.idImagen || modal.insumo.idimagen) {
          const idImagen = modal.insumo.idImagen || modal.insumo.idimagen;
          urlImagen = await cargarImagenDesdeAPI(idImagen);
        }
        
        if (esCategoriaEspecial(modal.insumo.idCategoriaInsumos || modal.insumo.idcategoriainsumos)) {
          await cargarCatalogosDelInsumo(insumoId);
        }
        
        setForm(prev => ({
          ...prev,
          imagenPreview: urlImagen,
          idImagenExistente: modal.insumo.idImagen || modal.insumo.idimagen || null
        }));
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
          idImagenExistente: null,
          catalogosSeleccionados: [],
          nombreCatalogo: "",
          precioadicion: "",
          estadoCatalogo: true,
        });
        setCatalogosExistentes([]);
      }
    };
    
    cargarDatosModal();
  }, [modal, categorias]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      
      if (name === "nombreInsumo" && esCategoriaEspecial(prev.idCategoriaInsumos)) {
        newForm.nombreCatalogo = value;
      }
      
      return newForm;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification("Por favor selecciona un archivo de imagen válido", "error");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showNotification("La imagen no debe superar los 10MB", "error");
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
      imagenPreview: null,
      idImagenExistente: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const verificarNombreDuplicado = async (nombre, idActual = null) => {
    try {
      const insumos = await insumoApiService.obtenerInsumos();
      const nombreNormalizado = nombre.trim().toLowerCase();
      
      const duplicado = insumos.find(insumo => {
        const idInsumo = insumo.id || insumo.idinsumo;
        const nombreInsumo = (insumo.nombreInsumo || insumo.nombreinsumo || '').trim().toLowerCase();
        
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

      const esEspecial = esCategoriaEspecial(form.idCategoriaInsumos);
      
      if (esEspecial && form.catalogosSeleccionados.length > 0) {
        if (!form.nombreCatalogo.trim()) {
          showNotification("El nombre para el catálogo es obligatorio", "error");
          return;
        }
        if (!form.precioadicion || parseFloat(form.precioadicion) < 0) {
          showNotification("El precio de adición debe ser mayor o igual a 0", "error");
          return;
        }
      }

      if (esEspecial && modal.tipo === "agregar" && form.catalogosSeleccionados.length === 0) {
        showNotification("Debes seleccionar al menos un tipo de catálogo", "error");
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

      let idImagenParaGuardar = form.idImagenExistente;
      
      if (form.imagen && form.imagen instanceof File) {
        try {
          setSubiendoImagen(true);
          showNotification("📤 Subiendo imagen a Cloudinary...", "info");
          
          const resultadoImagen = await imagenesApiService.subirImagen(
            form.imagen, 
            `Insumo: ${form.nombreInsumo}`
          );
          
          idImagenParaGuardar = resultadoImagen.idimagen;
          showNotification("✅ Imagen subida correctamente", "success");
          
        } catch (error) {
          console.error('❌ Error al subir imagen:', error);
          setSubiendoImagen(false);
          
          showNotification("Error al subir imagen: " + error.message, "error");
          
          const continuar = window.confirm(
            "No se pudo subir la imagen.\n\n¿Deseas guardar el insumo sin imagen?"
          );
          
          if (!continuar) return;
          idImagenParaGuardar = null;
        } finally {
          setSubiendoImagen(false);
        }
      }

      const datosEnvio = {
        nombreInsumo: form.nombreInsumo.trim(),
        idCategoriaInsumos: parseInt(form.idCategoriaInsumos),
        idUnidadMedida: parseInt(form.idUnidadMedida),
        cantidad: parseFloat(form.cantidad),
        stockMinimo: parseInt(form.stockMinimo),
        precio: parseFloat(form.precio),
        estado: form.estado,
      };

      if (idImagenParaGuardar && !isNaN(parseInt(idImagenParaGuardar))) {
        datosEnvio.idImagen = parseInt(idImagenParaGuardar);
      }

      if (esEspecial && form.catalogosSeleccionados.length > 0) {
        datosEnvio.catalogosSeleccionados = form.catalogosSeleccionados;
        datosEnvio.nombreCatalogo = form.nombreCatalogo.trim();
        datosEnvio.precioadicion = parseFloat(form.precioadicion);
        datosEnvio.estadoCatalogo = form.estadoCatalogo;
      }

      if (modal.tipo === "agregar") {
        await insumoApiService.crearInsumo(datosEnvio);
        const catalogosTexto = form.catalogosSeleccionados.length > 0 
          ? ` y agregado a ${form.catalogosSeleccionados.length} catálogo(s)` 
          : "";
        showNotification("✅ Insumo agregado exitosamente" + catalogosTexto, "success");
      } else if (modal.tipo === "editar") {
        const insumoId = modal.insumo.id || modal.insumo.idinsumo;
        await insumoApiService.actualizarInsumo(insumoId, datosEnvio);
        
        if (form.catalogosSeleccionados.length > 0) {
          showNotification(
            `✅ Insumo actualizado y agregado a ${form.catalogosSeleccionados.length} catálogo(s)`, 
            "success"
          );
        } else {
          showNotification("✅ Insumo actualizado exitosamente", "success");
        }
      }
      
      await cargarInsumos();
      cerrar();

    } catch (error) {
      console.error("❌ Error al guardar insumo:", error);
      showNotification("Error al guardar: " + (error.message || "Error desconocido"), "error");
    }
  };

  const eliminar = async () => {
    try {
      const cantidadActual = parseFloat(modal.insumo.cantidad) || 0;
      
      if (cantidadActual > 0) {
        showNotification(
          `No se puede eliminar este insumo porque tiene ${cantidadActual} unidades en stock.`,
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
      showNotification("Error al eliminar el insumo: " + error.message, "error");
    }
  };

  const mostrarCamposCatalogo = modal.tipo !== "ver" && esCategoriaEspecial(form.idCategoriaInsumos);
  const mostrarCampoImagen = mostrarCamposCatalogo;
  const esEspecialVer = modal.tipo === "ver" && esCategoriaEspecial(modal.insumo?.idCategoriaInsumos || modal.insumo?.idcategoriainsumos);

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
              />
            </label>
            
            <label>
              Categoría
              <input 
                value={
                  modal.insumo?.nombreCategoria || 
                  modal.insumo?.categoriainsumos?.nombrecategoria ||
                  (categorias.find(cat => cat.id === parseInt(modal.insumo?.idCategoriaInsumos || modal.insumo?.idcategoriainsumos))?.nombreCategoria) ||
                  "Sin categoría"
                } 
                readOnly 
                className="modal-input"
              />
            </label>
            
            <label>
              Cantidad
              <input 
                type="number" 
                value={modal.insumo?.cantidad || 0} 
                readOnly 
                className="modal-input"
              />
            </label>
            
            <label>
              Unidad
              <input 
                value={
                  modal.insumo?.nombreUnidadMedida ||
                  modal.insumo?.unidadmedida?.unidadmedida ||
                  (unidades.find(uni => uni.idunidadmedida === parseInt(modal.insumo?.idUnidadMedida || modal.insumo?.idunidadmedida))?.unidadmedida) ||
                  "Sin unidad"
                } 
                readOnly 
                className="modal-input"
              />
            </label>
            
            <label>
              Stock Mínimo
              <input 
                type="number" 
                value={modal.insumo?.stockMinimo || modal.insumo?.stockminimo || 5} 
                readOnly 
                className="modal-input"
              />
            </label>
            
            <label>
              Precio
              <input 
                type="text"
                value={modal.insumo?.precio ? new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0
                }).format(modal.insumo.precio) : '$0'} 
                readOnly 
                className="modal-input"
              />
            </label>

            {form.imagenPreview && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: "15px" }}>
                <h4 style={{ margin: "0 0 10px 0" }}>Imagen del insumo:</h4>
                <img 
                  src={form.imagenPreview} 
                  alt="Insumo" 
                  style={{ 
                    maxWidth: "300px", 
                    maxHeight: "300px",
                    borderRadius: "8px",
                    border: "2px solid #ddd",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }} 
                />
              </div>
            )}

            {esEspecialVer && catalogosExistentes.length > 0 && (
              <div style={{ 
                gridColumn: "1 / -1",
                backgroundColor: "#fdf2f8",
                padding: "15px",
                borderRadius: "8px",
                marginTop: "15px",
                border: "2px solid #ec4899"
              }}>
                <h4 style={{ margin: "0 0 15px 0", color: "#ec4899", fontWeight: "600" }}>
                  📦 Catálogos asociados ({catalogosExistentes.length})
                </h4>
                <div style={{ 
                  display: "grid",
                  gap: "10px"
                }}>
                  {catalogosExistentes.map((cat, index) => (
                    <div 
                      key={index}
                      style={{
                        backgroundColor: "white",
                        padding: "12px",
                        borderRadius: "6px",
                        border: "1px solid #fbcfe8",
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto auto",
                        gap: "10px",
                        alignItems: "center"
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>
                        {cat.tipo === 'adicion' && '🍬'}
                        {cat.tipo === 'topping' && '🍫'}
                        {cat.tipo === 'salsa' && '🌶️'}
                        {cat.tipo === 'sabor' && '🎨'}
                        {cat.tipo === 'relleno' && '🥧'}
                      </span>
                      <div>
                        <strong>{cat.nombre}</strong>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          Tipo: {cat.tipo}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <strong>${new Intl.NumberFormat('es-CO').format(cat.precio)}</strong>
                      </div>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor: cat.estado ? "#dcfce7" : "#fee2e2",
                        color: cat.estado ? "#166534" : "#991b1b"
                      }}>
                        {cat.estado ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {esEspecialVer && cargandoCatalogos && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "20px" }}>
                <p>⏳ Cargando catálogos...</p>
              </div>
            )}
            
            <div style={{ 
              gridColumn: "1 / -1", 
              display: "flex", 
              alignItems: "center", 
              gap: "10px",
              marginTop: "15px"
            }}>
              <span>Estado:</span>
              <div style={{
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
                onChange={(id) => {
                  setForm(prev => ({ 
                    ...prev, 
                    idCategoriaInsumos: id,
                    nombreCatalogo: prev.nombreInsumo
                  }));
                }}
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

            {mostrarCampoImagen && (
              <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                <label>
                  Imagen* {subiendoImagen && <span style={{ color: "#ec4899" }}>⏳ Subiendo...</span>}
                  <div style={{ marginTop: "8px" }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={subiendoImagen}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={subiendoImagen}
                      className="modal-btn"
                      style={{
                        backgroundColor: subiendoImagen ? "#ccc" : "#ec4899",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: subiendoImagen ? "not-allowed" : "pointer"
                      }}
                    >
                      📷 Seleccionar imagen
                    </button>
                    
                    {form.imagenPreview && (
                      <div style={{ marginTop: "10px", textAlign: "center" }}>
                        <img
                          src={form.imagenPreview}
                          alt="Preview"
                          style={{
                            maxWidth: "200px",
                            maxHeight: "200px",
                            borderRadius: "8px",
                            border: "2px solid #ddd"
                          }}
                        />
                        <button
                          type="button"
                          onClick={removerImagen}
                          className="modal-btn cancel-btn"
                          style={{ marginTop: "10px", display: "block", margin: "10px auto 0" }}
                        >
                          ❌ Remover imagen
                        </button>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}{mostrarCamposCatalogo && (
              <>
                <div style={{ 
                  gridColumn: "1 / -1", 
                  backgroundColor: "#fce4ec", 
                  padding: "15px", 
                  borderRadius: "8px",
                  marginTop: "15px",
                  border: "2px solid #ec4899"
                }}>
                  <h3 style={{ 
                    margin: "0 0 15px 0", 
                    color: "#ec4899", 
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    🎯 Información de Catálogos
                  </h3>
                  
                  <div className="modal-form-grid">
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        {modal.tipo === "agregar" 
                          ? "Agregar a catálogos* (Puedes seleccionar varios)" 
                          : "Agregar a catálogos adicionales (Opcional)"}
                      </label>
                      
                      <MultiSelect
                        value={form.catalogosSeleccionados}
                        options={opcionesCatalogos}
                        onChange={(e) => setForm({ ...form, catalogosSeleccionados: e.value })}
                        placeholder="📦 Selecciona los catálogos donde deseas agregar este insumo"
                        display="chip"
                        className="w-full"
                        panelStyle={{
                          minWidth: '350px'
                        }}
                        style={{
                          width: '100%',
                          minHeight: '48px',
                          border: '2px solid #ec4899',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: '#fff'
                        }}
                        itemTemplate={(option) => {
                          if (!option) return null;
                          return (
                            <div style={{
                              padding: '8px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '14px'
                            }}>
                              <span>{option.label}</span>
                            </div>
                          );
                        }}
                        selectedItemTemplate={(option) => {
                          if (!option) return null;
                          return (
                            <div style={{
                              backgroundColor: '#fce4ec',
                              color: '#ec4899',
                              padding: '4px 12px',
                              borderRadius: '16px',
                              fontSize: '13px',
                              fontWeight: '500',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              margin: '2px'
                            }}>
                              {option.label}
                            </div>
                          );
                        }}
                      />
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: '#fef3c7',
                        borderLeft: '3px solid #f59e0b',
                        borderRadius: '4px'
                      }}>
                        <span style={{ fontSize: '16px' }}>💡</span>
                        <small style={{
                          color: '#92400e',
                          fontSize: '13px',
                          lineHeight: '1.4'
                        }}>
                          {modal.tipo === "agregar" 
                            ? "Este insumo se agregará automáticamente a todos los catálogos que selecciones"
                            : "Los catálogos que selecciones se agregarán SIN eliminar los existentes"}
                        </small>
                      </div>
                    </div>

                    <label>
                      Nombre para el catálogo*
                      <input
                        name="nombreCatalogo"
                        value={form.nombreCatalogo}
                        onChange={handleChange}
                        className="modal-input"
                        placeholder="Ejemplo: Chocolate, Crema, Vainilla..."
                      />
                    </label>

                    <label>
                      Precio de adición*
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
                          name="precioadicion"
                          value={form.precioadicion}
                          onChange={handleChange}
                          className="modal-input"
                          min="0"
                          step="100"
                          placeholder="0"
                          style={{ paddingLeft: "25px" }}
                        />
                      </div>
                    </label>

                    <div style={{ 
                      gridColumn: "1 / -1",
                      display: "flex", 
                      alignItems: "center", 
                      gap: "10px",
                      marginTop: "5px"
                    }}>
                      <span>Estado del catálogo:</span>
                      <InputSwitch
                        checked={form.estadoCatalogo}
                        onChange={(e) => setForm({ ...form, estadoCatalogo: e.value })}
                      />
                      <span style={{ 
                        color: form.estadoCatalogo ? "#28a745" : "#dc3545",
                        fontWeight: "500"
                      }}>
                        {form.estadoCatalogo ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    {form.catalogosSeleccionados.length > 0 && (
                      <div style={{
                        gridColumn: "1 / -1",
                        backgroundColor: '#ecfdf5',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '2px solid #10b981',
                        marginTop: '12px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          <span style={{ fontSize: '20px' }}>✅</span>
                          <p style={{ 
                            margin: 0, 
                            fontWeight: '700', 
                            color: '#047857',
                            fontSize: '15px'
                          }}>
                            {modal.tipo === "agregar" 
                              ? `Se creará el insumo en ${form.catalogosSeleccionados.length} catálogo${form.catalogosSeleccionados.length > 1 ? 's' : ''}:`
                              : `Se agregará a ${form.catalogosSeleccionados.length} catálogo${form.catalogosSeleccionados.length > 1 ? 's' : ''} adicional${form.catalogosSeleccionados.length > 1 ? 'es' : ''}:`}
                          </p>
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: '8px'
                        }}>
                          {form.catalogosSeleccionados.map(tipo => {
                            const opcion = opcionesCatalogos.find(o => o.value === tipo);
                            return (
                              <div 
                                key={tipo}
                                style={{
                                  backgroundColor: '#fff',
                                  padding: '10px 14px',
                                  borderRadius: '6px',
                                  border: '1px solid #d1fae5',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  color: '#047857'
                                }}
                              >
                                <span>✔</span>
                                {opcion?.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

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
              backgroundColor: "#ec4899",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#db2777";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#ec4899";
            }}
          >
            Eliminar
          </button>
        )}
        
        {(modal.tipo === "agregar" || modal.tipo === "editar") && (
          <button
            className="modal-btn save-btn"
            onClick={guardar}
            disabled={subiendoImagen}
            style={{
              backgroundColor: subiendoImagen ? "#ccc" : "#ec4899",
              color: "white",
              cursor: subiendoImagen ? "not-allowed" : "pointer"
            }}
          >
            {subiendoImagen ? "⏳ Subiendo..." : "Guardar"}
          </button>
        )}
      </div>
    </Modal>
  );
}