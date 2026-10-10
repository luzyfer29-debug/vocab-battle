import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {getAuth,signInAnonymously,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {getDatabase,ref,onValue,get,set,update,runTransaction,remove} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';
import {firebaseConfig} from './firebase-config.js';
import {BATTLES} from './questions.js';
import {MATH_BATTLES} from './math-questions.js';
const app=document.querySelector('#app'),status=document.querySelector('#status');
const names=['Luca','Semir','Talea','Nele'];
const QUESTION_MS=15000,REVEAL_MS=3000;
const ADMIN_UID='M41x9WNoHAfqpSmyrztAgf2IZYC3';
let resetUnsubscribe=null,resetState={},resetReady=false;
let db,uid='',code='',role='',slot='',room=null,unsubscribe=null,solo=null;
let clock=null,busy=false,previousStageKey='',lastClockText='';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(t,fn,cl='')=>`<button ${cl?`class="${cl}"`:''} data-action="${fn}">${t}</button>`;
const card=s=>`<section class="card">${s}</section>`;
const msg=(s,bad=false)=>status.innerHTML=`<p class="${bad?'error':'good'}">${esc(s)}</p>`;
// Lueckentexte aus den beiden vom Nutzer bereitgestellten Loesungsblaettern.
// Reihenfolge und Wortlaut der Saetze bleiben wie auf den Vorlagen.
const GAP_SETS=[
 {title:'Lückentext 1 · Station 1',groups:[{title:'Julies Nachricht an Beth · Aufgabe 4',parts:[
  'Hi Beth,\n\nHow was your trip to the activity centre?\n\nYou know I love ',
  ' (Freiluft-) activities, so I tried canoeing last weekend. Our group took a trip down the River Wye.\n\nThe trip wasn’t ',
  ' (gefährlich), of course, but we had to wear special ',
  ' (Ausrüstung) to keep us ',
  ' (sicher).\n\nGuess what? I wasn’t so bad. We had a friendly and ',
  ' (geduldig) instructor. She said I was very ',
  ' (begabt). ☺\n\nMara was there too. She’s a really ',
  ' (leistungsorientiert) girl and always wants to be most ',
  ' (erfolgreich). She was even ',
  ' (frech) to me. Well, forget about that …\n\nThe canoeing trip was great fun. In the evening I was ',
  ' (erschöpft) too, but I had a fantastic day.\n\nSee you soon!\nJulie'
 ],answers:[['outdoor'],['dangerous'],['equipment'],['safe'],['patient'],['talented'],['competitive'],['successful'],['cheeky'],['exhausted']]}]},
 {title:'Lückentext 2 · Station 2',groups:[
  {title:'Aufgabe 2 · Complete the sentences',parts:[
   'Example: I have a sore throat. I need my scarf.\n\n1. “Look, there has been an ',
   '. We must call an ambulance!”\n\n2. When I cut my finger, it started to ',
   ' badly.\n\n3. Your ',
   ' is a part of your leg.\n\n4. When you ',
   ' your ankle, you should put a bandage on it.\n\n5. “Yummy! Our pizza is ready. Let’s take it out.” – “Be careful! It’s hot. Don’t ',
   ' your hand when you take it out.”\n\n6. Call 999 for the ',
   ' services in the UK.'
  ],answers:[['accident'],['bleed'],['knee'],['sprain','twist','hurt'],['burn'],['emergency']]},
  {title:'Aufgabe 3 · Put in the right verb',parts:[
   '1. You ',
   ' (have / make) an accident.\n\n2. You ',
   ' (invite / call) the operator.\n\n3. You ',
   ' (give / ask) your name on the phone.\n\n4. You ',
   ' (speak / say) where you are.\n\n5. You ',
   ' (stay with / wait for) the hurt person.\n\n6. You ',
   ' (take / bring) a person to hospital.'
  ],answers:[['have'],['call'],['give'],['say'],['stay with'],['take']]}
 ]}
];
let gapStation=null;
function gapStorageKey(n){return `vb2gap_${soloName}_station_${n+1}`;}
function gapLoad(n){try{const v=JSON.parse(localStorage.getItem(gapStorageKey(n))||'null');return Array.isArray(v)?v:[];}catch{return [];}}
function gapSave(n,values){localStorage.setItem(gapStorageKey(n),JSON.stringify(values));}
function gapFields(n){return GAP_SETS[n].groups.flatMap(g=>g.answers);}
// Erstversuche bleiben pro Kind und Aufgabe lokal gespeichert.
// Die Schluessel sind kompatibel mit der zuvor verwendeten Lernverlauf-Version.
function firstKey(type,id){return `vb2first_${soloName}_${type}_${id}`;}
function firstRead(type,id){try{return JSON.parse(localStorage.getItem(firstKey(type,id))||'null');}catch{return null;}}
function firstCapture(type,id,answers,values,title){
 if(!soloName||firstRead(type,id))return;
 const inputs=values.map(v=>String(v||''));
 const errors=answers?inputs.map((answer,i)=>({position:i+1,answer,correct:(answers[i]||[]).join(' / '),ok:(answers[i]||[]).some(a=>grammarNormalize(a)===grammarNormalize(answer))})).filter(x=>!x.ok):[];
 const record={title,total:inputs.length,correct:answers?inputs.length-errors.length:null,errors,inputs,checkedAt:Date.now(),selfCheck:!answers};
 try{localStorage.setItem(firstKey(type,id),JSON.stringify(record));}catch{}
}
function firstSummary(type,id,values,answers){
 const first=firstRead(type,id);if(!first)return '';
 const current=answers?answers.filter((a,i)=>a.some(x=>grammarNormalize(x)===grammarNormalize(values[i]))).length:null;
 const original=first.selfCheck?'Freie Sätze – Selbstkontrolle':`${Number(first.correct)||0} von ${first.total} richtig`;
 const now=answers?`${current} von ${answers.length} richtig`:'Freie Sätze – Selbstkontrolle';
 const errors=first.selfCheck?'<p>Deine ersten Sätze sind gespeichert und können mit den Musterlösungen verglichen werden.</p>':(first.errors||[]).length?`<details><summary>Fehler des ersten Versuchs (${first.errors.length})</summary>${first.errors.map(x=>`<p><strong>Nr. ${Number(x.position)}:</strong> ${esc(x.answer||'(leer)')} → ${esc(x.correct||'')}</p>`).join('')}</details>`:'<p>Beim ersten Versuch alles richtig! 🎉</p>';
 return `<div style="margin:16px 0;padding:14px;border:1px solid #8c86bd;border-radius:12px"><h3>📋 Dein Lernverlauf</h3><p><strong>Erster Versuch:</strong> ${original}</p><p><strong>Aktueller Stand:</strong> ${now}</p>${errors}<p class="muted">Der erste Versuch bleibt auf diesem Handy gespeichert.</p></div>`;
}

function gapRender(n,checked=false){
 if(!soloName){soloChooseName();return;}
 gapStation=n;
  if(!checked)gapSave(n,[]);
  const data=GAP_SETS[n],saved=gapLoad(n),answers=gapFields(n);let pos=0;
 const body=data.groups.map(group=>{
  let html='';for(let i=0;i<group.answers.length;i++){
   const idx=pos++,value=String(saved[idx]||''),correct=group.answers[i].some(a=>a.toLocaleLowerCase('en')===value.trim().toLocaleLowerCase('en'));
   html+=esc(group.parts[i]).replace(/\n/g,'<br>');
   html+=`<input data-gap="${idx}" aria-label="Lücke ${idx+1}" autocomplete="off" autocapitalize="none" spellcheck="false" value="${esc(value)}" style="display:inline-block;vertical-align:middle;box-sizing:border-box;max-width:130px;width:29vw;min-width:88px;height:38px;margin:2px 3px;padding:5px 7px;border:2px solid ${checked?(correct?'#6ee7a8':'#ff8d8d'):'#8c86bd'};border-radius:7px;background:#fff;color:#17152b;font-size:16px;line-height:1.2">`;
   if(checked&&!correct)html+=`<span style="color:#ffb0b0;font-weight:600"> (${esc(group.answers[i].join(' / '))})</span>`;
  }
  html+=esc(group.parts[group.answers.length]).replace(/\n/g,'<br>');
  return `<h3>${esc(group.title)}</h3><p style="line-height:1.85;overflow-wrap:break-word">${html}</p>`;
 }).join('');
 const count=answers.filter((a,i)=>a.some(x=>x.toLowerCase()===String(saved[i]||'').trim().toLowerCase())).length;
 app.innerHTML=card(`<h2>✍️ ${esc(data.title)}</h2><p>Schreibe die englischen Wörter in die Lücken. Die Reihenfolge entspricht dem Arbeitsblatt. Beim erneuten Öffnen beginnt die Übung mit leeren Feldern.</p>${checked?`<p class="good"><strong>${count} von ${answers.length} richtig.</strong> Rote Lücken kannst du verbessern und erneut prüfen.</p>`:''}${body}${firstSummary('gap',n,saved,answers)}<div class="buttons">${btn('✅ Antworten prüfen','gapCheck')}${btn('🔄 Lücken leeren','gapClear','alt')}</div>`)+card(btn('Zur Battle-Auswahl','soloHome','alt'));
}
function gapCollect(){if(gapStation===null)return;gapSave(gapStation,Array.from(document.querySelectorAll('[data-gap]'),el=>el.value));}
function gapCheck(){if(gapStation===null)return;gapCollect();firstCapture('gap',gapStation,gapFields(gapStation),gapLoad(gapStation),GAP_SETS[gapStation].title);gapRender(gapStation,true);}
function gapClear(){if(gapStation===null)return;gapSave(gapStation,[]);gapRender(gapStation);}

// Grammar: Original order of normal exercises; no Diff corner.
// A blank item has prefix/suffix, accepted answers, and optional hint.
// Open sentences are self-checked against examples, not automatically marked wrong.
const GRAMMAR=[
 {title:'Station 1 · Grammar',tasks:[
  {title:'1 · Put in the right adverbs',items:[
   ['When Beth tried horse riding, she rode ',' (careful).',['carefully']],
   ['Katie won the rock climbing competition ',' (easy).',['easily']],
   ['Jerry is a fantastic rugby player because he can run ',' (fast).',['fast']],
   ['When the students play rugby, their teacher calls ',' (loud) to them.',['loudly']],
   ['Tom works ',' (hard) to become a good tennis player.',['hard']],
   ['Everyone says that Tom plays ',' (brilliant).',['brilliantly']]
  ],example:'Mark learned the rules quickly (quick).'},
  {title:'2 · Adjective or adverb? Put in the right form',intro:'Last week Mark’s class went on a school trip. They tried outdoor rock climbing.',items:[
   ['Everyone was ',' (excited).',['excited']],
   ['Their instructor told them that climbing is a ',' (dangerous) sport if you aren’t careful.',['dangerous']],
   ['Their instructor told them that climbing is a dangerous sport if you aren’t ',' (careful).',['careful']],
   ['So the students borrowed helmets and other equipment to keep them ',' (safe).',['safe']],
   ['Then they started to climb ',' (slow).',['slowly']],
   ['After some time they were all ',' (hungry).',['hungry']],
   ['“Oh, look at the weather,” the instructor said. “It’s going to rain ',' (heavy) soon. Let’s go back!”',['heavily']],
   ['The students ate their sandwiches ',' (quick) and climbed down again.',['quickly']],
   ['Everything went ',' (good) and they got back home safely.',['well']],
   ['Everything went well and they got back home ',' (safe).',['safely']]
  ]},
  {title:'3 · Put in the right form',intro:'Wörter: myself · yourself · himself · herself · ourselves · themselves · each other',items:[
   ['Beth enjoyed ',' at the activity centre.',['herself']],
   ['Mark hurt ',' when he tried horse riding.',['himself']],
   ['The rugby players watched ',' in a video of the last rugby game.',['themselves']],
   ['This morning I made ',' breakfast.',['myself']],
   ['Teacher: “Did you do your homework ','?”',['yourself']],
   ['We made ',' pizza for dinner.',['ourselves']],
   ['Laura and her friend haven’t seen ',' for a long time.',['each other']]
  ]},
  {title:'4 · Write four sentences about rugby',intro:'Use adjectives and adverbs. Wörter: popular · fast · quick · slow · easy · safe',open:[
   'Rugby is a popular sport.', 'It is a fast sport too.',
   'The players must run quickly.', 'You can learn the rules easily.'
  ]}
 ]},
 {title:'Station 2 · Grammar',tasks:[
  {title:'1 · Put in the right verb forms',example:'An old man has cut (cut) his finger.',items:[
   ['A little boy has ',' (burn) his hand.',['burnt','burned']],
   ['A young girl has ',' (break) her leg.',['broken']],
   ['Linda has ',' (give) a woman some tablets.',['given']],
   ['Four people have ',' (have) an accident.',['had']],
   ['Two women have ',' (sprain) their ankles.',['sprained']],
   ['Three men have ',' (hurt) their heads.',['hurt']]
  ]},
  {title:'2 · Megan works for the emergency services. Make sentences',intro:'Use the present perfect. Vorgaben in Arbeitsblatt-Reihenfolge: work on the computer · open the window · hang up her uniform · drink tea · make a phone call · write a message.',open:[
   'Megan has already worked on the computer.',
   'She has already opened the window.',
   'She has already hung up her uniform.',
   'She has already drunk tea.',
   'She has already made a phone call.',
   'She has already written a message.'
  ]},
  {title:'3 · What has happened? Write six sentences in the present perfect',intro:'Use these verbs in order: fall off · hurt · come · arrive · put · take. Example: There has been an accident. Die Bildaufgabe wird hier mit Satzhinweisen geübt.',open:[
   'A boy has fallen off his bike.',
   'He has hurt his leg.',
   'Two police officers have come.',
   'An ambulance has arrived.',
   'The doctor has put a bandage on the boy’s leg.',
   'The dogs have taken the sausages.'
  ]},
  {title:'4 · Complete the sentences. Use the present perfect',intro:'Jamie: watch TV ✓, phone his brother ✗. Kim: have football training ✓, do her homework ✗. Max and Lucy: play tennis ✓, be to the hospital ✗. My friend and I: go shopping ✓, buy a present ✗.',example:'Jamie has already watched TV. He hasn’t phoned his brother yet.',items:[
   ['1. Kim ',' football training.',['has already had']],
   ['   She ',' her homework yet.',['hasn’t done',"hasn't done"]],
   ['2. Max and Lucy ',' tennis.',['have already played']],
   ['   They ',' to the hospital yet.',['haven’t been',"haven't been"]],
   ['3. My friend and I ',' shopping.',['have already gone']],
   ['   We ',' a present yet.',['haven’t bought',"haven't bought"]]
  ]},
  {title:'5 · What about you? Write two sentences',intro:'What have you already done? What haven’t you done yet? Schreibe zwei eigene Sätze.',open:[
   'I have already helped my grandparents in the garden.',
   'I haven’t finished my homework yet.'
  ]},
  {title:'6 · Make questions and answer them. Give short answers',intro:'Example: you and your family / ever / be to Wales? → Have you and your family ever been to Wales? → Yes, we have. / No, we haven’t.',open:[
   'Have you ever won a prize? | Yes, I have. / No, I haven’t.',
   'Has your best friend ever been in hospital? | Yes, he/she has. / No, he/she hasn’t.',
   'Has your best friend ever had a cast? | Yes, he/she has. / No, he/she hasn’t.',
   'Have your friends ever tried rock climbing? | Yes, they have. / No, they haven’t.'
  ],prompts:[
   'you / ever / win a prize?',
   'your best friend / ever / be in hospital?',
   'your best friend / ever / have a cast?',
   'your friends / ever / try rock climbing?'
  ]},
  {title:'7 · Complete the dialogue. Use the simple past or the present perfect',intro:'Ellie and Brad talk about the activity centre and Brad’s accident.',items:[
   ['Ellie: Hello Brad. How are you? ',' you already visited (visit) the new activity centre?',['Have']],
   ['Brad: No, I ',' (not visit) it yet.',['haven’t visited',"haven't visited"]],
   ['I ',' (have) a little accident last week.',['had']],
   ['Ellie: Oh, no! What happened? Brad: I ',' (fall) off my skateboard',['fell']],
   [' and ',' (twist) my knee last Friday.',['twisted']],
   ['Ellie: ',' you been (be) to the doctor yet?',['Have']],
   ['Brad: Yes, I ',' already seen (see) a doctor.',['have']],
   ['I ',' (go) to the hospital yesterday.',['went']],
   ['They ',' (give) me a bandage and some tablets. It’s not so bad. Don’t worry. Ellie: I hope you get better soon.',['gave']]
  ]}
 ]}
];
let grammarStation=null,grammarTask=null;
function grammarKey(st,task){return `vb2grammar_${soloName}_station${st+1}_task${task+1}`;}
function grammarRead(st,task){try{const v=JSON.parse(localStorage.getItem(grammarKey(st,task))||'[]');return Array.isArray(v)?v:[];}catch{return [];}}
function grammarWrite(st,task,v){localStorage.setItem(grammarKey(st,task),JSON.stringify(v));}
function grammarNormalize(v){return String(v||'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');}
function grammarMenu(){grammarCollect();if(!soloName){soloChooseName();return;}grammarStation=null;grammarTask=null;app.innerHTML=card(`<h2>📘 Grammatik · ${esc(soloName)}</h2><p>Wähle Station 1 oder 2. Die Aufgaben stehen in der Reihenfolge des Arbeitsblatts. Ohne Diff corner.</p><div class="buttons">${btn('Station 1 · Aufgaben 1–4','grammarStation0')}${btn('Station 2 · Aufgaben 1–7','grammarStation1')}</div>`)+card(btn('Zur Battle-Auswahl','soloHome','alt'));}
function grammarStationMenu(st){grammarCollect();grammarStation=st;grammarTask=null;const s=GRAMMAR[st];app.innerHTML=card(`<h2>📘 ${esc(s.title)}</h2><p>Tippe die englischen Antworten selbst ein. Freie Sätze werden anhand von Beispielen selbst kontrolliert.</p>${s.tasks.map((t,i)=>`<div class="player"><strong>${esc(t.title)}</strong><div class="buttons">${btn('Aufgabe öffnen',`grammarTask${i}`)}</div></div>`).join('')}`)+card(btn('Zur Grammatik-Auswahl','grammarMenu','alt'));}
function grammarCollect(){if(grammarStation===null||grammarTask===null)return;const fields=Array.from(document.querySelectorAll('[data-grammar]'));if(!fields.length)return;grammarWrite(grammarStation,grammarTask,fields.map(el=>el.value));}
function grammarRender(st,task,checked=false,reveal=false){
 if(!soloName){soloChooseName();return;}grammarStation=st;grammarTask=task;
 if(!checked&&!reveal)grammarWrite(st,task,[]);
  const t=GRAMMAR[st].tasks[task],values=grammarRead(st,task),isOpen=!!t.open;
 const inputStyle='box-sizing:border-box;display:inline-block;vertical-align:middle;max-width:190px;width:43vw;min-width:100px;min-height:38px;margin:3px 4px;padding:6px 8px;border-radius:8px;background:#fff;color:#17152b;font-size:16px;line-height:1.3';
 let content='';
 if(t.items){
  content=t.items.map(([before,after,answers],i)=>{
   const val=String(values[i]||''),ok=answers.some(a=>grammarNormalize(a)===grammarNormalize(val));
   return `<div style="margin:12px 0;line-height:1.85;overflow-wrap:break-word"><strong>${i+1}.</strong> ${esc(before)}<input data-grammar="${i}" aria-label="Aufgabe ${i+1}" autocomplete="off" autocapitalize="none" spellcheck="false" value="${esc(val)}" style="${inputStyle};border:2px solid ${checked?(ok?'#6ee7a8':'#ff8d8d'):'#8c86bd'}">${esc(after)}${reveal&&!ok?`<div style="color:#ffb0b0;font-weight:600">Lösung: ${esc(answers.join(' / '))}</div>`:''}</div>`;
  }).join('');
 }else{
  content=t.open.map((example,i)=>`<div style="margin:14px 0"><label style="display:block;margin-bottom:5px"><strong>${i+1}.</strong> ${esc(t.prompts?.[i]||'Schreibe einen vollständigen englischen Satz.')}</label><textarea data-grammar="${i}" rows="2" spellcheck="false" style="box-sizing:border-box;width:100%;max-width:100%;padding:9px;border-radius:8px;font-size:16px;background:white;color:#17152b">${esc(values[i]||'')}</textarea>${reveal?`<p class="muted">Musterlösung: <strong>${esc(example)}</strong></p>`:''}</div>`).join('');
 }
 const total=t.items?.length||t.open.length,correct=t.items?t.items.filter((x,i)=>x[2].some(a=>grammarNormalize(a)===grammarNormalize(values[i]))).length:0;
 app.innerHTML=card(`<h2>📘 ${esc(GRAMMAR[st].title)}</h2><h3>${esc(t.title)}</h3>${t.intro?`<p>${esc(t.intro)}</p>`:''}${t.example?`<p class="muted">Example: ${esc(t.example)}</p>`:''}<p class="muted">${isOpen?'Schreibe selbst. Über „💡 Lösung anzeigen“ kannst du die Musterlösungen ansehen; andere richtige Sätze sind möglich.':'Trage die richtige englische Form ein.'} Beim erneuten Öffnen beginnt die Übung mit leeren Feldern.</p>${checked?`<p class="good"><strong>${isOpen?'Deine Sätze sind gespeichert. Vergleiche sie bei Bedarf mit den Musterlösungen.':`${correct} von ${total} richtig. Verbessere die roten Felder selbst.`}</strong></p>`:''}${content}${firstSummary('grammar',st+'_'+task,values,t.items?.map(x=>x[2])||null)}<div class="buttons">${btn(isOpen?'✅ Eingaben speichern':'✅ Antworten prüfen','grammarCheck')}${btn('💡 Lösung anzeigen','grammarReveal','alt')}${btn('🔄 Eingaben leeren','grammarClear','alt')}</div>`)+card(btn('Zur Aufgabenübersicht','grammarBack','alt'));
}
function grammarCheck(){if(grammarStation===null||grammarTask===null)return;grammarCollect();const t=GRAMMAR[grammarStation].tasks[grammarTask];firstCapture('grammar',grammarStation+'_'+grammarTask,t.items?.map(x=>x[2])||null,grammarRead(grammarStation,grammarTask),GRAMMAR[grammarStation].title+' · '+t.title);grammarRender(grammarStation,grammarTask,true);}
function grammarReveal(){if(grammarStation===null||grammarTask===null)return;grammarCollect();grammarRender(grammarStation,grammarTask,true,true);}
function grammarClear(){if(grammarStation===null||grammarTask===null)return;grammarWrite(grammarStation,grammarTask,[]);grammarRender(grammarStation,grammarTask);}

const key='vb2solo';
const SOLO_NAMES=['Luca','Semir','Talea','Nele'];
let soloName=localStorage.getItem('vb2solo_name')||'';
let dashboardUnsubscribe=null,soloHeartbeat=null;
function resetStamp(name){return Math.max(Number(resetState.all)||0,Number(resetState[name])||0);}
function clearLocalLearning(name){
 const prefixes=[`vb2solo_${name}_battle_`,`vb2first_${name}_`,`vb2grammar_${name}_`,`vb2gap_${name}_`,`vb2math_${name}_battle_`];
 for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&prefixes.some(p=>k.startsWith(p)))localStorage.removeItem(k);}
 if(mathName===name)mathRun=null;if(soloName===name){solo=null;stopSoloHeartbeat();grammarStation=null;grammarTask=null;gapStation=null;}
}
function applyResetState(state){
 resetState=state&&typeof state==='object'?state:{};
 let activeWasReset=false;
 for(const name of SOLO_NAMES){
  const stamp=resetStamp(name),seenKey=`vb2reset_seen_${name}`;
  if(stamp>Number(localStorage.getItem(seenKey)||0)){
   clearLocalLearning(name);localStorage.setItem(seenKey,String(stamp));
   if(soloName===name)activeWasReset=true;
  }
 }
 resetReady=true;
 if(activeWasReset){soloHome();msg('Lernstände und Fehlerlisten wurden zurückgesetzt.');}
}
function watchResets(){
 if(resetUnsubscribe){resetUnsubscribe();resetUnsubscribe=null;}
 resetReady=false;
 resetUnsubscribe=onValue(ref(db,'learningResets'),snap=>applyResetState(snap.val()),e=>msg('Reset-Abgleich fehlgeschlagen: '+e.message,true));
}

