import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import './sedeStyles.css'
import Tooltip from '../../../components/Tooltip';

export default function SedeTable({
  sedes,
  loading,
  onToggleActivo,
  onVerSede,
  onEditarSede,
  onEliminarSede,
}) {
  // Template para numeración consecutiva
  const numeroTemplate = (rowData, options) => {
    return options.rowIndex + 1;
  };

  const accionesTemplate = (rowData) => (
    <div className="action-buttons">
      <Tooltip text="Visualizar">
        <button
          className="admin-button gray"
          onClick={() => onVerSede(rowData)}
          disabled={loading}
        >
          👁
        </button>
      </Tooltip>

      <Tooltip text={!rowData.activo ? "Editar (Deshabilitado)" : "Editar"}>
        <button
          className="admin-button yellow"
          onClick={() => onEditarSede(rowData)}
          disabled={loading || !rowData.activo}
          style={{
            opacity: !rowData.activo ? 0.5 : 1,
            cursor: !rowData.activo ? "not-allowed" : "pointer",
          }}
        >
          ✏️
        </button>
      </Tooltip>

      <Tooltip text={!rowData.activo ? "Eliminar (Deshabilitado)" : "Eliminar"}>
        <button
          className="admin-button red"
          onClick={() => onEliminarSede(rowData)}
          disabled={loading || !rowData.activo}
          style={{
            opacity: !rowData.activo ? 0.5 : 1,
            cursor: !rowData.activo ? "not-allowed" : "pointer",
          }}
        >
          🗑️
        </button>
      </Tooltip>
    </div>
  );

  const estadoTemplate = (rowData) => (
    <InputSwitch
      checked={rowData.activo}
      onChange={() => onToggleActivo(rowData)}
      disabled={loading}
    />
  );

   return (
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
        style={{ width: "80px", textAlign: "center" }}
        headerStyle={{ width: "80px", textAlign: "center" }}
      />
      <Column
        field="nombre"
        header="Nombre"
        style={{ width: "180px" }}
        headerStyle={{ width: "180px" }}
      />
      <Column
        field="Direccion"
        header="Dirección"
        style={{
          width: "280px",
          maxWidth: "280px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        headerStyle={{ width: "280px" }}
      />
      <Column
        field="Telefono"
        header="Teléfono"
        style={{ width: "140px" }}
        headerStyle={{ width: "140px" }}
      />
      <Column
        header="Estado"
        body={estadoTemplate}
        style={{ width: "100px", textAlign: "center" }}
        headerStyle={{ width: "100px", textAlign: "center" }}
      />
      <Column
        header="Acciones"
        body={accionesTemplate}
        style={{ width: "160px", textAlign: "center" }}
        headerStyle={{ width: "160px", textAlign: "center" }}
      />
    </DataTable>
  );
}