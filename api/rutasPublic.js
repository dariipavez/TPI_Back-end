const router = require('express').Router();
const { conexion } = require('../db/conexion');

router.get("/ver/producto/:id?", function(req, res) {
    const id = req.params.id;
    const baseUrl = 'http://localhost:3000/';
    let sql;
    let queryParams = [];
  
    if (id) {
      sql = `
        SELECT 
          p.id, p.nombre, p.precio, 
          t.id AS id_talle, t.talle, pt.stock, p.ruta_imagen 
        FROM producto p
        JOIN producto_talle pt ON p.id = pt.id_producto
        JOIN talle t ON pt.id_talle = t.id
        WHERE p.id = ?`;
      queryParams = [id];
    } else {
      sql = `
        SELECT 
          p.id, p.nombre, p.precio, 
          t.id AS id_talle, t.talle, pt.stock, p.ruta_imagen 
        FROM producto p
        JOIN producto_talle pt ON p.id = pt.id_producto
        JOIN talle t ON pt.id_talle = t.id`;
    }
  
    conexion.query(sql, queryParams, function(error, results) {
      if (error) {
        console.error(error);
        return res.status(500).send(error);
      }
  
      if (id) {
        if (results.length === 0) {
          return res.status(404).json({ error: "Producto no encontrado" });
        }
  
        const producto = {
          id: results[0].id,
          nombre: results[0].nombre,
          precio: results[0].precio,
          ruta_imagen: baseUrl + results[0].ruta_imagen.replace(/\\/g, '/'),
          talles: results.map(result => ({
            id: result.id_talle,
            talle: result.talle,
            stock: result.stock
          }))
        };
  
        res.json({
          status: "ok",
          producto: producto,
        });
      } else {
        const productosMap = new Map();
  
        results.forEach(result => {
          if (!productosMap.has(result.id)) {
            productosMap.set(result.id, {
              id: result.id,
              nombre: result.nombre,
              precio: result.precio,
              ruta_imagen: baseUrl + result.ruta_imagen.replace(/\\/g, '/'),
              talles: []
            });
          }
          productosMap.get(result.id).talles.push({
            id: result.id_talle,
            talle: result.talle,
            stock: result.stock
          });
        });
  
        const productos = Array.from(productosMap.values());
  
        res.json({
          status: "ok",
          productos: productos,
        });
      }
    });
  });

router.get('/ver/producto/nombre', function (req, res) {
    const sql = `
        SELECT 
            p.id, p.nombre, p.precio, 
            tp.nombre AS tipo_producto, 
            m.nombre AS marca, 
            t.talle, 
            pt.stock, 
            p.ruta_imagen
        FROM producto p
        JOIN tipo_producto tp ON p.id_tipo_producto = tp.id
        JOIN marca m ON p.id_marca = m.id
        JOIN producto_talle pt ON p.id = pt.id_producto
        JOIN talle t ON pt.id_talle = t.id`;

    conexion.query(sql, function (error, resultados) {
        if (error) {
            console.error('Error al obtener los productos:', error);
            return res.status(500).send({ error: 'Error al obtener los productos' });
        }

        resultados.forEach(producto => {
            if (producto.ruta_imagen) {
                const baseUrl = 'http://localhost:3000/';
                producto.ruta_imagen = baseUrl + producto.ruta_imagen.replace(/\\/g, '/');
            }
        });

        res.json({
            status: "ok",
            productos: resultados
        });
    });
});


