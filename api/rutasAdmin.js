const router = require('express').Router();
const { conexion } = require('../db/conexion');
const rutasPublic=require('./rutasPublic');
const rutasUsuario=require('./rutasUsuario')

const multer = require('multer');
const path = require('path');
const fs = require('fs');

function actualizarImagenes(idProducto, imagenes, res) {
    const sqlEliminarImagenes = `DELETE FROM producto_imagenes WHERE id_producto = ?`;
    conexion.query(sqlEliminarImagenes, [idProducto], function(error) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al eliminar las imágenes anteriores' });
        }
        const sqlInsertarImagen = `INSERT INTO producto_imagenes (id_producto, ruta) VALUES ?`;
        const valoresImagenes = imagenes.map((imagen) => [idProducto, imagen.path]);

        conexion.query(sqlInsertarImagen, [valoresImagenes], function(error) {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error al insertar las nuevas imágenes' });
            }

            res.json({
                status: 'ok',
                mensaje: 'Producto y sus imágenes actualizados correctamente',
                producto_id: idProducto
            });
        });
    });
}

const tempUploadsPath = path.join(__dirname, '/temp_uploads');
const uploadsPath = path.join(__dirname, '/uploads');

if (!fs.existsSync(tempUploadsPath)) {
    fs.mkdirSync(tempUploadsPath, { recursive: true });
}
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempUploadsPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

function limpiarArchivosTemporales(files) {
    files.forEach(file => {
        if (fs.existsSync(file.path)) {
            fs.unlink(file.path, (error) => {
                if (error) console.error(`Error al eliminar el archivo temporal ${file.path}:`, error);
            });
        } else {
            console.log(`El archivo temporal ${file.path} ya no existe.`);
        }
    });
}

function saveImage(file, nombreProducto, callback) {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const newFileName = `${nombreProducto}-${timestamp}${extension}`;
    const newPath = path.join(uploadsPath, newFileName);
    fs.rename(file.path, newPath, (error) => {
        if (error) {
            return callback(error);
        }
        callback(null, newPath);
    });
}

router.use(rutasPublic);
router.use(rutasUsuario);

router.post('/registrar/producto', upload.array('imagenes', 4), function (req, res) {
    const { nombre, precio, stock, id_tipo_producto, id_marca, id_talle } = req.body;
    const nombreMin = nombre.toLowerCase();

    if (!req.files || req.files.length === 0) {
        return res.status(400).send({ error: 'Debe incluir al menos una imagen para el producto' });
    }

    const sql_insert_producto = 
        "INSERT INTO producto (nombre, precio, stock, id_tipo_producto, id_marca, id_talle) VALUES (?, ?, ?, ?, ?, ?)";
    
    conexion.query(sql_insert_producto, [nombreMin, precio, stock, id_tipo_producto, id_marca, id_talle], function(error, resultProducto) {
        if (error) {
            console.error('Error al insertar producto:', error);
            limpiarArchivosTemporales(req.files);
            return res.status(500).send({ error: 'Error al registrar el producto' });
        }

        const producto_id = resultProducto.insertId;
        const valoresImagenes = [];
        
        req.files.forEach(file => {
            saveImage(file, nombreMin, function(err, rutaImagen) {
                if (err) {
                    conexion.query("DELETE FROM producto WHERE id = ?", [producto_id], function() {
                        limpiarArchivosTemporales(req.files);
                        return res.status(500).send({ error: 'Error al mover las imágenes' });
                    });
                    return;
                }
                valoresImagenes.push([producto_id, rutaImagen]);
                if (valoresImagenes.length === req.files.length) {
                    const sql_insert_imagenes = "INSERT INTO producto_imagen (id_producto, ruta_imagen) VALUES ?";
                    conexion.query(sql_insert_imagenes, [valoresImagenes], function(error) {
                        if (error) {
                            console.error('Error al insertar imágenes:', error);
                            valoresImagenes.forEach(([_, rutaImagen]) => fs.unlinkSync(rutaImagen));
                            conexion.query("DELETE FROM producto WHERE id = ?", [producto_id], function() {
                                limpiarArchivosTemporales(req.files);
                                return res.status(500).send({ error: 'Error al guardar las imágenes' });
                            });
                            return;
                        }

                        limpiarArchivosTemporales(req.files);

                        res.json({
                            status: "ok",
                            mensaje: "Producto insertado correctamente con imágenes",
                            producto_id: producto_id
                        });
                    });
                }
            });
        });
    });
});

router.post('/registrar/categoria', function(req, res, next){
    const {nombre}=req.body;

    const nombreMinuscula = nombre.toLowerCase();
    const sql="INSERT INTO categoria (nombre) VALUES (?)"

    conexion.query(sql, [nombreMinuscula], function(error,result){
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

router.post('/registrar/metodo_pago', function(req, res, next) {
    const { tipo_pago } = req.body;
    const sql = "INSERT INTO metodo_pago (tipo_pago) VALUES (?)";

    conexion.query(sql, [tipo_pago], function(error, result) {
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

router.post('/registrar/talle', function(req, res, next) {
    const { talle, id_tipo_producto } = req.body;
        const talleMin=talle.toLowerCase();

        const sql_insert_talles = "INSERT INTO talle (talle, id_tipo_producto) VALUES (?, ?)";
        
        conexion.query(sql_insert_talles, [talleMin, id_tipo_producto], function(error, result) {
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
        const { id_metodo_pago, precio_total, id_envio } = req.body;
    
    
            const sql_insert_compra = "INSERT INTO compra (id_metodo_pago, precio_total, id_envio) VALUES (?, ?, ?)";
    
            conexion.query(sql_insert_compra, [id_metodo_pago, precio_total, id_envio], function(error, resultInsert) {
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

        router.put('/actualizar/producto/:id', upload.array('imagenes', 4), function(req, res) {
            const id = req.params.id; 
            const { nombre, precio, stock, id_tipo_producto, id_marca, id_talle } = req.body;
        
            if (!id) {
                return res.status(400).json({ error: 'Se necesita el id del producto' });
            }
        
            const campos = { nombre, precio, stock, id_tipo_producto, id_marca, id_talle };
        
            const sql= `UPDATE producto SET ? WHERE id = ?`;
            conexion.query(sql, [campos, id], function(error) {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Error al actualizar el producto' });
                }
        
                if (req.files && req.files.length > 0) {
                    actualizarImagenes(id, req.files, res);
                } else {
                    res.json({
                        status: 'ok',
                        mensaje: 'Producto actualizado correctamente sin imágenes',
                        producto_id: id
                    });
                }
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

    router.delete('/eliminar/producto/:id', function(req, res, next){
        const {id}=req.params;
        const sql="DELETE FROM producto WHERE id=?"
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