// src/features/Admin/pages/Produccion/utils/estadosMaps.js

export const EstadoMap = {
  produccion: [
    { id: 1, label: 'Pendiente 🟡' },
    { id: 2, label: 'Empaquetando 🟠' },
    { id: 3, label: 'En producción 🔵' },
    { id: 4, label: 'Decorado 🟤' },
    { id: 5, label: 'Empaquetado 🟦' },
    { id: 6, label: 'Entregado 🟢' },
    { id: 99, label: 'N/A 🔴' }
  ],
  pedido: [
    { id: 1, label: 'Abonado 🟣' },
    { id: 2, label: 'Empaquetando 🟠' },
    { id: 3, label: 'En producción 🔵' },
    { id: 4, label: 'Decorado 🟤' },
    { id: 5, label: 'Empaquetado 🟦' },
    { id: 6, label: 'Entregado a ventas 🔵' },
    { id: 7, label: 'Entregado al cliente 🟢' },
    { id: 99, label: 'N/A 🔴' }
  ]
};

export const estadoProduccionMap = Object.fromEntries(
  EstadoMap.produccion.map(estado => [estado.id, estado.label])
);

export const estadoPedidoMap = Object.fromEntries(
  EstadoMap.pedido.map(estado => [estado.id, estado.label])
);

export const estadoProduccionInverse = Object.fromEntries(
  EstadoMap.produccion.map(estado => [estado.label, estado.id])
);

export const estadoPedidoInverse = Object.fromEntries(
  EstadoMap.pedido.map(estado => [estado.label, estado.id])
);