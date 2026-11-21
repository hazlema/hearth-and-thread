// Hearth & Thread artwork. Everything is inline SVG: the brief allows no image assets.
export const C={ivory:'#F4E9D8',walnut:'#6B4A35',berry:'#B5485A',teal:'#2F5D6B',honey:'#E8A84A',night:'#2A3348'};

// X = berry cross-stitch: a band of tiny crosses along both diagonals. Each stitch carries --i so CSS can sew it in order.
function crossStitch(){
 const n=11,step=70/n,out=[],seen=new Set();let i=0;
 for(let k=0;k<n;k++)for(const [r,c] of [[k,k],[k,n-1-k]])for(const d of [-1,0,1]){
  const cc=c+d,key=r*n+cc;if(cc<0||cc>=n||seen.has(key))continue;seen.add(key);
  const x=15+cc*step,y=15+r*step,e=step*.42;
  out.push(`<path style="--i:${i++}" d="M${(x-e).toFixed(2)} ${(y-e).toFixed(2)}L${(x+e).toFixed(2)} ${(y+e).toFixed(2)}M${(x+e).toFixed(2)} ${(y-e).toFixed(2)}L${(x-e).toFixed(2)} ${(y+e).toFixed(2)}"/>`);
 }
 return out.join('');
}
const STITCHES=crossStitch();
export const marks={
 X:`<g class="mark mark-x"><path class="halo" d="M18 18L82 82M82 18L18 82" stroke="${C.ivory}" stroke-width="17" stroke-linecap="round" fill="none"/>
  <g class="stitches" stroke="${C.berry}" stroke-width="2.6" stroke-linecap="round" fill="none">${STITCHES}</g></g>`,
 O:`<g class="mark mark-o"><circle cx="50" cy="50" r="33" fill="${C.ivory}"/>
  <path fill="${C.teal}" fill-rule="evenodd" d="M50 19a31 31 0 1 0 0.01 0ZM50 36a14 14 0 1 1-0.01 0Z"/>
  <circle cx="50" cy="50" r="24" fill="none" stroke="#4E8295" stroke-width="2" stroke-dasharray="3 3"/>
  <circle cx="50" cy="50" r="14" fill="none" stroke="#1E3F4A" stroke-width="2"/>
  <g stroke="${C.ivory}" stroke-width="2.4" stroke-linecap="round"><path d="M48 25.5v4M52 25.5v4M48 70.5v4M52 70.5v4M25.5 48h4M25.5 52h4M70.5 48h4M70.5 52h4"/></g>
  <path d="M30 38a24 24 0 0 1 14-13" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/></g>`,
 rock:`<g class="mark mark-cat"><ellipse cx="50" cy="80" rx="34" ry="5" fill="#000" opacity=".15"/>
  <path d="M18 70C14 52 30 40 50 41C72 42 86 54 82 70C79 79 24 80 18 70Z" fill="#9A8370" stroke="${C.ivory}" stroke-width="2.5"/>
  <path d="M34 47l2 8M46 43l1 9M58 44l-1 9M70 50l-3 7" stroke="${C.walnut}" stroke-width="3" stroke-linecap="round"/>
  <path class="cat-tail" d="M80 70C92 66 92 54 84 50" fill="none" stroke="#9A8370" stroke-width="8" stroke-linecap="round"/>
  <path d="M80 70C92 66 92 54 84 50" fill="none" stroke="${C.walnut}" stroke-width="2" stroke-dasharray="3 4"/>
  <g class="cat-head"><path d="M20 66C16 54 22 46 32 46C42 46 46 54 44 64C42 72 22 74 20 66Z" fill="#A89280" stroke="${C.ivory}" stroke-width="2.5"/>
  <path d="M22 50L22 38L30 46ZM36 46L42 37L42 50Z" fill="#A89280" stroke="${C.ivory}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M25 58q3 2 6 0M35 58q3 2 6 0" stroke="${C.night}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M32 62l1.5 1.5L35 62" stroke="${C.berry}" stroke-width="1.6" fill="none"/></g>
  <text class="cat-z" x="54" y="34" font-size="13" fill="${C.ivory}" stroke="${C.night}" stroke-width=".6" font-style="italic">z</text></g>`,
};
// Ward = upturned teacup on a dark walnut coaster inside a dashed stitched outline: blocked, not occupied.
export const teacup=`<g class="ward"><rect x="6" y="6" width="88" height="88" rx="10" fill="none" stroke="${C.walnut}" stroke-width="3" stroke-dasharray="6 4"/>
 <ellipse cx="50" cy="71" rx="34" ry="11" fill="#3E2A1E"/><ellipse cx="50" cy="69" rx="31" ry="9" fill="${C.walnut}"/>
 <path d="M24 66Q24 30 50 29Q76 30 76 66Z" fill="${C.ivory}" stroke="${C.night}" stroke-width="2.5"/>
 <ellipse cx="50" cy="31" rx="10" ry="3" fill="#E4D5BD" stroke="${C.night}" stroke-width="1.5"/>
 <g fill="${C.teal}"><circle cx="38" cy="50" r="2.6"/><circle cx="50" cy="45" r="2.6"/><circle cx="62" cy="50" r="2.6"/><circle cx="44" cy="58" r="2"/><circle cx="56" cy="58" r="2"/></g>
 <path d="M76 44Q90 42 86 55L75 58" fill="none" stroke="${C.night}" stroke-width="3"/></g>`;

