import React from "react";
import "./footer.css";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-wave" />

            <div className="footer-content">
                <div className="footer-section logo-section">
                    <img src="/imagenes/logo-delicias-darsy.png" alt="Delicias Darsy" className="footer-logo" />
                </div>

                <div className="footer-section about-section">
                    <h3 className="footer-title">Delicias Darsy</h3>
                    <p className="footer-text">descubre sabores únicos que endulzan cada momento.</p>
                </div>

                <div className="footer-section empresa-section">
                    <h3 className="footer-title">Nuestra Empresa</h3>
                    <p className="footer-text"><strong>SEDES</strong></p>
                    <p className="footer-text"><strong>CONÓCENOS</strong></p>
                </div>

                <div className="footer-section contacto-section">
                    <h3 className="footer-title">CONTACTO</h3>
                    <p className="footer-text">
                        <a href="https://wa.me/573213098504" target="_blank" rel="noopener noreferrer">📱 +57 321 309 85 04</a>
                    </p>
                    <p className="footer-text">
                        <a href="https://www.tiktok.com/@delicias_darsy?_t=ZS-8waDD3RfXJk&_r=1" target="_blank" rel="noopener noreferrer">📹 Delicias_Darsy 🧁🍓</a>
                    </p>
                    <p className="footer-text">
                        <a href="https://www.instagram.com/delicias_darsy?igsh=MTYwOWJoOTQ2djMwcg==" target="_blank" rel="noopener noreferrer">📷 @delicias_darsy</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
