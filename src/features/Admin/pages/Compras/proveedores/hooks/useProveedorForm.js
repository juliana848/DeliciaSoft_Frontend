import { useState, useEffect } from 'react';
import { validateProveedorField } from '../utils/validations';

export const useProveedorForm = ({ tipo, proveedor, proveedores }) => {
  const [formData, setFormData] = useState({
    tipoProveedor: 'Natural',
    nombre: '',
    contacto: '',
    correo: '',
    direccion: '',
    documentoONit: '',
    tipoDocumento: 'CC',
    nombreEmpresa: '',
    nombreContacto: '',
    estadoProveedor: true
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Inicializar formulario
  useEffect(() => {
    if (tipo === 'editar' && proveedor) {
      console.log('🔧 Inicializando formulario para editar:', proveedor);
      
      setFormData({
        tipoProveedor: proveedor.tipo,
        nombre: proveedor.tipo === 'Natural' ? (proveedor.nombreProveedor || '') : '',
        nombreEmpresa: proveedor.tipo === 'Jurídico' ? (proveedor.nombreEmpresa || '') : '',
        nombreContacto: proveedor.tipo === 'Jurídico' ? (proveedor.nombreProveedor || '') : '',
        contacto: proveedor.contacto.toString(),
        correo: proveedor.correo,
        direccion: proveedor.direccion,
        documentoONit: proveedor.documento.toString(),
        tipoDocumento: proveedor.tipoDocumento,
        estadoProveedor: proveedor.estado
      });
    } else if (tipo === 'agregar') {
      // Reset para nuevo proveedor
      setFormData({
        tipoProveedor: 'Natural',
        nombre: '',
        contacto: '',
        correo: '',
        direccion: '',
        documentoONit: '',
        tipoDocumento: 'CC',
        nombreEmpresa: '',
        nombreContacto: '',
        estadoProveedor: true
      });
    }

    setErrors({});
    setTouched({});
  }, [tipo, proveedor]);

  const handleFieldChange = (field, value) => {
    // Actualizar datos del formulario
    if (field === 'tipoProveedor') {
      setFormData(prev => ({
        ...prev,
        tipoProveedor: value,
        tipoDocumento: value === 'Natural' ? 'CC' : 'NIT',
        nombre: value === 'Jurídico' ? '' : prev.nombre,
        nombreEmpresa: value === 'Natural' ? '' : prev.nombreEmpresa,
        nombreContacto: value === 'Natural' ? '' : prev.nombreContacto
      }));
      
      // Revalidar documento si ya está lleno
      if (formData.documentoONit && touched.documentoONit) {
        const docError = validateProveedorField('documentoONit', formData.documentoONit, value);
        setErrors(prev => ({ ...prev, documentoONit: docError }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Validar campo si ya fue tocado
    if (touched[field]) {
      const error = validateProveedorField(field, value, formData.tipoProveedor, formData.tipoDocumento);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleFieldBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validación básica
    const error = validateProveedorField(field, value, formData.tipoProveedor, formData.tipoDocumento);
    setErrors(prev => ({ ...prev, [field]: error }));

    // Validaciones de unicidad solo si no hay errores básicos
    if (!error && tipo === 'agregar') {
      if (field === 'correo') {
        const emailExists = proveedores.some(p => p.correo.toLowerCase() === value.toLowerCase());
        if (emailExists) {
          setErrors(prev => ({ ...prev, correo: 'Ya existe un proveedor con este correo' }));
        }
      }

      if (field === 'nombre' && formData.tipoProveedor === 'Natural') {
        const nameExists = proveedores.some(p => p.nombre && p.nombre.toLowerCase() === value.toLowerCase());
        if (nameExists) {
          setErrors(prev => ({ ...prev, nombre: 'Ya existe un proveedor con este nombre' }));
        }
      }

      if (field === 'nombreEmpresa' && formData.tipoProveedor === 'Jurídico') {
        const nameExists = proveedores.some(p => p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === value.toLowerCase());
        if (nameExists) {
          setErrors(prev => ({ ...prev, nombreEmpresa: 'Ya existe un proveedor con este nombre de empresa' }));
        }
      }
    }

    // Validaciones de unicidad para edición
    if (!error && tipo === 'editar' && proveedor) {
      if (field === 'correo') {
        const emailExists = proveedores.some(p =>
          p.idProveedor !== proveedor.idProveedor && p.correo.toLowerCase() === value.toLowerCase()
        );
        if (emailExists) {
          setErrors(prev => ({ ...prev, correo: 'Ya existe un proveedor con este correo' }));
        }
      }

      if (field === 'nombre' && formData.tipoProveedor === 'Natural') {
        const nameExists = proveedores.some(p =>
          p.idProveedor !== proveedor.idProveedor && p.nombre && p.nombre.toLowerCase() === value.toLowerCase()
        );
        if (nameExists) {
          setErrors(prev => ({ ...prev, nombre: 'Ya existe un proveedor con este nombre' }));
        }
      }

      if (field === 'nombreEmpresa' && formData.tipoProveedor === 'Jurídico') {
        const nameExists = proveedores.some(p =>
          p.idProveedor !== proveedor.idProveedor && p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === value.toLowerCase()
        );
        if (nameExists) {
          setErrors(prev => ({ ...prev, nombreEmpresa: 'Ya existe un proveedor con este nombre de empresa' }));
        }
      }
    }
  };

  const validarCampos = () => {
    let fields = ['contacto', 'correo', 'direccion', 'documentoONit'];

    if (formData.tipoProveedor === 'Natural') {
      fields = [...fields, 'nombre'];
    } else {
      fields = [...fields, 'nombreEmpresa', 'nombreContacto'];
    }

    let hasErrors = false;
    const newErrors = {};

    // Validar todos los campos
    fields.forEach(field => {
      let value = formData[field];
      const error = validateProveedorField(field, value, formData.tipoProveedor, formData.tipoDocumento);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    // Validar unicidad
    if (tipo === 'agregar') {
      const emailExists = proveedores.some(p => p.correo.toLowerCase() === formData.correo.toLowerCase());
      if (emailExists) {
        newErrors.correo = 'Ya existe un proveedor con este correo';
        hasErrors = true;
      }

      if (formData.tipoProveedor === 'Natural') {
        const nameExists = proveedores.some(p => p.nombre && p.nombre.toLowerCase() === formData.nombre.toLowerCase());
        if (nameExists) {
          newErrors.nombre = 'Ya existe un proveedor con este nombre';
          hasErrors = true;
        }
      } else {
        const nameExists = proveedores.some(p => p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === formData.nombreEmpresa.toLowerCase());
        if (nameExists) {
          newErrors.nombreEmpresa = 'Ya existe un proveedor con este nombre de empresa';
          hasErrors = true;
        }
      }
    }

    // Validar unicidad para edición
    if (tipo === 'editar' && proveedor) {
      const emailExists = proveedores.some(p =>
        p.idProveedor !== proveedor.idProveedor && p.correo.toLowerCase() === formData.correo.toLowerCase()
      );
      if (emailExists) {
        newErrors.correo = 'Ya existe un proveedor con este correo';
        hasErrors = true;
      }

      if (formData.tipoProveedor === 'Natural') {
        const nameExists = proveedores.some(p =>
          p.idProveedor !== proveedor.idProveedor && p.nombre && p.nombre.toLowerCase() === formData.nombre.toLowerCase()
        );
        if (nameExists) {
          newErrors.nombre = 'Ya existe un proveedor con este nombre';
          hasErrors = true;
        }
      } else {
        const nameExists = proveedores.some(p =>
          p.idProveedor !== proveedor.idProveedor && p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === formData.nombreEmpresa.toLowerCase()
        );
        if (nameExists) {
          newErrors.nombreEmpresa = 'Ya existe un proveedor con este nombre de empresa';
          hasErrors = true;
        }
      }
    }

    setErrors(newErrors);
    setTouched(fields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    return !hasErrors;
  };

  return {
    formData,
    errors,
    touched,
    handleFieldChange,
    handleFieldBlur,
    validarCampos
  };
};