export const tools={
 shatter:`<svg viewBox="0 0 64 64" aria-hidden="true"><g class="tool-shatter"><path d="M14 10L40 40M50 10L24 40" stroke="#9AA4AE" stroke-width="5" stroke-linecap="round"/><path d="M14 10L40 40M50 10L24 40" stroke="#E6EBEF" stroke-width="1.5"/><circle cx="32" cy="31" r="2.5" fill="${C.night}"/>
  <ellipse cx="20" cy="48" rx="9" ry="7" fill="none" stroke="${C.honey}" stroke-width="4.5"/><ellipse cx="44" cy="48" rx="9" ry="7" fill="none" stroke="${C.honey}" stroke-width="4.5"/></g></svg>`,
 slide:`<svg viewBox="0 0 64 64" aria-hidden="true"><g class="tool-slide"><rect x="10" y="12" width="26" height="6" rx="2" fill="#C9955E"/><rect x="10" y="46" width="26" height="6" rx="2" fill="#C9955E"/>
  <rect x="13" y="18" width="20" height="28" fill="${C.teal}"/><path d="M13 22h20M13 27h20M13 32h20M13 37h20M13 42h20" stroke="#4E8295" stroke-width="1.5"/>
  <path d="M42 18Q58 30 46 48" fill="none" stroke="${C.teal}" stroke-width="3.5" stroke-dasharray="5 3" stroke-linecap="round"/><path d="M40 44L46 50L52 43" fill="none" stroke="${C.teal}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`,
 ward:`<svg viewBox="0 0 64 64" aria-hidden="true"><g class="tool-ward"><ellipse cx="30" cy="52" rx="22" ry="5" fill="${C.walnut}"/><path d="M12 22H48Q48 48 30 49Q12 48 12 22Z" fill="${C.ivory}" stroke="${C.night}" stroke-width="2.5"/>
  <ellipse cx="30" cy="22" rx="18" ry="4" fill="#8B5A2B" stroke="${C.night}" stroke-width="2"/><path d="M48 28Q60 28 56 38L46 41" fill="none" stroke="${C.night}" stroke-width="3"/>
  <g fill="${C.teal}"><circle cx="22" cy="34" r="2.2"/><circle cx="30" cy="38" r="2.2"/><circle cx="38" cy="34" r="2.2"/></g>
  <path class="steam" d="M24 14q-3-4 0-8M32 14q-3-4 0-8" stroke="${C.ivory}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/></g></svg>`,
};

export const house=n=>`<svg viewBox="0 0 40 44" aria-hidden="true"><path d="M4 18L20 4L36 18V40H4Z" class="house-body"/><path d="M4 18L20 4L36 18" class="house-roof" fill="none"/>
 <text x="20" y="34" text-anchor="middle" class="house-num">${n}</text></svg>`;
