import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import AdminHeader from '../../../../features/Admin/components/AdminHeader';
import './Layout.css';

const Layout = ({ children, userRole = 'admin', showSidebar = true }) => {
  const [insumos, setInsumos] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  // Cargar insumos y pedidos para las notificaciones
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE_URL = 'https://deliciasoft-backend.onrender.com/api';
        
        // Cargar insumos
        const insumosRes = await fetch(`${API_BASE_URL}/insumos`);
        if (insumosRes.ok) {
          const insumosData = await insumosRes.json();
          console.log('✅ Insumos cargados:', insumosData.length);
          setInsumos(insumosData);
        }

        // Cargar ventas (que incluyen pedidos)
        try {
          console.log('🔍 Cargando ventas desde:', `${API_BASE_URL}/venta`);
          const ventasRes = await fetch(`${API_BASE_URL}/venta`);
          if (ventasRes.ok) {
            const ventasData = await ventasRes.json();
            console.log('✅ Ventas cargadas:', ventasData.length);
            console.log('📦 Ejemplo de venta:', ventasData[0]);
            
            // Transformar ventas al formato esperado por NotificationBell
            const ventasTransformadas = ventasData.map(venta => ({
              idpedido: venta.idventa,
              idVenta: venta.idventa,
              fechaEntrega: venta.fechaventa, // Usar fechaventa como fechaEntrega
              nombreCliente: venta.cliente || 'Cliente',
              idEstadoVenta: venta.estadoVentaId || venta.idestadoventa,
              estadoVentaId: venta.estadoVentaId || venta.idestadoventa,
              nombreEstado: venta.estadoVenta?.nombre_estado || venta.nombreEstado || 'Desconocido',
              tipoVenta: venta.tipoventa,
              total: venta.total
            }));
            
            console.log('🔄 Ventas transformadas:', ventasTransformadas.length);
            console.log('📋 Estados encontrados:', [...new Set(ventasTransformadas.map(v => `${v.nombreEstado} (ID: ${v.idEstadoVenta})`))]);
            
            setPedidos(ventasTransformadas);
          }
        } catch (ventasError) {
          console.error('❌ Error al cargar ventas:', ventasError);
        }
      } catch (error) {
        console.error('❌ Error cargando datos para notificaciones:', error);
      }
    };

    fetchData();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="layout-container">
      {showSidebar && <Sidebar userRole={userRole} />}
      {showSidebar && <AdminHeader insumos={insumos} pedidos={pedidos} />}
      <div className={`main-content ${showSidebar ? 'with-sidebar' : 'full-width'}`}>
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;