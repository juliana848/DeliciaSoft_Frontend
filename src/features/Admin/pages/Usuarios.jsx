import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    rol_id: '',
    activo: true
  });

  useEffect(() => {
    const mockUsuarios = [
      { 
        id: 1, 
        nombres: 'Juan Carlos', 
        apellidos: 'Pérez López', 
        correo: 'juan@gmail.com', 
        rol_id: 1, 
        rol_nombre: 'Administrador', 
        activo: true 
      },
      { 
        id: 2, 
        nombres: 'María Elena', 
        apellidos: 'García Ruiz', 
        correo: 'maria@gmail.com', 
        rol_id: 2, 
        rol_nombre: 'Repostero', 
        activo: true 
      },
      { 
        id: 3, 
        nombres: 'Carlos Alberto', 
        apellidos: 'Rodríguez Hernández', 
        correo: 'carlos@gmail.com', 
        rol_id: 3, 
        rol_nombre: 'Decorador', 
        activo: false 
      },
      { 
        id: 4, 
        nombres: 'Ana Patricia', 
        apellidos: 'Martínez González', 
        correo: 'ana@gmail.com', 
        rol_id: 2, 
        rol_nombre: 'Repostero', 
        activo: true 
      },
      { 
        id: 5, 
        nombres: 'Luis Fernando', 
        apellidos: 'Fernández Castro', 
        correo: 'luis@gmail.com', 
        rol_id: 1, 
        rol_nombre: 'Administrador', 
        activo: true 
      }
    ];

    const mockRoles = [
      { id: 1, nombre: 'Administrador' },
      { id: 2, nombre: 'Repostero' },
      { id: 3, nombre: 'Decorador' },
      { id: 4, nombre: 'Vendedor' }
    ];

    setUsuarios(mockUsuarios);
    setRoles(mockRoles);
  }, []);

  const toggleActivo = (usuario) => {
    const updated = usuarios.map(usr =>
      usr.id === usuario.id ? { ...usr, activo: !usr.activo } : usr
    );
    setUsuarios(updated);
    showNotification(`Usuario ${usuario.activo ? 'desactivado' : 'activado'} exitosamente`);
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const abrirModal = (tipo, usuario = null) => {
    setModalTipo(tipo);
    setUsuarioSeleccionado(usuario);
    
    if (tipo === 'agregar') {
      setFormData({
        nombres: '',
        apellidos: '',
        correo: '',
        rol_id: '',
        activo: true
      });
    } else if (tipo === 'editar' && usuario) {
      setFormData({
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        rol_id: usuario.rol_id,
        activo: usuario.activo
      });
    }
    
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setUsuarioSeleccionado(null);
    setModalTipo(null);
    setFormData({
      nombres: '',
      apellidos: '',
      correo: '',
      rol_id: '',
      activo: true
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // CORRECCIÓN: Validación sin el campo telefono que no existe
  const validarFormulario = () => {
    const { nombres, apellidos, correo, rol_id } = formData;
    
    if (!nombres.trim()) {
      showNotification('El nombre es obligatorio', 'error');
      return false;
    }
    if (!apellidos.trim()) {
      showNotification('Los apellidos son obligatorios', 'error');
      return false;
    }
    if (!correo.trim()) {
      showNotification('El correo es obligatorio', 'error');
      return false;
    }
    if (!rol_id) {
      showNotification('Debe seleccionar un rol', 'error');
      return false;
    }
    
    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      showNotification('El formato del correo no es válido', 'error');
      return false;
    }
    
    // Validar que el correo no esté duplicado
    const correoExistente = usuarios.find(usr => 
      usr.correo.toLowerCase() === correo.toLowerCase() && 
      (modalTipo === 'agregar' || usr.id !== usuarioSeleccionado?.id)
    );
    
    if (correoExistente) {
      showNotification('Ya existe un usuario con este correo', 'error');
      return false;
    }
    
    return true;
  };

  const guardarUsuario = () => {
    if (!validarFormulario()) return;

    const rolSeleccionado = roles.find(r => r.id === parseInt(formData.rol_id));
    
    if (modalTipo === 'agregar') {
      const nuevoId = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
      const nuevoUsuario = {
        ...formData,
        id: nuevoId,
        rol_id: parseInt(formData.rol_id),
        rol_nombre: rolSeleccionado.nombre
      };
      
      setUsuarios([...usuarios, nuevoUsuario]);
      showNotification('Usuario agregado exitosamente');
    } else if (modalTipo === 'editar') {
      const updated = usuarios.map(usr =>
        usr.id === usuarioSeleccionado.id 
          ? { ...usr, ...formData, rol_id: parseInt(formData.rol_id), rol_nombre: rolSeleccionado.nombre }
          : usr
      );
      setUsuarios(updated);
      showNotification('Usuario actualizado exitosamente');
    }
    
    cerrarModal();
  };

  const confirmarEliminar = () => {
    const updated = usuarios.filter(usr => usr.id !== usuarioSeleccionado.id);
    setUsuarios(updated);
    cerrarModal();
    showNotification('Usuario eliminado exitosamente');
  };

  const usuariosFiltrados = usuarios.filter(usr =>
    usr.nombres.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.correo.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.rol_nombre.toLowerCase().includes(filtro.toLowerCase())
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
          onClick={() => abrirModal('agregar')}
          type="button"
        >
          + Agregar Usuario
        </button>
        <SearchBar
          placeholder="Buscar usuario..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <DataTable
        value={usuariosFiltrados}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column field="id" header="ID" />
        <Column field="nombres" header="Nombres" />
        <Column field="apellidos" header="Apellidos" />
        <Column field="correo" header="Correo" />
        <Column field="rol_nombre" header="Rol" />
        <Column
          header="Estado"
          body={(rowData) => (
            <InputSwitch
              checked={rowData.activo}
              onChange={() => toggleActivo(rowData)}
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

      {/* Modal Agregar/Editar */}
      {(modalTipo === 'agregar' || modalTipo === 'editar') && modalVisible && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">
            {modalTipo === 'agregar' ? 'Agregar Nuevo Usuario' : 'Editar Usuario'}
          </h2>
          <div className="modal-body">
            <div className="modal-grid">
              <div className="modal-field">
                <label>Nombres:</label>
                <input
                  type="text"
                  value={formData.nombres}
                  onChange={(e) => handleInputChange('nombres', e.target.value)}
                  className="modal-input"
                  placeholder="Ej: Juan Carlos"
                />
              </div>
              <div className="modal-field">
                <label>Apellidos:</label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  className="modal-input"
                  placeholder="Ej: Pérez López"
                />
              </div>
              <div className="modal-field">
                <label>Correo:</label>
                <input
                  type="email"
                  value={formData.correo}
                  onChange={(e) => handleInputChange('correo', e.target.value)}
                  className="modal-input"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div className="modal-field">
                <label>Rol:</label>
                <select
                  value={formData.rol_id}
                  onChange={(e) => handleInputChange('rol_id', e.target.value)}
                  className="modal-select"
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map(rol => (
                    <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn" onClick={guardarUsuario}>Guardar</button>
          </div>
        </Modal>
      )}

      {/* Modal Visualizar */}
      {modalTipo === 'visualizar' && usuarioSeleccionado && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Detalles del Usuario</h2>
          <div className="modal-body">
            <p><strong>ID:</strong> {usuarioSeleccionado.id}</p>
            <p><strong>Nombres:</strong> {usuarioSeleccionado.nombres}</p>
            <p><strong>Apellidos:</strong> {usuarioSeleccionado.apellidos}</p>
            <p><strong>Correo:</strong> {usuarioSeleccionado.correo}</p>
            <p><strong>Rol:</strong> {usuarioSeleccionado.rol_nombre}</p>
            <p><strong>Estado:</strong> {usuarioSeleccionado.activo ? 'Activo' : 'Inactivo'}</p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cerrar</button>
          </div>
        </Modal>
      )}

      {/* Modal Eliminar */}
      {modalTipo === 'eliminar' && usuarioSeleccionado && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Confirmar Eliminación</h2>
          <div className="modal-body">
            <p>¿Está seguro que desea eliminar el usuario <strong>{usuarioSeleccionado.nombres} {usuarioSeleccionado.apellidos}</strong>?</p>
            <p style={{ color: '#e53935', fontSize: '14px' }}>
              Esta acción no se puede deshacer.
            </p>
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