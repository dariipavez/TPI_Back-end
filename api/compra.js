const router = require('express').Router();
const { conexion } = require('../db/conexion');

function actualizarCompra(id, campos, res) {
    let sql = 'UPDATE compra SET ';
    const valores = [];

    for (let campo in campos) {
        sql += `${campo} = ?, `;
        valores.push(campos[campo]);
    }

    sql = sql.slice(0, -2) + ' WHERE id = ?';
    valores.push(id);

    conexion.query(sql, valores, function(error) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        }
        res.json({ status: "ok", mensaje: "Compra actualizada correctamente" });
    });
}

router.post('/', function(req, res, next) {
    const { id_metodo_pago, precio_total, id_envio } = req.body;

    const sql_insert_compra = "INSERT INTO compra (id_metodo_pago, precio_total, id_envio) VALUES (?, ?, ?)";

    conexion.query(sql_insert_compra, [id_metodo_pago, precio_total, id_envio], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

        res.json({
            status: "ok",
            compra_id: result.insertId
        });
    });
});

router.get('/', function(req, res, next) {
    const { id } = req.query;
    const sql = "SELECT * FROM compra WHERE id = ?";

    conexion.query(sql, [id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

        res.json({
            status: "ok",
            compra: result
        });
    });
});

router.put('/', function(req, res) {
    const { id } = req.query;
    const campos = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Se necesita el id de la compra' });
    }

    const sql_verificar_compra = 'SELECT * FROM compra WHERE id = ?';
    conexion.query(sql_verificar_compra, [id], function(error, results) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al verificar la compra' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Compra no encontrada' });
        }

        actualizarCompra(id, campos, res);
    });
});

router.delete('/', function(req, res, next) {
    const { id } = req.query;
    const sql = "DELETE FROM compra WHERE id = ?";

    conexion.query(sql, [id], function(error) {
        if (error) {
            console.error(error);
            return res.status(500).send("Ocurrió un error");
        }

        res.json({
            status: "ok",
            mensaje: "Compra eliminada correctamente"
        });
    });
});

module.exports = router;