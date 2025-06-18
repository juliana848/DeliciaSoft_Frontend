// components/ToppingsView.jsx
import React, { useState } from 'react';

const ToppingsView = ({ selectedItems, onItemToggle, onContinue, onBack }) => {
  const [toppings] = useState([
    {
      id: 1,
      nombre: 'Chispas de Chocolate',
      imagen: 'https://i.pinimg.com/736x/76/2c/7b/762c7bc7dac8135a749f7b8b3f8f070e.jpg', //
      precio: 0 // Precio cambiado a 0
    },
    {
      id: 2,
      nombre: 'Granola de Canela',
      imagen: 'https://i.pinimg.com/736x/e5/a7/c4/e5a7c476f1ff55267038774bde297eeb.jpg', //
      precio: 0 // Precio cambiado a 0
    },
    {
      id: 3,
      nombre: 'Maní',
      imagen: 'https://i.pinimg.com/736x/49/13/16/49131610f1afaaef6603c3fe16b943c3.jpg', //
      precio: 0 // Precio cambiado a 0
    },
    {
      id: 4,
      nombre: 'Chispas de colores',
      imagen: 'https://i.pinimg.com/736x/8b/6d/40/8b6d40ca5b18d59b11ad2d2d3f061a88.jpg', //
      precio: 0 // Precio cambiado a 0
    },
    {
      id: 5,
      nombre: 'Oreo',
      imagen: 'https://i.pinimg.com/736x/19/84/ee/1984eefed011f2db17a53d7ba24b5838.jpg', //
      precio: 0 // Precio cambiado a 0
    }
  ]);

  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });

  const showCustomAlert = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const calcularTotalToppings = () => {
    return selectedItems.reduce((total, item) => total + item.precio, 0);
  };

  const handleItemToggle = (topping) => {
    const isSelected = selectedItems.some(item => item.id === topping.id);

    if (isSelected) {
      onItemToggle(topping); // Deselect if already selected
    } else {
      if (selectedItems.length < 3) {
        onItemToggle(topping); // Select if less than 3 are selected
      } else {
        showCustomAlert('error', 'Solo puedes seleccionar un máximo de 3 toppings.');
      }
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
                : 'linear-gradient(135deg, #ec4899, #be185d)',
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
          Selecciona Toppings
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
          Personaliza tu pedido con deliciosos toppings (Máximo 3, ¡son gratis!)
        </p>
      </div>

      {/* Lista de toppings */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '25px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          {toppings.map(topping => {
            const isSelected = selectedItems.some(item => item.id === topping.id);

            return (
              <div
                key={topping.id}
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
                onClick={() => handleItemToggle(topping)}
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
                    src={topping.imagen}
                    alt={topping.nombre}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/60x60/E0E0E0/757575?text=${topping.nombre.charAt(0)}`;
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
                    {topping.nombre}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#e91e63',
                    fontWeight: '600',
                    margin: 0
                  }}>
                    ${topping.precio.toLocaleString()}
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
            Toppings Seleccionados ({selectedItems.length})
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
            <span style={{ fontSize: '16px', color: '#2c3e50' }}>Total Toppings:</span>
            <span style={{ fontSize: '16px', color: '#e91e63' }}>
              ${calcularTotalToppings().toLocaleString()}
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

export default ToppingsView;