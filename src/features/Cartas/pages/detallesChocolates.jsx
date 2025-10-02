import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";

const ProductoDetalle = () => {
  const navigate = useNavigate();
  const { agregarProducto } = useContext(CartContext);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch("https://deliciasoft-backend.onrender.com/api/productogeneral", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const json = await res.json();
        console.log("Productos obtenidos:", json);
        
        // Los datos vienen como array directo
        const productosArray = Array.isArray(json) ? json : [json];
        setProductos(productosArray);
        
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  const handleAgregarProducto = (producto) => {
    const productoParaCarrito = {
      id: producto.idproductogeneral,
      nombre: producto.nombreproducto,
      precio: parseInt(producto.precioproducto),
      descripcion: producto.especificacionesreceta || producto.receta?.especificaciones,
      categoria: producto.categoria || producto.categoriaproducto?.nombrecategoria,
      imagen: producto.urlimagen || producto.imagenes?.urlimg,
      cantidad: 1
    };
    
    agregarProducto(productoParaCarrito);
    navigate("/pedidos");
  };

  // Componente de loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-pink-800 mb-2">
              Fresas con Crema 🍓
            </h1>
            <p className="text-gray-600">Selecciona tu presentación favorita</p>
          </div>
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">🍰</div>
            <h3 className="text-xl font-semibold text-pink-800 mb-2">Cargando productos deliciosos...</h3>
            <p className="text-gray-600 text-center max-w-md">Estamos preparando nuestros mejores productos para ti. ¡Un momento por favor!</p>
            <div className="mt-4 flex space-x-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Componente de error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-pink-800 mb-2">
              Nuestros Productos 🍰
            </h1>
            <p className="text-gray-600">Selecciona tu favorito</p>
          </div>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Botón de regresar */}
        <div className="flex justify-start mb-6">
          <button
            onClick={() => navigate('/cartas')}
            className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Volver</span>
          </button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-800 mb-2">
            Nuestros Productos 🍰
          </h1>
          <p className="text-gray-600">
            Selecciona tu favorito
          </p>
        </div>

        {productos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((producto) => (
              <div
                key={producto.idproductogeneral}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {/* Imagen del producto */}
                <div className="relative h-64 bg-gray-200 overflow-hidden">
                  {(producto.urlimagen || producto.imagenes?.urlimg) ? (
                    <img
                      src={producto.urlimagen || producto.imagenes.urlimg}
                      alt={producto.nombreproducto}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log("Error cargando imagen:", e.target.src);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback si no hay imagen */}
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200" style={{display: (producto.urlimagen || producto.imagenes?.urlimg) ? 'none' : 'flex'}}>
                    <span className="text-4xl">
                      {producto.categoria === 'Postres' ? '🍰' : 
                       producto.categoria === 'Pasteles' ? '🎂' : 
                       producto.categoria === 'Fresas Con Crema' ? '🍓' : '🍽️'}
                    </span>
                  </div>
                </div>

                {/* Contenido de la card */}
                <div className="p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {producto.nombreproducto}
                    </h3>
                    
                    <p className="text-2xl font-bold text-pink-600 mb-2">
                      ${parseInt(producto.precioproducto).toLocaleString()}
                    </p>
                    
                    {(producto.especificacionesreceta || producto.receta?.especificaciones) && (
                      <p className="text-gray-600 text-sm mb-3">
                        {producto.especificacionesreceta || producto.receta.especificaciones}
                      </p>
                    )}
                    
                    {producto.categoria && (
                      <span className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full mb-4">
                        {producto.categoria}
                      </span>
                    )}
                  </div>

                  {/* Botón Agregar al Pedido */}
                  <button
                    onClick={() => handleAgregarProducto(producto)}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <span>🛒</span>
                    <span>Añadir al Pedido</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Info de productos cargados */}
        <div className="mt-8 text-center text-gray-600">
          <p>Total de productos: {productos.length}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;