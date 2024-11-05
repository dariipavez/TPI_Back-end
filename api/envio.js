const router=require('express').Router()

const {conexion}=require('../db/conexion')

function actualizarEnvio(id, campos, res) {
    const sql_actualizar_Envio = 'UPDATE envio SET ? WHERE id = ?';
    conexion.query(sql_actualizar_Envio, [campos, id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al actualizar el Envio' });
        }

        if (result.filasAfectadas === 0) {
            return res.status(404).json({ error: 'No se encontró el Envio para actualizar' });
        }

        res.json({ status: 'ok', Mensaje: 'Envio actualizado correctamente' });
    });
}


router.post('/', function(req, res, next) {
    const { id_usuario, codigo_postal, calle, numero, ciudad, informacion_adicional } = req.body;

    
    const sql_obtener_usuarios_id = "SELECT id FROM usuarios WHERE id = ?";

    conexion.query(sql_obtener_usuarios_id, [id_usuario], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

       
        if (result.length === 0) {
            return res.status(404).json({ status: "error", mensaje: "Este usuario_id no existe" });
        }

        
        const sql_insert_envio = "INSERT INTO envio (id_usuario, codigo_postal, calle, numero, ciudad, informacion_adicional) VALUES (?, ?, ?, ?, ?, ?)";

        conexion.query(sql_insert_envio, [id_usuario, codigo_postal, calle, numero, ciudad, informacion_adicional], function(error, resultEnvio) {
            if (error) {
                console.error(error);
                return res.status(500).send(error);
            }

            res.json({
                status: "ok",
                id_envio: resultEnvio.insertId,
                id_usuario: id_usuario
            });
        });
    });
});

router.get("/", function(req, res, next) {
    const { id } = req.query;
    const sql = 
        "SELECT envio.*, usuarios.nombre_completo, usuarios.mail, usuarios.telefono FROM envio JOIN usuarios ON envio.id_usuario = usuarios.id WHERE envio.id = ?";

    conexion.query(sql, [id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        
        res.json({
            status: "ok",
            envio: result
        });
    });
});

router.put('/', function(req, res) {
    const { id } = req.query;
    const campos = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Se necesita el id del envio' });
    }

    const sql_verificar_envio = 'SELECT * FROM envio WHERE id = ?';
    conexion.query(sql_verificar_envio, [id], function(error, results) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al verificar el envio' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'envio no encontrad' });
        }

        if (campos.id_usuario) {
            const sql_verificar_usuario = 'SELECT * FROM usuarios WHERE id = ?';
            conexion.query(sql_verificar_usuario, [campos.id_usuario], function(error, usuarioResult) {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Error al verificar el Usuario' });
                }

                if (usuarioResult.length === 0) {
                    return res.status(404).json({ error: 'Usuario no encontrado' });
                }

                actualizarEnvio(id, campos, res);
            });
        } else {
            actualizarEnvio(id, campos, res);
        }
    });
});

router.delete('/', function(req, res, next){
    const {id}=req.query;
    const sql="DELETE FROM envio WHERE id=?"
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