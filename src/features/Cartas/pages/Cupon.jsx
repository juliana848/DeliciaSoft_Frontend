import React from "react";

function Cupon({ onClick }) {
  return (
    <div 
      className="banner-cumple" 
      style={{ 
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "2rem",
        padding: "0 1rem" // Padding para dispositivos móviles
      }}
    >
      <img
        src="/imagenes/Cartas/cupon.jpg"
        alt="Promoción"
        onClick={onClick}
        style={{
          width: "100%",
          maxWidth: "900px",
          height: "400px",
          cursor: "pointer",
          transition: "transform 0.3s",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          objectFit: "cover", // Asegura que la imagen se ajuste bien
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      />
    </div>
  );
}

export default Cupon;