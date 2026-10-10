import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {getAuth,signInAnonymously,onAuthStateChanged,signInWithEmailAndPassword,signOut,setPersistence,browserLocalPersistence} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {getDatabase,ref,onValue,get,set,update,runTransaction,remove} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';
import {firebaseConfig} from './firebase-config.js';
import {BATTLES} from './questions.js';
import {MATH_BATTLES} from './math-questions.js';
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
let resetState={};
const ADMIN_UID='M41x9WNoHAfqpSmyrztAgf2IZYC3';
let authClient=null,adminLoggedIn=false;
function loginForm(){app.innerHTML=card(`<h2>🔐 Schiedsrichter-Anmeldung</h2><p>Nur das berechtigte Schiedsrichterkonto kann Spiele starten und die Lernübersicht öffnen.</p><label>E-Mail<input id="admin-email" type="email" autocomplete="username" placeholder="E-Mail-Adresse"></label><label>Passwort<input id="admin-password" type="password" autocomplete="current-password" placeholder="Passwort"></label>${btn('Anmelden','adminLogin')}`)+card(btn('Zurück','home','alt'));}
async function adminLogin(){const email=document.querySelector('#admin-email')?.value.trim(),password=document.querySelector('#admin-password')?.value;if(!email||!password){msg('Bitte E-Mail und Passwort eingeben.',true);return;}try{await setPersistence(authClient,browserLocalPersistence);const cred=await signInWithEmailAndPassword(authClient,email,password);if(cred.user.uid!==ADMIN_UID){await signOut(authClient);adminLoggedIn=false;msg('Dieses Konto ist nicht als Schiedsrichter berechtigt.',true);return;}uid=cred.user.uid;adminLoggedIn=true;home();msg('Schiedsrichter erfolgreich angemeldet.');}catch(e){msg('Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen. '+e.code,true);}}
async function adminLogout(){try{await signOut(authClient);adminLoggedIn=false;uid='';home();}catch(e){msg('Abmeldung fehlgeschlagen: '+e.message,true);}}

