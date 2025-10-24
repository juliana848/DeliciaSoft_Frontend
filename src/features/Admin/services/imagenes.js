// src/services/imagenes.js

const BASE_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/imagenes";

class ImagenesApiService {
  async subirImagen(file, descripcion = '') {
    try {
      console.log('📤 Subiendo imagen al backend...');
      console.log('Archivo:', file.name);
      console.log('Tamaño:', (file.size / 1024).toFixed(2), 'KB');
      console.log('Tipo:', file.type);

      // Validaciones
      if (!file) {
        throw new Error('No se proporcionó ningún archivo');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('La imagen no debe superar 10MB');
      }

      // Crear FormData
      const formData = new FormData();
      // IMPORTANTE: Tu backend acepta 'image' o 'imagen'
      formData.append('image', file);
      
      if (descripcion) {
        formData.append('descripcion', descripcion);
      }

      // CORRECCIÓN PRINCIPAL: La URL debe ser /api/imagenes/upload
      const uploadURL = `${BASE_URL}/upload`;
      console.log('📡 Enviando a:', uploadURL);

      // Timeout de 60 segundos (tu backend tiene timeout de 60s)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(uploadURL, {
        method: 'POST',
        body: formData,
        signal: controller.signal
        // NO incluir Content-Type, el navegador lo maneja automáticamente con boundary
      });

      clearTimeout(timeoutId);

      console.log('📥 Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Verificar errores HTTP
      if (response.status === 404) {
        throw new Error('❌ ENDPOINT NO ENCONTRADO: La ruta /api/imagenes/upload no existe en el servidor');
      }

      // Leer la respuesta
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Respuesta no JSON:', text);
        
        if (text.includes('<!DOCTYPE html>')) {
          throw new Error('El servidor devolvió HTML. Posible error: ruta incorrecta o servidor caído.');
        }
        
        throw new Error(`Respuesta inesperada del servidor: ${text.substring(0, 200)}`);
      }

      if (!response.ok) {
        console.error('❌ Error del backend:', data);
        
        // Manejar errores específicos del backend
        if (data.error === 'LIMIT_FILE_SIZE') {
          throw new Error('La imagen es demasiado grande. Tamaño máximo: 10MB');
        }
        
        if (data.error === 'INVALID_FILE_TYPE') {
          throw new Error('Tipo de archivo no permitido. Solo JPG, PNG, GIF y WebP');
        }
        
        throw new Error(data.message || data.error || `Error ${response.status}`);
      }

      console.log('✅ Respuesta exitosa:', data);

      // Validar estructura de respuesta según tu backend
      if (!data.imagen || !data.imagen.idimagen) {
        console.error('⚠️ Estructura inesperada:', data);
        throw new Error('El backend no retornó un idimagen válido');
      }

      // Retornar en el formato esperado
      return {
        idimagen: data.imagen.idimagen,
        url: data.imagen.urlimg || '',
        cloudinary: data.cloudinary || null
      };

    } catch (error) {
      console.error('❌ Error completo:', error);
      
      // Mensajes de error más descriptivos
      if (error.name === 'AbortError') {
        throw new Error('⏱️ La petición tardó demasiado (más de 60 segundos). El servidor puede estar lento o la imagen es muy grande.');
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('🔌 No se pudo conectar al servidor. Verifica:\n1. Tu conexión a internet\n2. Que el backend esté funcionando en Render\n3. Que no haya problemas de CORS');
      }
      
      if (error.message.includes('NetworkError')) {
        throw new Error('🌐 Error de red. El servidor podría estar inaccesible o hay problemas de CORS.');
      }
      
      throw error;
    }
  }

  async obtenerImagenes() {
    try {
      const response = await fetch(BASE_URL);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error al obtener imágenes:', error);
      return [];
    }
  }

  async obtenerImagenPorId(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`);
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error al obtener imagen ${id}:`, error);
      throw error;
    }
  }

  async eliminarImagen(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error al eliminar imagen ${id}:`, error);
      throw error;
    }
  }

  async validarConfiguracion() {
    try {
      const response = await fetch(`${BASE_URL}/validate-config`);
      if (!response.ok) {
        throw new Error('No se pudo validar la configuración de Cloudinary');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al validar configuración:', error);
      throw error;
    }
  }

  async obtenerEstadisticas() {
    try {
      const response = await fetch(`${BASE_URL}/estadisticas`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  }
}

const imagenesApiService = new ImagenesApiService();
export default imagenesApiService;