import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../../adminStyles.css';
import Modal from '../../components/modal';
import SearchBar from '../../components/SearchBar';
import Notification from '../../components/Notification';
import Tooltip from '../../components/Tooltip';
import RoleForm from './Components/FormRol';
import roleApiService from '../../services/roles_services';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    permisos: [],
    activo: true
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [permisosData, rolesData] = await Promise.all([
        roleApiService.obtenerPermisos(),
        roleApiService.obtenerRoles()
      ]);
      setPermisos(permisosData);
      setRoles(rolesData);
      showNotification('Datos cargados correctamente', 'success');
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification(`Error al cargar datos: ${error.message}`, 'error');
      const permisosMock = roleApiService.obtenerPermisosMock();
      setPermisos(permisosMock);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivo = async (rol) => {
    try {
      if (roleApiService.esRolAdmin(rol.nombre) && rol.activo) {
        showNotification('No se puede desactivar el rol Admin. Este rol debe permanecer siempre activo.', 'error');
        return;
      }
      const nuevoEstado = !rol.activo;
      await roleApiService.cambiarEstadoRol(rol.id, nuevoEstado);
      const updated = roles.map(r => r.id === rol.id ? { ...r, activo: nuevoEstado } : r);
      setRoles(roleApiService.ordenarRolesConAdminPrimero(updated));
      showNotification(`Rol ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`, 'success');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showNotification(`Error al cambiar estado: ${error.message}`, 'error');
    }
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
    setTimeout(() => setNotification({ visible: false, mensaje: '', tipo: 'success' }), 5000);
  };

  const hideNotification = () => setNotification({ visible: false, mensaje: '', tipo: 'success' });

  const abrirModal = async (tipo, rol = null) => {
    if (rol && roleApiService.esRolAdmin(rol.nombre)) {
      if (tipo === 'editar') {
        showNotification('No se puede editar el rol Admin. Este rol está protegido del sistema.', 'error');
        return;
      }
      if (tipo === 'eliminar') {
        showNotification('No se puede eliminar el rol Admin. Este rol es esencial para el sistema.', 'error');
        return;
      }
    }
    setModalTipo(tipo);
    setRolSeleccionado(rol);
    if (tipo === 'agregar') {
      setFormData({ nombre: '', descripcion: '', permisos: [], activo: true });
    } else if ((tipo === 'editar' || tipo === 'visualizar') && rol) {
      try {
        const permisosRol = await roleApiService.obtenerPermisosRol(rol.id);
        setFormData({ nombre: rol.nombre, descripcion: rol.descripcion, permisos: permisosRol, activo: rol.activo });
      } catch (error) {
        setFormData({ nombre: rol.nombre, descripcion: rol.descripcion, permisos: rol.permisos || [], activo: rol.activo });
        showNotification('Advertencia: No se pudieron cargar los permisos actuales', 'warn');
      }
    }
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setRolSeleccionado(null);
    setModalTipo(null);
    setFormData({ nombre: '', descripcion: '', permisos: [], activo: true });
  };

  const guardarRol = async (data) => {
    try {
      let rolActualizado;
      if (modalTipo === 'agregar') {
        rolActualizado = await roleApiService.crearRol(data);
        const nuevosRoles = [...roles, rolActualizado];
        setRoles(roleApiService.ordenarRolesConAdminPrimero(nuevosRoles));
        showNotification('Rol agregado exitosamente', 'success');
      } else if (modalTipo === 'editar') {
        rolActualizado = await roleApiService.actualizarRol(rolSeleccionado.id, data);
        const rolesActualizados = roles.map(r => r.id === rolSeleccionado.id ? rolActualizado : r);
        setRoles(roleApiService.ordenarRolesConAdminPrimero(rolesActualizados));
        showNotification('Rol actualizado exitosamente', 'success');
      }
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar rol:', error);
      showNotification(`Error al guardar rol: ${error.message}`, 'error');
    }
  };

  const confirmarEliminar = async () => {
    try {
      if (roleApiService.esRolAdmin(rolSeleccionado.nombre)) {
        showNotification('No se puede eliminar el rol Admin. Este rol es esencial para el sistema.', 'error');
        cerrarModal();
        return;
      }
      const tieneUsuarios = await roleApiService.rolTieneUsuarios(rolSeleccionado.id);
      if (tieneUsuarios) {
        showNotification('No se puede eliminar este rol porque tiene usuarios asociados', 'error');
        cerrarModal();
        return;
      }
      await roleApiService.eliminarRol(rolSeleccionado.id);
      const updated = roles.filter(r => r.id !== rolSeleccionado.id);
      setRoles(roleApiService.ordenarRolesConAdminPrimero(updated));
      cerrarModal();
      showNotification('Rol eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      showNotification(`Error al eliminar rol: ${error.message}`, 'error');
    }
  };

  const puedeEjecutarAccion = (rol, accion) => {
    const esAdmin = roleApiService.esRolAdmin(rol.nombre);
    switch (accion) {
      case 'editar':
      case 'eliminar':
        return !esAdmin && rol.activo;
      case 'toggleEstado':
        return !esAdmin || (esAdmin && rol.activo);
      default:
        return true;
    }
  };

  const rolesFiltrados = roles.filter(rol => {
    const filterText = filtro.toLowerCase();
    return rol.nombre.toLowerCase().includes(filterText) || rol.descripcion.toLowerCase().includes(filterText) || rol.id.toString().includes(filterText);
  });

  const getPermisosNombres = (permisosIds) => {
    if (!Array.isArray(permisosIds)) return '';
    return permisos.filter(p => permisosIds.includes(p.id)).map(p => p.nombre).join(', ');
  };

  const RolBadge = ({ rol }) => {
    const esAdmin = roleApiService.esRolAdmin(rol.nombre);
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <span>{rol.nombre}</span>
        {esAdmin && (
          <span style={{ backgroundColor: '#d81b60', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>
            SISTEMA
          </span>
        )}
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-wrapper">
      <Notification visible={notification.visible} mensaje={notification.mensaje} tipo={notification.tipo} onClose={hideNotification} />

      {/* Toolbar: SearchBar izquierda + Agregar derecha (como Usuarios) */}
      <div className="admin-toolbar">
        <SearchBar placeholder="Buscar rol " value={filtro} onChange={setFiltro} />
        <button className="admin-button pink" onClick={() => abrirModal('agregar')} type="button">
          <i className="fas fa-plus"></i> Agregar
        </button>
      </div>

      <h2 className="admin-section-title">Gestión de Roles</h2>
      
      <DataTable
        value={rolesFiltrados}
        className="admin-table compact-paginator"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
        rowClassName={(rowData) => {
          const esAdmin = roleApiService.esRolAdmin(rowData.nombre);
          if (esAdmin) return 'fila-admin';
          if (!rowData.activo) return 'fila-inactiva';
          return '';
        }}
        emptyMessage="No se encontraron roles"
      >
        <Column
          header="N°"
          body={(rowData, { rowIndex }) => rowIndex + 1}
          style={{ width: '50px' }}
        />
        <Column
          field="nombre"
          header="Nombre"
          body={(rowData) => <RolBadge rol={rowData} />}
        />
        <Column
          field="descripcion"
          header="Descripción"
        />
        <Column
          header="Permisos"
          body={(rowData) => (
            <span title={getPermisosNombres(rowData.permisos)}>
              {rowData.permisos?.length || 0} permisos
            </span>
          )}
        />
        <Column
          header="Estado"
          body={(rowData) => {
            const esAdmin = roleApiService.esRolAdmin(rowData.nombre);
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <InputSwitch checked={rowData.activo} onChange={() => toggleActivo(rowData)} disabled={esAdmin && rowData.activo} />
                {esAdmin && rowData.activo && <i className="fas fa-lock" title="El rol Admin no se puede desactivar" style={{ color: '#d32f2f', fontSize: '0.8rem' }} />}
              </div>
            );
          }}
          style={{ width: '80px' }}
        />
        <Column
          header="Acciones"
          body={(rowData) => {
            const esAdmin = roleApiService.esRolAdmin(rowData.nombre);
            const puedeEditar = puedeEjecutarAccion(rowData, 'editar');
            const puedeEliminar = puedeEjecutarAccion(rowData, 'eliminar');
            const getTooltipEditar = () => esAdmin ? "Rol del sistema protegido" : !rowData.activo ? "Rol inactivo" : "Editar";
            const getTooltipEliminar = () => esAdmin ? "Rol del sistema protegido" : !rowData.activo ? "Rol inactivo" : "Eliminar";
            return (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
                <Tooltip text="Visualizar">
                  <button className="admin-button" onClick={() => abrirModal('visualizar', rowData)}
                    style={{ background: '#e3f2fd', color: '#1976d2', border: 'none', borderRadius: '6px', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-eye" style={{ fontSize: '11px' }}></i>
                  </button>
                </Tooltip>
                <Tooltip text={getTooltipEditar()}>
                  <button className="admin-button" onClick={() => puedeEditar && abrirModal('editar', rowData)} disabled={!puedeEditar}
                    style={{ background: puedeEditar ? '#fff8e1' : '#f5f5f5', color: puedeEditar ? '#f57c00' : '#bbb', border: 'none', borderRadius: '6px', width: '26px', height: '26px', cursor: puedeEditar ? 'pointer' : 'not-allowed', opacity: puedeEditar ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-pen" style={{ fontSize: '11px' }}></i>
                  </button>
                </Tooltip>
                <Tooltip text={getTooltipEliminar()}>
                  <button className="admin-button" onClick={() => puedeEliminar && abrirModal('eliminar', rowData)} disabled={!puedeEliminar}
                    style={{ background: puedeEliminar ? '#ffebee' : '#f5f5f5', color: puedeEliminar ? '#d32f2f' : '#bbb', border: 'none', borderRadius: '6px', width: '26px', height: '26px', cursor: puedeEliminar ? 'pointer' : 'not-allowed', opacity: puedeEliminar ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-trash" style={{ fontSize: '11px' }}></i>
                  </button>
                </Tooltip>
              </div>
            );
          }}
          style={{ width: '100px' }}
        />
      </DataTable>

      <Modal visible={modalVisible} onClose={cerrarModal}>
        {(modalTipo === 'agregar' || modalTipo === 'editar' || modalTipo === 'visualizar') && (
          <RoleForm
            initialData={formData}
            formType={modalTipo}
            permisos={permisos}
            onSave={guardarRol}
            onCancel={cerrarModal}
            showNotification={showNotification}
            allRoles={roles}
            currentRoleId={rolSeleccionado?.id}
          />
        )}
        {modalTipo === 'eliminar' && rolSeleccionado && (
          <div>
            <h2 style={{ marginTop: 0, color: '#d81b60' }}>Confirmar Eliminación</h2>
            <div style={{ margin: '1rem 0' }}>
              <p>¿Estás seguro que deseas eliminar el rol <strong>{rolSeleccionado.nombre}</strong>?</p>
              <p style={{ color: '#e53935', fontSize: '14px' }}>Esta acción no se puede deshacer.</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
              <button className="modal-btn save-btn" onClick={confirmarEliminar}>Eliminar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}