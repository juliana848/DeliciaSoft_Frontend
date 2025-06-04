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
        activo: true,
        tieneUsuarios: true
      },
      { 
        id: 2, 
        nombre: 'Repostero', 
        descripcion: 'Encargado de la producción de postres',
        permisos: [1, 2],
        activo: true,
        tieneUsuarios: false
      },
      { 
        id: 3, 
        nombre: 'Decorador', 
        descripcion: 'Especialista en decoración de pasteles',
        permisos: [1, 2],
        activo: true,
        tieneUsuarios: false
      },
      { 
        id: 4, 
        nombre: 'Vendedor', 
        descripcion: 'Personal de ventas y atención al cliente',
        permisos: [1, 4],
        activo: false,
        tieneUsuarios: false
      },
      { 
        id: 5, 
        nombre: 'Gerente', 
        descripcion: 'Supervisor general de operaciones',
        permisos: [1, 2, 3, 4],
        activo: true,
        tieneUsuarios: true // Este rol también tendrá usuarios asociados
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
    
    // Validar nombre único
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
    // Verificar si el rol tiene usuarios asociados
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
  <Modal 
    visible={modalVisible} 
    onClose={cerrarModal} 
    style={{
      display: 'flex',
      justifyContent: 'flex-end',  // Alinea modal a la derecha
      alignItems: 'flex-start',    // Arriba, no centrado vertical
      padding: '2rem',
    }}
  >
    <div
      className="modal-roles-grande"
      style={{
        width: '60vw',
        maxWidth: '800px',
        height: '80vh',            // Altura reducida
        overflowY: 'auto',         // Scroll vertical si es necesario
        marginLeft: 'auto',
        marginRight: '0',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}
    >
      <h2
        className="modal-title"
        style={{ marginBottom: '2rem', fontSize: '1.6rem', textAlign: 'center' }}
      >
        {modalTipo === 'agregar' ? 'Nuevo Rol' : 'Editar Rol'}
      </h2>

      <div
        className="modal-body-roles"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '1rem',
          minHeight: '100px',
        }}
      >
        {/* Columna izquierda: Información básica */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ color: '#c2185b', margin: '0 0 1rem 0', fontSize: '1.2rem' }}>
            Información Básica
          </h3>

          <div className="modal-field">
            <label
              style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.7rem', fontSize: '1rem' }}
            >
              Nombre del Rol:
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className="modal-input"
              style={{
                padding: '12px',
                fontSize: '1rem',
                width: '100%',
                borderRadius: '6px',
                border: '2px solid #f48fb1',
              }}
              placeholder="Ej: Administrador, Vendedor..."
            />
          </div>

          <div className="modal-field">
            <label
              style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.7rem', fontSize: '1rem' }}
            >
              Descripción:
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className="modal-input"
              style={{
                padding: '12px',
                fontSize: '1rem',
                width: '100%',
                minHeight: '120px',
                resize: 'vertical',
                borderRadius: '6px',
                border: '2px solid #f48fb1',
              }}
              placeholder="Describe las responsabilidades de este rol..."
            />
          </div>

          <div className="modal-field">
            <label
              style={{
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.7rem',
                fontSize: '1rem',
              }}
            >
              Estado Activo:
              <InputSwitch
                checked={formData.activo}
                onChange={(e) => handleInputChange('activo', e.value)}
              />
            </label>
          </div>
        </div>

        {/* Columna derecha: Permisos - Más grande */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: '#c2185b', margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>
            Permisos del Sistema
          </h3>

          <div
            style={{
              flex: 1,
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '1.5rem',
              border: '2px solid #f48fb1',
              borderRadius: '10px',
              backgroundColor: '#fafafa',
            }}
          >
            {Object.entries(permisosPorModulo).map(([modulo, permisosModulo]) => (
              <div key={modulo} style={{ marginBottom: '2rem' }}>
                <h4
                  style={{
                    fontSize: '1.1rem',
                    color: '#c2185b',
                    margin: '0 0 1rem 0',
                    fontWeight: 'bold',
                    borderBottom: '2px solid #f48fb1',
                    paddingBottom: '0.5rem',
                  }}
                >
                  📋 {modulo}
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.7rem',
                    paddingLeft: '1.5rem',
                  }}
                >
                  {permisosModulo.map((permiso) => (
                    <label
                      key={permiso.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.7rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        backgroundColor: formData.permisos.includes(permiso.id)
                          ? '#f8bbd0'
                          : 'transparent',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.permisos.includes(permiso.id)}
                        onChange={(e) => handlePermisoChange(permiso.id, e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '1rem' }}>{permiso.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(permisosPorModulo).length === 0 && (
              <p
                style={{
                  textAlign: 'center',
                  color: '#666',
                  fontStyle: 'italic',
                  fontSize: '1rem',
                }}
              >
                No hay permisos disponibles
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        className="modal-actions"
        style={{
          marginTop: '2.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          borderTop: '2px solid #eee',
          paddingTop: '2rem',
        }}
      >
        <button
          className="modal-btn cancel-btn"
          onClick={cerrarModal}
          style={{ padding: '12px 30px', fontSize: '1.1rem' }}
        >
          Cancelar
        </button>
        <button
          className="modal-btn save-btn"
          onClick={guardarRol}
          style={{ padding: '12px 30px', fontSize: '1.1rem' }}
        >
          {modalTipo === 'agregar' ? 'Crear Rol' : 'Actualizar Rol'}
        </button>
      </div>
    </div>
  </Modal>
)}


    {/* Modal Visualizar */}
{modalTipo === 'visualizar' && rolSeleccionado && (
  <Modal visible={modalVisible} onClose={cerrarModal}>
    <h2 className="modal-title" style={{ fontSize: '22px' }}>Detalles del Rol</h2>
    <div
      className="modal-body"
      style={{ display: 'flex', gap: '30px', fontSize: '16px', padding: '10px' }}
    >
      {/* Columna izquierda: info básica */}
      <div style={{ flex: 1 }}>
        <p><strong>ID:</strong> {rolSeleccionado.id}</p>
        <p><strong>Nombre:</strong> {rolSeleccionado.nombre}</p>
        <p><strong>Descripción:</strong> {rolSeleccionado.descripcion}</p>
        <p><strong>Estado:</strong> {rolSeleccionado.activo ? 'Activo' : 'Inactivo'}</p>
        <p><strong>Usuarios Asociados:</strong> {rolSeleccionado.tieneUsuarios ? 'Sí' : 'No'}</p>
      </div>

      {/* Columna derecha: permisos */}
      <div style={{ flex: 1 }}>
        <strong style={{ display: 'block', marginBottom: '10px' }}>Permisos asignados:</strong>
        <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
          {Object.entries(permisosPorModulo).map(([modulo, permisosModulo]) => {
            const permisosAsignados = permisosModulo.filter(p =>
              (rolSeleccionado.permisos || []).includes(p.id)
            );
            if (permisosAsignados.length === 0) return null;

            return (
              <div key={modulo} style={{ marginBottom: '12px' }}>
                <h5 style={{ color: '#d81b60', margin: '0 0 5px', fontSize: '14px' }}>{modulo}:</h5>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                  {permisosAsignados.map(p => (
                    <li key={p.id} style={{ fontSize: '13px' }}>{p.nombre}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    <div className="modal-footer" style={{ marginTop: '40px' }}>
      <button className="modal-btn cancel-btn" onClick={cerrarModal} style={{ fontSize: '20px', padding: '30px 50px' }}>
        Cerrar
      </button>
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
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>
              Cancelar
            </button>
            <button className="modal-btn save-btn" onClick={confirmarEliminar}>
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}