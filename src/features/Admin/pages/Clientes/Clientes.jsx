import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../../adminStyles.css';
import Modal from '../../components/modal'; // Este import se mantiene para los otros tipos de modal
import SearchBar from '../../components/SearchBar';
import Notification from '../../components/Notification';
import ClienteFormModal from './components/ClientesForm'; // Importa el nuevo componente

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    const mockClientes = [
      {
        idCliente: 101,
        tipoDocumento: 'CC',
        numeroDocumento: '1013340075',
        nombre: 'Maria',
        apellido: 'Ferreira',
        correo: 'MF@gmail.com',
        contrasena: '13213123',
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
        contrasena: '23213234123',
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
        contrasena: '13213123',
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
        contrasena: '1312312312312',
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
        contrasena: '1231231233',
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
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setClienteSeleccionado(null);
    setModalTipo(null);
  };

  const handleSaveCliente = (formData) => {
    if (modalTipo === 'agregar') {
      const nuevoId = clientes.length ? Math.max(...clientes.map(c => c.idCliente)) + 1 : 1;
      const nuevoCliente = {
        ...formData,
        idCliente: nuevoId,
        contrasena: formData.contrasena || '********', // Encriptar en producción
        estado: true // Siempre activo al crear
      };

      delete nuevoCliente.confirmarContrasena;

      setClientes([...clientes, nuevoCliente]);
      showNotification('Cliente agregado exitosamente');
    } else if (modalTipo === 'editar') {
      const clienteActualizado = { ...formData };
      delete clienteActualizado.confirmarContrasena;
      
      if (!formData.contrasena.trim()) { // If new password is not provided
        clienteActualizado.contrasena = clienteSeleccionado.contrasena; // Keep the old one
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
    if (clienteSeleccionado.tieneVentas) {
      cerrarModal();
      showNotification('No se puede eliminar el cliente porque tiene ventas asociadas', 'error');
      return;
    }
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

      {/* Use the new ClienteFormModal component */}
      {(modalTipo === 'agregar' || modalTipo === 'editar') && (
        <ClienteFormModal
          visible={modalVisible}
          onClose={cerrarModal}
          modalTipo={modalTipo}
          clienteSeleccionado={clienteSeleccionado}
          clientes={clientes} // Pass the full clients array for validation
          onSave={handleSaveCliente}
          showNotification={showNotification}
        />
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