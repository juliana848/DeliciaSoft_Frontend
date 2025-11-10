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
    if (field === 'tipoProveedor') {
      setFormData(prev => ({
        ...prev,
        tipoProveedor: value,
        tipoDocumento: value === 'Natural' ? 'CC' : 'NIT',
        nombre: value === 'Jurídico' ? '' : prev.nombre,
        nombreEmpresa: value === 'Natural' ? '' : prev.nombreEmpresa,
        nombreContacto: value === 'Natural' ? '' : prev.nombreContacto
      }));
      
      if (formData.documentoONit && touched.documentoONit) {
        const docError = validateProveedorField('documentoONit', formData.documentoONit, value);
        setErrors(prev => ({ ...prev, documentoONit: docError }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

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

    // Si hay errores básicos, no validar unicidad
    if (error) return;

    // VALIDACIONES DE UNICIDAD PARA AGREGAR
    if (tipo === 'agregar') {
      // Validar correo único
      if (field === 'correo') {
        const emailExists = proveedores.some(p => p.correo.toLowerCase() === value.toLowerCase());
        if (emailExists) {
          setErrors(prev => ({ ...prev, correo: 'Ya existe un proveedor con este correo' }));
        }
      }

      // Validar teléfono único
      if (field === 'contacto') {
        const phoneExists = proveedores.some(p => p.contacto.toString() === value.toString());
        if (phoneExists) {
          setErrors(prev => ({ ...prev, contacto: 'Ya existe un proveedor con este teléfono' }));
        }
      }

      // Validar documento único
      if (field === 'documentoONit') {
        const docExists = proveedores.some(p => p.documento.toString() === value.toString());
        if (docExists) {
          setErrors(prev => ({ ...prev, documentoONit: 'Ya existe un proveedor con este documento' }));
        }
      }

      // Validar nombre único (Natural)
      if (field === 'nombre' && formData.tipoProveedor === 'Natural') {
        const nameExists = proveedores.some(p => p.nombre && p.nombre.toLowerCase() === value.toLowerCase());
        if (nameExists) {
          setErrors(prev => ({ ...prev, nombre: 'Ya existe un proveedor con este nombre' }));
        }
      }

      // Validar nombre empresa único (Jurídico)
      if (field === 'nombreEmpresa' && formData.tipoProveedor === 'Jurídico') {
        const nameExists = proveedores.some(p => p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === value.toLowerCase());
        if (nameExists) {
          setErrors(prev => ({ ...prev, nombreEmpresa: 'Ya existe un proveedor con este nombre de empresa' }));
        }
      }
    }

    // VALIDACIONES DE UNICIDAD PARA EDITAR
    if (tipo === 'editar' && proveedor) {
      const idProveedorActual = proveedor.idProveedor || proveedor.idproveedor;

      // Validar correo único (excluyendo el proveedor actual)
      if (field === 'correo') {
        const emailExists = proveedores.some(p => {
          const idP = p.idProveedor || p.idproveedor;
          return idP !== idProveedorActual && p.correo.toLowerCase() === value.toLowerCase();
        });
        if (emailExists) {
          setErrors(prev => ({ ...prev, correo: 'Ya existe un proveedor con este correo' }));
        }
      }

      // Validar teléfono único (excluyendo el proveedor actual)
      if (field === 'contacto') {
        const phoneExists = proveedores.some(p => {
          const idP = p.idProveedor || p.idproveedor;
          return idP !== idProveedorActual && p.contacto.toString() === value.toString();
        });
        if (phoneExists) {
          setErrors(prev => ({ ...prev, contacto: 'Ya existe un proveedor con este teléfono' }));
        }
      }

      // Validar documento único (excluyendo el proveedor actual)
      if (field === 'documentoONit') {
        const docExists = proveedores.some(p => {
          const idP = p.idProveedor || p.idproveedor;
          return idP !== idProveedorActual && p.documento.toString() === value.toString();
        });
        if (docExists) {
          setErrors(prev => ({ ...prev, documentoONit: 'Ya existe un proveedor con este documento' }));
        }
      }

      // Validar nombre único (Natural)
      if (field === 'nombre' && formData.tipoProveedor === 'Natural') {
        const nameExists = proveedores.some(p => {
          const idP = p.idProveedor || p.idproveedor;
          return idP !== idProveedorActual && p.nombre && p.nombre.toLowerCase() === value.toLowerCase();
        });
        if (nameExists) {
          setErrors(prev => ({ ...prev, nombre: 'Ya existe un proveedor con este nombre' }));
        }
      }

      // Validar nombre empresa único (Jurídico)
      if (field === 'nombreEmpresa' && formData.tipoProveedor === 'Jurídico') {
        const nameExists = proveedores.some(p => {
          const idP = p.idProveedor || p.idproveedor;
          return idP !== idProveedorActual && p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === value.toLowerCase();
        });
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

    // Validar todos los campos básicos
    fields.forEach(field => {
      let value = formData[field];
      const error = validateProveedorField(field, value, formData.tipoProveedor, formData.tipoDocumento);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    // VALIDACIONES DE UNICIDAD PARA AGREGAR
    if (tipo === 'agregar') {
      // Correo único
      const emailExists = proveedores.some(p => p.correo.toLowerCase() === formData.correo.toLowerCase());
      if (emailExists) {
        newErrors.correo = 'Ya existe un proveedor con este correo';
        hasErrors = true;
      }

      // Teléfono único
      const phoneExists = proveedores.some(p => p.contacto.toString() === formData.contacto.toString());
      if (phoneExists) {
        newErrors.contacto = 'Ya existe un proveedor con este teléfono';
        hasErrors = true;
      }

      // Documento único
      const docExists = proveedores.some(p => p.documento.toString() === formData.documentoONit.toString());
      if (docExists) {
        newErrors.documentoONit = 'Ya existe un proveedor con este documento';
        hasErrors = true;
      }

      // Nombre único (Natural)
      if (formData.tipoProveedor === 'Natural') {
        const nameExists = proveedores.some(p => p.nombre && p.nombre.toLowerCase() === formData.nombre.toLowerCase());
        if (nameExists) {
          newErrors.nombre = 'Ya existe un proveedor con este nombre';
          hasErrors = true;
        }
      }

      // Nombre empresa único (Jurídico)
      if (formData.tipoProveedor === 'Jurídico') {
        const nameExists = proveedores.some(p => p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === formData.nombreEmpresa.toLowerCase());
        if (nameExists) {
          newErrors.nombreEmpresa = 'Ya existe un proveedor con este nombre de empresa';
          hasErrors = true;
        }
      }
    }

    // VALIDACIONES DE UNICIDAD PARA EDITAR
    if (tipo === 'editar' && proveedor) {
      const idProveedorActual = proveedor.idProveedor || proveedor.idproveedor;

      // Correo único
      const emailExists = proveedores.some(p => {
        const idP = p.idProveedor || p.idproveedor;
        return idP !== idProveedorActual && p.correo.toLowerCase() === formData.correo.toLowerCase();
      });
      if (emailExists) {
        newErrors.correo = 'Ya existe un proveedor con este correo';
        hasErrors = true;
      }

      // Teléfono único
      const phoneExists = proveedores.some(p => {
        const idP = p.idProveedor || p.idproveedor;
        return idP !== idProveedorActual && p.contacto.toString() === formData.contacto.toString();
      });
      if (phoneExists) {
        newErrors.contacto = 'Ya existe un proveedor con este teléfono';
        hasErrors = true;
      }

      // Documento único
      const docExists = proveedores.some(p => {
        const idP = p.idProveedor || p.idproveedor;
        return idP !== idProveedorActual && p.documento.toString() === formData.documentoONit.toString();
      });
      if (docExists) {
        newErrors.documentoONit = 'Ya existe un proveedor con este documento';
        hasErrors = true;
      }

      // Nombre único (Natural)
      if (formData.tipoProveedor === 'Natural') {
        const nameExists = proveedores.some(p => {
          const idP = p.idProveedor || p.idproveedor;
          return idP !== idProveedorActual && p.nombre && p.nombre.toLowerCase() === formData.nombre.toLowerCase();
        });
        if (nameExists) {
          newErrors.nombre = 'Ya existe un proveedor con este nombre';
          hasErrors = true;
        }
      }

      // Nombre empresa único (Jurídico)
      if (formData.tipoProveedor === 'Jurídico') {
        const nameExists = proveedores.some(p => {
          const idP = p.idProveedor || p.idproveedor;
          return idP !== idProveedorActual && p.nombreEmpresa && p.nombreEmpresa.toLowerCase() === formData.nombreEmpresa.toLowerCase();
        });
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