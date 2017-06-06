/* where i need to go from here:
add redundancies for play / stop toggles on user side (if it's playing, don't let it have play be sent again)
*/

var express = require('express');  
var app = express();  
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Repeat = require('repeat');
var $ = require("jquery");

app.use(express.static('public'));

var users = 0;

/* 4/4 kick on server start */
var sequencerState = [[1,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
                      [1,1,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
                      [1,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
                      [1,1,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]

io.on('connection', function(socket){
  var userID = socket.id;
  console.log('a user connected ' + userID);
  users++;
  console.log(users + ' users connected ');
  io.emit('userChange', users);

  socket.on('sequenceToServer', function(data, matrix) {
    console.log('incoming');
    console.log(data);
    sequencerState = matrix;
    console.log(sequencerState);
    io.emit('sequenceFromServer', data, sequencerState)
  });

  socket.on('initRequest', function() {
    console.log(sequencerState);
    io.emit('initSend', sequencerState);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected ' + socket.id);
    users--
    io.emit('userChange', users);
  });
});

app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
