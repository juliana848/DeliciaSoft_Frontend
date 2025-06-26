import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';

// Componente de Notificación en línea para RecetaForm
const NotificationComponent = ({ visible, mensaje, tipo, onClose }) => {
    if (!visible) return null;
    const bgColor = tipo === 'success' ? '#d4edda' : '#f8d7da';
    const textColor = tipo === 'success' ? '#155724' : '#721c24';
    const borderColor = tipo === 'success' ? '#c3e6cb' : '#f5c6cb';

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '10px 20px',
                borderRadius: '5px',
                backgroundColor: bgColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                zIndex: 1000,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
            }}
        >
            <span>{mensaje}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2em', cursor: 'pointer', color: textColor }}>
                &times;
            </button>
        </div>
    );
};

// Componente SearchBar en línea para RecetaForm
const SearchBarComponent = ({ placeholder, value, onChange }) => (
    <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input" // Assuming this class is defined in adminStyles.css
        style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "100%",
            fontSize: "14px",
        }}
    />
);

// Componente Modal en línea para RecetaForm
const ModalComponent = ({ visible, onClose, children }) => {
    if (!visible) return null;
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 999,
            }}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                    maxWidth: '90%',
                    maxHeight: '90%',
                    overflowY: 'auto',
                    minWidth: '400px',
                }}
            >
                {children}
            </div>
        </div>
    );
};


// Mock data for insumos - Defined locally in this component
const mockInsumosDisponibles = [
    { id: 1, nombre: 'Harina de Trigo', categoria: 'Harinas', IdUnidadMedida: 1 },
    { id: 2, nombre: 'Azúcar Blanca', categoria: 'Endulzantes', IdUnidadMedida: 1 },
    { id: 3, nombre: 'Levadura Seca', categoria: 'Fermentos', IdUnidadMedida: 2 },
    { id: 4, nombre: 'Huevos A', categoria: 'Lácteos', IdUnidadMedida: 5 },
    { id: 5, nombre: 'Mantequilla sin sal', categoria: 'Lácteos', IdUnidadMedida: 2 },
    { id: 6, nombre: 'Leche Entera', categoria: 'Lácteos', IdUnidadMedida: 3 },
    { id: 7, nombre: 'Chocolate Semiamargo', categoria: 'Saborizantes', IdUnidadMedida: 2 },
    { id: 8, nombre: 'Esencia de Vainilla', categoria: 'Saborizantes', IdUnidadMedida: 4 },
    { id: 9, nombre: 'Sal Refinada', categoria: 'Condimentos', IdUnidadMedida: 2 },
    { id: 10, nombre: 'Aceite Vegetal', categoria: 'Grasas', IdUnidadMedida: 3 },
];

// Opciones de unidades de medida - Definidas localmente en este componente
const unidadesMedida = [
    { label: "Seleccionar unidad...", value: "", disabled: true },
    { label: "Kilogramos", value: 1, text: "kg" },
    { label: "Gramos", value: 2, text: "gr" },
    { label: "Litros", value: 3, text: "litros" },
    { label: "Mililitros", value: 4, text: "ml" },
    { label: "Unidades", value: 5, text: "unidad" },
    { label: "Libras", value: 6, text: "lb" },
    { label: "Onzas", value: 7, text: "oz" },
    { label: "Tazas", value: 8, text: "taza" },
    { label: "Cucharadas", value: 9, text: "cda" },
    { label: "Cucharaditas", value: 10, text: "cdta" },
];

const obtenerNombreUnidad = (idUnidad) => {
    const unidad = unidadesMedida.find((u) => u.value === idUnidad);
    return unidad ? unidad.label : '';
};
const obtenerTextoUnidad = (idUnidad) => {
    const unidad = unidadesMedida.find((u) => u.value === idUnidad);
    return unidad ? unidad.text : '';
};


