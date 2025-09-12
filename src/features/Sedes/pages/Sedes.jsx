import React, { useState, useEffect } from 'react';
import './Sedes.css';
import { MapPin, Phone, Clock, Home } from 'lucide-react';

function Sedes() {
  const [ubicacion, setUbicacion] = useState(null);
  const [sedeMostrandoMapa, setSedeMostrandoMapa] = useState(null);
  const [imagenes, setImagenes] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar las imágenes desde la API al montar el componente
  useEffect(() => {
    const cargarImagenes = async () => {
      try {
        const response = await fetch('https://deliciasoft-backend.onrender.com/api/imagenes');
        const data = await response.json();
        
        // Mapear las imágenes por ID para fácil acceso
        const imagenesMap = {};
        data.forEach(imagen => {
          imagenesMap[imagen.idimagen] = imagen.urlimg;
        });
        
        setImagenes(imagenesMap);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar las imágenes:', error);
        setLoading(false);
      }
    };

    cargarImagenes();
  }, []);

  const abrirMapa = (sedeId) => {
    if (sedeMostrandoMapa === sedeId) {
      setSedeMostrandoMapa(null);
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUbicacion({ lat: latitude, lng: longitude });
          setSedeMostrandoMapa(sedeId);

          const anchor = document.getElementById(`mapa-${sedeId}`);
          if (anchor) {
            setTimeout(() => {
              anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        },
        (err) => {
          console.error('Error de geolocalización', err);
          alert('No se pudo obtener tu ubicación.');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  };

  const renderMapa = (sedeId) => {
    if (sedeMostrandoMapa === sedeId && ubicacion) {
      return (
        <div id={`mapa-${sedeId}`} className="mapa-container">
          <iframe
            title="Mapa"
            width="100%"
            height="300"
            style={{ border: '2px solid #ff69b4', borderRadius: '10px', marginTop: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${ubicacion.lat},${ubicacion.lng}&z=15&output=embed`}
          ></iframe>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="sedes-container">
        <h2 className="sedes-titulo">NUESTRAS SEDES</h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Cargando imágenes...
        </div>
      </div>
    );
  }

  return (
    <div className="sedes-container">
      <h2 className="sedes-titulo">NUESTRAS SEDES</h2>
      <div className="sedes-grid">
        <div className="sede">
          <h3 className="sede-nombre">SAN PABLO</h3>
          <img 
            src={imagenes[4] || 'https://via.placeholder.com/300x200?text=Imagen+no+disponible'} 
            alt="San Pablo" 
            className="sede-imagen"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=Error+al+cargar+imagen';
            }}
          />
          <ul className="sede-info">
            <li><MapPin size={18} /> Cra.37 # 97-27</li>
            <li><Phone size={18} /> 321 3098504</li>
            <li><Clock size={18} /> Lunes a viernes de 10:30am - 05:30pm</li>
            <li><Home size={18} /> Medellín - Antioquia</li>
          </ul>
          <button className="sede-boton" onClick={() => abrirMapa('sanPablo')}>Mapa</button>
          {renderMapa('sanPablo')}
        </div>

        <div className="sede">
          <h3 className="sede-nombre">SAN BENITO</h3>
          <img 
            src={imagenes[2] || 'https://via.placeholder.com/300x200?text=Imagen+no+disponible'} 
            alt="San Benito" 
            className="sede-imagen"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=Error+al+cargar+imagen';
            }}
          />
          <ul className="sede-info">
            <li><MapPin size={18} /> Cra.37 # 97-27</li>
            <li><Phone size={18} /> 321 3098504</li>
            <li><Clock size={18} /> Lunes a viernes de 10:30am - 05:30pm</li>
            <li><Home size={18} /> Medellín - Antioquia</li>
          </ul>
          <button className="sede-boton" onClick={() => abrirMapa('sanBenito')}>Mapa</button>
          {renderMapa('sanBenito')}
        </div>
      </div>
    </div>
  );
}

export default Sedes;