const BASE_URL = "https://deliciasoft-backend.onrender.com/api/productogeneral";
const IMAGENES_URL = "https://deliciasoft-backend.onrender.com/api/imagenes";

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
      let errorDetails = {};
      
      try {
        const errorData = await response.json();
        console.error('Error details from backend:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = errorData;
      } catch (e) {
        try {
          const errorText = await response.text();
          console.error('Error text from backend:', errorText);
          errorMessage = errorText || errorMessage;
          errorDetails.rawError = errorText;
        } catch (textError) {
          console.error('Could not parse error response');
        }
      }
      
      errorDetails.statusCode = response.status;
      errorDetails.statusText = response.statusText;
      
      const error = new Error(errorMessage);
      error.details = errorDetails;
      throw error;
    }
    return response.json();
  }

  // ========== MÉTODOS DE PRODUCTOS ==========

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

  // MÉTODO CORREGIDO - Subir imagen usando el endpoint correcto de imágenes
  async subirImagen(archivo) {
    try {
      console.log('=== INICIO SUBIDA DE IMAGEN ===');
      console.log('Archivo a subir:', {
        name: archivo.name,
        size: `${(archivo.size / 1024).toFixed(2)} KB`,
        type: archivo.type,
        lastModified: new Date(archivo.lastModified).toISOString()
      });
      
      // Validaciones previas
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!tiposPermitidos.includes(archivo.type)) {
        throw new Error(`Tipo de archivo no permitido: ${archivo.type}. Solo se aceptan: JPG, JPEG, PNG, GIF, WebP`);
      }

      const maxSize = 10 * 1024 * 1024; // 10MB para productos
      if (archivo.size > maxSize) {
        throw new Error(`Archivo demasiado grande: ${(archivo.size / 1024 / 1024).toFixed(2)}MB. Máximo: 10MB`);
      }

      if (archivo.size === 0) {
        throw new Error('El archivo está vacío');
      }

      // Usar el endpoint específico de imágenes para productos
      const formData = new FormData();
      formData.append('imagen', archivo); // Campo 'imagen' como en el backend
      
      console.log('FormData preparado con campo "imagen"');
      
      const IMAGEN_UPLOAD_URL = `${IMAGENES_URL}/upload`;
      console.log('URL de subida:', IMAGEN_UPLOAD_URL);

      // Realizar request con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch(IMAGEN_UPLOAD_URL, {
        method: "POST",
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Response recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
        let errorDetails = {};

        try {
          const errorData = await response.json();
          console.error('Error JSON del servidor:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorDetails = errorData;
        } catch (jsonError) {
          console.error('No se pudo parsear el error como JSON');
          try {
            const errorText = await response.text();
            console.error('Error como texto:', errorText);
            errorMessage = errorText || errorMessage;
            errorDetails.rawError = errorText;
          } catch (textError) {
            console.error('No se pudo obtener el texto del error');
          }
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        error.details = errorDetails;
        throw error;
      }

      const data = await response.json();
      console.log('Imagen subida exitosamente:', data);
      
      // Verificar que la respuesta contenga la imagen
      if (!data.imagen || !data.imagen.urlimg) {
        throw new Error('Respuesta del servidor no contiene la información de la imagen');
      }
      
      console.log('=== FIN SUBIDA DE IMAGEN EXITOSA ===');
      
      return {
        idimagen: data.imagen.idimagen,
        urlimg: data.imagen.urlimg
      };

    } catch (error) {
      console.error('=== ERROR EN SUBIDA DE IMAGEN ===');
      console.error('Error completo:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('La subida de la imagen tardó demasiado tiempo (timeout 60s)');
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      
      throw error;
    }
  }

  // MÉTODO CORREGIDO - Crear producto
  async crearProducto(productoData) {
    try {
      console.log('Datos recibidos en crearProducto:', JSON.stringify(productoData, null, 2));
      
      // 1. Transformar datos para la API
      const productoAPI = this.transformarProductoParaAPI(productoData);
      console.log('Datos transformados para API:', JSON.stringify(productoAPI, null, 2));
      
      // 2. Validar datos
      this.validarDatosProducto(productoAPI);
      console.log('Validación pasada correctamente');

      // 3. Enviar request
      console.log('Enviando request a:', BASE_URL);
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: this.baseHeaders,
        body: JSON.stringify(productoAPI),
      });

      console.log('Response status:', response.status);

      // 4. Manejar respuesta
      const data = await this.handleResponse(response);
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      // Retornar el producto creado
      return this.transformarProductoDesdeAPI(data.producto || data);
    } catch (error) {
      console.error('Error completo en crearProducto:', error);
      throw error;
    }
  }

  async actualizarProducto(id, productoData) {
    try {
      console.log('Actualizando producto ID:', id, 'con datos:', productoData);
      
      const productoAPI = this.transformarProductoParaAPI(productoData);
      console.log('Datos transformados para actualización:', JSON.stringify(productoAPI, null, 2));
      
      this.validarDatosProducto(productoAPI);

      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.baseHeaders,
        body: JSON.stringify(productoAPI),
      });

      const data = await this.handleResponse(response);
      return this.transformarProductoDesdeAPI(data.producto || data);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  }

  async eliminarProducto(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: this.baseHeaders,
      });
      const data = await this.handleResponse(response);
      return { success: true, message: data.message || "Producto eliminado exitosamente" };
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  }

  async cambiarEstadoProducto(id, nuevoEstado) {
    try {
      const response = await fetch(`${BASE_URL}/${id}/toggle-estado`, {
        method: "PATCH",
        headers: this.baseHeaders,
      });

      if (response.ok) {
        const data = await this.handleResponse(response);
        return this.transformarProductoDesdeAPI(data.producto || data);
      } else {
        // Fallback al método manual
        const productoActual = await this.obtenerProductoPorId(id);
        const datosActualizados = {
          ...this.transformarProductoParaAPI(productoActual),
          estado: nuevoEstado,
        };

        const response2 = await fetch(`${BASE_URL}/${id}`, {
          method: "PUT",
          headers: this.baseHeaders,
          body: JSON.stringify(datosActualizados),
        });

        const data = await this.handleResponse(response2);
        return this.transformarProductoDesdeAPI(data.producto || data);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      throw error;
    }
  }

  // ========== MÉTODOS DE IMÁGENES ==========

  async obtenerImagenes() {
    try {
      const response = await fetch(`${IMAGENES_URL}`, {
        method: "GET",
        headers: this.baseHeaders,
      });

      const data = await this.handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error al obtener imágenes:', error);
      throw error;
    }
  }

  async eliminarImagen(id) {
    try {
      const response = await fetch(`${IMAGENES_URL}/${id}`, {
        method: "DELETE",
        headers: this.baseHeaders,
      });
      const data = await this.handleResponse(response);
      return { success: true, message: data.message || "Imagen eliminada exitosamente" };
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      throw error;
    }
  }

  // ========== VALIDACIONES ==========

  validarDatosProducto(producto) {
    const errores = [];
    
    console.log('Validando producto:', producto);
    
    if (!producto.nombreproducto || !producto.nombreproducto.trim()) {
      errores.push("El nombre del producto es requerido y no puede estar vacío");
    }
    
    const precio = parseFloat(producto.precioproducto);
    if (isNaN(precio) || precio < 0) {
      errores.push("El precio debe ser un número válido mayor o igual a 0");
    }
    
    const cantidad = parseFloat(producto.cantidadproducto);
    if (isNaN(cantidad) || cantidad < 0) {
      errores.push("La cantidad debe ser un número válido mayor o igual a 0");
    }
    
    if (producto.idcategoriaproducto !== null && producto.idcategoriaproducto !== undefined) {
      const categoriaId = parseInt(producto.idcategoriaproducto);
      if (isNaN(categoriaId) || categoriaId <= 0) {
        errores.push("El ID de categoría debe ser un número válido mayor a 0");
      }
    }

    if (producto.idimagen !== null && producto.idimagen !== undefined && producto.idimagen !== '') {
      const imagenId = parseInt(producto.idimagen);
      if (isNaN(imagenId) || imagenId <= 0) {
        errores.push("El ID de imagen debe ser un número válido mayor a 0");
      }
    }

    if (producto.idreceta !== null && producto.idreceta !== undefined && producto.idreceta !== '') {
      const recetaId = parseInt(producto.idreceta);
      if (isNaN(recetaId) || recetaId <= 0) {
        errores.push("El ID de receta debe ser un número válido mayor a 0");
      }
    }

    if (errores.length > 0) {
      console.error('Errores de validación:', errores);
      throw new Error("Datos inválidos: " + errores.join(", "));
    }
    
    console.log('Validación exitosa');
  }

  // ========== TRANSFORMACIONES DE DATOS - CORREGIDAS ==========

  transformarProductoParaAPI(producto) {
    console.log('Transformando producto:', producto);
    
    const transformed = {
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
      
      idcategoriaproducto: producto.idcategoriaproducto || 
                          producto.IdCategoria || 
                          null
    };

    if (producto.especificaciones?.trim()) {
      transformed.especificaciones = producto.especificaciones.trim();
    }

    if (producto.idimagen && producto.idimagen > 0) {
      transformed.idimagen = parseInt(producto.idimagen);
    } else if (producto.idimagen === null) {
      transformed.idimagen = null;
    }
    
    if (producto.idreceta && producto.idreceta > 0) {
      transformed.idreceta = parseInt(producto.idreceta);
    } else if (producto.idreceta === null) {
      transformed.idreceta = null;
    }

    console.log('Producto transformado:', transformed);
    return transformed;
  }

  // TRANSFORMACIÓN CORREGIDA - Para asegurar que las imágenes se muestren
  transformarProductoDesdeAPI(producto) {
    if (!producto) return null;
    
    console.log('Transformando producto desde API:', producto);
    
    // Múltiples formas de obtener la URL de la imagen
    let urlimagen = null;
    
    if (producto.imagenes?.urlimg) {
      urlimagen = producto.imagenes.urlimg;
    } else if (producto.imagen?.urlimg) {
      urlimagen = producto.imagen.urlimg;
    } else if (producto.urlimagen) {
      urlimagen = producto.urlimagen;
    }
    
    console.log('URL de imagen detectada:', urlimagen);
    
    const productoTransformado = {
      id: producto.idproductogeneral || producto.id,
      idproductogeneral: producto.idproductogeneral,
      nombre: producto.nombreproducto || producto.nombre,
      nombreproducto: producto.nombreproducto,
      precio: parseFloat(producto.precioproducto || producto.precio || 0),
      precioproducto: producto.precioproducto,
      cantidad: parseFloat(producto.cantidadproducto || producto.cantidad || 0),
      cantidadproducto: producto.cantidadproducto,
      categoria: producto.categoria || producto.categoriaproducto?.nombrecategoria || 'Sin categoría',
      idcategoria: producto.idcategoriaproducto || producto.idcategoria,
      idcategoriaproducto: producto.idcategoriaproducto,
      estado: Boolean(producto.estado),
      descripcion: producto.especificaciones || producto.descripcion || "",
      idimagen: producto.idimagen,
      urlimagen: urlimagen, // ✅ CORREGIDO: Asegurar que la URL se asigne correctamente
      idreceta: producto.idreceta,
      nombrereceta: producto.nombrereceta || producto.receta?.nombrereceta || null,
      especificacionesreceta: producto.especificacionesreceta || producto.receta?.especificaciones || null,
      cantidadSanPablo: Math.floor((parseFloat(producto.cantidadproducto || producto.cantidad || 0)) / 2),
      cantidadSanBenito: Math.ceil((parseFloat(producto.cantidadproducto || producto.cantidad || 0)) / 2),
      fechaCreacion: producto.fechacreacion || producto.fecha_creacion,
      fechaActualizacion: producto.fechaactualizacion || producto.fecha_actualizacion,
    };
    
    console.log('Producto transformado final:', productoTransformado);
    return productoTransformado;
  }

  transformarProductosDesdeAPI(productos) {
    if (!Array.isArray(productos)) {
      console.warn('transformarProductosDesdeAPI recibió:', typeof productos, productos);
      return [];
    }
    return productos.map((producto) => this.transformarProductoDesdeAPI(producto));
  }

  // ========== MÉTODOS AUXILIARES ==========

  async crearProductoMinimo(nombre, precio, categoria, cantidad = 0, imagen = null, receta = null) {
    const datosMinimos = {
      nombreproducto: nombre.trim(),
      precioproducto: precio,
      cantidadproducto: cantidad,
      idcategoriaproducto: parseInt(categoria),
      estado: true,
      idimagen: imagen ? parseInt(imagen) : null,
      idreceta: receta ? parseInt(receta) : null
    };
    
    console.log('Creando producto con datos mínimos:', datosMinimos);
    return await this.crearProducto(datosMinimos);
  }

  calcularInventarioTotal(producto) {
    const cantidad = producto.cantidad || producto.cantidadproducto || 0;
    return parseFloat(cantidad);
  }

  formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio || 0);
  }

  // ========== MÉTODOS DE TESTING Y DEBUG ==========

  async testConnection() {
    try {
      console.log('Testando conexión a:', BASE_URL);
      
      const response = await fetch(`${BASE_URL}`, {
        method: "GET",
        headers: this.baseHeaders,
      });
      
      console.log('Test response status:', response.status);
      console.log('Test response ok:', response.ok);
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log('Test data sample:', Array.isArray(data) ? `Array con ${data.length} elementos` : typeof data);
        } catch (e) {
          console.log('Response no es JSON válido');
        }
      }
      
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

  async testSubirImagen(archivo) {
    try {
      console.log('Iniciando test de subida de imagen...');
      const resultado = await this.subirImagen(archivo);
      console.log('Test de imagen exitoso:', resultado);
      return resultado;
    } catch (error) {
      console.error('Test de imagen falló:', error);
      throw error;
    }
  }

  // ========== MÉTODOS DE ESTADÍSTICAS ==========

  async obtenerEstadisticas() {
    try {
      const response = await fetch(`${BASE_URL}/estadisticas`, {
        method: "GET",
        headers: this.baseHeaders,
      });

      if (response.ok) {
        return await this.handleResponse(response);
      } else {
        const productos = await this.obtenerProductos();
        
        const totalProductos = productos.length;
        const productosActivos = productos.filter(p => p.estado === true).length;
        const productosInactivos = totalProductos - productosActivos;

        return {
          totalProductos,
          productosActivos,
          productosInactivos,
          porcentajeActivos: totalProductos > 0 ? ((productosActivos / totalProductos) * 100).toFixed(2) : 0
        };
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

// Exportar una instancia del servicio
const productoApiService = new ProductoApiService();
export default productoApiService;