import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import SearchBar from "../../../components/SearchBar";
import Notification from "../../../components/Notification";
import Tooltip from "../../../components/Tooltip";
import productosApiService from "../../../services/productos_services";
import "../../../adminStyles.css";
import LoadingSpinner from '../../../components/LoadingSpinner';
import ConfiguracionProducto from "./ConfiguracionProducto";

const ProductosList = forwardRef(({ onAdd, onEdit, onView, onDelete }, ref) => {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });
  const [loading, setLoading] = useState(true);
  const [productoAConfigurar, setProductoAConfigurar] = useState(null);
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);

  const handleConfiguracion = (producto) => {
    setProductoAConfigurar(producto);
    setMostrarConfiguracion(true);
  };

  const handleCloseConfiguracion = () => {
    setProductoAConfigurar(null);
    setMostrarConfiguracion(false);
  };

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await productosApiService.obtenerProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setProductos([]);
      showNotification("Error al cargar productos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const toggleEstado = async (producto) => {
    try {
      const nuevoEstado = !producto.estado;
      await productosApiService.actualizarProducto(producto.id, {
        ...producto,
        estado: nuevoEstado,
      });

      const updated = productos.map((p) =>
        p.id === producto.id ? { ...p, estado: nuevoEstado } : p
      );
      setProductos(updated);

      showNotification(
        `Producto ${nuevoEstado ? "activado" : "inactivado"} exitosamente`
      );
    } catch (error) {
      console.error("Error cambiando estado:", error);
      showNotification("Error al cambiar estado del producto", "error");
    }
  };

  const showNotification = (mensaje, tipo = "success") => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => {
    setNotification({ visible: false, mensaje: "", tipo: "success" });
  };

  const handleSearch = (query) => {
    setFiltro(query);
  };

  const filteredProductos = productos.filter((producto) =>
    producto.nombre?.toLowerCase().includes(filtro.toLowerCase())
  );

  const ImagenProducto = ({ producto }) => {
    const urlImagen = producto.urlimagen ||
      producto.imagenes?.urlimg ||
      producto.imagen?.urlimg ||
      producto.imagen;

    if (urlImagen) {
      return (
        <img
          src={urlImagen}
          alt={producto.nombre || 'Producto'}
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
            borderRadius: "6px",
            border: "1px solid #ddd",
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    }

    return (
      <div style={{
        width: "50px",
        height: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
        border: "1px dashed #ddd",
        borderRadius: "6px",
        fontSize: "10px",
        color: "#666",
        textAlign: "center",
      }}>
        Sin imagen
      </div>
    );
  };

  useImperativeHandle(ref, () => ({
    refreshProductos: cargarProductos,
  }));

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-wrapper">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      {/* Toolbar: Buscador + Agregar a la derecha */}
      <div className="admin-toolbar">
        <SearchBar
          placeholder="Buscar productos..."
          value={filtro}
          onChange={handleSearch}
        />
        <button 
          className="admin-button pink" 
          onClick={onAdd}
          type="button"
        >
          <i className="fas fa-plus"></i> Agregar
        </button>
      </div>

      <h2 className="admin-section-title">Gestión de productos</h2>

      <DataTable
        value={filteredProductos}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        className="admin-table compact-paginator"
        emptyMessage="No se encontraron productos"
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column
          header="N°"
          body={(_, { rowIndex }) => rowIndex + 1}
          style={{ width: '50px' }}
        />

        <Column
          header="Imagen"
          body={(row) => <ImagenProducto producto={row} />}
          style={{ width: "100px" }}
        />

        <Column
          field="nombre"
          header="Nombre"
        />

        <Column
          field="precio"
          header="Precio"
          body={(row) => formatearPrecio(row.precio)}
        />

        <Column
          field="categoria"
          header="Categoría"
        />

        <Column
          header="Estado"
          body={(row) => (
            <InputSwitch checked={row.estado} onChange={() => toggleEstado(row)} />
          )}
          style={{ width: '80px' }}
        />

        <Column
          header="Acciones"
          body={(row) => (
            <div style={{ display: "flex", justifyContent: "center", gap: "3px" }}>
              <Tooltip text="Visualizar">
                <button
                  className="admin-button"
                  onClick={() => onView(row)}
                  style={{
                    background: '#e3f2fd',
                    color: '#1976d2',
                    border: 'none',
                    borderRadius: '6px',
                    width: '26px',
                    height: '26px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="fas fa-eye" style={{ fontSize: '11px' }}></i>
                </button>
              </Tooltip>
              
              <Tooltip text="Editar">
                <button
                  className="admin-button"
                  onClick={() => onEdit(row)}
                  style={{
                    background: '#fff8e1',
                    color: '#f57c00',
                    border: 'none',
                    borderRadius: '6px',
                    width: '26px',
                    height: '26px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="fas fa-pen" style={{ fontSize: '11px' }}></i>
                </button>
              </Tooltip>
              
              <Tooltip text="Eliminar">
                <button
                  className="admin-button"
                  onClick={() => onDelete(row)}
                  style={{
                    background: '#ffebee',
                    color: '#d32f2f',
                    border: 'none',
                    borderRadius: '6px',
                    width: '26px',
                    height: '26px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="fas fa-trash" style={{ fontSize: '11px' }}></i>
                </button>
              </Tooltip>
              
              <Tooltip text="Configurar personalización">
                <button
                  onClick={() => handleConfiguracion(row)}
                  style={{
                    background: "#8b5cf6",
                    color: "white",
                    border: 'none',
                    borderRadius: '6px',
                    width: '26px',
                    height: '26px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="fas fa-cog" style={{ fontSize: '11px' }}></i>
                </button>
              </Tooltip>
            </div>
          )}
          style={{ width: '120px' }}
        />
      </DataTable>

      {mostrarConfiguracion && productoAConfigurar && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
          overflowY: "auto"
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            maxWidth: "800px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <ConfiguracionProducto
              idProducto={productoAConfigurar.id || productoAConfigurar.idproductogeneral}
              nombreProducto={productoAConfigurar.nombre || productoAConfigurar.nombreproducto}
              onSave={(config) => {
                handleCloseConfiguracion();
              }}
              onCancel={handleCloseConfiguracion}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default ProductosList;