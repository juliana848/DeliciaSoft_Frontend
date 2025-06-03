import React from 'react';
import './Cotizacion.css';
import imagenLateral from './ImagenesCotizacion/Cotizacion1.png'; 
<link href="https://fonts.googleapis.com/css2?family=Fredoka&display=swap" rel="stylesheet" />

function Cotizacion() {
  return (
    <div className="cotizacion-container">
      <div className="imagen-lateral">
        <img src={imagenLateral} alt="Imagen lateral" />
      </div>
      <div className="contenido-cotizacion">
        <h2 className="titulo-cotizacion">Solicita Cotización</h2>
        <div className="secciones">
          <div className="seccion">
            <div className="numero">1</div>
            <div className="mini-titulo">Eventos</div>
            <div className="texto">
              Bodas,cumpleaños, celebraciones corporativas.
            </div>
          </div>
          <div className="seccion">
            <div className="numero">3</div>
            <div className="mini-titulo">Precios</div>
            <div className="texto">
              Precios personalizados, adaptados a tus necesidades.
              <button className="btn-cotizar">Cotizar Ahora</button>
            </div>
          </div>
          <div className="seccion">
            <div className="numero">2</div>
            <div className="mini-titulo">Detalles</div>
            <div className="texto">
              Cantidad, sabores, diseños, fecha de entrega.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cotizacion;
