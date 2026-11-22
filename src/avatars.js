/* Ten original cartoon characters: warm outlines, flat fills with darker shading, friendly faces, small looping animations (CSS in the page). */
const AVATARS = [
  {id:'footballer', name:'Footballer'},
  {id:'politician', name:'Politician'},
  {id:'couch',      name:'Couch Potato'},
  {id:'spliff',     name:'Spliff'},
  {id:'gum',        name:'Gum'},
  {id:'bag',        name:'The Bag'},
  {id:'padel',      name:'Padel'},
  {id:'rapper',     name:'Rapper'},
  {id:'hoop',       name:'Hoop'},
  {id:'rugby',      name:'Rugby Ball'}
];
function shade(hex, f){
  const n=parseInt(hex.slice(1),16); let r=n>>16,g=n>>8&255,b=n&255;
  const m=v=>Math.max(0,Math.min(255,Math.round(f<1?v*f:v+(255-v)*(f-1))));
  return '#'+[m(r),m(g),m(b)].map(v=>v.toString(16).padStart(2,'0')).join('');
}
function avatarSVG(id, size){
  const L='#6b3a1f', K='#24160e';
  const st=`stroke="${L}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"`;
  const d=(Math.abs([...id].reduce((a,c)=>a*31+c.charCodeAt(0),7))%17)/10; // per-character animation offset
  // ---- friendly face kit ----
  const eye=(cx,cy,s=1)=>`<g class="blink" style="animation-delay:${d}s"><ellipse cx="${cx}" cy="${cy}" rx="${4.3*s}" ry="${5.4*s}" fill="${K}"/><circle cx="${cx+1.3*s}" cy="${cy-1.9*s}" r="${1.7*s}" fill="#fff"/><circle cx="${cx-1.4*s}" cy="${cy+1.9*s}" r="${.8*s}" fill="#fff" opacity=".8"/></g>`;
  const happy=(cx,cy,s=1)=>`<path d="M${cx-4.5*s} ${cy+1.5*s} q${4.5*s} -${6*s} ${9*s} 0" fill="none" stroke="${K}" stroke-width="${2.6*s}" stroke-linecap="round"/>`;
  const wink=(cx,cy,s=1)=>`<path d="M${cx-4.5*s} ${cy} q${4.5*s} ${3.5*s} ${9*s} 0" fill="none" stroke="${K}" stroke-width="${2.6*s}" stroke-linecap="round"/>`;
  const lidded=(cx,cy,s,lid,white='#f4f6f7',iris=K)=>`<g><ellipse cx="${cx}" cy="${cy}" rx="${5.6*s}" ry="${5*s}" fill="${white}" stroke="${K}" stroke-width="1.6"/><circle cx="${cx+.6}" cy="${cy+1.4*s}" r="${2.6*s}" fill="${iris}"/><circle cx="${cx+1.3}" cy="${cy+.6*s}" r="${.8*s}" fill="#fff"/><path d="M${cx-6.2*s} ${cy+.4*s} A${6.2*s} ${5.6*s} 0 0 1 ${cx+6.2*s} ${cy+.4*s} Z" fill="${lid}" stroke="${K}" stroke-width="1.6"/></g>`;
  const smile=(cx,cy,w=12)=>`<path d="M${cx-w/2} ${cy} q${w/2} ${w*.42} ${w} 0" fill="none" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/>`;
  const smirk=(cx,cy,w=12)=>`<path d="M${cx-w/2} ${cy+1} q${w*.55} ${w*.3} ${w} -${w*.25}" fill="none" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/><path d="M${cx+w/2-1} ${cy-w*.25-1} l2.5 -1" stroke="${K}" stroke-width="2" stroke-linecap="round"/>`;
  const openD=(cx,cy,w=12)=>`<path d="M${cx-w/2} ${cy} h${w} q0 ${w*.6} -${w/2} ${w*.6} q-${w/2} 0 -${w/2} -${w*.6}Z" fill="#7a2620" stroke="${K}" stroke-width="1.6" stroke-linejoin="round"/><path d="M${cx-w*.28} ${cy+w*.45} q${w*.28} -${w*.28} ${w*.56} 0 q-${w*.1} ${w*.15} -${w*.28} ${w*.15} q-${w*.18} 0 -${w*.28} -${w*.15}Z" fill="#f08b8b"/>`;
  const tongue=(cx,cy,w=12)=>`<path d="M${cx-w/2} ${cy} q${w/2} ${w*.35} ${w} 0" fill="none" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/><path d="M${cx+w*.05} ${cy+w*.16} q0 ${w*.5} ${w*.3} ${w*.5} q${w*.3} 0 ${w*.28} -${w*.55}" fill="#f08b8b" stroke="${K}" stroke-width="1.4"/>`;
  const brow=(x,y,tilt=0,w=9)=>`<path d="M${x-w/2} ${y+tilt} q${w/2} -3.5 ${w} ${-tilt}" fill="none" stroke="${K}" stroke-width="2.6" stroke-linecap="round"/>`;
  const blush=(x1,x2,y)=>`<ellipse cx="${x1}" cy="${y}" rx="4.2" ry="2.4" fill="#ff8f80" opacity=".55"/><ellipse cx="${x2}" cy="${y}" rx="4.2" ry="2.4" fill="#ff8f80" opacity=".55"/>`;
  const shadow=`<ellipse cx="50" cy="96" rx="30" ry="3.5" fill="#000" opacity=".22"/>`;
  const head=(skin)=>{const sD=shade(skin,.86);return `<ellipse cx="23" cy="55" rx="6" ry="8" fill="${skin}" ${st}/><ellipse cx="77" cy="55" rx="6" ry="8" fill="${skin}" ${st}/><path d="M25 48 C25 30 36 22 50 22 C64 22 75 30 75 48 C75 67 64 79 50 79 C36 79 25 67 25 48Z" fill="${skin}" ${st}/><path d="M64 31 C71 39 73 50 71 60 C69 69 64 74 58 77 C65 68 68 58 67 48 C66 41 65 36 64 31Z" fill="${sD}" opacity=".5"/><path d="M49 57 q-2.5 3.5 0 5 q2 .8 3.5 0" fill="none" stroke="${shade(skin,.68)}" stroke-width="1.5" stroke-linecap="round"/>`;};
  let g='';
  switch(id){
    case 'footballer': {
      const s='#e8b48c';
      g = shadow + `<g class="bob"><path d="M22 100 C24 86 36 80 50 80 C64 80 76 86 78 100Z" fill="#e2453a" ${st}/><path d="M41 81 L50 91 L59 81" fill="#fff" ${st}/><path d="M32 85 v15 M68 85 v15" stroke="#fff" stroke-width="3"/><text x="50" y="99" text-anchor="middle" font-family="Inter Tight,Inter,sans-serif" font-weight="800" font-size="8" fill="#fff">10</text>`
        + head(s)
        + `<path d="M26 44 C22 26 36 15 54 15 C70 16 80 27 76 44 C71 35 63 31 53 32 C45 33 41 29 39 24 C35 31 31 38 26 44Z" fill="#3a2316" ${st}/><path d="M52 15 C58 8 68 8 72 12 C66 12 62 14 60 18Z" fill="#3a2316" ${st}/><path d="M39 24 C44 30 50 30 58 27" fill="none" stroke="#21140c" stroke-width="1.6"/>`
        + brow(40,42,-1) + brow(60,41,1) + eye(40,51) + wink(60,52) + smirk(50,66,13) + blush(36,65,61) + `</g>`
        + `<g class="kick"><circle cx="85" cy="74" r="9" fill="#fff" ${st}/><path d="M85 68 l4.4 3.2 -1.7 5 h-5.4 l-1.7 -5Z" fill="${K}"/></g>`;
      break; }
    case 'politician': {
      const s='#f1c6a3';
      g = shadow + `<g class="bob"><path d="M18 100 C20 86 34 80 50 80 C66 80 80 86 82 100Z" fill="#2c3e66" ${st}/><path d="M42 80 L50 89 L58 80Z" fill="#fff" ${st}/><path d="M48 85 h4 l2.4 15 h-8.8Z" fill="#c8302b" ${st}/><path d="M42 80 L37 100 M58 80 L63 100" stroke="#1d2a47" stroke-width="2"/>`
        + head(s)
        + `<path d="M26 45 C22 27 35 17 50 17 C67 17 79 27 75 45 C74 37 70 31 64 29 C54 31 40 31 34 27 C30 31 27 37 26 45Z" fill="#b5babe" ${st}/><path d="M34 27 C44 31 54 31 64 29" fill="none" stroke="#8a9095" stroke-width="1.6"/><path d="M40 21 L37 30" stroke="#8a9095" stroke-width="1.6"/>`
        + brow(40,40,-2,10) + brow(60,43,0,9) + eye(40,51) + eye(60,51)
        + `<path d="M40 64 q10 7 20 0 q-2 6 -10 6 q-8 0 -10 -6Z" fill="#fff" stroke="${K}" stroke-width="1.6" stroke-linejoin="round"/><path d="M45 65.6 v3.6 M50 66.2 v3.8 M55 65.6 v3.6" stroke="#cfd5d9" stroke-width="1"/>`
        + `<circle cx="30" cy="89" r="5.5" fill="#2f7ad1" ${st}/><circle cx="30" cy="89" r="2.4" fill="#fff"/></g>`
        + `<g class="thumb"><rect x="72" y="80" width="13" height="12" rx="4" fill="${s}" ${st}/><rect x="75" y="70" width="5.5" height="13" rx="2.75" fill="${s}" ${st}/><path d="M68 92 h20 v8 h-20Z" fill="#2c3e66" ${st}/></g>`
        + `<path class="sparkle" d="M84 44 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5Z" fill="#fff"/>`;
      break; }
    case 'couch': {
      g = shadow + `<rect x="6" y="58" width="88" height="30" rx="8" fill="#c8453b" ${st}/><rect x="4" y="50" width="16" height="40" rx="7" fill="#d9574c" ${st}/><rect x="80" y="50" width="16" height="40" rx="7" fill="#d9574c" ${st}/><rect x="12" y="88" width="6" height="7" fill="#6b3a1f"/><rect x="82" y="88" width="6" height="7" fill="#6b3a1f"/>`
        + `<g class="breathe"><path d="M24 66 C18 44 30 24 52 24 C72 24 82 40 78 60 C76 76 62 82 48 82 C34 82 26 76 24 66Z" fill="#c99659" ${st}/><path d="M66 32 C76 42 78 56 72 70 C68 76 62 79 56 80 C66 70 70 56 66 32Z" fill="#a8783f" opacity=".6"/>`
        + `<g fill="#9a6a34"><circle cx="34" cy="38" r="1.8"/><circle cx="64" cy="36" r="1.5"/><circle cx="30" cy="62" r="1.6"/><circle cx="68" cy="66" r="1.8"/></g>`
        + `<path d="M36 50 q5 3 10 0 M55 50 q5 3 10 0" fill="none" stroke="${K}" stroke-width="2.6" stroke-linecap="round"/>` + smile(51,60,12) + blush(37,65,58) + `</g>`
        + `<path d="M28 66 q-4 6 -6 10" fill="none" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/><rect x="14" y="70" width="12" height="15" rx="2" fill="#f2b632" ${st}/><path d="M16 70 l2 -4 3 3 2 -4 2 4" fill="#f7d36b" ${st}/>`
        + `<path d="M72 68 l10 -8" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/><rect x="79" y="53" width="7" height="14" rx="2" transform="rotate(-35 82 60)" fill="#333" ${st}/><circle class="led" cx="82.5" cy="57" r="1.3" fill="#ff5d5d"/>`
        + `<g class="zzz"><text x="70" y="22" font-family="Inter Tight,Inter,sans-serif" font-weight="800" font-size="9" fill="#cfe3e0">z</text><text x="78" y="13" font-family="Inter Tight,Inter,sans-serif" font-weight="800" font-size="12" fill="#cfe3e0">Z</text></g>`;
      break; }
    case 'spliff': {
      g = shadow + `<g class="sway"><path d="M26 36 L74 36 L62 90 L38 90Z" fill="#f6f1e6" ${st}/><path d="M66 42 L58 88" stroke="#ddd5c4" stroke-width="2.4"/><path d="M39.5 80 L60.5 80 L59 90 L41 90Z" fill="#d9b98a" ${st}/><path d="M42 83.5 h16 M42 87 h16" stroke="#b9945f" stroke-width="1.3"/>`
        + `<path d="M26 36 Q50 28 74 36 L73 41 Q50 34 27 41Z" fill="#555" ${st}/><g class="ember"><path d="M33 34 q6 -4 11 -1 q6 -3 11 0 q6 -3 11 1" fill="none" stroke="#ff7a2e" stroke-width="3"/><circle cx="44" cy="31" r="2.2" fill="#ffcf4d"/><circle cx="58" cy="31.5" r="1.8" fill="#ffcf4d"/></g>`
        + lidded(41,55,1.2,'#ece5d6','#ff6f66','#8f1d17') + lidded(59,55,1.2,'#ece5d6','#ff6f66','#8f1d17')
        + `<path d="M36.5 57 l3 -1 M41 59 l1.5 2 M57.5 59 l-1 2 M62 56.5 l3 1" stroke="#b8241c" stroke-width="1.2" stroke-linecap="round"/>`
        + smirk(50,67,12) + blush(35,65,64) + `</g>`
        + `<g class="smoke"><path d="M48 26 C40 18 56 14 48 7" fill="none" stroke="#d6e4e2" stroke-width="3" stroke-linecap="round"/></g><g class="smoke s2"><path d="M60 24 C67 19 62 12 69 9" fill="none" stroke="#d6e4e2" stroke-width="2.4" stroke-linecap="round"/></g>`;
      break; }
    case 'gum': {
      g = shadow + `<g class="bob"><rect x="34" y="12" width="9" height="22" rx="1.5" fill="#d6dde2" ${st}/><rect x="45" y="8" width="9" height="26" rx="1.5" fill="#e9eef1" ${st}/><rect x="56" y="14" width="9" height="20" rx="1.5" fill="#d6dde2" ${st}/>`
        + `<rect x="24" y="26" width="52" height="66" rx="7" fill="#4fc79a" ${st}/><rect x="24" y="26" width="52" height="12" rx="7" fill="#3aa880" ${st}/><path d="M24 80 h52" stroke="#3aa880" stroke-width="10"/><text x="50" y="88" text-anchor="middle" font-family="Inter Tight,Inter,sans-serif" font-weight="800" font-size="9" fill="#e9fff6">MINT</text><path d="M68 44 C72 52 72 62 68 72" stroke="#86e0be" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
        + brow(39,44,1) + brow(61,44,-1) + happy(39,52) + happy(61,52) + blush(33,67,60)
        + `<circle cx="50" cy="65" r="2.6" fill="#7a2620"/></g>`
        + `<g class="bubble"><circle cx="50" cy="67" r="9" fill="#ff9ac2" ${st}/><path d="M45 63 q3 -3 6 -2" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g>`;
      break; }
    case 'bag': {
      g = shadow + `<g class="jitter"><path d="M24 22 H76 V84 Q76 92 68 92 H32 Q24 92 24 84Z" fill="#e3f1f6" fill-opacity=".55" ${st}/><path d="M24 22 H76 V30 H24Z" fill="#fff" ${st}/><path d="M24 26 H76" stroke="#d9453c" stroke-width="2"/><path d="M24 29 H76" stroke="#2f7ad1" stroke-width="1.6"/>`
        + `<path d="M28 88 C30 70 40 64 50 64 C62 64 70 70 72 88 Q70 90 66 90 H34 Q30 90 28 88Z" fill="#fbfbfb" stroke="#cfd8dc" stroke-width="1.4"/><path d="M38 74 q4 -3 8 0 M54 76 q4 -3 8 0" stroke="#e1e7ea" stroke-width="1.4" fill="none"/>`
        + `<path d="M66 36 C70 44 70 54 68 60" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/>`
        + brow(41,38,2) + brow(59,38,-2)
        + `<ellipse cx="41" cy="46" rx="5.6" ry="5" fill="#f4f6f7" stroke="${K}" stroke-width="1.6"/><ellipse cx="59" cy="46" rx="5.6" ry="5" fill="#f4f6f7" stroke="${K}" stroke-width="1.6"/><g class="pupils"><circle cx="41" cy="46.5" r="2.6" fill="${K}"/><circle cx="59" cy="46.5" r="2.6" fill="${K}"/></g>`
        + `<path d="M43 57 q2 -2 4 0 t4 0 t4 0" fill="none" stroke="${K}" stroke-width="2" stroke-linecap="round"/></g>`
        + `<path class="sweat" d="M31 36 q-5 7 -1.6 10.4 q3.4 2 4.4 -2.6 q0 -3.6 -2.8 -7.8Z" fill="#7fd0ff" ${st}/>`;
      break; }
    case 'padel': {
      g = shadow + `<g class="swing"><rect x="44" y="76" width="12" height="20" rx="4" fill="#2b2b33" ${st}/><path d="M44 82 h12 M44 88 h12" stroke="#4a4a55" stroke-width="1.6"/><path d="M40 70 L46 78 H54 L60 70Z" fill="#2f7ad1" ${st}/>`
        + `<ellipse cx="50" cy="42" rx="30" ry="34" fill="#2f7ad1" ${st}/><ellipse cx="50" cy="42" rx="25" ry="29" fill="#4a93e6"/><path d="M28 30 C30 20 38 12 48 10" fill="none" stroke="#9cc8f5" stroke-width="2.6" stroke-linecap="round"/>`
        + `<g fill="#2565ad">${[[38,22],[50,19],[62,22],[31,33],[69,33],[31,48],[69,48],[36,60],[64,60],[44,67],[56,67]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2"/>`).join('')}</g>`
        + brow(40,35,2) + brow(60,35,-2) + eye(40,43) + eye(60,43) + openD(50,51,12) + blush(34,66,50) + `</g>`
        + `<g class="bounce"><circle cx="84" cy="80" r="8" fill="#d8f04a" ${st}/><path d="M78 76 q6 4 0 9 M90 76 q-6 4 0 9" fill="none" stroke="#fff" stroke-width="1.6"/></g>`;
      break; }
    case 'rapper': {
      const s='#9b6544';
      g = shadow + `<g class="nod"><path d="M22 100 C24 86 36 80 50 80 C64 80 76 86 78 100Z" fill="#1f1f26" ${st}/>`
        + head(s)
        + `<path d="M23 43 C22 25 34 15 50 15 C66 15 78 25 77 43Z" fill="#e2453a" ${st}/><rect x="21" y="37" width="58" height="10" rx="4" fill="#c8302b" ${st}/><path d="M28 39.5 v5 M34 39.5 v5 M40 39.5 v5 M46 39.5 v5 M52 39.5 v5 M58 39.5 v5 M64 39.5 v5 M70 39.5 v5" stroke="#a82621" stroke-width="1.4"/><circle cx="50" cy="14" r="4" fill="#e2453a" ${st}/>`
        + `<path d="M27 52 H73" stroke="${K}" stroke-width="2.4"/><path d="M29 49 h18 v6 q0 6 -9 6 q-9 0 -9 -6Z" fill="#111" ${st}/><path d="M53 49 h18 v6 q0 6 -9 6 q-9 0 -9 -6Z" fill="#111" ${st}/>`
        + `<g class="glint"><path d="M33 51 l5 -1.5 M57 51 l5 -1.5" stroke="#9fdcff" stroke-width="2" stroke-linecap="round"/></g>`
        + smirk(50,67,12) + `</g>`
        + `<g class="chain"><path d="M34 82 Q50 100 66 82" fill="none" stroke="#f2b632" stroke-width="3.4"/><path d="M34 82 Q50 100 66 82" fill="none" stroke="#c98a12" stroke-width="1" stroke-dasharray="2 2"/><circle cx="50" cy="92" r="6" fill="#f2b632" ${st}/><text x="50" y="95" text-anchor="middle" font-family="Inter Tight,Inter,sans-serif" font-weight="800" font-size="7" fill="#7a5208">$</text></g>`
        + `<path class="sparkle" d="M60 88 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2Z" fill="#fff"/>`;
      break; }
    case 'hoop': {
      g = shadow + `<rect x="46" y="74" width="8" height="22" fill="#8e9ba5" ${st}/>`
        + `<g class="bob"><rect x="14" y="12" width="72" height="50" rx="5" fill="#f4f6f7" ${st}/><rect x="36" y="36" width="28" height="18" fill="none" stroke="#e2453a" stroke-width="2.6"/>`
        + brow(38,22,1) + brow(62,22,-1) + eye(38,30) + eye(62,30) + openD(50,40,10) + blush(30,70,38) + `</g>`
        + `<g class="swish"><circle cx="50" cy="58" r="8" fill="#f07a1e" ${st}/><path d="M42 58 h16 M50 50 v16" fill="none" stroke="${L}" stroke-width="1.1"/></g>`
        + `<ellipse cx="50" cy="60" rx="16" ry="4" fill="none" stroke="#f07a1e" stroke-width="3.4"/><path d="M35 61 L40 78 L46 62 L50 79 L54 62 L60 78 L65 61 M38 70 h24 M40 76 h20" fill="none" stroke="#fff" stroke-width="1.4"/>`;
      break; }
    case 'rugby': {
      g = shadow + `<g class="wobble"><g transform="rotate(-18 50 52)"><ellipse cx="50" cy="52" rx="36" ry="25" fill="#a0612d" ${st}/><path d="M26 34 C34 30 44 30 50 30 C40 40 38 64 50 74 C40 74 32 72 26 68" fill="#b9753d" opacity=".55"/><path d="M22 46 C24 41 26 39 28 37 M78 58 C76 63 74 65 72 67" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M38 28 h24" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><path d="M42 24 v8 M48 24 v8 M54 24 v8 M60 24 v8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>`
        + brow(38,49,1) + brow(57,48,-1) + eye(38,57) + wink(57,58) + tongue(47,66,12) + blush(31,64,64) + `</g>`;
      break; }
  }
  const px = size ? ` width="${size}" height="${size}"` : '';
  return `<svg viewBox="0 0 100 100"${px} aria-hidden="true" class="av av-${id}">${g}</svg>`;
}
