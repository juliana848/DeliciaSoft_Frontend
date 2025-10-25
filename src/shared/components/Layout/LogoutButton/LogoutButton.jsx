// LogoutButton.jsx - Componente para cerrar sesión con diseño mejorado
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';

const LogoutButton = ({ className = "logout-btn", showText = false, isDropdown = false }) => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Prevenir scroll cuando el modal está abierto
  useEffect(() => {
    if (showConfirmModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showConfirmModal]);
  
  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmModal(true);
  };

  const confirmLogout = () => {
    const userName = localStorage.getItem('userName') || 'Usuario';
    
    // Limpiar datos de autenticación
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userData');
    
    setShowConfirmModal(false);
    
    setTimeout(() => {
      showCustomToast(`¡Hasta luego ${userName}!`, 'Has cerrado sesión exitosamente', 'success');
    }, 100);
    
    navigate('/iniciar-sesion');
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const cancelLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmModal(false);
  };

  const showCustomToast = (title, message, type) => {
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
  
  const buttonClass = isDropdown || className.includes('dropdown') ? 'logout-dropdown-btn' : className;
  
  // Componente Modal separado
  const LogoutModal = () => (
    <div 
      className="logout-modal-overlay"
      onClick={cancelLogout}
    >
      <div 
        className="logout-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="logout-modal-content">
          <div className="logout-modal-icon">
            🌟
          </div>
          <h3>
            ¿Estás seguro que deseas cerrar sesión?
          </h3>
          <p>
            Tendrás que iniciar sesión nuevamente para acceder a tu perfil.
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
  );
  
  return (
    <>
      {/* Bootstrap Icons */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        rel="stylesheet"
      />
      
      <button 
        className={buttonClass} 
        onClick={handleLogout}
        title="Cerrar sesión"
      >
        <i className="bi bi-box-arrow-right"></i>
        {(showText || isDropdown || className.includes('dropdown')) && <span>Cerrar Sesión</span>}
      </button>

      {/* Modal usando Portal */}
      {showConfirmModal && ReactDOM.createPortal(
        <LogoutModal />,
        document.body
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

        .logout-btn:hover {
          background: linear-gradient(135deg, #ff1493, #dc143c);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 105, 180, 0.4);
        }

        .logout-btn:active {
          transform: translateY(0);
        }

        .logout-btn i {
          font-size: 18px;
        }

        /* Botón en dropdown */
        .logout-dropdown-btn {
          width: 100%;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #ff69b4, #ff1493);
          border: none;
          color: white;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 2px 8px rgba(255, 105, 180, 0.3);
        }

        .logout-dropdown-btn:hover {
          background: linear-gradient(135deg, #ff1493, #dc143c);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 105, 180, 0.4);
        }

        .logout-dropdown-btn i {
          font-size: 16px;
        }

        /* Modal de confirmación mejorado */
        .logout-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(255, 105, 180, 0.15));
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          backdrop-filter: blur(10px);
          animation: fadeInBackdrop 0.3s ease forwards;
          padding: 20px;
        }

        .logout-modal {
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          max-width: 450px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(255, 105, 180, 0.4);
          border: 2px solid #ff69b4;
          animation: slideUpModal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          position: relative;
          z-index: 1000000;
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
        }

        .logout-modal p {
          color: #374151;
          margin-bottom: 2rem;
          line-height: 1.6;
          font-size: 1rem;
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
        }

        /* Animaciones */
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
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
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .logout-modal {
            margin: 20px;
            padding: 2rem;
          }
          
          .logout-modal-buttons {
            flex-direction: column;
            width: 100%;
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