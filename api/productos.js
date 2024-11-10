const express=require("express");
const { conexion }=require("../db/conexion");
const router=express.Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs');

function actualizarProducto(id, campos, res) {
    const sql_actualizar_producto = 'UPDATE productos SET ? WHERE id = ?';
    conexion.query(sql_actualizar_producto, [campos, id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al actualizar el producto' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No se encontró el producto para actualizar' });
        }

        res.json({ status: 'ok', mensaje: 'Producto actualizado correctamente' });
    });
}

function actualizarImagenes(id, files, nombre, res) {
    if (files && files.length > 0) {
        const sql_borrar_imagenes_antiguas = 'DELETE FROM producto_imagenes WHERE id_producto = ?';
        conexion.query(sql_borrar_imagenes_antiguas, [id], function(error) {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error al eliminar las imágenes antiguas' });
            }
            const valoresImagenes = files.map(file => {
                const rutaImagen = saveImage(file, nombre);
                return [id, rutaImagen];
            });

            const sql_insert_imagenes = 'INSERT INTO producto_imagenes (id_producto, ruta_imagen) VALUES ?';
            conexion.query(sql_insert_imagenes, [valoresImagenes], function(error) {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Error al guardar las imágenes' });
                }

                res.json({
                    status: 'ok',
                    mensaje: 'Producto actualizado correctamente con imágenes',
                    producto_id: id
                });
            });
        });
    } else {
        res.json({
            status: 'ok',
            mensaje: 'Producto actualizado correctamente sin imágenes',
            producto_id: id
        });
    }
}

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

const tempUploadsPath = path.join(__dirname, 'temp_uploads');
if (!fs.existsSync(tempUploadsPath)) {
    fs.mkdirSync(tempUploadsPath, { recursive: true });
}


router.get("/", function(req, res, next){
    const { id }=req.query
    const sql="SELECT * FROM productos WHERE id=?";
    conexion.query(sql,[id],function(error,result){
        if(error){
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status:"ok",
            Producto:result
        });
    });
});

router.get("/categoria", function (req, res) {
    const { id_categoria } = req.query;

    if (!id_categoria) {
        return res.status(400).json({
            status: "error",
            mensaje: "El id de la categoria es obligatorio"
        });
    }

    const sql = "SELECT * FROM productos WHERE id_categoria = ?";

    conexion.query(sql, [id_categoria], function (error, results) {
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

        res.json({
            status: "ok",
            productos: results
        });
    });
});

router.get("/tipo_producto", function (req, res) {
    const { id_tipo_producto } = req.query;

    if (!id_tipo_producto) {
        return res.status(400).json({
            status: "error",
            mensaje: "El id del tipo de producto es obligatorio"
        });
    }

    const sql = "SELECT * FROM productos WHERE id_tipo_producto = ?";

    conexion.query(sql, [id_tipo_producto], function (error, results) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: "Error al obtener los productos" });
        }

        if (results.length === 0) {
            return res.status(404).json({
                status: "error",
                mensaje: "No se encontraron productos para el tipo de producto seleccionado"
            });
        }

        res.json({
            status: "ok",
            productos: results
        });
    });
});



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempUploadsPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


