
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,signInAnonymously} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getDatabase,ref,get,set,onValue,update,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';
import {firebaseConfig} from './firebase-config.js';

const appEl=document.getElementById('app');
const statusEl=document.getElementById('status');
const words=[
['Schwimmen','swimming'],['Rugby','rugby'],['Skifahren','skiing'],
['Kanufahren','canoeing'],['Netball','netball'],['Rafting','rafting'],
['Basketball','basketball'],['Gegenteil von big','small'],
['Gegenteil von quiet','loud'],['Gegenteil von quick','slow'],
['Gegenteil von interesting','boring'],['Gegenteil von safe','dangerous'],
['Gegenteil von easy','difficult|hard'],['Gegenteil von good','bad'],
['Gegenteil von fit','unfit'],['Rugby is a fast and ... sport','tough'],
['There are trees in the ...','wood|woods'],
["Let's take a ... to the mountains",'trip'],
['You can ... up a mountain','climb'],
['You have to learn the ...','rules'],
['Freiluft-','outdoor'],['gefährlich','dangerous'],
['Ausrüstung','equipment'],['sicher','safe'],
['geduldig','patient'],['begabt','talented'],
['leistungsorientiert','competitive'],['erfolgreich','successful'],
['frech','cheeky'],['erschöpft','exhausted'],
['Pflaster','plaster'],['Verband','bandage'],
['Krankenwagen','ambulance'],['Zahn','tooth'],
['Tablette / Medizin','tablet|medicine'],['Gipsverband','cast'],
['There has been an ...','accident'],
['My finger started to ...','bleed'],
['Part of your leg','knee'],
['... your ankle','sprain|twist|hurt'],
["Don't ... your hand",'burn'],
['... services in the UK','emergency'],
['You ... an accident','have'],
['You ... the operator','call'],
['You ... your name','give'],
['You ... where you are','say'],
['You ... the hurt person','stay with'],
['You ... a person to hospital','take'],
['Polizei','police'],['Feuerwehr','fire brigade'],
['Rettungsdienst','ambulance'],['Küstenwache','coastguard']
];

