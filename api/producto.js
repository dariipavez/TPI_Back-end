const express=require("express");
const { conexion }=require("../db/conexion");
const router=express.Router();







router.get("/", function(req, res, next){
    const { id }=req.query
    const sql="SELECT * FROM producto WHERE id=?";
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

    const sql = "SELECT * FROM producto WHERE id_categoria = ?";

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

    const sql = "SELECT * FROM producto WHERE id_tipo_producto = ?";

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