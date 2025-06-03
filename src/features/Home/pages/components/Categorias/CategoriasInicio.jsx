import React from 'react';
import './CategoriasSlider.css';
<link href="https://fonts.googleapis.com/css2?family=Fredoka&display=swap" rel="stylesheet" />

import cat1 from './imgenescategorias/cat1.png';
import cat2 from './imgenescategorias/cat2.png';
import cat3 from './imgenescategorias/cat3.png';
import cat4 from './imgenescategorias/cat4.png';
import cat5 from './imgenescategorias/cat5.png';
import cat6 from './imgenescategorias/cat6.png';
import cat7 from './imgenescategorias/cat7.png';
import cat8 from './imgenescategorias/cat8.png';
import cat9 from './imgenescategorias/cat9.png';
import cat10 from './imgenescategorias/cat10.png';
import cat11 from './imgenescategorias/cat11.png';
import cat12 from './imgenescategorias/cat12.png';

const categorias = [
  { nombre: 'Fresas con crema', imagen: cat1 },
  { nombre: 'Obleas', imagen: cat2 },
  { nombre: 'Cupcakes', imagen: cat3 },
  { nombre: 'Postres', imagen: cat4 },
  { nombre: 'Pasteles', imagen: cat5 },
  { nombre: 'Arroz con leche', imagen: cat6 },
  { nombre: 'Fresas con crema', imagen: cat7 },
  { nombre: 'Obleas', imagen: cat8 },
  { nombre: 'Cupcakes', imagen: cat9 },
  { nombre: 'Postres', imagen: cat10 },
  { nombre: 'Pasteles', imagen: cat11 },
  { nombre: 'Arroz con leche', imagen: cat12 },
];

function CategoriasSlider() {
  const allCategorias = [...categorias, ...categorias];

  return (
    <div className="categorias-contenedor">
      <h2 className="categorias-titulo">Categorías</h2>
      <div className="categorias-slider-wrapper">
        <div className="categorias-slider animacion-infinita">
          {allCategorias.map((cat, index) => (
            <div className="categoria-item" key={index}>
              <img src={cat.imagen} alt={cat.nombre} className="categoria-imagen" />
              <span className={`categoria-nombre color-${index % 3}`}>{cat.nombre}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoriasSlider;
