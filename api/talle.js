const router = require('express').Router();
const { conexion } = require('../db/conexion');

// Create
router.post('/', function(req, res, next) {
    const { talles, id_tipo_producto } = req.body;
    const sql = "INSERT INTO talles (talles, id_tipo_producto) VALUES (?, ?)";

    conexion.query(sql, [talles, id_tipo_producto], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok",
            id: result.insertId
        });
    });
});

// Read
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

// Update
router.put('/:id', function(req, res, next) {
    const { id } = req.params;
    const { talles, id_tipo_producto } = req.body;
    const sql = "UPDATE talles SET talles=?, id_tipo_producto=? WHERE id=?";

    conexion.query(sql, [talles, id_tipo_producto, id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok",
            affectedRows: result.affectedRows
        });
    });
});

// Delete
router.delete('/:id', function(req, res, next) {
    const { id } = req.params;
    const sql = "DELETE FROM talles WHERE id=?";

    conexion.query(sql, [id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok",
            affectedRows: result.affectedRows
        });
    });
});

module.exports = router;
