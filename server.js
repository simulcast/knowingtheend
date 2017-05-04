/* where i need to go from here:
add redundancies for play / stop toggles on user side (if it's playing, don't let it have play be sent again)
*/

var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
var Repeat = require('repeat');
var $ = require("jquery");

/* empty sequencer on server start */
var sequencerState = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
                      [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
                      [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
                      [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]

app.use(express.static('public'));

io.on('connection', function(socket){
  var userID = socket.id;
  console.log('a user connected ' + userID);

  socket.on('sequenceToServer', function(data, matrix) {
    console.log('incoming');
    console.log(data);
    sequencerState = matrix;
    console.log(sequencerState);
    socket.emit('sequenceFromServer', data, sequencerState)
  });

  socket.on('initRequest', function() {
    console.log(sequencerState);
    socket.emit('initSend', sequencerState);
  });

  socket.on('test', function() {
    console.log('test received');
    socket.emit('test2');
  });

  socket.on('disconnect', function(){
    console.log('user disconnected ' + socket.id);
  });
});

app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
