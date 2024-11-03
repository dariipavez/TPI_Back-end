const router=require('express').Router()

const {conexion}=require('../db/conexion')


function actualizarCategoria(id, campos, res) {
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
        res.json({ status: "ok", mensaje: "Categoría actualizada correctamente" });
    });
}




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

        if (campos.id_tipo_producto) {
            const sql_verificar_producto = 'SELECT * FROM tipo_producto WHERE id = ?';
            conexion.query(sql_verificar_producto, [campos.id_tipo_producto], function(error, productoResult) {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Error al verificar el tipo de producto' });
                }

                if (productoResult.length === 0) {
                    return res.status(404).json({ error: 'Tipo de producto no encontrado' });
                }

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
router.post('/tipo_producto', function(req, res, next){
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

    // Primero, verifica si el tipo de producto existe
    const sqlCheck = 'SELECT * FROM tipo_producto WHERE id = ?';
    conexion.query(sqlCheck, [id], function(error, results) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al verificar el tipo de producto' });
        }

        // Si no se encuentra el producto, envía un mensaje de error
        if (results.length === 0) {
            return res.status(404).json({ error: 'Tipo de producto no encontrado' });
        }

        // Si el tipo de producto existe, procede con la actualización
        let sql = 'UPDATE tipo_producto SET ';
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
            res.json({ status: "ok", mensaje: "Tipo de producto actualizado correctamente" });
        });
    });
});


router.delete('/tipo_producto', function(req, res, next){
    const {id}=req.query;
    const sql="DELETE FROM tipo_producto WHERE id=?"
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
module.exports = router;