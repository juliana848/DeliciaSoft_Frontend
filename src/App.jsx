import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import './App.css';

import Conocenos from './features/Conocenos/pages/Conocenos';
import Contactenos from './features/Contactenos/pages/Contactenos';
import Cartas from './features/Cartas/pages/Cartas';
import Sedes from './features/Sedes/pages/Sedes';
import Pedidos from './features/Pedidos/pages/Pedidos';
import Navegacion from './shared/components/layout/Navegacion/Navegacion';
import Footer from './shared/components/layout/Fooder/Footer';
import Login from './features/log/login';

// Nuevo componente contenedor
function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/iniciar-sesion";

  return (
    <div className="App">
      {!isLoginPage && <Navegacion />}
      <Routes>
        <Route path="/conocenos" element={<Conocenos />} />
        <Route path="/contactenos" element={<Contactenos />} />
        <Route path="/cartas" element={<Cartas />} />
        <Route path="/sedes" element={<Sedes />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/iniciar-sesion" element={<Login />} />
      </Routes>
      {!isLoginPage && <Footer />}
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