router.get("/ver/producto/categoria/:id_categoria", function(req, res) {
    const id_categoria = req.params.id_categoria;
    const baseUrl = 'http://localhost:3000/';

    if (!id_categoria) {
        return res.status(400).json({
            status: "error",
            mensaje: "El id de la categoría es obligatorio"
        });
    }

    const sql = `
        SELECT 
            p.id, p.nombre, p.precio, 
            pt.stock, p.ruta_imagen 
        FROM producto p
        JOIN producto_talle pt ON p.id = pt.id_producto
        JOIN tipo_producto tp ON p.id_tipo_producto = tp.id
        WHERE tp.id_categoria = ?`;

    conexion.query(sql, [id_categoria], function(error, results) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: "Error al obtener los productos" });
        }

        if (results.length === 0) {
            return res.status(404).json({
                status: "error",
                mensaje: "No se encontraron productos para la categoría seleccionada"
            });
        }
        results.forEach(producto => {
            if (producto.ruta_imagen) {
                producto.ruta_imagen = baseUrl + producto.ruta_imagen.replace(/\\/g, '/');
            }
        });

        res.json({
            status: "ok",
            productos: results
        });
    });
});

router.get('/ver/marca/:id?', function(req, res) {
    const id = req.params.id;
    const sql = id ? "SELECT id, UPPER(nombre) AS nombre FROM marca WHERE id=?" : "SELECT id, UPPER(nombre) AS nombre FROM marca ORDER BY nombre ASC";

    conexion.query(sql, id ? [id] : [], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok",
            marca: result
        });
    });
});

router.get('/ver/talle/tipo_producto/:id_tipo_producto', function(req, res) {
    const idTipoProducto = req.params.id_tipo_producto;
    
    if (!idTipoProducto) {
        return res.status(400).json({ 
            status: "error", 
            mensaje: "El id_tipo_producto es obligatorio"
        });
    }
    
    let orderClause = '';
    const sqlTipoProducto = 'SELECT nombre FROM tipo_producto WHERE id = ?';
    
    conexion.query(sqlTipoProducto, [idTipoProducto], function(error, result) {
        if (error) {
            console.error('Error al consultar tipo_producto:', error);
            return res.status(500).send(error);
        }

        const tipoProducto = result[0]?.nombre.toLowerCase();
        
        if (tipoProducto === 'buzo' || tipoProducto === 'remera') {
            orderClause = "ORDER BY FIELD(talle, 'S', 'M', 'L', 'XL', 'XXL')";
        } else if (tipoProducto === 'pantalon') {
            orderClause = "ORDER BY CAST(SUBSTRING_INDEX(talle, ' ', -1) AS UNSIGNED)";
        } else if (tipoProducto === 'zapatillas') {
            orderClause = "ORDER BY CAST(talle AS UNSIGNED)";
        }

        const sql = `
        SELECT talle.id, UPPER(talle.talle) as talle
        FROM talle
            JOIN tipo_producto ON talle.id_tipo_producto = tipo_producto.id 
            WHERE tipo_producto.id = ?
            ${orderClause}
        `;
        
        conexion.query(sql, [idTipoProducto], function(error, result) {
            if (error) {
                console.error('Error al consultar talles:', error);
                return res.status(500).send(error);
            }
            res.json({
                status: "ok",
                talles: result
            });
        });
    });
});



router.get('/ver/talle/:id?', function(req, res) {
    const id = req.params.id;
    const sql = id ? "SELECT * FROM talle WHERE id=?" : "SELECT * FROM talle";

    conexion.query(sql, id ? [id] : [], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        res.json({
            status: "ok",
            talles: result
        });
    });
});

router.get("/ver/categoria/:id?", function(req, res) {
    const id = req.params.id;
    const sql = id ? "SELECT * FROM categoria WHERE id=?" : "SELECT * FROM categoria";

    conexion.query(sql, id ? [id] : [], function(error, result) {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

        res.json({
            status: "ok",
            categorias: result
        });
    });
});

router.get('/ver/tipo_producto',function (req,res){
    const id=req.params.id;
    const sql='SELECT * FROM tipo_producto'
    conexion.query(sql,id,function(error,result){
        if (error){
            console.error(error);
            return res.status(500).send(error)
        }
        res.json({
            status:"ok",
            tipo_producto:result
        })
    })
})

module.exports = router;
