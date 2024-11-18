const router=require('express').Router();
const{ verificarToken }=require('@damianegreco/hashpass')

const TOKEN_SECRET = '46087388'

//terminar las rutas y seleccionar que rutas estan permitidas para el usuario
function rutasUsuario(req) { const rutasPermitidas = [ 

    '/rutasUsuario/ver/perfil/:id',
    '/rutasUsuario/ver/metodos_pago/:id?',
    '/rutasUsuario/ver/producto_compra/:id?',
    '/rutasUsuario/ver/envio/:id?',
    '/rutasUsuario/ver/compra/:id?',
    '/rutasUsuario/ver/usuario'
    ]
    const rutaBase = req.path.split('?')[0].split('/')[1];
    return rutasPermitidas.some(ruta => ruta.includes(rutaBase));
    }

function verificarRol(req, res, next){
    const token=req.headers.authorization;
    const verificacion= verificarToken(token, TOKEN_SECRET);
    if(verificacion?.data!==undefined){
        req.user=verificacion.data;
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
const rutasAdminRouter=require('./rutasAdmin' )
const rutasPublicRouter=require('./rutasPublic')
const rutasUsuarioRouter=require('./rutasUsuario')
//redirigir a los recursos segun la ruta

router.use('/rutasAdmin', verificarRol, rutasAdminRouter)
router.use('/rutasUsuario',verificarRol, rutasUsuarioRouter);
router.use('/rutasPublic',rutasPublicRouter);
router.use('/usuario', usuarioRouter);

module.exports=router;