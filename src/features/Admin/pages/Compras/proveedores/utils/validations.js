export const validateProveedorField = (field, value, tipoProveedor = 'Natural', tipoDocumento = 'CC') => {
  let error = '';

  switch (field) {
    case 'nombre':
      if (tipoProveedor === 'Natural') {
        if (!value.trim()) {
          error = 'El nombre es obligatorio';
        } else if (value.trim().length < 3) {
          error = 'El nombre debe tener al menos 3 caracteres';
        } else if (value.trim().length > 50) {
          error = 'El nombre no puede tener más de 50 caracteres';
        } else if (!/^[A-Za-zÀÁÉÍÓÚÑ àáéíóúñ\s.]+$/.test(value)) {
          error = 'El nombre solo puede contener letras, espacios y puntos';
        }
      }
      break;

    case 'nombreEmpresa':
      if (tipoProveedor === 'Jurídico') {
        if (!value.trim()) {
          error = 'El nombre de empresa es obligatorio';
        } else if (value.trim().length < 3) {
          error = 'El nombre de empresa debe tener al menos 3 caracteres';
        } else if (value.trim().length > 50) {
          error = 'El nombre de empresa no puede tener más de 50 caracteres';
        }
      }
      break;

    case 'nombreContacto':
      if (tipoProveedor === 'Jurídico') {
        if (!value.trim()) {
          error = 'El nombre del contacto es obligatorio';
        } else if (value.trim().length < 3) {
          error = 'El nombre del contacto debe tener al menos 3 caracteres';
        } else if (value.trim().length > 50) {
          error = 'El nombre del contacto no puede tener más de 50 caracteres';
        } else if (!/^[A-Za-zÀÁÉÍÓÚÑ àáéíóúñ\s.]+$/.test(value)) {
          error = 'El nombre del contacto solo puede contener letras, espacios y puntos';
        }
      }
      break;

    case 'contacto':
      if (!value.trim()) {
        error = 'El teléfono es obligatorio';
      } else if (!/^\d+$/.test(value)) {
        error = 'El teléfono debe contener solo números';
      } else if (value.length < 7) {
        error = 'El teléfono debe tener al menos 7 dígitos';
      } else if (value.length > 10) {
        error = 'El teléfono no puede tener más de 10 dígitos';
      }
      break;

    case 'correo':
      if (!value.trim()) {
        error = 'El correo es obligatorio';
      } else if (value.length > 50) {
        error = 'El correo no puede tener más de 50 caracteres';
      } else {
        const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!correoRegex.test(value) || !value.includes('@')) {
          error = 'Correo no válido';
        }
      }
      break;

    case 'direccion':
      if (!value.trim()) {
        error = 'La dirección es obligatoria';
      } else if (value.trim().length < 5) {
        error = 'La dirección debe tener al menos 5 caracteres';
      } else if (value.trim().length > 30) {
        error = 'La dirección no puede tener más de 30 caracteres';
      }
      break;

    case 'documentoONit':
      const fieldLabel = tipoProveedor === 'Natural' ? 'Documento' : 'NIT';
      if (!value.trim()) {
        error = `${fieldLabel} es obligatorio`;
      } else if (!/^\d+$/.test(value)) {
        error = `${fieldLabel} debe contener solo números`;
      } else if (tipoProveedor === 'Natural') {
        if (value.length < 7) {
          error = 'El documento debe tener al menos 7 dígitos';
        } else if (value.length > 10) {
          error = 'El documento no puede tener más de 10 dígitos';
        }
      } else {
        if (value.length < 9) {
          error = 'El NIT debe tener al menos 9 dígitos';
        } else if (value.length > 12) {
          error = 'El NIT no puede tener más de 12 dígitos';
        }
      }
      break;

    default:
      break;
  }

  return error;
};