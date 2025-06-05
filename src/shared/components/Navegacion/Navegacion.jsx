import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoutButton from '../Layout/LogoutButton/LogoutButton';
import './navegacion.css';

const Navegacion = ({ isAuthenticated = false }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  // Obtener datos del usuario
  const userEmail = localStorage.getItem('userEmail') || 'usuario@email.com';
  const userName = localStorage.getItem('userName') || 'Usuario';

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
          
          {isAuthenticated ? (
            <div className="user-menu-container" style={{ position: 'relative' }}>
              <button 
                className="user-avatar-btn"
                onClick={toggleUserMenu}
                style={{
                  background: 'linear-gradient(135deg, #FFCC00, #ff1493)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                title={`Perfil de ${userName}`}
              >
                {getInitials()}
              </button>
              
              {showUserMenu && (
                <div 
                  className="user-dropdown-menu"
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: '0',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    padding: '1rem',
                    minWidth: '220px',
                    zIndex: 1000,
                    border: '2px solid #FFCC00'
                  }}
                >
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
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      color: '#333',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      marginBottom: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.color = '#ff1493';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#333';
                    }}
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
            <Link to="/iniciar-sesion" className="cliente-nav-button">
              INICIAR SESIÓN
            </Link>
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
        
        {isAuthenticated ? (
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
          <Link to="/iniciar-sesion" className="cliente-nav-button">
            INICIAR SESIÓN
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navegacion;