import React, { useState } from 'react';

const ProductosView = ({ onProductoSeleccionado, onSiguiente, productosSeleccionados = [] }) => {
  const [categoriaActiva, setCategoriaActiva] = useState('donas');
  const [modalDetalle, setModalDetalle] = useState(null);

  const categorias = [
    { id: 'fresas', nombre: 'Fresas con Crema', icon: '🍓' },
    { id: 'donas', nombre: 'Donas', icon: '🍩' },
    { id: 'postres', nombre: 'Postres', icon: '🍮' },
    { id: 'cupcakes', nombre: 'Cupcakes', icon: '🧁' },
    { id: 'arroz', nombre: 'Arroz con Leche', icon: '🍚' },
    { id: 'sanduches', nombre: 'Sanduches', icon: '🥪' },
    { id: 'tortas', nombre: 'Tortas', icon: '🎂' }
  ];

  const productos = {
    fresas: [
      {
        id: 'f1',
        nombre: 'Fresas con Crema Clásica',
        imagen: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop',
        precio: 12000,
        descripcion: 'Deliciosas fresas frescas con crema batida y azúcar',
        categoria: 'fresas'
      },
      {
        id: 'f2',
        nombre: 'Fresas con Crema Premium',
        imagen: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=300&h=200&fit=crop',
        precio: 18000,
        descripcion: 'Fresas premium con crema de vainilla y toppings especiales',
        categoria: 'fresas'
      }
    ],
    donas: [
      {
        id: 'd1',
        nombre: 'Mini donas x4',
        imagen: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop',
        precio: 15000,
        descripcion: 'Pack de 4 mini donas con glaseado variado',
        categoria: 'donas'
      },
      {
        id: 'd2',
        nombre: 'Mini donas x9',
        imagen: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=300&h=200&fit=crop',
        precio: 25000,
        descripcion: 'Pack de 9 mini donas con diferentes sabores y coberturas',
        categoria: 'donas'
      },
      {
        id: 'd3',
        nombre: 'Mini donas x15',
        imagen: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=300&h=200&fit=crop',
        precio: 40000,
        descripcion: 'Pack familiar de 15 mini donas surtidas',
        categoria: 'donas'
      }
    ],
    postres: [
      {
        id: 'p1',
        nombre: 'Tiramisu Individual',
        imagen: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=200&fit=crop',
        precio: 8000,
        descripcion: 'Clásico postre italiano con café y mascarpone',
        categoria: 'postres'
      },
      {
        id: 'p2',
        nombre: 'Cheesecake de Fresa',
        imagen: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop',
        precio: 10000,
        descripcion: 'Cremoso cheesecake con topping de fresas naturales',
        categoria: 'postres'
      }
    ],
    cupcakes: [
      {
        id: 'c1',
        nombre: 'Cupcake de Vainilla',
        imagen: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=300&h=200&fit=crop',
        precio: 6000,
        descripcion: 'Suave cupcake de vainilla con buttercream',
        categoria: 'cupcakes'
      },
      {
        id: 'c2',
        nombre: 'Cupcake de Chocolate',
        imagen: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=200&fit=crop',
        precio: 6500,
        descripcion: 'Rico cupcake de chocolate con ganache',
        categoria: 'cupcakes'
      }
    ],
    arroz: [
      {
        id: 'a1',
        nombre: 'Arroz con Leche Tradicional',
        imagen: 'https://images.unsplash.com/photo-1544375354-38609de07ad6?w=300&h=200&fit=crop',
        precio: 5000,
        descripcion: 'Cremoso arroz con leche con canela y pasas',
        categoria: 'arroz'
      }
    ],
    sanduches: [
      {
        id: 's1',
        nombre: 'Sandwich Club',
        imagen: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=300&h=200&fit=crop',
        precio: 14000,
        descripcion: 'Sandwich triple con pollo, tocineta y vegetales',
        categoria: 'sanduches'
      },
      {
        id: 's2',
        nombre: 'Sandwich Veggie',
        imagen: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&h=200&fit=crop',
        precio: 11000,
        descripcion: 'Sandwich vegetariano con queso y verduras frescas',
        categoria: 'sanduches'
      }
    ],
    tortas: [
      {
        id: 't1',
        nombre: 'Torta de Chocolate',
        imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop',
        precio: 35000,
        descripcion: 'Deliciosa torta de chocolate para 8 personas',
        categoria: 'tortas'
      },
      {
        id: 't2',
        nombre: 'Torta de Vainilla',
        imagen: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=300&h=200&fit=crop',
        precio: 32000,
        descripcion: 'Suave torta de vainilla con decoración especial',
        categoria: 'tortas'
      }
    ]
  };

  const seleccionarProducto = (producto) => {
    const yaSeleccionado = productosSeleccionados.find(p => p.id === producto.id);
    
    if (!yaSeleccionado) {
      const productoConCantidad = { ...producto, cantidad: 1 };
      onProductoSeleccionado(productoConCantidad);
    }
  };

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    // Esta función debería ser manejada por el componente padre
    console.log('Actualizar cantidad:', productoId, nuevaCantidad);
  };

  const eliminarProducto = (productoId) => {
    // Esta función debería ser manejada por el componente padre
    console.log('Eliminar producto:', productoId);
  };

  const abrirModal = (producto) => {
    setModalDetalle(producto);
  };

  const cerrarModal = () => {
    setModalDetalle(null);
  };

  const continuar = () => {
    if (productosSeleccionados.length > 0) {
      onSiguiente();
    } else {
      alert('Por favor selecciona al menos un producto antes de continuar');
    }
  };

  const calcularTotal = () => {
    return productosSeleccionados.reduce((total, producto) => 
      total + (producto.precio * producto.cantidad), 0
    );
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      {/* Header con título */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#2c3e50',
          marginBottom: '10px',
          background: 'linear-gradient(45deg, #e91e63, #ff6b9d)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Selección de Productos
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
          Elige tus productos favoritos
        </p>
      </div>

      {/* Categorías */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {categorias.map(categoria => (
          <button
            key={categoria.id}
            onClick={() => setCategoriaActiva(categoria.id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: categoriaActiva === categoria.id ? '#e91e63' : '#f8f9fa',
              color: categoriaActiva === categoria.id ? 'white' : '#2c3e50',
              boxShadow: categoriaActiva === categoria.id ? '0 4px 15px rgba(233,30,99,0.3)' : 'none',
              transform: categoriaActiva === categoria.id ? 'translateY(-2px)' : 'none'
            }}
          >
            <span style={{ marginRight: '8px' }}>{categoria.icon}</span>
            {categoria.nombre}
          </button>
        ))}
      </div>

      {/* Productos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {productos[categoriaActiva]?.map(producto => {
          const yaSeleccionado = productosSeleccionados.find(p => p.id === producto.id);
          
          return (
            <div
              key={producto.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: yaSeleccionado ? '0 8px 25px rgba(233,30,99,0.2)' : '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: yaSeleccionado ? '2px solid #e91e63' : '2px solid transparent',
                transform: yaSeleccionado ? 'translateY(-5px)' : 'none'
              }}
              onClick={() => seleccionarProducto(producto)}
            >
              <div style={{ 
                height: '200px', 
                backgroundImage: `url(${producto.imagen})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                {yaSeleccionado && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: '#e91e63',
                    color: 'white',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}>
                    ✓
                  </div>
                )}
              </div>
              
              <div style={{ padding: '20px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#2c3e50',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>
                  {producto.nombre}
                </h3>
                
                <p style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: '#e91e63',
                  margin: '0 0 15px 0'
                }}>
                  ${producto.precio.toLocaleString()}
                </p>
                
                <button
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: yaSeleccionado ? '#4caf50' : '#e91e63',
                    color: 'white'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    seleccionarProducto(producto);
                  }}
                >
                  {yaSeleccionado ? 'Seleccionado' : 'Seleccionar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen */}
      {productosSeleccionados.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '25px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#2c3e50',
            marginBottom: '20px',
            margin: '0 0 20px 0'
          }}>
            Resumen de Pedido ({productosSeleccionados.length} productos)
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            {productosSeleccionados.map(producto => (
              <div
                key={producto.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px 0',
                  borderBottom: '1px solid #ecf0f1'
                }}
              >
                <div>
                  <span style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500' }}>
                    {producto.nombre}
                  </span>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px' }}>
                    ${producto.precio.toLocaleString()} x {producto.cantidad}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => abrirModal(producto)}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      backgroundColor: '#3498db',
                      color: 'white',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: '2px solid #ecf0f1'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
              Total: ${calcularTotal().toLocaleString()}
            </div>
            
            <button
              onClick={continuar}
              style={{
                padding: '15px 30px',
                border: 'none',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                background: 'linear-gradient(45deg, #e91e63, #ff6b9d)',
                color: 'white',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(233,30,99,0.3)'
              }}
            >
              Continuar con Personalización →
            </button>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {modalDetalle && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <button
              onClick={cerrarModal}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '40px',
                height: '40px',
                border: 'none',
                borderRadius: '50%',
                fontSize: '20px',
                cursor: 'pointer',
                backgroundColor: '#e74c3c',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
            
            <div style={{
              height: '200px',
              backgroundImage: `url(${modalDetalle.imagen})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '15px',
              marginBottom: '20px'
            }} />
            
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#2c3e50',
              marginBottom: '10px',
              margin: '0 0 10px 0'
            }}>
              {modalDetalle.nombre}
            </h2>
            
            <p style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              color: '#e91e63',
              marginBottom: '15px',
              margin: '0 0 15px 0'
            }}>
              ${modalDetalle.precio.toLocaleString()}
            </p>
            
            <p style={{ 
              fontSize: '16px', 
              color: '#7f8c8d',
              lineHeight: '1.5',
              margin: 0
            }}>
              {modalDetalle.descripcion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosView;