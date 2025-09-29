import React, { useState } from "react";
import Modal from "../../../components/modal";
import categoriaInsumoApiService from "../../../services/categoriainsumos";

export default function ModalCategoria({ cerrar, showNotification, cargarCategorias }) {
  const [form, setForm] = useState({
    nombreCategoria: "",
    descripcion: "",
  });

  const [errores, setErrores] = useState({
    nombreCategoria: "",
    descripcion: "",
  });

  const validar = () => {
    let valido = true;
    let nuevosErrores = { nombreCategoria: "", descripcion: "" };

    if (!form.nombreCategoria.trim()) {
      nuevosErrores.nombreCategoria = "El nombre es obligatorio";
      valido = false;
    } else if (form.nombreCategoria.length < 3) {
      nuevosErrores.nombreCategoria = "Debe tener al menos 3 caracteres";
      valido = false;
    }

    if (!form.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es obligatoria";
      valido = false;
    } else if (form.descripcion.length < 10) {
      nuevosErrores.descripcion = "Debe tener al menos 10 caracteres";
      valido = false;
    }

    setErrores(nuevosErrores);
    return valido;
  };

  const guardar = async () => {
    if (!validar()) return;

    try {
      const nuevaCategoria = {
        nombreCategoria: form.nombreCategoria,
        descripcion: form.descripcion,
        estado: true,
      };

      await categoriaInsumoApiService.crearCategoria(nuevaCategoria);
      showNotification("Categoría creada exitosamente");
      await cargarCategorias();
      cerrar();
    } catch (error) {
      showNotification("Error al crear categoría: " + error.message, "error");
    }
  };

  return (
    <Modal visible={true} onClose={cerrar}>
      <h2 className="modal-title">Agregar Nueva Categoría</h2>

      <div className="modal-body">
        <div className="modal-form-grid">
          <label>
            Nombre*
            <input
              name="nombreCategoria"
              value={form.nombreCategoria}
              onChange={(e) => setForm({ ...form, nombreCategoria: e.target.value })}
              className={`modal-input ${errores.nombreCategoria ? "input-invalid" : ""}`}
            />
            {errores.nombreCategoria && (
              <span className="error-message">{errores.nombreCategoria}</span>
            )}
          </label>

          <label>
            Descripción*
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className={`modal-input ${errores.descripcion ? "input-invalid" : ""}`}
              rows={3}
            />
            {errores.descripcion && (
              <span className="error-message">{errores.descripcion}</span>
            )}
          </label>
        </div>
      </div>

      <div className="modal-footer">
        <button className="modal-btn cancel-btn" onClick={cerrar}>
          Cancelar
        </button>
        <button className="modal-btn save-btn" onClick={guardar}>
          Guardar
        </button>
      </div>
    </Modal>
  );
}
