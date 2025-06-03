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
    const { numeroDocumento, nombre, apellido, correo, celular } = formData;
    
    if (!numeroDocumento.trim()) {
      showNotification('El número de documento es obligatorio', 'error');
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
    
    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      showNotification('El formato del correo no es válido', 'error');
      return false;
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
        contrasena: formData.contrasena || '********' // Encriptar en producción
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
          + Agregar Cliente
        </button>
        <SearchBar
          placeholder="Buscar cliente..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <DataTable
        value={clientesFiltrados}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column field="idCliente" header="ID" />
        <Column field="numeroDocumento" header="Documento" />
        <Column 
          header="Nombre Completo" 
          body={(rowData) => `${rowData.nombre} ${rowData.apellido}`}
        />
        <Column field="correo" header="Correo" />
        <Column field="celular" header="Celular" />
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
      {modalTipo === 'agregar' ? 'Agregar Nuevo Cliente' : 'Editar Cliente'}
    </h2>
    <div className="modal-body">
      <div
        className="grid"
        style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}
      >
        {/* Columna 1 */}
        <div>
          <div className="modal-field">
            <label>Tipo de Documento:</label>
            <select
              value={formData.tipoDocumento}
              onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
              className="modal-input"
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="PA">Pasaporte</option>
            </select>
          </div>

          <div className="modal-field">
            <label>Número de Documento:</label>
            <input
              type="text"
              value={formData.numeroDocumento}
              onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
              className="modal-input"
              maxLength={20}
            />
          </div>

          <div className="modal-field">
            <label>Nombre:</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className="modal-input"
              maxLength={30}
            />
          </div>
        </div>

        {/* Columna 2 */}
        <div>
          <div className="modal-field">
            <label>Apellido:</label>
            <input
              type="text"
              value={formData.apellido}
              onChange={(e) => handleInputChange('apellido', e.target.value)}
              className="modal-input"
              maxLength={30}
            />
          </div>

          <div className="modal-field">
            <label>Correo Electrónico:</label>
            <input
              type="email"
              value={formData.correo}
              onChange={(e) => handleInputChange('correo', e.target.value)}
              className="modal-input"
              maxLength={50}
            />
          </div>

          <div className="modal-field">
            <label>Contraseña:</label>
            <input
              type="password"
              value={formData.contrasena}
              onChange={(e) => handleInputChange('contrasena', e.target.value)}
              className="modal-input"
              maxLength={20}
              placeholder={modalTipo === 'editar' ? 'Dejar vacío para mantener actual' : ''}
            />
          </div>
        </div>

        {/* Columna 3 */}
        <div>
          <div className="modal-field">
            <label>Dirección:</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => handleInputChange('direccion', e.target.value)}
              className="modal-input"
              maxLength={50}
            />
          </div>

          <div className="modal-field">
            <label>Barrio:</label>
            <input
              type="text"
              value={formData.barrio}
              onChange={(e) => handleInputChange('barrio', e.target.value)}
              className="modal-input"
              maxLength={30}
            />
          </div>

          <div className="modal-field">
            <label>Ciudad:</label>
            <input
              type="text"
              value={formData.ciudad}
              onChange={(e) => handleInputChange('ciudad', e.target.value)}
              className="modal-input"
              maxLength={30}
            />
          </div>

          <div className="modal-field">
            <label>Fecha de Nacimiento:</label>
            <input
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
              className="modal-input"
            />
          </div>
        </div>

        {/* Columna 4 */}
        <div>
          <div className="modal-field">
            <label>Celular:</label>
            <input
              type="tel"
              value={formData.celular}
              onChange={(e) => handleInputChange('celular', e.target.value)}
              className="modal-input"
              maxLength={20}
            />
          </div>

          <div className="modal-field">
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              Estado:
              <InputSwitch
                checked={formData.estado}
                onChange={(e) => handleInputChange('estado', e.value)}
              />
            </label>
          </div>
        </div>
      </div>
    </div>

    <div className="modal-footer">
      <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
      <button className="modal-btn save-btn" onClick={guardarCliente}>Guardar</button>
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

      {/* Modal Eliminar */}
      {modalTipo === 'eliminar' && clienteSeleccionado && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title">Confirmar Eliminación</h2>
          <div className="modal-body">
            <p>¿Está seguro que desea eliminar el cliente <strong>{clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</strong>?</p>
            <p style={{ color: '#e53935', fontSize: '14px' }}>
              Esta acción no se puede deshacer y se eliminará toda la información del cliente.
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