const express = require('express');
const { conexion } = require('../db/conexion');
const router = express.Router();

router.post('/', (req, res) => {
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
            console.error(error);
            return res.status(500).json({ error: 'Error al crear el envío' });
        }

        res.json({
            status: "ok",
            id_envio: result.insertId
        });
    });
});

router.get('/', (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'El id es requerido' });
    }

    const sql = `
        SELECT envio.*, usuarios.nombre_completo, usuarios.mail, usuarios.telefono 
        FROM envio 
        INNER JOIN usuarios ON envio.id_usuario = usuarios.id 
        WHERE envio.id = ?
    `;
    
    conexion.query(sql, [id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al obtener el envío' });
        }

        res.json({
            status: "ok",
            envio: result[0] || null
        });
    });
});

router.put('/', (req, res) => {
    const { id } = req.query;
    const { id_usuario, codigo_postal, calle, numero, ciudad, informacion_adicional } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'El id del envío es requerido' });
    }

    const sql_update_envio = `
        UPDATE envio 
        SET id_usuario = ?, codigo_postal = ?, calle = ?, numero = ?, ciudad = ?, informacion_adicional = ?
        WHERE id = ?
    `;
    
    conexion.query(sql_update_envio, [id_usuario, codigo_postal, calle, numero, ciudad, informacion_adicional, id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al actualizar el envío' });
        }

        res.json({
            status: "ok",
            affectedRows: result.affectedRows
        });
    });
});

router.delete('/', (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'El id del envío es requerido' });
    }

    const sql_delete_envio = "DELETE FROM envio WHERE id = ?";
    
    conexion.query(sql_delete_envio, [id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al eliminar el envío' });
        }

        res.json({
            status: "ok",
            affectedRows: result.affectedRows
        });
    });
});

module.exports = router;
