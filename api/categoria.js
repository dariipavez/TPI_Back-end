const router=require('express').Router()

const {conexion}=require('../db/conexion')


function actualizarCategoria(id, campos, res) {
    const sql_actualizar_categoria = 'UPDATE categoria SET ? WHERE id = ?';
    conexion.query(sql_actualizar_categoria, [campos, id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al actualizar la categoria' });
        }

        if (result.filasAfectadas === 0) {
            return res.status(404).json({ error: 'No se encontró la categoria para actualizar' });
        }

        res.json({ status: 'ok', Mensaje: 'Categoria actualizada correctamente' });
    });
}



router.post('/', function(req, res, next) {
    const { nombre, id_tipo_producto } = req.body;

    const sql_verificar_categoria = 
    "SELECT categoria.id, tipo_producto.id FROM categoria INNER JOIN tipo_producto ON tipo_producto.id = categoria.id_tipo_producto WHERE categoria.nombre = ? AND tipo_producto.id = ?";

    conexion.query(sql_verificar_categoria, [nombre, id_tipo_producto], function(error, resultExiste) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

        if (resultExiste.length > 0) {
            return res.status(409).json({ status: "error", mensaje: "La categoría para el tipo de producto ya está registrada" });
        }

        const sql_insert_categoria = "INSERT INTO categoria (nombre, id_tipo_producto) VALUES (?, ?)";

        conexion.query(sql_insert_categoria, [nombre, id_tipo_producto], function(error, resultCategoria) {
            if (error) {
                console.error(error);
                return res.status(500).send(error);
            }

            res.json({
                status: "ok",
                categoria_id: resultCategoria.insertId,
                id_tipo_producto: id_tipo_producto
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
    const { id_tipo_producto, ...campos } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Se necesita el id de la categoría' });
    }

    const sql_verificar_categoria = 'SELECT * FROM categoria WHERE id = ?';
    conexion.query(sql_verificar_categoria, [id], function(error, results) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al verificar la categoría' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        if (id_tipo_producto) {
            const sql_verificar_tipo_producto = 'SELECT * FROM tipo_producto WHERE id = ?';
            conexion.query(sql_verificar_tipo_producto, [id_tipo_producto], function(error, tipoProductoResult) {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Error al verificar el tipo de producto' });
                }

                if (tipoProductoResult.length === 0) {
                    return res.status(404).json({ error: 'Tipo de producto no encontrado' });
                }


                campos.id_tipo_producto = id_tipo_producto;

                actualizarCategoria(id, campos, res);
            });
        } else {
            actualizarCategoria(id, campos, res);
        }
    });
});

router.delete('/', function(req, res, next){
    const {id}=req.query;
    const sql="DELETE FROM categoria WHERE id=?"
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

//ruta tipo_producto
router.post('/tipo_producto', function(req, res, next) {
    const { nombre } = req.body;

    const sql_verificar = "SELECT id FROM tipo_producto WHERE nombre = ?";
    conexion.query(sql_verificar, [nombre], function(error, results) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

        if (results.length > 0) {
            return res.status(400).json({
                status: "error",
                mensaje: "El tipo de producto ya existe"
            });
        }

        const sql_insertar = "INSERT INTO tipo_producto (nombre) VALUES (?)";
        conexion.query(sql_insertar, [nombre], function(error, result) {
            if (error) {
                console.error(error);
                return res.status(500).send(error);
            }
            res.json({
                status: "ok",
                mensaje: "Tipo de producto registrado correctamente",
                id: result.insertId
            });
        });
    });
});


router.get("/tipo_producto", function(req, res, next){
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

router.put('/tipo_producto', function(req, res) {
    const { id } = req.query;
    const campos = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Se necesita el id del tipo de producto' });
    }

    const sql_verificar_tipo_producto = 'SELECT * FROM tipo_producto WHERE id = ?';
    conexion.query(sql_verificar_tipo_producto, [id], function(error, results) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al verificar el tipo de producto' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Tipo de producto no encontrado' });
        }

        if (campos.nombre) {
            const sql = 'UPDATE tipo_producto SET nombre = ? WHERE id = ?';
            conexion.query(sql, [campos.nombre, id], function(error) {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: error.message });
                }
                res.json({ status: "ok", mensaje: "Tipo de producto actualizado correctamente" });
            });
        } else {
            res.status(400).json({ error: 'No se especificó el nombre para actualizar' });
        }
    });
});



router.delete('/', function(req, res, next) {
    const { id } = req.query;

    const sql_eliminar_productos_compra = "DELETE FROM productos_compra WHERE id_producto = ?";
    conexion.query(sql_eliminar_productos_compra, [id], function(error) {
        if (error) {
            console.error(error);
            return res.status(500).send("Ocurrió un error al eliminar los registros en productos_compra");
        }

        const sql_eliminar_producto = "DELETE FROM productos WHERE id = ?";
        conexion.query(sql_eliminar_producto, [id], function(error) {
            if (error) {
                console.error(error);
                return res.status(500).send("Ocurrió un error al eliminar el producto");
            }

            res.json({
                status: "ok",
                message: "El producto y sus registros en productos_compra fueron eliminados correctamente"
            });
        });
    });
});


module.exports = router;