import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

// Importar páginas públicas
import Inicio from './features/Home/pages/Inicio';
import Conocenos from './features/Conocenos/pages/Conocenos';
import Contactenos from './features/Contactenos/pages/Contactenos';
import Cartas from './features/Cartas/pages/Cartas';
import Sedes from './features/Sedes/pages/Sedes';
import Pedidos from './features/Pedidos/pages/Pedidos';
import Login from './features/log/login';

// Importar páginas de Admin
import CategoriaInsumo from './features/Admin/pages/CategoriaInsumo';
import ComprasTable from './features/Admin/pages/Compras.jsx';
import InsumosTable from './features/Admin/pages/insumos.jsx';
import Usuarios from './features/Admin/pages/Usuarios.jsx';
import Roles from './features/Admin/pages/Roles.jsx';
import Clientes from './features/Admin/pages/Clientes.jsx';
import Ventas from './features/Admin/pages/ventas.jsx';
import ProveedorTable from './features/Admin/pages/proveedores.jsx';
import Dashboard from './features/Admin/pages/Dashboard'
import CategoriaProductos from './features/Admin/pages/CategoriaProductos.jsx';
import Produccion from './features/Admin/pages/Produccion.jsx';

// Componentes de Layout
import Navegacion from './shared/components/Navegacion/Navegacion.jsx';
import Footer from './shared/components/Fooder/Footer';
import Layout from './shared/components/Layout/Layout/Layout.jsx';

// Estilos
import 'primereact/resources/themes/lara-light-indigo/theme.css'; 
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function AppContent() {
  const location = useLocation();
  const [userRole, setUserRole] = useState('cliente'); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const isLoginPage = location.pathname === "/iniciar-sesion";
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    
    if (token) {
      setIsAuthenticated(true);
      setUserRole(role || 'cliente');
    }
  }, [location]);

  // Determinar si mostrar sidebar (solo para admin autenticado)
  const shouldShowSidebar = isAuthenticated && userRole === 'admin' && isAdminRoute;
  
  return (
    <div className="App">
      {/* Mostrar navegación pública cuando NO es página de login y NO es admin con sidebar */}
      {!isLoginPage && !shouldShowSidebar && <Navegacion isAuthenticated={isAuthenticated} />}
      
      {shouldShowSidebar ? (
        <Layout userRole={userRole} showSidebar={true}>
          <Routes>
            {/* Rutas de Admin */}
            <Route path="/admin/pages/CategoriaInsumo" element={<CategoriaInsumo />} />
            <Route path="/admin/pages/insumos" element={<InsumosTable />} />
            <Route path="/admin/pages/compras" element={<ComprasTable />} />
            <Route path="/admin/pages/usuarios" element={<Usuarios />} />
            <Route path="/admin/pages/Roles" element={<Roles />} />
            <Route path="/admin/pages/Clientes" element={<Clientes />} />
            <Route path="/admin/pages/proveedores" element={<ProveedorTable />} />
            <Route path="/admin/pages/Ventas" element={<Ventas />} />
            <Route path="/admin/pages/Dashboard" element={<Dashboard/>} />
            <Route path="/admin/pages/CategoriaProductos" element={<CategoriaProductos />} />
            <Route path="/admin/pages/Produccion" element={<Produccion />} />

            {/* 
            <Route path="/admin/pedidos" element={<div className="p-4"><h2>Gestión de Pedidos</h2></div>} />
            <Route path="/admin/cotizacion" element={<div className="p-4"><h2>Cotizaciones</h2></div>} />
            <Route path="/admin/sedes" element={<div className="p-4"><h2>Gestión de Sedes</h2></div>} />
            <Route path="/admin/insumos" element={<div className="p-4"><h2>Gestión de Insumos</h2></div>} />
            <Route path="/admin/proveedores" element={<div className="p-4"><h2>Gestión de Proveedores</h2></div>} />
            <Route path="/admin/compras-list" element={<div className="p-4"><h2>Lista de Compras</h2></div>} />
            <Route path="/admin/cat-productos" element={<div className="p-4"><h2>Categorías de Productos</h2></div>} />
            <Route path="/admin/productos" element={<div className="p-4"><h2>Gestión de Productos</h2></div>} />
            <Route path="/admin/productos-por" element={<div className="p-4"><h2>Productos Por...</h2></div>} />
            <Route path="/admin/produccion" element={<div className="p-4"><h2>Gestión de Producción</h2></div>} /> */}


          </Routes>
        </Layout>
      ) : (
        <>
          <Routes>
            {/* Ruta de Login */}
            <Route path="/iniciar-sesion" element={<Login />} />
            
            {/* Rutas Públicas */}
            <Route path="/" element={<Inicio />} />
            <Route path="/conocenos" element={<Conocenos />} />
            <Route path="/contactenos" element={<Contactenos />} />
            <Route path="/cartas" element={<Cartas />} />
            <Route path="/sedes" element={<Sedes />} />
            <Route path="/pedidos" element={<Pedidos />} />
            
            {/* Rutas de Cliente autenticado */}
            {isAuthenticated && userRole === 'cliente' && (
              <Route path="/perfil" element={<div className="p-4"><h2>Mi Perfil</h2></div>} />
            )}
          </Routes>
        </>
      )}
      
      {/* Footer solo en páginas públicas */}
      {!isLoginPage && !shouldShowSidebar && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
