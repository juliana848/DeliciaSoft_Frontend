import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../../adminStyles.css';
import Modal from '../../components/modal';
import SearchBar from '../../components/SearchBar';
import Notification from '../../components/Notification';
import categoriaInsumoApiService from '../../services/categoriainsumos';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import SearchableInput from './SearchableInput.jsx'; // ← NUEVO
import Tooltip from '../../components/Tooltip';

export default function CategoriaTableDemo() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [loadingStates, setLoadingStates] = useState({}); 
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [descripcionEditada, setDescripcionEditada] = useState('');
  const [estadoEditado, setEstadoEditado] = useState(true);
  const [errores, setErrores] = useState({ nombre: '', descripcion: '' });
  const [isEditDeleteEnabled, setIsEditDeleteEnabled] = useState(true);
  const [mensajeCarga, setMensajeCarga] = useState('Cargando...'); 

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setMensajeCarga('Cargando categorías...');
      setLoading(true);
      const data = await categoriaInsumoApiService.obtenerCategorias();
      const categoriasTransformadas = data.map(cat => ({
        id: cat.id,
        nombre: cat.nombreCategoria,
        descripcion: cat.descripcion,
        activo: cat.estado
      }));
      setCategorias(categoriasTransformadas);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      showNotification('Error al cargar las categorías: ' + error.message, 'error');
      const mockCategorias = [
        { id: 201, nombre: 'Frutas', descripcion: 'Productos naturales', activo: true },
        { id: 202, nombre: 'Chocolate', descripcion: 'Derivados del cacao', activo: true },
        { id: 203, nombre: 'Lácteos', descripcion: 'Productos de leche', activo: true },
        { id: 204, nombre: 'Harinas', descripcion: 'Cereales y derivados', activo: false },
        { id: 205, nombre: 'Proteínas', descripcion: 'Carnes y vegetales', activo: true }
      ];
      setCategorias(mockCategorias);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const nuevosErrores = { nombre: '', descripcion: '' };

    if (!nombreEditado.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (nombreEditado.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (nombreEditado.trim().length > 50) {
      nuevosErrores.nombre = 'El nombre no puede superar los 50 caracteres';
    } else if (!/^[A-Za-zÀÁÉÍÓÚàáéíóúÑñ\s]+$/.test(nombreEditado.trim())) {
      nuevosErrores.nombre = 'El nombre solo puede contener letras y espacios';
    }

    if (!descripcionEditada.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    } else if (descripcionEditada.trim().length < 10) {
      nuevosErrores.descripcion = 'La descripción debe tener al menos 10 caracteres';
    } else if (descripcionEditada.trim().length > 200) {
      nuevosErrores.descripcion = 'La descripción no puede superar los 200 caracteres';
    }

    setErrores(nuevosErrores);
  }, [nombreEditado, descripcionEditada]);

  const toggleActivo = async (categoria) => {
    try {
      setLoadingStates(prev => ({ ...prev, [categoria.id]: true }));
      
      const nuevoEstado = !categoria.activo;
      await categoriaInsumoApiService.cambiarEstadoCategoria(categoria.id, nuevoEstado);
      const updated = categorias.map(cat =>
        cat.id === categoria.id ? { ...cat, activo: nuevoEstado } : cat
      );
      setCategorias(updated);
      showNotification(`Categoría ${categoria.activo ? 'desactivada' : 'activada'} exitosamente`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showNotification('Error al cambiar el estado: ' + error.message, 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, [categoria.id]: false }));
    }
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const abrirModal = (tipo, categoria) => {
    if ((tipo === 'editar' || tipo === 'eliminar') && !isEditDeleteEnabled) {
      showNotification('Las funciones de edición y eliminación están deshabilitadas', 'error');
      return;
    }

    setModalTipo(tipo);
    setCategoriaSeleccionada(categoria);
    if (tipo === 'editar') {
      setNombreEditado(categoria.nombre);
      setDescripcionEditada(categoria.descripcion);
      setEstadoEditado(categoria.activo);
    }
    if (tipo === 'agregar') {
      setNombreEditado('');
      setDescripcionEditada('');
      setEstadoEditado(true);
    }
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setCategoriaSeleccionada(null);
    setModalTipo(null);
    setNombreEditado('');
    setDescripcionEditada('');
    setEstadoEditado(true);
    setErrores({ nombre: '', descripcion: '' });
  };

  const validarFormulario = () => {
    if (errores.nombre || errores.descripcion) {
      if (errores.nombre) showNotification(errores.nombre, 'error');
      if (errores.descripcion) showNotification(errores.descripcion, 'error');
      return false;
    }
    return true;
  };

  const guardarEdicion = async () => {
    if (!validarFormulario()) return;

    try {
      setMensajeCarga('Guardando cambios...');
      setLoading(true);
      
      const datosCategoria = {
        nombreCategoria: nombreEditado.trim(),
        descripcion: descripcionEditada.trim(),
        estado: estadoEditado
      };

      const categoriaActualizada = await categoriaInsumoApiService.actualizarCategoria(
        categoriaSeleccionada.id, 
        datosCategoria
      );

      const updated = categorias.map(cat =>
        cat.id === categoriaSeleccionada.id
          ? {
              id: categoriaActualizada.id,
              nombre: categoriaActualizada.nombreCategoria,
              descripcion: categoriaActualizada.descripcion,
              activo: categoriaActualizada.estado
            }
          : cat
      );
      setCategorias(updated);
      cerrarModal();
      showNotification('Categoría editada exitosamente');
    } catch (error) {
      console.error('Error al editar categoría:', error);
      showNotification('Error al editar la categoría: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminar = async () => {
    try {
      setMensajeCarga('Eliminando categoría...');
      setLoading(true);
      await categoriaInsumoApiService.eliminarCategoria(categoriaSeleccionada.id);
      const updated = categorias.filter(cat => cat.id !== categoriaSeleccionada.id);
      setCategorias(updated);
      cerrarModal();
      showNotification('Categoría eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      showNotification('Error al eliminar la categoría: ' + error.message, 'error');
      cerrarModal();
    } finally {
      setLoading(false);
    }
  };

  const guardarNuevaCategoria = async () => {
    if (!validarFormulario()) return;

    try {
      setMensajeCarga('Agregando categoría...');
      setLoading(true);
      
      const datosCategoria = {
        nombreCategoria: nombreEditado.trim(),
        descripcion: descripcionEditada.trim(),
        estado: true
      };

      const nuevaCategoria = await categoriaInsumoApiService.crearCategoria(datosCategoria);

      const categoriaParaEstado = {
        id: nuevaCategoria.id,
        nombre: nuevaCategoria.nombreCategoria,
        descripcion: nuevaCategoria.descripcion,
        activo: nuevaCategoria.estado
      };

      setCategorias([...categorias, categoriaParaEstado]);
      cerrarModal();
      showNotification('Categoría agregada exitosamente');
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      showNotification('Error al agregar la categoría: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const normalizar = (texto) =>
    texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const categoriasFiltradas = categorias.filter(cat => {
    const texto = normalizar(filtro);
    return (
      normalizar(cat.nombre).includes(texto) ||
      normalizar(cat.descripcion).includes(texto) ||
      (cat.activo ? 'activo' : 'inactivo').includes(texto)
    );
  });

  // Obtener solo nombres de categorías activas para sugerencias
  const sugerenciasNombres = categorias
    .filter(cat => cat.activo)
    .map(cat => cat.nombre);

  return (
    <div className="admin-wrapper">
      {loading && <LoadingSpinner mensaje={mensajeCarga} fullScreen={true} />}
      
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <div className="admin-toolbar">
        <button 
          className="admin-button pink" 
          onClick={() => abrirModal('agregar')} 
          type="button"
          disabled={loading}
        >
          {loading ? 'Cargando...' : '+ Agregar'}
        </button>
        
        <SearchBar
          placeholder="Buscar categoría..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <h2 className="admin-section-title">Gestión de Categoría Insumos</h2>

        <DataTable
          value={categoriasFiltradas}
          className="admin-table compact-paginator"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          tableStyle={{ minWidth: '50rem' }}
        >
        <Column header="N°" body={(_, { rowIndex }) => rowIndex + 1} />
        <Column field="nombre" header="Nombre" />
        <Column field="descripcion" header="Descripción" />
        <Column
          header="Estados"
          body={(rowData) => (
            <InputSwitch
              checked={rowData.activo}
              onChange={() => toggleActivo(rowData)}
              disabled={loadingStates[rowData.id]}
            />
          )}
        />
        <Column
  header="Acción"
  body={(rowData) => {
    const isEnabled = rowData.activo;
    const isLoadingThis = loadingStates[rowData.id];

    return (
      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
        <Tooltip text="Visualizar">
          <button 
            className="admin-button gray" 
            onClick={() => abrirModal('visualizar', rowData)}
            disabled={isLoadingThis}
          >
            👁
          </button>
        </Tooltip>

        <Tooltip text={isEnabled ? "Editar" : "Editar (Deshabilitado)"}>
          <button 
            className="admin-button yellow"
            onClick={() => isEnabled && abrirModal('editar', rowData)}
            disabled={!isEnabled || isLoadingThis}
            style={{
              opacity: isEnabled && !isLoadingThis ? 1 : 0.50,
              cursor: isEnabled && !isLoadingThis ? 'pointer' : 'not-allowed'
            }}
          >
            ✏️
          </button>
        </Tooltip>

        <Tooltip text={isEnabled ? "Eliminar" : "Eliminar (Deshabilitado)"}>
          <button 
            className="admin-button red"
            onClick={() => isEnabled && abrirModal('eliminar', rowData)}
            disabled={!isEnabled || isLoadingThis}
            style={{
              opacity: isEnabled && !isLoadingThis ? 1 : 0.50,
              cursor: isEnabled && !isLoadingThis ? 'pointer' : 'not-allowed'
            }}
          >
            🗑️
          </button>
        </Tooltip>
      </div>
    );
  }}
/>
      </DataTable>

      {/* Modal Agregar / Editar */}
      {modalVisible && (modalTipo === 'agregar' || modalTipo === 'editar') && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">
            {modalTipo === 'agregar' ? 'Agregar Categoria de Insumo' : 'Editar Categoría'}
          </h2>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label>
                Nombre*
                <SearchableInput
                  value={nombreEditado}
                  onChange={setNombreEditado}
                  sugerencias={sugerenciasNombres}
                  placeholder="Seleccione o escriba una categoría"
                  error={!!errores.nombre}
                  disabled={loading}
                />
                {errores.nombre && <p className="error">{errores.nombre}</p>}
              </label>
              <label>
                Descripción*
                <textarea
                  value={descripcionEditada}
                  onChange={(e) => setDescripcionEditada(e.target.value)}
                  className="modal-input textarea"
                  rows={3}
                  style={{ resize: 'vertical' }}
                  disabled={loading}
                />
                {errores.descripcion && <p className="error">{errores.descripcion}</p>}
              </label>
              
              {modalTipo === 'editar' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ margin: 0 }}>Estado:</label>
                  <InputSwitch
                    checked={estadoEditado}
                    onChange={(e) => setEstadoEditado(e.value)}
                    disabled={loading}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    {estadoEditado ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button 
              className="modal-btn cancel-btn" 
              onClick={cerrarModal}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className="modal-btn save-btn"
              onClick={modalTipo === 'agregar' ? guardarNuevaCategoria : guardarEdicion}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Visualizar */}
      {modalTipo === 'visualizar' && categoriaSeleccionada && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Detalles Categoría</h2>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label>
                Nombre*
                <input
                  value={categoriaSeleccionada.nombre}
                  className="modal-input"
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </label>
              <label>
                Descripción*
                <textarea
                  value={categoriaSeleccionada.descripcion}
                  className="modal-input textarea"
                  rows={3}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', resize: 'vertical' }}
                />
              </label>
              <label>
                Estado
                <input
                  value={categoriaSeleccionada.activo ? 'Activo' : 'Inactivo'}
                  className="modal-input"
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cerrar</button>
          </div>
        </Modal>
      )}

      {/* Modal Eliminar */}
      {modalTipo === 'eliminar' && categoriaSeleccionada && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Confirmar Eliminación</h2>
          <div className="modal-body">
            <p>¿Seguro que quieres eliminar la categoría <strong>{categoriaSeleccionada.nombre}</strong>?</p>
          </div>
          <div className="modal-footer">
            <button 
              className="modal-btn cancel-btn" 
              onClick={cerrarModal}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              className="modal-btn save-btn" 
              onClick={confirmarEliminar}
              disabled={loading}
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}