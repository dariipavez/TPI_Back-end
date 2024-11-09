const express = require('express');
const { conexion } = require('../db/conexion');
const router = express.Router();

router.post('/', (req, res) => {
    const { nombre } = req.body;
    
    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const sql = "INSERT INTO marca (nombre) VALUES (?)";
    
    conexion.query(sql, [nombre], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al crear la marca' });
        }
        
        res.json({
            status: "ok",
            id: result.insertId
        });
    });
});

router.get('/', (req, res) => {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({ error: 'El id es requerido' });
    }

    const sql = "SELECT * FROM marca WHERE id = ?";
    
    conexion.query(sql, [id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al obtener la marca' });
        }
        
        res.json({
            status: "ok",
            marca: result[0] || null
        });
    });
});

router.put('/', (req, res) => {
    const { id } = req.query;
    const { nombre } = req.body;

    if (!id || !nombre) {
        return res.status(400).json({ error: 'ID y nombre son requeridos' });
    }

    const sql = "UPDATE marca SET nombre = ? WHERE id = ?";
    
    conexion.query(sql, [nombre, id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al actualizar la marca' });
        }
        
        res.json({
            status: "ok",
            affectedRows: result.affectedRows
        });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM marca WHERE id = ?";
    
    conexion.query(sql, [id], (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al eliminar la marca' });
        }
        
        res.json({
            status: "ok",
            affectedRows: result.affectedRows
        });
    });
});

module.exports = router;