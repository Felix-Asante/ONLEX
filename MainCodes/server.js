const express = require("express")
const app = express()
const ejs = require("ejs")
const dotenv =require("dotenv").config();
const path = require("path")
const fileUpload =require("express-fileupload")
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")

// * DB CONNECTION STRING
const DBCONNECTION =require("./DBMODEL/dbConnection")

// ! OAuth
const checkAuthenticated = require("./OAuth/checkAuthenticated")
const checkNotAuthenticated = require("./OAuth/checkNotAuthenticated")

// * ROUTERS
const membre =  require("./Routes/users");
const admin = require("./Routes/admin")
const Questions = require("./Routes/question")

// ! PASSPORT CONFIG 
const initializePassportAuth = require("./OAuth/passport-config")
initializePassportAuth(passport);

// ! AUTHENTICATION MIDDLEWARE AND METHODS
app.use(flash())
app.use(session({
    secret:process.env.SECRETKEY,
    resave:false,
    saveUninitialized:false,
    // ! CHANGE TO TRUE BEFORE DEPLOYING ELSE DESERIALISEUSER WILL FAIL
    cookie: { 
        secure: false
    }
}))
app.use(passport.initialize())
app.use(passport.session())

// * METHOD OVERRIDE
app.use(methodOverride('_method'))

// * INCLUDE DATABASE MODELS

// PORT USED
const PORT = process.env.PORT || 8080;

// * VIEW ENGINE SETUP AND BODY-PARSER
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.set('view engine',"ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(fileUpload())
app.use(express.static(path.join(__dirname + "/FrontEnd/public/")));

// app.use(express.static("FrontEnd/public/styles"));

app.get("/",(req,res)=>{
    let annonce, concour,resultat;
    console.log(req.user)
    DBCONNECTION.query("SELECT * FROM Onlex.Annonce", (err,result)=>{
        if(err) throw err;

        if(result.length<0)
        annonce =""
        else{
            annonce =result;
        }
    })
    DBCONNECTION.query("SELECT * FROM Onlex.Concours", (err,result)=>{
        if(err) throw err;

        concour = result;

    })
    
    const sql3 = 'SELECT Concours.idConcours,titre FROM Onlex.Concours WHERE idConcours IN(SELECT idConcours FROM Onlex.Note)'
    DBCONNECTION.query(sql3, function(err,note){
        if(err) throw err;
        resultat=note;
        console.log("res:",resultat)
        res.render("index",{annonce:annonce,concours:concour,resultat:resultat})
        })
})

app.get('/candidature', checkAuthenticated,(req,res)=>{
    res.render('candidature',{idConcour:req.query.xml_data_map});
})

//routes
app.use("/membre",membre)
app.use("/Admin",admin)
app.use("/question",Questions)
app.use("/exams",require("./Routes/exams"))
//server
app.listen(PORT , ()=>{
    console.log(`server launched at ${PORT} `);
})