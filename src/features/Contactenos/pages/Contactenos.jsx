import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Contactenos = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    telefono: '',
    mensaje: ''
  });

  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    // Validar apellidos
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }

    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(formData.correo)) {
      newErrors.correo = 'El correo electrónico no es válido';
    }

    // Validar teléfono
    const phoneRegex = /^\d{10}$/;
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El número de teléfono es obligatorio';
    } else if (!phoneRegex.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener exactamente 10 números';
    }

    // Validar mensaje
    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es obligatorio';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación especial para teléfono - solo números
    if (name === 'telefono') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData({
          ...formData,
          [name]: numericValue
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setMessageType('error');
      setAlertMessage('Por favor, corrige los errores en el formulario');
      setShowMessage(true);
      
      setTimeout(() => {
        setShowMessage(false);
      }, 5000);
      return;
    }

    console.log('Datos del formulario:', formData);
    
    setMessageType('success');
    setAlertMessage('¡Mensaje enviado con éxito! Te contactaremos pronto.');
    setShowMessage(true);
    setErrors({});
    
    setFormData({
      nombre: '',
      apellidos: '',
      correo: '',
      telefono: '',
      mensaje: ''
    });

    setTimeout(() => {
      setShowMessage(false);
    }, 4000);
  };

  const handleSedesClick = () => {
    navigate('/sedes');
  };

  return (
    <>
      <div className="container-fluid" style={{ backgroundColor: '#fdf2f8', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="bg-white rounded-4 shadow-sm p-4">
                <h2 className="fw-bold mb-4 text-center" style={{ color: '#ec4899', fontSize: '1.8rem' }}>
                  ¡Contáctanos!
                </h2>
                
                {showMessage && (
                  <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center mb-4`} role="alert">
                    <i className={`bi ${messageType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                    {alertMessage}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Nombre *"
                      className={`form-control form-control-lg ${errors.nombre ? 'is-invalid' : ''}`}
                      style={{ 
                        backgroundColor: '#e5e7eb',
                        border: errors.nombre ? '2px solid #dc3545' : 'none',
                        borderRadius: '12px',
                        padding: '15px 20px'
                      }}
                    />
                    {errors.nombre && (
                      <div className="invalid-feedback d-block">
                        <small>{errors.nombre}</small>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      placeholder="Apellidos *"
                      className={`form-control form-control-lg ${errors.apellidos ? 'is-invalid' : ''}`}
                      style={{ 
                        backgroundColor: '#e5e7eb',
                        border: errors.apellidos ? '2px solid #dc3545' : 'none',
                        borderRadius: '12px',
                        padding: '15px 20px'
                      }}
                    />
                    {errors.apellidos && (
                      <div className="invalid-feedback d-block">
                        <small>{errors.apellidos}</small>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      placeholder="Correo electrónico *"
                      className={`form-control form-control-lg ${errors.correo ? 'is-invalid' : ''}`}
                      style={{ 
                        backgroundColor: '#e5e7eb',
                        border: errors.correo ? '2px solid #dc3545' : 'none',
                        borderRadius: '12px',
                        padding: '15px 20px'
                      }}
                    />
                    {errors.correo && (
                      <div className="invalid-feedback d-block">
                        <small>{errors.correo}</small>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Número de teléfono (10 dígitos) *"
                      className={`form-control form-control-lg ${errors.telefono ? 'is-invalid' : ''}`}
                      style={{ 
                        backgroundColor: '#e5e7eb',
                        border: errors.telefono ? '2px solid #dc3545' : 'none',
                        borderRadius: '12px',
                        padding: '15px 20px'
                      }}
                      maxLength="10"
                    />
                    {errors.telefono && (
                      <div className="invalid-feedback d-block">
                        <small>{errors.telefono}</small>
                      </div>
                    )}
                    <small className="text-muted">Solo números, exactamente 10 dígitos</small>
                  </div>
                  
                  <div className="mb-4">
                    <textarea
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      placeholder="Déjanos tu mensaje aquí... *"
                      rows="5"
                      className={`form-control form-control-lg ${errors.mensaje ? 'is-invalid' : ''}`}
                      style={{ 
                        backgroundColor: '#e5e7eb',
                        border: errors.mensaje ? '2px solid #dc3545' : 'none',
                        borderRadius: '12px',
                        padding: '15px 20px',
                        resize: 'vertical'
                      }}
                    ></textarea>
                    {errors.mensaje && (
                      <div className="invalid-feedback d-block">
                        <small>{errors.mensaje}</small>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <button 
                      type="submit" 
                      className="btn btn-lg px-5 py-3 fw-bold"
                      style={{ 
                        backgroundColor: '#fbbf24',
                        color: '#111827',
                        border: 'none',
                        borderRadius: '50px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#f59e0b';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#fbbf24';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Enviar mensaje
                    </button>
                  </div>
                  
                  <div className="text-center mt-3">
                    <small className="text-muted">* Campos obligatorios</small>
                  </div>
                </form>
              </div>
            </div>
            
            <div className="col-lg-5">
              <div className="h-100">
                <h2 className="fw-bold mb-4 text-center" style={{ color: '#ec4899', fontSize: '1.8rem' }}>
                  CONTACTOS
                </h2>
                
                <div className="d-flex flex-column gap-4">
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        backgroundColor: '#ec4899',
                        color: 'white'
                      }}
                    >
                      <i className="bi bi-telephone-fill"></i>
                    </div>
                    <span className="fw-semibold fs-5">+57 321 309 85 04</span>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        backgroundColor: '#ec4899',
                        color: 'white'
                      }}
                    >
                      <i className="bi bi-whatsapp"></i>
                    </div>
                    <span className="fw-semibold fs-5">Delicias_Darsy🧁</span>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        backgroundColor: '#ec4899',
                        color: 'white'
                      }}
                    >
                      <i className="bi bi-instagram"></i>
                    </div>
                    <span className="fw-semibold fs-5">@delicias_darsy</span>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        backgroundColor: '#ec4899',
                        color: 'white'
                      }}
                    >
                      <i className="bi bi-geo-alt-fill"></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="fw-semibold fs-6 mb-2">Nuestras ubicaciones:</span>
                      <button 
                        onClick={handleSedesClick}
                        className="btn btn-outline-pink fw-semibold"
                        style={{ 
                          borderColor: '#ec4899',
                          color: '#ec4899',
                          borderRadius: '25px',
                          padding: '8px 20px',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#ec4899';
                          e.target.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#ec4899';
                        }}
                      >
                        Ver nuestras sedes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contactenos;