import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoDelicias from '../assets/imagenes/logo-delicias-darsy.png';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del formulario:', formData);
    
    // Mostrar mensaje de éxito
    setShowMessage(true);
    
    // Limpiar formulario
    setFormData({
      nombre: '',
      apellidos: '',
      correo: '',
      telefono: '',
      mensaje: ''
    });

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  const handleSedesClick = () => {
    navigate('/sedes');
  };

  return (
    <>
      {/* Sección principal de contacto */}
      <div className="container-fluid" style={{ backgroundColor: '#fdf2f8', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="container">
          <div className="row g-4">
            {/* Columna del formulario */}
            <div className="col-lg-7">
              <div className="bg-white rounded-4 shadow-sm p-4">
                <h2 className="fw-bold mb-4" style={{ color: '#ec4899', fontSize: '1.8rem' }}>
                  Envíanos tu mensaje!
                </h2>
                
                {showMessage && (
                  <div className="alert alert-success d-flex align-items-center" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    ¡Mensaje enviado con éxito!
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Nombre"
                      className="form-control form-control-lg"
                      style={{ 
                        backgroundColor: '#e5e7eb',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '15px 20px'
                      }}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      placeholder="Apellidos"
                      className="form-control form-control-lg"
                      style={{ 
                        backgroundColor: '#e5e7eb',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '15px 20px'
                      }}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      placeholder="Correo electrónico"
                      className="form-control form-control-lg"
                      style={{ 
                        backgroundColor: '#e5e7eb',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '15px 20px'
                      }}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Número de teléfono"
                      className="form-control form-control-lg"
                      style={{ 
                        backgroundColor: '#e5e7eb',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '15px 20px'
                      }}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <textarea
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      placeholder="Déjanos tu mensaje aquí....."
                      rows="5"
                      className="form-control form-control-lg"
                      style={{ 
                        backgroundColor: '#e5e7eb',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '15px 20px',
                        resize: 'vertical'
                      }}
                      required
                    ></textarea>
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
                </form>
              </div>
            </div>
            
            {/* Columna de información de contacto */}
            <div className="col-lg-5">
              <div className="h-100">
                <h2 className="fw-bold mb-4" style={{ color: '#ec4899', fontSize: '1.8rem' }}>
                  CONTACTOS
                </h2>
                
                <div className="d-flex flex-column gap-4">
                  {/* Teléfono */}
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
                  
                  {/* WhatsApp */}
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
                  
                  {/* Instagram */}
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
                  
                  {/* Ubicación */}
                  <div className="d-flex align-items-start">
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
                    <div>
                      <p className="fw-semibold fs-5 mb-1">Cra. 57 #51-83 ·</p>
                      <p className="fw-semibold fs-5 mb-0">Cra. 37 # 97-27</p>
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