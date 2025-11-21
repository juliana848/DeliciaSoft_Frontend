// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // 🔥 IGNORAR archivos que no queremos ejecutar
  testIgnore: [
    '**/node_modules/**', 
    '**/src/**', 
    '**/*.test.js', 
    '**/*.test.jsx',
    '**/debug-login.spec.js',          
    '**/clientes.spec.js',            
    '**/clientes-validations.spec.js', 
  ],
  
  // 🔥 SOLO ejecutar archivos específicos
  testMatch: [
    '**/login.spec.js',           
    '**/clientes-form.spec.js'    
  ],
  
  timeout: 60 * 1000,
  
  expect: {
    timeout: 10000
  },
  
  // 🔥 IMPORTANTE: NO ejecutar en paralelo para mantener sesión
  fullyParallel: false,
  workers: 1,
  
  forbidOnly: !!process.env.CI,
  retries: 0, // Sin reintentos para tests más rápidos
  
  reporter: [
    ['html'],
    ['list']
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'on',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
    ignoreHTTPSErrors: true,
    
    // 🔥 GUARDAR ESTADO DE LA SESIÓN
    storageState: undefined, // Esto permite que la sesión persista
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});