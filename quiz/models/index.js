var path = require("path");

//cargar Modelo ORM
var Sequelize = require("sequelize");
//Usar BBDD SQLite

var url, storage;

if(!process.env.DATABASE_URL){
	url = "sqlite:///";
	storage = "quiz.sqlite";
}else{
	url = process.env.DATABASE_URL;
	storage = process.env.DATABASE_STORAGE || "";
}

var sequelize = new Sequelize(url,
	{ storage: storage,
		omitNull: true});

// Importar la definición de la tabla de preguntas en DB
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));

// sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync().then(function(){ //sync crea la tabla quiz
	return Quiz.count().then(function(c){
		if(c === 0){
			return Quiz.bulkCreate([{question: "Capital de Italia",
								answer: "Roma"},
								{question: "Capital de Portugal", answer:"Lisboa"}]).then(function(){
									console.log("Base de datos inicializada con datos");
								});
		}
	});
}).catch(function(error){
	console.log("Error al sincronizar la tabla de la Base de datos: ", error);
	process.exit(1);
});

exports.Quiz = Quiz; //exportar la definición de la tabla Quiz

