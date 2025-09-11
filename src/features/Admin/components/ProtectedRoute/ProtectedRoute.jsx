// components/ProtectedRoute/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import permissionsService from '../../services/permissionsService';

const ProtectedRoute = ({ 
  children, 
  requiredPermission, 
  requiredPermissions = [], 
  requireAll = false,
  fallbackPath = '/admin/pages/Dashboard'
}) => {
  const [hasAccess, setHasAccess] = useState(null); // null = loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        setLoading(true);
        
        // Obtener permisos del usuario
        const userPermissions = await permissionsService.getUserPermissions();
        
        let access = false;

        // Si hay un permiso específico requerido
        if (requiredPermission) {
          access = permissionsService.hasPermission(requiredPermission);
        }
        // Si hay múltiples permisos requeridos
        else if (requiredPermissions.length > 0) {
          if (requireAll) {
            access = permissionsService.hasAllPermissions(requiredPermissions);
          } else {
            access = permissionsService.hasAnyPermission(requiredPermissions);
          }
        }
        // Si no se especifica permiso, permitir acceso
        else {
          access = true;
        }

        console.log('Verificación de permisos:', {
          requiredPermission,
          requiredPermissions,
          requireAll,
          userPermissions,
          access
        });

        setHasAccess(access);
      } catch (error) {
        console.error('Error al verificar permisos:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [requiredPermission, requiredPermissions, requireAll]);

  // Mostrar loading mientras se verifican permisos
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Verificando permisos...</span>
        </div>
        <span className="ms-3">Verificando permisos...</span>
      </div>
    );
  }

  // Si no tiene acceso, redirigir
  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Si tiene acceso, mostrar el componente
  return children;
};

// Componente para mostrar mensaje de acceso denegado
export const AccessDenied = ({ message = "No tienes permisos para acceder a esta página" }) => {
  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card border-warning">
            <div className="card-body text-center">
              <div className="mb-4">
                <i className="bi bi-shield-exclamation text-warning" style={{ fontSize: '4rem' }}></i>
              </div>
              <h4 className="card-title text-warning">Acceso Denegado</h4>
              <p className="card-text text-muted">{message}</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.history.back()}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Regresar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;