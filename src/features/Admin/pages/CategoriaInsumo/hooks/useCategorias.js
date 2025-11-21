// src/pages/categorias/hooks/useCategorias.js

import { useState, useEffect } from 'react';
import categoriaInsumoApiService from '../../../services/categoriainsumos';
import { SUCCESS_MESSAGES, LOADING_MESSAGES, MOCK_CATEGORIAS } from '../constants/categoriaConstants';
import { normalizar } from '../utils/categoriaValidations';

export const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [mensajeCarga, setMensajeCarga] = useState('Cargando...');
  const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });

  useEffect(() => {
    cargarCategorias();
  }, []);

  const showNotification = (mensaje, tipo = 'success') => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: '', tipo: 'success' });
  };

  const cargarCategorias = async () => {
    try {
      setMensajeCarga(LOADING_MESSAGES.CARGAR);
      setLoading(true);
      const data = await categoriaInsumoApiService.obtenerCategorias();
      const categoriasTransformadas = data.map(cat => ({
        id: cat.id,
        nombre: cat.nombreCategoria,
        descripcion: cat.descripcion,
        activo: cat.estado
      }));
      setCategorias(categoriasTransformadas);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      showNotification('Error al cargar las categorías: ' + error.message, 'error');
      setCategorias(MOCK_CATEGORIAS);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para verificar si existe una categoría
  const existeCategoria = (nombre, idExcluir = null) => {
    const nombreNormalizado = normalizar(nombre.trim());
    return categorias.some(cat => {
      if (idExcluir && cat.id === idExcluir) return false;
      return normalizar(cat.nombre) === nombreNormalizado;
    });
  };

  const toggleActivo = async (categoria) => {
    try {
      setLoadingStates(prev => ({ ...prev, [categoria.id]: true }));
      const nuevoEstado = !categoria.activo;
      await categoriaInsumoApiService.cambiarEstadoCategoria(categoria.id, nuevoEstado);
      const updated = categorias.map(cat =>
        cat.id === categoria.id ? { ...cat, activo: nuevoEstado } : cat
      );
      setCategorias(updated);
      showNotification(categoria.activo ? SUCCESS_MESSAGES.DESACTIVAR : SUCCESS_MESSAGES.ACTIVAR);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showNotification('Error al cambiar el estado: ' + error.message, 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, [categoria.id]: false }));
    }
  };

  const crearCategoria = async (datosCategoria) => {
    try {
      // Verificar si la categoría ya existe
      if (existeCategoria(datosCategoria.nombreCategoria)) {
        showNotification('Ya existe una categoría con ese nombre', 'error');
        return false;
      }

      setMensajeCarga(LOADING_MESSAGES.AGREGAR);
      setLoading(true);
      const nuevaCategoria = await categoriaInsumoApiService.crearCategoria(datosCategoria);
      const categoriaParaEstado = {
        id: nuevaCategoria.id,
        nombre: nuevaCategoria.nombreCategoria,
        descripcion: nuevaCategoria.descripcion,
        activo: nuevaCategoria.estado
      };
      // Agregar al inicio del array
      setCategorias([categoriaParaEstado, ...categorias]);
      showNotification(SUCCESS_MESSAGES.CREAR);
      return true;
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      showNotification('Error al agregar la categoría: ' + error.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const actualizarCategoria = async (id, datosCategoria) => {
    try {
      // Verificar si la categoría ya existe (excluyendo la actual)
      if (existeCategoria(datosCategoria.nombreCategoria, id)) {
        showNotification('Ya existe otra categoría con ese nombre', 'error');
        return false;
      }

      setMensajeCarga(LOADING_MESSAGES.GUARDAR);
      setLoading(true);
      const categoriaActualizada = await categoriaInsumoApiService.actualizarCategoria(id, datosCategoria);
      const updated = categorias.map(cat =>
        cat.id === id
          ? {
              id: categoriaActualizada.id,
              nombre: categoriaActualizada.nombreCategoria,
              descripcion: categoriaActualizada.descripcion,
              activo: categoriaActualizada.estado
            }
          : cat
      );
      setCategorias(updated);
      showNotification(SUCCESS_MESSAGES.EDITAR);
      return true;
    } catch (error) {
      console.error('Error al editar categoría:', error);
      showNotification('Error al editar la categoría: ' + error.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const eliminarCategoria = async (id) => {
    try {
      setMensajeCarga(LOADING_MESSAGES.ELIMINAR);
      setLoading(true);
      await categoriaInsumoApiService.eliminarCategoria(id);
      const updated = categorias.filter(cat => cat.id !== id);
      setCategorias(updated);
      showNotification(SUCCESS_MESSAGES.ELIMINAR);
      return true;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      showNotification('Error al eliminar la categoría: ' + error.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    categorias,
    loading,
    loadingStates,
    mensajeCarga,
    notification,
    showNotification,
    hideNotification,
    toggleActivo,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    existeCategoria // Exportar para uso en otros componentes si es necesario
  };
};