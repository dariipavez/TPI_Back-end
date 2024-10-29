const router=require('express').Router()

const {conexion}=require('../db/conexion')

const{ hashPass, verificarPass, generarToken }=require('@damianegreco/hashpass')

const TOKEN_SECRET = '46087388';

const checkUser=function(nombre_usuario){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id FROM usuarios where nombre_usuario= ?';
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
        const sql = "INSERT INTO usuarios (nombre_completo, fecha_nac, mail, nombre_usuario, rol, contraseña,telefono) VALUES (?,?,?,?,?,?,?)";
        conexion.query(sql, [nombre_completo, fecha_nac, mail, nombre_usuario, rol, contraseñaHash, telefono], function(error, result) {
            if (error) return reject(error);
            console.log(result);
            
            return resolve(result.insertId);
        });
        
    })
}

router.post('/',function(req,res,next){
    const {nombre_usuario,contraseña,nombre_completo, fecha_nac, mail, rol, telefono}=req.body;
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
        res.status(500).json({ status: 'error', message: error.toString() });
    });
     
})

    
/*router.post("/login",function(req,res,next){
    const {nombre_usuario,contraseña}=req.body;


    const sql='SELECT id,contraseña FROM usuarios WHERE nombre_usuario= ?'
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
            const token = generarToken(TOKEN_SECRET, 6, { usuario_id: result[0].id, usuario: nombre_usuario, ejemplo: "asd" });
            console.log(token);
            return res.json({ status: 'ok', token });
        } else {
            console.error('Usuario/Contraseña incorrecto');
            return res.status(403).json({ status: 'error', error: 'Usuario/Contraseña incorrecto' });
        }
        
    })
})
*/




//obtener de la db la contraseña del usuario(si es q existe)
    //comparamos la contraseña recibida con la hasheada



    //res.json({status:"pendiente"})

module.exports=router;