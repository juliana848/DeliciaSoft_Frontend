// LogoutButton.jsx - Componente para cerrar sesión
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ className = "logout-btn" }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Limpiar datos de autenticación
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    
    // Redirigir al login
    navigate('/iniciar-sesion');
    
    // Recargar para limpiar el estado
    window.location.reload();
  };
  
  return (
    <button 
      className={className} 
      onClick={handleLogout}
      title="Cerrar sesión"
    >
      <span>🚪</span>
    </button>
  );
};

export default LogoutButton;