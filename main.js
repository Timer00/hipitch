let myp5 = new p5(( sketch ) => {
  const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
  let pitch,mic,audioContext;

  //important vars
  let freq = 0;
  let currentNote = 'A';

  const scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  window.onclick = start;

  let canvas, ctx;

  let texts = {
    begin: 'Touch to begin!'
  }

  function textCentered(ctx,text,x,y){
    let textWidth = ctx.measureText(text);
    ctx.fillText(text,x-textWidth.width/2,y);
  }

  sketch.setup = ()=>{
    canvas = document.getElementById('box');
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = `bold 64px Courier New`;
    textCentered(ctx,texts.begin,canvas.width/2,canvas.height/2);
  }

  function start() {
    audioContext = sketch.getAudioContext();
    mic = new p5.AudioIn();
    mic.start(listening);
    audioContext.resume();
    removeDrawArea();

    main();
  }

  function listening() {
    console.log('listening');
    pitch = ml5.pitchDetection(model_url, audioContext, mic.stream, modelLoaded);
  }

  function main(){
    update();
    render();

    requestAnimationFrame(main);
  }

  let guessNote = scale[(Math.random() * scale.length) | 0];
  let noteColor = 'white';
  let guessed = false;
  let volume = 0;

  mic.toggleNormalize(true);

  function update(){
    volume = mic.getLevel();
    if (currentNote === guessNote && !guessed && volume > 0.1){
      guessed = true;
      noteColor = 'green';
      setTimeout(()=> {
        guessNote = scale[(Math.random() * scale.length) | 0];
        guessed = false;
        noteColor = 'white';
      },1000*2);
    }
  }



  function render (){
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = noteColor;
    ctx.font = `bold 600px Courier New`;
    textCentered(ctx,guessNote,canvas.width/2,canvas.height/2);
    ctx.font = `bold 60px Courier New`;
    textCentered(ctx,freq.toFixed(2) + ' ' + currentNote,canvas.width/2,canvas.height/2+200);
    textCentered(ctx,volume.toFixed(3),canvas.width/2,canvas.height/2+400);
  }

  function removeDrawArea() {
    try {
      sketch.noCanvas();
    } catch (e) {
      print("No canvas found to remove");
      print(e);
    }
  }

  function modelLoaded() {
    pitch.getPitch(gotPitch);
  }

  function gotPitch(error, frequency) {
    if (error) {
      console.error(error);
    } else {
      //console.log(frequency);
      if (frequency) {
        freq = frequency;
        let midiNum = sketch.freqToMidi(frequency);
        currentNote = scale[midiNum % 12];
      }
      pitch.getPitch(gotPitch);
    }
  }
});
