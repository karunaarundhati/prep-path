/* Matrix playground: interactive pictures for linear algebra.
   <div class="viz" data-viz="transform" data-m="2,1,1,2"></div>   a matrix bending the grid (drag the arrow tips)
   <div class="viz" data-viz="vectors" data-u="2,1" data-v="1,2"></div>  two vectors, their sum, independence
   <div class="viz" data-viz="projection" data-u="3,1" data-v="1,2"></div> projecting v onto the line of u        */
(function(){
  const css=(n)=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const f2=(x)=>{const r=Math.round(x*100)/100;return Object.is(r,-0)?'0':String(r)};
  function setup(el){
    const kind=el.dataset.viz;const num=(s,d)=>(s||d).split(',').map(Number);
    const st={m:num(el.dataset.m,'1,0,0,1'),u:num(el.dataset.u,'2,1'),v:num(el.dataset.v,'1,2'),t:1};
    el.innerHTML=`<div class="vz-stage"><canvas></canvas></div><div class="vz-side">${
      kind==='transform'?`<div class="vz-mat" aria-label="Matrix entries"><span class="br">[</span><input aria-label="a" data-i="0"><input aria-label="b" data-i="1"><input aria-label="c" data-i="2"><input aria-label="d" data-i="3"><span class="br">]</span></div>
      <label class="vz-slide">From identity to the matrix<input type="range" min="0" max="1" step="0.01" value="1"></label>`:''}
      <div class="vz-read"></div><p class="vz-hint">Drag the arrow tips to change the vectors.</p></div>`;
    const cv=el.querySelector('canvas'),ctx=cv.getContext('2d'),read=el.querySelector('.vz-read');
    let S=320,dpr=1,scale=36;
    const resize=()=>{const w=el.querySelector('.vz-stage').clientWidth;S=Math.min(w,420);dpr=Math.min(2,devicePixelRatio||1);cv.width=S*dpr;cv.height=S*dpr;cv.style.width=S+'px';cv.style.height=S+'px';scale=S/10;draw()};
    const P=(x,y)=>[S/2+x*scale,S/2-y*scale];
    const line=(a,b,c,w,dash)=>{ctx.beginPath();ctx.setLineDash(dash||[]);ctx.moveTo(...P(...a));ctx.lineTo(...P(...b));ctx.strokeStyle=c;ctx.lineWidth=w;ctx.stroke();ctx.setLineDash([])};
    const arrow=(v,c,label)=>{const [x,y]=v;line([0,0],[x,y],c,3);const [px,py]=P(x,y),[ox,oy]=P(0,0);const an=Math.atan2(py-oy,px-ox);
      ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-11*Math.cos(an-.4),py-11*Math.sin(an-.4));ctx.lineTo(px-11*Math.cos(an+.4),py-11*Math.sin(an+.4));ctx.closePath();ctx.fillStyle=c;ctx.fill();
      ctx.beginPath();ctx.arc(px,py,7,0,6.283);ctx.strokeStyle=c;ctx.lineWidth=1.5;ctx.stroke();
      if(label){ctx.font='600 14px Manrope, sans-serif';ctx.fillStyle=c;ctx.fillText(label,px+10,py-10)}};
    function grid(M,col,w){for(let k=-12;k<=12;k++){const a=[M[0]*k+M[1]*-12,M[2]*k+M[3]*-12],b=[M[0]*k+M[1]*12,M[2]*k+M[3]*12];line(a,b,col,w);
        const c=[M[0]*-12+M[1]*k,M[2]*-12+M[3]*k],d=[M[0]*12+M[1]*k,M[2]*12+M[3]*k];line(c,d,col,w)}}
    function draw(){const fg=css('--text'),mu=css('--line2'),ac=css('--glacier'),li=css('--lilac'),au=css('--aurora'),co=css('--coral');
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,S,S);ctx.globalAlpha=.55;grid([1,0,0,1],mu,1);ctx.globalAlpha=1;line([-12,0],[12,0],mu,1.5);line([0,-12],[0,12],mu,1.5);
      if(kind==='transform'){const t=st.t,m=st.m,M=[1+(m[0]-1)*t,m[1]*t,m[2]*t,1+(m[3]-1)*t];ctx.globalAlpha=.45;grid(M,ac,1);ctx.globalAlpha=1;
        ctx.beginPath();const q=[[0,0],[M[0],M[2]],[M[0]+M[1],M[2]+M[3]],[M[1],M[3]]].map(p=>P(...p));ctx.moveTo(...q[0]);q.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();
        ctx.fillStyle=ac;ctx.globalAlpha=.16;ctx.fill();ctx.globalAlpha=1;
        const tr=M[0]+M[3],de=M[0]*M[3]-M[1]*M[2],disc=tr*tr-4*de;let eig='complex, so no real direction stays fixed';const evs=[];
        if(disc>=-1e-9){const r=Math.sqrt(Math.max(0,disc));const l1=(tr+r)/2,l2=(tr-r)/2;eig=Math.abs(r)<1e-9?`λ = ${f2(l1)} (repeated)`:`λ₁ = ${f2(l1)}, λ₂ = ${f2(l2)}`;
          for(const l of (Math.abs(r)<1e-9?[l1]:[l1,l2])){let v=Math.abs(M[1])>1e-9?[M[1],l-M[0]]:(Math.abs(M[2])>1e-9?[l-M[3],M[2]]:null);if(!v)v=(Math.abs(l-M[0])<1e-9)?[1,0]:[0,1];
            const n=Math.hypot(...v);evs.push([v[0]/n,v[1]/n,l])}}
        evs.forEach(([x,y])=>line([-12*x,-12*y],[12*x,12*y],au,2,[6,6]));
        arrow([M[0],M[2]],ac,'î');arrow([M[1],M[3]],li,'ĵ');
        read.innerHTML=`<div><b>Area scale (det)</b><span>${f2(de)}${Math.abs(de)<1e-9?' · squashed flat, not invertible':de<0?' · flipped over':''}</span></div><div><b>Trace</b><span>${f2(tr)}</span></div><div><b>Eigenvalues</b><span>${eig}</span></div>`+
          (evs.length?`<div><b>Green dashed lines</b><span>Directions that only stretch. These are the eigenvectors.</span></div>`:'');
        el.querySelectorAll('.vz-mat input').forEach(inp=>{if(document.activeElement!==inp)inp.value=f2(st.m[+inp.dataset.i])})}
      if(kind==='vectors'){const u=st.u,v=st.v,s=[u[0]+v[0],u[1]+v[1]];line(u,s,li,1.5,[5,5]);line(v,s,ac,1.5,[5,5]);arrow(s,au,'u + v');arrow(u,ac,'u');arrow(v,li,'v');
        const de=u[0]*v[1]-u[1]*v[0];read.innerHTML=`<div><b>u</b><span>(${f2(u[0])}, ${f2(u[1])})</span></div><div><b>v</b><span>(${f2(v[0])}, ${f2(v[1])})</span></div><div><b>u + v</b><span>(${f2(s[0])}, ${f2(s[1])})</span></div><div><b>det [u v]</b><span>${f2(de)} · ${Math.abs(de)<.05?'dependent: they lie on one line':'independent: together they span the whole plane'}</span></div>`}
      if(kind==='projection'){const u=st.u,v=st.v,uu=u[0]*u[0]+u[1]*u[1]||1,k=(u[0]*v[0]+u[1]*v[1])/uu,p=[k*u[0],k*u[1]],n=Math.hypot(...u)||1;
        line([-12*u[0]/n,-12*u[1]/n],[12*u[0]/n,12*u[1]/n],ac,1.5,[6,6]);line(v,p,co,2,[4,4]);arrow(u,ac,'u');arrow(v,li,'v');arrow(p,au,'proj');
        read.innerHTML=`<div><b>u · v</b><span>${f2(u[0]*v[0]+u[1]*v[1])}</span></div><div><b>Scale factor (u·v)/(u·u)</b><span>${f2(k)}</span></div><div><b>Projection of v on u</b><span>(${f2(p[0])}, ${f2(p[1])})</span></div><div><b>Error v − proj</b><span>(${f2(v[0]-p[0])}, ${f2(v[1]-p[1])}) · always at right angles to u</span></div>`}}
    // dragging tips
    let drag=null;const toW=(e)=>{const r=cv.getBoundingClientRect();return[((e.clientX-r.left)-S/2)/scale,(S/2-(e.clientY-r.top))/scale]};
    const tips=()=>kind==='transform'?[['c0',[st.m[0],st.m[2]]],['c1',[st.m[1],st.m[3]]]]:[['u',st.u],['v',st.v]];
    cv.addEventListener('pointerdown',e=>{const w=toW(e);let best=null,bd=.7;for(const [k,p] of tips()){const d=Math.hypot(w[0]-p[0],w[1]-p[1]);if(d<bd){bd=d;best=k}}if(best){drag=best;cv.setPointerCapture(e.pointerId);e.preventDefault()}});
    cv.addEventListener('pointermove',e=>{if(!drag)return;let [x,y]=toW(e);x=Math.round(x*2)/2;y=Math.round(y*2)/2;x=Math.max(-4.5,Math.min(4.5,x));y=Math.max(-4.5,Math.min(4.5,y));
      if(drag==='c0'){st.m[0]=x;st.m[2]=y}else if(drag==='c1'){st.m[1]=x;st.m[3]=y}else st[drag]=[x,y];st.t=1;const sl=el.querySelector('input[type=range]');if(sl)sl.value=1;draw()});
    cv.addEventListener('pointerup',()=>drag=null);cv.style.touchAction='none';
    el.querySelectorAll('.vz-mat input').forEach(inp=>inp.addEventListener('input',()=>{const x=parseFloat(inp.value);if(!isNaN(x)){st.m[+inp.dataset.i]=x;draw()}}));
    const sl=el.querySelector('input[type=range]');if(sl)sl.addEventListener('input',()=>{st.t=+sl.value;draw()});
    new ResizeObserver(resize).observe(el.querySelector('.vz-stage'));resize();
    new MutationObserver(draw).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  }
  document.querySelectorAll('.viz[data-viz]').forEach(setup);
})();
