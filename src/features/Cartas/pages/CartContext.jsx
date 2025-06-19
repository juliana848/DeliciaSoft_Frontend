// src/features/Cartas/pages/CartContext.jsx
import React from "react"; 
import { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [carrito, setCarrito] = useState([]);

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

    return (
        <CartContext.Provider value={{ carrito, agregarProducto }}>
        {children}
        </CartContext.Provider>
    );
    };
