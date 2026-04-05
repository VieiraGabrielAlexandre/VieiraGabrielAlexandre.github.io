// Música Starter — JS
// Recursos: Afinador (microfone), Metrônomo, Campo Harmônico, Treino de Intervalos

// ---------- Utilidades ----------
const NOTES_SHARP = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
function freqToNoteNumber(freq){
  return Math.round(12 * Math.log2(freq/440) + 69);
}
function noteNumberToFreq(n){
  return 440 * Math.pow(2, (n-69)/12);
}
function noteNameFromNumber(n){
  const name = NOTES_SHARP[(n % 12 + 12) % 12];
  const octave = Math.floor(n/12) - 1;
  return `${name}${octave}`;
}
function centsOff(freq, noteNum){
  const ref = noteNumberToFreq(noteNum);
  return Math.floor(1200 * Math.log2(freq/ref));
}
function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

// ---------- Tabs ----------
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.setAttribute("aria-selected","false"));
    btn.setAttribute("aria-selected","true");
    const target = btn.getAttribute("data-target");
    document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
    document.querySelector(target).classList.add("active");
  });
});

// ---------- Afinador ----------
let audioCtx, analyser, micStream;
const tunerNeedle = document.getElementById("needle");
const noteNameEl = document.getElementById("note-name");
const freqEl = document.getElementById("freq");
const centsEl = document.getElementById("cents");

