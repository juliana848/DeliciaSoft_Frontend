import React from 'react';
import './ComoPedido.css';

const ComoPedido = () => {
  const pasos = [
    {
      numero: 1,
      titulo: "Elige tu Postre",
      descripcion: "Selecciona de nuestra variedad de productos o solicita una creación personalizada",
      icono: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C10.3431 2 9 3.34315 9 5V7H15V5C15 3.34315 13.6569 2 12 2Z" fill="white"/>
          <path d="M8 9V22C8 22.5523 8.44772 23 9 23H15C15.5523 23 16 22.5523 16 22V9H8Z" fill="white"/>
          <path d="M6 7H18C18.5523 7 19 7.44772 19 8C19 8.55228 18.5523 9 18 9H6C5.44772 9 5 8.55228 5 8C5 7.44772 5.44772 7 6 7Z" fill="white"/>
        </svg>
      )
    },
    {
      numero: 2,
      titulo: "Personaliza",
      descripcion: "Cuéntanos tus preferencias, sabores, colores y cualquier detalle especial",
      icono: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" fill="white"/>
          <circle cx="6" cy="6" r="2" fill="white"/>
          <circle cx="18" cy="6" r="2" fill="white"/>
          <circle cx="6" cy="18" r="2" fill="white"/>
          <circle cx="18" cy="18" r="2" fill="white"/>
          <path d="M12 2L12 6M12 18L12 22M2 12L6 12M18 12L22 12" stroke="white" strokeWidth="2"/>
        </svg>
      )
    },
    {
      numero: 3,
      titulo: "Confirma tu Pedido",
      descripcion: "Revisa todos los detalles y confirma tu orden con el método de pago preferido",
      icono: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      numero: 4,
      titulo: "Recibe tu Dulce",
      descripcion: "Entregamos tu pedido fresco y listo para disfrutar en la fecha acordada",
      icono: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="12" width="18" height="9" rx="2" fill="white"/>
          <path d="M12 12V3" stroke="white" strokeWidth="2"/>
          <path d="M8 8L12 12L16 8" stroke="white" strokeWidth="2" fill="none"/>
        </svg>
      )
    }
  ];

  return (
    <section className="como-pedido">
      <div className="container">
        <div className="section-header">
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              textAlign: "center",
              color: "#2C3E50",
              position: "relative",
              display: "inline-block",
              marginBottom: "1rem",
            }}
          >
            ¿Cómo hacer tu pedido?
            <span
              style={{
                display: "block",
                width: "80px",
                height: "4px",
                background: "linear-gradient(90deg, #FF1493, #FFCC00)",
                borderRadius: "2px",
                margin: "0.5rem auto 0 auto",
              }}
            ></span>
          </h2>

          <p
            style={{
              textAlign: "center",
              fontSize: "1.1rem",
              color: "#666",
              marginTop: "1rem",
            }}
          >
            Proceso simple y fácil en 4 pasos
          </p>
        </div>

        <div className="pasos-container">
          {pasos.map((paso, index) => (
            <div key={paso.numero} className="paso-card">
              <div className="paso-numero">
                <span className="numero">{paso.numero}</span>
              </div>
              <div className="paso-icono">
                {paso.icono}
              </div>
              <div className="paso-content">
                <h3 className="paso-titulo">{paso.titulo}</h3>
                <p className="paso-descripcion">{paso.descripcion}</p>
              </div>
              {index < pasos.length - 1 && (
                <div className="paso-arrow">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M5 12H19M19 12L12 5M19 12L12 19" 
                      stroke="#FFCC00" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="cta-section">
          <button className="btn-comenzar">
            Comenzar Pedido
          </button>
        </div>
      </div>
    </section>
  );
};

export default ComoPedido;