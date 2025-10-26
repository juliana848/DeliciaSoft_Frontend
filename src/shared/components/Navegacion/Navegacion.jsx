import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LogoutButton from '../Layout/LogoutButton/LogoutButton';
import { CartContext } from '../../../features/Cartas/pages/CartContext';
import './navegacion.css';

const Navegacion = ({ isAuthenticated = false }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();
  
  const cartDropdownRef = useRef(null);
  const cartButtonRef = useRef(null);
  
  // Obtener carrito del contexto
  const { carrito, actualizarCantidadCarrito, eliminarDelCarrito } = useContext(CartContext);

  // Obtener datos del usuario
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || 'usuario@email.com');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Usuario');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showCartDropdown &&
        cartDropdownRef.current &&
        !cartDropdownRef.current.contains(event.target) &&
        cartButtonRef.current &&
        !cartButtonRef.current.contains(event.target)
      ) {
        setShowCartDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCartDropdown]);

  // Escuchar cambios en el localStorage para actualizar el estado de autenticación
  useEffect(() => {
    const checkAuthStatus = () => {
      const authToken = localStorage.getItem('authToken');
      const email = localStorage.getItem('userEmail');
      const name = localStorage.getItem('userName');
      
      setIsAuthenticatedState(!!authToken);
      if (email) setUserEmail(email);
      if (name) setUserName(name);
    };

    checkAuthStatus();

    const handleLoginSuccess = (event) => {
      console.log('🎉 Login exitoso detectado en ventana principal');
      checkAuthStatus();
      
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        setTimeout(() => {
          navigate(redirectPath);
          window.location.reload();
        }, 500);
      } else {
        window.location.reload();
      }
    };

    window.addEventListener('storage', checkAuthStatus);
    window.addEventListener('loginSuccess', handleLoginSuccess);

    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('loginSuccess', handleLoginSuccess);
      clearInterval(interval);
    };
  }, [navigate]);

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const toggleCartDropdown = () => {
    setShowCartDropdown(!showCartDropdown);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const abrirLoginNuevaVentana = (e) => {
    e.preventDefault();
    
    // Guardar la URL actual para sincronización
    localStorage.setItem('loginOpenerUrl', window.location.pathname);
    
    // Abrir en nueva pestaña (no ventana emergente)
    const loginTab = window.open('/iniciar-sesion', '_blank');
    
    if (loginTab) {
      // Escuchar cambios en el localStorage para sincronizar
      const handleStorageChange = (event) => {
        if (event.key === 'authToken' && event.newValue) {
          console.log('✅ Login detectado en otra pestaña, sincronizando...');
          
          // Pequeño delay para asegurar que todos los datos estén guardados
          setTimeout(() => {
            const userRole = localStorage.getItem('userRole');
            const redirectPath = localStorage.getItem('redirectAfterLogin');
            
            if (redirectPath) {
              localStorage.removeItem('redirectAfterLogin');
              navigate(redirectPath);
            } else if (userRole === 'admin') {
              navigate('/admin/pages/Dashboard');
            } else {
              navigate('/');
            }
            
            // Recargar para actualizar el estado de autenticación
            window.location.reload();
          }, 500);
          
          // Remover el listener
          window.removeEventListener('storage', handleStorageChange);
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Limpiar el listener después de 5 minutos (por seguridad)
      setTimeout(() => {
        window.removeEventListener('storage', handleStorageChange);
      }, 300000);
    }
  };

  const handleEliminarProducto = (id) => {
    eliminarDelCarrito(id);
  };

  const handleActualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
    } else {
      actualizarCantidadCarrito(id, nuevaCantidad);
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const handleVerMasProductos = () => {
    setShowCartDropdown(false);
    navigate('/pedidos');
  };

  const handleProcederCheckout = () => {
    const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);
    
    console.log('🔵 Checkout desde navbar');
    console.log('🔵 Cantidad total:', cantidadTotal);
    console.log('🔵 Productos:', carrito);
    
    if (cantidadTotal < 10) {
      alert(`⚠️ Necesitas al menos 10 productos para continuar.\nTienes: ${cantidadTotal} productos.`);
      return;
    }

    if (cantidadTotal > 100) {
      alert(`⚠️ Máximo 100 productos permitidos.\nTienes: ${cantidadTotal} productos.`);
      return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('⚠️ Debes iniciar sesión para continuar con tu pedido');
      setShowCartDropdown(false);
      navigate('/iniciar-sesion');
      return;
    }

    localStorage.setItem('carritoParaPersonalizar', JSON.stringify(carrito));
    console.log('✅ Carrito guardado en localStorage');
    
    setShowCartDropdown(false);
    console.log('✅ Navegando a /pedidos/personalizar');
    navigate('/pedidos/personalizar');
  };

  const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);

  return (
    <>
      {/* Bootstrap Icons */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        rel="stylesheet"
      />
      
      <nav className={`cliente-nav-container ${scrolled ? 'scrolled' : ''}`}>
        <div className="cliente-nav-content">
          <Link to="/" className="cliente-nav-logo">
            <img 
              src='/imagenes/logo-delicias-darsy.png' 
              alt="Delicias Darsy" 
            />
          </Link>
          
          <div className="cliente-nav-links">
            <Link to="/" className={`cliente-nav-link ${isActive('/') ? 'active' : ''}`}>
              INICIO
            </Link>
            <Link to="/pedidos" className={`cliente-nav-link ${isActive('/pedidos') ? 'active' : ''}`}>
              PEDIDOS
            </Link>
            <Link to="/sedes" className={`cliente-nav-link ${isActive('/sedes') ? 'active' : ''}`}>
              SEDES
            </Link>
            <Link to="/conocenos" className={`cliente-nav-link ${isActive('/conocenos') ? 'active' : ''}`}>
              CONÓCENOS
            </Link>
            <Link to="/contactenos" className={`cliente-nav-link ${isActive('/contactenos') ? 'active' : ''}`}>
              CONTÁCTENOS
            </Link>
            
            {/* Ícono del Carrito con Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                ref={cartButtonRef}
                onClick={toggleCartDropdown}
                className="cart-icon-link"
                title="Ver Carrito"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                  color: '#111827',
                  transition: 'color 0.3s ease',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ec4899'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#111827'}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="28" 
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {cantidadTotal > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    backgroundColor: '#ec4899',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    animation: 'pulse 0.5s ease-in-out'
                  }}>
                    {cantidadTotal}
                  </span>
                )}
              </button>

              {/* Dropdown del Carrito */}
              {showCartDropdown && (
                <div
                  ref={cartDropdownRef}
                  style={{
                    position: 'absolute',
                    top: '60px',
                    right: '0',
                    width: '400px',
                    maxHeight: '500px',
                    backgroundColor: 'white',
                    borderRadius: '15px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    border: '2px solid #f0f2f5',
                    animation: 'slideDown 0.3s ease forwards'
                  }}
                >
                  <div style={{
                    padding: '20px',
                    borderBottom: '2px solid #f0f2f5'
                  }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#495057'
                    }}>
                      🛒 Mi Carrito ({carrito.length})
                    </h3>
                  </div>

                  {carrito.length === 0 ? (
                    <div style={{
                      padding: '40px 20px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '60px', marginBottom: '15px' }}>🛒</div>
                      <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                        Tu carrito está vacío
                      </p>
                      <button
                        onClick={handleVerMasProductos}
                        style={{
                          padding: '10px 20px',
                          border: 'none',
                          borderRadius: '10px',
                          background: 'linear-gradient(45deg, #e91e63, #f06292)',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Ver Productos
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                        padding: '15px'
                      }}>
                        {carrito.map((producto) => (
                          <div
                            key={producto.id}
                            style={{
                              display: 'flex',
                              gap: '12px',
                              padding: '12px',
                              marginBottom: '10px',
                              background: '#f8f9fa',
                              borderRadius: '10px',
                              alignItems: 'center'
                            }}
                          >
                            <div style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              flexShrink: 0,
                              backgroundImage: `url(${producto.imagen})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }} />

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{
                                margin: '0 0 5px 0',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#343a40',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {producto.nombre}
                              </h4>
                              <p style={{
                                margin: '0 0 8px 0',
                                fontSize: '13px',
                                color: '#e91e63',
                                fontWeight: '600'
                              }}>
                                ${producto.precio.toLocaleString()}
                              </p>

                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <button
                                  onClick={() => handleActualizarCantidad(producto.id, producto.cantidad - 1)}
                                  style={{
                                    width: '25px',
                                    height: '25px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    background: '#dc3545',
                                    color: 'white',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  -
                                </button>
                                <span style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  minWidth: '25px',
                                  textAlign: 'center'
                                }}>
                                  {producto.cantidad}
                                </span>
                                <button
                                  onClick={() => handleActualizarCantidad(producto.id, producto.cantidad + 1)}
                                  style={{
                                    width: '25px',
                                    height: '25px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    background: '#28a745',
                                    color: 'white',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => handleEliminarProducto(producto.id)}
                                  style={{
                                    marginLeft: 'auto',
                                    background: 'none',
                                    border: 'none',
                                    color: '#dc3545',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    padding: '0',
                                    width: '25px',
                                    height: '25px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  title="Eliminar"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{
                        padding: '15px 20px',
                        borderTop: '2px solid #f0f2f5'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '15px',
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#495057'
                        }}>
                          <span>Total:</span>
                          <span style={{ color: '#e91e63' }}>
                            ${calcularTotal().toLocaleString()}
                          </span>
                        </div>

                        <div style={{
                          display: 'flex',
                          gap: '10px'
                        }}>
                          <button
                            onClick={handleVerMasProductos}
                            style={{
                              flex: 1,
                              padding: '10px',
                              border: '2px solid #e91e63',
                              borderRadius: '10px',
                              background: 'white',
                              color: '#e91e63',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Ver Más Productos
                          </button>
                          <button
                            onClick={handleProcederCheckout}
                            style={{
                              flex: 1,
                              padding: '10px',
                              border: 'none',
                              borderRadius: '10px',
                              background: 'linear-gradient(45deg, #e91e63, #f06292)',
                              color: 'white',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(233,30,99,0.3)'
                            }}
                          >
                            🛍️ Comprar
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {isAuthenticatedState ? (
              <div className="user-menu-container" style={{ position: 'relative' }}>
                <button 
                  className="user-avatar-btn"
                  onClick={toggleUserMenu}
                  title={`Perfil de ${userName}`}
                >
                  <i className="bi bi-person-circle"></i>
                </button>
                
                {showUserMenu && (
                  <div className="user-dropdown-menu">
                    <div style={{
                      padding: '0.5rem 0',
                      borderBottom: '1px solid #e9ecef',
                      marginBottom: '0.5rem'
                    }}>
                      <p style={{
                        margin: 0,
                        fontWeight: 'bold',
                        color: '#333',
                        fontSize: '14px'
                      }}>
                        {userName}
                      </p>
                      <p style={{
                        margin: 0,
                        color: '#666',
                        fontSize: '12px'
                      }}>
                        {userEmail}
                      </p>
                    </div>
                    
                    <Link 
                      to="/perfil" 
                      className="user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      👤 Mi Perfil
                    </Link>
                    
                    <div style={{
                      borderTop: '1px solid #e9ecef',
                      paddingTop: '0.5rem'
                    }}>
                      <LogoutButton className="logout-dropdown-btn" isDropdown={true} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={abrirLoginNuevaVentana}
                className="cliente-nav-button"
                style={{ cursor: 'pointer' }}
              >
                INICIAR SESIÓN
              </button>
            )}
          </div>
          
          <button onClick={toggleMenu} className="cliente-nav-mobile-button">
            <i className="bi bi-list" style={{ fontSize: '24px' }}></i>
          </button>
        </div>
        
        <div className={`cliente-nav-mobile-menu ${menuAbierto ? 'visible' : ''}`}>
          <Link to="/" className={`cliente-nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuAbierto(false)}>
            INICIO
          </Link>

          <Link to="/pedidos" className={`cliente-nav-link ${isActive('/pedidos') ? 'active' : ''}`} onClick={() => setMenuAbierto(false)}>
            PEDIDOS
          </Link>
          <Link to="/sedes" className={`cliente-nav-link ${isActive('/sedes') ? 'active' : ''}`} onClick={() => setMenuAbierto(false)}>
            SEDES
          </Link>
          <Link to="/conocenos" className={`cliente-nav-link ${isActive('/conocenos') ? 'active' : ''}`} onClick={() => setMenuAbierto(false)}>
            CONÓCENOS
          </Link>
          <Link to="/contactenos" className={`cliente-nav-link ${isActive('/contactenos') ? 'active' : ''}`} onClick={() => setMenuAbierto(false)}>
            CONTÁCTENOS
          </Link>
          
          <Link 
            to="/pedidos" 
            className="cliente-nav-link"
            onClick={() => setMenuAbierto(false)}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderTop: '1px solid #e9ecef',
              paddingTop: '1rem',
              marginTop: '0.5rem'
            }}
          >
            🛒 CARRITO
            {cantidadTotal > 0 && (
              <span style={{
                backgroundColor: '#ec4899',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {cantidadTotal}
              </span>
            )}
          </Link>
          
          {isAuthenticatedState ? (
            <>
              <Link 
                to="/perfil" 
                className="cliente-nav-link" 
                onClick={() => setMenuAbierto(false)}
                style={{ 
                  borderTop: '1px solid #e9ecef', 
                  paddingTop: '1rem',
                  marginTop: '0.5rem' 
                }}
              >
                👤 MI PERFIL
              </Link>
              <div style={{ padding: '0 1rem' }}>
                <LogoutButton className="cliente-nav-button" showText={true} />
              </div>
            </>
          ) : (
            <button 
              onClick={abrirLoginNuevaVentana}
              className="cliente-nav-button"
              style={{ cursor: 'pointer', width: '100%' }}
            >
              INICIAR SESIÓN
            </button>
          )}
        </div>
        
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </nav>
    </>
  );
};

export default Navegacion;