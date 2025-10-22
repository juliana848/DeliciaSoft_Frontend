const BASE_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/configuracion-producto";

class ConfiguracionProductoService {
  constructor() {
    this.baseHeaders = { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
  }

  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('Error de la API:', errorData);
      } catch (e) {
        console.error('No se pudo parsear la respuesta de error');
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  // Obtener configuración por ID de producto
  async obtenerPorProducto(idProducto) {
    try {
      console.log(`🔍 Obteniendo configuración del producto ${idProducto}...`);
      
      const response = await fetch(`${BASE_URL}/producto/${idProducto}`, {
        method: "GET",
        headers: this.baseHeaders,
      });
      
      const data = await this.handleResponse(response);
      console.log('✅ Configuración obtenida:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener configuración:', error);
      throw error;
    }
  }

  // Crear o actualizar configuración
  async guardarConfiguracion(configuracion) {
    try {
      console.log('💾 Guardando configuración:', JSON.stringify(configuracion, null, 2));
      
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: this.baseHeaders,
        body: JSON.stringify(configuracion),
      });
      
      const data = await this.handleResponse(response);
      console.log('✅ Configuración guardada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al guardar configuración:', error);
      throw error;
    }
  }

  // Eliminar configuración
  async eliminarConfiguracion(idProducto) {
    try {
      console.log(`🗑️ Eliminando configuración del producto ${idProducto}...`);
      
      const response = await fetch(`${BASE_URL}/producto/${idProducto}`, {
        method: "DELETE",
        headers: this.baseHeaders,
      });
      
      const data = await this.handleResponse(response);
      console.log('✅ Configuración eliminada');
      return data;
    } catch (error) {
      console.error('❌ Error al eliminar configuración:', error);
      throw error;
    }
  }

  // Obtener todas las configuraciones
  async obtenerTodas() {
    try {
      console.log('📋 Obteniendo todas las configuraciones...');
      
      const response = await fetch(BASE_URL, {
        method: "GET",
        headers: this.baseHeaders,
      });
      
      const data = await this.handleResponse(response);
      console.log(`✅ ${data.length} configuraciones obtenidas`);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener configuraciones:', error);
      throw error;
    }
  }

  // Obtener estadísticas
  async obtenerEstadisticas() {
    try {
      console.log('📊 Obteniendo estadísticas...');
      
      const response = await fetch(`${BASE_URL}/estadisticas`, {
        method: "GET",
        headers: this.baseHeaders,
      });
      
      const data = await this.handleResponse(response);
      console.log('✅ Estadísticas obtenidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Validar configuración antes de guardar
  validarConfiguracion(config) {
    const errores = [];

    if (!config.idproductogeneral) {
      errores.push('ID de producto es requerido');
    }

    if (!config.tipoPersonalizacion) {
      errores.push('Tipo de personalización es requerido');
    }

    // Validar límites si están permitidos
    if (config.permiteToppings && config.limiteTopping !== null && config.limiteTopping < 0) {
      errores.push('Límite de toppings debe ser 0 o mayor');
    }

    if (config.permiteSalsas && config.limiteSalsa !== null && config.limiteSalsa < 0) {
      errores.push('Límite de salsas debe ser 0 o mayor');
    }

    if (config.permiteRellenos && config.limiteRelleno !== null && config.limiteRelleno < 0) {
      errores.push('Límite de rellenos debe ser 0 o mayor');
    }

    if (config.permiteSabores && config.limiteSabor !== null && config.limiteSabor < 0) {
      errores.push('Límite de sabores debe ser 0 o mayor');
    }

    if (errores.length > 0) {
      throw new Error('Errores de validación: ' + errores.join(', '));
    }

    return true;
  }

  // Crear configuración por defecto
  crearConfiguracionDefecto(idProducto) {
    return {
      idproductogeneral: idProducto,
      tipoPersonalizacion: 'basico',
      limiteTopping: 0,
      limiteSalsa: 0,
      limiteRelleno: 0,
      limiteSabor: 0,
      permiteToppings: false,
      permiteSalsas: false,
      permiteAdiciones: true,
      permiteRellenos: false,
      permiteSabores: false
    };
  }
}

const configuracionProductoService = new ConfiguracionProductoService();
export default configuracionProductoService;