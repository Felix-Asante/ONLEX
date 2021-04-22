const DBCONNECTION = require('../DBMODEL/dbConnection')
const express = require("express");
const { response } = require('express');
const router = express.Router()

// ! ATTEMPT EXAMS
router.get("/attempt", function(req,res){
    const idConcours = req.query.attempt_id;
    DBCONNECTION.query("SELECT dateOuverture,heureOuverture,duree FROM Onlex.Questionnaire WHERE idConcours=?",idConcours, function(err,concourDate){
        if(err) throw err;
        
        const dateOuverture =concourDate[0].dateOuverture.toString()
        const date= new Date()
        let dateNow;
        // * TIME OUVERTURE
        const dateTime = dateOuverture+ " "+concourDate[0].heureOuverture+":00"
        const HeureRelle = new Date(dateTime).getTime()
        const HeureActuelle = new Date().getTime()
        
    //    * DATE OUVERTURE
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
    
        // ! Comaprere DateOuverture,HeureOuverture et Date et Temp Now
        
        if((dateNow<dateOuverture || HeureActuelle<HeureRelle)){
            res.render("avantDateConcours",{date:dateOuverture,time:concourDate[0].heureOuverture,test:1})
        }

        else if((dateNow==dateOuverture && HeureActuelle==HeureRelle) || ((dateNow==dateOuverture && HeureActuelle>HeureRelle) && (dateNow==dateOuverture && HeureActuelle<=new Date(HeureRelle +30*60000).getTime()) )){
            res.render("avantDateConcours",{test:3,idConcours:idConcours})

        }
        else{
            res.render("avantDateConcours",{date:dateOuverture,time:concourDate[0].heureOuverture,test:2})

        }

        

        
    })
})

// ! FETCH DETECTED FACE FROM DB
router.get("/fetchfaces", function(req,res){
    const email=req.user[0].email;
    DBCONNECTION.query("SELECT img1,img2,img3 FROM Onlex.CaptureFaciale WHERE CaptureFaciale.email=? LIMIT 1",email,function(err,images){
        if(err) throw err;
        res.json(images)
    })
})

// ! COMPOSITION
router.get("/composition", async function(req,res){
   const sql2= "SELECT ParcoursQuestionnaire(?) AS TabQuestion"
   DBCONNECTION.query(sql2,req.query.attemptid, function(err,question){
       if(err) throw err;
       let nombreDeQuestion=question[0].TabQuestion.split("&").length
       const result=question[0].TabQuestion.split("&")[1].split("/")
     res.render('ExamsPage',{item:result,concours:req.query.attemptid,page:1,questionLength:nombreDeQuestion,type:result[2]})
   })
   
})

//! QUESTION PAGINATION
router.post("/composition/attempt", function(req,res){
let idOption,sql;
let reponse;

    // ! SAUVGRADER LES REPONSE
    if(req.query.type=="Choix unique"){
        reponse ={email:req.user[0].email,idQuestion:req.query.idqst,idConcours:req.query.idcm,idOption:req.body.option} 
         sql ="SELECT verdict,point FROM Onlex.Question JOIN Onlex.Option USING(idQuestion) WHERE idQuestion=? AND idOption=?"
        DBCONNECTION.query(sql,[req.query.idqst,req.body.option], function(err,result){
            if(err) throw err;
            if(result[0].verdict=="True"){
               reponse.point=result[0].point
            }
            else{
              reponse.point=0
            }
            const sql2 ='INSERT INTO Onlex.Reponse SET ?'
            DBCONNECTION.query(sql2,reponse, function(err,Response){
                if(err) throw err;
                console.log("Reponse inserted")
            })
        })

    }
    else{
        let correctReponse=0;
        const optionLength = req.body.option.length;
        reponse ={email:req.user[0].email,idQuestion:req.query.idqst,idConcours:req.query.idcm} 
        sql ="SELECT verdict,point FROM Onlex.Question JOIN Onlex.Option USING(idQuestion) WHERE idQuestion=? AND idOption=?"
    
        if(typeof(req.body.option)=="string")
        {
            reponse ={email:req.user[0].email,idQuestion:req.query.idqst,idConcours:req.query.idcm,idOption:req.body.option} 
            DBCONNECTION.query(sql,[req.query.idqst,req.body.option], function(err,result){
                if(err) throw err;
                const sql3 = "SELECT count(idOption) AS count FROM Onlex.Option  WHERE verdict=? AND idQuestion=?"

                DBCONNECTION.query(sql3,['True',req.query.idqst], function(err,count){
                    if(err) throw err;
                   console.log("count:",count)
                   if(result[0].verdict=="True")
                   {
                    reponse.point=result[0].point/count[0].count
                   }
                   else
                   {
                       reponse.point=0
                   }
                   const sql2 ='INSERT INTO Onlex.Reponse SET ?'
                   DBCONNECTION.query(sql2,reponse, function(err,Response){
                       if(err) throw err;
                       console.log("Reponse inserted")
                   })
                })
            })
        }
        else{

            for(let id of req.body.option)
            {
                reponse.idOption=id
                DBCONNECTION.query(sql,[req.query.idqst,id], function(err,result){
                        if(err) throw err;
                        if(result[0].verdict=="True"){
                            reponse.point=result[0].point/optionLength
                        }
                        else{
                            reponse.point=0
    
                        }
                        const sql2 ='INSERT INTO Onlex.Reponse SET ?'
                        DBCONNECTION.query(sql2,reponse, function(err,Response){
                            if(err) throw err;
                            console.log("Reponse inserted")
                        })
                })
            }
        }
    }
    console.log(req.query)
    // ! RENDER PAGE SUIVANT
    let page = req.query.page;
   const sql2= "SELECT ParcoursQuestionnaire(?) AS TabQuestion"
   DBCONNECTION.query(sql2,req.query.idcm, function(err,question){
       if(err) throw err;
       let nombreDeQuestion=question[0].TabQuestion.split("&").length

       if(page==nombreDeQuestion-1){
           res.json("fin")
       }
       else{

           page++;
        
               const result=question[0].TabQuestion.split("&")[page].split("/")
             res.render('ExamsPage',{item:result,concours:req.query.idcm,page:page,questionLength:nombreDeQuestion,type:result[2]})
       }
   })
} )
module.exports=router;