const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const toHex = c => c.toString(16).padStart(2,'0');

// --- Definição dos níveis e guias ---
const LEVELS = [
    {
        id:'stick',
        title:'Boneco Palito',
        difficulty:'Iniciante',
        prompt:'Desenhe um boneco palito com cabeça, tronco, braços e pernas. Use guiás para proporções.',
        guide:(ctx,w,h)=>{
            ctx.strokeStyle='rgba(124,156,255,.6)'; ctx.lineWidth=1.5; ctx.setLineDash([6,6]);
            const cx=w*0.5, cy=h*0.45; const head=40;
            // Linha de chão e centro
            ctx.beginPath(); ctx.moveTo(30,h-60); ctx.lineTo(w-30,h-60); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx,30); ctx.lineTo(cx,h-30); ctx.stroke();
            // Cabeça
            ctx.setLineDash([4,4]);
            ctx.beginPath(); ctx.arc(cx, cy-80, head, 0, Math.PI*2); ctx.stroke();
            // Tronco
            ctx.setLineDash([6,6]); ctx.beginPath(); ctx.moveTo(cx, cy-40); ctx.lineTo(cx, cy+80); ctx.stroke();
            // Braços
            ctx.beginPath(); ctx.moveTo(cx-70, cy+10); ctx.lineTo(cx+70, cy+10); ctx.stroke();
            // Pernas (âncoras)
            ctx.beginPath(); ctx.moveTo(cx, cy+80); ctx.lineTo(cx-60, h-60); ctx.moveTo(cx, cy+80); ctx.lineTo(cx+60, h-60); ctx.stroke();
            ctx.setLineDash([]);
        }
    },
    {
        id:'shapes',
        title:'Formas básicas',
        difficulty:'Iniciante',
        prompt:'Trace por cima: círculo, quadrado e triângulo. Concentre-se em linhas firmes.',
        guide:(ctx,w,h)=>{
            ctx.strokeStyle='rgba(110,243,251,.6)'; ctx.lineWidth=2; ctx.setLineDash([5,6]);
            const pad=60; const gw=(w-4*pad)/3; const gy=h*0.45;
            // círculo
            ctx.beginPath(); ctx.arc(pad+gw/2, gy, Math.min(gw, h*0.6)/3, 0, Math.PI*2); ctx.stroke();
            // quadrado
            ctx.strokeRect(2*pad+gw, gy - gw/2, gw, gw);
            // triângulo
            ctx.beginPath(); ctx.moveTo(3*pad+2*gw + gw/2, gy-gw/2);
            ctx.lineTo(3*pad+2*gw, gy+gw/2); ctx.lineTo(3*pad+2*gw+gw, gy+gw/2); ctx.closePath(); ctx.stroke();
            ctx.setLineDash([]);
        }
    },
    {
        id:'persp1',
        title:'Casa — perspectiva 1 ponto',
        difficulty:'Intermediário',
        prompt:'Construa uma caixa/casa em perspectiva com um ponto de fuga central. Use as linhas guias.',
        guide:(ctx,w,h)=>{
            const cx=w/2, horizon=h*0.45; ctx.strokeStyle='rgba(124,156,255,.5)'; ctx.lineWidth=1; ctx.setLineDash([6,6]);
            // horizonte
            ctx.beginPath(); ctx.moveTo(0,horizon); ctx.lineTo(w,horizon); ctx.stroke();
            // ponto de fuga
            ctx.setLineDash([]);
            ctx.fillStyle='rgba(124,156,255,.8)'; ctx.beginPath(); ctx.arc(cx,horizon,3,0,Math.PI*2); ctx.fill();
            ctx.setLineDash([6,6]);
            // caixa frontal
            const bx=cx-140, by=horizon+40, bw=160, bh=110;
            ctx.strokeRect(bx,by,bw,bh);
            // linhas até o ponto de fuga
            const corners=[[bx,by],[bx+bw,by],[bx,by+bh],[bx+bw,by+bh]];
            for(const [x,y] of corners){ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(cx,horizon); ctx.stroke();}
            // telhado guia
            ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx+bw/2, by-50); ctx.lineTo(bx+bw,by); ctx.stroke();
        }
    },
    {
        id:'face',
        title:'Rosto — proporções',
        difficulty:'Intermediário',
        prompt:'Estruture um rosto: oval, linhas de olhos, nariz e boca. Depois refine por cima.',
        guide:(ctx,w,h)=>{
            ctx.strokeStyle='rgba(255,255,255,.45)'; ctx.lineWidth=1.5; ctx.setLineDash([6,6]);
            const cx=w*0.5, cy=h*0.45, rx=110, ry=140;
            // oval
            ctx.save(); ctx.translate(cx,cy); ctx.scale(rx,ry); ctx.beginPath(); ctx.arc(0,0,1,0,Math.PI*2); ctx.restore(); ctx.stroke();
            // central
            ctx.beginPath(); ctx.moveTo(cx, cy-ry-20); ctx.lineTo(cx, cy+ry+20); ctx.stroke();
            // olhos
            const eyeY=cy-ry*0.1; ctx.beginPath(); ctx.moveTo(cx-80, eyeY); ctx.lineTo(cx+80, eyeY); ctx.stroke();
            // nariz
            const noseY=cy+ry*0.2; ctx.beginPath(); ctx.moveTo(cx-40, noseY); ctx.lineTo(cx+40, noseY); ctx.stroke();
            // boca
            const mouthY=cy+ry*0.45; ctx.beginPath(); ctx.moveTo(cx-70, mouthY); ctx.lineTo(cx+70, mouthY); ctx.stroke();
        }
    },
    {
        id:'eye',
        title:'Olho — estudo simples',
        difficulty:'Intermediário',
        prompt:'Desenhe um olho a partir da forma de amêndoa. Adicione íris e reflexo.',
        guide:(ctx,w,h)=>{
            ctx.strokeStyle='rgba(110,243,251,.6)'; ctx.lineWidth=2; ctx.setLineDash([6,6]);
            const cx=w*0.5, cy=h*0.5, rx=120, ry=50;
            // amêndoa (duas curvas)
            ctx.beginPath(); ctx.moveTo(cx-rx, cy); ctx.quadraticCurveTo(cx, cy-ry, cx+rx, cy); ctx.quadraticCurveTo(cx, cy+ry, cx-rx, cy); ctx.closePath(); ctx.stroke();
            // íris
            ctx.setLineDash([4,6]); ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI*2); ctx.stroke();
            // pupila
            ctx.setLineDash([]); ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI*2); ctx.stroke();
            // reflexo
            ctx.globalAlpha=.5; ctx.beginPath(); ctx.arc(cx-10, cy-12, 8, 0, Math.PI*2); ctx.stroke(); ctx.globalAlpha=1;
        }
    },
    {
        id:'mona',
        title:'"Mona Lisa" — estudos por blocos',
        difficulty:'Avançado',
        prompt:'Estudo por blocos: esboce cabeça, tronco e mãos com formas simples. Concentre-se em proporções e silhueta.',
        guide:(ctx,w,h)=>{
            ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=1.5; ctx.setLineDash([6,6]);
            const cx=w*0.5, top=h*0.22;
            // cabeça oval
            ctx.save(); ctx.translate(cx, top+80); ctx.scale(70,90); ctx.beginPath(); ctx.arc(0,0,1,0,Math.PI*2); ctx.restore(); ctx.stroke();
            // caixa do tronco
            ctx.strokeRect(cx-120, top+160, 240, 160);
            // mãos (blocos)
            ctx.strokeRect(cx-60, top+320, 120, 40);
            // linha de eixo
            ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, h-50); ctx.stroke();
        }
    }
];

