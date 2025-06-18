import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
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

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
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
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'Solo se permiten letras y espacios';
        }
        break;
      
      case 'correo':
        if (!value.trim()) {
          error = 'Correo electrónico es requerido';
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
        } else if (!/^\d+$/.test(value)) {
          error = 'Solo se permiten números';
        }
        break;
      
      case 'contacto':
        if (!value.trim()) {
          error = 'Número de contacto es requerido';
        } else if (value.length < 10) {
          error = 'Número de contacto debe tener al menos 10 dígitos';
        } else if (!/^\d+$/.test(value)) {
          error = 'Solo se permiten números';
        }
        break;
      
      case 'password':
        if (!value) {
          error = 'Contraseña es requerida';
        } else if (value.length < 8) {
          error = 'Contraseña debe tener al menos 8 caracteres';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = 'Contraseña debe tener al menos una mayúscula';
        } else if (!/(?=.*[!@#$%^&*])/.test(value)) {
          error = 'Contraseña debe tener al menos un carácter especial (!@#$%^&*)';
        }
        break;
      
      case 'confirmPassword':
        if (!value) {
          error = 'Confirmación de contraseña es requerida';
        } else if (value !== formData.password) {
          error = 'Las contraseñas no coinciden';
        }
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validar campo en tiempo real
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Validar confirmación de contraseña cuando cambie la contraseña
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };

  const validateCurrentStep = () => {
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
        break;
    }

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setFieldErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      showCustomAlert('error', 'Por favor, completa correctamente todos los campos del paso actual.');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      showCustomAlert('error', 'Por favor, completa correctamente todos los campos.');
      return;
    }

    // Validación final de todos los campos
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

    // Simulación de registro exitoso
    showCustomAlert('success', '¡Registro exitoso!');

    console.log('Datos registrados:', formData);

    // Simular login automático después del registro
    localStorage.setItem('authToken', 'fake-jwt-token');
    localStorage.setItem('userRole', 'cliente');
    localStorage.setItem('userEmail', formData.correo);

    showCustomAlert('success', 'Sesión iniciada correctamente');

    setTimeout(() => {
      navigate('/');
      window.location.reload();
    }, 1500);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="form-group">
              <select
                name="tipoDocumento"
                className={`select-documento ${fieldErrors.tipoDocumento ? 'error' : ''}`}
                value={formData.tipoDocumento}
                onChange={handleChange}
              >
                <option value="">Tipo de documento</option>
                <option value="cc">Cédula de Ciudadanía</option>
                <option value="ce">Cédula de Extranjería</option>
                <option value="ti">Tarjeta de Identidad</option>
              </select>
              {fieldErrors.tipoDocumento && <span className="error-message">{fieldErrors.tipoDocumento}</span>}
            </div>
            <div className="form-group">
              <input
                type="text"
                name="documento"
                placeholder="Número de documento"
                value={formData.documento}
                onChange={handleChange}
                className={fieldErrors.documento ? 'error' : ''}
              />
              {fieldErrors.documento && <span className="error-message">{fieldErrors.documento}</span>}
            </div>
          </>
        );
      
      case 2:
        return (
          <>
            <div className="form-group">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={fieldErrors.nombre ? 'error' : ''}
              />
              {fieldErrors.nombre && <span className="error-message">{fieldErrors.nombre}</span>}
            </div>
            <div className="form-group">
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={formData.apellido}
                onChange={handleChange}
                className={fieldErrors.apellido ? 'error' : ''}
              />
              {fieldErrors.apellido && <span className="error-message">{fieldErrors.apellido}</span>}
            </div>
          </>
        );
      
      case 3:
        return (
          <>
            <div className="form-group">
              <input
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                value={formData.correo}
                onChange={handleChange}
                className={fieldErrors.correo ? 'error' : ''}
              />
              {fieldErrors.correo && <span className="error-message">{fieldErrors.correo}</span>}
            </div>
            <div className="form-group">
              <input
                type="text"
                name="contacto"
                placeholder="Número de contacto"
                value={formData.contacto}
                onChange={handleChange}
                className={fieldErrors.contacto ? 'error' : ''}
              />
              {fieldErrors.contacto && <span className="error-message">{fieldErrors.contacto}</span>}
            </div>
          </>
        );
      
      case 4:
        return (
          <>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className={fieldErrors.password ? 'error' : ''}
              />
              {fieldErrors.password && <span className="error-message">{fieldErrors.password}</span>}
            </div>
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={fieldErrors.confirmPassword ? 'error' : ''}
              />
              {fieldErrors.confirmPassword && <span className="error-message">{fieldErrors.confirmPassword}</span>}
            </div>
            
            {/* Información sobre requisitos de contraseña */}
            <div className="password-requirements">
              <strong>Requisitos de contraseña:</strong>
              <ul>
                <li style={{ color: formData.password.length >= 8 ? '#10b981' : '#666' }}>
                  Al menos 8 caracteres
                </li>
                <li style={{ color: /(?=.*[A-Z])/.test(formData.password) ? '#10b981' : '#666' }}>
                  Una letra mayúscula
                </li>
                <li style={{ color: /(?=.*[!@#$%^&*])/.test(formData.password) ? '#10b981' : '#666' }}>
                  Un carácter especial (!@#$%^&*)
                </li>
              </ul>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="form-container sign-up">
      {/* Alerta personalizada */}
      {showAlert.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2000,
            padding: '1rem 1.5rem',
            borderRadius: '15px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem',
            minWidth: '300px',
            background:
              showAlert.type === 'success'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #ec4899, #be185d)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            animation: 'slideInRight 0.5s ease-out',
          }}
        >
          {showAlert.message}
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        {/* Indicador de progreso */}
        <div className="progress-indicator">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
          <span className="step-text">Paso {currentStep} de 4</span>
        </div>

        {/* Título del paso actual */}
        <div className="step-title">
          {currentStep === 1 && "Tipo y Número de Documento"}
          {currentStep === 2 && "Información Personal"}
          {currentStep === 3 && "Correo y Contacto"}
          {currentStep === 4 && "Contraseña"}
        </div>

        {/* Campos del paso actual */}
        {renderStep()}

        {/* Botones de navegación */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button 
              type="button" 
              className="nav-button prev-button"
              onClick={handlePrevious}
            >
              ← Anterior
            </button>
          )}
          
          {currentStep < 4 ? (
            <button 
              type="button" 
              className="nav-button next-button"
              onClick={handleNext}
            >
              Siguiente →
            </button>
          ) : (
            <button type="submit" className="hiddenn1">
              Registrar
            </button>
          )}
        </div>
      </form>

      <style jsx>{`
        .form-group {
          width: 100%;
          margin-bottom: 15px;
        }

        .error-message {
          color: #dc3545;
          font-size: 11px;
          margin-top: 4px;
          display: block;
        }

        .containerlog input.error,
        .select-documento.error {
          border: 2px solid #dc3545 !important;
          background-color: #fff5f5 !important;
        }

        .progress-indicator {
          width: 100%;
          margin-bottom: 20px;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff58a6, #fc0278);
          transition: width 0.3s ease;
        }

        .step-text {
          font-size: 12px;
          color: #fff;
          font-weight: 500;
        }

        .step-title {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          text-align: center;
        }

        .form-navigation {
          display: flex;
          gap: 10px;
          justify-content: space-between;
          width: 100%;
          margin-top: 15px;
        }

        .nav-button {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          transition: all 0.3s ease;
          min-width: 100px;
        }

        .prev-button {
          background-color: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .prev-button:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .next-button {
          background-color: #ff58a6;
          color: #fff;
          margin-left: auto;
        }

        .next-button:hover {
          background-color: #fc0278;
          transform: translateY(-1px);
        }

        .password-requirements {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.8);
          margin-top: 10px;
          background-color: rgba(0, 0, 0, 0.2);
          padding: 10px;
          border-radius: 5px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .password-requirements ul {
          margin: 5px 0;
          padding-left: 15px;
        }

        .password-requirements li {
          margin: 2px 0;
          transition: color 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default RegisterForm;