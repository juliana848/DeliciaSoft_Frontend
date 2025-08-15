import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

export default function ProveedoresTable() {
  const [proveedores, setProveedores] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  // Form state
  const [tipoProveedor, setTipoProveedor] = useState('Natural');
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [documentoONit, setDocumentoONit] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('CC');
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [nombreContacto, setNombreContacto] = useState('');
  const [estadoProveedor, setEstadoProveedor] = useState(true);

  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const mockProveedores = [
      {
        id: 1,
        tipo: 'Natural',
        nombre: 'Juan Pérez',
        contacto: '123456789',
        correo: 'juan@gmail.com',
        direccion: 'Av. Siempre Viva 123',
        estado: true,
        extra: '987654321',
        tipoDocumento: 'CC'
      },
      {
        id: 2,
        tipo: 'Jurídico',
        nombre: 'Distribuidora ABC S.A.',
        contacto: '111222333',
        correo: 'contacto@abcsa.com',
        direccion: 'Calle Comercio 456',
        estado: true,
        extra: 'J12345678',
        tipoDocumento: 'NIT',
        nombreEmpresa: 'Distribuidora ABC S.A.',
        nombreContacto: 'Carlos García'
      }
    ];
    setProveedores(mockProveedores);
  }, []);

  const toggleEstado = (proveedor) => {
    const updated = proveedores.map(p =>
      p.id === proveedor.id ? { ...p, estado: !p.estado } : p
    );
    setProveedores(updated);
    showNotification(`Proveedor ${proveedor.estado ? 'desactivado' : 'activado'} exitosamente`);
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const validateField = (field, value) => {
    let error = '';

    switch (field) {
      case 'nombre':
        if (tipoProveedor === 'Natural') {
          if (!value.trim()) {
            error = 'El nombre es obligatorio';
          } else if (value.trim().length < 3) {
            error = 'El nombre debe tener al menos 3 caracteres';
          } else if (value.trim().length > 50) {
            error = 'El nombre no puede tener más de 50 caracteres';
          } else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s.]+$/.test(value)) {
            error = 'El nombre solo puede contener letras, espacios y puntos';
          }
        }
        break;

      case 'nombreEmpresa':
        if (tipoProveedor === 'Jurídico') {
          if (!value.trim()) {
            error = 'El nombre de empresa es obligatorio';
          } else if (value.trim().length < 3) {
            error = 'El nombre de empresa debe tener al menos 3 caracteres';
          } else if (value.trim().length > 100) {
            error = 'El nombre de empresa no puede tener más de 100 caracteres';
          }
        }
        break;

      case 'nombreContacto':
        if (tipoProveedor === 'Jurídico') {
          if (!value.trim()) {
            error = 'El nombre del contacto es obligatorio';
          } else if (value.trim().length < 3) {
            error = 'El nombre del contacto debe tener al menos 3 caracteres';
          } else if (value.trim().length > 50) {
            error = 'El nombre del contacto no puede tener más de 50 caracteres';
          } else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s.]+$/.test(value)) {
            error = 'El nombre del contacto solo puede contener letras, espacios y puntos';
          }
        }
        break;

      case 'contacto':
        if (!value.trim()) {
          error = 'El contacto es obligatorio';
        } else if (!/^\d+$/.test(value)) {
          error = 'El contacto debe contener solo números';
        } else if (value.length < 10) {
          error = 'El contacto debe tener 10 dígitos';
        } else if (value.length > 10) {
          error = 'El contacto no puede tener más de 10 dígitos';
        }
        break;

      case 'correo':
        if (!value.trim()) {
          error = 'El correo es obligatorio';
        } else if (value.length > 100) {
          error = 'El correo no puede tener más de 100 caracteres';
        } else {
          const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!correoRegex.test(value) || !value.includes('@')) {
            error = 'Correo no válido';
          }
        }
        break;

      case 'direccion':
        if (!value.trim()) {
          error = 'La dirección es obligatoria';
        } else if (value.trim().length < 5) {
          error = 'La dirección debe tener al menos 5 caracteres';
        } else if (value.trim().length > 200) {
          error = 'La dirección no puede tener más de 200 caracteres';
        }
        break;

      case 'documentoONit':
        const fieldLabel = tipoProveedor === 'Natural' ? 'Documento' : 'NIT';
        if (!value.trim()) {
          error = `${fieldLabel} es obligatorio`;
        } else if (!/^\d+$/.test(value)) {
          error = `${fieldLabel} debe contener solo números`;
        } else if (tipoProveedor === 'Natural') {
          if (value.length < 7) {
            error = 'El documento debe tener al menos 7 dígitos';
          } else if (value.length > 10) {
            error = 'El documento no puede tener más de 10 dígitos';
          }
        } else {
          if (value.length < 9) {
            error = 'El NIT debe tener al menos 9 dígitos';
          } else if (value.length > 12) {
            error = 'El NIT no puede tener más de 12 dígitos';
          }
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleFieldChange = (field, value) => {
    switch (field) {
      case 'tipoProveedor':
        setTipoProveedor(value);
        if (value === 'Natural') {
          setTipoDocumento('CC');
          setNombreEmpresa('');
          setNombreContacto('');
        } else {
          setTipoDocumento('NIT');
          setNombre('');
        }
        if (documentoONit) {
          const docError = validateField('documentoONit', documentoONit);
          setErrors(prev => ({ ...prev, documentoONit: docError }));
        }
        break;
      case 'tipoDocumento':
        setTipoDocumento(value);
        break;
      case 'nombre':
        setNombre(value);
        break;
      case 'nombreEmpresa':
        setNombreEmpresa(value);
        break;
      case 'nombreContacto':
        setNombreContacto(value);
        break;
      case 'contacto':
        setContacto(value);
        break;
      case 'correo':
        setCorreo(value);
        break;
      case 'direccion':
        setDireccion(value);
        break;
      case 'documentoONit':
        setDocumentoONit(value);
        break;
      case 'estadoProveedor':
        setEstadoProveedor(value);
        break;
    }

    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleFieldBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));

    if (field === 'correo' && !error && modalTipo === 'agregar') {
      const emailExists = proveedores.some(p => p.correo.toLowerCase() === value.toLowerCase());
      if (emailExists) {
        setErrors(prev => ({ ...prev, correo: 'Ya existe un proveedor con este correo' }));
      }
    }

    if (field === 'nombre' && !error && modalTipo === 'agregar' && tipoProveedor === 'Natural') {
      const nameExists = proveedores.some(p => p.nombre.toLowerCase() === value.toLowerCase());
      if (nameExists) {
        setErrors(prev => ({ ...prev, nombre: 'Ya existe un proveedor con este nombre' }));
      }
    }

    if (field === 'nombreEmpresa' && !error && modalTipo === 'agregar' && tipoProveedor === 'Jurídico') {
      const nameExists = proveedores.some(p => p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === value.toLowerCase());
      if (nameExists) {
        setErrors(prev => ({ ...prev, nombreEmpresa: 'Ya existe un proveedor con este nombre de empresa' }));
      }
    }
  };

  const abrirModal = (tipo, proveedor = null) => {
    setModalTipo(tipo);
    setProveedorSeleccionado(proveedor);

    setErrors({});
    setTouched({});

    if (tipo === 'editar' || tipo === 'visualizar') {
      setTipoProveedor(proveedor.tipo);
      setNombre(proveedor.nombre || '');
      setContacto(proveedor.contacto);
      setCorreo(proveedor.correo);
      setDireccion(proveedor.direccion);
      setDocumentoONit(proveedor.extra);
      setTipoDocumento(proveedor.tipoDocumento || (proveedor.tipo === 'Natural' ? 'CC' : 'NIT'));
      setNombreEmpresa(proveedor.nombreEmpresa || '');
      setNombreContacto(proveedor.nombreContacto || '');
      setEstadoProveedor(proveedor.estado);
    } else if (tipo === 'agregar') {
      setTipoProveedor('Natural');
      setNombre('');
      setContacto('');
      setCorreo('');
      setDireccion('');
      setDocumentoONit('');
      setTipoDocumento('CC');
      setNombreEmpresa('');
      setNombreContacto('');
      setEstadoProveedor(true);
    }
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setProveedorSeleccionado(null);
    setModalTipo(null);
  };

  const validarCampos = () => {
    let fields = ['contacto', 'correo', 'direccion', 'documentoONit'];

    if (tipoProveedor === 'Natural') {
      fields = [...fields, 'nombre'];
    } else {
      fields = [...fields, 'nombreEmpresa', 'nombreContacto'];
    }

    let hasErrors = false;
    const newErrors = {};

    fields.forEach(field => {
      let value;
      switch (field) {
        case 'nombre': value = nombre; break;
        case 'nombreEmpresa': value = nombreEmpresa; break;
        case 'nombreContacto': value = nombreContacto; break;
        case 'contacto': value = contacto; break;
        case 'correo': value = correo; break;
        case 'direccion': value = direccion; break;
        case 'documentoONit': value = documentoONit; break;
      }

      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    if (modalTipo === 'agregar') {
      const emailExists = proveedores.some(p => p.correo.toLowerCase() === correo.toLowerCase());
      if (emailExists) {
        newErrors.correo = 'Ya existe un proveedor con este correo';
        hasErrors = true;
      }

      if (tipoProveedor === 'Natural') {
        const nameExists = proveedores.some(p => p.nombre && p.nombre.toLowerCase() === nombre.toLowerCase());
        if (nameExists) {
          newErrors.nombre = 'Ya existe un proveedor con este nombre';
          hasErrors = true;
        }
      } else {
        const nameExists = proveedores.some(p => p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === nombreEmpresa.toLowerCase());
        if (nameExists) {
          newErrors.nombreEmpresa = 'Ya existe un proveedor con este nombre de empresa';
          hasErrors = true;
        }
      }
    }

    if (modalTipo === 'editar') {
      const emailExists = proveedores.some(p =>
        p.id !== proveedorSeleccionado.id && p.correo.toLowerCase() === correo.toLowerCase()
      );
      if (emailExists) {
        newErrors.correo = 'Ya existe un proveedor con este correo';
        hasErrors = true;
      }

      if (tipoProveedor === 'Natural') {
        const nameExists = proveedores.some(p =>
          p.id !== proveedorSeleccionado.id && p.nombre && p.nombre.toLowerCase() === nombre.toLowerCase()
        );
        if (nameExists) {
          newErrors.nombre = 'Ya existe un proveedor con este nombre';
          hasErrors = true;
        }
      } else {
        const nameExists = proveedores.some(p =>
          p.id !== proveedorSeleccionado.id && p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === nombreEmpresa.toLowerCase()
        );
        if (nameExists) {
          newErrors.nombreEmpresa = 'Ya existe un proveedor con este nombre de empresa';
          hasErrors = true;
        }
      }
    }

    setErrors(newErrors);
    setTouched(fields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    if (hasErrors) {
      showNotification('Por favor corrige los errores en el formulario', 'error');
      return false;
    }

    return true;
  };
  const guardarProveedor = () => {
    if (!validarCampos()) return;

    if (modalTipo === 'agregar') {
      const nuevoId = proveedores.length ? Math.max(...proveedores.map(p => p.id)) + 1 : 1;
      const nuevoProveedor = {
        id: nuevoId,
        tipo: tipoProveedor,
        nombre: tipoProveedor === 'Natural' ? nombre : nombreEmpresa,
        contacto,
        correo,
        direccion,
        estado: estadoProveedor,
        extra: documentoONit,
        tipoDocumento
      };

      if (tipoProveedor === 'Jurídico') {
        nuevoProveedor.nombreEmpresa = nombreEmpresa;
        nuevoProveedor.nombreContacto = nombreContacto;
      }

      setProveedores([...proveedores, nuevoProveedor]);
      showNotification('Proveedor agregado exitosamente');
    } else if (modalTipo === 'editar') {
      const updated = proveedores.map(p =>
        p.id === proveedorSeleccionado.id
          ? {
            ...p,
            tipo: tipoProveedor,
            nombre: tipoProveedor === 'Natural' ? nombre : nombreEmpresa,
            contacto,
            correo,
            direccion,
            estado: estadoProveedor,
            extra: documentoONit,
            tipoDocumento,
            ...(tipoProveedor === 'Jurídico' ? {
              nombreEmpresa,
              nombreContacto
            } : {
              nombreEmpresa: undefined,
              nombreContacto: undefined
            })
          }
          : p
      );
      setProveedores(updated);
      showNotification('Proveedor actualizado exitosamente');
    }

    cerrarModal();
  };

  const confirmarEliminar = () => {
    setProveedores(proveedores.filter(p => p.id !== proveedorSeleccionado.id));
    showNotification('Proveedor eliminado exitosamente');
    cerrarModal();
  };

  const proveedoresFiltrados = proveedores.filter(p => {
    const filtroLower = filtro.toLowerCase();

    const nombre = p.nombre?.toLowerCase() || '';
    const tipo = p.tipo?.toLowerCase() || '';
    const contacto = p.contacto?.toLowerCase() || '';
    const correo = p.correo?.toLowerCase() || '';
    const direccion = p.direccion?.toLowerCase() || '';
    const tipoDocumento = p.tipoDocumento?.toLowerCase() || '';
    const documento = p.extra?.toLowerCase() || '';
    const estado = p.estado ? 'activo' : 'inactivo';

    const nombreEmpresa = p.nombreEmpresa?.toLowerCase() || '';
    const nombreContacto = p.nombreContacto?.toLowerCase() || '';

    return nombre.includes(filtroLower) ||
      tipo.includes(filtroLower) ||
      contacto.includes(filtroLower) ||
      correo.includes(filtroLower) ||
      direccion.includes(filtroLower) ||
      tipoDocumento.includes(filtroLower) ||
      documento.includes(filtroLower) ||
      estado.includes(filtroLower) ||
      nombreEmpresa.includes(filtroLower) ||
      nombreContacto.includes(filtroLower);
  });

  return (
    <>
      <div className="admin-wrapper">
        <Notification
          visible={notification.visible}
          mensaje={notification.mensaje}
          tipo={notification.tipo}
          onClose={hideNotification}
        />

        <div className="admin-toolbar">
          <button className="admin-button pink" onClick={() => abrirModal('agregar')}>+ Agregar</button>
          <SearchBar placeholder="Buscar proveedor..." value={filtro} onChange={setFiltro} />
        </div>

        <h2 className="admin-section-title">Proveedores</h2>
        <DataTable value={proveedoresFiltrados} className="admin-table" paginator rows={5}>
          <Column header="N°" headerStyle={{ paddingLeft: '1rem' }} body={(rowData, { rowIndex }) => rowIndex + 1} style={{ width: '3rem', textAlign: 'center' }} />
          <Column field="nombre" header="Nombre" headerStyle={{ paddingLeft: '3rem' }} />
          <Column field="tipo" header="Tipo Proveedor" />
          <Column field="contacto" header="Contacto" />
          <Column field="correo" header="Correo" headerStyle={{ paddingLeft: '3rem' }} />
          <Column field="direccion" header="Dirección" headerStyle={{ paddingLeft: '2rem' }} />
          <Column
            header="Estado"
            body={(rowData) => (
              <InputSwitch checked={rowData.estado} onChange={() => toggleEstado(rowData)} />
            )}
          />
          <Column
            header="Acción"
            body={(rowData) => (
              <>
                <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('visualizar', rowData)}>
                  🔍
                </button>
                <button
                  className={`admin-button yellow ${!rowData.estado ? 'disabled' : ''}`}
                  title="Editar"
                  onClick={() => rowData.estado && abrirModal('editar', rowData)}
                  disabled={!rowData.estado}
                  style={{
                    opacity: !rowData.estado ? 0.5 : 1,
                    cursor: !rowData.estado ? 'not-allowed' : 'pointer'
                  }}
                >
                  ✏️
                </button>
                <button
                  className={`admin-button red ${!rowData.estado ? 'disabled' : ''}`}
                  title="Eliminar"
                  onClick={() => rowData.estado && abrirModal('eliminar', rowData)}
                  disabled={!rowData.estado}
                  style={{
                    opacity: !rowData.estado ? 0.5 : 1,
                    cursor: !rowData.estado ? 'not-allowed' : 'pointer'
                  }}
                >
                  🗑️
                </button>
              </>
            )}
          />
        </DataTable>

        {(modalTipo === 'agregar' || modalTipo === 'editar') && (
          <Modal visible={modalVisible} onClose={cerrarModal} className="modal-wide">
            <h2 className="modal-title">{modalTipo === 'agregar' ? 'Agregar Proveedor' : 'Editar Proveedor'}</h2>
            <div className="modal-body">
              <div className="modal-form-grid-wide">
                <label>Tipo de Proveedor*
                  <select
                    value={tipoProveedor}
                    onChange={(e) => handleFieldChange('tipoProveedor', e.target.value)}
                    className="modal-input"
                  >
                    <option value="Natural">Natural</option>
                    <option value="Jurídico">Jurídico</option>
                  </select>
                </label>

                <label>Tipo de Documento*
                  <select
                    value={tipoDocumento}
                    onChange={(e) => handleFieldChange('tipoDocumento', e.target.value)}
                    className="modal-input"
                  >
                    {tipoProveedor === 'Natural' ? (
                      <>
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="TI">Tarjeta de Identidad</option>
                      </>
                    ) : (
                      <>
                        <option value="NIT">NIT</option>
                        <option value="RUT">RUT</option>
                      </>
                    )}
                  </select>
                </label>

                <label>{tipoProveedor === 'Natural' ? 'Número de Documento*' : (tipoDocumento === 'RUT' ? 'RUT*' : 'NIT*')}
                  <input
                    type="text"
                    value={documentoONit}
                    onChange={(e) => handleFieldChange('documentoONit', e.target.value)}
                    onBlur={(e) => handleFieldBlur('documentoONit', e.target.value)}
                    className={`modal-input ${errors.documentoONit ? 'error' : ''}`}
                    placeholder={tipoProveedor === 'Natural' ? 'Número de documento' : (tipoDocumento === 'RUT' ? 'Número de RUT' : 'Número de NIT')}
                    maxLength={tipoProveedor === 'Natural' ? '10' : (tipoDocumento === 'RUT' ? '10' : '12')}
                  />
                  {errors.documentoONit && <span className="error-message">{errors.documentoONit}</span>}
                </label>

                {tipoProveedor === 'Natural' ? (
                  <label>Nombre Completo*
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => handleFieldChange('nombre', e.target.value)}
                      onBlur={(e) => handleFieldBlur('nombre', e.target.value)}
                      className={`modal-input ${errors.nombre ? 'error' : ''}`}
                      placeholder="Ingrese el nombre completo"
                    />
                    {errors.nombre && <span className="error-message">{errors.nombre}</span>}
                  </label>
                ) : (
                  <>
                    <label>Razón Social*
                      <input
                        type="text"
                        value={nombreEmpresa}
                        onChange={(e) => handleFieldChange('nombreEmpresa', e.target.value)}
                        onBlur={(e) => handleFieldBlur('nombreEmpresa', e.target.value)}
                        className={`modal-input ${errors.nombreEmpresa ? 'error' : ''}`}
                        placeholder="Ingrese la razón social"
                      />
                      {errors.nombreEmpresa && <span className="error-message">{errors.nombreEmpresa}</span>}
                    </label>

                    <label>Nombre del Contacto*
                      <input
                        type="text"
                        value={nombreContacto}
                        onChange={(e) => handleFieldChange('nombreContacto', e.target.value)}
                        onBlur={(e) => handleFieldBlur('nombreContacto', e.target.value)}
                        className={`modal-input ${errors.nombreContacto ? 'error' : ''}`}
                        placeholder="Ingrese el nombre del contacto"
                      />
                      {errors.nombreContacto && <span className="error-message">{errors.nombreContacto}</span>}
                    </label>
                  </>
                )}

                <label>Teléfono*
                  <input
                    type="text"
                    value={contacto}
                    onChange={(e) => handleFieldChange('contacto', e.target.value)}
                    onBlur={(e) => handleFieldBlur('contacto', e.target.value)}
                    className={`modal-input ${errors.contacto ? 'error' : ''}`}
                    placeholder="Número de teléfono (10 dígitos)"
                    maxLength="10"
                  />
                  {errors.contacto && <span className="error-message">{errors.contacto}</span>}
                </label>

                <label>Correo Electrónico*
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => handleFieldChange('correo', e.target.value)}
                    onBlur={(e) => handleFieldBlur('correo', e.target.value)}
                    className={`modal-input ${errors.correo ? 'error' : ''}`}
                    placeholder="ejemplo@correo.com"
                  />
                  {errors.correo && <span className="error-message">{errors.correo}</span>}
                </label>

                <label>Dirección*
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => handleFieldChange('direccion', e.target.value)}
                    onBlur={(e) => handleFieldBlur('direccion', e.target.value)}
                    className={`modal-input ${errors.direccion ? 'error' : ''}`}
                    placeholder="Dirección completa"
                  />
                  {errors.direccion && <span className="error-message">{errors.direccion}</span>}
                </label>

                {modalTipo === 'editar' && (
                  <label>Estado
                    <div className="switch-container" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                      <span style={{ color: estadoProveedor ? '#4CAF50' : '#f44336', fontWeight: 'bold' }}>
                        {estadoProveedor ? 'Activo' : 'Inactivo'}
                      </span>
                      <InputSwitch
                        checked={estadoProveedor}
                        onChange={(e) => handleFieldChange('estadoProveedor', e.value)}
                      />
                    </div>
                  </label>
                )}

              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
              <button className="modal-btn save-btn" onClick={guardarProveedor}>Guardar</button>
            </div>
          </Modal>
        )}

        {modalTipo === 'visualizar' && proveedorSeleccionado && (
          <Modal visible={modalVisible} onClose={cerrarModal} className="modal-wide">
            <h2 className="modal-title">Detalles del Proveedor</h2>
            <div className="modal-body">
              <div className="modal-form-grid-wide">
                <label>Tipo de Proveedor*
                  <div className="modal-input" style={{ backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63' }}>
                    {proveedorSeleccionado.tipo}
                  </div>
                </label>

                <label>Tipo de Documento*
                  <div className="modal-input" style={{ backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63' }}>
                    {proveedorSeleccionado.tipoDocumento}
                  </div>
                </label>

                <label>{proveedorSeleccionado.tipo === 'Natural' ? 'Número de Documento*' : (proveedorSeleccionado.tipoDocumento === 'RUT' ? 'RUT*' : 'NIT*')}
                  <div className="modal-input" style={{ backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63' }}>
                    {proveedorSeleccionado.extra}
                  </div>
                </label>

                {proveedorSeleccionado.tipo === 'Natural' ? (
                  <label>Nombre Completo*
                    <div className="modal-input" style={{ backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63' }}>
                      {proveedorSeleccionado.nombre}
                    </div>
                  </label>
                ) : (
                  <>
                    <label>Razón Social*
                      <div className="modal-input" style={{ backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63' }}>
                        {proveedorSeleccionado.nombreEmpresa}
                      </div>
                    </label>

                    <label>Nombre del Contacto*
                      <div className="modal-input" style={{ backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63' }}>
                        {proveedorSeleccionado.nombreContacto}
                      </div>
                    </label>
                  </>
                )}

                <label>Teléfono*
                  <div className="modal-input" style={{ backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63' }}>
                    {proveedorSeleccionado.contacto}
                  </div>
                </label>

                <label>Correo Electrónico*
                  <div className="modal-input" style={{ backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63' }}>
                    {proveedorSeleccionado.correo}
                  </div>
                </label>

                <label>Dirección*
                  <div className="modal-input" style={{ backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63' }}>
                    {proveedorSeleccionado.direccion}
                  </div>
                </label>

                <label>Estado
                  <div className="modal-input" style={{ backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63' }}>
                    <span style={{ color: proveedorSeleccionado.estado ? '#4CAF50' : '#f44336', fontWeight: 'bold' }}>
                      {proveedorSeleccionado.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cerrar</button>
            </div>
          </Modal>
        )}

        {modalTipo === 'eliminar' && proveedorSeleccionado && (
          <Modal visible={modalVisible} onClose={cerrarModal}>
            <h2 className="modal-title">Confirmar Eliminación</h2>
            <p>¿Estás seguro de que quieres eliminar al proveedor **{proveedorSeleccionado.nombre}**?</p>
            <div className="modal-footer">
              <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
              <button className="modal-btn red" onClick={confirmarEliminar}>Eliminar</button>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}