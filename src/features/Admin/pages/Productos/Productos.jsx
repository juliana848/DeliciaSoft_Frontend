import React, { useState, useRef } from "react";
import ProductosList from "./components/ProductosList";
import ProductosCreate from "./components/ProductosCreate";
import ProductosEdit from "./components/ProductosEdit";
import ProductosView from "./components/ProductosView";
import ProductosDelete from "./components/ProductosDelete";
import Notification from "../../components/Notification";
import "../../adminStyles.css";

export default function ProductosMain() {
  console.log("Componente ProductosMain renderizado");
  
  const [currentView, setCurrentView] = useState("list");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });
  
  const productosListRef = useRef();

  const showNotification = (mensaje, tipo = "success") => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: "", tipo: "success" });
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setProductoSeleccionado(null);
    if (productosListRef.current?.refreshProductos) {
      productosListRef.current.refreshProductos();
    }
  };

  const handleAdd = () => {
    setCurrentView("add");
    setProductoSeleccionado(null);
  };

  const handleEdit = (producto) => {
    setProductoSeleccionado(producto);
    setCurrentView("edit");
    // Asegurarnos de que el modal de eliminación no se muestre
    setShowDeleteModal(false);
  };

  const handleView = (producto) => {
    setProductoSeleccionado(producto);
    setCurrentView("view");
    // Asegurarnos de que el modal de eliminación no se muestre
    setShowDeleteModal(false);
  };

  const handleDelete = (producto) => {
    setProductoSeleccionado(producto);
    setShowDeleteModal(true);
    // Mantener la vista actual para que el modal se superponga
  };

  const handleCancel = () => {
    setCurrentView("list");
    setProductoSeleccionado(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProductoSeleccionado(null);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    setProductoSeleccionado(null);
    showNotification("Producto eliminado exitosamente");
    // Refrescar la lista
    if (productosListRef.current?.refreshProductos) {
      productosListRef.current.refreshProductos();
    }
  };

  const handleCreateSuccess = () => {
    showNotification("Producto creado exitosamente");
    handleBackToList();
  };

  const handleUpdateSuccess = () => {
    showNotification("Producto actualizado exitosamente");
    handleBackToList();
  };

  const renderCurrentView = () => {
    console.log("Renderizando vista:", currentView);
    
    switch (currentView) {
      case "list":
        return (
          <ProductosList
            ref={productosListRef}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
          />
        );

      case "add":
        return (
          <ProductosCreate
            onSave={handleCreateSuccess}
            onCancel={handleCancel}
          />
        );

      case "edit":
        return (
          <ProductosEdit
            producto={productoSeleccionado}
            onSave={handleUpdateSuccess}
            onCancel={handleCancel}
          />
        );

      case "view":
        return (
          <ProductosView
            producto={productoSeleccionado}
            onClose={handleCancel}
          />
        );

      default:
        return (
          <div className="admin-wrapper">
            <div style={{ textAlign: "center", padding: "2rem" }}>
              Vista no encontrada: {currentView}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="productos-main">
      
      {/* Notificación global */}
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      {/* Breadcrumb o indicador de navegación */}
      {currentView !== "list" && (
        <div
          style={{
            padding: "1rem 2rem",
            backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #dee2e6",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.9rem",
            color: "#6c757d",
          }}
        >
          <button
            onClick={handleBackToList}
            style={{
              background: "none",
              border: "none",
              color: "#007bff",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "0.9rem",
              padding: 0,
            }}
          >
            Productos
          </button>
          <span>/</span>
          <span style={{ color: "#495057", fontWeight: "500" }}>
            {currentView === "add" && "Agregar Producto"}
            {currentView === "edit" && "Editar Producto"}
            {currentView === "view" && "Ver Detalles"}
          </span>
        </div>
      )}

      {/* Contenido principal */}
      {renderCurrentView()}

      {/* Modal de eliminación que se superpone solo cuando showDeleteModal es true */}
      {showDeleteModal && (
        <ProductosDelete
          show={showDeleteModal}
          producto={productoSeleccionado}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}