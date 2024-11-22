const router = require('express').Router();
const { conexion } = require('../db/conexion');


router.get("/ver/producto/:id?", function(req, res, next) {
    const id = req.params.id;
    const baseUrl = req.protocol + '://' + req.get('host') + '/';

    let sql;
    let queryParams = [];

    if (id) {
        sql = `
            SELECT producto.*, producto.stock
            FROM producto
            WHERE producto.id = ?`;
        queryParams = [id];
    } else {
        sql = `
            SELECT producto.*, producto.stock
            FROM producto`;
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
                producto.nombre = producto.nombre.toUpperCase();
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

router.get('/ver/producto/nombre', function (req, res) {
    const sql_obtener_productos = `
        SELECT 
            p.id,
            p.nombre, 
            p.precio, 
            p.stock, 
            tp.nombre AS tipo_producto, 
            m.nombre AS marca, 
            t.talle, 
            p.ruta_imagen
        FROM 
            producto p
        JOIN 
            tipo_producto tp ON p.id_tipo_producto = tp.id
        JOIN 
            marca m ON p.id_marca = m.id
        JOIN 
            talle t ON p.id_talle = t.id`;

    conexion.query(sql_obtener_productos, function (error, resultados) {
        if (error) {
            console.error('Error al obtener los productos:', error);
            return res.status(500).send({ error: 'Error al obtener los productos' });
        }

        resultados.forEach(producto => {
            if (producto.ruta_imagen) {
                const baseUrl = req.protocol + '://' + req.get('host') + '/';
                producto.ruta_imagen = baseUrl + producto.ruta_imagen.replace(/\\/g, '/');
            }
        });

        res.json({
            status: "ok",
            productos: resultados
        });
    });
});






router.get("/ver/producto/categoria/:id_categoria", function(req, res) {
    const id_categoria = req.params.id_categoria;
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
    `;

    conexion.query(sql, [id_categoria], function(error, results) {
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
        results.forEach(producto => {
            producto.nombre = producto.nombre.toUpperCase();
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




router.get('/ver/marca/:id?', function(req, res, next) {
    const id = req.params.id;
    const sql = id ? "SELECT id, UPPER(nombre) AS nombre FROM marca WHERE id=?" : "SELECT id, UPPER(nombre) AS nombre FROM marca ORDER BY nombre ASC";
    
    conexion.query(sql, id ? [id] : [], function(error, result) {
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
router.get("/ver/tipo_producto", function(req, res, next) {
    const sql = "SELECT * FROM tipo_producto";
    conexion.query(sql, function(error, result) {
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
router.get('/ver/talle/tipo_producto/:id_tipo_producto', function(req, res, next) {
    const idTipoProducto = req.params.id_tipo_producto;
    const sql = `
        SELECT talle.id, UPPER(talle.talle) as talle
        FROM talle
        JOIN tipo_producto ON talle.id_tipo_producto = tipo_producto.id 
        WHERE tipo_producto.id = ?
        ORDER BY 
            CASE 
                WHEN tipo_producto.nombre IN ('zapatillas') THEN FIELD(talle.talle, '34', '35', '36', '37', '38', '39', '40', '41', '42', '43')
                WHEN tipo_producto.nombre IN ('pantalones') THEN FIELD(talle.talle, '36', '38', '40', '42', '44', '46', '48')
                WHEN tipo_producto.nombre IN ('buzo', 'remera', 'short', 'camiseta') THEN FIELD(talle.talle, 'S', 'M', 'L', 'XL', 'XXL')
                ELSE FIELD(talle.talle, 'S', 'M', 'L', 'XL', 'XXL')
            END`;

    conexion.query(sql, [idTipoProducto], function(error, result) {
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