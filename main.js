const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1050, height: 660, minWidth:1050, minHeight:660, icon: path.join(__dirname, 'telas/icone/icon.png'), backgroundColor: '#676b80'})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'views/index.ejs'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


//CÓDIGO NODE
var appNode = require('express')(),
	http = require('http').createServer(appNode),
	io = require('socket.io').listen(http),
    io = require('socket.io')(http),
	mysql = require('mysql'),
	lstSalas = [],
    clients = {};
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


});

appNode.get('/selectCardapio', function(req, res){

  var command = "select id_produto, nome as 'nome_produto', descricao as 'desc_produto', imagem as 'foto_produto', concat('R$ ', format(preco,2,'de_DE')) as 'preco_produto' from tbl_produto where statusAprovacao = 1;";

  con.query(command, function (err, result, fields) {
    if (err) throw err;
    res.send(result);
  });


});

appNode.get('/disconnect', function(req, res){

	res.send(disconnect,1);

});

appNode.get('/inserir', function(req, res){

	var _id = lstPedidos.length,
		_endereco = req.query.endereco,
		_titulo = req.query.titulo,
		_descricao = req.query.descricao,
		_telefone = req.query.telefone,
		_foto = req.query.caminhoFoto,
		p = { id_restaurante : _id, endereco_restaurante : _endereco , nome_restaurante : _titulo , desc_restaurante: _descricao, telefone_restaurante: _telefone, foto_restaurante: _foto};

	lstPedidos.push(p);

	res.send({ mensagem : "Inserido com sucesso"});
	io.sockets.emit("novo_usuario", p);

});

io.on("connection", function (client) {

    client.on("join", function(name){
    	console.log("Joined: " + name);
        clients[client.id] = name;
        client.emit("update", "You have connected to the server.");
        client.broadcast.emit("update", name + " has joined the server.")
    });

    client.on("send", function(msg){
    	console.log("Message: " + msg);
        client.broadcast.emit("chat", clients[client.id], msg);
    });

    client.on("disconnect", function(){
    	console.log("Disconnect");
        io.emit("update", clients[client.id] + " has left the server.");
        delete clients[client.id];
    });

    client.on("selectPedidos", function(idrestaurante){

        var command = "select p.id_funcionario, p.id_cliente, p.id_pedido, time(p.data) as 'horariofeito', m.nome as 'nomemesa' from tbl_pedido as p "+
        "inner join tbl_funcionario as f on f.id_funcionario = p.id_funcionario "+
        "inner join tbl_restaurante as r on r.id_restaurante = f.id_restaurante "+
        "inner join tbl_mesa as m on m.id_mesa = p.id_mesa "+
        "where r.id_restaurante = "+idrestaurante;

        con.query(command, function(err, result, fields){
            var contador = 0;
            var resultado = "";
            while(contador < result.length){
                var idpedido = result[contador].id_pedido,
                    horarioFeito = result[contador].horariofeito,
                    mesa = result[contador].nomemesa;


                resultado = resultado + "<div class='div_infoReduzidaPed' onclick='abrirInformacoes("+idpedido+")' title='Ver Informações'><div class='linha_esquerda'></div> "+
                                        "<div class='div_mesaHorario'> " +
                                        "<div class='mesaHorario'>Mesa "+mesa+"</div> " +
                                        "<div class='mesaHorario'>"+horarioFeito+"</div>" +
                                        "</div>" +
                                        "<div class='div_btnConcluir' onclick='status(2,"+idpedido+")'><div class='btnConcluir' title='Concluir pedido'><img src='img/pedido_completo.png' alt=''></div></div> " +
                                        "</div>";
                contador = contador + 1;
            }
            client.emit("resultadoPedido", resultado);
        });
    });

    client.on("selectInfoPedido", function(idpedido){

        var command = "select f.nome_completo as 'nomegarcom', m.nome as 'nomemesa' from tbl_pedido as pe "+
                      "inner join tbl_funcionario as f on f.id_funcionario = pe.id_funcionario " +
                      "inner join tbl_mesa as m on m.id_mesa = pe.id_mesa " +
                      "where pe.id_pedido = "+idpedido;

        con.query(command, function(err, result, fields){
            var contador = 0;
            var resultado = "";
            while(contador < result.length){
                var nomegarcom = result[contador].nomegarcom,
                    nomemesa = result[contador].nomemesa,


                resultado = resultado + "<div class='tituloInfo'><span class='centralizar_texto'>Nome do Garçom</span></div> " +
                                        "<div class='divisoria'> " +
                                        "</div><div class='tituloInfoPequeno'><span class='centralizar_texto'>Mesa</span></div> " +
                                        "<div class='conteudoInfo'><span class='centralizar_texto'>"+nomegarcom+"</span></div> " +
                                        "<div class='divisoriaB'></div> " +
                                        "<div class='conteudoInfoPequeno'><span class='centralizar_texto'>"+nomemesa+"</span></div>";
                contador = contador + 1;
            }
            client.emit("resultadoGarcomMesa", resultado);
        });

        var command = "select pr.nome as 'nomeproduto', pp.id_produto as 'idproduto' from tbl_pedido as pe " +
                       "inner join tbl_pedidoproduto as pp on pp.id_pedido = pe.id_pedido " +
                       "inner join tbl_produto as pr on pp.id_produto = pr.id_produto " +
                       "where pe.id_pedido = "+idpedido;

            con.query(command, function(err, result, fields){
                var contador = 0,
                    resultado = "",
                    lstIngredientes = [];
                while(contador < result.length){
                    nomeproduto = result[contador].nomeproduto,
                    idproduto = result[contador].idproduto;

                   resultado = resultado +  "<div class='tituloInfo_caixa' onclick='mostrarIngrendientes("+idproduto+")'> " +
                                            "<div class='tituloInfoPequenoQntI'><span class='centralizar_texto'>Quantidade</span></div> " +
                                            "<div class='divisoria'></div> " +
                                            "<div class='tituloInfoQntI'><span class='centralizar_texto'>Nome Produto</span></div> " +
                                            "<div class='conteudoInfoPequeno'><span class='centralizar_texto'>5</span></div>" +
                                            "<div class='divisoriaB'></div> " +
                                            "<div class='conteudoInfo'><span class='centralizar_texto'>"+nomeproduto+"</span></div> " +
                                            "</div>" +
                                            "<div id='titulo_ingredientes"+idproduto+"' class='tituloIng'><span class='centralizar_texto'>Ingredientes</span></div>" +
                                            "<div id='div_ingredientesNomes"+idproduto+"' class='div_ingredientesNomes'></div>";

                    contador = contador + 1;
                }
                client.emit("resultadoProdutoQntd", resultado);
            });

    });

    client.on("selectIngredientesProdutos", function(idproduto){
        var command = "select ip.quantidade, i.nome as 'nome_ingrediente', ip.detalhe, ti.sigla from tbl_ingredienteproduto as ip " +
                       "inner join tbl_ingrediente as i on i.id_ingrediente = ip.id_ingrediente " +
                       "inner join tbl_tipounit as ti on ti.id_tipounit = ip.id_tipounit " +
                       "where id_produto = "+idproduto;

        con.query(command, function(err, result, fields){
            var contador = 0;
                resultado = "";
            while(contador < result.length){
                var quantidade = result[contador].quantidade,
                    nomeingrediente = result[contador].nome_ingrediente,
                    detalhe = result[contador].detalhe,
                    sigla = result[contador].sigla;

                resultado = resultado + "<p>"+quantidade+""+sigla+" de "+nomeingrediente+" "+detalhe+"</p>";

                contador = contador + 1;
            }
            client.emit("resultadoIngredienteProduto"+idproduto, resultado);
        });
    });

    client.on("mudarStatus", function(idstatus, idpedido){

        var command = "select nome from tbl_status where id_status = "+idstatus;

        con.query(command, function(err, result, fields){
            var nomestatus = result[0].nome;
            lstSalas[idpedido].status = idstatus;
            lstSalas[idpedido].status_nome = nomestatus;
        });
    });

});

