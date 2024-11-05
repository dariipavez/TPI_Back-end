const router = require('express').Router();
const { conexion } = require('../db/conexion');

router.post('/', function(req, res, next){
    const { nombre } = req.body;
    const sql = "INSERT INTO marca (nombre) VALUES (?)";

    conexion.query(sql, [nombre], function(error, result){
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

router.get('/', function(req, res, next){
    const { id } = req.query;
    const sql = "SELECT * FROM marca WHERE id=?";
    conexion.query(sql, [id], function(error, result){
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok",
            marca: result
        });
    });
});

router.get('/marcas', function(req, res, next){
    const sql = "SELECT * FROM marca";
    conexion.query(sql, function(error, result){
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok",
            marca: result
        });
    });
});

router.put('/', function(req, res, next) {
    const { id } = req.query;
    const { nombre } = req.body;
    
    if (!id || !nombre) {
        return res.status(400).json({ error: 'ID y nombre son requeridos' });
    }

    const sql = "UPDATE marca SET nombre=? WHERE id=?";
    
    conexion.query(sql, [nombre, id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok",
        });
    });
});


router.delete('/', function(req, res, next) {
    const { id } = req.params;
    const sql = "DELETE FROM marca WHERE id=?";

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
