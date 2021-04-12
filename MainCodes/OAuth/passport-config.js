const LocalStrategy = require('passport-local').Strategy
const bcrypt = require("bcryptjs")
const DBCONNECTION = require("../DBMODEL/dbConnection")

function initialize(passport){

    const authenticateUser = async (email,password,done)=>{

         DBCONNECTION.query("SELECT * FROM Onlex.Membre WHERE email=?",email, async function(err,user){

            // ! console.log(user)   
            if(err){
                console.log(err)
                return done (null,false,{message:"DB ERROR"})
            }
            else{
                
                if(user == null || user.length === 0){
                    return done (null,false,{message:"EMAIL DOESN'T EXIST"})
                }
                try{    
                            if( await bcrypt.compare(password,user[0].password)){
                               return done(null,user,{message:"WELCOME"})
                            }
                            else{
                                return done(null,false,{message:"PASSWORD INCORRECT"})
                            }
                        
                }catch(err){
                    return done(err)
                }

            }
         })

    }
    
    passport.use(new LocalStrategy({usernameField:"email",passwordField: 'password'},authenticateUser))
    passport.serializeUser((user,done)=> {
        done(null,user[0].email)
        
    })

    passport.deserializeUser((email,done)=>{
        console.log('de:',email)
        DBCONNECTION.query(`SELECT * FROM Onlex.Membre WHERE email=?`,email,function(err,user){       
            done(err,user)
        })
    })
}

module.exports = initialize;