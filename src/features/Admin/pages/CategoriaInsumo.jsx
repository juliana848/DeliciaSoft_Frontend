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
  const [fechaRegistroEditada, setFechaRegistroEditada] = useState('');

  useEffect(() => {
    const mockCategorias = [
      { id: 201, nombre: 'Frutas', fecha_registro: '19/02/2024', activo: true },
      { id: 202, nombre: 'Chocolate', fecha_registro: '20/01/2024', activo: true },
      { id: 203, nombre: 'Lácteos', fecha_registro: '19/02/2022', activo: true },
      { id: 204, nombre: 'Harinas', fecha_registro: '07/02/2022', activo: false },
      { id: 205, nombre: 'Proteínas', fecha_registro: '11/03/2022', activo: true },
      { id: 206, nombre: 'Condimentos', fecha_registro: '19/07/2022', activo: false },
      { id: 207, nombre: 'Endulzantes', fecha_registro: '19/02/2021', activo: true },
      { id: 208, nombre: 'Frutos Secos', fecha_registro: '26/04/2020', activo: true },
      { id: 209, nombre: 'Colorantes', fecha_registro: '19/03/2020', activo: false },
      { id: 210, nombre: 'Utensilios', fecha_registro: '17/02/2020', activo: true }
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

      {/* Toolbar: botón a la izquierda, buscador a la derecha */}
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

      <DataTable
        value={categoriasFiltradas}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column field="id" header="ID" />
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
              <button
                className="admin-button gray"
                title="Visualizar"
                onClick={() => abrirModal('visualizar', rowData)}
              >
                👁️
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
            <button className="modal-btn save-btn" onClick={guardarNuevaCategoria}>
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