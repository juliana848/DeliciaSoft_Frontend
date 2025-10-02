// src/features/Admin/pages/Produccion/utils/transicionesEstado.js
import { estadoProduccionMap, estadoPedidoMap } from './estadosMaps';

export const transicionesProduccion = {
  1: [1, 2],
  2: [2, 3],
  3: [3, 4],
  4: [4, 5],
  5: [5, 6],
  6: [6],
  99: []
};

export const transicionesPedido = {
  1: [1, 2],
  2: [1, 2, 3],
  3: [3, 4],
  4: [4, 5],
  5: [5, 6, 7],
  6: [6],
  7: [7],
  99: []
};

export const obtenerOpcionesEstadoProduccion = (estadoId) => {
  const siguientes = transicionesProduccion[estadoId] || [];
  return [...siguientes, 99].map((id) => ({
    id,
    label: estadoProduccionMap[id]
  }));
};

export const obtenerOpcionesEstadoPedido = (estadoId) => {
  const siguientes = transicionesPedido[estadoId] || [];
  return [...siguientes, 99].map((id) => ({
    id,
    label: estadoPedidoMap[id]
  }));
};