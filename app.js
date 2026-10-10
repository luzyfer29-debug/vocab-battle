import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {getAuth,signInAnonymously,onAuthStateChanged,signInWithEmailAndPassword,signOut,setPersistence,browserLocalPersistence} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {getDatabase,ref,onValue,get,set,update,runTransaction,remove} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';
import {firebaseConfig} from './firebase-config.js';
import {BATTLES} from './questions.js';
const app=document.querySelector('#app'),status=document.querySelector('#status');
const names=['Luca','Semir','Talea','Nele'];
const QUESTION_MS=15000,REVEAL_MS=3000;
let db,uid='',code='',role='',slot='',room=null,unsubscribe=null,solo=null;
let clock=null,busy=false,previousStageKey='',lastClockText='';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(t,fn,cl='')=>`<button ${cl?`class="${cl}"`:''} data-action="${fn}">${t}</button>`;
const card=s=>`<section class="card">${s}</section>`;
const msg=(s,bad=false)=>status.innerHTML=`<p class="${bad?'error':'good'}">${esc(s)}</p>`;
const key='vb2solo';
const ADMIN_UID='M41x9WNoHAfqpSmyrztAgf2IZYC3';
let authClient=null,adminLoggedIn=false;
function loginForm(){app.innerHTML=card(`<h2>🔐 Schiedsrichter-Anmeldung</h2><p>Nur das berechtigte Schiedsrichterkonto kann Spiele starten und die Lernübersicht öffnen.</p><label>E-Mail<input id="admin-email" type="email" autocomplete="username" placeholder="E-Mail-Adresse"></label><label>Passwort<input id="admin-password" type="password" autocomplete="current-password" placeholder="Passwort"></label>${btn('Anmelden','adminLogin')}`)+card(btn('Zurück','home','alt'));}
async function adminLogin(){const email=document.querySelector('#admin-email')?.value.trim(),password=document.querySelector('#admin-password')?.value;if(!email||!password){msg('Bitte E-Mail und Passwort eingeben.',true);return;}try{await setPersistence(authClient,browserLocalPersistence);const cred=await signInWithEmailAndPassword(authClient,email,password);if(cred.user.uid!==ADMIN_UID){await signOut(authClient);adminLoggedIn=false;msg('Dieses Konto ist nicht als Schiedsrichter berechtigt.',true);return;}uid=cred.user.uid;adminLoggedIn=true;home();msg('Schiedsrichter erfolgreich angemeldet.');}catch(e){msg('Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen. '+e.code,true);}}
async function adminLogout(){try{await signOut(authClient);adminLoggedIn=false;uid='';home();}catch(e){msg('Abmeldung fehlgeschlagen: '+e.message,true);}}

