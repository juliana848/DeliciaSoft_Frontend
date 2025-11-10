// src/pages/categorias/constants/categoriaConstants.js

export const VALIDATION_RULES = {
  NOMBRE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    REGEX: /^[A-Za-zÀÁÉÍÓÚàáéíóúÑñ\s]+$/
  },
  DESCRIPCION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 200
  }
};

export const ERROR_MESSAGES = {
  NOMBRE: {
    REQUIRED: 'El nombre es obligatorio',
    MIN_LENGTH: 'El nombre debe tener al menos 3 caracteres',
    MAX_LENGTH: 'El nombre no puede superar los 50 caracteres',
    INVALID_FORMAT: 'El nombre solo puede contener letras y espacios'
  },
  DESCRIPCION: {
    REQUIRED: 'La descripción es obligatoria',
    MIN_LENGTH: 'La descripción debe tener al menos 10 caracteres',
    MAX_LENGTH: 'La descripción no puede superar los 200 caracteres'
  }
};

export const SUCCESS_MESSAGES = {
  CREAR: 'Categoría agregada exitosamente',
  EDITAR: 'Categoría editada exitosamente',
  ELIMINAR: 'Categoría eliminada exitosamente',
  ACTIVAR: 'Categoría activada exitosamente',
  DESACTIVAR: 'Categoría desactivada exitosamente'
};

export const LOADING_MESSAGES = {
  CARGAR: 'Cargando categorías...',
  GUARDAR: 'Guardando cambios...',
  ELIMINAR: 'Eliminando categoría...',
  AGREGAR: 'Agregando categoría...'
};

export const MOCK_CATEGORIAS = [
  { id: 201, nombre: 'Frutas', descripcion: 'Productos naturales', activo: true },
  { id: 202, nombre: 'Chocolate', descripcion: 'Derivados del cacao', activo: true },
  { id: 203, nombre: 'Lácteos', descripcion: 'Productos de leche', activo: true },
  { id: 204, nombre: 'Harinas', descripcion: 'Cereales y derivados', activo: false },
  { id: 205, nombre: 'Proteínas', descripcion: 'Carnes y vegetales', activo: true }
];