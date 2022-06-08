let visualizer = null;
let rendering = false;
const audio = new Audio();
let audioContext;
const canvas = document.getElementById("canvas");
let player = document.querySelector(".player");
let progress = player.querySelector(".progress");

let playBtn = document.getElementById("playbtn");
let playSvg = playBtn.querySelector(".icon-play");
let playSvgPath = playSvg.querySelector("path");

let loopBtn = document.getElementById("loop");
let looping = false;

let volumeBtn = document.getElementById("volume");
let volumeimg = document.getElementById("volume-img");

//progress bar
progress.addEventListener(
  "click",
  (e) => {
    const progressWidth = window.getComputedStyle(progress).width;
    const timeToSeek = (e.offsetX / parseInt(progressWidth)) * audio.duration;
    audio.currentTime = timeToSeek;
  },
  false
);

//click volume slider to change volume

const volumeSlider = document.getElementById("volume-slider");
volumeSlider.addEventListener(
  "click",
  (e) => {
    const sliderWidth = window.getComputedStyle(volumeSlider).width;
    const newVolume = e.offsetX / parseInt(sliderWidth);
    audio.volume = newVolume;
    document.getElementById("volume-amnt").style.width = newVolume * 100 + "%";
  },
  false
);

//check audio percentage and update time accordingly
setInterval(() => {
  const progressBar = progress.querySelector(".progress-bar");
  progressBar.style.width = (audio.currentTime / audio.duration) * 100 + "%";
}, 500);

//volume button functionality
function volumeToggle() {
  if (volumeBtn.classList.contains("is-active")) {
    audio.muted = false;
    volumeBtn.classList.remove("is-active");
    volumeimg.src = "/assets/volume.png";
  } else {
    volumeimg.src = "/assets/mute.png";
    audio.muted = true;
    volumeBtn.classList.add("is-active");
  }
}
volumeBtn && volumeBtn.addEventListener("click", volumeToggle, false);

//loop button functionality
function loopToggle() {
  if (loopBtn.classList.contains("is-active")) {
    looping = false;
    loopBtn.classList.remove("is-active");
    loopBtn.style.background = "transparent";
  } else {
    looping = true;
    loopBtn.classList.add("is-active");
    loopBtn.style.background = "rgba(255, 255, 255, 0.2)";
  }
}
loopBtn && loopBtn.addEventListener("click", loopToggle, false);

function end() {
  if (!looping) {
    audio.pause();
    return;
  } else {
    audio.play();
  }
}
audio.addEventListener("ended", end, false);

//play button functionality
function playToggle() {
  if (audio.paused) {
    audio.play();
    playSvgPath.setAttribute("d", playSvg.getAttribute("data-pause"));

    if(!audioContext)
    {
      audioContext = new AudioContext();
      const audioNode = audioContext.createMediaElementSource(audio);
      audioNode.connect(audioContext.destination);

      visualizer = butterchurn.default.createVisualizer(audioContext, canvas, {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio || 1,
        textureRatio: 1,
      });
    
      // get audioNode from audio source or microphone
    
      visualizer.connectAudio(audioNode);
    
      // load a preset
    
      const presets = butterchurnPresets.getPresets();
      const preset =
        presets["Flexi, martin + geiss - dedicated to the sherwin maxawow"];
    
      visualizer.loadPreset(preset, 0.0); // 2nd argument is the number of seconds to blend presets
    
      
      audioContext.resume();

      //set initial size of visualizer and canvas
      visualizer.setRendererSize(window.innerWidth, window.innerHeight);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      function startRenderer() {
        visualizer.render();
        setTimeout(() => {
          startRenderer();
        }, 1000 / 60);
      }

      
      if (!rendering) {
        rendering = true;
        startRenderer();
      }
    }
  } else {
    audio.pause();
    playSvgPath.setAttribute("d", playSvg.getAttribute("data-play"));
  }
}

playBtn && playBtn.addEventListener("click", playToggle, false);

const changeSongURL = function (e) {
  const url = `/direct-url?URL=${urlInput.value}`;
  audio.src = url;
  


};

// Get the song from:
const urlInput = document.getElementById("url_input");
urlInput.addEventListener("change", changeSongURL, false);

window.addEventListener("resize", ()=> {
  if(visualizer) visualizer.setRendererSize(window.innerWidth, window.innerHeight);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
})
// Playback tempo
const tempoInput = document.getElementById("tempo-input");

const tempo = document.getElementById("tempo");
tempo.addEventListener(
  "click",
  (e) => {
    const tempoWidth = window.getComputedStyle(tempo).width;
    const newTempo = e.offsetX / parseInt(tempoWidth);
    tempoInput.style.width = newTempo * 100 + "%";

    audio.preservesPitch = false;
    audio.mozPreservesPitch = false;
    audio.webkitPreservesPitch = false;
    audio.playbackRate = newTempo * 2;
  },
  false
);

changeSongURL();