// --- Estado do app ---
const state = {
    tool:'pen', color:'#ffffff', size:6, alpha:1,
    drawing:false, last:null, straight:false,
    undoStack:[], redoStack:[], maxHistory:30,
    levelId: localStorage.getItem('cd.level') || 'stick',
    showGuides:true, showGrid:false, showNotebook:true,
};

// --- Elementos ---
const paper=$('#paper'), guides=$('#guides'), notebook=$('#notebook');
const ctxPaper=paper.getContext('2d');
const ctxGuides=guides.getContext('2d');
const ctxNote=notebook.getContext('2d');

// --- Resize ---
function fit(){
    const wrap = document.querySelector('.canvas-wrap');
    const dpr = Math.min(window.devicePixelRatio||1, 2);
    const w = wrap.clientWidth, h = Math.max(420, wrap.clientHeight);
    for(const c of [paper,guides,notebook]){ c.width=w*dpr; c.height=h*dpr; c.style.width=w+'px'; c.style.height=h+'px'; const cctx=c.getContext('2d'); cctx.setTransform(dpr,0,0,dpr,0,0); }
    drawNotebook(); drawGuides(); restoreFromStorage();
}
window.addEventListener('resize', fit);

// --- Fundo de caderno e grade ---
function drawNotebook(){
    const w=notebook.width, h=notebook.height; const dpr=(window.devicePixelRatio||1);
    const sctx=ctxNote; sctx.save(); sctx.setTransform(1,0,0,1,0,0); sctx.clearRect(0,0,w,h); sctx.restore();
    const vw=notebook.clientWidth, vh=notebook.clientHeight; // desenhar em CSS px
    if(state.showNotebook){
        ctxNote.clearRect(0,0,vw,vh);
        // linhas horizontais
        ctxNote.strokeStyle='rgba(124,156,255,.12)'; ctxNote.lineWidth=1;
        for(let y=20; y<vh; y+=28){ ctxNote.beginPath(); ctxNote.moveTo(0,y); ctxNote.lineTo(vw,y); ctxNote.stroke(); }
        // margem esquerda
        ctxNote.strokeStyle='rgba(255,107,107,.4)'; ctxNote.beginPath(); ctxNote.moveTo(60,0); ctxNote.lineTo(60,vh); ctxNote.stroke();
    } else { ctxNote.clearRect(0,0,vw,vh); }

    if(state.showGrid){
        ctxNote.strokeStyle='rgba(110,243,251,.10)';
        for(let x=0; x<vw; x+=32){ ctxNote.beginPath(); ctxNote.moveTo(x,0); ctxNote.lineTo(x,vh); ctxNote.stroke(); }
        for(let y=0; y<vh; y+=32){ ctxNote.beginPath(); ctxNote.moveTo(0,y); ctxNote.lineTo(vw,y); ctxNote.stroke(); }
    }
}

