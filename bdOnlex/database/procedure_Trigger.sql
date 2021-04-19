

-- -----------------------------------------------------
-- Create procedure `AfficheRegistration`
-- -----------------------------------------------------

USE Onlex;
DELIMITER |
CREATE PROCEDURE AfficheRegistration(IN id INT)
BEGIN
SELECT nom,prenom,dateNaissance,sexe,email,telephone,ville,ecole,
region,typeDeConcours,diplome,img2,idInscription
FROM Inscription JOIN Membre USING(email)
WHERE idInscription = id;
END|

-- -----------------------------------------------------
-- Create procedure `DeleteRegistration`
-- -----------------------------------------------------

DELIMITER|;
CREATE PROCEDURE `DeleteRegistration`(IN id INT)
BEGIN
SET @email=""; SET @idConcours="";
SELECT email,idConcours INTO @email,@idConcours FROM Inscription WHERE idInscription=id;

DELETE FROM Inscription where idInscription=id;

/*UPDATE NOTIFICATION*/
UPDATE Notification SET message="Non Acceptée" WHERE email=@email AND idConcours=@idConcours;

END




-- -----------------------------------------------------
-- Create procedure `validRegistration`
-- -----------------------------------------------------

CREATE DEFINER=`Josué`@`%` PROCEDURE `validRegistration`(IN id INT)
BEGIN
/*VARIABLE POUR CANDIDAT*/
SET @idInscription=""; SET @email=""; SET @idConcours="";
 SET @ville="";SET @telephone="";SET @CNE="";SET @dateNaissance="";
 SET @addresse="";SET @sexe="";SET @ecole=""; SET @region=""; SET @typedediplome="";
 
 /*DOSSIER DE CANDIDATURE*/
 SET @typeDeConcours=""; SET @diplome=""; SET @ecoleDeChoix="";
 
 /*CAPTURE FACIALE*/
 SET @img1=""; SET @img2=""; SET @img3="";
 
 SELECT * INTO @idInscription,@email,@ville,@telephone,@CNE,@dateNaissance,@addresse,@sexe,@ecole,@region,
 @typeDeConcours,@typedediplome,@diplome,@img1,@img2,@img3,@idConcours FROM Inscription WHERE idInscription=id;
 
 /*INSERT INTO CANDIDATE*/
 INSERT INTO Candidat VALUES(NULL,@email,@idConcours,@ville,@telephone,@CNE,@dateNaissance,@addresse,@sexe,@ecole);
 
 /*INSERT INTO DOSSIER CANDIDATURE*/
 SELECT ecole INTO @ecoleDeChoix FROM Concours WHERE idConcours=@idConcours;
 
 INSERT INTO DossierDeCandidature VALUES(NULL,@idConcours,@email,@typeDeConcours,@diplome,@ecoleDeChoix);
 
/*CAPTURE FACIALE*/
INSERT INTO CaptureFaciale VALUES(NULL,@idConcours,@email,@img1,@img2,@img3); 
 
/*UPDATE NOTIFICATION*/
UPDATE Notification SET message="Validée" WHERE email=@email AND idConcours=@idConcours;

DELETE FROM Inscription where idInscription=id;

END




-- -----------------------------------------------------
-- CREATION DES TRIGGERS DE SUPPRESSION DES OPTIONS D'UNE QUESTION
-- LORS DE LA SUPPRESSION DE LA DITE QUESTION
-- -----------------------------------------------------

DELIMITER |
CREATE TRIGGER DeleteOption BEFORE DELETE ON Onlex.Question FOR EACH ROW
BEGIN
DELETE FROM Onlex.Option WHERE idQuestion = OLD.idQuestion;
END |


-- -----------------------------------------------------
-- CREATION DE LA PROCEDURE QUI NOTIFICATIE LE CANDIDAT
-- DANS SON DAHBOARD DE LA CREATION D'UN QUESTIONNAIRE POUR
-- SONS CONCOURS
-- -----------------------------------------------------

USE Onlex;
DELIMITER |
CREATE PROCEDURE ExamNotification(IN email VARCHAR(45))
BEGIN
SELECT idConcours, titre
 FROM Candidat JOIN Concours USING(idConcours)
 WHERE Candidat.email = email 
 AND idConcours IN( SELECT DISTINCT idConcours FROM Questionnaire);
 END|
 DELIMITER ;





DELIMITER |
CREATE TRIGGER DeleteBeforeConcours BEFORE DELETE ON Onlex.Concours FOR EACH ROW
BEGIN
DELETE FROM Onlex.Questionnaire WHERE idConcours = OLD.idConcours;
DELETE  FROM Onlex.Candidat WHERE idConcours = OLD.idConcours;
UPDATE Onlex.Notification SET message = "Ce concours n'existe plus",idConcours= null WHERE idConcours = OLD.idConcours;
END |
DELIMITER ;



DELIMITER |
CREATE TRIGGER DeleteBeforeQuestionnaire BEFORE DELETE ON Onlex.Questionnaire FOR EACH ROW
BEGIN
DELETE FROM Onlex.Reponse WHERE idQuestionnaire = OLD.idQuestionnaire;
DELETE  FROM Onlex.Questionnaire_has_Question WHERE idQuestionnaire = OLD.idQuestionnaire;
END |
DELIMITER ;



DELIMITER |
CREATE TRIGGER DeleteBeforeCandidat BEFORE DELETE ON Onlex.Candidat FOR EACH ROW
BEGIN
DELETE FROM Onlex.DossierDeCandidature WHERE DossierDeCandidature.idConcours = OLD.idConcours AND DossierDeCandidature.email = OLD.email;
DELETE FROM Onlex.CaptureFaciale WHERE CaptureFaciale.idConcours = OLD.idConcours AND CaptureFaciale.email = OLD.email;
DELETE FROM Onlex.Note WHERE Note.idConcours = OLD.idConcours AND Note.email = OLD.email;

END |
DELIMITER ;