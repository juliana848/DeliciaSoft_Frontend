import React from 'react';
import './Sedes.css';
import { MapPin, Phone, Clock, Home } from 'lucide-react';
<link href="https://fonts.googleapis.com/css2?family=Fredoka&display=swap" rel="stylesheet" />


import sedeSanPablo from './Sedes/Sede1.png';
import sedeSanBenito from './Sedes/Sede2.png';

function Sedes() {
  return (
    <div className="sedes-container">
      <h2 className="sedes-titulo">NUESTRAS SEDES</h2>
      <div className="sedes-grid">
        <div className="sede">
          <h3 className="sede-nombre">SAN PABLO</h3>
          <img src={sedeSanPablo} alt="San Pablo" className="sede-imagen" />
          <ul className="sede-info">
            <li><MapPin size={18} /> Cra.37 # 97-27</li>
            <li><Phone size={18} /> 321 3098504</li>
            <li><Clock size={18} /> Lunes a viernes de 10:30am - 05:30pm</li>
            <li><Home size={18} /> Medellín - Antioquia</li>
          </ul>
          <button className="sede-boton">Mapa</button>
        </div>

        <div className="sede">
          <h3 className="sede-nombre">SAN BENITO</h3>
          <img src={sedeSanBenito} alt="San Benito" className="sede-imagen" />
          <ul className="sede-info">
            <li><MapPin size={18} /> Cra.37 # 97-27</li>
            <li><Phone size={18} /> 321 3098504</li>
            <li><Clock size={18} /> Lunes a viernes de 10:30am - 05:30pm</li>
            <li><Home size={18} /> Medellín - Antioquia</li>
          </ul>
          <button className="sede-boton">Mapa</button>
        </div>
      </div>
    </div>
  );
}

export default Sedes;