async function startTuner(){
  try{
    micStream = await navigator.mediaDevices.getUserMedia({audio:true});
  }catch(e){
    alert("Não foi possível acessar o microfone: " + e.message);
    return;
  }
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const src = audioCtx.createMediaStreamSource(micStream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  src.connect(analyser);
  updateTuner();
}

function autoCorrelate(buf, sampleRate){
  // Autocorrelação simples (bom o bastante p/ iniciantes)
  const SIZE = buf.length;
  const rms = Math.sqrt(buf.reduce((s,v)=>s+v*v,0)/SIZE);
  if (rms < 0.01) return -1; // muito baixo / silêncio
  let r1=0, r2=SIZE-1, thres = 0.2;
  for(let i=0;i<SIZE/2;i++){ if(Math.abs(buf[i])<thres){ r1=i; break; } }
  for(let i=1;i<SIZE/2;i++){ if(Math.abs(buf[SIZE-i])<thres){ r2=SIZE-i; break; } }
  buf = buf.slice(r1, r2);
  const newSize = buf.length;
  const c = new Array(newSize).fill(0);
  for(let i=0;i<newSize;i++){
    for(let j=0;j<newSize-i;j++){ c[i] = c[i] + buf[j]*buf[j+i]; }
  }
  let d=0; while(c[d] > c[d+1]) d++;
  let maxval=-1, maxpos=-1;
  for(let i=d;i<newSize;i++){
    if(c[i] > maxval){ maxval=c[i]; maxpos=i; }
  }
  let T0 = maxpos;
  // interpolação parabólica
  const x1 = c[T0-1] || 0, x2 = c[T0], x3 = c[T0+1] || 0;
  const a = (x1 + x3 - 2*x2)/2;
  const b = (x3 - x1)/2;
  if(a) T0 = T0 - b/(2*a);
  const freq = sampleRate/T0;
  return freq;
}

function updateTuner(){
  if(!analyser) return;
  const bufferLength = analyser.fftSize;
  const buf = new Float32Array(bufferLength);
  analyser.getFloatTimeDomainData(buf);
  const freq = autoCorrelate(buf, audioCtx.sampleRate);
  if(freq > 40 && freq < 2000){
    const noteNum = freqToNoteNumber(freq);
    const cents = centsOff(freq, noteNum);
    noteNameEl.textContent = noteNameFromNumber(noteNum);
    freqEl.textContent = `${freq.toFixed(1)} Hz`;
    centsEl.textContent = `${cents>0?'+':''}${cents} cents`;
    const x = clamp(50 + (cents/50)*50, 0, 100);
    tunerNeedle.style.left = `${x}%`;
    centsEl.className = cents === 0 ? "good" : (Math.abs(cents)<=5 ? "good" : (Math.abs(cents)<=20 ? "" : "bad"));
  }else{
    freqEl.textContent = "— Hz";
    centsEl.textContent = "— cents";
  }
  requestAnimationFrame(updateTuner);
}
document.getElementById("btn-start-tuner")?.addEventListener("click", startTuner);

// ---------- Metrônomo ----------
let metCtx, isRunning=false, nextNoteTime=0, currentBeat=0, lookahead, scheduleAhead=0.1, schedulerTimer, tapTimes=[];
const bpmEl = document.getElementById("bpm");
const accentEl = document.getElementById("accent");
const progressEl = document.getElementById("beat-progress");

function initMet(){
  metCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function scheduleClick(time, accented){
  const osc = metCtx.createOscillator();
  const gain = metCtx.createGain();
  osc.type = "square";
  osc.frequency.value = accented ? 2000 : 1100;
  gain.gain.setValueAtTime(accented ? 0.2 : 0.12, time);
  gain.gain.exponentialRampToValueAtTime(0.00001, time+0.03);
  osc.connect(gain).connect(metCtx.destination);
  osc.start(time);
  osc.stop(time+0.03);
}
function scheduler(){
  const secondsPerBeat = 60.0/Number(bpmEl.value);
  while(nextNoteTime < metCtx.currentTime + scheduleAhead){
    const accented = (currentBeat % Number(accentEl.value) === 0);
    scheduleClick(nextNoteTime, accented);
    nextNoteTime += secondsPerBeat;
    currentBeat++;
  }
  // progress visual
  const frac = (metCtx.currentTime % (60/Number(bpmEl.value))) / (60/Number(bpmEl.value));
  progressEl.value = frac;
}
function startMet(){
  if(isRunning) return;
  if(!metCtx) initMet();
  isRunning = true;
  currentBeat = 0;
  nextNoteTime = metCtx.currentTime + 0.05;
  schedulerTimer = setInterval(scheduler, 25);
}
function stopMet(){
  isRunning = false;
  clearInterval(schedulerTimer);
  progressEl.value = 0;
}
document.getElementById("btn-start-met")?.addEventListener("click", startMet);
document.getElementById("btn-stop-met")?.addEventListener("click", stopMet);

document.getElementById("btn-tap")?.addEventListener("click", ()=>{
  const now = performance.now();
  tapTimes.push(now);
  if(tapTimes.length > 8) tapTimes.shift();
  if(tapTimes.length >= 2){
    const intervals = [];
    for(let i=1;i<tapTimes.length;i++) intervals.push(tapTimes[i]-tapTimes[i-1]);
    const avg = intervals.reduce((a,b)=>a+b,0)/intervals.length;
    const bpm = clamp(Math.round(60000/avg), 30, 260);
    bpmEl.value = bpm;
    localStorage.setItem("music_starter_bpm", String(bpm));
  }
});
window.addEventListener("keydown", (e)=>{
  if(e.code === "Space"){ e.preventDefault(); document.getElementById("btn-tap").click(); }
  if(e.key.toLowerCase() === "s"){ isRunning ? stopMet() : startMet(); }
});
// persist BPM
if(localStorage.getItem("music_starter_bpm")){
  bpmEl.value = localStorage.getItem("music_starter_bpm");
}

// ---------- Harmonia (Campo Harmônico) ----------
const KEY_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const MAJOR_SCALE = [0,2,4,5,7,9,11];
const MINOR_NAT_SCALE = [0,2,3,5,7,8,10];
const MAJOR_TRIADS = ["Maj","min","min","Maj","Maj","min","dim"];
const MAJOR_7THS = ["Maj7","min7","min7","Maj7","7","min7","m7♭5"];
const MINOR_TRIADS = ["min","dim","Maj","min","min","Maj","Maj"];
const MINOR_7THS = ["min7","m7♭5","Maj7","min7","min7","Maj7","7"];

const keySelect = document.getElementById("key-select");
const modeSelect = document.getElementById("mode-select");
const harmonyOut = document.getElementById("harmony-output");

KEY_NAMES.forEach(k=>{
  const opt = document.createElement("option");
  opt.value = k; opt.textContent = k;
  keySelect.appendChild(opt);
});
keySelect.value = "C";

function buildHarmony(){
  const tonic = KEY_NAMES.indexOf(keySelect.value);
  const mode = modeSelect.value;
  const scale = (mode === "major") ? MAJOR_SCALE : MINOR_NAT_SCALE;
  const triads = (mode === "major") ? MAJOR_TRIADS : MINOR_TRIADS;
  const sevenths = (mode === "major") ? MAJOR_7THS : MINOR_7THS;
  const degrees = ["I","ii","iii","IV","V","vi","vii°"];
  const names = scale.map(semi => KEY_NAMES[(tonic + semi) % 12]);
  const triadNames = names.map((n,i)=> `${n}${triads[i] === "Maj" ? "" : triads[i] === "min" ? "m" : (triads[i]==="dim" ? "°" : triads[i])}`);
  const seventhNames = names.map((n,i)=> `${n}${sevenths[i].replace("Maj7","Δ7").replace("m7♭5","ø7")}`);

  harmonyOut.innerHTML = `
    <div class="help">Tonalidade: <strong>${keySelect.value} ${mode === "major" ? "Maior" : "Menor (natural)"}.</strong> Acordes diatônicos:</div>
    <div class="chord-grid" style="margin-top:10px">
      ${triadNames.map((ch,i)=>`<div class="degree"><div class="muted" style="margin-bottom:6px">${degrees[i]}</div><div style="font-size:1.1rem">${ch}</div></div>`).join("")}
    </div>
    <div class="help" style="margin-top:10px">Sétimas:</div>
    <div class="chord-grid">
      ${seventhNames.map((ch,i)=>`<div class="degree"><div class="muted">${degrees[i]}</div><div style="font-size:1.05rem">${ch}</div></div>`).join("")}
    </div>
    <p class="help" style="margin-top:12px">Progressoes populares: <strong>I–V–vi–IV</strong>, <strong>ii–V–I</strong>, <strong>vi–IV–I–V</strong>. Toque devagar com o metrônomo.</p>
  `;
}
document.getElementById("btn-build-harmony")?.addEventListener("click", buildHarmony);

// ---------- Treino de Intervalos ----------
const intervals = [
  {name:"Uníssono", semitones:0},
  {name:"2ª menor", semitones:1},
  {name:"2ª maior", semitones:2},
  {name:"3ª menor", semitones:3},
  {name:"3ª maior", semitones:4},
  {name:"4ª justa", semitones:5},
  {name:"Tritono", semitones:6},
  {name:"5ª justa", semitones:7},
  {name:"6ª menor", semitones:8},
  {name:"6ª maior", semitones:9},
  {name:"7ª menor", semitones:10},
  {name:"7ª maior", semitones:11},
  {name:"Oitava", semitones:12},
];
const answersEl = document.getElementById("answers");
const lastEl = document.getElementById("last-result");
const scoreEl = document.getElementById("score");
const triesEl = document.getElementById("tries");
let currentInterval = null, score=0, tries=0;

function buildAnswers(){
  intervals.forEach(iv => {
    const b = document.createElement("button");
    b.className = "btn btn--ghost";
    b.textContent = iv.name;
    b.addEventListener("click", ()=>{
      tries++;
      if(currentInterval && currentInterval.semitones === iv.semitones){
        score++; lastEl.textContent = "✅ Correto! " + iv.name;
      }else{
        lastEl.textContent = "❌ Era: " + (currentInterval ? currentInterval.name : "—");
      }
      scoreEl.textContent = String(score);
      triesEl.textContent = String(tries);
    });
    answersEl.appendChild(b);
  });
}
buildAnswers();

function playTone(ctx, freq, when, dur=0.6){
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.2, when+0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, when+dur);
  osc.frequency.value = freq;
  osc.connect(gain).connect(ctx.destination);
  osc.start(when);
  osc.stop(when+dur+0.02);
}
document.getElementById("btn-play-interval")?.addEventListener("click", ()=>{
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const baseNote = 48 + Math.floor(Math.random()*12); // C2..B2
  currentInterval = intervals[Math.floor(Math.random()*intervals.length)];
  const f1 = noteNumberToFreq(baseNote);
  const f2 = noteNumberToFreq(baseNote + currentInterval.semitones);
  const now = ctx.currentTime + 0.05;
  playTone(ctx, f1, now, 0.5);
  playTone(ctx, f2, now + 0.65, 0.7);
  lastEl.textContent = "Ouvindo...";
});

// Inicial
// Nada pesado aqui; as seções carregam rápido.


// ---------- Afinador: cordas-alvo + tom de referência ----------
const targetSel = document.getElementById("target-string");
const btnRef = document.getElementById("btn-ref");
let targetFreq = null;
targetSel?.addEventListener("change", () => {
  targetFreq = targetSel.value ? Number(targetSel.value) : null;
});

function playRefTone(freq, dur=1.2){
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime+0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur + 0.02);
}

