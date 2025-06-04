import React from 'react';
import './NuestroSecreto.css';
import secretoImg from './ImagenesSecreto/secreto1.png'; 
<link href="https://fonts.googleapis.com/css2?family=Fredoka&display=swap" rel="stylesheet" />

function NuestroSecreto() {
  return (
    <section className="secreto-contenedor">
      <div className="secreto-texto">
        <h2 className="secreto-titulo">Nuestro secreto</h2>
        <p className="secreto-descripcion">
          Usamos ingredientes seleccionados, pasión en cada receta y una pizca de magia para hacer que cada bocado sea inolvidable. 
          Nuestra calidad no es negociable, y cada producto está hecho con amor.
        </p>
        <button className="secreto-boton">Ir a productos</button>
      </div>
      <div className="secreto-imagen">
        <img src={secretoImg} alt="Nuestro secreto" className="secreto-img" />
      </div>
    </section>
  );
}

export default NuestroSecreto;