export default function RecetaForm({ initialData, onSave, onCancel, isEditing }) {
    const [formData, setFormData] = useState(initialData || {
        NombreReceta: '', // Changed from IdProductoGeneral
        Especificaciones: '',
    });
    // insumosReceta ahora representa el DetalleReceta
    const [insumosReceta, setInsumosReceta] = useState(initialData?.insumos ? JSON.parse(JSON.stringify(initialData.insumos)) : []);
    const [notification, setNotification] = useState({ visible: false, mensaje: '', tipo: 'success' });

    const [mostrarModalInsumos, setMostrarModalInsumos] = useState(false);
    const [filtroInsumosDisponibles, setFiltroInsumosDisponibles] = useState('');

    useEffect(() => {
        // Ensures form data and insumos are reset/updated when initialData changes (e.g., when switching from add to edit)
        setFormData(initialData || {
            NombreReceta: '',
            Especificaciones: '',
        });
        setInsumosReceta(initialData?.insumos ? JSON.parse(JSON.stringify(initialData.insumos)) : []);
    }, [initialData]);

    const showNotification = (mensaje, tipo = 'success') => {
        setNotification({ visible: true, mensaje, tipo });
    };
    const hideNotification = () => setNotification({ visible: false, mensaje: '', tipo: 'success' });

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validarFormularioPrincipal = () => {
        const { NombreReceta } = formData;

        if (!NombreReceta.trim()) {
            showNotification('El nombre de la receta es obligatorio.', 'error');
            return false;
        }
        if (insumosReceta.length === 0) {
            showNotification('Debe agregar al menos un insumo a la receta', 'error');
            return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!validarFormularioPrincipal()) return;

        const dataToSave = {
            NombreReceta: formData.NombreReceta,
            Especificaciones: formData.Especificaciones,
            // Los insumos ahora son el DetalleReceta
            insumos: insumosReceta.map(ins => ({
                IdInsumo: ins.id, // Maps to IdInsumo in DetalleReceta
                IdUnidadMedida: ins.IdUnidadMedida, // Maps to IdUnidadMedida in DetalleReceta
                Cantidad: parseFloat(ins.cantidad), // Maps to Cantidad in DetalleReceta
                // Optionally keep display info for UI purposes, but not for DB
                nombre: ins.nombre,
                unidad: obtenerTextoUnidad(ins.IdUnidadMedida)
            })),
        };
        onSave(dataToSave);
        // Do NOT clear insumosReceta here, as it might be needed if user cancels and re-edits immediately.
        // Clearing is handled by RecetasTabla when returning to list view or starting a new add.
    };

    // Insumo Modal Logic
    const insumosFiltradosDisponibles = mockInsumosDisponibles.filter(insumo =>
        insumo.nombre.toLowerCase().includes(filtroInsumosDisponibles.toLowerCase()) ||
        insumo.categoria.toLowerCase().includes(filtroInsumosDisponibles.toLowerCase())
    );

    const handleAddInsumoToRecipe = (insumoToAdd) => {
        // Check if insumo is already in insumosReceta
        if (insumosReceta.some(item => item.id === insumoToAdd.id)) {
            showNotification('Este insumo ya fue agregado.', 'error');
            return;
        }

        setInsumosReceta(prev => [
            ...prev,
            { ...insumoToAdd, cantidad: 1 } // Default quantity to 1, user can change later. IdUnidadMedida is already in mock.
        ]);
        showNotification(`${insumoToAdd.nombre} agregado.`);
    };

    const handleCantidadInsumoChange = (id, value) => {
        setInsumosReceta(prev =>
            prev.map(item => (item.id === id ? { ...item, cantidad: Math.max(1, parseFloat(value) || 0) } : item))
        );
    };

    const handleRemoveInsumoFromRecipe = (id) => {
        setInsumosReceta(prev => prev.filter(item => item.id !== id));
        showNotification('Insumo eliminado de la lista de receta.');
    };

    return (
        <div className="compra-form-container">
            <NotificationComponent visible={notification.visible} mensaje={notification.mensaje} tipo={notification.tipo} onClose={hideNotification} />

            <h1>{isEditing ? 'Editar Receta' : 'Agregar Receta'}</h1>

            <div className="compra-fields-grid">
                <div className="field-group" style={{ gridColumn: "span 2" }}>
                    <label>Nombre de la Receta:*</label>
                    <input
                        type="text"
                        value={formData.NombreReceta}
                        onChange={(e) => handleFormChange("NombreReceta", e.target.value)}
                        className="modal-input"
                        maxLength={50}
                    />
                </div>

                <div className="field-group" style={{ gridColumn: "span 2" }}>
                    <label>Especificaciones:</label>
                    <textarea
                        value={formData.Especificaciones}
                        onChange={(e) => handleFormChange("Especificaciones", e.target.value)}
                        className="modal-input observaciones-field"
                        maxLength={80}
                        placeholder="Descripción de la receta..."
                    ></textarea>
                </div>
            </div>

            <div className="section-divider"></div>

            <div className="detalle-section">
                <h2>Insumos para la Receta*</h2>
                <table className="compra-detalle-table">
                    <thead className="p-datatable-thead">
                        <tr>
                            <th>Nombre Insumo</th>
                            <th>Cantidad</th>
                            <th>Unidad de Medida</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody className="p-datatable">
                        {insumosReceta.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                                    No hay insumos agregados. Utilice el botón "Agregar Insumos" para añadir.
                                </td>
                            </tr>
                        ) : (
                            insumosReceta.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.nombre}</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.cantidad}
                                            onChange={(e) => handleCantidadInsumoChange(item.id, e.target.value)}
                                            style={{ width: '80px' }}
                                        />
                                    </td>
                                    <td>{obtenerTextoUnidad(item.IdUnidadMedida)}</td>
                                    <td>
                                        <button
                                            className="btn-eliminar"
                                            onClick={() => handleRemoveInsumoFromRecipe(item.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <button
                    className="btn-agregar-insumos"
                    onClick={() => setMostrarModalInsumos(true)}
                >
                    + Agregar Insumos
                </button>
            </div>

            <div className="compra-header-actions"
                style={{
                    marginTop: '1rem',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.5rem'
                }}>
                <button
                    className="modal-btn cancel-btn"
                    onClick={onCancel}
                >
                    Cancelar
                </button>
                <button
                    className="modal-btn save-btn"
                    onClick={handleSave}
                >
                    Guardar
                </button>
            </div>

            {/* Modal para seleccionar insumos */}
            {mostrarModalInsumos && (
                <ModalComponent visible={mostrarModalInsumos} onClose={() => setMostrarModalInsumos(false)}>
                    <h2 className="modal-title">Seleccionar Insumos</h2>
                    <div className="modal-body">
                        <SearchBarComponent
                            placeholder="Buscar Insumo..."
                            value={filtroInsumosDisponibles}
                            onChange={setFiltroInsumosDisponibles}
                        />
                        <div className="insumos-list" style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '1rem' }}>
                            {insumosFiltradosDisponibles.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#666' }}>No se encontraron insumos.</p>
                            ) : (
                                insumosFiltradosDisponibles.map(insumo => (
                                    <div key={insumo.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem',
                                        borderBottom: '1px solid #eee',
                                        backgroundColor: insumosReceta.some(item => item.id === insumo.id) ? '#e6ffe6' : 'white'
                                    }}>
                                        <div>
                                            <strong>{insumo.nombre}</strong> ({insumo.categoria})
                                        </div>
                                        <button
                                            className="admin-button blue"
                                            onClick={() => handleAddInsumoToRecipe(insumo)}
                                            disabled={insumosReceta.some(item => item.id === insumo.id)}
                                            style={{ opacity: insumosReceta.some(item => item.id === insumo.id) ? 0.6 : 1 }}
                                        >
                                            {insumosReceta.some(item => item.id === insumo.id) ? 'Agregado' : 'Agregar'}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="modal-btn save-btn" onClick={() => setMostrarModalInsumos(false)}>
                            Cerrar
                        </button>
                    </div>
                </ModalComponent>
            )}
        </div>
    );
}