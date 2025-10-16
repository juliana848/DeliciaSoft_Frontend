import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../Admin/services/authService';
import './RegisterForm.css';

const RegisterForm = ({ onCambiarALogin }) => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingDuplicates, setIsValidatingDuplicates] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    tipoDocumento: '',
    documento: '',
    contacto: '',
    password: '',
    confirmPassword: '',
  });

  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [duplicateErrors, setDuplicateErrors] = useState({});
  const [hasUserInteracted, setHasUserInteracted] = useState({
    password: false,
    confirmPassword: false
  });

  // Límites de caracteres actualizados
  const fieldLimits = {
    nombre: 10,
    apellido: 10,
    correo: 100,
    documento: 10,
    contacto: 15,
    password: 50
  };

  // Cargar reCAPTCHA v3
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=6Lcz0MArAAAAAB0lZvM3iEc_5qvgWYWIQDfMg9-N';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.grecaptcha.ready(() => {
        console.log('reCAPTCHA v3 cargado correctamente');
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Función para ejecutar reCAPTCHA
  const executeRecaptcha = async () => {
    try {
      if (window.grecaptcha && window.grecaptcha.ready) {
        const token = await window.grecaptcha.execute('6Lcz0MArAAAAAB0lZvM3iEc_5qvgWYWIQDfMg9-N', { action: 'register' });
        setRecaptchaToken(token);
        return token;
      }
    } catch (error) {
      console.error('Error ejecutando reCAPTCHA:', error);
    }
    return null;
  };

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 4000);
  };

  // Validar duplicados en tiempo real
  const validateDuplicates = async (field, value) => {
    if (!value || value.trim() === '') {
      setDuplicateErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    }

    setIsValidatingDuplicates(true);
    
    try {
      if (field === 'correo') {
        const exists = await authService.verificarCorreoExistente(value);
        if (exists) {
          const errorMsg = 'Ya existe una cuenta con este correo. Por favor, inicia sesión.';
          setDuplicateErrors(prev => ({ ...prev, [field]: errorMsg }));
          return false;
        }
      } else if (field === 'documento') {
        const response = await fetch('https://deliciasoft-backend-i6g9.onrender.com/api/clientes');
        if (response.ok) {
          const clientes = await response.json();
          const exists = clientes.some(cliente => cliente.numerodocumento === value);
          if (exists) {
            const errorMsg = 'Ya existe una cuenta con este documento. Por favor, inicia sesión.';
            setDuplicateErrors(prev => ({ ...prev, [field]: errorMsg }));
            return false;
          }
        }
      } else if (field === 'contacto') {
        const response = await fetch('https://deliciasoft-backend-i6g9.onrender.com/api/clientes');
        if (response.ok) {
          const clientes = await response.json();
          const exists = clientes.some(cliente => cliente.celular === value);
          if (exists) {
            const errorMsg = 'Ya existe una cuenta con este número de contacto. Por favor, inicia sesión.';
            setDuplicateErrors(prev => ({ ...prev, [field]: errorMsg }));
            return false;
          }
        }
      }

      setDuplicateErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    } catch (error) {
      console.error(`Error validando duplicado ${field}:`, error);
      setDuplicateErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    } finally {
      setIsValidatingDuplicates(false);
    }
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'nombre':
      case 'apellido':
        if (!value.trim()) {
          error = `${name === 'nombre' ? 'Nombre' : 'Apellido'} es requerido`;
        } else if (value.trim().length < 2) {
          error = `${name === 'nombre' ? 'Nombre' : 'Apellido'} debe tener al menos 2 caracteres`;
        } else if (value.length > fieldLimits[name]) {
          error = `${name === 'nombre' ? 'Nombre' : 'Apellido'} no puede exceder ${fieldLimits[name]} caracteres`;
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(value)) {
          error = 'Solo se permiten letras, sin espacios';
        }
        break;
      
      case 'correo':
        if (!value.trim()) {
          error = 'Correo electrónico es requerido';
        } else if (value.length > fieldLimits.correo) {
          error = `Correo no puede exceder ${fieldLimits.correo} caracteres`;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Formato de correo electrónico inválido';
        }
        break;
      
      case 'tipoDocumento':
        if (!value) {
          error = 'Tipo de documento es requerido';
        }
        break;
      
      case 'documento':
        if (!value.trim()) {
          error = 'Número de documento es requerido';
        } else if (value.length < 6) {
          error = 'Número de documento debe tener al menos 6 dígitos';
        } else if (value.length > fieldLimits.documento) {
          error = `Número de documento no puede exceder ${fieldLimits.documento} dígitos`;
        } else if (!/^\d+$/.test(value)) {
          error = 'Solo se permiten números';
        }
        break;
      
      case 'contacto':
        if (!value.trim()) {
          error = 'Número de contacto es requerido';
        } else if (value.length < 10) {
          error = 'Número de contacto debe tener al menos 10 dígitos';
        } else if (value.length > fieldLimits.contacto) {
          error = `Número de contacto no puede exceder ${fieldLimits.contacto} dígitos`;
        } else if (!/^\d+$/.test(value)) {
          error = 'Solo se permiten números';
        }
        break;
      
      case 'password':
        if (!hasUserInteracted.password && !value) {
          return '';
        }
        if (!value) {
          error = 'Contraseña es requerida';
        } else if (value.length < 8) {
          error = 'Contraseña debe tener al menos 8 caracteres';
        } else if (value.length > fieldLimits.password) {
          error = `Contraseña no puede exceder ${fieldLimits.password} caracteres`;
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = 'Contraseña debe tener al menos una mayúscula';
        } else if (!/(?=.*[!@#$%^&*])/.test(value)) {
          error = 'Contraseña debe tener al menos un carácter especial (!@#$%^&*)';
        }
        break;
      
      case 'confirmPassword':
        if (!hasUserInteracted.confirmPassword && !value) {
          return '';
        }
        if (!value) {
          error = 'Confirmación de contraseña es requerida';
        } else if (value !== formData.password) {
          error = 'Las contraseñas no coinciden';
        }
        break;
    }
    
    return error;
  };

  const handleChange = async (e) => {
    let { name, value } = e.target;
    
    if (name === 'password' || name === 'confirmPassword') {
      setHasUserInteracted(prev => ({ ...prev, [name]: true }));
    }
    
    if (name === 'documento') {
      value = value.replace(/\D/g, '').substring(0, 10);
    } else if (name === 'contacto') {
      value = value.replace(/\D/g, '').substring(0, 15);
    } else if (name === 'nombre' || name === 'apellido') {
      value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').substring(0, 10);
    } else if (name === 'correo') {
      value = value.replace(/\s/g, '').substring(0, 100);
    } else if (name === 'password') {
      value = value.substring(0, 50);
    }
    
    if (['nombre', 'apellido', 'correo', 'documento', 'contacto'].includes(name)) {
      value = value.replace(/\s/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));

    if (name === 'password' && formData.confirmPassword && hasUserInteracted.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }

    if (['correo', 'documento', 'contacto'].includes(name) && value.trim()) {
      setTimeout(() => {
        validateDuplicates(name, value);
      }, 1000);
    }
  };

  const validateCurrentStep = async () => {
    let fieldsToValidate = [];
    let isValid = true;
    const errors = {};

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['tipoDocumento', 'documento'];
        break;
      case 2:
        fieldsToValidate = ['nombre', 'apellido'];
        break;
      case 3:
        fieldsToValidate = ['correo', 'contacto'];
        break;
      case 4:
        fieldsToValidate = ['password', 'confirmPassword'];
        setHasUserInteracted({ password: true, confirmPassword: true });
        break;
    }

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    if (currentStep === 1 && formData.documento) {
      const isDocumentValid = await validateDuplicates('documento', formData.documento);
      if (!isDocumentValid || duplicateErrors.documento) {
        isValid = false;
      }
    }

    if (currentStep === 3) {
      if (formData.correo) {
        const isEmailValid = await validateDuplicates('correo', formData.correo);
        if (!isEmailValid || duplicateErrors.correo) {
          isValid = false;
        }
      }
      if (formData.contacto) {
        const isContactValid = await validateDuplicates('contacto', formData.contacto);
        if (!isContactValid || duplicateErrors.contacto) {
          isValid = false;
        }
      }
    }

    setFieldErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };

  const handleNext = async () => {
    const isStepValid = await validateCurrentStep();
    
    if (isStepValid) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      let errorMessage = 'Por favor, completa correctamente todos los campos del paso actual.';
      
      if (duplicateErrors.documento) {
        errorMessage = 'Ya existe una cuenta con este documento. Inicia sesión en su lugar.';
      } else if (duplicateErrors.correo) {
        errorMessage = 'Ya existe una cuenta con este correo. Inicia sesión en su lugar.';
      } else if (duplicateErrors.contacto) {
        errorMessage = 'Ya existe una cuenta con este número. Inicia sesión en su lugar.';
      }
      
      showCustomAlert('error', errorMessage);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setHasUserInteracted({ password: true, confirmPassword: true });

    const isStepValid = await validateCurrentStep();
    
    if (!isStepValid) {
      showCustomAlert('error', 'Por favor, completa correctamente todos los campos.');
      return;
    }

    const allFields = Object.keys(formData);
    let hasErrors = false;
    const finalErrors = {};

    allFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        finalErrors[field] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setFieldErrors(finalErrors);
      showCustomAlert('error', 'Por favor, corrige todos los errores antes de continuar.');
      return;
    }

    if (Object.values(duplicateErrors).some(error => error !== '')) {
      showCustomAlert('error', 'Por favor, corrige los campos duplicados antes de continuar.');
      return;
    }

    setIsLoading(true);

    try {
      const token = await executeRecaptcha();
      if (!token) {
        showCustomAlert('error', 'Error de verificación de seguridad. Inténtalo nuevamente.');
        return;
      }

      const dataWithRecaptcha = {
        ...formData,
        recaptchaToken: token
      };
      
      const result = await authService.registrarCliente(dataWithRecaptcha);

      if (result.success) {
        showCustomAlert('success', '¡Registro exitoso! Ahora puedes iniciar sesión.');

        // Después de 2 segundos, cambiar al formulario de login
        setTimeout(() => {
          if (onCambiarALogin) {
            onCambiarALogin(); // Llamar a la función para cambiar a login
          } else {
            window.location.reload(); // Fallback
          }
        }, 2000);
      } else {
        showCustomAlert('error', result.message || 'Error al registrar usuario');
      }

    } catch (error) {
      console.error('Error en registro:', error);
      showCustomAlert('error', 'Error de conexión. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getValidationIcon = (fieldName) => {
    const hasError = fieldErrors[fieldName] || duplicateErrors[fieldName];
    const hasValue = formData[fieldName];
    
    if (!hasValue) return null;
    
    if (hasError) {
      return (
        <span className="validation-icon error-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="#ef4444" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="#ef4444" strokeWidth="2"/>
          </svg>
        </span>
      );
    } else {
      return (
        <span className="validation-icon success-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2"/>
            <polyline points="9,12 12,15 16,10" stroke="#10b981" strokeWidth="2" fill="none"/>
          </svg>
        </span>
      );
    }
  };

  const getFieldError = (fieldName) => {
    return fieldErrors[fieldName] || duplicateErrors[fieldName] || '';
  };

  const getPasswordRequirementStatus = () => {
    const password = formData.password;
    return {
      length: password.length >= 8,
      uppercase: /(?=.*[A-Z])/.test(password),
      special: /(?=.*[!@#$%^&*])/.test(password)
    };
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="form-group">
              <div className="input-container">
                <select
                  name="tipoDocumento"
                  className={`select-documento ${getFieldError('tipoDocumento') ? 'error' : ''}`}
                  value={formData.tipoDocumento}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Tipo de documento</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PA">Pasaporte</option>
                  <option value="NIT">NIT</option>
                </select>
                {getValidationIcon('tipoDocumento')}
              </div>
              {getFieldError('tipoDocumento') && <span className="error-message">{getFieldError('tipoDocumento')}</span>}
            </div>
            <div className="form-group">
              <div className="input-container">
                <input
                  type="text"
                  name="documento"
                  placeholder="Número de documento"
                  value={formData.documento}
                  onChange={handleChange}
                  maxLength={fieldLimits.documento}
                  className={getFieldError('documento') ? 'error' : ''}
                  disabled={isLoading}
                />
                {getValidationIcon('documento')}
              </div>
              <small className="char-counter">{formData.documento.length}/{fieldLimits.documento}</small>
              {getFieldError('documento') && <span className="error-message">{getFieldError('documento')}</span>}
            </div>
          </>
        );
      
      case 2:
        return (
          <>
            <div className="form-group">
              <div className="input-container">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  maxLength={fieldLimits.nombre}
                  className={getFieldError('nombre') ? 'error' : ''}
                  disabled={isLoading}
                />
                {getValidationIcon('nombre')}
              </div>
              <small className="char-counter">{formData.nombre.length}/{fieldLimits.nombre}</small>
              {getFieldError('nombre') && <span className="error-message">{getFieldError('nombre')}</span>}
            </div>
            <div className="form-group">
              <div className="input-container">
                <input
                  type="text"
                  name="apellido"
                  placeholder="Apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  maxLength={fieldLimits.apellido}
                  className={getFieldError('apellido') ? 'error' : ''}
                  disabled={isLoading}
                />
                {getValidationIcon('apellido')}
              </div>
              <small className="char-counter">{formData.apellido.length}/{fieldLimits.apellido}</small>
              {getFieldError('apellido') && <span className="error-message">{getFieldError('apellido')}</span>}
            </div>
          </>
        );
      
      case 3:
        return (
          <>
            <div className="form-group">
              <div className="input-container">
                <input
                  type="email"
                  name="correo"
                  placeholder="Correo electrónico"
                  value={formData.correo}
                  onChange={handleChange}
                  maxLength={fieldLimits.correo}
                  className={getFieldError('correo') ? 'error' : ''}
                  disabled={isLoading}
                />
                {getValidationIcon('correo')}
              </div>
              <small className="char-counter">{formData.correo.length}/{fieldLimits.correo}</small>
              {getFieldError('correo') && <span className="error-message">{getFieldError('correo')}</span>}
            </div>
            <div className="form-group">
              <div className="input-container">
                <input
                  type="text"
                  name="contacto"
                  placeholder="Número de contacto"
                  value={formData.contacto}
                  onChange={handleChange}
                  maxLength={fieldLimits.contacto}
                  className={getFieldError('contacto') ? 'error' : ''}
                  disabled={isLoading}
                />
                {getValidationIcon('contacto')}
              </div>
              <small className="char-counter">{formData.contacto.length}/{fieldLimits.contacto}</small>
              {getFieldError('contacto') && <span className="error-message">{getFieldError('contacto')}</span>}
            </div>
          </>
        );
      
      case 4:
        const requirements = getPasswordRequirementStatus();
        return (
          <>
            <div className="form-group">
              <div className="input-container password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className={getFieldError('password') ? 'error' : ''}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                </button>
                {getValidationIcon('password')}
              </div>
              <small className="char-counter">{formData.password.length}/{fieldLimits.password}</small>
              {getFieldError('password') && <span className="error-message">{getFieldError('password')}</span>}
              
              {formData.password && (
                <div className="password-requirements-inline">
                  <small style={{ color: requirements.length ? '#10b981' : '#ef4444' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', marginRight: '4px' }}>
                      {requirements.uppercase ? (
                        <polyline points="20,6 9,17 4,12" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      ) : (
                        <>
                          <line x1="18" y1="6" x2="6" y2="18" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
                          <line x1="6" y1="6" x2="18" y2="18" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
                        </>
                      )}
                    </svg>
                    Mayúscula
                  </small>
                  <small style={{ color: requirements.special ? '#10b981' : '#ef4444' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', marginRight: '4px' }}>
                      {requirements.special ? (
                        <polyline points="20,6 9,17 4,12" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      ) : (
                        <>
                          <line x1="18" y1="6" x2="6" y2="18" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
                          <line x1="6" y1="6" x2="18" y2="18" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
                        </>
                      )}
                    </svg>
                    Especial
                  </small>
                </div>
              )}
            </div>
            <div className="form-group">
              <div className="input-container password-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={getFieldError('confirmPassword') ? 'error' : ''}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                </button>
                {getValidationIcon('confirmPassword')}
              </div>
              {getFieldError('confirmPassword') && <span className="error-message">{getFieldError('confirmPassword')}</span>}
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="form-container sign-up">
      {showAlert.show && (
        <div className="custom-alert" data-type={showAlert.type}>
          {showAlert.message}
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="registro-step-indicator">
          <div className="registro-progress-bar">
            <div 
              className="registro-progress-fill" 
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
          <span className="registro-step-text">Paso {currentStep} de 4</span>
        </div>

        <div className="registro-step-title">
          {currentStep === 1 && "Tipo y Número de Documento"}
          {currentStep === 2 && "Información Personal"}
          {currentStep === 3 && "Correo y Contacto"}
          {currentStep === 4 && "Contraseña"}
        </div>

        {renderStep()}

        <div className="form-navigation">
          {currentStep > 1 && (
            <button 
              type="button" 
              className="nav-button prev-button"
              onClick={handlePrevious}
              disabled={isLoading}
            >
              ← Anterior
            </button>
          )}
          
          {currentStep < 4 ? (
            <button 
              type="button" 
              className="nav-button next-button"
              onClick={handleNext}
              disabled={isLoading}
            >
              Siguiente →
            </button>
          ) : (
            <button 
              type="submit" 
              className="hiddenn1"
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Registrando...' : 'Registrar'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;