const express= require("express");
const router =  express.Router()
const DBCONNECTION =require("../DBMODEL/dbConnection")
const bcrypt = require("bcryptjs")

let countAnnonce =0;
let countCandidat=0;
let countQuestion;
let reg,resultat;

// * DISPLAY ADMIN DASHBOARD

router.get("/", (req,res)=>{
    DBCONNECTION.query("SELECT COUNT(idAnnonce) AS count FROM Onlex.Annonce",(err,result)=>{
        if(err) throw err;
        console.log(result)
        countAnnonce = result[0].count;
    })
    DBCONNECTION.query("SELECT * FROM Onlex.Inscription", (err,result)=>{
        if(err) throw err;
            reg=result;
        })
        DBCONNECTION.query("SELECT COUNT(idCandidat) AS count FROM Onlex.Candidat",(err,result)=>{
            if(err) throw err;
            console.log(result)
            countCandidat = result[0].count;
        })
        DBCONNECTION.query("SELECT COUNT(idQuestion) AS count FROM Onlex.Question",(err,result)=>{
            if(err) throw err;
            console.log(result)
            countQuestion = result[0].count;
        })
        res.render("adminDashboard",{nbannonce:countAnnonce,test:true,registration:reg,nbcandidat:countCandidat,nbquestion:countQuestion})
})

// * ADMIN LOGIN PAGE

router.get("/login",(req,res)=>{
    res.render("adminlogin",{message:""})
})

// * REGISTER ADMIN
router.post("/createadmin",async (req,res)=>{
    const sql ="INSERT INTO Onlex.Admin SET ?"
    const passSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password,passSalt);
    const admin ={"Pseudo": req.body.pseudo, "password":hashedPassword}
   DBCONNECTION.query(sql,admin,(err,result)=>{
       if(err) throw err;
       console.log(result)
   })
})

// * ADMIN LOGIN AUTHENTICATION
router.post("/login",async (req,res)=>{
    const sql ="SELECT * FROM Onlex.Admin WHERE Pseudo=?"
    DBCONNECTION.query(sql,req.body.pseudo,async(err,result)=>{
        if(err) throw err;
        // console.log(result.length)
       if(result.length>0){
           try{
               
               const verifyPassword = await bcrypt.compare(req.body.password,result[0].password);
               if(verifyPassword){
                   res.redirect("/admin")
               }
               
               else{
                   res.render("adminlogin",{message:"Wrong Password!"})
               }
               // console.log(result)
           }catch(err){console.log(err)}
       }
       else{
        res.render("adminlogin",{message:"User doesn't Exist!"})
       }
       
   })
})

// * CREATE ANNONCE
router.post("/createannonce", (req, res)=>{
    const sql = 'INSERT INTO Onlex.Annonce SET ?'
    DBCONNECTION.query(sql,req.body,(err,result)=>{
        if(err) throw err;
        console.log("Annonce inserted");
        res.redirect("/Admin")
    }
)})

// * DISPLAY ALL ANNONCE IN FE
router.get("/afficheannonce",(req,res)=>{
    
    DBCONNECTION.query("SELECT titre,description FROM Onlex.Annonce WHERE idAnnonce=?", req.query.id,(err,result)=>{
        if(err) throw err;
        res.render("annoncepage",{annonce:result[0]})
    })
})

// * DISPLAY ALL ANNONCE AT ADMIN DASHBOARD
router.get("/annonce",(req,res)=>{ 
    const sql = "SELECT idAnnonce,titre FROM Onlex.Annonce"
    DBCONNECTION.query(sql,(err,result)=>{
        if (err) throw err;
        const column = ["No.","Annonce"]
        if(result.length>0){
        res.render("adminDashboard",{test:false,head:column,data:result,db:"Annonce",id:"",titre:"",description:"",corriger:false,concours:''})

        }
    })
})

// * UPDATE ANNONCE POST
 router.post("/updateannonce",(req,res)=>{
 const id = Object.keys(req.body)[2].slice(8);
const sql = "UPDATE Onlex.Annonce SET ? WHERE idAnnonce=?"
const Annonce = {titre:req.body.titre,description:req.body.description}
console.log(id)

     DBCONNECTION.query(sql,[Annonce,id],(err,result)=>{
         if(err) throw err;
         res.redirect("/Admin/annonce")
     })
 })


// * DELETE ANNONCE AND CONCOUR
router.get("/delete",(req,res)=>{
    let id; let redirectPath;

    if(req.query.source==="Annonce"){
        id="idAnnonce"
        redirectPath="annonce"
    }
     else if(req.query.source==="Concours"){
         id="idConcours"
         redirectPath="concours"
     }
    const sql = `DELETE FROM ${req.query.source} WHERE ${id}=${req.query.itemaccess}`;

    DBCONNECTION.query(sql,(err,result)=>{
        if(err) throw err;
        res.redirect(`/Admin/${redirectPath}`);
    })
})

