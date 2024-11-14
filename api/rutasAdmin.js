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
const tempUploadsPath = path.join(__dirname, 'temp_uploads');
if (!fs.existsSync(tempUploadsPath)) {
    fs.mkdirSync(tempUploadsPath, { recursive: true });
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
        fs.unlink(file.path, (err) => {
            if (err) console.error(`Error al eliminar el archivo temporal ${file.path}:`, err);
        });
    });
}

function saveImage(file, nombreProducto) {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const newFileName = `${nombreProducto}-${timestamp}${extension}`;
    const newPath = `./uploads/${newFileName}`;
    fs.renameSync(file.path, newPath);
    return newPath;
}


router.use(rutasPublic);
router.use(rutasUsuario);

router.post('/registrar/producto', upload.array('imagenes', 4), function(req, res) {
    const { nombre, precio, stock, id_tipo_producto, id_marca, id_talle } = req.body;

    const nombreMin=nombre.toLowerCase();

    if (!req.files || req.files.length === 0) {
        return res.status(400).send({ error: 'Debe incluir al menos una imagen para el producto' });
    }
    const sql_insert_producto = 
        "INSERT INTO producto (nombre, precio, stock, id_tipo_producto, id_marca, id_talle) VALUES (?, ?, ?, ?, ?, ?)";

    conexion.query(sql_insert_producto, [nombreMin, precio, stock, id_tipo_producto, id_marca, id_talle], function(error, resultProducto) {
        if (error) {
            console.error(error);
            limpiarArchivosTemporales(req.files);
            return res.status(500).send({ error: 'Error al registrar el producto' });
        }

        const producto_id = resultProducto.insertId;

        const valoresImagenes = req.files.map(file => {
            const rutaImagen = saveImage(file, nombre);
            return [producto_id, rutaImagen];
        });

        const sql_insert_imagenes = "INSERT INTO producto_imagen (id_producto, ruta_imagen) VALUES ?";

        conexion.query(sql_insert_imagenes, [valoresImagenes], function(error) {
            if (error) {
                console.error(error);
                limpiarArchivosTemporales(req.files);
                return res.status(500).send({ error: 'Error al guardar las imágenes' });
            }

            res.json({
                status: "ok",
                mensaje: "Producto insertado correctamente con imágenes",
                producto_id: producto_id
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

    router.delete('/borrar/producto/:id', function(req, res, next){
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


    router.delete('/borrar/talle/:id', function(req, res, next) {
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
module.exports=router;