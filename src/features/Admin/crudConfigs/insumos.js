export const categoriaCrudConfig = {
columns: [
    { field: 'id', header: 'ID' },
    { field: 'nombre', header: 'Nombre' },
    { field: 'categoria', header: 'Categoria' },
    { field: 'cantidad', header: 'Cantidad' },
    { field: 'activo', header: 'Activo' },
    { field: 'acciones', header: 'Acciones' }
],
    endpoint: '/api/categorias' 
};