// --- Guias ---
function drawGuides(){
    const vw=guides.clientWidth, vh=guides.clientHeight;
    ctxGuides.clearRect(0,0,vw,vh);
    if(!state.showGuides) return;
    const lv = LEVELS.find(l=>l.id===state.levelId) || LEVELS[0];
    lv.guide(ctxGuides, vw, vh);
}

// --- Histórico ---
function pushHistory(){
    try{
        const vw=paper.clientWidth, vh=paper.clientHeight;
        const img = ctxPaper.getImageData(0,0,vw,vh);
        state.undoStack.push(img); if(state.undoStack.length>state.maxHistory) state.undoStack.shift();
        state.redoStack=[];
    }catch(e){ console.warn('Histórico indisponível:', e); }
}

function undo(){ if(state.undoStack.length){ const vw=paper.clientWidth, vh=paper.clientHeight; const img=state.undoStack.pop(); const cur=ctxPaper.getImageData(0,0,vw,vh); state.redoStack.push(cur); ctxPaper.putImageData(img,0,0); saveToStorageThrottled(); }}
function redo(){ if(state.redoStack.length){ const vw=paper.clientWidth, vh=paper.clientHeight; const img=state.redoStack.pop(); const cur=ctxPaper.getImageData(0,0,vw,vh); state.undoStack.push(cur); ctxPaper.putImageData(img,0,0); saveToStorageThrottled(); }}

// --- Desenho ---
function setStatus(t){ $('#status').textContent=t; }

function startDraw(x,y){ pushHistory(); state.drawing=true; state.last={x,y}; drawDot(x,y); }
function stopDraw(){ state.drawing=false; state.last=null; saveToStorageThrottled(); }

function drawDot(x,y){
    const {tool,size,color,alpha} = state;
    ctxPaper.save();
    if(tool==='eraser'){
        ctxPaper.globalCompositeOperation='destination-out';
        ctxPaper.fillStyle='rgba(0,0,0,1)';
        ctxPaper.beginPath(); ctxPaper.arc(x,y,size/2,0,Math.PI*2); ctxPaper.fill();
    } else {
        ctxPaper.globalAlpha=alpha; ctxPaper.globalCompositeOperation='source-over'; ctxPaper.fillStyle=color; ctxPaper.beginPath(); ctxPaper.arc(x,y,Math.max(0.5,size/2),0,Math.PI*2); ctxPaper.fill();
    }
    ctxPaper.restore();
}