export const heartButton=`<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" class="hb-rim"/><circle cx="20" cy="20" r="14.5" class="hb-face" stroke-dasharray="2.4 2"/>
 <path class="hb-heart" d="M20 29C11 22 11 15 15 13.5C17.5 12.6 19.4 14 20 15.6C20.6 14 22.5 12.6 25 13.5C29 15 29 22 20 29Z"/></svg>`;
export const needle=`<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 33L31 8" stroke="#D9DEE2" stroke-width="3" stroke-linecap="round"/><ellipse cx="29.5" cy="9.5" rx="1.2" ry="3" transform="rotate(42 29.5 9.5)" fill="${C.night}"/>
 <path class="sw-thread" d="M30 9C38 14 30 22 22 22S10 30 16 36" fill="none" stroke="${C.honey}" stroke-width="2" stroke-linecap="round"/></svg>`;
export const gear=`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.6 7.6 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.6 7.6 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 1.7-1l2.5 1 2-3.5ZM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"/></svg>`;
export const speaker=on=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4Z"/>${on?'<path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>':'<path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'}</svg>`;

// The quilt cloth: linen weave, stitched border and grid, floral corners. Grid lines sit on the cell boundaries (inset 7).
const G=[7,35.667,64.333,93];
const flower=(x,y,r)=>`<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0Q6 -2 10 -8" stroke="#5F7D4F" stroke-width=".7" fill="none"/>
 <circle cx="10" cy="-8" r="1.6" fill="${C.berry}"/><circle cx="5" cy="-2.6" r="1.1" fill="${C.honey}"/><path d="M6 -5q2-2 3 0q-2 1.5-3 0Z" fill="#5F7D4F"/></g>`;
export const cloth=`<defs><pattern id="weave" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="${C.ivory}"/><path d="M0 .5h2M.5 0v2" stroke="#E6D7BF" stroke-width=".35"/></pattern></defs>
 <rect x="0" y="0" width="100" height="100" rx="3" fill="url(#weave)"/>
 <rect class="border-stitch" x="2.4" y="2.4" width="95.2" height="95.2" rx="2" fill="none" stroke="${C.walnut}" stroke-width=".55" stroke-dasharray="1.6 1"/>
 <g class="decor">${flower(4,96,-90)}${flower(96,96,180)}${flower(4,4,0)}${flower(96,4,90)}</g>
 <g class="grid-stitch" stroke="#3E4A5C" stroke-width=".7" stroke-dasharray="1.8 1" fill="none" stroke-linecap="round">
  <rect x="${G[0]}" y="${G[0]}" width="86" height="86" rx="2.5"/>
  ${[1,2].map(k=>`<path d="M${G[k]} ${G[0]}V${G[3]}"/><path d="M${G[0]} ${G[k]}H${G[3]}"/>`).join('')}</g>`;
export const cellCenter=i=>[G[0]+28.667*(i%3+.5),G[0]+28.667*(Math.floor(i/3)+.5)];

