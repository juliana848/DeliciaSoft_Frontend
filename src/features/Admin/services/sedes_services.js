const BASE_URL = "https://deliciasoft-backend-i6g9.onrender.com/api/sede";

class SedeApiService {
  constructor() {
    this.baseHeaders = { "Content-Type": "application/json" };
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
      console.log('🔍 === CREAR SEDE SERVICE ===');
      console.log('📦 Tipo recibido:', sedeData instanceof FormData ? 'FormData' : 'Object');
      
      // Si es FormData (con imagen)
      if (sedeData instanceof FormData) {
        console.log('📤 Enviando FormData directamente al backend...');
        
        // Log de los datos del FormData
        for (let pair of sedeData.entries()) {
          console.log(`  - ${pair[0]}:`, pair[1] instanceof File ? `File(${pair[1].name}, ${pair[1].size} bytes)` : pair[1]);
        }

        const response = await fetch(BASE_URL, {
          method: "POST",
          body: sedeData,
          // ❌ NO incluir Content-Type cuando usas FormData
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error response:', errorText);
          
          let errorMessage = `Error ${response.status}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            errorMessage = errorText.substring(0, 200);
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('✅ Sede creada con imagen:', data);
        return this.transformarSedeDesdeAPI(data);
      }

      // Si es JSON (sin imagen)
      console.log('📤 Enviando JSON sin imagen...');
      const sedeAPI = this.transformarSedeParaAPI(sedeData);
      console.log('🔄 Datos transformados:', sedeAPI);
      
      this.validarDatosSede(sedeAPI);

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: this.baseHeaders,
        body: JSON.stringify(sedeAPI),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText.substring(0, 200);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Sede creada sin imagen:', data);
      return this.transformarSedeDesdeAPI(data);
    } catch (error) {
      console.error("❌ Error en crearSede:", error);
      throw new Error("Error al crear la sede: " + error.message);
    }
  }

  async actualizarSede(id, sedeData) {
    try {
      console.log('🔍 === ACTUALIZAR SEDE SERVICE ===');
      console.log('📦 ID:', id);
      console.log('📦 Tipo recibido:', sedeData instanceof FormData ? 'FormData' : 'Object');
      
      // Si es FormData (con imagen)
      if (sedeData instanceof FormData) {
        console.log('📤 Enviando FormData directamente al backend...');
        
        // Log de los datos del FormData
        for (let pair of sedeData.entries()) {
          console.log(`  - ${pair[0]}:`, pair[1] instanceof File ? `File(${pair[1].name})` : pair[1]);
        }

        const response = await fetch(`${BASE_URL}/${id}`, {
          method: "PUT",
          body: sedeData,
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error response:', errorText);
          
          let errorMessage = `Error ${response.status}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            errorMessage = errorText.substring(0, 200);
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('✅ Sede actualizada con imagen:', data);
        return this.transformarSedeDesdeAPI(data);
      }

      // Si es JSON (sin imagen)
      console.log('📤 Enviando JSON sin imagen...');
      const sedeAPI = this.transformarSedeParaAPI(sedeData);
      console.log('🔄 Datos transformados:', sedeAPI);
      
      this.validarDatosSede(sedeAPI);

      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: this.baseHeaders,
        body: JSON.stringify(sedeAPI),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText.substring(0, 200);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Sede actualizada sin imagen:', data);
      return this.transformarSedeDesdeAPI(data);
    } catch (error) {
      console.error("❌ Error en actualizarSede:", error);
      throw new Error("Error al actualizar la sede: " + error.message);
    }
  }

  async eliminarSede(id) {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: this.baseHeaders,
      });
      
      if (!response.ok) {
        let errorMessage = "Error al eliminar la sede";
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          if (response.status === 500) {
            errorMessage = "No se puede eliminar la sede porque tiene registros asociados. Intenta desactivarla usando el switch de estado.";
          }
        }
        throw new Error(errorMessage);
      }
      
      await this.handleResponse(response);
      return { success: true, message: "Sede eliminada exitosamente" };
    } catch (error) {
      console.error("Error en eliminarSede:", error);
      throw error;
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

  validarDatosSede(sede) {
    const errores = [];
    if (!sede.nombre || sede.nombre.trim() === "") {
      errores.push("El nombre de la sede es requerido");
    }
    if (!sede.telefono || sede.telefono.trim() === "") {
      errores.push("El teléfono es requerido");
    } else {
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
      telefono: (sede.Telefono || sede.telefono || "").replace(/\s/g, ''),
      direccion: (sede.Direccion || sede.direccion || "").trim(),
      estado: sede.estado !== undefined ? Boolean(sede.estado || sede.activo) : true,
    };
  }

  transformarSedeDesdeAPI(sede) {
    if (!sede) return null;

    return {
      id: sede.idsede,
      nombre: sede.nombre || "",
      Telefono: sede.telefono || "",
      Direccion: sede.direccion || "",
      telefono: sede.telefono || "",
      direccion: sede.direccion || "",
      imagenUrl: sede.imagenUrl || null,
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

  formatearTelefono(telefono) {
    if (!telefono) return "";
    const cleaned = telefono.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return telefono;
  }

  validarFormatoImagen(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

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