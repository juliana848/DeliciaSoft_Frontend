// tests/utils/helpers.js
// Funciones auxiliares para los tests

/**
 * Genera un número de documento único para tests
 */
export function generarDocumentoUnico() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

/**
 * Genera un correo único para tests
 */
export function generarCorreoUnico() {
  const timestamp = Date.now();
  return `test.${timestamp}@playwright.com`;
}

/**
 * Genera un celular único para tests
 */
export function generarCelularUnico() {
  return `300${Math.floor(1000000 + Math.random() * 9000000)}`;
}

/**
 * Espera a que desaparezca un loader/spinner
 */
export async function esperarCarga(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.loading-spinner', { state: 'hidden', timeout: 5000 }).catch(() => {});
}

/**
 * Espera a que aparezca una notificación
 */
export async function esperarNotificacion(page, tipo = 'success') {
  await page.waitForSelector(`.notification.${tipo}`, { timeout: 5000 });
}

/**
 * Lee el texto de una notificación
 */
export async function leerNotificacion(page) {
  const notification = await page.locator('.notification').first();
  return await notification.textContent();
}

// 🔥 VARIABLE GLOBAL PARA GUARDAR EL ESTADO DE LOGIN
let isLoggedIn = false;
let loginContext = null;

/**
 * Verifica si ya hay una sesión activa
 */
