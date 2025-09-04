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
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Si no se puede parsear el JSON del error, usar el texto
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch (textError) {
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

  // Crear nuevo producto
  async crearProducto(productoData) {
    try {
      const productoAPI = this.transformarProductoParaAPI(productoData);
      this.validarDatosProducto(productoAPI);

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: this.baseHeaders,
        body: JSON.stringify(productoAPI),
      });

      const data = await this.handleResponse(response);
      return this.transformarProductoDesdeAPI(data);
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  }

  // Actualizar producto existente
  async actualizarProducto(id, productoData) {
    try {
      const productoAPI = this.transformarProductoParaAPI(productoData);
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

  // Validación de datos del producto
  validarDatosProducto(producto) {
    const errores = [];
    
    if (!producto.nombreproducto) {
      errores.push("El nombre del producto es requerido");
    }
    
    if (producto.precioproducto === undefined || producto.precioproducto === null || producto.precioproducto < 0) {
      errores.push("El precio debe ser un valor válido mayor o igual a 0");
    }

    if (errores.length > 0) {
      throw new Error("Datos inválidos: " + errores.join(", "));
    }
  }

  // Transformar datos del producto para envío a la API
  // Basado en el schema de la base de datos: nombreproducto, precioproducto, etc.
  transformarProductoParaAPI(producto) {
    return {
      nombreproducto: producto.nombre || producto.nombreproducto || producto.NombreReceta || producto.NombreProducto,
      precioproducto: typeof producto.precio === 'number' ? producto.precio : 
                     typeof producto.precioproducto === 'number' ? producto.precioproducto :
                     typeof producto.Costo === 'number' ? producto.Costo : 
                     parseFloat(producto.precio || producto.precioproducto || producto.Costo || 0),
      cantidadproducto: typeof producto.cantidad === 'number' ? producto.cantidad :
                       typeof producto.cantidadproducto === 'number' ? producto.cantidadproducto :
                       parseFloat(producto.cantidad || producto.cantidadproducto || 0),
      estado: producto.estado !== undefined ? Boolean(producto.estado) : true,
      idcategoriaproducto: producto.idcategoriaproducto || producto.IdCategoria || null,
      idimagen: producto.idimagen || null,
      idreceta: producto.idreceta || null
    };
  }

  // Transformar datos del producto desde la API
  // Mapear los campos de la base de datos a los que espera el frontend
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

  // Función de prueba de conectividad
  async testConnection() {
    try {
      console.log('Testando conexión a:', BASE_URL);
      
      const response = await fetch(`${BASE_URL}`, {
        method: "HEAD", // Solo headers, sin body
        headers: this.baseHeaders,
      });
      
      console.log('Test response status:', response.status);
      console.log('Test response ok:', response.ok);
      
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
        message: 'No se pudo conectar con el servidor'
      };
    }
  }
}

// Exportar una instancia del servicio
const productoApiService = new ProductoApiService();
export default productoApiService;