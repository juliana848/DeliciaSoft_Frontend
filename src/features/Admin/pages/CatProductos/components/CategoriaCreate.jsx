import React, { useState, useEffect, useRef } from "react";
import Modal from "../../../components/modal";
import { InputSwitch } from "primereact/inputswitch";
import categoriaProductoApiService from "../../../services/categoriaProductosService";
import Notification from "../../../components/Notification";

export default function ModalCategoriaMini({
  visible,
  onClose,
  onGuardar,
  tipo = "agregar",
  categoria = null
}) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [notification, setNotification] = useState({ visible: false, mensaje: "", tipo: "success" });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (tipo === "editar" && categoria) {
      setNombre(categoria.nombre);
      setDescripcion(categoria.descripcion);
      setActivo(categoria.activo);
      setPreviewImagen(categoria.imagen);
      setArchivoImagen(null);
    } else {
      setNombre("");
      setDescripcion("");
      setActivo(true);
      setArchivoImagen(null);
      setPreviewImagen(null);
    }
    setNotification({ visible: false, mensaje: "", tipo: "success" });
  }, [visible, tipo, categoria]);

  const showNotification = (mensaje, tipo = "success") =>
    setNotification({ visible: true, mensaje, tipo });

  const hideNotification = () =>
    setNotification({ visible: false, mensaje: "", tipo: "success" });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      categoriaProductoApiService.validarArchivoImagen(file);
      setArchivoImagen(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewImagen(ev.target.result);
      reader.readAsDataURL(file);
    } catch (err) {
      showNotification(err.message || err, "error");
      e.target.value = "";
    }
  };

  const limpiarImagen = () => {
    setArchivoImagen(null);
    setPreviewImagen(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validar = () => {
    if (!nombre.trim()) {
      showNotification("El nombre es obligatorio", "error");
      return false;
    }
    if (nombre.length > 20) {
      showNotification("El nombre no puede tener más de 20 caracteres", "error");
      return false;
    }
    if (!descripcion.trim()) {
      showNotification("La descripción es obligatoria", "error");
      return false;
    }
    if (descripcion.length > 50) {
      showNotification("La descripción no puede tener más de 50 caracteres", "error");
      return false;
    }
    return true;
  };

  const handleGuardar = async () => {
    if (!validar()) return;

    setLoading(true);
    try {
      let result;
      const payload = { nombre, descripcion, estado: activo };

      if (tipo === "agregar") {
        result = await categoriaProductoApiService.crearCategoria(payload, archivoImagen);
        showNotification("✅ Categoría creada exitosamente");
      } else if (tipo === "editar" && categoria) {
        result = await categoriaProductoApiService.actualizarCategoria(
          categoria.idcategoriaproducto,
          payload,
          archivoImagen
        );
        showNotification("✅ Categoría actualizada exitosamente");
      }

      setTimeout(() => {
        onGuardar(result);
        onClose();
      }, 1200);
    } catch (err) {
      showNotification("❌ Error al guardar categoría: " + (err.message || err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <Notification {...notification} onClose={hideNotification} />

      <h2 className="modal-title">
        {tipo === "agregar" ? "Agregar Categoría" : "Editar Categoría"}
      </h2>

      <div className="modal-body">
        <div className="form-group">
          <label>Nombre <span style={{ color: "red" }}>*</span></label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={20}
            className="modal-input"
            placeholder="Ej: Postres"
          />
          <small>{nombre.length}/20 caracteres</small>
        </div>

        <div className="form-group">
          <label>Descripción <span style={{ color: "red" }}>*</span></label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            maxLength={50}
            className="modal-input"
            placeholder="Ej: Productos dulces y fríos"
            style={{ resize: "none" }}
          />
          <small>{descripcion.length}/50 caracteres</small>
        </div>

        <div className="form-group">
          <label>Imagen (opcional)</label>
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

        {tipo === "editar" && (
          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <InputSwitch checked={activo} onChange={(e) => setActivo(e.value)} />
            <span>{activo ? "Activo" : "Inactivo"}</span>
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button className="modal-btn cancel-btn" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button className="modal-btn save-btn" onClick={handleGuardar} disabled={loading}>
          {loading ? "Guardando..." : "💾 Guardar"}
        </button>
      </div>
    </Modal>
  );
}
