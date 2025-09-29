import { useState } from 'react';
import proveedorApiService from '../../../../services/proveedor_services';

export const useProveedorModal = ({ tipo, proveedor, proveedores, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [mensajeCarga, setMensajeCarga] = useState('Cargando...'); // ✅ NUEVO

const guardarProveedor = async (formData) => {
  setMensajeCarga(tipo === 'agregar' ? 'Agregando proveedor...' : 'Actualizando proveedor...'); // ✅ NUEVO
  setLoading(true);
  try {
      const proveedorData = {
        tipodocumento: formData.tipoDocumento,
        documento: formData.documentoONit, // CAMBIO: Enviar como STRING, no parseInt
        contacto: formData.contacto, // CAMBIO: Enviar como STRING, no parseInt
        correo: formData.correo,
        direccion: formData.direccion,
        estado: formData.estadoProveedor,
        TipoProveedor: formData.tipoProveedor,
        ...(formData.tipoProveedor === 'Natural' ? {
          nombreproveedor: formData.nombre,
          nombreempresa: null
        } : {
          nombreempresa: formData.nombreEmpresa,
          nombreproveedor: formData.nombreContacto
        })
      };

      console.log('💾 Datos del proveedor a guardar:', proveedorData);

      if (tipo === 'agregar') {
        await proveedorApiService.crearProveedor(proveedorData);
      } else if (tipo === 'editar') {
        const idProveedor = proveedor.idProveedor || proveedor.idproveedor;
        await proveedorApiService.actualizarProveedor(idProveedor, proveedorData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Error al guardar proveedor:', error);
      
      // Mostrar error amigable
      let mensajeError = 'Error al guardar el proveedor';
      if (error.message && error.message.includes('integer')) {
        mensajeError = 'Error: El teléfono o documento contiene caracteres inválidos';
      }
      
      alert(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminar = async () => {
  setMensajeCarga('Eliminando proveedor...'); // ✅ NUEVO
  setLoading(true);
  try {
        setMensajeCarga('Eliminando categoría...'); // ✅ NUEVO
        setLoading(true);
      const idProveedor = proveedor.idProveedor || proveedor.idproveedor;
      await proveedorApiService.eliminarProveedor(idProveedor);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Error al eliminar proveedor:', error);
      
      // Detectar error de clave foránea
      if (error.message && error.message.includes('Foreign key constraint')) {
        alert('⚠️ No es posible eliminar este proveedor porque está asociado a una o más compras registradas en el sistema.');
      } else {
        alert('Error al eliminar el proveedor: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    mensajeCarga,
    guardarProveedor,
    confirmarEliminar
  };
};