const router = require('express').Router();
const { conexion } = require('../db/conexion');
const rutasPublic=require('./rutasPublic');
const rutasUsuario=require('./rutasUsuario')
const upload = require('../config/uploadConfig');
const path = require('path');
const fs = require('fs');

router.use(rutasPublic);
router.use(rutasUsuario);

router.get('/ver/usuario', function (req, res) {
    const sql = "SELECT id, nombre_completo, mail, fecha_nac, nombre_usuario telefono FROM usuario";
    
    conexion.query(sql, function (error, results) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error en la consulta' });
        }
        
        res.json({
            status: 'ok',
            usuarios: results
        });
    });
});

router.post('/registrar/producto', upload.single('imagen'), function (req, res) {
    const { nombre, precio, id_tipo_producto, id_marca } = req.body;
    const imagen = req.file;

    if (!imagen) {
        return res.status(400).send({ error: 'Debe incluir una imagen para el producto' });
    }

    const rutaImagen = path.join('uploads', imagen.filename).replace(/\\/g, '/');

    const sql_insert_producto = "INSERT INTO producto (nombre, precio, id_tipo_producto, id_marca, ruta_imagen) VALUES (?, ?, ?, ?, ?)";
    const values = [nombre.toLowerCase(), precio, id_tipo_producto, id_marca, rutaImagen];

    conexion.query(sql_insert_producto, values, function(error, results) {
    if (error) {
        console.error('Error al insertar producto:', error);
        fs.unlink(rutaImagen, (err) => {
        if (err) {
            console.error('Error al eliminar imagen:', err);
        }
    });
    return res.status(500).send({ error: 'Error al registrar el producto' });
    }

    res.json({
        status: "ok",
        mensaje: "Producto insertado correctamente",
        id_producto: results.insertId
        });
    });
});

router.post('/registrar/producto_talle', function (req, res) {
    const { id_producto, talles, stock } = req.body;

    const tallesArray = JSON.parse(talles);
    const stockArray = JSON.parse(stock);

    const sql_insert_producto_talle = "INSERT INTO producto_talle (id_producto, id_talle, stock) VALUES ?";
    const values_producto_talle = tallesArray.map((id_talle, index) => [id_producto, id_talle, stockArray[index]]);

    conexion.query(sql_insert_producto_talle, [values_producto_talle], function(error) {
        if (error) {
            console.error('Error al insertar en producto_talle:', error);
            return res.status(500).send({ error: 'Error al registrar los talles del producto' });
        }

    res.json({
        status: "ok",
        mensaje: "Talles insertados correctamente"
    });
    });
});




router.put('/actualizar/producto/:id', function(req, res) {
    const { id } = req.params;
    const { nombre, precio } = req.body;

    let sql_update_producto = `
        UPDATE producto 
        SET nombre = ?, precio = ? 
        WHERE id = ?;
    `;
    let values_producto = [nombre.toLowerCase(), precio, id];

    conexion.query(sql_update_producto, values_producto, function(error, resultProducto) {
        if (error) {
            console.error('Error al actualizar el producto:', error);
            return res.status(500).send({ error: 'Error al actualizar el producto' });
        }

        res.json({
            status: "ok",
            mensaje: "Producto actualizado correctamente",
            producto: resultProducto
        });
    });
});

router.delete('/eliminar/producto/:id', function(req, res) {
    const { id } = req.params;
    
    const sql_borrar_producto_talle = "DELETE FROM producto_talle WHERE id_producto = ?";
    const sql_borrar_producto = "DELETE FROM producto WHERE id = ?";

    conexion.query(sql_borrar_producto_talle, [id], function(error) {
        if (error) {
            console.error(error);
            return res.status(500).send("Ocurrió un error al eliminar los talles");
        }

        conexion.query(sql_borrar_producto, [id], function(error) {
            if (error) {
                console.error(error);
                return res.status(500).send("Ocurrió un error al eliminar el producto");
            }

            res.json({ status: "ok" });
        });
    });
});


router.post('/registrar/talle', function(req, res, next) {
    const { talle, id_tipo_producto } = req.body;
    const talleMin = talle.toLowerCase();

    const sql = "INSERT INTO talle (talle, id_tipo_producto) VALUES (?, ?)";
    conexion.query(sql, [talleMin, id_tipo_producto], function(error, result) {
    if (error) {
        console.error(error);
        return res.status(500).send("Error en la inserción de datos.");
    }
    res.json({
        status: "ok",
        id: result.insertId
    });
    });
});
router.put('actualizar/talle/:id', function(req, res, next) {
    const { id } = req.params;
    const { talle } = req.body;

    const talleMin=talle.toLowerCase();

    if (!id || !talle) {
        return res.status(400).json({ error: 'ID y talle son requeridos' });
    }

    const sql = "UPDATE talle SET talle=? WHERE id=?";

    conexion.query(sql, [talleMin, id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok"
        });
    });
});

