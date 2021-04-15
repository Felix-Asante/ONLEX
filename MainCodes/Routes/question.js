const express = require("express")
const router = express.Router()
const DBCONNECTION = require("../DBMODEL/dbConnection")

// * DISPLAY CREATE NEW QUESTION PAGE
router.get('/createnewquestion', function(req,res){
    res.render("createNewQuestion"); 
})

// * CREATE NEW QUESTION
router.post("/createnewquestion", async function(req,res){
 let sql,insertId;

    // ! question objet
  const question = {intitule:req.body.intitule, typeDeReponse:req.body.typeresponse,point:req.body.point}
  sql = 'INSERT INTO Onlex.Question SET ?'

//    * INSERT INTO QUESTION TABLE
   DBCONNECTION.query(sql,question, function(err,result)
   {
       if(err) throw err;

       //   ! recupere les options
        const options = []
        for(let i=1;i<=req.body.numberoption;i++){
            options.push(req.body[`option${i}`])
        }

        //   ! SELECTIONNER L'IDENTIFIANT DE LA DERNIER QUESTION INSEREE

        //   * creation de l'Object option
        const option = {idQuestion:result.insertId};
        sql = 'INSERT INTO Onlex.Option SET ?'

    for(let tab of options)
    {
            for(let i=0;i<tab.length;i++)
            {
                if(i==0)
                option.texte= tab[i]
                else
                option.verdict=tab[i]

            }
            
            DBCONNECTION.query(sql,option, function(err,optionresult){
            if(err) throw err;
            })
    } 

   })
    res.redirect("/question/createnewquestion")
})

// ! AFFICHE QUESTION BANK
router.get("/questionbank", function(req,res){

 const head =["No.","Intitule","Type reponse",'Point']

    DBCONNECTION.query("SELECT * FROM Onlex.Question", function(err,question){
        res.render("questionBank",{head:head,data:question})
    })
    // res.render('questionBank')
})

// ! SUPPRIME UNE QUESTION
router.get("/deletequestion", function(req,res){
    const sql = "DELETE FROM Onlex.Question WHERE idQuestion=?"
    DBCONNECTION.query(sql,req.query.iqid, function(err,data){
        if(err) throw err;
        res.redirect('/question/questionbank')
    })
})

// ! UPDATE UNE QUESTION
router.get("/updatequestion", function(req,res){
     let details,options;
    let sql = "SELECT intitule,point FROM Onlex.Question WHERE idQuestion=?"
    DBCONNECTION.query(sql,req.query.iqid, function(err,data){
        if(err) throw err;
        details = data;
        console.log("data:",details)
    })
    DBCONNECTION.query('SELECT idOption,texte,verdict FROM Onlex.Option WHERE idQuestion=?',req.query.iqid,
     function(err,option){
        if(err) throw err;
        options=option;
        console.log("option:",options)
        res.render('updateQuestion',{question:details,options:options,idQuestion:req.query.iqid})
    })
})

// ! CREATE QUESTION 
// * METHOD: GET
router.get('/createexams', function(req,res){
    let question;

    DBCONNECTION.query("SELECT idQuestion,intitule,point FROM Onlex.Question", function(err,result){
        if(err) throw err;
        console.log(question)
        question=result;

    })
    DBCONNECTION.query("SELECT titre,idConcours FROM Onlex.Concours", function(err,concour){
        if(err) throw err;

        res.render('createQuestion',{questions:question,concours:concour})
    })
}) 

// ! CREATE QUESTION: POST
router.post("/createexams", function(req,res){

    const questionnaire ={idConcours:req.body.concours,dateOuverture:req.body.datedecommence,heureOuverture:req.body.heureDeOuverture,duree:req.body.timedisponible}
        const hasQuestion={}
     let sql = 'INSERT INTO Onlex.Questionnaire SET?'
    DBCONNECTION.query(sql,questionnaire, function(err,questionnaire){
        if(err) throw err;

        const sql2 = "INSERT INTO Onlex.Questionnaire_has_Question SET ?"
      
        for(let i=0; i<req.body.qst.length; i++){
            hasQuestion.idQuestion=req.body.qst[i];
            hasQuestion.idQuestionnaire=questionnaire.insertId;
            DBCONNECTION.query(sql2, hasQuestion, function(err,result){
                if(err) throw err;
                console.log(result);
            })
        }
    })
    res.redirect("/question/createexams")
    // console.log(req.body)
})
module.exports = router;