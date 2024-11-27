const router = require('express').Router();
const { conexion } = require('../db/conexion');
const rutasPublic = require('./rutasPublic');

router.use(rutasPublic);

router.get('/ver/producto_compra/:id?', function(req, res) {
    const { id } = req.params;
    const sql = id ? "SELECT * FROM producto_compra WHERE id=?" : "SELECT * FROM producto_compra";

    conexion.query(sql, id ? [id] : [], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error en la consulta' });
        }

        res.json({
            status: "ok",
            producto_compra: result
        });
    });
});

router.get('/ver/perfil/:id', function(req, res) {
    const id = req.params.id;
    const sql = "SELECT nombre_completo, mail, fecha_nac, nombre_usuario, telefono FROM usuario WHERE id = ?";
    
    conexion.query(sql, [id], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error en la consulta' });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json({
            status: 'ok',
            usuario: result[0]
        });
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

        res.json({
            status: "ok",
            envio: result.length > 0 ? result[0] : null
        });
    });
});

router.get('/ver/compra/:id?', function(req, res, next) {
    const id = req.params.id;
    const sql = id ? "SELECT * FROM compra WHERE id=?" : "SELECT * FROM compra";

    conexion.query(sql, id ? [id] : [], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

        res.json({
            status: "ok",
            compra: result
        });
    });
});
router.post('/registrar/envio', (req, res) => {
    const { id_usuario, codigo_postal, calle, numero, ciudad, informacion_adicional } = req.body;
  
    if (!id_usuario || !codigo_postal || !calle || !numero || !ciudad) {
      return res.status(400).json({ error: 'Todos los campos son requeridos, excepto la información adicional' });
    }
  
    const sql_insert_envio = `
      INSERT INTO envio (id_usuario, codigo_postal, calle, numero, ciudad, informacion_adicional) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  
    conexion.query(sql_insert_envio, [id_usuario, codigo_postal, calle, numero, ciudad, informacion_adicional], (error, result) => {
      if (error) {
        console.error('Error al crear el envío:', error);
        return res.status(500).json({ error: 'Error al crear el envío: ' + error.sqlMessage });
      }
  
      const id_envio = result.insertId;
      res.json({ status: "ok", id_envio });
    });
  });
  
  router.post('/registrar/compra', (req, res) => {
    const { precio_total, id_envio, carrito } = req.body;
  
    if (precio_total == null || id_envio == null || !Array.isArray(carrito) || carrito.length === 0) {
      return res.status(400).json({ error: 'El precio total, el id_envio, y el carrito son requeridos.' });
    }
  
    const sql_insert_compra = "INSERT INTO compra (precio_total, id_envio) VALUES (?, ?)";
    conexion.query(sql_insert_compra, [precio_total, id_envio], (error, resultInsert) => {
      if (error) {
        console.error('Error al insertar el registro de compra:', error);
        return res.status(500).send({ error: 'Ocurrió un error al insertar el registro de compra' });
      }
  
      const compra_id = resultInsert.insertId;
  
      carrito.forEach((producto, index) => {
        const { id_producto, cantidad, precio_unitario, id_talle } = producto;
        if (!id_producto || !precio_unitario) {
          return res.status(400).send({ error: 'El id_producto y el precio_unitario son requeridos.' });
        }
  
        const sql_insert_producto_compra = "INSERT INTO producto_compra (id_producto, id_compra, cantidad, precio_unitario) VALUES (?, ?, ?, ?)";
        conexion.query(sql_insert_producto_compra, [id_producto, compra_id, cantidad, precio_unitario], (error, result) => {
          if (error) {
            console.error('Error al insertar producto_compra:', error.sqlMessage);
            return res.status(500).send({ error: 'Error al insertar producto_compra: ' + error.sqlMessage });
          }
  
          const sql_update_stock = "UPDATE producto_talle SET stock = stock - ? WHERE id_producto = ? AND id_talle = ?";
          conexion.query(sql_update_stock, [cantidad, id_producto, id_talle], (error, result) => {
            if (error) {
              console.error('Error al actualizar el stock:', error.sqlMessage);
              return res.status(500).send({ error: 'Error al actualizar el stock: ' + error.sqlMessage });
            }
            if (index === carrito.length - 1) {
              res.json({ status: "ok", compra_id });
            }
          });
        });
      });
    });
  });

module.exports = router;
