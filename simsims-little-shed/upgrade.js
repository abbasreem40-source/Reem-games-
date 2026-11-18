// Persistent family life, free flight, and camera improvements.
let thirdPerson=false,incubationStart=0,baby=null,offspring=[],history=[],outsideFlight=false,saveWarning=false,ambienceVolume=.3,effectsVolume=.7;
const roofs=[{name:'House above the garden',x:0,z:68,w:15,d:9,h:7.6},{name:'Home shed',x:0,z:0,w:8,d:10,h:3.41},{name:'Garden house',x:0,z:-25,w:8,d:5,h:7},{name:'West rooftop',x:-17,z:-25,w:7,d:5,h:7},{name:'East rooftop',x:17,z:-25,w:7,d:5,h:7},{name:'Far rooftop',x:17,z:-49,w:7,d:5,h:7}];
const originalUi=ui,originalRender=render,originalMove=move,originalPigeon=pigeon,originalGoFly=goFly,originalPerch=perch,originalWings=wings,originalStep=step;
let recordings={female:'',male:''};let cooFemale=new Audio(),cooMale=new Audio(),maleTimer=0;const activeSounds=new Set();
function playCoo(who,ambient=false){if(muted||paused||!started)return;if(!recordings[who]){cooSound(who==='male'?190:245,.7,ambient?ambienceVolume*.3:effectsVolume);return}const sound=(who==='male'?cooMale:cooFemale).cloneNode();sound.volume=ambient?ambienceVolume*.32:effectsVolume;sound.currentTime=0;activeSounds.add(sound);sound.onended=()=>activeSounds.delete(sound);sound.play().catch(()=>{activeSounds.delete(sound);if(!ambient)cooSound(who==='male'?190:245,.7)});const limit=who==='male'?5:6;sound.ontimeupdate=()=>{if(sound.currentTime>=limit){sound.pause();activeSounds.delete(sound)}};setTimeout(()=>{sound.pause();sound.currentTime=0;activeSounds.delete(sound)},limit*1000)}
function logEvent(text){history.push({at:Date.now(),text});history=history.slice(-100)}
function snapshot(){return {version:3,recordings,seeds,partner,egg,bonds,incubationStart,baby,offspring,history,thirdPerson,flightSeconds,flightCarry,ambienceVolume,effectsVolume,savedAt:Date.now()}}
save=function(){const data=snapshot();try{const json=JSON.stringify(data);localStorage.setItem('simsim3d',json);localStorage.setItem('simsim3d-backup',json);saveWarning=false;$('saveState').textContent='Saved on this browser · '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}catch{saveWarning=true;$('saveState').textContent='Browser save blocked — use Export save'}return data};
function restoreGame(data){if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Invalid save');seeds=Number.isFinite(data.seeds)?Math.max(0,Math.min(100000,data.seeds)):0;partner=birds.some(b=>b.name===data.partner&&b.sex==='male')?data.partner:null;bonds={};for(let b of birds){const n=Number(data.bonds?.[b.name]);if(Number.isFinite(n))bonds[b.name]=Math.max(0,Math.min(2,Math.floor(n)))}if(!partner){const found=birds.find(b=>b.sex==='male'&&bonds[b.name]>=2);if(found)partner=found.name}egg=!!data.egg&&!!partner;incubationStart=egg&&Number.isFinite(data.incubationStart)&&data.incubationStart>0?data.incubationStart:0;baby=data.baby&&/^#[0-9a-f]{6}$/i.test(data.baby.c)&&/^#[0-9a-f]{6}$/i.test(data.baby.wing)?{name:'Little Pip',c:data.baby.c,wing:data.baby.wing,pattern:Math.max(0,Math.min(1,+data.baby.pattern||0)),bornAt:+data.baby.bornAt||Date.now()}:null;recordings={female:typeof data.recordings?.female==='string'&&data.recordings.female.startsWith('data:audio/')?data.recordings.female:'',male:typeof data.recordings?.male==='string'&&data.recordings.male.startsWith('data:audio/')?data.recordings.male:''};offspring=Array.isArray(data.offspring)?data.offspring.filter(v=>v&&/^#[0-9a-f]{6}$/i.test(v.c)&&/^#[0-9a-f]{6}$/i.test(v.wing)&&Number.isFinite(+v.bornAt)).slice(0,20).map((v,i)=>({name:String(v.name||'Little Pip '+(i+1)).slice(0,40),c:v.c,wing:v.wing,pattern:Math.min(1,Math.max(0,+v.pattern||0)),bornAt:+v.bornAt,father:String(v.father||'')})):[];
if(baby&&!offspring.some(v=>v.bornAt===baby.bornAt))offspring.push({...baby,father:partner||''});
if(offspring.length&&!egg)partner=null;
if(recordings.female)cooFemale.src=recordings.female;if(recordings.male)cooMale.src=recordings.male;history=Array.isArray(data.history)?data.history.filter(v=>v&&typeof v.text==='string'&&Number.isFinite(v.at)).slice(-100):[];thirdPerson=!!data.thirdPerson;flightCarry=Number.isFinite(data.flightCarry)?Math.max(0,data.flightCarry%20):0;flightSeconds=Number.isFinite(data.flightSeconds)?Math.max(0,data.flightSeconds):0;ambienceVolume=Number.isFinite(data.ambienceVolume)?Math.max(0,Math.min(1,data.ambienceVolume)):.3;effectsVolume=Number.isFinite(data.effectsVolume)?Math.max(0,Math.min(1,data.effectsVolume)):.7;if(egg&&!incubationStart)incubationStart=Date.now();checkHatch();ui()}
function startIncubation(){if(!partner||egg)return;egg=true;incubationStart=Date.now();logEvent('Partnered with '+partner+'; incubation started');save()}
function mixFeathers(a,b){const ca=rgb(a),cb=rgb(b);return '#'+ca.map((v,i)=>Math.round((v*.55+cb[i]*.45)*255).toString(16).padStart(2,'0')).join('')}
function checkHatch(now=Date.now()){
 if(!egg||!partner||!incubationStart||now-incubationStart<1800000)return;
 const dad=birds.find(b=>b.name===partner);if(!dad)return;
 const child={name:offspring.length?'Little Pip '+(offspring.length+1):'Little Pip',
  c:mixFeathers('#d7dfe0',dad.c),wing:mixFeathers('#a3afb4',dad.wing),
  pattern:(.35+(dad.pattern||0))/2,bornAt:now,father:partner};
 offspring.push(child);baby=child;egg=false;incubationStart=0;
 const oldMate=partner;partner=null;
 logEvent(child.name+' hatched with '+oldMate+' as father');
 toast(child.name+' hatched! You can find another mate now.');
 save();ui();
}
ui=function(){originalUi();$('view').textContent=thirdPerson?'First person [V]':'Third person [V]';$('fly').innerHTML=isFlying()?'Go to trap [F]':'Take off [F]';if(isFlying())$('place').textContent=(outsideFlight?'Flying above Woodingdean':'Flying inside the shed')+' · '+Math.max(0,cam.y-.44).toFixed(1)+' m';if(mode==='garden'){$('place').textContent='Exploring the terraced garden';$('fly').textContent='Take off [F]'}if(mode==='manShoulder'||mode==='manLap'){$('place').textContent=mode==='manShoulder'?'On his shoulder':'On his lap';$('fly').textContent='Take off [F]'}if(mode==='localRoof'){$('place').textContent='Resting on a neighbourhood rooftop';$('perch').textContent='Return to home roof [P]'}if(!egg&&offspring.length)$('bond').textContent=(partner?'Partner: '+partner+' · ':'')+offspring.length+' chick(s) · '+offspring.filter(v=>Date.now()-v.bornAt>=86400000).length+' in the flock';else if(egg&&incubationStart){let seconds=Math.max(0,Math.ceil((1800000-(Date.now()-incubationStart))/1000));$('bond').textContent=partner+' is sitting on your egg · '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')}if(mode==='box')$('nest').textContent='Leave our box [B]'};
function isFlying(){return mode==='air'||mode==='lap'||mode==='landing'||!!motion?.flying}
function toggleView(){thirdPerson=!thirdPerson;save();ui()}
function viewCamera(){if(!thirdPerson)return cam;let distance=(mode==='box'?.65:outsideFlight?2.6:1.3),x=cam.x-Math.sin(cam.yaw)*distance,z=cam.z-Math.cos(cam.yaw)*distance,y=cam.y+.6;if(!outsideFlight&&mode!=='roof'&&mode!=='localRoof'){x=Math.max(-3.7,Math.min(3.7,x));z=Math.max(-4.75,Math.min(4.65,z));y=Math.min(2.95,y)}return {x,y,z}}
goFly=function(){if(motion)return;
  if(['garden','manShoulder','manLap'].includes(mode)){
    mode='air';outsideFlight=true;cam.y+=.4;
    toast('Flying outside. Press L to land, J for his shoulder or K for his lap.');
    ui();return;
  }
  if(mode==='box')return toast('B to leave your nesting box first.');if(mode==='air'){if(!outsideFlight){mode='floor';originalGoFly()}else landNear();return}outsideFlight=mode==='roof'||mode==='localRoof';mode='air';cam.y+=.25;toast('You control flight: W/S forward/back, A/D sideways, arrows ↑↓ height and ←→ turn. L to land.');ui()};
function surfaceAt(x,z){let found=null;for(let r of roofs)if(Math.abs(x-r.x)<r.w/2&&Math.abs(z-r.z)<r.d/2)found=r;return found}

// A lightweight terraced-garden collision surface. The shed stays at height zero.
function gardenHeight(x,z){
  if(Math.abs(x)>15 || z<8 || z>63)return null;
  if(z<13)return 0;
  if(z<18)return Math.min(.8,Math.max(0,Math.floor((z-13)/.9+1)*.14));
  if(z<43)return .8;
  if(z<48)return .8+Math.min(.8,Math.max(0,Math.floor((z-43)/.9+1)*.14));
  return 1.6;
}
function manPerch(which){
  if(motion || mode!=='air' || !outsideFlight)return toast('Fly outside near the tea-drinking man first.');
  if(Math.hypot(cam.x-5,cam.z-9)>5 || cam.y>7)
    return toast('Fly closer to the man by the bench.');
  const shoulder=which==='shoulder';
  const point=shoulder?{x:4.54,y:1.88,z:9.03}:{x:5,y:1.1,z:8.72};
  travel(point,1.15,()=>{
    mode=shoulder?'manShoulder':'manLap';
    outsideFlight=true;
    toast(shoulder?'Settled on his shoulder. Press F to take off.':'Settled on his lap. Press F to take off.');
    ui();
  });
}
function landNear(){if(motion)return;if(!outsideFlight){const near=perches.find(p=>Math.hypot(p.x-cam.x,p.z-cam.z)<.9&&Math.abs(cam.y-(p.y+.44))<.9);if(near){travel({x:3.35,y:near.y+.44,z:near.z},.8,()=>{mode='perch';ui()})}else travel({x:Math.max(-2.8,Math.min(3,cam.x)),y:.44,z:Math.max(-3.7,Math.min(4.4,cam.z))},1,()=>{mode='floor';ui()});return}const height=gardenHeight(cam.x,cam.z);
  if(mode==='air' && height!==null && cam.y<14){
    const target={x:cam.x,y:height+.44,z:cam.z};
    toast(height>1.3?'Landing on the patio…':height>.4?'Landing on the lawn…':'Landing by the shed…');
    travel(target,Math.max(.7,Math.min(2,Math.abs(cam.y-target.y)/4)),()=>{
      mode='garden';outsideFlight=true;ui();
    });
    return;
  }
  let r=roofs.find(r=>Math.hypot(cam.x-r.x,cam.z-r.z)<Math.max(r.w,r.d)/2+5);if(!r)return toast('Fly closer to a gold-marked rooftop. R returns you home.');toast('Landing on '+r.name+'…');travel({x:r.x,y:r.h+.44,z:r.z},2,()=>{mode=r.name==='Home shed'?'roof':'localRoof';outsideFlight=true;logEvent('Landed on '+r.name);save();ui()})}
function returnHome(){if(motion)return;if(!outsideFlight){originalGoFly();return}toast('Flying back to your shed…');mode='landing';const lift=Math.max(12,cam.y);travel({x:cam.x,y:lift,z:cam.z},1,()=>travel({x:0,y:lift,z:2.6},3,()=>travel({x:0,y:3.85,z:2.6},2,()=>{mode='roof';cam.yaw=Math.PI;cam.pitch=-.1;outsideFlight=true;ui()})))}
perch=function(){if(mode==='localRoof')return returnHome();if(mode==='air')return landNear();originalPerch()};
nest=function(){if(motion)return;if(!partner&&!offspring.some(c=>Date.now()-c.bornAt<86400000))return toast('Form a partnership to unlock a nest.');if(mode==='box'){travel({x:-.8,y:.44,z:-2.8},2,()=>{mode='floor';ui()});return}if(outsideFlight||mode==='air')return toast('Return inside and land before visiting your family.');travel({x:-1.1,y:2.25,z:-3.78},2.5,()=>{mode='box';cam.yaw=Math.PI;cam.pitch=-.07;toast(egg&&partner?partner+' is keeping your egg warm.':offspring.some(c=>Date.now()-c.bornAt<86400000)?'Your little chicks are resting here.':'A quiet nesting box.');ui()})};
move=function(dt){
  if(mode==='garden'&&!motion){
    cam.yaw+=((keys.arrowright?1:0)-(keys.arrowleft?1:0))*dt*1.4;
    const f=(keys.w?1:0)-(keys.s?1:0),st=(keys.d?1:0)-(keys.a?1:0);
    const n=Math.max(1,Math.hypot(f,st)),v=dt*1.5/n;
    const nx=Math.max(-14.4,Math.min(14.4,cam.x+(Math.sin(cam.yaw)*f+Math.cos(cam.yaw)*st)*v));
    const nz=Math.max(8,Math.min(62.8,cam.z+(Math.cos(cam.yaw)*f-Math.sin(cam.yaw)*st)*v));
    cam.x=nx;cam.z=nz;cam.y=gardenHeight(nx,nz)+.44;
    return;
  }
  if(mode==='manShoulder'||mode==='manLap')return;
  if(mode!=='air')return originalMove(dt);if(motion)return;cam.yaw+=((keys.arrowright?1:0)-(keys.arrowleft?1:0))*dt*1.4;let f=(keys.w?1:0)-(keys.s?1:0),s=(keys.d?1:0)-(keys.a?1:0),u=(keys.arrowup||keys[' ']?1:0)-(keys.arrowdown||keys.shift?1:0),speed=outsideFlight?9:1.8,n=Math.max(1,Math.hypot(f,s));let nx=cam.x+(Math.sin(cam.yaw)*f+Math.cos(cam.yaw)*s)*speed*dt/n,nz=cam.z+(Math.cos(cam.yaw)*f-Math.sin(cam.yaw)*s)*speed*dt/n,ny=Math.max(.5,Math.min(65,cam.y+u*dt*(outsideFlight?5:1.5)));if(!outsideFlight){if(nz>=4.9&&nx>-3.55&&nx<-2.65&&ny>2.15&&ny<2.8){outsideFlight=true;toast('Through the pigeon trap. The sky is yours!')}else{nx=Math.max(-2.85,Math.min(3.3,nx));nz=Math.max(-3.72,Math.min(4.85,nz));ny=Math.min(2.95,ny)}if(nx>-.98&&nx<1.25&&nz>-2.55&&nz<-1.05&&ny<1.25){nx=cam.x;nz=cam.z}}else{let inside=Math.abs(nx)<4&&Math.abs(nz)<5&&ny<3.7;if(inside){if(cam.z>=4.9&&nz<5&&nx>-3.55&&nx<-2.65&&ny>2.15&&ny<2.8){outsideFlight=false;toast('Back through the trap. L to land.')}else{nx=cam.x;nz=cam.z;ny=Math.max(ny,3.9)}}for(let r of roofs){if(Math.abs(nx-r.x)<r.w/2&&Math.abs(nz-r.z)<r.d/2&&ny<r.h+.48){if(cam.y>=r.h+.45)ny=r.h+.48;else{nx=cam.x;nz=cam.z}}}if(Math.abs(nx)>105||nz<-100||nz>90){nx=cam.x;nz=cam.z;toast('Stay close to home. R returns to the shed.')}}cam.x=nx;cam.y=ny;cam.z=nz;consumeFlight(dt)};
animateBirds=function(dt){for(let [i,b] of birds.entries()){if(b.name===partner&&egg&&!isFlying()){b.x=-.75;b.y=1.87;b.z=-4.25;b.walking=false;b.flying=false;continue}if(!b.goal||time>b.until){let p=perches[i%4];b.from={x:b.x,y:b.y||0,z:b.z};b.goal=rand()<.15?{x:p.x-.06,y:p.y+.04,z:p.z}:{x:-2.5+rand()*5,y:0,z:-3.3+rand()*6.5};b.travelTime=0;b.until=time+7+rand()*10;b.flying=(b.y||0)>.1||b.goal.y>.1}if(b.timid&&mode==='floor'&&Math.hypot(b.x-cam.x,b.z-cam.z)<1){b.goal={x:Math.max(-2.6,Math.min(2.6,b.x+(b.x-cam.x))),y:0,z:Math.max(-3.4,Math.min(3.4,b.z+b.z-cam.z))}}let dx=b.goal.x-b.x,dz=b.goal.z-b.z,dist=Math.hypot(dx,dz);b.heading=Math.atan2(dx,dz);if(b.flying){b.travelTime+=dt;let f=Math.min(1,b.travelTime/1.4),ease=f*f*(3-2*f);b.x=b.from.x+(b.goal.x-b.from.x)*ease;b.z=b.from.z+(b.goal.z-b.from.z)*ease;b.y=b.from.y+(b.goal.y-b.from.y)*ease+Math.sin(f*Math.PI)*.35;if(f===1){b.y=b.goal.y;b.flying=false;b.walking=false;b.until=time+4}}else if((b.y||0)<.1&&dist>.05){let speed=b.timid?.7:.42,step=Math.min(dist,speed*dt),nx=b.x+dx/dist*step,nz=b.z+dz/dist*step;if(nx>-.98&&nx<1.25&&nz>-2.55&&nz<-1.05){b.goal={x:2,y:0,z:b.z};b.until=time+2}else{b.x=nx;b.z=nz}b.y=0;b.walking=true;b.gait=(b.gait||0)+dt*11}else b.walking=false}};
pigeon=function(b,t,scale=1){const start=geo.length;originalPigeon(b,t,scale);if(b.flying){for(let side of [-1,1]){let lift=Math.sin(t*18)*.17;ell(b.x+side*.3,(b.y||0)+.38+lift,b.z,.29,.045,.17,b.wing)}}let angle=b.heading||0,c=Math.cos(angle),s=Math.sin(angle),small=b.chick?.48:1;for(let j=start;j<geo.length;j+=6){let x=(geo[j]-b.x)*small,z=(geo[j+2]-b.z)*small;geo[j]=b.x+x*c+z*s;geo[j+2]=b.z+z*c-x*s;geo[j+1]=(b.y||0)+(geo[j+1]-(b.y||0))*small}if((b.y||0)<.1)ell(b.x,.009,b.z,.2,.004,.3,'#67705c')};
function familyGeometry(){
 for(let i=0;i<offspring.length;i++){
  const child=offspring[i];
  if(Date.now()-child.bornAt>=86400000){
   if(!birds.some(b=>b.familyBirth===child.bornAt)){
    birds.push({name:child.name,c:child.c,wing:child.wing,pattern:child.pattern,
     sex:'unknown',x:-1+rand()*2,z:-2+rand()*3,familyBirth:child.bornAt});
   }
  }else pigeon({...child,x:-.72+(i%3)*.23,y:1.87,z:-4.21,chick:true},time);
 }
}
coo=function(){
 if(motion||mode!=='floor')return toast('Find a pigeon on the shed floor to coo.');
 const b=findBird();if(!b)return toast('Look towards a nearby pigeon, then coo.');
 if(b.sex!=='male'){cooSound(230,.55);return toast(b.name+' listens. Find a male to form a partnership.')}
 if(partner)return toast(partner===b.name?'Your mate coos back.':'You already have a mate: '+partner);
 if(time<cooCooldown)return toast('Give him a moment before cooing again.');
 cooCooldown=time+8;playCoo('female');
 if(Math.random()<.65){
  bonds[b.name]=Math.min(2,(Number(bonds[b.name])||0)+1);
  setTimeout(()=>playCoo('male'),Math.min(5000,(Number.isFinite(cooFemale.duration)?cooFemale.duration:2)*1000+300));
  if(bonds[b.name]>=2){
   partner=b.name;startIncubation();
   toast(b.name+' is your new mate! Fly together or visit your nest.');
  }else toast(b.name+' coos back! '+bonds[b.name]+'/2 successful exchanges.');
 }else toast(b.name+' looks away. Try again.');
 save();ui();
};
wings=function(){if(mode!=='air')return originalWings();const prior=mode;mode='lap';originalWings();mode=prior};
const flockAnimate=animateBirds;
animateBirds=function(dt){
 flockAnimate(dt);
 if(!partner||!isFlying())return;
 const mate=birds.find(b=>b.name===partner);if(!mate)return;
 const targetX=cam.x+Math.cos(cam.yaw)*1.0-Math.sin(cam.yaw)*.45;
 const targetZ=cam.z-Math.sin(cam.yaw)*1.0-Math.cos(cam.yaw)*.45;
 const targetY=cam.y-.33+Math.sin(time*8)*.05;
 const f=Math.min(1,dt*5);
 mate.x+=(targetX-mate.x)*f;mate.z+=(targetZ-mate.z)*f;
 mate.y=(mate.y||0)+(targetY-(mate.y||0))*f;
 mate.flying=true;mate.walking=false;mate.heading=cam.yaw;
};
step=function(dt){originalStep(dt);if(!started||paused)return;if(!motion&&['floor','perch','box'].includes(mode))outsideFlight=false;if(mode==='roof'||mode==='localRoof')outsideFlight=true;checkHatch();if(mode==='air'&&time>nextFlap){flap();nextFlap=time+.27}if(time>backgroundAt){playCoo(rand()>.5?'male':'female',true);backgroundAt=time+7+rand()*9}if(time>flutterAt){if(rand()>.5)flap(true);flutterAt=time+5+rand()*10}if(time>autoSaveAt){save();autoSaveAt=time+5}};let backgroundAt=6,flutterAt=4,autoSaveAt=5;
// Clearer garden, paths, planted borders, roof terraces, and soft clouds.
geo=[];for(let z=-14;z<14;z+=.6){box(5.5,.025,z,1.15,.06,.55,'#c2b89e');box(-6.9,.05,z,1.2,.1,.55,'#75684d');for(let k=0;k<3;k++)ell(-6.9+(k-1)*.3,.24+rand()*.15,z,.18,.25,.2,k%2?'#8a9b66':'#b6a27c')}box(0,-.02,10,17,.03,8,'#93a878');for(let x of [-8.4,8.4])for(let z=-13;z<14;z+=1.3)ell(x,.9,z,.5,.85,.7,'#6b845a');box(5,.45,9,2,.12,.7,'#9f8463');for(let x of [4.2,5.8])box(x,.2,9,.1,.5,.1,'#806f51');for(let r of roofs.slice(1)){box(r.x,r.h-.07,r.z,r.w,.14,r.d,'#8c8074');for(let x of [-1,1])box(r.x+x*r.w/2,r.h+.13,r.z,.1,.35,r.d,'#9a8e7e');ell(r.x,r.h+.015,r.z,.65,.012,.65,'#d7bf76');ell(r.x,r.h+.03,r.z,.48,.01,.48,'#8c8074')}for(let i=0;i<17;i++){let x=-95+rand()*190,z=-90+rand()*180,y=45+rand()*18;for(let j=0;j<4;j++)ell(x+j*2,y+Math.sin(j)*1.1,z,4,1.5,2.6,'#e7e8df')}for(let z=-33;z>-40;z-=.9)box(0,.07,z,.17,.02,.4,'#d8d0b2');

/* GARDEN BENCH AND TEA-DRINKING MAN — lightweight fixed geometry */
box(5,.45,9,2.4,.11,.75,'#87694d');
for(const zz of [9.28,9.36])box(5,1.05,zz,2.3,.11,.06,'#92704e');
for(const xx of [3.98,6.02]){
 box(xx,.24,9,.12,.48,.12,'#69523e');
 box(xx,.7,9,.12,.1,.78,'#806248');
}
for(const xx of [4.78,5.2]){
 ell(xx,.54,8.78,.19,.14,.36,'#85898a');
 ell(xx+(xx<5?.07:-.07),.31,8.48,.13,.27,.14,'#818585');
 ell(xx+(xx<5?.07:-.07),.1,8.35,.16,.095,.23,'#594438');
}
ell(5,1.07,9,.44,.46,.26,'#74787b');
box(5,1.08,8.735,.022,.57,.018,'#d1d0cc');
for(const xx of [4.7,5.3]){
 ell(xx,1.35,9,.16,.13,.21,'#677354');
 ell(xx,1.37,8.84,.07,.06,.055,'#8b8268');
 ell(xx+(xx<5?-.17:.17),1.03,8.98,.12,.28,.15,'#767b7b');
}
ell(5,1.72,9,.235,.285,.22,'#c39473');
ell(5,1.565,8.853,.17,.055,.075,'#816d60');
for(const xx of [4.87,5.13]){
 ell(xx,1.62,8.855,.06,.08,.05,'#8a7467');
 ell(xx,1.76,8.788,.026,.022,.013,'#352e29');
}
ell(5,1.665,8.776,.043,.064,.047,'#ba896b');
ell(5,1.545,8.82,.077,.024,.023,'#a47766');
ell(5,1.995,9,.54,.043,.4,'#c3a77d');
ell(5,2.15,9,.31,.205,.285,'#c6ae86');
for(let i=0;i<12;i++){
 const a=i*Math.PI*2/12;
 ell(5+Math.cos(a)*.305,2.055,9+Math.sin(a)*.28,.035,.022,.027,i%2?'#77543b':'#98744d');
}
ell(5.46,.99,8.93,.12,.23,.12,'#777d7d');
rod([5.45,.88,8.87],[5.7,.9,8.61],.08,'#777d7d');
ell(5.71,.91,8.58,.1,.09,.09,'#c39473');
box(5.78,.99,8.54,.17,.17,.17,'#d5d1bf');
ell(5.78,1.08,8.54,.074,.01,.074,'#895535');

// Colourful flowers near the bench
for (let i = 0; i < 24; i++) {
  let x = 3.2 + rand() * 3.7;
  let z = 10.1 + rand() * 2.5;

  rod([x, 0.05, z], [x, 0.35, z], 0.018, '#487B43');

  ell(
    x, 0.38, z,
    0.11, 0.09, 0.11,
    i % 3 === 0 ? '#F1C96A' :
    i % 3 === 1 ? '#E8A5BF' : '#C7A1E8'
  );
}


// Fixed lightweight outdoor scenery inspired by the real terraced garden photos.
// All geometry below is built once, never regenerated per animation frame.
const earth='#809e68',stone='#b5afa2';
for(let i=0;i<6;i++){
  const zz=13+i*.82,top=.13*(i+1);
  box(0,top/2,zz,4,top,.81,stone);
  box(0,top+.012,zz,4,.025,.09,'#938e80');
}
box(0,.36,30.5,30,.72,25,'#8ba974');
for(let i=0;i<6;i++){
  const zz=43+i*.82,top=.8+.13*(i+1);
  box(0,top/2,zz,4,top,.8,stone);
  box(0,top+.013,zz,4,.022,.09,'#928c81');
}
box(0,.79,55,30,1.58,14,'#bcb5a7');
for(let i=0;i<8;i++)box(-13+i*3.7,1.6,55,.035,.01,14,'#a09b8e');
for(let i=0;i<5;i++)box(0,1.605,49+i*2.8,29,.01,.034,'#9c968c');
// The house occupies the upper end of the patio.
box(0,4.05,68,15,4.9,9,'#a87761');
box(0,6.55,68,15,.28,9,'#745f52');
for(const xx of [-5,-2.3,2.3,5]){
  box(xx,4.8,63.48,1.5,1.65,.06,'#cbd5d3');
  box(xx,4.8,63.42,.055,1.7,.065,'#f3ede3');
}
box(0,3.2,63.4,2.1,3,.06,'#495952');
box(0,7.1,68,15.9,.13,9.8,'#78685e');
box(5.4,8.0,70,1.3,2.2,1.3,'#816a5d');
// Stone balustrade sections and small lanterns beside each flight of steps.
for(const zz of [12.6,43]){
  for(const xx of [-3.5,3.5]){
    box(xx,.6+(zz>40?.8:0),zz,.42,1.15,.44,stone);
    box(xx,1.22+(zz>40?.8:0),zz,.55,.12,.55,'#dfd7c7');
    box(xx,1.5+(zz>40?.8:0),zz,.17,.43,.17,'#414b4d');
    ell(xx,1.77+(zz>40?.8:0),zz,.18,.08,.18,'#474f50');
  }
}
// Clipped shrubs on the lawn borders and a few taller trees.
for(let i=0;i<10;i++){
  const zz=19+i*2.35;
  for(const xx of [-14,14])ell(xx,.8+(.45+i%3*.12),zz,.72,.7,.8,
    i%2?'#4e714e':'#628158');
}
for(const [xx,zz] of [[-16,19],[16,29],[-17,39],[17,51]]){
  box(xx,1.7,zz,.32,3,.32,'#72664c');
  ell(xx,3.7,zz,1.45,1.85,1.5,'#53734f');
}
// Coarse sea horizon in the distance, without thousands of water polygons.
box(0,-.7,-158,300,.08,33,'#83adb9');
const details=upload(geo);geo=[];
window.addEventListener('keydown',e=>{
  if(!started||paused||e.repeat)return;
  if(e.key.toLowerCase()==='j')manPerch('shoulder');
  if(e.key.toLowerCase()==='k')manPerch('lap');
});
$('shoulder').onclick=()=>manPerch('shoulder');$('lapSeat').onclick=()=>manPerch('lap');$('coo').onclick=coo;$('view').onclick=toggleView;$('land').onclick=landNear;$('home').onclick=returnHome;$('fly').onclick=goFly;$('perch').onclick=perch;$('nest').onclick=nest;
$('backup').onclick=()=>{const blob=new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Simsim-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('Save exported. Keep this file to restore on another browser.')};$('restore').onclick=()=>$('saveFile').click();$('saveFile').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;restoreGame(JSON.parse(await file.text()));save();toast('Your partner, family and progress have been restored.')}catch{toast('That save could not be read. Your current game has been kept.')}e.target.value=''};
$('ambience').oninput=e=>{ambienceVolume=+e.target.value;save()};$('effects').oninput=e=>{effectsVolume=+e.target.value;save()};window.addEventListener('keydown',e=>{if(!started||paused||e.repeat)return;({v:toggleView,l:landNear,r:returnHome})[e.key.toLowerCase()]?.()});window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden){save();activeSounds.forEach(s=>s.pause())}});
const soundClick=$('sound').onclick;$('sound').onclick=()=>{soundClick();if(muted)activeSounds.forEach(s=>s.pause())};
try{let raw=localStorage.getItem('simsim3d')||localStorage.getItem('simsim3d-backup');if(raw)restoreGame(JSON.parse(raw))}catch{toast('Could not load browser save. Import a backup if you have one.')}if(partner&&!egg&&!offspring.length)startIncubation();$('ambience').value=ambienceVolume;$('effects').value=effectsVolume;save();ui();
nextCoo=Infinity;requestAnimationFrame(frame);

for(const who of ['female','male']){$(who+'Load').onclick=()=>$(who+'Audio').click();$(who+'Audio').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(file.size>3000000)return toast('Please choose a clip smaller than 3 MB.');const reader=new FileReader();reader.onload=()=>{const raw=String(reader.result),base64=raw.slice(raw.indexOf(',')+1);recordings[who]='data:audio/mp4;base64,'+base64;(who==='male'?cooMale:cooFemale).src=recordings[who];save();toast((who==='male'?'Male reply':'Simsim coo')+' loaded and saved. Male playback stops at five seconds.')};reader.readAsDataURL(file)}}
