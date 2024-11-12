const router = require('express').Router();
const { conexion } = require('../db/conexion');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

const tempUploadsPath = path.join(__dirname, 'temp_uploads');
if (!fs.existsSync(tempUploadsPath)) {
    fs.mkdirSync(tempUploadsPath, { recursive: true });
}

router.post('/insertar/producto', upload.array('imagenes', 4), function(req, res) {
    const { nombre, precio, stock, id_tipo_producto, id_marca, id_talle } = req.body;

    if (!req.files || req.files.length === 0) {
        return res.status(400).send({ error: 'Debe incluir al menos una imagen para el producto' });
    }

    const sql_insert_producto = 
        "INSERT INTO producto (nombre, precio, stock, id_tipo_producto, id_marca, id_talle) VALUES (?, ?, ?, ?, ?, ?)";

    conexion.query(sql_insert_producto, [nombre, precio, stock, id_tipo_producto, id_marca, id_talle], function(error, resultProducto) {
        if (error) {
            console.error(error);
            limpiarArchivosTemporales(req.files);
            return res.status(500).send({ error: 'Error al insertar el producto' });
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









module.exports=router;