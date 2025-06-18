import React from "react";

function Cupon({ onClick }) {
  return (
    <div className="banner-cumple" style={{ textAlign: "center", marginTop: "2rem" }}>
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
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      />
    </div>
  );
}

export default Cupon;
