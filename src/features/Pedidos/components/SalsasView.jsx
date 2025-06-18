// components/SalsasView.jsx
import React, { useState } from 'react';

const SalsasView = ({ selectedItems, onItemToggle, onContinue, onBack }) => {
  const [salsas] = useState([
    {
      id: 1,
      nombre: 'Arequipe',
      imagen: 'https://i.pinimg.com/736x/ed/d3/35/edd3357867f3ccc9b84df746d2941f97.jpg',
      precio: 2500
    },
    {
      id: 2,
      nombre: 'Lechera',
      imagen: 'https://i.pinimg.com/736x/0f/6c/7f/0f6c7f676e02bae61c1ba3f96634dc4a.jpg',
      precio: 2000
    },
    {
      id: 3,
      nombre: 'Salsa de Mora',
      imagen: 'https://i.pinimg.com/736x/3e/ee/58/3eee581de7ecd7962a275100fed03a0f.jpg',
      precio: 2200
    },
    {
      id: 4,
      nombre: 'Salsa de Chocolate',
      imagen: 'https://i.pinimg.com/736x/fd/8d/50/fd8d50f4c111ae95257d79fd16142876.jpg',
      precio: 2800
    },
    {
      id: 5,
      nombre: 'Salsa de Fresa',
      imagen: 'https://i.pinimg.com/736x/5b/88/aa/5b88aa145b8dcfe733b4006b5ff39dba.jpg',
      precio: 2200
    },
    {
      id: 6,
      nombre: 'Caramelo',
      imagen: 'https://i.pinimg.com/736x/d2/f2/36/d2f23694b64c62e240b2b8dbb22b5a6a.jpg',
      precio: 2600
    }
  ]);

  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const calcularTotalSalsas = () => {
    return selectedItems.reduce((total, item) => total + item.precio, 0);
  };

  const handleItemToggle = (salsa) => {
    const isSelected = selectedItems.some(item => item.id === salsa.id);

    if (isSelected) {
      onItemToggle(salsa); // Deselect if already selected
    } else {
      if (selectedItems.length === 2) { // If two salsas are already selected, and user tries to add a third
        showCustomAlert('info', 'A partir de la tercera salsa, cada una tendrá un costo adicional.');
      }
      onItemToggle(salsa); // Always allow selection, the alert is just a warning.
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      {/* Alerta personalizada */}
      {showAlert.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2000,
            padding: '1rem 1.5rem',
            borderRadius: '15px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem',
            minWidth: '300px',
            background:
              showAlert.type === 'success'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : showAlert.type === 'info'
                ? 'linear-gradient(135deg, #2196F3, #1976D2)' // Blue gradient for info
                : 'linear-gradient(135deg, #ec4899, #be185d)', // Default error pink
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            animation: 'slideInRight 0.5s ease-out'
          }}
        >
          {showAlert.message}
        </div>
      )}

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
          Selecciona Salsas
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
          Dale el toque final perfecto a tu pedido
        </p>
      </div>

      {/* Lista de salsas */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '25px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          {salsas.map(salsa => {
            const isSelected = selectedItems.some(item => item.id === salsa.id);

            return (
              <div
                key={salsa.id}
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
                onClick={() => handleItemToggle(salsa)}
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
                    src={salsa.imagen}
                    alt={salsa.nombre}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/60x60/E0E0E0/757575?text=${salsa.nombre.charAt(0)}`;
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
                    {salsa.nombre}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#e91e63',
                    fontWeight: '600',
                    margin: 0
                  }}>
                    ${salsa.precio.toLocaleString()}
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
            Salsas Seleccionadas ({selectedItems.length})
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
            <span style={{ fontSize: '16px', color: '#2c3e50' }}>Total Salsas:</span>
            <span style={{ fontSize: '16px', color: '#e91e63' }}>
              ${calcularTotalSalsas().toLocaleString()}
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

export default SalsasView;