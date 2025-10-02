// src/services/inventario_services.js
const BASE_URL = 'https://deliciasoft-backend.onrender.com/api/inventariosede';

class InventarioApiService {
  constructor() {
    this.baseHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('Error del servidor:', errorData);
      } catch (e) {
        console.error('No se pudo parsear el error');
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  // Obtener inventario de una sede específica
  async obtenerInventarioPorSede(idsede) {
    try {
      console.log(`📦 Obteniendo inventario de sede ${idsede}...`);
      
      const response = await fetch(`${BASE_URL}/sede/${idsede}`, {
        method: 'GET',
        headers: this.baseHeaders
      });

      const data = await this.handleResponse(response);
      console.log('Inventario obtenido:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener inventario por sede:', error);
      throw error;
    }
  }

  // Obtener inventario de un producto en una sede específica
  async obtenerInventarioProductoSede(idproductogeneral, idsede) {
    try {
      console.log(`📦 Consultando inventario: Producto ${idproductogeneral}, Sede ${idsede}`);
      
      const response = await fetch(
        `${BASE_URL}?idproductogeneral=${idproductogeneral}&idsede=${idsede}`,
        {
          method: 'GET',
          headers: this.baseHeaders
        }
      );

      const data = await this.handleResponse(response);
      console.log('Cantidad disponible:', data.cantidad);
      return data;
    } catch (error) {
      console.error('Error al obtener inventario del producto:', error);
      throw error;
    }
  }

  // Obtener inventario general (todos los productos, todas las sedes)
  async obtenerInventarioGeneral() {
    try {
      console.log('📦 Obteniendo inventario general...');
      
      const response = await fetch(`${BASE_URL}/general`, {
        method: 'GET',
        headers: this.baseHeaders
      });

      const data = await this.handleResponse(response);
      console.log('Inventario general obtenido:', data.length, 'registros');
      return data;
    } catch (error) {
      console.error('Error al obtener inventario general:', error);
      throw error;
    }
  }

  // Obtener inventario de un producto en todas las sedes
  async obtenerInventarioProducto(idproductogeneral) {
    try {
      console.log(`📦 Obteniendo inventario del producto ${idproductogeneral}...`);
      
      const response = await fetch(`${BASE_URL}/producto/${idproductogeneral}`, {
        method: 'GET',
        headers: this.baseHeaders
      });

      const data = await this.handleResponse(response);
      console.log('Inventario por sedes:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener inventario del producto:', error);
      throw error;
    }
  }

  // Actualizar inventario manualmente (para ajustes)
  async actualizarInventario(idproductogeneral, idsede, cantidad) {
    try {
      console.log(`📝 Actualizando inventario: Producto ${idproductogeneral}, Sede ${idsede}, Cantidad ${cantidad}`);
      
      const response = await fetch(`${BASE_URL}`, {
        method: 'POST',
        headers: this.baseHeaders,
        body: JSON.stringify({
          idproductogeneral: parseInt(idproductogeneral),
          idsede: parseInt(idsede),
          cantidad: parseFloat(cantidad)
        })
      });

      const data = await this.handleResponse(response);
      console.log('Inventario actualizado:', data);
      return data;
    } catch (error) {
      console.error('Error al actualizar inventario:', error);
      throw error;
    }
  }

  // Verificar disponibilidad antes de vender
  async verificarDisponibilidad(productos, idsede) {
    try {
      console.log('🔍 Verificando disponibilidad de productos...');
      
      const verificaciones = await Promise.all(
        productos.map(async (producto) => {
          const inventario = await this.obtenerInventarioProductoSede(
            producto.idproductogeneral || producto.id,
            idsede
          );
          
          const disponible = parseFloat(inventario.cantidad || 0);
          const solicitado = parseFloat(producto.cantidad || 1);
          
          return {
            id: producto.idproductogeneral || producto.id,
            nombre: inventario.productogeneral?.nombreproducto || producto.nombre,
            disponible,
            solicitado,
            suficiente: disponible >= solicitado
          };
        })
      );

      const productosInsuficientes = verificaciones.filter(v => !v.suficiente);
      
      if (productosInsuficientes.length > 0) {
        console.warn('⚠️ Productos con inventario insuficiente:', productosInsuficientes);
        return {
          valido: false,
          productosInsuficientes,
          mensaje: `Inventario insuficiente para: ${productosInsuficientes.map(p => 
            `${p.nombre} (disponible: ${p.disponible}, solicitado: ${p.solicitado})`
          ).join(', ')}`
        };
      }

      console.log('✅ Todos los productos tienen inventario suficiente');
      return {
        valido: true,
        productosInsuficientes: [],
        mensaje: 'Inventario verificado correctamente'
      };
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      throw error;
    }
  }

  // Formatear datos para mostrar en UI
  formatearInventarioParaUI(inventario) {
    if (!Array.isArray(inventario)) {
      return [];
    }

    return inventario.map(item => ({
      idproductogeneral: item.idproductogeneral,
      nombreproducto: item.productogeneral?.nombreproducto || 'Sin nombre',
      cantidad: parseFloat(item.cantidad || 0),
      sede: item.sede?.nombre || 'Sin sede',
      idsede: item.idsede,
      precio: item.productogeneral?.precioproducto || 0,
      urlimagen: item.productogeneral?.imagenes?.urlimg || null,
      estado: item.productogeneral?.estado || false
    }));
  }

  // Test de conexión
  async testConnection() {
    try {
      console.log('🔌 Probando conexión con API de inventario...');
      const response = await fetch(`${BASE_URL}/general`, {
        method: 'GET',
        headers: this.baseHeaders
      });

      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Conexión exitosa' : `Error HTTP ${response.status}`
      };
    } catch (error) {
      console.error('Error en test de conexión:', error);
      return {
        success: false,
        error: error.message,
        message: 'No se pudo conectar con el servidor de inventario'
      };
    }
  }
}

const inventarioApiService = new InventarioApiService();
export default inventarioApiService;