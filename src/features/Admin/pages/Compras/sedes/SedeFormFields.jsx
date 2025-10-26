import React, { useRef } from "react";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

const libraries = ["places"];

export default function SedeFormFields({
  formData,
  fileInputRef,
  onInputChange,
  onImageChange,
  onEliminarImagen,
  readOnly = false,
}) {
  // 🚀 Carga de Google Places API (compatible con Vite)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const autocompleteRef = useRef(null);

  const onLoad = (auto) => {
    autocompleteRef.current = auto;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        // ✂️ Corta la dirección a 30 caracteres para cumplir con tu BD
        const direccionCorta = place.formatted_address.slice(0, 30);
        onInputChange("Direccion", direccionCorta);

        // Si luego quieres guardar coordenadas o place_id, descomenta:
        // const lat = place.geometry?.location?.lat();
        // const lng = place.geometry?.location?.lng();
        // onInputChange("Latitud", lat);
        // onInputChange("Longitud", lng);
        // onInputChange("PlaceId", place.place_id);
      }
    }
  };

  return (
    <div className="modal-grid">
      {/* Nombre */}
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

      {/* Dirección con Autocomplete de Google */}
      <div className="modal-field">
        <label className="modal-label">
          Dirección: {!readOnly && <span style={{ color: "red" }}>*</span>}
        </label>

        {!readOnly ? (
          isLoaded ? (
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
              <input
                type="text"
                value={formData.Direccion}
                onChange={(e) =>
                  onInputChange("Direccion", e.target.value.slice(0, 30))
                }
                className="modal-input"
                placeholder="Busca una dirección válida..."
                maxLength={30}
                disabled={readOnly}
                readOnly={readOnly}
              />
            </Autocomplete>
          ) : (
            <input
              type="text"
              value={formData.Direccion}
              onChange={(e) =>
                onInputChange("Direccion", e.target.value.slice(0, 30))
              }
              className="modal-input"
              placeholder="Dirección completa"
              maxLength={30}
              disabled={readOnly}
              readOnly={readOnly}
            />
          )
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
          <small
            style={{
              color: "#666",
              fontSize: "12px",
              display: "block",
              marginTop: "4px",
            }}
          >
            💡 Escribe para ver sugerencias de direcciones reales (Google Maps)
          </small>
        )}
      </div>

      {/* Teléfono */}
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

      {/* Imagen */}
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
