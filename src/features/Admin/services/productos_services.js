const BASE_URL = "https://deliciasoft-backend.onrender.com/api/productogeneral";

class ProductoApiService {
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
        console.error('❌ Error details from backend:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Si no se puede parsear el JSON del error, usar el texto
        try {
          const errorText = await response.text();
          console.error('❌ Error text from backend:', errorText);
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          console.error('❌ Could not parse error response');
          // Mantener el mensaje original si todo falla
        }
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  // Obtener todos los productos - FUNCIÓN PRINCIPAL
  async obtenerProductos() {
    try {
      console.log('Conectando con:', BASE_URL);
      
      const response = await fetch(`${BASE_URL}`, {
        method: "GET",
        headers: this.baseHeaders,
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await this.handleResponse(response);
      console.log('Raw data from API:', data);
      
      const productosTransformados = this.transformarProductosDesdeAPI(data);
      console.log('Productos transformados:', productosTransformados);
      
      return productosTransformados;
    } catch (error) {
      console.error('Error en obtenerProductos:', error);
      throw new Error(`No se pudieron obtener los productos: ${error.message}`);
    }
  }

  // Obtener producto por ID
  async obtenerProductoPorId(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "GET",
        headers: this.baseHeaders,
      });
      if (response.status === 404) throw new Error("Producto no encontrado");
      const data = await this.handleResponse(response);
      return this.transformarProductoDesdeAPI(data);
    } catch (error) {
      console.error('Error al obtener producto por ID:', error);
      throw error;
    }
  }

  // Crear nuevo producto - MEJORADO CON DEBUG
  async crearProducto(productoData) {
    try {
      console.log('🔍 Datos recibidos en crearProducto:', JSON.stringify(productoData, null, 2));
      
      const productoAPI = this.transformarProductoParaAPI(productoData);
      console.log('🔄 Datos transformados para API:', JSON.stringify(productoAPI, null, 2));
      
      this.validarDatosProducto(productoAPI);
      console.log('✅ Validación pasada correctamente');

      console.log('📤 Enviando request a:', BASE_URL);
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: this.baseHeaders,
        body: JSON.stringify(productoAPI),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', [...response.headers.entries()]);

      // Si hay error, intentar obtener más detalles
      if (!response.ok) {
        let errorDetails = `HTTP ${response.status}`;
        try {
          const errorBody = await response.text();
          console.error('❌ Error body from server:', errorBody);
          errorDetails = errorBody || errorDetails;
        } catch (e) {
          console.error('❌ Could not read error body');
        }
        throw new Error(errorDetails);
      }

      const data = await response.json();
      console.log('✅ Response data:', JSON.stringify(data, null, 2));
      
      return this.transformarProductoDesdeAPI(data);
    } catch (error) {
      console.error('❌ Error completo en crearProducto:', error);
      throw error;
    }
  }

  // Actualizar producto existente
  async actualizarProducto(id, productoData) {
    try {
      console.log('🔄 Actualizando producto ID:', id, 'con datos:', productoData);
      
      const productoAPI = this.transformarProductoParaAPI(productoData);
      console.log('🔄 Datos transformados para actualización:', JSON.stringify(productoAPI, null, 2));
      
      this.validarDatosProducto(productoAPI);

      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.baseHeaders,
        body: JSON.stringify(productoAPI),
      });

