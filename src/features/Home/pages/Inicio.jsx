import React from 'react';
import CarouselInicio from './components/carousel/CarouselInicio';
import CategoriasInicio  from './components/Categorias/CategoriasInicio';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Cotizacion  from './components/Cotizacion/Cotizacion';
import Secreto  from './components/Secreto/NuestroSecreto';

function Inicio() { 
    const botonProductosStyle = {
    position: 'absolute',
    bottom: '180px',
    right: '70px',
    backgroundColor: '#FC0278',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '25px',
    outline: 'none',
  };
  return (
    <div>
        <CarouselInicio buttonStyle={botonProductosStyle} />
        <CategoriasInicio />
        <Cotizacion /> 
        <Secreto />
    </div>
  );
}

export default Inicio;