const SOLO_NAMES=['Luca','Semir','Talea','Nele'];
let soloName=localStorage.getItem('vb2solo_name')||'';
let dashboardUnsubscribe=null,soloHeartbeat=null;
function stopSoloHeartbeat(){if(soloHeartbeat!==null){clearInterval(soloHeartbeat);soloHeartbeat=null;}}
function startSoloHeartbeat(){stopSoloHeartbeat();soloHeartbeat=setInterval(()=>{if(solo&&soloName)void syncSolo();},30000);}
function stopDashboard(){if(dashboardUnsubscribe){dashboardUnsubscribe();dashboardUnsubscribe=null;}}
function stopClock(){if(clock!==null){clearInterval(clock);clock=null;}lastClockText='';}
function home(){stopDashboard();stopSoloHeartbeat();if(unsubscribe){unsubscribe();unsubscribe=null;}stopClock();code='';role='';slot='';room=null;solo=null;busy=false;previousStageKey='';status.textContent='';app.innerHTML=card(`<h2>Was möchtest du machen?</h2><div class="buttons">${adminLoggedIn?btn('🎮 Schiedsrichter','host'):btn('🔐 Schiedsrichter anmelden','adminForm')}${btn('👥 Spiel beitreten','join')}${btn('📚 Alleine lernen','solo')}${adminLoggedIn?btn('📊 Lernübersicht','dashboard'):''}${adminLoggedIn?btn('Abmelden','adminLogout','alt'):''}</div>`)+card('<p class="muted">Der Schiedsrichter startet die Battles. Alle vier Kinder können gleichzeitig auf eigenen Geräten lernen. Die Lernübersicht zeigt Punkte und Fehlerlisten.</p>');}
function listen(){if(unsubscribe)unsubscribe();stopClock();unsubscribe=onValue(ref(db,`rooms/${code}`),snap=>{room=snap.val();if(!room){msg('Raum nicht gefunden oder gelöscht.',true);return;}render();},e=>msg('Firebase-Zugriff verweigert: '+e.message,true));}
function current(){const b=Number(room?.meta?.battle||1)-1;return BATTLES[b]?.[Number(room?.meta?.index||0)%30];}
function players(){return Object.entries(room?.slots||{}).map(([id,p])=>({id,...p})).sort((a,b)=>(b.score||0)-(a.score||0));}
function roster(){return players().map((p,i)=>`<div class="player row"><span>${i+1}. ${esc(p.name)}</span><span class="score">${p.score||0}</span></div>`).join('')||'<p>Noch keine Spieler.</p>';}
function chooseBattle(){if(!adminLoggedIn||uid!==ADMIN_UID){loginForm();return;}app.innerHTML=card(`<h2>🎮 Battle auswählen</h2><p>Welches Battle soll gespielt werden?</p><label>Battle<select id="battle-choice"><option value="1">Battle 1 – 30 Fragen</option><option value="2">Battle 2 – 30 Fragen</option><option value="3">Battle 3 – 30 Fragen</option></select></label>${btn('Raum erstellen','createRoom')}`)+card(btn('Zurück','home','alt'));}
function countdown(){const m=room?.meta||{};if(m.stage!=='question'&&m.stage!=='reveal')return '';const remaining=Math.max(0,Math.ceil((Number(m.deadline||0)-Date.now())/1000));return m.stage==='question'?`⏱️ Noch ${remaining} Sekunden`:`⏳ Weiter in ${remaining} Sekunden`;}
function render(){if(!room)return;const m=room.meta||{},q=current(),stage=m.stage||'lobby';const stageKey=`${m.battle}:${m.index}:${stage}`;let s=card(`<p class="muted">Raumcode</p><div class="big">${esc(code)}</div><p>Battle ${m.battle||1} von 3 · ${stage==='lobby'?'Warteraum':stage==='question'?`Frage ${Number(m.index||0)%30+1} von 30`:stage==='reveal'?'Auswertung':'Battle beendet'}</p>${roster()}`);
if(role==='host'){
 if(stage==='lobby')s+=card(`<h2>Schiedsrichter</h2><p>Battle ${m.battle} starten – 30 Fragen mit je 15 Sekunden. Danach erscheint die Rangliste.</p>${btn('▶️ Battle starten','start')}`);
 if(stage==='question'){const a=room.answers?.[m.index]||{};s+=card(`<h2>Frage ${Number(m.index)%30+1}</h2><p>${esc(q?.q||'')}</p><h2 id="countdown">${countdown()}</h2><p>Antworten: ${Object.keys(a).length} von ${players().length}</p><p class="muted">Automatische Auswertung nach 15 Sekunden</p>`);}
 if(stage==='reveal')s+=card(`<h2>Richtige Antwort</h2><p class="good">${esc(q?.options[q.correct]??'')}</p><h2 id="countdown">${countdown()}</h2>`);
 if(stage==='finished')s+=card(`<h2>🏆 Battle ${m.battle} beendet!</h2><p>Rangliste nach 30 Fragen:</p>${roster()}${btn('🔄 Neues Spiel','reset')}`);
 s+=card(btn('Zur Startseite','home','alt'));
}else{
 const myAnswer=room.answers?.[m.index]?.[uid];
 if(stage==='lobby')s+=card('<h2>Warteraum</h2><p>Warte, bis der Schiedsrichter das Battle startet.</p>');
 if(stage==='question'&&q){const answered=myAnswer!==undefined;s+=card(`<h2>${esc(q.q)}</h2><h2 id="countdown">${countdown()}</h2><div class="answers">${q.options.map((o,i)=>`<button ${answered||Date.now()>=Number(m.deadline||0)?'disabled':''} data-answer="${i}" class="${answered&&Number(myAnswer.choice)===i?'picked':''}">${esc(o)}</button>`).join('')}</div><p class="muted">${answered?'Antwort abgegeben. Warte auf die Auswertung.':'Wähle eine Antwort innerhalb von 15 Sekunden.'}</p>`);}
 if(stage==='reveal')s+=card(`<h2>Auflösung</h2><p>Richtig: <strong class="good">${esc(q?.options[q.correct]??'')}</strong></p><h2 id="countdown">${countdown()}</h2>`);
 if(stage==='finished')s+=card('<h2>🏆 Battle ${m.battle} geschafft!</h2><p>Die Rangliste steht oben.</p>');
 s+=card(btn('Zur Startseite','home','alt'));
}
app.innerHTML=s;
if(stageKey!==previousStageKey){previousStageKey=stageKey;lastClockText='';}
if(stage==='question'||stage==='reveal'){if(clock===null)clock=setInterval(tick,250);tick();}else stopClock();}
function tick(){if(!room)return;const m=room.meta||{},stage=m.stage;if(stage!=='question'&&stage!=='reveal'){stopClock();return;}const text=countdown();if(text!==lastClockText){const el=document.querySelector('#countdown');if(el)el.textContent=text;lastClockText=text;}if(stage==='question'&&Date.now()>=Number(m.deadline||0)){document.querySelectorAll('[data-answer]').forEach(el=>el.disabled=true);}if(role!=='host'||busy||!m.deadline||Date.now()<Number(m.deadline))return;if(stage==='question')void automaticReveal();else if(stage==='reveal')void automaticNext();}
async function makeRoom(){if(!adminLoggedIn||uid!==ADMIN_UID){msg('Bitte als Schiedsrichter anmelden.',true);return;}const battle=Number(document.querySelector('#battle-choice')?.value||1);if(!uid){msg('Verbindung wird hergestellt. Bitte kurz warten.',true);return;}code=String(Math.floor(100000+Math.random()*900000));role='host';slot='';try{await set(ref(db,`rooms/${code}/meta`),{hostUid:uid,stage:'lobby',battle,index:(battle-1)*30,createdAt:Date.now()});listen();}catch(e){msg('Raum konnte nicht erstellt werden: '+e.message,true);}}
function joinForm(){app.innerHTML=card(`<h2>Spiel beitreten</h2><label>Raumcode<input id="roomcode" inputmode="numeric" maxlength="6" placeholder="6-stelliger Code"></label><label>Dein Name<select id="playername">${names.map(n=>`<option>${n}</option>`).join('')}</select></label>${btn('Beitreten','enter')}`)+card(btn('Zurück','home','alt'));}
async function enter(){const c=document.querySelector('#roomcode').value.trim(),name=document.querySelector('#playername').value;if(!uid){msg('Anmeldung läuft. Bitte kurz warten.',true);return;}if(!/^\d{6}$/.test(c)){msg('Bitte sechsstelligen Code eingeben.',true);return;}try{const snap=await get(ref(db,`rooms/${c}`));if(!snap.exists()){msg('Raumcode nicht gefunden.',true);return;}const r=snap.val();let s=Object.keys(r.slots||{}).find(k=>r.slots[k]?.name===name&&r.slots[k]?.uid===uid);if(!s){if(r.meta?.stage!=='lobby'){msg('Das Battle läuft bereits. Bitte einen neuen Raum im Warteraum öffnen.',true);return;}s=String(names.indexOf(name)+1);if(r.slots?.[s]){msg('Dieser Name ist schon vergeben. Bitte anderen Namen wählen.',true);return;}await set(ref(db,`rooms/${c}/slots/${s}`),{name,uid,score:0});}code=c;role='player';slot=s;listen();}catch(e){msg('Beitritt fehlgeschlagen: '+e.message,true);}}
async function automaticReveal(){if(busy||role!=='host'||!room||room.meta?.hostUid!==uid||room.meta.stage!=='question')return;busy=true;const battle=room.meta.battle,index=room.meta.index;try{const q=current();if(!q)throw new Error('Frage nicht gefunden');const ans=room.answers?.[index]||{};for(const p of players()){if(Number(ans[p.uid]?.choice)===q.correct){await runTransaction(ref(db,`rooms/${code}/slots/${p.id}/score`),x=>(Number(x)||0)+10);}}if(room?.meta?.battle===battle&&room?.meta?.index===index&&room?.meta?.stage==='question')await update(ref(db,`rooms/${code}/meta`),{stage:'reveal',deadline:Date.now()+REVEAL_MS});}catch(e){msg('Automatische Auswertung fehlgeschlagen: '+e.message,true);}finally{busy=false;}}
async function automaticNext(){if(busy||role!=='host'||!room||room.meta?.hostUid!==uid||room.meta.stage!=='reveal')return;busy=true;const m={...room.meta};try{if(Number(m.index)%30>=29)await update(ref(db,`rooms/${code}/meta`),{stage:'finished',deadline:0});else {const nextIndex=Number(m.index)+1;await update(ref(db,`rooms/${code}/meta`),{stage:'question',index:nextIndex,battle:Number(m.battle),deadline:Date.now()+QUESTION_MS});}}catch(e){msg('Nächste Frage konnte nicht gestartet werden: '+e.message,true);}finally{busy=false;}}
async function hostAction(a){if(!adminLoggedIn||uid!==ADMIN_UID){msg('Nur der angemeldete Schiedsrichter darf das.',true);return;}if(role!=='host'||!room||room.meta?.hostUid!==uid){msg('Nur der Schiedsrichter darf das.',true);return;}const m=room.meta;try{if(a==='start'){if(players().length<1){msg('Mindestens ein Spieler muss beitreten.',true);return;}await update(ref(db,`rooms/${code}/meta`),{stage:'question',index:(Number(m.battle)-1)*30,deadline:Date.now()+QUESTION_MS});}if(a==='reset'){await remove(ref(db,`rooms/${code}/answers`));for(const p of players())await set(ref(db,`rooms/${code}/slots/${p.id}/score`),0);await update(ref(db,`rooms/${code}/meta`),{stage:'lobby',battle:Number(m.battle),index:(Number(m.battle)-1)*30,deadline:0});}}catch(e){msg('Aktion fehlgeschlagen: '+e.message,true);}}
async function answer(i){if(role!=='player'||room?.meta?.stage!=='question'||!uid)return;const n=room.meta.index;if(Date.now()>=Number(room.meta.deadline||0)){msg('Die Antwortzeit ist abgelaufen.',true);return;}if(room.answers?.[n]?.[uid]!==undefined)return;try{await set(ref(db,`rooms/${code}/answers/${n}/${uid}`),{choice:i,at:Date.now()});}catch(e){msg('Antwort konnte nicht gespeichert werden: '+e.message,true);}}

