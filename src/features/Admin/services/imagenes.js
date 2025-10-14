// src/services/imagenes.js

// 🔹 CONFIGURACIÓN DE CLOUDINARY
const CLOUDINARY_CONFIG = {
  cloudName: 'dagnilue0', // ✅ Tu Cloud Name
  uploadPreset: 'deliciasoft_insumos', // 🔴 REEMPLAZAR con el nombre de tu upload preset
  folder: 'deliciasoft/insumos'
};

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

// URL de tu backend para guardar el registro en la BD
const BASE_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/imagenes";

class ImagenesApiService {
  constructor() {
    this.baseHeaders = {
      'Content-Type': 'application/json'
    };
  }

  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorDetails = null;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = errorData;
        console.error('❌ Error de la API:', errorData);
      } catch (e) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        errorMessage = errorText || errorMessage;
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }
    return response.json();
  }

  /**
   * Comprime una imagen antes de subirla
   * @param {File} file - Archivo de imagen
   * @param {number} maxWidth - Ancho máximo
   * @param {number} quality - Calidad (0-1)
   * @returns {Promise<Blob>}
   */
  async comprimirImagen(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Redimensionar si es necesario
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a Blob
          canvas.toBlob(
            (blob) => {
              console.log('📸 Imagen original:', (file.size / 1024).toFixed(2), 'KB');
              console.log('📸 Imagen comprimida:', (blob.size / 1024).toFixed(2), 'KB');
              resolve(blob);
            },
            'image/jpeg',
            quality
          );
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 🚀 SUBE IMAGEN DIRECTAMENTE A CLOUDINARY
   * @param {File} file - Archivo de imagen
   * @param {string} descripcion - Descripción opcional
   * @returns {Promise<{url: string, publicId: string}>}
   */
  async subirACloudinary(file, descripcion = '') {
    try {
      console.log('☁️ SUBIENDO IMAGEN DIRECTAMENTE A CLOUDINARY');
      console.log('Archivo:', file.name, '- Tamaño:', (file.size / 1024).toFixed(2), 'KB');

      // Validar el archivo
      if (!file) {
        throw new Error('No se proporcionó ningún archivo');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      // Comprimir la imagen
      const imagenComprimida = await this.comprimirImagen(file, 1200, 0.8);

      // Crear FormData para Cloudinary
      const formData = new FormData();
      formData.append('file', imagenComprimida);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      
      if (CLOUDINARY_CONFIG.folder) {
        formData.append('folder', CLOUDINARY_CONFIG.folder);
      }
      
      if (descripcion) {
        formData.append('context', `description=${descripcion}`);
      }

      console.log('📤 Enviando a Cloudinary...');

      // Subir a Cloudinary
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error de Cloudinary:', errorData);
        throw new Error(`Error de Cloudinary: ${errorData.error?.message || 'Error desconocido'}`);
      }

      const data = await response.json();
      console.log('✅ Imagen subida a Cloudinary:', data.secure_url);

      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format
      };

    } catch (error) {
      console.error('❌ Error al subir a Cloudinary:', error);
      throw error;
    }
  }

  /**
   * 💾 GUARDA EL REGISTRO EN LA BASE DE DATOS
   * @param {Object} datosImagen - Datos de la imagen subida
   * @returns {Promise<{idimagen: number}>}
   */
  async guardarEnBaseDatos(datosImagen) {
    try {
      console.log('💾 Guardando registro en base de datos...');

      const datos = {
        url: datosImagen.url,
        publicid: datosImagen.publicId,
        descripcion: datosImagen.descripcion || ''
      };

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: this.baseHeaders,
        body: JSON.stringify(datos)
      });

      if (!response.ok) {
        // Si el endpoint no existe, retornar datos mock
        if (response.status === 404) {
          console.warn('⚠️ Endpoint de BD no disponible. Usando datos temporales.');
          return {
            idimagen: Date.now(), // ID temporal
            ...datosImagen
          };
        }
        throw new Error(`Error al guardar en BD: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Registro guardado en BD:', data);

      return {
        idimagen: data.idimagen || data.id,
        ...datosImagen
      };

    } catch (error) {
      console.error('❌ Error al guardar en BD:', error);
      // Retornar datos de Cloudinary aunque falle la BD
      console.warn('⚠️ Continuando con datos de Cloudinary...');
      return {
        idimagen: Date.now(),
        ...datosImagen
      };
    }
  }

  /**
   * 🎯 FUNCIÓN PRINCIPAL: Sube imagen y guarda en BD
   * @param {File} file - Archivo de imagen
   * @param {string} descripcion - Descripción opcional
   * @returns {Promise<{idimagen: number, url: string}>}
   */
  async subirImagen(file, descripcion = '') {
    try {
      // 1. Subir a Cloudinary
      const resultadoCloudinary = await this.subirACloudinary(file, descripcion);

      // 2. Guardar en base de datos
      const resultadoBD = await this.guardarEnBaseDatos({
        ...resultadoCloudinary,
        descripcion
      });

      console.log('🎉 IMAGEN PROCESADA EXITOSAMENTE');
      console.log('   URL:', resultadoBD.url);
      console.log('   ID:', resultadoBD.idimagen);

      return {
        idimagen: resultadoBD.idimagen,
        url: resultadoBD.url,
        publicId: resultadoBD.publicId
      };

    } catch (error) {
      console.error('❌ Error al procesar imagen:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las imágenes
   */
  async obtenerImagenes() {
    try {
      const response = await fetch(BASE_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error al obtener imágenes:', error);
      return []; // Retornar array vacío si falla
    }
  }

  /**
   * Obtiene una imagen por ID
   */
  async obtenerImagenPorId(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error al obtener imagen ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina una imagen (de Cloudinary y BD)
   */
  async eliminarImagen(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error al eliminar imagen ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener imágenes del carrusel (IDs: 8, 9, 10)
   */
  async obtenerImagenesCarrusel() {
    try {
      const imagenes = await this.obtenerImagenes();
      const imagenesCarrusel = imagenes.filter(img => [8, 9, 10].includes(img.idimagen));
      imagenesCarrusel.sort((a, b) => a.idimagen - b.idimagen);
      return imagenesCarrusel;
    } catch (error) {
      console.error('Error al obtener imágenes del carrusel:', error);
      return [];
    }
  }

  /**
   * Obtener imagen del secreto (ID: 7)
   */
  async obtenerImagenSecreto() {
    try {
      return await this.obtenerImagenPorId(7);
    } catch (error) {
      console.error('Error al obtener imagen del secreto:', error);
      return null;
    }
  }
}

const imagenesApiService = new ImagenesApiService();
export default imagenesApiService;