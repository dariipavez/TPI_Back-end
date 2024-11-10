const router=require('express').Router();
const{ verificarToken }=require('@damianegreco/hashpass')

const TOKEN_SECRET = '46087388'

//importar cada recurso de la API
const usuariosRouter=require('./usuarios');
const marcaRouter=require('./marca');
const talleRouter=require('./talle');
const categoriaRouter=require('./categoria');
const envioRouter=require('./envio');
const metodo_de_pagoRouter=require('./metodo_pago');
const productosRouter=require('./productos');
const productos_compraRouter=require('./productos_compra')
const compraRouter=require('./compra')

//redirigir a los recursos segun la ruta
router.use('/usuarios', usuariosRouter);
router.use('/marca', marcaRouter);
router.use('/talle', talleRouter);
router.use('/categoria', categoriaRouter);
router.use('/metodo_pago', metodo_de_pagoRouter);

//primero la verificacion, le sigue la ruta a la que se quiere acceder


//modificar, es para acceder utilizando el token para verificar.
router.use('/envio', envioRouter);
router.use('/productos',productosRouter)
router.use('/productos_compra', productos_compraRouter)
router.use('/compra', compraRouter)
module.exports=router;