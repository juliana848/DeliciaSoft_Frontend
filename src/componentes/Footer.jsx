import React from 'react';
import { Link } from 'react-router-dom';
import logoDelicias from '../assets/imagenes/logo-delicias-darsy.png';
import '../assets/estilos/components/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo-container">
            <img 
              src={logoDelicias} 
              alt="Logo Delicias Darsy" 
              className="footer-logo" 
            />
            <div className="footer-logo-text">
              <p className="footer-title">Delicias Darsy</p>
              <p className="footer-slogan">Hacemos dulces que endulzan cada momento.</p>
            </div>
          </div>
        </div>
        
        <div className="footer-section">
          <p className="footer-title">Nuestra Empresa</p>
          <ul className="footer-links">
            <li><Link to="/sedes" className="footer-link">SEDES</Link></li>
            <li><Link to="/conocenos" className="footer-link">CONÓCENOS</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <p className="footer-title">CONTACTO</p>
          <p className="footer-contact-info">+57 321 309 85 04</p>
          <p className="footer-contact-info">Delicias_Darsy🧁</p>
          <p className="footer-contact-info font-bold">@delicias_darsy</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;