appNode.get('/criacaoSala', function(req, res){

	var _id_sala = lstSalas.length,
      _id_funcionario = req.query.id_funcionario,
      _qr_code = "",
			_tamanho = 0;

	if (typeof lstProdutos[_id_sala] == 'undefined'){
		_tamanho = 0;
	}else{
		_tamanho = lstProdutos[_id_sala].length;
	}

	var command = "select e.uf as 'uf', r.id_restaurante as 'id_rest' from tbl_funcionario as f "+
									"inner join tbl_restaurante as r "+
									"on f.id_restaurante = r.id_restaurante "+
									"inner join tbl_endereco as en "+
									"on r.id_endereco = en.id_endereco "+
									"inner join tbl_cidade as c "+
									"on c.id_cidade = en.id_cidade "+
									"inner join tbl_estado as e "+
									"on e.id_estado = c.id_estado "+
									"where f.id_funcionario = '" + _id_funcionario + "'";

	con.query(command, function(err, result, fields){
		if (err) throw err + command;

		if (result.length > 0){

			var contador = 0;

			//Número utilizado para o qrcode
			var numero = 0;
			//Verificador de local para o armazenamento no qrcode
			while (contador < _id_sala){
				var qr = lstSalas[contador].qr_code.slice(0,2);

				if (qr == result[0].uf){
					numero = numero + 1;
				}

				contador = contador + 1;
			};
			//Formata o número de acordo com um padrão
			var formattedNumber = ("00000" + numero).slice(-5);

			_qr_code = result[0].uf;
			_qr_code = _qr_code + formattedNumber;

			var _id_restaurante = result[0].id_rest;

			var s = {id_sala : _id_sala, id_restaurante : _id_restaurante, id_cliente : 0, id_mesa : 0, nome_cliente : "", status_nome : "Em espera", id_funcionario : _id_funcionario, codigo_mesa : "", tamanho : _tamanho, qr_code : _qr_code, status : 0, mensagem : "Sala criada com sucesso."};

			lstSalas.push(s);

			//res.send({id_sala : _id_sala, id_funcionario : _id_funcionario, produtos : lstProdutos[_id_sala], tamanho : lstProdutos[_id_sala].length});
			res.send(lstSalas[_id_sala]);
		}else{
			res.send({mensagem : "Ocorreu um erro durante a conexão. Tente novamente mais tarde."});
		}

	});

});

http.listen(8100, function(){

	console.log("Servidor rodando na porta 8100");

});
