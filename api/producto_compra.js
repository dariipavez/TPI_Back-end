const express = require('express');
const { conexion } = require('../db/conexion');
const router = express.Router();

router.post('/', function(req, res) {
    const { id_producto, id_compra, cantidad, precio_unitario } = req.body;
    const sql = `
        INSERT INTO productos_compra (id_producto, id_compra, cantidad, precio_unitario) 
        VALUES (?, ?, ?, ?)
    `;

    conexion.query(sql, [id_producto, id_compra, cantidad, precio_unitario], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

        res.json({
            status: 'ok',
            id: result.insertId
        });
    });
});

router.get('/', function(req, res) {
    const sql = `
        SELECT 
            productos_compra.id, 
            productos.nombre AS producto, 
            productos_compra.cantidad, 
            productos_compra.precio_unitario, 
            compra.precio_total, 
            compra.id_metodo_pago, 
            compra.id_envio
        FROM 
            productos_compra
        INNER JOIN 
            productos ON productos_compra.id_producto = productos.id
        INNER JOIN 
            compra ON productos_compra.id_compra = compra.id
        WHERE 
            productos_compra.id = ?
    `;

    const { id } = req.query;

    conexion.query(sql, [id], function(error, results) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error en la consulta' });
        }

        res.json({
            status: 'ok',
            productos_compra: results
        });
    });
});

router.put('/', function(req, res) {
    const { id_producto, id_compra, cantidad, precio_unitario } = req.body;
    const { id } = req.query;
    
    const sql = `
        UPDATE productos_compra 
        SET id_producto = ?, id_compra = ?, cantidad = ?, precio_unitario = ? 
        WHERE id = ?
    `;

    conexion.query(sql, [id_producto, id_compra, cantidad, precio_unitario, id], function(error) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

        res.json({
            status: 'ok',
            mensaje: 'actualizado correctamente'
        });
    });
});

router.delete('/', function(req, res) {
    const { id } = req.query;
    const sql = `
        DELETE FROM productos_compra 
        WHERE id = ?
    `;

    conexion.query(sql, [id], function(error) {
        if (error) {
            console.error(error);
            return res.status(500).send('Error al eliminar la relación');
        }

        res.json({
            status: 'ok',
            mensaje: 'eliminado correctamente'
        });
    });
});

module.exports = router;