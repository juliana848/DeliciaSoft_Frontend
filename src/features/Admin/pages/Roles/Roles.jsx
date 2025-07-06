import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../../adminStyles.css';
import Modal from '../../components/modal';
import SearchBar from '../../components/SearchBar';
import Notification from '../../components/Notification';
import RoleForm from './Components/FormRol'; 

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [filtro, setFiltro] = useState('');
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
    const mockPermisos = [
      { id: 1, nombre: 'Dashboard', modulo: 'Dashboard' },
      { id: 2, nombre: 'Roles', modulo: 'Roles' },
      { id: 3, nombre: 'Usuarios', modulo: 'Usuarios' },
      { id: 4, nombre: 'Cliente', modulo: 'Cliente' },
      { id: 5, nombre: 'Ventas', modulo: 'Ventas' },
      { id: 6, nombre: 'Sedes', modulo: 'Sedes' },
      { id: 7, nombre: 'Cat.Productos', modulo: 'Cat.Productos' },
      { id: 8, nombre: 'Productos', modulo: 'Productos' },
      { id: 9, nombre: 'Cat.Insumos', modulo: 'Cat.Insumos' },
      { id: 10, nombre: 'Insumos', modulo: 'Insumos' },
      { id: 11, nombre: 'Proveedores', modulo: 'Proveedores' },
      { id: 12, nombre: 'Compras', modulo: 'Compras' },
      { id: 13, nombre: 'Produccion', modulo: 'Produccion' },
    ];

    const mockRoles = [
      { 
        id: 1, 
        nombre: 'Administrador', 
        descripcion: 'Acceso completo',
        permisos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        activo: true,
        tieneUsuarios: true
      },
      { 
        id: 2, 
        nombre: 'Repostero', 
        descripcion: 'Producción postres',
        permisos: [1, 13],
        activo: true,
        tieneUsuarios: false
      },
      { 
        id: 3, 
        nombre: 'Decorador', 
        descripcion: 'Decoración pasteles',
        permisos: [1, 13],
        activo: true,
        tieneUsuarios: false
      },
      { 
        id: 4, 
        nombre: 'Vendedor', 
        descripcion: 'Ventas y atención',
        permisos: [1, 4, 5],
        activo: false,
        tieneUsuarios: false
      },
      { 
        id: 5, 
        nombre: 'Gerente', 
        descripcion: 'Supervisor general',
        permisos: [1, 2, 3, 4, 5, 6, 7, 8, 12],
        activo: true,
        tieneUsuarios: true 
      }
    ];

    setRoles(mockRoles);
    setPermisos(mockPermisos);
  }, []);

  const toggleActivo = (rol) => {
    const updated = roles.map(r =>
      r.id === rol.id ? { ...r, activo: !r.activo } : r
    );
    setRoles(updated);
    showNotification(`Rol ${rol.activo ? 'desactivado' : 'activado'} exitosamente`);
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const abrirModal = (tipo, rol = null) => {
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
      setFormData({
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: rol.permisos || [],
        activo: rol.activo
      });
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

  const guardarRol = (data) => {
    if (modalTipo === 'agregar') {
      const nuevoId = roles.length ? Math.max(...roles.map(r => r.id)) + 1 : 1;
      const nuevoRol = {
        ...data,
        id: nuevoId,
        tieneUsuarios: false
      };
      
      setRoles([...roles, nuevoRol]);
      showNotification('Rol agregado exitosamente');
    } else if (modalTipo === 'editar') {
      const updated = roles.map(r =>
        r.id === rolSeleccionado.id 
          ? { ...r, ...data }
          : r
      );
      setRoles(updated);
      showNotification('Rol actualizado exitosamente');
    }
    
    cerrarModal();
  };

  const confirmarEliminar = () => {
    if (rolSeleccionado.tieneUsuarios) {
      showNotification('No se puede eliminar este rol porque tiene usuarios asociados', 'error');
      cerrarModal();
      return;
    }

    const updated = roles.filter(r => r.id !== rolSeleccionado.id);
    setRoles(updated);
    cerrarModal();
    showNotification('Rol eliminado exitosamente');
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
    return permisos
      .filter(p => permisosIds.includes(p.id))
      .map(p => p.nombre)
      .join(', ');
  };

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