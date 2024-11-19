const router=require('express').Router();
const{ verificarToken }=require('@damianegreco/hashpass')

const TOKEN_SECRET = '47355966'

//terminar las rutas y seleccionar que rutas estan permitidas para el usuario
function rutasUsuario(req) { const rutasPermitidas = [ 
    '/rutasUsuario/ver/perfil/:id',
    '/rutasUsuario/ver/metodos_pago/:id?',
    '/rutasUsuario/ver/producto_compra/:id?',
    '/rutasUsuario/ver/envio/:id?',
    '/rutasUsuario/ver/compra/:id?',
    '/rutasUsuario/ver/usuario',
    '/rutasUsuario/agregar/carrito'
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

const verificarAutenticacion = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'Token no proporcionado' });
  }

  // Asumiendo que el token contiene el ID del usuario y la contraseña encriptada
  const [usuario_id, hash] = token.split('.');

  // Consultar la base de datos para obtener la contraseña del usuario
  const sql = 'SELECT contraseña FROM usuario WHERE id = ?';
  conexion.query(sql, [usuario_id], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send(error);
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const contraseña = results[0].contraseña;

    // Verificar la contraseña
    hashpass.verify(contraseña, hash).then(match => {
      if (!match) {
        return res.status(401).json({ message: 'Token inválido' });
      }

      req.usuario_id = usuario_id;
      next();
    }).catch(error => {
      console.error(error);
      res.status(500).send(error);
    });
  });
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