// * UPDATE ANNONCE AND CONCOUR FORM DISPLAY
router.get("/update",(req,res)=>{

    let column = []
    let annonce
    let id; let sql,displayId;

    // ! UPDATE ANNONCE DISPLAY
    if(req.query.source==="Annonce"){
        id="idAnnonce"
        displayId="create-annonce"
        column = ["No.","Annonce"]

         sql = "SELECT idAnnonce,titre FROM Onlex.Annonce"
        DBCONNECTION.query(sql,(err,result)=>{
            if (err) throw err;
            annonce=result;
            
        })
        DBCONNECTION.query(`SELECT * FROM ${req.query.source} WHERE ${id}=${req.query.itemaccess}`,(err,result)=>{

            if(err) throw err;
            res.render("adminDashboard",{test:false,head:column,data:annonce,db:req.query.source,id:displayId,titre:result[0].titre,description:result[0].description,idConcour:result[0].idAnnonce,corriger:false,concours:''})
        })
    }

    // ! UPDATE CONCOURS FORM DISPLAY

    else if(req.query.source=='Concours'){
        id = "idConcours"
        displayId="update-concour"
         column = ["No.","Titre","Ecole"]

         sql = "SELECT idConcours,titre,ecole FROM Onlex.Concours"
        DBCONNECTION.query(sql,(err,result)=>{
        if (err) throw err;
        annonce=result;       
     })

     DBCONNECTION.query(`SELECT * FROM ${req.query.source} WHERE ${id}=${req.query.itemaccess}`,(err,result)=>{

        if(err) throw err;
        res.render("adminDashboard",{test:false,head:column,data:annonce,db:req.query.source,id:displayId,result:result[0],corriger:false,concours:''})
    })
        
    }

   
  
})


// * CREATE CONCOUR
router.post("/createconcours",(req,res)=>{

    if(req.body != " " || req.body !=null){
        DBCONNECTION.query("INSERT INTO Onlex.Concours SET ?",req.body,(err,result)=>{
            if (err) throw err;
            console.log("Concour Created..")
            res.redirect("/Admin/")
        })
    }
    else{

        res.redirect("/Admin/")
    }

})

// * DISPLAY CONCOURS ON ADMIN DASHBOARD
router.get('/concours', (req,res)=>{
    const sql = "SELECT idConcours,titre,ecole FROM Onlex.Concours"
    DBCONNECTION.query(sql,(err,result)=>{
        if (err) throw err;
        const column = ["No.","Titre","Ecole"]
        if(result.length>0){
        res.render("adminDashboard",{test:false,head:column,data:result,db:"Concours",id:"",titre:"",description:"",corriger:false,concours:''})

        }
    })
})


// * UPDATE CONCOUR
router.post('/updateconcours',(req,res)=>{
 const id = Object.keys(req.body)[5].slice(8);
 const newConcourDetails = {titre:req.body.titre,ecole:req.body.ecole,description:req.body.description,dateDepot:req.body.dateDepot,dateFin:req.body.dateFin}

 console.log(newConcourDetails);

 DBCONNECTION.query("UPDATE Onlex.Concours SET ? WHERE idConcours=?",[newConcourDetails,id], function(err,result){
     if(err) throw err;
     res.redirect("/Admin/concours")
 })
})

// * DISPLAY CONCOUR PAGE

router.get("/afficheconcours",(req,res)=>{
    
    DBCONNECTION.query("SELECT idConcours,titre,description FROM Onlex.Concours WHERE idConcours=?", req.query.id,(err,result)=>{
        if(err) throw err;
        res.render("concourPage",{concours:result[0]})
    })
})

// * MANAGE NEW REGISTRATION
router.get('/afficheregistration',(req,res)=>{
    DBCONNECTION.query('CALL AfficheRegistration(?)',req.query.src,(err,result)=>{
        if(err) throw err;
        res.render("afficheRegistration",{candidat:result[0][0]});
    })
})

// * DELETE REGISTRATION
router.get("/rejectregistration",(req,res)=>{
    DBCONNECTION.query("CALL DeleteRegistration(?)",req.query.src,(err,result)=>{
        if(err) throw err;
    })
    res.redirect(303,"/Admin/")
})

router.get("/validregistration",(req,res)=>{
    DBCONNECTION.query("CALL validRegistration(?)",req.query.src,(err,result)=>{
        if(err) throw err;
        res.redirect("/Admin/")
    })
})


// ! CORRIGE CONCOURS
router.get("/exams/corrige", (req,res)=>{

    const sql ="SELECT Concours.idConcours,titre,dateOuverture,heureOuverture FROM Onlex.Concours JOIN Onlex.Questionnaire USING(idConcours) WHERE idConcours NOT IN (SELECT idConcours FROM Onlex.Note)"

    // * TIME OUVERTURE
    const date= new Date()
    let dateNow,dateTime,HeureActuelle,HeureRelle;
    const concours =[]

    DBCONNECTION.query(sql, function(err,data){
        if(err) throw err;
        
        for(let i=0; i<data.length;i++)
        {
            dateTime = data[i].heureOuverture+":00"
            dateOuverture = data[i].dateOuverture
            
             HeureRelle = new Date(dateTime).getTime()
             HeureActuelle = new Date().getTime()

            dateNow = date.getFullYear() + "-" + (date.getMonth()+1)+ "-" + date.getDate()

            if(date.getMonth()<10 ){
                dateNow = date.getFullYear() + "-" + ("0"+(date.getMonth()+1))+ "-" + date.getDate()
            }
        
            if(date.getDate()<10){
        
                dateNow = date.getFullYear() + "-" + (date.getMonth()+1)+ "-"+ "0"+date.getDate()
            }
            
            if(date.getDate()<10 && date.getMonth()<10){
                dateNow = date.getFullYear() + "-" + ("0"+(date.getMonth()+1))+ "-" + "0"+date.getDate()
            }

            if((dateNow>dateOuverture)){
                concours.push(data[i])
            }
            
        }
        res.render("adminDashboard",{test:false,head:'',data:'',db:"",id:"",titre:"",description:"",corriger:true,concours:concours})
        
    })
    
})


module.exports = router;