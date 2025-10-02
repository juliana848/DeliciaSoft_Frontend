import React, { useState, useEffect } from "react";
import SearchBar from "../../../components/SearchBar";
import Notification from "../../../components/Notification";
import LoadingSpinner from "../../../components/LoadingSpinner";
import SedeTable from "./SedeTable";
import SedeModal from "./SedeModal";
import useSedeOperations from "./hooks/useSedeOperations";
import "./sedeStyles.css";
import "../../../../Admin/adminStyles.css";

export default function SedesPage() {
  const [filtro, setFiltro] = useState("");
  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });

  const {
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
  } = useSedeOperations(showNotification);

  useEffect(() => {
    cargarSedes();
  }, []);

  function showNotification(mensaje, tipo = "success") {
    setNotification({ visible: true, mensaje, tipo });
  }

  function hideNotification() {
    setNotification({ visible: false, mensaje: "", tipo: "success" });
  }

  const sedesFiltradas = sedes.filter(
    (sede) =>
      sede.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      sede.Direccion.toLowerCase().includes(filtro.toLowerCase()) ||
      sede.Telefono.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="admin-wrapper">
      {loading && <LoadingSpinner mensaje="Procesando..." fullScreen={true} />}
      
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

      <SedeTable
        sedes={sedesFiltradas}
        loading={loading}
        onToggleActivo={toggleActivo}
        onVerSede={(sede) => abrirModal("ver", sede)}
        onEditarSede={(sede) => abrirModal("editar", sede)}
        onEliminarSede={(sede) => abrirModal("eliminar", sede)}
      />

      <SedeModal
        visible={modalVisible}
        tipo={modalTipo}
        sede={sedeSeleccionada}
        formData={formData}
        loading={loading}
        fileInputRef={fileInputRef}
        onClose={cerrarModal}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
        onEliminarImagen={eliminarImagen}
        onGuardar={guardarSede}
        onConfirmarEliminar={confirmarEliminar}
      />
    </div>
  );
}