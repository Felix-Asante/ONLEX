function checkAuthentication(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/membre/login")
}

module.exports = checkAuthentication;