function drawLine(x1,y1,x2,y2){
    const {tool,size,color,alpha} = state;
    ctxPaper.save();
    if(tool==='eraser'){
        ctxPaper.globalCompositeOperation='destination-out';
        ctxPaper.strokeStyle='rgba(0,0,0,1)';
    } else {
        ctxPaper.globalCompositeOperation='source-over';
        ctxPaper.strokeStyle=color; ctxPaper.globalAlpha=alpha;
    }
    ctxPaper.lineWidth=size; ctxPaper.lineCap='round'; ctxPaper.lineJoin='round';
    ctxPaper.beginPath(); ctxPaper.moveTo(x1,y1); ctxPaper.lineTo(x2,y2); ctxPaper.stroke();
    ctxPaper.restore();
}

function pointerPos(e){
    const rect=paper.getBoundingClientRect();
    const x = (e.touches?e.touches[0].clientX:e.clientX) - rect.left;
    const y = (e.touches?e.touches[0].clientY:e.clientY) - rect.top;
    return {x,y};
}

paper.addEventListener('pointerdown', e=>{ e.preventDefault(); paper.setPointerCapture(e.pointerId); const p=pointerPos(e); startDraw(p.x,p.y); });
paper.addEventListener('pointermove', e=>{ if(!state.drawing) return; const p=pointerPos(e); let {x,y}=p; if(state.straight && state.last){ if(Math.abs(y-state.last.y) < Math.abs(x-state.last.x)) y=state.last.y; else x=state.last.x; } drawLine(state.last.x, state.last.y, x, y); state.last={x,y}; });
paper.addEventListener('pointerup', ()=> stopDraw()); paper.addEventListener('pointercancel', ()=> stopDraw());

// Mouse + touch fallback
paper.addEventListener('touchstart', e=>{ const p=pointerPos(e); startDraw(p.x,p.y); }, {passive:false});
paper.addEventListener('touchmove', e=>{ e.preventDefault(); if(!state.drawing) return; const p=pointerPos(e); drawLine(state.last.x,state.last.y,p.x,p.y); state.last=p; }, {passive:false});
paper.addEventListener('touchend', ()=> stopDraw());

// --- Controles ---
$('#toolSeg').addEventListener('click', e=>{ if(e.target.closest('button')){ $$('#toolSeg button').forEach(b=>b.classList.remove('active')); const b=e.target.closest('button'); b.classList.add('active'); state.tool=b.dataset.tool; setStatus(state.tool==='pen'?'Caneta ativa.':'Borracha ativa.'); }});
$('#color').addEventListener('input', e=> state.color=e.target.value);
$('#size').addEventListener('input', e=> state.size=+e.target.value);
$('#alpha').addEventListener('input', e=> state.alpha=+e.target.value);
$('#undo').addEventListener('click', undo);
$('#redo').addEventListener('click', redo);
$('#clear').addEventListener('click', ()=>{ pushHistory(); const vw=paper.clientWidth, vh=paper.clientHeight; ctxPaper.clearRect(0,0,vw,vh); saveToStorageThrottled(); });
$('#toggleGrid').addEventListener('click', e=>{ state.showGrid=!state.showGrid; drawNotebook(); e.target.classList.toggle('active', state.showGrid); });
$('#toggleNotebook').addEventListener('click', e=>{ state.showNotebook=!state.showNotebook; drawNotebook(); e.target.classList.toggle('active', state.showNotebook); });
$('#toggleGuides').addEventListener('click', e=>{ state.showGuides=!state.showGuides; drawGuides(); e.target.classList.toggle('active', state.showGuides); });

// Teclado
window.addEventListener('keydown', e=>{
    if(e.key==='Shift') state.straight=true;
    if(e.key==='p' || e.key==='P'){ state.tool='pen'; $$('#toolSeg button').forEach(b=>b.classList.toggle('active', b.dataset.tool==='pen')); }
    if(e.key==='e' || e.key==='E'){ state.tool='eraser'; $$('#toolSeg button').forEach(b=>b.classList.toggle('active', b.dataset.tool==='eraser')); }
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='z' && !e.shiftKey){ e.preventDefault(); undo(); }
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='z' && e.shiftKey){ e.preventDefault(); redo(); }
    if(e.key.toLowerCase()==='s'){ e.preventDefault(); savePNG(); }
    if(e.key.toLowerCase()==='g'){ state.showGuides=!state.showGuides; drawGuides(); $('#toggleGuides').classList.toggle('active', state.showGuides); }
});
window.addEventListener('keyup', e=>{ if(e.key==='Shift') state.straight=false; });

