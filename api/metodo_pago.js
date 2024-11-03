const router = require('express').Router();
const { conexion } = require('../db/conexion');

router.post('/', function(req, res, next) {
    const { tipo_pago } = req.body;
    const sql = "INSERT INTO metodo_pago (tipo_pago) VALUES (?)";

    conexion.query(sql, [tipo_pago], function(error, result) {
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

router.get('/', function(req, res, next) {
    const { id } = req.query;
    const sql = id ? "SELECT * FROM metodo_pago WHERE id=?" : "SELECT * FROM metodo_pago";

    conexion.query(sql, id ? [id] : [], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok",
            metodo_pago: result
        });
    });
});

router.put('/', function(req, res, next) {
    const { id } = req.query;
    const { tipo_pago } = req.body;

    if (!id || !tipo_pago) {
        return res.status(400).json({ error: 'ID y tipo_pago son requeridos' });
    }

    const sql = "UPDATE metodo_pago SET tipo_pago=? WHERE id=?";

    conexion.query(sql, [tipo_pago, id], function(error, result) {
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

router.delete('/:id', function(req, res, next) {
    const { id } = req.params;
    const sql = "DELETE FROM metodo_pago WHERE id=?";

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
