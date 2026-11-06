/* The Current: shared behaviour for pathway and day pages. */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const I={
    back:'<path d="M15 18l-6-6 6-6"/>', sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>', flame:'<path d="M12 22c4 0 7-3 7-7 0-5-4-7-5-11-2 2-3 4-3 6-1-1-2-2-2-4-2 2-4 5-4 9 0 4 3 7 7 7z"/>', copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    check:'<path d="M20 6L9 17l-5-5"/>', tip:'<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    trap:'<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    key:'<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3L21 2M16 7l3 3M18 5l2 2"/>',
    interview:'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
    chev:'<path d="M9 18l6-6-6-6"/>', term:'<path d="M4 17l6-6-6-6M12 19h8"/>', ext:'<path d="M14 3h7v7M10 14L21 3M21 14v7H3V3h7"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', code:'<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>', wave:'<path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>'
  };
  const icon=(n)=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${I[n]||''}</svg>`;
  window.PPicon=icon;

  /* theme */
  const root=document.documentElement; const saved=store.get('pp-theme',null); if(saved) root.dataset.theme=saved;
  function curTheme(){return root.dataset.theme||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')}
  const NEXT={dark:'light',light:'ember',ember:'dark'},ICON={dark:'moon',light:'sun',ember:'flame'},LBL={dark:'Dark',light:'Light',ember:'Orange and white'};
  $$('[data-theme-toggle]').forEach(b=>{const paint=()=>{const c=curTheme();b.innerHTML=icon(ICON[c]);b.setAttribute('aria-label',`Theme: ${LBL[c]}. Switch to ${LBL[NEXT[c]]}`);b.title=`Theme: ${LBL[c]}`};paint();
    b.addEventListener('click',()=>{root.dataset.theme=NEXT[curTheme()];store.set('pp-theme',root.dataset.theme);paint();contours&&contours.recolor()})});

  /* contour field: slow flowing depth lines */
  let contours=null;
  const cv=$('canvas.contours');
  if(cv){const ctx=cv.getContext('2d');let w,h,dpr,t=Math.random()*100,raf,col;
    const size=()=>{dpr=Math.min(2,devicePixelRatio||1);w=cv.width=innerWidth*dpr;h=cv.height=innerHeight*dpr};
    const recolor=()=>{try{setMode()}catch(e){}const s=getComputedStyle(document.documentElement);col=[s.getPropertyValue('--glacier').trim(),s.getPropertyValue('--lilac').trim(),s.getPropertyValue('--aurora').trim()];draw()};
    const N=16,wake=[],sparks=[];let mode='water';
    const setMode=()=>{mode=(root.dataset.theme==='ember')?'fire':'water'};setMode();
    const lineY=(k,x)=>{const u=x/w,y0=h*(k+1)/(N+1);return y0+Math.sin(u*6.2+t*.35+k*.6)*h*.028+Math.sin(u*2.1-t*.22+k*1.3)*h*.05+Math.sin(u*11+t*.5+k)*h*.006};
    /* every pointer move lands here immediately: no throttle, no smoothing */
    let px=-1e4,py=-1e4,pt=0;
    window.PPpoint=(cx,cy,tap)=>{const X=cx*dpr,Y=cy*dpr,now=performance.now();const sp=px<-1e3?0:Math.min(1,Math.hypot(X-px,Y-py)/(40*dpr));
      wake.push({x:X,y:Y,t:now,s:tap?1.3:.35+.65*sp});if(wake.length>14)wake.shift();
      if(mode==='fire'){const n=tap?18:Math.round(1+sp*3);for(let i=0;i<n;i++)sparks.push({x:X+(Math.random()-.5)*14*dpr,y:Y+(Math.random()-.5)*8*dpr,vx:(Math.random()-.5)*(tap?2.4:.9)*dpr,vy:-(Math.random()*1.6+.8)*dpr*(tap?1.6:1),t:now,life:600+Math.random()*700,r:(Math.random()*2.2+1.2)*dpr});
        if(sparks.length>160)sparks.splice(0,sparks.length-160)}
      px=X;py=Y;pt=now;if(reduce)draw()};
    const RAD=()=>150*dpr;
    function field(x,y,now){let dy=0;const R=RAD();for(const p of wake){const age=(now-p.t)/1000;const life=mode==='fire'?.7:1.1;const f=1-age/life;if(f<=0)continue;
        const dx=x-p.x,dyy=y-p.y,d2=(dx*dx+dyy*dyy)/(R*R);if(d2>2.2)continue;const fall=Math.exp(-d2*2.2)*f*f*p.s;
        if(mode==='water'){const d=Math.sqrt(d2)*R;dy+=Math.sin(d/(13*dpr)-age*14)*fall*14*dpr}
        else dy-=fall*(10+6*Math.sin(x/(9*dpr)+now/70))*dpr}
      return dy}
    function draw(){const now=performance.now();while(wake.length&&now-wake[0].t>1100)wake.shift();ctx.clearRect(0,0,w,h);const R=RAD();
      if(mode==='fire'){fireBg(now)}else
      for(let k=0;k<N;k++){ctx.beginPath();
        for(let x=0;x<=w;x+=6*dpr){let y=lineY(k,x);if(wake.length)y+=field(x,y,now);x?ctx.lineTo(x,y):ctx.moveTo(x,y)}
        ctx.strokeStyle=col[k%3];ctx.globalAlpha=.09+.06*Math.sin(k*1.7+t*.2)**2;ctx.lineWidth=1.1*dpr;ctx.stroke()}
      if(sparks.length){for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];const age=now-s.t;if(age>s.life){sparks.splice(i,1);continue}const f=1-age/s.life;
          s.x+=s.vx+Math.sin((now+i*97)/120)*.25*dpr;s.y+=s.vy;s.vy*=.985;
          const hue=f>.6?'#ffd166':f>.3?'#ff8a3d':'#e0452b';ctx.globalAlpha=Math.min(1,f*1.5);ctx.fillStyle=hue;ctx.shadowColor=hue;ctx.shadowBlur=10*dpr*f;ctx.beginPath();ctx.arc(s.x,s.y,s.r*(.5+f*.6),0,6.283);ctx.fill()}}
      ctx.shadowBlur=0;ctx.globalAlpha=1}

    /* fire background: flame tongues licking up from the bottom, heat lines rising and fading */
    const FL=['#e8590c','#ff8a3d','#ffb347'];
    function fireBg(now){const T=t*3.2;
      // rising heat lines
      for(let k=0;k<14;k++){const fr=((k/14)+T*.012)%1;const y0=h*(1.02-fr*1.1);const alpha=Math.sin(fr*Math.PI)*.16;if(alpha<=.005)continue;ctx.beginPath();
        for(let x=0;x<=w;x+=6*dpr){const u=x/w;let y=y0+Math.sin(u*7.5+T*1.6+k*1.9)*h*.012+Math.sin(u*19-T*2.7+k)*h*.004;if(wake.length)y+=field(x,y,now);x?ctx.lineTo(x,y):ctx.moveTo(x,y)}
        ctx.strokeStyle=FL[k%3];ctx.globalAlpha=alpha;ctx.lineWidth=1.2*dpr;ctx.stroke()}
      // three layers of flame tongues along the bottom edge
      for(let L=0;L<3;L++){const H=h*(.16+.07*L),m=5+L*2,ph=L*1.7;ctx.beginPath();ctx.moveTo(0,h);
        for(let x=0;x<=w;x+=5*dpr){const u=x/w;const tongue=Math.pow(Math.abs(Math.sin(u*Math.PI*m+ph+Math.sin(T*.9+u*3+L)*.6)),2.4);
          const flick=.55+.3*Math.sin(T*2.3+u*11+L*2)+.15*Math.sin(T*5.1+u*23);ctx.lineTo(x,h-H*.18-tongue*H*flick)}
        ctx.lineTo(w,h);ctx.closePath();const g=ctx.createLinearGradient(0,h,0,h-H*1.2);g.addColorStop(0,FL[L]);g.addColorStop(1,'rgba(255,170,60,0)');
        ctx.fillStyle=g;ctx.globalAlpha=.16-.03*L;ctx.fill()}
      ctx.globalAlpha=1}
    const _recolor=()=>{setMode()};
    function loop(){t+=.006;draw();raf=requestAnimationFrame(loop)}
    size();recolor();addEventListener('resize',()=>{size();draw()});
    if(!reduce){loop();document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);if(!document.hidden)loop()})}
    contours={recolor};}

  /* motes: slow rising particles, pathway only */
  const mc=$('canvas.motes');
  if(mc){const c2=mc.getContext('2d');let W,H,dp,parts=[],r2;
    const sz=()=>{dp=Math.min(2,devicePixelRatio||1);W=mc.width=innerWidth*dp;H=mc.height=innerHeight*dp;parts=Array.from({length:Math.round(innerWidth*innerHeight/16000)},()=>({x:Math.random()*W,y:Math.random()*H,r:(Math.random()*1.6+.4)*dp,v:(Math.random()*.25+.08)*dp,p:Math.random()*6.3}))};
    const col=()=>getComputedStyle(document.documentElement).getPropertyValue('--glacier').trim();const fire=()=>document.documentElement.dataset.theme==='ember';
    function frame(){c2.clearRect(0,0,W,H);const F=fire();c2.fillStyle=col();for(const q of parts){q.y-=q.v*(F?2.2:1);if(F)c2.fillStyle=q.r>1.4*dp?'#ff8a3d':'#ffb347';q.p+=.012;q.x+=Math.sin(q.p)*.18*dp;if(q.y<-5){q.y=H+5;q.x=Math.random()*W}c2.globalAlpha=F?(.25+.45*Math.abs(Math.sin(q.p*5.3))):(.18+.22*Math.sin(q.p*1.7)**2);c2.beginPath();c2.arc(q.x,q.y,q.r,0,6.283);c2.fill()}c2.globalAlpha=1}
    sz();addEventListener('resize',sz);frame();
    if(!reduce){const loop=()=>{frame();r2=requestAnimationFrame(loop)};loop();document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(r2);if(!document.hidden)loop()})}}

  /* glow that follows pointer, touch, or device tilt */
  {const g=document.createElement('div');g.className='glowcursor';g.setAttribute('aria-hidden','true');document.body.appendChild(g);
    let tx=innerWidth/2,ty=innerHeight*.35,x=tx,y=ty,raf=0,tilt=false;
    const show=()=>g.classList.add('on');
    const tick=()=>{x+=(tx-x)*(reduce?1:.55);y+=(ty-y)*(reduce?1:.55);g.style.transform=`translate3d(${x}px,${y}px,0)`;raf=(Math.abs(tx-x)+Math.abs(ty-y)>.5)?requestAnimationFrame(tick):0};
    const go=(nx,ny,force)=>{tx=nx;ty=ny;show();window.PPpoint&&window.PPpoint(nx,ny,force);if(!raf)raf=requestAnimationFrame(tick)};
    addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||!tilt)go(e.clientX,e.clientY)},{passive:true});
    addEventListener('pointerdown',e=>go(e.clientX,e.clientY,true),{passive:true});
    document.addEventListener('mouseleave',()=>g.classList.remove('on'));
    const onTilt=e=>{if(e.gamma==null||e.beta==null)return;tilt=true;
      const gx=Math.max(-35,Math.min(35,e.gamma)),by=Math.max(-10,Math.min(70,e.beta))-30;
      go(innerWidth*(.5+gx/70),innerHeight*(.45+by/80))};
    const startTilt=()=>{addEventListener('deviceorientation',onTilt,{passive:true})};
    if(window.DeviceOrientationEvent){
      if(typeof DeviceOrientationEvent.requestPermission==='function'){
        const ask=()=>{DeviceOrientationEvent.requestPermission().then(s=>{if(s==='granted')startTilt()}).catch(()=>{});removeEventListener('touchend',ask)};
        startTilt();addEventListener('touchend',ask,{once:true});
      } else startTilt();
    }
  }

  /* ---------- day page ---------- */
  const day=document.body.dataset.key||document.body.dataset.day;const NOUN=document.body.dataset.noun||'day',NUM=document.body.dataset.num||day;
  if(day){
    // reading progress
    const bar=$('.progress span');
    const onScroll=()=>{const m=document.documentElement;const p=m.scrollTop/(m.scrollHeight-m.clientHeight||1);bar&&(bar.style.transform=`scaleX(${Math.min(1,Math.max(0,p))})`)};
    addEventListener('scroll',onScroll,{passive:true});onScroll();
    // section nav
    const toc=$('.toc');const units=$$('.unit[id]');
    units.forEach(u=>{const a=document.createElement('a');a.href='#'+u.id;a.textContent=u.dataset.title||u.querySelector('h2')?.textContent||u.id;toc&&toc.appendChild(a)});
    if('IntersectionObserver' in window&&toc){const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){$$('a',toc).forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id));const on=$('a.on',toc);on&&on.scrollIntoView({block:'nearest',inline:'center',behavior:reduce?'auto':'smooth'})}})},{rootMargin:'-40% 0px -55% 0px'});units.forEach(u=>io.observe(u))}
    // notes get icons
    $$('.note').forEach(n=>{const k=['trap','key','tip','interview'].find(c=>n.classList.contains(c))||'tip';const inner=document.createElement('div');while(n.firstChild)inner.appendChild(n.firstChild);n.innerHTML=icon(k);n.appendChild(inner)});
    // checks get chevrons
    $$('details.check > summary').forEach(s=>s.insertAdjacentHTML('afterbegin',icon('chev')));
    // problem headers
    $$('.problem').forEach(p=>{const lv=p.dataset.level||'medium';const name={warmup:'Warm-up',medium:'Medium',hard:'Hard'}[lv];const lc=p.dataset.lc;
      p.insertAdjacentHTML('afterbegin',`<div class="head"><span class="lvl"><i><b></b><b></b><b></b></i>${name}</span>${lc?`<a class="lc" href="${lc}" target="_blank" rel="noopener">Open on LeetCode ${icon('ext')}</a>`:''}</div>`)});
    // code boxes
    $$('pre.code').forEach(pre=>{const lang=pre.dataset.lang||'code';const box=document.createElement('div');box.className='codebox';
      box.innerHTML=`<div class="bar"><span class="dot"></span>${lang}<button type="button">${icon('copy')}Copy</button></div>`;
      pre.replaceWith(box);const p2=document.createElement('pre');p2.innerHTML=pre.innerHTML;box.appendChild(p2);
      const raw=p2.textContent;highlight(p2,lang);
      const btn=$('button',box);btn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(raw);btn.innerHTML=icon('check')+'Copied'}catch(e){const r=document.createRange();r.selectNodeContents(p2);const s=getSelection();s.removeAllRanges();s.addRange(r);btn.innerHTML='Press Ctrl+C'}setTimeout(()=>btn.innerHTML=icon('copy')+'Copy',1600)});
      let nx=box.nextElementSibling; if(nx&&nx.matches('pre.output')){const o=document.createElement('div');o.className='out';o.innerHTML=`<div class="lbl">${icon('term')}Output</div>`;const op=document.createElement('pre');op.innerHTML=nx.innerHTML;o.appendChild(op);nx.remove();box.appendChild(o)}});
    $$('pre.output').forEach(o=>{const box=document.createElement('div');box.className='codebox';box.innerHTML=`<div class="out"><div class="lbl">${icon('term')}Output</div></div>`;const op=document.createElement('pre');op.innerHTML=o.innerHTML;box.firstChild.appendChild(op);o.replaceWith(box)});
    // complete
    const done=store.get('pp-done',{});const fin=$('.finish');const btn=$('#complete');
    const paint=()=>{const d=!!done[day];fin.classList.toggle('done',d);btn.innerHTML=d?icon('check')+'Completed. Tap to undo':'Mark '+NOUN+' '+NUM+' complete'};
    if(btn){paint();btn.addEventListener('click',()=>{done[day]=!done[day];if(done[day]){done[day]=new Date().toISOString().slice(0,10);if(!reduce){const r=document.createElement('span');r.className='ripple';fin.appendChild(r);setTimeout(()=>r.remove(),1500)}}else delete done[day];store.set('pp-done',done);paint()})}
  }

  /* simple, safe highlighter: works on text, escapes everything */
  function highlight(pre,lang){
    const kw={python:'def class return if elif else for while in not and or is None True False import from as with try except finally raise lambda yield global nonlocal pass break continue async await del assert',
      c:'int char float double void return if else for while do struct union enum typedef const static extern volatile sizeof unsigned signed long short switch case break continue default include define NULL',
      cpp:'int char float double void return if else for while do struct class public private protected virtual override const static new delete template typename using namespace auto nullptr bool true false include',
      java:'public private protected class interface extends implements static final void int long double boolean char new return if else for while try catch finally throw throws import package this super null true false String',
      javascript:'const let var function return if else for while of in new class extends this null undefined true false async await import export from try catch finally throw typeof',
      sql:'SELECT FROM WHERE GROUP BY HAVING ORDER JOIN LEFT RIGHT INNER OUTER FULL ON AS AND OR NOT IN EXISTS NULL IS INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE PRIMARY KEY FOREIGN REFERENCES WITH OVER PARTITION DISTINCT LIMIT UNION ALL CASE WHEN THEN ELSE END INDEX VIEW COUNT SUM AVG MIN MAX'};
    kw.js=kw.javascript;kw.ts=kw.javascript;kw.typescript=kw.javascript;kw.jsx=kw.javascript;
    const words=new Set((kw[lang]||'').split(' ').filter(Boolean));if(!words.size)return;
    const ci=lang==='sql';const src=pre.textContent;const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const cm=(lang==='python')?'#[^\n]*':(lang==='sql'?'--[^\n]*':'\\/\\/[^\n]*|\\/\\*[\\s\\S]*?\\*\\/');
    const re=new RegExp(`(${cm})|("(?:[^"\\\\\\n]|\\\\.)*"|'(?:[^'\\\\\\n]|\\\\.)*'|\`[^\`]*\`)|\\b(\\d+(?:\\.\\d+)?)\\b|\\b([A-Za-z_]\\w*)\\b(?=\\s*\\()|\\b([A-Za-z_]\\w*)\\b`,'g');
    let out='',last=0,m;while((m=re.exec(src))){out+=esc(src.slice(last,m.index));last=re.lastIndex;
      if(m[1])out+=`<span class="tc">${esc(m[1])}</span>`;else if(m[2])out+=`<span class="ts">${esc(m[2])}</span>`;else if(m[3])out+=`<span class="tn">${m[3]}</span>`;
      else{const wd=m[4]||m[5];const isK=ci?words.has(wd.toUpperCase()):words.has(wd);out+=isK?`<span class="tk">${wd}</span>`:(m[4]?`<span class="tf">${wd}</span>`:wd)}}
    out+=esc(src.slice(last));pre.innerHTML=out;
  }

  /* ---------- pathway ---------- */
  const J=$('.journey');
  const TR=store.get('pp-track','interview');const PLAN_=window.PLANS?(window.PLANS[TR]||window.PLANS.interview):window.PLAN;
  if(J&&PLAN_){
    const done=store.get('pp-done',{});const plan=PLAN_;let cur=plan.find(d=>!done[d.key]);
    const weeks={};plan.forEach(d=>{(weeks[d.week]=weeks[d.week]||[]).push(d)});
    let html='';const amp=[0,.55,.8,.55,0,-.55,-.8,-.55];let idx=0;
    Object.keys(weeks).forEach(wk=>{const list=weeks[wk];html+=`<div class="week"><h2>${list[0].weekName}</h2><span>${list[0].groupNote}</span></div>`;
      list.forEach(d=>{const a=amp[idx%amp.length];idx++;const state=done[d.key]?'done':(cur&&cur.key===d.key?'now':'');
        const left=a<=0;html+=`<div class="stop ${state}" data-track="${d.track}" style="--x:${a}"><a class="node" href="${d.file}" aria-label="${d.Noun} ${d.day}: ${d.title}">${done[d.key]?icon('check'):d.day}</a>
        <div class="info" style="${left?'left':'right'}:calc(100% * 0 + 0px)"><b>${d.title}</b><small>${d.sub} · ${d.dsa}</small>${state==='now'?'<span class="here">Up next</span>':''}</div></div>`})});
    J.insertAdjacentHTML('beforeend',html);
    // position stops along a meander
    const stops=$$('.stop',J);
    const place=()=>{const W=J.clientWidth-36;stops.forEach(s=>{const a=parseFloat(s.style.getPropertyValue('--x'));const node=$('.node',s);const info=$('.info',s);const amp2=W<480?(W/2-60)*.55:(W/2-80);const cx=W/2+a*amp2;
        node.style.marginLeft=(cx-34)+'px';info.style.left='';info.style.right='';
        if(a>0){info.style.right=(W-cx+48)+'px';info.style.textAlign='right';info.style.width=Math.max(110,Math.min(250,cx-48))+'px'}else{info.style.left=(cx+48)+'px';info.style.textAlign='left';info.style.width=Math.max(110,Math.min(250,W-cx-48))+'px'}});
      drawRiver()};
    function drawRiver(){const svg=$('svg.river',J);const jb=J.getBoundingClientRect();const pts=stops.map(s=>{const r=$('.node',s).getBoundingClientRect();return[r.left-jb.left+r.width/2,r.top-jb.top+r.height/2]});
      const path=(arr)=>arr.map((p,i)=>{if(!i)return`M${p[0]},${p[1]}`;const q=arr[i-1];const my=(q[1]+p[1])/2;return`C${q[0]},${my} ${p[0]},${my} ${p[0]},${p[1]}`}).join(' ');
      const all=path(pts);const lastDone=stops.reduce((k,s,i)=>s.classList.contains('done')?i:k,-1);
      svg.setAttribute('viewBox',`0 0 ${jb.width} ${jb.height}`);svg.innerHTML=`<path class="bed" d="${all}"/><path class="flow" d="${all}"/>${lastDone>0?`<path class="done" d="${path(pts.slice(0,lastDone+1))}"/>`:''}`}
    place();addEventListener('resize',place);
    const deco=()=>{$$('.glow,.sounding',J).forEach(e=>e.parentNode.removeChild(e));$$('.week',J).forEach((w,i)=>{const top=w.offsetTop;const g=document.createElement('div');g.className='glow';const nx=w.nextElementSibling;g.setAttribute('data-track',(nx&&nx.dataset.track)||'programming');
        g.style.top=(top+60)+'px';g.style[i%2?'right':'left']='-12%';J.prepend(g);const sd=document.createElement('div');sd.className='sounding';sd.style.top=(top-14)+'px';sd.innerHTML=`<span>DEPTH ${(i+1)*20} M</span>`;J.prepend(sd)})};
    deco();addEventListener('resize',deco);
    /* wide chart: one row per week, the current snakes left to right then right to left */
    const C=$('.chart');
    if(C){const sea=$('.sea',C),lb=$('.logbook',C);let ch='';let wi=0;
      const rows=[];Object.keys(weeks).forEach(wk=>{const L=weeks[wk];for(let i=0;i<L.length;i+=7)rows.push({list:L.slice(i,i+7),first:i===0,all:L,g:Object.keys(weeks).indexOf(wk)})});
      rows.forEach(({list,first,g})=>{const dir=wi%2?'rtl':'ltr';
        ch+=`<div class="crow${first?'':' cont'}" data-dir="${dir}"><div class="chead"><h2>${list[0].weekName}</h2><span>${list[0].groupNote} · depth ${(g+1)*20} m</span></div><div class="cstops">`+
          list.map(d=>{const st=done[d.key]?'done':(cur&&cur.key===d.key?'now':'');const short=(d.title.split(':')[0]).replace(/^Sunday$/,'Sunday review');
            return `<div class="cstop ${st}" data-track="${d.track}" data-day="${d.key}"><a class="node" href="${d.file}" aria-label="${d.Noun} ${d.day}: ${d.title}">${done[d.key]?icon('check'):d.day}</a><span class="clabel">${short}</span></div>`}).join('')+`</div></div>`;wi++});
      sea.insertAdjacentHTML('beforeend',ch);
      const cst=$$('.cstop',sea);
      const show=(d,sel)=>{const st=done[d.key]?'done':(cur&&cur.key===d.key?'now':'');lb.setAttribute('data-track',d.track);
        lb.innerHTML=`<div class="swap"><p class="big">${String(d.day).padStart(2,'0')}</p><p class="when">${d.sub} · ${d.trackName}</p>
          <p class="state ${st}">${st==='done'?icon('check')+'Completed':st==='now'?icon('wave')+'Up next':icon('clock')+'Not started'}</p>
          <h3>${d.title}</h3>${d.lede?`<p class="l">${d.lede}</p>`:''}${(d.topics||[]).length?`<ul>${d.topics.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}
          <p class="dsa">${icon('code')}${d.focusLabel}: ${d.dsa}</p><a class="btn" href="${d.file}">${st==='done'?'Review '+d.noun+' '+d.day:'Open '+d.noun+' '+d.day} ${icon('chev')}</a></div>`;
        cst.forEach(s=>s.classList.toggle('sel',sel&&s.dataset.day==d.key))};
      const byDay=Object.fromEntries(plan.map(d=>[d.key,d]));
      cst.forEach(s=>{const d=byDay[s.dataset.day];const a=$('.node',s);a.addEventListener('mouseenter',()=>show(d,true));a.addEventListener('focus',()=>show(d,true))});
      sea.addEventListener('mouseleave',()=>show(cur||plan[plan.length-1],false));
      show(cur||plan[plan.length-1],false);
      const river=()=>{const svg=$('svg.river',sea);const sb=sea.getBoundingClientRect();const pts=cst.map(s=>{const r=$('.node',s).getBoundingClientRect();return[r.left-sb.left+r.width/2,r.top-sb.top+r.height/2]});
        const mid=sb.width/2;const seg=(q,p)=>{if(Math.abs(p[1]-q[1])>60){const side=q[0]>mid?1:-1;const bx=side>0?Math.max(q[0],p[0])+110:Math.min(q[0],p[0])-110;return`C${bx},${q[1]} ${bx},${p[1]} ${p[0]},${p[1]}`}const mx=(q[0]+p[0])/2;return`C${mx},${q[1]} ${mx},${p[1]} ${p[0]},${p[1]}`};
        const path=arr=>arr.map((p,i)=>i?seg(arr[i-1],p):`M${p[0]},${p[1]}`).join(' ');const lastDone=cst.reduce((k,s,i)=>s.classList.contains('done')?i:k,-1);
        svg.setAttribute('viewBox',`0 0 ${sb.width} ${sb.height}`);svg.innerHTML=`<path class="bed" d="${path(pts)}"/><path class="flow" d="${path(pts)}"/>${lastDone>0?`<path class="done" d="${path(pts.slice(0,lastDone+1))}"/>`:''}`;
        $$('.glow',sea).forEach(g=>g.parentNode.removeChild(g));$$('.crow',sea).forEach((r,i)=>{const g=document.createElement('div');g.className='glow';const f=$('.cstop',r);g.setAttribute('data-track',f?f.dataset.track:'programming');g.style.top=(r.offsetTop-80)+'px';g.style[i%2?'right':'left']='-8%';sea.prepend(g)})};
      river();addEventListener('resize',river);if(document.fonts)document.fonts.ready.then(river);}
    // track switch and hero copy
    $$('[data-track-switch]').forEach(b=>{const on=b.dataset.trackSwitch===TR;b.setAttribute('aria-pressed',on);b.addEventListener('click',()=>{if(on)return;store.set('pp-track',b.dataset.trackSwitch);location.reload()})});
    const H=window.HERO&&window.HERO[TR];if(H){$('.hero h1').innerHTML=H.h1;$('.hero p').textContent=H.p;$$('.gauge span').forEach((s,i)=>s.textContent=H.g[i])}
    // gauges
    const n=Object.keys(done).filter(k=>plan.some(d=>d.key===k)).length;
    $('#g-done')&&($('#g-done').textContent=n);$('#g-left')&&($('#g-left').textContent=plan.length-n);
    const dates=Object.values(done).filter(v=>typeof v==='string').sort();let streak=0;
    {const set=new Set(dates);let d=new Date();for(;;){const k=d.toISOString().slice(0,10);if(set.has(k)){streak++;d.setDate(d.getDate()-1)}else break}}
    $('#g-streak')&&($('#g-streak').textContent=streak);
    const nb=$('#continue');if(nb&&cur){nb.href=cur.file;nb.innerHTML=`Continue with ${cur.noun} ${cur.day} ${icon('chev')}`}
    if(cur&&cur.day>1){const el=(matchMedia('(min-width: 980px)').matches?$('.cstop.now'):null)||stops.find(s=>s.classList.contains('now'));el&&setTimeout(()=>el.scrollIntoView({block:'center',behavior:reduce?'auto':'smooth'}),400)}
  }
})();
