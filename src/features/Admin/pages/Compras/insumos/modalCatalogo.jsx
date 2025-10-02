import React, { useState } from "react";
import Modal from "../../../components/modal";
import insumoApiService from "../../../services/insumos";

export default function ModalCatalogo({ 
  cerrar, 
  showNotification, 
  insumoParaCatalogo, 
  tipoCatalogo 
}) {
  const [form, setForm] = useState({
    nombre: "",
    precioadicion: 0,
    estado: true,
  });

  const [errores, setErrores] = useState({
    nombre: "",
    precioadicion: "",
  });

  const validar = () => {
    let valido = true;
    let nuevosErrores = { nombre: "", precioadicion: "" };

    if (!form.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
      valido = false;
    } else if (form.nombre.length < 2) {
      nuevosErrores.nombre = "Debe tener al menos 2 caracteres";
      valido = false;
    }

    if (!form.precioadicion || isNaN(form.precioadicion) || Number(form.precioadicion) < 0) {
      nuevosErrores.precioadicion = "Debe ser un número mayor o igual a 0";
      valido = false;
    }

    setErrores(nuevosErrores);
    return valido;
  };

  const guardar = async () => {
    if (!validar()) return;

    try {
      const datos = {
        nombre: form.nombre.trim(),
        precioadicion: parseFloat(form.precioadicion),
        estado: form.estado,
        idinsumos: insumoParaCatalogo?.id || insumoParaCatalogo?.idinsumo,
      };

      await insumoApiService.crearCatalogo(tipoCatalogo, datos);

      showNotification(`Catálogo de ${tipoCatalogo} creado exitosamente`);
      cerrar();
    } catch (error) {
      showNotification("Error al guardar catálogo: " + error.message, "error");
    }
  };

  return (
    <Modal visible={true} onClose={cerrar}>
      <h2 className="modal-title">
        Crear {tipoCatalogo === "adicion" ? "Adición" : tipoCatalogo === "relleno" ? "Relleno" : "Sabor"}
      </h2>

      <div className="modal-body">
        <div className="modal-form-grid">
          <label>
            Nombre*
            <input
              name="nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className={`modal-input ${errores.nombre ? "input-invalid" : ""}`}
              placeholder="Ejemplo: Chocolate, Crema, Vainilla..."
            />
            {errores.nombre && <span className="error-message">{errores.nombre}</span>}
          </label>

          <label>
            Precio*
            <input
              type="number"
              name="precioadicion"
              value={form.precioadicion}
              onChange={(e) => setForm({ ...form, precioadicion: e.target.value })}
              className={`modal-input ${errores.precioadicion ? "input-invalid" : ""}`}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
            {errores.precioadicion && <span className="error-message">{errores.precioadicion}</span>}
          </label>

          <label style={{ marginTop: "10px" }}>
            Estado:
            <input
              type="checkbox"
              checked={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.checked })}
              style={{ marginLeft: "10px" }}
            />
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