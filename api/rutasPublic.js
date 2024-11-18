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

router.get("/ver/producto/:id?", function(req, res, next) {
    const id = req.params.id;
    const { pagina = 1, limite = 10 } = req.query;
    const offset = (pagina - 1) * limite;

    let sql;
    let queryParams = [];

    if (id) {
        sql = `
            SELECT producto.*, producto_imagen.ruta_imagen
            FROM producto
            LEFT JOIN producto_imagen ON producto.id = producto_imagen.id_producto
            WHERE producto.id = ?
            LIMIT 1`;
        queryParams = [id];
    } else {
        sql = `
            SELECT producto.*, MIN(producto_imagen.ruta_imagen) AS ruta_imagen
            FROM producto
            LEFT JOIN producto_imagen ON producto.id = producto_imagen.id_producto
            GROUP BY producto.id
            LIMIT ? OFFSET ?`;
        queryParams = [parseInt(limite), offset];
    }

    conexion.query(sql, queryParams, function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

        if (id) {
            res.json({
                status: "ok",
                producto: result[0],  // Aseguramos que solo se envíe un producto
            });
        } else {
            res.json({
                status: "ok",
                productos: result,
            });
        }
    });
});




router.get("/ver/producto/buscar", function(req, res, next){
    const { nombre, pagina = 1, limite = 10 } = req.query;
    const offset = (pagina - 1) * limite;

    if (!nombre) {
        return res.status(400).json({
            status: "error",
            mensaje: "El nombre del producto es obligatorio"
        });
    }

    const sql = "SELECT * FROM producto WHERE nombre LIKE ? LIMIT ? OFFSET ?";
    const paramsQuery = [`%${nombre}%`, parseInt(limite), offset];

    conexion.query(sql, paramsQuery, function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

        if (result.length === 0) {
            return res.status(404).json({
                status: "error",
                mensaje: "No se encontraron productos con ese nombre"
            });
        }

        res.json({
            status: "ok",
            productos: result
        });
    });
});



router.get("/ver/producto/categoria/:id_categoria", function (req, res) {
    const id_categoria = req.params.id_categoria;
    const { pagina = 1, limite = 10 } = req.query;
    const offset = (pagina - 1) * limite;

    if (!id_categoria) {
        return res.status(400).json({
            status: "error",
            mensaje: "El id de la categoria es obligatorio"
        });
    }

    const sql = `
        SELECT producto.* 
        FROM producto 
        JOIN tipo_producto ON producto.id_tipo_producto = tipo_producto.id 
        WHERE tipo_producto.id_categoria = ? 
        LIMIT ? OFFSET ?
    `;

    conexion.query(sql, [id_categoria, parseInt(limite), offset], function (error, results) {
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
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!id_tipo_producto) {
        return res.status(400).json({
            status: "error",
            mensaje: "El id del tipo de producto es obligatorio"
        });
    }

    const sql = "SELECT * FROM producto WHERE id_tipo_producto = ? LIMIT ? OFFSET ?";

    conexion.query(sql, [id_tipo_producto, parseInt(limit), offset], function (error, results) {
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