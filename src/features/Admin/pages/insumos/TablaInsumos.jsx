import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import "../../adminStyles.css";
import SearchBar from "../../components/SearchBar";
import Notification from "../../components/Notification";
import Tooltip from '../../components/Tooltip';
import ModalGenerico from "./modalgenerico";
import ModalInsumo from "./modalesInsumo";
import AgregarCategoria from "./agregarCategoria";
import IndicadorStock from "./insicadorStock";
import IndicadorStockMin from "./indicadorStockMin";
import insumoApiService from "../../services/insumos";
import categoriaInsumoApiService from "../../services/categoriainsumos";
import LoadingSpinner from '../../components/LoadingSpinner';

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
          value={filtro}
          onChange={setFiltro}
          placeholder="Buscar por nombre, categoría, cantidad, estado..."
        />
        <button
          className="admin-button pink"
          onClick={() => abrirModal("agregar")}
          type="button"
        >
          <i className="fas fa-plus"></i> Agregar
        </button>
      </div>

      <div style={{ margin: "10px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "14px", color: "#666" }}>
          📊 {insumos.length} insumos | 📁 {categorias.length} categorías | 📏 {unidades.length} unidades
        </div>
        <button
          className="admin-button"
          onClick={toggleStockInfo}
          style={{
            padding: "5px 10px",
            fontSize: "14px",
            backgroundColor: "#e3f2fd",
            color: "#1565c0",
            border: "1px solid #bbdefb",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          📚 Info
        </button>
      </div>

      {showStockInfo && (
        <div style={{
          backgroundColor: "#f8f9fa",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "15px",
          border: "1px solid #dee2e6",
        }}>
          <h4 style={{ marginTop: 0 }}>📊 Niveles de Stock:</h4>
          <ul style={{ marginBottom: 0 }}>
            <li><strong>Crítico:</strong> Menos del 20% del stock mínimo</li>
            <li><strong>Bajo:</strong> Entre 20% y 50% del stock mínimo</li>
            <li><strong>Normal:</strong> Más del 50% del stock mínimo</li>
          </ul>
        </div>
      )}

      <h2 className="admin-section-title">Gestión de Insumos</h2>

      <DataTable
        value={insumosFiltrados}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        className="admin-table compact-paginator"
        tableStyle={{ minWidth: '50rem' }}
        emptyMessage="No se encontraron insumos"
      >
        <Column
          header="N°"
          body={(rowData, { rowIndex }) => rowIndex + 1}
          style={{ width: "50px" }}
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
          style={{ width: "80px" }}
        />
        <Column
          header="Acciones"
          body={(rowData) => (
            <div style={{ display: "flex", justifyContent: "center", gap: "3px" }}>
              <Tooltip text="Visualizar">
                <button
                  className="admin-button"
                  onClick={() => abrirModal("ver", rowData)}
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

              <Tooltip text={rowData.estado ? "Editar" : "Insumo inactivo"}>
                <button
                  className="admin-button"
                  onClick={() => rowData.estado && abrirModal("editar", rowData)}
                  disabled={!rowData.estado}
                  style={{
                    background: rowData.estado ? '#fff8e1' : '#f5f5f5',
                    color: rowData.estado ? '#f57c00' : '#bbb',
                    border: 'none',
                    borderRadius: '6px',
                    width: '26px',
                    height: '26px',
                    cursor: rowData.estado ? 'pointer' : 'not-allowed',
                    opacity: rowData.estado ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="fas fa-pen" style={{ fontSize: '11px' }}></i>
                </button>
              </Tooltip>

              <Tooltip text={rowData.estado ? "Eliminar" : "Insumo inactivo"}>
                <button
                  className="admin-button"
                  onClick={() => rowData.estado && abrirModal("eliminar", rowData)}
                  disabled={!rowData.estado}
                  style={{
                    background: rowData.estado ? '#ffebee' : '#f5f5f5',
                    color: rowData.estado ? '#d32f2f' : '#bbb',
                    border: 'none',
                    borderRadius: '6px',
                    width: '26px',
                    height: '26px',
                    cursor: rowData.estado ? 'pointer' : 'not-allowed',
                    opacity: rowData.estado ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="fas fa-trash" style={{ fontSize: '11px' }}></i>
                </button>
              </Tooltip>
            </div>
          )}
          style={{ width: "100px" }}
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