var socket = io();

/* ideas


starts w/ drone loop, mouse movement changes something about sound quality?
needs user interaction that prompts discovery
drums on communal step sequencer?
guitar activated by _________

*/

$(document).ready(function() {
	//pass in the audio context
	var context = new AudioContext();

	//on iOS, the context will be started on the first valid user action the .box class
	StartAudioContext(Tone.context, '#startprompt').then(function(){
	    //console.log('up and running');
	});
	/* set up stems */
	var drone = new Tone.Player("../sound/kte-ebow.wav").toMaster();
	drone.volume.setValueAtTime(-10, 0);
	var drums1 = new Tone.Player("../sound/kte-drum1.wav").toMaster();
	drums1.volume.setValueAtTime(-5, 0);
	var vox = new Tone.Player("../sound/kte-voxstem.wav").toMaster();
	vox.volume.setValueAtTime(-10, 0);
	var gtr = new Tone.Player("../sound/kte-gtrstem.wav").toMaster();
	gtr.volume.setValueAtTime(-10, 0);
	var freeverb = new Tone.Freeverb().toMaster();
	freeverb.dampening.value = 500;
	//routing synth through the reverb
	drone.connect(freeverb);
	vox.connect(freeverb);
	gtr.connect(freeverb);
	var chorus = new Tone.Chorus(4, 2.5, 0.5);
	drone.connect(chorus);
	gtr.connect(chorus);

	/* start tranposrt helper so that it only occurs once */
	Tone.Buffer.on("load", function() {
		Tone.Transport.bpm.value = 132;
		Tone.Transport.start();
		console.log('transport started');
		Tone.Transport.scheduleRepeat(function(time){
			drone.start();
		}, "4m");

		Tone.Transport.schedule(function(time){
			sequencer.start();
		}, "2m");
		
		Tone.Transport.scheduleRepeat(function(time){
			//drums1.start();
		}, "2m", "2m");
		
		Tone.Transport.schedule(function(time){
			vox.start();
		}, "4m");

		Tone.Transport.schedule(function(time){
			gtr.start();
		}, "4m");

		Tone.Transport.schedule(function(time){
			$("#lyrics").html("a dream");
		}, "11:02:01");

		Tone.Transport.schedule(function(time){
			$("#lyrics").html("of falling daylight");
		}, "13:02:00");
	});
	$("#pause").click(function() {
		Tone.Transport.pause();
	});

	/*set up a sampler / sequencer */
    var drumkit = new Tone.MultiPlayer({
      urls : {
        "kick" : "../sound/kick.wav",
        "snare" : "../sound/snare.wav",
        "ch" : "../sound/ch.wav",
        "oh" : "../sound/oh.wav",
      },
      volume : 0,
      fadeOut : 0.1,
    }).toMaster();
    //the notes
    var noteNames = ["kick", "snare", "ch", "oh"];
    var sequencer = new Tone.Sequence(function(time, col){
		var column = matrix1.matrix[col];
		for (var i = 0; i < 4; i++){
			if (column[i] === 1){
			  drumkit.start(noteNames[i], time, 0, "16n", 0, 1);
			}
		}
    }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0], "16n");
    // GUI //
    nx.onload = function(){
		nx.colorize("dodgerblue");
		matrix1.col = 16;
		matrix1.init();
		matrix1.resize($("#Content").width(), 250);
		matrix1.draw();
		socket.emit('initRequest');
		matrix1.on("*", function(data) {
			//console.log(data);
			//var sequencerState = matrix1.matrix;
			socket.emit('sequenceToServer', data, matrix1.matrix);
			socket.emit('test');
		});
    }
    $(window).on("resize", function(){
		matrix1.resize($("#Content").width(), 250);
		matrix1.draw(); 
    });
    
	socket.on('initSend', function(sequencerState) {
	    console.log('init received');
	    console.log(sequencerState);
	    matrix1.matrix = sequencerState;
	    matrix1.draw();
	});
	
	socket.on('sequenceFromServer', function(data, sequencerState){
	    console.log('new sequence from server');
	    console.log(sequencerState);
	    /*
		var value = data.level ? 1 : 0;
		matrix1.matrix[data.col][data.row] = value;

		matrix1.val = {
			row: data.row,
			col: data.col,
			level: value
		}
		*/
		matrix1.matrix = sequencerState;
		matrix1.draw();
	});
	socket.on('test2', function() {
		console.log('test received');
	});
});