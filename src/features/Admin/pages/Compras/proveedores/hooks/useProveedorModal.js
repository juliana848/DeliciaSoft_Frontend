import { useState } from 'react';
import proveedorApiService from '../../../../services/proveedor_services';

export const useProveedorModal = ({ tipo, proveedor, proveedores, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [mensajeCarga, setMensajeCarga] = useState('Cargando...');
  const [alerta, setAlerta] = useState({ visible: false, mensaje: '', tipo: 'success' });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ visible: true, mensaje, tipo });
    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
      setAlerta({ visible: false, mensaje: '', tipo: 'success' });
    }, 3000);
  };

  const cerrarAlerta = () => {
    setAlerta({ visible: false, mensaje: '', tipo: 'success' });
  };

  const guardarProveedor = async (formData) => {
    setMensajeCarga(tipo === 'agregar' ? 'Agregando proveedor...' : 'Actualizando proveedor...');
    setLoading(true);
    try {
      const proveedorData = {
        tipodocumento: formData.tipoDocumento,
        documento: formData.documentoONit,
        contacto: formData.contacto,
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
        mostrarAlerta('Proveedor agregado exitosamente', 'success');
      } else if (tipo === 'editar') {
        const idProveedor = proveedor.idProveedor || proveedor.idproveedor;
        await proveedorApiService.actualizarProveedor(idProveedor, proveedorData);
        mostrarAlerta('Proveedor actualizado exitosamente', 'success');
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('❌ Error al guardar proveedor:', error);
      
      let mensajeError = 'Error al guardar el proveedor';
      if (error.message && error.message.includes('integer')) {
        mensajeError = 'El teléfono o documento contiene caracteres inválidos';
      }
      
      mostrarAlerta(mensajeError, 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminar = async () => {
    setMensajeCarga('Eliminando proveedor...');
    setLoading(true);
    try {
      const idProveedor = proveedor.idProveedor || proveedor.idproveedor;
      await proveedorApiService.eliminarProveedor(idProveedor);
      
      mostrarAlerta('Proveedor eliminado exitosamente', 'success');
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('❌ Error al eliminar proveedor:', error);
      
      // Detectar error de clave foránea de múltiples formas
      const errorString = JSON.stringify(error).toLowerCase();
      const mensajeError = error.message?.toLowerCase() || '';
      
      if (errorString.includes('foreign key') || 
          errorString.includes('fkey') || 
          errorString.includes('compra_idproveedor') ||
          mensajeError.includes('foreign key') ||
          mensajeError.includes('constraint')) {
        mostrarAlerta('No es posible eliminar este proveedor porque está asociado a una o más compras registradas en el sistema', 'error');
      } else {
        mostrarAlerta('No es posible eliminar este proveedor porque está asociado a una o más compras registradas en el sistema', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    mensajeCarga,
    guardarProveedor,
    confirmarEliminar,
    alerta,
    cerrarAlerta
  };
};