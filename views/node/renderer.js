var appNode = require('express')(),
	http = require('http').createServer(appNode),
	mysql = require('mysql'),
    lstRestaurantes = [],
	con = mysql.createConnection({
	  //host: "10.107.144.13",
	  host: "localhost",
	  //host: "10.107.134.26",
	  //host: "10.107.134.15",
	  user: "root",
	  password: "bcd127",
	  //password: "",
	  database: "dbtheribssh"
	});

con.connect();

appNode.get('/', function(req, res){

    var command = "select r.id_restaurante, r.nome, r.imagem, r.descricao, concat(coalesce(c.nome, ''), ', ' , "+
  	"coalesce(e.bairro, '') , ', ' , coalesce(e.rua, '') , ', ' , coalesce(e.numero, '') , ' ' , "+
  	"coalesce(e.aptbloco, '')) as 'endereco' from tbl_restaurante as r "+
  	"inner join tbl_endereco as e "+
  	"on r.id_endereco = e.id_endereco "+
  	"inner join tbl_cidade as c "+
  	"on c.id_cidade = e.id_cidade "+
  	"where r.id_restaurante = 2 "+
  	"order by r.id_restaurante asc";

    con.query(command, function (err, result, fields) {
      if (err) throw err;
      console.log('É isso ai ', rows[0].solution);
    });


});

appNode.get('/disconnect', function(req, res){

	res.send(disconnect,1);

});

http.listen(8100, function(){

	console.log("Servidor rodando na porta 8100");

});
