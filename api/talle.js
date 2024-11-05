const router = require('express').Router();
const { conexion } = require('../db/conexion');

function actualizarTalle(id, campos, res) {
    const sql_actualizar_talle = 'UPDATE talles SET ? WHERE id = ?';
    conexion.query(sql_actualizar_talle, [campos, id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al actualizar el talle' });
        }

        if (result.filasAfectadas === 0) {
            return res.status(404).json({ error: 'No se encontró el talle para actualizar' });
        }

        res.json({ status: 'ok', Mensaje: 'Talle actualizado correctamente' });
    });
}



router.post('/', function(req, res, next) {
    const { talles, id_tipo_producto } = req.body;
    const sql_verificar_tipo_producto = "SELECT * FROM tipo_producto WHERE id = ?";
    
    conexion.query(sql_verificar_tipo_producto, [id_tipo_producto], function(error, results) {
        if (error) {
            console.error(error);
            return res.status(500).send("Error en la base de datos.");
        }

        if (results.length === 0) {
            return res.status(400).json({ Mensaje: "El tipo de producto no existe." });
        }

        const sql_insert_talles = "INSERT INTO talles (talles, id_tipo_producto) VALUES (?, ?)";
        
        conexion.query(sql_insert_talles, [talles, id_tipo_producto], function(error, result) {
            if (error) {
                console.error(error);
                return res.status(500).send("Error en la inserción de datos.");
            }
            res.json({
                status: "ok",
                id: result.insertId
            });
        });
    });
});


router.get('/', function(req, res, next) {
    const { id } = req.query;
    const sql = "SELECT * FROM talles WHERE id=?";

    conexion.query(sql, [id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok",
            talles: result
        });
    });
});

router.get('/talles', function(req, res, next) {
    const sql = "SELECT * FROM talles";

    conexion.query(sql, function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok",
            talles: result
        });
    });
});


router.put('/', function(req, res) {
    const { id } = req.query;
    const campos = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Se necesita el id del talle' });
    }

    const sql_verificar_talle = 'SELECT * FROM talles WHERE id = ?';
    conexion.query(sql_verificar_talle, [id], function(error, results) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al verificar el talle' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Talle no encontrado' });
        }

        if (campos.id_tipo_producto) {
            const sql_verificar_producto = 'SELECT * FROM tipo_producto WHERE id = ?';
            conexion.query(sql_verificar_producto, [campos.id_tipo_producto], function(error, productoResult) {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Error al verificar el tipo de producto' });
                }

                if (productoResult.length === 0) {
                    return res.status(404).json({ error: 'Tipo de producto no encontrado' });
                }

                actualizarTalle(id, campos, res);
            });
        } else {
            actualizarTalle(id, campos, res);
        }
    });
});


router.delete('/', function(req, res, next) {
    const { id } = req.params;
    const sql = "DELETE FROM talles WHERE id=?";

    conexion.query(sql, [id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok"
        });
    });
});

module.exports = router;
