import React, { useState, useEffect } from 'react';
import './NuestroSecreto.css';
import { Link } from 'react-router-dom';
import imagenesApiService from '../../../../Admin/services/imagenesService';

function NuestroSecreto() {
  const [secretoImg, setSecretoImg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar imagen del secreto desde la API
  useEffect(() => {
    const cargarImagenSecreto = async () => {
      try {
        setLoading(true);
        const imagenData = await imagenesApiService.obtenerImagenSecreto();
        
        if (imagenData && imagenData.urlimg) {
          setSecretoImg(imagenData.urlimg);
        } else {
          // Fallback a imagen por defecto si no se encuentra
          setSecretoImg('https://res.cloudinary.com/dagnilue0/image/upload/v1757345090/Secreto1_za8qxe.png');
        }
        setError(null);
      } catch (error) {
        console.error('Error al cargar imagen del secreto:', error);
        setError('Error al cargar imagen');
        // Fallback a imagen por defecto en caso de error
        setSecretoImg('https://res.cloudinary.com/dagnilue0/image/upload/v1757345090/Secreto1_za8qxe.png');
      } finally {
        setLoading(false);
      }
    };

    cargarImagenSecreto();
  }, []);

  return (
    <section className="secreto-contenedor">
      <div className="secreto-texto">
        <h2 className="secreto-titulo">Nuestro secreto</h2>
        <p className="secreto-descripcion">
          Usamos ingredientes seleccionados, pasión en cada receta y una pizca de magia para hacer que cada bocado sea inolvidable. 
          Nuestra calidad no es negociable, y cada producto está hecho con amor.
        </p>
        <Link to="/cartas">
          <button className="secreto-boton">Ir a productos</button>
        </Link>
      </div>
      <div className="secreto-imagen">
        {loading ? (
          <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
            <span>Cargando imagen...</span>
          </div>
        ) : secretoImg ? (
          <img 
            src={secretoImg} 
            alt="Nuestro secreto" 
            className="secreto-img"
            onError={(e) => {
              console.error('Error al cargar imagen del secreto:', secretoImg);
              e.target.src = '/imagenes/Secreto/Secreto1.png'; // Imagen de fallback local
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
            <span>Imagen no disponible</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default NuestroSecreto;