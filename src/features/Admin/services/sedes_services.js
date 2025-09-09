const BASE_URL = "https://deliciasoft-backend.onrender.com/api/sede";

class SedeApiService {
  constructor() {
    this.baseHeaders = { "Content-Type": "application/json" };
    this.multipartHeaders = {}; // Para FormData no se debe incluir Content-Type
  }

  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Si no se puede parsear como JSON, usar el mensaje por defecto
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  async obtenerSedes() {
    try {
      const response = await fetch(`${BASE_URL}`, {
        method: "GET",
        headers: this.baseHeaders,
      });
      const data = await this.handleResponse(response);
      return this.transformarSedesDesdeAPI(data);
    } catch (error) {
      console.error("Error en obtenerSedes:", error);
      throw new Error("Error al cargar las sedes: " + error.message);
    }
  }

  async obtenerSedePorId(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "GET",
        headers: this.baseHeaders,
      });
      if (response.status === 404) throw new Error("Sede no encontrada");
      const data = await this.handleResponse(response);
      return this.transformarSedeDesdeAPI(data);
    } catch (error) {
      console.error("Error en obtenerSedePorId:", error);
      throw error;
    }
  }

  async crearSede(sedeData) {
    try {
      // Verificar si se está enviando un FormData (con imagen) o datos normales
      if (sedeData instanceof FormData) {
        return await this.crearSedeConImagen(sedeData);
      }

      // Crear sede sin imagen
      const sedeAPI = this.transformarSedeParaAPI(sedeData);
      this.validarDatosSede(sedeAPI);

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: this.baseHeaders,
        body: JSON.stringify(sedeAPI),
      });

      const data = await this.handleResponse(response);
      return this.transformarSedeDesdeAPI(data);
    } catch (error) {
      console.error("Error en crearSede:", error);
      throw new Error("Error al crear la sede: " + error.message);
    }
  }

  async crearSedeConImagen(formData) {
    try {
      // Validar datos del FormData
      const nombre = formData.get('nombre');
      const telefono = formData.get('Telefono');
      const direccion = formData.get('Direccion');

      if (!nombre || !telefono || !direccion) {
        throw new Error("Faltan datos obligatorios");
      }

      const response = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        // No incluir headers para FormData - el navegador los establece automáticamente
        body: formData,
      });

      const data = await this.handleResponse(response);
      return this.transformarSedeDesdeAPI(data);
    } catch (error) {
      console.error("Error en crearSedeConImagen:", error);
      throw new Error("Error al crear la sede con imagen: " + error.message);
    }
  }

  async actualizarSede(id, sedeData) {
    try {
      // Verificar si se está enviando un FormData (con imagen) o datos normales
      if (sedeData instanceof FormData) {
        return await this.actualizarSedeConImagen(id, sedeData);
      }

      // Actualizar sede sin imagen
      const sedeAPI = this.transformarSedeParaAPI(sedeData);
      this.validarDatosSede(sedeAPI);

      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.baseHeaders,
        body: JSON.stringify(sedeAPI),
      });

      const data = await this.handleResponse(response);
      return this.transformarSedeDesdeAPI(data);
    } catch (error) {
      console.error("Error en actualizarSede:", error);
      throw new Error("Error al actualizar la sede: " + error.message);
    }
  }

  async actualizarSedeConImagen(id, formData) {
    try {
      // Validar datos del FormData
      const nombre = formData.get('nombre');
      const telefono = formData.get('Telefono');
      const direccion = formData.get('Direccion');

      if (!nombre || !telefono || !direccion) {
        throw new Error("Faltan datos obligatorios");
      }

      const response = await fetch(`${BASE_URL}/${id}/upload`, {
        method: "PUT",
        // No incluir headers para FormData
        body: formData,
      });

      const data = await this.handleResponse(response);
      return this.transformarSedeDesdeAPI(data);
    } catch (error) {
      console.error("Error en actualizarSedeConImagen:", error);
      throw new Error("Error al actualizar la sede con imagen: " + error.message);
    }
  }

  async eliminarSede(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: this.baseHeaders,
      });
      await this.handleResponse(response);
      return { success: true, message: "Sede eliminada exitosamente" };
    } catch (error) {
      console.error("Error en eliminarSede:", error);
      throw new Error("Error al eliminar la sede: " + error.message);
    }
  }

  async cambiarEstadoSede(id, nuevoEstado) {
    try {
      const sedeActual = await this.obtenerSedePorId(id);
      const datosActualizados = {
        ...this.transformarSedeParaAPI(sedeActual),
        estado: nuevoEstado,
      };

      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.baseHeaders,
        body: JSON.stringify(datosActualizados),
      });

      const data = await this.handleResponse(response);
      return this.transformarSedeDesdeAPI(data);
    } catch (error) {
      console.error("Error en cambiarEstadoSede:", error);
      throw new Error("Error al cambiar el estado de la sede: " + error.message);
    }
  }

  // Método para obtener la URL completa de la imagen
  obtenerUrlImagen(idimagen) {
    if (!idimagen) return null;
    // Ajustar según la estructura de tu backend
    return `${BASE_URL.replace('/api/sede', '')}/uploads/sedes/${idimagen}`;
  }

  validarDatosSede(sede) {
    const errores = [];
    if (!sede.nombre || sede.nombre.trim() === "") {
      errores.push("El nombre de la sede es requerido");
    }
    if (!sede.telefono || sede.telefono.trim() === "") {
      errores.push("El teléfono es requerido");
    } else {
      // Validar formato de teléfono colombiano
      const telefonoRegex = /^[3][0-9]{9}$/;
      if (!telefonoRegex.test(sede.telefono.replace(/\s/g, ''))) {
        errores.push("El teléfono debe ser un número colombiano válido (10 dígitos comenzando con 3)");
      }
    }
    if (!sede.direccion || sede.direccion.trim() === "") {
      errores.push("La dirección es requerida");
    }

    if (errores.length > 0) {
      throw new Error("Datos inválidos: " + errores.join(", "));
    }
  }

  transformarSedeParaAPI(sede) {
    return {
      nombre: (sede.nombre || "").trim(),
      telefono: (sede.Telefono || sede.telefono || "").replace(/\s/g, ''), // Limpiar espacios
      direccion: (sede.Direccion || sede.direccion || "").trim(),
      idimagen: sede.idimagen || null,
      estado: sede.estado !== undefined ? Boolean(sede.estado || sede.activo) : true,
    };
  }

  transformarSedeDesdeAPI(sede) {
    if (!sede) return null;
    
    // Generar URL de imagen si existe
    let imagenUrl = null;
    if (sede.idimagen) {
      imagenUrl = this.obtenerUrlImagen(sede.idimagen);
    }

    return {
      id: sede.idsede,
      nombre: sede.nombre || "",
      Telefono: sede.telefono || "",
      Direccion: sede.direccion || "",
      telefono: sede.telefono || "",
      direccion: sede.direccion || "",
      idimagen: sede.idimagen || null,
      imagenUrl: imagenUrl, // URL completa de la imagen
      estado: Boolean(sede.estado),
      activo: Boolean(sede.estado),
    };
  }

  transformarSedesDesdeAPI(sedes) {
    if (!Array.isArray(sedes)) {
      console.warn("transformarSedesDesdeAPI: se esperaba un array, se recibió:", typeof sedes);
      return [];
    }
    return sedes.map((s) => this.transformarSedeDesdeAPI(s)).filter(s => s !== null);
  }

  // Método auxiliar para formatear teléfonos para mostrar
  formatearTelefono(telefono) {
    if (!telefono) return "";
    const cleaned = telefono.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return telefono;
  }

  // Método auxiliar para validar formato de imagen
  validarFormatoImagen(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Formato de imagen no válido. Use JPEG, PNG, GIF o WebP.");
    }

    if (file.size > maxSize) {
      throw new Error("La imagen es demasiado grande. Máximo 5MB permitido.");
    }

    return true;
  }
}

const sedeApiService = new SedeApiService();
export default sedeApiService;