import React, { useState, useEffect, useRef } from "react";
import Modal from "../../../components/modal";
import { InputSwitch } from "primereact/inputswitch";
import categoriaProductoApiService from "../../../services/categoriaProductosService";

export default function ModalCategoria({
  visible,
  onClose,
  onGuardar,
  tipo = "agregar", // 'agregar' o 'editar'
  categoria = null
}) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (tipo === "editar" && categoria) {
      setNombre(categoria.nombre);
      setDescripcion(categoria.descripcion);
      setActivo(categoria.activo);
      setPreviewImagen(categoria.imagen);
      setArchivoImagen(null);
    } else if (tipo === "agregar") {
      setNombre("");
      setDescripcion("");
      setActivo(true);
      setArchivoImagen(null);
      setPreviewImagen(null);
    }
    setMensajeExito("");
  }, [visible, tipo, categoria]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivoImagen(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImagen(ev.target.result);
    reader.readAsDataURL(file);
  };

  const limpiarImagen = () => {
    setArchivoImagen(null);
    setPreviewImagen(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) return setMensajeExito("❌ El nombre es obligatorio");
    if (!descripcion.trim()) return setMensajeExito("❌ La descripción es obligatoria");

    setLoading(true);
    try {
      let categoriaResult;

      if (tipo === "agregar") {
        categoriaResult = await categoriaProductoApiService.crearCategoria(
          { nombre, descripcion, estado: activo },
          archivoImagen
        );
        setMensajeExito("✅ Categoría creada exitosamente!");
      } else if (tipo === "editar" && categoria) {
        categoriaResult = await categoriaProductoApiService.actualizarCategoria(
          categoria.idcategoriaproducto,
          { nombre, descripcion, estado: activo },
          archivoImagen
        );
        setMensajeExito("✅ Categoría actualizada exitosamente!");
      }

      onGuardar(categoriaResult);

      // Cierra modal después de 1.2s
      setTimeout(() => {
        setMensajeExito("");
        onClose();
      }, 1200);
    } catch (error) {
      setMensajeExito("❌ Error al guardar categoría: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <h2 className="modal-title">{tipo === "agregar" ? "Agregar Categoría" : "Editar Categoría"}</h2>

      <div className="modal-body">
        {/* Mensaje de éxito/error */}
        {mensajeExito && (
          <div
            style={{
              marginBottom: "10px",
              color: mensajeExito.includes("❌") ? "red" : "green",
              fontWeight: "bold"
            }}
          >
            {mensajeExito}
          </div>
        )}

        {/* Nombre */}
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="modal-input"
            maxLength={20}
            style={{ width: "100%" }}
          />
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label>Descripción:</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="modal-input"
            rows={3}
            maxLength={50}
            style={{ width: "100%", resize: "none" }}
          />
        </div>

        {/* Imagen */}
        <div className="form-group">
          <label>Imagen (opcional):</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ marginTop: "0.5rem" }}
          />
          {previewImagen && (
            <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src={previewImagen}
                alt="Preview"
                style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover", border: "1px solid #ddd" }}
              />
              <button type="button" onClick={limpiarImagen}>Quitar</button>
            </div>
          )}
        </div>

        {/* Estado */}
        {tipo === "editar" && (
          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <InputSwitch checked={activo} onChange={(e) => setActivo(e.value)} />
            <span>{activo ? "Activo" : "Inactivo"}</span>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="modal-footer">
        <button className="modal-btn cancel-btn" onClick={onClose} disabled={loading}>Cancelar</button>
        <button className="modal-btn save-btn" onClick={handleGuardar} disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </Modal>
  );
}
