// hooks/usePermissions.js
import { useState, useEffect } from 'react';
import permissionsService from '../services/permissionsService';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const userPermissions = await permissionsService.getUserPermissions();
      setPermissions(userPermissions);
    } catch (err) {
      console.error('Error loading permissions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshPermissions = async () => {
    try {
      setError(null);
      const userPermissions = await permissionsService.refreshPermissions();
      setPermissions(userPermissions);
      return userPermissions;
    } catch (err) {
      console.error('Error refreshing permissions:', err);
      setError(err.message);
      return [];
    }
  };

  const hasPermission = (permission) => {
    return permissionsService.hasPermission(permission);
  };

  const hasAnyPermission = (permissionList) => {
    return permissionsService.hasAnyPermission(permissionList);
  };

  const hasAllPermissions = (permissionList) => {
    return permissionsService.hasAllPermissions(permissionList);
  };

  const canAccessRoute = (route) => {
    return permissionsService.canAccessRoute(route);
  };

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    refreshPermissions,
    reload: loadPermissions
  };
};

// Hook específico para verificar un permiso
export const usePermission = (permission) => {
  const { permissions, loading, hasPermission } = usePermissions();
  
  return {
    hasAccess: hasPermission(permission),
    loading,
    permissions
  };
};

// Hook para verificar múltiples permisos
export const useMultiplePermissions = (permissionList, requireAll = false) => {
  const { permissions, loading, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  const hasAccess = requireAll 
    ? hasAllPermissions(permissionList)
    : hasAnyPermission(permissionList);

  return {
    hasAccess,
    loading,
    permissions,
    missingPermissions: permissionList.filter(p => !permissions.includes(p))
  };
};