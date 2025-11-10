// src/pages/categorias/hooks/useCategoriaForm.js

import { useState, useEffect } from 'react';
import { validarNombre, validarDescripcion } from '../utils/categoriaValidations';

export const useCategoriaForm = (initialValues = {}) => {
  const [nombre, setNombre] = useState(initialValues.nombre || '');
  const [descripcion, setDescripcion] = useState(initialValues.descripcion || '');
  const [estado, setEstado] = useState(initialValues.estado !== undefined ? initialValues.estado : true);
  const [errores, setErrores] = useState({ nombre: '', descripcion: '' });

  useEffect(() => {
    const nuevosErrores = {
      nombre: validarNombre(nombre),
      descripcion: validarDescripcion(descripcion)
    };
    setErrores(nuevosErrores);
  }, [nombre, descripcion]);

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setEstado(true);
    setErrores({ nombre: '', descripcion: '' });
  };

  const setFormValues = (values) => {
    setNombre(values.nombre || '');
    setDescripcion(values.descripcion || '');
    setEstado(values.estado !== undefined ? values.estado : true);
  };

  const isValid = () => {
    return !errores.nombre && !errores.descripcion && nombre.trim() && descripcion.trim();
  };

  return {
    nombre,
    setNombre,
    descripcion,
    setDescripcion,
    estado,
    setEstado,
    errores,
    resetForm,
    setFormValues,
    isValid
  };
};