import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import Modal from "../components/modal";
import SearchBar from "../components/SearchBar";
import Notification from "../components/Notification";
import { Dropdown } from "primereact/dropdown"; // Necesario para el dropdown de unidades
import "../adminStyles.css"; // Asegúrate de que los estilos personalizados estén correctos

export default function Productos() {
  // Estados generales
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });

  // Modal principal producto (agregar, editar, visualizar, eliminar)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Formularios de producto
  const [nombreEditado, setNombreEditado] = useState("");
  const [precioEditado, setPrecioEditado] = useState("");
  const [categoriaEditada, setCategoriaEditada] = useState("");
  // Estados para cantidad por sede (solo visible en editar/visualizar)
  const [cantidadSanPablo, setCantidadSanPablo] = useState("");
  const [cantidadSanBenito, setCantidadSanBenito] = useState("");

  // Modal para CREAR recetas desde productos
  const [modalCrearRecetaVisible, setModalCrearRecetaVisible] = useState(false);
  const [nuevaRecetaNombre, setNuevaRecetaNombre] = useState("");
  const [nuevaRecetaEspecificaciones, setNuevaRecetaEspecificaciones] =
    useState("");
  const [recetasSeleccionadas, setRecetasSeleccionadas] = useState([]); // Recetas asociadas al producto actual

  // Estados para el Modal de Agregar Insumos
  const [modalAgregarInsumosVisible, setModalAgregarInsumosVisible] =
    useState(false);
  const [filtroInsumos, setFiltroInsumos] = useState("");
  const [insumosDisponibles, setInsumosDisponibles] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [insumosSeleccionadosParaReceta, setInsumosSeleccionadosParaReceta] =
    useState(new Map()); // Map<id_insumo, {insumo_obj, cantidad, unidad_id}>

  // Mock inicial para categorías, productos, insumos y unidades
  useEffect(() => {
    const mockCategorias = [
      { id: 301, nombre: "Fresas con crema" },
      { id: 302, nombre: "Obleas" },
      { id: 303, nombre: "Cupcakes" },
      { id: 304, nombre: "Postres" },
      { id: 305, nombre: "Pasteles" },
      { id: 306, nombre: "Arroz con leche" },
    ];
    setCategorias(mockCategorias);

    const mockUnidadesMedida = [
      { label: "Seleccionar unidad...", value: "", disabled: true },
      { label: "Kilogramos", value: 1, text: "kg" },
      { label: "Gramos", value: 2, text: "gr" },
      { label: "Litros", value: 3, text: "litros" },
      { label: "Mililitros", value: 4, text: "ml" },
      { label: "Unidades", value: 5, text: "unidad" },
    ];
    setUnidadesMedida(mockUnidadesMedida);

    const mockInsumos = [
      {
        id: 1,
        nombre: "Harina de Trigo",
        IdCategoriaInsumo: 1,
        categoria: "Panadería",
        estado: true,
      },
      {
        id: 2,
        nombre: "Azúcar Blanca",
        IdCategoriaInsumo: 1,
        categoria: "Panadería",
        estado: true,
      },
      {
        id: 3,
        nombre: "Levadura Seca",
        IdCategoriaInsumo: 1,
        categoria: "Panadería",
        estado: true,
      },
      {
        id: 4,
        nombre: "Huevos A",
        IdCategoriaInsumo: 2,
        categoria: "Lácteos y Huevos",
        estado: true,
      },
      {
        id: 5,
        nombre: "Leche Entera",
        IdCategoriaInsumo: 2,
        categoria: "Lácteos y Huevos",
        estado: true,
      },
      {
        id: 6,
        nombre: "Mantequilla sin sal",
        IdCategoriaInsumo: 2,
        categoria: "Lácteos y Huevos",
        estado: true,
      },
      {
        id: 7,
        nombre: "Esencia de Vainilla",
        IdCategoriaInsumo: 3,
        categoria: "Especias y Condimentos",
        estado: true,
      },
      {
        id: 8,
        nombre: "Cacao en Polvo",
        IdCategoriaInsumo: 1,
        categoria: "Panadería",
        estado: true,
      },
      {
        id: 9,
        nombre: "Sal",
        IdCategoriaInsumo: 3,
        categoria: "Especias y Condimentos",
        estado: true,
      },
      {
        id: 10,
        nombre: "Agua",
        IdCategoriaInsumo: 4,
        categoria: "Bebidas",
        estado: true,
      },
    ];
    setInsumosDisponibles(mockInsumos);

    const mockProductos = [
      {
        id: 1,
        nombre: "Torta de Chocolate",
        precio: 25000,
        idCategoriaProducto: 305,
        categoria: "Pasteles",
        estado: true,
        cantidadSanPablo: 15,
        cantidadSanBenito: 10,
        recetas: [
          {
            Idreceta: 201,
            NombreReceta: "Receta Especial Torta Chocolate",
            Especificaciones:
              "Receta personalizada para la torta de chocolate con nuestro toque especial.",
            estado: true,
            tieneRelaciones: false,
            insumos: [
              {
                id: 1,
                nombre: "Harina de Trigo",
                Cantidad: 400,
                unidad: "gr",
                IdUnidadMedida: 2,
              },
              {
                id: 8,
                nombre: "Cacao en Polvo",
                Cantidad: 80,
                unidad: "gr",
                IdUnidadMedida: 2,
              },
              {
                id: 2,
                nombre: "Azúcar Blanca",
                Cantidad: 200,
                unidad: "gr",
                IdUnidadMedida: 2,
              },
              {
                id: 4,
                nombre: "Huevos A",
                Cantidad: 4,
                unidad: "unidad",
                IdUnidadMedida: 5,
              },
            ],
          },
        ],
      },
      {
        id: 2,
        nombre: "Cupcake de Vainilla",
        precio: 7000,
        idCategoriaProducto: 303,
        categoria: "Cupcakes",
        estado: true,
        cantidadSanPablo: 50,
        cantidadSanBenito: 30,
        recetas: [
          {
            Idreceta: 202,
            NombreReceta: "Receta Cupcake Básico Vainilla",
            Especificaciones:
              "Base para cupcakes de vainilla, adaptable a diferentes sabores.",
            estado: true,
            tieneRelaciones: false,
            insumos: [
              {
                id: 1,
                nombre: "Harina de Trigo",
                Cantidad: 200,
                unidad: "gr",
                IdUnidadMedida: 2,
              },
              {
                id: 2,
                nombre: "Azúcar Blanca",
                Cantidad: 150,
                unidad: "gr",
                IdUnidadMedida: 2,
              },
              {
                id: 7,
                nombre: "Esencia de Vainilla",
                Cantidad: 5,
                unidad: "ml",
                IdUnidadMedida: 4,
              },
              {
                id: 4,
                nombre: "Huevos A",
                Cantidad: 2,
                unidad: "unidad",
                IdUnidadMedida: 5,
              },
            ],
          },
        ],
      },
      {
        id: 3,
        nombre: "Fresas con Leche Condensada",
        precio: 9000,
        idCategoriaProducto: 301,
        categoria: "Fresas con crema",
        estado: true,
        cantidadSanPablo: 20,
        cantidadSanBenito: 25,
        recetas: [],
      },
    ];
    setProductos(mockProductos);
  }, []);

  // Notificaciones
  const showNotification = (mensaje, tipo = "success") => {
    setNotification({ visible: true, mensaje, tipo });
  };
  const hideNotification = () => {
    setNotification({ visible: false, mensaje: "", tipo: "success" });
  };

  // Abrir modal productos (agregar, editar, visualizar, eliminar)
  const abrirModal = (tipo, producto = null) => {
    setModalTipo(tipo);
    setProductoSeleccionado(producto);
    if (tipo === "editar" || tipo === "visualizar") {
      setNombreEditado(producto.nombre);
      setPrecioEditado(producto.precio.toString());
      setCategoriaEditada(producto.idCategoriaProducto.toString());
      setRecetasSeleccionadas(producto.recetas || []);
      setCantidadSanPablo(
        producto.cantidadSanPablo !== undefined
          ? producto.cantidadSanPablo.toString()
          : ""
      );
      setCantidadSanBenito(
        producto.cantidadSanBenito !== undefined
          ? producto.cantidadSanBenito.toString()
          : ""
      );
    }
    if (tipo === "agregar") {
      setNombreEditado("");
      setPrecioEditado("");
      setCategoriaEditada("");
      setRecetasSeleccionadas([]); // Vacío para un producto nuevo
      setCantidadSanPablo("");
      setCantidadSanBenito("");
    }
    setModalVisible(true);
  };
  const cerrarModal = () => {
    setModalVisible(false);
    setProductoSeleccionado(null);
    setModalTipo(null);
    setNombreEditado("");
    setPrecioEditado("");
    setCategoriaEditada("");
    setRecetasSeleccionadas([]);
    setCantidadSanPablo("");
    setCantidadSanBenito("");
  };

  // --- Funciones para el Modal de Crear Receta ---
  const abrirModalCrearReceta = () => {
    setNuevaRecetaNombre("");
    setNuevaRecetaEspecificaciones("");
    setInsumosSeleccionadosParaReceta(new Map()); // Resetear insumos para la nueva receta
    setModalCrearRecetaVisible(true);
  };

  const cerrarModalCrearReceta = () => {
    setModalCrearRecetaVisible(false);
  };

  const guardarNuevaRecetaEnProducto = () => {
    if (!nuevaRecetaNombre.trim()) {
      showNotification("El nombre de la receta es obligatorio", "error");
      return;
    }
    if (insumosSeleccionadosParaReceta.size === 0) {
      showNotification("Debe añadir al menos un insumo a la receta", "error");
      return;
    }

    // Convertir el Map de insumos a un array de objetos para la receta
    const insumosParaGuardar = Array.from(
      insumosSeleccionadosParaReceta.values()
    ).map((item) => ({
      id: item.insumo_obj.id,
      nombre: item.insumo_obj.nombre,
      Cantidad: parseFloat(item.cantidad),
      unidad:
        unidadesMedida.find((u) => u.value === item.unidad_id)?.text || "",
      IdUnidadMedida: item.unidad_id,
    }));

    const nuevoIdReceta = recetasSeleccionadas.length
      ? Math.max(...recetasSeleccionadas.map((r) => r.Idreceta)) + 1
      : 1;

    const nuevaReceta = {
      Idreceta: nuevoIdReceta,
      NombreReceta: nuevaRecetaNombre,
      Especificaciones: nuevaRecetaEspecificaciones,
      estado: true,
      tieneRelaciones: false,
      insumos: insumosParaGuardar,
    };

    setRecetasSeleccionadas([...recetasSeleccionadas, nuevaReceta]);
    cerrarModalCrearReceta();
    showNotification("Receta creada y añadida al producto");
  };

  // --- Funciones para el Modal de Agregar Insumos ---
  const abrirModalAgregarInsumos = () => {
    setFiltroInsumos(""); // Resetear filtro
    // Mantener los insumos ya seleccionados en el modal si se reabre
    // setInsumosSeleccionadosParaReceta(new Map(nuevaRecetaInsumos.map(i => [i.id, { insumo_obj: i, cantidad: i.Cantidad, unidad_id: i.IdUnidadMedida }])));
    setModalAgregarInsumosVisible(true);
  };

  const cerrarModalAgregarInsumos = () => {
    setModalAgregarInsumosVisible(false);
  };

  const toggleInsumoSeleccionadoEnModal = (insumo) => {
    setInsumosSeleccionadosParaReceta((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(insumo.id)) {
        newMap.delete(insumo.id);
      } else {
        newMap.set(insumo.id, {
          insumo_obj: insumo,
          cantidad: "", // Cantidad inicial vacía
          unidad_id: "", // Unidad inicial vacía
        });
      }
      return newMap;
    });
  };

  const handleCantidadInsumoChange = (insumoId, cantidad) => {
    setInsumosSeleccionadosParaReceta((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(insumoId)) {
        newMap.get(insumoId).cantidad = cantidad;
      }
      return newMap;
    });
  };

  const handleUnidadInsumoChange = (insumoId, unidad_id) => {
    setInsumosSeleccionadosParaReceta((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(insumoId)) {
        newMap.get(insumoId).unidad_id = unidad_id;
      }
      return newMap;
    });
  };

  const confirmarInsumosParaReceta = () => {
    const insumosValidos = Array.from(
      insumosSeleccionadosParaReceta.values()
    ).every((item) => {
      return (
        item.cantidad !== "" &&
        parseFloat(item.cantidad) > 0 &&
        item.unidad_id !== ""
      );
    });

    if (!insumosValidos) {
      showNotification(
        "Todos los insumos seleccionados deben tener cantidad y unidad válidas.",
        "error"
      );
      return;
    }
    cerrarModalAgregarInsumos();
  };

  // Cambiar estado producto
  const toggleEstado = (producto) => {
    const nuevosProductos = productos.map((p) =>
      p.id === producto.id ? { ...p, estado: !p.estado } : p
    );
    setProductos(nuevosProductos);
    showNotification(
      `Producto ${producto.estado ? "desactivado" : "activado"} correctamente.`
    );
  };

  // Validación formulario producto
  const validarFormulario = () => {
    if (!nombreEditado.trim()) {
      showNotification("El nombre es obligatorio", "error");
      return false;
    }
    if (!precioEditado || parseFloat(precioEditado) <= 0) {
      showNotification("El precio debe ser mayor a 0", "error");
      return false;
    }
    if (!categoriaEditada) {
      showNotification("Debe seleccionar una categoría", "error");
      return false;
    }
    // Validaciones de cantidad solo si estamos editando/visualizando
    if (modalTipo === "editar" || modalTipo === "visualizar") {
      if (
        cantidadSanPablo === "" ||
        isNaN(parseInt(cantidadSanPablo)) ||
        parseInt(cantidadSanPablo) < 0
      ) {
        showNotification(
          "La cantidad en San Pablo debe ser un número válido y no negativo",
          "error"
        );
        return false;
      }
      if (
        cantidadSanBenito === "" ||
        isNaN(parseInt(cantidadSanBenito)) ||
        parseInt(cantidadSanBenito) < 0
      ) {
        showNotification(
          "La cantidad en San Benito debe ser un número válido y no negativo",
          "error"
        );
        return false;
      }
    }
    return true;
  };

  // Guardar producto nuevo
  const guardarNuevoProducto = () => {
    if (!validarFormulario()) return;
    const nuevoId = productos.length
      ? Math.max(...productos.map((p) => p.id)) + 1
      : 1;
    const catObj = categorias.find((c) => c.id.toString() === categoriaEditada);
    const nuevoProd = {
      id: nuevoId,
      nombre: nombreEditado,
      precio: parseFloat(precioEditado),
      idCategoriaProducto: parseInt(categoriaEditada),
      categoria: catObj.nombre,
      estado: true,
      // Las cantidades iniciales para un producto nuevo pueden ser 0 o no estar definidas hasta la primera edición
      cantidadSanPablo: 0,
      cantidadSanBenito: 0,
      recetas: recetasSeleccionadas,
    };
    setProductos([...productos, nuevoProd]);
    cerrarModal();
    showNotification("Producto agregado con éxito");
  };

  // Guardar edición producto
  const guardarEdicion = () => {
    if (!validarFormulario()) return;
    const catObj = categorias.find((c) => c.id.toString() === categoriaEditada);
    const prodEditados = productos.map((p) =>
      p.id === productoSeleccionado.id
        ? {
            ...p,
            nombre: nombreEditado,
            precio: parseFloat(precioEditado),
            idCategoriaProducto: parseInt(categoriaEditada),
            categoria: catObj.nombre,
            cantidadSanPablo: parseInt(cantidadSanPablo),
            cantidadSanBenito: parseInt(cantidadSanBenito),
            recetas: recetasSeleccionadas,
            estado: productoSeleccionado.estado,
          }
        : p
    );
    setProductos(prodEditados);
    cerrarModal();
    showNotification("Producto editado con éxito");
  };

  // Eliminar producto
  const eliminarProducto = () => {
    const prodFiltrados = productos.filter(
      (p) => p.id !== productoSeleccionado.id
    );
    setProductos(prodFiltrados);
    cerrarModal();
    showNotification("Producto eliminado");
  };

  // Eliminar receta asociada al producto
  const eliminarRecetaDeProducto = (recetaId) => {
    setRecetasSeleccionadas(
      recetasSeleccionadas.filter((r) => r.Idreceta !== recetaId)
    );
    showNotification("Receta eliminada del producto");
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      p.categoria.toLowerCase().includes(filtro.toLowerCase())
  );

  // Insumos filtrados para el modal de agregar insumos
  const insumosFiltrados = insumosDisponibles.filter((insumo) =>
    insumo.nombre.toLowerCase().includes(filtroInsumos.toLowerCase())
  );

  // Formato precio
  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);

  return (
    <div className="admin-wrapper">
      <Notification
        visible={notification.visible}
        mensaje={notification.mensaje}
        tipo={notification.tipo}
        onClose={hideNotification}
      />

      <div className="admin-toolbar">
        <button
          className="admin-button pink"
          onClick={() => abrirModal("agregar")}
        >
          {" "}
          + Agregar{" "}
        </button>
        <SearchBar
          placeholder="Buscar productos..."
          value={filtro}
          onChange={setFiltro}
        />
      </div>

      <h2 className="admin-section-title">Gestión de productos</h2>

      <DataTable
        value={productosFiltrados}
        paginator
        rows={5}
        className="admin-table"
      >
        <Column
          header="N°"
          body={(_, { rowIndex }) => rowIndex + 1}
          headerStyle={{ textAlign: "right", paddingLeft: "15px" }}
          bodyStyle={{ textAlign: "center", paddingLeft: "10px" }}
          style={{ width: "0.5rem" }}
        />
        <Column
          field="nombre"
          header="Nombre"
          headerStyle={{ textAlign: "right", paddingLeft: "105px" }}
          bodyStyle={{ textAlign: "center", paddingLeft: "20px" }}
          style={{ width: "250px" }}
        />
        <Column
          field="precio"
          header="Precio"
          body={(row) => formatearPrecio(row.precio)}
          headerStyle={{ textAlign: "right", paddingLeft: "105px" }}
          bodyStyle={{ textAlign: "center", paddingLeft: "20px" }}
          style={{ width: "250px" }}
        />
        <Column
          field="categoria"
          header="Categoría"
          headerStyle={{ textAlign: "right", paddingLeft: "105px" }}
          bodyStyle={{ textAlign: "center", paddingLeft: "20px" }}
          style={{ width: "250px" }}
        />
        {/* Cantidades por sede SOLO en el editar/visualizar, no en la tabla principal */}
        <Column
          field="estado"
          header="Estado"
          body={(rowData) => (
            <InputSwitch
              checked={rowData.estado}
              onChange={() => toggleEstado(rowData)}
            />
          )}
          headerStyle={{ textAlign: "right", paddingLeft: "105px" }}
          bodyStyle={{ textAlign: "center", paddingLeft: "20px" }}
          style={{ width: "150px" }}
        />
        <Column
          header="Acciones"
          body={(rowData) => (
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                className="admin-button gray"
                onClick={() => abrirModal("visualizar", rowData)}
              >
                🔍
              </button>
              <button
                className="admin-button yellow"
                onClick={() => abrirModal("editar", rowData)}
              >
                ✏️
              </button>
              <button
                className="admin-button red"
                onClick={() => abrirModal("eliminar", rowData)}
              >
                🗑️
              </button>
            </div>
          )}
          headerStyle={{ textAlign: "right", paddingLeft: "105px" }}
          bodyStyle={{ textAlign: "center", paddingLeft: "20px" }}
          style={{ width: "250px" }}
        />
      </DataTable>

      {/* Modal Principal de Producto (Agregar/Editar/Visualizar/Eliminar) */}
      <Modal visible={modalVisible} onClose={cerrarModal}>
        <h2 className="modal-title">
          {modalTipo === "agregar"
            ? "Agregar Nuevo Producto"
            : modalTipo === "editar"
            ? "Editar Producto"
            : modalTipo === "visualizar"
            ? "Detalles del Producto"
            : "Confirmar Eliminación"}
        </h2>

        {modalTipo === "eliminar" ? (
          <div className="modal-body">
            <p>
              ¿Está seguro que desea eliminar el producto{" "}
              <strong>{productoSeleccionado?.nombre}</strong>?
            </p>
            <p style={{ color: "#e53935", fontSize: "14px" }}>
              Esta acción no se puede deshacer.
            </p>
          </div>
        ) : (
          <div className="modal-body">
            <div className="modal-form-grid">
              <div className="modal-input-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={nombreEditado}
                  onChange={(e) => setNombreEditado(e.target.value)}
                  readOnly={modalTipo === "visualizar"}
                  className="modal-input"
                />
              </div>
              <div className="modal-input-group">
                <label>Precio:</label>
                <input
                  type="number"
                  value={precioEditado}
                  onChange={(e) => setPrecioEditado(e.target.value)}
                  readOnly={modalTipo === "visualizar"}
                  className="modal-input"
                />
              </div>
              <div className="modal-input-group">
                <label>Categoría:</label>
                <select
                  value={categoriaEditada}
                  onChange={(e) => setCategoriaEditada(e.target.value)}
                  disabled={modalTipo === "visualizar"}
                  className="modal-input"
                >
                  <option value="">Seleccionar Categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campos de cantidad por sede SOLO en modo editar o visualizar */}
              {(modalTipo === "editar" || modalTipo === "visualizar") && (
                <>
                  <div className="modal-input-group">
                    <label>Cantidad en San Pablo:</label>
                    <input
                      type="number"
                      value={cantidadSanPablo}
                      onChange={(e) => setCantidadSanPablo(e.target.value)}
                      readOnly={modalTipo === "visualizar"}
                      className="modal-input"
                    />
                  </div>
                  <div className="modal-input-group">
                    <label>Cantidad en San Benito:</label>
                    <input
                      type="number"
                      value={cantidadSanBenito}
                      onChange={(e) => setCantidadSanBenito(e.target.value)}
                      readOnly={modalTipo === "visualizar"}
                      className="modal-input"
                    />
                  </div>
                </>
              )}
            </div>

            <h4 style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              Recetas del Producto:
            </h4>
            {recetasSeleccionadas.length === 0 && (
              <p>No hay recetas asociadas a este producto.</p>
            )}
            <ul style={{ listStyle: "none", padding: 0 }}>
              {recetasSeleccionadas.map((r) => (
                <li
                  key={r.Idreceta}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "8px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      <strong>{r.NombreReceta}</strong>: {r.Especificaciones}
                    </span>
                    {modalTipo !== "visualizar" && (
                      <button
                        className="admin-button danger small"
                        onClick={() => eliminarRecetaDeProducto(r.Idreceta)}
                        style={{ marginLeft: "10px", padding: "5px 10px" }}
                      >
                        X
                      </button>
                    )}
                  </div>
                  {r.insumos && r.insumos.length > 0 && (
                    <span
                      style={{
                        fontSize: "0.85em",
                        color: "#666",
                        marginTop: "5px",
                      }}
                    >
                      Insumos:{" "}
                      {r.insumos
                        .map((i) => `${i.nombre} (${i.Cantidad} ${i.unidad})`)
                        .join(", ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {modalTipo !== "visualizar" && (
              <div
                className="modal-input-button"
                style={{
                  marginTop: "1rem",
                  padding: "10px",
                  background: "#e0f7fa",
                  borderRadius: "5px",
                  cursor: "pointer",
                  textAlign: "center",
                }}
                onClick={abrirModalCrearReceta}
              >
                ➕ Crear y Añadir Nueva Receta
              </div>
            )}
          </div>
        )}

        <div className="modal-footer">
          <button className="modal-btn cancel-btn" onClick={cerrarModal}>
            {" "}
            Cancelar{" "}
          </button>
          {modalTipo === "agregar" && (
            <button
              className="modal-btn save-btn"
              onClick={guardarNuevoProducto}
            >
              {" "}
              Guardar{" "}
            </button>
          )}
          {modalTipo === "editar" && (
            <button className="modal-btn save-btn" onClick={guardarEdicion}>
              {" "}
              Guardar Cambios{" "}
            </button>
          )}
          {modalTipo === "eliminar" && (
            <button className="modal-btn danger-btn" onClick={eliminarProducto}>
              {" "}
              Confirmar Eliminación{" "}
            </button>
          )}
        </div>
      </Modal>

      {/* Modal para Crear Nueva Receta para el Producto (PRIMERA IMAGEN) */}
      <Modal visible={modalCrearRecetaVisible} onClose={cerrarModalCrearReceta}>
        <h2 className="modal-title">Crear Nueva Receta para el Producto</h2>
        <div
          className="modal-body"
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <div style={{ display: "flex", gap: "15px", width: "100%" }}>
            <div className="modal-input-group" style={{ flex: 1 }}>
              <label>Nombre de la Receta:</label>
              <input
                type="text"
                value={nuevaRecetaNombre}
                onChange={(e) => setNuevaRecetaNombre(e.target.value)}
                className="modal-input"
                placeholder="Ej. Receta Base Cupcake"
              />
            </div>
            <div className="modal-input-group" style={{ flex: 1 }}>
              <label>Especificaciones:</label>
              <textarea
                value={nuevaRecetaEspecificaciones}
                onChange={(e) => setNuevaRecetaEspecificaciones(e.target.value)}
                className="modal-input"
                rows="3"
                placeholder="Ej. Mezclar ingredientes secos, luego añadir húmedos..."
              ></textarea>
            </div>
          </div>

          {/* Sección de Insumos */}
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>
              Insumos de la Receta:
            </h4>
            {Array.from(insumosSeleccionadosParaReceta.values()).length ===
            0 ? (
              <p style={{ color: "#777", textAlign: "center" }}>
                No hay insumos añadidos. Haz clic en "Agregar Insumos" para
                empezar.
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {Array.from(insumosSeleccionadosParaReceta.values()).map(
                  (item) => (
                    <li
                      key={item.insumo_obj.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "5px 0",
                        borderBottom: "1px dashed #eee",
                      }}
                    >
                      <span>
                        <strong>{item.insumo_obj.nombre}</strong> -{" "}
                        {item.cantidad}{" "}
                        {
                          unidadesMedida.find((u) => u.value === item.unidad_id)
                            ?.text
                        }
                      </span>
                      <button
                        className="admin-button danger small"
                        onClick={() =>
                          toggleInsumoSeleccionadoEnModal(item.insumo_obj)
                        } // Deseleccionar para eliminar
                        style={{ marginLeft: "10px", padding: "3px 8px" }}
                      >
                        Quitar
                      </button>
                    </li>
                  )
                )}
              </ul>
            )}
            <button
              className="admin-button secondary"
              onClick={abrirModalAgregarInsumos}
              style={{ marginTop: "15px", width: "100%" }}
            >
              <span style={{ marginRight: "5px" }}>➕</span>Agregar Insumos
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="modal-btn cancel-btn"
            onClick={cerrarModalCrearReceta}
          >
            {" "}
            Cancelar{" "}
          </button>
          <button
            className="modal-btn save-btn"
            onClick={guardarNuevaRecetaEnProducto}
          >
            {" "}
            Crear y Añadir{" "}
          </button>
        </div>
      </Modal>

      {/* Modal de Selección y Cantidad de Insumos (SEGUNDA IMAGEN) */}
      <Modal
        visible={modalAgregarInsumosVisible}
        onClose={cerrarModalAgregarInsumos}
      >
        <h2 className="modal-title">Agregar Insumos a la Receta</h2>
        <div
          className="modal-body"
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <SearchBar
            placeholder="Buscar insumos..."
            value={filtroInsumos}
            onChange={setFiltroInsumos}
          />

          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "10px",
            }}
          >
            {insumosFiltrados.length === 0 ? (
              <p style={{ textAlign: "center", color: "#777" }}>
                No se encontraron insumos.
              </p>
            ) : (
              insumosFiltrados.map((insumo) => (
                <div
                  key={insumo.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "10px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      marginBottom: "5px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={insumosSeleccionadosParaReceta.has(insumo.id)}
                      onChange={() => toggleInsumoSeleccionadoEnModal(insumo)}
                      style={{ marginRight: "10px" }}
                    />
                    <strong>{insumo.nombre}</strong> ({insumo.categoria})
                  </label>
                  {insumosSeleccionadosParaReceta.has(insumo.id) && (
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginLeft: "30px",
                        marginTop: "5px",
                        width: "calc(100% - 30px)",
                      }}
                    >
                      <input
                        type="number"
                        placeholder="Cantidad"
                        value={
                          insumosSeleccionadosParaReceta.get(insumo.id)
                            ?.cantidad || ""
                        }
                        onChange={(e) =>
                          handleCantidadInsumoChange(insumo.id, e.target.value)
                        }
                        className="modal-input"
                        style={{
                          flex: 1,
                          minWidth: "80px",
                          padding: "5px",
                          height: "30px",
                        }}
                      />
                      <Dropdown
                        value={
                          insumosSeleccionadosParaReceta.get(insumo.id)
                            ?.unidad_id || ""
                        }
                        options={unidadesMedida}
                        onChange={(e) =>
                          handleUnidadInsumoChange(insumo.id, e.value)
                        }
                        placeholder="Unidad"
                        optionLabel="label"
                        optionValue="value"
                        className="p-inputtext p-component p-dropdown" // Clases de PrimeReact para estilo
                        style={{
                          flex: 1,
                          minWidth: "100px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        <div
          className="modal-footer"
          style={{ justifyContent: "flex-end", paddingTop: "15px" }}
        >
          <button
            className="modal-btn cancel-btn"
            onClick={cerrarModalAgregarInsumos}
          >
            {" "}
            Cancelar{" "}
          </button>
          <button
            className="modal-btn save-btn"
            onClick={confirmarInsumosParaReceta}
            disabled={insumosSeleccionadosParaReceta.size === 0}
            style={{
              opacity: insumosSeleccionadosParaReceta.size === 0 ? 0.6 : 1,
            }}
          >
            Agregar ({insumosSeleccionadosParaReceta.size})
          </button>
        </div>
      </Modal>
    </div>
  );
}
