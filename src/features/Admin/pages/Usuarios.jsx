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
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    contraseña: '',
    rol_id: '',
    tipo_documento_id: '',
    documento: '',
    activo: true
  });

  useEffect(() => {
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
      },
      { 
        id: 3, 
        nombres: 'Carlos Alberto', 
        apellidos: 'Rodríguez Martínez',
        correo: 'carlos@gmail.com', 
        contraseña: '123456',
        rol_id: 3, 
        rol_nombre: 'Decorador',
        tipo_documento_id: 2,
        tipo_documento_nombre: 'Cédula de Extranjería',
        documento: '11223344',
        activo: false 
      },
      { 
        id: 4, 
        nombres: 'Ana Patricia', 
        apellidos: 'Martínez Hernández',
        correo: 'ana@gmail.com', 
        contraseña: '123456',
        rol_id: 2, 
        rol_nombre: 'Repostero',
        tipo_documento_id: 1,
        tipo_documento_nombre: 'Cédula de Ciudadanía',
        documento: '55667788',
        activo: true 
      },
      { 
        id: 5, 
        nombres: 'Luis Fernando', 
        apellidos: 'Fernández Silva',
        correo: 'luis@gmail.com', 
        contraseña: '123456',
        rol_id: 1, 
        rol_nombre: 'Administrador',
        tipo_documento_id: 3,
        tipo_documento_nombre: 'Pasaporte',
        documento: 'AB123456',
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
        contraseña: '',
        rol_id: '',
        tipo_documento_id: '',
        documento: '',
        activo: true
      });
    } else if (tipo === 'editar' && usuario) {
      setFormData({
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        contraseña: usuario.contraseña,
        rol_id: usuario.rol_id,
        tipo_documento_id: usuario.tipo_documento_id,
        documento: usuario.documento,
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
      contraseña: '',
      rol_id: '',
      tipo_documento_id: '',
      documento: '',
      activo: true
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validarFormulario = () => {
    const { nombres, apellidos, correo, contraseña, rol_id, tipo_documento_id, documento } = formData;
    
    if (!nombres.trim()) {
      showNotification('Los nombres son obligatorios', 'error');
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
    if (!contraseña.trim()) {
      showNotification('La contraseña es obligatoria', 'error');
      return false;
    }
    if (contraseña.length < 6) {
      showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
      return false;
    }
    if (!rol_id) {
      showNotification('Debe seleccionar un rol', 'error');
      return false;
    }
    if (!tipo_documento_id) {
      showNotification('Debe seleccionar un tipo de documento', 'error');
      return false;
    }
    if (!documento.trim()) {
      showNotification('El documento es obligatorio', 'error');
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

    // Validar que el documento no esté duplicado
    const documentoExistente = usuarios.find(usr => 
      usr.documento === documento && 
      (modalTipo === 'agregar' || usr.id !== usuarioSeleccionado?.id)
    );
    
    if (documentoExistente) {
      showNotification('Ya existe un usuario con este documento', 'error');
      return false;
    }
    
    return true;
  };

  const guardarUsuario = () => {
    if (!validarFormulario()) return;

    const rolSeleccionado = roles.find(r => r.id === parseInt(formData.rol_id));
    const tipoDocumentoSeleccionado = tiposDocumento.find(td => td.id === parseInt(formData.tipo_documento_id));
    
    if (modalTipo === 'agregar') {
      const nuevoId = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
      const nuevoUsuario = {
        ...formData,
        id: nuevoId,
        rol_id: parseInt(formData.rol_id),
        rol_nombre: rolSeleccionado.nombre,
        tipo_documento_id: parseInt(formData.tipo_documento_id),
        tipo_documento_nombre: tipoDocumentoSeleccionado.nombre
      };
      
      setUsuarios([...usuarios, nuevoUsuario]);
      showNotification('Usuario agregado exitosamente');
    } else if (modalTipo === 'editar') {
      const updated = usuarios.map(usr =>
        usr.id === usuarioSeleccionado.id 
          ? { 
              ...usr, 
              ...formData, 
              rol_id: parseInt(formData.rol_id), 
              rol_nombre: rolSeleccionado.nombre,
              tipo_documento_id: parseInt(formData.tipo_documento_id),
              tipo_documento_nombre: tipoDocumentoSeleccionado.nombre
            }
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
    usr.rol_nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.documento.toLowerCase().includes(filtro.toLowerCase()) ||
    usr.tipo_documento_nombre.toLowerCase().includes(filtro.toLowerCase())
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
          + Agregar 
        </button>
        <SearchBar
          placeholder="Buscar usuario..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <h2 className="admin-section-title">Usuarios</h2>
      <DataTable
        value={usuariosFiltrados}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
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
          headerStyle={{ paddingLeft: '4rem' }}
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
        />
      </DataTable>

      {/* Modal Agregar/Editar */}
      {(modalTipo === 'agregar' || modalTipo === 'editar') && modalVisible && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title modal-title-compact">
            {modalTipo === 'agregar' ? 'Agregar Usuario' : 'Editar Usuario'}
          </h2>
          <div className="modal-body modal-body-compact">
            <div className="modal-grid modal-grid-compact">
              <div className="modal-field">
                <label className="modal-label">
                  Tipo Documento<span className="required-asterisk">*</span>:
                </label>
                <div className="custom-select-wrapper">
                  <select
                    value={formData.tipo_documento_id}
                    onChange={(e) => handleInputChange('tipo_documento_id', e.target.value)}
                    className="custom-select"
                  >
                    <option value="">Seleccionar</option>
                    {tiposDocumento.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                    ))}
                  </select>
                  <div className="select-arrow">
                    <svg width="10" height="6" viewBox="0 0 12 8" fill="none">
                      <path d="M6 8L0 2L1.5 0.5L6 5L10.5 0.5L12 2L6 8Z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="modal-field">
                <label className="modal-label">
                  Documento<span className="required-asterisk">*</span>:
                </label>
                <input
                  type="text"
                  value={formData.documento}
                  onChange={(e) => handleInputChange('documento', e.target.value)}
                  className="modal-input"
                  placeholder="Número"
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">
                  Nombres<span className="required-asterisk">*</span>:
                </label>
                <input
                  type="text"
                  value={formData.nombres}
                  onChange={(e) => handleInputChange('nombres', e.target.value)}
                  className="modal-input"
                  placeholder="Nombres"
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">
                  Apellidos<span className="required-asterisk">*</span>:
                </label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  className="modal-input"
                  placeholder="Apellidos"
                />
              </div>
              <div className="modal-field modal-field-full">
                <label className="modal-label">
                  Correo<span className="required-asterisk">*</span>:
                </label>
                <input
                  type="email"
                  value={formData.correo}
                  onChange={(e) => handleInputChange('correo', e.target.value)}
                  className="modal-input"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div className="modal-field modal-field-full">
                <label className="modal-label">
                  Contraseña<span className="required-asterisk">*</span>:
                </label>
                <input
                  type="password"
                  value={formData.contraseña}
                  onChange={(e) => handleInputChange('contraseña', e.target.value)}
                  className="modal-input"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="modal-field modal-field-full">
                <label className="modal-label">
                  Rol<span className="required-asterisk">*</span>:
                </label>
                <div className="custom-select-wrapper">
                  <select
                    value={formData.rol_id}
                    onChange={(e) => handleInputChange('rol_id', e.target.value)}
                    className="custom-select"
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map(rol => (
                      <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                    ))}
                  </select>
                  <div className="select-arrow">
                    <svg width="10" height="6" viewBox="0 0 12 8" fill="none">
                      <path d="M6 8L0 2L1.5 0.5L6 5L10.5 0.5L12 2L6 8Z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
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
             <p><strong>Tipo de Documento:</strong> {usuarioSeleccionado.tipo_documento_nombre}</p>
            <p><strong>Documento:</strong> {usuarioSeleccionado.documento}</p>
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

      <style jsx>{`
        .required-asterisk {
          color: #e53935;
          margin-left: 2px;
          font-weight: bold;
        }

        .modal-title-compact {
          padding-left: 1rem;
          font-size: 1.2rem;
        }

        .modal-body-compact {
          min-width: 380px;
          max-width: 380px;
          padding: 0.6rem;
        }

        .modal-grid-compact {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
        }

        .modal-field {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .modal-field-full {
          grid-column: 1 / -1;
        }

        .modal-label {
          font-weight: 600;
          color: #333;
          font-size: 0.75rem;
          margin-bottom: 0.1rem;
        }

        .modal-input {
          padding: 0.4rem 0.6rem;
          border: 2px solid #e1e5e9;
          border-radius: 4px;
          font-size: 0.75rem;
          transition: all 0.3s ease;
          outline: none;
        }

        .modal-input:focus {
          border-color: #ff6b9d;
          box-shadow: 0 0 0 2px rgba(255, 107, 157, 0.1);
        }

        .custom-select-wrapper {
          position: relative;
          display: inline-block;
          width: 100%;
        }

        .custom-select {
          width: 100%;
          padding: 0.4rem 1.8rem 0.4rem 0.6rem;
          border: 2px solid #e1e5e9;
          border-radius: 4px;
          background-color: #fff;
          font-size: 0.75rem;
          color: #333;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          cursor: pointer;
          transition: all 0.3s ease;
          outline: none;
        }

        .custom-select:focus {
          border-color: #ff6b9d;
          box-shadow: 0 0 0 2px rgba(255, 107, 157, 0.1);
        }

        .custom-select:hover {
          border-color: #ff6b9d;
        }

        .select-arrow {
          position: absolute;
          right: 0.6rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #666;
          transition: transform 0.3s ease;
        }

        .custom-select:focus + .select-arrow {
          transform: translateY(-50%) rotate(180deg);
        }

        @media (max-width: 768px) {
          .modal-body-compact {
            min-width: auto;
            max-width: 90vw;
            padding: 0.8rem;
          }

          .modal-grid-compact {
            grid-template-columns: 1fr;
          }

          .modal-field-full {
            grid-column: 1;
          }
        }
      `}</style>
    </div>
  );
}