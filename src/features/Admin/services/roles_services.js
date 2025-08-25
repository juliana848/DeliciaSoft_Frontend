// Servicio API para gestión de roles y permisos - FINAL CORREGIDO Y MEJORADO
const API_BASE_URL = 'https://deliciasoft-backend.onrender.com/api';

class RoleApiService {
  // ================================
  // 📌 ROLES
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
      return this.transformarRolesDesdeAPI(data);
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw new Error('Error al obtener la lista de roles');
    }
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

  // Actualizar rol con permisos
  async actualizarRol(id, rolData) {
    try {
      const rolAPI = this.transformarRolParaAPI(rolData);

      if (rolData.permisos && Array.isArray(rolData.permisos)) {
        const permisosValidos = rolData.permisos.filter(p =>
          typeof p === 'number' && p > 0
        );
        if (permisosValidos.length > 0) {
          rolAPI.permisos = permisosValidos;
        }
      }

      console.log('Actualizando rol con datos:', rolAPI);

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
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: `HTTP ${response.status}: ${errorText}` };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Rol actualizado:', data);

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

  // Eliminar rol
  async eliminarRol(id) {
    try {
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
  // 📌 PERMISOS
  // ================================

  // Obtener permisos (todos)
  async obtenerPermisos() {
    try {
      const response = await fetch(`https://deliciasoft-backend.onrender.com/api/permisos`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return this.transformarPermisosDesdeAPI(data);
    } catch (error) {
      console.error('Error al obtener permisos:', error);
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
  // 📌 UTILIDADES
  // ================================

  getToken() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token') || '';
    }
    return '';
  }

  obtenerPermisosMock() {
    return [
      { id: 1, nombre: 'Dashboard', modulo: 'Dashboard' },
      { id: 2, nombre: 'Roles', modulo: 'Roles' },
      { id: 3, nombre: 'Usuarios', modulo: 'Usuarios' },
      { id: 4, nombre: 'Cliente', modulo: 'Cliente' },
      { id: 5, nombre: 'Ventas', modulo: 'Ventas' },
      { id: 6, nombre: 'Sedes', modulo: 'Sedes' },
      { id: 7, nombre: 'Cat.Productos', modulo: 'Cat.Productos' },
      { id: 8, nombre: 'Productos', modulo: 'Productos' },
      { id: 9, nombre: 'Cat.Insumos', modulo: 'Cat.Insumos' },
      { id: 10, nombre: 'Insumos', modulo: 'Insumos' },
      { id: 11, nombre: 'Proveedores', modulo: 'Proveedores' },
      { id: 12, nombre: 'Compras', modulo: 'Compras' },
      { id: 13, nombre: 'Produccion', modulo: 'Produccion' },
    ];
  }

  transformarRolDesdeAPI(rol) {
    return {
      id: rol.idrol || rol.id,
      nombre: rol.rol || rol.nombre,
      descripcion: rol.descripcion,
      permisos: rol.permisos || [],
      activo: rol.estado !== undefined ? rol.estado : true,
      tieneUsuarios: rol.tieneUsuarios || false
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

  transformarPermisosDesdeAPI(permisos) {
    if (!Array.isArray(permisos)) return [];
    return permisos.map(p => ({
      id: p.idpermiso || p.id,
      nombre: p.descripcion || p.nombre,
      modulo: p.modulo || 'Sin módulo',
      descripcion: p.descripcion || '',
      estado: p.estado !== false
    }));
  }

  validarDatosRol(rolData) {
    const errores = [];
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
