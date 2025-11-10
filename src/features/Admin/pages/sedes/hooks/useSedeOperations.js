import { useState, useRef } from "react";
import sedeApiService from "../../../services/sedes_services";
import { validarDireccionMedellin, normalizarDireccion } from "./validadorDirecciones";


export default function useSedeOperations(showNotification) {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const cargarSedes = async () => {
    try {
      setLoading(true);
      const sedesData = await sedeApiService.obtenerSedes();
      setSedes(sedesData);
    } catch (error) {
      console.error("Error al cargar sedes:", error);
      showNotification("Error al cargar las sedes", "error");
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
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        showNotification(
          "Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)",
          "error"
        );
        e.target.value = "";
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showNotification(
          "El archivo es demasiado grande. Máximo 5MB permitido",
          "error"
        );
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          imagen: file,
          imagenPreview: event.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const eliminarImagen = () => {
    setFormData((prev) => ({
      ...prev,
      imagen: null,
      imagenPreview: null,
      imagenUrl: modalTipo === "editar" ? null : prev.imagenUrl,
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

    // Validación mejorada de dirección
    const validacionDireccion = validarDireccionMedellin(Direccion.trim());
    if (!validacionDireccion.valida) {
      showNotification(validacionDireccion.mensaje, "error");
      return false;
    }

    if (!Telefono.trim()) {
      showNotification("El teléfono es obligatorio", "error");
      return false;
    }

    const telefonoLimpio = Telefono.replace(/\s/g, "");
    const telefonoRegex = /^3[0-9]{9}$/;

    if (!telefonoRegex.test(telefonoLimpio)) {
      showNotification(
        "Ingrese un número de teléfono colombiano válido (10 dígitos comenzando con 3)",
        "error"
      );
      return false;
    }

    const sedeExistente = sedes.find(
      (sede) =>
        sede.nombre.toLowerCase().trim() === nombre.toLowerCase().trim() &&
        sede.id !== (sedeSeleccionada?.id || 0)
    );

    if (sedeExistente) {
      showNotification("Ya existe una sede con este nombre", "error");
      return false;
    }

    const telefonoExistente = sedes.find(
      (sede) =>
        sede.Telefono === telefonoLimpio &&
        sede.id !== (sedeSeleccionada?.id || 0)
    );

    if (telefonoExistente) {
      showNotification(
        "Ya existe una sede con este número de teléfono",
        "error"
      );
      return false;
    }

    return true;
  };

  const guardarSede = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("nombre", formData.nombre.trim());
      formDataToSend.append("direccion", formData.Direccion.trim());
      formDataToSend.append("telefono", formData.Telefono.replace(/\s/g, ""));
      formDataToSend.append("estado", formData.activo ? "true" : "false");

      if (formData.imagen) {
        formDataToSend.append("imagen", formData.imagen);
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

      cerrarModal();
    } catch (error) {
      console.error("Error al guardar sede:", error);
      showNotification(error.message || "Error al guardar la sede", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminar = async () => {
    try {
      setLoading(true);
      await sedeApiService.eliminarSede(sedeSeleccionada.id);

      const sedesActualizadas = sedes.filter(
        (s) => s.id !== sedeSeleccionada.id
      );
      setSedes(sedesActualizadas);

      cerrarModal();
      showNotification("Sede eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar sede:", error);
      
      const mensajeError = error.message || "Error al eliminar la sede";
      showNotification(mensajeError, "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    sedes,
    loading,
    modalVisible,
    modalTipo,
    sedeSeleccionada,
    formData,
    fileInputRef,
    cargarSedes,
    toggleActivo,
    abrirModal,
    cerrarModal,
    handleInputChange,
    handleImageChange,
    eliminarImagen,
    guardarSede,
    confirmarEliminar,
  };
}