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
      icon: '📊',
      path: '/admin/dashboard'
    },
    {
      key: 'configuracion',
      title: 'Configuración',
      icon: '⚙️',
      hasSubmenu: true,
      submenu: [
        { title: 'Roles', path: '/admin/roles' }
      ]
    },
    {
      key: 'usuarios',
      title: 'Usuarios',
      icon: '👥',
      path: '/admin/usuarios'
    },
    {
      key: 'ventas',
      title: 'Ventas',
      icon: '💳',
      hasSubmenu: true,
      submenu: [
        { title: 'Clientes', path: '/admin/clientes' },
        { title: 'Pedidos', path: '/admin/pedidos' },
        { title: 'Cotización', path: '/admin/cotizacion' },
        { title: 'Sedes', path: '/admin/sedes' },
        { title: 'Ventas', path: '/admin/ventas-list' }
      ]
    },
    {
      key: 'compras',
      title: 'Compras',
      icon: '🛒',
      hasSubmenu: true,
      submenu: [

        { title: 'Insumos', path: '/admin/pages/insumos' },
        { title: 'Cat. Insumos', path: '/admin/pages/CategoriaInsumo' },
        { title: 'Proveedores', path: '/admin/proveedores' },
        { title: 'Compras', path: '/admin/pages/compras' }
      ]
    },
    {
      key: 'productos',
      title: 'Productos',
      icon: '🧁',
      hasSubmenu: true,
      submenu: [
        { title: 'Cat. Productos', path: '/admin/cat-productos' },
        { title: 'Productos', path: '/admin/productos' },
        { title: 'Productos Por', path: '/admin/productos-por' }
      ]
    },
    {
      key: 'produccion',
      title: 'Producción',
      icon: '🏭',
      path: '/admin/produccion'
    }
  ];

  const clienteMenuItems = [
    {
      key: 'inicio',
      title: 'Inicio',
      icon: '🏠',
      path: '/'
    },
    {
      key: 'cartas',
      title: 'Cartas',
      icon: '📋',
      path: '/cartas'
    },
    {
      key: 'pedidos',
      title: 'Mis Pedidos',
      icon: '📦',
      path: '/pedidos'
    },
    {
      key: 'sedes',
      title: 'Sedes',
      icon: '📍',
      path: '/sedes'
    },
    {
      key: 'perfil',
      title: 'Mi Perfil',
      icon: '👤',
      path: '/perfil'
    }
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : clienteMenuItems;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <img 
            src="/imagenes/logo-delicias-darsy.png" 
            alt="Delicias Darsy" 
            className="sidebar-logo"
          />
          <div className="logo-text">
            <h6>Delicias Darsy</h6>
            <small>+57 300 853 04</small>
          </div>
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
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.title}</span>
                  <span className="nav-arrow">▶</span>
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
                        <span className="nav-text">{subItem.title}</span>
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
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.title}</span>
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
              {userRole === 'admin' ? 'Administrador' : 'Cliente'}
            </span>
            <small className="user-id">ID: 12345670</small>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;