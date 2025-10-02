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
import LoadingSpinner from '../../components/LoadingSpinner';

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
      // Ordenar por ID descendente para mostrar los más recientes primero
      const clientesOrdenados = clientesData.sort((a, b) => b.idCliente - a.idCliente);
      setClientes(clientesOrdenados);
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

      // Actualizar el estado local inmediatamente
      setClientes(prevClientes => {
        const nuevosClientes = prevClientes.map(c => {
          if (c.idCliente === cliente.idCliente) {
            return {
              ...c,
              estado: clienteActualizado.estado
            };
          }
          return c;
        });
        return nuevosClientes;
      });

      const estadoTexto = clienteActualizado.estado ? 'activado' : 'desactivado';
      showNotification(`Cliente ${estadoTexto} exitosamente`);
      
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
      const tieneVentas = await clienteApiService.clienteTieneVentas(cliente.idCliente);
      setClienteSeleccionado({ ...cliente, tieneVentas });
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
        // Agregar el nuevo cliente al inicio de la lista
        setClientes(prevClientes => [clienteResult, ...prevClientes]);
        showNotification('Cliente agregado exitosamente');
      } else if (modalTipo === 'editar') {
        clienteResult = await clienteApiService.actualizarCliente(clienteSeleccionado.idCliente, formData);
        setClientes(prevClientes =>
          prevClientes.map(c =>
            c.idCliente === clienteSeleccionado.idCliente ? clienteResult : c
          )
        );
        showNotification('Cliente actualizado exitosamente');
      }

      cerrarModal();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      let mensaje = error.message;
      
      // Detectar si el error es por duplicados
      if (mensaje.includes('Ya existe un cliente') || mensaje.includes('Ya existe un usuario')) {
        showNotification(mensaje, 'error');
      } else {
        showNotification(`Error al guardar cliente: ${mensaje}`, 'error');
      }
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
    // Llamar al servicio sin try-catch para evitar errores en consola
    const resultado = await clienteApiService.eliminarCliente(clienteSeleccionado.idCliente);
    
    cerrarModal();
    
    // Verificar el resultado
    if (resultado.success) {
      // Eliminación exitosa
      setClientes(prevClientes => 
        prevClientes.filter(c => c.idCliente !== clienteSeleccionado.idCliente)
      );
      showNotification('Cliente eliminado exitosamente');
    } else {
      // No se pudo eliminar (tiene ventas asociadas u otro error)
      showNotification(resultado.message, 'error');
    }
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.apellido?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.correo?.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.numeroDocumento?.includes(filtro)
  );

  // Componente de carga
    if (loading) {
      return <LoadingSpinner />;
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
          field="numeroDocumento" 
          header="N° Documento" 
          headerStyle={{ paddingLeft: '2rem' }} 
        />
        <Column 
          field="nombre" 
          header="Nombre" 
          headerStyle={{ paddingLeft: '3rem' }} 
        />
        <Column 
          field="apellido" 
          header="Apellido" 
          headerStyle={{ paddingLeft: '3rem' }} 
        />
        <Column 
          field="correo" 
          header="Correo" 
          headerStyle={{ paddingLeft: '7rem' }} 
        />
        <Column
          header="Estado"
          body={(rowData) => {
            return (
              <InputSwitch
                inputId={`switch-${rowData.idCliente}`}
                checked={!!rowData.estado}
                onChange={() => toggleEstado(rowData)}
                disabled={false}
              />
            );
          }}
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
                👁
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
            {clienteSeleccionado.tieneVentas && (
              <p style={{ color: '#e53935', fontSize: '14px', marginTop: '10px' }}>
                <strong>⚠️ Este cliente tiene ventas asociadas y no puede ser eliminado.</strong>
              </p>
            )}
          </div>
          <div className="modal-footer">
            <button className="modal-btn cancel-btn" onClick={cerrarModal}>Cancelar</button>
            {!clienteSeleccionado.tieneVentas && (
              <button className="modal-btn save-btn" onClick={manejarEliminacion}>Eliminar</button>
            )}
          </div>
        </Modal>
      )}

      {/* Modal Confirmar Eliminación */}
      {modalTipo === 'confirmarEliminar' && clienteSeleccionado && (
        <Modal visible={modalVisible} onClose={cerrarModal}>
          <h2 className="modal-title"> Eliminar Cliente</h2>
          <div className="modal-body">
            <p>¿Está seguro que desea eliminar el cliente <strong>{clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</strong>?</p>
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