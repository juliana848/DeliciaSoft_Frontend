import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../../Cartas/pages/CartContext';
import productoApiService from '../../../Admin/services/productos_services.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ProductosDestacados.css';

const ProductosDestacados = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { agregarProductoSeleccionado } = useContext(CartContext);

  useEffect(() => {
    cargarProductosDestacados();
  }, []);

  const cargarProductosDestacados = async () => {
    try {
      console.log('Cargando productos destacados...');
      setLoading(true);
      setError(null);
      
      const productosDestacados = await productoApiService.obtenerProductosMasVendidos(6);
      console.log('Productos destacados obtenidos:', productosDestacados);
      
      setProductos(productosDestacados);
    } catch (error) {
      console.error('Error al cargar productos destacados:', error);
      setError('No se pudieron cargar los productos destacados');
    } finally {
      setLoading(false);
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio || 0);
  };

  const handleAgregarCarrito = (producto, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const productoConCantidad = { ...producto, cantidad: 1 };
    agregarProductoSeleccionado(productoConCantidad);
    
    // Feedback visual mejorado
    const button = e.currentTarget;
    const originalContent = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-check"></i> ¡Agregado!';
    button.classList.add('btn-success');
    button.disabled = true;
    
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.classList.remove('btn-success');
      button.disabled = false;
    }, 2500);

    // Navegar a pedidos después de agregar
    setTimeout(() => {
      navigate('/pedidos');
    }, 1000);
  };

  const handleVerTodos = () => {
    navigate('/cartas');
  };

  const obtenerImagenProducto = (producto) => {
    if (producto.urlimagen && producto.urlimagen.trim()) {
      return producto.urlimagen;
    }
    
    const nombreLower = producto.nombre?.toLowerCase() || producto.nombreproducto?.toLowerCase() || '';
    
    if (nombreLower.includes('torta') || nombreLower.includes('cake')) {
      return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=350&fit=crop&crop=center&auto=format&q=80";
    } else if (nombreLower.includes('cupcake') || nombreLower.includes('muffin')) {
      return "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500&h=350&fit=crop&crop=center&auto=format&q=80";
    } else if (nombreLower.includes('galleta') || nombreLower.includes('cookie')) {
      return "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&h=350&fit=crop&crop=center&auto=format&q=80";
    } else if (nombreLower.includes('cheesecake')) {
      return "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&h=350&fit=crop&crop=center&auto=format&q=80";
    } else if (nombreLower.includes('macaron')) {
      return "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500&h=350&fit=crop&crop=center&auto=format&q=80";
    } else {
      return "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=500&h=350&fit=crop&crop=center&auto=format&q=80";
    }
  };

  const obtenerDescripcionProducto = (producto) => {
    if (producto.especificaciones && producto.especificaciones.trim()) {
      return producto.especificaciones;
    }
    
    if (producto.descripcion && producto.descripcion.trim()) {
      return producto.descripcion;
    }
    
    if (producto.especificacionesreceta && producto.especificacionesreceta.trim()) {
      return producto.especificacionesreceta;
    }
    
    const nombreLower = producto.nombre?.toLowerCase() || producto.nombreproducto?.toLowerCase() || '';
    
    if (nombreLower.includes('torta') || nombreLower.includes('cake')) {
      return "Deliciosa torta hecha con los mejores ingredientes y mucho amor";
    } else if (nombreLower.includes('cupcake') || nombreLower.includes('muffin')) {
      return "Cupcakes esponjosos con decoración artesanal personalizada";
    } else if (nombreLower.includes('galleta') || nombreLower.includes('cookie')) {
      return "Galletas artesanales crujientes con glaseado real";
    } else if (nombreLower.includes('cheesecake')) {
      return "Cremoso cheesecake con base de galleta crujiente";
    } else if (nombreLower.includes('macaron')) {
      return "Macarons franceses de colores vibrantes y sabores únicos";
    } else {
      return "Producto artesanal elaborado con amor en Delicias Darsy";
    }
  };

  if (loading) {
    return (
      <section className="productos-destacados-section py-5">
        <div className="container">
          {/* Header de carga */}
          <div className="section-header text-center mb-5">
            <h2 className="section-title display-4 fw-bold mb-3">
              Nuestros Productos Destacados
              <div className="underline-gradient mx-auto"></div>
            </h2>
            <p className="lead text-muted d-flex align-items-center justify-content-center gap-2">
               <i class="fa-solid fa-arrows-rotate" style={{animation: 'spin 1s linear infinite'}}></i>
              Cargando deliciosos productos...
            </p>
          </div>
          
          {/* Grid de loading */}
          <div className="row g-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="col-lg-4 col-md-6">
                <div className="card h-100 loading-card shadow-sm">
                  <div className="loading-image-placeholder"></div>
                  <div className="card-body text-center">
                    <div className="loading-line mb-3"></div>
                    <div className="loading-line-short mb-3"></div>
                    <div className="loading-price mb-3"></div>
                    <div className="loading-line-short"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="productos-destacados-section py-5">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="section-title display-4 fw-bold mb-3">
              Nuestros Productos Destacados
              <div className="underline-gradient mx-auto"></div>
            </h2>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="error-container text-center">
                <i className="fas fa-exclamation-triangle text-danger mb-3" style={{fontSize: '4rem'}}></i>
                <h4 className="text-danger mb-3">¡Ups! Algo salió mal</h4>
                <p className="text-muted mb-4">{error}</p>
                <button 
                  onClick={cargarProductosDestacados}
                  className="btn btn-ver-todos-modern"
                >
                  <i className="fas fa-sync-alt"></i>
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="productos-destacados-section py-5">
      <div className="container">
        {/* Header mejorado */}
        <div className="section-header text-center mb-5">
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              textAlign: "center",
              color: "#2C3E50",
              position: "relative",
              display: "inline-block",
              marginBottom: "1rem",
            }}
          >
            Productos Destacados
            <span
              style={{
                display: "block",
                width: "80px",
                height: "4px",
                background: "linear-gradient(90deg, #FF1493, #FFCC00)",
                borderRadius: "2px",
                margin: "0.5rem auto 0 auto",
              }}
            ></span>
          </h2>
          <p className="lead text-muted d-flex align-items-center justify-content-center gap-2">
            <i className="fas fa-star text-warning"></i>
            Deliciosas creaciones hechas con amor y los mejores ingredientes
            <i className="fas fa-star text-warning"></i>
          </p>
        </div>

        {/* Grid de productos mejorado */}
        <div className="row g-4 mb-5">
          {productos.slice(0, 6).map((producto, index) => (
            <div key={producto.id || producto.idproductogeneral || index} className="col-lg-4 col-md-6">
              <div className="card product-card h-100 shadow-sm">
                {/* Contenedor de imagen mejorado */}
                <div className="product-image-container">
                  <img 
                    src={obtenerImagenProducto(producto)} 
                    className="product-image"
                    alt={producto.nombre || producto.nombreproducto}
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=500&h=350&fit=crop&crop=center&auto=format&q=80";
                    }}
                  />
                  <div className="product-image-overlay"></div>
                  
                  {/* Badge de destacado */}
                  <div className="producto-destacado-badge">
                    <i className="fas fa-trending-up" style={{fontSize: '14px'}}></i>
                    Destacado
                  </div>
                </div>
                
                {/* Cuerpo de la card mejorado - ESTRUCTURA CENTRADA */}
                <div className="card-body product-card-body">
                  {/* Título centrado */}
                  <h5 className="product-title fw-bold mb-3">
                    <i className="fas fa-birthday-cake text-warning" style={{fontSize: '18px'}}></i>
                    {producto.nombre || producto.nombreproducto}
                  </h5>
                  
                  {/* Descripción centrada */}
                  <p className="product-description text-muted mb-4">
                    {obtenerDescripcionProducto(producto)}
                  </p>
                  
                  {/* Contenedor de precio y botón - ESTRUCTURA CENTRADA */}
                  <div className="d-flex justify-content-between align-items-center">
                    {/* Contenedor de precio centrado */}
                    <div className="d-flex align-items-center gap-2">
                      <i className="fas fa-dollar-sign text-success" style={{fontSize: '18px'}}></i>
                      <div className="product-price fw-bold">
                        {formatearPrecio(producto.precio || producto.precioproducto)}
                      </div>
                    </div>
                    
                    {/* Botón centrado */}
                    <button 
                      className="btn btn-pedir-modern"
                      onClick={(e) => handleAgregarCarrito(producto, e)}
                      type="button"
                    >
                      <i className="fas fa-shopping-cart"></i>
                      Pedir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estado vacío mejorado */}
        {productos.length === 0 && !loading && !error && (
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="empty-state text-center">
                <i className="fas fa-box-open text-info mb-3" style={{fontSize: '4rem'}}></i>
                <h4 className="text-info mb-3">No hay productos destacados</h4>
                <p className="text-muted mb-4">
                  No hay productos destacados disponibles en este momento, pero tenemos muchas otras delicias esperándote.
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <button 
                    onClick={cargarProductosDestacados}
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                    type="button"
                  >
                    <i className="fas fa-sync-alt"></i>
                    Recargar
                  </button>
                  <button 
                    onClick={handleVerTodos}
                    className="btn btn-ver-todos-modern"
                    type="button"
                  >
                    <i className="fas fa-utensils"></i>
                    Ver Carta Completa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductosDestacados;