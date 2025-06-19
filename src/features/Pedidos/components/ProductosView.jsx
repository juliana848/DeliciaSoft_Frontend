import React, { useState, useContext  } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from "../../Cartas/pages/CartContext";





const ProductosView = ({ onProductoSeleccionado, onSiguiente, productosSeleccionados = [], onActualizarCantidad, onEliminarProducto }) => {
  const [categoriaActiva, setCategoriaActiva] = useState('donas');
  const [modalDetalle, setModalDetalle] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false); // Nueva alerta para autenticación
  
  
  const navigate = useNavigate();
  const { carrito } = useContext(CartContext);

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
        imagen: 'https://7diasdesabor.com/wp-content/uploads/2024/08/WEB-POSTRE-1-1536x827.png',
        precio: 12000,
        descripcion: 'Deliciosas fresas frescas con crema batida y azúcar',
        categoria: 'fresas'
      },
      {
        id: 'f2',
        nombre: 'Fresas con Crema Premium',
        imagen: 'https://animalgourmet.com/wp-content/uploads/2024/03/Crema-para-fresas-con-crema1-jpg.webp',
        precio: 18000,
        descripcion: 'Fresas premium con crema de vainilla y toppings especiales',
        categoria: 'fresas'
      }
    ],
    donas: [
      {
        id: 'd1',
        nombre: 'Mini donas x4',
        imagen: 'https://i.pinimg.com/736x/57/4c/b7/574cb74e69958defd5b2fae7f70f23af.jpg',
        precio: 15000,
        descripcion: 'Pack de 4 mini donas con glaseado variado',
        categoria: 'donas'
      },
      {
        id: 'd2',
        nombre: 'Mini donas x9',
        imagen: 'https://i.pinimg.com/736x/ae/ee/df/aeeedf00b249fe03600d30ad8ed69bfa.jpg',
        precio: 25000,
        descripcion: 'Pack de 9 mini donas con diferentes sabores y coberturas',
        categoria: 'donas'
      },
      {
        id: 'd3',
        nombre: 'Mini donas x15',
        imagen: 'https://i.pinimg.com/736x/de/bd/b8/debdb8444b386c8155246d2366da04ea.jpg',
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
        imagen: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit:crop',
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
        imagen: 'https://i.pinimg.com/736x/7f/ee/25/7fee254ebbc03272b2f38ca2473f575f.jpg',
        precio: 6500,
        descripcion: 'Rico cupcake de chocolate con ganache',
        categoria: 'cupcakes'
      }
    ],
    arroz: [
      {
        id: 'a1',
        nombre: 'Arroz con Leche Tradicional',
        imagen: 'https://i.pinimg.com/736x/39/5d/d8/395dd87946906f0570ef9e2d104e859f.jpg',
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
        imagen: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&h=200&fit:crop',
        precio: 11000,
        descripcion: 'Sandwich vegetariano con queso y verduras frescas',
        categoria: 'sanduches'
      }
    ],
    tortas: [
      {
        id: 't1',
        nombre: 'Torta de Chocolate',
        imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit:crop',
        precio: 35000,
        descripcion: 'Deliciosa torta de chocolate para 8 personas',
        categoria: 'tortas'
      },
      {
        id: 't2',
        nombre: 'Torta de Vainilla',
        imagen: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=300&h=200&fit:crop',
        precio: 32000,
        descripcion: 'Suave torta de vainilla con decoración especial',
        categoria: 'tortas'
      }
    ]
  };

  // Función para verificar si el usuario está autenticado
  const isUserAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    return !!token; // Devuelve true si hay token, false si no
  };

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const seleccionarProducto = (producto) => {
    const yaSeleccionado = productosSeleccionados.find(p => p.id === producto.id);
    
    if (!yaSeleccionado) {
      const productoConCantidad = { ...producto, cantidad: 1 };
      onProductoSeleccionado(productoConCantidad);
      showCustomAlert('success', `${producto.nombre} ha sido agregado al pedido!`);
    }
  };

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      onEliminarProducto(productoId);
      showCustomAlert('error', `Producto eliminado del pedido.`);
    } else {
      onActualizarCantidad(productoId, nuevaCantidad);
      showCustomAlert('success', `Cantidad actualizada para el producto.`);
    }
  };

  const eliminarProducto = (productoId) => {
    onEliminarProducto(productoId);
    showCustomAlert('error', `Producto eliminado del pedido.`);
  };

  const abrirModal = (producto) => {
    setModalDetalle(producto);
  };

  const cerrarModal = () => {
    setModalDetalle(null);
  };

  // Función modificada para verificar autenticación antes de continuar
  const continuar = () => {
    if (productosSeleccionados.length > 0) {
      // Verificar si el usuario está autenticado
      if (!isUserAuthenticated()) {
        setShowAuthAlert(true); // Mostrar alerta de autenticación
        return;
      }
      setShowConfirmation(true); // Mostrar confirmación si está autenticado
    } else {
      showCustomAlert('error', 'Por favor selecciona al menos un producto antes de continuar');
    }
  };

  const handleConfirmContinue = () => {
    setShowConfirmation(false);
    onSiguiente();
  };

  const handleCancelContinue = () => {
    setShowConfirmation(false);
  };

  // Función para manejar el ir al login
  const handleGoToLogin = () => {
    setShowAuthAlert(false);
    navigate('/iniciar-sesion');
  };

  // Función para cancelar el ir al login
  const handleCancelLogin = () => {
    setShowAuthAlert(false);
  };

  const calcularTotal = () => {
    return productosSeleccionados.reduce((total, producto) => 
      total + (producto.precio * producto.cantidad), 0
    );
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      {/* Custom Alert */}
      {showAlert.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2000,
            padding: '1rem 1.5rem',
            borderRadius: '15px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem',
            minWidth: '300px',
            background:
              showAlert.type === 'success'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #ec4899, #be185d)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            animation: 'slideInRight 0.5s ease-out'
          }}
        >
          {showAlert.message}
        </div>
      )}

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

          {categoriaActiva === 'fresas' && (
  <div style={{ textAlign: 'center', marginBottom: '40px' }}>
    <button
      onClick={() => navigate('/detalle-fresas')}
      style={{
        backgroundColor: '#ff6b9d',
        color: 'white',
        fontWeight: 'bold',
        padding: '12px 20px',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}
    >
      Ver más fresas →
    </button>
  </div>
)}

          
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
                    ${producto.precio.toLocaleString()}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => actualizarCantidad(producto.id, producto.cantidad - 1)}
                    style={{
                      padding: '5px 10px',
                      border: 'none',
                      borderRadius: '5px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{producto.cantidad}</span>
                  <button
                    onClick={() => actualizarCantidad(producto.id, producto.cantidad + 1)}
                    style={{
                      padding: '5px 10px',
                      border: 'none',
                      borderRadius: '5px',
                      backgroundColor: '#2ecc71',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                  <button
                    onClick={() => eliminarProducto(producto.id)}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Eliminar
                  </button>
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

      {/* Confirmation Dialog */}
      {showConfirmation && (
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
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#2c3e50',
              marginBottom: '20px'
            }}>
              ¿Estás seguro que seleccionaste todo lo que deseas?
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <button
                onClick={handleCancelContinue}
                style={{
                  padding: '12px 25px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  transition: 'background-color 0.3s ease'
                }}
              >
                No, volver
              </button>
              <button
                onClick={handleConfirmContinue}
                style={{
                  padding: '12px 25px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  transition: 'background-color 0.3s ease'
                }}
              >
                Sí, continuar
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
      <h2>Mi Pedido</h2>
      {carrito.length === 0 ? (
        <p>Tu pedido está vacío</p>
      ) : (
        <ul>
          {carrito.map((producto) => (
            <li key={producto.id}>
              {producto.nombre} - ${producto.precio} x {producto.cantidad}
            </li>
          ))}
        </ul>
      )}
    </div>

      {/* Alert de Autenticación */}
      {showAuthAlert && (
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
          zIndex: 1002 // Más alto que otros modales
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '450px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              🔒
            </div>
            <h3 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#2c3e50',
              marginBottom: '15px'
            }}>
              ¡Inicia sesión para continuar!
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#7f8c8d',
              marginBottom: '25px',
              lineHeight: '1.5'
            }}>
              Para personalizar tu pedido y continuar con el proceso de compra, necesitas iniciar sesión en tu cuenta.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button
                onClick={handleCancelLogin}
                style={{
                  padding: '12px 25px',
                  border: '2px solid #e74c3c',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  color: '#e74c3c',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGoToLogin}
                style={{
                  padding: '12px 25px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: 'linear-gradient(45deg, #e91e63, #ff6b9d)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(233,30,99,0.3)'
                }}
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosView;