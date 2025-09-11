// Servicio API para gestión de roles y permisos - CORREGIDO
const API_BASE_URL = 'https://deliciasoft-backend.onrender.com/api';

class RoleApiService {
  // ================================
  // 🔌 ROLES
  // ================================

  // Obtener todos los roles con sus permisos
  async obtenerRoles() {
    try {
      const response = await fetch(`${API_BASE_URL}/rol`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const roles = this.transformarRolesDesdeAPI(data);
      
      // ✅ NUEVO: Ordenar roles para que Admin siempre esté primero
      return this.ordenarRolesConAdminPrimero(roles);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw new Error('Error al obtener la lista de roles');
    }
  }

  // ✅ NUEVO: Método para ordenar roles con Admin primero
  ordenarRolesConAdminPrimero(roles) {
    const adminRoles = roles.filter(rol => this.esRolAdmin(rol.nombre));
    const otrosRoles = roles.filter(rol => !this.esRolAdmin(rol.nombre));
    
    // Ordenar otros roles alfabéticamente
    otrosRoles.sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    return [...adminRoles, ...otrosRoles];
  }

  // ✅ NUEVO: Verificar si un nombre corresponde al rol Admin
  esRolAdmin(nombre) {
    return nombre && nombre.toLowerCase() === 'admin';
  }

  // ✅ NUEVO: Verificar si se puede editar/eliminar un rol
  puedeEditarRol(rol) {
    return !this.esRolAdmin(rol.nombre);
  }

  // Obtener rol por ID con sus permisos
  async obtenerRolPorId(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/rol/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        if (response.status === 404) throw new Error('Rol no encontrado');
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return this.transformarRolDesdeAPI(data);
    } catch (error) {
      console.error('Error al obtener rol:', error);
      throw error;
    }
  }

  // Crear nuevo rol con validaciones
  async crearRol(rolData) {
    try {
      // ✅ NUEVO: Validar que no se intente crear otro rol Admin
      if (this.esRolAdmin(rolData.nombre)) {
        throw new Error('No se puede crear otro rol con el nombre "Admin". Ya existe un rol administrador en el sistema.');
      }

      const rolAPI = this.transformarRolParaAPI(rolData);

      // ✅ Validar que los permisos sean válidos
      if (!rolData.permisos || !Array.isArray(rolData.permisos)) {
        throw new Error('Los permisos deben ser un array');
      }

      const permisosValidos = rolData.permisos.filter(p =>
        typeof p === 'number' && p > 0 && Number.isInteger(p)
      );

      if (permisosValidos.length !== rolData.permisos.length) {
        throw new Error('Algunos permisos no tienen un formato válido');
      }

      rolAPI.permisos = permisosValidos;

      console.log('Enviando datos al backend:', rolAPI);

      const response = await fetch(`${API_BASE_URL}/rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(rolAPI),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta del backend:', data);

      return {
        id: data.idrol || data.rol?.idrol,
        nombre: rolData.nombre,
        descripcion: rolData.descripcion,
        permisos: permisosValidos,
        activo: rolData.activo !== undefined ? rolData.activo : true
      };
    } catch (error) {
      console.error('Error detallado al crear rol:', error);
      throw error;
    }
  }

  // Actualizar rol con permisos - CORREGIDO
  async actualizarRol(id, rolData) {
    try {
      // ✅ NUEVO: Verificar si es el rol Admin
      if (this.esRolAdmin(rolData.nombre)) {
        throw new Error('No se puede editar el rol Admin. Este rol está protegido del sistema.');
      }

      const rolAPI = this.transformarRolParaAPI(rolData);

      // ✅ CORREGIDO: Validación más robusta de permisos
      if (rolData.permisos && Array.isArray(rolData.permisos)) {
        // Verificar que todos los permisos sean números válidos
        const permisosValidos = rolData.permisos.filter(p =>
          typeof p === 'number' && p > 0 && Number.isInteger(p)
        );

        console.log('Permisos originales:', rolData.permisos);
        console.log('Permisos válidos filtrados:', permisosValidos);

        // ✅ IMPORTANTE: Obtener permisos disponibles desde el backend para validar
        try {
          const permisosDisponibles = await this.obtenerPermisosDisponiblesIds();
          console.log('Permisos disponibles en backend:', permisosDisponibles);

          // Filtrar solo los permisos que existen en el backend
          const permisosExistentes = permisosValidos.filter(p => 
            permisosDisponibles.includes(p)
          );

          console.log('Permisos que existen en backend:', permisosExistentes);

          if (permisosExistentes.length > 0) {
            rolAPI.permisos = permisosExistentes;
          } else {
            console.warn('No se encontraron permisos válidos, se omite el campo permisos');
            // No incluir permisos si no hay válidos
            delete rolAPI.permisos;
          }
        } catch (permisosError) {
          console.warn('No se pudieron validar permisos contra backend, usando permisos del cliente');
          rolAPI.permisos = permisosValidos;
        }
      }

      console.log('Datos finales a enviar al backend:', rolAPI);

      const response = await fetch(`${API_BASE_URL}/rol/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(rolAPI),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: `HTTP ${response.status}: ${errorText}` };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Rol actualizado exitosamente:', data);

      return {
        id,
        nombre: rolData.nombre,
        descripcion: rolData.descripcion,
        permisos: rolData.permisos || [],
        activo: rolData.activo
      };
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      throw error;
    }
  }

