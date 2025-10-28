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
  
  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      // Cargar usuarios, roles y tipos de documento en paralelo
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
      
      // Fallback a datos mock si hay error
      cargarDatosMock();
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosMock = () => {
    const mockUsuarios = [
      { 
        id: 1, 
        nombres: 'Juan Carlos', 
        apellidos: 'Pérez García',
        correo: 'juan@gmail.com', 
        contraseña: '123456',
        rol_id: 1, 
        rol_nombre: 'Administrador',
        tipo_documento_id: 1,
        tipo_documento_nombre: 'Cédula de Ciudadanía',
        documento: '12345678',
        activo: true 
      },
      { 
        id: 2, 
        nombres: 'María Elena', 
        apellidos: 'García López',
        correo: 'maria@gmail.com', 
        contraseña: '123456',
        rol_id: 2, 
        rol_nombre: 'Repostero',
        tipo_documento_id: 1,
        tipo_documento_nombre: 'Cédula de Ciudadanía',
        documento: '87654321',
        activo: true 
      }
    ];

    const mockRoles = [
      { id: 1, nombre: 'Administrador' },
      { id: 2, nombre: 'Repostero' },
      { id: 3, nombre: 'Decorador' },
      { id: 4, nombre: 'Vendedor' }
    ];

    const mockTiposDocumento = [
      { id: 1, nombre: 'Cédula de Ciudadanía' },
      { id: 2, nombre: 'Cédula de Extranjería' },
      { id: 3, nombre: 'Pasaporte' },
      { id: 4, nombre: 'NIT' }
    ];

    setUsuarios(mockUsuarios);
    setRoles(mockRoles);
    setTiposDocumento(mockTiposDocumento);
  };

  const toggleActivo = async (usuario) => {
    try {
      const nuevoEstado = !usuario.activo;
      
      // Llamar a la API para cambiar el estado
      await usuarioApiService.cambiarEstadoUsuario(usuario.id, nuevoEstado);
      
      // Actualizar el estado local
      const updated = usuarios.map(usr =>
        usr.id === usuario.id ? { ...usr, activo: nuevoEstado } : usr
      );
      setUsuarios(updated);
      
      showNotification(
        `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`
      );
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showNotification('Error al cambiar el estado del usuario: ' + error.message, 'error');
    }
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const abrirModal = (tipo, usuario = null) => {
    // Bloquear edición y eliminación si el usuario está desactivado
    if ((tipo === 'editar' || tipo === 'eliminar') && usuario && !usuario.activo) {
      showNotification('No se puede realizar esta acción en un usuario desactivado', 'error');
      return;
    }
    // Bloquear eliminación si el usuario tiene el rol de Administrador
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
        // Crear nuevo usuario a través de la API
        const nuevoUsuario = await usuarioApiService.crearUsuario(formData);
        
        // Actualizar la lista local
        setUsuarios([...usuarios, nuevoUsuario]);
        showNotification('Usuario agregado exitosamente');
        
      } else if (modalTipo === 'editar') {
        // Actualizar usuario a través de la API
        const usuarioActualizado = await usuarioApiService.actualizarUsuario(
          usuarioSeleccionado.id, 
          formData
        );
        
        // Actualizar la lista local
        const updated = usuarios.map(usr =>
          usr.id === usuarioSeleccionado.id ? usuarioActualizado : usr
        );
        setUsuarios(updated);
        showNotification('Usuario actualizado exitosamente');
      }
      
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      showNotification('Error al guardar el usuario: ' + error.message, 'error');
    }
  };

  const confirmarEliminar = async () => {
    try {
      // Eliminar usuario a través de la API
      await usuarioApiService.eliminarUsuario(usuarioSeleccionado.id);
      
      // Actualizar la lista local
      const updated = usuarios.filter(usr => usr.id !== usuarioSeleccionado.id);
      setUsuarios(updated);
      
      cerrarModal();
      showNotification('Usuario eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
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

  if (loading) {
    return <LoadingSpinner />;
  }

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
          + Agregar 
        </button>
        <SearchBar
          placeholder="Buscar usuario..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <h2 className="admin-section-title">Gestión de Usuarios</h2>
        <DataTable
          value={usuariosFiltrados}
          className="admin-table compact-paginator"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          tableStyle={{ minWidth: '50rem' }}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          pageLinkSize={3}
        >
        <Column 
          header="N°" 
          body={(rowData, { rowIndex }) => rowIndex + 1} 
          style={{ width: '3rem', textAlign: 'center' }}
          headerStyle={{ paddingLeft: '1rem' }}
        />
        <Column 
          field="nombres" 
          header="Nombres" 
          headerStyle={{ paddingLeft: '2.5rem' }}
        />
        <Column 
          field="apellidos" 
          header="Apellidos" 
          headerStyle={{ paddingLeft: '4rem' }}
        />
        <Column 
          field="correo" 
          header="Correo" 
          headerStyle={{ paddingLeft: '10rem' }}
        />
        <Column 
          field="rol_nombre" 
          header="Rol" 
          headerStyle={{ paddingLeft: '3.5rem' }}
        />
        <Column
          header="Estado"
          headerStyle={{ paddingLeft: '1rem' }}
          body={(rowData) => (
            <InputSwitch
              checked={rowData.activo}
              onChange={() => toggleActivo(rowData)}
            />
          )}
        />
        <Column
          header="Acciones"
          headerStyle={{ paddingLeft: '3rem' }}
          body={(rowData) => {
            const esAdmin = rowData.rol_nombre === 'Administrador';
            const puedeEditar = rowData.activo;
            const puedeEliminar = rowData.activo && !esAdmin;
            
            // Determinar el texto del tooltip
            const getTooltipEditar = () => {
              if (!rowData.activo) return "Usuario desactivado";
              return "Editar";
            };
            
            const getTooltipEliminar = () => {
              if (esAdmin) return "No se puede eliminar un Administrador";
              if (!rowData.activo) return "Usuario desactivado";
              return "Eliminar";
            };
            
            return (
              <>
                <Tooltip text="Visualizar" position="top">
                  <button 
                    className="admin-button gray" 
                    onClick={() => abrirModal('visualizar', rowData)}
                  >
                    👁
                  </button>
                </Tooltip>
                
                <Tooltip text={getTooltipEditar()} position="top">
                  <button
                    className={`admin-button yellow ${!puedeEditar ? 'disabled' : ''}`}
                    onClick={() => abrirModal('editar', rowData)}
                    disabled={!puedeEditar}
                    style={{
                      opacity: puedeEditar ? 1 : 0.5,
                      cursor: puedeEditar ? 'pointer' : 'not-allowed'
                    }}
                  >
                    ✏️
                  </button>
                </Tooltip>
                
                <Tooltip text={getTooltipEliminar()} position="top">
                  <button
                    className={`admin-button red ${!puedeEliminar ? 'disabled' : ''}`}
                    onClick={() => abrirModal('eliminar', rowData)}
                    disabled={!puedeEliminar}
                    style={{
                      opacity: puedeEliminar ? 1 : 0.5,
                      cursor: puedeEliminar ? 'pointer' : 'not-allowed'
                    }}
                  >
                    🗑️
                  </button>
                </Tooltip>
              </>
            );
          }}
        />
      </DataTable>

      {/* Modal Agregar/Editar/Visualizar */}
      {(modalTipo === 'agregar' || modalTipo === 'editar' || modalTipo === 'visualizar') && modalVisible && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title modal-title-compact">
            {modalTipo === 'agregar' ? 'Agregar Usuario' : modalTipo === 'editar' ? 'Editar Usuario' : 'Detalles del Usuario'}
          </h2>
          <UsuariosForm
            modalTipo={modalTipo}
            usuarioSeleccionado={usuarioSeleccionado}
            roles={roles}
            tiposDocumento={tiposDocumento}
            usuarios={usuarios}
            onSave={guardarUsuario}
            onCancel={cerrarModal}
            setNotification={setNotification}
          />
        </Modal>
      )}

      {modalTipo === 'eliminar' && modalVisible && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <div className="flex flex-col gap-1.5 p-2.5">
            <h2 className="text-lg font-semibold text-gray-800 m-0 pb-1 border-b-2" style={{ borderColor: '#d81b60' }}>
              Confirmar Eliminación
            </h2>
            <p className="text-sm text-gray-700 mt-1">
              ¿Está seguro de que desea eliminar al usuario{' '}
              <strong>{usuarioSeleccionado?.nombres} {usuarioSeleccionado?.apellidos}</strong>?
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
              <button className="modal-btn save-btn" onClick={confirmarEliminar}>Eliminar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}