let db,uid,code='',role='',room=null,unsubscribe=null,busy=false;
const clean=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const path=p=>ref(db,'battle2Rooms/'+code+(p?'/'+p:''));
const slots=()=>Object.entries(room?.slots||{}).sort(([a],[b])=>+a-+b);
const button=(label,action)=>`<button data-action="${action}">${label}</button>`;
function message(t){statusEl.textContent=t}
function home(){
 appEl.innerHTML=`<div class="panel"><h2>Battle 2</h2>
 ${button('👨‍⚖️ Als Schiedsrichter erstellen','create')}
 <p>Spielcode</p><input id="roomcode" maxlength="6">
 <p>Spielername</p><input id="playername" maxlength="24">
 <p>${button('🎮 Beitreten','join')}</p></div>`;
}
function render(){
 if(!room){home();return}
 const m=room.meta||{},host=role==='host',players=slots();
 let html=`<div class="panel"><p>Raum: <strong>${esc(code)}</strong></p>`;
 if(m.stage==='lobby'){
  html+=`<h2>Warteraum (${players.length}/4)</h2>`;
  html+=players.map(([n,p])=>`<p>${n}. ${esc(p.name)}</p>`).join('');
  html+=host?button('🚀 Starten','start'):'<p>Warte auf den Schiedsrichter.</p>';
 }else if(m.stage==='playing'){
  html+=`<h2>52 Aufgaben</h2>`;
  if(host){
   html+=`<p>${players.length} Spieler nehmen teil.</p>`;
   html+=button('🏁 Battle beenden und auswerten','finish');
  }else{
   const saved=room.submissions?.[uid];
   if(saved){
    html+='<p>✅ Antworten abgegeben. Warte auf den Schiedsrichter.</p>';
   }else{
    html+='<form id="answersForm">';
    words.forEach(([question],i)=>{
     html+=`<div class="player"><label>${i+1}. ${esc(question)}
     <input name="q${i}" autocomplete="off" spellcheck="false"></label></div>`;
    });
    html+='<button type="submit">✅ Antworten abgeben</button></form>';
   }
  }
 }else if(m.stage==='done'){
  html+='<h2>🏆 Ergebnisse</h2>';
  const ranking=players.map(([,p])=>p).sort((a,b)=>(b.score||0)-(a.score||0));
  html+=ranking.map((p,i)=>`<p>${i+1}. ${esc(p.name)} – ${p.score||0}/52</p>`).join('');
  html+=host?button('🔄 Neues Spiel','restart'):'';
 }
 html+='</div>';
 appEl.innerHTML=html;
}
async function connect(c,r){
 unsubscribe?.();code=c;role=r;
 localStorage.setItem('vb2session',JSON.stringify({code,role}));
 unsubscribe=onValue(path(''),s=>{
  room=s.val();
  if(room)render();else{room=null;home()}
 },e=>message('Verbindungsfehler: '+e.message));
}
async function create(){
 let chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
 let c=Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>chars[n%chars.length]).join('');
 code=c;
 await set(path('meta'),{hostUid:uid,stage:'lobby'});
 await connect(c,'host');message('Raum erstellt.');
}
async function join(){
 const c=document.getElementById('roomcode').value.trim().toUpperCase();
 const name=document.getElementById('playername').value.trim();
 if(!/^[A-Z2-9]{6}$/.test(c)||!name)throw Error('Spielcode und Namen eingeben.');
 code=c;
 const meta=(await get(path('meta'))).val();
 if(!meta||meta.stage!=='lobby')throw Error('Raum nicht gefunden oder Spiel läuft.');
 for(let i=1;i<=4;i++){
  const r=await runTransaction(path('slots/'+i),old=>old===null?{uid,name,score:0}:undefined,{applyLocally:false});
  if(r.committed||r.snapshot.val()?.uid===uid){
   await connect(c,'player');return;
  }
 }
 throw Error('Alle Plätze sind belegt.');
}
async function start(){
 if(role!=='host'||slots().length<1)throw Error('Vier Spieler müssen beitreten.');
 await update(path('meta'),{stage:'playing'});
}
async function submit(form){
 if(role!=='player'||room?.meta?.stage!=='playing')return;
 if(room.submissions?.[uid])return;
 const answers=words.map((_,i)=>form.elements['q'+i].value.trim());
 await set(path('submissions/'+uid),{answers,at:serverTimestamp()});
 message('Antworten online abgegeben.');
}
async function finish(){
 if(role!=='host'||busy||room.meta.stage!=='playing')return;
 busy=true;
 try{
  const latest=(await get(path(''))).val();
  const changes={};
  for(const [n,p] of Object.entries(latest.slots||{})){
   const answers=latest.submissions?.[p.uid]?.answers||[];
   let score=0;
   words.forEach(([,expected],i)=>{
    if(expected.split('|').some(x=>clean(x)===clean(answers[i])))score++;
   });
   changes['slots/'+n+'/score']=score;
  }
  changes['meta/stage']='done';
  await update(path(''),changes);
 }finally{busy=false}
}
async function restart(){
 if(role!=='host')return;
 const changes={'meta/stage':'lobby','submissions':null};
 slots().forEach(([n])=>changes['slots/'+n+'/score']=0);
 await update(path(''),changes);
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-action]');
 if(!b)return;
 b.disabled=true;
 try{
  const a=b.dataset.action;
  if(a==='create')await create();
  if(a==='join')await join();
  if(a==='start')await start();
  if(a==='finish')await finish();
  if(a==='restart')await restart();
 }catch(err){message('Fehler: '+err.message)}
 finally{if(b.isConnected)b.disabled=false}
});
document.addEventListener('submit',async e=>{
 if(e.target.id!=='answersForm')return;
 e.preventDefault();
 const b=e.target.querySelector('button');
 b.disabled=true;
 try{await submit(e.target)}
 catch(err){message('Fehler: '+err.message);b.disabled=false}
});
try{
 const app=initializeApp(firebaseConfig);
 const auth=getAuth(app);
 db=getDatabase(app);
 await signInAnonymously(auth);
 uid=auth.currentUser.uid;
 const session=JSON.parse(localStorage.getItem('vb2session')||'null');
 if(session?.code){
  code=session.code;
  const snap=(await get(path(''))).val();
  const valid=snap&&(session.role==='host'
   ?snap.meta?.hostUid===uid
   :Object.values(snap.slots||{}).some(p=>p.uid===uid));
  if(valid)await connect(code,session.role);
  else home();
 }else home();
 message('Online verbunden.');
}catch(err){message('Verbindung fehlgeschlagen: '+err.message)}
