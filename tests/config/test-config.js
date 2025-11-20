// tests/config/test-config.js
// Configuración para los tests de Playwright

export const testConfig = {
  // ⚠️ CREDENCIALES DE USUARIO DE PRUEBA
  // IMPORTANTE: Crea un usuario específico para tests en tu base de datos
  admin: {
    email: 'julianaaquinterom@gmail.com',     // Usuario admin para tests
    password: 'Juliana192024@',                 // Contraseña del admin de test
    codigoVerificacion: '000000'               // Código fijo para tests (si aplica)
  },
  
  cliente: {
    email: 'test.cliente@deliciasoft.com',    // Usuario cliente para tests
    password: 'TestCliente123!',
    codigoVerificacion: '000000'
  },
  
  // URLs principales
  urls: {
    base: 'http://localhost:3000',
    login: '/',
    adminDashboard: '/admin/pages/Dashboard',
    clientes: '/admin/pages/Clientes',
    productos: '/admin/pages/Productos',
    ventas: '/admin/pages/Ventas'
  },
  
  // Timeouts (en milisegundos)
  timeouts: {
    default: 10000,
    navigation: 30000,
    apiCall: 15000,
    codigoVerificacion: 60000  // Tiempo máximo para recibir código
  },
  
  // Selectores comunes (para facilitar mantenimiento)
  selectors: {
    login: {
      emailInput: 'input[type="email"], input[name="email"]',
      passwordInput: 'input[type="password"], input[name="password"]',
      submitButton: 'button[type="submit"]',
      modalCodigo: 'text=Verificar',
      codigoInputs: (index) => `#code-${index}`,
      verificarButton: 'button:has-text("Verificar")'
    },
    clientes: {
      titulo: 'h2:has-text("Gestión de Clientes")',
      addButton: 'button:has-text("+ Agregar")',
      searchInput: 'input[placeholder*="Buscar"]',
      table: '.admin-table',
      modal: {
        title: '.modal-title',
        cancelButton: 'button:has-text("Cancelar")',
        saveButton: 'button:has-text("Guardar")'
      }
    }
  },
  
  // Configuración del backend de pruebas
  backend: {
    // Si tu backend tiene un endpoint para generar códigos de test
    apiBaseUrl: 'https://deliciasoft-backend-i6g9.onrender.com/api',
    
    // Headers comunes
    headers: {
      'Content-Type': 'application/json'
    }
  }
};

// Función helper para obtener código de verificación en tests
export async function obtenerCodigoVerificacionTest(email) {
  // OPCIÓN 1: Usar código fijo para tests
  return testConfig.admin.codigoVerificacion;
  
  // OPCIÓN 2: Llamar a un endpoint de tu API que retorne el código
  // (Útil si implementas un endpoint /api/test/get-verification-code/:email)
  /*
  try {
    const response = await fetch(`${testConfig.backend.apiBaseUrl}/test/get-verification-code/${email}`);
    const data = await response.json();
    return data.codigo;
  } catch (error) {
    console.error('Error obteniendo código de test:', error);
    return testConfig.admin.codigoVerificacion; // Fallback
  }
  */
}

export default testConfig;