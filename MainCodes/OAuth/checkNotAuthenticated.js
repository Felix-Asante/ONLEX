function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated() ){
        res.redirect("../membre/dashboard")
    }
    else{

        next()
    }
}

module.exports = checkNotAuthenticated;