function stopSoloHeartbeat(){if(soloHeartbeat!==null){clearInterval(soloHeartbeat);soloHeartbeat=null;}}
function startSoloHeartbeat(){stopSoloHeartbeat();soloHeartbeat=setInterval(()=>{if(solo&&soloName)void syncSolo();},30000);}
function stopDashboard(){if(dashboardUnsubscribe){dashboardUnsubscribe();dashboardUnsubscribe=null;}}
function stopClock(){if(clock!==null){clearInterval(clock);clock=null;}lastClockText='';}
function home(){stopDashboard();stopSoloHeartbeat();if(unsubscribe){unsubscribe();unsubscribe=null;}stopClock();code='';role='';slot='';room=null;solo=null;busy=false;previousStageKey='';status.textContent='';app.innerHTML=card(`<h2>Was möchtest du machen?</h2><div class="buttons">${btn('👥 Spiel beitreten','join')}${btn('🇬🇧 Englisch','solo')}${btn('🔢 Mathe Klasse 7 NRW','mathChoose')}</div>`)+card('<p class="muted">Hier kannst du alleine lernen oder mit einem Raumcode am Battle teilnehmen. Alle vier Kinder können gleichzeitig auf ihren eigenen Geräten lernen.</p>');}
function listen(){if(unsubscribe)unsubscribe();stopClock();unsubscribe=onValue(ref(db,`rooms/${code}`),snap=>{room=snap.val();if(!room){msg('Raum nicht gefunden oder gelöscht.',true);return;}render();},e=>msg('Firebase-Zugriff verweigert: '+e.message,true));}
function current(){const b=Number(room?.meta?.battle||1)-1;return (room?.meta?.subject==='math'?MATH_BATTLES:BATTLES)[b]?.[Number(room?.meta?.index||0)%30];}
function players(){return Object.entries(room?.slots||{}).map(([id,p])=>({id,...p})).sort((a,b)=>(b.score||0)-(a.score||0));}
function roster(){return players().map((p,i)=>`<div class="player row"><span>${i+1}. ${esc(p.name)}</span><span class="score">${p.score||0}</span></div>`).join('')||'<p>Noch keine Spieler.</p>';}
function chooseBattle(){app.innerHTML=card(`<h2>🎮 Battle auswählen</h2><p>Welches Battle soll gespielt werden?</p><label>Battle<select id="battle-choice"><option value="1">Battle 1 – 30 Fragen</option><option value="2">Battle 2 – 30 Fragen</option><option value="3">Battle 3 – 30 Fragen</option></select></label>${btn('Raum erstellen','createRoom')}`)+card(btn('Zurück','home','alt'));}
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
async function makeRoom(){const battle=Number(document.querySelector('#battle-choice')?.value||1);if(!uid){msg('Verbindung wird hergestellt. Bitte kurz warten.',true);return;}code=String(Math.floor(100000+Math.random()*900000));role='host';slot='';try{await set(ref(db,`rooms/${code}/meta`),{hostUid:uid,stage:'lobby',battle,index:(battle-1)*30,createdAt:Date.now()});listen();}catch(e){msg('Raum konnte nicht erstellt werden: '+e.message,true);}}
function joinForm(){app.innerHTML=card(`<h2>Spiel beitreten</h2><label>Raumcode<input id="roomcode" inputmode="numeric" maxlength="6" placeholder="6-stelliger Code"></label><label>Dein Name<select id="playername">${names.map(n=>`<option>${n}</option>`).join('')}</select></label>${btn('Beitreten','enter')}`)+card(btn('Zurück','home','alt'));}
async function enter(){const c=document.querySelector('#roomcode').value.trim(),name=document.querySelector('#playername').value;if(!uid){msg('Anmeldung läuft. Bitte kurz warten.',true);return;}if(!/^\d{6}$/.test(c)){msg('Bitte sechsstelligen Code eingeben.',true);return;}try{const snap=await get(ref(db,`rooms/${c}`));if(!snap.exists()){msg('Raumcode nicht gefunden.',true);return;}const r=snap.val();let s=Object.keys(r.slots||{}).find(k=>r.slots[k]?.name===name&&r.slots[k]?.uid===uid);if(!s){if(r.meta?.stage!=='lobby'){msg('Das Battle läuft bereits. Bitte einen neuen Raum im Warteraum öffnen.',true);return;}s=String(names.indexOf(name)+1);if(r.slots?.[s]){msg('Dieser Name ist schon vergeben. Bitte anderen Namen wählen.',true);return;}await set(ref(db,`rooms/${c}/slots/${s}`),{name,uid,score:0});}code=c;role='player';slot=s;listen();}catch(e){msg('Beitritt fehlgeschlagen: '+e.message,true);}}
async function automaticReveal(){if(busy||role!=='host'||!room||room.meta?.hostUid!==uid||room.meta.stage!=='question')return;busy=true;const battle=room.meta.battle,index=room.meta.index;try{const q=current();if(!q)throw new Error('Frage nicht gefunden');const ans=room.answers?.[index]||{};for(const p of players()){if(Number(ans[p.uid]?.choice)===q.correct){await runTransaction(ref(db,`rooms/${code}/slots/${p.id}/score`),x=>(Number(x)||0)+10);}}if(room?.meta?.battle===battle&&room?.meta?.index===index&&room?.meta?.stage==='question')await update(ref(db,`rooms/${code}/meta`),{stage:'reveal',deadline:Date.now()+REVEAL_MS});}catch(e){msg('Automatische Auswertung fehlgeschlagen: '+e.message,true);}finally{busy=false;}}
async function automaticNext(){if(busy||role!=='host'||!room||room.meta?.hostUid!==uid||room.meta.stage!=='reveal')return;busy=true;const m={...room.meta};try{if(Number(m.index)%30>=29)await update(ref(db,`rooms/${code}/meta`),{stage:'finished',deadline:0});else {const nextIndex=Number(m.index)+1;await update(ref(db,`rooms/${code}/meta`),{stage:'question',index:nextIndex,battle:Number(m.battle),deadline:Date.now()+QUESTION_MS});}}catch(e){msg('Nächste Frage konnte nicht gestartet werden: '+e.message,true);}finally{busy=false;}}
async function hostAction(a){if(role!=='host'||!room||room.meta?.hostUid!==uid){msg('Nur der Schiedsrichter darf das.',true);return;}const m=room.meta;try{if(a==='start'){if(players().length<1){msg('Mindestens ein Spieler muss beitreten.',true);return;}await update(ref(db,`rooms/${code}/meta`),{stage:'question',index:(Number(m.battle)-1)*30,deadline:Date.now()+QUESTION_MS});}if(a==='reset'){await remove(ref(db,`rooms/${code}/answers`));for(const p of players())await set(ref(db,`rooms/${code}/slots/${p.id}/score`),0);await update(ref(db,`rooms/${code}/meta`),{stage:'lobby',battle:Number(m.battle),index:(Number(m.battle)-1)*30,deadline:0});}}catch(e){msg('Aktion fehlgeschlagen: '+e.message,true);}}
async function answer(i){if(role!=='player'||room?.meta?.stage!=='question'||!uid)return;const n=room.meta.index;if(Date.now()>=Number(room.meta.deadline||0)){msg('Die Antwortzeit ist abgelaufen.',true);return;}if(room.answers?.[n]?.[uid]!==undefined)return;try{await set(ref(db,`rooms/${code}/answers/${n}/${uid}`),{choice:i,at:Date.now()});}catch(e){msg('Antwort konnte nicht gespeichert werden: '+e.message,true);}}

