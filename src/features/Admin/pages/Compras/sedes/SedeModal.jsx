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
        <Modal visible={visible} onClose={onClose} width="400px">
          <div style={{ 
            borderBottom: "1px solid #e5e7eb",
            padding: "16px 24px"
          }}>
            <h2 style={{ 
              fontSize: "18px", 
              fontWeight: "600",
              margin: 0,
              color: "#111827"
            }}>
              Confirmar Eliminación
            </h2>
          </div>
          
          <div style={{ padding: "20px 24px" }}>
            <p style={{ 
              fontSize: "14px", 
              color: "#374151", 
              marginBottom: "16px",
              lineHeight: "1.6",
              margin: "0 0 16px 0"
            }}>
              ¿Seguro que quieres eliminar la categoría{" "}
              <strong style={{ color: "#ec4899" }}>"{sede?.nombre}"</strong>?
            </p>
            <div style={{
              fontSize: "13px",
              color: "#991b1b",
              fontStyle: "italic",
              backgroundColor: "#fef2f2",
              padding: "10px 12px",
              borderRadius: "4px",
              borderLeft: "3px solid #ef4444"
            }}>
              Esta acción no se puede deshacer.
            </div>
          </div>
          
          <div style={{ 
            padding: "16px 24px", 
            display: "flex", 
            justifyContent: "flex-end", 
            gap: "12px",
            borderTop: "1px solid #e5e7eb"
          }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "8px 20px",
                fontSize: "14px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "500",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => {
                if (!loading) e.target.style.backgroundColor = "#e5e7eb";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#f3f4f6";
              }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmarEliminar}
              disabled={loading}
              style={{
                padding: "8px 20px",
                fontSize: "14px",
                backgroundColor: "#ec4899",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "500",
                transition: "background-color 0.2s",
                opacity: loading ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                if (!loading) e.target.style.backgroundColor = "#db2777";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#ec4899";
              }}
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