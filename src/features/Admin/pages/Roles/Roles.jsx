import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../../adminStyles.css';
import Modal from '../../components/modal';
import SearchBar from '../../components/SearchBar';
import Notification from '../../components/Notification';
import RoleForm from './Components/FormRol';
import roleApiService from '../../services/roles_services';

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
      
      // Cargar permisos y roles en paralelo
      const [permisosData, rolesData] = await Promise.all([
        roleApiService.obtenerPermisos(),
        roleApiService.obtenerRoles()
      ]);
      
      setPermisos(permisosData);
      setRoles(rolesData);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification(`Error al cargar datos: ${error.message}`, 'error');
      
      // Usar datos mock como fallback
      setPermisos(roleApiService.obtenerPermisosMock());
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivo = async (rol) => {
    try {
      const nuevoEstado = !rol.activo;
      
      // Actualizar en el backend
      await roleApiService.cambiarEstadoRol(rol.id, nuevoEstado);
      
      // Actualizar el estado local
      const updated = roles.map(r =>
        r.id === rol.id ? { ...r, activo: nuevoEstado } : r
      );
      setRoles(updated);
      
      showNotification(
        `Rol ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`
      );
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showNotification(`Error al cambiar estado: ${error.message}`, 'error');
    }
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const abrirModal = async (tipo, rol = null) => {
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
        const permisosRol = await roleApiService.obtenerPermisosRol(rol.id);
        
        setFormData({
          nombre: rol.nombre,
          descripcion: rol.descripcion,
          permisos: permisosRol,
          activo: rol.activo
        });
      } catch (error) {
        console.error('Error al obtener permisos del rol:', error);
        setFormData({
          nombre: rol.nombre,
          descripcion: rol.descripcion,
          permisos: rol.permisos || [],
          activo: rol.activo
        });
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
      let rolActualizado;

      if (modalTipo === 'agregar') {
        rolActualizado = await roleApiService.crearRol(data);
        setRoles(prevRoles => [...prevRoles, rolActualizado]);
        showNotification('Rol agregado exitosamente');
        
      } else if (modalTipo === 'editar') {
        rolActualizado = await roleApiService.actualizarRol(rolSeleccionado.id, data);
        setRoles(prevRoles => 
          prevRoles.map(r => 
            r.id === rolSeleccionado.id ? rolActualizado : r
          )
        );
        showNotification('Rol actualizado exitosamente');
      }
      
      cerrarModal();
      
    } catch (error) {
      console.error('Error al guardar rol:', error);
      showNotification(`Error al guardar rol: ${error.message}`, 'error');
    }
  };

  const confirmarEliminar = async () => {
    try {
      // Verificar si el rol tiene usuarios asociados
      const tieneUsuarios = await roleApiService.rolTieneUsuarios(rolSeleccionado.id);
      
      if (tieneUsuarios) {
        showNotification('No se puede eliminar este rol porque tiene usuarios asociados', 'error');
        cerrarModal();
        return;
      }

      // Eliminar el rol
      await roleApiService.eliminarRol(rolSeleccionado.id);
      
      // Actualizar el estado local
      const updated = roles.filter(r => r.id !== rolSeleccionado.id);
      setRoles(updated);
      
      cerrarModal();
      showNotification('Rol eliminado exitosamente');
      
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      showNotification(`Error al eliminar rol: ${error.message}`, 'error');
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
      .map(p => p.nombre)
      .join(', ');
  };

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="admin-wrapper">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          color: '#c2185b'
        }}>
          <div>
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', marginRight: '1rem' }}></i>
            Cargando roles...
          </div>
        </div>
      </div>
    );
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
        rowClassName={(rowData) => !rowData.activo ? 'fila-inactiva' : ''}
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
        />

        <Column 
          field="descripcion" 
          header="Descripción"
          headerStyle={{ paddingLeft: '5rem' }}
          style={{ width: '12rem', textAlign: 'center' }}
        />
        
        <Column
          header="Estado"
          headerStyle={{ paddingLeft: '3rem' }}
          body={(rowData) => (
            <InputSwitch
              checked={rowData.activo}
              onChange={() => toggleActivo(rowData)}
            />
          )}
          style={{ width: '6rem', textAlign: 'center' }}
        />
        
       <Column
        header="Acciones"
        headerStyle={{ paddingLeft: '5rem' }}
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
                className={`admin-button ${rowData.activo ? 'yellow' : ''}`} 
                title={rowData.activo ? "Editar" : "No disponible (rol inactivo)"}
                onClick={() => rowData.activo && abrirModal('editar', rowData)}
                disabled={!rowData.activo}
                style={{
                  opacity: rowData.activo ? 1 : 0.8,
                  cursor: rowData.activo ? 'pointer' : 'not-allowed'
                }}
              >
                ✏️
              </button>
              <button
                className={`admin-button ${rowData.activo ? 'red' : 'disabled'}`}
                title={rowData.activo ? "Eliminar" : "No disponible (rol inactivo)"}  
                onClick={() => rowData.activo && abrirModal('eliminar', rowData)}  
                disabled={!rowData.activo}
               style={{
                  opacity: rowData.activo ? 1 : 0.8,
                  cursor: rowData.activo ? 'pointer' : 'not-allowed',
                }}
              >
                🗑️
              </button>
            </>
          )}
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