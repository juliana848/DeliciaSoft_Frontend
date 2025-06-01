// src/features/Admin/crudConfigs/categorias.js

export const categoriaCrudConfig = {
columns: [
    { field: 'id', header: 'ID' },
    { field: 'nombre', header: 'Nombre' },
    { field: 'fecha_registro', header: 'Fecha Registro' },
    { field: 'activo', header: 'Activo' },
    { field: 'acciones', header: 'Acciones' }
],
  endpoint: '/api/categorias' 
};
