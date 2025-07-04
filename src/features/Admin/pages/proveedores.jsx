import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css'; // Asegúrate de que este archivo CSS existe
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';
import GoogleAddressAutocomplete from '../../../shared/components/GoogleAddressAutocomplete';

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
  // Nuevos campos agregados
  const [tipoDocumento, setTipoDocumento] = useState('CC');
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [nombreContacto, setNombreContacto] = useState('');
  const [datosUbicacion, setDatosUbicacion] = useState(null);

  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    // Datos de ejemplo para simular la carga inicial de proveedores
    const mockProveedores = [
      {
        id: 1,
        tipo: 'Natural',
        nombre: 'Juan Pérez',
        contacto: '1234567890',
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
        contacto: '1112223330',
        correo: 'contacto@abcsa.com',
        direccion: 'Calle Comercio 456',
        estado: true,
        extra: 'J12345678',
        tipoDocumento: 'NIT',
        nombreEmpresa: 'Distribuidora ABC S.A.',
        nombreContacto: 'Carlos García'
      },
      {
        id: 3,
        tipo: 'Natural',
        nombre: 'Pedro Gómez (Inactivo)',
        contacto: '9998887770',
        correo: 'pedro.inactivo@gmail.com',
        direccion: 'Carrera 10 #20-30',
        estado: false, // Este proveedor estará inactivo
        extra: '101010101',
        tipoDocumento: 'CC'
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

  // Real-time validation functions
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
        } else if (value.length !== 10) { // Asegura exactamente 10 dígitos
          error = 'El contacto debe tener 10 dígitos';
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
          if (value.length < 7 || value.length > 10) {
            error = 'El documento debe tener entre 7 y 10 dígitos';
          }
        } else { // Jurídico
          if (value.length < 9 || value.length > 12) {
            error = 'El NIT debe tener entre 9 y 12 dígitos';
          }
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleFieldChange = (field, value) => {
    // Update field value
    switch (field) {
      case 'tipoProveedor':
        setTipoProveedor(value);
        // Reset fields when changing provider type
        if (value === 'Natural') {
          setTipoDocumento('CC');
          setNombreEmpresa('');
          setNombreContacto('');
        } else { // Jurídico
          setTipoDocumento('NIT');
          setNombre('');
        }
        // Re-validate document when type changes
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
      default:
        break;
    }

    // Real-time validation
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleFieldBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));

    // Check for duplicates on blur (only for 'agregar' mode)
    if (modalTipo === 'agregar') {
      if (field === 'correo' && !error) {
        const emailExists = proveedores.some(p => p.correo.toLowerCase() === value.toLowerCase());
        if (emailExists) {
          setErrors(prev => ({ ...prev, correo: 'Ya existe un proveedor con este correo' }));
        }
      }

      if (field === 'nombre' && !error && tipoProveedor === 'Natural') {
        const nameExists = proveedores.some(p => p.nombre && p.nombre.toLowerCase() === value.toLowerCase());
        if (nameExists) {
          setErrors(prev => ({ ...prev, nombre: 'Ya existe un proveedor con este nombre' }));
        }
      }

      if (field === 'nombreEmpresa' && !error && tipoProveedor === 'Jurídico') {
        const nameExists = proveedores.some(p => p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === value.toLowerCase());
        if (nameExists) {
          setErrors(prev => ({ ...prev, nombreEmpresa: 'Ya existe un proveedor con este nombre de empresa' }));
        }
      }
    }
    // For 'editar' mode, check duplicates excluding the current supplier being edited
    if (modalTipo === 'editar' && proveedorSeleccionado) {
      if (field === 'correo' && !error) {
        const emailExists = proveedores.some(p =>
          p.id !== proveedorSeleccionado.id && p.correo.toLowerCase() === value.toLowerCase()
        );
        if (emailExists) {
          setErrors(prev => ({ ...prev, correo: 'Ya existe otro proveedor con este correo' }));
        }
      }

      if (field === 'nombre' && !error && tipoProveedor === 'Natural') {
        const nameExists = proveedores.some(p =>
          p.id !== proveedorSeleccionado.id && p.nombre && p.nombre.toLowerCase() === value.toLowerCase()
        );
        if (nameExists) {
          setErrors(prev => ({ ...prev, nombre: 'Ya existe otro proveedor con este nombre' }));
        }
      }

      if (field === 'nombreEmpresa' && !error && tipoProveedor === 'Jurídico') {
        const nameExists = proveedores.some(p =>
          p.id !== proveedorSeleccionado.id && p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === value.toLowerCase()
        );
        if (nameExists) {
          setErrors(prev => ({ ...prev, nombreEmpresa: 'Ya existe otro proveedor con este nombre de empresa' }));
        }
      }
    }
  };

  const handlePlaceSelect = (placeData) => {
    setDatosUbicacion(placeData);
    setDireccion(placeData.address); // Actualiza la dirección con el texto completo del autocompletado
    // No es necesario llamar a validateField aquí porque el campo de dirección se valida al enviar el formulario.
    // Si quisieras validación en tiempo real para esto, tendrías que ajustar la lógica.
  };

  const abrirModal = (tipo, proveedor = null) => {
    setModalTipo(tipo);
    setProveedorSeleccionado(proveedor);

    // Reset validation states
    setErrors({});
    setTouched({});

    if (tipo === 'editar' || tipo === 'visualizar') {
      setTipoProveedor(proveedor.tipo);
      setNombre(proveedor.tipo === 'Natural' ? proveedor.nombre : ''); // Solo el nombre si es natural
      setNombreEmpresa(proveedor.tipo === 'Jurídico' ? proveedor.nombre : ''); // Nombre de empresa si es jurídico
      setNombreContacto(proveedor.nombreContacto || '');
      setContacto(proveedor.contacto);
      setCorreo(proveedor.correo);
      setDireccion(proveedor.direccion);
      setDocumentoONit(proveedor.extra);
      setTipoDocumento(proveedor.tipoDocumento || (proveedor.tipo === 'Natural' ? 'CC' : 'NIT'));
      setDatosUbicacion(null); // Resetear datos de ubicación para evitar conflictos al editar
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
      setDatosUbicacion(null);
    }
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setProveedorSeleccionado(null);
    setModalTipo(null);
  };

  const validarCampos = () => {
    let fieldsToValidate = ['contacto', 'correo', 'direccion', 'documentoONit'];

    if (tipoProveedor === 'Natural') {
      fieldsToValidate = [...fieldsToValidate, 'nombre'];
    } else { // Jurídico
      fieldsToValidate = [...fieldsToValidate, 'nombreEmpresa', 'nombreContacto'];
    }

    let hasFormErrors = false;
    const newErrors = {};

    fieldsToValidate.forEach(field => {
      let valueToValidate;
      switch (field) {
        case 'nombre': valueToValidate = nombre; break;
        case 'nombreEmpresa': valueToValidate = nombreEmpresa; break;
        case 'nombreContacto': valueToValidate = nombreContacto; break;
        case 'contacto': valueToValidate = contacto; break;
        case 'correo': valueToValidate = correo; break;
        case 'direccion': valueToValidate = direccion; break;
        case 'documentoONit': valueToValidate = documentoONit; break;
        default: break;
      }

      const error = validateField(field, valueToValidate);
      if (error) {
        newErrors[field] = error;
        hasFormErrors = true;
      }
    });

    // Validaciones de duplicados al guardar
    if (modalTipo === 'agregar') {
      const emailExists = proveedores.some(p => p.correo.toLowerCase() === correo.toLowerCase());
      if (emailExists) {
        newErrors.correo = 'Ya existe un proveedor con este correo';
        hasFormErrors = true;
      }

      if (tipoProveedor === 'Natural') {
        const nameExists = proveedores.some(p => p.nombre && p.nombre.toLowerCase() === nombre.toLowerCase());
        if (nameExists) {
          newErrors.nombre = 'Ya existe un proveedor con este nombre';
          hasFormErrors = true;
        }
      } else {
        const nameExists = proveedores.some(p => p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === nombreEmpresa.toLowerCase());
        if (nameExists) {
          newErrors.nombreEmpresa = 'Ya existe un proveedor con este nombre de empresa';
          hasFormErrors = true;
        }
      }
    } else if (modalTipo === 'editar' && proveedorSeleccionado) {
      const emailExists = proveedores.some(p =>
        p.id !== proveedorSeleccionado.id && p.correo.toLowerCase() === correo.toLowerCase()
      );
      if (emailExists) {
        newErrors.correo = 'Ya existe otro proveedor con este correo';
        hasFormErrors = true;
      }

      if (tipoProveedor === 'Natural') {
        const nameExists = proveedores.some(p =>
          p.id !== proveedorSeleccionado.id && p.nombre && p.nombre.toLowerCase() === nombre.toLowerCase()
        );
        if (nameExists) {
          newErrors.nombre = 'Ya existe otro proveedor con este nombre';
          hasFormErrors = true;
        }
      } else {
        const nameExists = proveedores.some(p =>
          p.id !== proveedorSeleccionado.id && p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === nombreEmpresa.toLowerCase()
        );
        if (nameExists) {
          newErrors.nombreEmpresa = 'Ya existe otro proveedor con este nombre de empresa';
          hasFormErrors = true;
        }
      }
    }


    setErrors(newErrors);
    setTouched(fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), {})); // Marca todos los campos como tocados para mostrar errores al enviar

    if (hasFormErrors) {
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
        nombre: tipoProveedor === 'Natural' ? nombre : nombreEmpresa, // El campo 'nombre' en el mock es el nombre principal
        contacto,
        correo,
        direccion,
        estado: true,
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
            nombre: tipoProveedor === 'Natural' ? nombre : nombreEmpresa, // Actualiza el campo 'nombre' del mock
            contacto,
            correo,
            direccion,
            extra: documentoONit,
            tipoDocumento,
            ...(tipoProveedor === 'Jurídico' ? {
              nombreEmpresa,
              nombreContacto
            } : {
              nombreEmpresa: undefined, // Limpiar si cambia de jurídico a natural
              nombreContacto: undefined // Limpiar si cambia de jurídico a natural
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

  const proveedoresFiltrados = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    p.contacto.includes(filtro) ||
    p.correo.toLowerCase().includes(filtro.toLowerCase()) ||
    p.direccion.toLowerCase().includes(filtro.toLowerCase()) ||
    (p.tipo === 'Jurídico' && p.nombreEmpresa && p.nombreEmpresa.toLowerCase().includes(filtro.toLowerCase())) ||
    p.extra.includes(filtro)
  );


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

        <h2 className="admin-section-title"> Gestión de Proveedores</h2>
        <DataTable value={proveedoresFiltrados} className="admin-table" paginator rows={5} emptyMessage="No se encontraron proveedores.">
          <Column header="N°" headerStyle={{ paddingLeft: '1rem' }} body={(rowData, { rowIndex }) => rowIndex + 1} style={{ width: '3rem', textAlign: 'center' }} />
          <Column field="nombre" header="Nombre/Empresa" headerStyle={{ paddingLeft: '3rem' }} body={(rowData) => rowData.tipo === 'Natural' ? rowData.nombre : rowData.nombreEmpresa} />
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
    header="Acciones"
    headerStyle={{ paddingLeft: '2rem' }}
    body={(rowData) => (
      <>
        <button className="admin-button gray" title="Visualizar" onClick={() => abrirModal('visualizar', rowData)}>🔍</button>
        <button
          className={`admin-button yellow ${!rowData.estado ? 'disabled-button' : ''}`} // Add disabled-button class
          onClick={() => abrirModal('editar', rowData)}
          disabled={!rowData.estado}
          title={!rowData.estado ? "Activa el proveedor para editar" : "Editar"}
        >
          ✏️
        </button>
        <button
          className={`admin-button red ${!rowData.estado ? 'disabled-button' : ''}`} // Add disabled-button class
          onClick={() => abrirModal('eliminar', rowData)}
          disabled={!rowData.estado}
          title={!rowData.estado ? "Activa el proveedor para eliminar" : "Eliminar"}
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
                <label>Tipo*
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

                {tipoProveedor === 'Natural' ? (
                  <label>Nombre*
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
                    <label>Nombre de Empresa*
                      <input
                        type="text"
                        value={nombreEmpresa}
                        onChange={(e) => handleFieldChange('nombreEmpresa', e.target.value)}
                        onBlur={(e) => handleFieldBlur('nombreEmpresa', e.target.value)}
                        className={`modal-input ${errors.nombreEmpresa ? 'error' : ''}`}
                        placeholder="Ingrese el nombre de la empresa"
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

                <label>Contacto*
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

                <label>Correo*
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
                  <GoogleAddressAutocomplete
                    value={direccion}
                    onChange={(value) => handleFieldChange('direccion', value)}
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="Ingrese la dirección"
                    error={errors.direccion}
                    style={{
                      height: '40px',
                      fontSize: '14px',
                      padding: '8px 12px'
                    }}
                  />
                  {errors.direccion && <span className="error-message">{errors.direccion}</span>}
                </label>


                <label>{tipoProveedor === 'Natural' ? `Número de ${tipoDocumento}` : `Número de ${tipoDocumento}`}*
                  <input
                    type="text"
                    value={documentoONit}
                    onChange={(e) => handleFieldChange('documentoONit', e.target.value)}
                    onBlur={(e) => handleFieldBlur('documentoONit', e.target.value)}
                    className={`modal-input ${errors.documentoONit ? 'error' : ''}`}
                    placeholder={tipoProveedor === 'Natural' ? `Número de ${tipoDocumento}` : `Número de ${tipoDocumento}`}
                    maxLength={tipoProveedor === 'Natural' ? '10' : '12'} // MaxLength basado en el tipo de proveedor
                  />
                  {errors.documentoONit && <span className="error-message">{errors.documentoONit}</span>}
                </label>

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
       <label>Tipo*
         <div className="modal-input" style={{backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63'}}>
           {proveedorSeleccionado.tipo}
         </div>
       </label>

       <label>Tipo de Documento*
         <div className="modal-input" style={{backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63'}}>
           {proveedorSeleccionado.tipoDocumento}
         </div>
       </label>

       {proveedorSeleccionado.tipo === 'Natural' ? (
         <label>Nombre*
           <div className="modal-input" style={{backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63'}}>
             {proveedorSeleccionado.nombre}
           </div>
         </label>
       ) : (
         <>
           <label>Nombre de Empresa*
             <div className="modal-input" style={{backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63'}}>
               {proveedorSeleccionado.nombreEmpresa}
             </div>
           </label>

           <label>Nombre del Contacto*
             <div className="modal-input" style={{backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63'}}>
               {proveedorSeleccionado.nombreContacto}
             </div>
           </label>
         </>
       )}

       <label>Contacto*
         <div className="modal-input" style={{backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63'}}>
           {proveedorSeleccionado.contacto}
         </div>
       </label>

       <label>Correo*
         <div className="modal-input" style={{backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63'}}>
           {proveedorSeleccionado.correo}
         </div>
       </label>

       <label>Dirección*
         <div className="modal-input" style={{backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63'}}>
           {proveedorSeleccionado.direccion}
         </div>
       </label>

       <label>{proveedorSeleccionado.tipoDocumento === 'RUT' ? 'RUT*' : 'NIT*'}
         <div className="modal-input" style={{backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63'}}>
           {proveedorSeleccionado.extra}
         </div>
       </label>

       <label>Estado
         <div className="modal-input" style={{backgroundColor: '#f8f9fa', cursor: 'default', border: '2px solid #e91e63'}}>
           {proveedorSeleccionado.estado ? 'Activo' : 'Inactivo'}
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
            <div className="modal-body">
              <p>¿Seguro que quieres eliminar al proveedor <strong>{proveedorSeleccionado.nombre}</strong>?</p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
              <button className="modal-btn save-btn" onClick={confirmarEliminar}>Eliminar</button>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}