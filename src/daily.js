/* ---------- Daily Pyramid: the same six lists for everyone today, one from each theme ---------- */
// Each theme's 30 lists are dealt in a shuffled order that is the same on every device, one a day,
// so no list comes back until the whole theme has been used; then a fresh shuffle starts.
const DAILY_START = Date.UTC(2026, 10, 22); // day #1 is 22 November 2026
function dailyRng(seed){ let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }; }
function dailyHash(s){ let h=2166136261; for (const ch of s){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619); } return h>>>0; }
function seededShuffle(arr, rnd){ const a=arr.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function dailyNumber(d=new Date()){ return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - DAILY_START)/864e5) + 1; }
function dailySet(num){
  const day=Math.max(0, num-1);
  return GROUPS.map(g=>{
    const ids=g.cats.map(c=>c.id).sort(), cycle=Math.floor(day/ids.length);
    const order=seededShuffle(ids, dailyRng(dailyHash(g.id+':'+cycle)));
    const cat=byId(order[day % ids.length]);
    return {gid:g.id, cat, order:seededShuffle([...Array(10).keys()], dailyRng(dailyHash(cat.id+':'+num)))};
  });
}
// only today's game is kept on this device (so a refresh doesn't lose it); nothing older
let daily=null;
function dailyKey(num){ return 'pyr-daily-'+num; }
function dailySave(){ if (!daily) return; store(dailyKey(daily.num), JSON.stringify({i:daily.i, res:daily.res, placed:daily.play.placed, rev:daily.play.revealed})); }
function startDaily(){
  try { Object.keys(localStorage).filter(k=>k.startsWith('pyr-daily-') && k!==dailyKey(dailyNumber())).forEach(k=>localStorage.removeItem(k)); } catch(e) {}
  const num=dailyNumber(), set=dailySet(num);
  let saved=null; try{ saved=JSON.parse(store(dailyKey(num))||'null'); }catch(e){}
  daily={num, set, i:0, res:[], play:null};
  if (saved && Array.isArray(saved.res)){ daily.i=Math.min(saved.i||0, set.length); daily.res=saved.res.slice(0,set.length); }
  show('daily');
  if (location.hash!=='#daily') history.replaceState(null,'',location.pathname+location.search+'#daily'); // a refresh comes back here
  if (daily.i>=set.length) return dailySummary();
  dailyRound(saved && saved.i===daily.i ? saved : null);
}
function dailyRound(saved){
  const r=daily.set[daily.i];
  daily.play=newPlay(r.cat, r.order.slice());
  if (saved && Array.isArray(saved.placed) && saved.placed.length===10){ daily.play.placed=saved.placed.slice(); daily.play.revealed=!!saved.rev; }
  $('dSum').classList.add('hidden'); $('dPlay').classList.remove('hidden');
  $('dHead').innerHTML=`<span class="dnum">Daily #${daily.num}</span><span>Round ${daily.i+1} of ${daily.set.length}</span><span class="dpips">${daily.set.map((s,k)=>`<i class="${k<daily.i?'done':k===daily.i?'now':''}">${GROUPS.find(g=>g.id===s.gid).emoji}</i>`).join('')}</span>`;
  renderDaily();
  if (daily.play.revealed) dailyShowResult(false);
  else $('dResult').classList.add('hidden');
}
function renderDaily(){
  if (dragOn || !daily || !daily.play) return;
  const p=daily.play;
  setH($('dBoard'), boardHTML(p), daily.num+':'+daily.i);
  const full=!p.placed.includes(-1);
  $('dCheck').disabled=!full||p.revealed; $('dClear').disabled=p.revealed;
  dailySave();
}
function dailyShowResult(fresh){
  const p=daily.play, n=scoreOf(p.cat,p.placed);
  if (fresh){ daily.res[daily.i]=n; }
  $('dScore').textContent = n===10 ? '★ 10 / 10' : `${n} / 10`;
  $('dMsg').textContent = n===10 ? 'Perfect pyramid!' : n>=7 ? 'Brilliant ranking.' : n>=4 ? 'Solid effort.' : 'Tough one. On to the next.';
  $('dNext').textContent = daily.i+1<daily.set.length ? `Next: ${GROUPS.find(g=>g.id===daily.set[daily.i+1].gid).emoji} round ${daily.i+2}` : 'See my score';
  $('dResult').classList.remove('hidden');
  $('dResult').classList.toggle('perfect', n===10);
}
$('dBoard').addEventListener('click',e=>{ if (daily && daily.play) boardClick(daily.play,e,renderDaily); });
enableDrag($('dBoard'), ()=>daily&&daily.play, renderDaily);
$('dClear').addEventListener('click',()=>{ daily.play.placed.fill(-1); daily.play.sel=null; renderDaily(); });
$('dCheck').addEventListener('click',()=>{ const p=daily.play; p.revealed=true; p.sel=null; p.last=-1; renderDaily(); dailyShowResult(true); dailySave(); });
$('dNext').addEventListener('click',()=>{ daily.i++; dailySave(); if (daily.i>=daily.set.length) dailySummary(); else dailyRound(null); window.scrollTo({top:0,behavior:'smooth'}); });
function dailyShareText(){
  const total=daily.res.reduce((a,b)=>a+(b||0),0);
  const line=daily.set.map((s,k)=>`${GROUPS.find(g=>g.id===s.gid).emoji} ${daily.res[k]===10?'★':daily.res[k]??'-'}`).join('  ');
  return `Top Ten Pyramid · Daily #${daily.num}\n${total}/${daily.set.length*10}\n${line}`;
}
function dailySummary(){
  $('dPlay').classList.add('hidden'); $('dSum').classList.remove('hidden');
  const total=daily.res.reduce((a,b)=>a+(b||0),0), max=daily.set.length*10;
  $('dHead').innerHTML=`<span class="dnum">Daily #${daily.num}</span><span>Finished</span>`;
  $('dTotal').textContent=`${total} / ${max}`;
  $('dVerdict').textContent = total>=50 ? 'Pyramid royalty.' : total>=40 ? 'Seriously good.' : total>=25 ? 'Not bad at all.' : 'Tomorrow is a new pyramid.';
  $('dRows').innerHTML=daily.set.map((s,k)=>{ const g=GROUPS.find(x=>x.id===s.gid); return `<li><span class="emo">${g.emoji}</span><span class="n">${esc(s.cat.t)}</span><b>${daily.res[k]===10?'★ 10':daily.res[k]??'–'}</b></li>`; }).join('');
  const t=new Date(), next=new Date(t.getFullYear(), t.getMonth(), t.getDate()+1), hrs=Math.max(1,Math.ceil((next-t)/36e5));
  $('dNextIn').textContent=`A new set of six lists arrives at midnight (in about ${hrs} hour${hrs===1?'':'s'}).`;
}
$('dShare').addEventListener('click',async()=>{
  const txt=dailyShareText();
  try{ if (navigator.share) { await navigator.share({text:txt}); return; } }catch(e){ return; }
  try{ await navigator.clipboard.writeText(txt); $('dShare').textContent='Copied!'; setTimeout(()=>$('dShare').textContent='Share my score',1800); }
  catch(e){ $('dShareTxt').textContent=txt; $('dShareTxt').classList.remove('hidden'); }
});
$('dailyNum').textContent = `Daily #${dailyNumber()}`;
