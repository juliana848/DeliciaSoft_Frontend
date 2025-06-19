import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

// Función para validar contraseña con requisitos de seguridad
const validarContrasena = (contrasena) => {
  const errores = [];

  // Verificar longitud mínima
  if (contrasena.length < 8) {
    errores.push('Debe tener al menos 8 caracteres.');
  }

  // Verificar al menos una mayúscula
  if (!/[A-Z]/.test(contrasena)) {
    errores.push('Debe contener al menos una letra mayúscula.');
  }

  // Verificar al menos un carácter especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contrasena)) {
    errores.push('Debe contener al menos un carácter especial.');
  }

  return errores;
};

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Estados para mostrar/ocultar contraseñas
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false);

  const [formData, setFormData] = useState({
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    direccion: '',
    barrio: '',
    ciudad: '',
    fechaNacimiento: '',
    celular: '',
    estado: true
  });

  // **Nuevo estado para los errores de validación de cada campo**
  const [formErrors, setFormErrors] = useState({
    numeroDocumento: '',
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    celular: '',
    fechaNacimiento: ''
  });

  useEffect(() => {
    const mockClientes = [
      {
        idCliente: 101,
        tipoDocumento: 'CC',
        numeroDocumento: '1013340075',
        nombre: 'Maria',
        apellido: 'Ferreira',
        correo: 'MF@gmail.com',
        contrasena: '********',
        direccion: 'Calle 123 #45-67',
        barrio: 'Centro',
        ciudad: 'Medellín',
        fechaNacimiento: '1990-05-15',
        celular: '3115254580',
        estado: true
      },
      {
        idCliente: 102,
        tipoDocumento: 'CC',
        numeroDocumento: '1013340076',
        nombre: 'Yolanda',
        apellido: 'Palacios',
        correo: 'YP@gmail.com',
        contrasena: '********',
        direccion: 'Carrera 20 #30-45',
        barrio: 'Laureles',
        ciudad: 'Medellín',
        fechaNacimiento: '1985-08-22',
        celular: '3115254581',
        estado: true
      },
      {
        idCliente: 103,
        tipoDocumento: 'TI',
        numeroDocumento: '1013340077',
        nombre: 'Jota',
        apellido: 'Efe',
        correo: 'JF@gmail.com',
        contrasena: '********',
        direccion: 'Avenida 80 #12-34',
        barrio: 'Robledo',
        ciudad: 'Medellín',
        fechaNacimiento: '2005-12-10',
        celular: '3115254582',
        estado: false
      },
      {
        idCliente: 104,
        tipoDocumento: 'CC',
        numeroDocumento: '1013340078',
        nombre: 'Tarzan',
        apellido: 'Torres',
        correo: 'TT@gmail.com',
        contrasena: '********',
        direccion: 'Transversal 15 #67-89',
        barrio: 'Envigado',
        ciudad: 'Envigado',
        fechaNacimiento: '1992-03-08',
        celular: '3115254583',
        estado: true
      },
      {
        idCliente: 105,
        tipoDocumento: 'CC',
        numeroDocumento: '1013340079',
        nombre: 'Carlos',
        apellido: 'Mendoza',
        correo: 'CM@gmail.com',
        contrasena: '********',
        direccion: 'Calle 50 #25-30',
        barrio: 'Poblado',
        ciudad: 'Medellín',
        fechaNacimiento: '1988-07-12',
        celular: '3115254584',
        estado: true,
        tieneVentas: true
      }
    ];

    setClientes(mockClientes);
  }, []);

  const toggleEstado = (cliente) => {
    const updated = clientes.map(c =>
      c.idCliente === cliente.idCliente ? { ...c, estado: !c.estado } : c
    );
    setClientes(updated);
    showNotification(`Cliente ${cliente.estado ? 'desactivado' : 'activado'} exitosamente`);
  };

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const abrirModal = (tipo, cliente = null) => {
    setModalTipo(tipo);
    setClienteSeleccionado(cliente);

    // Resetear los estados de visibilidad de contraseña
    setMostrarContrasena(false);
    setMostrarConfirmarContrasena(false);
    // **Resetear los errores del formulario al abrir el modal**
    setFormErrors({
      numeroDocumento: '',
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      confirmarContrasena: '',
      celular: '',
      fechaNacimiento: ''
    });

    if (tipo === 'agregar') {
      setFormData({
        tipoDocumento: 'CC',
        numeroDocumento: '',
        nombre: '',
        apellido: '',
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        direccion: '',
        barrio: '',
        ciudad: '',
        fechaNacimiento: '',
        celular: '',
        estado: true
      });
    } else if (tipo === 'editar' && cliente) {
      setFormData({
        tipoDocumento: cliente.tipoDocumento,
        numeroDocumento: cliente.numeroDocumento,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        correo: cliente.correo,
        contrasena: '', // No precargar la contraseña para edición por seguridad
        confirmarContrasena: '',
        direccion: cliente.direccion,
        barrio: cliente.barrio,
        ciudad: cliente.ciudad,
        fechaNacimiento: cliente.fechaNacimiento,
        celular: cliente.celular,
        estado: cliente.estado
      });
    }

    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setClienteSeleccionado(null);
    setModalTipo(null);
    // Resetear los estados de visibilidad de contraseña
    setMostrarContrasena(false);
    setMostrarConfirmarContrasena(false);
    // **Resetear los errores del formulario al cerrar el modal**
    setFormErrors({
      numeroDocumento: '',
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      confirmarContrasena: '',
      celular: '',
      fechaNacimiento: ''
    });
    setFormData({
      tipoDocumento: 'CC',
      numeroDocumento: '',
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      confirmarContrasena: '',
      direccion: '',
      barrio: '',
      ciudad: '',
      fechaNacimiento: '',
      celular: '',
      estado: true
    });
  };

  // **Modificación en handleInputChange para validar en tiempo real**
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar el error cuando el usuario empieza a escribir
    setFormErrors(prev => ({ ...prev, [field]: '' }));

    // Validaciones en tiempo real
    let error = '';
    switch (field) {
      case 'numeroDocumento':
        if (!value.trim()) {
          error = 'El número de documento es obligatorio.';
        } else if (!/^\d*$/.test(value)) { // Permite entrada vacía o solo números
          error = 'Solo se permiten números.';
        } else {
          const documentoExiste = clientes.some(c =>
            c.numeroDocumento === value &&
            (modalTipo === 'agregar' || c.idCliente !== clienteSeleccionado?.idCliente)
          );
          if (documentoExiste) {
            error = 'Ya existe un cliente con este número.';
          }
        }
        break;
      case 'nombre':
        if (!value.trim()) {
          error = 'El nombre es obligatorio.';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) { // Solo letras y espacios
          error = 'Solo se permiten letras.';
        }
        break;
      case 'apellido':
        if (!value.trim()) {
          error = 'El apellido es obligatorio.';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) { // Solo letras y espacios
          error = 'Solo se permiten letras.';
        }
        break;
      case 'correo':
        if (!value.trim()) {
          error = 'El correo es obligatorio.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Formato de correo no válido.';
        }
        break;
      case 'celular':
        if (!value.trim()) {
          error = 'El celular es obligatorio.';
        } else if (!/^\d*$/.test(value)) { // Permite entrada vacía o solo números
          error = 'Solo se permiten números.';
        }
        break;
      case 'contrasena':
        if (modalTipo === 'agregar' || value.trim()) { // Si es agregar o si se está editando y se introduce una contraseña
          const erroresContrasena = validarContrasena(value);
          if (erroresContrasena.length > 0) {
            error = erroresContrasena[0]; // Mostrar solo el primer error
          }
        }
        break;
      case 'confirmarContrasena':
        if (value.trim() && formData.contrasena !== value) {
          error = 'Las contraseñas no coinciden.';
        }
        break;
      case 'fechaNacimiento':
        if (value) {
          const fechaNac = new Date(value);
          const fechaActual = new Date();
          const edad = fechaActual.getFullYear() - fechaNac.getFullYear();
          const mesActual = fechaActual.getMonth();
          const mesNacimiento = fechaNac.getMonth();

          let edadFinal = edad;
          if (mesActual < mesNacimiento || (mesActual === mesNacimiento && fechaActual.getDate() < fechaNac.getDate())) {
            edadFinal--;
          }

          if (edadFinal < 13) {
            error = 'El cliente debe tener al menos 13 años.';
          }
        }
        break;
      default:
        break;
    }
    setFormErrors(prev => ({ ...prev, [field]: error }));

    // Validar también la confirmación de contraseña si la contraseña cambia
    if (field === 'contrasena') {
      if (formData.confirmarContrasena && value !== formData.confirmarContrasena) {
        setFormErrors(prev => ({ ...prev, confirmarContrasena: 'Las contraseñas no coinciden.' }));
      } else if (formData.confirmarContrasena && value === formData.confirmarContrasena) {
        setFormErrors(prev => ({ ...prev, confirmarContrasena: '' }));
      }
    }
  };


  const validarFormularioCompleto = () => {
    const newErrors = {};
    let isValid = true;
    const { numeroDocumento, nombre, apellido, correo, celular, contrasena, confirmarContrasena, fechaNacimiento } = formData;

    if (!numeroDocumento.trim()) {
      newErrors.numeroDocumento = 'El número de documento es obligatorio.';
      isValid = false;
    } else if (!/^\d+$/.test(numeroDocumento)) {
      newErrors.numeroDocumento = 'Solo se permiten números.';
      isValid = false;
    } else {
      const documentoExiste = clientes.some(c =>
        c.numeroDocumento === numeroDocumento &&
        (modalTipo === 'agregar' || c.idCliente !== clienteSeleccionado?.idCliente)
      );
      if (documentoExiste) {
        newErrors.numeroDocumento = 'Ya existe un cliente con este número de documento.';
        isValid = false;
      }
    }

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio.';
      isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
      newErrors.nombre = 'Solo se permiten letras y espacios.';
      isValid = false;
    }

    if (!apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio.';
      isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido)) {
      newErrors.apellido = 'Solo se permiten letras y espacios.';
      isValid = false;
    }

    if (!correo.trim()) {
      newErrors.correo = 'El correo es obligatorio.';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      newErrors.correo = 'El formato del correo no es válido.';
      isValid = false;
    }

    if (!celular.trim()) {
      newErrors.celular = 'El celular es obligatorio.';
      isValid = false;
    } else if (!/^\d+$/.test(celular)) {
      newErrors.celular = 'Solo se permiten números.';
      isValid = false;
    }

    if (modalTipo === 'agregar') {
      if (!contrasena.trim()) {
        newErrors.contrasena = 'La contraseña es obligatoria.';
        isValid = false;
      } else {
        const erroresContrasena = validarContrasena(contrasena);
        if (erroresContrasena.length > 0) {
          newErrors.contrasena = erroresContrasena[0];
          isValid = false;
        }
      }

      if (!confirmarContrasena.trim()) {
        newErrors.confirmarContrasena = 'Debe confirmar la contraseña.';
        isValid = false;
      } else if (contrasena !== confirmarContrasena) {
        newErrors.confirmarContrasena = 'Las contraseñas no coinciden.';
        isValid = false;
      }
    } else if (modalTipo === 'editar' && contrasena.trim()) { // Solo validar si se está editando y se ha introducido una nueva contraseña
      const erroresContrasena = validarContrasena(contrasena);
      if (erroresContrasena.length > 0) {
        newErrors.contrasena = erroresContrasena[0];
        isValid = false;
      }
      if (confirmarContrasena.trim() && contrasena !== confirmarContrasena) {
        newErrors.confirmarContrasena = 'Las contraseñas no coinciden.';
        isValid = false;
      } else if (!confirmarContrasena.trim() && contrasena.trim()) {
        newErrors.confirmarContrasena = 'Debe confirmar la nueva contraseña.';
        isValid = false;
      }
    }


    if (fechaNacimiento) {
      const fechaNac = new Date(fechaNacimiento);
      const fechaActual = new Date();
      const edad = fechaActual.getFullYear() - fechaNac.getFullYear();
      const mesActual = fechaActual.getMonth();
      const mesNacimiento = fechaNac.getMonth();

      let edadFinal = edad;
      if (mesActual < mesNacimiento || (mesActual === mesNacimiento && fechaActual.getDate() < fechaNac.getDate())) {
        edadFinal--;
      }

      if (edadFinal < 13) {
        newErrors.fechaNacimiento = 'El cliente debe tener al menos 13 años.';
        isValid = false;
      }
    }

    setFormErrors(newErrors); // Actualizar todos los errores al intentar guardar
    return isValid;
  };

  const guardarCliente = () => {
    if (!validarFormularioCompleto()) {
      showNotification('Por favor, corrige los errores del formulario.', 'error');
      return;
    }

    if (modalTipo === 'agregar') {
      const nuevoId = clientes.length ? Math.max(...clientes.map(c => c.idCliente)) + 1 : 1;
      const nuevoCliente = {
        ...formData,
        idCliente: nuevoId,
        contrasena: formData.contrasena || '********', // Encriptar en producción
        estado: true // Siempre activo al crear
      };

      // Remover confirmarContrasena antes de guardar
      delete nuevoCliente.confirmarContrasena;

      setClientes([...clientes, nuevoCliente]);
      showNotification('Cliente agregado exitosamente');
    } else if (modalTipo === 'editar') {
      const clienteActualizado = { ...formData };
      delete clienteActualizado.confirmarContrasena; // Remover confirmación
      
      // Si la contraseña no se modificó, mantener la anterior
      if (!formData.contrasena.trim()) {
        clienteActualizado.contrasena = clienteSeleccionado.contrasena;
      }

      const updated = clientes.map(c =>
        c.idCliente === clienteSeleccionado.idCliente
          ? { ...c, ...clienteActualizado }
          : c
      );
      setClientes(updated);
      showNotification('Cliente actualizado exitosamente');
    }

    cerrarModal();
  };

  const manejarEliminacion = () => {
    // Verificar si el cliente tiene ventas asociadas
    if (clienteSeleccionado.tieneVentas) {
      cerrarModal();
      showNotification('No se puede eliminar el cliente porque tiene ventas asociadas', 'error');
      return;
    }

    // Si no tiene ventas, abrir modal de confirmación
    setModalTipo('confirmarEliminar');
  };

  const confirmarEliminar = () => {
    const updated = clientes.filter(c => c.idCliente !== clienteSeleccionado.idCliente);
    setClientes(updated);
    cerrarModal();
    showNotification('Cliente eliminado exitosamente');
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.apellido.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.numeroDocumento.includes(filtro) ||
    cliente.correo.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.celular.includes(filtro)
  );

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
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
          placeholder="Buscar cliente..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>
      <h2 className="admin-section-title">Clientes</h2>
      <DataTable
        value={clientesFiltrados}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column
          header="N°"
          headerStyle={{ paddingLeft: '1.5rem' }}
          body={(rowData, { rowIndex }) => rowIndex + 1}
          style={{ width: '3rem', textAlign: 'center' }}
        />
        <Column field="nombre" header="Nombre" headerStyle={{ paddingLeft: '2.5rem' }} />
        <Column field="apellido" header="Apellido" headerStyle={{ paddingLeft: '2.5rem' }} />
        <Column field="correo" header="Correo" headerStyle={{ paddingLeft: '3rem' }} />
        <Column field="celular" header="Celular" headerStyle={{ paddingLeft: '3rem' }} />
        <Column
          header="Estado"
          body={(rowData) => (
            <InputSwitch
              checked={rowData.estado}
              onChange={() => toggleEstado(rowData)}
            />
          )}
        />
        <Column
          header="Acciones"
          headerStyle={{ paddingLeft: '3.5rem' }}
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
          <h2 className="modal-title text-base">
            {modalTipo === 'agregar' ? 'Agregar Cliente' : 'Editar Cliente'}
          </h2>

          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '0.50fr 0.50fr', gap: '0.25rem', width: '100%', minWidth: '500px' }}>

              {/* Fila 1: Tipo de Documento y Número de Documento */}
              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                  Tipo de Documento: <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  value={formData.tipoDocumento}
                  onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
                >
                  <option value="CC">Cédula</option>
                  <option value="TI">TI</option>
                  <option value="CE">CE</option>
                  <option value="PA">Pasaporte</option>
                </select>
              </div>

              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                  N° Documento: <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.numeroDocumento}
                  onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{
                    width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px',
                    borderColor: formErrors.numeroDocumento ? 'red' : '' // Resaltar borde si hay error
                  }}
                  maxLength={10}
                />
                {/* Mensaje de error para número de documento */}
                {formErrors.numeroDocumento && (
                  <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.numeroDocumento}</small>
                )}
              </div>

              {/* Fila 2: Nombre y Apellido */}
              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                  Nombre: <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{
                    width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px',
                    borderColor: formErrors.nombre ? 'red' : ''
                  }}
                  maxLength={15}
                />
                {formErrors.nombre && (
                  <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.nombre}</small>
                )}
              </div>

              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                  Apellido: <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => handleInputChange('apellido', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{
                    width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px',
                    borderColor: formErrors.apellido ? 'red' : ''
                  }}
                  maxLength={15}
                />
                {formErrors.apellido && (
                  <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.apellido}</small>
                )}
              </div>

              {/* Fila 3: Correo y Celular */}
              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                  Correo: <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.correo}
                  onChange={(e) => handleInputChange('correo', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{
                    width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px',
                    borderColor: formErrors.correo ? 'red' : ''
                  }}
                  maxLength={20}
                />
                {formErrors.correo && (
                  <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.correo}</small>
                )}
              </div>

              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                  Celular: <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="tel"
                  value={formData.celular}
                  onChange={(e) => handleInputChange('celular', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{
                    width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px',
                    borderColor: formErrors.celular ? 'red' : ''
                  }}
                  maxLength={10}
                />
                {formErrors.celular && (
                  <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.celular}</small>
                )}
              </div>

              {/* Fila 4: Contraseña con toggle y Fecha de Nacimiento */}
              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                  Contraseña: {modalTipo === 'agregar' && <span style={{ color: 'red' }}>*</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={mostrarContrasena ? "text" : "password"}
                    value={formData.contrasena}
                    onChange={(e) => handleInputChange('contrasena', e.target.value)}
                    className="modal-input text-sm p-1"
                    style={{
                      width: '100%',
                      height: '28px',
                      fontSize: '12px',
                      padding: '2px 25px 2px 4px',
                      paddingRight: '25px',
                      borderColor: formErrors.contrasena ? 'red' : ''
                    }}
                    placeholder={modalTipo === 'editar' ? 'Opcional (8+ chars, 1 mayúscula, 1 especial)' : '8+ chars, 1 mayúscula, 1 especial'}
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                    style={{
                      position: 'absolute',
                      right: '5px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#666',
                      padding: '0',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {mostrarContrasena ? '🙈' : '👁️'}
                  </button>
                </div>
                {formErrors.contrasena && (
                  <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.contrasena}</small>
                )}
              </div>

              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Fecha Nacimiento:</label>
                <input
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{
                    width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px',
                    borderColor: formErrors.fechaNacimiento ? 'red' : ''
                  }}
                />
                {formErrors.fechaNacimiento && (
                  <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.fechaNacimiento}</small>
                )}
              </div>

              {/* Fila 5: Confirmar Contraseña con toggle (solo en agregar) y Dirección */}
              {(modalTipo === 'agregar' || (modalTipo === 'editar' && formData.contrasena.trim())) && (
                <div className="modal-field">
                  <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>
                    Confirmar Contraseña: {(modalTipo === 'agregar' || formData.contrasena.trim()) && <span style={{ color: 'red' }}>*</span>}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={mostrarConfirmarContrasena ? "text" : "password"}
                      value={formData.confirmarContrasena}
                      onChange={(e) => handleInputChange('confirmarContrasena', e.target.value)}
                      className="modal-input text-sm p-1"
                      style={{
                        width: '100%',
                        height: '28px',
                        fontSize: '12px',
                        padding: '2px 25px 2px 4px',
                        paddingRight: '25px',
                        borderColor: formErrors.confirmarContrasena ? 'red' : ''
                      }}
                      placeholder="Confirme la contraseña"
                      maxLength={20}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
                      style={{
                        position: 'absolute',
                        right: '5px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#666',
                        padding: '0',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title={mostrarConfirmarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {mostrarConfirmarContrasena ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {formErrors.confirmarContrasena && (
                    <small style={{ color: 'red', fontSize: '10px' }}>{formErrors.confirmarContrasena}</small>
                  )}
                </div>
              )}

              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Dirección:</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
                  maxLength={50}
                />
              </div>

              {/* Fila 6: Barrio y Ciudad */}
              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Barrio:</label>
                <input
                  type="text"
                  value={formData.barrio}
                  onChange={(e) => handleInputChange('barrio', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
                  maxLength={30}
                />
              </div>

              <div className="modal-field">
                <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Ciudad:</label>
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                  className="modal-input text-sm p-1"
                  style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
                  maxLength={30}
                />
              </div>

              {/* Estado - Solo mostrar en editar */}
              {modalTipo === 'editar' && (
                <div className="modal-field">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.2rem' }}>
                    <label className="text-sm" style={{ fontSize: '12px' }}>Estado:</label>
                    <InputSwitch
                      checked={formData.estado}
                      onChange={(e) => handleInputChange('estado', e.value)}
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="modal-footer mt-2 flex justify-end gap-2">
            <button className="modal-btn cancel-btn text-sm px-3 py-1" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn text-sm px-3 py-1" onClick={guardarCliente}>Guardar</button>
          </div>
        </Modal>
      )}

      {/* Modal Visualizar */}
      {modalTipo === 'visualizar' && clienteSeleccionado && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Detalles del Cliente</h2>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Columna 1 */}
              <div>
                <p><strong>ID Cliente:</strong> {clienteSeleccionado.idCliente}</p>
                <p><strong>Tipo de Documento:</strong> {clienteSeleccionado.tipoDocumento}</p>
                <p><strong>Número de Documento:</strong> {clienteSeleccionado.numeroDocumento}</p>
                <p><strong>Nombre:</strong> {clienteSeleccionado.nombre}</p>
                <p><strong>Apellido:</strong> {clienteSeleccionado.apellido}</p>
                <p><strong>Correo:</strong> {clienteSeleccionado.correo}</p>
              </div>

              {/* Columna 2 */}
              <div>
                <p><strong>Dirección:</strong> {clienteSeleccionado.direccion}</p>
                <p><strong>Barrio:</strong> {clienteSeleccionado.barrio}</p>
                <p><strong>Ciudad:</strong> {clienteSeleccionado.ciudad}</p>
                <p><strong>Fecha de Nacimiento:</strong> {formatearFecha(clienteSeleccionado.fechaNacimiento)}</p>
                <p><strong>Celular:</strong> {clienteSeleccionado.celular}</p>
                <p><strong>Estado:</strong> {clienteSeleccionado.estado ? 'Activo' : 'Inactivo'}</p>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cerrar</button>
          </div>
        </Modal>
      )}

      {/* Modal Eliminar - Pregunta inicial */}
      {modalTipo === 'eliminar' && clienteSeleccionado && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Eliminar Cliente</h2>
          <div className="modal-body">
            <p>¿Está seguro que desea eliminar el cliente <strong>{clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</strong>?</p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn" onClick={manejarEliminacion}>Eliminar</button>
          </div>
        </Modal>
      )}

      {/* Modal Confirmar Eliminación */}
      {modalTipo === 'confirmarEliminar' && clienteSeleccionado && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Confirmar Eliminación</h2>
          <div className="modal-body">
            <p>¿Está completamente seguro que desea eliminar el cliente <strong>{clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</strong>?</p>
            <p style={{ color: '#e53935', fontSize: '14px' }}>
              Esta acción no se puede deshacer y se eliminará toda la información del cliente.
            </p>
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            <button className="modal-btn save-btn" onClick={confirmarEliminar}>Confirmar Eliminación</button>
          </div>
        </Modal>
      )}
    </div>
  );
}