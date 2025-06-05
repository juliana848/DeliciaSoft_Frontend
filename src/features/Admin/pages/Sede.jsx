import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import "../adminStyles.css";
import Modal from "../components/modal";
import SearchBar from "../components/SearchBar";
import Notification from "../components/Notification";

export default function SedesTable() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    Direccion: "",
    Telefono: "",
    horarios: "",
    activo: true,
  });

  useEffect(() => {
    const mockUsuarios = [
      {
        id: 501,
        nombre: "San Pablo",
        Direccion: "Cra.37# 97-27",
        Telefono: "325888960",
        horarios: "10:00am - 5:30pm",
        activo: true,
      },
      {
        id: 502,
        nombre: "San Benito",
        Direccion: "Cra.57# 51-83",
        Telefono: "3107412156",
        horarios: "10:00am - 5:30pm",
        activo: true,
      },
    ];
    setUsuarios(mockUsuarios);
  }, []);

  const toggleActivo = (usuario) => {
    const updated = usuarios.map((usr) =>
      usr.id === usuario.id ? { ...usr, activo: !usr.activo } : usr
    );
    setUsuarios(updated);
    showNotification(
      `Sede ${usuario.activo ? "desactivada" : "activada"} exitosamente`
    );
  };

  const showNotification = (mensaje, tipo = "success") => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: "", tipo: "success" });
  };

  const abrirModal = (tipo, usuario = null) => {
    setModalTipo(tipo);
    setUsuarioSeleccionado(usuario);

    if (tipo === "agregar") {
      setFormData({
        id: "",
        nombre: "",
        Direccion: "",
        Telefono: "",
        horarios: "",
        activo: true,
      });
    } else if (tipo === "editar" && usuario) {
      setFormData({ ...usuario });
    }

    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setUsuarioSeleccionado(null);
    setModalTipo(null);
    setFormData({
      id: "",
      nombre: "",
      Direccion: "",
      Telefono: "",
      horarios: "",
      activo: true,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validarFormulario = () => {
    const { nombre, Direccion, Telefono, horarios } = formData;

    if (!nombre.trim()) {
      showNotification("El nombre es obligatorio", "error");
      return false;
    }
    if (!Direccion.trim()) {
      showNotification("La dirección es obligatoria", "error");
      return false;
    }
    if (!Telefono.trim()) {
      showNotification("El teléfono es obligatorio", "error");
      return false;
    }
    if (!horarios.trim()) {
      showNotification("El horario es obligatorio", "error");
      return false;
    }

    return true;
  };

  const guardarUsuario = () => {
    if (!validarFormulario()) return;

    if (modalTipo === "agregar") {
      const nuevoId = usuarios.length
        ? Math.max(...usuarios.map((u) => u.id)) + 1
        : 1;
      const nuevoUsuario = {
        ...formData,
        id: nuevoId,
      };

      setUsuarios([...usuarios, nuevoUsuario]);
      showNotification("Sede agregada exitosamente");
    } else if (modalTipo === "editar") {
      const updated = usuarios.map((usr) =>
        usr.id === usuarioSeleccionado.id ? { ...usr, ...formData } : usr
      );
      setUsuarios(updated);
      showNotification("Sede actualizada exitosamente");
    }

    cerrarModal();
  };

  const confirmarEliminar = () => {
    const updated = usuarios.filter((usr) => usr.id !== usuarioSeleccionado.id);
    setUsuarios(updated);
    cerrarModal();
    showNotification("Sede eliminada exitosamente");
  };

  const usuariosFiltrados = usuarios.filter(
    (usr) =>
      usr.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      usr.Direccion.toLowerCase().includes(filtro.toLowerCase()) ||
      usr.Telefono.toLowerCase().includes(filtro.toLowerCase()) ||
      usr.horarios.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="admin-wrapper">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <div className="admin-toolbar">
        <button
          className="admin-button pink"
          onClick={() => abrirModal("agregar")}
          type="button"
        >
          + Agregar Sede
        </button>
        <SearchBar
          placeholder="Buscar sede..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <DataTable
        value={usuariosFiltrados}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column field="id" header="ID" />
        <Column field="nombre" header="Nombre" />
        <Column field="Direccion" header="Dirección" />
        <Column field="Telefono" header="Teléfono" />
        <Column field="horarios" header="Horarios" />
        <Column
          header="Estado"
          body={(rowData) => (
            <InputSwitch
              checked={rowData.activo}
              onChange={() => toggleActivo(rowData)}
            />
          )}
        />
        <Column
          header="Acciones"
          body={(rowData) => (
            <>
              <button
                className="admin-button yellow"
                title="Editar"
                onClick={() => abrirModal("editar", rowData)}
              >
                ✏️
              </button>
              <button
                className="admin-button red"
                title="Eliminar"
                onClick={() => abrirModal("eliminar", rowData)}
              >
                🗑️
              </button>
            </>
          )}
        />
      </DataTable>

      {modalVisible && (modalTipo === "agregar" || modalTipo === "editar") && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">
            {modalTipo === "agregar" ? "Agregar Sede" : "Editar Sede"}
          </h2>
          <div className="modal-body">
            <div className="modal-grid">
              <div className="modal-field">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  className="modal-input"
                />
              </div>
              <div className="modal-field">
                <label>Dirección:</label>
                <input
                  type="text"
                  value={formData.Direccion}
                  onChange={(e) =>
                    handleInputChange("Direccion", e.target.value)
                  }
                  className="modal-input"
                />
              </div>
              <div className="modal-field">
                <label>Teléfono:</label>
                <input
                  type="text"
                  value={formData.Telefono}
                  onChange={(e) =>
                    handleInputChange("Telefono", e.target.value)
                  }
                  className="modal-input"
                />
              </div>
              <div className="modal-field">
                <label>Horarios:</label>
                <input
                  type="text"
                  value={formData.horarios}
                  onChange={(e) =>
                    handleInputChange("horarios", e.target.value)
                  }
                  className="modal-input"
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="admin-button green" onClick={guardarUsuario}>
              Guardar
            </button>
            <button className="admin-button gray" onClick={cerrarModal}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {modalVisible && modalTipo === "eliminar" && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Confirmar Eliminación</h2>
          <p>
            ¿Estás seguro de eliminar la sede "{usuarioSeleccionado?.nombre}"?
          </p>
          <div className="modal-footer">
            <button className="admin-button red" onClick={confirmarEliminar}>
              Eliminar
            </button>
            <button className="admin-button gray" onClick={cerrarModal}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}