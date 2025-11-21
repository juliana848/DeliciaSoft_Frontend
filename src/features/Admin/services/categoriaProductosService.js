const API_BASE_URL = 'https://deliciasoft-backend-i6g9.onrender.com/api';

class CategoriaProductoApiService {
  // Obtener todas las categorías
  async obtenerCategorias() {
    try {
      const response = await fetch(`${API_BASE_URL}/categorias-productos`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Categorías obtenidas:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw new Error('No se pudieron cargar las categorías de productos');
    }
  }

  // Obtener categoría por ID
  async obtenerCategoriaPorId(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/categorias-productos/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Categoría no encontrada');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      throw error;
    }
  }

  // Crear nueva categoría con imagen opcional
  async crearCategoria(datosCategoria, archivoImagen = null) {
    try {
      // Validar datos antes de enviar
      this.validarDatosCategoria(datosCategoria);

      // Validar archivo de imagen si existe
      if (archivoImagen) {
        this.validarArchivoImagen(archivoImagen);
      }

      console.log('Creando categoría con datos:', datosCategoria);
      console.log('Archivo imagen:', archivoImagen ? 'Sí' : 'No');

      // Crear FormData para enviar datos y archivo
      const formData = new FormData();
      formData.append('nombrecategoria', datosCategoria.nombre.trim());
      formData.append('descripcion', datosCategoria.descripcion.trim());
      formData.append('estado', datosCategoria.estado !== undefined ? datosCategoria.estado : true);
      
      if (archivoImagen) {
        formData.append('imagen', archivoImagen);
        console.log('Imagen agregada al FormData:', archivoImagen.name, archivoImagen.size, archivoImagen.type);
      }

      // Log del FormData para debug
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      const response = await fetch(`${API_BASE_URL}/categorias-productos`, {
        method: 'POST',
        body: formData, // No establecer Content-Type, el navegador lo hará automáticamente
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Error del servidor:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('No se pudo parsear el error:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Categoría creada exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  }

  // Actualizar categoría con imagen opcional
  async actualizarCategoria(id, datosCategoria, archivoImagen = null) {
    try {
      // Validar datos antes de enviar
      this.validarDatosCategoria(datosCategoria);

      // Validar archivo de imagen si existe
      if (archivoImagen) {
        this.validarArchivoImagen(archivoImagen);
      }

      console.log('Actualizando categoría con ID:', id, 'Datos:', datosCategoria);
      console.log('Nueva imagen:', archivoImagen ? 'Sí' : 'No');

      // Crear FormData para enviar datos y archivo
      const formData = new FormData();
      formData.append('nombrecategoria', datosCategoria.nombre.trim());
      formData.append('descripcion', datosCategoria.descripcion.trim());
      formData.append('estado', datosCategoria.estado);
      
      if (archivoImagen) {
        formData.append('imagen', archivoImagen);
        console.log('Nueva imagen agregada al FormData:', archivoImagen.name);
      }

      const response = await fetch(`${API_BASE_URL}/categorias-productos/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Error del servidor:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('No se pudo parsear el error:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Categoría actualizada exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }
  }

  // Eliminar categoría
  async eliminarCategoria(id) {
    try {
      console.log('Eliminando categoría con ID:', id);

      const response = await fetch(`${API_BASE_URL}/categorias-productos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Si no se puede parsear el JSON del error, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Categoría eliminada:', data);
      return data;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  }

  // Cambiar estado de categoría usando el endpoint específico
  async toggleEstadoCategoria(id) {
    try {
      console.log('Cambiando estado de categoría con ID:', id);
      
      const response = await fetch(`${API_BASE_URL}/categorias-productos/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Si no se puede parsear el JSON del error, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Estado de categoría cambiado:', data);
      return data;
    } catch (error) {
      console.error('Error al cambiar estado de categoría:', error);
      throw error;
    }
  }

  // Verificar si la categoría tiene productos asociados
  async categoriaTieneProductos(id) {
    try {
      console.log('Verificando productos asociados para categoría:', id);
      
      const response = await fetch(`${API_BASE_URL}/categorias-productos/${id}/productos`);
      
      if (response.ok) {
        const productos = await response.json();
        return productos && productos.length > 0;
      } else if (response.status === 404) {
        // Si el endpoint no existe, asumimos que no hay productos asociados
        console.log('Endpoint de productos no encontrado, asumiendo sin productos asociados');
        return false;
      } else {
        console.log('Error al verificar productos, permitiendo eliminación');
        return false;
      }
    } catch (error) {
      console.error('Error al verificar productos asociados:', error);
      // En caso de error, permitir la eliminación
      return false;
    }
  }

  // Validar datos de categoría
  validarDatosCategoria(datos) {
    const errores = [];

    if (!datos.nombre || datos.nombre.trim() === '') {
      errores.push('El nombre de la categoría es obligatorio');
    }

    if (datos.nombre && datos.nombre.trim().length > 20) {
      errores.push('El nombre no puede tener más de 20 caracteres');
    }

    if (!datos.descripcion || datos.descripcion.trim() === '') {
      errores.push('La descripción es obligatoria');
    }

    if (datos.descripcion && datos.descripcion.trim().length > 50) {
      errores.push('La descripción no puede tener más de 50 caracteres');
    }

    if (errores.length > 0) {
      throw new Error(errores.join(', '));
    }
  }

  // Validar archivo de imagen
  validarArchivoImagen(archivo) {
    if (!archivo) return true; // La imagen es opcional

    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const tamañoMaximo = 5 * 1024 * 1024; // 5MB

    if (!tiposPermitidos.includes(archivo.type)) {
      throw new Error('Solo se permiten archivos de imagen (JPEG, PNG, WebP)');
    }

    if (archivo.size > tamañoMaximo) {
      throw new Error('El archivo no puede ser mayor a 5MB');
    }

    return true;
  }

  // Obtener categorías activas únicamente
  async obtenerCategoriasActivas() {
    try {
      const response = await fetch(`${API_BASE_URL}/categorias-productos/activas`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener categorías activas:', error);
      throw error;
    }
  }

  // Método para testear la conexión con la API
  async testearConexion() {
    try {
      console.log('Testeando conexión con:', `${API_BASE_URL}/categorias-productos`);
      const response = await fetch(`${API_BASE_URL}/categorias-productos`);
      console.log('Status de respuesta:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Error de conexión:', error);
      return false;
    }
  }
}

// Crear instancia del servicio
const categoriaProductoApiService = new CategoriaProductoApiService();

export default categoriaProductoApiService;