import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../../adminStyles.css';
import SearchBar from '../../components/SearchBar';
import Notification from '../../components/Notification';
import Tooltip from '../../components/Tooltip';
import ProveedorModal from './components/ProveedorModal';
import { useProveedores } from './hooks/useProveedores';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ProveedoresTable() {
  const {
    proveedores,
    loading,
    filtro,
    setFiltro,
    notification,
    hideNotification,
    toggleEstado,
    cargarProveedores
  } = useProveedores();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  useEffect(() => {
    cargarProveedores();
  }, []);

  const abrirModal = (tipo, proveedor = null) => {
    setModalTipo(tipo);
    setProveedorSeleccionado(proveedor);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setProveedorSeleccionado(null);
    setModalTipo(null);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-wrapper">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      {/* Toolbar: Buscador + Agregar a la derecha */}
      <div className="admin-toolbar">
        <SearchBar 
          placeholder="Buscar proveedor..." 
          value={filtro} 
          onChange={setFiltro} 
        />
        <button 
          className="admin-button pink" 
          onClick={() => abrirModal('agregar')}
          disabled={loading}
          type="button"
        >
          <i className="fas fa-plus"></i> Agregar
        </button>
      </div>

      <h2 className="admin-section-title">Gestión de Proveedores</h2>

      <DataTable 
        value={proveedoresFiltrados} 
        className="admin-table compact-paginator" 
        paginator 
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
        emptyMessage="No se encontraron proveedores"
      >
        <Column 
          header="N°" 
          body={(rowData, { rowIndex }) => rowIndex + 1} 
          style={{ width: '50px' }} 
        />
        <Column field="nombre" header="Nombre" />
        <Column field="tipo" header="Tipo Proveedor" />
        <Column field="contacto" header="Contacto" />
        <Column field="correo" header="Correo" />
        <Column field="direccion" header="Dirección" />
        <Column
          header="Estado"
          body={(rowData) => (
            <InputSwitch 
              checked={rowData.estado} 
              onChange={() => toggleEstado(rowData)}
              disabled={loading}
            />
          )}
          style={{ width: '80px' }}
        />
        <Column
          header="Acciones"
          body={(rowData) => (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
              <Tooltip text="Visualizar">
                <button 
                  className="admin-button"
                  onClick={() => abrirModal('visualizar', rowData)}
                  disabled={loading}
                  style={{
                    background: '#e3f2fd',
                    color: '#1976d2',
                    border: 'none',
                    borderRadius: '6px',
                    width: '26px',
                    height: '26px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="fas fa-eye" style={{ fontSize: '11px' }}></i>
                </button>
              </Tooltip>

              <Tooltip text={rowData.estado ? "Editar" : "Proveedor inactivo"}>
                <button 
                  className="admin-button"
                  onClick={() => abrirModal('editar', rowData)}
                  disabled={loading || !rowData.estado}
                  style={{
                    background: rowData.estado ? '#fff8e1' : '#f5f5f5',
                    color: rowData.estado ? '#f57c00' : '#bbb',
                    border: 'none',
                    borderRadius: '6px',
                    width: '26px',
                    height: '26px',
                    cursor: rowData.estado ? 'pointer' : 'not-allowed',
                    opacity: rowData.estado ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="fas fa-pen" style={{ fontSize: '11px' }}></i>
                </button>
              </Tooltip>

              <Tooltip text={rowData.estado ? "Eliminar" : "Proveedor inactivo"}>
                <button 
                  className="admin-button"
                  onClick={() => abrirModal('eliminar', rowData)}
                  disabled={loading || !rowData.estado}
                  style={{
                    background: rowData.estado ? '#ffebee' : '#f5f5f5',
                    color: rowData.estado ? '#d32f2f' : '#bbb',
                    border: 'none',
                    borderRadius: '6px',
                    width: '26px',
                    height: '26px',
                    cursor: rowData.estado ? 'pointer' : 'not-allowed',
                    opacity: rowData.estado ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="fas fa-trash" style={{ fontSize: '11px' }}></i>
                </button>
              </Tooltip>
            </div>
          )}
          style={{ width: '100px' }}
        />
      </DataTable>

      <ProveedorModal
        visible={modalVisible}
        tipo={modalTipo}
        proveedor={proveedorSeleccionado}
        proveedores={proveedores}
        onClose={cerrarModal}
        onSuccess={cargarProveedores}
        loading={loading}
      />
    </div>
  );
}