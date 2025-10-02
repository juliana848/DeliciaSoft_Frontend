// src/features/Admin/pages/Produccion/utils/productosMockData.js

export const productosDisponibles = [
  {
    id: 1,
    nombre: 'Mini Donas',
    imagen: 'https://www.gourmet.cl/wp-content/uploads/2014/06/donuts.jpg',
    insumos: [
      { cantidad: 2, unidad: 'kg', nombre: 'Harina' },
      { cantidad: 1, unidad: 'kg', nombre: 'Azúcar' },
      { cantidad: 6, unidad: 'unidades', nombre: 'Huevos' }
    ],
    receta: {
      id: 32,
      nombre: 'Mini Donas con Azúcar y Canela',
      pasos: ['Freír donas', 'Pasar por mezcla de azúcar y canela'],
      insumos: ['Harina', 'Canela', 'Azúcar', 'Levadura', 'Huevos'],
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeC4LnjzReB9EHRknBi99jxMEV1TCbh1IsCw&s'
    }
  },
  {
    id: 2,
    nombre: 'Fresas con Crema',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLJpYaCsw9PrMPGeksePsJ11H1M3TICsywrg&s',
    insumos: [
      { cantidad: 5, unidad: 'g', nombre: 'Fresas' },
      { cantidad: 250, unidad: 'ml', nombre: 'Crema para batir' },
      { cantidad: 500, unidad: 'g', nombre: 'Azúcar glass' }
    ],
    receta: {
      id: 38,
      nombre: 'Fresas con Crema y Galleta',
      pasos: ['Colocar fresas en vaso', 'Agregar crema batida', 'Espolvorear galleta triturada'],
      insumos: ['Fresas', 'Crema de leche', 'Galleta María'],
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFzhVvkezQ69ngkBxtRgsySIVk_ovSiw6knQ&s'
    }
  },
  {
    id: 3,
    nombre: 'Pastel de Chocolate',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRqBba-wH5E0DMJztvKWuifPz8CnGoLs0N1g&s',
    insumos: [
      { cantidad: 3, unidad: 'kg', nombre: 'Harina' },
      { cantidad: 1.5, unidad: 'kg', nombre: 'Chocolate' },
      { cantidad: 1, unidad: 'kg', nombre: 'Mantequilla' },
      { cantidad: 12, unidad: 'unidades', nombre: 'Huevos' }
    ],
    receta: {
      id: 36,
      nombre: 'Torta de Chocolate con Café',
      pasos: ['Preparar mezcla con café', 'Hornear', 'Cubrir con ganache'],
      insumos: ['Harina', 'Café fuerte', 'Cacao', 'Azúcar', 'Huevos'],
      imagen: 'https://media.elgourmet.com/recetas/cover/1bdd8a837944f3a10abc33eeb9a036f8_3_3_photo.png'
    }
  }
];