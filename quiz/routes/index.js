var express = require('express');
var router = express.Router();

var multer = require('multer');
var upload = multer({ dest: './uploads/' });

var quizController = require("../controllers/quiz_controller");
var commentController = require("../controllers/comment_controller");
var userController = require("../controllers/user_controller");
var sessionController = require("../controllers/session_controller");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* Autoload de rutas que usen :quizId */
router.param('quizId', quizController.load); //autoload :quizId
/**Autoload de parámetros**/
router.param('userId', userController.load); // autoload :userId
router.param('commentId', commentController.load); //autoload :commentId

//Definición de rutas de sesión
router.get("/session", sessionController.new); 
router.post("/session", sessionController.create);
router.delete("/session", sessionController.destroy);

/* GET author page*/
router.get("/author", function(req, res, next){
	res.render('author');
});

//Gestión de las rutas de las preguntas
router.get("/quizzes", sessionController.expired, quizController.index);
router.get("/quizzes/:quizId(\\d+)", sessionController.expired, quizController.show);
router.get("/quizzes/:quizId(\\d+)/check", sessionController.expired, quizController.check);
router.get("/quizzes/new", sessionController.expired, sessionController.loginRequired, quizController.new);
router.post("/quizzes", sessionController.loginRequired, upload.single('image'), quizController.create);
router.get("/quizzes/:quizId(\\d+)/edit", sessionController.expired, sessionController.loginRequired, quizController.ownershipRequired, quizController.edit);
router.put("/quizzes/:quizId(\\d+)", sessionController.loginRequired, upload.single('image'), quizController.ownershipRequired, quizController.update);
router.delete("/quizzes/:quizId(\\d+)", sessionController.loginRequired, quizController.ownershipRequired, quizController.destroy);
router.get("/quizzes.:format?", sessionController.expired, quizController.format);
router.get("/quizzes/:quizId(\\d+).:format?", sessionController.expired, quizController.format2);

//Gsetión de las rutas de comentarios
router.get("/quizzes/:quizId(\\d+)/comments/new", sessionController.expired, sessionController.loginRequired, commentController.new);
router.post("/quizzes/:quizId(\\d+)/comments", sessionController.expired, sessionController.loginRequired, commentController.create);
router.put('/quizzes/:quizId(\\d+)/comments/:commentId(\\d+)/accept', sessionController.expired, sessionController.loginRequired, quizController.ownershipRequired, commentController.accept);

//Definición de las rutas de cuenta
router.get("/users", sessionController.expired, userController.index); //listado de usuarios
router.get("/users/:userId(\\d+)", sessionController.expired, userController.show); //ver un formulario
router.get("/users/new", sessionController.expired, userController.new); //formulario sign up
router.post("/users", userController.create); //registrar usuario
router.get("/users/:userId(\\d+)/edit", sessionController.expired, sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.edit); //editar cuenta
router.put("/users/:userId(\\d+)", sessionController.loginRequired, sessionController.adminOrMyselfRequired, userController.update); //actualizar cuenta
router.delete("/users/:userId(\\d+)", sessionController.loginRequired, sessionController.adminAndNotMyselfRequired, userController.destroy); //borrar cuenta

module.exports = router;
