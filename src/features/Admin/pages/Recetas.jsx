import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import "../adminStyles.css";
import Modal from "../components/modal";
import SearchBar from "../components/SearchBar";
import Notification from "../components/Notification";

export default function RecetasTabla() {
  const [recetas, setRecetas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
  const [formData, setFormData] = useState({
    IdProductoGeneral: "",
    IdUnidadMedida: "",
    Especificaciones: "",
    cantidad: "",
  });

  // Estados para modal de insumos
  const [modalInsumosVisible, setModalInsumosVisible] = useState(false);
  const [insumos, setInsumos] = useState([]);
  const [filtroInsumos, setFiltroInsumos] = useState("");
  const [insumosReceta, setInsumosReceta] = useState([]);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState(null);
  const [cantidadInsumo, setCantidadInsumo] = useState("");
  const [unidadInsumo, setUnidadInsumo] = useState("");

  // Opciones de unidades de medida
  const unidadesMedida = [
    { label: "Seleccionar unidad...", value: "", disabled: true },
    { label: "Kilogramos", value: 1 },
    { label: "Gramos", value: 2 },
    { label: "Litros", value: 3 },
    { label: "Mililitros", value: 4 },
    { label: "Unidades", value: 5 },
    { label: "Libras", value: 6 },
    { label: "Onzas", value: 7 },
    { label: "Tazas", value: 8 },
    { label: "Cucharadas", value: 9 },
    { label: "Cucharaditas", value: 10 },
  ];

  // Función para obtener el nombre de la unidad por ID
  const obtenerNombreUnidad = (idUnidad) => {
    const unidad = unidadesMedida.find((u) => u.value === idUnidad);
    return unidad ? unidad.label : `Unidad ${idUnidad}`;
  };

  useEffect(() => {
    // Mock data de recetas
    const mockRecetas = [
      {
        Idreceta: 1,
        IdProductoGeneral: 1,
        IdUnidadMedida: 1,
        Especificaciones: "Receta básica de pan",
        cantidad: 2.5,
        estado: true,
        tieneRelaciones: true,
        productoGeneral: "Pan Integral",
        unidadMedida: "Kilogramos",
        insumos: [
          {
            id: 1,
            nombre: "Harina de Trigo",
            cantidad: 1000,
            unidad: "Gramos",
          },
          { id: 3, nombre: "Levadura", cantidad: 10, unidad: "Gramos" },
        ],
      },
      {
        Idreceta: 2,
        IdProductoGeneral: 2,
        IdUnidadMedida: 5,
        Especificaciones: "Receta de torta de chocolate",
        cantidad: 1.0,
        estado: true,
        tieneRelaciones: false,
        productoGeneral: "Torta de Chocolate",
        unidadMedida: "Unidades",
        insumos: [
          { id: 2, nombre: "Azúcar", cantidad: 200, unidad: "Gramos" },
          { id: 4, nombre: "Huevos", cantidad: 3, unidad: "Unidades" },
        ],
      },
      {
        Idreceta: 3,
        IdProductoGeneral: 3,
        IdUnidadMedida: 2,
        Especificaciones: "Receta de galletas",
        cantidad: 500,
        estado: false,
        tieneRelaciones: false,
        productoGeneral: "Galletas de Avena",
        unidadMedida: "Gramos",
        insumos: [],
      },
    ];

    // Mock data de insumos disponibles
    const mockInsumos = [
      { id: 1, nombre: "Harina de Trigo", categoria: "Harinas" },
      { id: 2, nombre: "Azúcar", categoria: "Endulzantes" },
      { id: 3, nombre: "Levadura", categoria: "Fermentos" },
      { id: 4, nombre: "Huevos", categoria: "Lácteos" },
      { id: 5, nombre: "Mantequilla", categoria: "Lácteos" },
      { id: 6, nombre: "Leche", categoria: "Lácteos" },
      { id: 7, nombre: "Chocolate", categoria: "Saborizantes" },
      { id: 8, nombre: "Vainilla", categoria: "Saborizantes" },
      { id: 9, nombre: "Sal", categoria: "Condimentos" },
      { id: 10, nombre: "Aceite", categoria: "Grasas" },
    ];

    setRecetas(mockRecetas);
    setInsumos(mockInsumos);
  }, []);

  const toggleEstado = (receta) => {
    const updated = recetas.map((r) =>
      r.Idreceta === receta.Idreceta ? { ...r, estado: !r.estado } : r
    );
    setRecetas(updated);
    showNotification(
      `Receta ${receta.estado ? "desactivada" : "activada"} exitosamente`
    );
  };

  const showNotification = (mensaje, tipo = "success") => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: "", tipo: "success" });
  };

  const abrirModal = (tipo, receta = null) => {
    setModalTipo(tipo);
    setRecetaSeleccionada(receta);

    if (tipo === "agregar") {
      setFormData({
        IdProductoGeneral: "",
        IdUnidadMedida: "",
        Especificaciones: "",
        cantidad: "",
      });
    } else if (tipo === "editar" && receta) {
      setFormData({
        IdProductoGeneral: receta.IdProductoGeneral,
        IdUnidadMedida: receta.IdUnidadMedida,
        Especificaciones: receta.Especificaciones,
        cantidad: receta.cantidad,
      });
    }

    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setRecetaSeleccionada(null);
    setModalTipo(null);
    setFormData({
      IdProductoGeneral: "",
      IdUnidadMedida: "",
      Especificaciones: "",
      cantidad: "",
    });
  };

  // Funciones para modal de insumos
  const abrirModalInsumos = (receta) => {
    setRecetaSeleccionada(receta);
    setInsumosReceta(receta.insumos || []);
    setModalInsumosVisible(true);
    setFiltroInsumos("");
    resetFormInsumo();
  };

  const cerrarModalInsumos = () => {
    setModalInsumosVisible(false);
    setRecetaSeleccionada(null);
    setInsumosReceta([]);
    setFiltroInsumos("");
    resetFormInsumo();
  };

  const resetFormInsumo = () => {
    setInsumoSeleccionado(null);
    setCantidadInsumo("");
    setUnidadInsumo("");
  };

  const agregarInsumoAReceta = () => {
    if (!insumoSeleccionado || !cantidadInsumo || !unidadInsumo) {
      showNotification(
        "Debe seleccionar un insumo, cantidad y unidad",
        "error"
      );
      return;
    }

    if (parseFloat(cantidadInsumo) <= 0) {
      showNotification("La cantidad debe ser mayor a 0", "error");
      return;
    }

    // Verificar si el insumo ya está agregado
    const insumoExistente = insumosReceta.find(
      (i) => i.id === insumoSeleccionado.id
    );
    if (insumoExistente) {
      showNotification("Este insumo ya está agregado a la receta", "error");
      return;
    }

    const nuevoInsumoReceta = {
      id: insumoSeleccionado.id,
      nombre: insumoSeleccionado.nombre,
      cantidad: parseFloat(cantidadInsumo),
      unidad: obtenerNombreUnidad(parseInt(unidadInsumo)),
    };

    setInsumosReceta([...insumosReceta, nuevoInsumoReceta]);
    resetFormInsumo();
    showNotification("Insumo agregado exitosamente");
  };

  const removerInsumoDeReceta = (insumoId) => {
    const nuevosInsumos = insumosReceta.filter((i) => i.id !== insumoId);
    setInsumosReceta(nuevosInsumos);
    showNotification("Insumo removido exitosamente");
  };

  const guardarInsumosReceta = () => {
    // Actualizar la receta con los nuevos insumos
    const recetasActualizadas = recetas.map((r) =>
      r.Idreceta === recetaSeleccionada.Idreceta
        ? { ...r, insumos: insumosReceta }
        : r
    );
    setRecetas(recetasActualizadas);
    cerrarModalInsumos();
    showNotification("Insumos de la receta actualizados exitosamente");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validarFormulario = () => {
    const { IdProductoGeneral, IdUnidadMedida, cantidad } = formData;

    if (!IdProductoGeneral || IdProductoGeneral <= 0) {
      showNotification(
        "El ID de producto general es obligatorio y debe ser mayor a 0",
        "error"
      );
      return false;
    }

    if (!IdUnidadMedida || IdUnidadMedida === "") {
      showNotification("Debe seleccionar una unidad de medida", "error");
      return false;
    }

    if (!cantidad || cantidad <= 0) {
      showNotification("La cantidad debe ser mayor a 0", "error");
      return false;
    }

    return true;
  };

  const guardarReceta = () => {
    if (!validarFormulario()) return;

    if (modalTipo === "agregar") {
      const nuevoId = Math.max(...recetas.map((r) => r.Idreceta), 0) + 1;

      const nuevaReceta = {
        ...formData,
        Idreceta: nuevoId,
        IdProductoGeneral: parseInt(formData.IdProductoGeneral),
        IdUnidadMedida: parseInt(formData.IdUnidadMedida),
        cantidad: parseFloat(formData.cantidad),
        estado: true,
        tieneRelaciones: false,
        productoGeneral: `Producto ${formData.IdProductoGeneral}`,
        unidadMedida: obtenerNombreUnidad(parseInt(formData.IdUnidadMedida)),
        insumos: [],
      };

      setRecetas([...recetas, nuevaReceta]);
      showNotification("Receta agregada exitosamente");
    } else if (modalTipo === "editar") {
      const updated = recetas.map((r) =>
        r.Idreceta === recetaSeleccionada.Idreceta
          ? {
              ...r,
              ...formData,
              IdProductoGeneral: parseInt(formData.IdProductoGeneral),
              IdUnidadMedida: parseInt(formData.IdUnidadMedida),
              cantidad: parseFloat(formData.cantidad),
              productoGeneral: `Producto ${formData.IdProductoGeneral}`,
              unidadMedida: obtenerNombreUnidad(
                parseInt(formData.IdUnidadMedida)
              ),
            }
          : r
      );
      setRecetas(updated);
      showNotification("Receta actualizada exitosamente");
    }

    cerrarModal();
  };

  const manejarEliminacion = () => {
    if (recetaSeleccionada.tieneRelaciones) {
      cerrarModal();
      showNotification(
        "No se puede eliminar la receta porque tiene relaciones asociadas",
        "error"
      );
      return;
    }

    setModalTipo("confirmarEliminar");
  };

  const confirmarEliminar = () => {
    const updated = recetas.filter(
      (r) => r.Idreceta !== recetaSeleccionada.Idreceta
    );
    setRecetas(updated);
    cerrarModal();
    showNotification("Receta eliminada exitosamente");
  };

  const recetasFiltradas = recetas.filter(
    (receta) =>
      receta.Idreceta.toString().includes(filtro) ||
      receta.productoGeneral.toLowerCase().includes(filtro.toLowerCase()) ||
      receta.unidadMedida.toLowerCase().includes(filtro.toLowerCase()) ||
      receta.Especificaciones.toLowerCase().includes(filtro.toLowerCase())
  );

  const insumosFiltrados = insumos.filter(
    (insumo) =>
      insumo.nombre.toLowerCase().includes(filtroInsumos.toLowerCase()) ||
      insumo.categoria.toLowerCase().includes(filtroInsumos.toLowerCase())
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
          style={{ padding: "10px 18px", fontSize: "15px", fontWeight: "500" }}
        >
          + Agregar
        </button>
        <SearchBar
          placeholder="Buscar receta..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>
      <h2 className="admin-section-title">Gestión de Recetas</h2>
      <DataTable
        value={recetasFiltradas}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column field="Idreceta" header="N°" />
        <Column field="productoGeneral" header="Producto General" />
        <Column
          field="unidadMedida"
          header="Unidad de Medida"
          body={(rowData) => (
            <span
              style={{
                padding: "4px 8px",
                backgroundColor: "#f0f9ff",
                borderRadius: "4px",
                border: "1px solid #0ea5e9",
                fontSize: "12px",
                color: "#0369a1",
              }}
            >
              {rowData.unidadMedida}
            </span>
          )}
        />
        <Column field="Especificaciones" header="Especificaciones" />
        <Column header="Cantidad" body={(rowData) => `${rowData.cantidad}`} />
        <Column
          header="Insumos"
          body={(rowData) => (
            <span
              style={{
                padding: "4px 8px",
                backgroundColor: "#f0f4f8",
                borderRadius: "4px",
                border: "1px solid #68d391",
                fontSize: "12px",
                color: "#2d5a43",
              }}
            >
              {rowData.insumos?.length || 0}
            </span>
          )}
        />
        <Column
          header="Estado"
          body={(rowData) => (
            <InputSwitch
              checked={rowData.estado}
              onChange={() => toggleEstado(rowData)}
            />
          )}
        />
        <Column
          header="Acciones"
          body={(rowData) => (
            <>
              <button
                className="admin-button gray"
                title="Visualizar"
                onClick={() => abrirModal("visualizar", rowData)}
              >
                🔍
              </button>
              <button
                className="admin-button blue"
                title="Gestionar Insumos"
                onClick={() => abrirModalInsumos(rowData)}
                style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  margin: "0 2px",
                }}
              >
                📋
              </button>
              <button
                className="admin-button yellow"
                title="Editar"
                onClick={() => abrirModal("editar", rowData)}
              >
                ✏
              </button>
              <button
                className="admin-button red"
                title="Eliminar"
                onClick={() => abrirModal("eliminar", rowData)}
              >
                🗑
              </button>
            </>
          )}
        />
      </DataTable>

      {/* Modal Agregar/Editar */}
      {(modalTipo === "agregar" || modalTipo === "editar") && modalVisible && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title text-base">
            {modalTipo === "agregar" ? "Agregar Receta" : "Editar Receta"}
          </h2>

          <div className="modal-body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                width: "100%",
                minWidth: "500px",
              }}
            >
              <div className="modal-field">
                <label
                  className="text-sm"
                  style={{
                    fontSize: "12px",
                    marginBottom: "2px",
                    display: "block",
                  }}
                >
                  Producto General: <span style={{ color: "#e53935" }}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.IdProductoGeneral}
                  onChange={(e) =>
                    handleInputChange("IdProductoGeneral", e.target.value)
                  }
                  className="modal-input text-sm p-1"
                  style={{
                    width: "100%",
                    height: "28px",
                    fontSize: "12px",
                    padding: "2px 4px",
                  }}
                />
              </div>

              <div className="modal-field">
                <label
                  className="text-sm"
                  style={{
                    fontSize: "12px",
                    marginBottom: "2px",
                    display: "block",
                  }}
                >
                  Unidad de Medida: <span style={{ color: "#e53935" }}>*</span>
                </label>
                <Dropdown
                  value={formData.IdUnidadMedida}
                  options={unidadesMedida}
                  onChange={(e) => handleInputChange("IdUnidadMedida", e.value)}
                  placeholder="Seleccionar unidad..."
                  className="w-full"
                  style={{
                    width: "100%",
                    height: "28px",
                    fontSize: "12px",
                  }}
                  panelStyle={{ fontSize: "12px" }}
                />
              </div>

              <div className="modal-field">
                <label
                  className="text-sm"
                  style={{
                    fontSize: "12px",
                    marginBottom: "2px",
                    display: "block",
                  }}
                >
                  Cantidad: <span style={{ color: "#e53935" }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.cantidad}
                  onChange={(e) =>
                    handleInputChange("cantidad", e.target.value)
                  }
                  className="modal-input text-sm p-1"
                  style={{
                    width: "100%",
                    height: "28px",
                    fontSize: "12px",
                    padding: "2px 4px",
                  }}
                />
              </div>

              <div className="modal-field" style={{ gridColumn: "span 2" }}>
                <label
                  className="text-sm"
                  style={{
                    fontSize: "12px",
                    marginBottom: "2px",
                    display: "block",
                  }}
                >
                  Especificaciones:
                </label>
                <textarea
                  value={formData.Especificaciones}
                  onChange={(e) =>
                    handleInputChange("Especificaciones", e.target.value)
                  }
                  className="modal-input text-sm p-1"
                  style={{
                    width: "100%",
                    height: "60px",
                    fontSize: "12px",
                    padding: "4px",
                    resize: "vertical",
                  }}
                  maxLength={800}
                  placeholder="Descripción de la receta..."
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
              onClick={guardarReceta}
            >
              Guardar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Visualizar */}
      {modalTipo === "visualizar" && recetaSeleccionada && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Detalles de la Receta</h2>
          <div className="modal-body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <p>
                  <strong>N°:</strong> {recetaSeleccionada.Idreceta}
                </p>
                <p>
                  <strong>Producto General:</strong>{" "}
                  {recetaSeleccionada.productoGeneral}
                </p>
                <p>
                  <strong>Unidad de Medida:</strong>{" "}
                  <span
                    style={{
                      padding: "2px 6px",
                      backgroundColor: "#f0f9ff",
                      borderRadius: "4px",
                      border: "1px solid #0ea5e9",
                      fontSize: "12px",
                      color: "#0369a1",
                    }}
                  >
                    {recetaSeleccionada.unidadMedida}
                  </span>
                </p>
              </div>

              <div>
                <p>
                  <strong>Cantidad:</strong> {recetaSeleccionada.cantidad}
                </p>
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <p>
                <strong>Especificaciones:</strong>
              </p>
              <p
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                }}
              >
                {recetaSeleccionada.Especificaciones || "N/A"}
              </p>
            </div>

            {/* Sección de Insumos */}
            <div style={{ marginTop: "1rem" }}>
              <p>
                <strong>Insumos de la Receta:</strong>
              </p>
              {recetaSeleccionada.insumos &&
              recetaSeleccionada.insumos.length > 0 ? (
                <div style={{ marginTop: "0.5rem" }}>
                  {recetaSeleccionada.insumos.map((insumo, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                        border: "1px solid #e9ecef",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span>
                        <strong>{insumo.nombre}</strong>
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          backgroundColor: "#e3f2fd",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "#1976d2",
                        }}
                      >
                        {insumo.cantidad} {insumo.unidad}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.5rem",
                    backgroundColor: "#fff3cd",
                    borderRadius: "4px",
                    border: "1px solid #ffeaa7",
                    color: "#856404",
                    textAlign: "center",
                  }}
                >
                  No hay insumos asignados a esta receta
                </p>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>
              Cerrar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Gestión de Insumos */}
      {modalInsumosVisible && recetaSeleccionada && (
        <Modal visible={modalInsumosVisible} onClose={cerrarModalInsumos}>
          <h2 className="modal-title">
            Gestionar Insumos - Receta N° {recetaSeleccionada.Idreceta}
          </h2>

          <div
            className="modal-body"
            style={{ maxHeight: "600px", overflow: "auto" }}
          >
            {/* Sección para agregar insumos */}
            <div
              style={{
                marginBottom: "2rem",
                padding: "1rem",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  marginBottom: "1rem",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Agregar Nuevo Insumo
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr auto",
                  gap: "1rem",
                  alignItems: "end",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Insumo:
                  </label>
                  <Dropdown
                    value={insumoSeleccionado}
                    options={insumosFiltrados.map((insumo) => ({
                      label: `${insumo.nombre} (${insumo.categoria})`,
                      value: insumo,
                    }))}
                    onChange={(e) => setInsumoSeleccionado(e.value)}
                    placeholder="Seleccionar insumo..."
                    filter
                    filterBy="label"
                    style={{ width: "100%", fontSize: "12px" }}
                    panelStyle={{ fontSize: "12px" }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Cantidad:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={cantidadInsumo}
                    onChange={(e) => setCantidadInsumo(e.target.value)}
                    style={{
                      width: "100%",
                      height: "36px",
                      fontSize: "12px",
                      padding: "4px 8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Unidad:
                  </label>
                  <Dropdown
                    value={unidadInsumo}
                    options={unidadesMedida}
                    onChange={(e) => setUnidadInsumo(e.value)}
                    placeholder="Unidad..."
                    style={{ width: "100%", fontSize: "12px" }}
                    panelStyle={{ fontSize: "12px" }}
                  />
                </div>

                <button
                  onClick={agregarInsumoAReceta}
                  style={{
                    height: "36px",
                    padding: "0 16px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  + Agregar
                </button>
              </div>
            </div>

            {/* Lista de insumos actuales */}
            <div>
              <h3
                style={{
                  marginBottom: "1rem",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Insumos Asignados ({insumosReceta.length})
              </h3>

              {insumosReceta.length > 0 ? (
                <div style={{ maxHeight: "300px", overflow: "auto" }}>
                  {insumosReceta.map((insumo, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.75rem",
                        backgroundColor: "white",
                        borderRadius: "6px",
                        border: "1px solid #e9ecef",
                        marginBottom: "0.5rem",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "14px",
                            color: "#2c3e50",
                          }}
                        >
                          {insumo.nombre}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6c757d",
                            marginTop: "2px",
                          }}
                        >
                          Cantidad: {insumo.cantidad} {insumo.unidad}
                        </div>
                      </div>

                      <button
                        onClick={() => removerInsumoDeReceta(insumo.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                        title="Remover insumo"
                      >
                        🗑 Remover
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    backgroundColor: "#fff3cd",
                    borderRadius: "6px",
                    border: "1px solid #ffeaa7",
                    color: "#856404",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "14px" }}>
                    No hay insumos asignados a esta receta
                  </p>
                  <p style={{ margin: "8px 0 0 0", fontSize: "12px" }}>
                    Utilice el formulario de arriba para agregar insumos
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            className="modal-footer"
            style={{ borderTop: "1px solid #e9ecef", paddingTop: "1rem" }}
          >
            <button
              className="modal-btn cancel-btn"
              onClick={cerrarModalInsumos}
              style={{ marginRight: "0.5rem" }}
            >
              Cancelar
            </button>
            <button
              className="modal-btn save-btn"
              onClick={guardarInsumosReceta}
            >
              Guardar Cambios
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Eliminar - Pregunta inicial */}
      {modalTipo === "eliminar" && recetaSeleccionada && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Eliminar Receta</h2>
          <div className="modal-body">
            <p>
              ¿Está seguro que desea eliminar la receta con N°{" "}
              <strong>{recetaSeleccionada.Idreceta}</strong>?
            </p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>
              Cancelar
            </button>
            <button className="modal-btn save-btn" onClick={manejarEliminacion}>
              Eliminar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Confirmar Eliminación */}
      {modalTipo === "confirmarEliminar" && recetaSeleccionada && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Confirmar Eliminación</h2>
          <div className="modal-body">
            <p>
              ¿Está completamente seguro que desea eliminar la receta con N°{" "}
              <strong>{recetaSeleccionada.Idreceta}</strong>?
            </p>
            <p style={{ color: "#e53935", fontSize: "14px" }}>
              Esta acción no se puede deshacer y se eliminará toda la
              información de la receta.
            </p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>
              Cancelar
            </button>
            <button className="modal-btn save-btn" onClick={confirmarEliminar}>
              Confirmar Eliminación
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