const SOLO_NAMES=['Luca','Semir','Talea','Nele'];
let soloName=localStorage.getItem('vb2solo_name')||'';
let dashboardUnsubscribe=null,soloHeartbeat=null;
let resetBusy=false;
function stopSoloHeartbeat(){if(soloHeartbeat!==null){clearInterval(soloHeartbeat);soloHeartbeat=null;}}
function startSoloHeartbeat(){stopSoloHeartbeat();soloHeartbeat=setInterval(()=>{if(solo&&soloName)void syncSolo();},30000);}
function stopDashboard(){if(dashboardUnsubscribe){dashboardUnsubscribe();dashboardUnsubscribe=null;}}
function stopClock(){if(clock!==null){clearInterval(clock);clock=null;}lastClockText='';}
function home(){stopDashboard();stopSoloHeartbeat();if(unsubscribe){unsubscribe();unsubscribe=null;}stopClock();code='';role='';slot='';room=null;solo=null;busy=false;previousStageKey='';status.textContent='';app.innerHTML=card(`<h2>Was möchtest du machen?</h2><div class="buttons">${adminLoggedIn?btn('🎮 Schiedsrichter','host'):btn('🔐 Schiedsrichter anmelden','adminForm')}${btn('👥 Spiel beitreten','join')}${btn('🇬🇧 Englisch','solo')}${btn('🔢 Mathe Klasse 7 NRW','mathChoose')}${adminLoggedIn?btn('📊 Lernübersicht','dashboard'):''}${adminLoggedIn?btn('Abmelden','adminLogout','alt'):''}</div>`)+card('<p class="muted">Der Schiedsrichter startet die Battles. Alle vier Kinder können gleichzeitig auf eigenen Geräten lernen. Die Lernübersicht zeigt Punkte und Fehlerlisten.</p>');}
function listen(){if(unsubscribe)unsubscribe();stopClock();unsubscribe=onValue(ref(db,`rooms/${code}`),snap=>{room=snap.val();if(!room){msg('Raum nicht gefunden oder gelöscht.',true);return;}render();},e=>msg('Firebase-Zugriff verweigert: '+e.message,true));}
function current(){const b=Number(room?.meta?.battle||1)-1;return (room?.meta?.subject==='math'?MATH_BATTLES:BATTLES)[b]?.[Number(room?.meta?.index||0)%30];}
function players(){return Object.entries(room?.slots||{}).map(([id,p])=>({id,...p})).sort((a,b)=>(b.score||0)-(a.score||0));}
function roster(){return players().map((p,i)=>`<div class="player row"><span>${i+1}. ${esc(p.name)}</span><span class="score">${p.score||0}</span></div>`).join('')||'<p>Noch keine Spieler.</p>';}
function chooseBattle(){if(!adminLoggedIn||uid!==ADMIN_UID){loginForm();return;}app.innerHTML=card(`<h2>🎮 Battle auswählen</h2><p>Welches Battle soll gespielt werden?</p><label>Fach<select id="subject-choice"><option value="english">Englisch</option><option value="math">Mathe – rationale Zahlen</option></select></label><label>Battle<select id="battle-choice"><option value="1">Battle 1 – 30 Fragen</option><option value="2">Battle 2 – 30 Fragen</option><option value="3">Battle 3 – 30 Fragen</option></select></label>${btn('Raum erstellen','createRoom')}`)+card(btn('Zurück','home','alt'));}
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
async function makeRoom(){if(!adminLoggedIn||uid!==ADMIN_UID){msg('Bitte als Schiedsrichter anmelden.',true);return;}const subject=document.querySelector('#subject-choice')?.value==='math'?'math':'english';const battle=Number(document.querySelector('#battle-choice')?.value||1);if(!uid){msg('Verbindung wird hergestellt. Bitte kurz warten.',true);return;}code=String(Math.floor(100000+Math.random()*900000));role='host';slot='';try{await set(ref(db,`rooms/${code}/meta`),{hostUid:uid,stage:'lobby',subject,battle,index:(battle-1)*30,createdAt:Date.now()});listen();}catch(e){msg('Raum konnte nicht erstellt werden: '+e.message,true);}}
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
function renderDashboard(englishEntries,mathEntries){
 const newest=entries=>{const latest={};for(const perDevice of Object.values(entries||{}))for(const [name,perBattle] of Object.entries(perDevice||{}))if(SOLO_NAMES.includes(name))for(const [battle,v] of Object.entries(perBattle||{})){if(!/^battle[123]$/.test(battle)||!v||typeof v!=='object')continue;const k=name+':'+battle;if(!latest[k]||Number(v.updatedAt)>Number(latest[k].updatedAt))latest[k]=v;}return latest;};
 const english=newest(englishEntries),math=newest(mathEntries),now=Date.now();
 const sections=[['🇬🇧 Englisch',english,false],['🔢 Mathe Klasse 7 NRW',math,true]].map(([heading,latest,isMath])=>{
  const rows=SOLO_NAMES.map(name=>{const records=[1,2,3].map(b=>latest[name+':battle'+b]);const recent=records.some(v=>v&&now-Number(v.updatedAt||0)<90000);const cells=records.map(v=>v?`${Math.min(30,Number(v.done)||0)}/30 · ${Number(v.score)||0} P`:'–');const done=records.reduce((n,v)=>n+Math.min(30,Number(v?.done)||0),0),points=records.reduce((n,v)=>n+(Number(v?.score)||0),0);return `<tr><th style="padding:10px 6px">${esc(name)} ${recent?'🟢':'⚪'}</th>${cells.map(x=>`<td>${x}</td>`).join('')}<td><strong>${done}/90</strong><br>${points} P</td></tr>`;}).join('');
  const table=`<div style="overflow-x:auto"><table style="width:100%;min-width:490px;text-align:left"><thead><tr><th>Kind</th><th>Battle 1</th><th>Battle 2</th><th>Battle 3</th><th>Gesamt</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  const details=SOLO_NAMES.map(name=>{const records=[1,2,3].map(b=>latest[name+':battle'+b]);const content=records.map((v,b)=>{const summary=`<p><strong>Battle ${b+1}:</strong> ${v?`${Math.min(30,Number(v.done)||0)}/30 · ${Number(v.score)||0} Punkte`:'Noch keine Online-Daten'}</p>`;let mistakes='';if(isMath){mistakes=Object.entries(v?.mistakes||{}).map(([i,count])=>{const q=MATH_BATTLES[b]?.[Number(i)];return q?`<div class="player">${esc(q.q)} → <strong>${esc(q.options[q.correct])}</strong> · ${Number(count)||0}× falsch</div>`:'';}).join('');}else{mistakes=mistakeRows(b,v?.mistakes).map(x=>`<div class="player">${esc(x.word)} – ${esc(x.translation)} · ${x.count}× falsch</div>`).join('');}return summary+(mistakes||'<p class="muted">Keine Fehler online erfasst.</p>');}).join('');return `<details class="player"><summary><strong>${esc(name)}</strong> · Ergebnisse und Fehlerliste</summary>${content}</details>`;}).join('');
  return card(`<h2>${heading}</h2><p class="muted">Erledigte Aufgaben / 30 · Punkte</p>${table}<h3>Fehlerlisten und Einzelheiten</h3>${details}`);
 }).join('');
 app.innerHTML=card('<h2>📊 Live-Lernübersicht</h2><p>Englisch und Mathe getrennt. 🟢 = Aktivität in den letzten 90 Sekunden.</p>')+sections+card('<h2>🗑️ Lernstände zurücksetzen</h2><p>Nur für den Schiedsrichter.</p><label>Auswahl<select id="reset-target"><option value="Luca">Luca</option><option value="Semir">Semir</option><option value="Talea">Talea</option><option value="Nele">Nele</option><option value="all">Alle vier Kinder</option></select></label>'+btn('🗑️ Lernstände zurücksetzen','resetLearning'))+card(btn('Zurück','home','alt'));
}
async function resetLearning(){
 if(resetBusy||!adminLoggedIn||uid!==ADMIN_UID){msg('Nur der Schiedsrichter darf Lernstände löschen.',true);return;}
 const target=document.querySelector('#reset-target')?.value;
 if(target!=='all'&&!SOLO_NAMES.includes(target)){msg('Bitte ein Kind auswählen.',true);return;}
 const label=target==='all'?'ALLE VIER KINDER':target;
 if(!window.confirm(`ACHTUNG: Online-Lernstände und Fehlerlisten für ${label} löschen? Dies kann nicht rückgängig gemacht werden.`))return;
 if(!window.confirm(`Wirklich endgültig zurücksetzen: ${label}?`))return;
 resetBusy=true;
 try{
  // First broadcast the reset so updated child clients clear local data.
  const targets=target==='all'?SOLO_NAMES:[target];
  const stamp=Date.now();
  for(const name of targets)await set(ref(db,`learningResets/${name}`),stamp);
  // Delete the corresponding historical progress across every device UID.
  const snap=await get(ref(db,'soloProgress'));
  const entries=snap.val()||{};
  const paths={};
  for(const [device,perDevice] of Object.entries(entries)){
   for(const name of targets){if(perDevice&&Object.prototype.hasOwnProperty.call(perDevice,name))paths[`${device}/${name}`]=null;}
  }
  if(Object.keys(paths).length)await update(ref(db,'soloProgress'),paths);
  try{const ms=await get(ref(db,'mathProgress'));const mp={};for(const [device,perDevice] of Object.entries(ms.val()||{}))for(const name of targets)if(perDevice?.[name])mp[`${device}/${name}`]=null;if(Object.keys(mp).length)await update(ref(db,'mathProgress'),mp);}catch(e){msg('Englisch gelöscht. Mathe-Online-Daten konnten noch nicht gelöscht werden: '+e.message,true);return;}msg(`Online-Lernstände für ${label} gelöscht. Die Kindergeräte müssen die aktuelle App-Version öffnen, damit auch lokale Fehlerlisten gelöscht werden.`);
 }catch(e){msg('Rücksetzen nicht vollständig abgeschlossen: '+e.message,true);}
 finally{resetBusy=false;}
}
function showDashboard(){
 if(!adminLoggedIn||uid!==ADMIN_UID){loginForm();return;}
 stopDashboard();stopSoloHeartbeat();
 app.innerHTML=card('<h2>📊 Live-Lernübersicht</h2><p>Online-Lernstände werden geladen …</p>')+card(btn('Zurück','home','alt'));
 if(!uid){msg('Bitte kurz warten, bis die Anmeldung abgeschlossen ist.',true);return;}
 let englishData={},mathData={};const refresh=()=>renderDashboard(englishData,mathData);const offEnglish=onValue(ref(db,'soloProgress'),snap=>{englishData=snap.val()||{};refresh();},e=>msg('Englisch konnte nicht geladen werden: '+e.message,true));const offMath=onValue(ref(db,'mathProgress'),snap=>{mathData=snap.val()||{};refresh();},e=>msg('Mathe konnte nicht geladen werden: '+e.message+'. Bitte Firebase-Regeln für mathProgress prüfen.',true));dashboardUnsubscribe=()=>{offEnglish();offMath();};
}

// === Mathe Klasse 7 NRW: rationale Zahlen ===
let mathName='',mathRun=null,mathView='';
const mathKey=(n,b)=>`vb2math_${n}_battle_${b+1}`;
function mathLoad(n,b){try{return JSON.parse(localStorage.getItem(mathKey(n,b))||'null');}catch{return null;}}
function mathSave(){if(!mathRun)return;mathRun.updatedAt=Date.now();localStorage.setItem(mathKey(mathName,mathRun.b),JSON.stringify(mathRun));void mathSync();}
async function mathSync(){if(!db||!uid||!mathRun||!mathName)return;try{const stamp=Math.max(Number(resetState?.all)||0,Number(resetState?.[mathName])||0);if(mathRun.updatedAt<=stamp)return;await set(ref(db,`mathProgress/${uid}/${mathName}/battle${mathRun.b+1}`),{done:mathRun.index,score:mathRun.score,mistakes:mathRun.mistakes,updatedAt:mathRun.updatedAt,finished:mathRun.finished});}catch(e){msg('Mathe online noch nicht verfügbar – der Fortschritt bleibt auf diesem Gerät gespeichert.',true);}}
function mathChoose(){mathRun=null;app.innerHTML=card('<h2>🔢 Mathe · Klasse 7 NRW</h2><p>Rationale Zahlen – wer lernt?</p>'+SOLO_NAMES.map((n,i)=>btn(esc(n),`mathName${i}`)).join(''))+card(btn('Zur Fächerauswahl','home','alt'));}
function mathSetName(i){mathName=SOLO_NAMES[i];mathHome();}
function mathHome(){mathRun=null;const titles=['Zahlen vergleichen, addieren und subtrahieren','Multiplizieren und dividieren','Klammern und gemischte Rechnungen'];app.innerHTML=card(`<h2>🔢 Mathe · ${esc(mathName)}</h2><p>Klasse 7 · Rationale Zahlen</p>`+titles.map((t,b)=>{const s=mathLoad(mathName,b);return `<div class="player"><h3>Battle ${b+1}</h3><p>${esc(t)}</p><p>${s?.index||0}/30 Aufgaben · ${s?.score||0} Punkte</p>${btn('Neu beginnen',`mathStart${b}`)}${s&&!s.finished?btn('Fortsetzen',`mathResume${b}`,'alt'):''}</div>`;}).join('')+btn('📕 Meine Mathe-Fehlerliste','mathMistakes','alt'))+card(btn('Fach wechseln','home','alt'));}
function mathStart(b,resume=false){const s=resume?mathLoad(mathName,b):null;mathRun=s&&s.index>=0?s:{b,index:0,score:0,finished:false,mistakes:{}};mathSave();mathQuestion();}
function mathQuestion(){if(!mathRun)return;if(mathRun.index>=30){mathRun.finished=true;mathSave();app.innerHTML=card(`<h2>🏆 Mathe-Battle geschafft!</h2><p>${mathRun.score} von 300 Punkten</p>`+btn('Zur Übersicht','mathHome'));return;}const q=MATH_BATTLES[mathRun.b][mathRun.index];app.innerHTML=card(`<h2>🔢 Mathe-Battle ${mathRun.b+1}</h2><p>Aufgabe ${mathRun.index+1}/30 · ${mathRun.score} Punkte</p><h2>${esc(q.q)}</h2><div class="answers">${q.options.map((o,i)=>`<button data-mathanswer="${i}">${esc(o)}</button>`).join('')}</div>`)+card(btn('Zur Mathe-Übersicht','mathHome','alt'));}
function mathAnswer(i){if(!mathRun||mathRun.index>=30)return;const q=MATH_BATTLES[mathRun.b][mathRun.index],ok=i===q.correct;document.querySelectorAll('[data-mathanswer]').forEach(el=>el.disabled=true);if(ok)mathRun.score+=10;else mathRun.mistakes[mathRun.index]=(mathRun.mistakes[mathRun.index]||0)+1;mathRun.index++;mathSave();app.innerHTML=card(`<h2>${ok?'✅ Richtig!':'❌ Leider falsch'}</h2><p>Richtige Lösung: <strong>${esc(q.options[q.correct])}</strong></p><p>${mathRun.score} Punkte</p>`+btn('Weiter ➜','mathNext'));}
function mathMistakes(){const content=[0,1,2].map(b=>{const s=mathLoad(mathName,b),m=s?.mistakes||{};return `<h3>Battle ${b+1}</h3>`+(Object.keys(m).length?Object.entries(m).map(([i,c])=>`<p>${esc(MATH_BATTLES[b][Number(i)].q)} → <strong>${esc(MATH_BATTLES[b][Number(i)].options[MATH_BATTLES[b][Number(i)].correct])}</strong> · ${c}× falsch</p>`).join(''):'<p>Noch keine Fehler.</p>');}).join('');app.innerHTML=card(`<h2>📕 ${esc(mathName)} · Mathe-Fehlerliste</h2>${content}`)+card(btn('Zur Mathe-Übersicht','mathHome','alt'));}
function mathAction(v){if(v==='mathChoose')mathChoose();else if(v==='mathHome')mathHome();else if(v==='mathMistakes')mathMistakes();else if(v==='mathNext')mathQuestion();else if(/^mathName[0-3]$/.test(v))mathSetName(Number(v.slice(-1)));else if(/^mathStart[012]$/.test(v))mathStart(Number(v.slice(-1)));else if(/^mathResume[012]$/.test(v))mathStart(Number(v.slice(-1)),true);else return false;return true;}

document.addEventListener('click',e=>{const ma=e.target.closest('[data-mathanswer]');if(ma){mathAnswer(Number(ma.dataset.mathanswer));return;}const mathButton=e.target.closest('[data-action]');if(mathButton&&mathAction(mathButton.dataset.action))return;const a=e.target.closest('[data-action]'),ans=e.target.closest('[data-answer]'),sa=e.target.closest('[data-soloanswer]');if(ans){answer(Number(ans.dataset.answer));return;}if(sa){soloAnswer(Number(sa.dataset.soloanswer));return;}if(!a)return;const v=a.dataset.action;if(v==='home')home();else if(v==='adminForm')loginForm();else if(v==='adminLogin')void adminLogin();else if(v==='adminLogout')void adminLogout();else if(v==='host')chooseBattle();else if(v==='createRoom')void makeRoom();else if(v==='join')joinForm();else if(v==='enter')enter();else if(['start','reset'].includes(v))hostAction(v);else if(v==='solo')soloChooseName();else if(v==='dashboard')void showDashboard();else if(v==='resetLearning')void resetLearning();else if(v==='soloChangeName')soloChooseName();else if(v==='soloMistakes')showMyMistakes();else if(v==='soloHome')soloHome();else if(/^soloName[0-3]$/.test(v))soloSetName(Number(v.slice(-1)));else if(/^soloStart[012]$/.test(v))soloStart(Number(v.slice(-1)));else if(/^soloResume[012]$/.test(v))soloResume(Number(v.slice(-1)));else if(v==='soloNext')soloNext();});
home();try{const fb=initializeApp(firebaseConfig),auth=getAuth(fb);authClient=auth;db=getDatabase(fb);onAuthStateChanged(auth,u=>{const wasAdmin=adminLoggedIn;uid=u?.uid||'';adminLoggedIn=!!u&&u.uid===ADMIN_UID;if(wasAdmin!==adminLoggedIn)home();if(!u)signInAnonymously(auth).catch(e=>msg('Anmeldung fehlgeschlagen: '+e.message,true));});}catch(e){msg('Firebase-Konfiguration fehlerhaft: '+e.message,true);}
