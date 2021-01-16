/*
* 
*/

//Requirements
const express = require('express');
const app = express();
const port = 80;

const path = require('path');
const http = require('http');
const mysql = require('mysql');
const socket = require('socket.io');
const fs = require('fs');

var server = http.createServer(app).listen(port, function(){
	console.log("Express server created - listening on port " + port+"\n");
});

var socketlistener = socket.listen(server);
const NUMROWS = 10
const SETTINGS = JSON.parse(fs.readFileSync('database.json'));

var database = mysql.createConnection(SETTINGS.login);

while(database.state == "disconnected"){
	database.connect(function(err) {
		if (err) throw err;
	});
}
console.log("Connected to database!");

function getLatest(rows){
	console.log("Querying last "+rows+" from database...")
	data = database.query("SELECT id FROM "+SETTINGS.table+" ORDER BY id DESC LIMIT "+rows, function (err, result) {
		if (err) throw err;
		return result;
	});
	console.log("Last"+rows+" collected:")
	console.log(data)
	data.forEach(point => {
		console.log(point)
	});
	return data;
}

//On socket connect
socketlistener.on('connection', (socket) => {
	console.log("Someone connected: "+socket.id);
	data = getLatest(NUMROWS);
	socket.emit('data', data);
	console.log("Pushed data to socket.")
});

//File GETs
app.get('/', (request, response) => {
	response.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/iochart.js', (request, response) => {
	response.sendFile(path.join(__dirname+'/iochart.js'));
});

app.get('/style.css', (request, response) => {
	response.sendFile(path.join(__dirname+'/style.css'));
});

