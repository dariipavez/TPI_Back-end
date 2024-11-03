const express = require('express');
const router = express.Router();
const {conexion} = require('../db/conexion') 

// // Ruta para registrar un producto
// router.post('/register', (req, res) => {
//   const { nombre, id_marca, id_categoria, id_tipo_producto, precio, stock, ruta_imagen, id_talles } = req.body;
  
//   // Verificar que todos los campos están presentes
//   if (!nombre || !id_marca || !id_categoria || !id_tipo_producto || !precio || !stock || !ruta_imagen || !id_talles) {
//     return res.status(400).json({ error: 'Por favor, complete todos los campos' });
//   }

//   // Consulta SQL para insertar un nuevo producto
//   const query = `INSERT INTO productos (nombre, id_marca, id_categoria, id_tipo_producto, precio, stock, ruta_imagen, id_talles)VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
//   db.query(query, [nombre, id_marca, id_categoria, id_tipo_producto, precio, stock, ruta_imagen, id_talles], (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error al registrar el producto' });
//     }

//     // Respuesta exitosa
//     return res.status(201).json({ message: 'Producto registrado correctamente' });
//   });
// });

module.exports = router;
