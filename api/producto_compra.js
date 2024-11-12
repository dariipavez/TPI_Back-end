const express = require('express');
const { conexion } = require('../db/conexion');
const router = express.Router();

router.post('/', function(req, res) {
    const { id_producto, id_compra, cantidad, precio_unitario } = req.body;

    const sql_verificacion = `
        SELECT productos.id, compra.id
        FROM productos
        INNER JOIN compra ON compra.id = ?
        WHERE productos.id = ?;
    `;

    conexion.query(sql_verificacion, [id_compra, id_producto], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send("Ocurrió un error al verificar los IDs");
        }

        if (result.length === 0) {
            return res.status(404).json({
                status: "error",
                mensaje: "El id del producto o id de la compra no existen"
            });
        }

        const sql_insert = `
            INSERT INTO producto_compra (id_producto, id_compra, cantidad, precio_unitario)
            VALUES (?, ?, ?, ?);
        `;

        conexion.query(sql_insert, [id_producto, id_compra, cantidad, precio_unitario], function(error, resultInsert) {
            if (error) {
                console.error(error);
                return res.status(500).send("Ocurrió un error al insertar el registro");
            }

            const sql_update_stock = `
                UPDATE producto
                SET stock = stock - ?
                WHERE id = ?;
            `;

            conexion.query(sql_update_stock, [cantidad, id_producto], function(errorUpdate) {
                if (errorUpdate) {
                    console.error(errorUpdate);
                    return res.status(500).send("Ocurrió un error al actualizar el stock");
                }

                res.json({
                    status: 'ok',
                    id: resultInsert.insertId
                });
            });
        });
    });
});



router.get('/', function(req, res) {
    const sql = `
        SELECT 
            producto_compra.id, 
            producto.nombre AS producto, 
            producto_compra.cantidad, 
            producto_compra.precio_unitario, 
            compra.precio_total, 
            compra.id_metodo_pago, 
            compra.id_envio
        FROM 
            producto_compra
        INNER JOIN 
            producto ON producto_compra.id_producto = productos.id
        INNER JOIN 
            compra ON producto_compra.id_compra = compra.id
        WHERE 
            producto_compra.id = ?
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
        UPDATE producto_compra 
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
        DELETE FROM producto_compra 
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