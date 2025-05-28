import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '/src/App.css';


// import Inicio from './paginas/Inicio';
import Conocenos from './paginas/Conocenos';
import Contactenos from './paginas/Contactenos';
import Cartas from './paginas/Cartas';
import Sedes from './paginas/Sedes';
import Pedidos from './paginas/Pedidos';
import Navegacion from './componentes/Navegacion/Navegacion';
import Footer from './componentes/Footer';



function App() {
  return (
    <Router>
      <div className="App">
        <Navegacion />
        <Routes>
          {/* <Route path="/" element={<Inicio />} /> */}
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