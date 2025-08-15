import React from 'react';
import Modal from '../../components/modal';
export default function VentasAbonosModal({
    visible,
    onClose,
    ventaSeleccionada,
    abonos,
    setMostrarModalAgregarAbono,
    verDetalleAbono,
    anularAbono
}) {
    if (!visible || !ventaSeleccionada) return null;

    return (
        <Modal visible={visible} onClose={onClose}>
            <div className="abonos-modal">
                <h3>Abonos de la Venta #{ventaSeleccionada?.id}</h3>
                <div className="abonos-lista">
                    {abonos.length > 0 ? (
                        <table className="abonos-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Método de Pago</th>
                                    <th>Monto</th>
                                    <th>Falta por Pagar</th>
                                    <th>Comprobante</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {abonos.map(abono => (
                                    <tr key={abono.id} className={abono.anulado ? 'abono-anulado' : ''}>
                                        <td>{abono.fecha}</td>
                                        <td>{abono.metodo_pago}</td>
                                        <td>${abono.monto.toLocaleString()}</td>
                                        <td>${abono.falta_por_pagar.toLocaleString()}</td>
                                        <td>
                                            {abono.comprobante_imagen ? (
                                                <img src={abono.comprobante_imagen} alt="Comprobante" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="admin-button gray"
                                                title="Ver Detalle"
                                                onClick={() => verDetalleAbono(abono)}
                                            >
                                                🔍
                                            </button>
                                            <button
                                                className="admin-button red"
                                                title="Anular Abono"
                                                onClick={() => anularAbono(abono.id)}
                                                disabled={abono.anulado}
                                            >
                                                🛑
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No hay abonos registrados</p>
                    )}
                </div>
                <button
                    className="btn-agregar-abono"
                    onClick={() => setMostrarModalAgregarAbono(true)}
                >
                    + Agregar Abono
                </button>
            </div>
        </Modal>
    );
}