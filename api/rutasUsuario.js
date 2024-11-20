const router = require('express').Router();
const { conexion } = require('../db/conexion');
const rutasPublic = require('./rutasPublic');

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

router.get('/ver/producto_compra/:id?', function(req, res) {
    const { id } = req.params;
    const sql = id ? "SELECT * FROM producto_compra WHERE id=?" : "SELECT * FROM producto_compra";

    conexion.query(sql, id ? [id] : [], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error en la consulta' });
        }

        res.json({
            status: "ok",
            producto_compra: result
        });
    });
});

router.get('/ver/perfil/:id', function(req, res) {
    const id = req.params.id;
    const sql = "SELECT nombre_completo, mail, fecha_nac, nombre_usuario, telefono FROM usuario WHERE id = ?";
    
    conexion.query(sql, [id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error en la consulta' });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json({
            status: 'ok',
            usuario: result[0]
        });
    });
});

router.get('/ver/envio/:id?', function(req, res) {
    const id = req.params.id;
    const sql = id ? "SELECT * FROM envio WHERE id=?" : "SELECT * FROM envio";

    conexion.query(sql, id ? [id] : [], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

        res.json({
            status: "ok",
            envio: result.length > 0 ? result[0] : null
        });
    });
});

router.get('/ver/compra/:id?', function(req, res, next) {
    const id = req.params.id;
    const sql = id ? "SELECT * FROM compra WHERE id=?" : "SELECT * FROM compra";

    conexion.query(sql, id ? [id] : [], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

        res.json({
            status: "ok",
            compra: result
        });
    });
});

// Ruta para agregar productos al carrito
router.post('/carrito', function(req, res, next) {
    const { usuario_id, producto_id, cantidad } = req.body;
    const sql = "INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)";

    conexion.query(sql, [usuario_id, producto_id, cantidad], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok",
            carrito: result.insertId
        });
    });
});

// Ruta para finalizar la compra
router.post('/ventas', function(req, res, next) {
    const { productos, idUsuario, fecha } = req.body;
    let sql = "INSERT INTO compra (id_usuario, fecha) VALUES (?, ?)";
    
    conexion.query(sql, [idUsuario, fecha], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        const idCompra = result.insertId;
        sql = "INSERT INTO producto_compra (id_compra, id_producto, cantidad, precio_unitario) VALUES ?";
        const valores = productos.map(prod => [idCompra, prod.id, prod.unidades, prod.precio_unitario]);

        conexion.query(sql, [valores], function(error) {
            if (error) {
                console.error(error);
                return res.status(500).send(error);
            }
            res.json({
                status: "ok",
                compra: idCompra
            });
        });
    });
});

module.exports = router;
