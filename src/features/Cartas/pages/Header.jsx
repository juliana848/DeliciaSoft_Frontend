import React from "react";

function Header() {
  return (
    <div className="header">
      <img src="/imagenes/Cartas/donas.png" alt="Donas" className="donas-img" />
      <div className="texto-header">
        <h1>EN DELICIAS DARSY</h1>
        <p>descubre sabores únicos que endulzan cada momento.</p>
        <p>"Hechos con mucho amor"</p>
        <p className="contacto-header">321 309 85 04</p>
      </div>
    </div>
  );
}

export default Header;