// Granny Owl. CSS drives her moods through classes and custom properties (--sleep, --look).
export const owl=`<svg class="owl" viewBox="0 0 300 250" aria-hidden="true">
 <g class="owl-body">
  <path d="M40 250C34 170 80 128 150 128C220 128 266 170 260 250Z" fill="#7A5537"/>
  <path d="M30 250C34 196 70 156 108 150L150 214L192 150C230 156 266 196 270 250Z" fill="#3D5A73"/>
  <path d="M108 150L150 214L192 150" fill="none" stroke="${C.ivory}" stroke-width="5" stroke-dasharray="2 5" stroke-linecap="round"/>
  <g fill="${C.berry}"><circle cx="70" cy="214" r="4"/><circle cx="232" cy="210" r="4"/><circle cx="96" cy="190" r="3"/><circle cx="206" cy="186" r="3"/></g>
  <g fill="${C.honey}"><circle cx="78" cy="206" r="2"/><circle cx="222" cy="219" r="2"/></g>
  <path d="M150 214L150 250" stroke="#2F475C" stroke-width="3"/>
 </g>
 <g class="owl-head">
  <path d="M84 52L74 14L112 40ZM216 52L226 14L188 40Z" fill="#6E4A2F"/>
  <ellipse cx="150" cy="88" rx="80" ry="70" fill="#8B6142"/>
  <path d="M92 70q8-6 16 0M192 70q8-6 16 0M120 40q6-5 12 0M168 40q6-5 12 0M140 30q10-6 20 0" stroke="#6E4A2F" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M150 82C138 54 92 54 88 90C86 124 128 134 150 112C172 134 214 124 212 90C208 54 162 54 150 82Z" fill="#E9D3B0"/>
  <g class="eye eye-l"><circle cx="118" cy="94" r="18" fill="#FFF7E6"/><circle class="iris" cx="118" cy="94" r="13" fill="${C.honey}"/><circle class="pupil" cx="118" cy="94" r="7.5" fill="#1D1A17"/><circle cx="114" cy="89" r="3" fill="#fff"/>
   <circle class="lid" cx="118" cy="94" r="19.5" fill="#8B6142"/></g>
  <g class="eye eye-r"><circle cx="182" cy="94" r="18" fill="#FFF7E6"/><circle class="iris" cx="182" cy="94" r="13" fill="${C.honey}"/><circle class="pupil" cx="182" cy="94" r="7.5" fill="#1D1A17"/><circle cx="178" cy="89" r="3" fill="#fff"/>
   <circle class="lid" cx="182" cy="94" r="19.5" fill="#8B6142"/></g>
  <path class="beak" d="M141 108L159 108L150 126Z" fill="${C.honey}" stroke="#A8712A" stroke-width="2" stroke-linejoin="round"/>
  <ellipse class="yawn" cx="150" cy="128" rx="9" ry="7" fill="#4A2228"/>
  <g class="specs" fill="none" stroke="#C9A35A" stroke-width="3.5"><circle cx="118" cy="94" r="23"/><circle cx="182" cy="94" r="23"/><path d="M141 92q9-6 18 0M95 90L80 84M205 90L220 84"/></g>
 </g>
 <g class="owl-hands">
  <path d="M60 250C60 210 84 196 112 204L128 226C120 240 96 250 60 250Z" fill="#6E4A2F"/>
  <path d="M240 250C240 210 216 196 188 204L172 226C180 240 204 250 240 250Z" fill="#6E4A2F"/>
  <g class="knitting"><path d="M122 206H178L172 246H128Z" fill="${C.berry}"/><path d="M126 214H175M125 222H174M125 230H173M126 238H172" stroke="#8E3445" stroke-width="2" stroke-dasharray="3 2"/></g>
  <path class="needle needle-l" d="M96 236L172 192" stroke="#E2C48F" stroke-width="4" stroke-linecap="round"/>
  <path class="needle needle-r" d="M204 236L128 192" stroke="#E2C48F" stroke-width="4" stroke-linecap="round"/>
 </g>
 <g class="owl-cup" transform="translate(236 196)"><ellipse cx="22" cy="40" rx="20" ry="5" fill="${C.walnut}"/><path d="M6 14H38Q38 38 22 39Q6 38 6 14Z" fill="${C.ivory}" stroke="${C.night}" stroke-width="2"/>
  <ellipse cx="22" cy="14" rx="16" ry="3.5" fill="#8B5A2B"/><path d="M38 20Q48 20 45 29L37 31" fill="none" stroke="${C.night}" stroke-width="2.5"/><g fill="${C.teal}"><circle cx="15" cy="26" r="2"/><circle cx="22" cy="30" r="2"/><circle cx="29" cy="26" r="2"/></g></g>
 <g class="zzz" fill="${C.ivory}" font-style="italic"><text x="226" y="60" font-size="22">z</text><text x="246" y="38" font-size="28">z</text><text x="268" y="14" font-size="34">Z</text></g>
</svg>`;

