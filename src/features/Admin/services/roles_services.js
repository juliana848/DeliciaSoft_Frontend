// Servicio API para gestión de roles y permisos - CORREGIDO
const API_BASE_URL = 'https://deliciasoft-backend.onrender.com/api';

class RoleApiService {
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

  // Crear nuevo rol con permisos
  async crearRol(rolData) {
    try {
      const rolAPI = this.transformarRolParaAPI(rolData);
      const response = await fetch(`${API_BASE_URL}/rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(rolAPI),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const rolCreado = this.transformarRolDesdeAPI(data);

      // Asignar permisos después de crear el rol
      if (rolData.permisos?.length > 0) {
        await this.asignarPermisosRol(rolCreado.id, rolData.permisos);
        rolCreado.permisos = rolData.permisos;
      }
      return rolCreado;
    } catch (error) {
      console.error('Error al crear rol:', error);
      throw error;
    }
  }

  // Actualizar rol con permisos
  async actualizarRol(id, rolData) {
    try {
      const rolAPI = this.transformarRolParaAPI(rolData);
      const response = await fetch(`${API_BASE_URL}/rol/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(rolAPI),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      await response.json(); // Consumimos respuesta aunque no la usemos

      // Actualizar permisos si vienen en la data
      if (rolData.permisos) {
        await this.actualizarPermisosRol(id, rolData.permisos);
      }
      return { ...rolData, id };
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
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
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

  // Asignar permisos a rol
  async asignarPermisosRol(idRol, idsPermisos) {
    try {
      const response = await fetch(`${API_BASE_URL}/rol/${idRol}/permisos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ permisos: idsPermisos }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al asignar permisos');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al asignar permisos:', error);
      throw error;
    }
  }

  // Actualizar permisos
  async actualizarPermisosRol(idRol, idsPermisos) {
    try {
      const response = await fetch(`${API_BASE_URL}/rol/${idRol}/permisos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ permisos: idsPermisos }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar permisos');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar permisos:', error);
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
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar estado');
      }
      return await response.json();
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

  // Obtener permisos
  async obtenerPermisos() {
    try {
      const response = await fetch(`${API_BASE_URL}/permisos`, {
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

  // Obtener permisos por rol
  async obtenerPermisosRol(idRol) {
    try {
      const response = await fetch(`${API_BASE_URL}/rol/${idRol}/permisos`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.map(permiso => permiso.idpermiso || permiso.id);
    } catch {
      return [];
    }
  }

  // Permisos mock
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

  // Transformaciones
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
    return Array.isArray(permisos) ? permisos.map(p => ({
      id: p.idpermiso || p.id,
      nombre: p.descripcion || p.nombre,
      modulo: p.modulo,
      descripcion: p.descripcion || ''
    })) : [];
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
    return { valido: errores.length === 0, errores };
  }
}

const roleApiService = new RoleApiService();
export default roleApiService;
