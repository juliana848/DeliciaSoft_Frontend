// LogoutButton.jsx - Componente para cerrar sesión
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ className = "logout-btn" }) => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const handleLogout = () => {
    setShowConfirmModal(true);
  };

  const confirmLogout = () => {
    // Mostrar alerta de despedida
    const userName = localStorage.getItem('userName') || 'Usuario';
    
    // Limpiar datos de autenticación
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    // Cerrar modal
    setShowConfirmModal(false);
    
    // Mostrar mensaje de despedida
    setTimeout(() => {
      alert(`¡Hasta luego ${userName}! Has cerrado sesión exitosamente. 👋`);
    }, 100);
    
    // Redirigir al login
    navigate('/iniciar-sesion');
    
    // Recargar para limpiar el estado
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const cancelLogout = () => {
    setShowConfirmModal(false);
  };
  
  return (
    <>
      <button 
        className={className} 
        onClick={handleLogout}
        title="Cerrar sesión"
        style={className.includes('dropdown') ? {
          width: '100%',
          padding: '0.5rem',
          background: 'none',
          border: 'none',
          color: '#dc2626',
          fontSize: '14px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '0.5rem'
        } : {}}
      >
        <span>{className.includes('dropdown') ? '🚪' : '🚪'}</span>
        {className.includes('dropdown') && ' Cerrar Sesión'}
      </button>

      {/* Modal de Confirmación */}
      {showConfirmModal && (
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
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease forwards'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            border: '3px solid #FFCC00',
            animation: 'slideUp 0.3s ease forwards'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              👋
            </div>
            <h3 style={{
              color: '#333',
              marginBottom: '1rem',
              fontFamily: 'Arial, sans-serif'
            }}>
              ¿Estás seguro que deseas cerrar sesión?
            </h3>
            <p style={{
              color: '#666',
              marginBottom: '2rem',
              lineHeight: '1.5'
            }}>
              Tendrás que iniciar sesión nuevamente para acceder a tu perfil y realizar pedidos.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={cancelLogout}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '0.8rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#5a6268'}
                onMouseOut={(e) => e.target.style.background = '#6c757d'}
              >
                ❌ Cancelar
              </button>
              <button
                onClick={confirmLogout}
                style={{
                  background: 'linear-gradient(135deg, #FFCC00, #ff1493)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '0.8rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default LogoutButton;