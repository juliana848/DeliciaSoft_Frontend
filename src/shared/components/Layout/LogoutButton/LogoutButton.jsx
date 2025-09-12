// LogoutButton.jsx - Componente para cerrar sesión con diseño mejorado
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ className = "logout-btn", showText = false }) => {
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
    localStorage.removeItem('userData');
    
    // Cerrar modal
    setShowConfirmModal(false);
    
    // Mostrar mensaje de despedida
    setTimeout(() => {
      // Crear un toast personalizado en lugar de alert
      showCustomToast(`¡Hasta luego ${userName}!`, 'Has cerrado sesión exitosamente', 'success');
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

  // Función para mostrar toast personalizado
  const showCustomToast = (title, message, type) => {
    // Crear el elemento toast
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ff69b4, #ff1493);
      color: white;
      padding: 20px 25px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(255, 105, 180, 0.3);
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 600;
      font-size: 14px;
      max-width: 350px;
      animation: slideInToast 0.4s ease forwards;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">✨</span>
        <div>
          <div style="font-weight: 700; margin-bottom: 4px;">${title}</div>
          <div style="font-weight: 500; opacity: 0.9; font-size: 13px;">${message}</div>
        </div>
      </div>
    `;

    // Agregar estilos de animación
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
    
    // Agregar al DOM
    document.body.appendChild(toast);
    
    // Remover después de 4 segundos
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
      <button 
        className={className} 
        onClick={handleLogout}
        title="Cerrar sesión"
      >
        <i className="bi bi-box-arrow-right"></i>
        {showText && <span>Cerrar Sesión</span>}
      </button>

      {/* Modal de Confirmación Mejorado */}
      {showConfirmModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-content">
              <div className="logout-modal-icon">
                🌟
              </div>
              <h3>
                ¿Estás seguro que deseas cerrar sesión?
              </h3>
              <p>
                Tendrás que iniciar sesión nuevamente para acceder a tu perfil y realizar pedidos. 
                Todos tus datos estarán seguros y te estaremos esperando.
              </p>
              <div className="logout-modal-buttons">
                <button
                  onClick={cancelLogout}
                  className="logout-cancel-btn"
                >
                  <i className="bi bi-x-circle"></i>
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={confirmLogout}
                  className="logout-confirm-btn"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Estilos base para el botón de logout */
        .logout-btn {
          background: linear-gradient(135deg, #ff69b4, #ff1493);
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.3s ease;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
          position: relative;
          overflow: hidden;
        }

        /* Botón fijo en esquina superior derecha */
        .logout-button-fixed {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1001;
          background: linear-gradient(135deg, #ff69b4, #ff1493);
          border: none;
          color: white;
          cursor: pointer;
          padding: 12px 20px;
          border-radius: 25px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          transition: all 0.15s ease; /* Transición más rápida */
          box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
          backdrop-filter: blur(10px);
          width: auto;
          height: 44px; /* Altura fija */
          min-width: 150px; /* Ancho mínimo fijo para reservar espacio */
        }

        .logout-button-fixed:hover,
        .logout-btn:hover {
          background: linear-gradient(135deg, #ff1493, #dc143c);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 105, 180, 0.4);
        }

        .logout-button-fixed:active,
        .logout-btn:active {
          transform: translateY(0);
        }

        .logout-button-fixed i {
          font-size: 16px;
        }

        .logout-btn i {
          font-size: 18px;
        }

        /* Modal de confirmación mejorado */
        .logout-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(255, 105, 180, 0.1));
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(8px);
          animation: fadeInBackdrop 0.4s ease forwards;
        }

        .logout-modal {
          background: linear-gradient(135deg, #ffffff 0%, #fef7ff 100%);
          border-radius: 24px;
          padding: 2.5rem;
          max-width: 450px;
          width: 90%;
          text-align: center;
          box-shadow: 
            0 20px 60px rgba(255, 105, 180, 0.3),
            0 0 0 1px rgba(255, 105, 180, 0.1);
          border: 2px solid #ff69b4;
          animation: slideUpModal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          position: relative;
          overflow: hidden;
        }

        .logout-modal::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 105, 180, 0.05) 0%, transparent 70%);
          animation: rotateGradient 20s linear infinite;
          pointer-events: none;
        }

        .logout-modal-content {
          position: relative;
          z-index: 2;
        }

        .logout-modal-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #ff69b4, #ff1493);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: bounceIcon 2s ease-in-out infinite;
          display: inline-block;
        }

        .logout-modal h3 {
          color: #1f2937;
          margin-bottom: 1rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 700;
          font-size: 1.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .logout-modal p {
          color: #374151;
          margin-bottom: 2rem;
          line-height: 1.6;
          font-size: 1rem;
          opacity: 0.9;
        }

        .logout-modal-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .logout-cancel-btn {
          background: linear-gradient(135deg, #6b7280, #374151);
          color: white;
          border: none;
          border-radius: 25px;
          padding: 1rem 1.8rem;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
        }

        .logout-cancel-btn:hover {
          background: linear-gradient(135deg, #374151, #1f2937);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
        }

        .logout-confirm-btn {
          background: linear-gradient(135deg, #ff69b4, #ff1493);
          color: white;
          border: none;
          border-radius: 25px;
          padding: 1rem 1.8rem;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
        }

        .logout-confirm-btn:hover {
          background: linear-gradient(135deg, #ff1493, #dc143c);
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 25px rgba(255, 105, 180, 0.5);
        }

        .logout-confirm-btn:active,
        .logout-cancel-btn:active {
          transform: translateY(0) scale(0.98);
          transition: transform 0.1s ease;
        }

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
            transform: translateY(50px) scale(0.9);
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
            transform: translateY(-8px); 
          }
        }

        @keyframes rotateGradient {
          0% { 
            transform: rotate(0deg); 
          }
          100% { 
            transform: rotate(360deg); 
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .logout-button-fixed {
            top: 10px;
            right: 10px;
            padding: 10px 16px;
            font-size: 13px;
          }

          .logout-modal {
            margin: 20px;
            padding: 2rem;
            max-width: none;
          }
          
          .logout-modal-buttons {
            flex-direction: column;
          }
          
          .logout-cancel-btn,
          .logout-confirm-btn {
            width: 100%;
            justify-content: center;
          }
          
          .logout-modal-icon {
            font-size: 3rem;
          }
          
          .logout-modal h3 {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </>
  );
};

export default LogoutButton;