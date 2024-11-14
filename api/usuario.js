const router=require('express').Router()

const {conexion}=require('../db/conexion')

const{ hashPass, verificarPass, generarToken, verificarToken}=require('@damianegreco/hashpass')

const TOKEN_SECRET = '46087388';

const verificarAdmin = (req, res, next) => {
    const token = req.headers.authorization;
    const verificacion = verificarToken(token, TOKEN_SECRET);
    if (verificacion?.data && verificacion.data.rol === 'administrador') {
        req.user = verificacion.data;
        next();
    } else {
        res.status(403).json({ status: 'error', error: 'Acceso restringido: Solo administradores' });
    }
};



const checkUser=function(nombre_usuario){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id FROM usuario where nombre_usuario= ?';
        conexion.query(sql, [nombre_usuario], function(error,result){
            if(error) return reject(error);
            if (result.length > 0) return reject('Usuario ya existe');
            return resolve();
        } )
    })
}

//tablas siempre en minuscula, al unir palabras con guion bajo

const guardarUsuario=function(nombre_usuario,contraseñaHash, nombre_completo, fecha_nac, mail, rol,telefono){
    return new Promise ((resolve,reject)=>{
        const sql = "INSERT INTO usuario (nombre_completo, fecha_nac, mail, nombre_usuario, rol, contraseña,telefono) VALUES (?,?,?,?,?,?,?)";
        conexion.query(sql, [nombre_completo, fecha_nac, mail, nombre_usuario, rol, contraseñaHash, telefono], function(error, result) {
            if (error) return reject(error);
            console.log(result);
            
            return resolve(result.insertId);
        });
        
    })
}

router.post('/registrarse',function(req,res,next){
    const {nombre_usuario,contraseña,nombre_completo, fecha_nac, mail, telefono}=req.body;

    const rol='usuario'

    checkUser(nombre_usuario)
    .then(()=>{
        const contraseñaHasheada=hashPass(contraseña);
        guardarUsuario(nombre_usuario, contraseñaHasheada, nombre_completo, fecha_nac, mail, rol, telefono)
        .then((usuario_id) => {
            res.json({
                status:"ok",
                usuario_id
            })
        })
    })
    .catch(error => {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ status: 'error', error: error.toString() });
    });
})

    
router.post("/login",function(req,res,next){
    const {nombre_usuario,contraseña}=req.body;


    const sql='SELECT id,nombre_usuario,contraseña,rol FROM usuario WHERE nombre_usuario= ?'
    conexion.query(sql,[nombre_usuario], function(error,result){
        if(error){
            console.error(error);
            res.status(500).json({status:'error',error})
        }
        if (result.length !== 1) {
            console.error('Error al buscar usuario(Usuario Incorrecto)');
            return res.status(403).json({ status: 'error', error: 'Error al buscar usuario(Usuario incorrecto)' });
        }
        
        if (verificarPass(contraseña, result[0].contraseña)) {
            console.log('Inicio Correctamente');
            const token = generarToken(TOKEN_SECRET, 6, { usuario_id: result[0].id, usuario: nombre_usuario, rol: result[0].rol });
            console.log(token);
            return res.json({ status: 'ok', token });
        } else {
            console.error('Usuario/Contraseña incorrecto');
            return res.status(403).json({ status: 'error', error: 'Usuario/Contraseña incorrecto' });
        }
        
    })
})

router.put('/actualizar/:id', function(req, res) {
    const id = req.params.id;
    const { nombre_usuario, contraseña, nombre_completo, fecha_nac, mail, rol, telefono } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Se necesita el id del usuario' });
    }

    const token = req.headers.authorization;
    const verificacion = verificarToken(token, TOKEN_SECRET);

    if (!verificacion?.data) {
        return res.status(403).json({ status: 'error', error: 'Acceso restringido' });
    }

    const usuarioLogeado = verificacion.data;

    if (usuarioLogeado.rol !== 'administrador' && usuarioLogeado.usuario_id !== parseInt(id)) {
        return res.status(403).json({ status: 'error', error: 'No tienes permisos para actualizar este usuario' });
    }

    const campos = {
        ...(nombre_usuario !== undefined && { nombre_usuario }),
        ...(nombre_completo !==undefined && { nombre_completo }),
        ...(fecha_nac !== undefined && { fecha_nac }),
        ...(mail !==undefined && { mail }),
        ...(telefono !== undefined && { telefono }),
        ...(contraseña && { contraseña: hashPass(contraseña) })
    };
    if (usuarioLogeado.rol === 'administrador' && rol !== undefined){ 
        campos.rol = rol.toLowerCase();
    }
    const sql = "UPDATE usuario SET ? WHERE id = ?";
    conexion.query(sql, [campos, id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al actualizar el usuario' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No se encontró el usuario para actualizar' });
        }

        res.json({ status: 'ok', mensaje: 'Usuario actualizado correctamente' });
    });
});



router.delete('/eliminar/:id',verificarAdmin, function(req, res, next){
    const id=req.params.id;
    const sql="DELETE FROM usuario WHERE id=?"
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


//obtener de la db la contraseña del usuario(si es q existe)
    //comparamos la contraseña recibida con la hasheada

    router.post('/crear', verificarAdmin, function(req, res) {
        const { nombre_usuario, contraseña, nombre_completo, fecha_nac, mail, rol, telefono } = req.body;
    
        const rolAsignado = (rol && rol.toLowerCase()) || 'usuario';
        const rolesPermitidos = ['usuario', 'administrador'];
    
        if (!rolesPermitidos.includes(rolAsignado)) {
            return res.status(400).json({ status: 'error', error: 'Rol inválido' });
        }
    
        checkUser(nombre_usuario)
            .then(() => {
                const contraseñaHasheada = hashPass(contraseña);
                guardarUsuario(nombre_usuario, contraseñaHasheada, nombre_completo, fecha_nac, mail, rolAsignado, telefono)
                    .then((usuario_id) => {
                        res.json({
                            status: 'ok',
                            usuario_id
                        });
                    })
                    .catch(error => {
                        console.error('Error al guardar usuario:', error);
                        res.status(500).json({ status: 'error', error: error.toString() });
                    });
            })
            .catch(error => {
                console.error('Error al verificar usuario:', error);
                res.status(500).json({ status: 'error', error: error.toString() });
            });
    });
    

    router.delete('/eliminar/:id',verificarAdmin, function(req, res, next){
        const id=req.params.id;
        const sql="DELETE FROM usuario WHERE id=?"
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