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

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      console.log('Cargando datos...');
      
      // Cargar permisos y roles en paralelo
      const [permisosData, rolesData] = await Promise.all([
        roleApiService.obtenerPermisos(),
        roleApiService.obtenerRoles()
      ]);
      
      console.log('Permisos cargados:', permisosData);
      console.log('Roles cargados:', rolesData);
      
      setPermisos(permisosData);
      setRoles(rolesData); // Ya viene ordenado con Admin primero
      
      showNotification('Datos cargados correctamente', 'success');
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification(`Error al cargar datos: ${error.message}`, 'error');
      
      // Usar datos mock como fallback
      const permisosMock = roleApiService.obtenerPermisosMock();
      setPermisos(permisosMock);
      setRoles([]);
      
      console.log('Usando permisos mock:', permisosMock);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ACTUALIZADO: Verificar si es rol Admin y protegerlo
  const toggleActivo = async (rol) => {
    try {
      // Verificar si es rol Admin y se intenta desactivar
      if (roleApiService.esRolAdmin(rol.nombre) && rol.activo) {
        showNotification('No se puede desactivar el rol Admin. Este rol debe permanecer siempre activo.', 'error');
        return;
      }

      const nuevoEstado = !rol.activo;
      
      console.log(`Cambiando estado del rol ${rol.id} a ${nuevoEstado}`);
      
      // Actualizar en el backend
      await roleApiService.cambiarEstadoRol(rol.id, nuevoEstado);
      
      // Actualizar el estado local manteniendo el orden
      const updated = roles.map(r =>
        r.id === rol.id ? { ...r, activo: nuevoEstado } : r
      );
      
      // Reordenar para mantener Admin arriba
      setRoles(roleApiService.ordenarRolesConAdminPrimero(updated));
      
      showNotification(
        `Rol ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
        'success'
      );
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showNotification(`Error al cambiar estado: ${error.message}`, 'error');
    }
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      setNotification({ visible: false, mensaje: '', tipo: 'success' });
    }, 5000);
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const abrirModal = async (tipo, rol = null) => {
    console.log(`Abriendo modal tipo: ${tipo}`, rol);
    
    // ✅ NUEVO: Verificar protecciones del rol Admin
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
      setFormData({
        nombre: '',
        descripcion: '',
        permisos: [],
        activo: true
      });
    } else if ((tipo === 'editar' || tipo === 'visualizar') && rol) {
      try {
        // Obtener los permisos actuales del rol desde la API
        console.log(`Obteniendo permisos para el rol ${rol.id}`);
        const permisosRol = await roleApiService.obtenerPermisosRol(rol.id);
        console.log('Permisos del rol obtenidos:', permisosRol);
        
        setFormData({
          nombre: rol.nombre,
          descripcion: rol.descripcion,
          permisos: permisosRol,
          activo: rol.activo
        });
      } catch (error) {
        console.error('Error al obtener permisos del rol:', error);
        // Usar los permisos del estado local como fallback
        setFormData({
          nombre: rol.nombre,
          descripcion: rol.descripcion,
          permisos: rol.permisos || [],
          activo: rol.activo
        });
        showNotification('Advertencia: No se pudieron cargar los permisos actuales', 'warn');
      }
    }
    
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setRolSeleccionado(null);
    setModalTipo(null);
    setFormData({
      nombre: '',
      descripcion: '',
      permisos: [],
      activo: true
    });
  };

  const guardarRol = async (data) => {
    try {
      console.log('Guardando rol con datos:', data);
      
      let rolActualizado;

      if (modalTipo === 'agregar') {
        console.log('Creando nuevo rol...');
        rolActualizado = await roleApiService.crearRol(data);
        console.log('Rol creado:', rolActualizado);
        
        // Agregar y reordenar manteniendo Admin arriba
        const nuevosRoles = [...roles, rolActualizado];
        setRoles(roleApiService.ordenarRolesConAdminPrimero(nuevosRoles));
        showNotification('Rol agregado exitosamente', 'success');
        
      } else if (modalTipo === 'editar') {
        console.log(`Actualizando rol ${rolSeleccionado.id}...`);
        rolActualizado = await roleApiService.actualizarRol(rolSeleccionado.id, data);
        console.log('Rol actualizado:', rolActualizado);
        
        const rolesActualizados = roles.map(r => 
          r.id === rolSeleccionado.id ? rolActualizado : r
        );
        
        // Mantener orden con Admin arriba
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
      console.log(`Intentando eliminar rol ${rolSeleccionado.id}`);
      
      // ✅ NUEVO: Protección adicional contra eliminación de Admin
      if (roleApiService.esRolAdmin(rolSeleccionado.nombre)) {
        showNotification('No se puede eliminar el rol Admin. Este rol es esencial para el sistema.', 'error');
        cerrarModal();
        return;
      }

      // Verificar si el rol tiene usuarios asociados
      const tieneUsuarios = await roleApiService.rolTieneUsuarios(rolSeleccionado.id);
      
      if (tieneUsuarios) {
        showNotification('No se puede eliminar este rol porque tiene usuarios asociados', 'error');
        cerrarModal();
        return;
      }

      // Eliminar el rol
      await roleApiService.eliminarRol(rolSeleccionado.id);
      console.log('Rol eliminado exitosamente');
      
      // Actualizar el estado local manteniendo orden
      const updated = roles.filter(r => r.id !== rolSeleccionado.id);
      setRoles(roleApiService.ordenarRolesConAdminPrimero(updated));
      
      cerrarModal();
      showNotification('Rol eliminado exitosamente', 'success');
      
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      showNotification(`Error al eliminar rol: ${error.message}`, 'error');
    }
  };

  // ✅ NUEVO: Función para verificar si se pueden realizar acciones en un rol
  const puedeEjecutarAccion = (rol, accion) => {
    const esAdmin = roleApiService.esRolAdmin(rol.nombre);
    
    switch (accion) {
      case 'editar':
      case 'eliminar':
        return !esAdmin && rol.activo;
      case 'toggleEstado':
        return !esAdmin || (esAdmin && rol.activo); // Admin no se puede desactivar
      default:
        return true;
    }
  };

  const rolesFiltrados = roles.filter(rol => {
    const filterText = filtro.toLowerCase();
    return (
      rol.nombre.toLowerCase().includes(filterText) ||
      rol.descripcion.toLowerCase().includes(filterText) ||
      rol.id.toString().includes(filterText)
    );
  });

  const getPermisosNombres = (permisosIds) => {
    if (!Array.isArray(permisosIds)) return '';
    
    return permisos
      .filter(p => permisosIds.includes(p.id))
      .map(p => p.nombre) // Ya usa el módulo como nombre
      .join(', ');
  };

  // ✅ NUEVO: Componente para mostrar badges del rol Admin
  const RolBadge = ({ rol }) => {
    const esAdmin = roleApiService.esRolAdmin(rol.nombre);
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{rol.nombre}</span>
        {esAdmin && (
          <span style={{
            backgroundColor: '#d81b60',
            color: 'white',
            padding: '0.2rem 0.5rem',
            borderRadius: '10px',
            fontSize: '0.7rem',
            fontWeight: 'bold'
          }}>
            SISTEMA
          </span>
        )}
      </div>
    );
  };

  // Mostrar loading mientras se cargan los datos
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
          placeholder="Buscar rol por nombre, descripción o N°..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <h2 className="admin-section-title">Gestión de Roles</h2>
      <DataTable
        value={rolesFiltrados}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '35rem' }}
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
          headerStyle={{ paddingLeft: '2rem' }}
          body={(rowData, { rowIndex }) => rowIndex + 1} 
          style={{ width: '3rem', textAlign: 'center' }}
        />

        <Column 
          field="nombre" 
          header="Nombre"
          headerStyle={{ paddingLeft: '5.8rem' }}
          style={{ width: '12rem', textAlign: 'center' }}
          body={(rowData) => <RolBadge rol={rowData} />}
        />

        <Column 
          field="descripcion" 
          header="Descripción"
          headerStyle={{ paddingLeft: '5rem' }}
          style={{ width: '12rem', textAlign: 'center' }}
        />

        <Column
          header="Permisos"
          headerStyle={{ paddingLeft: '3rem' }}
          body={(rowData) => (
            <span title={getPermisosNombres(rowData.permisos)}>
              {rowData.permisos?.length || 0} permisos
            </span>
          )}
          style={{ width: '6rem', textAlign: 'center' }}
        />
        
        <Column
          header="Estado"
          headerStyle={{ paddingLeft: '3rem' }}
          body={(rowData) => {
            const esAdmin = roleApiService.esRolAdmin(rowData.nombre);
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <InputSwitch
                  checked={rowData.activo}
                  onChange={() => toggleActivo(rowData)}
                  disabled={esAdmin && rowData.activo} // Admin activo no se puede desactivar
                />
                {esAdmin && rowData.activo && (
                  <i 
                    className="pi pi-lock" 
                    title="El rol Admin no se puede desactivar"
                    style={{ color: '#d32f2f', fontSize: '0.8rem' }}
                  />
                )}
              </div>
            );
          }}
          style={{ width: '6rem', textAlign: 'center' }}
        />
        
        <Column
          header="Acciones"
          headerStyle={{ paddingLeft: '5rem' }}
          body={(rowData) => {
            const esAdmin = roleApiService.esRolAdmin(rowData.nombre);
            const puedeEditar = puedeEjecutarAccion(rowData, 'editar');
            const puedeEliminar = puedeEjecutarAccion(rowData, 'eliminar');
            
            // Determinar el texto del tooltip
            const getTooltipEditar = () => {
              if (esAdmin) return "Rol del sistema protegido";
              if (!rowData.activo) return "Rol inactivo";
              return "Editar";
            };
            
            const getTooltipEliminar = () => {
              if (esAdmin) return "Rol del sistema protegido";
              if (!rowData.activo) return "Rol inactivo";
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
                    className={`admin-button ${puedeEditar ? 'yellow' : 'disabled'}`}
                    onClick={() => puedeEditar && abrirModal('editar', rowData)}
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
                    className={`admin-button ${puedeEliminar ? 'red' : 'disabled'}`}
                    onClick={() => puedeEliminar && abrirModal('eliminar', rowData)}
                    disabled={!puedeEliminar}
                    style={{
                      opacity: puedeEliminar ? 1 : 0.5,
                      cursor: puedeEliminar ? 'pointer' : 'not-allowed',
                    }}
                  >
                    🗑️
                  </button>
                </Tooltip>
              </>
            );
          }}
          style={{ width: '10rem', textAlign: 'center' }}
        />
      </DataTable>

      <Modal visible={modalVisible} onClose={cerrarModal}>
        {/* Modal Agregar/Editar/Visualizar */}
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

        {/* Modal Eliminar */}
        {modalTipo === 'eliminar' && rolSeleccionado && (
          <div>
            <h2 style={{ marginTop: 0, color: '#d81b60' }}>Confirmar Eliminación</h2>
            <div style={{ margin: '1rem 0' }}>
              <p>¿Estás seguro que deseas eliminar el rol <strong>{rolSeleccionado.nombre}</strong>?</p>
              <p style={{ color: '#e53935', fontSize: '14px' }}>
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button className="modal-btn cancel-btn" onClick={cerrarModal}>
                Cancelar
              </button>
              <button className="modal-btn save-btn" onClick={confirmarEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}