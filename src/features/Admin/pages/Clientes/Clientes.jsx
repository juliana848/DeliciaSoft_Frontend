import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../../adminStyles.css';
import Modal from '../../components/modal';
import SearchBar from '../../components/SearchBar';
import Notification from '../../components/Notification';
import ClienteFormModal from './components/ClientesForm';
import clienteApiService from '../../services/cliente_services'; 

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar clientes desde la API
  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const clientesData = await clienteApiService.obtenerClientes();
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setError(error.message);
      showNotification(`Error al cargar clientes: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

const toggleEstado = async (cliente) => {
  try {
    const clienteActualizado = await clienteApiService.toggleEstadoCliente(cliente.idCliente);

    const updated = clientes.map(c =>
      c.idCliente === cliente.idCliente ? { ...c, estado: clienteActualizado.estado } : c
    );
    setClientes(updated);

    showNotification(`Cliente ${clienteActualizado.estado ? 'activado' : 'desactivado'} exitosamente`);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    showNotification(`Error al cambiar estado: ${error.message}`, 'error');
  }
};

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const abrirModal = async (tipo, cliente = null) => {
    setModalTipo(tipo);
    setClienteSeleccionado(cliente);
    setModalVisible(true);

    // Verificar si el cliente tiene ventas cuando se intenta eliminar
    if (tipo === 'eliminar' && cliente) {
      try {
        const tieneVentas = await clienteApiService.clienteTieneVentas(cliente.idCliente);
        setClienteSeleccionado({ ...cliente, tieneVentas });
      } catch (error) {
        console.error('Error al verificar ventas:', error);
      }
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setClienteSeleccionado(null);
    setModalTipo(null);
  };

  const handleSaveCliente = async (formData) => {
    try {
      let clienteResult;

      if (modalTipo === 'agregar') {
        clienteResult = await clienteApiService.crearCliente(formData);
        setClientes([...clientes, clienteResult]);
        showNotification('Cliente agregado exitosamente');
      } else if (modalTipo === 'editar') {
        clienteResult = await clienteApiService.actualizarCliente(clienteSeleccionado.idCliente, formData);
        const updated = clientes.map(c =>
          c.idCliente === clienteSeleccionado.idCliente ? clienteResult : c
        );
        setClientes(updated);
        showNotification('Cliente actualizado exitosamente');
      }

      cerrarModal();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      showNotification(`Error al guardar cliente: ${error.message}`, 'error');
    }
  };

  const manejarEliminacion = () => {
    if (clienteSeleccionado.tieneVentas) {
      cerrarModal();
      showNotification('No se puede eliminar el cliente porque tiene ventas asociadas', 'error');
      return;
    }
    setModalTipo('confirmarEliminar');
  };

  const confirmarEliminar = async () => {
    try {
      await clienteApiService.eliminarCliente(clienteSeleccionado.idCliente);
      const updated = clientes.filter(c => c.idCliente !== clienteSeleccionado.idCliente);
      setClientes(updated);
      cerrarModal();
      showNotification('Cliente eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      showNotification(`Error al eliminar cliente: ${error.message}`, 'error');
    }
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.apellido?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.correo?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.celular?.includes(filtro)
  );

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  // Componente de carga
  if (loading) {
    return (
      <div className="admin-wrapper">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <p>Cargando clientes...</p>
        </div>
      </div>
    );
  }

  // Componente de error
  if (error && clientes.length === 0) {
    return (
      <div className="admin-wrapper">
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <p style={{ color: 'red', marginBottom: '10px' }}>Error al cargar clientes: {error}</p>
          <button 
            className="admin-button pink" 
            onClick={cargarClientes}
            style={{ padding: '8px 16px' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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

      <h2 className="admin-section-title">Gestión de Clientes</h2>

      <DataTable
        value={clientesFiltrados}
        className="admin-table"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
        emptyMessage="No hay clientes para mostrar"
      >
        <Column
          header="N°"
          headerStyle={{ paddingLeft: '1.5rem' }}
          body={(rowData, { rowIndex }) => rowIndex + 1}
          style={{ width: '3rem', textAlign: 'center' }}
        />
        <Column 
          field="nombre" 
          header="Nombre" 
          headerStyle={{ paddingLeft: '2.5rem' }} 
        />
        <Column 
          field="apellido" 
          header="Apellido" 
          headerStyle={{ paddingLeft: '2.5rem' }} 
        />
        <Column 
          field="correo" 
          header="Correo" 
          headerStyle={{ paddingLeft: '3rem' }} 
        />
        <Column 
          field="celular" 
          header="Celular" 
          headerStyle={{ paddingLeft: '3rem' }} 
        />
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
              <button 
                className="admin-button gray" 
                title="Visualizar" 
                onClick={() => abrirModal('visualizar', rowData)}
              >
                🔍
              </button>
              <button
                className="admin-button yellow"
                title="Editar"
                onClick={() => abrirModal('editar', rowData)}
                disabled={!rowData.estado}
                style={{ 
                  opacity: rowData.estado ? 1 : 0.5, 
                  cursor: rowData.estado ? 'pointer' : 'not-allowed' 
                }}
              >
                ✏️
              </button>
              <button
                className="admin-button red"
                title="Eliminar"
                onClick={() => abrirModal('eliminar', rowData)}
                disabled={!rowData.estado}
                style={{ 
                  opacity: rowData.estado ? 1 : 0.5, 
                  cursor: rowData.estado ? 'pointer' : 'not-allowed' 
                }}
              >
                🗑️
              </button>
            </>
          )}
        />
      </DataTable>

      {/* Modal para agregar/editar/visualizar cliente */}
      {(modalTipo === 'agregar' || modalTipo === 'editar' || modalTipo === 'visualizar') && (
        <ClienteFormModal
          visible={modalVisible}
          onClose={cerrarModal}
          modalTipo={modalTipo}
          clienteSeleccionado={clienteSeleccionado}
          clientes={clientes}
          onSave={handleSaveCliente}
          showNotification={showNotification}
        />
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