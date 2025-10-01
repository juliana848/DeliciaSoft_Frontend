import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import "../adminStyles.css";
import Modal from "../../components/modal";
import SearchBar from "../../components/SearchBar";
import Notification from "../../components/Notification";
import sedeApiService from "../../Services/sedes_services";

export default function SedesTable() {
  const [sedes, setSedes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    Direccion: "",
    Telefono: "",
    activo: true,
    imagen: null,
    imagenPreview: null,
    imagenUrl: null,
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    cargarSedes();
  }, []);

  const cargarSedes = async () => {
    try {
      setLoading(true);
      const sedesData = await sedeApiService.obtenerSedes();
      setSedes(sedesData);
    } catch (error) {
      console.error("Error al cargar sedes:", error);
      showNotification("Error al cargar las sedes", "error");
      // Usar datos mock como fallback
      const mockSedes = [
        {
          id: 501,
          nombre: "San Pablo",
          Direccion: "Cra. 37 #97-27, Medellín, Antioquia, Colombia",
          Telefono: "325888960",
          activo: true,
          imagenUrl: null,
        },
        {
          id: 502,
          nombre: "San Benito",
          Direccion: "Cra. 57 #51-83, Medellín, Antioquia, Colombia",
          Telefono: "3107412156",
          activo: true,
          imagenUrl: null,
        },
      ];
      setSedes(mockSedes);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivo = async (sede) => {
    try {
      setLoading(true);
      const nuevoEstado = !sede.activo;
      await sedeApiService.cambiarEstadoSede(sede.id, nuevoEstado);
      
      const sedesActualizadas = sedes.map((s) =>
        s.id === sede.id ? { ...s, activo: nuevoEstado } : s
      );
      setSedes(sedesActualizadas);
      
      showNotification(
        `Sede ${sede.activo ? "desactivada" : "activada"} exitosamente`
      );
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      showNotification("Error al cambiar el estado de la sede", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (mensaje, tipo = "success") => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: "", tipo: "success" });
  };

  const abrirModal = (tipo, sede = null) => {
    setModalTipo(tipo);
    setSedeSeleccionada(sede);

    if (tipo === "agregar") {
      setFormData({
        id: "",
        nombre: "",
        Direccion: "",
        Telefono: "",
        activo: true,
        imagen: null,
        imagenPreview: null,
        imagenUrl: null,
      });
    } else if (tipo === "editar" && sede) {
      setFormData({ 
        ...sede,
        imagen: null,
        imagenPreview: sede.imagenUrl || null,
        imagenUrl: sede.imagenUrl || null,
      });
    }

    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setSedeSeleccionada(null);
    setModalTipo(null);
    setFormData({
      id: "",
      nombre: "",
      Direccion: "",
      Telefono: "",
      activo: true,
      imagen: null,
      imagenPreview: null,
      imagenUrl: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showNotification("Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)", "error");
        e.target.value = "";
        return;
      }

      // Validar tamaño del archivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        showNotification("El archivo es demasiado grande. Máximo 5MB permitido", "error");
        e.target.value = "";
        return;
      }

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          imagen: file,
          imagenPreview: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const eliminarImagen = () => {
    setFormData(prev => ({
      ...prev,
      imagen: null,
      imagenPreview: null,
      imagenUrl: modalTipo === "editar" ? null : prev.imagenUrl
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validarFormulario = () => {
    const { nombre, Direccion, Telefono } = formData;

    // Validar campos obligatorios
    if (!nombre.trim()) {
      showNotification("El nombre es obligatorio", "error");
      return false;
    }

    if (nombre.trim().length < 2) {
      showNotification("El nombre debe tener al menos 2 caracteres", "error");
      return false;
    }

    if (nombre.trim().length > 50) {
      showNotification("El nombre no puede exceder 50 caracteres", "error");
      return false;
    }

    if (!Direccion.trim()) {
      showNotification("La dirección es obligatoria", "error");
      return false;
    }

    if (Direccion.trim().length < 10) {
      showNotification("La dirección debe tener al menos 10 caracteres", "error");
      return false;
    }

    if (!Telefono.trim()) {
      showNotification("El teléfono es obligatorio", "error");
      return false;
    }

    // Validar formato de teléfono colombiano
    const telefonoLimpio = Telefono.replace(/\s/g, '');
    const telefonoRegex = /^3[0-9]{9}$/;
    
    if (!telefonoRegex.test(telefonoLimpio)) {
      showNotification("Ingrese un número de teléfono colombiano válido (10 dígitos comenzando con 3)", "error");
      return false;
    }

    // Validar que no exista otra sede con el mismo nombre (excluyendo la sede actual si es edición)
    const sedeExistente = sedes.find(sede => 
      sede.nombre.toLowerCase().trim() === nombre.toLowerCase().trim() &&
      sede.id !== (sedeSeleccionada?.id || 0)
    );

    if (sedeExistente) {
      showNotification("Ya existe una sede con este nombre", "error");
      return false;
    }

    // Validar que no exista otra sede con el mismo teléfono (excluyendo la sede actual si es edición)
    const telefonoExistente = sedes.find(sede => 
      sede.Telefono === telefonoLimpio &&
      sede.id !== (sedeSeleccionada?.id || 0)
    );

    if (telefonoExistente) {
      showNotification("Ya existe una sede con este número de teléfono", "error");
      return false;
    }

    return true;
  };

  const guardarSede = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);

      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre.trim());
      formDataToSend.append('Direccion', formData.Direccion.trim());
      formDataToSend.append('Telefono', formData.Telefono.replace(/\s/g, ''));
      formDataToSend.append('activo', formData.activo);
      
      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }

      let resultado;
      if (modalTipo === "agregar") {
        resultado = await sedeApiService.crearSede(formDataToSend);
        setSedes([...sedes, resultado]);
        showNotification("Sede agregada exitosamente");
      } else if (modalTipo === "editar") {
        resultado = await sedeApiService.actualizarSede(
          sedeSeleccionada.id,
          formDataToSend
        );
        const sedesActualizadas = sedes.map((s) =>
          s.id === sedeSeleccionada.id ? resultado : s
        );
        setSedes(sedesActualizadas);
        showNotification("Sede actualizada exitosamente");
      }

      // Debug: Verificar que la URL de la imagen se esté recibiendo correctamente
      console.log('Respuesta del servidor:', resultado);
      if (resultado.imagenUrl) {
        console.log('URL de imagen recibida:', resultado.imagenUrl);
      }

      cerrarModal();
    } catch (error) {
      console.error("Error al guardar sede:", error);
      showNotification(
        error.message || "Error al guardar la sede",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminar = async () => {
    try {
      setLoading(true);
      await sedeApiService.eliminarSede(sedeSeleccionada.id);
      
      const sedesActualizadas = sedes.filter((s) => s.id !== sedeSeleccionada.id);
      setSedes(sedesActualizadas);
      
      cerrarModal();
      showNotification("Sede eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar sede:", error);
      showNotification(
        error.message || "Error al eliminar la sede",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const sedesFiltradas = sedes.filter(
    (sede) =>
      sede.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      sede.Direccion.toLowerCase().includes(filtro.toLowerCase()) ||
      sede.Telefono.toLowerCase().includes(filtro.toLowerCase())
  );

  const renderImageUpload = () => (
    <div className="modal-field" style={{ gridColumn: 'span 2' }}>
      <label className="modal-label">Imagen:</label>
      <div style={{ marginTop: '8px' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="modal-input"
          style={{ marginBottom: '10px' }}
        />
        <small style={{ color: '#666', fontSize: '12px', display: 'block', marginBottom: '10px' }}>
          Formatos permitidos: JPEG, PNG, GIF, WebP. Tamaño máximo: 5MB
        </small>
        {formData.imagenPreview && (
          <div style={{ 
            marginTop: '10px', 
            textAlign: 'center', 
            position: 'relative',
            maxHeight: '250px',
            overflow: 'hidden',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}>
            <img 
              src={formData.imagenPreview} 
              alt="Preview"
              style={{ 
                width: '100%',
                maxHeight: '200px', 
                objectFit: 'contain',
                backgroundColor: '#f9fafb'
              }} 
              onLoad={(e) => {
                e.target.style.opacity = '1';
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                showNotification('Error al cargar la imagen', 'error');
              }}
            />
            <button
              type="button"
              onClick={eliminarImagen}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.2s ease',
                zIndex: 10
              }}
              title="Eliminar imagen"
              onMouseOver={(e) => {
                e.target.style.background = '#dc2626';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#ef4444';
                e.target.style.transform = 'scale(1)';
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderModal = () => {
    if (!modalVisible) return null;

    switch (modalTipo) {
      case "agregar":
        return (
          <Modal visible={modalVisible} onClose={cerrarModal}>
            <div className="modal-header">
              <h2 className="modal-title">Agregar Sede</h2>
            </div>
            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">
                    Nombre: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      handleInputChange("nombre", e.target.value)
                    }
                    className="modal-input"
                    placeholder="Ingrese el nombre de la sede"
                    maxLength="50"
                    required
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Mínimo 2 caracteres, máximo 50
                  </small>
                </div>
                <div className="modal-field">
                  <label className="modal-label">
                    Dirección: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <textarea
                    value={formData.Direccion}
                    onChange={(e) =>
                      handleInputChange("Direccion", e.target.value)
                    }
                    className="modal-input"
                    placeholder="Ingrese la dirección completa de la sede"
                    required
                    style={{ 
                      minHeight: '60px', 
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Mínimo 10 caracteres
                  </small>
                </div>
                <div className="modal-field">
                  <label className="modal-label">
                    Teléfono: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.Telefono}
                    onChange={(e) => {
                      // Solo permitir números
                      const valor = e.target.value.replace(/\D/g, '');
                      if (valor.length <= 10) {
                        handleInputChange("Telefono", valor);
                      }
                    }}
                    className="modal-input"
                    placeholder="3001234567"
                    maxLength="10"
                    required
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Formato: 10 dígitos comenzando con 3
                  </small>
                </div>
                {renderImageUpload()}
              </div>
            </div>
            <div className="modal-footer mt-2 flex justify-end gap-2">
              <button
                className="modal-btn cancel-btn text-sm px-3 py-1"
                onClick={cerrarModal}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className="modal-btn save-btn text-sm px-3 py-1"
                onClick={guardarSede}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </Modal>
        );

      case "editar":
        return (
          <Modal visible={modalVisible} onClose={cerrarModal}>
            <div className="modal-header">
              <h2 className="modal-title">Editar Sede</h2>
            </div>
            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">
                    Nombre: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      handleInputChange("nombre", e.target.value)
                    }
                    className="modal-input"
                    placeholder="Ingrese el nombre de la sede"
                    maxLength="50"
                    required
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Mínimo 2 caracteres, máximo 50
                  </small>
                </div>
                <div className="modal-field">
                  <label className="modal-label">
                    Dirección: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <textarea
                    value={formData.Direccion}
                    onChange={(e) =>
                      handleInputChange("Direccion", e.target.value)
                    }
                    className="modal-input"
                    placeholder="Ingrese la dirección completa de la sede"
                    required
                    style={{ 
                      minHeight: '60px', 
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Mínimo 10 caracteres
                  </small>
                </div>
                <div className="modal-field">
                  <label className="modal-label">
                    Teléfono: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.Telefono}
                    onChange={(e) => {
                      // Solo permitir números
                      const valor = e.target.value.replace(/\D/g, '');
                      if (valor.length <= 10) {
                        handleInputChange("Telefono", valor);
                      }
                    }}
                    className="modal-input"
                    placeholder="3001234567"
                    maxLength="10"
                    required
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Formato: 10 dígitos comenzando con 3
                  </small>
                </div>
                {renderImageUpload()}
              </div>
            </div>
            <div className="modal-footer mt-2 flex justify-end gap-2">
              <button
                className="modal-btn cancel-btn text-sm px-3 py-1"
                onClick={cerrarModal}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className="modal-btn save-btn text-sm px-3 py-1"
                onClick={guardarSede}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Actualizar"}
              </button>
            </div>
          </Modal>
        );

      case "ver":
        return (
          <Modal visible={modalVisible} onClose={cerrarModal}>
            <div className="modal-header">
              <h2 className="modal-title">Detalle de Sede</h2>
            </div>
            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Nombre:</label>
                  <input
                    type="text"
                    value={sedeSeleccionada?.nombre || ''}
                    className="modal-input"
                    disabled
                    readOnly
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Dirección:</label>
                  <textarea
                    value={sedeSeleccionada?.Direccion || ''}
                    className="modal-input"
                    disabled
                    readOnly
                    style={{ 
                      minHeight: '60px', 
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Teléfono:</label>
                  <input
                    type="text"
                    value={sedeSeleccionada?.Telefono || ''}
                    className="modal-input"
                    disabled
                    readOnly
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Estado:</label>
                  <input
                    type="text"
                    value={sedeSeleccionada?.activo ? "Activo" : "Inactivo"}
                    className="modal-input"
                    disabled
                    readOnly
                    style={{
                      color: sedeSeleccionada?.activo ? '#10b981' : '#ef4444',
                      fontWeight: '500'
                    }}
                  />
                </div>
                {/* Mejor manejo de la imagen en visualización */}
                {sedeSeleccionada?.imagenUrl && (
                  <div className="modal-field" style={{ gridColumn: 'span 2' }}>
                    <label className="modal-label">Imagen:</label>
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                      <img 
                        src={sedeSeleccionada.imagenUrl} 
                        alt={`Imagen de ${sedeSeleccionada.nombre}`}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '400px', 
                          objectFit: 'contain',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          backgroundColor: '#f9fafb'
                        }}
                        onLoad={(e) => {
                          e.target.style.opacity = '1';
                          console.log('Imagen cargada correctamente:', sedeSeleccionada.imagenUrl);
                        }}
                        onError={(e) => {
                          console.error('Error al cargar imagen:', sedeSeleccionada.imagenUrl);
                          e.target.style.display = 'none';
                          const container = e.target.parentElement;
                          container.innerHTML = '<p style="color: #ef4444; font-style: italic; padding: 20px; border: 1px dashed #ef4444; border-radius: 8px;">No se pudo cargar la imagen</p>';
                        }}
                      />
                    </div>
                    {/* Debug info - remover en producción */}
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', textAlign: 'left' }}>
                      <strong>URL de imagen:</strong> {sedeSeleccionada.imagenUrl}
                    </div>
                  </div>
                )}
                {!sedeSeleccionada?.imagenUrl && (
                  <div className="modal-field" style={{ gridColumn: 'span 2' }}>
                    <label className="modal-label">Imagen:</label>
                    <div style={{ 
                      marginTop: '10px', 
                      padding: '20px', 
                      textAlign: 'center',
                      border: '1px dashed #ddd',
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb',
                      color: '#666'
                    }}>
                      No hay imagen disponible
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer mt-2 flex justify-end gap-2">
              <button
                className="modal-btn cancel-btn text-sm px-3 py-1"
                onClick={cerrarModal}
              >
                Cerrar
              </button>
            </div>
          </Modal>
        );

      case "eliminar":
        return (
          <Modal visible={modalVisible} onClose={cerrarModal}>
            <div className="modal-header">
              <h2 className="modal-title">Confirmar Eliminación</h2>
            </div>
            <div className="modal-body">
              <div className="modal-confirmation">
                <div className="confirmation-icon">
                  <i className="pi pi-exclamation-triangle"></i>
                </div>
                <p className="confirmation-text">
                  ¿Estás seguro de que deseas eliminar la sede{" "}
                  <strong>"{sedeSeleccionada?.nombre}"</strong>?
                </p>
                <p className="confirmation-warning">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="modal-footer mt-2 flex justify-end gap-2">
              <button
                className="modal-btn cancel-btn text-sm px-3 py-1"
                onClick={cerrarModal}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className="modal-btn save-btn text-sm px-3 py-1"
                onClick={confirmarEliminar}
                disabled={loading}
                style={{ backgroundColor: '#ef4444' }}
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </Modal>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-wrapper">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />
      <div className="admin-toolbar">
        <button
          className="admin-button pink"
          onClick={() => abrirModal("agregar")}
          type="button"
          disabled={loading}
          style={{ padding: "10px 18px", fontSize: "15px", fontWeight: "500" }}
        >
          + Agregar
        </button>
        <SearchBar
          placeholder="Buscar sede..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>
      <h2 className="admin-section-title">Gestión de Sedes</h2>

      <DataTable
        value={sedesFiltradas}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "50rem" }}
        emptyMessage="No se encontraron sedes"
        loading={loading}
        loadingIcon="pi pi-spinner pi-spin"
      >
        <Column field="id" header="N°" />
        <Column field="nombre" header="Nombre" />
        <Column field="Direccion" header="Dirección" style={{ maxWidth: '200px' }} />
        <Column field="Telefono" header="Teléfono" />
        <Column
          header="Estado"
          body={(rowData) => (
            <InputSwitch
              checked={rowData.activo}
              onChange={() => toggleActivo(rowData)}
              disabled={loading}
            />
          )}
        />
        <Column
          header="Acciones"
          body={(rowData) => (
            <div className="action-buttons">
              <button
                className="admin-button gray"
                title="Visualizar"
                onClick={() => abrirModal("ver", rowData)}
                disabled={loading}
              >
                👁
              </button>
              <button
                className="admin-button yellow"
                title="Editar"
                onClick={() => abrirModal("editar", rowData)}
                disabled={loading || !rowData.activo}
                style={{
                  opacity: !rowData.activo ? 0.5 : 1,
                  cursor: !rowData.activo ? 'not-allowed' : 'pointer'
                }}
              >
                ✏️
              </button>
              <button
                className="admin-button red"
                title="Eliminar"
                onClick={() => abrirModal("eliminar", rowData)}
                disabled={loading || !rowData.activo}
                style={{
                  opacity: !rowData.activo ? 0.5 : 1,
                  cursor: !rowData.activo ? 'not-allowed' : 'pointer'
                }}
              >
                🗑️
              </button>
            </div>
          )}
        />
      </DataTable>

      {renderModal()}
    </div>
  );
}