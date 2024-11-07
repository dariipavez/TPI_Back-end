const express=require("express");
const { conexion }=require("../db/conexion");
const router=express.Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs');



/*
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
});*/



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
    
});
const upload = multer({ storage: storage });


router.post('/', upload.array('imagenes', 4), function(req, res) {
    const { nombre, precio, stock, nombre_tipo_producto, nombre_marca, nombre_categoria, talle } = req.body;

    const sql_verificar_producto = 
        "SELECT productos.id FROM productos JOIN tipo_producto ON tipo_producto.id = productos.id_tipo_producto JOIN marca ON marca.id = productos.id_marca JOIN categoria ON categoria.id = productos.id_categoria JOIN talles ON talles.id = productos.id_talles WHERE productos.nombre = ? AND tipo_producto.nombre = ? AND marca.nombre = ? AND categoria.nombre = ? AND talles.talle = ?";
    
    conexion.query(sql_verificar_producto, [nombre, nombre_tipo_producto, nombre_marca, nombre_categoria, talle], function(error, resultProductoExistente) {
        if (error) {
            console.error(error);
            return res.status(500).send({ error: 'Error al verificar si el producto ya existe' });
        }

        if (resultProductoExistente.length > 0) {
            return res.status(400).json({ status: "error", mensaje: "El producto ya está registrado" });
        }

        const sql_obtener_tipo_producto_id = "SELECT id FROM tipo_producto WHERE nombre = ?";
        conexion.query(sql_obtener_tipo_producto_id, [nombre_tipo_producto], function(error, resultTipoProducto) {
            if (error) {
                console.error(error);
                return res.status(500).send({ error: 'Error al obtener el tipo de producto' });
            }
            if (resultTipoProducto.length === 0) {
                return res.status(404).json({ status: "error", mensaje: "Tipo de producto no encontrado" });
            }
            const tipo_producto_id = resultTipoProducto[0].id;

            const sql_obtener_marca_id = "SELECT id FROM marca WHERE nombre = ?";
            conexion.query(sql_obtener_marca_id, [nombre_marca], function(error, resultMarca) {
                if (error) {
                    console.error(error);
                    return res.status(500).send({ error: 'Error al obtener la marca' });
                }
                if (resultMarca.length === 0) {
                    return res.status(404).json({ status: "error", mensaje: "Marca no encontrada" });
                }
                const marca_id = resultMarca[0].id;

                const sql_obtener_categoria_id = "SELECT id FROM categoria WHERE nombre = ? AND id_tipo_producto = ?";
                conexion.query(sql_obtener_categoria_id, [nombre_categoria, tipo_producto_id], function(error, resultCategoria) {
                    if (error) {
                        console.error(error);
                        return res.status(500).send({ error: 'Error al obtener la categoría' });
                    }
                    if (resultCategoria.length === 0) {
                        return res.status(404).json({ status: "error", mensaje: "Categoría no encontrada" });
                    }
                    const categoria_id = resultCategoria[0].id;

                    const sql_obtener_talle_id = "SELECT id FROM talles WHERE talle = ?";
                    conexion.query(sql_obtener_talle_id, [talle], function(error, resultTalle) {
                        if (error) {
                            console.error(error);
                            return res.status(500).send({ error: 'Error al obtener el talle' });
                        }
                        if (resultTalle.length === 0) {
                            return res.status(404).json({ status: "error", mensaje: "Talle no encontrado" });
                        }
                        const talle_id = resultTalle[0].id;

                        const sql_insert_producto = "INSERT INTO productos (nombre, precio, stock, id_tipo_producto, id_marca, id_categoria, id_talles) VALUES (?, ?, ?, ?, ?, ?, ?)";
                        const valoresProducto = [nombre, precio, stock, tipo_producto_id, marca_id, categoria_id, talle_id];

                        conexion.query(sql_insert_producto, valoresProducto, function(error, resultProducto) {
                            if (error) {
                                console.error(error);
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
        });
    });
});


function saveImage(file, nombreProducto) {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const newFileName = `${nombreProducto}-${timestamp}${extension}`;
    const newPath = `./uploads/${newFileName}`;
    fs.renameSync(file.path, newPath);
    return newPath;
}






/*router.put('/', function(req, res, next){
    const { documento,nombres,apellidos,domicilio,telefono }= req.body;
    const { id }=req.query;

    const sql="UPDATE productos SET documento=?, nombres=?, apellidos=?, domicilio=?, telefono=? WHERE id=?"
    conexion.query(sql, [documento,nombres,apellidos,domicilio, telefono,id], function(error){
        if(error){
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status:"ok"
        });
    });

});*/

/*router.delete('/', function(req, res, next){
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
});*/

module.exports=router;