      const data = await this.handleResponse(response);
      return this.transformarProductoDesdeAPI(data);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  }

  // Eliminar producto
  async eliminarProducto(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: this.baseHeaders,
      });
      await this.handleResponse(response);
      return { success: true, message: "Producto eliminado exitosamente" };
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  }

  // Cambiar estado del producto
  async cambiarEstadoProducto(id, nuevoEstado) {
    try {
      const productoActual = await this.obtenerProductoPorId(id);
      const datosActualizados = {
        ...this.transformarProductoParaAPI(productoActual),
        estado: nuevoEstado,
      };

      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.baseHeaders,
        body: JSON.stringify(datosActualizados),
      });

      const data = await this.handleResponse(response);
      return this.transformarProductoDesdeAPI(data);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      throw error;
    }
  }

  // Validación mejorada de datos del producto
  validarDatosProducto(producto) {
    const errores = [];
    
    console.log('🔍 Validando producto:', producto);
    
    // Validar nombre
    if (!producto.nombreproducto || !producto.nombreproducto.trim()) {
      errores.push("El nombre del producto es requerido y no puede estar vacío");
    }
    
    // Validar precio
    const precio = parseFloat(producto.precioproducto);
    if (isNaN(precio) || precio < 0) {
      errores.push("El precio debe ser un número válido mayor o igual a 0");
    }
    
    // Validar cantidad
    const cantidad = parseFloat(producto.cantidadproducto);
    if (isNaN(cantidad) || cantidad < 0) {
      errores.push("La cantidad debe ser un número válido mayor o igual a 0");
    }
    
    // Validar categoría (crítico - puede estar causando el error 500)
    if (producto.idcategoriaproducto !== null && producto.idcategoriaproducto !== undefined) {
      const categoriaId = parseInt(producto.idcategoriaproducto);
      if (isNaN(categoriaId) || categoriaId <= 0) {
        errores.push("El ID de categoría debe ser un número válido mayor a 0");
      }
    }

    if (errores.length > 0) {
      console.error('❌ Errores de validación:', errores);
      throw new Error("Datos inválidos: " + errores.join(", "));
    }
    
    console.log('✅ Validación exitosa');
  }

  // Transformar datos del producto para envío a la API - MEJORADO
  transformarProductoParaAPI(producto) {
    console.log('🔄 Transformando producto:', producto);
    
    const transformed = {
      // Campos obligatorios
      nombreproducto: producto.nombreproducto?.trim() || 
                     producto.nombre?.trim() || 
                     producto.NombreReceta?.trim() || 
                     producto.NombreProducto?.trim(),
                     
      precioproducto: String(producto.precioproducto || 
                            producto.precio || 
                            producto.Costo || 
                            0),
                            
      cantidadproducto: String(producto.cantidadproducto || 
                             producto.cantidad || 
                             0),
                             
      estado: producto.estado !== undefined ? Boolean(producto.estado) : true,
      
      // Campo que puede ser problemático - asegurar que sea un número válido
      idcategoriaproducto: producto.idcategoriaproducto || 
                          producto.IdCategoria || 
                          null
    };

    // Solo agregar campos opcionales si tienen valores válidos
    if (producto.especificaciones?.trim()) {
      transformed.especificaciones = producto.especificaciones.trim();
    }

    // NO enviar idimagen e idreceta si no están definidos correctamente
    if (producto.idimagen && producto.idimagen > 0) {
      transformed.idimagen = parseInt(producto.idimagen);
    }
    
    if (producto.idreceta && producto.idreceta > 0) {
      transformed.idreceta = parseInt(producto.idreceta);
    }

    console.log('✅ Producto transformado:', transformed);
    return transformed;
  }

  // Transformar datos del producto desde la API
  transformarProductoDesdeAPI(producto) {
    if (!producto) return null;
    
    return {
      id: producto.idproductogeneral || producto.id,
      nombre: producto.nombreproducto || producto.nombre,
      precio: parseFloat(producto.precioproducto || producto.precio || 0),
      cantidad: parseFloat(producto.cantidadproducto || producto.cantidad || 0),
      categoria: producto.categoria || 'Sin categoría',
      idcategoria: producto.idcategoriaproducto || producto.idcategoria,
      estado: Boolean(producto.estado),
      descripcion: producto.especificaciones || producto.descripcion || "",
      // Para compatibilidad con el modal, agregar campos de inventario por sede
      cantidadSanPablo: Math.floor((parseFloat(producto.cantidadproducto || producto.cantidad || 0)) / 2), // División temporal
      cantidadSanBenito: Math.ceil((parseFloat(producto.cantidadproducto || producto.cantidad || 0)) / 2), // División temporal
      idimagen: producto.idimagen,
      idreceta: producto.idreceta,
      fechaCreacion: producto.fechacreacion || producto.fecha_creacion,
      fechaActualizacion: producto.fechaactualizacion || producto.fecha_actualizacion,
    };
  }

  // Transformar array de productos desde la API
  transformarProductosDesdeAPI(productos) {
    if (!Array.isArray(productos)) {
      console.warn('transformarProductosDesdeAPI recibió:', typeof productos, productos);
      return [];
    }
    return productos.map((producto) => this.transformarProductoDesdeAPI(producto));
  }

  // Función auxiliar para crear producto con datos mínimos
  async crearProductoMinimo(nombre, precio, categoria, cantidad = 0) {
    const datosMinimos = {
      nombreproducto: nombre.trim(),
      precioproducto: precio,
      cantidadproducto: cantidad,
      idcategoriaproducto: parseInt(categoria),
      estado: true
    };
    
    console.log('📝 Creando producto con datos mínimos:', datosMinimos);
    return await this.crearProducto(datosMinimos);
  }

  // Test específico para crear producto
  async testCrearProducto() {
    try {
      console.log('🧪 Iniciando test de creación...');
      
      const testProducto = {
        nombreproducto: "Test Product " + Date.now(),
        precioproducto: "1000", // Como string
        cantidadproducto: "5", // Como string
        estado: true,
        idcategoriaproducto: 1 // Como entero - IMPORTANTE
      };
      
      console.log('🧪 Datos de test:', testProducto);
      const resultado = await this.crearProducto(testProducto);
      console.log('✅ Test exitoso:', resultado);
      return resultado;
      
    } catch (error) {
      console.error('❌ Test falló:', error);
      throw error;
    }
  }

  // Método auxiliar para calcular el inventario total
  calcularInventarioTotal(producto) {
    const cantidad = producto.cantidad || producto.cantidadproducto || 0;
    return parseFloat(cantidad);
  }

  // Método auxiliar para formatear precio
  formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio || 0);
  }

  // Función de prueba de conectividad - MEJORADA
  async testConnection() {
    try {
      console.log('🔗 Testando conexión a:', BASE_URL);
      
      const response = await fetch(`${BASE_URL}`, {
        method: "GET", // Cambié de HEAD a GET para obtener más información
        headers: this.baseHeaders,
      });
      
      console.log('🔗 Test response status:', response.status);
      console.log('🔗 Test response ok:', response.ok);
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log('🔗 Test data sample:', Array.isArray(data) ? `Array con ${data.length} elementos` : typeof data);
        } catch (e) {
          console.log('🔗 Response no es JSON válido');
        }
      }
      
      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Conexión exitosa' : `Error HTTP ${response.status}`
      };
    } catch (error) {
      console.error('❌ Error en test de conexión:', error);
      return {
        success: false,
        error: error.message,
        message: 'No se pudo conectar con el servidor'
      };
    }
  }

  // Método para debuggear la API completa
  async debugAPI() {
    console.log('🔍 INICIANDO DEBUG COMPLETO DE LA API');
    console.log('='.repeat(50));
    
    try {
      // 1. Test de conexión
      console.log('1️⃣ Testando conexión...');
      const connectionTest = await this.testConnection();
      console.log('Resultado conexión:', connectionTest);
      
      if (!connectionTest.success) {
        throw new Error('No hay conexión con la API');
      }
      
      // 2. Test de obtener productos
      console.log('2️⃣ Testando obtener productos...');
      const productos = await this.obtenerProductos();
      console.log(`Productos obtenidos: ${productos.length}`);
      
      // 3. Test de creación (opcional)
      console.log('3️⃣ ¿Quieres testear creación? Llama a testCrearProducto()');
      
      return {
        success: true,
        connection: connectionTest,
        productCount: productos.length,
        message: 'Debug completado exitosamente'
      };
      
    } catch (error) {
      console.error('❌ Error en debug:', error);
      return {
        success: false,
        error: error.message,
        message: 'Debug falló'
      };
    }
  }
}

// Exportar una instancia del servicio
const productoApiService = new ProductoApiService();
export default productoApiService;