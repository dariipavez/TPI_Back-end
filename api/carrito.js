const express = require('express');
const router = express.Router();
let carrito = [];

// Obtener el carrito
router.get('/carrito', (req, res) => {
    res.json(carrito);
});

// Agregar un producto al carrito
router.post('/carrito', (req, res) => {
    const producto = req.body;
    const productoExistente = carrito.find(p => p.id === producto.id);
    if (productoExistente) {
        productoExistente.unidades += producto.unidades;
    } else {
        carrito.push(producto);
    }
    res.json(carrito);
});

// Eliminar un producto del carrito
router.delete('/carrito/:id', (req, res) => {
    const id = parseInt(req.params.id);
    carrito = carrito.filter(producto => producto.id !== id);
    res.json(carrito);
});

// Actualizar la cantidad de un producto en el carrito
router.put('/carrito/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const unidades = req.body.unidades;
    const producto = carrito.find(producto => producto.id === id);
    if (producto) {
        producto.unidades = unidades;
    }
    res.json(carrito);
});

module.exports = router;
