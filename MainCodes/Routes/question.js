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
        res.redirect('question/questionbank')
    })
})
module.exports = router;