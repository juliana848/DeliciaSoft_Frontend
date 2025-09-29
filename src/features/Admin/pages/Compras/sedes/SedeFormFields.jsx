import React from "react";

export default function SedeFormFields({
  formData,
  fileInputRef,
  onInputChange,
  onImageChange,
  onEliminarImagen,
  readOnly = false,
}) {
  return (
    <div className="modal-grid">
      <div className="modal-field">
        <label className="modal-label">
          Nombre: {!readOnly && <span style={{ color: "red" }}>*</span>}
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => onInputChange("nombre", e.target.value)}
          className="modal-input"
          placeholder="Ingrese el nombre de la sede"
          maxLength="50"
          required
          disabled={readOnly}
          readOnly={readOnly}
        />
        {!readOnly && (
          <small style={{ color: "#666", fontSize: "12px" }}>
            Mínimo 2 caracteres, máximo 50
          </small>
        )}
      </div>

      <div className="modal-field">
        <label className="modal-label">
          Dirección: {!readOnly && <span style={{ color: "red" }}>*</span>}
        </label>
        <textarea
          value={formData.Direccion}
          onChange={(e) => onInputChange("Direccion", e.target.value)}
          className="modal-input"
          placeholder="Ingrese la dirección completa de la sede"
          required
          disabled={readOnly}
          readOnly={readOnly}
          style={{
            minHeight: "60px",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
        {!readOnly && (
          <small style={{ color: "#666", fontSize: "12px" }}>
            Mínimo 10 caracteres
          </small>
        )}
      </div>

      <div className="modal-field">
        <label className="modal-label">
          Teléfono: {!readOnly && <span style={{ color: "red" }}>*</span>}
        </label>
        <input
          type="tel"
          value={formData.Telefono}
          onChange={(e) => {
            const valor = e.target.value.replace(/\D/g, "");
            if (valor.length <= 10) {
              onInputChange("Telefono", valor);
            }
          }}
          className="modal-input"
          placeholder="3001234567"
          maxLength="10"
          required
          disabled={readOnly}
          readOnly={readOnly}
        />
        {!readOnly && (
          <small style={{ color: "#666", fontSize: "12px" }}>
            Formato: 10 dígitos comenzando con 3
          </small>
        )}
      </div>

      {!readOnly && (
        <div className="modal-field" style={{ gridColumn: "span 2" }}>
          <label className="modal-label">Imagen:</label>
          <div style={{ marginTop: "8px" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="modal-input"
              style={{ marginBottom: "10px" }}
            />
            <small
              style={{
                color: "#666",
                fontSize: "12px",
                display: "block",
                marginBottom: "10px",
              }}
            >
              Formatos permitidos: JPEG, PNG, GIF, WebP. Tamaño máximo: 5MB
            </small>
            {formData.imagenPreview && (
              <div className="sede-image-upload-container">
                <img
                  src={formData.imagenPreview}
                  alt="Preview"
                  className="sede-image-upload-preview"
                  style={{ opacity: 1 }}
                />
                <button
                  type="button"
                  onClick={onEliminarImagen}
                  className="sede-image-delete-btn"
                  title="Eliminar imagen"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}