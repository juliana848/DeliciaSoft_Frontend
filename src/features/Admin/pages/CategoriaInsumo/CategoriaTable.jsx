// src/pages/categorias/CategoriaTable.jsx

import React, { useState } from 'react';
import '../../adminStyles.css';
import Notification from '../../components/Notification';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import SearchBar from '../../components/SearchBar';
import CategoriaDataTable from './components/CategoriaDataTable';
import CategoriaModal from './components/CategoriaModal';
import { useCategorias } from './hooks/useCategorias';
import { useCategoriaForm } from './hooks/useCategoriaForm';
import { normalizar } from './utils/categoriaValidations';

export default function CategoriaTable() {
  const [filtro, setFiltro] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  // Custom hooks
  const {
    categorias,
    loading,
    loadingStates,
    mensajeCarga,
    notification,
    hideNotification,
    showNotification,
    toggleActivo,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
  } = useCategorias();

  const formData = useCategoriaForm();

  // Filtrado de categorías
  const categoriasFiltradas = categorias.filter(cat => {
    const texto = normalizar(filtro);
    return (
      normalizar(cat.nombre).includes(texto) ||
      normalizar(cat.descripcion).includes(texto) ||
      (cat.activo ? 'activo' : 'inactivo').includes(texto)
    );
  });

  // Sugerencias para el input de búsqueda
  const sugerenciasNombres = categorias
    .filter(cat => cat.activo)
    .map(cat => cat.nombre);

  // Abrir modal
  const abrirModal = (tipo, categoria = null) => {
    setModalTipo(tipo);
    setCategoriaSeleccionada(categoria);
    
    if (tipo === 'editar' && categoria) {
      formData.setFormValues({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        estado: categoria.activo
      });
    } else if (tipo === 'agregar') {
      formData.resetForm();
    } else if (tipo === 'visualizar' && categoria) {
      formData.setFormValues({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        estado: categoria.activo
      });
    }
    
    setModalVisible(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalVisible(false);
    setCategoriaSeleccionada(null);
    setModalTipo(null);
    formData.resetForm();
  };

  // Guardar (crear o editar)
  const handleGuardar = async () => {
    if (!formData.isValid()) {
      if (formData.errores.nombre) showNotification(formData.errores.nombre, 'error');
      if (formData.errores.descripcion) showNotification(formData.errores.descripcion, 'error');
      return;
    }

    const datosCategoria = {
      nombreCategoria: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      estado: modalTipo === 'agregar' ? true : formData.estado
    };

    let resultado;
    if (modalTipo === 'agregar') {
      resultado = await crearCategoria(datosCategoria);
    } else if (modalTipo === 'editar') {
      resultado = await actualizarCategoria(categoriaSeleccionada.id, datosCategoria);
    }

    if (resultado) {
      cerrarModal();
    }
  };

  // Eliminar
  const handleEliminar = async () => {
    const resultado = await eliminarCategoria(categoriaSeleccionada.id);
    if (resultado) {
      cerrarModal();
    }
  };

  return (
    <div className="admin-wrapper">
      {loading && <LoadingSpinner mensaje={mensajeCarga} fullScreen={true} />}
      
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      {/* Toolbar: Buscador + Agregar a la derecha */}
      <div className="admin-toolbar">
        <SearchBar
          placeholder="Buscar categoría..."
          value={filtro}
          onChange={setFiltro}
        />
        <button
          className="admin-button pink"
          onClick={() => abrirModal('agregar')}
          type="button"
        >
          <i className="fas fa-plus"></i> Agregar
        </button>
      </div>

      <h2 className="admin-section-title">Gestión de Categoría Insumos</h2>

      <CategoriaDataTable
        categorias={categoriasFiltradas}
        loadingStates={loadingStates}
        onToggleActivo={toggleActivo}
        onAbrirModal={abrirModal}
      />

      <CategoriaModal
        visible={modalVisible}
        tipo={modalTipo}
        categoria={categoriaSeleccionada}
        formData={formData}
        sugerencias={sugerenciasNombres}
        onClose={cerrarModal}
        onSave={modalTipo === 'eliminar' ? handleEliminar : handleGuardar}
        loading={loading}
      />
    </div>
  );
}