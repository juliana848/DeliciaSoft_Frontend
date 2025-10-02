import React from 'react';
import Modal from '../../../../components/modal';
import ProveedorForm from './ProveedorForm';
import ProveedorViewer from './ProveedorViewer';
import ProveedorDeleteConfirm from './ProveedorDeleteConfirm';
import { useProveedorModal } from '../hooks/useProveedorModal';

const ProveedorModal = ({ 
  visible, 
  tipo, 
  proveedor, 
  proveedores, 
  onClose, 
  onSuccess, 
  loading 
}) => {
  const modalLogic = useProveedorModal({
    tipo,
    proveedor,
    proveedores,
    onClose,
    onSuccess
  });

  if (!visible) return null;

  const renderModalContent = () => {
    switch (tipo) {
      case 'agregar':
      case 'editar':
        return (
          <ProveedorForm
            tipo={tipo}
            proveedor={proveedor}
            proveedores={proveedores}
            onSave={modalLogic.guardarProveedor}
            onCancel={onClose}
            loading={modalLogic.loading}
          />
        );
      
      case 'visualizar':
        return (
          <ProveedorViewer
            proveedor={proveedor}
            onClose={onClose}
          />
        );
      
      case 'eliminar':
        return (
          <ProveedorDeleteConfirm
            proveedor={proveedor}
            onConfirm={modalLogic.confirmarEliminar}
            onCancel={onClose}
            loading={modalLogic.loading}
            alerta={modalLogic.alerta}              // ✅ Pasar alerta
            cerrarAlerta={modalLogic.cerrarAlerta}  // ✅ Pasar cerrarAlerta
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Modal 
      visible={visible} 
      onClose={onClose} 
      className={tipo === 'eliminar' ? '' : 'modal-wide'}
    >
      {renderModalContent()}
    </Modal>
  );
};

export default ProveedorModal;