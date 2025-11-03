import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import AdminHeader from '../../../../features/Admin/components/AdminHeader';
import './Layout.css';

const Layout = ({ children, userRole = 'admin', showSidebar = true }) => {
  const [insumos, setInsumos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [producciones, setProducciones] = useState([]); // ✅ NUEVO

  // ✅ Función para cargar todos los datos
  const cargarDatosParaNotificaciones = async () => {
    try {
      const API_BASE_URL = 'https://deliciasoft-backend-i6g9.onrender.com/api';
      
      // Cargar insumos
      try {
        const insumosRes = await fetch(`${API_BASE_URL}/insumos`);
        if (insumosRes.ok) {
          const insumosData = await insumosRes.json();
          console.log('✅ Insumos cargados:', insumosData.length);
          setInsumos(insumosData);
        }
      } catch (insumosError) {
        console.error('❌ Error al cargar insumos:', insumosError);
      }

      // Cargar ventas (que incluyen pedidos)
      try {
        console.log('🔍 Cargando ventas desde:', `${API_BASE_URL}/venta`);
        const ventasRes = await fetch(`${API_BASE_URL}/venta`);
        if (ventasRes.ok) {
          const ventasData = await ventasRes.json();
          console.log('✅ Ventas cargadas:', ventasData.length);
          
          // Transformar ventas al formato esperado por NotificationBell
          const ventasTransformadas = ventasData.map(venta => ({
            idpedido: venta.idventa,
            idVenta: venta.idventa,
            fechaVenta: venta.fechaventa,
            fechaEntrega: venta.fechaentrega || venta.fechaventa,
            nombreCliente: venta.cliente || venta.clienteData?.nombre || 'Cliente',
            idEstadoVenta: venta.estadoVentaId || venta.idestadoventa,
            estadoVentaId: venta.estadoVentaId || venta.idestadoventa,
            nombreEstado: venta.estadoVenta?.nombre_estado || venta.nombreEstado || 'Desconocido',
            tipoVenta: venta.tipoventa,
            total: venta.total,
            // ✅ IMPORTANTE: Campo para detectar actualizaciones recientes
            fechaActualizacion: venta.updatedAt || venta.updated_at || venta.fechaventa
          }));
          
          console.log('📄 Ventas transformadas:', ventasTransformadas.length);
          setPedidos(ventasTransformadas);
        }
      } catch (ventasError) {
        console.error('❌ Error al cargar ventas:', ventasError);
      }

      // ✅ NUEVO: Cargar producciones
      try {
        console.log('🏭 Cargando producciones desde:', `${API_BASE_URL}/produccion`);
        const produccionesRes = await fetch(`${API_BASE_URL}/produccion`);
        if (produccionesRes.ok) {
          const produccionesData = await produccionesRes.json();
          console.log('✅ Producciones cargadas:', produccionesData.length);
          
          // Transformar producciones al formato esperado
          const produccionesTransformadas = produccionesData.map(prod => ({
            id: prod.idproduccion || prod.id,
            idproduccion: prod.idproduccion || prod.id,
            nombreProduccion: prod.nombreproduccion || `Producción #${prod.idproduccion}`,
            tipoProduccion: (prod.TipoProduccion || prod.tipoProduccion || '').toLowerCase(),
            estadoProduccion: prod.estadoproduccion,
            estadoPedido: prod.estadopedido,
            fechaCreacion: prod.fechapedido || prod.createdAt,
            fechaEntrega: prod.fechaentrega,
            // ✅ IMPORTANTE: Campo para detectar actualizaciones recientes
            fechaActualizacion: prod.updatedAt || prod.updated_at || prod.fechapedido,
            numeroPedido: prod.numeropedido
          }));
          
          console.log('📊 Producciones transformadas:', produccionesTransformadas.length);
          console.log('🏷️ Tipos encontrados:', [...new Set(produccionesTransformadas.map(p => p.tipoProduccion))]);
          setProducciones(produccionesTransformadas);
        }
      } catch (produccionesError) {
        console.error('❌ Error al cargar producciones:', produccionesError);
      }
    } catch (error) {
      console.error('❌ Error general cargando datos:', error);
    }
  };

  // ✅ Cargar datos al montar y cada 2 minutos
  useEffect(() => {
    cargarDatosParaNotificaciones();
    
    // Actualizar cada 2 minutos para detectar cambios
    const interval = setInterval(() => {
      console.log('🔄 Actualizando notificaciones...');
      cargarDatosParaNotificaciones();
    }, 120000); // 2 minutos
    
    return () => clearInterval(interval);
  }, []);

  // ✅ Funciones para actualizar datos específicos (para pasar a componentes hijos)
  const actualizarPedidos = async () => {
    try {
      const API_BASE_URL = 'https://deliciasoft-backend-i6g9.onrender.com/api';
      const ventasRes = await fetch(`${API_BASE_URL}/venta`);
      if (ventasRes.ok) {
        const ventasData = await ventasRes.json();
        const ventasTransformadas = ventasData.map(venta => ({
          idpedido: venta.idventa,
          idVenta: venta.idventa,
          fechaVenta: venta.fechaventa,
          fechaEntrega: venta.fechaentrega || venta.fechaventa,
          nombreCliente: venta.cliente || venta.clienteData?.nombre || 'Cliente',
          idEstadoVenta: venta.estadoVentaId || venta.idestadoventa,
          estadoVentaId: venta.estadoVentaId || venta.idestadoventa,
          nombreEstado: venta.estadoVenta?.nombre_estado || venta.nombreEstado || 'Desconocido',
          tipoVenta: venta.tipoventa,
          total: venta.total,
          fechaActualizacion: venta.updatedAt || venta.updated_at || venta.fechaventa
        }));
        setPedidos(ventasTransformadas);
        console.log('🔄 Pedidos actualizados');
      }
    } catch (error) {
      console.error('Error actualizando pedidos:', error);
    }
  };

  const actualizarProducciones = async () => {
    try {
      const API_BASE_URL = 'https://deliciasoft-backend-i6g9.onrender.com/api';
      const produccionesRes = await fetch(`${API_BASE_URL}/produccion`);
      if (produccionesRes.ok) {
        const produccionesData = await produccionesRes.json();
        const produccionesTransformadas = produccionesData.map(prod => ({
          id: prod.idproduccion || prod.id,
          idproduccion: prod.idproduccion || prod.id,
          nombreProduccion: prod.nombreproduccion || `Producción #${prod.idproduccion}`,
          tipoProduccion: (prod.TipoProduccion || prod.tipoProduccion || '').toLowerCase(),
          estadoProduccion: prod.estadoproduccion,
          estadoPedido: prod.estadopedido,
          fechaCreacion: prod.fechapedido || prod.createdAt,
          fechaEntrega: prod.fechaentrega,
          fechaActualizacion: prod.updatedAt || prod.updated_at || prod.fechapedido,
          numeroPedido: prod.numeropedido
        }));
        setProducciones(produccionesTransformadas);
        console.log('🔄 Producciones actualizadas');
      }
    } catch (error) {
      console.error('Error actualizando producciones:', error);
    }
  };

  return (
    <div className="layout-container">
      {showSidebar && <Sidebar userRole={userRole} />}
      {/* ✅ PASAR PRODUCCIONES AL HEADER */}
      {showSidebar && (
        <AdminHeader 
          insumos={insumos} 
          pedidos={pedidos} 
          producciones={producciones} 
        />
      )}
      <div className={`main-content ${showSidebar ? 'with-sidebar' : 'full-width'}`}>
        <div className="content-wrapper">
          {/* ✅ Si usas React Router, pasar funciones via Outlet */}
          {children || (
            <Outlet context={{ 
              actualizarPedidos, 
              actualizarProducciones,
              cargarDatosParaNotificaciones 
            }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;