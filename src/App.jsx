import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

// Importar páginas públicas
import Inicio from './features/Home/pages/Inicio';
import Conocenos from './features/Conocenos/pages/Conocenos';
import Contactenos from './features/Contactenos/pages/Contactenos';
import Cartas from './features/Cartas/pages/Cartas';
import ProductoDetalle from "./features/Cartas/pages/DetalleFresas";
import Sedes from './features/Sedes/pages/Sedes';
import Pedidos from './features/Pedidos/pages/Pedidos';
import Login from './features/log/login';
import DetalleObleas from "./features/Cartas/pages/DetalleObleas";
import DetalleMiniDonas from "./features/Cartas/pages/DetalleMiniDonas";
import DetalleCupcake from "./features/Cartas/pages/DetalleCupcake";
import DetallesArroz from "./features/Cartas/pages/DetallesArrozConLeche";
import DetallesPostres from "./features/Cartas/pages/detallePostres";
import DetallesSandwiches from "./features/Cartas/pages/detallesSandwis";
import DetalleChocolates from "./features/Cartas/pages/detallesChocolates";

// Importar páginas de Cliente
import PerfilCliente from './features/Perfil/pages/PerfilCliente';

// Importar páginas de Admin
import CategoriaInsumo from './features/Admin/pages/CategoriaInsumo';
import ComprasTable from './features/Admin/pages/Compras.jsx';
import InsumosTable from './features/Admin/pages/insumos.jsx';
import Usuarios from './features/Admin/pages/Usuarios/Usuarios.jsx';
import Roles from './features/Admin/pages/Roles/Roles.jsx';
import Clientes from './features/Admin/pages/Clientes/Clientes.jsx';
import Ventas from './features/Admin/pages/ventas.jsx';
import ProveedorTable from './features/Admin/pages/proveedores.jsx';
import Dashboard from './features/Admin/pages/Dashboard'
import CategoriaProductos from './features/Admin/pages/CategoriaProductos.jsx';
import Productos from './features/Admin/pages/Productos.jsx';
import Produccion from './features/Admin/pages/Produccion.jsx';
import RecetasTabla from './features/Admin/pages/Recetas/Recetas.jsx';
import SedesTable from './features/Admin/pages/Sede.jsx';

import Navegacion from './shared/components/Navegacion/Navegacion.jsx';
import Footer from './shared/components/Fooder/Footer';
import Layout from './shared/components/Layout/Layout/Layout.jsx';

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
  const isPerfilRoute = location.pathname === '/perfil';

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    
    if (token) {
      setIsAuthenticated(true);
      setUserRole(role || 'cliente');
    }
  }, [location]);

  const shouldShowSidebar = isAuthenticated && userRole === 'admin' && isAdminRoute;
  
  return (
    <div className="App">
      {!isLoginPage && !shouldShowSidebar && !isPerfilRoute && <Navegacion isAuthenticated={isAuthenticated} />}
      
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
            <Route path="/admin/pages/Productos" element={<Productos />} />
            <Route path="/admin/pages/Produccion" element={<Produccion />} />
            <Route path="/admin/pages/Recetas" element={<RecetasTabla />} />
            <Route path="/admin/pages/Sede" element={<SedesTable />} />
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
            <Route path="/sedes" element={<Sedes />} /> {/* ESTA LÍNEA FALTABA */}
            <Route path="/pedidos" element={<Pedidos />} />
            {/* <Route path="/producto/:nombre" element={<ProductoDetalle />} /> */}
            <Route path="/detalle-fresas" element={<ProductoDetalle />} />
            <Route path="/detalle-obleas" element={<DetalleObleas />} />
            <Route path="/detalle-mini-donas" element={<DetalleMiniDonas />} />
            <Route path="/detalle-cupcake" element={<DetalleCupcake/>} />
            <Route path="/detalle-arroz" element={<DetallesArroz />} />
            <Route path="/detalle-postres" element={<DetallesPostres />} />
            <Route path="/detalle-sandwiches" element={<DetallesSandwiches />} />
            <Route path="/detalle-chocolates" element={<DetalleChocolates />} />

            {isAuthenticated && userRole === 'cliente' && (
              <Route path="/perfil" element={<PerfilCliente />} />
            )}
          </Routes>
        </>
      )}
      
      {!isLoginPage && !shouldShowSidebar && !isPerfilRoute && <Footer />}
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