const router=require('express').Router();
const{ verificarToken }=require('@damianegreco/hashpass')

const TOKEN_SECRET = '46087388'

//terminar las rutas y seleccionar que rutas estan permitidas para el usuario
function rutasUsuario(req) {
    const rutasPermitidas = [
            './rutasUsuario'

];
    return rutasPermitidas.includes(req.path);
}

function verificarRol(req, res, next){
    const token=req.headers.authorization;
    const verificacion= verificarToken(token, TOKEN_SECRET);
    if(verificacion?.data!==undefined){
        const { rol } = verificacion.data;
        if (rol === 'administrador' || (rol === 'usuario' && rutasUsuario(req))) {
            next();
        } else {
            res.status(403).json({ status: 'error', error: 'Acceso restringido' });
        }
    } else {
        console.error(verificacion);
        res.status(403).json({ status: 'error', error: verificacion });
    }
};

//importar cada recurso de la API
const usuarioRouter=require('./usuario');
const marcaRouter=require('./marca');
const talleRouter=require('./talle');
const categoriaRouter=require('./categoria');
const envioRouter=require('./envio');
const metodo_pagoRouter=require('./metodo_pago');
const productoRouter=require('./producto');
const producto_compraRouter=require('./producto_compra')
const compraRouter=require('./compra')

const rutasAdminRouter=require('./rutasAdmin', )
//redirigir a los recursos segun la ruta
router.use('/usuario', usuarioRouter);
router.use('/marca', marcaRouter);
router.use('/talle', talleRouter);
router.use('/metodo_pago', metodo_pagoRouter);

//primero la verificacion, le sigue la ruta a la que se quiere acceder
router.use('/rutasAdmin', verificarRol, rutasAdminRouter)
    

//modificar, es para acceder utilizando el token para verificar.
router.use('/envio', envioRouter);
router.use('/producto',productoRouter)
router.use('/producto_compra', producto_compraRouter)
router.use('/compra', compraRouter)
module.exports=router;