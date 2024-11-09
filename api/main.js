const router=require('express').Router();
//const{ verificarToken }=require('@damianegreco/hashpass')

const TOKEN_SECRET = '47355966'

//importar cada recurso de la API
const usuariosRouter=require('./usuarios');
const productosRouter=require('./productos');
const marcaRouter=require('./marca');
const talleRouter=require('./talle');
const categoriaRouter=require('./categoria');
const envioRouter=require('./envio');
const metodo_de_pagoRouter=require('./metodo_pago');
const compraRouter=require('./compra');
const productos_compraRouter=require('./productos_compra')

//redirigir a los recursos segun la ruta
router.use('/usuarios', usuariosRouter);
router.use('/productos', productosRouter);
router.use('/marca', marcaRouter);
router.use('/talle', talleRouter);
router.use('/categoria', categoriaRouter);
router.use('/envio', envioRouter);
router.use('/metodo_pago', metodo_de_pagoRouter);
router.use('/compra', compraRouter);
router.use('/productos_compra', productos_compraRouter);

//primero la verificacion, le sigue la ruta a la que se quiere acceder
router.use('/productos', function(req,res,next){
    const token=req.headers.authorization;
    const verificacion= verificarToken(token, TOKEN_SECRET);
    if(verificacion?.data!==undefined){
        next()
    }else{
        console.error(verificacion);
        res.status(403).json({status:'error',error:verificacion});
    }
})
//modificar, es para acceder utilizando el token para verificar.

module.exports=router;