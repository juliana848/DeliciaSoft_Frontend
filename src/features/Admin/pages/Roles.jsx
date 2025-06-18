import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

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
    } else if (tipo === 'editar' && rol) {
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermisoChange = (permisoId, checked) => {
    setFormData(prev => ({
      ...prev,
      permisos: checked 
        ? [...prev.permisos, permisoId]
        : prev.permisos.filter(id => id !== permisoId)
    }));
  };

  const validarFormulario = () => {
    const { nombre, descripcion } = formData;
    
    if (!nombre.trim()) {
      showNotification('El nombre del rol es obligatorio', 'error');
      return false;
    }
    if (!descripcion.trim()) {
      showNotification('La descripción es obligatoria', 'error');
      return false;
    }
    
    const nombreExiste = roles.some(rol => 
      rol.nombre.toLowerCase() === nombre.trim().toLowerCase() && 
      (modalTipo === 'agregar' || rol.id !== rolSeleccionado?.id)
    );
    
    if (nombreExiste) {
      showNotification('Ya existe un rol con este nombre', 'error');
      return false;
    }
    
    return true;
  };

  const guardarRol = () => {
    if (!validarFormulario()) return;
    
    if (modalTipo === 'agregar') {
      const nuevoId = roles.length ? Math.max(...roles.map(r => r.id)) + 1 : 1;
      const nuevoRol = {
        ...formData,
        id: nuevoId,
        tieneUsuarios: false
      };
      
      setRoles([...roles, nuevoRol]);
      showNotification('Rol agregado exitosamente');
    } else if (modalTipo === 'editar') {
      const updated = roles.map(r =>
        r.id === rolSeleccionado.id 
          ? { ...r, ...formData }
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

  const rolesFiltrados = roles.filter(rol =>
    rol.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    rol.descripcion.toLowerCase().includes(filtro.toLowerCase())
  );

  const getPermisosNombres = (permisosIds) => {
    return permisos
      .filter(p => permisosIds.includes(p.id))
      .map(p => p.nombre)
      .join(', ');
  };

  const permisosPorModulo = permisos.reduce((acc, permiso) => {
    if (!acc[permiso.modulo]) {
      acc[permiso.modulo] = [];
    }
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {});

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
          placeholder="Buscar rol..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <h2 className="admin-section-title">Roles</h2>
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
              <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('visualizar', rowData)}>
                🔍
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
          style={{ width: '10rem', textAlign: 'center' }}
        />
      </DataTable>

      <Modal visible={modalVisible} onClose={cerrarModal}>
        {/* Modal Agregar/Editar */}
        {(modalTipo === 'agregar' || modalTipo === 'editar') && (
          <div style={{ width: '800px', maxWidth: '90vw' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem'}}>
              {modalTipo === 'agregar' ? 'Agregar Rol' : 'Editar Rol'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
              <div>
                <h3 style={{ color: '#c2185b', marginBottom: '1rem' }}>Información Básica</h3>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Nombre del Rol 
                      <span style={{ color: 'red' }}> *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid #f48fb1',
                      borderRadius: '6px',
                      outline: 'none'
                    }}
                    placeholder="Ej: Administrador"
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Descripción 
                    <span style={{ color: 'red' }}> *</span>
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid #f48fb1',
                      borderRadius: '6px',
                      outline: 'none',
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                    placeholder="Describe este rol..."
                  />
                </div>

                {modalTipo === 'editar' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <label style={{ fontWeight: 'bold' }}>Estado Activo:</label>
                      <InputSwitch
                        checked={formData.activo}
                        onChange={(e) => handleInputChange('activo', e.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ color: '#c2185b', marginBottom: '1rem' }}>Permisos del Sistema</h3>
                
                <div style={{
                  padding: '1rem',
                  border: '2px solid #f48fb1',
                  borderRadius: '10px',
                  backgroundColor: '#fafafa',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem'
                  }}>
                    {Object.values(permisosPorModulo).flat().map((permiso) => (
                      <div key={permiso.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.3rem',
                        borderRadius: '4px'
                      }}>
                        <input
                          type="checkbox"
                          id={`permiso-${permiso.id}`}
                          checked={formData.permisos.includes(permiso.id)}
                          onChange={(e) => handlePermisoChange(permiso.id, e.target.checked)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label
                          htmlFor={`permiso-${permiso.id}`}
                          style={{
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            margin: 0,
                            fontWeight: formData.permisos.includes(permiso.id) ? '600' : 'normal',
                            color: formData.permisos.includes(permiso.id) ? '#c2185b' : 'inherit'
                          }}
                        >
                          {permiso.nombre}
                        </label>
                      </div>
                    ))}
                  </div>

                  {Object.values(permisosPorModulo).flat().length === 0 && (
                    <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                      No hay permisos disponibles
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              marginTop: '2rem',
              paddingTop: '1rem',
              borderTop: '1px solid #eee'
            }}>
              <button className="modal-btn cancel-btn" onClick={cerrarModal}>
                Cancelar
              </button>
              <button className="modal-btn save-btn" onClick={guardarRol}>
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Modal Visualizar */}
        {modalTipo === 'visualizar' && rolSeleccionado && (
          <div className="modal-visualizar-rol">
            <h2 style={{ marginTop: 0, color: '#000000' }}>Ver Detalles del Rol</h2>
            <div style={{ margin: '1rem 0' }}>
              <p><strong>Nombre:</strong> {rolSeleccionado.nombre}</p>
              <p><strong>Descripción:</strong> {rolSeleccionado.descripcion}</p>
              <p><strong>Estado:</strong> {rolSeleccionado.activo ? 'Activo' : 'Inactivo'}</p>
              <p><strong>Permisos:</strong></p>
              <div className="permisos-visualizar">
                {getPermisosNombres(rolSeleccionado.permisos || [])}
              </div>
            </div>
          </div>
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