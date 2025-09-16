import React from 'react';
import { Heart, Clock, Palette, Shield, Star, Users } from 'lucide-react';
import './PorQueElegir.css';

const PorQueElegir = () => {
  const razones = [
    {
      id: 1,
      titulo: "Ingredientes Premium",
      descripcion: "Utilizamos solo los mejores ingredientes naturales y frescos para garantizar el mejor sabor.",
      icono: Heart
    },
    {
      id: 2,
      titulo: "Entrega Puntual",
      descripcion: "Respetamos tus tiempos y entregamos siempre en la fecha acordada.",
      icono: Clock
    },
    {
      id: 3,
      titulo: "Diseños Únicos",
      descripcion: "Cada postre es una obra de arte personalizada según tus gustos y ocasión.",
      icono: Palette
    },
    {
      id: 4,
      titulo: "Calidad Garantizada",
      descripcion: "100% de satisfacción garantizada o te devolvemos tu dinero.",
      icono: Shield
    },
    {
      id: 5,
      titulo: "Experiencia Comprobada",
      descripcion: "Más de 3 años creando momentos dulces para familias y empresas.",
      icono: Star
    },
    {
      id: 6,
      titulo: "Atención Personalizada",
      descripcion: "Te acompañamos desde la idea hasta la entrega de tu pedido perfecto.",
      icono: Users
    }
  ];

  return (
    <section className="porque-elegir">
      <div className="container">
        <div className="section-header">
          <div className="section-header" style={{ textAlign: "center", marginBottom: "2rem" }}>
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
                ¿Por qué elegir Delicias Darsy?
                <span
                style={{
                    display: "block",
                    width: "100px",
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
                Lo que nos hace especiales y únicos en cada dulce momento
            </p>
            </div>

        </div>

        <div className="razones-grid">
          {razones.map((razon) => {
            const IconComponent = razon.icono;
            return (
              <div key={razon.id} className="razon-card">
                <div className="razon-header" style={{ textAlign: 'center' }}>
                  <div className="razon-icono" style={{ margin: '0 auto 1rem auto' }}>
                    <IconComponent className="icono" size={32} color="white" />
                  </div>
                  <div className="razon-glow"></div>
                </div>
                <div className="razon-content">
                  <h3 className="razon-titulo">{razon.titulo}</h3>
                  <p className="razon-descripcion">{razon.descripcion}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PorQueElegir;