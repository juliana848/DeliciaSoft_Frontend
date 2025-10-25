import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const AdminHeader = ({ insumos = [], pedidos = [] }) => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const handleLogout = () => {
    setShowConfirmModal(true);
  };

  const confirmLogout = () => {
    const userName = localStorage.getItem('userName') || 'Usuario';
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userData');
    
    setShowConfirmModal(false);
    
    setTimeout(() => {
      showCustomToast(`¡Hasta luego ${userName}!`, 'Has cerrado sesión exitosamente', 'success');
    }, 100);
    
    navigate('/');
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const cancelLogout = () => {
    setShowConfirmModal(false);
  };

  const showCustomToast = (title, message, type) => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 15px;
      right: 15px;
      background: linear-gradient(135deg, #ff69b4, #ff1493);
      color: white;
      padding: 12px 16px;
      border-radius: 10px;
      box-shadow: 0 6px 20px rgba(255, 105, 180, 0.3);
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 600;
      font-size: 12px;
      max-width: 300px;
      animation: slideInToast 0.4s ease forwards;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">✨</span>
        <div>
          <div style="font-weight: 700; margin-bottom: 2px; font-size: 13px;">${title}</div>
          <div style="font-weight: 500; opacity: 0.9; font-size: 11px;">${message}</div>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInToast {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutToast {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOutToast 0.4s ease forwards';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      }, 400);
    }, 4000);
  };
  
  return (
    <>
      {/* Bootstrap Icons */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        rel="stylesheet"
      />

      {/* Header Container - NO FIXED */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 15px',
        zIndex: 100
        
      }}>
        {/* Campanita de notificaciones */}
        <div>
          <NotificationBell insumos={insumos} pedidos={pedidos} />
        </div>
        
        {/* Botón de cerrar sesión */}
        <button 
          onClick={handleLogout}
          style={{
            background: 'linear-gradient(135deg, #ff69b4, #ff1493)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '7px 13px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(255, 105, 180, 0.3)',
            height: '32px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #ff1493, #dc143c)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 105, 180, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #ff69b4, #ff1493)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 105, 180, 0.3)';
          }}
          title="Cerrar sesión"
        >
          <i className="bi bi-box-arrow-right" style={{ fontSize: '13px' }}></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(255, 105, 180, 0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(8px)',
          animation: 'fadeInBackdrop 0.4s ease forwards'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fef7ff 100%)',
            borderRadius: '18px',
            padding: '1.8rem',
            maxWidth: '380px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 14px 42px rgba(255, 105, 180, 0.3), 0 0 0 1px rgba(255, 105, 180, 0.1)',
            border: '2px solid #ff69b4',
            animation: 'slideUpModal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #ff69b4, #ff1493)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'bounceIcon 2s ease-in-out infinite',
                display: 'inline-block'
              }}>
                🌟
              </div>
              <h3 style={{
                color: '#1f2937',
                marginBottom: '0.7rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: '700',
                fontSize: '1.2rem',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                ¿Estás seguro que deseas cerrar sesión?
              </h3>
              <p style={{
                color: '#374151',
                marginBottom: '1.3rem',
                lineHeight: '1.4',
                fontSize: '0.88rem',
                opacity: '0.9'
              }}>
                Tendrás que iniciar sesión nuevamente para acceder a tu perfil.
              </p>
              <div style={{
                display: 'flex',
                gap: '0.7rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={cancelLogout}
                  style={{
                    background: 'linear-gradient(135deg, #6b7280, #374151)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '18px',
                    padding: '0.7rem 1.3rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 3px 10px rgba(107, 114, 128, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #374151, #1f2937)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(107, 114, 128, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #6b7280, #374151)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 3px 10px rgba(107, 114, 128, 0.3)';
                  }}
                >
                  <i className="bi bi-x-circle" style={{ fontSize: '15px' }}></i>
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={confirmLogout}
                  style={{
                    background: 'linear-gradient(135deg, #ff69b4, #ff1493)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '18px',
                    padding: '0.7rem 1.3rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 3px 10px rgba(255, 105, 180, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ff1493, #dc143c)';
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 5px 18px rgba(255, 105, 180, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ff69b4, #ff1493)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 3px 10px rgba(255, 105, 180, 0.3)';
                  }}
                >
                  <i className="bi bi-box-arrow-right" style={{ fontSize: '15px' }}></i>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Animaciones */
        @keyframes fadeInBackdrop {
          from { 
            opacity: 0; 
          }
          to { 
            opacity: 1; 
          }
        }

        @keyframes slideUpModal {
          from { 
            opacity: 0;
            transform: translateY(40px) scale(0.9);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bounceIcon {
          0%, 100% { 
            transform: translateY(0); 
          }
          50% { 
            transform: translateY(-6px); 
          }
        }

        /* Responsive para tablets */
        @media (max-width: 1024px) {
          /* Ajustar posiciones en tablet */
        }

        /* Responsive para móviles */
        @media (max-width: 768px) {
          button[title="Cerrar sesión"] {
            padding: 6px 11px !important;
            font-size: 11px !important;
            height: 30px !important;
          }
          
          button[title="Cerrar sesión"] i {
            font-size: 12px !important;
          }
        }
      `}</style>
    </>
  );
};

export default AdminHeader;