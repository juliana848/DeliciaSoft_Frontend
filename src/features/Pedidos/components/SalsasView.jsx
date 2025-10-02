import React, { useState, useEffect } from 'react';

const SalsasView = ({ selectedItems, onItemToggle, onContinue, onBack }) => {
  const [salsas, setSalsas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });

  // Cargar salsas desde la API
  useEffect(() => {
    const cargarSalsas = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://deliciasoft-backend-i6g9.onrender.com/api/catalogo-relleno', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar salsas');
        }

        const data = await response.json();
        const salsasActivas = data
          .filter(salsa => salsa.estado === true)
          .map(salsa => ({
            id: salsa.idsalsa,
            nombre: salsa.nombre,
            imagen: salsa.imagen || 'https://via.placeholder.com/60x60/E0E0E0/757575?text=S',
            precio: parseFloat(salsa.precioadicion || 0)
          }));

        setSalsas(salsasActivas);
        setError(null);
      } catch (err) {
        console.error('Error al cargar salsas:', err);
        setError('No se pudieron cargar las salsas');
        setSalsas([]);
      } finally {
        setLoading(false);
      }
    };

    cargarSalsas();
  }, []);

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
      onItemToggle(salsa);
    } else {
      if (selectedItems.length === 2) {
        showCustomAlert('info', 'A partir de la tercera salsa, cada una tendrá un costo adicional.');
      }
      onItemToggle(salsa);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #e91e63',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#6c757d' }}>Cargando salsas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h3 style={{ color: '#e91e63', marginBottom: '15px' }}>{error}</h3>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: '#e91e63',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
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
            background: showAlert.type === 'info'
              ? 'linear-gradient(135deg, #e91e63, #f06292)'
              : 'linear-gradient(135deg, #dc3545, #e85a67)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            animation: 'slideInRight 0.5s ease-out'
          }}
        >
          {showAlert.message}
        </div>
      )}

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

      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '25px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        {salsas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
            <p style={{ color: '#6c757d' }}>No hay salsas disponibles</p>
          </div>
        ) : (
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
        )}
      </div>

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

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default SalsasView;