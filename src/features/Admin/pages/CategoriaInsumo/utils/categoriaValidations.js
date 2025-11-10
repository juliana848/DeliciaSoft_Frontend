// src/pages/categorias/utils/categoriaValidations.js

import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants/categoriaConstants';

export const validarNombre = (nombre) => {
  if (!nombre.trim()) {
    return ERROR_MESSAGES.NOMBRE.REQUIRED;
  }
  
  if (nombre.trim().length < VALIDATION_RULES.NOMBRE.MIN_LENGTH) {
    return ERROR_MESSAGES.NOMBRE.MIN_LENGTH;
  }
  
  if (nombre.trim().length > VALIDATION_RULES.NOMBRE.MAX_LENGTH) {
    return ERROR_MESSAGES.NOMBRE.MAX_LENGTH;
  }
  
  if (!VALIDATION_RULES.NOMBRE.REGEX.test(nombre.trim())) {
    return ERROR_MESSAGES.NOMBRE.INVALID_FORMAT;
  }
  
  return '';
};

export const validarDescripcion = (descripcion) => {
  if (!descripcion.trim()) {
    return ERROR_MESSAGES.DESCRIPCION.REQUIRED;
  }
  
  if (descripcion.trim().length < VALIDATION_RULES.DESCRIPCION.MIN_LENGTH) {
    return ERROR_MESSAGES.DESCRIPCION.MIN_LENGTH;
  }
  
  if (descripcion.trim().length > VALIDATION_RULES.DESCRIPCION.MAX_LENGTH) {
    return ERROR_MESSAGES.DESCRIPCION.MAX_LENGTH;
  }
  
  return '';
};

export const normalizar = (texto) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();