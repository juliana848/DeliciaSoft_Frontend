import React from "react";
import DireccionAutocomplete from "./DireccionAutocomplete"; // Ajusta la ruta según tu estructura

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
        
        {!readOnly ? (
          <DireccionAutocomplete
            value={formData.Direccion}
            onChange={(valor) => onInputChange("Direccion", valor)}
            placeholder="Ej: Calle 10 #20-30 o Carrera 45 #67-89"
            disabled={readOnly}
            readOnly={readOnly}
          />
        ) : (
          <textarea
            value={formData.Direccion}
            className="modal-input"
            disabled
            readOnly
            style={{
              minHeight: "60px",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        )}
        
        {!readOnly && (
          <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "4px" }}>
            Formato válido: Calle/Carrera # Número-Número
            <br />
            <span style={{ color: "#10b981", fontWeight: "500" }}>
              💡 Escribe para ver sugerencias de direcciones reales
            </span>
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