btnRef?.addEventListener("click", ()=>{
  if(targetFreq){ playRefTone(targetFreq); }
  else{ alert("Selecione uma corda no seletor Alvo (corda)."); }
});

// Ajuste visual do afinador com alvo: mostra diferença relativa ao alvo se existir
const tunerUpdateOrig = updateTuner;
updateTuner = function(){
  if(!analyser) return;
  const bufferLength = analyser.fftSize;
  const buf = new Float32Array(bufferLength);
  analyser.getFloatTimeDomainData(buf);
  const freq = autoCorrelate(buf, audioCtx.sampleRate);
  if(freq > 40 && freq < 2000){
    const noteNum = freqToNoteNumber(freq);
    let cents = 0;
    if(targetFreq){
      const targetNoteNum = freqToNoteNumber(targetFreq);
      cents = Math.floor(1200 * Math.log2(freq / targetFreq));
      noteNameEl.textContent = noteNameFromNumber(noteNum) + " → alvo";
      freqEl.textContent = `${freq.toFixed(1)} Hz (${targetFreq.toFixed(1)} Hz)`;
    }else{
      cents = centsOff(freq, noteNum);
      noteNameEl.textContent = noteNameFromNumber(noteNum);
      freqEl.textContent = `${freq.toFixed(1)} Hz`;
    }
    centsEl.textContent = `${cents>0?'+':''}${cents} cents`;
    const x = clamp(50 + (cents/50)*50, 0, 100);
    tunerNeedle.style.left = `${x}%`;
    centsEl.className = cents === 0 ? "good" : (Math.abs(cents)<=5 ? "good" : (Math.abs(cents)<=20 ? "" : "bad"));
  }else{
    freqEl.textContent = "— Hz";
    centsEl.textContent = "— cents";
  }
  requestAnimationFrame(updateTuner);
}


