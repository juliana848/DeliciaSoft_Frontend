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

      // Intentar primero con el endpoint correcto (sin /upload)
      const response = await fetch(`${BASE_URL}`, {
        method: "POST",
        // No incluir headers para FormData - el navegador los establece automáticamente
        body: formData,
      });

      if (!response.ok) {
        // Si falla, intentar con endpoints alternativos
        console.warn(`POST ${BASE_URL} falló, intentando endpoints alternativos...`);
        return await this.crearSedeConImagenAlternativo(formData);
      }

      const data = await this.handleResponse(response);
      return this.transformarSedeDesdeAPI(data);
    } catch (error) {
      console.error("Error en crearSedeConImagen:", error);
      // Intentar método alternativo
      return await this.crearSedeConImagenAlternativo(formData);
    }
  }

  async crearSedeConImagenAlternativo(formData) {
    try {
      // Método 1: Probar con diferentes endpoints
      const endpoints = [
        `${BASE_URL}/crear`, // Endpoint alternativo 1
        `${BASE_URL}/new`,   // Endpoint alternativo 2
        `${BASE_URL}/add`,   // Endpoint alternativo 3
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Intentando con endpoint: ${endpoint}`);
          const response = await fetch(endpoint, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const data = await this.handleResponse(response);
            return this.transformarSedeDesdeAPI(data);
          }
        } catch (endpointError) {
          console.warn(`Falló endpoint ${endpoint}:`, endpointError.message);
          continue;
        }
      }

      // Método 2: Crear sede primero, luego subir imagen
      return await this.crearSedeDosEtapas(formData);
    } catch (error) {
      console.error("Error en métodos alternativos:", error);
      throw new Error("Error al crear la sede con imagen. Verifique la configuración del servidor.");
    }
  }

  async crearSedeDosEtapas(formData) {
    try {
      // Paso 1: Crear sede sin imagen
      const sedeData = {
        nombre: formData.get('nombre'),
        Telefono: formData.get('Telefono'),
        Direccion: formData.get('Direccion'),
        activo: formData.get('activo') === 'true',
      };

      const sedeCreada = await this.crearSede(sedeData);

      // Paso 2: Subir imagen si existe
      const imagen = formData.get('imagen');
      if (imagen && sedeCreada.id) {
        try {
          await this.subirImagenSede(sedeCreada.id, imagen);
          // Recargar la sede para obtener la imagen actualizada
          return await this.obtenerSedePorId(sedeCreada.id);
        } catch (imageError) {
          console.warn("Sede creada pero error al subir imagen:", imageError);
          // Devolver la sede sin imagen
          return sedeCreada;
        }
      }

      return sedeCreada;
    } catch (error) {
      console.error("Error en crearSedeDosEtapas:", error);
      throw error;
    }
  }

  async subirImagenSede(sedeId, imagenFile) {
    try {
      const formData = new FormData();
      formData.append('imagen', imagenFile);

      const endpoints = [
        `${BASE_URL}/${sedeId}/imagen`,
        `${BASE_URL}/${sedeId}/upload-image`,
        `${BASE_URL}/${sedeId}/photo`,
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            return await this.handleResponse(response);
          }
        } catch (endpointError) {
          continue;
        }
      }

      throw new Error("No se pudo encontrar endpoint válido para subir imagen");
    } catch (error) {
      console.error("Error al subir imagen:", error);
      throw error;
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

      // Intentar con endpoint directo primero
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const data = await this.handleResponse(response);
        return this.transformarSedeDesdeAPI(data);
      }

      // Si falla, usar método de dos etapas
      return await this.actualizarSedeDosEtapas(id, formData);
    } catch (error) {
      console.error("Error en actualizarSedeConImagen:", error);
      return await this.actualizarSedeDosEtapas(id, formData);
    }
  }

  async actualizarSedeDosEtapas(id, formData) {
    try {
      // Paso 1: Actualizar datos básicos
      const sedeData = {
        nombre: formData.get('nombre'),
        Telefono: formData.get('Telefono'),
        Direccion: formData.get('Direccion'),
        activo: formData.get('activo') === 'true',
      };

      const sedeActualizada = await this.actualizarSede(id, sedeData);

      // Paso 2: Actualizar imagen si se envió una nueva
      const imagen = formData.get('imagen');
      if (imagen && imagen.size > 0) {
        try {
          await this.subirImagenSede(id, imagen);
          // Recargar la sede para obtener la imagen actualizada
          return await this.obtenerSedePorId(id);
        } catch (imageError) {
          console.warn("Sede actualizada pero error al subir imagen:", imageError);
          return sedeActualizada;
        }
      }

      return sedeActualizada;
    } catch (error) {
      console.error("Error en actualizarSedeDosEtapas:", error);
      throw error;
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

  // Método de depuración para probar endpoints
  async probarEndpoints() {
    const endpoints = [
      `${BASE_URL}`,
      `${BASE_URL}/upload`,
      `${BASE_URL}/crear`,
      `${BASE_URL}/new`,
      `${BASE_URL}/add`,
    ];

    console.log("Probando endpoints disponibles:");
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { method: "GET" });
        console.log(`${endpoint}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`${endpoint}: Error - ${error.message}`);
      }
    }
  }
}

const sedeApiService = new SedeApiService();
export default sedeApiService;