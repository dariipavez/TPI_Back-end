const router=require('express').Router()

const {conexion}=require('../db/conexion')

router.post('/', function(req, res, next){
    const {nombre}=req.body;

    const sql="INSERT INTO tipo_producto (nombre) VALUES (?)"

    conexion.query(sql, [nombre], function(error,result){
        if(error){
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status:"ok",
            id:result.insertId
        });
    });
});

router.get("/", function(req, res, next){
    const { id }=req.query
    const sql="SELECT * FROM tipo_producto WHERE id=?";
    conexion.query(sql,[id],function(error,result){
        if(error){
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status:"ok",
            tipo_producto:result
        });
    });
});

module.exports = router;