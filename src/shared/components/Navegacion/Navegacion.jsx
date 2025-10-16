import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LogoutButton from '../Layout/LogoutButton/LogoutButton';
import './navegacion.css';

const Navegacion = ({ isAuthenticated = false }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener datos del usuario
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || 'usuario@email.com');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Usuario');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Escuchar cambios en el localStorage para actualizar el estado de autenticación
  useEffect(() => {
    const checkAuthStatus = () => {
      const authToken = localStorage.getItem('authToken');
      const email = localStorage.getItem('userEmail');
      const name = localStorage.getItem('userName');
      
      setIsAuthenticatedState(!!authToken);
      if (email) setUserEmail(email);
      if (name) setUserName(name);
    };

    // Verificar estado inicial
    checkAuthStatus();

    // Escuchar evento personalizado desde la ventana de login
    const handleLoginSuccess = (event) => {
      console.log('🎉 Login exitoso detectado en ventana principal');
      checkAuthStatus();
      
      // Si viene desde contacto, redirigir
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        setTimeout(() => {
          navigate(redirectPath);
          window.location.reload(); // Recargar para actualizar todos los componentes
        }, 500);
      } else {
        // Recargar la página para actualizar todos los componentes
        window.location.reload();
      }
    };

    // Escuchar cambios en localStorage desde otras pestañas/ventanas
    window.addEventListener('storage', checkAuthStatus);
    window.addEventListener('loginSuccess', handleLoginSuccess);

    // Verificar periódicamente si el usuario ha iniciado sesión
    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('loginSuccess', handleLoginSuccess);
      clearInterval(interval);
    };
  }, [navigate]);

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getInitials = () => {
    const names = userName.split(' ');
    return names.length > 1 
      ? `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
      : `${names[0].charAt(0)}${names[0].charAt(1) || ''}`.toUpperCase();
  };

  // Función para abrir login en nueva ventana
  const abrirLoginNuevaVentana = (e) => {
    e.preventDefault();
    const width = 900;
    const height = 650;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const loginWindow = window.open(
      '/iniciar-sesion',
      'Login',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    // Verificar si la ventana se abrió correctamente
    if (loginWindow) {
      // Guardar referencia a la ventana principal en la ventana de login
      loginWindow.opener = window;
      
      // Verificar periódicamente si la ventana se cerró y si hay cambios en auth
      const checkInterval = setInterval(() => {
        if (loginWindow.closed) {
          console.log('Ventana de login cerrada, verificando autenticación...');
          clearInterval(checkInterval);
          
          // Verificar si el usuario inició sesión
          const authToken = localStorage.getItem('authToken');
          if (authToken) {
            console.log('Usuario autenticado, recargando página...');
            window.location.reload();
          }
        }
      }, 500);
    }
  };

  return (
    <nav className={`cliente-nav-container ${scrolled ? 'scrolled' : ''}`}>
      <div className="cliente-nav-content">
        <Link to="/" className="cliente-nav-logo">
          <img 
            src='/imagenes/logo-delicias-darsy.png' 
            alt="Delicias Darsy" 
          />
        </Link>
        
        <div className="cliente-nav-links">
          <Link to="/" className={`cliente-nav-link ${isActive('/') ? 'active' : ''}`}>
            INICIO
          </Link>
          <Link to="/cartas" className={`cliente-nav-link ${isActive('/cartas') ? 'active' : ''}`}>
            CARTAS
          </Link>
          <Link to="/pedidos" className={`cliente-nav-link ${isActive('/pedidos') ? 'active' : ''}`}>
            PEDIDOS
          </Link>
          <Link to="/sedes" className={`cliente-nav-link ${isActive('/sedes') ? 'active' : ''}`}>
            SEDES
          </Link>
          <Link to="/conocenos" className={`cliente-nav-link ${isActive('/conocenos') ? 'active' : ''}`}>
            CONÓCENOS
          </Link>
          <Link to="/contactenos" className={`cliente-nav-link ${isActive('/contactenos') ? 'active' : ''}`}>
            CONTÁCTENOS
          </Link>
          
          {isAuthenticatedState ? (
            <div className="user-menu-container" style={{ position: 'relative' }}>
              <button 
                className="user-avatar-btn"
                onClick={toggleUserMenu}
                title={`Perfil de ${userName}`}
              >
                {getInitials()}
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <div style={{
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #e9ecef',
                    marginBottom: '0.5rem'
                  }}>
                    <p style={{
                      margin: 0,
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: '14px'
                    }}>
                      {userName}
                    </p>
                    <p style={{
                      margin: 0,
                      color: '#666',
                      fontSize: '12px'
                    }}>
                      {userEmail}
                    </p>
                  </div>
                  
                  <Link 
                    to="/perfil" 
                    className="user-menu-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    👤 Mi Perfil
                  </Link>
                  
                  <div style={{
                    borderTop: '1px solid #e9ecef',
                    paddingTop: '0.5rem'
                  }}>
                    <LogoutButton className="logout-dropdown-btn" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={abrirLoginNuevaVentana}
              className="cliente-nav-button"
              style={{ cursor: 'pointer' }}
            >
              INICIAR SESIÓN
            </button>
          )}
        </div>
        
        <button onClick={toggleMenu} className="cliente-nav-mobile-button">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      <div className={`cliente-nav-mobile-menu ${menuAbierto ? 'visible' : ''}`}>
        <Link to="/" className={`cliente-nav-link ${isActive('/') ? 'active' : ''}`}>
          INICIO
        </Link>
        <Link to="/cartas" className={`cliente-nav-link ${isActive('/cartas') ? 'active' : ''}`}>
          CARTAS
        </Link>
        <Link to="/pedidos" className={`cliente-nav-link ${isActive('/pedidos') ? 'active' : ''}`}>
          PEDIDOS
        </Link>
        <Link to="/sedes" className={`cliente-nav-link ${isActive('/sedes') ? 'active' : ''}`}>
          SEDES
        </Link>
        <Link to="/conocenos" className={`cliente-nav-link ${isActive('/conocenos') ? 'active' : ''}`}>
          CONÓCENOS
        </Link>
        <Link to="/contactenos" className={`cliente-nav-link ${isActive('/contactenos') ? 'active' : ''}`}>
          CONTÁCTENOS
        </Link>
        
        {isAuthenticatedState ? (
          <>
            <Link to="/perfil" className="cliente-nav-link" style={{ 
              borderTop: '1px solid #e9ecef', 
              paddingTop: '1rem',
              marginTop: '0.5rem' 
            }}>
              👤 MI PERFIL
            </Link>
            <LogoutButton className="cliente-nav-button" />
          </>
        ) : (
          <button 
            onClick={abrirLoginNuevaVentana}
            className="cliente-nav-button"
            style={{ cursor: 'pointer' }}
          >
            INICIAR SESIÓN
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navegacion;