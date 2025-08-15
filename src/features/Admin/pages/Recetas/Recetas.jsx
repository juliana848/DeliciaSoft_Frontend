import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import "../../adminStyles.css";
import RecetaForm from "./components/RecetaForm";

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

  const [currentView, setCurrentView] = useState("list");

  const unidadesMedida = [
    { label: "Seleccionar unidad...", value: "", disabled: true },
    { label: "Kilogramos", value: 1, text: "kg" },
    { label: "Gramos", value: 2, text: "gr" },
    { label: "Litros", value: 3, text: "litros" },
    { label: "Mililitros", value: 4, text: "ml" },
    { label: "Unidades", value: 5, text: "unidad" },
    { label: "Libras", value: 6, text: "lb" },
    { label: "Onzas", value: 7, text: "oz" },
    { label: "Tazas", value: 8, text: "taza" },
    { label: "Cucharadas", value: 9, text: "cda" },
    { label: "Cucharaditas", value: 10, text: "cdta" },
  ];

  // Utility functions to get unit names/texts by ID
  const obtenerNombreUnidad = (idUnidad) => {
    const unidad = unidadesMedida.find((u) => u.value === idUnidad);
    return unidad ? unidad.label : "";
  };
  const obtenerTextoUnidad = (idUnidad) => {
    const unidad = unidadesMedida.find((u) => u.value === idUnidad);
    return unidad ? unidad.text : "";
  };

  useEffect(() => {
    // Mock data de recetas
    const mockRecetas = [
      {
        Idreceta: 1,
        NombreReceta: "Pan Integral Casero", // Changed from IdProductoGeneral/productoGeneral
        Especificaciones: "Receta básica de pan con harina integral",
        estado: true,
        tieneRelaciones: true,
        insumos: [
          {
            id: 1,
            nombre: "Harina de Trigo",
            Cantidad: 1000,
            unidad: "Gramos",
            IdUnidadMedida: 2,
          },
          {
            id: 3,
            nombre: "Levadura Seca",
            Cantidad: 10,
            unidad: "Gramos",
            IdUnidadMedida: 2,
          },
        ],
      },
      {
        Idreceta: 2,
        NombreReceta: "Torta de Chocolate Fudge", // Changed from IdProductoGeneral/productoGeneral
        Especificaciones: "Torta rica en chocolate con glaseado cremoso",
        estado: true,
        tieneRelaciones: false,
        insumos: [
          {
            id: 2,
            nombre: "Azúcar Blanca",
            Cantidad: 200,
            unidad: "Gramos",
            IdUnidadMedida: 2,
          },
          {
            id: 4,
            nombre: "Huevos A",
            Cantidad: 3,
            unidad: "Unidades",
            IdUnidadMedida: 5,
          },
        ],
      },
      {
        Idreceta: 3,
        NombreReceta: "Galletas de Avena y Pasas", // Changed from IdProductoGeneral/productoGeneral
        Especificaciones: "Galletas saludables con avena y pasas",
        estado: false,
        tieneRelaciones: false,
        insumos: [],
      },
    ];

    setRecetas(mockRecetas);
  }, []);

  const toggleEstado = (receta) => {
    const updated = recetas.map((r) =>
      r.Idreceta === receta.Idreceta ? { ...r, estado: !r.estado } : r
    );
    setRecetas(updated);
    showNotification(
      `Receta ${receta.estado ? "inactivada" : "activada"} exitosamente`
    );
  };

  const showNotification = (mensaje, tipo = "success") => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: "", tipo: "success" });
  };

  // Inline Notification Component for RecetasTabla
  const NotificationComponent = ({ visible, mensaje, tipo, onClose }) => {
    if (!visible) return null;
    const bgColor = tipo === "success" ? "#d4edda" : "#f8d7da";
    const textColor = tipo === "success" ? "#155724" : "#721c24";
    const borderColor = tipo === "success" ? "#c3e6cb" : "#f5c6cb";

    return (
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          borderRadius: "5px",
          backgroundColor: bgColor,
          color: textColor,
          border: `1px solid ${borderColor}`,
          zIndex: 1000,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span>{mensaje}</span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.2em",
            cursor: "pointer",
            color: textColor,
          }}
        >
          &times;
        </button>
      </div>
    );
  };

  // Inline SearchBar Component for RecetasTabla
  const SearchBarComponent = ({ placeholder, value, onChange }) => (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="search-input" // Asumiendo que esta clase está en adminStyles.css
      style={{
        padding: "8px 12px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        width: "300px",
        fontSize: "14px",
      }}
    />
  );

  // Inline Modal Component for RecetasTabla
  const ModalComponent = ({ visible, onClose, children }) => {
    if (!visible) return null;
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            maxWidth: "90%",
            maxHeight: "90%",
            overflowY: "auto",
            minWidth: "400px",
          }}
        >
          {children}
        </div>
      </div>
    );
  };

  // Functions for "Visualizar" and "Eliminar" Modals
  const abrirModal = (tipo, receta = null) => {
    setModalTipo(tipo);
    setRecetaSeleccionada(receta);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setRecetaSeleccionada(null);
    setModalTipo(null);
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

  // Handlers for the RecetaForm component
  const handleAddRecetaClick = () => {
    setCurrentView("add");
    setRecetaSeleccionada(null); // No initial data for adding
  };

  const handleEditRecetaClick = (receta) => {
    // Verificar si la receta está activa antes de permitir la edición
    if (!receta.estado) {
      showNotification(
        "No se puede editar una receta inactiva. Active la receta primero.",
        "error"
      );
      return;
    }
    setCurrentView("edit");
    setRecetaSeleccionada(receta); // Pass the existing recipe data
  };

  const handleEliminarRecetaClick = (receta) => {
    // Verificar si la receta está activa antes de permitir la eliminación
    if (!receta.estado) {
      showNotification(
        "No se puede eliminar una receta inactiva. Active la receta primero.",
        "error"
      );
      return;
    }
    abrirModal("eliminar", receta);
  };

  const handleSaveReceta = (newOrUpdatedReceta) => {
    if (currentView === "edit") {
      const updated = recetas.map((r) =>
        r.Idreceta === recetaSeleccionada.Idreceta // Match by original ID
          ? {
              ...newOrUpdatedReceta,
              Idreceta: recetaSeleccionada.Idreceta,
              estado: recetaSeleccionada.estado,
              tieneRelaciones: recetaSeleccionada.tieneRelaciones,
            }
          : r
      );
      setRecetas(updated);
      showNotification("Receta actualizada exitosamente");
    } else {
      // 'add'
      const nuevoId = Math.max(...recetas.map((r) => r.Idreceta), 0) + 1;
      setRecetas((prev) => [
        ...prev,
        {
          ...newOrUpdatedReceta,
          Idreceta: nuevoId,
          estado: true,
          tieneRelaciones: false,
        },
      ]);
      showNotification("Receta agregada exitosamente");
    }
    setCurrentView("list"); // Return to list view
    setRecetaSeleccionada(null); // Clear selected recipe
  };

  const handleCancelRecetaForm = () => {
    setCurrentView("list"); // Return to list view without saving
    setRecetaSeleccionada(null); // Clear selected recipe
  };

  // Filtering for the main DataTable
  const recetasFiltradas = recetas.filter(
    (receta) =>
      receta.Idreceta.toString().includes(filtro) ||
      receta.NombreReceta.toLowerCase().includes(filtro.toLowerCase()) || // Use NombreReceta
      receta.Especificaciones.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="admin-wrapper">
      <NotificationComponent
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      {currentView === "list" && (
        <>
          <div className="admin-toolbar">
            <button
              className="admin-button pink"
              onClick={handleAddRecetaClick}
              type="button"
              style={{
                padding: "10px 18px",
                fontSize: "15px",
                fontWeight: "500",
              }}
            >
              + Agregar
            </button>
            <SearchBarComponent
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
            <Column field="NombreReceta" header="Nombre  Receta" />{" "}
            {/* Changed from productoGeneral */}
            {/* Removed Unidad de Medida and Cantidad columns as they are now per insumo */}
            <Column field="Especificaciones" header="Especificaciones" />
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
                    className={`admin-button ${
                      rowData.estado ? "yellow" : "yellow disabled"
                    }`}
                    title={
                      rowData.estado
                        ? "Editar"
                        : "No se puede editar - Receta inactiva"
                    }
                    onClick={() => handleEditRecetaClick(rowData)}
                    disabled={!rowData.estado}
                    style={{
                      opacity: rowData.estado ? 1 : 0.5,
                      cursor: rowData.estado ? "pointer" : "not-allowed",
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className={`admin-button ${
                      rowData.estado ? "red" : "red disabled"
                    }`}
                    title={
                      rowData.estado
                        ? "Eliminar"
                        : "No se puede eliminar - Receta inactiva"
                    }
                    onClick={() => handleEliminarRecetaClick(rowData)}
                    disabled={!rowData.estado}
                    style={{
                      opacity: rowData.estado ? 1 : 0.5,
                      cursor: rowData.estado ? "pointer" : "not-allowed",
                    }}
                  >
                    🗑️
                  </button>
                </>
              )}
            />
          </DataTable>

          {/* Modal Visualizar */}
          {modalTipo === "visualizar" && recetaSeleccionada && (
            <ModalComponent visible={modalVisible} onClose={cerrarModal}>
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
                      <strong>Nombre Receta:</strong>{" "}
                      {recetaSeleccionada.NombreReceta}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Estado:</strong>{" "}
                      <span
                        style={{
                          color: recetaSeleccionada.estado
                            ? "#28a745"
                            : "#dc3545",
                          fontWeight: "bold",
                        }}
                      >
                        {recetaSeleccionada.estado ? "Activa" : "Inactiva"}
                      </span>
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
                            {insumo.Cantidad} {insumo.unidad}
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
            </ModalComponent>
          )}

          {/* Modal Eliminar - Pregunta inicial */}
          {modalTipo === "eliminar" && recetaSeleccionada && (
            <ModalComponent visible={modalVisible} onClose={cerrarModal}>
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
                <button
                  className="modal-btn save-btn"
                  onClick={manejarEliminacion}
                >
                  Eliminar
                </button>
              </div>
            </ModalComponent>
          )}

          {/* Modal Confirmar Eliminación */}
          {modalTipo === "confirmarEliminar" && recetaSeleccionada && (
            <ModalComponent visible={modalVisible} onClose={cerrarModal}>
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
                <button
                  className="modal-btn save-btn"
                  onClick={confirmarEliminar}
                >
                  Confirmar Eliminación
                </button>
              </div>
            </ModalComponent>
          )}
        </>
      )}

      {(currentView === "add" || currentView === "edit") && (
        <RecetaForm
          initialData={recetaSeleccionada}
          onSave={handleSaveReceta}
          onCancel={handleCancelRecetaForm}
          isEditing={currentView === "edit"}
        />
      )}
    </div>
  );
}
