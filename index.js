const express = require('express');
const app = express();
const apiRouter = require('./api/main');
const port = 3000;
const cors = require('cors');

// Transforma body a JSON
app.use(express.json());

app.get('/', function(req, res, next) {
    res.send('App Personas');
});

// Configuración de CORS
app.use(cors({
    origin: 'http://localhost:5173', // Dirección del frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'] // Permitir el header 'Authorization'
}));

app.use('/api', apiRouter);

app.listen(port, () => {
    console.log('Servidor en puerto ' + port);
});
