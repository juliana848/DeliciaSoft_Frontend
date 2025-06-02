// src/features/Admin/crudConfigs/categorias.js

export const categoriaCrudConfig = {
columns: [
    { field: 'id', header: 'ID' },
    { field: 'codigo', header: 'Codigo Compra' },
    { field: 'proveedor', header: 'Proveedor' },
    { field: 'fecha_compra', header: 'Fecha Compra' },
    { field: 'total', header: 'Total' },
],
    endpoint: '/api/categorias' 
};
