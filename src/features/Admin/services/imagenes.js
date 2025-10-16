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

      // Crear FormData - IMPORTANTE: verifica qué nombre espera tu backend
      const formData = new FormData();
      
      // Prueba estos nombres de campo si 'image' no funciona:
      // formData.append('image', file, file.name);    // Opción 1
      // formData.append('file', file, file.name);     // Opción 2
      // formData.append('archivo', file, file.name);  // Opción 3
      
      formData.append('image', file, file.name); // Nombre por defecto
      
      if (descripcion) {
        formData.append('descripcion', descripcion);
      }

      // Log para debug
      console.log('📡 Enviando a:', BASE_URL);
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await fetch(BASE_URL, {
        method: 'POST',
        body: formData,
        // IMPORTANTE: NO incluir headers para Content-Type
        // El navegador los añade automáticamente con boundary correcto
      });

      console.log('📥 Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Leer la respuesta
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Respuesta no JSON:', text);
        throw new Error(`Respuesta inesperada del servidor: ${text.substring(0, 200)}`);
      }

      if (!response.ok) {
        console.error('❌ Error del backend:', data);
        throw new Error(data.message || data.error || `Error ${response.status}`);
      }

      console.log('✅ Respuesta exitosa:', data);

      // Validar estructura de respuesta
      if (!data.imagen || !data.imagen.idimagen) {
        console.error('⚠️ Estructura inesperada:', data);
        throw new Error('El backend no retornó un idimagen válido');
      }

      return {
        idimagen: data.imagen.idimagen,
        url: data.imagen.urlimg || ''
      };

    } catch (error) {
      console.error('❌ Error completo:', error);
      
      // Mensajes de error más descriptivos
      if (error.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar al servidor. Verifica tu conexión a internet.');
      }
      
      if (error.message.includes('NetworkError')) {
        throw new Error('Error de red. El servidor podría estar inaccesible.');
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
}

const imagenesApiService = new ImagenesApiService();
export default imagenesApiService;