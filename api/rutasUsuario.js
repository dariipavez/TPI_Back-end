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

router.post('/registrar/envio', (req, res) => {
    const { id_usuario, codigo_postal, calle, numero, ciudad, informacion_adicional } = req.body;

    if (!id_usuario || !codigo_postal || !calle || !numero || !ciudad) {
        return res.status(400).json({ error: 'Todos los campos son requeridos, excepto la información adicional' });
    }

    const sql_insert_envio = `
        INSERT INTO envio (id_usuario, codigo_postal, calle, numero, ciudad, informacion_adicional) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    conexion.query(sql_insert_envio, [id_usuario, codigo_postal, calle, numero, ciudad, informacion_adicional], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al crear el envío' });
        }

        res.json({
            status: "ok",
            id_envio: result.insertId
        });
    });
});

router.post('/registrar/producto_compra', function(req, res) {
    const { id_producto, id_compra, cantidad, precio_unitario } = req.body;

    if (!id_producto || !id_compra || !cantidad || !precio_unitario) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const sql_insert_producto_compra = `
        INSERT INTO producto_compra (id_producto, id_compra, cantidad, precio_unitario) 
        VALUES (?, ?, ?, ?)
    `;

    conexion.query(sql_insert_producto_compra, [id_producto, id_compra, cantidad, precio_unitario], function(error, result) {
        if (error) {
            console.error('Error al insertar el registro en producto_compra:', error.code, error.sqlMessage);
            return res.status(500).send({ error: 'Error al insertar el registro de producto_compra: ' + error.sqlMessage });
        }

        const sql_update_stock = `
            UPDATE producto 
            SET stock = stock - ? 
            WHERE id = ?
        `;

        conexion.query(sql_update_stock, [cantidad, id_producto], function(error, updateResult) {
            if (error) {
                console.error('Error al actualizar el stock:', error.code, error.sqlMessage);
                return res.status(500).send({ error: 'Error al actualizar el stock del producto' });
            }

            res.json({
                status: 'ok',
                id: result.insertId,
                mensaje: 'Producto agregado a la compra y stock actualizado correctamente'
            });
        });
    });
});

router.post('/registrar/compra', function(req, res, next) {
    const {precio_total, id_envio } = req.body;


        const sql_insert_compra = "INSERT INTO compra (precio_total, id_envio) VALUES ( ?, ?)";

        conexion.query(sql_insert_compra, [precio_total, id_envio], function(error, resultInsert) {
            if (error) {
                console.error(error);
                return res.status(500).send("Ocurrió un error al insertar el registro de compra");
            }

            res.json({
                status: "ok",
                compra_id: resultInsert.insertId
            });
        });
    });

module.exports = router;
