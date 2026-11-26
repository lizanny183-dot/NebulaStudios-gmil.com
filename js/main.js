const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const slides=$$('.slide'),dotsEl=$('#dots'),vid=$('#vid'),s0=$('#s0'),sEnd=$('#s8');
let cur=0,lock=false,started=false,wasOn=false;

/* ---------- Navegación entre secciones (sin scroll) ---------- */
slides.forEach((s,i)=>{const b=document.createElement('button');b.title=s.dataset.t;b.setAttribute('aria-label',s.dataset.t);b.onclick=()=>go(i);dotsEl.append(b)});
function ui(){
  document.body.dataset.s=cur;
  $$('#dots button').forEach((b,i)=>b.classList.toggle('on',i===cur));
  $('#prev').disabled=cur===0;$('#next').disabled=cur===slides.length-1;
  $('#label').textContent=String(cur+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0')+' · '+slides[cur].dataset.t;
}
function intro(el=s0){el.classList.remove('play');void el.offsetWidth;el.classList.add('play')}
function go(n){
  if(n<0||n>=slides.length||n===cur||lock)return;lock=true;
  const g=$('#glitch');g.classList.remove('on');void g.offsetWidth;g.classList.add('on');
  setTimeout(()=>{slides[cur].classList.remove('active');cur=n;slides[cur].classList.add('active');ui();if(n===0)intro();if(slides[n]===sEnd)intro(sEnd);if(n!==7)vid.pause()},260);
  setTimeout(()=>lock=false,900);
}
$('#prev').onclick=()=>go(cur-1);$('#next').onclick=()=>go(cur+1);
s0.addEventListener('click',()=>{if(!started){started=true;playMusic()}go(1)});
addEventListener('keydown',e=>{
  if($('#lb').classList.contains('on')){if(e.key==='Escape')closeLb();return}
  if(e.target.matches('input,video'))return;
  if(e.key==='ArrowRight'||e.key==='PageDown'){go(cur+1)}else if(e.key==='ArrowLeft'||e.key==='PageUp'){go(cur-1)}
  else if(e.key===' '&&cur===0){e.preventDefault();s0.click()}
});
let tx=0;addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});
addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>70&&!e.target.matches('input,video')&&cur>0)go(cur+(d<0?1:-1))},{passive:true});
addEventListener('mousemove',e=>{const r=document.documentElement.style;r.setProperty('--mx',(e.clientX/innerWidth-.5)*2);r.setProperty('--my',(e.clientY/innerHeight-.5)*2)});

/* ---------- Música ---------- */
const au=new Audio('assets/audio/theme.mp3');au.loop=true;au.volume=.45;au.preload='auto';
const mb=$('#music');
function sync(){mb.textContent=au.paused?'▶ Reproducir música':'❚❚ Pausar música'}
function playMusic(){au.play().then(sync).catch(sync)}
mb.onclick=()=>{au.paused?playMusic():(au.pause(),sync())};
$('#vol').oninput=e=>au.volume=e.target.value;
au.onerror=()=>{$('.mus').hidden=true};
vid.onplay=()=>{wasOn=!au.paused;au.pause();sync()};
vid.onpause=vid.onended=()=>{if(wasOn){wasOn=false;playMusic()}};
vid.onerror=()=>{$('#vnote').hidden=false};
vid.muted=false;vid.volume=1; /* el tráiler siempre suena a todo volumen; la música se pausa sola al darle play */

/* ---------- Galería de escenarios ---------- */
const I='assets/images/';
const G=[{s:'callejon',t:'Callejón'},{s:'almacen',t:'Almacén'},{s:'ciudad',t:'La ciudad al atardecer'},{s:'oficina',t:'Oficina'},{s:'estacion',t:'Estación'},{cmp:1,t:'Pasillo · del concepto a la escena final (arrastra el control)'},{s:'ilustracion-ivon-shawn',t:'Ilustración · Ivon y Shawn'},{s:'fotografia',t:'La fotografía rota'}];
const stage=$('#stage'),th=$('#thumbs');
G.forEach((g,i)=>{const im=new Image();im.src=I+(g.s||'pasillo-final')+'.jpg';im.alt=g.t;im.onclick=()=>show(i);th.append(im)});
function show(i){
  const g=G[i];$$('#thumbs img').forEach((t,k)=>t.classList.toggle('on',k===i));$('#cap').textContent=g.t;
  stage.style.setProperty('--p','50%');
  stage.innerHTML=g.cmp?`<img src="${I}pasillo-final.jpg" alt="Pasillo final"><img class="top" src="${I}pasillo-concepto.jpg" alt="Pasillo concepto"><i></i><input type="range" min="0" max="100" value="50" aria-label="Comparar">`:`<img src="${I}${g.s}.jpg" alt="${g.t}">`;
  if(g.cmp)$('input',stage).oninput=e=>stage.style.setProperty('--p',e.target.value+'%');
  $('#s5 .bg').style.backgroundImage=`url(${I}${g.s||'pasillo-final'}.jpg)`;
}
show(0);

/* ---------- Storyboard ---------- */
[['storyboard-1','01 · Boceto a lápiz','-2deg'],['storyboard-2','02 · Paneles','1.2deg'],['storyboard-3','03 · Página','-1deg']].forEach(([f,t,r])=>{
  $('#sb').insertAdjacentHTML('beforeend',`<figure class="card" style="--r:${r}"><img src="${I+f}.jpg" alt="${t}"><figcaption class="mono">${t}</figcaption></figure>`)});

/* ---------- Ampliar imágenes ---------- */
const lb=$('#lb');function closeLb(){lb.classList.remove('on')}
lb.onclick=closeLb;
document.addEventListener('click',e=>{
  const im=e.target.closest('.zoom,.card,.stage')&&(e.target.tagName==='IMG'?e.target:e.target.closest('.card')?.querySelector('img'));
  if(im&&!im.closest('.thumbs')){$('img',lb).src=im.src;lb.classList.add('on')}
});

/* ---------- Estrellas (fondo de las dos primeras secciones) ---------- */
const cv=$('#stars'),cx=cv.getContext('2d'),rm=matchMedia('(prefers-reduced-motion:reduce)').matches;let W,H,S=[];
function size(){const d=devicePixelRatio||1;W=cv.width=innerWidth*d;H=cv.height=innerHeight*d;S=Array.from({length:140},()=>({x:Math.random()*W,y:Math.random()*H,r:(Math.random()*1.3+.3)*d,p:Math.random()*6.28,v:.4+Math.random()*1.2,z:Math.random()}))}
function draw(t){cx.clearRect(0,0,W,H);for(const s of S){cx.globalAlpha=(.35+.65*Math.abs(Math.sin(t/1000*s.v*.6+s.p)))*(.4+.6*s.z);cx.fillStyle=s.z>.8?'#bcd0ff':'#fff';cx.beginPath();cx.arc((s.x+t*.004*s.z)%W,s.y,s.r,0,6.28);cx.fill()}if(!rm)requestAnimationFrame(draw)}
size();addEventListener('resize',size);requestAnimationFrame(draw);

ui();intro();