// Solo: 30 reguläre Fragen, danach falsch beantwortete Wörter wiederholen.
// Wiederholungen geben keine zusätzlichen Punkte; alle Zustände bleiben lokal gespeichert.
function cleanMistakes(v){const out={};if(!v||typeof v!=='object')return out;for(const [k,n] of Object.entries(v)){const i=Number(k);if(Number.isInteger(i)&&i>=0&&i<30&&Number.isFinite(Number(n))&&Number(n)>0)out[i]=Math.min(9999,Math.floor(Number(n)));}return out;}
function mistakeRows(b,m){return Object.entries(cleanMistakes(m)).map(([idx,count])=>{const q=BATTLES[b]?.[Number(idx)];if(!q)return null;return {word:q.word||q.q,translation:q.options[q.correct],count,idx:Number(idx)};}).filter(Boolean).sort((a,b)=>b.count-a.count||a.word.localeCompare(b.word,'de'));}
function showMyMistakes(){stopSoloHeartbeat();if(!soloName){soloChooseName();return;}const groups=[0,1,2].map(b=>{const entries=mistakeRows(b,soloSaved(b)?.mistakes);return `<h3>Battle ${b+1}</h3>${entries.length?entries.map(x=>`<div class="player"><strong>${esc(x.word)}</strong> – ${esc(x.translation)}<p class="muted">${x.count}× falsch beantwortet</p></div>`).join(''):'<p class="muted">Noch keine Fehler erfasst.</p>'}`;}).join('');app.innerHTML=card(`<h2>📕 ${esc(soloName)} · Meine Fehlerliste</h2><p>Die Fehler werden bei normalen Fragen und Wiederholungen gezählt. Frühere Battles vor diesem Update sind nicht rückwirkend enthalten.</p>${groups}`)+card(btn('Zur Battle-Auswahl','soloHome','alt'));}
function soloKey(b){return `${key}_${soloName}_battle_${b+1}`;}
function soloSave(){if(!solo)return;localStorage.setItem(soloKey(solo.battle),JSON.stringify(solo));void syncSolo();}
function soloSaved(b){try{const s=JSON.parse(localStorage.getItem(soloKey(b))||'null');if(!s||s.battle!==b||!Number.isInteger(s.index)||s.index<0||s.index>30||!Number.isFinite(s.score))return null;
 // Alte Speicherstände vor Einführung des Wiederholungsmodus bleiben kompatibel.
 s.wrong=Array.isArray(s.wrong)?s.wrong.filter(n=>Number.isInteger(n)&&n>=0&&n<30):[];
 s.mistakes=cleanMistakes(s.mistakes);s.review=!!s.review;s.reviewPos=Number.isInteger(s.reviewPos)&&s.reviewPos>=0?s.reviewPos:0;
 if(s.reviewPos>=s.wrong.length)s.reviewPos=0;
 return s;
}catch{return null;}}
async function syncSolo(){if(!uid||!db||!solo||!soloName)return;try{await set(ref(db,`soloProgress/${uid}/${soloName}/battle${solo.battle+1}`),{name:soloName,battle:solo.battle+1,done:solo.index,correct:Math.floor(solo.score/10),score:solo.score,finished:!!solo.finished,mistakes:cleanMistakes(solo.mistakes),updatedAt:Date.now()});}catch(e){msg('Online-Speicherung noch nicht möglich: '+e.message,true);}}
function soloChooseName(){stopSoloHeartbeat();app.innerHTML=card(`<h2>📚 Wer lernt gerade?</h2><p>Wähle deinen Namen, damit der Schiedsrichter deinen Lernfortschritt sehen kann.</p><div class="buttons">${SOLO_NAMES.map((n,i)=>btn(esc(n),`soloName${i}`)).join('')}</div>`)+card(btn('Zurück','home','alt'));}
function soloSetName(i){soloName=SOLO_NAMES[i];localStorage.setItem('vb2solo_name',soloName);soloHome();}
function soloHome(){stopSoloHeartbeat();if(!soloName){soloChooseName();return;}solo=null;app.innerHTML=card(`<h2>📚 ${esc(soloName)} · Battle auswählen</h2><p>30 Fragen pro Battle. Falsche Wörter werden danach wiederholt. Der Fortschritt wird auf diesem Handy und zusätzlich online gespeichert.</p>${[0,1,2].map(b=>{const saved=soloSaved(b),done=saved?.index||0;const reviewing=saved&&!saved.finished&&saved.review&&saved.wrong.length;return `<div class="player"><h3>Battle ${b+1}</h3><p>${done} von 30 Fragen erledigt${reviewing?` · 🔁 ${saved.wrong.length} Wörter üben`:''}${saved?.finished?' · abgeschlossen':''}</p><div class="buttons">${btn(saved?'Neu beginnen':'Starten',`soloStart${b}`)}${saved&&!saved.finished?btn('Fortsetzen',`soloResume${b}`,'alt'):''}</div></div>`;}).join('')}${btn('📕 Meine Fehlerliste','soloMistakes','alt')}${btn('Anderen Namen wählen','soloChangeName','alt')}`)+card(btn('Zurück','home','alt'));}
function soloStart(b){const previous=soloSaved(b);solo={battle:b,index:0,score:0,finished:false,wrong:[],review:false,reviewPos:0,mistakes:cleanMistakes(previous?.mistakes)};soloSave();soloQuestion();}
function soloResume(b){solo=soloSaved(b);if(!solo){soloStart(b);return;}void syncSolo();if(solo.finished)soloFinished();else soloQuestion();}
function soloQuestion(){if(!solo)return;startSoloHeartbeat();const b=solo.battle;
 if(!solo.review&&solo.index>=30){if(solo.wrong.length){solo.review=true;solo.reviewPos=0;soloSave();}else{soloFinished();return;}}
 if(solo.review&&!solo.wrong.length){soloFinished();return;}
 const i=solo.review?solo.wrong[solo.reviewPos]:solo.index,q=BATTLES[b]?.[i];
 if(!q){msg('Frage konnte nicht geladen werden.',true);return;}
 const title=solo.review?`🔁 Wiederholung · ${solo.wrong.length} Wörter offen`:`Frage ${solo.index+1}/30`;
 app.innerHTML=card(`<h2>${esc(soloName)} · Battle ${b+1}</h2><p>${title} · ${solo.score} Punkte</p><div class="bar"><div class="fill" style="width:${solo.index/30*100}%"></div></div><h2>${esc(q.q)}</h2><div class="answers">${q.options.map((o,j)=>`<button data-soloanswer="${j}">${esc(o)}</button>`).join('')}</div>`)+card(btn('Zur Battle-Auswahl','solo','alt'));
}
function soloAnswer(i){if(!solo||solo.finished)return;const reviewing=solo.review;const questionIndex=reviewing?solo.wrong[solo.reviewPos]:solo.index;
 const q=BATTLES[solo.battle]?.[questionIndex];if(!q||!Number.isInteger(i)||i<0||i>=q.options.length)return;
 // Sofort deaktivieren, damit Doppeltippen keine Fragen überspringt.
 document.querySelectorAll('[data-soloanswer]').forEach(el=>el.disabled=true);
 const ok=i===q.correct;
 if(!ok){solo.mistakes=cleanMistakes(solo.mistakes);solo.mistakes[questionIndex]=(solo.mistakes[questionIndex]||0)+1;}
 if(reviewing){if(ok){solo.wrong.splice(solo.reviewPos,1);if(solo.reviewPos>=solo.wrong.length)solo.reviewPos=0;}
 else if(solo.wrong.length>1)solo.reviewPos=(solo.reviewPos+1)%solo.wrong.length;
 }else{if(ok)solo.score+=10;else if(!solo.wrong.includes(questionIndex))solo.wrong.push(questionIndex);solo.index++;}
 soloSave();
 const remaining=solo.wrong.length;
 app.innerHTML=card(`<h2>${ok?'✅ Richtig!':'❌ Leider falsch'}</h2><p>Richtige Antwort: <strong>${esc(q.options[q.correct])}</strong></p><p>Deine Punkte: ${solo.score} von 300</p>${reviewing?`<p>🔁 Noch ${remaining} ${remaining===1?'Wort':'Wörter'} zum Üben.</p>`:''}${btn('Weiter ➜','soloNext')}`);
}
function soloNext(){if(!solo)return;soloQuestion();}
function soloFinished(){if(!solo)return;stopSoloHeartbeat();solo.finished=true;solo.index=30;solo.wrong=[];solo.review=false;solo.reviewPos=0;soloSave();app.innerHTML=card(`<h2>🏆 Battle ${solo.battle+1} abgeschlossen!</h2><p>Alle Wörter wurden richtig geübt.</p><p class="score">${solo.score} von 300 Punkten</p>${btn('Battle wiederholen',`soloStart${solo.battle}`)}`)+card(btn('Anderes Battle auswählen','solo','alt'));}
function renderDashboard(entries){
 const latest={};
 for(const perDevice of Object.values(entries||{}))for(const [name,perBattle] of Object.entries(perDevice||{}))if(SOLO_NAMES.includes(name))for(const [battle,v] of Object.entries(perBattle||{})){
  if(!/^battle[123]$/.test(battle)||!v||typeof v!=='object')continue;
  const k=name+':'+battle;if(!latest[k]||Number(v.updatedAt)>Number(latest[k].updatedAt))latest[k]=v;
 }
 const now=Date.now();
 const cells=SOLO_NAMES.map(name=>{
  const records=[1,2,3].map(b=>latest[name+':battle'+b]);
  const last=records.filter(Boolean).sort((a,b)=>Number(b.updatedAt||0)-Number(a.updatedAt||0))[0];
  const recent=last&&now-Number(last.updatedAt||0)<90000;
  const details=records.map(v=>v?`${Math.min(30,Number(v.done)||0)}/30 · ${Number(v.score)||0} P`:'–');
  const sum=records.reduce((acc,v)=>acc+(Number(v?.score)||0),0);
  const done=records.reduce((acc,v)=>acc+Math.min(30,Number(v?.done)||0),0);
  return `<tr><th scope="row">${esc(name)} ${recent?'🟢':'⚪'}</th>${details.map(d=>`<td>${d}</td>`).join('')}<td><strong>${done}/90</strong><br>${sum} P</td></tr>`;
 }).join('');
 const table=`<div style="overflow-x:auto;max-width:100%"><table style="width:100%;border-collapse:collapse;font-size:0.85rem;min-width:490px;text-align:left"><thead><tr><th style="padding:10px 6px">Kind</th><th>Battle 1</th><th>Battle 2</th><th>Battle 3</th><th>Gesamt</th></tr></thead><tbody>${cells}</tbody></table></div>`;
 const detailRows=SOLO_NAMES.map(name=>{
  const records=[1,2,3].map(b=>latest[name+':battle'+b]);
  const last=records.filter(Boolean).sort((a,b)=>Number(b.updatedAt||0)-Number(a.updatedAt||0))[0];
  const recent=last&&now-Number(last.updatedAt||0)<90000;
  const errors=records.map((v,i)=>{
   const list=mistakeRows(i,v?.mistakes);
   return `<h4>Battle ${i+1}</h4>${list.length?list.map(x=>`<div class="player"><strong>${esc(x.word)}</strong> – ${esc(x.translation)}<p class="muted">${x.count}× falsch beantwortet</p></div>`).join(''):'<p class="muted">Noch keine Fehler online erfasst.</p>'}`;
  }).join('');
  return `<details style="margin:12px 0;padding:12px;background:rgba(255,255,255,.06);border-radius:12px"><summary><strong>${esc(name)}</strong> ${recent?'🟢':'⚪'} · Details und Fehlerliste ansehen</summary>${records.map((v,i)=>`<p><strong>Battle ${i+1}:</strong> ${v?`${Math.min(30,Number(v.done)||0)}/30 erledigt · ${Number(v.correct)||0} richtig · ${Number(v.score)||0} Punkte · zuletzt ${v.updatedAt?new Date(v.updatedAt).toLocaleString('de-DE'):'–'}`:'Noch keine Online-Daten'}</p>`).join('')}<h3>📕 Fehlerliste</h3>${errors}</details>`;
 }).join('');
 app.innerHTML=card('<h2>📊 Live-Lernübersicht</h2><p>Alle vier Kinder auf einen Blick. In den Battle-Spalten steht: erledigte Fragen / 30 · Punkte. 🟢 bedeutet Aktivität in den letzten 90 Sekunden.</p>'+table+'<p class="muted">Wische die Tabelle seitlich, um alle Spalten zu sehen.</p><h3>Einzelheiten</h3>'+detailRows)+card(btn('Zurück','home','alt'));
}
function showDashboard(){
 if(!adminLoggedIn||uid!==ADMIN_UID){loginForm();return;}
 stopDashboard();stopSoloHeartbeat();
 app.innerHTML=card('<h2>📊 Live-Lernübersicht</h2><p>Online-Lernstände werden geladen …</p>')+card(btn('Zurück','home','alt'));
 if(!uid){msg('Bitte kurz warten, bis die Anmeldung abgeschlossen ist.',true);return;}
 dashboardUnsubscribe=onValue(ref(db,'soloProgress'),snap=>{renderDashboard(snap.val());},e=>msg('Lernübersicht konnte nicht geladen werden: '+e.message,true));
}
document.addEventListener('click',e=>{const a=e.target.closest('[data-action]'),ans=e.target.closest('[data-answer]'),sa=e.target.closest('[data-soloanswer]');if(ans){answer(Number(ans.dataset.answer));return;}if(sa){soloAnswer(Number(sa.dataset.soloanswer));return;}if(!a)return;const v=a.dataset.action;if(v==='home')home();else if(v==='adminForm')loginForm();else if(v==='adminLogin')void adminLogin();else if(v==='adminLogout')void adminLogout();else if(v==='host')chooseBattle();else if(v==='createRoom')void makeRoom();else if(v==='join')joinForm();else if(v==='enter')enter();else if(['start','reset'].includes(v))hostAction(v);else if(v==='solo')soloChooseName();else if(v==='dashboard')void showDashboard();else if(v==='soloChangeName')soloChooseName();else if(v==='soloMistakes')showMyMistakes();else if(v==='soloHome')soloHome();else if(/^soloName[0-3]$/.test(v))soloSetName(Number(v.slice(-1)));else if(/^soloStart[012]$/.test(v))soloStart(Number(v.slice(-1)));else if(/^soloResume[012]$/.test(v))soloResume(Number(v.slice(-1)));else if(v==='soloNext')soloNext();});
home();try{const fb=initializeApp(firebaseConfig),auth=getAuth(fb);authClient=auth;db=getDatabase(fb);onAuthStateChanged(auth,u=>{const wasAdmin=adminLoggedIn;uid=u?.uid||'';adminLoggedIn=!!u&&u.uid===ADMIN_UID;if(wasAdmin!==adminLoggedIn)home();if(!u)signInAnonymously(auth).catch(e=>msg('Anmeldung fehlgeschlagen: '+e.message,true));});}catch(e){msg('Firebase-Konfiguration fehlerhaft: '+e.message,true);}