// Rooms: backdrop only. All share a centred window (behind Owl) so the board and HUD never move.
function windowFrame(sky,extra=''){
 return `<g class="window"><clipPath id="pane"><rect x="560" y="40" width="480" height="380" rx="8"/></clipPath><rect x="560" y="40" width="480" height="380" rx="8" fill="${sky}"/>${extra}
  <g clip-path="url(#pane)"><g class="rain">${Array.from({length:40},(_,i)=>`<path d="M${570+((i*53)%470)} ${40+((i*97)%380)}l-6 22" />`).join('')}</g></g>
  <rect x="560" y="40" width="480" height="380" rx="8" fill="none" stroke="#3E2A1E" stroke-width="22"/>
  <path d="M800 40V420M560 230H1040" stroke="#3E2A1E" stroke-width="14"/>
  <rect x="540" y="414" width="520" height="22" rx="4" fill="#5A3D2B"/></g>`;
}
const stars=`<g fill="#F4E9D8" opacity=".7">${Array.from({length:18},(_,i)=>`<circle cx="${580+((i*131)%440)}" cy="${60+((i*71)%150)}" r="${1+(i%3)*.6}"/>`).join('')}</g>`;
export const rooms={
 1:{name:'the porch at dusk',where:'on the porch',svg:`<defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A3348"/><stop offset=".55" stop-color="#8E4E62"/><stop offset="1" stop-color="#E8A84A"/></linearGradient></defs>
  <rect width="1600" height="900" fill="#3B3040"/>
  <g stroke="#2E2533" stroke-width="3">${Array.from({length:22},(_,i)=>`<path d="M0 ${i*42}H1600"/>`).join('')}</g>
  ${windowFrame('url(#dusk)',`<path d="M560 360Q700 320 800 350T1040 340V420H560Z" fill="#2B2A3A"/>`)}
  <g class="decor"><rect x="180" y="0" width="40" height="900" fill="#4A3A47"/><rect x="1380" y="0" width="40" height="900" fill="#4A3A47"/>
  <g class="lantern"><path d="M1220 120v40" stroke="#222" stroke-width="4"/><rect x="1196" y="160" width="48" height="70" rx="6" fill="#E8A84A" opacity=".85"/><rect x="1196" y="160" width="48" height="70" rx="6" fill="none" stroke="#2A2A2A" stroke-width="6"/></g>
  <g class="fireflies">${Array.from({length:9},(_,i)=>`<circle style="--d:${i}" cx="${260+i*130}" cy="${200+((i*83)%260)}" r="4" fill="#F7D774"/>`).join('')}</g></g>`},
 2:{name:'the kitchen',where:'in the kitchen',svg:`<rect width="1600" height="900" fill="#34404A"/>
  <g fill="#3E4C57" stroke="#2B3640" stroke-width="3">${Array.from({length:60},(_,i)=>`<rect x="${(i%15)*110-20}" y="${350+Math.floor(i/15)*60}" width="110" height="60"/>`).join('')}</g>
  ${windowFrame('#1F2A3D',stars)}
  <g class="decor"><rect x="120" y="180" width="320" height="16" fill="#6B4A35"/><rect x="1160" y="180" width="320" height="16" fill="#6B4A35"/>
  ${[150,215,280,350].map((x,i)=>`<rect x="${x}" y="${120-i%2*20}" width="44" height="${60+i%2*20}" rx="10" fill="${['#E8A84A','#B5485A','#9BB07A','#E8A84A'][i]}" opacity=".85"/><rect x="${x+6}" y="${110-i%2*20}" width="32" height="12" rx="3" fill="#6B4A35"/>`).join('')}
  <g transform="translate(1250 70)"><path d="M60 0v40" stroke="#222" stroke-width="3"/><path d="M0 60Q60 160 120 60Z" fill="#B87333"/><rect x="-10" y="52" width="140" height="12" rx="6" fill="#8E5A2B"/></g>
  <path d="M1190 260h260" stroke="#6B4A35" stroke-width="10"/>${[1210,1280,1350,1420].map(x=>`<path d="M${x} 264v30" stroke="#999" stroke-width="3"/><ellipse cx="${x}" cy="305" rx="14" ry="10" fill="#C9A86B"/>`).join('')}</g>`},
 3:{name:'the reading nook',where:'in the reading nook',svg:`<rect width="1600" height="900" fill="#3A2F3A"/>
  ${windowFrame('#1C2438',stars+`<circle cx="960" cy="110" r="34" fill="#F4E9D8" opacity=".9"/><circle cx="975" cy="100" r="30" fill="#1C2438"/>`)}
  <g class="decor">${[0,1,2,3].map(r=>`<rect x="60" y="${60+r*150}" width="420" height="14" fill="#6B4A35"/>`+Array.from({length:12},(_,i)=>`<rect x="${70+i*34}" y="${60+r*150-90+((i*r*7)%25)}" width="${26+((i+r)%3)*3}" height="${90-((i*r*7)%25)}" fill="${['#B5485A','#2F5D6B','#E8A84A','#6B4A35','#8E6F9E','#5F7D4F'][(i+r)%6]}" opacity=".8"/>`).join('')).join('')}
  <g transform="translate(1250 120)"><path d="M70 0L130 0L170 110H30Z" fill="#E9D7B4"/><path d="M30 110H170" stroke="#C9A35A" stroke-width="6" stroke-dasharray="4 6"/><rect x="94" y="110" width="12" height="300" fill="#5A3D2B"/><ellipse class="lamp-glow" cx="100" cy="90" rx="200" ry="160" fill="#E8A84A" opacity=".12"/></g></g>`},
 4:{name:'the attic, in a storm',where:'up in the stormy attic',svg:`<rect width="1600" height="900" fill="#262B3A"/>
  ${windowFrame('#151B2C',`<rect class="lightning" x="560" y="40" width="480" height="380" fill="#DDE6FF"/>`)}
  <g class="decor"><path d="M0 0L700 0L0 520Z" fill="#4A3729"/><path d="M1600 0L900 0L1600 520Z" fill="#4A3729"/>
  ${[0,1,2,3].map(i=>`<path d="M${i*170} ${520-i*127}L${i*170+60} ${520-i*127}" stroke="#2E2219" stroke-width="16"/><path d="M${1600-i*170} ${520-i*127}L${1540-i*170} ${520-i*127}" stroke="#2E2219" stroke-width="16"/>`).join('')}
  <path d="M0 520L700 0M1600 520L900 0" stroke="#2E2219" stroke-width="24"/>
  <g transform="translate(140 330)"><rect width="200" height="120" rx="8" fill="#5A3D2B"/><rect y="40" width="200" height="10" fill="#C9A35A"/></g>
  <g transform="translate(1300 280) scale(.8)"><path d="M0 180L60 0L120 180Z" fill="#6B5A4A"/><circle cx="60" cy="-20" r="28" fill="#7A6A5A"/></g></g>`},
 5:{name:'the fireside',where:'by the fire',svg:`<rect width="1600" height="900" fill="#3B2A26"/>
  ${windowFrame('#1A2134',stars)}
  <g class="decor"><g transform="translate(60 -10) scale(.68)"><rect width="440" height="560" fill="#5E534C"/>
   ${Array.from({length:28},(_,i)=>`<rect x="${(i%4)*110+(Math.floor(i/4)%2)*55-20}" y="${Math.floor(i/4)*80}" width="104" height="74" rx="10" fill="#6C6058" stroke="#4A413B" stroke-width="4"/>`).join('')}
   <rect x="-20" y="-24" width="480" height="34" rx="6" fill="#6B4A35"/><path d="M90 560V300Q220 180 350 300V560Z" fill="#1A1210"/>
   <g class="fire"><path class="flame f1" d="M150 560Q130 470 190 420Q180 480 220 500Q230 440 270 410Q250 480 300 560Z" fill="#E8A84A"/><path class="flame f2" d="M180 560Q170 500 210 470Q215 510 240 520Q250 480 270 470Q262 520 280 560Z" fill="#F4E9D8" opacity=".8"/></g>
   <rect x="120" y="540" width="200" height="20" rx="10" fill="#5A3D2B"/></g>
   <g transform="translate(1300 200)"><rect width="16" height="60" x="40" fill="#E9D7B4"/><path d="M48 -12q-8 10 0 16q8-6 0-16Z" fill="#E8A84A"/></g></g>`},
};
