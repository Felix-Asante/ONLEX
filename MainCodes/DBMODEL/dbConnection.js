const mysql = require("mysql")

// DATABASE CONNECTION
function dbconnection(){
    const DBCONNECTION = mysql.createConnection({
        host:"34.122.38.19",
        user:"root",
        password:process.env.DATABASEKEY,
        database:"Onlex"
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