  // ✅ NUEVO: Método para obtener IDs de permisos disponibles
  async obtenerPermisosDisponiblesIds() {
    try {
      // Intentar obtener desde el endpoint correcto de permisos
      const response = await fetch(`${API_BASE_URL}/rol/permisos`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const permisos = await response.json();
        return permisos.map(p => p.idpermiso);
      }

      // Fallback: intentar endpoint directo
      const response2 = await fetch(`${API_BASE_URL}/permisos`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response2.ok) {
        const permisos = await response2.json();
        return permisos.map(p => p.idpermiso);
      }

      throw new Error('No se pudieron obtener permisos');
    } catch (error) {
      console.warn('Error al obtener permisos disponibles:', error);
      // Retornar IDs mock basados en tu log
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    }
  }

  // Eliminar rol
  async eliminarRol(id) {
    try {
      // ✅ NUEVO: Obtener información del rol antes de eliminar
      const rol = await this.obtenerRolPorId(id);
      
      if (this.esRolAdmin(rol.nombre)) {
        throw new Error('No se puede eliminar el rol Admin. Este rol es esencial para el sistema.');
      }

      const response = await fetch(`${API_BASE_URL}/rol/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      return { success: true, message: 'Rol eliminado exitosamente' };
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      throw error;
    }
  }

  // Cambiar estado
  async cambiarEstadoRol(id, nuevoEstado) {
    try {
      // ✅ NUEVO: Verificar si es el rol Admin
      const rol = await this.obtenerRolPorId(id);
      
      if (this.esRolAdmin(rol.nombre) && !nuevoEstado) {
        throw new Error('No se puede desactivar el rol Admin. Este rol debe permanecer siempre activo.');
      }

      const response = await fetch(`${API_BASE_URL}/rol/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar estado');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      throw new Error(`No se pudo actualizar el estado: ${error.message}`);
    }
  }

  // Verificar usuarios en rol
  async rolTieneUsuarios(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/rol/${id}/usuarios`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) return false;
      const data = await response.json();
      return data.length > 0;
    } catch (error) {
      console.error('Error al verificar usuarios del rol:', error);
      return false;
    }
  }

  // ================================
  // 🔌 PERMISOS - CORREGIDO
  // ================================

  // ✅ CORREGIDO: Obtener permisos con múltiples endpoints de respaldo
  async obtenerPermisos() {
    try {
      // Método 1: Usar endpoint de rol/permisos (más confiable según tu controller)
      console.log('Intentando obtener permisos desde /rol/permisos...');
      const response = await fetch(`${API_BASE_URL}/rol/permisos`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Permisos obtenidos desde /rol/permisos:', data);
        return this.transformarPermisosDesdeAPI(data);
      }

      // Método 2: Intentar endpoint directo
      console.log('Intentando obtener permisos desde /permisos...');
      const response2 = await fetch(`${API_BASE_URL}/permisos`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response2.ok) {
        const data = await response2.json();
        console.log('Permisos obtenidos desde /permisos:', data);
        return this.transformarPermisosDesdeAPI(data);
      }

      throw new Error('Ambos endpoints de permisos fallaron');
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      console.log('Usando permisos mock como fallback');
      return this.obtenerPermisosMock();
    }
  }

  // Obtener permisos activos
  async obtenerPermisosActivos() {
    try {
      const todosLosPermisos = await this.obtenerPermisos();
      return todosLosPermisos.filter(p => p.estado !== false);
    } catch (error) {
      console.error('Error al obtener permisos activos:', error);
      return this.obtenerPermisosMock();
    }
  }

  // Obtener permisos por rol
  async obtenerPermisosRol(idRol) {
    try {
      const response = await fetch(`${API_BASE_URL}/rol/${idRol}/permisos`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.warn(`No se pudieron obtener permisos del rol ${idRol}`);
        return [];
      }

      const data = await response.json();
      return data.map(permiso => permiso.idpermiso);
    } catch (error) {
      console.error('Error al obtener permisos del rol:', error);
      return [];
    }
  }

  // ================================
  // 🔌 UTILIDADES
  // ================================

  getToken() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token') || '';
    }
    return '';
  }

  // ✅ ACTUALIZADO: Permisos mock con IDs correctos - CAMBIADO: usar modulo como nombre
  obtenerPermisosMock() {
    return [
      { id: 1, nombre: 'Dashboard', modulo: 'Dashboard', estado: true },
      { id: 2, nombre: 'Roles', modulo: 'Roles', estado: true },
      { id: 3, nombre: 'Usuarios', modulo: 'Usuarios', estado: true },
      { id: 4, nombre: 'Cliente', modulo: 'Cliente', estado: true },
      { id: 5, nombre: 'Ventas', modulo: 'Ventas', estado: true },
      { id: 6, nombre: 'Sedes', modulo: 'Sedes', estado: true },
      { id: 7, nombre: 'Cat.Productos', modulo: 'Cat.Productos', estado: true },
      { id: 8, nombre: 'Productos', modulo: 'Productos', estado: true },
      { id: 9, nombre: 'Cat.Insumos', modulo: 'Cat.Insumos', estado: true },
      { id: 10, nombre: 'Insumos', modulo: 'Insumos', estado: true },
      { id: 11, nombre: 'Proveedores', modulo: 'Proveedores', estado: true },
      { id: 12, nombre: 'Compras', modulo: 'Compras', estado: true },
      { id: 13, nombre: 'Produccion', modulo: 'Produccion', estado: true },
    ];
  }

  transformarRolDesdeAPI(rol) {
    return {
      id: rol.idrol || rol.id,
      nombre: rol.rol || rol.nombre,
      descripcion: rol.descripcion,
      permisos: rol.permisos || [],
      activo: rol.estado !== undefined ? rol.estado : true,
      tieneUsuarios: rol.tieneUsuarios || false,
      esAdmin: this.esRolAdmin(rol.rol || rol.nombre) // ✅ NUEVO: Marcar si es admin
    };
  }

  transformarRolesDesdeAPI(roles) {
    return Array.isArray(roles) ? roles.map(r => this.transformarRolDesdeAPI(r)) : [];
  }

  transformarRolParaAPI(rol) {
    return {
      rol: rol.nombre,
      descripcion: rol.descripcion,
      estado: rol.activo !== undefined ? rol.activo : true,
    };
  }

  // ✅ CORREGIDO: Usar modulo como nombre en lugar de descripción
  transformarPermisosDesdeAPI(permisos) {
    if (!Array.isArray(permisos)) return [];
    return permisos.map(p => ({
      id: p.idpermiso || p.id,
      nombre: p.modulo || p.descripcion || p.nombre, // ✅ CAMBIADO: priorizar modulo
      modulo: p.modulo || 'Sin módulo',
      descripcion: p.descripcion || '',
      estado: p.estado !== false
    }));
  }

  // ✅ ACTUALIZADO: Validación que incluye verificación de Admin
  validarDatosRol(rolData) {
    const errores = [];
    
    // ✅ NUEVO: Validar que no se intente crear Admin
    if (this.esRolAdmin(rolData.nombre)) {
      errores.push('No se puede crear otro rol con el nombre "Admin"');
    }
    
    if (!rolData.nombre?.trim()) errores.push('El nombre del rol es obligatorio');
    if (rolData.nombre?.trim().length < 3) errores.push('El nombre del rol debe tener al menos 3 caracteres');
    if (rolData.nombre?.trim().length > 20) errores.push('El nombre del rol no puede tener más de 20 caracteres');
    if (!rolData.descripcion?.trim()) errores.push('La descripción del rol es obligatoria');
    if (rolData.descripcion?.trim().length < 5) errores.push('La descripción debe tener al menos 5 caracteres');
    if (rolData.descripcion?.trim().length > 30) errores.push('La descripción no puede tener más de 30 caracteres');
    if (!rolData.permisos?.length) errores.push('Debe seleccionar al menos un permiso');

    const permisosInvalidos = rolData.permisos?.filter(p =>
      typeof p !== 'number' || p <= 0 || !Number.isInteger(p)
    ) || [];

    if (permisosInvalidos.length > 0) {
      errores.push(`Permisos inválidos encontrados: ${permisosInvalidos.join(', ')}`);
    }

    return {
      valido: errores.length === 0,
      errores,
      detalles: {
        nombre: rolData.nombre?.trim() || '',
        descripcion: rolData.descripcion?.trim() || '',
        permisos: rolData.permisos || [],
        cantidadPermisos: rolData.permisos?.length || 0
      }
    };
  }
}

const roleApiService = new RoleApiService();
export default roleApiService;