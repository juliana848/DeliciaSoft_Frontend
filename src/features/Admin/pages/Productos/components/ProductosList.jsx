import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import SearchBar from "../../../components/SearchBar";
import Notification from "../../../components/Notification";
import productosApiService from "../../../services/productos_services";
import "../../../adminStyles.css";

const ProductosList = forwardRef(({ onAdd, onEdit, onView, onDelete }, ref) => {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });
  const [loading, setLoading] = useState(true);

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
      console.log('Productos cargados en lista:', data); // Debug
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

  // CORREGIDO: Componente de imagen mejorado
  const ImagenProducto = ({ producto }) => {
    // Múltiples formas de obtener la URL de la imagen
    const urlImagen = producto.urlimagen || 
                      producto.imagenes?.urlimg || 
                      producto.imagen?.urlimg ||
                      producto.imagen;

    console.log('Datos de imagen para producto:', {
      id: producto.id,
      nombre: producto.nombre,
      urlimagen: producto.urlimagen,
      imagenes: producto.imagenes,
      imagen: producto.imagen,
      urlFinal: urlImagen
    });

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
            border: "1px solid #ddd"
          }}
          onError={(e) => {
            console.error('Error cargando imagen:', urlImagen);
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'block';
          }}
          onLoad={() => {
            console.log('✅ Imagen cargada exitosamente:', urlImagen);
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
        textAlign: "center"
      }}>
        Sin imagen
      </div>
    );
  };

  // Exponer refresh al padre mediante el ref
  useImperativeHandle(ref, () => ({
    refreshProductos: cargarProductos,
  }));

  if (loading) {
    return (
      <div className="admin-wrapper">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Cargando productos...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <div className="admin-toolbar">
        <button className="admin-button pink" onClick={onAdd}>
          + Agregar
        </button>
        <SearchBar
          placeholder="Buscar productos..."
          value={filtro}
          onChange={handleSearch}
        />
      </div>

      <h2 className="admin-section-title">Gestión de productos</h2>

      <DataTable
        value={filteredProductos}
        paginator
        rows={5}
        className="admin-table"
        emptyMessage="No se encontraron productos"
      >
        <Column
          header="N°"
          body={(_, { rowIndex }) => rowIndex + 1}
          style={{ width: "3rem" }}
        />

        {/* CORREGIDO: Columna de imagen usando el componente mejorado */}
        <Column
          header="Imagen"
          body={(row) => <ImagenProducto producto={row} />}
          style={{ width: "100px", textAlign: "center" }}
        />

        <Column field="nombre" header="Nombre" style={{ width: "200px" }} />

        <Column
          field="precio"
          header="Precio"
          body={(row) => formatearPrecio(row.precio)}
          style={{ width: "150px" }}
        />

        <Column field="categoria" header="Categoría" style={{ width: "150px" }} />

        <Column
          header="Estado"
          body={(row) => (
            <InputSwitch checked={row.estado} onChange={() => toggleEstado(row)} />
          )}
          style={{ width: "80px", textAlign: "center" }}
        />

        <Column
          header="Acción"
          body={(row) => (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="admin-button gray"
                onClick={() => onView(row)}
                title="Ver detalles"
              >
                👁
              </button>
              <button
                className="admin-button yellow"
                onClick={() => onEdit(row)}
                title="Editar"
              >
                ✏️
              </button>
              <button
                className="admin-button red"
                onClick={() => onDelete(row)}
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          )}
        />
      </DataTable>

    </div>
  );
});

export default ProductosList;