import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../adminStyles.css';
import Modal from '../components/modal';
import SearchBar from '../components/SearchBar';
import Notification from '../components/Notification';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    direccion: '',
    barrio: '',
    ciudad: '',
    fechaNacimiento: '',
    celular: '',
    estado: true
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
    
    if (tipo === 'agregar') {
      setFormData({
        tipoDocumento: 'CC',
        numeroDocumento: '',
        nombre: '',
        apellido: '',
        correo: '',
        contrasena: '',
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
        contrasena: cliente.contrasena,
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
    setFormData({
      tipoDocumento: 'CC',
      numeroDocumento: '',
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      direccion: '',
      barrio: '',
      ciudad: '',
      fechaNacimiento: '',
      celular: '',
      estado: true
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validarFormulario = () => {
    const { numeroDocumento, nombre, apellido, correo, celular, contrasena, fechaNacimiento } = formData;
    
    if (!numeroDocumento.trim()) {
      showNotification('El número de documento es obligatorio', 'error');
      return false;
    }
    
    // Validar que el documento solo contenga números
    if (!/^\d+$/.test(numeroDocumento)) {
      showNotification('El número de documento solo puede contener números', 'error');
      return false;
    }
    
    if (!nombre.trim()) {
      showNotification('El nombre es obligatorio', 'error');
      return false;
    }
    if (!apellido.trim()) {
      showNotification('El apellido es obligatorio', 'error');
      return false;
    }
    if (!correo.trim()) {
      showNotification('El correo es obligatorio', 'error');
      return false;
    }
    if (!celular.trim()) {
      showNotification('El celular es obligatorio', 'error');
      return false;
    }
    
    // Validar que el celular solo contenga números
    if (!/^\d+$/.test(celular)) {
      showNotification('El celular solo puede contener números', 'error');
      return false;
    }
    
    // Validar contraseña (solo para agregar o si se está editando y hay contraseña)
    if (modalTipo === 'agregar' || (modalTipo === 'editar' && contrasena.trim())) {
      if (contrasena.length < 8) {
        showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
        return false;
      }
    }
    
    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      showNotification('El formato del correo no es válido', 'error');
      return false;
    }
    
    // Validar fecha de nacimiento (al menos 13 años)
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
        showNotification('El cliente debe tener al menos 13 años', 'error');
        return false;
      }
    }
    
    // Validar que el documento no esté repetido
    const documentoExiste = clientes.some(c => 
      c.numeroDocumento === numeroDocumento && 
      (modalTipo === 'agregar' || c.idCliente !== clienteSeleccionado?.idCliente)
    );
    if (documentoExiste) {
      showNotification('Ya existe un cliente con este número de documento', 'error');
      return false;
    }
    
    return true;
  };

  const guardarCliente = () => {
    if (!validarFormulario()) return;
    
    if (modalTipo === 'agregar') {
      const nuevoId = clientes.length ? Math.max(...clientes.map(c => c.idCliente)) + 1 : 1;
      const nuevoCliente = {
        ...formData,
        idCliente: nuevoId,
        contrasena: formData.contrasena || '********', // Encriptar en producción
        estado: true // Siempre activo al crear
      };
      
      setClientes([...clientes, nuevoCliente]);
      showNotification('Cliente agregado exitosamente');
    } else if (modalTipo === 'editar') {
      const updated = clientes.map(c =>
        c.idCliente === clienteSeleccionado.idCliente 
          ? { ...c, ...formData }
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
        <Column field="nombre" header="Nombre"  headerStyle={{ paddingLeft: '2.5rem' }} />
        <Column field="apellido" header="Apellido"  headerStyle={{ paddingLeft: '2.5rem' }}/>
        <Column field="correo" header="Correo"  headerStyle={{ paddingLeft: '3rem' }}/>
        <Column field="celular" header="Celular"  headerStyle={{ paddingLeft: '3rem' }} />
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
          <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Tipo de Documento:</label>
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
          <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>N° Documento:</label>
          <input
            type="text"
            value={formData.numeroDocumento}
            onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
            className="modal-input text-sm p-1"
            style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
            maxLength={20}
          />
        </div>

        {/* Fila 2: Nombre y Apellido */}
        <div className="modal-field">
          <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Nombre:</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            className="modal-input text-sm p-1"
            style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
            maxLength={30}
          />
        </div>

        <div className="modal-field">
          <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Apellido:</label>
          <input
            type="text"
            value={formData.apellido}
            onChange={(e) => handleInputChange('apellido', e.target.value)}
            className="modal-input text-sm p-1"
            style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
            maxLength={30}
          />
        </div>

        {/* Fila 3: Correo y Contraseña */}
        <div className="modal-field">
          <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Correo:</label>
          <input
            type="email"
            value={formData.correo}
            onChange={(e) => handleInputChange('correo', e.target.value)}
            className="modal-input text-sm p-1"
            style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
            maxLength={50}
          />
        </div>

        <div className="modal-field">
          <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Contraseña:</label>
          <input
            type="password"
            value={formData.contrasena}
            onChange={(e) => handleInputChange('contrasena', e.target.value)}
            className="modal-input text-sm p-1"
            style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
            placeholder={modalTipo === 'editar' ? 'Opcional (mín. 8 caracteres)' : 'Mínimo 8 caracteres'}
            maxLength={20}
          />
        </div>

        {/* Fila 4: Dirección y Barrio */}
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

        {/* Fila 5: Ciudad y Fecha de Nacimiento */}
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

        <div className="modal-field">
          <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Fecha Nacimiento:</label>
          <input
            type="date"
            value={formData.fechaNacimiento}
            onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
            className="modal-input text-sm p-1"
            style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
          />
        </div>

        {/* Fila 6: Celular y Estado (solo para editar) */}
        <div className="modal-field">
          <label className="text-sm" style={{ fontSize: '12px', marginBottom: '2px', display: 'block' }}>Celular:</label>
          <input
            type="tel"
            value={formData.celular}
            onChange={(e) => handleInputChange('celular', e.target.value)}
            className="modal-input text-sm p-1"
            style={{ width: '100%', height: '28px', fontSize: '12px', padding: '2px 4px' }}
            maxLength={20}
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