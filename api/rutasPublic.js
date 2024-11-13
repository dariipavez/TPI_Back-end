const router = require('express').Router();
const { conexion } = require('../db/conexion');




router.get('/ver/talle/:id?', function(req, res, next) {
    const id = req.params.id;
    const sql = id ? "SELECT * FROM talle WHERE id=?" : "SELECT * FROM talle";

    conexion.query(sql,id ? [id] : [], function(error, result) {
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

router.get("/ver/producto/:id?", function(req, res, next){
    const id=req.params.id
    const sql= id? "SELECT * FROM producto WHERE id=?":"SELECT * FROM producto";
    conexion.query(sql,id? [id] : [],function(error,result){
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

router.get("/ver/producto/categoria/:id_categoria", function (req, res) {
    const id_categoria = req.params.id_categoria;

    if (!id_categoria) {
        return res.status(400).json({
            status: "error",
            mensaje: "El id de la categoria es obligatorio"
        });
    }

    const sql = 
    "SELECT producto.* FROM producto JOIN tipo_producto ON producto.id_tipo_producto = tipo_producto.id WHERE tipo_producto.id_categoria = ? ";

    conexion.query(sql, [id_categoria], function (error, results) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: "Error al obtener los productos" });
        }

        if (results.length === 0) {
            return res.status(404).json({
                status: "error",
                mensaje: "No se encontraron productos para la categoría seleccionada"
            });
        }

        res.json({
            status: "ok",
            productos: results
        });
    });
});

router.get("/ver/producto/tipo_producto/:id_tipo_producto", function (req, res) {
    const id_tipo_producto = req.params.id_tipo_producto;

    if (!id_tipo_producto) {
        return res.status(400).json({
            status: "error",
            mensaje: "El id del tipo de producto es obligatorio"
        });
    }

    const sql = "SELECT * FROM producto WHERE id_tipo_producto = ?";

    conexion.query(sql, [id_tipo_producto], function (error, results) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: "Error al obtener los productos" });
        }

        if (results.length === 0) {
            return res.status(404).json({
                status: "error",
                mensaje: "No se encontraron productos para el tipo de producto seleccionado"
            });
        }

        res.json({
            status: "ok",
            productos: results
        });
    });
});

router.get('/ver/marca/:id?', function(req, res, next){
    const id = req.params.id;
    const sql = id? "SELECT * FROM marca WHERE id=?": "SELECT * FROM marca";
    conexion.query(sql, id? [id]: [], function(error, result){
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

router.get("/ver/tipo_producto/:id", function(req, res, next){
    const id =req.params.id
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

router.get("/ver/categoria/:id?", function(req, res, next) {
    const id =req.params.id
    const sql = 
        id? "SELECT * FROM categoria WHERE id=?":"SELECT * FROM categoria";

    conexion.query(sql, id ? [id] : [], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        
        res.json({
            status: "ok",
            categorias: result
        });
    });
});

module.exports=router;