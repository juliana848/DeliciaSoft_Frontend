// src/utils/validadorDirecciones.js
// Validador de direcciones para Medellín, Colombia

/**
 * Valida si una dirección tiene el formato típico de Medellín
 * Formatos válidos:
 * - Calle/Carrera + Número + # + Número + - + Número
 * - Ej: Calle 10 #20-30, Carrera 45 #67-89, Cra 80 #50A-25
 * - También acepta direcciones con información adicional después
 */
export const validarDireccionMedellin = (direccion) => {
  if (!direccion || typeof direccion !== 'string') {
    return {
      valida: false,
      mensaje: 'La dirección es requerida'
    };
  }

  const dir = direccion.trim();

  // Mínimo de caracteres
  if (dir.length < 8) {
    return {
      valida: false,
      mensaje: 'La dirección es muy corta'
    };
  }

  // Patrón flexible para direcciones de Medellín
  // Acepta: Calle, Carrera, Cra, Cl, Transversal, Diagonal, Circular, Avenida, etc.
  // Puede tener información adicional después (barrio, comuna, etc.)
  const patronDireccion = /^(Calle|Carrera|Cra\.?|Cl\.?|Transversal|Tv\.?|Diagonal|Dg\.?|Circular|Cir\.?|Avenida|Av\.?)\s*\d+[A-Za-z]?\s*(#|No\.?|Nro\.?)?\s*\d+[A-Za-z]?(\s*[-]\s*\d+[A-Za-z]?)?/i;

  if (!patronDireccion.test(dir)) {
    return {
      valida: false,
      mensaje: 'Formato de dirección inválido. Use formato: Calle/Carrera # Número - Número (Ej: Calle 10 #20-30)'
    };
  }

  // Validar rangos razonables para Medellín
  const partes = dir.match(/\d+/g);
  if (partes && partes.length >= 2) {
    const primerNumero = parseInt(partes[0]);
    const segundoNumero = parseInt(partes[1]);

    // Calles y carreras de Medellín generalmente van de 1 a 150
    if (primerNumero > 150 || segundoNumero > 150) {
      return {
        valida: false,
        mensaje: 'Los números de calle/carrera parecen estar fuera del rango de Medellín'
      };
    }

    if (primerNumero === 0 || segundoNumero === 0) {
      return {
        valida: false,
        mensaje: 'Los números de dirección deben ser mayores a 0'
      };
    }
  }

  return {
    valida: true,
    mensaje: 'Dirección válida'
  };
};

/**
 * Normaliza una dirección al formato estándar
 */
export const normalizarDireccion = (direccion) => {
  if (!direccion) return '';

  let dir = direccion.trim();

  // Normalizar abreviaturas
  dir = dir.replace(/^Cra\b\.?/i, 'Carrera');
  dir = dir.replace(/^Cl\b\.?/i, 'Calle');
  dir = dir.replace(/^Tv\b\.?/i, 'Transversal');
  dir = dir.replace(/^Dg\b\.?/i, 'Diagonal');
  dir = dir.replace(/^Cir\b\.?/i, 'Circular');

  // Capitalizar primera letra
  dir = dir.charAt(0).toUpperCase() + dir.slice(1).toLowerCase();

  // Normalizar espacios alrededor de # y -
  dir = dir.replace(/\s*#\s*/g, ' #');
  dir = dir.replace(/\s*-\s*/g, '-');

  return dir;
};

/**
 * Barrios conocidos de Medellín para validación adicional (opcional)
 */
export const barriosMedellin = [
  'Poblado', 'Laureles', 'Belén', 'Envigado', 'Sabaneta', 'Itagüí',
  'La Candelaria', 'Buenos Aires', 'La América', 'San Javier',
  'El Poblado', 'Estadio', 'Castilla', 'Manrique', 'Aranjuez',
  'Villa Hermosa', 'Robledo', 'Santa Cruz', 'Popular', 'San Antonio de Prado',
  'Guayabal', 'Belencito', 'Conquistadores', 'Calasanz', 'Las Palmas'
];

/**
 * Valida si el texto contiene un barrio conocido de Medellín
 */
export const contieneBarrioMedellin = (direccion) => {
  if (!direccion) return false;
  
  const dirLower = direccion.toLowerCase();
  return barriosMedellin.some(barrio => 
    dirLower.includes(barrio.toLowerCase())
  );
};

/**
 * Función principal de validación completa
 */
export const validarDireccionCompleta = (direccion, opciones = {}) => {
  const { 
    requiereBarrio = false,
    normalizarAutomaticamente = true 
  } = opciones;

  // Validación básica de formato
  const validacionBasica = validarDireccionMedellin(direccion);
  
  if (!validacionBasica.valida) {
    return validacionBasica;
  }

  // Validación opcional de barrio
  if (requiereBarrio && !contieneBarrioMedellin(direccion)) {
    return {
      valida: false,
      mensaje: 'La dirección debe incluir un barrio de Medellín',
      direccionNormalizada: normalizarAutomaticamente ? normalizarDireccion(direccion) : direccion
    };
  }

  return {
    valida: true,
    mensaje: 'Dirección válida',
    direccionNormalizada: normalizarAutomaticamente ? normalizarDireccion(direccion) : direccion
  };
};