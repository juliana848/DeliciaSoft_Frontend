// src/features/Cartas/pages/CartContext.jsx
import React from "react"; 
import { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [carrito, setCarrito] = useState([]);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);

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
            agregarProducto, 
            actualizarCantidadCarrito, 
            eliminarDelCarrito,
            productosSeleccionados,
            agregarProductoSeleccionado,
            actualizarCantidadSeleccionado,
            eliminarProductoSeleccionado
        }}>
            {children}
        </CartContext.Provider>
    );
};