// Solo: 30 reguläre Fragen, danach falsch beantwortete Wörter wiederholen.
// Wiederholungen geben keine zusätzlichen Punkte; alle Zustände bleiben lokal gespeichert.
function cleanMistakes(v){const out={};if(!v||typeof v!=='object')return out;for(const [k,n] of Object.entries(v)){const i=Number(k);if(Number.isInteger(i)&&i>=0&&i<30&&Number.isFinite(Number(n))&&Number(n)>0)out[i]=Math.min(9999,Math.floor(Number(n)));}return out;}
function mistakeRows(b,m){return Object.entries(cleanMistakes(m)).map(([idx,count])=>{const q=BATTLES[b]?.[Number(idx)];if(!q)return null;return {word:q.word||q.q,translation:q.options[q.correct],count,idx:Number(idx)};}).filter(Boolean).sort((a,b)=>b.count-a.count||a.word.localeCompare(b.word,'de'));}
function firstMistakeSection(type,id,title,answers){
 const r=firstRead(type,id);
 if(!r)return `<div class="player"><strong>${esc(title)}</strong><p class="muted">Noch kein erster Versuch gespeichert.</p></div>`;
 if(r.selfCheck){
  const entered=(r.inputs||[]).filter(x=>String(x||'').trim()).length;
  return `<div class="player"><strong>${esc(title)}</strong><p>${entered} von ${r.total} Sätzen im ersten Versuch ausgefüllt · Selbstkontrolle</p><details><summary>Erste Antworten ansehen</summary>${(r.inputs||[]).map((x,i)=>`<p><strong>${i+1}.</strong> ${esc(x||'(leer)')}</p>`).join('')}</details></div>`;
 }
 const mistakes=Array.isArray(r.errors)?r.errors:[];
 return `<div class="player"><strong>${esc(title)}</strong><p>Erster Versuch: ${Number(r.correct)||0} von ${r.total} richtig · ${mistakes.length} Fehler</p>${mistakes.length?`<details><summary>Fehler ansehen (${mistakes.length})</summary>${mistakes.map(x=>`<p><strong>Nr. ${Number(x.position)}:</strong> ${esc(x.answer||'(leer)')} → <strong>${esc(x.correct||'')}</strong></p>`).join('')}</details>`:'<p class="good">Alles richtig! 🎉</p>'}</div>`;
}
function showMyMistakes(){
 stopSoloHeartbeat();if(!soloName){soloChooseName();return;}
 const battles=[0,1,2].map(b=>{const entries=mistakeRows(b,soloSaved(b)?.mistakes);return `<h3>Battle ${b+1}</h3>${entries.length?entries.map(x=>`<div class="player"><strong>${esc(x.word)}</strong> – ${esc(x.translation)}<p class="muted">${x.count}× falsch beantwortet</p></div>`).join(''):'<p class="muted">Noch keine Fehler erfasst.</p>'}`;}).join('');
 const grammar=GRAMMAR.map((st,si)=>`<h3>Grammatik · Station ${si+1}</h3>${st.tasks.map((t,ti)=>firstMistakeSection('grammar',si+'_'+ti,t.title,t.items?.map(x=>x[2])||null)).join('')}`).join('');
 const gaps=GAP_SETS.map((set,i)=>firstMistakeSection('gap',i,set.title,gapFields(i))).join('');
 app.innerHTML=card(`<h2>📕 ${esc(soloName)} · Meine Fehlerliste</h2><p>Alle Fehler aus Battles sowie die ersten kontrollierten Versuche bei Grammatik und Lückentexten. Grammatik- und Lückentextdaten sind nur auf diesem Gerät gespeichert.</p><h2>🎮 Battles</h2>${battles}<h2>📘 Grammatik</h2>${grammar}<h2>✍️ Lückentexte</h2>${gaps}`)+card(btn('Zur Battle-Auswahl','soloHome','alt'));
}
function soloKey(b){return `${key}_${soloName}_battle_${b+1}`;}
function soloSave(){if(!solo)return;solo.updatedAt=Date.now();localStorage.setItem(soloKey(solo.battle),JSON.stringify(solo));void syncSolo();}
function soloSaved(b){try{const s=JSON.parse(localStorage.getItem(soloKey(b))||'null');if(!s||s.battle!==b||!Number.isInteger(s.index)||s.index<0||s.index>30||!Number.isFinite(s.score))return null;
 // Alte Speicherstände vor Einführung des Wiederholungsmodus bleiben kompatibel.
 s.wrong=Array.isArray(s.wrong)?s.wrong.filter(n=>Number.isInteger(n)&&n>=0&&n<30):[];
 s.mistakes=cleanMistakes(s.mistakes);s.review=!!s.review;s.reviewPos=Number.isInteger(s.reviewPos)&&s.reviewPos>=0?s.reviewPos:0;
 if(s.reviewPos>=s.wrong.length)s.reviewPos=0;
 return s;
}catch{return null;}}
async function syncSolo(){
 if(!uid||!db||!solo||!soloName||!resetReady)return;
 const currentSolo=solo,name=soloName,device=uid;
 const savedAt=Number(currentSolo.updatedAt)||Date.now();
 try{
  // Always check the current server reset before uploading old work.
  const rs=await get(ref(db,'learningResets'));
  applyResetState(rs.val());
  if(!resetReady||solo!==currentSolo||soloName!==name||savedAt<=resetStamp(name))return;
  await set(ref(db,`soloProgress/${device}/${name}/battle${currentSolo.battle+1}`),{
   name,battle:currentSolo.battle+1,done:currentSolo.index,
   correct:Math.floor(currentSolo.score/10),score:currentSolo.score,
   finished:!!currentSolo.finished,mistakes:cleanMistakes(currentSolo.mistakes),updatedAt:savedAt
  });
 }catch(e){msg('Online-Speicherung noch nicht möglich: '+e.message,true);}
}
function soloChooseName(){if(!resetReady){msg('Lernstände werden abgeglichen. Bitte kurz warten.',true);return;}stopSoloHeartbeat();app.innerHTML=card(`<h2>📚 Wer lernt gerade?</h2><p>Wähle deinen Namen, damit der Schiedsrichter deinen Lernfortschritt sehen kann.</p><div class="buttons">${SOLO_NAMES.map((n,i)=>btn(esc(n),`soloName${i}`)).join('')}</div>`)+card(btn('Zurück','home','alt'));}
function soloSetName(i){soloName=SOLO_NAMES[i];localStorage.setItem('vb2solo_name',soloName);soloHome();}
function soloHome(){grammarCollect();stopSoloHeartbeat();if(!soloName){soloChooseName();return;}solo=null;app.innerHTML=card(`<h2>📚 ${esc(soloName)} · Battle auswählen</h2><p>30 Fragen pro Battle. Falsche Wörter werden danach wiederholt. Der Fortschritt wird auf diesem Handy und zusätzlich online gespeichert.</p>${[0,1,2].map(b=>{const saved=soloSaved(b),done=saved?.index||0;const reviewing=saved&&!saved.finished&&saved.review&&saved.wrong.length;return `<div class="player"><h3>Battle ${b+1}</h3><p>${done} von 30 Fragen erledigt${reviewing?` · 🔁 ${saved.wrong.length} Wörter üben`:''}${saved?.finished?' · abgeschlossen':''}</p><div class="buttons">${btn(saved?'Neu beginnen':'Starten',`soloStart${b}`)}${saved&&!saved.finished?btn('Fortsetzen',`soloResume${b}`,'alt'):''}</div></div>`;}).join('')}${btn('📘 Grammatik · Station 1 & 2','grammarMenu')}${btn('✍️ Lückentext 1 · Station 1','gap0')}${btn('✍️ Lückentext 2 · Station 2','gap1')}${btn('📕 Meine Fehlerliste','soloMistakes','alt')}${btn('Anderen Namen wählen','soloChangeName','alt')}`)+card(btn('Zurück','home','alt'));}
function soloStart(b){if(!resetReady){msg('Bitte kurz auf den Reset-Abgleich warten.',true);return;}const previous=soloSaved(b);solo={battle:b,index:0,score:0,finished:false,wrong:[],review:false,reviewPos:0,mistakes:cleanMistakes(previous?.mistakes)};soloSave();soloQuestion();}
function soloResume(b){if(!resetReady){msg('Bitte kurz auf den Reset-Abgleich warten.',true);return;}solo=soloSaved(b);if(!solo){soloStart(b);return;}void syncSolo();if(solo.finished)soloFinished();else soloQuestion();}
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
  if(!/^battle[123]$/.test(battle)||!v||typeof v!=='object'||Number(v.updatedAt||0)<=resetStamp(name))continue;
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
  return `<details style="margin:12px 0;padding:12px;background:rgba(255,255,255,.06);border-radius:12px"><summary><strong>${esc(name)}</strong> ${recent?'🟢':'⚪'} · Details ansehen</summary>${records.map((v,i)=>`<p><strong>Battle ${i+1}:</strong> ${v?`${Math.min(30,Number(v.done)||0)}/30 erledigt · ${Number(v.correct)||0} richtig · ${Number(v.score)||0} Punkte · zuletzt ${v.updatedAt?new Date(v.updatedAt).toLocaleString('de-DE'):'–'}`:'Noch keine Online-Daten'}</p>`).join('')}</details>`;
 }).join('');
 app.innerHTML=card('<h2>📊 Live-Lernübersicht</h2><p>Alle vier Kinder auf einen Blick. In den Battle-Spalten steht: erledigte Fragen / 30 · Punkte. 🟢 bedeutet Aktivität in den letzten 90 Sekunden.</p>'+table+'<p class="muted">Wische die Tabelle seitlich, um alle Spalten zu sehen.</p><h3>Einzelheiten</h3>'+detailRows)+card(btn('Zurück','home','alt'));
}
function showDashboard(){
 stopDashboard();stopSoloHeartbeat();
 app.innerHTML=card('<h2>📊 Live-Lernübersicht</h2><p>Online-Lernstände werden geladen …</p>')+card(btn('Zurück','home','alt'));
 if(!uid){msg('Bitte kurz warten, bis die Anmeldung abgeschlossen ist.',true);return;}
 dashboardUnsubscribe=onValue(ref(db,'soloProgress'),snap=>{renderDashboard(snap.val());},e=>msg('Lernübersicht konnte nicht geladen werden: '+e.message,true));
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

document.addEventListener('click',e=>{const ma=e.target.closest('[data-mathanswer]');if(ma){mathAnswer(Number(ma.dataset.mathanswer));return;}const mathButton=e.target.closest('[data-action]');if(mathButton&&mathAction(mathButton.dataset.action))return;const a=e.target.closest('[data-action]'),ans=e.target.closest('[data-answer]'),sa=e.target.closest('[data-soloanswer]');if(ans){answer(Number(ans.dataset.answer));return;}if(sa){soloAnswer(Number(sa.dataset.soloanswer));return;}if(!a)return;const v=a.dataset.action;if(v==='home')home();else if(v==='host'||v==='createRoom'||v==='dashboard'||v==='start'||v==='reset')return;else if(v==='join')joinForm();else if(v==='enter')enter();else if(['start','reset'].includes(v))hostAction(v);else if(v==='solo')soloChooseName();else if(v==='dashboard')void showDashboard();else if(v==='soloChangeName')soloChooseName();else if(v==='soloMistakes')showMyMistakes();else if(v==='soloHome')soloHome();else if(v==='grammarMenu')grammarMenu();else if(v==='grammarStation0')grammarStationMenu(0);else if(v==='grammarStation1')grammarStationMenu(1);else if(/^grammarTask\d+$/.test(v)){const n=Number(v.slice(11));if(grammarStation!==null&&n<GRAMMAR[grammarStation].tasks.length)grammarRender(grammarStation,n);}else if(v==='grammarCheck')grammarCheck();else if(v==='grammarReveal')grammarReveal();else if(v==='grammarClear')grammarClear();else if(v==='grammarBack')grammarStationMenu(grammarStation);else if(v==='gap0')gapRender(0);else if(v==='gap1')gapRender(1);else if(v==='gapCheck')gapCheck();else if(v==='gapClear')gapClear();else if(/^soloName[0-3]$/.test(v))soloSetName(Number(v.slice(-1)));else if(/^soloStart[012]$/.test(v))soloStart(Number(v.slice(-1)));else if(/^soloResume[012]$/.test(v))soloResume(Number(v.slice(-1)));else if(v==='soloNext')soloNext();});
document.addEventListener('input',e=>{if(e.target.matches('[data-gap]'))gapCollect();if(e.target.matches('[data-grammar]'))grammarCollect();});
document.addEventListener('change',e=>{if(e.target.matches('[data-grammar]'))grammarCollect();});
document.addEventListener('focusout',e=>{if(e.target.matches('[data-grammar]'))grammarCollect();});
window.addEventListener('pagehide',()=>grammarCollect());
home();try{const fb=initializeApp(firebaseConfig),auth=getAuth(fb);db=getDatabase(fb);onAuthStateChanged(auth,u=>{if(u){uid=u.uid;watchResets();}else{uid='';resetReady=false;if(resetUnsubscribe){resetUnsubscribe();resetUnsubscribe=null;}signInAnonymously(auth).catch(e=>msg('Anmeldung fehlgeschlagen: '+e.message,true));}});}catch(e){msg('Firebase-Konfiguration fehlerhaft: '+e.message,true);}
