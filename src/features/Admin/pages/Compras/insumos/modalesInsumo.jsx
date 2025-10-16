import React, { useState, useEffect, useRef } from "react";
import Modal from "../../../components/modal";
import { InputSwitch } from "primereact/inputswitch";
import { MultiSelect } from "primereact/multiselect";
import insumoApiService from "../../../services/insumos";
import imagenesApiService from "../../../services/imagenes";
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
    idImagenExistente: null,
    catalogosSeleccionados: [],
    nombreCatalogo: "",
    precioadicion: "",
    estadoCatalogo: true,
  });

  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const fileInputRef = useRef(null);

  const opcionesCatalogos = [
    { label: '🍰 Adiciones/Toppings', value: 'adicion' },
    { label: '🎨 Sabores', value: 'sabor' },
    { label: '🥧 Rellenos', value: 'relleno' }
  ];

  const esCategoriaEspecial = (categoriaId) => {
    if (!categoriaId || categorias.length === 0) return false;
    
    const categoria = categorias.find(cat => cat.id === parseInt(categoriaId));
    if (!categoria) return false;
    
    const especiales = ['toppings', 'topping', 'adiciones', 'adicion', 'sabores', 'sabor', 'rellenos', 'relleno'];
    return especiales.some(especial => 
      categoria.nombreCategoria?.toLowerCase().includes(especial)
    );
  };

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
        idImagenExistente: modal.insumo.idImagen || null,
        catalogosSeleccionados: [],
        nombreCatalogo: modal.insumo.nombreInsumo || modal.insumo.nombreinsumo || "",
        precioadicion: "",
        estadoCatalogo: true,
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
        idImagenExistente: null,
        catalogosSeleccionados: [],
        nombreCatalogo: "",
        precioadicion: "",
        estadoCatalogo: true,
      });
    }
  }, [modal]);

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
      
      if (esEspecial) {
        if (form.catalogosSeleccionados.length === 0) {
          showNotification("Debes seleccionar al menos un tipo de catálogo", "error");
          return;
        }
        if (!form.nombreCatalogo.trim()) {
          showNotification("El nombre para el catálogo es obligatorio", "error");
          return;
        }
        if (!form.precioadicion || parseFloat(form.precioadicion) < 0) {
          showNotification("El precio de adición debe ser mayor o igual a 0", "error");
          return;
        }
      }

      if (!form.cantidad || form.cantidad <= 0) {
        showNotification("La cantidad debe ser mayor a 0", "error");
        return;
      }
      if (!form.precio || form.precio < 1000) {
        showNotification("El precio debe ser mínimo $1,000 COP", "error");
        return;
      }

      // PASO 1: SUBIR IMAGEN SI EXISTE
      let idImagenParaGuardar = form.idImagenExistente;
      
      if (form.imagen) {
        try {
          setSubiendoImagen(true);
          showNotification("Subiendo imagen...", "info");
          console.log('Subiendo imagen:', form.imagen.name);
          
          const resultadoImagen = await imagenesApiService.subirImagen(
            form.imagen, 
            form.nombreInsumo
          );
          
          idImagenParaGuardar = resultadoImagen.idimagen;
          console.log('Imagen subida, ID:', idImagenParaGuardar);
          showNotification("Imagen subida correctamente", "success");
          
        } catch (error) {
          console.error('Error al subir imagen:', error);
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

      // PASO 2: PREPARAR DATOS DEL INSUMO
      const datosEnvio = {
        nombreInsumo: form.nombreInsumo.trim(),
        idCategoriaInsumos: parseInt(form.idCategoriaInsumos),
        idUnidadMedida: parseInt(form.idUnidadMedida),
        cantidad: parseFloat(form.cantidad),
        stockMinimo: parseInt(form.stockMinimo),
        precio: parseFloat(form.precio),
        estado: form.estado,
      };

      // Agregar imagen si existe
      if (idImagenParaGuardar) {
        datosEnvio.idImagen = parseInt(idImagenParaGuardar);
        console.log('Agregando idImagen:', datosEnvio.idImagen);
      }

      // PASO 3: AGREGAR CATÁLOGOS SI ES CATEGORÍA ESPECIAL
      if (esEspecial && form.catalogosSeleccionados.length > 0) {
        datosEnvio.catalogosSeleccionados = form.catalogosSeleccionados;
        datosEnvio.nombreCatalogo = form.nombreCatalogo.trim();
        datosEnvio.precioadicion = parseFloat(form.precioadicion);
        datosEnvio.estadoCatalogo = form.estadoCatalogo;
      }

      console.log('Datos finales a enviar:', JSON.stringify(datosEnvio, null, 2));

      // PASO 4: GUARDAR INSUMO
      if (modal.tipo === "agregar") {
        await insumoApiService.crearInsumo(datosEnvio);
        const catalogosTexto = form.catalogosSeleccionados.length > 0 
          ? ` y agregado a ${form.catalogosSeleccionados.length} catálogo(s)` 
          : "";
        showNotification("Insumo agregado exitosamente" + catalogosTexto);
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
          `No se puede eliminar este insumo porque tiene ${cantidadActual} unidades en stock. Para eliminarlo, primero debe reducir el stock a 0.`,
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

  const mostrarCamposCatalogo = modal.tipo !== "ver" && esCategoriaEspecial(form.idCategoriaInsumos);
  const mostrarCampoImagen = mostrarCamposCatalogo;

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
            )}

            {mostrarCamposCatalogo && (
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
                        Agregar a catálogos* (Puedes seleccionar varios)
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
                          Este insumo se agregará automáticamente a todos los catálogos que selecciones
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
                            Se creará el insumo en {form.catalogosSeleccionados.length} catálogo{form.catalogosSeleccionados.length > 1 ? 's' : ''}:
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
                                <span>✓</span>
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