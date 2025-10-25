import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ userRole = 'admin' }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [userPermissions, setUserPermissions] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cerrar sidebar al cambiar de ruta en dispositivos móviles
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Cerrar sidebar al hacer clic en el overlay
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Definición completa del menú de administrador con permisos
  const allAdminMenuItems = [
    {
      key: 'dashboard',
      title: 'Dashboard',
      icon: 'bi bi-speedometer2',
      path: '/admin/pages/Dashboard',
      permission: 'Dashboard'
    },
    {
      key: 'configuracion',
      title: 'Configuración',
      icon: 'bi bi-gear-wide-connected',
      hasSubmenu: true,
      submenu: [
        { 
          title: 'Roles', 
          path: '/admin/pages/Roles', 
          icon: 'bi bi-person-badge-fill',
          permission: 'Roles'
        },
        { 
          title: 'Sedes', 
          path: '/admin/pages/Sede', 
          icon: 'bi bi-geo-alt-fill',
          permission: 'Sedes'
        }
      ]
    },
    {
      key: 'usuarios',
      title: 'Usuarios',
      icon: 'bi bi-people-fill',
      path: '/admin/pages/Usuarios',
      permission: 'Usuarios'
    },
    {
      key: 'ventas',
      title: 'Ventas',
      icon: 'bi bi-credit-card-2-front-fill',
      hasSubmenu: true,
      submenu: [
        { 
          title: 'Clientes', 
          path: '/admin/pages/Clientes', 
          icon: 'bi bi-person-hearts',
          permission: 'Cliente'
        },
        { 
          title: 'Ventas', 
          path: '/admin/pages/Ventas', 
          icon: 'bi bi-graph-up-arrow',
          permission: 'Ventas'
        }
      ]
    },
    {
      key: 'compras',
      title: 'Compras',
      icon: 'bi bi-cart-check-fill',
      hasSubmenu: true,
      submenu: [
        { 
          title: 'Insumos', 
          path: '/admin/pages/insumos', 
          icon: 'bi bi-box-seam-fill',
          permission: 'Insumos'
        },
        { 
          title: 'Cat. Insumos', 
          path: '/admin/pages/CategoriaInsumo', 
          icon: 'bi bi-tags-fill',
          permission: 'Cat.Insumos'
        },
        { 
          title: 'Proveedores', 
          path: '/admin/pages/proveedores', 
          icon: 'bi bi-truck-flatbed',
          permission: 'Proveedores'
        },
        { 
          title: 'Compras', 
          path: '/admin/pages/compras', 
          icon: 'bi bi-receipt-cutoff',
          permission: 'Compras'
        }
      ]
    },
    {
      key: 'productos',
      title: 'Productos',
      icon: 'bi bi-cake2-fill',
      hasSubmenu: true,
      submenu: [
        { 
          title: 'Cat. Productos', 
          path: '/admin/pages/CategoriaProductos', 
          icon: 'bi bi-grid-3x3-gap-fill',
          permission: 'Cat.Productos'
        },
        { 
          title: 'Productos', 
          path: '/admin/pages/Productos',
          icon: 'bi bi-star-fill',
          permission: 'Productos'
        },
        { 
          title: 'Recetas', 
          path: '/admin/pages/Recetas', 
          icon: 'bi bi-book-half',
          permission: 'Productos'
        }
      ]
    },
    {
      key: 'produccion',
      title: 'Producción',
      icon: 'bi bi-buildings-fill',
      path: '/admin/pages/produccion',
      permission: 'Produccion'
    }
  ];

  const clienteMenuItems = [
    {
      key: 'inicio',
      title: 'Inicio',
      icon: 'bi bi-house-heart-fill',
      path: '/'
    },
    {
      key: 'cartas',
      title: 'Cartas',
      icon: 'bi bi-menu-button-wide-fill',
      path: '/cartas'
    },
    {
      key: 'sedes',
      title: 'Sedes',
      icon: 'bi bi-pin-map-fill',
      path: '/sedes'
    },
    {
      key: 'perfil',
      title: 'Mi Perfil',
      icon: 'bi bi-person-circle',
      path: '/perfil'
    }
  ];

  // Obtener permisos del usuario
  useEffect(() => {
    const getUserPermissions = async () => {
      try {
        setLoading(true);
        
        if (userRole === 'cliente') {
          setUserPermissions(['all']);
          setLoading(false);
          return;
        }

        // Obtener datos del usuario desde localStorage
        const userData = localStorage.getItem('userData');
        
        if (userData) {
          const user = JSON.parse(userData);
          console.log('Datos del usuario:', user);
          
          // Obtener ID del rol del usuario
          const rolId = user.idrol || user.rol_id;
          
          if (rolId) {
            await fetchUserPermissions(rolId);
          } else {
            console.warn('No se encontró ID de rol en los datos del usuario');
            setUserPermissions(['Dashboard']); // Permiso mínimo
          }
        } else {
          console.warn('No se encontraron datos de usuario');
          setUserPermissions(['Dashboard']); // Permiso mínimo
        }
      } catch (error) {
        console.error('Error al obtener permisos del usuario:', error);
        setUserPermissions(['Dashboard']); // Permiso mínimo en caso de error
      } finally {
        setLoading(false);
      }
    };

    getUserPermissions();
  }, [userRole]);

  // Función para obtener permisos del usuario desde la API
  const fetchUserPermissions = async (rolId) => {
    try {
      const API_BASE_URL = 'https://deliciasoft-backend.onrender.com/api';
      
      console.log(`Obteniendo permisos para el rol: ${rolId}`);
      
      // Método directo: obtener permisos del rol
      const permisosResponse = await fetch(`${API_BASE_URL}/rol/${rolId}/permisos`);
      
      if (permisosResponse.ok) {
        const permisos = await permisosResponse.json();
        console.log('Permisos obtenidos directamente:', permisos);
        
        // Usar el campo 'modulo' en lugar de 'descripcion'
        const permissionNames = permisos.map(p => p.modulo).filter(modulo => modulo);
        
        console.log('Nombres de permisos extraídos:', permissionNames);
        
        if (permissionNames.length > 0) {
          setUserPermissions(permissionNames);
          return;
        }
      }
      
      // Fallback: método alternativo
      const rolResponse = await fetch(`${API_BASE_URL}/rol/${rolId}`);
      
      if (rolResponse.ok) {
        const rolData = await rolResponse.json();
        console.log('Datos del rol:', rolData);
        
        if (rolData.permisos && Array.isArray(rolData.permisos)) {
          // Obtener todos los permisos para mapear IDs a nombres
          const permisosResponse = await fetch(`${API_BASE_URL}/permisos`);
          
          if (permisosResponse.ok) {
            const todosLosPermisos = await permisosResponse.json();
            
            // Mapear los IDs de permisos a módulos
            const permissionNames = rolData.permisos
              .map(permisoId => {
                const permiso = todosLosPermisos.find(p => p.idpermiso === permisoId);
                return permiso ? permiso.modulo : null;
              })
              .filter(nombre => nombre !== null);
            
            console.log('Nombres de permisos (método alternativo):', permissionNames);
            setUserPermissions(permissionNames);
            return;
          }
        }
      }
      
      // Si todo falla, permisos mínimos
      console.warn('No se pudieron obtener permisos del rol, asignando permisos mínimos');
      setUserPermissions(['Dashboard']);
      
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      setUserPermissions(['Dashboard']); // Permiso mínimo
    }
  };

  // Filtrar elementos del menú basado en permisos
  useEffect(() => {
    if (userRole === 'cliente') {
      setFilteredMenuItems(clienteMenuItems);
      return;
    }

    if (loading) {
      return;
    }

    // Para administradores, filtrar según permisos
    const filterMenuItems = (items) => {
      return items.map(item => {
        // Si el item tiene permiso específico, verificar que el usuario lo tenga
        if (item.permission) {
          const hasPermission = userPermissions.includes(item.permission);
          console.log(`Verificando permiso para ${item.title}: ${item.permission} - Usuario tiene: [${userPermissions.join(', ')}] - Resultado: ${hasPermission}`);
          
          if (!hasPermission) {
            return null; // No mostrar este item
          }
        }

        // Si tiene submenú, filtrar los subitems
        if (item.hasSubmenu && item.submenu) {
          const filteredSubmenu = item.submenu.filter(subItem => {
            if (subItem.permission) {
              const hasSubPermission = userPermissions.includes(subItem.permission);
              console.log(`Verificando permiso para subitem ${subItem.title}: ${subItem.permission} - Resultado: ${hasSubPermission}`);
              return hasSubPermission;
            }
            return true;
          });

          // Solo mostrar el menú padre si tiene al menos un subitem
          if (filteredSubmenu.length === 0) {
            console.log(`Menú ${item.title} oculto porque no tiene subitems con permisos`);
            return null;
          }

          // Retornar una copia del item con el submenú filtrado
          return {
            ...item,
            submenu: filteredSubmenu
          };
        }

        return item;
      }).filter(item => item !== null); // Remover items nulos
    };

    console.log('Permisos del usuario:', userPermissions);
    const filtered = filterMenuItems(allAdminMenuItems);
    console.log('Menú filtrado:', filtered);
    setFilteredMenuItems(filtered);
  }, [userPermissions, userRole, loading]);

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Bootstrap CSS */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      {/* Bootstrap Icons */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        rel="stylesheet"
      />
      
       {/* Estilos globales para espaciado del botón */}
      <style>
        {`
          /* Asegurar espacio para el botón de cerrar sesión */
          body, 
          #root,
          .app,
          .main-content,
          .content-area,
          .page-wrapper,
          [class*="container"],
          [class*="wrapper"],
          [class*="content"] {
            padding-top: 15px !important;
          }
          
          @media (max-width: 1024px) {
            .content-with-sidebar {
              margin-left: 0 !important;
              padding-top: 80px !important;
            }
          }
        `}
      </style>

      {/* Botón hamburguesa */}
      <button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <i className={`bi ${sidebarOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
      </button>

      {/* Overlay para cerrar el menú */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={handleOverlayClick}
      ></div>
      
      <div className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img 
              src="/imagenes/logo-delicias-darsy.png" 
              alt="Logo Delicias Darsy" 
              className="sidebar-logo"
            />
            <div className="logo-text">
              <h6>Delicias Darsy</h6>
              <small>Sistema de Gestión</small>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {loading && userRole === 'admin' && (
            <div className="nav-item">
              <div className="nav-link nav-message loading-animation">
                <div className="nav-content">
                  <i className="nav-icon bi bi-hourglass-split"></i>
                  <span className="nav-text">Cargando permisos...</span>
                </div>
              </div>
            </div>
          )}

          {!loading && filteredMenuItems.length === 0 && userRole === 'admin' && (
            <div className="nav-item">
              <div className="nav-link nav-message error">
                <div className="nav-content">
                  <i className="nav-icon bi bi-shield-exclamation"></i>
                  <span className="nav-text">Sin permisos asignados</span>
                </div>
              </div>
            </div>
          )}

          {!loading && filteredMenuItems.map((item) => (
            <div key={item.key} className="nav-item">
              {item.hasSubmenu ? (
                <>
                  <button
                    className={`nav-link nav-toggle ${expandedMenus[item.key] ? 'expanded' : ''}`}
                    onClick={() => toggleMenu(item.key)}
                    aria-expanded={expandedMenus[item.key]}
                    aria-controls={`submenu-${item.key}`}
                  >
                    <div className="nav-content">
                      <i className={`nav-icon ${item.icon}`}></i>
                      <span className="nav-text">{item.title}</span>
                      <i className="nav-arrow bi bi-chevron-right"></i>
                    </div>
                  </button>
                  {expandedMenus[item.key] && (
                    <div 
                      className="submenu" 
                      id={`submenu-${item.key}`}
                      role="menu"
                    >
                      {item.submenu?.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`nav-link submenu-link ${isActive(subItem.path) ? 'active' : ''}`}
                          role="menuitem"
                        >
                          <div className="nav-content">
                            {subItem.icon && <i className={`submenu-icon ${subItem.icon}`}></i>}
                            <span className="nav-text">{subItem.title}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  role="menuitem"
                >
                  <div className="nav-content">
                    <i className={`nav-icon ${item.icon}`}></i>
                    <span className="nav-text">{item.title}</span>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </nav>

      <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <i className="bi bi-person-circle"></i>
            </div>
            <div className="user-details">
              <span className="user-role">
                {userRole === 'admin' ? 'Administrador' : 'Cliente'}
              </span>
              <small className="user-id">
                {loading ? 'Cargando...' : `${userPermissions.length} módulos`}
              </small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;