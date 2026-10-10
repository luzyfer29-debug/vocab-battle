import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {getAuth,signInAnonymously,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {getDatabase,ref,onValue,get,set,update,runTransaction,remove,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';
import {firebaseConfig} from './firebase-config.js';
import {BATTLES} from './questions.js';
const app=document.querySelector('#app'), status=document.querySelector('#status');
const names=['Luca','Semir','Talea','Nele'];
let db,uid='',code='',role='',slot='',room=null,unsubscribe=null,solo=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(t,fn,cl='')=>`<button ${cl?`class="${cl}"`:''} data-action="${fn}">${t}</button>`;
const card=s=>`<section class="card">${s}</section>`;
const msg=(s,bad=false)=>status.innerHTML=`<p class="${bad?'error':'good'}">${esc(s)}</p>`;
const key='vb2solo';
function home(){if(unsubscribe){unsubscribe();unsubscribe=null;}code='';role='';slot='';room=null;solo=null;status.textContent='';app.innerHTML=card(`<h2>Was möchtest du machen?</h2><div class="buttons">${btn('🎮 Schiedsrichter','host')}${btn('👥 Spiel beitreten','join')}${btn('📚 Alleine lernen','solo')}</div>`)+card('<p class="muted">Für ein Battle öffnet der Schiedsrichter einen Raum. Spieler treten mit dem Raumcode bei. Solo-Training funktioniert auf einem einzigen Handy.</p>');}
function listen(){if(unsubscribe)unsubscribe();unsubscribe=onValue(ref(db,`rooms/${code}`),snap=>{room=snap.val();if(!room){msg('Raum nicht gefunden oder gelöscht.',true);return;}render();},e=>msg('Firebase-Zugriff verweigert: '+e.message,true));}
function current(){const b=Number(room?.meta?.battle||1)-1;return BATTLES[b]?.[Number(room?.meta?.index||0)];}
function players(){return Object.entries(room?.slots||{}).map(([id,p])=>({id,...p})).sort((a,b)=>(b.score||0)-(a.score||0));}
function roster(){return players().map((p,i)=>`<div class="player row"><span>${i+1}. ${esc(p.name)}</span><span class="score">${p.score||0}</span></div>`).join('')||'<p>Noch keine Spieler.</p>';}
function render(){if(!room)return;const m=room.meta||{},q=current(),stage=m.stage||'lobby';let s=card(`<p class="muted">Raumcode</p><div class="big">${esc(code)}</div><p>Battle ${m.battle||1} von 3 · ${stage==='lobby'?'Warteraum':stage==='question'?`Frage ${Number(m.index||0)+1} von 30`:stage==='reveal'?'Auswertung':'Battle beendet'}</p>${roster()}`);
if(role==='host'){
 if(stage==='lobby')s+=card(`<h2>Schiedsrichter</h2><p>Starte, sobald mindestens ein Spieler beigetreten ist.</p>${btn('▶️ Battle starten','start')}`);
 if(stage==='question'){const a=room.answers?.[m.index]||{};s+=card(`<h2>Frage ${Number(m.index)+1}</h2><p>${esc(q?.q||'')}</p><p>Antworten: ${Object.keys(a).length} von ${players().length}</p>${btn('Antworten auflösen','reveal')}`);}
 if(stage==='reveal')s+=card(`<h2>Richtige Antwort</h2><p class="good">${esc(q?.options[q.correct])}</p>${btn(Number(m.index)>=29?'Battle abschließen':'Nächste Frage ➜','next')}`);
 if(stage==='finished')s+=card(`<h2>🏆 Battle ${m.battle} beendet!</h2>${m.battle<3?btn('Nächstes Battle vorbereiten','nextbattle'):btn('🔄 Neues Spiel','reset')}`);
 s+=card(btn('Zur Startseite','home','alt'));
}else{
 const myAnswer=room.answers?.[m.index]?.[uid];
 if(stage==='lobby')s+=card('<h2>Warteraum</h2><p>Warte, bis der Schiedsrichter das Battle startet.</p>');
 if(stage==='question'&&q){const answered=myAnswer!==undefined;s+=card(`<h2>${esc(q.q)}</h2><div class="answers">${q.options.map((o,i)=>`<button ${answered?'disabled':''} data-answer="${i}" class="${answered&&Number(myAnswer.choice)===i?'picked':''}">${esc(o)}</button>`).join('')}</div><p class="muted">${answered?'Antwort abgegeben. Warte auf den Schiedsrichter.':'Tippe auf eine Antwort.'}</p>`);}
 if(stage==='reveal')s+=card(`<h2>Auflösung</h2><p>Richtig: <strong class="good">${esc(q?.options[q.correct])}</strong></p><p>Warte auf die nächste Frage.</p>`);
 if(stage==='finished')s+=card('<h2>🏆 Geschafft!</h2><p>Warte, bis der Schiedsrichter das nächste Battle startet.</p>');
 s+=card(btn('Zur Startseite','home','alt'));
}
app.innerHTML=s;}
async function makeRoom(){if(!uid){msg('Verbindung wird hergestellt. Bitte kurz warten.',true);return;}code=String(Math.floor(100000+Math.random()*900000));role='host';slot='';try{await set(ref(db,`rooms/${code}/meta`),{hostUid:uid,stage:'lobby',battle:1,index:0,createdAt:Date.now()});listen();}catch(e){msg('Raum konnte nicht erstellt werden: '+e.message,true);}}
function joinForm(){app.innerHTML=card(`<h2>Spiel beitreten</h2><label>Raumcode<input id="roomcode" inputmode="numeric" maxlength="6" placeholder="6-stelliger Code"></label><label>Dein Name<select id="playername">${names.map(n=>`<option>${n}</option>`).join('')}</select></label>${btn('Beitreten','enter')}`)+card(btn('Zurück','home','alt'));}
async function enter(){const c=document.querySelector('#roomcode').value.trim(),name=document.querySelector('#playername').value;if(!uid){msg('Anmeldung läuft. Bitte kurz warten.',true);return;}if(!/^\d{6}$/.test(c)){msg('Bitte sechsstelligen Code eingeben.',true);return;}try{const snap=await get(ref(db,`rooms/${c}`));if(!snap.exists()){msg('Raumcode nicht gefunden.',true);return;}const r=snap.val();let s=Object.keys(r.slots||{}).find(k=>r.slots[k]?.name===name&&r.slots[k]?.uid===uid);if(!s){if(r.meta?.stage!=='lobby'){msg('Das Battle läuft bereits. Bitte einen neuen Raum im Warteraum öffnen.',true);return;}s=String(names.indexOf(name)+1);if(r.slots?.[s]){msg('Dieser Name ist schon vergeben. Bitte anderen Namen wählen.',true);return;}await set(ref(db,`rooms/${c}/slots/${s}`),{name,uid,score:0});}code=c;role='player';slot=s;listen();}catch(e){msg('Beitritt fehlgeschlagen: '+e.message,true);}}
async function hostAction(a){if(role!=='host'||!room||room.meta?.hostUid!==uid){msg('Nur der Schiedsrichter darf das.',true);return;}const m=room.meta;
try{
if(a==='start'){if(players().length<1){msg('Mindestens ein Spieler muss beitreten.',true);return;}await update(ref(db,`rooms/${code}/meta`),{stage:'question',index:0});}
if(a==='reveal'){const q=current();const ans=room.answers?.[m.index]||{};for(const p of players()){if(Number(ans[p.uid]?.choice)===q.correct){await runTransaction(ref(db,`rooms/${code}/slots/${p.id}/score`),x=>(Number(x)||0)+10);}}await update(ref(db,`rooms/${code}/meta`),{stage:'reveal'});}
if(a==='next')await update(ref(db,`rooms/${code}/meta`),{stage:Number(m.index)>=29?'finished':'question',index:Math.min(29,Number(m.index)+1)});
if(a==='nextbattle'){await update(ref(db,`rooms/${code}/meta`),{stage:'lobby',battle:Number(m.battle)+1,index:0});}
if(a==='reset'){await remove(ref(db,`rooms/${code}/answers`));for(const p of players())await set(ref(db,`rooms/${code}/slots/${p.id}/score`),0);await update(ref(db,`rooms/${code}/meta`),{stage:'lobby',battle:1,index:0});}
}catch(e){msg('Aktion fehlgeschlagen: '+e.message,true);}}
async function answer(i){if(role!=='player'||room?.meta?.stage!=='question'||!uid)return;const n=room.meta.index;if(room.answers?.[n]?.[uid]!==undefined)return;try{await set(ref(db,`rooms/${code}/answers/${n}/${uid}`),{choice:i,at:Date.now()});}catch(e){msg('Antwort konnte nicht gespeichert werden: '+e.message,true);}}
function soloHome(){solo={battle:0,index:0,score:0};const saved=JSON.parse(localStorage.getItem(key)||'null');app.innerHTML=card(`<h2>📚 Solo-Training</h2><p>90 Fragen in 3 Battles. Dein Fortschritt wird auf diesem Handy gespeichert.</p><div class="buttons">${btn('Von vorne starten','soloStart')}${saved?btn(`Fortsetzen (${saved.done||0}/90)`,'soloResume','alt'):''}</div>`)+card(btn('Zurück','home','alt'));}
function soloQuestion(){const i=solo.index,b=solo.battle,q=BATTLES[b]?.[i];if(!q){soloFinished();return;}app.innerHTML=card(`<h2>Solo · Battle ${b+1}/3</h2><p>Frage ${i+1}/30 · ${solo.score} Punkte</p><div class="bar"><div class="fill" style="width:${(b*30+i)/90*100}%"></div></div><h2>${esc(q.q)}</h2><div class="answers">${q.options.map((o,j)=>`<button data-soloanswer="${j}">${esc(o)}</button>`).join('')}</div>`)+card(btn('Zur Startseite','home','alt'));}
function soloAnswer(i){const q=BATTLES[solo.battle][solo.index];const ok=i===q.correct;if(ok)solo.score+=10;solo.index++;const done=solo.battle*30+solo.index;localStorage.setItem(key,JSON.stringify({...solo,done}));app.innerHTML=card(`<h2>${ok?'✅ Richtig!':'❌ Leider falsch'}</h2><p>Richtige Antwort: <strong>${esc(q.options[q.correct])}</strong></p><p>Deine Punkte: ${solo.score}</p>${btn('Weiter ➜','soloNext')}`);}
function soloNext(){if(solo.index>=30){solo.battle++;solo.index=0;}if(solo.battle>=3){soloFinished();return;}soloQuestion();}
function soloFinished(){localStorage.setItem(key,JSON.stringify({...solo,done:90,finished:true}));app.innerHTML=card(`<h2>🏆 Training abgeschlossen!</h2><p class="score">${solo.score} von 900 Punkten</p>${btn('Noch einmal lernen','soloStart')}`)+card(btn('Zur Startseite','home','alt'));}
document.addEventListener('click',e=>{const a=e.target.closest('[data-action]');const ans=e.target.closest('[data-answer]');const sa=e.target.closest('[data-soloanswer]');if(ans){answer(Number(ans.dataset.answer));return;}if(sa){soloAnswer(Number(sa.dataset.soloanswer));return;}if(!a)return;const v=a.dataset.action;if(v==='home')home();else if(v==='host')makeRoom();else if(v==='join')joinForm();else if(v==='enter')enter();else if(['start','reveal','next','nextbattle','reset'].includes(v))hostAction(v);else if(v==='solo')soloHome();else if(v==='soloStart'){solo={battle:0,index:0,score:0};localStorage.setItem(key,JSON.stringify({...solo,done:0}));soloQuestion();}else if(v==='soloResume'){solo=JSON.parse(localStorage.getItem(key)||'null')||{battle:0,index:0,score:0};if(solo.finished)soloFinished();else soloQuestion();}else if(v==='soloNext')soloNext();});
home();try{const fb=initializeApp(firebaseConfig),auth=getAuth(fb);db=getDatabase(fb);onAuthStateChanged(auth,u=>{if(u)uid=u.uid;else signInAnonymously(auth).catch(e=>msg('Anmeldung fehlgeschlagen: '+e.message,true));});}catch(e){msg('Firebase-Konfiguration fehlerhaft: '+e.message,true);}
