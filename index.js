const express = require('express');
const app= express();
const apiRouter=require('./api/main');
const multer= require('multer')
const fs=require('node:fs')

const port = 3000;


const upload=multer({dest: 'uploads/'})
//tranforma body a json
app.use(express.json())
app.get('/',function(req,res,next){
        res.send('App Personas');


})

app.post('/images/single',upload.single("imagenObjeto") ,(req,res)=>{
        console.log(req.file)
        saveImage(req.file)
        res.send("Imágen subida")
        const sql = "INSERT INTO producto (ruta_imagen) VALUES (?)";
        conexion.query(sql, [newPath], (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error al guardar la ruta en la base de datos' });
            }

            res.json({
                status: "ok",
                mensaje: "Imagen subida y ruta guardada en la base de datos",
                ruta_imagen: newPath
            });
        });
    });

app.post('/images/multi', upload.array('photos', 8), (req,res)=>{
        req.files.map(saveImage);
        res.send('Imágenes Subida')

})


app.use('/api', apiRouter)


app.listen(port, ()=>{
console.log('Servidor en puerto' + port)

} )