// Salvar imagem
function savePNG(){
    // Render sem guias se estiverem ativos
    const vw=paper.clientWidth, vh=paper.clientHeight;
    const tmp=document.createElement('canvas'); tmp.width=vw; tmp.height=vh; const t=tmp.getContext('2d');
    if(state.showNotebook||state.showGrid){ t.drawImage(notebook,0,0,vw,vh); }
    // NÃO desenhar guias para a exportação
    t.drawImage(paper,0,0,vw,vh);
    const link=document.createElement('a'); link.download=`caderno-${state.levelId}-${Date.now()}.png`; link.href=tmp.toDataURL('image/png'); link.click();
}
$('#save').addEventListener('click', savePNG);

// Persistência em localStorage
const STORAGE_KEY = 'cd.sketch.';
let saveTimeout=null;
function saveToStorage(){ try{ const vw=paper.clientWidth, vh=paper.clientHeight; const data=paper.toDataURL('image/png'); localStorage.setItem(STORAGE_KEY+state.levelId, JSON.stringify({w:vw,h:vh,data})); $('#saveState').textContent='Auto-save: salvo'; }catch(e){ console.warn('Falha ao salvar', e);} }
function saveToStorageThrottled(){ $('#saveState').textContent='Auto-save: salvando…'; clearTimeout(saveTimeout); saveTimeout=setTimeout(saveToStorage, 350); }
function restoreFromStorage(){ const raw=localStorage.getItem(STORAGE_KEY+state.levelId); const vw=paper.clientWidth, vh=paper.clientHeight; ctxPaper.clearRect(0,0,vw,vh); if(!raw) return; try{ const {data}=JSON.parse(raw); const img=new Image(); img.onload=()=>{ ctxPaper.clearRect(0,0,vw,vh); ctxPaper.drawImage(img,0,0,vw,vh); }; img.src=data; }catch(e){ console.warn('Falha ao restaurar', e); }
}

// Export/Import JSON do rascunho
$('#exportProject').addEventListener('click', e=>{ e.preventDefault(); const all={}; for(const l of LEVELS){ const raw=localStorage.getItem(STORAGE_KEY+l.id); if(raw) all[l.id]=JSON.parse(raw); } const blob=new Blob([JSON.stringify(all,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='caderno-rascunhos.json'; a.click(); URL.revokeObjectURL(url); });
$('#importProject').addEventListener('click', e=>{ e.preventDefault(); const inp=document.createElement('input'); inp.type='file'; inp.accept='application/json'; inp.onchange=()=>{ const file=inp.files[0]; if(!file) return; const rd=new FileReader(); rd.onload=()=>{ try{ const data=JSON.parse(rd.result); for(const k in data){ localStorage.setItem(STORAGE_KEY+k, JSON.stringify(data[k])); } restoreFromStorage(); alert('Rascunhos importados!'); }catch(err){ alert('JSON inválido.'); } }; rd.readAsText(file); }; inp.click(); });
$('#resetData').addEventListener('click', e=>{ e.preventDefault(); if(confirm('Apagar todos os rascunhos salvos?')){ for(const l of LEVELS){ localStorage.removeItem(STORAGE_KEY+l.id); } restoreFromStorage(); }});

// Sidebar níveis
function renderLevels(){
    const wrap=$('#levels'); wrap.innerHTML='';
    for(const l of LEVELS){
        const div=document.createElement('div'); div.className='level'; if(l.id===state.levelId) div.classList.add('active');
        div.innerHTML=`<div><strong>${l.title}</strong><br/><small>${l.difficulty}</small></div><div>▶</div>`;
        div.addEventListener('click', ()=>{ state.levelId=l.id; localStorage.setItem('cd.level', l.id); $$('.level').forEach(x=>x.classList.remove('active')); div.classList.add('active'); $('#prompt').textContent=l.prompt; drawGuides(); restoreFromStorage(); setStatus('Nível: '+l.title); });
        wrap.appendChild(div);
    }
    const cur=LEVELS.find(l=>l.id===state.levelId) || LEVELS[0]; $('#prompt').textContent=cur.prompt;
}

// Inicialização
renderLevels();
fit();
setStatus('Escolha um nível e comece a desenhar.');