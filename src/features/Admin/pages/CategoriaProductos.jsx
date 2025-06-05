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
  const [fechaRegistroEditada, setFechaRegistroEditada] = useState('');

  useEffect(() => {
    const mockCategorias = [
      { id: 301, nombre: 'Fresas con crema', fecha_registro: '19/02/2024', activo: true },
      { id: 302, nombre: 'Obleas', fecha_registro: '20/01/2024', activo: true },
      { id: 303, nombre: 'Cupcakes', fecha_registro: '19/02/2022', activo: true },
      { id: 304, nombre: 'Postres', fecha_registro: '07/02/2022', activo: false },
      { id: 305, nombre: 'Pasteles', fecha_registro: '11/03/2022', activo: true },
      { id: 306, nombre: 'Arroz con leche', fecha_registro: '19/07/2022', activo: false },
    ];
    setCategorias(mockCategorias);
  }, []);

  const toggleActivo = (categoria) => {
    const updated = categorias.map(cat =>
      cat.id === categoria.id ? { ...cat, activo: !cat.activo } : cat
    );
    setCategorias(updated);
    showNotification(`Categoría de productos ${categoria.activo ? 'desactivada' : 'activada'} exitosamente`);
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
    
    }
    if (tipo === 'agregar') {
      setNombreEditado('');
      setFechaRegistroEditada('');
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
    setFechaRegistroEditada('');
  };

  const validarFormulario = () => {
    if (!nombreEditado.trim()) {
      showNotification('El nombre es obligatorio', 'error');
      return false;
    }
    if (modalTipo === 'agregar' && !fechaRegistroEditada) {
      showNotification('La fecha de registro es obligatoria', 'error');
      return false;
    }
    return true;
  };

  const guardarEdicion = () => {
    if (!validarFormulario()) return;

    const updated = categorias.map(cat =>
      cat.id === categoriaSeleccionada.id ? { ...cat, nombre: nombreEditado } : cat
    );
    setCategorias(updated);
    cerrarModal();
    showNotification('Categoría de producto editada exitosamente');
  };

  const confirmarEliminar = () => {
    const updated = categorias.filter(cat => cat.id !== categoriaSeleccionada.id);
    setCategorias(updated);
    cerrarModal();
    showNotification('Categoría de producto eliminada exitosamente');
  };

  const guardarNuevaCategoria = () => {
    if (!validarFormulario()) return;

    const nuevoId = categorias.length ? Math.max(...categorias.map(c => c.id)) + 1 : 1;

    // Formatear fecha de yyyy-mm-dd a dd/mm/yyyy
    const [year, month, day] = fechaRegistroEditada.split('-');
    const fechaFormateada = `${day}/${month}/${year}`;

    setCategorias([...categorias, {
      id: nuevoId,
      nombre: nombreEditado,
      fecha_registro: fechaFormateada,
      activo: true
    }]);

    cerrarModal();
    showNotification('Categoría de producto agregada exitosamente');
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

      {/* buscador */}
      <div className="admin-toolbar">
        <button
          className="admin-button pink"
          onClick={abrirModalAgregar}
          type="button"
        >
          + Agregar
        </button>
        <SearchBar
          placeholder="Buscar categoría de productos..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <h2 className="admin-section-title">Cat-Productos</h2>
      {/* tabla */}
      <DataTable
        value={categoriasFiltradas}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
      >
        {/* <Column field="id" header="ID" /> */}
        <Column
          header="Numero"
          body={(_, { rowIndex }) => (categoriasFiltradas.indexOf(categoriasFiltradas[rowIndex]) + 1)}
          style={{ width: '3rem' }}
        />
        <Column field="nombre" header="Nombre" />
        <Column field="fecha_registro" header="Fecha Registro" />
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
          body={(rowData) => (
            <>
              
              <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('visualizar', rowData)}>
                &#128065; {/* 👁 */}
              </button>
              <button
                className="admin-button yellow"
                title="Editar"
                onClick={() => abrirModal('editar', rowData)}
              >
                ✏️
              </button>
              <button
                className="admin-button red"
                title="Eliminar"
                onClick={() => abrirModal('eliminar', rowData)}
              >
                🗑️
              </button>
            </>
          )}
        />
      </DataTable>

      {/* Modal Agregar */}
      {modalTipo === 'agregar' && modalVisible && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Agregar Nueva Categoría</h2>
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
              Fecha de Registro:
              <input
                type="date"
                value={fechaRegistroEditada}
                onChange={(e) => setFechaRegistroEditada(e.target.value)}
                className="modal-input"
              />
            </label>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button
              className="modal-btn save-btn"
              onClick={() => {
                if (nombreEditado.trim() === '') return alert('El nombre es obligatorio');
                if (fechaRegistroEditada === '') return alert('La fecha de registro es obligatoria');

                const nuevoId = categorias.length ? Math.max(...categorias.map(c => c.id)) + 1 : 1;

                // Formatear fecha de yyyy-mm-dd a dd/mm/yyyy
                const [year, month, day] = fechaRegistroEditada.split('-');
                const fechaFormateada = `${day}/${month}/${year}`;

                setCategorias([...categorias, {
                  id: nuevoId,
                  nombre: nombreEditado,
                  fecha_registro: fechaFormateada,
                  activo: true
                }]);

                cerrarModal();
                mostrarMensaje('Categoría de producto agregada con éxito');
              }}
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
            <p><strong>ID:</strong> {categoriaSeleccionada.id}</p>
            <p><strong>Nombre:</strong> {categoriaSeleccionada.nombre}</p>
            <p><strong>Fecha Registro:</strong> {categoriaSeleccionada.fecha_registro}</p>
            <p><strong>Activo:</strong> {categoriaSeleccionada.activo ? 'Sí' : 'No'}</p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cerrar</button>
          </div>
        </Modal>
      )}

      {/* Modal Editar */}
      {modalTipo === 'editar' && categoriaSeleccionada && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Editar Categoría</h2>
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
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn" onClick={guardarEdicion}>Guardar</button>
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