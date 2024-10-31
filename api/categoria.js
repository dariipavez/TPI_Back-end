const router=require('express').Router()

const {conexion}=require('../db/conexion')

router.post('/', function(req, res, next) {
    const { nombre, nombre_tipo_producto } = req.body;

    const sql_obtener_tipo_producto_id = "SELECT id FROM tipo_producto WHERE nombre = ?";

    conexion.query(sql_obtener_tipo_producto_id, [nombre_tipo_producto], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

        if (result.length === 0) {
            return res.status(404).json({ status: "error", mensaje: "Tipo de producto no encontrado" });
        }

        const tipo_producto_id = result[0].id;

        const sql_verificar_categoria = "SELECT id FROM categoria WHERE nombre = ? AND id_tipo_producto = ?";
        
        conexion.query(sql_verificar_categoria, [nombre, tipo_producto_id], function(error, resultExiste) {
            if (error) {
                console.error(error);
                return res.status(500).send(error);
            }

            if (resultExiste.length > 0) {
                return res.status(409).json({ status: "error", mensaje: "El tipo de producto ya está registrado" });
            }

            const sql_insert_categoria = "INSERT INTO categoria (nombre, id_tipo_producto) VALUES (?, ?)";

            conexion.query(sql_insert_categoria, [nombre, tipo_producto_id], function(error, resultCategoria) {
                if (error) {
                    console.error(error);
                    return res.status(500).send(error);
                }

                res.json({
                    status: "ok",
                    categoria_id: resultCategoria.insertId,
                    tipo_producto_id: tipo_producto_id
                });
            });
        });
    });
});



router.get("/", function(req, res, next) {
    const { id } = req.query;
    const sql = 
        "SELECT categoria.*, tipo_producto.nombre AS nombre_tipo_producto FROM categoria JOIN tipo_producto ON categoria.id_tipo_producto = tipo_producto.id WHERE categoria.id = ?";

    conexion.query(sql, [id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        
        res.json({
            status: "ok",
            categoria: result
        });
    });
});

router.put('/', function(req, res) {
    const { id } = req.query;
    const campos = req.body;

    if (!id) {
        return res.status(400).json({ error: 'se necesita el id de la categoria' });
    }

    let sql = 'UPDATE categoria SET ';
    const valores = [];

    for (let campo in campos) {
        sql += `${campo} = ?, `;
        valores.push(campos[campo]);
    }

    sql = sql.slice(0, -2) + ' WHERE id = ?';
    valores.push(id);
    conexion.query(sql, valores, function(error) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        }
        res.json({ status: "ok", Mensaje: "Categoria actualizada correctamente" });
    });
});

module.exports = router;