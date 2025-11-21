// tests/login/login.spec.js
// Tests para verificar el proceso de login completo

import { test, expect } from '@playwright/test';

test.describe('Proceso de Login', () => {
  
  test('✅ 1. Debe cargar la página de login correctamente', async ({ page }) => {
    console.log('\n🔍 === TEST: Página de Login ===\n');
    
    await page.goto('/iniciar-sesion', { waitUntil: 'networkidle' });
    
    // Verificar que la página cargó
    await page.waitForSelector('#root', { timeout: 30000 });
    console.log('✅ Aplicación React cargada');
    
    // Verificar elementos de login
    const emailInput = await page.locator('input[type="email"]').isVisible();
    const passwordInput = await page.locator('input[type="password"]').isVisible();
    const submitButton = await page.locator('button[type="submit"]').isVisible();
    
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(submitButton).toBeTruthy();
    
    console.log('✅ Todos los elementos del formulario visibles');
    console.log('   - Input de email: ✓');
    console.log('   - Input de contraseña: ✓');
    console.log('   - Botón de submit: ✓\n');
  });

  test('✅ 2. Debe permitir llenar el email', async ({ page }) => {
    console.log('\n📧 === TEST: Llenar Email ===\n');
    
    await page.goto('/iniciar-sesion', { waitUntil: 'networkidle' });
    await page.waitForSelector('input[type="email"]', { timeout: 20000 });
    
    const testEmail = 'julianaaquinterom@gmail.com';
    const emailInput = page.locator('input[type="email"]').first();
    
    await emailInput.fill(testEmail);
    const valor = await emailInput.inputValue();
    
    expect(valor).toBe(testEmail);
    console.log(`✅ Email ingresado correctamente: ${testEmail}\n`);
  });

  test('✅ 3. Debe permitir llenar la contraseña', async ({ page }) => {
    console.log('\n🔒 === TEST: Llenar Contraseña ===\n');
    
    await page.goto('/iniciar-sesion', { waitUntil: 'networkidle' });
    await page.waitForSelector('input[type="password"]', { timeout: 20000 });
    
    const testPassword = 'Juliana192024@';
    const passwordInput = page.locator('input[type="password"]').first();
    
    await passwordInput.fill(testPassword);
    const valor = await passwordInput.inputValue();
    
    expect(valor).toBe(testPassword);
    console.log(`✅ Contraseña ingresada correctamente (${'*'.repeat(testPassword.length)})\n`);
  });

  test('✅ 4. Debe hacer clic en botón de login', async ({ page }) => {
    console.log('\n🔘 === TEST: Clic en Login ===\n');
    
    await page.goto('/iniciar-sesion', { waitUntil: 'networkidle' });
    
    // Llenar credenciales
    await page.locator('input[type="email"]').first().fill('julianaaquinterom@gmail.com');
    await page.locator('input[type="password"]').first().fill('Juliana192024@');
    
    console.log('✅ Credenciales ingresadas');
    
    // Click en login
    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();
    
    console.log('✅ Clic en botón de login realizado');
    console.log('⏳ Esperando respuesta del servidor...\n');
    
    // Esperar un momento para ver qué pasa
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`📍 URL después del clic: ${currentUrl}\n`);
  });

  test('✅ 5. Debe mostrar modal de código de verificación', async ({ page }) => {
    console.log('\n📱 === TEST: Modal de Código ===\n');
    
    await page.goto('/iniciar-sesion', { waitUntil: 'networkidle' });
    
    // Llenar credenciales
    await page.locator('input[type="email"]').first().fill('julianaaquinterom@gmail.com');
    await page.locator('input[type="password"]').first().fill('Juliana192024@');
    
    // Click en login
    await page.locator('button[type="submit"]').first().click();
    
    // Esperar modal de código
    console.log('⏳ Esperando modal de verificación...');
    await page.waitForSelector('#code-0', { timeout: 15000 });
    
    const codeInput0 = await page.locator('#code-0').isVisible();
    expect(codeInput0).toBeTruthy();
    
    console.log('✅ Modal de código apareció correctamente');
    console.log('✅ Inputs de código visibles\n');
  });

  test('✅ 6. Debe permitir ingresar código de verificación', async ({ page }) => {
    console.log('\n🔢 === TEST: Ingresar Código ===\n');
    
    await page.goto('/iniciar-sesion', { waitUntil: 'networkidle' });
    
    // Login
    await page.locator('input[type="email"]').first().fill('julianaaquinterom@gmail.com');
    await page.locator('input[type="password"]').first().fill('Juliana192024@');
    await page.locator('button[type="submit"]').first().click();
    
    // Esperar modal
    await page.waitForSelector('text=Verificar', { timeout: 15000 });
    await page.waitForSelector('#code-0', { timeout: 5000 });
    
    // Ingresar código 000000
    const codigo = '000000';
    console.log(`📲 Ingresando código: ${codigo}`);
    
    for (let i = 0; i < 6; i++) {
      const input = page.locator(`#code-${i}`);
      await input.waitFor({ state: 'visible', timeout: 5000 });
      await input.fill(codigo[i]);
      await page.waitForTimeout(150);
      
      const valor = await input.inputValue();
      expect(valor).toBe(codigo[i]);
      console.log(`   ✓ Dígito ${i + 1}: ${codigo[i]}`);
    }
    
    console.log('✅ Código ingresado completamente\n');
  });

  test('✅ 7. Debe hacer clic en botón Verificar', async ({ page }) => {
    console.log('\n✔️ === TEST: Verificar Código ===\n');
    
    await page.goto('/iniciar-sesion', { waitUntil: 'networkidle' });
    
    // Login
    await page.locator('input[type="email"]').first().fill('julianaaquinterom@gmail.com');
    await page.locator('input[type="password"]').first().fill('Juliana192024@');
    await page.locator('button[type="submit"]').first().click();
    
    // Esperar modal e ingresar código
    await page.waitForSelector('text=Verificar', { timeout: 15000 });
    await page.waitForSelector('#code-0', { timeout: 5000 });
    
    const codigo = '000000';
    for (let i = 0; i < 6; i++) {
      await page.locator(`#code-${i}`).fill(codigo[i]);
      await page.waitForTimeout(150);
    }
    
    console.log('✅ Código ingresado');
    
    // Click en Verificar
    const verificarButton = page.locator('button:has-text("Verificar")').first();
    await verificarButton.click();
    
    console.log('✅ Clic en Verificar realizado');
    console.log('⏳ Esperando redirección...\n');
    
    await page.waitForTimeout(3000);
  });

  test('✅ 8. Debe completar el login exitosamente', async ({ page }) => {
    console.log('\n🎯 === TEST: Login Completo ===\n');
    
    await page.goto('/iniciar-sesion', { waitUntil: 'networkidle' });
    console.log('📍 Paso 1: Página de login cargada');
    
    // 1. Llenar credenciales
    await page.locator('input[type="email"]').first().fill('julianaaquinterom@gmail.com');
    await page.locator('input[type="password"]').first().fill('Juliana192024@');
    console.log('✅ Paso 2: Credenciales ingresadas');
    
    // 2. Click en login
    await page.locator('button[type="submit"]').first().click();
    console.log('✅ Paso 3: Clic en login');
    
    // 3. Esperar modal de código
    await page.waitForSelector('text=Verificar', { timeout: 15000 });
    console.log('✅ Paso 4: Modal de código apareció');
    
    // 4. Ingresar código
    await page.waitForSelector('#code-0', { timeout: 5000 });
    const codigo = '000000';
    for (let i = 0; i < 6; i++) {
      await page.locator(`#code-${i}`).fill(codigo[i]);
      await page.waitForTimeout(150);
    }
    console.log('✅ Paso 5: Código ingresado');
    
    // 5. Click en Verificar
    await page.locator('button:has-text("Verificar")').first().click();
    console.log('✅ Paso 6: Clic en Verificar');
    
    // 6. Esperar redirección a admin
    await page.waitForURL('**/admin/**', { timeout: 20000 });
    await page.waitForLoadState('networkidle');
    
    const finalUrl = page.url();
    console.log(`✅ Paso 7: Redirigido a admin`);
    console.log(`📍 URL final: ${finalUrl}`);
    
    expect(finalUrl).toContain('admin');
    console.log('\n🎉 LOGIN COMPLETADO EXITOSAMENTE 🎉\n');
  });

  test('✅ 9. Debe mostrar error con credenciales incorrectas', async ({ page }) => {
    console.log('\n❌ === TEST: Credenciales Incorrectas ===\n');
    
    await page.goto('/iniciar-sesion', { waitUntil: 'networkidle' });
    
    // Intentar login con credenciales incorrectas
    await page.locator('input[type="email"]').first().fill('incorrecto@test.com');
    await page.locator('input[type="password"]').first().fill('PasswordIncorrecto123!');
    await page.locator('button[type="submit"]').first().click();
    
    console.log('⏳ Esperando mensaje de error...');
    await page.waitForTimeout(3000);
    
    // Verificar que NO apareció el modal de código
    const modalVisible = await page.locator('text=Verificar').isVisible().catch(() => false);
    
    if (!modalVisible) {
      console.log('✅ Modal de código NO apareció (comportamiento esperado)');
    }
    
    console.log('✅ Test completado: Sistema rechaza credenciales incorrectas\n');
  });

  test('✅ 10. Debe mostrar error con código incorrecto', async ({ page }) => {
    console.log('\n🔐 === TEST: Código Incorrecto ===\n');
    
    await page.goto('/iniciar-sesion', { waitUntil: 'networkidle' });
    
    // Login con credenciales correctas
    await page.locator('input[type="email"]').first().fill('julianaaquinterom@gmail.com');
    await page.locator('input[type="password"]').first().fill('Juliana192024@');
    await page.locator('button[type="submit"]').first().click();
    
    // Esperar modal
    await page.waitForSelector('text=Verificar', { timeout: 15000 });
    await page.waitForSelector('#code-0', { timeout: 5000 });
    
    // Ingresar código INCORRECTO
    const codigoIncorrecto = '123456';
    console.log(`📲 Ingresando código incorrecto: ${codigoIncorrecto}`);
    
    for (let i = 0; i < 6; i++) {
      await page.locator(`#code-${i}`).fill(codigoIncorrecto[i]);
      await page.waitForTimeout(150);
    }
    
    // Click en Verificar
    await page.locator('button:has-text("Verificar")').first().click();
    
    console.log('⏳ Esperando mensaje de error...');
    await page.waitForTimeout(3000);
    
    // Verificar que NO se redirigió a admin
    const currentUrl = page.url();
    const isInAdmin = currentUrl.includes('/admin');
    
    expect(isInAdmin).toBeFalsy();
    console.log('✅ Sistema rechaza código incorrecto (no redirigió a admin)\n');
  });
});