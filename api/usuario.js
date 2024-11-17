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
            return res.json({ status: 'ok', token, usuario_id: result[0].id ,rol: result[0].rol });
        } else {
            console.error('Usuario/Contraseña incorrecto');
            return res.status(403).json({ status: 'error', error: 'Usuario/Contraseña incorrecto' });
        }
        
    })
})

router.post('/verificar/datos', (req, res) => {
    const { mail, nombre_completo, telefono } = req.body;

    const query = `SELECT id FROM usuario WHERE mail = ? AND nombre_completo = ? AND telefono = ?`;
    
    conexion.query(query, [mail, nombre_completo, telefono], (error, results) => {
      if (error) {
        console.error('Error de base de datos:', error);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Error en la base de datos', 
          error: error.message 
        });
      }
  
      if (results.length > 0) {
        return res.status(200).json({ 
          status: 'ok', 
          usuario_id: results[0].id 
        });
      } else {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Datos incorrectos' 
        });
      }
    });
  });
  


  router.put('/actualizar/:id', function(req, res) {
    const id = req.params.id;
    const { nombre_usuario, contraseña, nombre_completo, fecha_nac, mail, rol, telefono, nueva_contraseña } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Se necesita el id del usuario' });
    }

    const token = req.headers.authorization;
    const verificacion = verificarToken(token, TOKEN_SECRET);
    // Verificar si se está actualizando la contraseña
    if (nueva_contraseña) {
        // Si se está actualizando la contraseña, procesamos esta parte
        const nuevaContraseñaHashed = hashPass(nueva_contraseña);

        // Actualizar la contraseña en la base de datos
        const sql = "UPDATE usuario SET contraseña = ? WHERE id = ?";
        conexion.query(sql, [nuevaContraseñaHashed, id], function(error, result) {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error al actualizar la contraseña' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'No se encontró el usuario para actualizar la contraseña' });
            }

            return res.json({ status: 'ok', mensaje: 'Contraseña actualizada correctamente' });
        });
    } else {
        // Si no se está actualizando la contraseña, actualizamos los demás datos
        const actualizarContraseña = contraseña;

        // Si no se está actualizando la contraseña, necesitamos un token
        if (!actualizarContraseña) {
            const token = req.headers.authorization;

            if (!token) {
                return res.status(401).json({ status: "error", error: "No se identificó un token" });
            }

            const verificacion = verificarToken(token, TOKEN_SECRET);

            if (!verificacion?.data) {
                return res.status(403).json({ status: 'error', error: 'Acceso restringido' });
            }

            const usuarioLogeado = verificacion.data;

            // Solo el usuario logeado o un administrador puede actualizar su propio usuario
            if (usuarioLogeado.usuario_id !== parseInt(id) && usuarioLogeado.rol !== 'administrador') {
                return res.status(403).json({ status: 'error', error: 'No tienes permisos para actualizar este usuario' });
            }
        }

        // Creación del objeto campos con las actualizaciones
        const campos = {
            ...(nombre_usuario !== undefined && { nombre_usuario }),
            ...(nombre_completo !== undefined && { nombre_completo }),
            ...(fecha_nac !== undefined && { fecha_nac }),
            ...(mail !== undefined && { mail }),
            ...(telefono !== undefined && { telefono }),
            ...(contraseña && { contraseña: hashPass(contraseña) })
        };

        // Solo los administradores pueden cambiar el rol
        if (rol !== undefined) {
            const usuarioLogeado = verificacion?.data;
            if (usuarioLogeado?.rol === 'administrador') {
                campos.rol = rol.toLowerCase();
            } else {
                return res.status(403).json({ status: 'error', error: 'No tienes permisos para modificar el rol' });
            }
        }

        // Consulta para actualizar el usuario
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
    }
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