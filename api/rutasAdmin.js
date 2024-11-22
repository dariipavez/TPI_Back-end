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
    const sql = "SELECT id, nombre_completo, mail, fecha_nac, nombre_usuario, telefono FROM usuario";
    
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
    const { nombre, precio, stock, id_tipo_producto, id_marca, talles } = req.body;
    const imagen = req.file;
    const tallesArray = JSON.parse(talles);

    if (!imagen) {
        return res.status(400).send({ error: 'Debe incluir una imagen para el producto' });
    }

    const rutaImagen = path.join('uploads', imagen.filename).replace(/\\/g, '/');
    
    let sql_insert_producto = '';
    let values = [];

    tallesArray.forEach(talle => {
        sql_insert_producto += "INSERT INTO producto (nombre, precio, stock, id_tipo_producto, id_marca, id_talle, ruta_imagen) VALUES (?, ?, ?, ?, ?, ?, ?); ";
        values.push(nombre.toLowerCase(), precio, stock, id_tipo_producto, id_marca, talle, rutaImagen);
    });

    conexion.query(sql_insert_producto, values, function(error, resultProducto) {
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
            mensaje: "Producto insertado correctamente con imagen y talles"
        });
    });
});

router.put('/actualizar/producto/:id', function (req, res) {
    const { id } = req.params;
    const { nombre, precio, stock, id_tipo_producto, id_marca } = req.body;

    
    let sql_update_producto = `
      UPDATE producto 
      SET nombre = ?, precio = ?, stock = ?, id_tipo_producto = ?, id_marca = ? 
      WHERE id = ?;
    `;
    let values = [nombre.toLowerCase(), precio, stock, id_tipo_producto, id_marca, id];

    conexion.query(sql_update_producto, values, function(error, resultProducto) {
        if (error) {
            console.error('Error al actualizar el producto:', error);
            return res.status(500).send({ error: 'Error al actualizar el producto' });
        }

        res.json({
            status: "ok",
            mensaje: "Producto actualizado correctamente",
            producto:resultProducto
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

    router.put('/actualizar/producto/talle/:id', function(req, res) {
        const idProducto = req.params.id;
        const { id_talle } = req.body;
      
        const sql = `
          INSERT INTO producto_talle (id_producto, id_talle)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE id_producto = id_producto;
        `;
      
        conexion.query(sql, [idProducto, id_talle], function(error, result) {
          if (error) {
            console.error(error);
            return res.status(500).send(error);
          }
          res.json({ status: "ok", message: "Talle actualizado correctamente" });
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
    
    router.put('/actualizar/metodo_pago/:id', function(req, res, next) {
        const id = req.params.id;
        const { tipo_pago } = req.body;
    
        if (!id || !tipo_pago) {
            return res.status(400).json({ error: 'ID y tipo_pago son requeridos' });
        }
    
        const sql = "UPDATE metodo_pago SET tipo_pago=? WHERE id=?";
    
        conexion.query(sql, [tipo_pago, id], function(error, result) {
            if (error) {
                console.error(error);
                return res.status(500).send(error);
            }
            res.json({
                status: "ok"
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

    router.delete('/eliminar/producto/:id', function(req, res) {
        const {id} = req.params;
        const sql = "DELETE FROM producto WHERE id = ?";
        
        conexion.query(sql, [id], function(error) {
            if (error) {
                console.error(error);
                return res.status(500).send("Ocurrió un error");
            }
            res.json({status: "ok"});
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

    router.delete('/eliminar/metodo_pago/:id', function(req, res, next) {
        const id = req.params.id;
        const sql = "DELETE FROM metodo_pago WHERE id=?";
    
        conexion.query(sql, [id], function(error, result) {
            if (error) {
                console.error(error);
                return res.status(500).send(error);
            }
            res.json({
                status: "ok",
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


module.exports=router;