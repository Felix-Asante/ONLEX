const mysql = require("mysql")

// DATABASE CONNECTION
function dbconnection(){
    const DBCONNECTION = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DATABASEKEY,
        database:process.env.DB,
        port:process.env.DB_PORT
    })
    
    DBCONNECTION.connect((err,result)=>{
        if(err){

            console.log("Connection echouer")
        }

        console.log("DB CONNECTED..")
    })

    return DBCONNECTION;

}
const db = dbconnection()

module.exports=db;