// ---------- Metrônomo: padrões rítmicos ----------
const patternEl = document.getElementById("pattern");
/*
  Padrão básico:
  - 'subdiv': subdivisões por batida (1, 2, 4)
  - 'mask': array por batida (1 = clique normal, 0 = silêncio); índices 0..N-1 onde N = acento
*/
const PATTERNS = {
  rock4: { name: "Rock 4/4", accentEvery: 4, subdiv: 1, mask: [1,1,1,1] },
  bossa: { name: "Bossa simples", accentEvery: 4, subdiv: 2, mask: [1,0,1,0] },  // bate forte nas cabeças; sub fraco
  funk16: { name: "Funk 16ths", accentEvery: 4, subdiv: 4, mask: [1,0,1,0] }     // marca 1 e o "e" do 2/4
};

let currentPattern = PATTERNS.rock4;
patternEl?.addEventListener("change", ()=>{
  currentPattern = PATTERNS[patternEl.value] || PATTERNS.rock4;
});

// Sobrescreve scheduler para considerar subdivisões e mask
function scheduleClickPattern(time, accented, sub){
  const osc = metCtx.createOscillator();
  const gain = metCtx.createGain();
  osc.type = "square";
  // pitch indica acento/subdivisão
  if(accented && sub===0) osc.frequency.value = 2200;
  else if(sub===0) osc.frequency.value = 1400;
  else osc.frequency.value = 900;
  gain.gain.setValueAtTime(accented ? 0.22 : 0.12, time);
  gain.gain.exponentialRampToValueAtTime(0.00001, time+0.03);
  osc.connect(gain).connect(metCtx.destination);
  osc.start(time);
  osc.stop(time+0.03);
}

// re-implementa scheduler usando pattern
function scheduler(){
  const bpm = Number(bpmEl.value);
  const spb = 60.0 / bpm;
  const subdiv = currentPattern.subdiv || 1;
  const accentEvery = Number(accentEl.value); // ainda permite sobrescrever a métrica básica
  while(nextNoteTime < metCtx.currentTime + scheduleAhead){
    const beatIndex = currentBeat % accentEvery;
    const accented = (beatIndex === 0);
    // aplica mask: se 0, silencia batida principal (subdivisões ainda tocam fracas)
    const playBeat = (currentPattern.mask || [1,1,1,1])[beatIndex] === 1;
    // subcliques
    for(let s=0; s<subdiv; s++){
      const t = nextNoteTime + s*(spb/subdiv);
      if(s===0 && playBeat){
        scheduleClickPattern(t, accented, s);
      }else if(s>0){
        // subdivisão mais fraca
        scheduleClickPattern(t, false, s);
      }
    }
    nextNoteTime += spb;
    currentBeat++;
  }
  // barra de progresso
  const frac = (metCtx.currentTime % (60/Number(bpmEl.value))) / (60/Number(bpmEl.value));
  progressEl.value = frac;
}


// ---------- PWA: registro de SW + botão Instalar ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}

let deferredPrompt = null;
const btnInstall = document.getElementById('btn-install');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstall?.classList.remove('hidden');
});
btnInstall?.addEventListener('click', async () => {
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
});
