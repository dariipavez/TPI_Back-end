const express = require('express');
const app= express();
const apiRouter=require('./api/main');
const port = 3000;
const cors=require('cors')

//tranforma body a json
app.use(express.json())
app.get('/',function(req,res,next){
        res.send('App Personas');


})
app.use(cors());

app.use('/api', apiRouter)


app.listen(port, ()=>{
console.log('Servidor en puerto ' + port)

} )
