const express = require('express');
const app= express();
const apiRouter=require('./api/main');
const multer= require('multer')


const port = 3000;


const upload=multer({dest: 'uploads/'})
//tranforma body a json
app.use(express.json())
app.get('/',function(req,res,next){
        res.send('App Personas');


})


app.use('/api', apiRouter)


app.listen(port, ()=>{
console.log('Servidor en puerto ' + port)

} )
