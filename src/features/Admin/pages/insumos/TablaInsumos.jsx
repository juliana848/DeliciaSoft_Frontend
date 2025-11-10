import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import "../../adminStyles.css";
import SearchBar from "../../components/SearchBar";
import Notification from "../../components/Notification";
import ModalGenerico from "./modalgenerico";
import ModalInsumo from "./modalesInsumo";
import AgregarCategoria from "./agregarCategoria";
import IndicadorStock from "./insicadorStock";
import IndicadorStockMin from "./indicadorStockMin";
// import NotificationBell from "../../../components/NotificationBell"; // DESHABILITADO
import insumoApiService from "../../services/insumos";
import categoriaInsumoApiService from "../../services/categoriainsumos";
import LoadingSpinner from '../../components/LoadingSpinner';
import '../comprasCrud/styles/ComprasTable.css'
import Tooltip from '../../components/Tooltip';

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

  const [modal, setModal] = useState({ visible: false, tipo: "", insumo: null });
  const [modalAgregarCategoria, setModalAgregarCategoria] = useState(false);
  const [showStockInfo, setShowStockInfo] = useState(false);

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

  const toggleEstado = async (id) => {
    try {
      const insumo = insumos.find((i) => (i.id || i.idinsumo) === id);
      if (!insumo) {
        console.error('Insumo no encontrado:', id);
        showNotification("Insumo no encontrado", "error");
        return;
      }

      const nuevoEstado = !insumo.estado;
      
      if (!nuevoEstado && parseFloat(insumo.cantidad) > 0) {
        showNotification(
          `No se puede deshabilitar este insumo porque tiene ${insumo.cantidad} unidades en stock. Para deshabilitarlo, primero debe reducir el stock a 0.`,
          "error"
        );
        return;
      }
      
      console.log(`Cambiando estado de insumo ${id} a:`, nuevoEstado);
      
      await insumoApiService.cambiarEstadoInsumo(id, nuevoEstado);

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

  const getInsumoId = (rowData) => {
    return rowData.id || rowData.idinsumo;
  };

  if (loading) {
    return (
      <div>
        <LoadingSpinner />
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', justifyContent: 'space-between' }}>
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
          📊 {insumos.length} insumos | 📁 {categorias.length} categorías | 📏 {unidades.length} unidades
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
          className="admin-table compact-paginator"
        >
        <Column
          header="Nº"
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
      <Tooltip text="Visualizar">
        <button
          className="admin-button gray"
          onClick={() => abrirModal("ver", rowData)}
        >
          👁
        </button>
      </Tooltip>

      <Tooltip text={!rowData.estado ? "Editar (Deshabilitado)" : "Editar"}>
        <button
          className={`admin-button yellow ${
            !rowData.estado ? "disabled" : ""
          }`}
          onClick={() => rowData.estado && abrirModal("editar", rowData)}
          disabled={!rowData.estado}
          style={{
            opacity: !rowData.estado ? 0.5 : 1,
            cursor: !rowData.estado ? "not-allowed" : "pointer",
          }}
        >
          ✏️
        </button>
      </Tooltip>

      <Tooltip text={!rowData.estado ? "Eliminar (Deshabilitado)" : "Eliminar"}>
        <button
          className={`admin-button red ${
            !rowData.estado ? "disabled" : ""
          }`}
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
      </Tooltip>
    </div>
  )}
/>
      </DataTable>

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

      <ModalGenerico />
    </div>
  );
}