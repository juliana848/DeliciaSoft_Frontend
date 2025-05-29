import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';



import Conocenos from './features/Conocenos/pages/Conocenos';
import Contactenos from './features/Contactenos/pages/Contactenos';
import Cartas from './features/Cartas/pages/Cartas';
import Sedes from './features/Sedes/pages/Sedes';
import Pedidos from './features/Pedidos/pages/Pedidos';
import Navegacion from './shared/components/layout/Navegacion/Navegacion';
import Footer from './shared/components/layout/Fooder/Footer';



function App() {
  return (
    <Router>
      <div className="App">
        <Navegacion />
        <Routes>
          <Route path="/conocenos" element={<Conocenos />} />
          <Route path="/contactenos" element={<Contactenos />} />
          <Route path="/cartas" element={<Cartas />} />
          <Route path="/sedes" element={<Sedes />} /> 
          <Route path="/pedidos" element={<Pedidos />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

console.log({ Conocenos, Contactenos, Cartas, Sedes, Pedidos });


export default App;