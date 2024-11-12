const router=require('express').Router()

const {conexion}=require('../db/conexion')
//terminado


router.post('/', function(req, res, next){
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




router.get('/categoria/:id/productos', function(req, res, next) {
    const { id } = req.params;
    const sql = `
        SELECT productos.*, categoria.nombre FROM productos 
        JOIN categoria ON productos.id_categoria = categoria.id 
        WHERE categoria.id = ?`;

    conexion.query(sql, [id], function(error, results) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok",
            productos: results
        });
    });
});

router.get("/categorias", function(req, res, next) {
    const sql = 
        "SELECT * from categoria";

    conexion.query(sql, function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        
        res.json({
            status: "ok",
            categorias: result
        });
    });
});

router.get('/:id/tipo_producto', function(req, res, next) {
    const { id } = req.params;
    const sql = 
        `SELECT tipo_producto.*, categoria.nombre FROM tipo_producto 
        JOIN categoria ON tipo_producto.id_categoria = categoria.id WHERE categoria.id = ?`;

    conexion.query(sql, [id], function(error, results) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok",
            tipos_producto: results
        });
    });
});

router.put('/', function(req, res, next){
    const { id }=req.query;
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

router.delete('/', function(req, res, next){
    const {id}=req.query;
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

//ruta tipo_producto
router.post('/tipo_producto', function(req, res, next) {
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


router.get("/tipo_producto/:id", function(req, res, next){
    const { id }=req.params
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

router.put('/tipo_producto', function(req, res, next){
    const { id }=req.query;
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



router.delete('/tipo_producto', function(req, res, next) {
    const { id } = req.query;

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


module.exports = router;