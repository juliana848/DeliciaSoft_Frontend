// tests/debug-login.spec.js
// Test para debuggear el proceso de login con código de verificación

import { test, expect } from '@playwright/test';
import { loginConCodigo } from './utils/helpers.js';

test.describe('DEBUG: Proceso de Login', () => {
  
  test('1. Analizar página de login', async ({ page }) => {
    console.log('\n🔍 === ANALIZANDO PÁGINA DE LOGIN ===\n');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log('🌐 URL actual:', currentUrl);
    
    // Screenshot de la página
    await page.screenshot({ path: 'debug-1-login-page.png', fullPage: true });
    console.log('📸 Screenshot: debug-1-login-page.png');
    
    // Buscar inputs de email
    console.log('\n📧 Campos de email:');
    const emailInputs = await page.locator('input[type="email"]').all();
    console.log(`   Encontrados: ${emailInputs.length}`);
    
    for (let i = 0; i < emailInputs.length; i++) {
      const input = emailInputs[i];
      const name = await input.getAttribute('name').catch(() => 'N/A');
      const placeholder = await input.getAttribute('placeholder').catch(() => 'N/A');
      console.log(`   [${i}] name="${name}", placeholder="${placeholder}"`);
    }
    
    // Buscar inputs de contraseña
    console.log('\n🔒 Campos de contraseña:');
    const passwordInputs = await page.locator('input[type="password"]').all();
    console.log(`   Encontrados: ${passwordInputs.length}`);
    
    // Buscar botones
    console.log('\n🔘 Botones disponibles:');
    const buttons = await page.locator('button').all();
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const text = await buttons[i].textContent();
      const type = await buttons[i].getAttribute('type').catch(() => 'N/A');
      console.log(`   [${i}] type="${type}", text="${text?.trim()}"`);
    }
    
    console.log('\n✅ Análisis completo\n');
  });
  
  test('2. Probar llenado de formulario', async ({ page }) => {
    console.log('\n📝 === PROBANDO LLENADO DE FORMULARIO ===\n');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const testEmail = 'test@deliciasoft.com';
    const testPassword = 'Test123!';
    
    // Llenar email
    console.log(`📧 Llenando email: ${testEmail}`);
    const emailInput = await page.locator('input[type="email"]').first();
    await emailInput.fill(testEmail);
    
    const emailValue = await emailInput.inputValue();
    console.log(`   ✅ Email ingresado: ${emailValue}`);
    
    // Llenar contraseña
    console.log(`🔒 Llenando contraseña: ${'*'.repeat(testPassword.length)}`);
    const passwordInput = await page.locator('input[type="password"]').first();
    await passwordInput.fill(testPassword);
    
    const passwordValue = await passwordInput.inputValue();
    console.log(`   ✅ Contraseña ingresada: ${'*'.repeat(passwordValue.length)}`);
    
    // Screenshot del formulario lleno
    await page.screenshot({ path: 'debug-2-form-filled.png', fullPage: true });
    console.log('📸 Screenshot: debug-2-form-filled.png');
    
    console.log('\n✅ Formulario llenado correctamente\n');
  });
  
  test('3. Probar click en botón de login', async ({ page }) => {
    console.log('\n🔘 === PROBANDO CLICK EN LOGIN ===\n');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Llenar formulario
    await page.locator('input[type="email"]').first().fill('test@deliciasoft.com');
    await page.locator('input[type="password"]').first().fill('Test123!');
    
    // Hacer click en login
    console.log('🔘 Haciendo click en botón de login...');
    const loginButton = await page.locator('button[type="submit"]').first();
    await loginButton.click();
    
    // Esperar un momento
    await page.waitForTimeout(3000);
    
    // Ver qué apareció
    const currentUrl = page.url();
    console.log('🌐 URL después del click:', currentUrl);
    
    // Buscar modal de código
    const modalVisible = await page.locator('text=Verificar').isVisible().catch(() => false);
    console.log('📱 Modal de código visible:', modalVisible);
    
    if (modalVisible) {
      console.log('✅ Modal de verificación apareció correctamente');
      
      // Buscar inputs de código
      const codeInputs = await page.locator('[id^="code-"]').all();
      console.log(`🔢 Inputs de código encontrados: ${codeInputs.length}`);
      
      await page.screenshot({ path: 'debug-3-modal-codigo.png', fullPage: true });
      console.log('📸 Screenshot: debug-3-modal-codigo.png');
    } else {
      console.log('❌ Modal de verificación NO apareció');
      await page.screenshot({ path: 'debug-3-no-modal.png', fullPage: true });
      console.log('📸 Screenshot: debug-3-no-modal.png');
    }
    
    console.log('\n✅ Test de click completado\n');
  });
  
  test('4. Probar login completo con código', async ({ page }) => {
    console.log('\n🔐 === PROBANDO LOGIN COMPLETO ===\n');
    
    try {
      await loginConCodigo(page, 'test@deliciasoft.com', 'Test123!');
      console.log('✅ Login completado exitosamente');
      
      // Verificar que estamos en el admin
      const currentUrl = page.url();
      console.log('🌐 URL final:', currentUrl);
      
      expect(currentUrl).toContain('admin');
      
    } catch (error) {
      console.error('❌ Error en login:', error.message);
      await page.screenshot({ path: 'debug-4-login-error.png', fullPage: true });
      throw error;
    }
  });
  
  test('5. Verificar acceso a página de clientes', async ({ page }) => {
    console.log('\n👥 === VERIFICANDO ACCESO A CLIENTES ===\n');
    
    // Login primero
    await loginConCodigo(page, 'test@deliciasoft.com', 'Test123!');
    
    // Navegar a clientes
    console.log('📍 Navegando a /admin/pages/Clientes');
    await page.goto('/admin/pages/Clientes');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log('🌐 URL actual:', currentUrl);
    
    // Verificar elementos de la página
    const titulo = await page.locator('h2:has-text("Gestión de Clientes")').isVisible().catch(() => false);
    const botonAgregar = await page.locator('button:has-text("+ Agregar")').isVisible().catch(() => false);
    const tabla = await page.locator('.admin-table').isVisible().catch(() => false);
    
    console.log('📋 Elementos encontrados:');
    console.log(`   - Título: ${titulo}`);
    console.log(`   - Botón Agregar: ${botonAgregar}`);
    console.log(`   - Tabla: ${tabla}`);
    
    await page.screenshot({ path: 'debug-5-clientes-page.png', fullPage: true });
    console.log('📸 Screenshot: debug-5-clientes-page.png');
    
    expect(titulo).toBe(true);
    expect(botonAgregar).toBe(true);
    
    console.log('\n✅ Acceso a clientes verificado\n');
  });
});