import { useState } from 'react';
import proveedorApiService from '../../../services/proveedor_services';;

export const useProveedores = () => {
    const [proveedores, setProveedores] = useState([]);

    const cargarProveedores = async () => {
        try {
            const proveedoresAPI = await proveedorApiService.obtenerProveedores();
            setProveedores(proveedoresAPI);
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
            throw new Error('Error al cargar los proveedores: ' + error.message);
        }
    };

    const guardarProveedor = async (proveedorData) => {
        try {
            const nuevoProveedor = await proveedorApiService.crearProveedor(proveedorData);
            return nuevoProveedor;
        } catch (error) {
            console.error('Error al guardar proveedor:', error);
            throw error;
        }
    };

    return {
        proveedores,
        cargarProveedores,
        guardarProveedor
    };
};