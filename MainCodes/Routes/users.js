const express= require("express");
const router =  express.Router()
const Membre = require("../DBMODEL/Membre");
const bcrypt = require("bcryptjs")
const mysql = require("mysql")
const passport = require("passport")

// DATABASE CONNECTION
const DBCONNECTION = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DATABASEKEY,
    database:process.env.DB,
    port:process.env.DB_PORT
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

        res.redirect("/membre/dashboard")
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

      const data="SELECT message,titre FROM Onlex.Notification JOIN  Onlex.Concours USING(idConcours) WHERE email=?"
    DBCONNECTION.query(data,req.user[0].email,(err,result)=>{
        if(err) throw err;
        // message= result;


        DBCONNECTION.query("CALL  ExamNotification(?)",req.user[0].email, function(err,Notification){
            if(err) throw err;
         console.log(Notification[0])
            res.render("userDashBoard",{userName:req.user[0].prenom,candidature:result,notification:Notification[0]})
        })

    })

})

// ! affiche resultat
router.get('/afficheresultat',(req,res)=>{
    let sql ='SELECT nom,prenom,titre,note FROM Onlex.Membre JOIN Onlex.Note USING(email) JOIN Onlex.Concours USING(idConcours) WHERE Concours.idConcours=?'
    DBCONNECTION.query(sql,req.query.test, (err,result)=>{
        if(err) throw err;
       const head =['No.','nom','prenom','Note']
       res.render('afficheResultat',{head:head,resultat:result})
    })
})

// ! CANDIDATE LOGOUT
router.delete("/logout",(req,res)=>{
    req.logout();
    res.redirect("/")
})
module.exports =router;
