const API_BASE_URL = 'https://deliciasoft-backend.onrender.com/api';

class ImagenesApiService {
  // Obtener todas las imágenes
  async obtenerImagenes() {
    try {
      const response = await fetch(`${API_BASE_URL}/imagenes`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Imágenes obtenidas:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener imágenes:', error);
      throw new Error('No se pudieron cargar las imágenes');
    }
  }

  // Obtener imagen por ID
  async obtenerImagenPorId(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/imagenes/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Imagen no encontrada');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener imagen:', error);
      throw error;
    }
  }

  // Obtener imágenes del carrusel (IDs: 8, 9, 10)
  async obtenerImagenesCarrusel() {
    try {
      const imagenes = await this.obtenerImagenes();
      // Filtrar las imágenes del carrusel por los IDs específicos
      const imagenesCarrusel = imagenes.filter(img => [8, 9, 10].includes(img.idimagen));
      
      // Ordenar por ID para mantener el orden correcto
      imagenesCarrusel.sort((a, b) => a.idimagen - b.idimagen);
      
      return imagenesCarrusel;
    } catch (error) {
      console.error('Error al obtener imágenes del carrusel:', error);
      throw error;
    }
  }

  // Obtener imagen de cotización (ID: específico de cotización)
  async obtenerImagenCotizacion() {
    try {
      // Aquí puedes usar el ID específico de la imagen de cotización
      // Por ahora usando un placeholder, ajusta según tu ID real
      const imagenes = await this.obtenerImagenes();
      // Buscar la imagen de cotización - ajusta el criterio según sea necesario
      const imagenCotizacion = imagenes.find(img => 
        img.urlimg.includes('imagen_2025-09-07_224334210') || 
        img.idimagen === 11 // Ajusta este ID según corresponda
      );
      
      return imagenCotizacion;
    } catch (error) {
      console.error('Error al obtener imagen de cotización:', error);
      throw error;
    }
  }

  // Obtener imagen del secreto (ID: 7)
  async obtenerImagenSecreto() {
    try {
      const imagen = await this.obtenerImagenPorId(7);
      return imagen;
    } catch (error) {
      console.error('Error al obtener imagen del secreto:', error);
      throw error;
    }
  }

  // Método para testear la conexión con la API
  async testearConexion() {
    try {
      console.log('Testeando conexión con:', `${API_BASE_URL}/imagenes`);
      const response = await fetch(`${API_BASE_URL}/imagenes`);
      console.log('Status de respuesta:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Error de conexión:', error);
      return false;
    }
  }
}

// Crear instancia del servicio
const imagenesApiService = new ImagenesApiService();

export default imagenesApiService;