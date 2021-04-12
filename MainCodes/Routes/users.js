const express= require("express");
const router =  express.Router()
const Membre = require("../DBMODEL/Membre");
const bcrypt = require("bcryptjs")
const mysql = require("mysql")
const passport = require("passport")

// DATABASE CONNECTION
const DBCONNECTION = mysql.createConnection({
    host:"34.122.38.19",
    user:"root",
    password:process.env.DATABASEKEY,
    database:"Onlex"
})

DBCONNECTION.connect((err,result)=>{
    if(err)
    console.log("Connection echouer")
    // console.log("DB CONNECTED..")
})

// ! AUTH METHOD
const checkAuthentication = require("../OAuth/checkAuthenticated")
const checkNotAuthenticated = require("../OAuth/checkNotAuthenticated")

router.get("/login",checkNotAuthenticated, (req,res)=>{
    res.render("login",{message:""});
})

router.get("/createaccount",(req,res)=>{
    res.render("createaccount");
})

router.post("/createaccount",async (req,res)=>{
    const password = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password,password);
    const newMembre = new Membre(req.body.email,req.body.nom,req.body.prenom,hashedPassword)
    
    const sql ="INSERT INTO Onlex.Membre SET ?;"
    
    DBCONNECTION.query(sql,newMembre,(err,result)=>{

        if(err) throw err;
        console.log("New record added...")
    })
})

router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/membre/login', failureFlash: true }),
  function(req, res) {
    res.redirect("/membre/dashboard");
  });

router.post("/candidature",async (req,res)=>{
   
    if(req.body.filepond == null){
        res.redirect("/candidature")
    }
     
    const idconcour = Object.keys(req.body)[0].slice(25)

    const filepondEncodedImage = JSON.parse(req.body.filepond)
    const diplome = `data:${filepondEncodedImage.type};base64,${filepondEncodedImage.data}`
    const depot = {ville:req.body.city,telephone:req.body.tel,CNE:req.body.cne,dateNaissance:req.body.dateNaissance,adresse:req.body.adresse
    , sexe:req.body.gender,ecole:req.body.ecole,region:req.body.region,typeDeConcours:req.body.concours,typeDeDiplome:req.body.diplome,diplome:diplome,
    idConcours:idconcour}
   
    const sql = "UPDATE Onlex.Inscription SET ? WHERE email=?"
   DBCONNECTION.query(sql,[depot,req.body.email],function(err,result){
       if(err) throw err
       else{

    }
})

const message = "INSERT INTO Onlex.Notification(idConcours,email)VALUES(?,?)"
DBCONNECTION.query(message,[idconcour,req.body.email],(err,result)=>{
    if(err) throw err;
    res.render("registrationSucess")

   })

})

router.post("/facecapture",function(req,res){
    let sql;
    if(req.body.count==1){
        sql =`INSERT INTO  Onlex.Inscription(email,img${req.body.count})VALUES(?,?)`
        DBCONNECTION.query(sql,[req.body.email,req.body.image],function(err,result){
            if(err){throw err}
        })
    }
    else{
        sql =`UPDATE Onlex.Inscription SET img${req.body.count}=? WHERE email=?`
        DBCONNECTION.query(sql,[req.body.image,req.body.email],function(err,result){
            if(err) throw err
        })
        
    }
})
router.get("/dashboard",checkAuthentication, (req,res)=>{
    // let candidature,message;
    // const sql ="SELECT titre FROM Onlex.Candidat JOIN Onlex.Concours USING(idConcours) WHERE Membre_email=?";
    // DBCONNECTION.query(sql,req.user[0].email,(err,result)=>{
    //     if(err) throw err;
    //     console.log(req.user);
    //     candidature =result;
    // })
      const data="SELECT message,titre FROM Onlex.Notification JOIN  Onlex.Concours USING(idConcours) WHERE email=?"
    DBCONNECTION.query(data,req.user[0].email,(err,result)=>{
        if(err) throw err;
        // message= result;
        res.render("userDashBoard",{userName:req.user[0].prenom,candidature:result})

    })

})

// ! CANDIDATE LOGOUT
router.delete("/logout",(req,res)=>{
    req.logout();
    res.redirect("/")
})
module.exports =router;
