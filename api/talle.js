const router = require('express').Router();
const { conexion } = require('../db/conexion');

router.post('/', function(req, res, next) {
    const { talle, id_tipo_producto } = req.body;
    
        const sql_insert_talles = "INSERT INTO talle (talle, id_tipo_producto) VALUES (?, ?)";
        
        conexion.query(sql_insert_talles, [talle, id_tipo_producto], function(error, result) {
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




router.get('/', function(req, res, next) {
    const { id } = req.query;
    const sql = "SELECT * FROM talle WHERE id=?";

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
    const sql = "SELECT * FROM talle";

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


router.put('/:id', function(req, res, next) {
    const { id } = req.params;
    const { talle } = req.body;

    if (!id || !talle) {
        return res.status(400).json({ error: 'ID y talle son requeridos' });
    }

    const sql = "UPDATE talle SET talle=? WHERE id=?";

    conexion.query(sql, [talle, id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok"
        });
    });
});


router.delete('/:id', function(req, res, next) {
    const { id } = req.params;
    const sql = "DELETE FROM talle WHERE id=?";

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
