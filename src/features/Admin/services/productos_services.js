const BASE_URL = "https://deliciasoft-backend.onrender.com/api/productogeneral";

class ProductoApiService {
  constructor() {
    this.baseHeaders = { "Content-Type": "application/json" };
  }

  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }
    return response.json();
  }

  // Obtener todos los productos
  async obtenerProductos() {
    const response = await fetch(`${BASE_URL}`, {
      method: "GET",
      headers: this.baseHeaders,
    });
    const data = await this.handleResponse(response);
    return this.transformarProductosDesdeAPI(data);
  }

  // Obtener producto por ID
  async obtenerProductoPorId(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: this.baseHeaders,
    });
    if (response.status === 404) throw new Error("Producto no encontrado");
    const data = await this.handleResponse(response);
    return this.transformarProductoDesdeAPI(data);
  }

  // Crear nuevo producto
  async crearProducto(productoData) {
    const productoAPI = this.transformarProductoParaAPI(productoData);
    this.validarDatosProducto(productoAPI);

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: this.baseHeaders,
      body: JSON.stringify(productoAPI),
    });

    const data = await this.handleResponse(response);
    return this.transformarProductoDesdeAPI(data);
  }

  // Actualizar producto existente
  async actualizarProducto(id, productoData) {
    const productoAPI = this.transformarProductoParaAPI(productoData);
    this.validarDatosProducto(productoAPI);

    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: this.baseHeaders,
      body: JSON.stringify(productoAPI),
    });

    const data = await this.handleResponse(response);
    return this.transformarProductoDesdeAPI(data);
  }

  // Eliminar producto
  async eliminarProducto(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: this.baseHeaders,
    });
    await this.handleResponse(response);
    return { success: true, message: "Producto eliminado exitosamente" };
  }

  // Cambiar estado del producto
  async cambiarEstadoProducto(id, nuevoEstado) {
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
  }

  // Obtener productos por categoría
  async obtenerProductosPorCategoria(categoriaId) {
    const response = await fetch(`${BASE_URL}/categoria/${categoriaId}`, {
      method: "GET",
      headers: this.baseHeaders,
    });
    const data = await this.handleResponse(response);
    return this.transformarProductosDesdeAPI(data);
  }

  // Obtener productos con stock bajo
  async obtenerProductosStockBajo(minStock = 10) {
    const response = await fetch(`${BASE_URL}/stock-bajo?minimo=${minStock}`, {
      method: "GET",
      headers: this.baseHeaders,
    });
    const data = await this.handleResponse(response);
    return this.transformarProductosDesdeAPI(data);
  }

  // Actualizar inventario de un producto en una sede específica
  async actualizarInventario(id, sede, cantidad) {
    const campoInventario = sede === 'sanpablo' ? 'cantidadsanpablo' : 'cantidadsanbenito';
    
    const response = await fetch(`${BASE_URL}/${id}/inventario`, {
      method: "PATCH",
      headers: this.baseHeaders,
      body: JSON.stringify({
        sede: sede,
        cantidad: cantidad,
        [campoInventario]: cantidad
      }),
    });

    const data = await this.handleResponse(response);
    return this.transformarProductoDesdeAPI(data);
  }

  // Obtener recetas asociadas a un producto
  async obtenerRecetasDelProducto(id) {
    const response = await fetch(`${BASE_URL}/${id}/recetas`, {
      method: "GET",
      headers: this.baseHeaders,
    });
    const data = await this.handleResponse(response);
    return data; // Las recetas pueden tener su propia estructura
  }

  // Validación de datos del producto
  validarDatosProducto(producto) {
    const errores = [];
    
    if (!producto.nombre) {
      errores.push("El nombre del producto es requerido");
    }
    
    if (producto.precio === undefined || producto.precio === null || producto.precio < 0) {
      errores.push("El precio debe ser un valor válido mayor o igual a 0");
    }
    
    if (!producto.categoria && !producto.idcategoria) {
      errores.push("La categoría del producto es requerida");
    }
    
    if (producto.cantidadsanpablo !== undefined && producto.cantidadsanpablo < 0) {
      errores.push("La cantidad en San Pablo debe ser mayor o igual a 0");
    }
    
    if (producto.cantidadsanbenito !== undefined && producto.cantidadsanbenito < 0) {
      errores.push("La cantidad en San Benito debe ser mayor o igual a 0");
    }

    if (errores.length > 0) {
      throw new Error("Datos inválidos: " + errores.join(", "));
    }
  }

  // Transformar datos del producto para envío a la API
  transformarProductoParaAPI(producto) {
    return {
      nombre: producto.nombre || producto.NombreReceta || producto.NombreProducto,
      precio: typeof producto.precio === 'number' ? producto.precio : 
              typeof producto.Costo === 'number' ? producto.Costo : 
              parseFloat(producto.precio || producto.Costo || 0),
      categoria: producto.categoria,
      idcategoria: producto.idcategoria || producto.IdCategoria,
      cantidadsanpablo: typeof producto.cantidadSanPablo === 'number' ? producto.cantidadSanPablo :
                       typeof producto.CantidadSanPablo === 'number' ? producto.CantidadSanPablo :
                       parseInt(producto.cantidadSanPablo || producto.CantidadSanPablo || 0),
      cantidadsanbenito: typeof producto.cantidadSanBenito === 'number' ? producto.cantidadSanBenito :
                        typeof producto.CantidadSanBenito === 'number' ? producto.CantidadSanBenito :
                        parseInt(producto.cantidadSanBenito || producto.CantidadSanBenito || 0),
      estado: producto.estado !== undefined ? Boolean(producto.estado) : true,
      tienerelaciones: producto.tieneRelaciones !== undefined ? Boolean(producto.tieneRelaciones) : false,
      especificaciones: producto.especificaciones || producto.Especificaciones || "",
      // Campos adicionales para recetas si existen
      insumos: producto.insumos || [],
      recetasanidadas: producto.recetasAnidadas || producto.recetasanidadas || []
    };
  }

  // Transformar datos del producto desde la API
  transformarProductoDesdeAPI(producto) {
    if (!producto) return null;
    
    return {
      id: producto.id || producto.idproducto,
      nombre: producto.nombre,
      precio: parseFloat(producto.precio || 0),
      categoria: producto.categoria,
      idcategoria: producto.idcategoria,
      cantidadSanPablo: parseInt(producto.cantidadsanpablo || 0),
      cantidadSanBenito: parseInt(producto.cantidadsanbenito || 0),
      estado: Boolean(producto.estado),
      tieneRelaciones: Boolean(producto.tienerelaciones),
      especificaciones: producto.especificaciones || "",
      // Campos adicionales que pueden venir de la API
      fechaCreacion: producto.fechacreacion || producto.fecha_creacion,
      fechaActualizacion: producto.fechaactualizacion || producto.fecha_actualizacion,
      // Recetas asociadas si las hay
      recetas: producto.recetas || [],
      insumos: producto.insumos || [],
      recetasAnidadas: producto.recetasanidadas || []
    };
  }

  // Transformar array de productos desde la API
  transformarProductosDesdeAPI(productos) {
    if (!Array.isArray(productos)) return [];
    return productos.map((producto) => this.transformarProductoDesdeAPI(producto));
  }

  // Método auxiliar para calcular el inventario total
  calcularInventarioTotal(producto) {
    const sanPablo = producto.cantidadSanPablo || producto.cantidadsanpablo || 0;
    const sanBenito = producto.cantidadSanBenito || producto.cantidadsanbenito || 0;
    return sanPablo + sanBenito;
  }

  // Método auxiliar para formatear precio
  formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio || 0);
  }

  // Obtener productos con filtros avanzados
  async obtenerProductosConFiltros(filtros = {}) {
    const params = new URLSearchParams();
    
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.precioMin) params.append('precio_min', filtros.precioMin);
    if (filtros.precioMax) params.append('precio_max', filtros.precioMax);
    if (filtros.estado !== undefined) params.append('estado', filtros.estado);
    if (filtros.sede) params.append('sede', filtros.sede);
    if (filtros.stockMinimo) params.append('stock_minimo', filtros.stockMinimo);

    const queryString = params.toString();
    const url = queryString ? `${BASE_URL}/filtros?${queryString}` : `${BASE_URL}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.baseHeaders,
    });

    const data = await this.handleResponse(response);
    return this.transformarProductosDesdeAPI(data);
  }
}

// Exportar una instancia del servicio
const productoApiService = new ProductoApiService();
export default productoApiService;