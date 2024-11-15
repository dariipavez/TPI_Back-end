const mysql=require('mysql');
const conexion=mysql.createConnection({
    host:'ctpoba.edu.ar',
    user:'pavezd',
    password:'46087388',
    database:'24_71_B'})

    conexion.connect(function(error){
        if(error){
            console.error(error)
            return;
        }console.log('Conectado correctamente a la Base de Datos')



    })
    module.exports={conexion}