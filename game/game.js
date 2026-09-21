(() => {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const keys = {KeyD:0, KeyF:1, KeyJ:2, ArrowLeft:0, ArrowDown:1, ArrowRight:2};
  let chart, lyrics = [], notes = [], playing = false, score = 0, combo = 0, health = 1, raf;
  const audio = $('#audio');
  async function load() {
    try { chart = await (await fetch('chart.json')).json(); lyrics = await (await fetch('lyrics.json')).json(); $('#status').textContent = 'Ready — tap to start'; $('#startBtn').disabled = false; }
    catch (e) { $('#status').textContent = 'Chart load error'; $('#startBtn').disabled = false; }
  }
  function reset() { score = combo = 0; health = 1; notes = (chart.notes || []).map((n,i) => ({...n,id:i,hit:false})); $('#score').textContent='0'; $('#combo').textContent='0X'; $('#health').textContent='100%'; $('#notes').innerHTML=''; }
  function spawn(n) { const e = document.createElement('b'); e.className='note lane'+n.lane; e.dataset.id=n.id; $('#notes').append(e); n.el=e; }
  function loop() { if (!playing) return; const t=audio.currentTime; $('#time').textContent=Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'); const h=$('#lanes').clientHeight; notes.forEach(n=>{ if(n.hit) return; if(t>=n.t-2 && t<=n.t+.25){if(!n.el)spawn(n); n.el.style.top=((6+(1-(n.t-t)/2)*72)/100*h)+'px';} else if(n.el && (t>n.t+.25)){n.el.remove();n.el=null; if(!n.hit){n.miss=true;combo=0;health=Math.max(0,health-.08);}} }); const l=lyrics.find(x=>t>=x.start&&t<x.end); $('#lyric').textContent=l?l.text:''; $('#combo').textContent=combo+'X';$('#health').textContent=Math.round(health*100)+'%'; if(audio.ended||t>=(chart.duration||151.2)){end();return} raf=requestAnimationFrame(loop); }
  function hit(lane){ if(!playing)return; const t=audio.currentTime, n=notes.filter(n=>n.lane===lane&&!n.hit&&!n.miss).sort((a,b)=>Math.abs(a.t-t)-Math.abs(b.t-t))[0]; if(!n||Math.abs(n.t-t)>.2)return; n.hit=true; if(n.el)n.el.remove(); const d=Math.abs(n.t-t); score += d<=.05?300:d<=.1?200:100; combo++; $('#score').textContent=score; $('#combo').textContent=combo+'X'; }
  function start(){if(!chart)return;$('#start').classList.add('hidden');$('#result').classList.add('hidden');$('#game').classList.remove('hidden');reset();playing=true;audio.currentTime=0;audio.play().catch(()=>{});cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);}
  function end(){playing=false;cancelAnimationFrame(raf);audio.pause();$('#finalScore').textContent=score;$('#result').classList.remove('hidden');}
  $('#startBtn').onclick=start; $('#again').onclick=start; $$('.pads button').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();hit(+b.dataset.lane)}}); $$('.lanes>div[data-lane]').forEach(b=>b.onpointerdown=()=>hit(+b.dataset.lane)); window.onkeydown=e=>{if(keys[e.code]!==undefined){e.preventDefault();hit(keys[e.code])}}; load();
})();
