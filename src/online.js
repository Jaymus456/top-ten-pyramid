/* ---------- ONLINE: shared helpers ---------- */
let roomNS=null, roomTried=false, live=null, ROOM_KIND='';
const IN_CLAUDE = !!(window.claude && window.claude.use);
// claude.ai: its built-in live room. Anywhere else (GitHub Pages etc.): free PeerJS connections.
async function getRoom(){
  if (roomNS || roomTried) return roomNS;
  roomTried=true;
  if (IN_CLAUDE){
    try { roomNS = await window.claude.use('room'); } catch(e){ roomNS=null; }
    if (roomNS) ROOM_KIND='claude';
    return roomNS;
  }
  if (await loadPeerLib()){ roomNS=makePeerRoom(); ROOM_KIND='peer'; }
  return roomNS;
}
const joinRoom = (R, name, host) => ROOM_KIND==='peer' ? R.join(name,{host}) : R.join(name);
const OFFLINE_MSG = IN_CLAUDE
  ? 'Online play here needs you signed in to claude.ai with the game shared to you. Solo play works anywhere.'
  : 'Could not load the free connection service (PeerJS). Check your internet connection and refresh. Solo play still works.';
const PEER_FAIL = 'Could not reach the free connection service right now. Check your internet and try again in a minute. Solo play still works.';
const CODE_CHARS='ABCDEFGHJKMNPQRSTUVWXYZ';
const newCode = () => Array.from({length:4},()=>CODE_CHARS[Math.floor(Math.random()*CODE_CHARS.length)]).join('');
const roomName = code => 'pyr-'+code.toLowerCase();
const joinUrl = code => (IN_CLAUDE ? ART_URL : location.href.split('#')[0])+'#join-'+code.toLowerCase();
const TOTAL_ROUNDS=6, HALF_AFTER=3, MG_POINTS=5, PERFECT_BONUS=3;
// ties on points go to whoever was faster: s[4] is total seconds taken to lock in
const lbSort = a => (a||[]).slice().sort((x,y)=>(y[1]-x[1]) || ((+x[4]||0)-(+y[4]||0)));
const roundPts = (n, round) => (n + (n===10?PERFECT_BONUS:0)) * (round===TOTAL_ROUNDS?2:1);
const now = () => Date.now();
const rint = n => Math.floor(Math.random()*n);
const pickR = a => a[rint(a.length)];
function mulberry(a){ return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function seededShuffle(arr, rnd){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]} return a; }
const normA = s => String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[’'`.!?,]/g,'').replace(/[–—\-]/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim().replace(/^(the|a|an) /,'');
function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=[...Array(n+1).keys()];for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]}
// does `ans` match one of `keys` (already normalised)? small typos allowed on longer words
function fuzzyHit(ans, keys){
  const q=normA(ans); if(!q) return false;
  for (const k of keys){ if (k===q) return true; if (k.length>=5 && q.length>=4 && lev(q,k)<=(k.length>=9?2:1)) return true; }
  return false;
}
// list entries are 'Name|alias|alias'; returns entry index or -1
function listHit(list, ans){
  const q=normA(ans); if(!q) return -1;
  for (let i=0;i<list.length;i++){ if (fuzzyHit(q, list[i].split('|').map(normA))) return i; }
  return -1;
}
const cleanText = (s,n=80) => String(s||'').replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯]/g,' ').replace(/\s+/g,' ').trim().slice(0,n);
const fmtLeft = ms => Math.max(0,Math.ceil(ms/1000));

/* ----- spot the difference scenes (same seed draws the same pictures everywhere) ----- */
const SPOT_COLS=['#9b84f0','#5f95ee','#3fb7b2','#7cc474','#ee9462','#e9709b'];
const SPOT_SHAPES=['circle','square','tri','star','heart','diamond'];
function spotScene(seed){
  const rnd=mulberry(seed), cells=[];
  const empty=new Set(seededShuffle([...Array(15).keys()],rnd).slice(0,3));
  for(let i=0;i<15;i++) cells.push(empty.has(i)?null:{s:SPOT_SHAPES[Math.floor(rnd()*6)],c:SPOT_COLS[Math.floor(rnd()*6)],r:Math.floor(rnd()*4)*15});
  const filled=[...Array(15).keys()].filter(i=>cells[i]);
  const diffs=seededShuffle(filled,rnd).slice(0,3);
  const changed=cells.map(c=>c&&{...c});
  diffs.forEach((i,k)=>{
    const c=changed[i];
    if(k===0){ c.c=SPOT_COLS[(SPOT_COLS.indexOf(c.c)+1+Math.floor(rnd()*4))%6]; }
    else if(k===1){ c.s=SPOT_SHAPES[(SPOT_SHAPES.indexOf(c.s)+1+Math.floor(rnd()*4))%6]; }
    else changed[i]=null;
  });
  return {base:cells, changed, diffs};
}
function shapeSVG(o,x,y){
  if(!o) return '';
  const S='stroke="#232836" stroke-width="2" stroke-linejoin="round"';
  const t=`transform="translate(${x} ${y}) rotate(${o.r})"`;
  const p={circle:`<circle r="15" fill="${o.c}" ${S}/>`,square:`<rect x="-13" y="-13" width="26" height="26" rx="3" fill="${o.c}" ${S}/>`,tri:`<path d="M0 -16 L15 12 L-15 12Z" fill="${o.c}" ${S}/>`,
    star:`<path d="M0 -17 L5 -6 L16 -5 L8 3 L10 15 L0 9 L-10 15 L-8 3 L-16 -5 L-5 -6Z" fill="${o.c}" ${S}/>`,heart:`<path d="M0 14 C-18 2 -16 -14 -6 -14 C-2 -14 0 -10 0 -8 C0 -10 2 -14 6 -14 C16 -14 18 2 0 14Z" fill="${o.c}" ${S}/>`,
    diamond:`<path d="M0 -17 L13 0 L0 17 L-13 0Z" fill="${o.c}" ${S}/>`}[o.s];
  return `<g ${t}>${p}</g>`;
}
function sceneSVG(cells, opts={}){
  let g=`<rect x="1" y="1" width="248" height="148" rx="10" fill="#e9eaf0" stroke="#2a3040" stroke-width="2"/>`;
  cells.forEach((o,i)=>{ const x=25+(i%5)*50, y=25+Math.floor(i/5)*50; g+=shapeSVG(o,x,y);
    if(opts.found && opts.found.includes(i)) g+=`<circle cx="${x}" cy="${y}" r="21" fill="none" stroke="#2f8f57" stroke-width="3.5"/>`;
    if(opts.tap) g+=`<rect data-cell="${i}" x="${x-25}" y="${y-25}" width="50" height="50" fill="transparent" style="cursor:pointer"/>`; });
  return `<svg viewBox="0 0 250 150" class="scene" role="img" aria-label="${opts.label||'Picture'}">${g}</svg>`;
}
/* ----- blackjack ----- */
const RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'], SUITS=['♠','♥','♦','♣'];
const freshDeck = () => shuffle(RANKS.flatMap(r=>SUITS.map(s=>r+s)));
function bjVal(h){ let v=0,a=0; for(const c of h){ const r=c.slice(0,-1); if(r==='A'){a++;v+=11} else v+= (['J','Q','K'].includes(r)?10:+r); } while(v>21&&a){v-=10;a--} return v; }
const cardHTML = c => { const red=/[♥♦]/.test(c); return `<span class="card${red?' red':''}">${esc(c.slice(0,-1))}<i>${c.slice(-1)}</i></span>`; };
/* ----- higher or lower: numbers from the category data ----- */
function statNum(s){
  const m=String(s).replace(/,/g,'').match(/(-?\d+(?:\.\d+)?)(bn|m|k)?/i); if(!m) return null;
  let v=parseFloat(m[1]); const u=(m[2]||'').toLowerCase();
  if(u==='bn')v*=1e9; else if(u==='m')v*=1e6; else if(u==='k')v*=1e3;
  return v;
}
const HL_CATS=['area','pop','mtn','river','states','africa','islands','lakes','eu','samerica','small','moons','pl','plapps','nba','solar'];
function hlChain(rnd, not){
  const ids=HL_CATS.filter(x=>x!==not); const c=byId(ids[Math.floor(rnd()*ids.length)]);
  let order=seededShuffle([...Array(10).keys()],rnd);
  const out=[order[0]];
  for(const i of order.slice(1)){ if(statNum(c.items[i][1])!==statNum(c.items[out[out.length-1]][1])) out.push(i); }
  return {c:c.id, ch:out};
}
const hlVal = (cid,i) => statNum(byId(cid).items[i][1]);
const HL_Q = {area:'area',pop:'population',mtn:'height',river:'length',states:'area',africa:'area',islands:'area',lakes:'area',eu:'area',samerica:'area',small:'area',moons:'diameter',pl:'Premier League goals',plapps:'Premier League appearances',nba:'NBA points',solar:'diameter'};

function leaveOnline(){
  if (hostTimer) { clearInterval(hostTimer); hostTimer=null; }
  if (playTick) { clearInterval(playTick); playTick=null; }
  if (live){ try{ live.leave() }catch(e){} live=null; }
  G=null; me=null;
}

/* =================== HOST =================== */
let G=null, hostTimer=null, qrFor='';
let FORCE_MG=null; // test hook
window.__pyrForceGame = g => { FORCE_MG=g; };
// test helpers for the host screen only: jump to half-time, read the current mini-game's answers
window.__pyrTest = {
  half: () => { if (G) { G.round=HALF_AFTER; goHalf(); } },
  setRound: n => { if (G) G.round=n; },
  review: () => G && G.L.mg ? JSON.parse(JSON.stringify({rev:G.L.mg.rev||null, rv:G.L.mg.rv||null})) : null,
  state: () => G ? JSON.parse(JSON.stringify({phase:G.phase, round:G.round, scores:G.scores, vote:G.vote, tb:G.tb, mg:G.mg})) : null,
  cheat: () => { if(!G||!G.mg) return null; const m=G.mg;
    if (m.g==='spot') return spotScene(m.seed).diffs;
    if (m.g==='five') return FIVE_PROMPTS[m.q].l.slice(0,3).map(x=>x.split('|')[0]);
    if (m.g==='song') return [SONGS[m.q].t[0], SONGS[m.q].a[0]];
    if (m.g==='memory') return memItems(m.seed).map(i=>MEMORY_ITEMS[i][1].split('|')[0]);
    if (m.g==='who') return WHO[m.q].a[0];
    if (m.g==='hl' && m.ch) return hlVal(m.c,m.ch[m.s+1])>hlVal(m.c,m.ch[m.s])?'h':'l';
    return null; }
};

function newGame(code){ return {kick:{}, ren:{}, peerList:[], sfx:true, code, phase:'lobby', round:0, theme:null, cat:null, order:[], dur:90, scores:[], used:[], vote:null, tb:null, mg:null, mgId:0, dl:0, seq:0, players:[], L:{}}; }
async function startHost(forceNew){
  leaveOnline(); show('host');
  $('hNotice').classList.add('hidden');
  G = newGame(newCode()); // every game starts fresh: no saved scores
  renderHost(); initMusic(); sfx.unlock();
  hostTimer=setInterval(()=>{ if(G){ hostStep(); renderHostDynamic(); } },250);
  const R = await getRoom();
  if (!R){ $('hNotice').textContent=OFFLINE_MSG; $('hNotice').classList.remove('hidden'); return; }
  for (let attempt=0; attempt<3 && !live; attempt++){
    try { live = await joinRoom(R, roomName(G.code), true); }
    catch(e){
      if (e && e.code==='limit_reached' && ROOM_KIND==='peer'){ G.code=newCode(); qrFor=''; renderHost(); continue; } // code already taken: pick another
      $('hNotice').textContent = ROOM_KIND==='peer' ? PEER_FAIL : 'Could not open the game room ('+(e&&e.code||'error')+'). Try New game code.';
      $('hNotice').classList.remove('hidden'); return; }
  }
  if (!live || !G) return;
  live.onPeers(ch=>{ if(!G) return;
    const map=new Map(), list=[];
    for (const p of ch.peers){ const pr=p.presence;
      if (p.sameTab || !pr || pr.role!=='player' || pr.code!==G.code || typeof pr.name!=='string') continue;
      if (G.kick[p.peer]) continue; // removed by the host
      const name=G.ren[p.peer] || cleanName(pr.name) || 'Player', key=name.toLowerCase(), at=p.updatedAt||0;
      list.push({peer:p.peer, name, key, av:avOk(pr.av)});
      const prev=map.get(key); if (!prev || at>=prev.at) map.set(key,{name,key,av:avOk(pr.av),p:pr,at,peer:p.peer});
    }
    G.players=[...map.values()]; G.peerList=list.slice(0,24);
    noteAnswers();
    trackCtl();
    hostStep(); renderHost();
  });
  pub();
}
function pub(){
  if (!G) return;
  G.seq++;
  const P={role:'host',code:G.code,phase:G.phase,round:G.round,total:TOTAL_ROUNDS,theme:G.theme||null,gid:G.gid||0,cat:G.cat,order:G.order,dur:G.dur,scores:G.scores.slice(0,30),
    tl:G.dl?Math.max(0,G.dl-now()):0, seq:G.seq,
    vote:G.phase==='vote'?G.vote:null, tb:G.phase==='tb'?G.tb:null, mg:(G.phase==='mg')?G.mg:null,
    ctl:G.ctlName||'', nx:nextLabel(), rv:rvPub(),
    kick:Object.keys(G.kick).slice(-20), ren:renPub(), pl:G.phase==='mg'?null:G.peerList.map(x=>[x.peer,x.name,x.av])};
  if (live) live.presence(P).catch(()=>{});
  renderHost();
}
const findP = name => G.players.find(p=>p.key===String(name).toLowerCase());
function scoreRow(name){
  const key=name.toLowerCase(); let row=G.scores.find(s=>s[0].toLowerCase()===key);
  if(!row){ const p=findP(name); row=[name,0,0,p?p.av:AVATARS[0].id,0,0]; G.scores.push(row); }
  return row;
}
const mgOf = p => (p.p.mg && p.p.mg.id===G.mg.id) ? p.p.mg : null;