async function checkIfLoggedIn(page) {
  try {
    // Si la URL contiene /admin, probablemente ya estamos logueados
    const currentUrl = page.url();
    if (currentUrl.includes('/admin')) {
      console.log('✅ Sesión ya activa, saltando login');
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * 🔥 LOGIN CON CÓDIGO FIJO PARA TESTS
 * Credenciales configuradas en Render:
 * - TEST_EMAILS=julianaaquinterom@gmail.com
 * - TEST_VERIFICATION_CODE=000000
 */
export async function loginConCodigo(page, email = 'julianaaquinterom@gmail.com', password = 'Juliana192024@') {
  console.log('🔑 Iniciando login para tests...');
  
  // 🔥 VERIFICAR SI YA ESTAMOS LOGUEADOS
  const alreadyLoggedIn = await checkIfLoggedIn(page);
  if (alreadyLoggedIn && isLoggedIn) {
    console.log('⚡ Ya hay sesión activa, omitiendo login');
    return;
  }
  
  try {
    // 1. 🔥 IR A LA RUTA CORRECTA DE LOGIN
    console.log('🌐 Navegando a /iniciar-sesion...');
    await page.goto('/iniciar-sesion', { waitUntil: 'networkidle' });
    
    // 🔥 ESPERAR A QUE LA APP REACT SE MONTE
    console.log('⏳ Esperando a que React cargue...');
    await page.waitForSelector('#root', { timeout: 30000 });
    await page.waitForTimeout(2000); // Dar tiempo adicional para que React renderice
    
    // Verificar que los campos existen
    console.log('🔍 Buscando formulario de login...');
    await page.waitForSelector('input[type="email"]', { timeout: 20000 });
    await page.waitForSelector('input[type="password"]', { timeout: 20000 });
    console.log('✅ Formulario de login encontrado');
    
    // 2. Llenar formulario
    console.log('📝 Llenando credenciales...');
    const emailInput = await page.locator('input[type="email"]').first();
    await emailInput.fill(email);
    console.log(`   ✓ Email: ${email}`);
    
    const passwordInput = await page.locator('input[type="password"]').first();
    await passwordInput.fill(password);
    console.log(`   ✓ Password: ${'*'.repeat(password.length)}`);
    
    // 3. Click en login
    console.log('🔘 Haciendo clic en botón de login...');
    const loginButton = await page.locator('button[type="submit"]').first();
    await loginButton.click();
    
    // 4. Esperar modal de código
    console.log('⏳ Esperando modal de verificación...');
    await page.waitForSelector('text=Verificar', { timeout: 15000 });
    console.log('✅ Modal de código apareció');
    
    // Esperar a que los inputs de código estén listos
    await page.waitForSelector('#code-0', { timeout: 5000 });
    
    // 5. 🔥 USAR CÓDIGO FIJO 000000
    const codigoFijo = '000000';
    console.log(`🔢 Ingresando código: ${codigoFijo}`);
    
    // 6. Llenar los 6 dígitos
    for (let i = 0; i < 6; i++) {
      const input = await page.locator(`#code-${i}`);
      await input.waitFor({ state: 'visible', timeout: 5000 });
      await input.fill(codigoFijo[i]);
      await page.waitForTimeout(150);
    }
    console.log('✅ Código ingresado');
    
    // 7. Click en Verificar
    console.log('🔘 Verificando código...');
    const verificarButton = await page.locator('button:has-text("Verificar")').first();
    await verificarButton.click();
    
    // 8. Esperar redirección a admin
    console.log('⏳ Esperando redirección...');
    await page.waitForURL('**/admin/**', { timeout: 20000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const finalUrl = page.url();
    console.log('✅ Login exitoso! URL:', finalUrl);
    
    // 🔥 MARCAR COMO LOGUEADO
    isLoggedIn = true;
    
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    
    // Screenshot para debug
    await page.screenshot({ path: 'debug-login-failed.png', fullPage: true });
    console.log('📸 Screenshot: debug-login-failed.png');
    
    // Guardar HTML
    const html = await page.content();
    console.log('📄 HTML (primeros 800 chars):', html.substring(0, 800));
    
    throw new Error(`Login falló: ${error.message}`);
  }
}

/**
 * Navega a la página de clientes (con login automático si es necesario)
 */
export async function navegarAClientes(page) {
  console.log('🔍 Navegando a página de Clientes...');
  
  // 🔥 SIEMPRE HACER LOGIN PRIMERO
  console.log('🔐 Autenticando usuario...');
  await loginConCodigo(page);
  
  // Después del login, ir a clientes
  console.log('🔄 Navegando a /admin/pages/Clientes...');
  await page.goto('/admin/pages/Clientes', { waitUntil: 'networkidle' });
  
  // 🔥 ESPERAR A QUE LA PÁGINA CARGUE COMPLETAMENTE
  await page.waitForTimeout(2000);
  await page.waitForSelector('h2', { timeout: 10000 }).catch(() => {});
  
  const currentUrl = page.url();
  console.log('🌐 URL actual:', currentUrl);
  
  // Verificar título
  const titulo = await page.locator('h2:has-text("Gestión de Clientes")').isVisible({ timeout: 5000 }).catch(() => false);
  
  if (titulo) {
    console.log('✅ Página de Clientes cargada correctamente');
  } else {
    console.warn('⚠️ Título no visible - Esperando más tiempo...');
    await page.waitForTimeout(2000);
    
    // Tomar screenshot para debug
    await page.screenshot({ path: 'debug-clientes-page.png', fullPage: true });
    console.log('📸 Screenshot guardado para análisis');
  }
}

/**
 * Abre el modal de agregar cliente
 */
export async function abrirModalAgregar(page) {
  console.log('➕ Abriendo modal de agregar cliente...');
  
  // Esperar a que el botón esté disponible
  await page.waitForSelector('button:has-text("+ Agregar")', { timeout: 10000 });
  await page.click('button:has-text("+ Agregar")');
  
  // Esperar a que el modal aparezca
  await page.waitForSelector('.modal-title:has-text("Agregar Cliente")', { timeout: 10000 });
  
  // Esperar a que los campos estén disponibles
  await page.waitForTimeout(500);
  
  console.log('✅ Modal abierto correctamente');
}

/**
 * Llena el formulario de cliente
 */
export async function llenarFormularioCliente(page, datos) {
  console.log('📝 Llenando formulario de cliente...');
  
  if (datos.tipoDocumento) {
    await page.selectOption('select', datos.tipoDocumento);
  }
  
  if (datos.numeroDocumento) {
    await page.fill('input[type="text"]', datos.numeroDocumento);
  }
  
  if (datos.nombre) {
    const nombreInputs = await page.locator('input[type="text"]').all();
    if (nombreInputs[1]) await nombreInputs[1].fill(datos.nombre);
  }
  
  if (datos.apellido) {
    const apellidoInputs = await page.locator('input[type="text"]').all();
    if (apellidoInputs[2]) await apellidoInputs[2].fill(datos.apellido);
  }
  
  if (datos.correo) {
    await page.fill('input[type="email"]', datos.correo);
  }
  
  if (datos.celular) {
    const celularInputs = await page.locator('input[type="text"]').all();
    await celularInputs[3].fill(datos.celular);
  }
  
  if (datos.contrasena) {
    const contrasenaInputs = await page.locator('input[type="password"]').all();
    if (contrasenaInputs[0]) await contrasenaInputs[0].fill(datos.contrasena);
  }
  
  if (datos.confirmarContrasena) {
    const contrasenaInputs = await page.locator('input[type="password"]').all();
    if (contrasenaInputs[1]) await contrasenaInputs[1].fill(datos.confirmarContrasena);
  }
  
  if (datos.fechaNacimiento) {
    await page.fill('input[type="date"]', datos.fechaNacimiento);
  }
  
  if (datos.direccion) {
    const direccionInput = await page.locator('input[placeholder*="Cra"]').first();
    await direccionInput.fill(datos.direccion);
  }
  
  if (datos.barrio) {
    const inputs = await page.locator('input[type="text"]').all();
    for (const input of inputs) {
      const label = await input.evaluate(el => {
        const parent = el.closest('.modal-field');
        return parent?.querySelector('label')?.textContent || '';
      });
      if (label.includes('Barrio')) {
        await input.fill(datos.barrio);
        break;
      }
    }
  }
  
  if (datos.ciudad) {
    const inputs = await page.locator('input[type="text"]').all();
    for (const input of inputs) {
      const label = await input.evaluate(el => {
        const parent = el.closest('.modal-field');
        return parent?.querySelector('label')?.textContent || '';
      });
      if (label.includes('Ciudad')) {
        await input.fill(datos.ciudad);
        break;
      }
    }
  }
  
  console.log('✅ Formulario llenado');
}

/**
 * Guarda el formulario
 */
export async function guardarFormulario(page) {
  console.log('💾 Guardando formulario...');
  await page.click('button:has-text("Guardar")');
}

/**
 * Busca un cliente en la tabla
 */
export async function buscarCliente(page, termino) {
  console.log(`🔍 Buscando cliente: ${termino}`);
  await page.fill('input[placeholder*="Buscar"]', termino);
  await page.waitForTimeout(500); // Esperar debounce
}

/**
 * Obtiene el número de filas en la tabla
 */
export async function contarFilasTabla(page) {
  const filas = await page.locator('.admin-table tbody tr').count();
  console.log(`📊 Filas en tabla: ${filas}`);
  return filas;
}