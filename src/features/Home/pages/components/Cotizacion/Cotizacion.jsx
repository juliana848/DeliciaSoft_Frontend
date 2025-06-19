import React from 'react';
import './Cotizacion.css';
import { Link } from 'react-router-dom';
import imagenLateral from './ImagenesCotizacion/Cotizacion1.png'; 
<link href="https://fonts.googleapis.com/css2?family=Fredoka&display=swap" rel="stylesheet" />

function Cotizacion() {
  return (
    <div className="cotizacion-container">
      <div className="imagen-lateral">
        <img src={imagenLateral} alt="Imagen lateral" />
      </div>
      <div className="contenido-cotizacion">
        <h2 className="titulo-cotizacion">Solicita Pedidos</h2>
        <div className="secciones">
          <div className="seccion">
            <div className="numero">1</div>
            <div className="mini-titulo">Toma una decición</div>
            <div className="texto">
              Selecciona algun delicioso postre de tu preferencia!
            </div>
          </div>
          <div className="seccion">
            <div className="numero">2</div>
            <div className="mini-titulo">Seleciona toppings</div>
            <div className="texto">
              Elije agregados deliciosos a tus postres para darle ese toque.
              <Link to="/pedidos">
                <button className="btn-cotizar">Pedido Ahora</button>
              </Link>
            </div>
          </div>
          <div className="seccion">
            <div className="numero">3</div>
            <div className="mini-titulo">Finaliza Facilmente</div>
            <div className="texto">
              finaliza tu pedido con seguridad, ya esta en camino!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cotizacion;
