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
      { id: 2, nombre: 'Usuarios', modulo: 'Usuarios' },
      { id: 3, nombre: 'Productos', modulo: 'Productos' },
      { id: 4, nombre: 'Ventas', modulo: 'Ventas' },
    ];

    const mockRoles = [
      { 
        id: 1, 
        nombre: 'Administrador', 
        descripcion: 'Acceso completo al sistema',
        permisos: [1, 2, 3, 4],
        activo: true 
      },
      { 
        id: 2, 
        nombre: 'Repostero', 
        descripcion: 'Encargado de la producción de postres',
        permisos: [1, 2],
        activo: true 
      },
      { 
        id: 3, 
        nombre: 'Decorador', 
        descripcion: 'Especialista en decoración de pasteles',
        permisos: [1, 2],
        activo: true 
      },
      { 
        id: 4, 
        nombre: 'Vendedor', 
        descripcion: 'Personal de ventas y atención al cliente',
        permisos: [1, 4],
        activo: false 
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
    
    return true;
  };

  const guardarRol = () => {
    if (!validarFormulario()) return;
    
    if (modalTipo === 'agregar') {
      const nuevoId = roles.length ? Math.max(...roles.map(r => r.id)) + 1 : 1;
      const nuevoRol = {
        ...formData,
        id: nuevoId
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

  // Agrupar permisos por módulo
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
          + Agregar Rol
        </button>
        <SearchBar
          placeholder="Buscar rol..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <DataTable
        value={rolesFiltrados}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column field="id" header="ID" />
        <Column field="nombre" header="Nombre" />
        <Column field="descripcion" header="Descripción" />
        <Column 
          header="Permisos" 
          body={(rowData) => (
            <span title={getPermisosNombres(rowData.permisos || [])}>
              {(rowData.permisos || []).length} permisos
            </span>
          )}
        />
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
      {modalTipo === 'agregar' ? 'Agregar Nuevo Rol' : 'Editar Rol'}
    </h2>
    <div className="modal-body">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div>
          <div className="modal-field">
            <label>Nombre del Rol:</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className="modal-input"
            />
          </div>
          <div className="modal-field">
            <label>Descripción:</label>
            <input
              type="text"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className="modal-input"
            />
          </div>
        </div>

        <div className="modal-field">
          <label>Permisos:</label>
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #f48fb1', borderRadius: '8px', padding: '10px' }}>
            {Object.entries(permisosPorModulo).map(([modulo, permisosModulo]) => (
              <div key={modulo} style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#d81b60', marginBottom: '8px', fontSize: '14px' }}>{modulo}</h4>
                <div className="permisos-grid">
                  {permisosModulo.map(permiso => (
                    <div key={permiso.id} className="permiso-checkbox">
                      <input
                        type="checkbox"
                        id={`permiso-${permiso.id}`}
                        checked={formData.permisos.includes(permiso.id)}
                        onChange={(e) => handlePermisoChange(permiso.id, e.target.checked)}
                      />
                      <label htmlFor={`permiso-${permiso.id}`} style={{ fontSize: '13px' }}>
                        {permiso.nombre}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="modal-footer">
      <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
      <button className="modal-btn save-btn" onClick={guardarRol}>Guardar</button>
    </div>
  </Modal>
)}


      {/* Modal Visualizar */}
      {modalTipo === 'visualizar' && rolSeleccionado && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Detalles del Rol</h2>
          <div className="modal-body">
            <p><strong>ID:</strong> {rolSeleccionado.id}</p>
            <p><strong>Nombre:</strong> {rolSeleccionado.nombre}</p>
            <p><strong>Descripción:</strong> {rolSeleccionado.descripcion}</p>
            <p><strong>Estado:</strong> {rolSeleccionado.activo ? 'Activo' : 'Inactivo'}</p>
            <div style={{ marginTop: '15px' }}>
              <strong>Permisos asignados:</strong>
              <div style={{ marginTop: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {Object.entries(permisosPorModulo).map(([modulo, permisosModulo]) => {
                  const permisosAsignados = permisosModulo.filter(p => (rolSeleccionado.permisos || []).includes(p.id));
                  if (permisosAsignados.length === 0) return null;
                  
                  return (
                    <div key={modulo} style={{ marginBottom: '10px' }}>
                      <h5 style={{ color: '#d81b60', margin: '5px 0', fontSize: '13px' }}>{modulo}:</h5>
                      <ul style={{ margin: '0', paddingLeft: '20px' }}>
                        {permisosAsignados.map(p => (
                          <li key={p.id} style={{ fontSize: '12px' }}>{p.nombre}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cerrar</button>
          </div>
        </Modal>
      )}

      {/* Modal Eliminar */}
      {modalTipo === 'eliminar' && rolSeleccionado && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Confirmar Eliminación</h2>
          <div className="modal-body">
            <p>¿Está seguro que desea eliminar el rol <strong>{rolSeleccionado.nombre}</strong>?</p>
            <p style={{ color: '#e53935', fontSize: '14px' }}>
              Esta acción no se puede deshacer y podría afectar a los usuarios que tengan este rol asignado.
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