import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

// Importar páginas públicas
import Inicio from './features/Home/Inicio';
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
import { CartProvider } from './features/Cartas/pages/CartContext';
import PersonalizacionProductosView from './features/Pedidos/components/PersonalizacionProductos';

// Importar páginas de Cliente
import PerfilCliente from './features/Perfil/pages/PerfilCliente';

// Importar páginas de Admin
import ComprasTable from "./features/Admin/pages/Compras/comprasCrud/ComprasTabla.jsx";
import CategoriaTableDemo from './features/Admin/pages/Compras/CategoriaInsumo.jsx'
import TablaInsumos from "./features/Admin/pages/Compras/insumos/TablaInsumos.jsx";
import Usuarios from './features/Admin/pages/Usuarios/Usuarios.jsx';
import Roles from './features/Admin/pages/Roles/Roles.jsx';
import Clientes from './features/Admin/pages/Clientes/Clientes.jsx';
import Ventas from './features/Admin/pages/Ventas/ventas.jsx';
import ProveedoresTable from './features/Admin/pages/Compras/proveedores/ProveedoresTable.jsx';
import Dashboard from './features/Admin/pages/Dashboard/Dashboard.jsx'
import CategoriaProductos from './features/Admin/pages/CategoriaProductos.jsx';
import Productos from './features/Admin/pages/Productos/Productos.jsx';
import Produccion from './features/Admin/pages/Produccion.jsx';
import RecetasTabla from './features/Admin/pages/Recetas/Recetas.jsx';
import SedesPage from './features/Admin/pages/Compras/sedes/sede.jsx';

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
  // ✅ AGREGAR ESTA LÍNEA
  const isPersonalizacionRoute = location.pathname === '/pedidos/personalizar';

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
      {/* ✅ ACTUALIZAR ESTA LÍNEA - agregar isPersonalizacionRoute */}
      {!isLoginPage && !shouldShowSidebar && !isPerfilRoute && !isPersonalizacionRoute && <Navegacion isAuthenticated={isAuthenticated} />}
      
      {shouldShowSidebar ? (
        <Layout userRole={userRole} showSidebar={true}>
          <Routes>
            {/* Rutas de Admin */}
            <Route path="/admin/pages/CategoriaInsumo" element={<CategoriaTableDemo />} />
            <Route path="/admin/pages/insumos" element={<TablaInsumos />} />
            <Route path="/admin/pages/compras" element={<ComprasTable />} />
            <Route path="/admin/pages/usuarios" element={<Usuarios />} />
            <Route path="/admin/pages/Roles" element={<Roles />} />
            <Route path="/admin/pages/Clientes" element={<Clientes />} />
            <Route path="/admin/pages/proveedores" element={<ProveedoresTable />} />
            <Route path="/admin/pages/Ventas" element={<Ventas />} />
            <Route path="/admin/pages/Dashboard" element={<Dashboard/>} />
            <Route path="/admin/pages/CategoriaProductos" element={<CategoriaProductos />} />
            <Route path="/admin/pages/Productos" element={<Productos />} />
            <Route path="/admin/pages/Produccion" element={<Produccion />} />
            <Route path="/admin/pages/Recetas" element={<RecetasTabla />} />
            <Route path="/admin/pages/Sede" element={<SedesPage />} />
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
            
            {/* ✅✅✅ AGREGAR ESTA RUTA CRUCIAL ✅✅✅ */}
            <Route path="/pedidos/personalizar" element={<PersonalizacionProductosView />} />
            
            {/* Rutas de detalles de productos */}
            <Route path="/detalle-fresas" element={<ProductoDetalle />} />
            <Route path="/detalle-obleas" element={<DetalleObleas />} />
            <Route path="/detalle-mini-donas" element={<DetalleMiniDonas />} />
            <Route path="/detalle-cupcake" element={<DetalleCupcake/>} />
            <Route path="/detalle-arroz" element={<DetallesArroz />} />
            <Route path="/detalle-postres" element={<DetallesPostres />} />
            <Route path="/detalle-sandwiches" element={<DetallesSandwiches />} />
            <Route path="/detalle-chocolates" element={<DetalleChocolates />} />

            {/* Ruta del perfil del cliente */}
            {isAuthenticated && userRole === 'cliente' && (
              <Route path="/perfil" element={<PerfilCliente />} />
            )}
          </Routes>
        </>
      )}
      
      {/* ✅ ACTUALIZAR ESTA LÍNEA - agregar isPersonalizacionRoute */}
      {!isLoginPage && !shouldShowSidebar && !isPerfilRoute && !isPersonalizacionRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
}

export default App;