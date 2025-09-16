import React from 'react';
import HeroSection from './components/hero/HeroSection';
import ProductosDestacados from './components/productos/ProductosDestacados';
import ComoPedido from './components/pedido/ComoPedido';
import PorQueElegir from './components/elegir/PorQueElegir';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function Inicio() {
  return (
    <div>
      <HeroSection />
      <ProductosDestacados />
      <ComoPedido />
      <PorQueElegir />
    </div>
  );
}

export default Inicio;