import React, { useState, useEffect, useRef } from "react";
import "../../adminStyles.css";
import Notification from "../../components/Notification";
import LoadingSpinner from "../../components/LoadingSpinner";
import categoriaProductoApiService from "../../services/categoriaProductosService";
import CategoriaList from "./components/CategoriaList";
import CategoriaCreate from "./components/CategoriaCreate";
import CategoriaEdit from "./components/CategoriaEdit";
import CategoriaView from "./components/CategoriaView";
import CategoriaDelete from "./components/CategoriaDelete";

export default function CategoriaMain() {
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState({ visible: false, mensaje: "", tipo: "success" });
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showView, setShowView] = useState(false);

  const listRef = useRef();

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriaProductoApiService.obtenerCategorias();
      const mapped = data.map((c) => ({
        id: c.idcategoriaproducto,
        nombre: c.nombrecategoria,
        descripcion: c.descripcion,
        activo: c.estado,
        imagen: c.imagenes ? c.imagenes.urlimg : null,
      }));
      setCategorias(mapped);
    } catch (err) {
      showNotification("Error al cargar las categorías: " + (err.message || err), "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (mensaje, tipo = "success") =>
    setNotification({ visible: true, mensaje, tipo });
  const hideNotification = () => setNotification({ visible: false, mensaje: "", tipo: "success" });

  // --- Handlers de modales ---
  const handleAdd = () => {
    setCategoriaSeleccionada(null);
    setShowCreateModal(true);
  };

  const handleEdit = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setShowEditModal(true);
  };

  const handleView = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setShowView(true);
  };

  const handleDelete = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setShowDeleteModal(true);
  };

  const handleCancelCreate = () => setShowCreateModal(false);
  const handleCancelEdit = () => setShowEditModal(false);
  const handleCancelView = () => {
    setShowView(false);
    setCategoriaSeleccionada(null);
  };
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCategoriaSeleccionada(null);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!categoriaSeleccionada) return;
      await categoriaProductoApiService.eliminarCategoria(categoriaSeleccionada.id);
      showNotification("Categoría eliminada exitosamente");
      handleCancelDelete();
      fetchCategorias();
    } catch (err) {
      showNotification("Error al eliminar la categoría: " + (err.message || err), "error");
    }
  };

  const handleCreateSuccess = () => {
    fetchCategorias();
    showNotification("Categoría creada exitosamente");
    setShowCreateModal(false);
  };

  const handleEditSuccess = () => {
    fetchCategorias();
    showNotification("Categoría actualizada exitosamente");
    setShowEditModal(false);
  };

  const toggleActivo = async (categoria) => {
    try {
      const optimistic = categorias.map((c) =>
        c.id === categoria.id ? { ...c, activo: !c.activo } : c
      );
      setCategorias(optimistic);
      await categoriaProductoApiService.toggleEstadoCategoria(categoria.id);
      showNotification(`Categoría ${categoria.activo ? "desactivada" : "activada"} exitosamente`);
    } catch (err) {
      const reverted = categorias.map((c) =>
        c.id === categoria.id ? { ...c, activo: categoria.activo } : c
      );
      setCategorias(reverted);
      showNotification("Error al cambiar el estado: " + (err.message || err), "error");
    }
  };

  return (
    <div className="categorias-main">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <CategoriaList
          categorias={categorias}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onToggleActivo={toggleActivo}
        />
      )}

      <CategoriaCreate
        visible={showCreateModal}
        onClose={handleCancelCreate}
        onGuardar={handleCreateSuccess}
      />

      <CategoriaEdit
        visible={showEditModal}
        categoria={categoriaSeleccionada}
        onClose={handleCancelEdit}
        onUpdate={handleEditSuccess}
      />

      <CategoriaView
        visible={showView}
        categoria={categoriaSeleccionada}
        onClose={handleCancelView}
      />

      <CategoriaDelete
        visible={showDeleteModal}
        categoria={categoriaSeleccionada}
        onClose={handleCancelDelete}
        onDeleted={(id) => {
          fetchCategorias();
          handleCancelDelete();
        }}
        showNotification={showNotification}
      />
    </div>
  );
}