/* ----- phase changes ----- */
const themeName = gid => { const g=GROUPS.find(x=>x.id===gid); return g ? `${g.emoji} ${g.name}` : ''; };
// one vote at the start: the winning theme is used for all six rounds
function goVote(){
  G.round=1; G.theme=null; G.gid=1+rint(1e9); // game id: ignores votes left over from a previous game
  G.vote={o:GROUPS.map(g=>g.id)}; G.phase='vote'; G.dl=now()+30000; pub();
}
function pickCat(){
  const g=GROUPS.find(x=>x.id===G.theme), pool=(g?g.cats:CATS).filter(c=>!G.used.includes(c.id));
  return pickR(pool.length ? pool : (g?g.cats:CATS)).id;
}
function startTheme(gid){ G.theme=gid; startRound(pickCat()); }
function goNextRound(){ G.round++; startRound(pickCat()); }
function votesNow(){
  const v={}; G.vote.o.forEach(c=>v[c]=[]);
  for(const p of G.players){ const x=p.p.vote; if(x && x.g===G.gid && v[x.c]) v[x.c].push(p.name); }
  return v;
}
function resolveVote(){
  const v=votesNow(), max=Math.max(...G.vote.o.map(c=>v[c].length));
  if (max===0) return startTheme(pickR(G.vote.o));
  const tied=G.vote.o.filter(c=>v[c].length===max);
  if (tied.length===1) return startTheme(tied[0]);
  const [a,b]=shuffle(tied).slice(0,2), pa=pickR(v[a]), pb=pickR(v[b]);
  G.L.deck=freshDeck();
  G.tb={c:[a,b], p:[pa,pb], av:[findP(pa)?.av||AVATARS[0].id, findP(pb)?.av||AVATARS[0].id], h:[[],[]], s:['play','play'], w:-1, m:'', hand:1};
  dealTB();
  G.phase='tb'; pub();
}
function dealTB(){
  if (G.L.deck.length<12) G.L.deck=freshDeck();
  G.tb.h=[[G.L.deck.pop(),G.L.deck.pop()],[G.L.deck.pop(),G.L.deck.pop()]];
  G.tb.s=G.tb.h.map(h=>bjVal(h)===21?'stand':'play'); G.tb.w=-1;
  G.L.seen=G.tb.p.map(n=>{ const p=findP(n); return p&&p.p.bj&&p.p.bj.r===G.round ? p.p.bj.n : 0; });
  G.dl=now()+60000;
}
function startRound(cid){
  G.cat=cid; G.used.push(cid); G.order=shuffle([...Array(10).keys()]);
  G.L.ans={}; G.L.lockAt={}; G.L.roundAt=now();
  G.phase='play'; G.dl=G.dur?now()+G.dur*1000:0; G.L.autoRev=0; pub();
}
function hostReveal(){
  if (!G || G.phase!=='play') return;
  noteAnswers();
  const c=byId(G.cat), t=now(), rs=G.L.roundAt||t, cap=Math.max(1000, G.dur ? Math.min(G.dur*1000, t-rs) : t-rs);
  const done=new Set(); let perfect=0;
  // everyone who sent answers this round, even if their phone has since dropped out
  for (const [key, a] of Object.entries(G.L.ans||{})){
    if (a.r!==G.round) continue; done.add(key);
    const placed=a.ans.map(x=>Number.isInteger(x)&&x>=0&&x<10?x:-1);
    const n=scoreOf(c,placed), pts=roundPts(n,G.round), row=scoreRow(a.name);
    const took=G.L.lockAt[key] ? Math.min(cap, G.L.lockAt[key]-rs) : cap;
    row[1]+=pts; row[2]=pts; row[3]=a.av||row[3]; row[4]=Math.round(((+row[4]||0)+took/1000)*10)/10; row[5]=n;
    if (n===10) perfect++;
  }
  for (const row of G.scores) if(!done.has(row[0].toLowerCase())){ row[2]=0; row[5]=0; row[4]=Math.round(((+row[4]||0)+cap/1000)*10)/10; }
  G.phase='reveal'; G.dl=0; pub();
  sfx.reveal(perfect>0);
}
// remember each player's latest answers and when they locked in
function noteAnswers(){
  if (!G || G.phase!=='play') return;
  const t=now(); G.L.ans=G.L.ans||{}; G.L.lockAt=G.L.lockAt||{};
  for (const p of G.players){ const pr=p.p;
    if (pr.round!==G.round || !Array.isArray(pr.ans) || pr.ans.length!==10) continue;
    G.L.ans[p.key]={r:G.round, ans:pr.ans.slice(), name:p.name, av:p.av, done:!!pr.done};
    if (pr.done && !G.L.lockAt[p.key]){ G.L.lockAt[p.key]=t; sfx.click(); }
    else if (!pr.done && G.L.lockAt[p.key]) delete G.L.lockAt[p.key];
  }
}
function goHalf(){ G.phase='half'; G.mg=null; G.dl=now()+20000; pub(); }
function spinWheel(){
  if (!G || G.phase!=='half') return;
  const g = FORCE_MG && MG_LIST.some(m=>m.id===FORCE_MG) ? FORCE_MG : pickR(MG_LIST).id;
  G.mgId++; G.mg={id:G.mgId, g, st:'spin', turns:5+rint(3)}; G.phase='mg'; G.L.mgAt=now()+5600; G.dl=0; pub();
}
function goFinal(){ G.phase='final'; G.dl=0; pub(); sfx.fanfare(true); }
function hostNext(){
  if (!G) return;
  if (G.phase==='lobby') { G.scores=[]; G.round=0; G.used=[]; G.theme=null; return goVote(); }
  if (G.phase==='reveal') return G.round===HALF_AFTER ? goHalf() : G.round>=TOTAL_ROUNDS ? goFinal() : goNextRound();
  if (G.phase==='mg' && G.mg && G.mg.st==='done') return goNextRound();
}
function mgWin(name){
  if (!G.mg || G.mg.win || G.mg.st==='done') return;
  G.mg.win=name; G.mg.wav=findP(name)?.av||scoreRow(name)[3];
  scoreRow(name)[1]+=MG_POINTS;
  G.mg.st='done'; G.dl=0; pub(); sfx.fanfare();
}
function mgNoWinner(){ G.mg.win=''; G.mg.st='done'; G.dl=0; pub(); sfx.sad(); }
// a wrong guess that might still be right (typo, nickname, partial name): the host decides
function nearMiss(g, keys){
  const q=normA(g); if (q.length<3) return false;
  return keys.some(k=>{ if (lev(q,k)<=Math.max(3,Math.floor(k.length*.4))) return true;
    if (k.includes(q) || q.includes(k)) return true;
    const kw=k.split(' ').filter(w=>w.length>3); return kw.some(w=>q.split(' ').includes(w)); });
}
function finishRace(name, t){
  const L=G.L.mg, seen=new Set();
  const cand=L.log.filter(e=>e.near && e.t<t && e.name!==name).filter(e=>{ const k=e.name.toLowerCase(); if(seen.has(k)) return false; seen.add(k); return true; }).slice(0,8);
  if (!cand.length) return name ? mgWin(name) : mgNoWinner();
  L.rv={win:name, cand}; G.mg.st='review'; G.dl=0; pub();
}
// host taps in the review panel
function reviewToggle(pi, ii){ const r=G.L.mg&&G.L.mg.rev; if(!r||!r[pi]||!r[pi].items[ii]) return; r[pi].items[ii].ok=!r[pi].items[ii].ok; pub(); }
function reviewConfirm(){
  const m=G.mg, L=G.L.mg; if (!m || m.st!=='review') return;
  if (L.rv){ return L.rv.win ? mgWin(L.rv.win) : mgNoWinner(); }
  const res=L.rev.map(r=>({name:r.name,t:r.t,n:r.items.filter(i=>i.ok).length,items:r.items})).sort((a,b)=>b.n-a.n||a.t-b.t);
  m.res=res.slice(0,12).map(r=>[r.name,r.n]);
  if (m.g==='five' && res[0]) m.wa=res[0].items.slice(0,3).map(i=>[i.txt,i.ok]);
  return res[0]&&res[0].n>0 ? mgWin(res[0].name) : mgNoWinner();
}
function reviewAccept(i){ const L=G.L.mg; if(!L||!L.rv||!L.rv.cand[i]) return; mgWin(L.rv.cand[i].name); }
$('hX').addEventListener('click',e=>{
  if (!G || !G.mg || G.mg.st!=='review') return;
  const tg=e.target.closest('[data-rv]'); if (tg){ const [a,b]=tg.dataset.rv.split(':').map(Number); return reviewToggle(a,b); }
  const ac=e.target.closest('[data-rva]'); if (ac) return reviewAccept(+ac.dataset.rva);
  if (e.target.closest('[data-rvok]')) return reviewConfirm();
});


/* ----- remote host: the first player to join runs the game from their phone ----- */
function trackCtl(){
  const fs=G.L.firstSeen||(G.L.firstSeen={}), cs=G.L.cmdSeen||(G.L.cmdSeen={});
  G.L.joinN=G.L.joinN||0;
  for (const p of G.players.slice().sort((a,b)=>a.at-b.at)){
    if (!(p.key in fs)){ fs[p.key]=++G.L.joinN; cs[p.key]=p.p.cmd&&p.p.cmd.n||0; } // ignore commands sent before we saw them
  }
  const c=G.players.slice().sort((a,b)=>fs[a.key]-fs[b.key])[0];
  const key=c?c.key:'', name=c?c.name:'';
  if (key!==G.ctl || name!==G.ctlName){ G.ctl=key; G.ctlName=name; pub(); }
}
function hostCmds(){
  const cs=G.L.cmdSeen||{};
  for (const p of G.players){
    const c=p.p.cmd; if (!c || !c.n || c.n===cs[p.key]) continue;
    cs[p.key]=c.n;
    if (p.key!==G.ctl || c.code!==G.code) continue; // only the controller can steer
    runCmd(c); return true;
  }
  return false;
}
const DURS=[0,45,60,90,120];
/* ----- kick and rename (by device, so two phones with the same name can be told apart) ----- */
function renPub(){ const o={}; for (const x of G.peerList) if (G.ren[x.peer]) o[x.peer]=G.ren[x.peer]; return o; }
function moveKey(oldK, newK){ // carry a player's per-game records over to their new name
  for (const m of [G.L.firstSeen, G.L.cmdSeen, G.L.ans, G.L.lockAt]) if (m && oldK in m && !(newK in m)){ m[newK]=m[oldK]; delete m[oldK]; }
}
function renamePeer(peer, newName){
  const x=G.peerList.find(q=>q.peer===peer), n=cleanName(newName); if (!x || !n || n===x.name) return false;
  const k=n.toLowerCase();
  if (G.peerList.some(q=>q.peer!==peer && q.key===k)) return false; // that name is taken
  const shared=G.peerList.some(q=>q.peer!==peer && q.key===x.key); // a duplicate keeps the old name and score
  if (!shared){ const row=G.scores.find(r=>r[0].toLowerCase()===x.key); if (row && !G.scores.some(r=>r[0].toLowerCase()===k)) row[0]=n; moveKey(x.key,k); if (G.L.ans&&G.L.ans[k]) G.L.ans[k].name=n; }
  const oldK=x.key; G.ren[peer]=n; x.name=n; x.key=k;
  if (G.ctl===oldK && !shared){ G.ctl=k; G.ctlName=n; }
  pub(); return true;
}
function kickPeer(peer){
  const x=G.peerList.find(q=>q.peer===peer); if (!x) return;
  G.kick[peer]=1;
  if (!G.peerList.some(q=>q.peer!==peer && q.key===x.key)){
    G.scores=G.scores.filter(r=>r[0].toLowerCase()!==x.key);
    for (const m of [G.L.firstSeen, G.L.ans, G.L.lockAt]) if (m) delete m[x.key];
  }
  G.peerList=G.peerList.filter(q=>q.peer!==peer); G.players=G.players.filter(q=>q.peer!==peer);
  trackCtl(); pub();
}
function runCmd(c){
  const ph=G.phase, a=c.a;
  if (a==='start' && (ph==='lobby'||ph==='final')){ if (DURS.includes(c.x)){ G.dur=c.x; $('hDur').value=String(c.x); } G.phase='lobby'; return hostNext(); }
  if (a==='vote' && ph==='vote') return resolveVote();
  if (a==='reveal' && ph==='play') return hostReveal();
  if (a==='next' && (ph==='reveal' || (ph==='mg'&&G.mg&&G.mg.st==='done'))) return hostNext();
  if (a==='spin' && ph==='half') return spinWheel();
  if (a==='end' && ph!=='lobby' && ph!=='final') return goFinal();
  if (a==='kick' && typeof c.x==='string'){ const x=G.peerList.find(q=>q.peer===c.x); if (x && x.key!==G.ctl) kickPeer(c.x); return; } // the phone host can't remove themselves
  if (a==='ren' && c.x && typeof c.x.p==='string') return renamePeer(c.x.p, String(c.x.n||''));
  if (ph==='mg' && G.mg && G.mg.st==='review'){
    if (a==='rv'){ const [x,y]=String(c.x).split(':').map(Number); return reviewToggle(x,y); }
    if (a==='rva') return reviewAccept(+c.x);
    if (a==='rvok') return reviewConfirm();
  }
}
function nextLabel(){
  if (!G) return '';
  if (G.phase==='reveal') return G.round===HALF_AFTER ? 'Half-time' : G.round>=TOTAL_ROUNDS ? 'Final scores' : `Round ${G.round+1}`;
  if (G.phase==='mg' && G.mg && G.mg.st==='done') return `Round ${G.round+1}`;
  return '';
}
// a compact copy of the host check, so the controller can mark answers on their phone
function rvPub(){
  if (!G || G.phase!=='mg' || !G.mg || G.mg.st!=='review' || !G.L.mg) return null;
  const L=G.L.mg, m=G.mg;
  if (L.rv) return {k:'race', w:L.rv.win||'', ans:m.g==='song'?`${SONGS[m.q].t[0]} by ${SONGS[m.q].a[0]}`:WHO[m.q].n, c:L.rv.cand.map(c=>[c.name, cleanText(c.txt,50)])};
  const build=cap=>(L.rev||[]).slice(0,14).map(r=>[r.name, r.items.filter(i=>i.ok).length,
      r.items.map((it,ii)=>[ii, cleanText(it.txt,24), it.ok?1:0, it.a?1:0]).filter(x=>m.g==='five' || !x[3]).slice(0,cap).map(x=>x.slice(0,3))]);
  let p=build(6); if (JSON.stringify(p).length>1500) p=build(3);
  return {k:'list', q:m.g==='five'?`Name ${FIVE_PROMPTS[m.q].p}`:'Objects remembered', all:m.g==='five', p};
}

/* ----- mini-game set-up ----- */
function mgStart(){
  const m=G.mg, t=now(); G.L.mg={};
  if (m.g==='spot'){ m.seed=1+rint(1e9); G.L.mg.diffs=spotScene(m.seed).diffs; G.L.mg.prog={}; m.st='play'; G.dl=t+120000; }
  if (m.g==='five'){ m.q=rint(FIVE_PROMPTS.length); m.st='ready'; G.dl=t+4000; G.L.mg.ans={}; }
  if (m.g==='finish'){ m.q=rint(FINISH_PROMPTS.length); m.st='write'; G.dl=t+90000; }
  if (m.g==='song'){ m.q=rint(SONGS.length); m.st='play'; G.L.mg.t0=t; G.L.mg.seen={}; G.L.mg.log=[]; G.dl=t+90000; }
  if (m.g==='memory'){ m.seed=1+rint(1e9); m.st='show'; G.dl=t+12000; G.L.mg.sub={}; }
  if (m.g==='who'){ m.q=rint(WHO.length); m.st='play'; m.k=1; G.L.mg.t0=t; G.L.mg.seen={}; G.L.mg.log=[]; G.dl=t+5*10000+20000; }
  if (m.g==='hl'){ const rnd=Math.random; const c=hlChain(rnd); m.c=c.c; m.ch=c.ch; m.s=0; m.n=0; m.alive=G.players.map(p=>p.name).slice(0,20); m.st='ask'; m.out=[]; G.L.mg.ans={}; G.dl=t+15000;
    if(!m.alive.length) { mgNoWinner(); return; } }
  pub();
}
const memItems = seed => seededShuffle([...Array(MEMORY_ITEMS.length).keys()], mulberry(seed)).slice(0,15);

/* ----- the host's tick: timers, votes, actions ----- */
function hostStep(){
  if (!G) return;
  if (hostCmds()) return;
  const t=now(), P=G.players;
  if (G.phase==='vote'){
    const v=votesNow(), n=G.vote.o.reduce((a,c)=>a+v[c].length,0);
    if ((P.length && n>=P.length) || t>G.dl) resolveVote();
  }
  else if (G.phase==='tb'){
    const tb=G.tb; let ch=false;
    if (tb.w===-1){
      tb.p.forEach((name,i)=>{
        if (tb.s[i]!=='play') return;
        const p=findP(name), a=p&&p.p.bj;
        if (a && a.r===G.round && a.n>G.L.seen[i]){ G.L.seen[i]=a.n;
          if (a.a==='hit'){ tb.h[i].push(G.L.deck.pop()); const v=bjVal(tb.h[i]); if(v>21) tb.s[i]='bust'; else if(v===21) tb.s[i]='stand'; }
          else tb.s[i]='stand';
          ch=true; }
      });
      if (t>G.dl){ tb.s=tb.s.map(s=>s==='play'?'stand':s); ch=true; }
      if (tb.s.every(s=>s!=='play')){
        const v=tb.h.map((h,i)=>tb.s[i]==='bust'?-1:bjVal(h));
        if (v[0]===v[1]){ tb.w=-2; tb.m= v[0]<0 ? 'Both bust! Dealing again…' : `Push on ${v[0]}! Dealing again…`; G.L.redeal=t+3000; }
        else { tb.w=v[0]>v[1]?0:1; tb.m=`${tb.p[tb.w]} wins the hand and picks the theme`; G.dl=t+20000; sfx.chime(); }
        ch=true;
      }
    } else if (tb.w===-2){
      if (t>G.L.redeal){ tb.hand++; tb.m=''; dealTB(); ch=true; }
    } else {
      const p=findP(tb.p[tb.w]), k=p&&p.p.pick;
      if (k && k.g===G.gid && tb.c.includes(k.c)) return startTheme(k.c);
      if (t>G.dl) return startTheme(tb.c[tb.w]);
    }
    if (ch) pub();
  }
  else if (G.phase==='play'){
    if (G.dur && t>G.dl) return hostReveal();
    const done=P.filter(p=>p.p.round===G.round && p.p.done).length;
    if (P.length && done===P.length){ if(!G.L.autoRev) G.L.autoRev=t+1500; else if (t>G.L.autoRev) hostReveal(); } else G.L.autoRev=0;
  }
  else if (G.phase==='half'){ if (t>G.dl) spinWheel(); }
  else if (G.phase==='mg') mgStep(t, P);
}
function mgStep(t, P){
  const m=G.mg, L=G.L.mg||{};
  if (m.st==='spin'){ if (t>G.L.mgAt){ m.st='intro'; G.dl=t+8000; pub(); } return; }
  if (m.st==='intro'){ if (t>G.dl) mgStart(); return; }
  if (m.st==='done') return;
  if (m.g==='spot'){
    let ch=false;
    for (const p of P){ const x=mgOf(p); if(!x || !Array.isArray(x.f)) continue;
      const f=[...new Set(x.f.filter(Number.isInteger))], found=f.filter(i=>L.diffs.includes(i)).length, wrong=f.length-found;
      if (wrong>8) continue;
      const pr=L.prog[p.key]||{n:0,t:0};
      if (found>pr.n){ L.prog[p.key]={n:found,t,name:p.name}; ch=true; }
      if (found>=3){ m.pr=Object.values(L.prog).map(x=>[x.name,x.n]); return mgWin(p.name); }
    }
    if (ch){ m.pr=Object.values(L.prog).map(x=>[x.name,x.n]); pub(); }
    if (t>G.dl){ const best=Object.values(L.prog).sort((a,b)=>b.n-a.n||a.t-b.t)[0]; return best&&best.n>0 ? mgWin(best.name) : mgNoWinner(); }
  }
  else if (m.g==='five'){
    if (m.st==='ready'){ if (t>G.dl){ m.st='play'; G.dl=t+10000; L.end=t+11500; pub(); } return; }
    if (m.st==='review') return;
    for (const p of P){ const x=mgOf(p); if(!x||!Array.isArray(x.a) || t>L.end) continue;
      const a=x.a.slice(0,3).map(s=>cleanText(s,30)), prev=L.ans[p.key];
      if (!prev || prev.a.join('|')!==a.join('|')) L.ans[p.key]={name:p.name,a,t};
    }
    if (m.st==='play' && t>G.dl){ m.st='grace'; }
    if (t>L.end){
      const list=FIVE_PROMPTS[m.q].l;
      L.rev=Object.values(L.ans).map(r=>{ const seen=new Set(); return {name:r.name,t:r.t,items:r.a.filter(Boolean).map(txt=>{ const i=listHit(list,txt), ok=i>=0&&!seen.has(i); if(i>=0) seen.add(i); return {txt,ok,a:ok}; })}; }).filter(r=>r.items.length);
      if (!L.rev.length) return mgNoWinner();
      m.st='review'; G.dl=0; pub();
    }
  }
  else if (m.g==='finish'){
    if (m.st==='write'){
      const subs=P.map(p=>({p,x:mgOf(p)})).filter(o=>o.x && o.x.s && cleanText(o.x.t));
      if ((P.length && subs.length===P.length) || t>G.dl){
        const all=P.map(p=>({p,x:mgOf(p)})).filter(o=>o.x && cleanText(o.x.t));
        const ent=shuffle(all).slice(0,14);
        if (!ent.length) return mgNoWinner();
        if (ent.length===1){ m.a=[cleanText(ent[0].x.t)]; m.vc=[0]; return mgWin(ent[0].p.name); }
        m.a=ent.map(o=>cleanText(o.x.t)); L.own=ent.map(o=>o.p.key); L.names=ent.map(o=>o.p.name);
        m.st='vote'; G.dl=t+40000; pub();
      }
    } else if (m.st==='vote'){
      const vc=m.a.map(()=>0); let voters=0;
      for (const p of P){ const x=mgOf(p); if(!x || !Number.isInteger(x.v) || x.v<0 || x.v>=m.a.length) continue; if (L.own[x.v]===p.key) continue; vc[x.v]++; voters++; }
      const canVote=P.filter(p=>!(L.own.length===1 && L.own[0]===p.key)).length;
      if ((P.length && voters>=canVote) || t>G.dl){
        const max=Math.max(...vc); m.vc=vc;
        if (max===0) return mgNoWinner();
        const wi=vc.indexOf(max); m.wi=wi; return mgWin(L.names[wi]);
      }
    }
  }
  else if (m.g==='song'){
    if (m.st==='review') return;
    const s=SONGS[m.q], tk=s.t.map(normA), ak=s.a.map(normA);
    for (const p of P){ const x=mgOf(p); if(!x || !x.n || x.n===L.seen[p.key]) continue; L.seen[p.key]=x.n;
      const gt=cleanText(x.t,60), ga=cleanText(x.a,60), okT=fuzzyHit(gt,tk), okA=fuzzyHit(ga,ak);
      L.log.push({name:p.name,txt:`${gt} by ${ga}`,t,near:(okT||nearMiss(gt,tk))&&(okA||nearMiss(ga,ak))});
      if (okT && okA) return finishRace(p.name,t); }
    if (t>G.dl) return finishRace(null,Infinity);
  }
  else if (m.g==='memory'){
    if (m.st==='show'){ if (t>G.dl){ m.st='type'; G.dl=t+60000; pub(); } return; }
    for (const p of P){ const x=mgOf(p); if (x && x.s && !L.sub[p.key]) L.sub[p.key]=t; }
    const subN=P.filter(p=>L.sub[p.key]).length;
    if (m.st==='review') return;
    if ((P.length && subN===P.length) || t>G.dl){
      const items=memItems(m.seed); L.rev=[];
      for (const p of P){ const x=mgOf(p); if(!x||!Array.isArray(x.w)) continue;
        const got=new Set();
        const its=x.w.slice(0,40).map(w=>cleanText(w,30)).filter(Boolean).map(txt=>{ const hit=items.find(i=>fuzzyHit(txt, MEMORY_ITEMS[i][1].split('|').map(normA))); const ok=hit!==undefined && !got.has(hit); if(hit!==undefined) got.add(hit); return {txt,ok,a:ok}; });
        if (its.length) L.rev.push({name:p.name,t:L.sub[p.key]||Infinity,items:its}); }
      if (!L.rev.length) return mgNoWinner();
      m.st='review'; G.dl=0; pub();
    }
  }
  else if (m.g==='who'){
    const k=Math.min(5,1+Math.floor((t-L.t0)/10000)); if (k!==m.k){ m.k=k; pub(); }
    if (m.st==='review') return;
    const ak=WHO[m.q].a.map(normA);
    for (const p of P){ const x=mgOf(p); if(!x || !x.n || x.n===L.seen[p.key]) continue; L.seen[p.key]=x.n;
      const g=cleanText(x.g,60), ok=fuzzyHit(g,ak);
      L.log.push({name:p.name,txt:g,t,near:nearMiss(g,ak)});
      if (ok) return finishRace(p.name,t); }
    if (t>G.dl) return finishRace(null,Infinity);
  }
  else if (m.g==='hl'){
    if (m.st==='ask'){
      for (const p of P){ const x=mgOf(p); if (x && x.s===m.n && (x.p==='h'||x.p==='l') && m.alive.includes(p.name) && !L.ans[p.key]) L.ans[p.key]={p:x.p,t}; }
      const answered=m.alive.filter(n=>L.ans[n.toLowerCase()]).length;
      if (answered>=m.alive.length || t>G.dl){
        const a=hlVal(m.c,m.ch[m.s]), b=hlVal(m.c,m.ch[m.s+1]), right=b>a?'h':'l';
        const surv=m.alive.filter(n=>{ const x=L.ans[n.toLowerCase()]; return x && x.p===right; });
        m.right=right; m.out=m.alive.filter(n=>!surv.includes(n));
        L.prevAlive=m.alive.slice(); L.prevAns=Object.assign({},L.ans);
        m.alive=surv; m.st='show'; G.dl=t+3500; pub();
      }
    } else if (m.st==='show' && t>G.dl){
      if (m.alive.length===1) return mgWin(m.alive[0]);
      if (m.alive.length===0){
        const tried=L.prevAlive.filter(n=>L.prevAns[n.toLowerCase()]).sort((x,y)=>L.prevAns[x.toLowerCase()].t-L.prevAns[y.toLowerCase()].t);
        return (m.n>0 && L.prevAlive.length) ? mgWin(tried[0]||L.prevAlive[0]) : (tried[0] ? mgWin(tried[0]) : mgNoWinner());
      }
      if (m.n>=24){ return mgWin(pickR(m.alive)); }
      m.n++; m.s++;
      if (m.s+1>=m.ch.length){ const c=hlChain(Math.random, m.c); m.c=c.c; m.ch=c.ch; m.s=0; }
      L.ans={}; m.st='ask'; G.dl=t+15000; pub();
    }
  }
}

/* ----- host rendering ----- */
function drawQr(code){
  const el=$('hQr'); el.innerHTML=''; el.classList.remove('hidden');
  const url=joinUrl(code); $('hUrl').textContent=url;
  try{
    const q=new QRLIB.QRCode(-1,QRLIB.ECL.M); q.addData(url); q.make();
    const n=q.getModuleCount(), sc=8, b=2, W=(n+2*b)*sc;
    const cv=document.createElement('canvas'); cv.width=cv.height=W; const g=cv.getContext('2d');
    g.fillStyle='#fff'; g.fillRect(0,0,W,W); g.fillStyle='#0e1016';
    for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(q.isDark(r,c)) g.fillRect((c+b)*sc,(r+b)*sc,sc,sc);
    cv.setAttribute('role','img'); cv.setAttribute('aria-label','QR code to join this game'); el.appendChild(cv);
  }catch(e){ el.classList.add('hidden'); }
}
const lbSorted = () => lbSort(G.scores);
// shows lock-in time only where it decides a tie
function speedTag(lb, i){ const s=lb[i]; return lb.some((o,j)=>j!==i && o[1]===s[1]) ? `<em class="spd">⚡ ${(+s[4]||0).toFixed(1)}s</em>` : ''; }
function wheelSVG(){
  const n=MG_LIST.length, R=150, seg=360/n;
  let g='';
  MG_LIST.forEach((m,i)=>{ const a0=(i*seg-90)*Math.PI/180, a1=((i+1)*seg-90)*Math.PI/180;
    g+=`<path d="M0 0 L${R*Math.cos(a0)} ${R*Math.sin(a0)} A${R} ${R} 0 0 1 ${R*Math.cos(a1)} ${R*Math.sin(a1)}Z" fill="${m.color}" stroke="#0e1016" stroke-width="3"/>`;
    const am=(i+.5)*seg; g+=`<text transform="rotate(${am}) translate(0 -${R*.6}) rotate(90)" text-anchor="middle" dominant-baseline="middle" font-family="Inter Tight,Inter,sans-serif" font-weight="800" font-size="12.5" fill="#12141b">${esc(m.name.replace('The ','').replace('Spot the Difference','Spot the Diff').replace('10-Second Challenge','10 Seconds').replace('Finish the Sentence','Finish It'))}</text>`; });
  return `<div class="wheelwrap"><svg viewBox="-160 -170 320 330" class="wheel"><g id="wheelRot">${g}<circle r="22" fill="#0e1016" stroke="#e9eaf0" stroke-width="3"/></g><path d="M-14 -168 L14 -168 L0 -140Z" fill="#e9eaf0" stroke="#0e1016" stroke-width="3"/></svg></div>`;
}
function renderHost(){
  if (!G) return;
  const code=G.code;
  $('hCode').textContent=code; $('hCode2').textContent=code;
  if (qrFor!==code){ drawQr(code); qrFor=code; }
  $('hCount').textContent = G.players.length ? `(${G.players.length})` : '';
  setH($('hPlayers'), G.players.map(p=>chip(p.name,p.av,p.key===G.ctl?'ctl':'')).join(''));
  $('hCtlNote').innerHTML = G.ctlName ? `🎮 <b>${esc(G.ctlName)}</b> is the host (first to join): they run the game from their phone and still play. These buttons work too.` : 'The first player to join becomes the host and can run the game from their phone.';
  $('hNoPlayers').classList.toggle('hidden',G.players.length>0);
  const lb=lbSorted();
  setH($('hLb'), lb.map((s,i)=>lbRow(s,'','',i)).join(''));
  $('hLbPanel').classList.toggle('hidden',!lb.length);
  $('hLbTitle').textContent = G.phase==='final' ? 'Final standings' : 'Leaderboard';
  $('hHow').classList.toggle('hidden', G.phase!=='lobby');
  const ph=G.phase, rank = ph==='play'||ph==='reveal', x = !rank && ph!=='lobby';
  $('hLobby').classList.toggle('hidden', ph!=='lobby');
  const panel = ph==='lobby' ? 'hLobby' : rank ? 'hStage' : 'hX';
  if (G.L.panel!==panel){ G.L.panel=panel; if (panel!=='hX') enterAnim($(panel)); }
  $('hStage').classList.toggle('hidden', !rank);
  $('hX').classList.toggle('hidden', !x);
  $('hDurWrap').classList.toggle('hidden', ph!=='lobby');
  $('hStart').classList.toggle('hidden', ph!=='lobby' && ph!=='final'); $('hStart').textContent = ph==='final' ? 'Play again' : 'Start game';
  $('hReveal').classList.toggle('hidden', ph!=='play');
  const nx=nextLabel();
  $('hNext').classList.toggle('hidden', !nx); $('hNext').textContent = nx ? `Next: ${nx}` : '';
  $('hSpin').classList.toggle('hidden', ph!=='half');
  $('hEnd').classList.toggle('hidden', ph==='lobby'||ph==='final');
  if (rank) renderRankStage(lb);
  if (x) renderX(lb);
  renderHostDynamic();
  applyVol();
  drawHostManage();
}
function renderRankStage(lb){
  const c=byId(G.cat);
  $('hRound').textContent=`Round ${G.round} of ${TOTAL_ROUNDS}${G.theme?' · '+themeName(G.theme):''}`;
  $('hDouble').classList.toggle('hidden', G.round!==TOTAL_ROUNDS);
  const p={cat:c,order:G.order,placed:Array(10).fill(-1),sel:null,locked:true,revealed:false,last:-1};
  setH($('hBoard'), boardHTML(p,{static:true,noHead:true,showAnswers:G.phase==='reveal'}), G.phase+G.round);
  $('hTitle').textContent=c.t; $('hNote').textContent=c.n;
  setH($('hAnswers'), G.phase==='play' ? G.order.map((i,k)=>`<div style="--i:${k}">${esc(c.items[i][0])}</div>`).join('') : '');
  if (G.phase==='play'){
    const done=G.players.filter(p=>p.p.round===G.round && p.p.done);
    $('hStatusH').textContent=`Locked in: ${done.length} of ${G.players.length}`;
    setH($('hDone'), G.players.map(p=>chip(p.name,p.av,p.p.round===G.round&&p.p.done?'done':'')).join('') || '<span class="sub">No players yet.</span>');
    $('hDone').classList.remove('hidden'); $('hRoundLb').classList.add('hidden');
  } else {
    $('hStatusH').textContent='Scores after this round';
    $('hDone').classList.add('hidden'); $('hRoundLb').classList.remove('hidden');
    setH($('hRoundLb'), lb.map((s,i)=>lbRow(s,`<em>+${s[2]}</em>${+s[5]===10?'<em class="perf">★ Perfect</em>':''}`,'',i+4)).join('') || '<li><span class="n">No answers this round</span></li>');
  }
}
function tvHead(title, sub){ return `<div class="mini">Join with code <b>${esc(G.code)}</b><span>${G.round?`Round ${G.round} of ${TOTAL_ROUNDS}${G.theme?' · '+esc(themeName(G.theme)):''}`:''}</span></div><div class="cat"><h2>${title}</h2>${sub?`<p>${sub}</p>`:''}</div><div class="timer hidden" id="xTimer"></div>`; }
function renderX(lb){
  const el=$('hX'), ph=G.phase, m=G.mg;
  // keep the wheel element alive while it spins
  const key = ph==='mg' && m && m.st==='spin' ? 'spin'+m.id : '';
  if (key && G.L.tvKey===key) return; G.L.tvKey=key;
  let h='';
  if (ph==='vote'){
    const v=votesNow(), total=G.players.length;
    h = tvHead('Vote for the theme', `It's used for all ${TOTAL_ROUNDS} rounds. Vote on your phone: most votes wins, and a tie goes to blackjack.`)
      + `<div class="opts">${G.vote.o.map(gid=>{ const g=GROUPS.find(x=>x.id===gid), n=v[gid].length; return `<div class="opt"><div class="opt-g">Theme · ${g.cats.length} lists</div><div class="opt-t"><span class="emo">${g.emoji}</span>${esc(g.name)}</div><div class="opt-bar"><span style="width:${total?Math.round(n/total*100):0}%"></span></div><div class="opt-v">${v[gid].map(nm=>avatarSVG(findP(nm)?.av||AVATARS[0].id)).join('')}<b>${n}</b></div></div>`; }).join('')}</div>`
      + `<p class="hint">${G.players.filter(p=>p.p.vote&&p.p.vote.g===G.gid).length} of ${total} voted</p>`;
  }
  else if (ph==='tb'){
    const tb=G.tb;
    h = tvHead('Tie! Blackjack decides', `${esc(themeName(tb.c[0]))} vs ${esc(themeName(tb.c[1]))}`)
      + `<div class="bj">${tb.p.map((nm,i)=>{ const v=bjVal(tb.h[i]); return `<div class="bjp${tb.w===i?' win':''}"><div class="bjn">${avatarSVG(tb.av[i])}<b>${esc(nm)}</b></div><div class="bjc">for ${esc(themeName(tb.c[i]))}</div><div class="cards">${tb.h[i].map(cardHTML).join('')}</div><div class="bjv">${tb.s[i]==='bust'?'Bust!':v}${tb.s[i]==='stand'?' · stands':tb.s[i]==='play'?' · thinking…':''}</div></div>`; }).join('<div class="vs">VS</div>')}</div>`
      + `<p class="hint big2">${esc(tb.m||`Hand ${tb.hand}: closest to 21 without going bust wins.`)}</p>`;
  }
  else if (ph==='half'){
    h = tvHead('Half-time!', 'The wheel picks a mini-game. The winner gets 5 points.') + wheelSVG()
      + `<div class="panel" style="max-width:560px;margin:14px auto 0"><h3>Leaderboard</h3><ol class="board-lb">${lb.map((s,i)=>lbRow(s,'','',i)).join('')}</ol></div>`;
  }
  else if (ph==='mg') h = renderMgTV(m, lb);
  else if (ph==='final'){
    const top=lb.slice(0,3), order=[1,0,2].filter(i=>top[i]);
    h = `<div class="cat"><h2>Final standings</h2><p>Thanks for playing Top Ten Pyramid.</p></div><div class="podium">${order.map(i=>`<div class="pod p${i+1}">${avatarSVG(avOk(top[i][3]))}<b>${esc(cleanName(top[i][0]))}</b><span>${top[i][1]} pts</span><div class="step">${i+1}</div></div>`).join('')}</div>`
      + `<div class="panel" style="max-width:560px;margin:16px auto 0"><ol class="board-lb">${lb.map((s,i)=>lbRow(s,speedTag(lb,i),'',i+3)).join('')}</ol>${lb.some((s,i)=>speedTag(lb,i))?'<p class="hint">⚡ Level on points: the faster total lock-in time ranks higher.</p>':''}</div>`;
  }
  setH(el, h, `${ph}|${m?m.id+m.st+(m.s??'')+'.'+(m.n??''):''}|${G.tb&&ph==='tb'?G.tb.hand+':'+G.tb.w:''}`);
  if (key){ // start the spin on the freshly drawn wheel
    const n=MG_LIST.length, idx=MG_LIST.findIndex(x=>x.id===m.g), seg=360/n;
    const rot=m.turns*360 + (360 - (idx*seg + seg/2));
    const w=$('wheelRot'); if (w){ w.style.transform='rotate(0deg)'; requestAnimationFrame(()=>requestAnimationFrame(()=>{ w.style.transition='transform 5s cubic-bezier(.15,.7,.15,1)'; w.style.transform=`rotate(${rot}deg)`; })); }
  }
}
function winnerBanner(m){
  return m.win ? `<div class="winner">${avatarSVG(avOk(m.wav))}<div><b>${esc(m.win)}</b> wins ${esc(MG_LIST.find(x=>x.id===m.g).name)}!</div><span>+${MG_POINTS}</span></div>` : `<div class="winner none">No winner this time.</div>`;
}
function renderMgTV(m, lb){
  const info=MG_LIST.find(x=>x.id===m.g);
  if (m.st==='spin') return tvHead('Spinning…', 'Which mini-game will it be?') + wheelSVG();
  if (m.st==='intro') return `<div class="intro" style="--c:${info.color}"><div class="lbl">Half-time mini-game · winner gets ${MG_POINTS} points</div><h2>${esc(info.name)}</h2><p>${esc(info.rule)}</p><div class="timer" id="xTimer"></div></div>`;
  let h=tvHead(esc(info.name), '');
  if (m.st==='review') return h + reviewHTML(m);
  if (m.g==='spot'){
    const sc=spotScene(m.seed);
    h += `<div class="scenes">${sceneSVG(sc.base,{label:'Original'})}${sceneSVG(sc.changed,{label:'Changed',found:m.st==='done'?sc.diffs:[]})}</div>`
      + `<div class="players">${G.players.map(p=>{ const pr=(m.pr||[]).find(x=>x[0]===p.name); return chip(`${p.name} · ${pr?pr[1]:0}/3`,p.av); }).join('')}</div>`;
  }
  if (m.g==='five'){
    const q=FIVE_PROMPTS[m.q];
    h += m.st==='ready' ? `<div class="bigq">Get ready…</div><div class="bigq">Name <span>${esc(q.p)}</span></div>` : `<div class="bigq">Name <span>${esc(q.p)}</span></div>`;
    if (m.st==='done' && m.wa) h += `<div class="answers">${m.wa.map(([s,ok])=>`<div class="${ok?'':'bad'}">${esc(s||'—')}</div>`).join('')}</div>`;
    if (m.st==='done' && m.res) h += `<p class="hint">${m.res.map(r=>`${esc(r[0])}: ${r[1]}/3`).join(' · ')}</p>`;
  }
  if (m.g==='finish'){
    const q=FINISH_PROMPTS[m.q];
    h += `<div class="bigq">${esc(q)}</div>`;
    if (m.st==='write'){ const n=G.players.filter(p=>{const x=mgOf(p);return x&&x.s}).length; h+=`<p class="hint">Write your ending on your phone. ${n} of ${G.players.length} done.</p>`; }
    else h += `<ol class="entries">${(m.a||[]).map((s,i)=>`<li class="${m.st==='done'&&m.wi===i?'win':''}"><span>${esc(s)}</span>${m.st==='done'&&m.vc?`<b>${m.vc[i]} vote${m.vc[i]===1?'':'s'}</b>`:''}</li>`).join('')}</ol>${m.st==='vote'?'<p class="hint">Vote for the funniest on your phone (not your own).</p>':''}`;
  }
  if (m.g==='song'){
    const s=SONGS[m.q];
    h += `<div class="emoji">${esc(s.e)}</div>`;
    if (m.st==='done') h += `<p class="hint big2">It was <b>${esc(s.t[0].replace(/\b\w/g,c=>c.toUpperCase()))}</b> by ${esc(s.a[0].replace(/\b\w/g,c=>c.toUpperCase()))}</p>`;
    else h += `<p class="hint">Type the song and the artist on your phone.</p>`;
  }
  if (m.g==='memory'){
    const items=memItems(m.seed);
    if (m.st==='show' || m.st==='done') h += `<div class="memgrid">${items.map(i=>`<div>${MEMORY_ITEMS[i][0]}</div>`).join('')}</div>`;
    if (m.st==='type') h += `<div class="bigq">Gone! Type everything you remember.</div><p class="hint">${G.players.filter(p=>{const x=mgOf(p);return x&&x.s}).length} of ${G.players.length} finished</p>`;
    if (m.st==='done' && m.res) h += `<p class="hint">${m.res.map(r=>`${esc(r[0])}: ${r[1]}`).join(' · ')}</p>`;
  }
  if (m.g==='who'){
    const w=WHO[m.q];
    h += `<div class="who"><div class="mystery">${m.st==='done'?`<b>${esc(w.n)}</b>`:'?'}</div><ol class="clues">${w.c.map((c,i)=>`<li class="${i<m.k||m.st==='done'?'on':''}${i===m.k-1&&m.st!=='done'?' new':''}">${i<m.k||m.st==='done'?esc(c):'Clue '+(i+1)}</li>`).join('')}</ol></div>`;
  }
  if (m.g==='hl'){
    const c=byId(m.c), a=c.items[m.ch[m.s]], b=c.items[m.ch[m.s+1]], q=HL_Q[m.c]||'number';
    h += `<p class="hint">${esc(c.t)} · compare the ${esc(q)}</p><div class="hl"><div class="hlc"><b>${esc(a[0])}</b><span>${esc(a[1])}</span></div><div class="vs">${m.st==='show'?(m.right==='h'?'HIGHER':'LOWER'):'?'}</div><div class="hlc"><b>${esc(b[0])}</b><span>${m.st==='ask'?'Higher or lower?':esc(b[1])}</span></div></div>`
      + `<div class="players">${(m.alive||[]).map(n=>chip(n,findP(n)?.av||AVATARS[0].id,'done')).join('')}${(m.out||[]).map(n=>chip(n,findP(n)?.av||AVATARS[0].id,'outp')).join('')}</div><p class="hint">Streak: ${m.n}</p>`;
  }
  if (m.st==='done') h += winnerBanner(m);
  return h;
}
function reviewHTML(m){
  const L=G.L.mg||{};
  if (L.rv){
    const w=L.rv.win;
    return `<div class="review"><h3>Host check: close calls</h3><p class="sub">${w?`<b>${esc(w)}</b> got it first by the book.`:'Nobody got it by the book.'} These earlier guesses were close. Accept one if it's right; the earliest player you accept wins.</p>
      <p class="hint big2">Answer: <b>${esc(m.g==='song'?`${SONGS[m.q].t[0]} by ${SONGS[m.q].a[0]}`:WHO[m.q].n)}</b></p>
      <ul class="rvlist">${L.rv.cand.map((c,i)=>`<li><span class="n">${avatarSVG(findP(c.name)?.av||AVATARS[0].id)}<b>${esc(c.name)}</b></span><q>${esc(c.txt)}</q><button class="ghost" type="button" data-rva="${i}">Accept</button></li>`).join('')}</ul>
      <div class="bar"><button class="go" type="button" data-rvok="1">${w?`Keep ${esc(w)} as winner`:'No winner'}</button></div></div>`;
  }
  const rev=L.rev||[];
  const what = m.g==='five' ? `Name ${esc(FIVE_PROMPTS[m.q].p)}` : 'Objects remembered';
  return `<div class="review"><h3>Host check: ${what}</h3><p class="sub">Ticks were marked automatically. Tap any answer to flip it between right and wrong, then confirm.</p>
    <ul class="rvlist">${rev.map((r,pi)=>`<li><span class="n">${avatarSVG(findP(r.name)?.av||AVATARS[0].id)}<b>${esc(r.name)}</b></span><span class="rvans">${r.items.map((it,ii)=>`<button type="button" class="rvchip${it.ok?' ok':''}" data-rv="${pi}:${ii}" aria-pressed="${it.ok}">${it.ok?'✓':'✗'} ${esc(it.txt)}</button>`).join('')}</span><b class="rvn">${r.items.filter(i=>i.ok).length}</b></li>`).join('')}</ul>
    <div class="bar"><button class="go" type="button" data-rvok="1">Confirm results</button></div></div>`;
}
function renderHostDynamic(){
  if (!G) return;
  const left = G.dl ? G.dl-now() : 0;
  const ht=$('hTimer'); if (G.phase==='play' && G.dur){ ht.classList.remove('hidden'); ht.textContent=fmtLeft(left)?`${fmtLeft(left)}s`:"Time's up!"; ht.classList.toggle('low',fmtLeft(left)<=10); } else ht.classList.add('hidden');
  const xt=$('xTimer'); if (xt){ const show = G.dl && !(G.phase==='mg' && G.mg && (G.mg.st==='done')); xt.classList.toggle('hidden',!show); if(show){ xt.textContent=`${fmtLeft(left)}s`; xt.classList.toggle('low',fmtLeft(left)<=5); } }
  if (G.phase==='play') { const n=G.players.filter(p=>p.p.round===G.round && p.p.done).length; $('hStatusH').textContent=`Locked in: ${n} of ${G.players.length}`; }
}
$('hStart').addEventListener('click',()=>{ if(!G) return; G.dur=+$('hDur').value; G.phase='lobby'; hostNext(); });
$('hNext').addEventListener('click',hostNext);
$('hReveal').addEventListener('click',hostReveal);
$('hSpin').addEventListener('click',spinWheel);
$('hEnd').addEventListener('click',()=>{ if(G) goFinal(); });
$('hNew').addEventListener('click',()=>{ qrFor=''; startHost(true); });
$('hTv').addEventListener('click',()=>{
  const on=document.body.classList.toggle('tv');
  $('hTv').textContent = on ? 'Exit TV mode' : 'TV mode';
  try{ if(on && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(()=>{}); else if(!on && document.fullscreenElement) document.exitFullscreen().catch(()=>{}); }catch(e){}
});



/* ----- manage players panel: shared by the TV and the phone host ----- */
function manageHTML(list, edit, arm, selfKey){
  if (!list || !list.length) return '<p class="sub">No players yet.</p>';
  const counts={}; list.forEach(([,n])=>{ const k=n.toLowerCase(); counts[k]=(counts[k]||0)+1; });
  return `<ul class="mlist">${list.map(([peer,name,av])=>{ const k=name.toLowerCase(), dup=counts[k]>1, me=selfKey && k===selfKey && !dup;
    if (edit===peer) return `<li class="editing"><span class="n">${avatarSVG(avOk(av))}</span><form data-mform="${esc(peer)}" class="mform"><input name="n" maxlength="16" value="${esc(name)}" aria-label="New name for ${esc(name)}" autocomplete="off"><button class="go" type="submit">Save</button><button class="ghost" type="button" data-mcancel="1">Cancel</button></form></li>`;
    return `<li><span class="n">${avatarSVG(avOk(av))}<b>${esc(name)}</b>${dup?'<em class="dup">same name on 2 phones</em>':''}${me?'<em class="dup">you</em>':''}</span><span class="mbtns"><button class="ghost" type="button" data-mren="${esc(peer)}">Rename</button>${me?'':`<button class="ghost danger" type="button" data-mkick="${esc(peer)}">${arm===peer?'Tap again to remove':'Remove'}</button>`}</span></li>`; }).join('')}</ul>`;
}
function bindManage(root, ui){ // ui: {list(), rename(peer,name), kick(peer), redraw()}
  root.addEventListener('click',e=>{
    const t=e.target, st=ui.state;
    const r=t.closest('[data-mren]'); if (r){ st.edit=r.dataset.mren; st.arm=null; ui.redraw(true); const i=root.querySelector('.mform input'); if(i){ i.focus(); i.select(); } return; }
    if (t.closest('[data-mcancel]')){ st.edit=null; ui.redraw(true); return; }
    const k=t.closest('[data-mkick]'); if (k){ const peer=k.dataset.mkick;
      if (st.arm!==peer){ st.arm=peer; ui.redraw(true); clearTimeout(st.t); st.t=setTimeout(()=>{ st.arm=null; ui.redraw(true); },3000); return; }
      st.arm=null; ui.kick(peer); ui.redraw(true); }
  });
  root.addEventListener('submit',e=>{
    const f=e.target.closest('[data-mform]'); if (!f) return; e.preventDefault();
    const n=cleanName(f.elements.n.value); if (n) ui.rename(f.dataset.mform, n);
    ui.state.edit=null; ui.redraw(true);
  });
}
const hostManage={state:{}};
function drawHostManage(force){
  if (!G) return; const el=$('hManageList');
  if (!force && el.contains(document.activeElement) && document.activeElement.tagName==='INPUT') return; // don't wipe a name being typed
  setH(el, manageHTML(G.peerList.map(x=>[x.peer,x.name,x.av]), hostManage.state.edit, hostManage.state.arm, ''));
  $('hManageCount').textContent = G.peerList.length ? `(${G.peerList.length})` : '';
}
bindManage($('hManageList'), {state:hostManage.state, rename:(p,n)=>{ if(G && !renamePeer(p,n)) flashNote('hManageList','That name is already taken.'); }, kick:p=>{ if(G) kickPeer(p); }, redraw:drawHostManage});
function flashNote(id,msg){ const el=$(id); const n=document.createElement('p'); n.className='hint'; n.textContent=msg; el.appendChild(n); setTimeout(()=>n.remove(),2500); }


/* ---------- sound effects (TV only), made with the Web Audio API: nothing to download ---------- */
const sfx=(()=>{
  let ac=null, on=true, master=null;
  const ctx=()=>{ if (!ac){ try{ ac=new (window.AudioContext||window.webkitAudioContext)(); master=ac.createGain(); master.gain.value=.5; master.connect(ac.destination); }catch(e){ ac=null; } }
    if (ac && ac.state==='suspended') ac.resume().catch(()=>{}); return ac; };
  const ok=()=>on && !!G && !!ctx();
  function tone(f, t0, dur, {type='sine', vol=.3, slide=0}={}){
    const o=ac.createOscillator(), g=ac.createGain(); o.type=type; o.frequency.setValueAtTime(f,t0); if (slide) o.frequency.exponentialRampToValueAtTime(f*slide,t0+dur);
    g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol,t0+.012); g.gain.exponentialRampToValueAtTime(.0008,t0+dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0+dur+.05);
  }
  function noise(t0, dur, vol, hp=800){
    const n=Math.floor(ac.sampleRate*dur), b=ac.createBuffer(1,n,ac.sampleRate), d=b.getChannelData(0); for(let i=0;i<n;i++) d[i]=Math.random()*2-1;
    const src=ac.createBufferSource(), f=ac.createBiquadFilter(), g=ac.createGain(); src.buffer=b; f.type='highpass'; f.frequency.value=hp;
    g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.0008,t0+dur); src.connect(f); f.connect(g); g.connect(master); src.start(t0);
  }
  return {
    unlock: ctx,
    set on(v){ on=!!v; }, get on(){ return on; },
    click(){ if(!ok()) return; const t=ac.currentTime; tone(1500,t,.05,{type:'square',vol:.12}); tone(2300,t+.04,.06,{type:'square',vol:.08}); },
    // a snare roll that builds while the pyramid fills in, then a cymbal as number 1 lands
    reveal(perfect){ if(!ok()) return; const t=ac.currentTime, len=3.1;
      for (let x=0;x<len;x+=.045){ noise(t+x,.06,.05+.25*(x/len),1800); }
      noise(t+len,1.3,.45,4000); tone(98,t+len,.5,{type:'triangle',vol:.35,slide:.6});
      if (perfect) [1047,1319,1568,2093].forEach((f,i)=>tone(f,t+len+.35+i*.09,.6,{vol:.16})); },
    fanfare(big){ if(!ok()) return; const t=ac.currentTime+.05, N=[[523,0,.16],[659,.16,.16],[784,.32,.16],[1047,.5,big?.9:.6]];
      N.forEach(([f,d,l])=>{ tone(f,t+d,l,{type:'sawtooth',vol:.09}); tone(f/2,t+d,l,{type:'triangle',vol:.14}); });
      if (big) [[784,1.5,.18],[1047,1.7,1.1]].forEach(([f,d,l])=>{ tone(f,t+d,l,{type:'sawtooth',vol:.09}); tone(f*1.25,t+d,l,{type:'triangle',vol:.08}); });
      noise(t+.5,.7,.18,5000); },
    chime(){ if(!ok()) return; const t=ac.currentTime; [880,1175,1568].forEach((f,i)=>tone(f,t+i*.1,.5,{vol:.18})); },
    sad(){ if(!ok()) return; const t=ac.currentTime; [[392,0],[370,.3],[349,.6]].forEach(([f,d])=>tone(f,t+d,.35,{type:'triangle',vol:.2})); tone(330,t+.9,.8,{type:'triangle',vol:.2,slide:.94}); }
  };
})();
document.addEventListener('pointerdown',()=>{ if (G) sfx.unlock(); },{passive:true}); // browsers only allow sound after a tap
$('hSfx').addEventListener('click',()=>{ sfx.on=!sfx.on; $('hSfx').setAttribute('aria-pressed',sfx.on); $('hSfx').textContent = sfx.on ? '🔊 Sound effects on' : '🔇 Sound effects off'; if (sfx.on){ sfx.unlock(); sfx.chime(); } });

/* ---------- background music (host/TV only): SoundCloud's official embedded player ---------- */
const MUSIC_URL='https://soundcloud.com/delicieuse-musique/sets/jazz-house';
let music={init:false, w:null, ready:false, started:false, playing:false, base:60, n:0};
function initMusic(){
  if (music.init) return; music.init=true;
  const bar=$('gMusic');
  if (IN_CLAUDE){ bar.innerHTML='<span class="now wide">The Jazz House music plays on the GitHub version of the game (claude.ai blocks the SoundCloud player).</span>'; musicVis(); return; }
  bar.classList.add('paused');
  bar.innerHTML=`<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><button class="go" type="button" id="mPlay">Start music</button><button class="ghost" type="button" id="mNext">Next track</button>
    <label>Volume <input type="range" id="mVol" min="0" max="100" value="${music.base}" aria-label="Music volume"></label>
    <span class="now" id="mNow">Jazz House playlist</span>
    <iframe id="scw" title="SoundCloud player" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(MUSIC_URL)}&auto_play=false&show_artwork=false&visual=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&color=%23b9a6f5"></iframe>`;
  const s=document.createElement('script'); s.src='https://w.soundcloud.com/player/api.js';
  s.onload=()=>{ try{
      const w=music.w=SC.Widget($('scw')), E=SC.Widget.Events;
      w.bind(E.READY,()=>{ music.ready=true; w.getSounds(list=>{ music.n=(list||[]).length; if (music.want){ music.want=false; musicPlay(); } }); applyVol(); });
      w.bind(E.PLAY,()=>{ music.playing=true; music.started=true; $('mPlay').textContent='Pause'; bar.classList.remove('paused'); applyVol(); musicVis(); musicMenuLabel();
        w.getCurrentSound(snd=>{ if(snd) $('mNow').innerHTML=`Now playing: <b>${esc(snd.title||'')}</b>`; }); });
      w.bind(E.PAUSE,()=>{ music.playing=false; $('mPlay').textContent='Play'; bar.classList.add('paused'); musicMenuLabel(); });
      w.bind(E.ERROR,()=>{ $('mNow').textContent='SoundCloud could not play this track. Try Next track.'; });
    }catch(e){ musicFail(); } };
  s.onerror=musicFail; document.head.appendChild(s);
  $('mPlay').addEventListener('click',()=>{
    if(!music.w||!music.ready){ music.want=true; $('mNow').textContent='Loading the player…'; return; }
    if (!music.started) musicPlay(); else music.w.toggle();
  });
  musicVis();
  $('mNext').addEventListener('click',()=>{ if(music.w&&music.ready) music.w.next(); });
  $('mVol').addEventListener('input',e=>{ music.base=+e.target.value; applyVol(); });
}
function musicPlay(){ const w=music.w; if(!w) return; if (!music.started && music.n>1) w.skip(rint(music.n)); else w.play(); } // first play starts somewhere random in the playlist
// the bar shows on the menu and host screens once opened, and everywhere while music is playing
function musicVis(){ const bar=$('gMusic'); if(!bar) return; bar.classList.toggle('hidden', !(music.init && (view==='home'||view==='host'||music.started))); }
function musicMenuLabel(){ const b=$('mMenu'); if(b) b.innerHTML = music.playing ? '<span aria-hidden="true">🎷</span> Pause the Jazz House' : '<span aria-hidden="true">🎷</span> Play the Jazz House'; }
$('mMenu').addEventListener('click',()=>{
  const first=!music.init; initMusic(); musicVis();
  if (IN_CLAUDE) return;
  if (music.playing){ music.w.pause(); return; }
  if (music.w && music.ready) musicPlay(); else { music.want=true; const n=$('mNow'); if(n) n.textContent='Loading the player…'; }
  if (first) $('gMusic').scrollIntoView({block:'nearest',behavior:'smooth'});
});
function musicFail(){ const n=$('mNow'); if(n) n.textContent='Could not load the SoundCloud player. Check the internet connection.'; }
// quieter while people are concentrating: ranking and live mini-games
function musicDuck(){ if(!G) return false; if (G.phase==='play'||G.phase==='tb') return true; if (G.phase==='mg'&&G.mg) return !['spin','intro','done','review'].includes(G.mg.st); return false; }
function applyVol(){ if(music.w&&music.ready) music.w.setVolume(Math.round(music.base*(musicDuck()?0.3:1))); }

/* =================== PLAYER =================== */
let me=null, playTick=null;
function openJoin(code){
  leaveOnline(); show('join');
  $('jForm').classList.remove('hidden'); $('jPlay').classList.add('hidden'); $('jNotice').classList.add('hidden'); $('jErr').textContent='';
  let last=null; try{ last=JSON.parse(store('pyr-last')||'null'); }catch(e){}
  if (last && now()-last.at>4*3600e3) last=null;
  $('jCode').value=(code||(last&&last.code)||'').toUpperCase(); $('jName').value=store('pyr-name')||'';
  drawAvPicker();
  ($('jCode').value ? $('jName') : $('jCode')).focus({preventScroll:true});
  // reopening the game you were just in (e.g. the phone went to sleep): rejoin straight away
  if (code && last && last.code===code.toUpperCase() && $('jName').value){ $('jErr').textContent='Rejoining your game…'; setTimeout(()=>{ if(view==='join' && !me) $('jForm').requestSubmit(); },150); }
}
$('jForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const code=$('jCode').value.toUpperCase().replace(/[^A-Z]/g,''), name=cleanName($('jName').value);
  if (code.length!==4){ $('jErr').textContent='Codes are 4 letters, shown on the host screen.'; return; }
  if (!name){ $('jErr').textContent='Pop your nickname in so the TV can show it.'; return; }
  store('pyr-name',name); store('pyr-last',JSON.stringify({code,at:now()})); $('jErr').textContent='Connecting…';
  const R=await getRoom();
  if (!R){ $('jErr').textContent=''; $('jNotice').textContent=OFFLINE_MSG; $('jNotice').classList.remove('hidden'); return; }
  try { live=await joinRoom(R, roomName(code), false); } catch(err){ $('jErr').textContent = ROOM_KIND==='peer' ? PEER_FAIL : 'Could not join that game. Check the code and try again.'; return; }
  me={peer:'',mOpen:false,mState:{},code,name,host:null,play:null,round:0,seenHost:false,seq:-1,dlLocal:0,key:'',bjN:0,mgP:null,vote:null,pick:null,lock:0,cmdN:0,ctlHTML:'',ctlDur:90,endArm:0};
  $('jErr').textContent=''; $('jForm').classList.add('hidden'); $('jPlay').classList.remove('hidden');
  $('jWho').textContent=name; $('jCodeShow').textContent=code; $('jMeAv').innerHTML=avatarSVG(myAv);
  pushMe({});
  live.onPeers(ch=>{ if (!me) return;
    const mine=ch.peers.find(p=>p.sameTab); if (mine) me.peer=mine.peer;
    const h=ch.peers.find(p=>!p.sameTab && p.presence && p.presence.role==='host' && p.presence.code===me.code);
    if (h) onHost(h.presence); });
  playTick=setInterval(playerTimers,300);
  setTimeout(()=>{ if(me && !me.seenHost){ $('jWaitBig').textContent='Waiting for the host…'; $('jWaitMsg').textContent=`No game with code ${code} is open right now. Check the code on the TV.`; } },6000);
  showWait();
});
function pushMe(extra){
  if (!me || !live) return;
  const p=me.play;
  saveDraft();
  live.presence(Object.assign({role:'player',code:me.code,name:me.name,av:myAv,round:p?me.round:0,ans:p?p.placed.slice():[],done:!!(p&&p.locked)}, extra)).catch(()=>{});
}
const sendMg = () => pushMe({mg:me.mgP});
function onHost(h){
  me.seenHost=true;
  if (me.peer && Array.isArray(h.kick) && h.kick.includes(me.peer)) return kicked();
  const nn = me.peer && h.ren && h.ren[me.peer];
  if (nn && nn!==me.name){ me.name=cleanName(nn)||me.name; store('pyr-name',me.name); $('jWho').textContent=me.name; me.ctlHTML=''; pushMe({}); }
  if (h.seq!==me.seq){ me.seq=h.seq; me.dlLocal = h.tl ? now()+h.tl : 0; }
  me.host=h;
  renderCtl(h);
  const mine=(h.scores||[]).find(s=>typeof s[0]==='string'&&s[0].toLowerCase()===me.name.toLowerCase());
  $('jTotal').textContent=`${mine?+mine[1]||0:0} pts`;
  const ph=h.phase;
  if (ph==='play' || (ph==='reveal' && me.play && me.round===h.round)) return onRank(h);
  const key = playerKey(h) + (playerKey(h)&&isCtl()?'c':'');
  if (ph==='lobby' || ph==='final' || !key) { me.key=''; return showWait(); }
  if (key!==me.key){ me.key=key; buildX(h); }
  updateX(h);
}
function playerKey(h){
  const m=h.mg, tb=h.tb;
  if (h.phase==='vote') return 'vote'+h.round;
  if (h.phase==='tb' && tb) return 'tb'+h.round;
  if (h.phase==='half') return 'half'+h.round;
  if (h.phase==='reveal') return 'rv'+h.round;
  if (h.phase==='mg' && m) return 'mg'+m.id+m.st;
  return '';
}
function onRank(h){
  const c=byId(h.cat);
  phonePanel('jRound');
  if (h.phase==='play' && c && Array.isArray(h.order) && h.order.length===10){
    if (!me.play || me.round!==h.round){ me.round=h.round; me.play=newPlay(c,h.order.slice()); restoreDraft(me.play,h); $('jResult').classList.add('hidden'); pushMe({}); }
  } else if (h.phase==='reveal' && me.play && !me.play.revealed){
    me.play.revealed=true; me.play.sel=null; me.play.last=-1;
    const n=scoreOf(me.play.cat,me.play.placed), lb=lbSort(h.scores), pos=lb.findIndex(s=>s[0].toLowerCase()===me.name.toLowerCase());
    const pts=roundPts(n,h.round), dbl=h.round===TOTAL_ROUNDS;
    $('jScore').textContent = n===10 ? `★ Perfect! +${pts}` : `+${pts} point${pts===1?'':'s'}`;
    $('jMsg').textContent=`${n} of 10 in the right spot`+(n===10?` (+${PERFECT_BONUS} bonus)`:'')+(dbl?', doubled in the final round':'')+'.'+(pos>=0?` You're ${ordinal(pos+1)} of ${lb.length}.`:'');
    $('jResult').classList.toggle('perfect', n===10);
    $('jResult').classList.remove('hidden');
  }
  $('jDouble').classList.toggle('hidden', h.round!==TOTAL_ROUNDS || h.phase!=='play');
  me.key='rank'; renderPlayer();
}
// keep this round's answers on the phone, so a dropped connection or reload doesn't lose them
function saveDraft(){
  if (!me || !me.play || !me.host || me.host.phase!=='play' || me.play.revealed) return;
  store('pyr-draft', JSON.stringify({code:me.code, name:me.name.toLowerCase(), r:me.round, cat:me.play.cat.id, gid:me.host.gid||0, placed:me.play.placed, locked:me.play.locked}));
}
function restoreDraft(p, h){
  let d=null; try{ d=JSON.parse(store('pyr-draft')||'null'); }catch(e){}
  if (!d || d.code!==me.code || d.name!==me.name.toLowerCase() || d.r!==h.round || d.cat!==p.cat.id || d.gid!==(h.gid||0) || !Array.isArray(d.placed) || d.placed.length!==10) return;
  const ok=d.placed.every(x=>Number.isInteger(x)&&x>=-1&&x<10) && new Set(d.placed.filter(x=>x>=0)).size===d.placed.filter(x=>x>=0).length;
  if (!ok) return;
  p.placed=d.placed.slice(); p.locked=!!d.locked && !p.placed.includes(-1);
}
function phonePanel(id){
  for (const k of ['jWait','jRound','jX']) $(k).classList.toggle('hidden', k!==id);
  if (me && me.panel!==id){ me.panel=id; if (id!=='jX') enterAnim($(id)); }
}
const ordinal = n => n+(['th','st','nd','rd'][(n%100-20)%10]||['th','st','nd','rd'][n%100]||'th');
function showWait(){
  if (!me) return;
  phonePanel('jWait');
  const h=me.host;
  if (h && h.phase==='final'){ $('jWaitBig').textContent='Game over!'; $('jWaitMsg').textContent='Final standings:'; }
  else if (h && isCtl()){ $('jWaitBig').textContent="You're the host!"; $('jWaitMsg').textContent="You run the game from the bar above: start it when everyone's in. You still play too."; }
  else if (h){ $('jWaitBig').textContent="You're in!"; $('jWaitMsg').textContent = h.ctl ? `Watch the TV. ${h.ctl} is the host and will start the game.` : 'Watch the TV. The game starts when the host is ready.'; }
  const lb=lbSort(h&&h.scores);
  setH($('jLb'), lb.map((s,i)=>lbRow(s,'',s[0].toLowerCase()===me.name.toLowerCase()?'me':'',i)).join(''));
}
function renderPlayer(){
  const p=me.play; if(!p || dragOn) return;
  setH($('jBoard'), boardHTML(p));
  $('jLock').disabled = p.revealed || (!p.locked && p.placed.includes(-1));
  $('jLock').textContent = p.locked ? 'Change my answer' : 'Lock in';
  $('jClear').disabled = p.locked || p.revealed;
}
function playerTimers(){
  if (!me || !me.host) return;
  const left=me.dlLocal?me.dlLocal-now():0, h=me.host;
  const t=$('jTimer');
  if (h.phase==='play' && h.dur && me.play && !me.play.revealed){ t.classList.remove('hidden'); t.textContent=fmtLeft(left)?`${fmtLeft(left)}s`:"Time's up!"; t.classList.toggle('low',fmtLeft(left)<=10); } else t.classList.add('hidden');
  const x=$('pxTimer'); if (x){ if (me.dlLocal && left>-500){ x.classList.remove('hidden'); x.textContent=`${fmtLeft(left)}s`; x.classList.toggle('low',fmtLeft(left)<=5); } else x.classList.add('hidden'); }
}
$('jBoard').addEventListener('click',e=>{ if(!me||!me.play) return; boardClick(me.play,e,()=>{ renderPlayer(); pushMe({}); }); });
enableDrag($('jBoard'), ()=>me&&me.play, ()=>{ renderPlayer(); pushMe({}); });
$('jClear').addEventListener('click',()=>{ if(!me||!me.play) return; me.play.placed.fill(-1); me.play.sel=null; renderPlayer(); pushMe({}); });
$('jLock').addEventListener('click',()=>{ if(!me||!me.play||me.play.revealed) return; me.play.locked=!me.play.locked; me.play.sel=null; me.play.last=-1; renderPlayer(); pushMe({}); });

/* ----- phone screens for votes, blackjack and mini-games ----- */
function buildX(h){
  phonePanel('jX');
  const m=h.mg; let s=''; me.msg='';
  const head=(t,sub)=>`<div class="cat"><h2>${t}</h2>${sub?`<p>${sub}</p>`:''}</div><div class="timer hidden" id="pxTimer"></div>`;
  if (h.phase==='vote') s=head('Vote for the theme',`The winning theme is used for all ${TOTAL_ROUNDS} rounds. You can change your vote until time runs out.`)+'<div id="pxDyn"></div>';
  else if (h.phase==='tb') s=head('Blackjack tiebreak','')+'<div id="pxDyn"></div>';
  else if (h.phase==='half') s=`<div class="wait"><div class="big">Half-time!</div><p>Watch the TV: the wheel is picking a mini-game worth ${MG_POINTS} points.</p></div>`;
  else if (h.phase==='reveal') s='<div id="pxDyn"></div>';
  else if (h.phase==='mg'){
    const info=MG_LIST.find(x=>x.id===m.g);
    if (!me.mgP || me.mgP.id!==m.id) me.mgP={id:m.id};
    if (m.st==='spin') s=`<div class="wait"><div class="big">Spinning…</div><p>Watch the wheel on the TV.</p></div>`;
    else if (m.st==='intro') s=`<div class="intro" style="--c:${info.color}"><div class="lbl">Mini-game · winner gets ${MG_POINTS} points</div><h2>${esc(info.name)}</h2><p>${esc(info.rule)}</p></div>`;
    else if (m.st==='done') s='<div id="pxDyn"></div>';
    else if (m.st==='review') s = isCtl() ? head('Host check','You decide the close calls. Everyone sees the result on the TV.')+'<div id="pxDyn"></div>' : `<div class="wait"><div class="big">Checking answers…</div><p>${h.ctl?esc(h.ctl)+' (the host)':'The host'} is checking the close calls. Watch the TV.</p></div>`;
    else s=head(esc(info.name),'')+mgPhoneBuild(m)+'<div id="pxDyn"></div>';
  }
  setH($('jX'), s, me.key); enterAnim($('jX'));
  const f=$('jX').querySelector('input:not([disabled]),textarea'); if (f) setTimeout(()=>{ try{f.focus({preventScroll:true})}catch(e){} },50);
  playerTimers();
}
function mgPhoneBuild(m){
  if (m.g==='spot'){ const sc=spotScene(m.seed); return `<p class="hint">Top: original. Tap the 3 changes in the bottom picture.</p><div class="scenes ph">${sceneSVG(sc.base,{label:'Original'})}<div id="spotB">${sceneSVG(sc.changed,{tap:true,found:[],label:'Changed: tap the differences'})}</div></div>`; }
  if (m.g==='five'){ const q=FIVE_PROMPTS[m.q]; return `<div class="bigq">Name <span>${esc(q.p)}</span></div><div class="fivebox">${[0,1,2].map(i=>`<input data-five="${i}" maxlength="40" autocomplete="off" autocapitalize="words" placeholder="${i+1}"${m.st==='ready'?' disabled':''}>`).join('')}</div>`; }
  if (m.g==='finish'){
    const q=FINISH_PROMPTS[m.q];
    if (m.st==='write') return `<div class="bigq sm">${esc(q)}</div><textarea id="finT" maxlength="80" rows="3" placeholder="Your ending (anonymous)"></textarea><div class="bar"><button class="go" type="button" data-act="finSend">Send it</button></div>`;
    return `<div class="bigq sm">${esc(q)}</div><p class="hint">Vote for the funniest (not your own).</p>`;
  }
  if (m.g==='song') return `<p class="hint">Look at the emoji clues on the TV.</p><label class="f">Song<input id="sgT" maxlength="60" autocomplete="off"></label><label class="f" style="margin-top:8px">Artist<input id="sgA" maxlength="60" autocomplete="off"></label><div class="bar"><button class="go" type="button" data-act="sgGo">Guess</button></div>`;
  if (m.g==='memory'){
    if (m.st==='show') return `<div class="wait"><div class="big">Look at the TV!</div><p>Memorise all 15 objects. You'll type them in a moment.</p></div>`;
    return `<div class="row" style="justify-content:center"><input id="memI" maxlength="30" autocomplete="off" placeholder="An object you saw" style="flex:1 1 200px"><button class="go" type="button" data-act="memAdd">Add</button></div><div class="tags" id="memL"></div><div class="bar"><button class="ghost" type="button" data-act="memDone">I'm done</button></div>`;
  }
  if (m.g==='who') return `<p class="hint">Clues are on the TV. Guess as often as you like.</p><div class="row" style="justify-content:center"><input id="whoG" maxlength="60" autocomplete="off" placeholder="Who is it?" style="flex:1 1 200px"><button class="go" type="button" data-act="whoGo">Guess</button></div>`;
  if (m.g==='hl') return '';
  return '';
}
function updateX(h){
  const d0=$('pxDyn'); playerTimers(); if (!d0) return;
  const d={ set innerHTML(v){ setH(d0,v); } }; // only redraw when something changed
  const m=h.mg, tb=h.tb, meK=me.name.toLowerCase();
  if (h.phase==='vote'){
    const mineV=me.vote&&me.vote.g===h.gid?me.vote.c:null;
    d.innerHTML=`<div class="vopts">${h.vote.o.map(gid=>{const g=GROUPS.find(x=>x.id===gid);return `<button type="button" class="vopt" data-vote="${gid}" aria-pressed="${mineV===gid}"><small>${g.cats.length} lists</small><span><span class="emo">${g.emoji}</span> ${esc(g.name)}</span></button>`}).join('')}</div>`;
  }
  else if (h.phase==='tb'){
    const i=tb.p.findIndex(n=>n.toLowerCase()===meK);
    const hand=(k)=>`<div class="bjp${tb.w===k?' win':''}"><div class="bjn">${avatarSVG(avOk(tb.av[k]))}<b>${esc(tb.p[k])}</b></div><div class="cards">${tb.h[k].map(cardHTML).join('')}</div><div class="bjv">${tb.s[k]==='bust'?'Bust!':bjVal(tb.h[k])}</div></div>`;
    if (i<0){ d.innerHTML=`<p class="hint big2">${esc(tb.p[0])} vs ${esc(tb.p[1])} at blackjack. Watch the TV!</p><div class="bj ph">${hand(0)}<div class="vs">VS</div>${hand(1)}</div><p class="hint">${esc(tb.m||'')}</p>`; return; }
    const o=1-i;
    let act='';
    if (tb.w===-1 && tb.s[i]==='play') act=`<div class="bar"><button class="go" type="button" data-bj="hit">Hit</button><button class="ghost" type="button" data-bj="stand">Stand</button></div>`;
    else if (tb.w===i) act=`<p class="hint big2">You won! Pick the theme:</p><div class="vopts">${tb.c.map(gid=>`<button type="button" class="vopt" data-pick="${gid}">${esc(themeName(gid))}</button>`).join('')}</div>`;
    else if (tb.w>=0) act=`<p class="hint big2">${esc(tb.p[tb.w])} won and is picking the theme.</p>`;
    else if (tb.w===-2) act=`<p class="hint big2">${esc(tb.m)}</p>`;
    else act=`<p class="hint">You stand. Waiting for ${esc(tb.p[o])}…</p>`;
    d.innerHTML=`<p class="hint">You're playing for <b>${esc(themeName(tb.c[i]))}</b>. Get closer to 21 than ${esc(tb.p[o])} without going bust.</p><div class="bj ph">${hand(i)}<div class="vs">VS</div>${hand(o)}</div>${act}`;
  }
  else if (h.phase==='reveal'){ d.innerHTML=`<div class="wait"><div class="big">Round over</div><p>Check the TV for the answers.</p></div>`; }
  else if (h.phase==='mg' && m){
    if (m.st==='review'){ d.innerHTML=phoneReviewHTML(h.rv); return; }
    if (m.st==='done'){
      const won=m.win && m.win.toLowerCase()===meK;
      d.innerHTML=`<div class="wait"><div class="big">${won?`You win! +${MG_POINTS}`:m.win?`${esc(m.win)} wins!`:'No winner this time'}</div><p>${won?'Nice one.':'Watch the TV for round 4.'}</p></div>`;
      return;
    }
    if (m.g==='spot'){ const sc=spotScene(m.seed), f=(me.mgP.f||[]).filter(i=>sc.diffs.includes(i)); $('spotB').innerHTML=sceneSVG(sc.changed,{tap:true,found:f,label:'Changed: tap the differences'}); d.innerHTML=`<p class="hint big2">${f.length} of 3 found${me.lock>now()?' · oops, not that one!':''}</p>`; }
    else if (m.g==='five'){ if (m.st!=='ready') $('jX').querySelectorAll('[data-five]').forEach(x=>{ x.disabled = m.st==='grace'; }); d.innerHTML = m.st==='ready'?'<p class="hint big2">Get ready…</p>':m.st==='grace'?'<p class="hint big2">Time!</p>':'<p class="hint">Go go go! Press Enter to jump to the next box.</p>'; }
    else if (m.g==='finish'){
      if (m.st==='write') d.innerHTML = me.mgP.s ? '<p class="hint big2">Sent! Waiting for everyone else…</p>' : '';
      else { const mine=cleanText(me.mgP.t); d.innerHTML=`<div class="vopts">${(m.a||[]).map((s,i)=>s===mine?`<div class="vopt mine">${esc(s)}<small>Yours</small></div>`:`<button type="button" class="vopt" data-fv="${i}" aria-pressed="${me.mgP.v===i}">${esc(s)}</button>`).join('')}</div>`; }
    }
    else if (m.g==='song'){ const s=SONGS[m.q]; d.innerHTML=`<p class="hint big2" id="sgMsg">${me.msg||''}</p>`; }
    else if (m.g==='memory'){ if (m.st==='type'){ $('memL').innerHTML=(me.mgP.w||[]).map(w=>`<span>${esc(w)}</span>`).join(''); d.innerHTML=me.mgP.s?'<p class="hint big2">Locked in! Waiting for the others…</p>':`<p class="hint">${(me.mgP.w||[]).length} added</p>`; const inp=$('memI'); if(inp) inp.disabled=!!me.mgP.s; } }
    else if (m.g==='who'){ d.innerHTML=`<ol class="clues ph">${WHO[m.q].c.slice(0,m.k).map((c,i)=>`<li class="on${i===m.k-1?' new':''}">${esc(c)}</li>`).join('')}</ol><p class="hint big2">${me.msg||''}</p>`; }
    else if (m.g==='hl'){
      const c=byId(m.c), a=c.items[m.ch[m.s]], b=c.items[m.ch[m.s+1]], alive=(m.alive||[]).some(n=>n.toLowerCase()===meK), wasOut=(m.out||[]).some(n=>n.toLowerCase()===meK);
      let body=`<p class="hint">${esc(c.t)} · ${esc(HL_Q[m.c]||'')}</p><div class="hl ph"><div class="hlc"><b>${esc(a[0])}</b><span>${esc(a[1])}</span></div><div class="hlc"><b>${esc(b[0])}</b><span>${m.st==='show'?esc(b[1]):'?'}</span></div></div>`;
      if (m.st==='ask' && alive){ const picked=me.mgP.s===m.n?me.mgP.p:null; body+=`<div class="bar"><button type="button" class="hlbtn" data-hl="h" aria-pressed="${picked==='h'}">▲ Higher</button><button type="button" class="hlbtn" data-hl="l" aria-pressed="${picked==='l'}">▼ Lower</button></div>`; }
      else if (m.st==='show') body+=`<p class="hint big2">${wasOut?"You're out!":alive?'Correct! Still in.':'Watching…'}</p>`;
      else body+=`<p class="hint big2">You're out. Watch the TV.</p>`;
      d.innerHTML=body;
    }
  }
}
$('jX').addEventListener('click',e=>{
  if (!me || !me.host) return;
  const h=me.host, m=h.mg, t=e.target;
  const v=t.closest('[data-vote]'); if (v){ me.vote={r:h.round,g:h.gid,c:v.dataset.vote}; pushMe({vote:me.vote}); updateX(h); return; }
  const b=t.closest('[data-bj]'); if (b){ me.bjN++; pushMe({bj:{r:h.round,n:Date.now()%1e9+me.bjN,a:b.dataset.bj}}); b.disabled=true; return; }
  const pk=t.closest('[data-pick]'); if (pk){ pushMe({pick:{r:h.round,g:h.gid,c:pk.dataset.pick}}); $('pxDyn').innerHTML='<p class="hint big2">Picked! Get ready…</p>'; return; }
  if (!m || !me.mgP) return;
  const cell=t.closest('[data-cell]');
  if (cell && m.g==='spot'){
    if (me.lock>now()) return;
    const i=+cell.dataset.cell, sc=spotScene(m.seed); me.mgP.f=me.mgP.f||[];
    if (!me.mgP.f.includes(i)){ me.mgP.f.push(i); if (!sc.diffs.includes(i)) me.lock=now()+1500; sendMg(); }
    updateX(h); return;
  }
  const act=t.closest('[data-act]')?.dataset.act;
  if (act==='finSend'){ const tx=cleanText($('finT').value); if(!tx) return; me.mgP.t=tx; me.mgP.s=true; $('finT').disabled=true; t.disabled=true; sendMg(); updateX(h); return; }
  const fv=t.closest('[data-fv]'); if (fv){ me.mgP.v=+fv.dataset.fv; sendMg(); updateX(h); return; }
  if (act==='sgGo') return songGuess();
  if (act==='memAdd') return memAdd();
  if (act==='memDone'){ me.mgP.s=true; sendMg(); updateX(h); return; }
  if (act==='whoGo') return whoGuess();
  const hl=t.closest('[data-hl]'); if (hl && m.g==='hl' && m.st==='ask'){ me.mgP.s=m.n; me.mgP.p=hl.dataset.hl; sendMg(); updateX(h); return; }
});
$('jX').addEventListener('input',e=>{
  if (!me || !me.mgP) return;
  const f=e.target.closest('[data-five]'); if (f){ me.mgP.a=[...$('jX').querySelectorAll('[data-five]')].map(x=>cleanText(x.value,40)); sendMg(); }
});
$('jX').addEventListener('keydown',e=>{
  if (e.key!=='Enter' || !me) return;
  const f=e.target.closest('[data-five]'); if (f){ e.preventDefault(); const n=$('jX').querySelector(`[data-five="${+f.dataset.five+1}"]`); if(n) n.focus(); return; }
  if (e.target.id==='memI'){ e.preventDefault(); memAdd(); }
  if (e.target.id==='whoG'){ e.preventDefault(); whoGuess(); }
  if (e.target.id==='sgT'){ e.preventDefault(); $('sgA').focus(); }
  if (e.target.id==='sgA'){ e.preventDefault(); songGuess(); }
});
function songGuess(){
  const m=me.host.mg; if(!m||m.g!=='song'||me.lock>now()) return;
  const t=cleanText($('sgT').value,60), a=cleanText($('sgA').value,60); if(!t||!a){ me.msg='Fill in both the song and the artist.'; updateX(me.host); return; }
  const s=SONGS[m.q], okT=fuzzyHit(t,s.t.map(normA)), okA=fuzzyHit(a,s.a.map(normA));
  me.mgP.t=t; me.mgP.a=a; me.mgP.n=(me.mgP.n||0)+1; sendMg();
  me.msg = okT&&okA ? 'Got it! Checking…' : okT ? 'Right song, wrong artist!' : okA ? 'Right artist, wrong song!' : 'Not quite. Try again.';
  if (!(okT&&okA)) me.lock=now()+1200;
  updateX(me.host);
}
function whoGuess(){
  const m=me.host.mg; if(!m||m.g!=='who'||me.lock>now()) return;
  const g=cleanText($('whoG').value,60); if(!g) return;
  const ok=fuzzyHit(g,WHO[m.q].a.map(normA));
  me.mgP.g=g; me.mgP.n=(me.mgP.n||0)+1; sendMg();
  me.msg = ok ? 'Got it! Checking…' : `Not ${esc(g)}. Keep guessing!`;
  if (!ok){ me.lock=now()+1200; $('whoG').value=''; }
  updateX(me.host);
}
function memAdd(){
  const m=me.host.mg; if(!m||m.g!=='memory'||m.st!=='type'||me.mgP.s) return;
  const w=cleanText($('memI').value,30); if(!w) return;
  me.mgP.w=me.mgP.w||[]; if(!me.mgP.w.some(x=>normA(x)===normA(w)) && me.mgP.w.length<40) me.mgP.w.push(w);
  $('memI').value=''; sendMg(); updateX(me.host); $('memI').focus();
}

/* ----- the controller's phone: host buttons ----- */
const isCtl = () => !!(me && me.host && me.host.ctl && me.host.ctl.toLowerCase()===me.name.toLowerCase());
function sendCmd(a, x){
  if (!me) return;
  me.cmdN++; me.cmd={n:(Date.now()%1e9)*10+(me.cmdN%10)+1, a, x:x===undefined?null:x, code:me.code};
  pushMe({cmd:me.cmd});
}
function renderCtl(h){
  const el=$('jCtl');
  if (!isCtl()){ if (me.ctlHTML){ el.innerHTML=''; me.ctlHTML=''; } el.classList.add('hidden'); $('jManage').classList.add('hidden'); return; }
  const ph=h.phase, m=h.mg, B=(a,label,cls='go',x)=>`<button type="button" class="${cls}" data-cmd="${a}"${x!==undefined?` data-x="${x}"`:''}>${label}</button>`;
  let b='';
  if (ph==='lobby') b=`<label class="f ctldur">Ranking timer<select id="jDur">${[[0,'No timer'],[45,'45 s'],[60,'60 s'],[90,'90 s'],[120,'2 min']].map(([v,l])=>`<option value="${v}"${v===me.ctlDur?' selected':''}>${l}</option>`).join('')}</select></label>`+B('start','Start game');
  else if (ph==='final') b=B('start','Play again');
  else if (ph==='vote') b=B('vote','Close the vote now','ghost');
  else if (ph==='play') b=B('reveal','Reveal answers now','ghost');
  else if (ph==='reveal' && h.nx) b=B('next',`Next: ${esc(h.nx)}`);
  else if (ph==='half') b=B('spin','Spin the wheel');
  else if (ph==='mg' && m && m.st==='done' && h.nx) b=B('next',`Next: ${esc(h.nx)}`);
  if (ph!=='lobby' && ph!=='final') b+=B('end', me.endArm>now()?'Tap again to end':'End game', 'ghost danger');
  if (Array.isArray(h.pl)) b+=`<button type="button" class="ghost" data-mtoggle="1" aria-expanded="${me.mOpen}">👥 Players</button>`;
  const html=`<div class="ctlhead"><span class="ctlbadge">🎮 Host</span><span>You're running the game</span></div><div class="ctlbtns">${b}</div>`;
  if (html!==me.ctlHTML){ el.innerHTML=html; me.ctlHTML=html; }
  el.classList.remove('hidden');
  drawPhoneManage();
}
$('jCtl').addEventListener('change',e=>{ if (e.target.id==='jDur') me.ctlDur=+e.target.value; });
$('jCtl').addEventListener('click',e=>{
  if (e.target.closest('[data-mtoggle]')){ me.mOpen=!me.mOpen; me.ctlHTML=''; renderCtl(me.host); return; }
  const b=e.target.closest('[data-cmd]'); if (!b || !me || !isCtl()) return;
  const a=b.dataset.cmd;
  if (a==='end' && !(me.endArm>now())){ me.endArm=now()+3000; renderCtl(me.host); setTimeout(()=>{ if(me&&me.host) renderCtl(me.host); },3100); return; }
  me.endArm=0;
  sendCmd(a, a==='start' ? me.ctlDur : undefined);
  b.disabled=true; b.classList.add('sent'); // re-enabled when the host's next update redraws the bar
  setTimeout(()=>{ if (me && me.host){ me.ctlHTML=''; renderCtl(me.host); } },2500);
});
function phoneReviewHTML(rv){
  if (!rv) return '<p class="hint">Loading the answers…</p>';
  if (rv.k==='race') return `<p class="hint big2">Answer: <b>${esc(rv.ans)}</b></p><p class="hint">${rv.w?`<b>${esc(rv.w)}</b> got it first by the book.`:'Nobody got it exactly.'} Were any of these earlier guesses right? The earliest one you accept wins.</p>
    <ul class="rvlist ph">${rv.c.map(([n,txt],i)=>`<li><span class="n"><b>${esc(n)}</b></span><q>${esc(txt)}</q><button class="ghost" type="button" data-prva="${i}">Accept</button></li>`).join('')}</ul>
    <div class="bar"><button class="go" type="button" data-prvok="1">${rv.w?`Keep ${esc(rv.w)} as winner`:'No winner'}</button></div>`;
  return `<p class="hint"><b>${esc(rv.q)}</b>. ${rv.all?'Tap any answer to flip it between right and wrong.':'Showing the answers that were marked wrong: tap one to count it.'}</p>
    <ul class="rvlist ph">${rv.p.map(([n,score,items],pi)=>`<li><span class="n"><b>${esc(n)}</b></span><span class="rvans">${items.map(([ii,txt,ok])=>`<button type="button" class="rvchip${ok?' ok':''}" data-prv="${pi}:${ii}" aria-pressed="${!!ok}">${ok?'✓':'✗'} ${esc(txt)}</button>`).join('')||'<span class="sub">All correct</span>'}</span><b class="rvn">${score}</b></li>`).join('')}</ul>
    <div class="bar"><button class="go" type="button" data-prvok="1">Confirm results</button></div>`;
}
$('jX').addEventListener('click',e=>{
  if (!me || !isCtl()) return;
  const t=e.target;
  const tg=t.closest('[data-prv]'); if (tg){ tg.disabled=true; return sendCmd('rv', tg.dataset.prv); }
  const ac=t.closest('[data-prva]'); if (ac){ ac.disabled=true; return sendCmd('rva', +ac.dataset.prva); }
  const ok=t.closest('[data-prvok]'); if (ok){ ok.disabled=true; ok.textContent='Sent…'; return sendCmd('rvok'); }
});

function drawPhoneManage(force){
  const el=$('jManage'), h=me&&me.host;
  const show=!!(h && isCtl() && me.mOpen && Array.isArray(h.pl));
  el.classList.toggle('hidden', !show); if (!show) return;
  const list=$('jManageList');
  if (!force && list.contains(document.activeElement) && document.activeElement.tagName==='INPUT') return;
  setH(list, manageHTML(h.pl, me.mState.edit, me.mState.arm, me.name.toLowerCase()));
}
bindManage($('jManageList'), {get state(){ return me?me.mState:{}; }, rename:(p,n)=>sendCmd('ren',{p,n}), kick:p=>sendCmd('kick',p), redraw:f=>drawPhoneManage(f)});
function kicked(){
  store('pyr-last','');
  const code=me.code; leaveOnline();
  $('jPlay').classList.add('hidden'); $('jForm').classList.remove('hidden'); $('jCode').value=code;
  $('jNotice').textContent='The host removed you from this game. You can rejoin with a different name if they say so.'; $('jNotice').classList.remove('hidden');
}
