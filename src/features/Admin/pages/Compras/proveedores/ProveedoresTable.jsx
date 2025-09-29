import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../../../adminStyles.css';
import SearchBar from '../../../components/SearchBar';
import Notification from '../../../components/Notification';
import ProveedorModal from './components/ProveedorModal';
import ProveedorActions from './components/ProveedorActions';
import { useProveedores } from './hooks/useProveedores';
import LoadingSpinner from '../../../components/LoadingSpinner.jsx';

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
  const [mensajeCarga, setMensajeCarga] = useState('Cargando...'); 
  

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
          <button 
            className="admin-button pink" 
            onClick={() => abrirModal('agregar')}
            disabled={loading}
          >
            + Agregar
          </button>
          <SearchBar placeholder="Buscar proveedor..." value={filtro} onChange={setFiltro} />
        </div>

        <h2 className="admin-section-title">Proveedores</h2>
        
        <DataTable 
          value={proveedoresFiltrados} 
          className="admin-table" 
          paginator 
          rows={5}
          rowsPerPageOptions={[5, 10, 20]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} proveedores"
          loading={loading}
        >
          <Column 
            header="N°" 
            headerStyle={{ paddingLeft: '1rem' }} 
            body={(rowData, { rowIndex }) => rowIndex + 1} 
            style={{ width: '3rem', textAlign: 'center' }} 
          />
          <Column field="nombre" header="Nombre" headerStyle={{ paddingLeft: '3rem' }} />
          <Column field="tipo" header="Tipo Proveedor" />
          <Column field="contacto" header="Contacto" />
          <Column field="correo" header="Correo" headerStyle={{ paddingLeft: '3rem' }} />
          <Column field="direccion" header="Dirección" headerStyle={{ paddingLeft: '2rem' }} />
          <Column
            header="Estado"
            body={(rowData) => (
              <InputSwitch 
                checked={rowData.estado} 
                onChange={() => toggleEstado(rowData)}
                disabled={loading}
              />
            )}
          />
          <Column
            header="Acción"
            body={(rowData) => (
              <ProveedorActions 
                proveedor={rowData}
                onAction={abrirModal}
                loading={loading}
              />
            )}
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
    </>
  );
}