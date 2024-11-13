const router = require('express').Router();
const { conexion } = require('../db/conexion');

const rutasPublic=require('./rutasPublic')

router.use(rutasPublic);

router.get('/ver/metodos_pago/:id?', function(req, res, next) {
    const { id } = req.params;
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


module.exports=router;