router.post('/', upload.array('imagenes', 4), function(req, res) {
    const { nombre, precio, stock, id_tipo_producto, id_marca, id_categoria, id_talle } = req.body;

    const sql_verificar_id = `SELECT tipo_producto.id, marca.id, categoria.id, talles.id
        FROM tipo_producto 
        INNER JOIN marca ON marca.id = ?
        INNER JOIN categoria ON categoria.id = ? AND categoria.id_tipo_producto = tipo_producto.id
        INNER JOIN talles ON talles.id = ?
        WHERE tipo_producto.id = ?`;

    conexion.query(sql_verificar_id, [id_marca, id_categoria, id_talle, id_tipo_producto], function(error, resultid) {
        if (error) {
            console.error(error);
            limpiarArchivosTemporales(req.files);
            return res.status(500).json({ error: 'Error al verificar los IDs' });
        }

        if (resultid.length === 0) {
            limpiarArchivosTemporales(req.files);
            return res.status(404).json({ status: "error", mensaje: "Uno o más ID no existen" });
        }

        const sql_verificar_producto = `
        SELECT productos.id FROM productos 
        INNER JOIN tipo_producto ON productos.id_tipo_producto = tipo_producto.id
        INNER JOIN marca ON productos.id_marca = marca.id
        INNER JOIN categoria ON productos.id_categoria = categoria.id
        INNER JOIN talles ON productos.id_talles = talles.id
        WHERE productos.nombre = ? 
        AND tipo_producto.id = ? 
        AND marca.id = ? 
        AND categoria.id = ? 
        AND talles.id = ?`;

        conexion.query(sql_verificar_producto, [nombre, id_tipo_producto, id_marca, id_categoria, id_talle], function(error, resultProductoExistente) {
            if (error) {
                console.error(error);
                limpiarArchivosTemporales(req.files);
                return res.status(500).send({ error: 'Error al verificar si el producto ya existe' });
            }

            if (resultProductoExistente.length > 0) {
                limpiarArchivosTemporales(req.files);
                return res.status(400).json({ status: "error", mensaje: "El producto ya está registrado" });
            }

            const sql_insert_producto = 
                "INSERT INTO productos (nombre, precio, stock, id_tipo_producto, id_marca, id_categoria, id_talles) VALUES (?, ?, ?, ?, ?, ?, ?)";

            conexion.query(sql_insert_producto, [nombre, precio, stock, id_tipo_producto, id_marca, id_categoria, id_talle], function(error, resultProducto) {
                if (error) {
                    console.error(error);
                    limpiarArchivosTemporales(req.files);
                    return res.status(500).send({ error: 'Error al insertar el producto' });
                }

                const producto_id = resultProducto.insertId;

                if (req.files && req.files.length > 0) {
                    const valoresImagenes = req.files.map(file => {
                        const rutaImagen = saveImage(file, nombre);
                        return [producto_id, rutaImagen];
                    });

                    const sql_insert_imagenes = "INSERT INTO producto_imagenes (id_producto, ruta_imagen) VALUES ?";

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
                } else {
                    res.json({
                        status: "ok",
                        mensaje: "Producto insertado correctamente sin imágenes",
                        producto_id: producto_id
                    });
                }
            });
        });
    });
});










/*router.put('/:id', upload.array('imagenes', 4), function(req, res) {
    const id = req.params.id;  // El id debería venir de req.params
    const { nombre, precio, stock, id_tipo_producto, id_marca, id_categoria, id_talle } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Se necesita el id del producto' });
    }

    const sql_verificar_id = `
        SELECT tipo_producto.id, marca.id, categoria.id, talles.id
        FROM tipo_producto 
        INNER JOIN marca ON marca.id = ?
        INNER JOIN categoria ON categoria.id = ? AND categoria.id_tipo_producto = tipo_producto.id
        INNER JOIN talles ON talles.id = ?
        WHERE tipo_producto.id = ?
    `;

    conexion.query(sql_verificar_id, [id_marca, id_categoria, id_talle, id_tipo_producto], function(error, resultid) {
        if (error) {
            console.error(error);
            limpiarArchivosTemporales(req.files);
            return res.status(500).json({ error: 'Error al verificar los IDs' });
        }

        if (resultid.length === 0) {
            limpiarArchivosTemporales(req.files);
            return res.status(404).json({ status: 'error', mensaje: 'Uno o más ID no existen' });
        }

        const sql_verificar_producto = "SELECT id FROM productos WHERE id = ? AND nombre = ? AND id_tipo_producto = ? AND id_marca = ? AND id_categoria = ? AND id_talles = ?";

        conexion.query(sql_verificar_producto, [id, nombre, id_tipo_producto, id_marca, id_categoria, id_talle], function(error, resultProductoExistente) {
            if (error) {
                console.error(error);
                limpiarArchivosTemporales(req.files);
                return res.status(500).send({ error: 'Error al verificar el producto' });
            }

            if (resultProductoExistente.length === 0) {
                limpiarArchivosTemporales(req.files);
                return res.status(404).json({ status: 'error', mensaje: 'Producto no encontrado o no coinciden los datos del producto' });
            }

            // Campos a actualizar
            const campos = {
                nombre,
                precio,
                stock,
                id_tipo_producto,
                id_marca,
                id_categoria,
                id_talles
            };

            // Primero actualizamos el producto
            actualizarProducto(id, campos, res);

            // Si hay imágenes, las actualizamos también
            if (req.files && req.files.length > 0) {
                actualizarImagenes(id, req.files, nombre, res);
            } else {
                // Si no hay imágenes, respondemos sin actualizar imágenes
                res.json({
                    status: 'ok',
                    mensaje: 'Producto actualizado correctamente sin imágenes',
                    producto_id: id
                });
            }
        });
    });
});*/




router.delete('/', function(req, res, next){
    const {id}=req.query;
    const sql="DELETE FROM productos WHERE id=?"
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

module.exports=router;