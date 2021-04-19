const DBCONNECTION = require('../DBMODEL/dbConnection')
const express = require("express")
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

router.get("/composition", function(req,res){
    const IDQUESTION =[]
    const sql = "SELECT idQuestionnaire,idQuestion FROM Questionnaire JOIN Questionnaire_has_Question USING(idQuestionnaire) WHERE idConcours=?"
    DBCONNECTION.query(sql,req.query.attemptid, function(err,result){
        if(err) throw err;

        // ! SELECT IDQUESTION 
        for(let id of result)
        {
            const sql2 = "SELECT idQuestion,typeDeReponse,intitule, texte,verdict FROM Question JOIN Onlex.Option USING(idQuestion)  WHERE Question.idQuestion=? GROUP BY idOption"
            DBCONNECTION.query(sql2,id.idQuestion, function(err,question){
                if(err) throw err;
                console.log(question)
            })
        }
    })
    res.render("ExamsPage")
})
module.exports=router;