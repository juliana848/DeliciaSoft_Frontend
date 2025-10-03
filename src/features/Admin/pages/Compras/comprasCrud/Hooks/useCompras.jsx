import { useState } from 'react';
import compraApiService from '../../../../services/compras_services';

export const useCompras = () => {
    const [compras, setCompras] = useState([]);

    const cargarCompras = async () => {
        try {
            console.log('=== CARGANDO COMPRAS ===');
            const comprasAPI = await compraApiService.obtenerCompras();
            console.log('Compras obtenidas de la API:', comprasAPI);
            
            setCompras(comprasAPI);
        } catch (error) {
            console.error('Error al cargar compras:', error);
            throw new Error('Error al cargar las compras: ' + error.message);
        }
    };

    function transformarInsumoDesdeAPI(apiInsumo) {
        return {
            idinsumo: apiInsumo.idinsumo,
            nombreinsumo: apiInsumo.nombreinsumo,
            idcategoriainsumos: apiInsumo.idcategoriainsumos,
            idunidadmedida: apiInsumo.idunidadmedida,
            idimagen: apiInsumo.idimagen,
            estado: apiInsumo.estado,
            cantidad: (apiInsumo.cantidad !== null && apiInsumo.cantidad !== undefined && apiInsumo.cantidad !== "")
                ? parseFloat(apiInsumo.cantidad)
                : 0,
            precio: apiInsumo.precio,
        };
    }

    const actualizarStockInsumos = async (detalles) => {
        try {
            const resInsumos = await fetch("https://deliciasoft-backend.onrender.com/api/insumos");
            const listaInsumosRaw = await resInsumos.json();
            const listaInsumos = listaInsumosRaw.map(transformarInsumoDesdeAPI);

            const stockActual = {};
            listaInsumos.forEach((i) => {
                stockActual[i.idinsumo] = i.cantidad;
            });

            const stockCompra = {};
            detalles.forEach((d) => {
                stockCompra[d.idinsumo] = (stockCompra[d.idinsumo] || 0) + parseFloat(d.cantidad);
            });

            for (const id of Object.keys(stockCompra)) {
                const res = await fetch(`https://deliciasoft-backend.onrender.com/api/Insumos/${id}`);
                const insumoRaw = await res.json();

                const insumoActual = transformarInsumoDesdeAPI(insumoRaw);
                const cantidadActual = insumoActual.cantidad;
                const cantidadNueva = Number((cantidadActual + stockCompra[id]).toFixed(2));

                const payload = {
                    idinsumo: insumoActual.idinsumo,
                    nombreinsumo: insumoActual.nombreinsumo,
                    idcategoriainsumos: insumoActual.idcategoriainsumos,
                    idunidadmedida: insumoActual.idunidadmedida,
                    idimagen: insumoActual.idimagen,
                    estado: insumoActual.estado,
                    cantidad: cantidadNueva,
                };

                await fetch(`https://deliciasoft-backend.onrender.com/api/Insumos/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

        } catch (error) {
            console.error("Error actualizando stock de insumos:", error);
            throw error;
        }
    };

    const guardarCompra = async (compraData, insumosSeleccionados) => {
        try {
            if (!compraData.idProveedor || insumosSeleccionados.length === 0) {
                throw new Error("Debe seleccionar un proveedor y agregar al menos un insumo");
            }

            const subtotal = insumosSeleccionados.reduce(
                (acc, item) => acc + (item.cantidad || 0) * (item.precioUnitario || item.precio || 0),
                0
            );
            const iva = subtotal * 0.19;
            const total = subtotal + iva;

            const detalles = insumosSeleccionados.map(item => ({
                idinsumo: item.idinsumo ?? item.id,
                cantidad: Number(item.cantidad) || 0,
                precioUnitario: item.precioUnitario || item.precio,
                subtotalProducto: (Number(item.cantidad) || 0) * (item.precioUnitario || item.precio || 0)
            }));

            const nuevaCompraData = {
                idProveedor: compraData.idProveedor,
                fechaCompra: compraData.fechaCompra,
                fechaRegistro: compraData.fechaRegistro,
                observaciones: compraData.observaciones,
                detalles,
                subtotal,
                iva,
                total,
            };

            const compraCreada = await compraApiService.crearCompra(nuevaCompraData);
            await actualizarStockInsumos(detalles);

            return compraCreada;
        } catch (error) {
            console.error("Error al guardar la compra:", error);
            throw error;
        }
    };

    const anularCompra = async (compraId) => {
        try {
            await compraApiService.cambiarEstadoCompra(compraId, false);
        } catch (error) {
            console.error("Error al anular compra:", error);
            throw error;
        }
    };

    const reactivarCompra = async (compra) => {
        try {
            if (compra.detalles && compra.detalles.length > 0) {
                const detallesPositivos = compra.detalles.map((d) => ({
                    idinsumo: d.idinsumo,
                    cantidad: Math.abs(d.cantidad),
                }));
                await actualizarStockInsumos(detallesPositivos);
            }

            const resultado = await compraApiService.cambiarEstadoCompra(compra.id, true);
            return resultado;
        } catch (error) {
            console.error("Error al reactivar compra:", error);
            throw error;
        }
    };

    return {
        compras,
        cargarCompras,
        guardarCompra,
        anularCompra,
        reactivarCompra
    };
};  