import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../../adminStyles.css';
import Modal from '../../components/modal';
import SearchBar from '../../components/SearchBar';
import Notification from '../../components/Notification';

export default function CategoriaTableDemo() {
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [descripcionEditada, setDescripcionEditada] = useState('');
  const [estadoEditado, setEstadoEditado] = useState(true); // Nuevo estado para el switch
  const [errores, setErrores] = useState({ nombre: '', descripcion: '' });
  
  // Nuevo estado para controlar si la edición/eliminación está habilitada
  const [isEditDeleteEnabled, setIsEditDeleteEnabled] = useState(true);

  useEffect(() => {
    const mockCategorias = [
      { id: 201, nombre: 'Frutas', descripcion: 'Productos naturales', activo: true },
      { id: 202, nombre: 'Chocolate', descripcion: 'Derivados del cacao', activo: true },
      { id: 203, nombre: 'Lácteos', descripcion: 'Productos de leche', activo: true },
      { id: 204, nombre: 'Harinas', descripcion: 'Cereales y derivados', activo: false },
      { id: 205, nombre: 'Proteínas', descripcion: 'Carnes y vegetales', activo: true }
    ];
    setCategorias(mockCategorias);
  }, []);

  useEffect(() => {
    const nuevosErrores = { nombre: '', descripcion: '' };

    if (!nombreEditado.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (nombreEditado.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (nombreEditado.trim().length > 50) {
      nuevosErrores.nombre = 'El nombre no puede superar los 50 caracteres';
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombreEditado.trim())) {
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

  const toggleActivo = (categoria) => {
    const updated = categorias.map(cat =>
      cat.id === categoria.id ? { ...cat, activo: !cat.activo } : cat
    );
    setCategorias(updated);
    showNotification(`Categoría ${categoria.activo ? 'desactivada' : 'activada'} exitosamente`);
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const abrirModal = (tipo, categoria) => {
    // Verificar si la edición/eliminación está deshabilitada
    if ((tipo === 'editar' || tipo === 'eliminar') && !isEditDeleteEnabled) {
      showNotification('Las funciones de edición y eliminación están deshabilitadas', 'error');
      return;
    }

    setModalTipo(tipo);
    setCategoriaSeleccionada(categoria);
    if (tipo === 'editar') {
      setNombreEditado(categoria.nombre);
      setDescripcionEditada(categoria.descripcion);
      setEstadoEditado(categoria.activo); // Establecer el estado actual
    }
    if (tipo === 'agregar') {
      setNombreEditado('');
      setDescripcionEditada('');
      setEstadoEditado(true); // Por defecto activo para nuevas categorías
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

  const guardarEdicion = () => {
    if (!validarFormulario()) return;

    const updated = categorias.map(cat =>
      cat.id === categoriaSeleccionada.id
        ? { ...cat, nombre: nombreEditado, descripcion: descripcionEditada, activo: estadoEditado }
        : cat
    );
    setCategorias(updated);
    cerrarModal();
    showNotification('Categoría editada exitosamente');
  };

  const confirmarEliminar = () => {
    const updated = categorias.filter(cat => cat.id !== categoriaSeleccionada.id);
    setCategorias(updated);
    cerrarModal();
    showNotification('Categoría eliminada exitosamente');
  };

  const guardarNuevaCategoria = () => {
    if (!validarFormulario()) return;

    const nuevoId = categorias.length ? Math.max(...categorias.map(c => c.id)) + 1 : 1;
    setCategorias([
      ...categorias,
      {
        id: nuevoId,
        nombre: nombreEditado,
        descripcion: descripcionEditada,
        activo: true
      }
    ]);

    cerrarModal();
    showNotification('Categoría agregada exitosamente');
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

  return (
    <div className="admin-wrapper">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <div className="admin-toolbar">
        <button className="admin-button pink" onClick={() => abrirModal('agregar')} type="button">
          + Agregar
        </button>
        
        <SearchBar
          placeholder="Buscar categoría..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <h2 className="admin-section-title">Categoria Insumos</h2>

      <DataTable
        value={categoriasFiltradas}
        className="admin-table"
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
            />
          )}
        />
        <Column
          header="Acción"
          body={(rowData) => {
            const isEnabled = rowData.activo;

            return (
              <>
                <button 
                  className="admin-button gray" 
                  title="Visualizar" 
                  onClick={() => abrirModal('visualizar', rowData)}
                >
                  🔍
                </button>

                <button 
                  className="admin-button yellow"
                  title={isEnabled ? "Editar" : "Editar (Deshabilitado)"}
                  onClick={() => isEnabled && abrirModal('editar', rowData)}
                  disabled={!isEnabled}
                  style={{
                    opacity: isEnabled ? 1 : 0.50,
                    cursor: isEnabled ? 'pointer' : 'not-allowed'
                  }}
                >
                  ✏️
                </button>

                <button 
                  className="admin-button red"
                  title={isEnabled ? "Eliminar" : "Eliminar (Deshabilitado)"}
                  onClick={() => isEnabled && abrirModal('eliminar', rowData)}
                  disabled={!isEnabled}
                  style={{
                    opacity: isEnabled ? 1 : 0.50,
                    cursor: isEnabled ? 'pointer' : 'not-allowed'
                  }}
                >
                  🗑️
                </button>
              </>
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
                <input
                  list="categorias-list"
                  value={nombreEditado}
                  onChange={(e) => setNombreEditado(e.target.value)}
                  className="modal-input"
                  placeholder="Seleccione o escriba una categoría"
                />
                {errores.nombre && <p className="error">{errores.nombre}</p>}
                <datalist id="categorias-list">
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.nombre} />
                  ))}
                </datalist>
              </label>
              <label>
                Descripción*
                <textarea
                  value={descripcionEditada}
                  onChange={(e) => setDescripcionEditada(e.target.value)}
                  className="modal-input textarea"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
                {errores.descripcion && <p className="error">{errores.descripcion}</p>}
              </label>
              
              {/* Switch de estado solo en modal de editar */}
              {modalTipo === 'editar' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ margin: 0 }}>Estado:</label>
                  <InputSwitch
                    checked={estadoEditado}
                    onChange={(e) => setEstadoEditado(e.value)}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    {estadoEditado ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button
              className="modal-btn save-btn"
              onClick={modalTipo === 'agregar' ? guardarNuevaCategoria : guardarEdicion}
            >
              Guardar
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
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn" onClick={confirmarEliminar}>Eliminar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}