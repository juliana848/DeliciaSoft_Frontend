import React from "react";
import Modal from "../../../components/modal";
import SedeFormFields from "./SedeFormFields";

export default function SedeModal({
  visible,
  tipo,
  sede,
  formData,
  loading,
  fileInputRef,
  onClose,
  onInputChange,
  onImageChange,
  onEliminarImagen,
  onGuardar,
  onConfirmarEliminar,
}) {
  if (!visible) return null;

  switch (tipo) {
    case "agregar":
      return (
        <Modal visible={visible} onClose={onClose}>
          <div className="modal-header">
            <h2 className="modal-title">Agregar Sede</h2>
          </div>
          <div className="modal-body">
            <SedeFormFields
              formData={formData}
              fileInputRef={fileInputRef}
              onInputChange={onInputChange}
              onImageChange={onImageChange}
              onEliminarImagen={onEliminarImagen}
              readOnly={false}
            />
          </div>
          <div className="modal-footer mt-2 flex justify-end gap-2">
            <button
              className="modal-btn cancel-btn text-sm px-3 py-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className="modal-btn save-btn text-sm px-3 py-1"
              onClick={onGuardar}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </Modal>
      );

    case "editar":
      return (
        <Modal visible={visible} onClose={onClose}>
          <div className="modal-header">
            <h2 className="modal-title">Editar Sede</h2>
          </div>
          <div className="modal-body">
            <SedeFormFields
              formData={formData}
              fileInputRef={fileInputRef}
              onInputChange={onInputChange}
              onImageChange={onImageChange}
              onEliminarImagen={onEliminarImagen}
              readOnly={false}
            />
          </div>
          <div className="modal-footer mt-2 flex justify-end gap-2">
            <button
              className="modal-btn cancel-btn text-sm px-3 py-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className="modal-btn save-btn text-sm px-3 py-1"
              onClick={onGuardar}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Actualizar"}
            </button>
          </div>
        </Modal>
      );

    case "ver":
      return (
        <Modal visible={visible} onClose={onClose}>
          <div className="modal-header">
            <h2 className="modal-title">Detalle de Sede</h2>
          </div>
          <div className="modal-body">
            <div className="modal-grid">
              <div className="modal-field">
                <label className="modal-label">Nombre:</label>
                <input
                  type="text"
                  value={sede?.nombre || ""}
                  className="modal-input"
                  disabled
                  readOnly
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Dirección:</label>
                <textarea
                  value={sede?.Direccion || ""}
                  className="modal-input"
                  disabled
                  readOnly
                  style={{
                    minHeight: "60px",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Teléfono:</label>
                <input
                  type="text"
                  value={sede?.Telefono || ""}
                  className="modal-input"
                  disabled
                  readOnly
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Estado:</label>
                <input
                  type="text"
                  value={sede?.activo ? "Activo" : "Inactivo"}
                  className="modal-input"
                  disabled
                  readOnly
                  style={{
                    color: sede?.activo ? "#10b981" : "#ef4444",
                    fontWeight: "500",
                  }}
                />
              </div>
              {sede?.imagenUrl && (
                <div className="modal-field" style={{ gridColumn: "span 2" }}>
                  <label className="modal-label">Imagen:</label>
                  <div className="sede-image-container">
                    <img
                      src={sede.imagenUrl}
                      alt={`Imagen de ${sede.nombre}`}
                      className="sede-image-preview"
                      onError={(e) => {
                        e.target.style.display = "none";
                        const container = e.target.parentElement;
                        container.innerHTML =
                          '<p class="sede-image-error">No se pudo cargar la imagen</p>';
                      }}
                    />
                  </div>
                </div>
              )}
              {!sede?.imagenUrl && (
                <div className="modal-field" style={{ gridColumn: "span 2" }}>
                  <label className="modal-label">Imagen:</label>
                  <div className="sede-no-image">No hay imagen disponible</div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer mt-2 flex justify-end gap-2">
            <button
              className="modal-btn cancel-btn text-sm px-3 py-1"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </Modal>
      );

    case "eliminar":
  return (
    <Modal visible={visible} onClose={onClose} width="450px">
      <div className="modal-header">
        <h2 className="modal-title">Confirmar Eliminación</h2>
      </div>
      <div className="modal-body">
        <div className="modal-confirmation-compact">
          <p className="confirmation-text-compact">
            ¿Estás seguro de que deseas eliminar la sede{" "}
            <strong>"{sede?.nombre}"</strong>?
          </p>
          <div className="confirmation-warning-compact">
            Esta acción no se puede deshacer.
          </div>
        </div>
      </div>
      <div className="modal-footer mt-2 flex justify-end gap-2">
        <button
          className="modal-btn cancel-btn text-sm px-3 py-1"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          className="modal-btn save-btn text-sm px-3 py-1"
          onClick={onConfirmarEliminar}
          disabled={loading}
          style={{ backgroundColor: "#ef4444" }}
        >
          {loading ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </Modal>
      );

    default:
      return null;
  }
}