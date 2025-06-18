import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

export default function CategoriaTableDemo() {
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [descripcionEditada, setDescripcionEditada] = useState('');

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
    setModalTipo(tipo);
    setCategoriaSeleccionada(categoria);
    if (tipo === 'editar') {
      setNombreEditado(categoria.nombre);
      setDescripcionEditada(categoria.descripcion);
    }
    if (tipo === 'agregar') {
      setNombreEditado('');
      setDescripcionEditada('');
    }
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setCategoriaSeleccionada(null);
    setModalTipo(null);
    setNombreEditado('');
    setDescripcionEditada('');
  };

  const validarFormulario = () => {
    if (!nombreEditado.trim()) {
      showNotification('El nombre es obligatorio', 'error');
      return false;
    }
    if (!descripcionEditada.trim()) {
      showNotification('La descripción es obligatoria', 'error');
      return false;
    }
    return true;
  };

  const guardarEdicion = () => {
    if (!validarFormulario()) return;

    const updated = categorias.map(cat =>
      cat.id === categoriaSeleccionada.id
        ? { ...cat, nombre: nombreEditado, descripcion: descripcionEditada }
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

  const categoriasFiltradas = categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(filtro.toLowerCase())
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
        <Column
          header="N°"
          body={(_, { rowIndex }) => rowIndex + 1}
          headerStyle={{ textAlign: 'center', verticalAlign: 'middle', paddingLeft: '4rem' }}
          bodyStyle={{ textAlign: 'center', verticalAlign: 'middle' }}
        />
        <Column
          field="nombre"
          header="Nombre"
          headerStyle={{ textAlign: 'left', verticalAlign: 'middle' }}
          bodyStyle={{ textAlign: 'left', verticalAlign: 'middle' }}
        />
        <Column
          field="descripcion"
          header="Descripción"
          headerStyle={{ textAlign: 'left', verticalAlign: 'middle' }}
          bodyStyle={{ textAlign: 'left', verticalAlign: 'middle' }}
        />
        <Column
          header="Estados"
          body={(rowData) => (
            <InputSwitch
              checked={rowData.activo}
              onChange={() => toggleActivo(rowData)}
            />
          )}
          headerStyle={{ textAlign: 'center', verticalAlign: 'middle', paddingLeft: '4rem' }}
          bodyStyle={{ textAlign: 'center', verticalAlign: 'middle' }}
        />
        <Column
          header="Acción"
          body={(rowData) => (
            <>
              <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('visualizar', rowData)}>
                🔍
              </button>
              <button className="admin-button yellow" title="Editar" onClick={() => abrirModal('editar', rowData)}>
                ✏️
              </button>
              <button className="admin-button red" title="Eliminar" onClick={() => abrirModal('eliminar', rowData)}>
                🗑️
              </button>
            </>
          )}
          headerStyle={{ textAlign: 'center', verticalAlign: 'middle', paddingLeft: '6rem' }}
          bodyStyle={{ textAlign: 'center', verticalAlign: 'middle' }}
        />
      </DataTable>

      {/* Modal Agregar/Editar */}
    {modalVisible && (
    <Modal visible={modalVisible} onClose={cerrarModal}>
      {modalTipo === 'agregar' || modalTipo === 'editar' ? (
        <>
          <h2 className="modal-title">
            {modalTipo === 'agregar' ? 'Agregar Nueva Categoría' : 'Editar Categoría'}
          </h2>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label>
                Nombre*
                <input
                  type="text"
                  value={nombreEditado}
                  onChange={(e) => setNombreEditado(e.target.value)}
                  className="modal-input"
                />
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
              </label>
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
        </>
      ) : modalTipo === 'visualizar' && categoriaSeleccionada ? (
        <>
          <h2 className="modal-title">Detalles Categoría</h2>
          <div className="modal-body">
            <p><strong>Nombre:</strong> {categoriaSeleccionada.nombre}</p>
            <p><strong>Descripción:</strong> {categoriaSeleccionada.descripcion}</p>
            <p><strong>Activo:</strong> {categoriaSeleccionada.activo ? 'Sí' : 'No'}</p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cerrar</button>
          </div>
        </>
      ) : modalTipo === 'eliminar' && categoriaSeleccionada ? (
        <>
          <h2 className="modal-title">Confirmar Eliminación</h2>
          <div className="modal-body">
            <p>¿Seguro que quieres eliminar la categoría <strong>{categoriaSeleccionada.nombre}</strong>?</p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn" onClick={confirmarEliminar}>Eliminar</button>
          </div>
        </>
      ) : null}
    </Modal>
  )};



      {/* Modal Visualizar */}
      {modalTipo === 'visualizar' && categoriaSeleccionada && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Detalles Categoría</h2>
          <div className="modal-body">
            <p><strong>Nombre:</strong> {categoriaSeleccionada.nombre}</p>
            <p><strong>Descripción:</strong> {categoriaSeleccionada.descripcion}</p>
            <p><strong>Activo:</strong> {categoriaSeleccionada.activo ? 'Sí' : 'No'}</p>
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
