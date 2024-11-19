const router = require('express').Router();
const rutasPublic = require('./rutasPublic');
const { conexion } = require('../db/conexion');
const hashpass = require('@damianegreco/hashpass');

// Función para verificar la autenticación del usuario
const verificarAutenticacion = (req, res, next) => {
  const token = req.headers['Authorization'];

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

router.use(rutasPublic);

router.get('/ver/metodos_pago/:id?', function(req, res) {
  const { id } = req.params;
  const sql = id ? "SELECT * FROM metodo_pago WHERE id=?" : "SELECT * FROM metodo_pago";
  conexion.query(sql, id ? [id] : [], function(error, result) {
    if (error) {
      console.error(error);
      return res.status(500).send(error);
    }
    res.json({ status: "ok", metodo_pago: result });
  });
});

router.get('/ver/producto_compra/:id?', function(req, res) {
  const { id } = req.params;
  const sql = id ? "SELECT * FROM producto_compra WHERE id=?" : "SELECT * FROM producto_compra";
  conexion.query(sql, id ? [id] : [], function(error, result) {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error en la consulta' });
    }
    res.json({ status: "ok", producto_compra: result });
  });
});

router.get('/ver/envio/:id?', function(req, res) {
  const id = req.params.id;
  const sql = id ? "SELECT * FROM envio WHERE id=?" : "SELECT * FROM envio";
  conexion.query(sql, id ? [id] : [], function(error, result) {
    if (error) {
      console.error(error);
      return res.status(500).send(error);
    }
    res.json({ status: "ok", envio: result.length > 0 ? result[0] : null });
  });
});

router.get('/ver/compra/:id?', function(req, res) {
  const id = req.params.id;
  const sql = id ? "SELECT * FROM compra WHERE id=?" : "SELECT * FROM compra";
  conexion.query(sql, id ? [id] : [], function(error, result) {
    if (error) {
      console.error(error);
      return res.status(500).send(error);
    }
    res.json({ status: "ok", compra: result });
  });
});

router.post('/agregar/carrito', (req, res) => {
    const { usuario_id, productos } = req.body;

    if (!usuario_id || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ error: 'Se requiere un usuario y una lista de productos válida.' });
    }

    const values = productos.map(producto => [usuario_id, producto.producto_id, producto.cantidad]);

    const sql = 'INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES ?';

    conexion.query(sql, [values], (error, result) => {
        if (error) {
            console.error('Error al agregar productos al carrito:', error);
            return res.status(500).json({ error: 'Ocurrió un error al agregar productos al carrito.' });
        }

        res.json({
            status: 'ok',
            mensaje: 'Productos agregados al carrito correctamente.',
            insertados: result.affectedRows
        });
    });
});

router.get('/ver/carrito/:id', (req, res) => {
  const  id  = req.params.id;
  const sql = 'SELECT * FROM carrito WHERE id = ?';
  conexion.query(sql, [id], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send(error);
    }
    res.json({ status: "ok", carrito: results });
  });
});

router.delete('/eliminar/carrito/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM carrito WHERE id = ?';
  conexion.query(sql, [id], (error, result) => {
    if (error) {
      console.error(error);
      return res.status(500).send(error);
    }
    res.json({ status: "ok", result });
  });
});

module.exports = router;