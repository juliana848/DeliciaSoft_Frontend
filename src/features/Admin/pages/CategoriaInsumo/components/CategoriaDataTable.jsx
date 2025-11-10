// src/pages/categorias/components/CategoriaDataTable.jsx

import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import Tooltip from '../../../components/Tooltip';

const CategoriaDataTable = ({ 
  categorias, 
  loadingStates, 
  onToggleActivo, 
  onAbrirModal 
}) => {
  
  const estadoBodyTemplate = (rowData) => (
    <InputSwitch
      checked={rowData.activo}
      onChange={() => onToggleActivo(rowData)}
      disabled={loadingStates[rowData.id]}
    />
  );

  const accionBodyTemplate = (rowData) => {
    const isEnabled = rowData.activo;
    const isLoadingThis = loadingStates[rowData.id];

    return (
      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
        <Tooltip text="Visualizar">
          <button 
            className="admin-button gray" 
            onClick={() => onAbrirModal('visualizar', rowData)}
            disabled={isLoadingThis}
          >
            👁
          </button>
        </Tooltip>

        <Tooltip text={isEnabled ? "Editar" : "Editar (Deshabilitado)"}>
          <button 
            className="admin-button yellow"
            onClick={() => isEnabled && onAbrirModal('editar', rowData)}
            disabled={!isEnabled || isLoadingThis}
            style={{
              opacity: isEnabled && !isLoadingThis ? 1 : 0.50,
              cursor: isEnabled && !isLoadingThis ? 'pointer' : 'not-allowed'
            }}
          >
            ✏️
          </button>
        </Tooltip>

        <Tooltip text={isEnabled ? "Eliminar" : "Eliminar (Deshabilitado)"}>
          <button 
            className="admin-button red"
            onClick={() => isEnabled && onAbrirModal('eliminar', rowData)}
            disabled={!isEnabled || isLoadingThis}
            style={{
              opacity: isEnabled && !isLoadingThis ? 1 : 0.50,
              cursor: isEnabled && !isLoadingThis ? 'pointer' : 'not-allowed'
            }}
          >
            🗑️
          </button>
        </Tooltip>
      </div>
    );
  };

  return (
    <DataTable
      value={categorias}
      className="admin-table compact-paginator"
      paginator
      rows={5}
      rowsPerPageOptions={[5, 10, 25, 50]}
      tableStyle={{ minWidth: '50rem' }}
    >
      <Column header="N°" body={(_, { rowIndex }) => rowIndex + 1} />
      <Column field="nombre" header="Nombre" />
      <Column field="descripcion" header="Descripción" />
      <Column header="Estados" body={estadoBodyTemplate} />
      <Column header="Acción" body={accionBodyTemplate} />
    </DataTable>
  );
};

export default CategoriaDataTable;