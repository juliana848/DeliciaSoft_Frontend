// src/features/Cartas/pages/CartContext.jsx
import React from "react"; 
import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Cargar carrito desde localStorage al iniciar
    const [carrito, setCarrito] = useState(() => {
        try {
            const carritoGuardado = localStorage.getItem('deliciasoft_cart_v1');
            if (carritoGuardado) {
                const carritoParseado = JSON.parse(carritoGuardado);
                console.log('✅ Carrito cargado desde localStorage:', carritoParseado);
                return Array.isArray(carritoParseado) ? carritoParseado : [];
            }
        } catch (error) {
            console.error('❌ Error al cargar carrito:', error);
        }
        return [];
    });

    const [productosSeleccionados, setProductosSeleccionados] = useState([]);

    // Guardar carrito en localStorage cada vez que cambie
    useEffect(() => {
        localStorage.setItem('deliciasoft_cart_v1', JSON.stringify(carrito));
        console.log('💾 Carrito guardado automáticamente:', carrito);
    }, [carrito]);

    const agregarProducto = (producto) => {
        setCarrito((prevCarrito) => {
            const productoExistente = prevCarrito.find((p) => p.id === producto.id);

            if (productoExistente) {
                return prevCarrito.map((p) =>
                    p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
                );
            } else {
                return [...prevCarrito, producto];
            }
        });
    };

    const actualizarCantidadCarrito = (id, nuevaCantidad) => {
        setCarrito(prev => 
            prev.map(item => 
                item.id === id 
                    ? { ...item, cantidad: nuevaCantidad }
                    : item
            )
        );
    };

    const eliminarDelCarrito = (id) => {
        setCarrito(prev => prev.filter(item => item.id !== id));
    };

    const vaciarCarrito = () => {
        setCarrito([]);
    };

    const agregarProductoSeleccionado = (producto) => {
        setProductosSeleccionados((prev) => {
            const productoExistente = prev.find((p) => p.id === producto.id);
            
            if (productoExistente) {
                return prev.map((p) =>
                    p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
                );
            } else {
                return [...prev, producto];
            }
        });
    };

    const actualizarCantidadSeleccionado = (id, nuevaCantidad) => {
        setProductosSeleccionados(prev => 
            prev.map(item => 
                item.id === id 
                    ? { ...item, cantidad: nuevaCantidad }
                    : item
            )
        );
    };

    const eliminarProductoSeleccionado = (id) => {
        setProductosSeleccionados(prev => prev.filter(item => item.id !== id));
    };

    return (
        <CartContext.Provider value={{ 
            carrito, 
            setCarrito, // 👈 IMPORTANTE: Exponemos setCarrito
            agregarProducto, 
            actualizarCantidadCarrito, 
            eliminarDelCarrito,
            vaciarCarrito,
            productosSeleccionados,
            agregarProductoSeleccionado,
            actualizarCantidadSeleccionado,
            eliminarProductoSeleccionado
        }}>
            {children}
        </CartContext.Provider>
    );
};