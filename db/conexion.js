const mysql=require('mysql');
const conexion=mysql.createConnection({

    host:'ctpoba.edu.ar',
    user:'poum',
    password:'47355966',
    database:'24_71_B'})

    conexion.connect(function(error){
        if(error){
            console.error(error)
            return;
        }console.log('Conectado correctamente a la base de datos')



    })
    module.exports={conexion}