import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import '../../../adminStyles.css';
import SearchBar from '../../../components/SearchBar';
import Tooltip from '../../../components/Tooltip';

export default function CategoriaList({ categorias, loading, onAdd, onEdit, onView, onDelete, onToggleActivo }) {
  const [filtro, setFiltro] = React.useState('');

  const imagenBodyTemplate = (rowData) => {
    if (rowData.imagen) {
      return (
        <img
          src={rowData.imagen}
          alt={rowData.nombre}
          style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => onView(rowData)}
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
    <div className="admin-wrapper">
      {/* Toolbar: Buscador + Agregar a la derecha */}
      <div className="admin-toolbar">
        <SearchBar placeholder="Buscar categoría..." value={filtro} onChange={setFiltro} />
        <button className="admin-button pink" onClick={onAdd} type="button">
          <i className="fas fa-plus"></i> Agregar
        </button>
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
        <Column 
          header="N°" 
          body={(_, { rowIndex }) => rowIndex + 1} 
          style={{ width: '50px' }} 
        />
        <Column 
          header="Imagen" 
          body={(rowData) => imagenBodyTemplate(rowData)} 
          style={{ width: '100px' }} 
        />
        <Column field="nombre" header="Nombre" />
        <Column field="descripcion" header="Descripción" />
        <Column 
          header="Estado" 
          body={(rowData) => (
            <InputSwitch checked={rowData.activo} onChange={() => onToggleActivo(rowData)} />
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
                  onClick={() => onView(rowData)}
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

              <Tooltip text={rowData.activo ? "Editar" : "Categoría inactiva"}>
                <button 
                  className="admin-button" 
                  onClick={() => rowData.activo && onEdit(rowData)} 
                  disabled={!rowData.activo}
                  style={{
                    background: rowData.activo ? '#fff8e1' : '#f5f5f5',
                    color: rowData.activo ? '#f57c00' : '#bbb',
                    border: 'none',
                    borderRadius: '6px',
                    width: '26px',
                    height: '26px',
                    cursor: rowData.activo ? 'pointer' : 'not-allowed',
                    opacity: rowData.activo ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="fas fa-pen" style={{ fontSize: '11px' }}></i>
                </button>
              </Tooltip>

              <Tooltip text={rowData.activo ? "Eliminar" : "Categoría inactiva"}>
                <button 
                  className="admin-button" 
                  onClick={() => rowData.activo && onDelete(rowData)} 
                  disabled={!rowData.activo}
                  style={{
                    background: rowData.activo ? '#ffebee' : '#f5f5f5',
                    color: rowData.activo ? '#d32f2f' : '#bbb',
                    border: 'none',
                    borderRadius: '6px',
                    width: '26px',
                    height: '26px',
                    cursor: rowData.activo ? 'pointer' : 'not-allowed',
                    opacity: rowData.activo ? 1 : 0.5,
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
    </div>
  );
}