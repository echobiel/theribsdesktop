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
	mysql = require('mysql'),
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
    client.on("select", function(comando){

    });

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
});

http.listen(8100, function(){

	console.log("Servidor rodando na porta 8100");

});
