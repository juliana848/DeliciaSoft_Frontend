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
    activo: true,
  });

  useEffect(() => {
    const mockUsuarios = [
      {
        id: 501,
        nombre: "San Pablo",
        Direccion: "Cra.37# 97-27",
        Telefono: "325888960",
        activo: true,
      },
      {
        id: 502,
        nombre: "San Benito",
        Direccion: "Cra.57# 51-83",
        Telefono: "3107412156",
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
      activo: true,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validarFormulario = () => {
    const { nombre, Direccion, Telefono } = formData;

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
      usr.Telefono.toLowerCase().includes(filtro.toLowerCase())
  );

  const renderModal = () => {
    if (!modalVisible) return null;

    switch (modalTipo) {
      case "agregar":
        return (
          <Modal visible={modalVisible} onClose={cerrarModal}>
            <div className="modal-header">
              <h2 className="modal-title">Agregar Sede</h2>
            </div>
            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Nombre:</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      handleInputChange("nombre", e.target.value)
                    }
                    className="modal-input"
                    placeholder="Ingrese el nombre de la sede"
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Dirección:</label>
                  <input
                    type="text"
                    value={formData.Direccion}
                    onChange={(e) =>
                      handleInputChange("Direccion", e.target.value)
                    }
                    className="modal-input"
                    placeholder="Ingrese la dirección"
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Teléfono:</label>
                  <input
                    type="text"
                    value={formData.Telefono}
                    onChange={(e) =>
                      handleInputChange("Telefono", e.target.value)
                    }
                    className="modal-input"
                    placeholder="Ingrese el teléfono"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer mt-2 flex justify-end gap-2">
              <button
                className="modal-btn cancel-btn text-sm px-3 py-1"
                onClick={cerrarModal}
              >
                Cancelar
              </button>
              <button
                className="modal-btn save-btn text-sm px-3 py-1"
                onClick={guardarUsuario}
              >
                Guardar
              </button>
            </div>
          </Modal>
        );

      case "editar":
        return (
          <Modal visible={modalVisible} onClose={cerrarModal}>
            <div className="modal-header">
              <h2 className="modal-title">Editar Sede</h2>
            </div>
            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-field">
                  <label className="modal-label">Nombre:</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      handleInputChange("nombre", e.target.value)
                    }
                    className="modal-input"
                    placeholder="Ingrese el nombre de la sede"
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Dirección:</label>
                  <input
                    type="text"
                    value={formData.Direccion}
                    onChange={(e) =>
                      handleInputChange("Direccion", e.target.value)
                    }
                    className="modal-input"
                    placeholder="Ingrese la dirección"
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Teléfono:</label>
                  <input
                    type="text"
                    value={formData.Telefono}
                    onChange={(e) =>
                      handleInputChange("Telefono", e.target.value)
                    }
                    className="modal-input"
                    placeholder="Ingrese el teléfono"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer mt-2 flex justify-end gap-2">
              <button
                className="modal-btn cancel-btn text-sm px-3 py-1"
                onClick={cerrarModal}
              >
                Cancelar
              </button>
              <button
                className="modal-btn save-btn text-sm px-3 py-1"
                onClick={guardarUsuario}
              >
                Guardar
              </button>
            </div>
          </Modal>
        );

      case "ver":
        return (
          <Modal visible={modalVisible} onClose={cerrarModal}>
            <div className="modal-header">
              <h2 className="modal-title">Detalles de la Sede</h2>
            </div>
            <div className="modal-body">
              <div className="modal-details">
                <div className="detail-row">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">
                    {usuarioSeleccionado?.id}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Nombre:</span>
                  <span className="detail-value">
                    {usuarioSeleccionado?.nombre}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Dirección:</span>
                  <span className="detail-value">
                    {usuarioSeleccionado?.Direccion}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Teléfono:</span>
                  <span className="detail-value">
                    {usuarioSeleccionado?.Telefono}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Estado:</span>
                  <span
                    className={`detail-value status ${
                      usuarioSeleccionado?.activo ? "active" : "inactive"
                    }`}
                  >
                    {usuarioSeleccionado?.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer mt-2 flex justify-end gap-2">
              <button
                className="modal-btn cancel-btn text-sm px-3 py-1"
                onClick={cerrarModal}
              >
                Cerrar
              </button>
            </div>
          </Modal>
        );

      case "eliminar":
        return (
          <Modal visible={modalVisible} onClose={cerrarModal}>
            <div className="modal-header">
              <h2 className="modal-title">Confirmar Eliminación</h2>
            </div>
            <div className="modal-body">
              <div className="modal-confirmation">
                <div className="confirmation-icon">
                  <i className="pi pi-exclamation-triangle"></i>
                </div>
                <p className="confirmation-text">
                  ¿Estás seguro de que deseas eliminar la sede{" "}
                  <strong>"{usuarioSeleccionado?.nombre}"</strong>?
                </p>
                <p className="confirmation-warning">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="modal-footer mt-2 flex justify-end gap-2">
              <button
                className="modal-btn cancel-btn text-sm px-3 py-1"
                onClick={cerrarModal}
              >
                Cancelar
              </button>
              <button
                className="modal-btn save-btn text-sm px-3 py-1"
                onClick={confirmarEliminar}
              >
                Eliminar
              </button>
            </div>
          </Modal>
        );

      default:
        return null;
    }
  };

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
          style={{ padding: "10px 18px", fontSize: "15px", fontWeight: "500" }}
        >
          + Agregar
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
        emptyMessage="No se encontraron sedes"
      >
        <Column field="id" header="ID" />
        <Column field="nombre" header="Nombre" />
        <Column field="Direccion" header="Dirección" />
        <Column field="Telefono" header="Teléfono" />
        <Column
          header="Estado"
          body={(rowData) => (
            <InputSwitch
              checked={rowData.activo}
              onChange={() => toggleActivo(rowData)}
              tooltip={rowData.activo ? "Desactivar sede" : "Activar sede"}
            />
          )}
        />
        <Column
          header="Acciones"
          body={(rowData) => (
            <div className="action-buttons">
              <button
                className="admin-button gray"
                title="Visualizar"
                onClick={() => abrirModal("ver", rowData)}
              >
                <i className="pi pi-search"></i>
              </button>
              <button
                className="admin-button yellow"
                title="Editar"
                onClick={() => abrirModal("editar", rowData)}
              >
                <i className="pi pi-pencil"></i>
              </button>
              <button
                className="admin-button red"
                title="Eliminar"
                onClick={() => abrirModal("eliminar", rowData)}
              >
                <i className="pi pi-trash"></i>
              </button>
            </div>
          )}
        />
      </DataTable>

      {renderModal()}
    </div>
  );
}
