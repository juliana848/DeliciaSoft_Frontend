import React, { useState, useEffect } from 'react';
import './Cotizacion.css';
import { Link } from 'react-router-dom';
import imagenesApiService from '../../../../Admin/services/imagenesService';

function Cotizacion() {
  const [imagenLateral, setImagenLateral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar imagen de cotización desde la API
  useEffect(() => {
    const cargarImagenCotizacion = async () => {
      try {
        setLoading(true);
        const imagenData = await imagenesApiService.obtenerImagenCotizacion();
        
        if (imagenData && imagenData.urlimg) {
          setImagenLateral(imagenData.urlimg);
        } else {
          // Fallback a imagen local si no se encuentra en la API
          setImagenLateral('https://res.cloudinary.com/dagnilue0/image/upload/v1757303017/imagen_2025-09-07_224334210_xko0uu.png');
        }
        setError(null);
      } catch (error) {
        console.error('Error al cargar imagen de cotización:', error);
        setError('Error al cargar imagen');
        // Fallback a imagen por defecto en caso de error
        setImagenLateral('https://res.cloudinary.com/dagnilue0/image/upload/v1757303017/imagen_2025-09-07_224334210_xko0uu.png');
      } finally {
        setLoading(false);
      }
    };

    cargarImagenCotizacion();
  }, []);

  return (
    <div className="cotizacion-container">
      <div className="imagen-lateral">
        {loading ? (
          <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
            <span>Cargando imagen...</span>
          </div>
        ) : imagenLateral ? (
          <img 
            src={imagenLateral} 
            alt="Imagen lateral"
            onError={(e) => {
              console.error('Error al cargar imagen lateral:', imagenLateral);
              e.target.src = '/imagenes/Cotizacion/Cotizacion1.png'; // Imagen de fallback local
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
            <span>Imagen no disponible</span>
          </div>
        )}
      </div>
      <div className="contenido-cotizacion">
        <h2 className="titulo-cotizacion">Solicita Pedidos</h2>
        <div className="secciones">
          <div className="seccion">
            <div className="numero">1</div>
            <div className="mini-titulo">Toma una decisión</div>
            <div className="texto">
              Selecciona algún delicioso postre de tu preferencia!
            </div>
          </div>
          <div className="seccion">
            <div className="numero">2</div>
            <div className="mini-titulo">Selecciona toppings</div>
            <div className="texto">
              Elije agregados deliciosos a tus postres para darle ese toque.
              <Link to="/pedidos">
                <button className="btn-cotizar">Pedido Ahora</button>
              </Link>
            </div>
          </div>
          <div className="seccion">
            <div className="numero">3</div>
            <div className="mini-titulo">Finaliza Fácilmente</div>
            <div className="texto">
              finaliza tu pedido con seguridad, ya está en camino!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cotizacion;