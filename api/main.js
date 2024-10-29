const router=require('express').Router();
//const{ verificarToken }=require('@damianegreco/hashpass')

const TOKEN_SECRET = '46087388'


//importar cada recurso de la API
const usuariosRouter=require('./usuarios');

//redirigir a los recursos segun la ruta
router.use('/usuarios', usuariosRouter)


//primero la verificacion, le sigue la ruta a la que se quiere acceder
router.use('/personas', function(req,res,next){
    const token=req.headers.authorization;
    const verificacion= verificarToken(token, TOKEN_SECRET);
    if(verificacion?.data!==undefined){
        next()
    }else{
        console.error(verificacion);
        res.status(403).json({status:'error',error:verificacion});
    }
})//modificar, es para acceder utilizando el token para verificar.



//router.use('/personas', personasRouter)

module.exports=router;