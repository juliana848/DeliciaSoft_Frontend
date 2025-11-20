import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../../adminStyles.css';
import Modal from '../../components/modal';
import SearchBar from '../../components/SearchBar';
import Notification from '../../components/Notification';
import Tooltip from '../../components/Tooltip';
import UsuariosForm from './components/UsuariosForm';
import usuarioApiService from '../../services/usuarios_services';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      const [usuariosData, rolesData, tiposDocData] = await Promise.all([
        usuarioApiService.obtenerUsuarios(),
        usuarioApiService.obtenerRoles(),
        usuarioApiService.obtenerTiposDocumento()
      ]);
      setUsuarios(usuariosData);
      setRoles(rolesData);
      setTiposDocumento(tiposDocData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification('Error al cargar los datos: ' + error.message, 'error');
      cargarDatosMock();
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosMock = () => {
    const mockUsuarios = [
      { id: 1, nombres: 'Juan Carlos', apellidos: 'Pérez García', correo: 'juan@gmail.com', rol_id: 1, rol_nombre: 'Administrador', tipo_documento_id: 1, documento: '12345678', activo: true },
      { id: 2, nombres: 'María Elena', apellidos: 'García López', correo: 'maria@gmail.com', rol_id: 2, rol_nombre: 'Repostero', tipo_documento_id: 1, documento: '87654321', activo: true }
    ];
    const mockRoles = [{ id: 1, nombre: 'Administrador' }, { id: 2, nombre: 'Repostero' }];
    const mockTiposDocumento = [{ id: 1, nombre: 'Cédula de Ciudadanía' }];
    setUsuarios(mockUsuarios);
    setRoles(mockRoles);
    setTiposDocumento(mockTiposDocumento);
  };

  const toggleActivo = async (usuario) => {
    try {
      const nuevoEstado = !usuario.activo;
      await usuarioApiService.cambiarEstadoUsuario(usuario.id, nuevoEstado);
      const updated = usuarios.map(usr => usr.id === usuario.id ? { ...usr, activo: nuevoEstado } : usr);
      setUsuarios(updated);
      showNotification(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      showNotification('Error al cambiar el estado: ' + error.message, 'error');
    }
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const abrirModal = (tipo, usuario = null) => {
    if ((tipo === 'editar' || tipo === 'eliminar') && usuario && !usuario.activo) {
      showNotification('No se puede realizar esta acción en un usuario desactivado', 'error');
      return;
    }
    if (tipo === 'eliminar' && usuario && usuario.rol_nombre === 'Administrador') {
      showNotification('No se puede eliminar un usuario con el rol de Administrador', 'error');
      return;
    }
    setModalTipo(tipo);
    setUsuarioSeleccionado(usuario);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setUsuarioSeleccionado(null);
    setModalTipo(null);
  };

  const guardarUsuario = async (formData) => {
    try {
      if (modalTipo === 'agregar') {
        const nuevoUsuario = await usuarioApiService.crearUsuario(formData);
        setUsuarios([...usuarios, nuevoUsuario]);
        showNotification('Usuario agregado exitosamente');
      } else if (modalTipo === 'editar') {
        const usuarioActualizado = await usuarioApiService.actualizarUsuario(usuarioSeleccionado.id, formData);
        const updated = usuarios.map(usr => usr.id === usuarioSeleccionado.id ? usuarioActualizado : usr);
        setUsuarios(updated);
        showNotification('Usuario actualizado exitosamente');
      }
      cerrarModal();
    } catch (error) {
      showNotification('Error al guardar el usuario: ' + error.message, 'error');
    }
  };

  const confirmarEliminar = async () => {
    try {
      await usuarioApiService.eliminarUsuario(usuarioSeleccionado.id);
      const updated = usuarios.filter(usr => usr.id !== usuarioSeleccionado.id);
      setUsuarios(updated);
      cerrarModal();
      showNotification('Usuario eliminado exitosamente');
    } catch (error) {
      showNotification('Error al eliminar el usuario: ' + error.message, 'error');
    }
  };

  const usuariosFiltrados = usuarios.filter(usr =>
    usr.id.toString().includes(filtro.toLowerCase()) ||
    usr.nombres.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.correo.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.rol_nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-wrapper">
      <Notification visible={notification.visible} mensaje={notification.mensaje} tipo={notification.tipo} onClose={hideNotification} />

      {/* Toolbar: Buscador + Agregar a la derecha */}
      <div className="admin-toolbar">
        <SearchBar placeholder="Buscar usuario..." value={filtro} onChange={setFiltro} />
        <button className="admin-button pink" onClick={() => abrirModal('agregar')} type="button">
          <i className="fas fa-plus"></i> Agregar
        </button>
      </div>

      <h2 className="admin-section-title">Gestión de Usuarios</h2>
      
      <DataTable value={usuariosFiltrados} className="admin-table compact-paginator" paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} tableStyle={{ minWidth: '50rem' }}>
        <Column header="N°" body={(rowData, { rowIndex }) => rowIndex + 1} style={{ width: '50px' }} />
        <Column field="nombres" header="Nombres" />
        <Column field="apellidos" header="Apellidos" />
        <Column field="correo" header="Correo" />
        <Column field="rol_nombre" header="Rol" />
        <Column header="Estado" body={(rowData) => (
          <InputSwitch checked={rowData.activo} onChange={() => toggleActivo(rowData)} />
        )} style={{ width: '80px' }} />
        <Column header="Acciones" body={(rowData) => {
          const esAdmin = rowData.rol_nombre === 'Administrador';
          const puedeEditar = rowData.activo;
          const puedeEliminar = rowData.activo && !esAdmin;
          
          return (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
              <Tooltip text="Visualizar">
                <button className="admin-button" onClick={() => abrirModal('visualizar', rowData)}
                  style={{ background: '#e3f2fd', color: '#1976d2', border: 'none', borderRadius: '6px', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-eye" style={{ fontSize: '11px' }}></i>
                </button>
              </Tooltip>
              <Tooltip text={puedeEditar ? "Editar" : "Usuario desactivado"}>
                <button className="admin-button" onClick={() => abrirModal('editar', rowData)} disabled={!puedeEditar}
                  style={{ background: puedeEditar ? '#fff8e1' : '#f5f5f5', color: puedeEditar ? '#f57c00' : '#bbb', border: 'none', borderRadius: '6px', width: '26px', height: '26px', cursor: puedeEditar ? 'pointer' : 'not-allowed', opacity: puedeEditar ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-pen" style={{ fontSize: '11px' }}></i>
                </button>
              </Tooltip>
              <Tooltip text={puedeEliminar ? "Eliminar" : esAdmin ? "No se puede eliminar Admin" : "Usuario desactivado"}>
                <button className="admin-button" onClick={() => abrirModal('eliminar', rowData)} disabled={!puedeEliminar}
                  style={{ background: puedeEliminar ? '#ffebee' : '#f5f5f5', color: puedeEliminar ? '#d32f2f' : '#bbb', border: 'none', borderRadius: '6px', width: '26px', height: '26px', cursor: puedeEliminar ? 'pointer' : 'not-allowed', opacity: puedeEliminar ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-trash" style={{ fontSize: '11px' }}></i>
                </button>
              </Tooltip>
            </div>
          );
        }} style={{ width: '100px' }} />
      </DataTable>

      {(modalTipo === 'agregar' || modalTipo === 'editar' || modalTipo === 'visualizar') && modalVisible && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">{modalTipo === 'agregar' ? 'Agregar Usuario' : modalTipo === 'editar' ? 'Editar Usuario' : 'Detalles del Usuario'}</h2>
          <UsuariosForm modalTipo={modalTipo} usuarioSeleccionado={usuarioSeleccionado} roles={roles} tiposDocumento={tiposDocumento} usuarios={usuarios} onSave={guardarUsuario} onCancel={cerrarModal} setNotification={setNotification} />
        </Modal>
      )}

      {modalTipo === 'eliminar' && modalVisible && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Confirmar Eliminación</h2>
          <p>¿Está seguro de eliminar al usuario <strong>{usuarioSeleccionado?.nombres} {usuarioSeleccionado?.apellidos}</strong>?</p>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn" onClick={confirmarEliminar}>Eliminar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}