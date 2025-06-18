// components/AdicionesView.jsx
import React, { useState } from 'react';

const AdicionesView = ({ selectedItems, onItemToggle, onContinue, onBack }) => {
  const [adiciones] = useState([
    {
      id: 1,
      nombre: 'Nutella',
      imagen: 'https://i.pinimg.com/736x/b4/51/15/b45115c6e7e713389ea73f79127aed78.jpg',
      precio: 3000
    },
    {
      id: 2,
      nombre: 'Chispas de Colores',
      imagen: 'https://i.pinimg.com/736x/8b/6d/40/8b6d40ca5b18d59b11ad2d2d3f061a88.jpg',
      precio: 1200
    },
    {
      id: 3,
      nombre: 'Oreo',
      imagen: 'https://i.pinimg.com/736x/19/84/ee/1984eefed011f2db17a53d7ba24b5838.jpg',
      precio: 1500
    },
    {
      id: 4,
      nombre: 'Coco Rallado',
      imagen: 'https://i.pinimg.com/736x/7b/39/af/7b39af1d06e365be340df9b5d3708c90.jpg',
      precio: 1000
    },
    {
      id: 5,
      nombre: 'Crema Chantilly',
      imagen: 'https://i.pinimg.com/736x/a5/4f/73/a54f7307469891f136216ed6041a594e.jpg',
      precio: 2000
    },
    {
      id: 6,
      nombre: 'Fresas',
      imagen: 'https://i.pinimg.com/736x/fb/62/56/fb6256e1223051ad0cc1e4f6dbdb3319.jpg',
      precio: 2500
    }
  ]);

  const calcularTotalAdiciones = () => {
    return selectedItems.reduce((total, item) => total + item.precio, 0);
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#2c3e50',
          marginBottom: '10px',
          background: 'linear-gradient(45deg, #e91e63, #ff6b9d)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Selecciona Adiciones
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
          Agrega sabores únicos a tu pedido
        </p>
      </div>

      {/* Lista de adiciones */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '25px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          {adiciones.map(adicion => {
            const isSelected = selectedItems.some(item => item.id === adicion.id);
            
            return (
              <div 
                key={adicion.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '15px',
                  margin: '10px 0',
                  border: isSelected ? '2px solid #e91e63' : '2px solid #ecf0f1',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: isSelected ? '#fce4ec' : '#f8f9fa',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  boxShadow: isSelected ? '0 4px 15px rgba(233,30,99,0.2)' : '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onClick={() => onItemToggle(adicion)}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <img 
                    src={adicion.imagen} 
                    alt={adicion.nombre} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/60x60/E0E0E0/757575?text=${adicion.nombre.charAt(0)}`;
                    }}
                  />
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#2c3e50', 
                    margin: '0 0 5px 0' 
                  }}>
                    {adicion.nombre}
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#e91e63', 
                    fontWeight: '600',
                    margin: 0 
                  }}>
                    ${adicion.precio.toLocaleString()}
                  </p>
                </div>
                
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  border: isSelected ? '2px solid #e91e63' : '2px solid #bdc3c7',
                  backgroundColor: isSelected ? '#e91e63' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? 'white' : '#bdc3c7',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}>
                  {isSelected && '✓'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen de selección */}
      {selectedItems.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#2c3e50',
            marginBottom: '15px',
            margin: '0 0 15px 0'
          }}>
            Adiciones Seleccionadas ({selectedItems.length})
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            {selectedItems.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #ecf0f1'
              }}>
                <span style={{ fontSize: '14px', color: '#2c3e50' }}>{item.nombre}</span>
                <span style={{ fontSize: '14px', color: '#e91e63', fontWeight: '600' }}>
                  ${item.precio.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '15px',
            borderTop: '2px solid #ecf0f1',
            fontWeight: 'bold'
          }}>
            <span style={{ fontSize: '16px', color: '#2c3e50' }}>Total Adiciones:</span>
            <span style={{ fontSize: '16px', color: '#e91e63' }}>
              ${calcularTotalAdiciones().toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Botones de navegación */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '15px'
      }}>
        <button 
          onClick={onBack}
          style={{
            padding: '15px 25px',
            border: 'none',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            backgroundColor: '#95a5a6',
            color: 'white',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(149,165,166,0.3)'
          }}
        >
          ← Anterior
        </button>
        
        <button 
          onClick={onContinue}
          style={{
            padding: '15px 25px',
            border: 'none',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            background: 'linear-gradient(45deg, #e91e63, #ff6b9d)',
            color: 'white',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(233,30,99,0.3)'
          }}
        >
          Continuar →
        </button>
      </div>
    </div>
  );
};

export default AdicionesView;