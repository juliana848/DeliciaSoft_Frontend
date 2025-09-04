import React, { useState, useEffect } from 'react';
import Modal from '../modal';
import productoApiService from '../../services/producto_services';
import '../../adminStyles.css';

export default function AgregarProductosModal({ onClose, onAgregar, insumosSeleccionados }) {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Cargar productos al montar el componente
    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        try {
            setLoading(true);
            setError('');

            console.log('Cargando productos desde productoApiService...');
            console.log('URL del servicio:', 'https://deliciasoft-backend.onrender.com/api/productogeneral');

            const productosData = await productoApiService.obtenerProductos();
            console.log('Productos recibidos desde API:', productosData);

            if (!productosData || productosData.length === 0) {
                console.warn('No se recibieron productos de la API');
                setError('No hay productos disponibles en este momento');
                setProductos([]);
                return;
            }

            // Transformar los productos para asegurar la estructura correcta
            const productosTransformados = productosData.map(producto => ({
                id: producto.id || producto.idproductogeneral,
                nombre: producto.nombre || producto.nombreproducto,
                precio: producto.precio || producto.precioproducto || 0,
                categoria: producto.categoria || 'Sin categoría',
                estado: producto.estado !== false, // Por defecto true si no está definido
                descripcion: producto.descripcion || producto.especificaciones || '',
                cantidadSanPablo: producto.cantidadSanPablo || producto.cantidadsanpablo || 0,
                cantidadSanBenito: producto.cantidadSanBenito || producto.cantidadsanbenito || 0,
                imagen: producto.imagen || null
            }));

            console.log('Productos transformados:', productosTransformados);
            setProductos(productosTransformados);

        } catch (error) {
            console.error('Error al cargar productos:', error);
            setError(`Error al cargar los productos: ${error.message}`);
            
            // En caso de error, no cargar datos fallback, mostrar el error
            setProductos([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar productos por búsqueda y excluir los ya seleccionados
    const filteredProducts = productos.filter(producto => {
        const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const notAlreadySelected = !insumosSeleccionados.some(selected => selected.id === producto.id);
        const isActive = producto.estado === true || producto.estado === 'activo' || producto.estado === 1;
        return matchesSearch && notAlreadySelected && isActive;
    });

    const handleProductSelect = (producto) => {
        setSelectedProducts(prev => {
            const isSelected = prev.find(p => p.id === producto.id);
            if (isSelected) {
                return prev.filter(p => p.id !== producto.id);
            } else {
                return [...prev, { 
                    ...producto,
                    cantidad: 1, // Cantidad por defecto
                    adiciones: [], // Adiciones vacías por defecto
                    salsas: [], // Salsas vacías por defecto
                    sabores: [] // Sabores/rellenos vacíos por defecto
                }];
            }
        });
    };

    const handleAgregar = () => {
        if (selectedProducts.length > 0) {
            console.log('Productos seleccionados para agregar:', selectedProducts);
            onAgregar(selectedProducts);
            onClose();
        }
    };

    const isProductSelected = (productoId) => {
        return selectedProducts.some(p => p.id === productoId);
    };

    // Función para mostrar el inventario total
    const getInventarioTotal = (producto) => {
        const sanPablo = parseInt(producto.cantidadSanPablo || 0);
        const sanBenito = parseInt(producto.cantidadSanBenito || 0);
        return sanPablo + sanBenito;
    };

    // Función para reintentar la carga
    const handleRetry = () => {
        fetchProductos();
    };

    return (
        <Modal visible={true} onClose={onClose}>
            <div className="modal-header">
                <h2>Agregar Productos</h2>
                {error && (
                    <div className="error-section">
                        <p className="error-message">{error}</p>
                        <button 
                            className="btn-small" 
                            onClick={handleRetry}
                            disabled={loading}
                        >
                            {loading ? 'Cargando...' : 'Reintentar'}
                        </button>
                    </div>
                )}
            </div>

            <div className="modal-body">
                {/* Barra de búsqueda */}
                <div className="search-section">
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        disabled={loading}
                    />
                </div>

                {/* Lista de productos */}
                <div className="products-list">
                    {loading ? (
                        <div className="loading-container">
                            <p>Cargando productos desde la API...</p>
                            <p style={{ fontSize: '12px', color: '#666' }}>
                                Conectando con: https://deliciasoft-backend.onrender.com/api/productogeneral
                            </p>
                        </div>
                    ) : error && productos.length === 0 ? (
                        <div className="no-results">
                            <p>No se pudieron cargar los productos.</p>
                            <p style={{ fontSize: '12px', color: '#666' }}>
                                Verifique la conexión con la API.
                            </p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="no-results">
                            <p>
                                {searchTerm 
                                    ? `No se encontraron productos que coincidan con "${searchTerm}".`
                                    : 'No se encontraron productos disponibles.'
                                }
                            </p>
                            {productos.length > 0 && (
                                <p style={{ fontSize: '12px', color: '#666' }}>
                                    Total de productos en la base: {productos.length}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="products-grid">
                            {filteredProducts.map(producto => (
                                <div
                                    key={producto.id}
                                    className={`product-card ${isProductSelected(producto.id) ? 'selected' : ''}`}
                                    onClick={() => handleProductSelect(producto)}
                                >
                                    {/* Imagen del producto */}
                                    <div className="product-image">
                                        {producto.imagen ? (
                                            <img 
                                                src={producto.imagen} 
                                                alt={producto.nombre}
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-product.png';
                                                }}
                                            />
                                        ) : (
                                            <div className="no-image-placeholder">
                                                Sin imagen
                                            </div>
                                        )}
                                    </div>

                                    {/* Información del producto */}
                                    <div className="product-info">
                                        <h4 className="product-name">{producto.nombre}</h4>
                                        <p className="product-price">
                                            ${Number(producto.precio).toLocaleString('es-CO')}
                                        </p>
                                        {producto.categoria && (
                                            <p className="product-category">Categoría: {producto.categoria}</p>
                                        )}
                                        {producto.descripcion && (
                                            <p className="product-description">{producto.descripcion}</p>
                                        )}
                                        <p className="product-stock">
                                            Stock total: {getInventarioTotal(producto)} unidades
                                        </p>
                                        <p className="product-stock-detail">
                                            San Pablo: {producto.cantidadSanPablo || 0} | 
                                            San Benito: {producto.cantidadSanBenito || 0}
                                        </p>
                                    </div>

                                    {/* Indicador de selección */}
                                    {isProductSelected(producto.id) && (
                                        <div className="selection-indicator">
                                            ✓
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Resumen de selección */}
                {selectedProducts.length > 0 && (
                    <div className="selection-summary">
                        <p>Productos seleccionados: {selectedProducts.length}</p>
                        <div className="selected-products-list">
                            {selectedProducts.map(producto => (
                                <span key={producto.id} className="selected-product-tag">
                                    {producto.nombre} (${Number(producto.precio).toLocaleString('es-CO')})
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="modal-footer">
                <button 
                    className="modal-btn cancel-btn" 
                    onClick={onClose}
                >
                    Cancelar
                </button>
                <button 
                    className="modal-btn save-btn" 
                    onClick={handleAgregar}
                    disabled={selectedProducts.length === 0 || loading}
                >
                    Agregar ({selectedProducts.length})
                </button>
            </div>
        </Modal>
    );
}