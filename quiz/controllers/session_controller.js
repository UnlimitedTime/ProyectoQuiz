var models = require("../models");
var Sequelize = require("sequelize");
var url = require("url");

//GET /session --Formulario de login

exports.new = function(req, res, next){
	var redir = req.query.redir || url.parse(req.headers.referer || "/").pathname;

	if(redir === '/session' || redir === '/users/new'){
		redir ='/';
	}	

	res.render('session/new', { redir: redir});
};

var authenticate = function(login, password) {
    
    return models.User.findOne({where: {username: login}})
        .then(function(user) {
            if (user && user.verifyPassword(password)) {
                console.log("El usuario ha sido autenticado");
                return user;
            } else {
                return null;
            }
        });
};

//POST /session --Crea la sesion
exports.create = function(req, res, next) {

    var redir = req.body.redir || '/'

    var login     = req.body.login;
    var password  = req.body.password;

    authenticate(login, password).then(function(user) {
            if (user) {
        		//Establece dos minutos de sesión 
        		var diff = 2; //2 minutos de sesión
        		var startDateObj = new Date();
        		var endDateObj = new Date(startDateObj.getTime() + diff*60000);
        		console.log("Usuario conectado a las " + startDateObj);
        		console.log("El usuario dispone un tiempo de expiración de 2 minutos a las " + endDateObj);
    	        // Crear req.session.user y guardar campos id y username
    	        // La sesión se define por la existencia de: req.session.user
    	        req.session.user = {id:user.id, username:user.username, isAdmin:user.isAdmin, expiredAt: endDateObj};

                res.redirect(redir); // redirección a redir
            } else {
                req.flash('error', 'La autenticación ha fallado. Reinténtelo otra vez.');
                res.redirect("/session?redir="+redir);
            }
		}).catch(function(error) {
            req.flash('error', 'Se ha producido un error: ' + error);
            next(error);        
    });
};

exports.loginRequired = function(req, res, next){
    if(req.session.user){
        next();
    }else{
        res.redirect('/session?redir=' + (req.param('redir') || req.url));
    }
};

//PUT (sessionController.expired) If session expired (Aporte del autor)
exports.expired = function(req, res, next){
	var redir = req.body.redir || '/' ; //pide la url a redirigir, si no hay, irá a index
    var url = req.url; 
    var fullUrl = req.protocol + '://' + req.get('host') + url;
    console.log("Usuario detectado "+ req.session.user);
            if(req.session.user != null){
                //Establece la hora actual del usuario para luego compararlo con la hora de expiración
                var actualDate = new Date();
                var expiredDate = new Date(req.session.user.expiredAt);
                console.log("Comprobación del tiempo { Hora actual: "+ actualDate.getTime()+", Hora de expiración: "+ expiredDate.getTime()+" }");
                console.log("Comprobación del tiempo { Hora actual: "+ actualDate+", Hora de expiración: "+new Date(req.session.user.expiredAt)+" }");
    	        if(actualDate.getTime() > expiredDate.getTime()){
    	        	//La sesión del usuario ha expirado
    	        	console.log("La sesión del usuario "+ req.session.user.username+" ha expirado a las "+ req.session.user.expiredAt);
    	        	req.flash('error', 'La sesión de usuario ha expirado');
    	            delete req.session.user;
    
                    res.redirect("/session"); // redirect a login
    	        }else{
                    console.log("Usuario registrado restableciendo tiempo de sesión");
                    console.log("URL pedido: "+ fullUrl+", URL de redireccion: "+redir);
                    next();
    	        }      
            }else{
            	//Si no está en una sesión, se invoca next(), como se pide
                console.log("Usuario no registrado");
  				next();
            }
}


// DELETE /session   -- Destruir sesion 
exports.destroy = function(req, res, next) {

    delete req.session.user;
    
    res.redirect("/session"); // redirect a login
};

//adminOrMyselfRequired (Si el usuario logueado es el admin o el propietario de la cuenta)
exports.adminOrMyselfRequired = function(req, res, next){
    var isAdmin = req.session.user.isAdmin;
    var userId = req.user.id;
    var loggedUserId = req.session.user.id;

    if(isAdmin || userId === loggedUserId){
        next();
    }else{
        console.log("Ruta prohibida: no es el usuario logueado ni el administrador");
        res.send(403);
    }
};

//adminAndNotMyselfRequired
exports.adminAndNotMyselfRequired = function(req, res, next){
    var isAdmin = req.session.user.isAdmin;
    var userId = req.user.id;
    var loggedUserId = req.session.user.id;

    if(isAdmin && userId !== loggedUserId){
        next();
    }else{
        console.log("Ruta prohibida: No es el usuario logueado ni el administrador");
        res.send(403);
    }
};