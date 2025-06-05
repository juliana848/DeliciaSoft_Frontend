import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PerfilCliente = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [userData, setUserData] = useState({
    IdCliente: '',
    TipoDocumento: 'CC',
    NumeroDocumento: '',
    Nombre: '',
    Apellido: '',
    Correo: '',
    Contrasena: '',
    Direccion: '',
    Barrio: '',
    Ciudad: '',
    FechaNacimiento: '',
    Celular: '',
    Estado: true
  });

  // Simular carga de datos del usuario
  useEffect(() => {
    const loadUserData = () => {
      setUserData({
        IdCliente: '12345',
        TipoDocumento: 'CC',
        NumeroDocumento: '1234567890',
        Nombre: 'Juan Carlos',
        Apellido: 'Pérez García',
        Correo: 'juan.perez@email.com',
        Contrasena: '',
        Direccion: 'Calle 123 #45-67',
        Barrio: 'Centro',
        Ciudad: 'Medellín',
        FechaNacimiento: '1990-05-15',
        Celular: '3001234567',
        Estado: true
      });
    };
    
    loadUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleSave = () => {
    console.log('Guardando datos:', userData);
    setIsEditing(false);
    showCustomAlert('success', '¡Datos actualizados correctamente! 💾');
  };

  const handleLogout = () => {
    const userName = userData.Nombre || 'Usuario';
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    setShowLogoutModal(false);
    
    showCustomAlert('info', `¡Hasta luego ${userName}! Has cerrado sesión exitosamente. 👋`);
    
    setTimeout(() => {
      navigate('/iniciar-sesion');
      window.location.reload();
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff9e6 0%, #ffffff 50%, #ffe6f2 100%)',
      padding: '2rem 1rem'
    }}>
      {/* Alerta personalizada */}
      {showAlert.show && (
        <div style={{
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
          background: showAlert.type === 'success' ? 
            'linear-gradient(135deg, #10b981, #059669)' : 
            'linear-gradient(135deg, #ec4899, #be185d)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          animation: 'slideInRight 0.5s ease-out'
        }}>
          {showAlert.message}
        </div>
      )}

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        
        {/* Header del Perfil */}
        <div style={{
          background: 'linear-gradient(135deg, #ec4899, #be185d)',
          padding: '3rem 2rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              fontSize: '1.2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            ←
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              fontSize: '1.2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            title="Cerrar sesión"
          >
            🚪
          </button>

          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            color: '#ec4899',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
          }}>
            👤
          </div>
          
          <h1 style={{
            color: 'white',
            margin: '0 0 0.5rem 0',
            fontSize: '2rem',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {userData.Nombre} {userData.Apellido}
          </h1>
          
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
            fontSize: '1.1rem'
          }}>
            {userData.Correo}
          </p>
        </div>

        {/* Contenido del Perfil */}
        <div style={{ padding: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              color: '#333',
              margin: 0,
              fontSize: '1.5rem'
            }}>
              Mi Información
            </h2>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '25px',
                      padding: '0.7rem 1.5rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      background: 'linear-gradient(135deg, #ec4899, #be185d)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '25px',
                      padding: '0.7rem 1.5rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    💾 Guardar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: 'linear-gradient(135deg, #ec4899, #be185d)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '0.7rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  ✏️ Editar
                </button>
              )}
            </div>
          </div>

          {/* Formulario */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            
            {/* Información Personal */}
            <div style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '15px',
              border: '2px solid #FFCC00'
            }}>
              <h3 style={{
                color: '#ec4899',
                marginBottom: '1rem',
                fontSize: '1.2rem'
              }}>
                📋 Información Personal
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Tipo de Documento
                </label>
                <select
                  name="TipoDocumento"
                  value={userData.TipoDocumento}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    backgroundColor: isEditing ? 'white' : '#f8f9fa',
                    cursor: isEditing ? 'pointer' : 'not-allowed'
                  }}
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PA">Pasaporte</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Número de Documento
                </label>
                <input
                  type="text"
                  name="NumeroDocumento"
                  value={userData.NumeroDocumento}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    backgroundColor: isEditing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Nombres
                </label>
                <input
                  type="text"
                  name="Nombre"
                  value={userData.Nombre}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    backgroundColor: isEditing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Apellidos
                </label>
                <input
                  type="text"
                  name="Apellido"
                  value={userData.Apellido}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    backgroundColor: isEditing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="FechaNacimiento"
                  value={userData.FechaNacimiento}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    backgroundColor: isEditing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>
            </div>

            {/* Información de Contacto */}
            <div style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '15px',
              border: '2px solid #ec4899'
            }}>
              <h3 style={{
                color: '#ec4899',
                marginBottom: '1rem',
                fontSize: '1.2rem'
              }}>
                📞 Información de Contacto
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="Correo"
                  value={userData.Correo}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    backgroundColor: isEditing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Número de Celular
                </label>
                <input
                  type="tel"
                  name="Celular"
                  value={userData.Celular}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    backgroundColor: isEditing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Dirección
                </label>
                <input
                  type="text"
                  name="Direccion"
                  value={userData.Direccion}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    backgroundColor: isEditing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Barrio
                </label>
                <input
                  type="text"
                  name="Barrio"
                  value={userData.Barrio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    backgroundColor: isEditing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Ciudad
                </label>
                <input
                  type="text"
                  name="Ciudad"
                  value={userData.Ciudad}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    backgroundColor: isEditing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #fff9e6, #ffe6f2)',
            borderRadius: '15px',
            border: '2px solid #FFCC00'
          }}>
            <h3 style={{
              color: '#ec4899',
              marginBottom: '1rem',
              fontSize: '1.2rem'
            }}>
              🎉 ¡Bienvenido a Delicias Darsy!
            </h3>
            <p style={{
              color: '#666',
              lineHeight: '1.6',
              margin: 0
            }}>
              Gracias por ser parte de nuestra familia. Aquí puedes actualizar tu información personal 
              para que podamos brindarte el mejor servicio. ¡No olvides mantener tus datos actualizados 
              para recibir nuestras promociones y novedades!
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Logout */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            border: '3px solid #ec4899'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              👋
            </div>
            <h3 style={{
              color: '#333',
              marginBottom: '1rem'
            }}>
              ¿Estás seguro que deseas cerrar sesión?
            </h3>
            <p style={{
              color: '#666',
              marginBottom: '2rem'
            }}>
              Tendrás que iniciar sesión nuevamente para acceder a tu perfil.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '0.7rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                ❌ Cancelar
              </button>
              <button
                onClick={handleLogout}
                style={{
                  background: 'linear-gradient(135deg, #ec4899, #be185d)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '0.7rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from { 
            opacity: 0;
            transform: translateX(100%);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PerfilCliente;