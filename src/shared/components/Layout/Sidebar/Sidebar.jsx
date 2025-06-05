import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoutButton from '../LogoutButton/LogoutButton';
import './Sidebar.css';

const Sidebar = ({ userRole = 'admin' }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const isActive = (path) => location.pathname === path;

  const adminMenuItems = [
    {
      key: 'dashboard',
      title: 'Dashboard',
      icon: 'bi bi-bar-chart-fill',
      path: '/admin/pages/Dashboard'
    },
    {
      key: 'configuracion',
      title: 'Configuración',
      icon: 'bi bi-gear-fill',
      hasSubmenu: true,
      submenu: [
        { title: 'Roles', path: '/admin/pages/Roles', icon: 'bi bi-person-badge' }
      ]
    },
    {
      key: 'usuarios',
      title: 'Usuarios',
      icon: 'bi bi-people-fill',
      path: '/admin/pages/Usuarios'
    },
    {
      key: 'ventas',
      title: 'Ventas',
      icon: 'bi bi-credit-card-fill',
      hasSubmenu: true,
      submenu: [
        { title: 'Clientes', path: '/admin/pages/Clientes', icon: 'bi bi-people' },
        { title: 'Pedidos', path: '/admin/pedidos', icon: 'bi bi-bag-check' },
        { title: 'Cotización', path: '/admin/cotizacion', icon: 'bi bi-calculator' },
        { title: 'Sedes', path: '/admin/sedes', icon: 'bi bi-geo-alt' },
        { title: 'Ventas', path: '/admin/pages/Ventas', icon: 'bi bi-graph-up' }
      ]
    },
    {
      key: 'compras',
      title: 'Compras',
      icon: 'bi bi-cart-fill',
      hasSubmenu: true,
      submenu: [
        { title: 'Insumos', path: '/admin/pages/insumos', icon: 'bi bi-box' },
        { title: 'Cat. Insumos', path: '/admin/pages/CategoriaInsumo', icon: 'bi bi-tags' },
        { title: 'Proveedores', path: '/admin/proveedores', icon: 'bi bi-truck' },
        { title: 'Compras', path: '/admin/pages/compras', icon: 'bi bi-receipt' }
      ]
    },
    {
      key: 'productos',
      title: 'Productos',
      icon: 'bi bi-cake-fill',
      hasSubmenu: true,
      submenu: [
        { title: 'Cat. Productos', path: '/admin/pages/CategoriaProductos', icon: 'bi bi-grid' },
        { title: 'Productos', path: '/admin/productos', icon: 'bi bi-cake2' },
        { title: 'Productos Por', path: '/admin/productos-por', icon: 'bi bi-list-ul' }
      ]
    },
    {
      key: 'produccion',
      title: 'Producción',
      icon: 'bi bi-building',
      path: '/admin/pages/produccion'
    }
  ];

  const clienteMenuItems = [
    {
      key: 'inicio',
      title: 'Inicio',
      icon: 'bi bi-house-fill',
      path: '/'
    },
    {
      key: 'cartas',
      title: 'Cartas',
      icon: 'bi bi-card-list',
      path: '/cartas'
    },
    {
      key: 'pedidos',
      title: 'Mis Pedidos',
      icon: 'bi bi-box-seam',
      path: '/pedidos'
    },
    {
      key: 'sedes',
      title: 'Sedes',
      icon: 'bi bi-geo-alt-fill',
      path: '/sedes'
    },
    {
      key: 'perfil',
      title: 'Mi Perfil',
      icon: 'bi bi-person-fill',
      path: '/perfil'
    }
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : clienteMenuItems;

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
      
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img 
              src="/imagenes/logo-delicias-darsy.png" 
              alt="Logo" 
              className="sidebar-logo"
            />
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
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
                      {item.submenu.map((subItem, subIndex) => (
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
            <img 
              src="/imagenes/default-avatar.png" 
              alt="Usuario" 
              className="user-avatar"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIxIDEyIDE2IDEwLjIxIDE2IDhDMTYgNS43OSAxNC4yMSA0IDEyIDRDOS43OSA0IDggNS43OSA4IDhDOCAxMC4yMSA5Ljc5IDEyIDEyIDEyWk0xMiAxNEM5LjMzIDE0IDQgMTUuMzQgNCAyMFYyMkgyMFYyMEMyMCAxNS4zNCAxNC42NyAxNCAxMiAxNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=';
              }}
            />
            <div className="user-details">
              <span className="user-role">
                {userRole === 'admin' ? 'Admin' : 'Cliente'}
              </span>
              <small className="user-id">Id: 12345678</small>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;