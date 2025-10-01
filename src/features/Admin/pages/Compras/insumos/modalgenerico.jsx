import React from "react";
import Modal from "../../../components/modal";
import '../../Compras/comprasCrud/styles/ProveedorAutocomplete.css'

export default function ModalGenerico({ visible = false, titulo = "Mensaje", mensaje = "", cerrar, onConfirmar }) {
  return (
    <Modal visible={visible} onClose={cerrar}>
      <h2 className="modal-title">{titulo}</h2>

      <div className="modal-body">
        <p>{mensaje}</p>
      </div>

      <div className="modal-footer">
        <button className="modal-btn cancel-btn" onClick={cerrar}>
          Cerrar
        </button>
        {onConfirmar && (
          <button
            className="modal-btn save-btn"
            onClick={() => {
              onConfirmar();
              cerrar();
            }}
          >
            Confirmar
          </button>
        )}
      </div>
    </Modal>
  );
}
