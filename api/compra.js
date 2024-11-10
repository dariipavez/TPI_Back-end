const router = require('express').Router();
const { conexion } = require('../db/conexion');

function actualizarCompra(id, campos, res) {
    const sql_actualizar_compra = 'UPDATE compra SET ? WHERE id = ?';
    conexion.query(sql_actualizar_compra, [campos, id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al actualizar la compra' });
        }

        if (result.filasAfectadas === 0) {
            return res.status(404).json({ error: 'No se encontró la compra para actualizar' });
        }

        res.json({ status: 'ok', Mensaje: 'Compra actualizada correctamente' });
    });
}

router.post('/', function(req, res, next) {
    const { id_metodo_pago, precio_total, id_envio } = req.body;

    const sql_verificacion = "SELECT metodo_pago.id, envio.id FROM metodo_pago INNER JOIN envio ON envio.id = ? WHERE metodo_pago.id = ?";

    conexion.query(sql_verificacion, [id_envio, id_metodo_pago], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send("Ocurrió un error al verificar los IDs");
        }

        if (result.length === 0) {
            return res.status(404).json({
                status: "error",
                mensaje: "El id_metodo_pago o id_envio no existen"
            });
        }

        const sql_insert_compra = "INSERT INTO compra (id_metodo_pago, precio_total, id_envio) VALUES (?, ?, ?)";

        conexion.query(sql_insert_compra, [id_metodo_pago, precio_total, id_envio], function(error, resultInsert) {
            if (error) {
                console.error(error);
                return res.status(500).send("Ocurrió un error al insertar el registro de compra");
            }

            res.json({
                status: "ok",
                compra_id: resultInsert.insertId
            });
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