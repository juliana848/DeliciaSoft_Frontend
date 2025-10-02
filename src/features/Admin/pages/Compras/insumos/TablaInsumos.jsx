import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";

import "../../../adminStyles.css";
import SearchBar from "../../../components/SearchBar";
import Notification from "../../../components/Notification";
import ModalGenerico from "./modalgenerico";
import ModalInsumo from "./modalesInsumo";
import AgregarCategoria from "./agregarCategoria";
import ModalCatalogo from "./modalCatalogo";
import SelectorCatalogo from "./modalSelector";
import IndicadorStock from "./insicadorStock";
import IndicadorStockMin from "./indicadorStockMin";

import insumoApiService from "../../../services/insumos";
import categoriaInsumoApiService from "../../../services/categoriainsumos";

export default function TablaInsumos() {
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [notification, setNotification] = useState({
    visible: false,
    mensaje: "",
    tipo: "success",
  });

  // Estados para modales
  const [modal, setModal] = useState({ visible: false, tipo: "", insumo: null });
  const [modalAgregarCategoria, setModalAgregarCategoria] = useState(false);
  const [modalCatalogo, setModalCatalogo] = useState(false);
  const [modalSelector, setModalSelector] = useState(false);
  const [showStockInfo, setShowStockInfo] = useState(false);
  
  // Estado para el insumo seleccionado para catálogo
  const [insumoParaCatalogo, setInsumoParaCatalogo] = useState(null);
  const [tipoCatalogo, setTipoCatalogo] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const categoriasAPI = await categoriaInsumoApiService.obtenerCategorias();
      setCategorias(categoriasAPI.filter((c) => c.estado));

      const unidadesAPI = await insumoApiService.obtenerUnidadesMedida();
      setUnidades(unidadesAPI);

      const insumosAPI = await insumoApiService.obtenerInsumos();
      setInsumos(insumosAPI);
    } catch (error) {
      showNotification("Error cargando datos: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (mensaje, tipo = "success") => {
    setNotification({ visible: true, mensaje, tipo });
  };

  const hideNotification = () => setNotification({ visible: false });

 // Función para cambiar estado con validación de stock
const toggleEstado = async (id) => {
  try {
    const insumo = insumos.find((i) => (i.id || i.idinsumo) === id);
    if (!insumo) {
      console.error('Insumo no encontrado:', id);
      showNotification("Insumo no encontrado", "error");
      return;
    }

    const nuevoEstado = !insumo.estado;
    
    // Validar que no se pueda deshabilitar si hay stock disponible
    if (!nuevoEstado && parseFloat(insumo.cantidad) > 0) {
      showNotification(
        `No se puede deshabilitar este insumo porque tiene ${insumo.cantidad} unidades en stock. Para deshabilitarlo, primero debe reducir el stock a 0.`,
        "error"
      );
      return;
    }
    
    console.log(`Cambiando estado de insumo ${id} a:`, nuevoEstado);
    
    await insumoApiService.cambiarEstadoInsumo(id, nuevoEstado);

    // Actualizar el estado local
    setInsumos(
      insumos.map((i) => {
        const currentId = i.id || i.idinsumo;
        return currentId === id ? { ...i, estado: nuevoEstado } : i;
      })
    );
    
    showNotification(`Insumo ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    showNotification("Error cambiando estado: " + error.message, "error");
  }
};
  const abrirModal = (tipo, insumo = null) => {
    setModal({ visible: true, tipo, insumo });
  };

  const cerrarModal = () => {
    setModal({ visible: false, tipo: "", insumo: null });
  };

  const toggleStockInfo = () => {
    setShowStockInfo((prev) => !prev);
  };

  // Función para abrir selector de catálogo
  const abrirModalSelectorCatalogo = (insumo) => {
    console.log('Abriendo selector de catálogo para:', insumo);
    setInsumoParaCatalogo(insumo);
    setModalSelector(true);
  };

  const cerrarModalSelector = () => {
    setModalSelector(false);
    setInsumoParaCatalogo(null);
  };

  const seleccionarTipoCatalogo = (tipo) => {
    setTipoCatalogo(tipo);
    setModalSelector(false);
    setModalCatalogo(true);
  };

  const cerrarModalCatalogo = () => {
    setModalCatalogo(false);
    setTipoCatalogo('');
    setInsumoParaCatalogo(null);
  };

  // Función para determinar si es categoría especial (corregida)
  const esCategoriaEspecial = (categoriaId, categoriaNombre) => {
    // Primero intentar por nombre si está disponible
    if (categoriaNombre) {
      const especiales = ['toppings', 'adiciones', 'sabores', 'rellenos', 'relleno', 'sabor', 'adicion'];
      return especiales.some(especial => 
        categoriaNombre.toLowerCase().includes(especial)
      );
    }
    
    // Si no hay nombre, buscar por ID en la lista de categorías
    if (categoriaId && categorias.length > 0) {
      const categoria = categorias.find(cat => cat.id === parseInt(categoriaId));
      if (categoria) {
        const especiales = ['toppings', 'adiciones', 'sabores', 'rellenos', 'relleno', 'sabor', 'adicion'];
        return especiales.some(especial => 
          categoria.nombreCategoria?.toLowerCase().includes(especial)
        );
      }
    }
    
    return false;
  };

  const insumosFiltrados = insumos.filter((i) => {
    const texto = filtro.toLowerCase();
    return (
      i.nombreInsumo?.toLowerCase().includes(texto) ||
      i.nombreCategoria?.toLowerCase().includes(texto) ||
      i.categoriainsumos?.nombrecategoria?.toLowerCase().includes(texto) ||
      String(i.cantidad).includes(texto) ||
      (i.estado ? "activo" : "inactivo").includes(texto)
    );
  });

  // Función helper para obtener el ID del insumo
  const getInsumoId = (rowData) => {
    return rowData.id || rowData.idinsumo;
  };

  if (loading) return <div>Cargando insumos...</div>;

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
          + Agregar
        </button>
        <SearchBar
          value={filtro}
          onChange={setFiltro}
          placeholder="Buscar por nombre, categoría, cantidad, estado..."
        />
      </div>

      <div
        style={{
          margin: "10px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "14px", color: "#666" }}>
          📊 {insumos.length} insumos | 📂 {categorias.length} categorías | 📏{" "}
          {unidades.length} unidades
        </div>
        <button
          className="admin-button info-button"
          onClick={toggleStockInfo}
          style={{
            padding: "5px 10px",
            fontSize: "14px",
            backgroundColor: "#e3f2fd",
            color: "#1565c0",
            border: "1px solid #bbdefb",
          }}
        >
          📚
        </button>
      </div>

      {showStockInfo && (
        <div
          className="stock-info-message"
          style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "15px",
            border: "1px solid #dee2e6",
          }}
        >
          <h4 style={{ marginTop: 0 }}>📊 Niveles de Stock:</h4>
          <ul style={{ marginBottom: 0 }}>
            <li>
              <strong>Crítico:</strong> Menos del 20% del stock mínimo
            </li>
            <li>
              <strong>Bajo:</strong> Entre 20% y 50% del stock mínimo
            </li>
            <li>
              <strong>Normal:</strong> Más del 50% del stock mínimo
            </li>
          </ul>
        </div>
      )}

      <h2 className="admin-section-title">Gestión de Insumos</h2>
      <DataTable
        value={insumosFiltrados}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 20]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} insumos"
        className="admin-table"
      >
        <Column
          header="N°"
          body={(rowData, { rowIndex }) => rowIndex + 1}
          style={{ width: "3rem", textAlign: "center" }}
        />
        <Column field="nombreInsumo" header="Nombre" />
        <Column
          header="Categoría"
          body={(rowData) =>
            rowData.nombreCategoria ||
            rowData.categoriainsumos?.nombrecategoria ||
            "Sin categoría"
          }
        />
        <Column
          header="Unidad"
          body={(rowData) =>
            rowData.nombreUnidadMedida ||
            rowData.unidadmedida?.unidadmedida ||
            "Sin unidad"
          }
        />
        <Column
          header="Stock Actual"
          body={(insumo) => <IndicadorStock insumo={insumo} />}
        />
        <Column
          header="Stock Mínimo"
          body={(insumo) => <IndicadorStockMin insumo={insumo} />}
        />
        <Column
          header="Estado"
          body={(i) => (
            <InputSwitch
              checked={i.estado}
              onChange={() => toggleEstado(getInsumoId(i))}
            />
          )}
        />
        <Column
          header="Acción"
          body={(rowData) => (
            <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
              <button
                className="admin-button gray"
                title="Visualizar"
                onClick={() => abrirModal("ver", rowData)}
              >
                👁
              </button>
              <button
                className={`admin-button yellow ${
                  !rowData.estado ? "disabled" : ""
                }`}
                title="Editar"
                onClick={() => rowData.estado && abrirModal("editar", rowData)}
                disabled={!rowData.estado}
                style={{
                  opacity: !rowData.estado ? 0.5 : 1,
                  cursor: !rowData.estado ? "not-allowed" : "pointer",
                }}
              >
                ✏️
              </button>
              <button
                className={`admin-button red ${
                  !rowData.estado ? "disabled" : ""
                }`}
                title="Eliminar"
                onClick={() =>
                  rowData.estado && abrirModal("eliminar", rowData)
                }
                disabled={!rowData.estado}
                style={{
                  opacity: !rowData.estado ? 0.5 : 1,
                  cursor: !rowData.estado ? "not-allowed" : "pointer",
                }}
              >
                🗑️
              </button>

              {/* Botón Catálogo corregido */}
              {rowData.estado &&
                esCategoriaEspecial(
                  rowData.idCategoriaInsumos || rowData.idcategoriainsumos,
                  rowData.nombreCategoria || rowData.categoriainsumos?.nombrecategoria
                ) && (
                  <button
                    className="catalog-button"
                    title="Agregar Catálogo"
                    onClick={() => abrirModalSelectorCatalogo(rowData)}
                    // style={{
                    //   backgroundColor: "#6c5ce7",
                    //   color: "white",
                    //   border: "none",
                    //   borderRadius: "6px",
                    //   padding: "8px 12px",
                    //   fontSize: "12px",
                    //   fontWeight: "500",
                    //   cursor: "pointer",
                    //   display: "flex",
                    //   alignItems: "center",
                    //   gap: "4px",
                    //   transition: "all 0.2s ease",
                    //   boxShadow: "0 2px 4px rgba(108, 92, 231, 0.3)",
                    //   minHeight: "32px",
                    // }}
                    // onMouseEnter={(e) => {
                    //   e.target.style.backgroundColor = "#5f3dc4";
                    //   e.target.style.transform = "translateY(-1px)";
                    //   e.target.style.boxShadow = "0 4px 8px rgba(108, 92, 231, 0.4)";
                    // }}
                    // onMouseLeave={(e) => {
                    //   e.target.style.backgroundColor = "#6c5ce7";
                    //   e.target.style.transform = "translateY(0)";
                    //   e.target.style.boxShadow = "0 2px 4px rgba(108, 92, 231, 0.3)";
                    // }}
                  >
                    <button
                    className={`admin-button purple ${
                      !rowData.estado ? "disabled" : ""
                    }`}
                    title="Copiar"
                    onClick={() => rowData.estado && copiar(rowData)} // 👈 tu función aquí
                    disabled={!rowData.estado}
                    style={{
                      backgroundColor: "#6c5ce7",
                      opacity: !rowData.estado ? 0.5 : 1,
                      cursor: !rowData.estado ? "not-allowed" : "pointer",
                      
                    }}
                  >
                    📋
                  </button>

                    {/* <span>Catálogo</span> */}
                  </button>
                )}
            </div>
          )}
        />
      </DataTable>

      {/* MODALES CORREGIDOS */}
      {modal.visible && (
        <ModalInsumo
          modal={modal}
          cerrar={cerrarModal}
          categorias={categorias}
          unidades={unidades}
          cargarInsumos={cargarDatos}
          showNotification={showNotification}
          abriragregarCategoria={() => setModalAgregarCategoria(true)}
        />
      )}

      {modalAgregarCategoria && (
        <AgregarCategoria
          cerrar={() => setModalAgregarCategoria(false)}
          showNotification={showNotification}
          cargarCategorias={cargarDatos}
        />
      )}

      {/* Props corregidas para SelectorCatalogo */}
      {modalSelector && (
        <SelectorCatalogo
          modalSelectorVisible={modalSelector}
          cerrarModalSelector={cerrarModalSelector}
          insumoParaCatalogo={insumoParaCatalogo}
          seleccionarTipoCatalogo={seleccionarTipoCatalogo}
        />
      )}

      {modalCatalogo && (
        <ModalCatalogo
          visible={modalCatalogo}
          cerrar={cerrarModalCatalogo}
          tipoCatalogo={tipoCatalogo}
          insumoParaCatalogo={insumoParaCatalogo}
          showNotification={showNotification}
        />
      )}

      <ModalGenerico />
    </div>
  );
}