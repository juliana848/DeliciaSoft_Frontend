import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import "../adminStyles.css";
import Modal from "../components/modal";
import SearchBar from "../components/SearchBar";
import Notification from "../components/Notification";
import sedeApiService from "../services/sedes_services";

// Componente para el selector de direcciones con Google Places
const GooglePlacesAutocomplete = ({ value, onChange, placeholder, className }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !inputRef.current) {
      return;
    }

    // Configurar Google Places Autocomplete
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['address'], // Solo direcciones
        componentRestrictions: { country: 'co' }, // Restringir a Colombia
        fields: ['formatted_address', 'geometry', 'name', 'place_id']
      }
    );

    // Listener para cuando se selecciona un lugar
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        onChange(place.formatted_address);
      }
    });

    return () => {
      if (window.google && window.google.maps && listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [onChange]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
    />
  );
};

export default function SedesTable() {
  const [sedes, setSedes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
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
    imagenUrl: null, // Para almacenar la URL de la imagen guardada
  });

  const fileInputRef = useRef(null);

  // Cargar Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setGoogleMapsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=TU_API_KEY_AQUI&libraries=places&language=es&region=CO`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setGoogleMapsLoaded(true);
      };
      
      script.onerror = () => {
        console.error('Error cargando Google Maps API');
        showNotification('Error al cargar el servicio de direcciones', 'error');
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

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
      imagenPreview: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validarFormulario = () => {
    const { nombre, Direccion, Telefono } = formData;

    if (!nombre.trim()) {
      showNotification("El nombre es obligatorio", "error");
      return false;
    }
    if (!Direccion.trim()) {
      showNotification("La dirección es obligatoria", "error");
      return false;
    }
    if (!Telefono.trim()) {
      showNotification("El teléfono es obligatorio", "error");
      return false;
    }

    // Validar formato de teléfono colombiano básico
    const telefonoRegex = /^[3][0-9]{9}$/;
    if (!telefonoRegex.test(Telefono.replace(/\s/g, ''))) {
      showNotification("Ingrese un número de teléfono colombiano válido (10 dígitos comenzando con 3)", "error");
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
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('Direccion', formData.Direccion);
      formDataToSend.append('Telefono', formData.Telefono);
      formDataToSend.append('activo', formData.activo);
      
      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }

      if (modalTipo === "agregar") {
        const nuevaSede = await sedeApiService.crearSede(formDataToSend);
        setSedes([...sedes, nuevaSede]);
        showNotification("Sede agregada exitosamente");
      } else if (modalTipo === "editar") {
        const sedeActualizada = await sedeApiService.actualizarSede(
          sedeSeleccionada.id,
          formDataToSend
        );
        const sedesActualizadas = sedes.map((s) =>
          s.id === sedeSeleccionada.id ? sedeActualizada : s
        );
        setSedes(sedesActualizadas);
        showNotification("Sede actualizada exitosamente");
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
        {formData.imagenPreview && (
          <div style={{ marginTop: '10px', textAlign: 'center', position: 'relative' }}>
            <img 
              src={formData.imagenPreview} 
              alt="Preview"
              style={{ 
                maxWidth: '200px', 
                maxHeight: '200px', 
                objectFit: 'cover',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }} 
              onLoad={(e) => {
                // Mejorar la carga de imágenes sin overlay negro
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
                right: 'calc(50% - 105px)',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '25px',
                height: '25px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.2s ease'
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
                  <label className="modal-label">Nombre:</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      handleInputChange("nombre", e.target.value)
                    }
                    className="modal-input"
                    placeholder="Ingrese el nombre de la sede"
                    maxLength="50"
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Dirección:</label>
                  {googleMapsLoaded ? (
                    <GooglePlacesAutocomplete
                      value={formData.Direccion}
                      onChange={(value) => handleInputChange("Direccion", value)}
                      placeholder="Busque y seleccione una dirección"
                      className="modal-input"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData.Direccion}
                      onChange={(e) =>
                        handleInputChange("Direccion", e.target.value)
                      }
                      className="modal-input"
                      placeholder="Cargando servicio de direcciones..."
                      disabled
                    />
                  )}
                </div>
                <div className="modal-field">
                  <label className="modal-label">Teléfono:</label>
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
                  <label className="modal-label">Nombre:</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      handleInputChange("nombre", e.target.value)
                    }
                    className="modal-input"
                    placeholder="Ingrese el nombre de la sede"
                    maxLength="50"
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Dirección:</label>
                  {googleMapsLoaded ? (
                    <GooglePlacesAutocomplete
                      value={formData.Direccion}
                      onChange={(value) => handleInputChange("Direccion", value)}
                      placeholder="Busque y seleccione una dirección"
                      className="modal-input"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData.Direccion}
                      onChange={(e) =>
                        handleInputChange("Direccion", e.target.value)
                      }
                      className="modal-input"
                      placeholder="Cargando servicio de direcciones..."
                    />
                  )}
                </div>
                <div className="modal-field">
                  <label className="modal-label">Teléfono:</label>
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
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const container = e.target.parentElement;
                          container.innerHTML = '<p style="color: #666; font-style: italic;">No se pudo cargar la imagen</p>';
                        }}
                      />
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