router.delete('/eliminar/talle/:id', function(req, res, next) {
    const { id } = req.params;
    const sql = "DELETE FROM talle WHERE id=?";

    conexion.query(sql, [id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok"
        });
    });
});

    router.post('/registrar/marca', function(req, res, next){
        const { nombre } = req.body;

        const nombreMin=nombre.toLowerCase()
        const sql = "INSERT INTO marca (nombre) VALUES (?)";
    
        conexion.query(sql, [nombreMin], function(error, result){
            if (error) {
                console.error(error);
                return res.status(500).send(error);
            }
            res.json({
                status: "ok",
                id: result.insertId
            });
        });
    });

    router.put('/actualizar/marca/:id', function(req, res, next) {
        const { id } = req.params;
        const { nombre } = req.body;
        
        const nombreMin=nombre.toLowerCase()

        if (!id || !nombre) {
            return res.status(400).json({ error: 'ID y nombre son requeridos' });
        }
    
        const sql = "UPDATE marca SET nombre=? WHERE id=?";
        
        conexion.query(sql, [nombreMin, id], function(error, result) {
            if (error) {
                console.error(error);
                return res.status(500).send(error);
            }
            res.json({
                status: "ok",
            });
        });
    });

    router.delete('/eliminar/marca/:id', function(req, res, next) {
        const { id } = req.params;
        const sql = "DELETE FROM marca WHERE id=?";
    
        conexion.query(sql, [id], function(error, result) {
            if (error) {
                console.error(error);
                return res.status(500).send(error);
            }
            res.json({
                status: "ok"
            });
        });
    });

    router.post('/registrar/tipo_producto', function(req, res, next) {
        const { nombre, id_categoria } = req.body;
        const nombreMinuscula = nombre.toLowerCase();
    
            const sql = "INSERT INTO tipo_producto (nombre, id_categoria) VALUES (?,?)";
            conexion.query(sql, [nombreMinuscula, id_categoria], function(error, result) {
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
        
        router.put('/actualizar/tipo_producto/:id', function(req, res, next){
            const { id }=req.params;
            const { nombre, id_categoria}= req.body;
        
        
            const nombreMinuscula = nombre.toLowerCase();
            const sql="UPDATE tipo_producto SET nombre=?, id_categoria=? WHERE id=?"
            conexion.query(sql, [nombreMinuscula,id_categoria, id], function(error){
                if(error){
                    console.error(error);
                    return res.status(500).send(error);
                }
                res.json({
                    status:"ok"
                });
            });
        });
        router.delete('/eliminar/tipo_producto/:id', function(req, res, next) {
            const { id } = req.params;
        
                const sql = "DELETE FROM tipo_producto WHERE id = ?";
                conexion.query(sql, [id], function(error) {
                    if (error) {
                        console.error(error);
                        return res.status(500).send("Ocurrió un error al eliminar el producto");
                    }
        
                    res.json({
                        status: "ok",
                        message: "El producto y sus registros fueron eliminados correctamente"
                    });
                });
            });
        
        
        router.put('/actualizar/producto_compra/:id', function(req, res) {
            const { id_producto, id_compra, cantidad, precio_unitario } = req.body;
            const { id } = req.params;
            
            if (!id || !id_producto || !id_compra || !cantidad || !precio_unitario) {
                return res.status(400).json({ error: 'Todos los campos son requeridos' });
            }
            
            const sql = `
            UPDATE producto_compra 
            SET id_producto = ?, id_compra = ?, cantidad = ?, precio_unitario = ? 
            WHERE id = ?
            `;
            
            conexion.query(sql, [id_producto, id_compra, cantidad, precio_unitario, id], function(error, result) {
                if (error) {
                    console.error(error);
                    return res.status(500).send(error);
                }
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        status: "error",
                        mensaje: "Producto compra no encontrado o no actualizado"
                    });
                }
                
                res.json({
                    status: 'ok',
                    mensaje: 'Producto compra actualizado correctamente',
                    affectedRows: result.affectedRows
                });
            });
        });        
        router.delete('/eliminar/producto_compra/:id', function(req, res) {
            const { id } = req.params;
            
            const sql_get_cantidad = `
                SELECT cantidad, id_producto 
                FROM producto_compra 
                WHERE id = ?
            `;
            
            conexion.query(sql_get_cantidad, [id], function(error, results) {
                if (error) {
                    console.error(error);
                    return res.status(500).send('Error al obtener la cantidad del producto');
                }
        
                if (results.length === 0) {
                    return res.status(404).send('Producto no encontrado en la compra');
                }
        
                const cantidad = results[0].cantidad;
                const idProducto = results[0].id_producto;
        
                const sql_delete = `
                    DELETE FROM producto_compra 
                    WHERE id = ?
                `;
                
                conexion.query(sql_delete, [id], function(error) {
                    if (error) {
                        console.error(error);
                        return res.status(500).send('Error al eliminar la relación');
                    }
        
                    const sql_actualizar_stock = `
                        UPDATE producto 
                        SET stock = stock + ? 
                        WHERE id = ?
                    `;
                    
                    conexion.query(sql_actualizar_stock, [cantidad, idProducto], function(error) {
                        if (error) {
                            console.error(error);
                            return res.status(500).send('Error al actualizar el stock');
                        }
        
                        res.json({
                            status: 'ok',
                            mensaje: 'Eliminado correctamente y stock actualizado'
                        });
                    });
                });
            });
        });
        router.put('/actualizar/envio/:id', function(req, res, next) {
            const { id } = req.params;
            const { id_usuario, codigo_postal, calle, numero, ciudad, informacion_adicional } = req.body;
        
            if (!id || !id_usuario || !codigo_postal || !calle || !numero || !ciudad) {
                return res.status(400).json({ error: 'Todos los campos son requeridos excepto información adicional' });
            }
        
            const sql = `
            UPDATE envio 
            SET id_usuario = ?, codigo_postal = ?, calle = ?, numero = ?, ciudad = ?, informacion_adicional = ?
            WHERE id = ?
            `;
            
            conexion.query(sql, [id_usuario, codigo_postal, calle, numero, ciudad, informacion_adicional, id], function(error, result) {
                if (error) {
                    console.error(error);
                    return res.status(500).send(error);
                }
                
                res.json({
                    status: "ok",
                    mensaje: "Envío actualizado correctamente",
                    affectedRows: result.affectedRows
                });
            });
        });
        router.delete('/eliminar/envio/:id', function(req, res, next) {
            const { id } = req.params;
        
            if (!id) {
                return res.status(400).json({ error: 'El id del envío es requerido' });
            }
        
            const sql = "DELETE FROM envio WHERE id = ?";
        
            conexion.query(sql, [id], function(error, result) {
                if (error) {
                    console.error(error);
                    return res.status(500).send('Error al eliminar el envío');
                }
        
                res.json({
                    status: "ok",
                    mensaje: "Envío eliminado correctamente",
                    affectedRows: result.affectedRows
                });
            });
        });

    router.put('/actualizar/categoria/:id', function(req, res, next){
        const { id }=req.params;
        const { nombre}= req.body;
    
    
        const nombreMinuscula = nombre.toLowerCase();
        const sql="UPDATE categoria SET nombre=? WHERE id=?"
        conexion.query(sql, [nombreMinuscula, id], function(error){
            if(error){
                console.error(error);
                return res.status(500).send(error);
            }
            res.json({
                status:"ok",
                categoria:id
            });
        });
    });


    router.delete('/eliminar/categoria/:id', function(req, res, next){
        const {id}=req.params;
        const sql="DELETE FROM categoria WHERE id=?"
            conexion.query(sql,[id],function(error){
                if(error){
                    console.error(error);
                    return res.status(500).send("ocurrió un error");
                }
                res.json({
                    status:"ok",
                    message: "La categoria fue eliminada correctamente"
                });
            });
        });
    
        

        router.put('/actualizar/compra/:id', function(req, res) {
            const { id } = req.params;
            const { id_metodo_pago, precio_total, id_envio } = req.body;
            
            
            const sql_update_compra = `
                UPDATE compra 
                SET id_metodo_pago = ?, precio_total = ?, id_envio = ? 
                WHERE id = ?
            `;
        
            conexion.query(sql_update_compra, [id_metodo_pago, precio_total, id_envio, id], function(error, result) {
                if (error) {
                    console.error("Error al ejecutar la consulta:", error.sqlMessage);
                    return res.status(500).send("Error al actualizar la compra");
                }
        
                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        status: "error",
                        mensaje: "Compra no encontrada o no actualizada"
                    });
                }
        
                res.json({
                    status: "ok",
                    mensaje: "Compra actualizada correctamente"
                });
            });
        });
        router.put('/actualizar/stock/:id_talle', function(req, res) {
            const { id_talle } = req.params;
            const { stock } = req.body;
          
            if (typeof stock !== 'number' || stock < 0) {
              return res.status(400).json({ error: 'El stock debe ser un número válido y no negativo.' });
            }
          
            const sql_update_stock = 'UPDATE producto_talle SET stock = ? WHERE id_talle = ?';
          
            conexion.query(sql_update_stock, [stock, id_talle], function(error, results) {
              if (error) {
                console.error('Error al actualizar el stock:', error);
                return res.status(500).send({ error: 'Error al actualizar el stock del producto' });
              }
          
              if (results.affectedRows === 0) {
                return res.status(404).send({ error: 'Talle no encontrado' });
              }
          
              res.json({
                status: 'ok',
                mensaje: 'Stock actualizado correctamente'
              });
            });
          });
          

module.exports=router;