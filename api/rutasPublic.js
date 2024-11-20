const router = require('express').Router();
const { conexion } = require('../db/conexion');


router.get("/ver/producto/:id?", function(req, res, next) {
    const id = req.params.id;
    const { pagina = 1, limite = 10 } = req.query;
    const offset = (pagina - 1) * limite;
    const baseUrl = req.protocol + '://' + req.get('host') + '/';

    let sql;
    let queryParams = [];

    if (id) {
        sql = `
            SELECT *
            FROM producto
            WHERE producto.id = ?`;
        queryParams = [id];
    } else {
        sql = `
            SELECT producto.*
            FROM producto
            LIMIT ? OFFSET ?`;
        queryParams = [parseInt(limite), offset];
    }

    conexion.query(sql, queryParams, function(error, results) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

        if (id) {
            if (results.length === 0) {
                return res.status(404).json({ error: "Producto no encontrado" });
            }

            const producto = results[0];
            producto.ruta_imagen = baseUrl + producto.ruta_imagen.replace(/\\/g, '/');

            console.log('Ruta de imagen:', producto.ruta_imagen);

            res.json({
                status: "ok",
                producto: producto,
            });
        } else {
            results.forEach(producto => {
                if (producto.ruta_imagen) {
                    producto.ruta_imagen = baseUrl + producto.ruta_imagen.replace(/\\/g, '/');
                }
            });

            console.log('Rutas de imágenes:', results.map(p => p.ruta_imagen));

            res.json({
                status: "ok",
                productos: results,
            });
        }
    });
});



router.get("/ver/producto/categoria/:id_categoria", function(req, res) {
    const id_categoria = req.params.id_categoria;
    const { pagina = 1, limite = 10 } = req.query;
    const offset = (pagina - 1) * limite;
    const baseUrl = req.protocol + '://' + req.get('host') + '/';

    if (!id_categoria) {
        return res.status(400).json({
            status: "error",
            mensaje: "El id de la categoría es obligatorio"
        });
    }

    const sql = `
        SELECT producto.*
        FROM producto
        JOIN tipo_producto ON producto.id_tipo_producto = tipo_producto.id
        WHERE tipo_producto.id_categoria = ?
        LIMIT ? OFFSET ?
    `;

    conexion.query(sql, [id_categoria, parseInt(limite), offset], function(error, results) {
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

        // Actualiza las rutas de las imágenes para cada producto
        results.forEach(producto => {
            if (producto.ruta_imagen) {
                producto.ruta_imagen = baseUrl + producto.ruta_imagen.replace(/\\/g, '/');
            }
        });

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

router.get('/ver/talle/:id?', function(req, res, next) {
    const id = req.params.id;
    const sql = id ? "SELECT * FROM talle WHERE id=?" : "SELECT * FROM talle";

    conexion.query(sql, id ? [id] : [], function(error, result) {
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

router.get("/ver/tipo_producto/:id", function(req, res, next) {
    const id = req.params.id;
    const sql = "SELECT * FROM tipo_producto WHERE id=?";
    conexion.query(sql, [id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok",
            tipo_producto: result
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