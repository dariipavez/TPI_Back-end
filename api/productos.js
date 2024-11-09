const express=require("express");
const { conexion }=require("../db/conexion");
const router=express.Router();

router.get("/", function(req, res, next){
    const { id }=req.query
    const sql="SELECT * FROM productos WHERE id=?";
    conexion.query(sql,[id],function(error,result){
        if(error){
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status:"ok",
            Producto:result
        });
    });
});

router.post('/', function(req, res, next){
    const {}=req.body;

    const sql="INSERT INTO productos (documento, nombres, apellidos, domicilio, telefono) VALUES (?,?,?,?,?)"

    conexion.query(sql, [documento,nombres,apellidos,domicilio, telefono], function(error,result){
        if(error){
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status:"ok",
            id:result[0].id
        });
    });
});

router.put('/', function(req, res, next){
    const { documento,nombres,apellidos,domicilio,telefono }= req.body;
    const { id }=req.query;

    const sql="UPDATE productos SET documento=?, nombres=?, apellidos=?, domicilio=?, telefono=? WHERE id=?"
    conexion.query(sql, [documento,nombres,apellidos,domicilio, telefono,id], function(error){
        if(error){
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status:"ok"
        });
    });

});

router.delete('/', function(req, res, next){
    const {id}=req.query;
    const sql="DELETE FROM productos WHERE id=?"
    conexion.query(sql,[id],function(error){
        if(error){
            console.error(error);
            return res.status(500).send("ocurrió un error");
        }
        res.json({
            status:"ok"
        });
    });
});

module.exports=router;