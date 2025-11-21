import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import './sedeStyles.css'
import Tooltip from '../../components/Tooltip';

export default function SedeTable({
  sedes,
  loading,
  onToggleActivo,
  onVerSede,
  onEditarSede,
  onEliminarSede,
  filtro,
  setFiltro,
  onAgregar,
  SearchBar
}) {
  const numeroTemplate = (rowData, options) => {
    return options.rowIndex + 1;
  };

  const accionesTemplate = (rowData) => {
    const puedeEditar = rowData.activo;
    const puedeEliminar = rowData.activo;

    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
        <Tooltip text="Visualizar">
          <button
            className="admin-button"
            onClick={() => onVerSede(rowData)}
            disabled={loading}
            style={{ background: '#e3f2fd', color: '#1976d2', border: 'none', borderRadius: '6px', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <i className="fas fa-eye" style={{ fontSize: '11px' }}></i>
          </button>
        </Tooltip>

        <Tooltip text={puedeEditar ? "Editar" : "Sede desactivada"}>
          <button
            className="admin-button"
            onClick={() => onEditarSede(rowData)}
            disabled={loading || !puedeEditar}
            style={{ background: puedeEditar ? '#fff8e1' : '#f5f5f5', color: puedeEditar ? '#f57c00' : '#bbb', border: 'none', borderRadius: '6px', width: '26px', height: '26px', cursor: puedeEditar ? 'pointer' : 'not-allowed', opacity: puedeEditar ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <i className="fas fa-pen" style={{ fontSize: '11px' }}></i>
          </button>
        </Tooltip>

        <Tooltip text={puedeEliminar ? "Eliminar" : "Sede desactivada"}>
          <button
            className="admin-button"
            onClick={() => onEliminarSede(rowData)}
            disabled={loading || !puedeEliminar}
            style={{ background: puedeEliminar ? '#ffebee' : '#f5f5f5', color: puedeEliminar ? '#d32f2f' : '#bbb', border: 'none', borderRadius: '6px', width: '26px', height: '26px', cursor: puedeEliminar ? 'pointer' : 'not-allowed', opacity: puedeEliminar ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <i className="fas fa-trash" style={{ fontSize: '11px' }}></i>
          </button>
        </Tooltip>
      </div>
    );
  };

  const estadoTemplate = (rowData) => (
    <InputSwitch
      checked={rowData.activo}
      onChange={() => onToggleActivo(rowData)}
      disabled={loading}
    />
  );

  return (
    <>
      {/* Toolbar: SearchBar izquierda + Agregar derecha (como Usuarios) */}
      {SearchBar && onAgregar && (
        <div className="admin-toolbar">
          <SearchBar placeholder="Buscar sede..." value={filtro} onChange={setFiltro} />
          <button className="admin-button pink" onClick={onAgregar} type="button">
            <i className="fas fa-plus"></i> Agregar
          </button>
        </div>
      )}

      <DataTable
        value={sedes}
        className="admin-table compact-paginator"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "50rem" }}
        emptyMessage="No se encontraron sedes"
        loading={loading}
        loadingIcon="pi pi-spinner pi-spin"
        scrollable
        scrollHeight="500px"
        size="small"
        stripedRows
      >
        <Column
          header="N°"
          body={numeroTemplate}
          style={{ width: "50px" }}
        />
        <Column
          field="nombre"
          header="Nombre"
        />
        <Column
          field="Direccion"
          header="Dirección"
          style={{
            maxWidth: "280px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        />
        <Column
          field="Telefono"
          header="Teléfono"
        />
        <Column
          header="Estado"
          body={estadoTemplate}
          style={{ width: "80px" }}
        />
        <Column
          header="Acciones"
          body={accionesTemplate}
          style={{ width: "100px" }}
        />
      </DataTable>
    </>
  );
}