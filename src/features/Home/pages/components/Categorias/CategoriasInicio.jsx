import React, { useState, useEffect } from 'react';
import './CategoriasSlider.css';
import categoriaProductoApiService from '../../../../Admin/services/categoriaProductosService';

function CategoriasInicio() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar categorías desde la API
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        setLoading(true);
        const categoriasData = await categoriaProductoApiService.obtenerCategoriasActivas();
        
        if (categoriasData && categoriasData.length > 0) {
          // Mapear los datos de la API al formato esperado
          const categoriasMapeadas = categoriasData.map(cat => ({
            nombre: cat.nombrecategoria,
            imagen: cat.imagen || '/imagenes/default-category.png' // Imagen por defecto si no tiene
          }));
          setCategorias(categoriasMapeadas);
        } else {
          // Fallback a categorías estáticas si no hay datos en la API
          setCategorias([
            { nombre: 'Fresas con crema', imagen: '/imagenes/categorias/Cat1.png' },
            { nombre: 'Obleas', imagen: '/imagenes/categorias/Cat2.png' },
            { nombre: 'Cupcakes', imagen: '/imagenes/categorias/Cat3.png' },
            { nombre: 'Postres', imagen: '/imagenes/categorias/Cat4.png' },
            { nombre: 'Pasteles', imagen: '/imagenes/categorias/Cat5.png' },
            { nombre: 'Arroz con leche', imagen: '/imagenes/categorias/Cat6.png' },
          ]);
        }
        setError(null);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        setError('Error al cargar categorías');
        // Fallback a categorías estáticas en caso de error
        setCategorias([
          { nombre: 'Fresas con crema', imagen: '/imagenes/categorias/Cat1.png' },
          { nombre: 'Obleas', imagen: '/imagenes/categorias/Cat2.png' },
          { nombre: 'Cupcakes', imagen: '/imagenes/categorias/Cat3.png' },
          { nombre: 'Postres', imagen: '/imagenes/categorias/Cat4.png' },
          { nombre: 'Pasteles', imagen: '/imagenes/categorias/Cat5.png' },
          { nombre: 'Arroz con leche', imagen: '/imagenes/categorias/Cat6.png' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    cargarCategorias();
  }, []);

  if (loading) {
    return (
      <div className="categorias-contenedor">
        <h2 className="categorias-titulo">Destacados</h2>
        <div className="categorias-slider-wrapper">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Cargando categorías...
          </div>
        </div>
      </div>
    );
  }

  if (error && categorias.length === 0) {
    return (
      <div className="categorias-contenedor">
        <h2 className="categorias-titulo">Destacados</h2>
        <div className="categorias-slider-wrapper">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Error al cargar categorías
          </div>
        </div>
      </div>
    );
  }

  // Duplicar categorías para el efecto de animación infinita
  const allCategorias = [...categorias, ...categorias];

  return (
    <div className="categorias-contenedor">
      <h2 className="categorias-titulo">Destacados</h2>
      <div className="categorias-slider-wrapper">
        <div className="categorias-slider animacion-infinita">
          {allCategorias.map((cat, index) => (
            <div className="categoria-item" key={index}>
              <img 
                src={cat.imagen} 
                alt={cat.nombre} 
                className="categoria-imagen"
                onError={(e) => {
                  console.error('Error al cargar imagen de categoría:', cat.imagen);
                  e.target.src = '/imagenes/default-category.png'; // Imagen de fallback
                }}
              />
              <span className={`categoria-nombre color-${index % 3}`}>{cat.nombre}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoriasInicio;