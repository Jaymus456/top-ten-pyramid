/* ---------- PeerJS fallback: online play outside claude.ai (e.g. GitHub Pages) ----------
   Mirrors the small part of claude.ai's room API this game uses: join(name) -> {presence, onPeers, leave}.
   The host's browser is the hub; every phone connects straight to it with WebRTC. */
const PEER_SRC = ['https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js','https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js','https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js'];
function loadPeerLib(){
  if (window.Peer) return Promise.resolve(true);
  return PEER_SRC.reduce((p,src)=>p.then(ok=>ok||new Promise(res=>{ const s=document.createElement('script'); s.src=src; s.async=true; s.onload=()=>res(!!window.Peer); s.onerror=()=>res(false); document.head.appendChild(s); })), Promise.resolve(false));
}
const peerId = name => 'toptenpyramid-v1-'+name;
function mergePresence(cur, patch){ const o=Object.assign({},cur); for (const k in patch){ if (patch[k]===null) delete o[k]; else o[k]=patch[k]; } return o; }

function makePeerRoom(){
  return {
    join(name, opts={}){ return opts.host ? hubJoin(name) : spokeJoin(name); }
  };
}
function roomCore(){
  const subs=new Set(), others=new Map(); // peer -> {presence, at}
  let mine={}, myId='me';
  const peers=()=>[{peer:myId,sameTab:true,isMe:true,presence:mine,updatedAt:Date.now()},...[...others].map(([peer,v])=>({peer,sameTab:false,isMe:false,presence:v.presence,updatedAt:v.at}))];
  const fire=()=>{ const ps=peers(); subs.forEach(f=>{ try{ f({peers:ps,joined:[],left:[],updated:[]}); }catch(e){} }); };
  return { subs, others, peers, fire, get mine(){return mine}, set mine(v){mine=v}, setId(id){myId=id} };
}
function hubJoin(name){
  return new Promise((resolve,reject)=>{
    const core=roomCore(), conns=new Map();
    let peer, opened=false, closed=false;
    const timer=setTimeout(()=>{ if(!opened){ try{peer&&peer.destroy()}catch(e){} reject({code:'upstream_error',message:'Could not reach the connection service'}); } },12000);
    const broadcast=(msg,except)=>{ for (const [id,c] of conns) if (id!==except && c.open) { try{ c.send(msg); }catch(e){} } };
    const snapshot=()=>({t:'all', list:[{peer:peer.id,presence:core.mine,at:Date.now()},...[...core.others].map(([p,v])=>({peer:p,presence:v.presence,at:v.at}))]});
    try { peer=new Peer(peerId(name),{debug:0}); } catch(e){ clearTimeout(timer); return reject({code:'upstream_error',message:String(e)}); }
    peer.on('open',id=>{ opened=true; clearTimeout(timer); core.setId(id);
      resolve({ name,
        presence(patch){ core.mine=mergePresence(core.mine,patch); broadcast({t:'up',peer:peer.id,presence:core.mine,at:Date.now()}); core.fire(); return Promise.resolve(); },
        onPeers(fn){ core.subs.add(fn); setTimeout(()=>fn({peers:core.peers(),joined:[],left:[],updated:[]}),0); return ()=>core.subs.delete(fn); },
        peers:()=>core.peers(), connected:()=>!peer.disconnected,
        leave(){ closed=true; try{ peer.destroy(); }catch(e){} return Promise.resolve(); }
      });
    });
    peer.on('connection',c=>{
      c.on('open',()=>{ conns.set(c.peer,c); try{ c.send(snapshot()); }catch(e){} });
      c.on('data',m=>{ if (!m || m.t!=='p' || typeof m.presence!=='object' || m.presence===null) return;
        const at=Date.now(); core.others.set(c.peer,{presence:m.presence,at});
        broadcast({t:'up',peer:c.peer,presence:m.presence,at},c.peer); core.fire(); });
      const gone=()=>{ if (conns.get(c.peer)===c){ conns.delete(c.peer); core.others.delete(c.peer); broadcast({t:'left',peer:c.peer}); core.fire(); } };
      c.on('close',gone); c.on('error',gone);
    });
    peer.on('disconnected',()=>{ if(!closed) setTimeout(()=>{ try{ if(!closed && peer.disconnected) peer.reconnect(); }catch(e){} },2000); });
    peer.on('error',e=>{ if (!opened){ clearTimeout(timer); try{peer.destroy()}catch(x){}
      reject({code: e && e.type==='unavailable-id' ? 'limit_reached' : 'upstream_error', message: e && e.type || 'error'}); } });
  });
}
function spokeJoin(name){
  return new Promise((resolve,reject)=>{
    const core=roomCore();
    let peer, conn=null, opened=false, closed=false, retry=null;
    const timer=setTimeout(()=>{ if(!opened){ try{peer&&peer.destroy()}catch(e){} reject({code:'upstream_error',message:'Could not reach the connection service'}); } },12000);
    const sendMine=()=>{ if (conn && conn.open){ try{ conn.send({t:'p',presence:core.mine}); }catch(e){} } };
    const connect=()=>{
      if (closed) return;
      try { conn=peer.connect(peerId(name),{reliable:true}); } catch(e){ return schedule(); }
      const c=conn;
      c.on('open',()=>{ sendMine(); });
      c.on('data',m=>{ if(!m) return;
        if (m.t==='all' && Array.isArray(m.list)){ core.others.clear(); for (const x of m.list) if (x.peer!==peer.id) core.others.set(x.peer,{presence:x.presence||{},at:x.at||Date.now()}); core.fire(); }
        else if (m.t==='up' && m.peer && m.peer!==peer.id){ core.others.set(m.peer,{presence:m.presence||{},at:Date.now()}); core.fire(); }
        else if (m.t==='left'){ core.others.delete(m.peer); core.fire(); } });
      const drop=()=>{ if (conn===c){ conn=null; core.others.clear(); core.fire(); schedule(); } };
      c.on('close',drop); c.on('error',drop);
    };
    const schedule=()=>{ if (closed || retry) return; retry=setTimeout(()=>{ retry=null; connect(); },3000); };
    try { peer=new Peer({debug:0}); } catch(e){ clearTimeout(timer); return reject({code:'upstream_error',message:String(e)}); }
    peer.on('open',id=>{ opened=true; clearTimeout(timer); core.setId(id); connect();
      resolve({ name,
        presence(patch){ core.mine=mergePresence(core.mine,patch); sendMine(); core.fire(); return Promise.resolve(); },
        onPeers(fn){ core.subs.add(fn); setTimeout(()=>fn({peers:core.peers(),joined:[],left:[],updated:[]}),0); return ()=>core.subs.delete(fn); },
        peers:()=>core.peers(), connected:()=>!!(conn&&conn.open),
        leave(){ closed=true; if(retry) clearTimeout(retry); try{ peer.destroy(); }catch(e){} return Promise.resolve(); }
      });
    });
    peer.on('error',e=>{
      if (!opened){ clearTimeout(timer); try{peer.destroy()}catch(x){} return reject({code:'upstream_error',message:e&&e.type||'error'}); }
      if (e && e.type==='peer-unavailable'){ conn=null; schedule(); }
    });
    peer.on('disconnected',()=>{ if(!closed) setTimeout(()=>{ try{ if(!closed && peer.disconnected) peer.reconnect(); }catch(e){} },2000); });
  });
}
