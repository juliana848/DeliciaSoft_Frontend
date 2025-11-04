import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../../../adminStyles.css';
import SearchBar from '../../../components/SearchBar';
import Tooltip from '../../../components/Tooltip';

export default function CategoriaList({ categorias, loading, onAdd, onEdit, onView, onDelete, onToggleActivo }) {
  const [filtro, setFiltro] = React.useState('');

  const imagenBodyTemplate = (rowData, abrirModalVisualizar) => {
    if (rowData.imagen) {
      return (
        <img
          src={rowData.imagen}
          alt={rowData.nombre}
          style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => abrirModalVisualizar(rowData)}
        />
      );
    }
    return (
      <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#666' }}>
        Sin imagen
      </div>
    );
  };

  const categoriasFiltradas = categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    cat.descripcion.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <div className="admin-toolbar">
        <button className="admin-button pink" onClick={onAdd} type="button">
          + Agregar
        </button>
        <SearchBar placeholder="Buscar categoría..." value={filtro} onChange={setFiltro} />
      </div>

      <h2 className="admin-section-title">Gestión de Categorías de Productos</h2>

      <DataTable
        value={categoriasFiltradas}
        className="admin-table compact-paginator"
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
        loading={loading}
        emptyMessage="No se encontraron categorías"
      >
        <Column header="N°" body={(_, { rowIndex }) => rowIndex + 1} style={{ width: '3rem' }} headerStyle={{ textAlign: 'right', paddingLeft: '25px' }} bodyStyle={{ textAlign: 'center', paddingLeft: '3px' }} />
        <Column header="Imagen" body={(rowData) => imagenBodyTemplate(rowData, onView)} headerStyle={{ textAlign: 'center', paddingLeft: '10px' }} bodyStyle={{ textAlign: 'center', paddingLeft: '10px' }} style={{ width: '100px' }} />
        <Column field="nombre" header="Nombre" headerStyle={{ textAlign: 'right', paddingLeft: '80px' }} bodyStyle={{ textAlign: 'center', paddingLeft: '20px' }} style={{ width: '200px', maxHeight: '300px' }} />
        <Column field="descripcion" header="Descripción" bodyClassName="descripcion-col" headerStyle={{ textAlign: 'right', paddingLeft: '80px' }} bodyStyle={{ textAlign: 'center', paddingLeft: '20px' }} style={{ width: '200px' }} />
        <Column header="Estado" body={(rowData) => (<InputSwitch checked={rowData.activo} onChange={() => onToggleActivo(rowData)} />)} headerStyle={{ textAlign: 'right', paddingLeft: '80px' }} bodyStyle={{ textAlign: 'center', paddingLeft: '20px' }} style={{ width: '150px' }} />
        <Column header="Acción" body={(rowData) => (
          <>
            <Tooltip text="Visualizar">
              <button className="admin-button gray" onClick={() => onView(rowData)}>👁</button>
            </Tooltip>

            <Tooltip text={rowData.activo ? "Editar" : "Categoría inactiva"}>
              <button className={`admin-button ${rowData.activo ? 'yellow' : 'yellow-disabled'}`} onClick={() => rowData.activo && onEdit(rowData)} disabled={!rowData.activo} style={{ opacity: rowData.activo ? 1 : 0.5, cursor: rowData.activo ? 'pointer' : 'not-allowed' }}>
                ✏️
              </button>
            </Tooltip>

            <Tooltip text={rowData.activo ? "Eliminar" : "Categoría inactiva"}>
              <button className={`admin-button ${rowData.activo ? 'red' : 'red-disabled'}`} onClick={() => rowData.activo && onDelete(rowData)} disabled={!rowData.activo} style={{ opacity: rowData.activo ? 1 : 0.5, cursor: rowData.activo ? 'pointer' : 'not-allowed' }}>
                🗑️
              </button>
            </Tooltip>
          </>
        )} headerStyle={{ textAlign: 'right', paddingLeft: '80px' }} bodyStyle={{ textAlign: 'center', paddingLeft: '20px' }} style={{ width: '180px' }} />
      </DataTable>
    </div>
  );
}
