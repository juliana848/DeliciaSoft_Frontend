import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

export default function CategoriaProductos() {
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
      { id: 301, nombre: 'Fresas con crema', descripcion: 'Postre con fresas y crema', activo: true },
      { id: 302, nombre: 'Obleas', descripcion: 'Obleas con arequipe', activo: true },
      { id: 303, nombre: 'Cupcakes', descripcion: 'Cupcakes decorados', activo: true },
      { id: 304, nombre: 'Postres', descripcion: 'Variedad de postres', activo: false },
      { id: 305, nombre: 'Pasteles', descripcion: 'Pasteles personalizados', activo: true },
      { id: 306, nombre: 'Arroz con leche', descripcion: 'Postre tradicional', activo: false },
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

  const abrirModalAgregar = () => {
    abrirModal('agregar', null);
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
        ? { 
            ...cat, 
            nombre: nombreEditado, 
            descripcion: descripcionEditada,
            activo: categoriaSeleccionada.activo
          }
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

    setCategorias([...categorias, {
      id: nuevoId,
      nombre: nombreEditado,
      descripcion: descripcionEditada,
      activo: true
    }]);

    cerrarModal();
    showNotification('Categoría agregada exitosamente');
  };

  const categoriasFiltradas = categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    cat.descripcion.toLowerCase().includes(filtro.toLowerCase())
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
          onClick={abrirModalAgregar}
          type="button"
        >
          + Agregar
        </button>
        <SearchBar
          placeholder="Buscar categoría..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <h2 className="admin-section-title">Categorías de Productos</h2>

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
    style={{ width: '3rem' }}
    headerStyle={{ textAlign: 'right', paddingLeft:'25px'}}
    bodyStyle={{ textAlign: 'center', paddingLeft:'3px'}}
  />
  <Column
  field="nombre"
  header="Nombre"
  headerStyle={{ textAlign: 'right', paddingLeft:'120px'}}
  bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
  style={{ width: '250px',maxHeight: '300px'}}
  />
  <Column
    field="descripcion"
    header="Descripción"
    bodyClassName="descripcion-col"
    headerStyle={{ textAlign: 'right', paddingLeft:'105px'}}
    bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
    style={{ width: '250px' }}
  />
  <Column
    header="Estado"
    body={(rowData) => (
      <InputSwitch
        checked={rowData.activo}
        onChange={() => toggleActivo(rowData)}
      />
    )}
    headerStyle={{ textAlign: 'right', paddingLeft:'120px'}}
    bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
    style={{ width: '250px' }}
  />
<Column
  header="Acción"
  body={(rowData) => (
    <>
      <button
        className="admin-button gray"
        title="Visualizar"
        onClick={() => abrirModal('visualizar', rowData)}
      >
        🔍
      </button>
      <button
        className={`admin-button ${rowData.activo ? 'yellow' : 'yellow-disabled'}`}
        title="Editar"
        onClick={() => rowData.activo && abrirModal('editar', rowData)}
        disabled={!rowData.activo}
      >
        ✏️
      </button>
      <button
        className={`admin-button ${rowData.activo ? 'red' : 'red-disabled'}`}
        title="Eliminar"
        onClick={() => rowData.activo && abrirModal('eliminar', rowData)}
        disabled={!rowData.activo}
      >
        🗑️
      </button>
    </>
  )}
  headerStyle={{ textAlign: 'right', paddingLeft:'120px'}}
  bodyStyle={{ textAlign: 'center', paddingLeft:'20px'}}
  style={{ width: '250px' }}
/>
</DataTable>

      {/* Modal Agregar / Editar */}
      {(modalTipo === 'agregar' || modalTipo === 'editar') && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">
            {modalTipo === 'agregar' ? 'Agregar Nueva Categoría' : 'Editar Categoría'}
          </h2>
          <div className="modal-body">
            <label>
              Nombre:
              <input
                type="text"
                value={nombreEditado}
                onChange={(e) => setNombreEditado(e.target.value)}
                className="modal-input"
              />
            </label>
            <label style={{ marginTop: '1rem', display: 'block' }}>
              Descripción:
              <textarea
                value={descripcionEditada}
                onChange={(e) => setDescripcionEditada(e.target.value)}
                className="modal-input"
                rows={3}
              />
            </label>
            {modalTipo === 'editar' && (
          <label style={{ marginTop: '1rem', display: 'block' }}>
            Estado:
            <div style={{ marginTop: '0.5rem' }}>
              <InputSwitch
                checked={categoriaSeleccionada?.activo || false}
                onChange={(e) => {
                  setCategoriaSeleccionada({
                    ...categoriaSeleccionada,
                    activo: e.value
                  });
                }}
              />
              <span style={{ marginLeft: '0.5rem' }}>
                {categoriaSeleccionada?.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </label>
        )}
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn" onClick={modalTipo === 'agregar' ? guardarNuevaCategoria : guardarEdicion}>
              Guardar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Visualizar */}
    {modalTipo === 'visualizar' && categoriaSeleccionada && (
  <Modal visible={modalVisible} onClose={cerrarModal}>
    <h2 className="modal-title">Detalles de la Categoría</h2>
    <div className="modal-body">
      <label>
        Nombre:
        <input
          type="text"
          value={categoriaSeleccionada.nombre}
          readOnly
          className="modal-input"
        />
      </label>
      <label style={{ marginTop: '1rem', display: 'block' }}>
        Descripción:
        <textarea
          value={categoriaSeleccionada.descripcion}
          readOnly
          className="modal-input"
          rows={3}
        />
      </label>
      <label style={{ marginTop: '1rem', display: 'block' }}>
        Estado:
        <div style={{ marginTop: '0.5rem' }}>
          <InputSwitch
            checked={categoriaSeleccionada?.activo || false}
            disabled={true}
          />
          <span style={{ marginLeft: '0.5rem' }}>
            {categoriaSeleccionada?.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </label>
    </div>
    <div className="modal-footer">
      <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cerrar</button>
    </div>
  </Modal>
)}

      {modalTipo === 'eliminar' && categoriaSeleccionada && (
          <Modal visible={modalVisible} onClose={cerrarModal}>
            <h2 className="modal-title">¿Eliminar Categoría?</h2>
            <div className="modal-body">
              <p>¿Estás seguro de que deseas eliminar la categoría <strong>{categoriaSeleccionada.nombre}</strong>?</p>
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
