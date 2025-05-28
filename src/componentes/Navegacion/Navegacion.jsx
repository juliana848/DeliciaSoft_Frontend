import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoDelicias from '../../assets/imagenes/logo-delicias-darsy.png';
import '../../assets/estilos/components/navegacion.css';

const Navegacion = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Maneja el estado de scroll para efectos visuales
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

  // Verifica si la ruta actual corresponde al enlace
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`nav-container ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-content">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <img 
            src={logoDelicias} 
            alt="Delicias Darsy" 
          />
        </Link>
        
        {/* Links de navegación - versión desktop */}
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>INICIO</Link>
          <Link to="/cartas" className={`nav-link ${isActive('/cartas') ? 'active' : ''}`}>CARTAS</Link>
          <Link to="/pedidos" className={`nav-link ${isActive('/pedidos') ? 'active' : ''}`}>PEDIDOS</Link>
          <Link to="/sedes" className={`nav-link ${isActive('/sedes') ? 'active' : ''}`}>SEDES</Link>
          <Link to="/conocenos" className={`nav-link ${isActive('/conocenos') ? 'active' : ''}`}>CONÓCENOS</Link>
          <Link to="/contactenos" className={`nav-link ${isActive('/contactenos') ? 'active' : ''}`}>CONTÁCTENOS</Link>
          <Link to="/iniciar-sesion" className="nav-button">
            INICIAR SESIÓN
          </Link>
        </div>
        
        {/* Botón hamburguesa para móvil */}
        <button onClick={toggleMenu} className="nav-mobile-button">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Menú móvil */}
      <div className={`nav-mobile-menu ${menuAbierto ? 'visible' : ''}`}>
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>INICIO</Link>
        <Link to="/cartas" className={`nav-link ${isActive('/cartas') ? 'active' : ''}`}>CARTAS</Link>
        <Link to="/pedidos" className={`nav-link ${isActive('/pedidos') ? 'active' : ''}`}>PEDIDOS</Link>
        <Link to="/sedes" className={`nav-link ${isActive('/sedes') ? 'active' : ''}`}>SEDES</Link>
        <Link to="/conocenos" className={`nav-link ${isActive('/conocenos') ? 'active' : ''}`}>CONÓCENOS</Link>
        <Link to="/contactenos" className={`nav-link ${isActive('/contactenos') ? 'active' : ''}`}>CONTÁCTENOS</Link>
        <Link to="/iniciar-sesion" className="nav-button">
          INICIAR SESIÓN
        </Link>
      </div>
    </nav>
  );
};

export default Navegacion;