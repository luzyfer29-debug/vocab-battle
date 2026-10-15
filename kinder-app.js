import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {getAuth,signInAnonymously,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {getDatabase,ref,onValue,get,set,update,runTransaction,remove} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';
import {firebaseConfig} from './firebase-config.js';
import {BATTLES} from './questions.js';
import {MATH_BATTLES,MATH_EXAM_BATTLE,MATH_RATIONAL_EXAM_BATTLE,MATH_PROPORTIONAL_EXAM_BATTLE,MATH_PROPORTIONAL_CLASSWORKS,MATH_PROPORTIONAL_PRACTICE_BLOCKS,PROPORTIONAL_WORKSHEET_CARDS,PROPORTIONAL_FLASH_CARDS} from './math-questions.js?v=proportional-mixed-20261015c';
const RATIONAL_MATH_TITLES=['Rationale Zahlen · Aufgabe 1','Rationale Zahlen · Aufgabe 2','Rationale Zahlen · Aufgabe 3','Rationale Zahlen · Aufgabe 4'];
import {FRACTION_MODULES} from './fractions-data.js?v=20261014-probetest';
import {WRITING_TASKS} from './writing-data.js';
const LISTENING_QUESTIONS=[
 {q:'Welche Reihenfolge haben die Aktivitäten im Radiobeitrag?',options:['Radio-Studio → Zipline → Rafting → Skatepark → Erfrischungen → Cardiff-Schild','Zipline → Radio-Studio → Skatepark → Rafting → Cardiff-Schild → Erfrischungen','Radio-Studio → Rafting → Zipline → Erfrischungen → Skatepark → Cardiff-Schild','Cardiff-Schild → Radio-Studio → Zipline → Rafting → Skatepark → Erfrischungen'],correct:0},
 {q:'Welche Aktivität kannst du nahe Mount Snowdon ausprobieren?',options:['Eine Zipline','Skifahren','Reiten','Klettern in einer Halle'],correct:0},
 {q:'Welche Wassersportarten werden genannt?',options:['Segeln und Tauchen','Kanufahren und Rafting','Schwimmen und Surfen','Wasserski und Rudern'],correct:1},
 {q:'Was kannst du in der Stadt mit deinem Fahrrad machen?',options:['Eine geführte Tour fahren','Auf einer Rennstrecke fahren','Durch die Innenstadt fahren','Ein Fahrradrennen ansehen'],correct:2},
 {q:'Wo kannst du Skateboard fahren?',options:['In einem Skatepark','Im Radio-Studio','Auf einer Zipline','Auf dem Wasser'],correct:0},
 {q:'Welche weiteren Sportarten werden als Beispiele genannt?',options:['Tennis und Hockey','Tischtennis, Football und Netball','Basketball und Golf','Badminton und Rugby'],correct:1},
 {q:'The radio programme has the best tips for the weekend.',options:['Richtig','Falsch'],correct:0},
 {q:'Maisie Reedman is part of the radio team.',options:['Richtig','Falsch'],correct:1},
 {q:'The zip line in Cardiff is the longest in Europe.',options:['Richtig','Falsch'],correct:1},
 {q:'They will close some roads in the city centre.',options:['Richtig','Falsch'],correct:0},
 {q:'You need a helmet for some sports.',options:['Richtig','Falsch'],correct:1},
 {q:'Cardiff is the capital city of _____.',options:['England','Scotland','Wales','Northern Ireland'],correct:2},
 {q:'At the activity weekend you can try lots of different _____.',options:['sports and activities','school subjects','radio shows','shops'],correct:0},
 {q:'You can try out water sports like _____.',options:['canoeing and rafting','skiing and skating','tennis and football','cycling and running'],correct:0},
 {q:'Who will be there to help and answer questions?',options:['Teachers','Volunteers','Radio presenters','Police officers'],correct:1},
 {q:'What do the organisers hope?',options:['That it will rain','That lots of guests will come','That the roads stay open','That the event ends early'],correct:1},
 {q:'Why is Cardiff a good place to visit this weekend?',options:['You can try different activities all over the city.','There is a big football match.','All museums are free.','The shops are open all night.'],correct:0},
 {q:'What is special about the zip line near Mount Snowdon?',options:['It is the longest zip line in Europe.','It is inside a shopping centre.','It is only for children.','It goes over the sea.'],correct:0},
 {q:'Why is it safe to ride your bike or skateboard in the city centre?',options:['Some roads will be closed to cars.','There are no other people there.','You have to wear a uniform.','The roads are indoors.'],correct:0},
 {q:'What can you do if you do not want to do sports?',options:['Watch and have a drink or a snack.','Go home immediately.','Join the radio team.','Help close the roads.'],correct:0},
 {q:'How can you find out where each activity is?',options:['Follow the signs.','Ask at the train station.','Read a newspaper tomorrow.','Use a map in the radio studio.'],correct:0}
];
const app=document.querySelector('#app'),status=document.querySelector('#status');
const names=['Luca','Semir','Talea','Nele'];
const QUESTION_MS=15000,REVEAL_MS=3000;
const ADMIN_UID='M41x9WNoHAfqpSmyrztAgf2IZYC3';
let resetUnsubscribe=null,resetState={},resetReady=false;
let db,uid='',code='',role='',slot='',room=null,unsubscribe=null,solo=null,joinExpectedRoomType='';
let clock=null,busy=false,previousStageKey='',lastClockText='';
let listeningRun=null,listeningSyncWarned=false,writingIndex=0,writingModelVisible=false,writingSyncTimer=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mathText=s=>esc(s).replace(/(-?\d+)\s*\/\s*(\d+)/g,(_,n,d)=>`<span style="display:inline-flex;vertical-align:middle;flex-direction:column;align-items:center;line-height:1.05;margin:0 .12em"><span>${n}</span><span style="border-top:1.5px solid currentColor;padding:1px 2px 0">${d}</span></span>`);
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
// Vokabelarbeit Unit 2 · Station 1, Seiten 1 und 2.
// Antworten werden frei eingetippt und erst nach dem Prüfen ausgewertet.
const VOCAB_WORK_PAGES=[
 {title:'Vokabelarbeit · Station 1 · Seite 1',points:20,items:[
  {prompt:'Name the sports · water sports',accepted:['swimming']},
  {prompt:'Name the sports · water sports',accepted:['canoeing']},
  {prompt:'Name the sports · water sports',accepted:['rafting']},
  {prompt:'Name the sports · ball sports',accepted:['rugby']},
  {prompt:'Name the sports · ball sports',accepted:['netball']},
  {prompt:'Name the sports · ball sports',accepted:['basketball']},
  {prompt:'Name the sports · winter sport',accepted:['skiing']},
  {prompt:'Find the opposites · big',accepted:['small']},
  {prompt:'Find the opposites · quiet',accepted:['loud']},
  {prompt:'Find the opposites · quick',accepted:['slow']},
  {prompt:'Find the opposites · interesting',accepted:['boring']},
  {prompt:'Find the opposites · safe',accepted:['dangerous']},
  {prompt:'Find the opposites · easy',accepted:['difficult']},
  {prompt:'Find the opposites · good',accepted:['bad']},
  {prompt:'Find the opposites · fit',accepted:['unfit']},
  {prompt:'Finish the sentences · Rugby is a very fast and ___ sport.',accepted:['tough']},
  {prompt:'Finish the sentences · There are lots of trees in the ___.',accepted:['wood']},
  {prompt:'Finish the sentences · Let’s take a ___ to the mountains next weekend.',accepted:['trip']},
  {prompt:'Finish the sentences · You can ___ up a mountain or a tree.',accepted:['climb']},
  {prompt:'Finish the sentences · You have to learn the ___ to know what you can or can’t do in a sport.',accepted:['rules']}
 ]},
 {title:'Vokabelarbeit · Station 1 · Seite 2',points:10,items:[
  {prompt:'Julie’s message · (Freiluft-) activities',accepted:['outdoor']},
  {prompt:'Julie’s message · (gefährlich)',accepted:['dangerous']},
  {prompt:'Julie’s message · (Ausrüstung)',accepted:['equipment']},
  {prompt:'Julie’s message · (sicher)',accepted:['safe']},
  {prompt:'Julie’s message · (geduldig)',accepted:['patient']},
  {prompt:'Julie’s message · (begabt)',accepted:['talented']},
  {prompt:'Julie’s message · (leistungsorientiert)',accepted:['competitive']},
  {prompt:'Julie’s message · (erfolgreich)',accepted:['successful']},
  {prompt:'Julie’s message · (frech)',accepted:['cheeky']},
  {prompt:'Julie’s message · (erschöpft)',accepted:['exhausted']}
 ]}
];
let vocabPage=null;
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
function gapCheck(){if(gapStation===null)return;gapCollect();const accepted=gapFields(gapStation),values=gapLoad(gapStation),exercise=`english_gap${gapStation+1}`;accepted.forEach((answers,index)=>{const topic=GAP_SETS[gapStation].title,prompt=`${topic} · Lücke ${index+1}`;void recordLearningError(soloName,'english',exercise,index,topic,{prompt,accepted:answers},answers.some(a=>grammarNormalize(a)===grammarNormalize(values[index])));});firstCapture('gap',gapStation,accepted,values,GAP_SETS[gapStation].title);gapRender(gapStation,true);}
function gapClear(){if(gapStation===null)return;gapSave(gapStation,[]);gapRender(gapStation);}

function vocabStorageKey(page){return `vb2vocab_${soloName}_station1_page${page+1}`;}
function vocabValues(page){try{const v=JSON.parse(localStorage.getItem(vocabStorageKey(page))||'null');return Array.isArray(v)?v:[];}catch{return [];}}
function vocabChecked(page){return localStorage.getItem(vocabStorageKey(page)+'_checked')==='1';}
function vocabSave(page,values,checked=vocabChecked(page)){localStorage.setItem(vocabStorageKey(page),JSON.stringify(values));localStorage.setItem(vocabStorageKey(page)+'_checked',checked?'1':'0');}
function vocabCollect(){if(vocabPage===null)return;const values=vocabValues(vocabPage);for(const el of document.querySelectorAll('[data-vocab]'))values[Number(el.dataset.vocab)]=el.value;vocabSave(vocabPage,values);}
function vocabField(page,index,values,checked){
 const value=String(values[index]||''),answers=VOCAB_WORK_PAGES[page].items[index].accepted,ok=answers.some(a=>grammarNormalize(a)===grammarNormalize(value));
 const border=checked?(ok?'#278255':'#c74646'):'#777';
 return `<span class="vocab-answer"><input data-vocab="${index}" aria-label="Antwort ${index+1}" autocomplete="off" autocapitalize="none" spellcheck="false" value="${esc(value)}" style="border-color:${border}">${checked&&!ok?`<small class="vocab-correct-answer">${esc(answers.join(' / '))}</small>`:''}</span>`;
}
function vocabSheetHeader(page){
 const date=new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Europe/Berlin'}).format(new Date());
 return `<div class="vocab-topline"><strong>Station 1</strong><strong>VOCABULARY</strong><b>2</b></div>${page===0?`<div class="vocab-student-line"><span>Name: <u>${esc(soloName)}</u></span><span>Class: <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></span><span>Date: <u>${date}</u></span></div><h2>Vocabulary</h2>`:''}`;
}
function vocabPageOne(values,checked){
 const field=i=>vocabField(0,i,values,checked);
 const rows=[0,1,2].map(row=>`<tr>${[row,row+3,row===0?6:null].map(i=>`<td>${i===null?'':field(i)}</td>`).join('')}</tr>`).join('');
 const opposites=[['big',7],['quiet',8],['quick',9],['interesting',10],['safe',11],['easy',12],['good',13],['fit',14]];
 const sentences=[
  ['Rugby is a very fast and ',15,' sport.'],
  ['There are lots of trees in the ',16,'.'],
  ['Let’s take a ',17,' to the mountains next weekend.'],
  ['You can ',18,' up a mountain or a tree.'],
  ['To find out what you can or can’t do in a sport, you have to learn the ',19,'.']
 ];
 return `<section class="vocab-task"><h3><b>1</b> Name the sports. Fill in the table.</h3><div class="vocab-icons"><span>🌊</span><span>⚽</span><span>⛄</span></div><table class="vocab-sports"><thead><tr><th>water sports</th><th>ball sports</th><th>winter sport</th></tr></thead><tbody>${rows}</tbody></table><div class="vocab-points">/ 7</div></section>
 <section class="vocab-task"><h3><b>2</b> Find the opposites (↔).</h3><div class="vocab-opposite-grid">${opposites.map(([word,i],n)=>`<div class="vocab-opposite"><span>${n+1}. &nbsp;${word} &nbsp; ↔</span>${field(i)}</div>`).join('')}</div><div class="vocab-points">/ 8</div></section>
 <section class="vocab-task"><h3><b>3</b> Finish the sentences.</h3>${sentences.map(([before,index,after],n)=>`<p class="vocab-sentence"><strong>${n+1}.</strong> ${before}${field(index)}${after}</p>`).join('')}<div class="vocab-points">/ 5</div></section>`;
}
function vocabPageTwo(values,checked){
 const field=i=>vocabField(1,i,values,checked);
 const parts=[
  `You know I love ${field(0)} (Freiluft-) activities, so I tried canoeing last weekend. Our group took a trip down the River Wye.`,
  `The trip wasn’t ${field(1)} (gefährlich), of course, but we had to wear special ${field(2)} (Ausrüstung) to keep us ${field(3)} (sicher).`,
  `Guess what? I wasn’t so bad. We had a friendly and ${field(4)} (geduldig) instructor. She said I was very ${field(5)} (begabt). ☺`,
  `Mara was there too. She’s a really ${field(6)} (leistungsorientiert) girl and always wants to be most ${field(7)} (erfolgreich). She was even ${field(8)} (frech) to me. Well, forget about that …`,
  `The canoeing trip was great fun. In the evening I was ${field(9)} (erschöpft) too, but I had a fantastic day.`
 ];
 return `<section class="vocab-task vocab-task-four"><h3><b>4</b> Julie is Beth’s friend. Complete her message with the right words.</h3><div class="vocab-message"><div class="vocab-message-bar"><span></span><b>X</b></div><div class="vocab-message-body"><p>Hi Beth,</p><p>How was your trip to the activity centre?</p>${parts.map(p=>`<p>${p}</p>`).join('')}<p>See you soon!</p><p>Julie</p></div></div><div class="vocab-points">/ 10</div><div class="vocab-score-line">Your points: &nbsp; ____ / XX &nbsp;&nbsp;&nbsp; Mark: <span></span></div></section>`;
}
function vocabRender(page,checked=vocabChecked(page)){
 if(!soloName){soloChooseName();return;}vocabPage=page;const values=vocabValues(page),data=VOCAB_WORK_PAGES[page];
 const accepted=data.items.map(x=>x.accepted),correct=accepted.filter((a,i)=>a.some(x=>grammarNormalize(x)===grammarNormalize(values[i]))).length;
 const body=page===0?vocabPageOne(values,checked):vocabPageTwo(values,checked);
 app.innerHTML=card(`<style>
 .vocab-sheet{background:#fff;color:#171717;border:1px solid #c8c8c8;padding:16px 15px 20px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;box-shadow:0 5px 16px #0a142255}
 .vocab-sheet *{box-sizing:border-box}.vocab-topline{height:34px;display:flex;align-items:center;justify-content:space-between;border-bottom:4px solid #aaa;color:#777;font-size:14px;letter-spacing:.08em;margin-bottom:16px}.vocab-topline b{display:grid;place-items:center;width:32px;height:32px;border:3px solid #aaa;border-radius:50%;font-size:17px;color:#777}.vocab-student-line{display:flex;justify-content:space-between;gap:9px;margin:16px 0 25px;font-size:14px}.vocab-student-line u{display:inline-block;min-width:50px;text-decoration:none;border-bottom:1px solid #555}.vocab-sheet h2{font-size:25px;margin:0 0 14px;color:#171717}.vocab-task{margin:0 0 25px}.vocab-task h3{font-size:17px;line-height:1.4;margin:0 0 12px;color:#151515}.vocab-task h3 b{display:inline-grid;place-items:center;width:28px;height:28px;margin-right:7px;background:#e5e5e5;border-radius:50%;font-size:17px}.vocab-icons{display:grid;grid-template-columns:repeat(3,1fr);text-align:center;font-size:29px;height:42px;align-items:center}.vocab-sports{width:100%;border-collapse:collapse;table-layout:fixed;font-size:14px}.vocab-sports th,.vocab-sports td{border:1px solid #555;padding:7px 6px}.vocab-sports th{background:#d7d7d7;text-align:left}.vocab-sports td{height:52px}.vocab-answer{display:inline-flex;vertical-align:middle;flex-direction:column;align-items:stretch;max-width:100%;min-width:0}.vocab-sheet input[data-vocab]{width:100%;min-width:55px;max-width:150px;height:40px;padding:5px 6px;border:0;border-bottom:2px solid #777;border-radius:0;background:#fff;color:#171717;font:inherit;font-size:17px;outline:0}.vocab-correct-answer{color:#b52f2f;font-size:11px;line-height:1.1}.vocab-points{text-align:right;color:#666;font-size:14px;margin-top:4px}.vocab-opposite-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px 14px}.vocab-opposite{display:flex;align-items:center;gap:7px;white-space:nowrap;font-size:15px}.vocab-opposite .vocab-answer{flex:1}.vocab-opposite input[data-vocab]{max-width:none;min-width:42px}.vocab-sentence{margin:12px 0;line-height:1.9;font-size:16px}.vocab-sentence strong{margin-right:4px}.vocab-sentence .vocab-answer{min-width:100px}.vocab-message{border:1px solid #555;margin-top:12px}.vocab-message-bar{height:20px;background:#d2d2d2;border-bottom:1px solid #555;display:flex;justify-content:space-between;align-items:center}.vocab-message-bar b{width:22px;text-align:center;border-left:1px solid #555}.vocab-message-body{padding:8px 12px 5px;font-size:15px;line-height:1.95}.vocab-message-body p{margin:14px 0}.vocab-message-body .vocab-answer{min-width:70px;vertical-align:baseline}.vocab-message-body input[data-vocab]{height:34px;font-size:16px;min-width:74px;max-width:135px}.vocab-task-four h3{font-size:16px}.vocab-score-line{margin-top:26px;font-size:14px}.vocab-score-line span{display:inline-block;width:22px;height:22px;background:#bbb;vertical-align:middle}
 @media(max-width:600px){#app>.card:has(.vocab-sheet){padding:9px;border-radius:14px}.vocab-sheet{padding:13px 10px 18px;font-size:16px}.vocab-student-line{display:grid;grid-template-columns:1fr 1fr;gap:10px 12px;margin:14px 0 22px;font-size:14px}.vocab-student-line span:last-child{grid-column:1/-1}.vocab-sheet h2{font-size:24px}.vocab-task h3{font-size:16px}.vocab-sports{font-size:13px}.vocab-sports th,.vocab-sports td{padding:6px 5px}.vocab-sports td{height:50px}.vocab-opposite-grid{grid-template-columns:1fr;gap:8px}.vocab-opposite{font-size:16px;white-space:normal;gap:9px}.vocab-opposite input[data-vocab]{min-width:72px}.vocab-sentence{font-size:16px;line-height:1.8}.vocab-sentence .vocab-answer{min-width:95px}.vocab-message-body{padding:6px 8px;font-size:15px;line-height:1.9}.vocab-message-body p{margin:12px 0}.vocab-message-body .vocab-answer{min-width:78px}.vocab-message-body input[data-vocab]{height:34px;max-width:130px;min-width:72px;font-size:16px}.vocab-correct-answer{font-size:13px}.vocab-score-line{margin-top:20px;font-size:14px}}
 </style><div class="vocab-sheet">${vocabSheetHeader(page)}${page===0?vocabPageOne(values,checked):vocabPageTwo(values,checked)}</div>${checked?`<p class="good"><strong>${correct} von ${accepted.length} richtig.</strong> Du kannst rote Antworten verbessern und erneut prüfen.</p>`:'<p class="muted">Schreibe die Antworten selbst in die Linien. Erst danach auf „Antworten prüfen“ tippen.</p>'}<div class="solo-actions">${btn('✅ Antworten prüfen','vocabCheck')}${btn('🔄 Seite leeren','vocabClear','alt')}</div><p class="muted small">${esc(soloName)} · ${esc(data.title)}</p>`)+card(btn('Zur Englisch-Auswahl','soloHome','alt'));
}
async function syncVocabPageProgress(page,values,correct){if(!db||!uid||!soloName)return;const data=VOCAB_WORK_PAGES[page],now=Date.now(),done=values.filter(v=>String(v||'').trim()).length;try{await set(ref(db,`soloProgress/${uid}/${soloName}/vocabStation1Page${page+1}`),{name:soloName,page:page+1,done,total:data.items.length,correct,score:correct,checked:true,finished:correct===data.items.length,updatedAt:now});}catch{msg('Der Lernstand dieser Seite konnte gerade nicht online gespeichert werden.',true);}}
function vocabCheck(){if(vocabPage===null)return;vocabCollect();const page=vocabPage,data=VOCAB_WORK_PAGES[page],values=vocabValues(page),topic=`Vokabeln · Station 1 · Seite ${page+1}`,exercise=`english_vocab_station1_page${page+1}`;let correct=0;data.items.forEach((item,index)=>{const ok=item.accepted.some(a=>grammarNormalize(a)===grammarNormalize(values[index]));if(ok)correct++;void recordLearningError(soloName,'english',exercise,index,topic,{prompt:item.prompt,accepted:item.accepted},ok);});firstCapture('vocab',page,data.items.map(x=>x.accepted),values,data.title);vocabSave(page,values,true);void syncVocabPageProgress(page,values,correct);vocabRender(page,true);}
function vocabClear(){if(vocabPage===null)return;const page=vocabPage;vocabSave(page,[],false);vocabRender(page,false);}

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
function grammarCheck(){if(grammarStation===null||grammarTask===null)return;grammarCollect();const t=GRAMMAR[grammarStation].tasks[grammarTask],exercise=`english_grammar_${grammarStation+1}_task${grammarTask+1}`,values=grammarRead(grammarStation,grammarTask);if(t.items)t.items.forEach((item,index)=>{const topic=GRAMMAR[grammarStation].title+' · '+t.title,prompt=t.items?`${item[0]} _____ ${item[1]}`:`${t.title} · Aufgabe ${index+1}`;void recordLearningError(soloName,'english',exercise,index,topic,{prompt,accepted:item[2]},item[2].some(a=>grammarNormalize(a)===grammarNormalize(values[index])));});firstCapture('grammar',grammarStation+'_'+grammarTask,t.items?.map(x=>x[2])||null,values,GRAMMAR[grammarStation].title+' · '+t.title);grammarRender(grammarStation,grammarTask,true);}
function grammarReveal(){if(grammarStation===null||grammarTask===null)return;grammarCollect();grammarRender(grammarStation,grammarTask,true,true);}
function grammarClear(){if(grammarStation===null||grammarTask===null)return;grammarWrite(grammarStation,grammarTask,[]);grammarRender(grammarStation,grammarTask);}

const key='vb2solo';
const SOLO_NAMES=['Luca','Semir','Talea','Nele'];
let activitySyncWarned=false;
function activityPeriodKeys(timestamp=Date.now()){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(timestamp)).map(x=>[x.type,x.value]));
 const year=Number(parts.year),month=Number(parts.month),day=Number(parts.day),date=new Date(Date.UTC(year,month-1,day));
 const isoDay=date.getUTCDay()||7;date.setUTCDate(date.getUTCDate()+4-isoDay);
 const weekYear=date.getUTCFullYear(),yearStart=new Date(Date.UTC(weekYear,0,1)),week=Math.ceil((((date-yearStart)/86400000)+1)/7);
 return {dayKey:`${parts.year}-${parts.month}-${parts.day}`,weekKey:`${weekYear}-W${String(week).padStart(2,'0')}`};
}
async function recordLearningActivity(name,exercise,increment=true){
 if(!db||!uid||!SOLO_NAMES.includes(name)||!name||!exercise)return;
 const now=Date.now(),{dayKey,weekKey}=activityPeriodKeys(now),path=`learningActivity/${uid}/${name}/${exercise}`;
 try{await runTransaction(ref(db,path),current=>{const value=current&&typeof current==='object'?{...current}:{};if(value.dayKey!==dayKey){value.dayKey=dayKey;value.dayCount=0;}if(value.weekKey!==weekKey){value.weekKey=weekKey;value.weekCount=0;}if(increment){value.dayCount=(Number(value.dayCount)||0)+1;value.weekCount=(Number(value.weekCount)||0)+1;}value.lastAt=now;return value;});activitySyncWarned=false;}catch(e){if(!activitySyncWarned){activitySyncWarned=true;msg('Tages- und Wochenzählung wartet auf die Firebase-Regeln. Lernfortschritt bleibt davon unberührt.',true);}}
}
function touchLearningActivity(name,exercise){void recordLearningActivity(name,exercise,false);}
function mathActivityId(b){if(b<3)return `math_rational_battle${b+1}`;if(b===3)return 'math_rational_cards';if(b===4)return 'math_exam';if(b===5)return 'math_rational_exam';if(b===6)return 'math_proportional_practice';if(b>=7&&b<=9)return `math_proportional_exam${b-6}`;if(b>=10&&b<=18)return `math_proportional_practice_${MATH_PROPORTIONAL_PRACTICE_BLOCKS[b-10]?.id||''}`;return '';}
let errorEvalSubject='',errorEvalPeriod='',errorEvalTopics=[],errorEvalQueue=[],errorEvalCurrent=null;
async function recordLearningError(name,subject,exercise,index,topic,q,correct){
 if(!db||!uid||!SOLO_NAMES.includes(name)||!exercise)return false;
 const now=Date.now(),{dayKey,weekKey}=activityPeriodKeys(now),path=`learningActivity/${uid}/${name}/${exercise}`;
 try{await runTransaction(ref(db,path),current=>{const value=current&&typeof current==='object'?{...current}:{};if(value.dayKey!==dayKey){value.dayKey=dayKey;value.dayCount=0;}if(value.weekKey!==weekKey){value.weekKey=weekKey;value.weekCount=0;}value.lastAt=now;const errors={...(value.errorItems||{})},key=String(index),old=errors[key];if(correct){if(!old)return current;errors[key]={...old,resolved:true,resolvedAt:now};}else{errors[key]={subject,topic,prompt:String(q?.prompt||q?.q||''),options:Array.isArray(q?.options)?q.options.map(String):null,correctIndex:Number.isInteger(q?.correct)?q.correct:null,accepted:Array.isArray(q?.accepted)?q.accepted.map(String):null,explanation:String(q?.explanation||q?.explain||''),answer:String(q?.answer||''),count:(Number(old?.count)||0)+1,lastWrongAt:now,dayKey,weekKey,resolved:false,resolvedAt:null};}value.errorItems=errors;return value;});return true;}catch(e){if(!activitySyncWarned){activitySyncWarned=true;msg('Fehler konnten gerade nicht online gespeichert werden. Bitte Verbindung prüfen.',true);}return false;}
}
function childLearningExercises(subject){if(subject==='math')return ['math_rational_battle1','math_rational_battle2','math_rational_battle3','math_rational_cards','math_exam','math_rational_exam','math_proportional_practice','math_proportional_exam1','math_proportional_exam2','math_proportional_exam3',...MATH_PROPORTIONAL_PRACTICE_BLOCKS.map(b=>`math_proportional_practice_${b.id}`),'math_proportional_worksheet','math_proportional_flashcards',...FRACTION_MODULES.map(m=>`math_fraction_${m.id}`)];return ['english_vocab_battle1','english_vocab_battle2','english_vocab_battle3','english_vocab_station1_page1','english_vocab_station1_page2','english_gap1','english_gap2','english_listening','english_reading',...GRAMMAR.flatMap((station,s)=>station.tasks.map((_,i)=>`english_grammar_${s+1}_task${i+1}`)),...WRITING_TASKS.map((_,i)=>`english_writing_task${i+1}`)];}
async function loadChildLearningActivity(name,subject){const ids=childLearningExercises(subject);const rows=await Promise.all(ids.map(async id=>[id,(await get(ref(db,`learningActivity/${uid}/${name}/${id}`))).val()]));return Object.fromEntries(rows.filter(([,value])=>value));}
async function importLegacyLearningErrors(subject,name){
 if(!db||!uid||!SOLO_NAMES.includes(name))return;
 const rows=[];
 if(subject==='math'){
  for(let b=0;b<=18;b++){const state=mathLoad(name,b);if(!state?.mistakes)continue;let questions=b<3?MATH_BATTLES[b]:b===3?MATH_CARDS.map(([prompt,answer])=>({prompt,accepted:[answer]})):mathExamData(b)?.questions;if(!questions)continue;const exercise=mathActivityId(b),topic=mathExamData(b)?.title||RATIONAL_MATH_TITLES[b]||'Rationale Zahlen · Merkkarten';for(const [index,count] of Object.entries(state.mistakes)){if(Number(count)<=0||!questions[Number(index)])continue;const raw=questions[Number(index)],q=raw.options?raw:{prompt:raw.prompt||raw.q,accepted:raw.accepted||[],explanation:raw.explanation||raw.explain||''};rows.push({exercise,index,topic,q});}}
  for(const module of FRACTION_MODULES){const state=fractionLoad(name,module.id);for(const [index,count] of Object.entries(state?.mistakes||{})){if(Number(count)>0&&module.questions[Number(index)])rows.push({exercise:`math_fraction_${module.id}`,index,topic:`Bruchrechnung · ${module.title}`,q:module.questions[Number(index)]});}}
 }else{
  for(let b=0;b<3;b++){const state=soloSaved(b);for(const [index,count] of Object.entries(state?.mistakes||{})){if(Number(count)>0&&BATTLES[b]?.[Number(index)])rows.push({exercise:`english_vocab_battle${b+1}`,index,topic:`Vokabel-Battle ${b+1}`,q:BATTLES[b][Number(index)]});}}
  const listening=listenLoad();for(const [index,count] of Object.entries(listening?.mistakes||{})){if(Number(count)>0&&LISTENING_QUESTIONS[Number(index)])rows.push({exercise:'english_listening',index,topic:'Listening · Activity weekend in Cardiff',q:LISTENING_QUESTIONS[Number(index)]});}
  for(let station=0;station<2;station++)for(let task=0;task<GRAMMAR[station].tasks.length;task++){const record=firstRead('grammar',station+'_'+task);for(const error of record?.errors||[]){const index=Number(error.position)-1,answers=String(error.correct||'').split(' / ').filter(Boolean),exercise=`english_grammar_${station+1}_task${task+1}`,question=GRAMMAR[station].tasks[task].items?.[index],prompt=question?`${question[0]} _____ ${question[1]}`:`${GRAMMAR[station].tasks[task].title} · Aufgabe ${index+1}`;if(answers.length)rows.push({exercise,index,topic:`${GRAMMAR[station].title} · ${GRAMMAR[station].tasks[task].title}`,q:{prompt,accepted:answers}});}}
  for(let station=0;station<2;station++){const record=firstRead('gap',station);for(const error of record?.errors||[]){const index=Number(error.position)-1,answers=String(error.correct||'').split(' / ').filter(Boolean);if(answers.length)rows.push({exercise:`english_gap${station+1}`,index,topic:GAP_SETS[station].title,q:{prompt:`${GAP_SETS[station].title} · Lücke ${index+1}`,accepted:answers}});}}
  for(let page=0;page<2;page++){const record=firstRead('vocab',page),data=VOCAB_WORK_PAGES[page];for(const error of record?.errors||[]){const index=Number(error.position)-1,item=data.items[index],answers=String(error.correct||'').split(' / ').filter(Boolean);if(item&&answers.length)rows.push({exercise:`english_vocab_station1_page${page+1}`,index,topic:`Vokabeln · Station 1 · Seite ${page+1}`,q:{prompt:item.prompt,accepted:answers}});}}
 }
 if(!rows.length)return;
 const existing=await loadChildLearningActivity(name,subject);
 await Promise.all(rows.filter(row=>!existing[row.exercise]?.errorItems?.[String(row.index)]).map(row=>recordLearningError(name,subject,row.exercise,row.index,row.topic,row.q,false)));
}
function errorPeriodChoice(subject){errorEvalSubject=subject;errorEvalPeriod='';errorEvalTopics=[];errorEvalQueue=[];errorEvalCurrent=null;const names=SOLO_NAMES.map((n,i)=>btn(esc(n),`errorName${subject}_${i}`));app.innerHTML=card(`<h2>📊 ${subject==='math'?'Mathe':'Englisch'}-Auswertung</h2><p>Wähle dein Kind.</p><div class="name-actions">${names.join('')}</div>`)+card(btn('Zurück','home','alt'));}
async function errorEvaluation(subject,period){
 const name=subject==='math'?mathName:soloName;if(!name||!SOLO_NAMES.includes(name)){errorPeriodChoice(subject);return;}if(!db||!uid){msg('Verbindung wird hergestellt. Bitte gleich noch einmal öffnen.',true);return;}
 if(!period){errorEvalSubject=subject;errorEvalPeriod='';app.innerHTML=card(`<h2>📊 ${subject==='math'?'Mathe':'Englisch'}-Auswertung · ${esc(name)}</h2><p>Welchen Zeitraum möchtest du ansehen?</p><div class="name-actions">${btn('📅 Tägliche Auswertung','errorPeriod_day')}${btn('🗓️ Wöchentliche Auswertung','errorPeriod_week')}</div>`)+card(btn('Zurück','home','alt'));return;}
 errorEvalSubject=subject;errorEvalPeriod=period;app.innerHTML=card('<h2>Auswertung wird geladen …</h2>');
 try{await importLegacyLearningErrors(subject,name);const data=await loadChildLearningActivity(name,subject),keys=activityPeriodKeys(),topics=new Map();for(const [exercise,entry] of Object.entries(data)){for(const [index,item] of Object.entries(entry?.errorItems||{})){if(item?.subject!==subject)continue;const inPeriod=period==='day'?item.dayKey===keys.dayKey:item.weekKey===keys.weekKey;if(!inPeriod&&!item.resolved){/* offene Fehler bleiben sichtbar, bis sie richtig gelöst sind */}else if(!inPeriod)continue;const topic=String(item.topic||exercise);if(!topics.has(topic))topics.set(topic,[]);topics.get(topic).push({exercise,index,item});}}
  errorEvalTopics=[...topics.entries()].map(([title,items])=>({title,items:items.sort((a,b)=>Number(a.item.lastWrongAt||0)-Number(b.item.lastWrongAt||0))}));const openCount=errorEvalTopics.reduce((n,t)=>n+t.items.filter(x=>!x.item.resolved).length,0),periodLabel=period==='day'?'Heute':'Diese Woche';
  const blocks=errorEvalTopics.length?errorEvalTopics.map((t,i)=>{const open=t.items.filter(x=>!x.item.resolved).length,done=t.items.length-open;return `<div class="player"><h3>${esc(t.title)}</h3><p>${open} offen · ${done} richtig bearbeitet</p>${open?btn(`Fehler üben (${open})`,`errorTopic${i}`):'<p class="good">✅ Alle Fehler richtig bearbeitet</p>'}</div>`;}).join(''):'<p class="muted">Für diesen Zeitraum sind noch keine Fehler erfasst.</p>';
  app.innerHTML=card(`<h2>📊 ${subject==='math'?'Mathe':'Englisch'} · ${periodLabel} · ${esc(name)}</h2><p>Nach Themen gebündelt. Offene Fehler bleiben hier, bis du sie richtig löst.</p><p><strong>${openCount} noch offen</strong></p>${blocks}<div class="name-actions">${btn('📅 Tägliche Auswertung','errorPeriod_day','alt')}${btn('🗓️ Wöchentliche Auswertung','errorPeriod_week','alt')}</div>`)+card(btn('Zurück zur Übersicht','errorSubjectHome','alt'));
 }catch(e){msg('Auswertung konnte nicht geladen werden: '+e.message,true);}
}
function errorPracticeStart(topicIndex){const topic=errorEvalTopics[topicIndex];if(!topic)return;errorEvalQueue=topic.items.filter(x=>!x.item.resolved);errorEvalCurrent={topicIndex,position:0};errorPracticeShow();}
function errorPracticeShow(){if(!errorEvalCurrent)return;const group=errorEvalTopics[errorEvalCurrent.topicIndex];errorEvalQueue=group.items.filter(x=>!x.item.resolved);if(!errorEvalQueue.length){app.innerHTML=card(`<h2>🏆 ${esc(group.title)}</h2><p class="good">Alle Fehler wurden richtig gelöst.</p>${btn('Zur Auswertung','errorRefresh')}`);return;}const entry=errorEvalQueue[0],item=entry.item;app.innerHTML=card(`<p class="muted">${esc(group.title)} · ${errorEvalQueue.length} noch offen</p><h2>${errorEvalSubject==='math'?mathText(item.prompt||'Aufgabe'):esc(item.prompt||'Aufgabe')}</h2>${item.options?`<div class="answers">${item.options.map((o,i)=>`<button data-error-answer="${i}">${errorEvalSubject==='math'?mathText(o):esc(o)}</button>`).join('')}</div>`:`<label>Deine Antwort<input data-error-text autocomplete="off" autocapitalize="none"></label>${btn('Antwort prüfen','errorTextCheck')}`}<div id="error-feedback"></div>`)+card(btn('Abbrechen · Zur Auswertung','errorRefresh','alt'));}
async function errorPracticeAnswer(value){if(!errorEvalCurrent||!errorEvalQueue.length)return;const entry=errorEvalQueue[0],item=entry.item,typed=String(value??'').trim(),correct=item.options?Number(value)===Number(item.correctIndex):(item.accepted||[]).some(x=>grammarNormalize(x)===grammarNormalize(typed));if(correct){const saved=await recordLearningError(subjectNameForErrors(),errorEvalSubject,entry.exercise,entry.index,item.topic,item,true);if(!saved){const fb=document.querySelector('#error-feedback');if(fb)fb.innerHTML='<p class="error">Der Lernstand konnte nicht gespeichert werden. Bitte Verbindung prüfen und erneut versuchen.</p>';return;}item.resolved=true;errorEvalQueue.shift();const feedback=document.querySelector('#error-feedback');if(feedback){feedback.innerHTML='<p class="good"><strong>✅ Richtig! Dieser Fehler ist erledigt.</strong></p>'+btn(errorEvalQueue.length?'Weiter ➜':'Zur Themenübersicht','errorPracticeNext');}else errorPracticeShow();return;}await recordLearningError(subjectNameForErrors(),errorEvalSubject,entry.exercise,entry.index,item.topic,item,false);const fb=document.querySelector('#error-feedback');if(fb)fb.innerHTML=`<p class="error"><strong>❌ Noch nicht richtig.</strong> ${item.options?`Richtige Antwort: ${errorEvalSubject==='math'?mathText(item.options[item.correctIndex]??''):esc(item.options[item.correctIndex]??'')}`:`Richtige Lösung: ${esc((item.accepted||[]).join(' / '))}`}</p>${errorEvalSubject==='math'&&item.explanation?`<p><strong>Rechenweg:</strong> ${mathText(item.explanation)}</p>`:''}<p>Versuche dieselbe Aufgabe noch einmal. Sie bleibt offen, bis sie richtig ist.</p>`;}
function subjectNameForErrors(){return errorEvalSubject==='math'?mathName:soloName;}
function errorPracticeNext(){if(errorEvalCurrent&&errorEvalQueue.length){errorPracticeShow();return;}errorEvaluation(errorEvalSubject,errorEvalPeriod);}
function errorEvaluationAction(action){if(action==='errorMath'){errorPeriodChoice('math');return true;}if(action==='errorEnglish'){errorPeriodChoice('english');return true;}if(action.startsWith('errorName')){const [,subject,index]=action.match(/^errorName(math|english)_(\d)$/)||[];if(!subject)return true;const name=SOLO_NAMES[Number(index)];if(subject==='math'){mathName=name;localStorage.setItem('vb2math_name',name);}else{soloName=name;localStorage.setItem('vb2solo_name',name);}errorEvaluation(subject);return true;}if(action==='errorPeriod_day'||action==='errorPeriod_week'){errorEvaluation(errorEvalSubject,action.endsWith('day')?'day':'week');return true;}if(/^errorTopic\d+$/.test(action)){errorPracticeStart(Number(action.slice(10)));return true;}if(action==='errorPracticeNext'){errorPracticeNext();return true;}if(action==='errorRefresh'){errorEvaluation(errorEvalSubject,errorEvalPeriod);return true;}if(action==='errorSubjectHome'){if(errorEvalSubject==='math')mathHome();else soloHome();return true;}if(action==='errorTextCheck'){const value=document.querySelector('[data-error-text]')?.value||'';void errorPracticeAnswer(value);return true;}return false;}
let soloName=localStorage.getItem('vb2solo_name')||'';
let dashboardUnsubscribe=null,soloHeartbeat=null;
function resetStamp(name,subject='english'){
 return Math.max(Number(resetState.all)||0,Number(resetState[name])||0,Number(resetState[`${subject}_${name}`])||0);
}
function clearLocalLearning(name,subject){
 const prefixes=subject==='math'?[`vb2math_${name}_battle_`]:[`vb2solo_${name}_battle_`,`vb2first_${name}_`,`vb2grammar_${name}_`,`vb2gap_${name}_`,`vb2vocab_${name}_`,`vb2listen_${name}_`,`vb2writing_${name}_`];
 for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&prefixes.some(p=>k.startsWith(p)))localStorage.removeItem(k);}
 if(subject==='math'){for(const m of FRACTION_MODULES)localStorage.removeItem('vb2math_'+name+'_fraction_'+m.id);if(mathName===name)mathRun=null;}
 if(subject==='english'&&soloName===name){solo=null;stopSoloHeartbeat();grammarStation=null;grammarTask=null;gapStation=null;}
}
function applyResetState(state){
 resetState=state&&typeof state==='object'?state:{};
 let activeEnglish=false,activeMath=false;
 for(const name of SOLO_NAMES){
  for(const subject of ['english','math']){
   const stamp=resetStamp(name,subject),seenKey=`vb2reset_seen_${subject}_${name}`;
   // Preserve previous legacy reset acknowledgement when upgrading.
   const oldSeen=Number(localStorage.getItem(`vb2reset_seen_${name}`)||0);
   const seen=Math.max(Number(localStorage.getItem(seenKey)||0),oldSeen);
   if(stamp>seen){
    clearLocalLearning(name,subject);
    localStorage.setItem(seenKey,String(stamp));
    if(subject==='english'&&soloName===name)activeEnglish=true;
    if(subject==='math'&&mathName===name)activeMath=true;
   }
  }
  for(const mod of FRACTION_MODULES){
   const stamp=Number(resetState[name+'__math_fraction_'+mod.id])||0;
   const seenKey='vb2reset_seen_math_'+name+'_fraction_'+mod.id;
   if(stamp>Number(localStorage.getItem(seenKey)||0)){
    localStorage.removeItem('vb2math_'+name+'_fraction_'+mod.id);
    localStorage.setItem(seenKey,String(stamp));
    if(mathName===name&&fractionRun?.id===mod.id){fractionRun=null;activeMath=true;}
   }
  }
  const examStamp=Number(resetState[name+'__math_battle6'])||0,examSeenKey=`vb2reset_seen_math_${name}_battle6`;
  if(examStamp>Number(localStorage.getItem(examSeenKey)||0)){
   localStorage.removeItem(mathKey(name,5));
   localStorage.setItem(examSeenKey,String(examStamp));
   if(mathName===name&&mathRun?.b===5){mathRun=null;activeMath=true;}
  }
  const proportionalStamp=Number(resetState[name+'__math_proportional'])||0,proportionalSeenKey=`vb2reset_seen_math_${name}_proportional`;
  if(proportionalStamp>Number(localStorage.getItem(proportionalSeenKey)||0)){
   localStorage.removeItem(mathKey(name,6));
   localStorage.setItem(proportionalSeenKey,String(proportionalStamp));
   if(mathName===name&&mathRun?.b===6){mathRun=null;activeMath=true;}
  }
  for(let index=0;index<MATH_PROPORTIONAL_CLASSWORKS.length;index++){
   const b=7+index,stamp=Number(resetState[name+'__math_proportional_exam'+(index+1)])||0,seenKey=`vb2reset_seen_math_${name}_proportional_exam${index+1}`;
   if(stamp>Number(localStorage.getItem(seenKey)||0)){
    localStorage.removeItem(mathKey(name,b));localStorage.setItem(seenKey,String(stamp));
    if(mathName===name&&mathRun?.b===b){mathRun=null;activeMath=true;}
   }
  }
  for(let index=0;index<MATH_PROPORTIONAL_PRACTICE_BLOCKS.length;index++){
   const block=MATH_PROPORTIONAL_PRACTICE_BLOCKS[index],b=10+index,stamp=Number(resetState[name+'__math_proportional_practice_'+block.id])||0,seenKey=`vb2reset_seen_math_${name}_proportional_practice_${block.id}`;
   if(stamp>Number(localStorage.getItem(seenKey)||0)){
    localStorage.removeItem(mathKey(name,b));localStorage.setItem(seenKey,String(stamp));
    if(mathName===name&&mathRun?.b===b){mathRun=null;activeMath=true;}
   }
  }
 }
 resetReady=true;
 if(activeMath&&mathName){mathHome();msg('Mathe-Lernstand zurückgesetzt. Englisch bleibt erhalten.');}
 else if(activeEnglish&&soloName){soloHome();msg('Englisch-Lernstand zurückgesetzt. Mathe bleibt erhalten.');}
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
function home(){stopDashboard();stopSoloHeartbeat();if(unsubscribe){unsubscribe();unsubscribe=null;}stopClock();code='';role='';slot='';room=null;solo=null;busy=false;previousStageKey='';joinExpectedRoomType='';status.textContent='';app.innerHTML=card(`<h2>📚 Alleine lernen</h2><div class="name-actions">${btn('🇬🇧 Englisch lernen · Vokabeln, Grammatik, Listening, Reading & Writing','solo','english-learn-action')}${btn('🔢 Mathe Klasse 7 NRW lernen','mathChoose','math-learn-action')}</div><h3>Fehlerauswertung</h3><div class="name-actions">${btn('📊 Auswertung Englisch','errorEnglish','english-learn-action')}${btn('📊 Auswertung Mathe','errorMath','math-learn-action')}</div>`)+card(`<h2>🎮 Gemeinsam spielen</h2><div class="name-actions">${btn('⚡ Vokabel-Battle','join','english-vocab-action')}${btn('🎧 Listening-Battle','join','english-listening-action')}${btn('📖 Reading-Battle','join','english-reading-action')}${btn('📘 Grammatik-Battle','join','english-grammar-action')}${btn('✍️ Writing-Battle','join','english-writing-action')}</div><p class="muted">Wähle ein Battle und gib anschließend den Spielcode ein.</p>`)+card(`<h2>🔢 Mathe-Battles</h2><div class="name-actions math-battle-buttons">${btn('1️⃣ Bruchrechnung-Battle beitreten','joinMathFractions','math-fractions-action')}${btn('2️⃣ Rationale-Zahlen-Battle beitreten','joinMathRational','math-rational-action')}${btn('3️⃣ Proportional-/Antiproportional-Klassenarbeit beitreten','joinMathExam','math-exam-action')}</div><p class="muted">Wähle das passende Battle und gib anschließend den Spielcode ein.</p>`);}
function listen(){if(unsubscribe)unsubscribe();stopClock();unsubscribe=onValue(ref(db,`rooms/${code}`),snap=>{room=snap.val();if(!room){msg('Raum nicht gefunden oder gelöscht.',true);return;}render();},e=>msg('Firebase-Zugriff verweigert: '+e.message,true));}
function current(){const m=room?.meta||{},b=Number(m.battle||1)-1,i=Number(m.index||0);if(m.mode==='math-exam')return MATH_PROPORTIONAL_CLASSWORKS[0].questions[i%MATH_PROPORTIONAL_CLASSWORKS[0].questions.length];if(m.mode==='fractions'){const questions=FRACTION_MODULES[b]?.questions||[];return questions[i%Math.max(questions.length,1)];}return (m.subject==='math'?MATH_BATTLES:BATTLES)[b]?.[i%30];}
function roomQuestionCount(m=room?.meta||{}){return m.mode==='math-exam'?MATH_PROPORTIONAL_CLASSWORKS[0].questions.length:m.mode==='fractions'?(FRACTION_MODULES[Number(m.battle||1)-1]?.questions.length||0):30;}
function roomTitle(m=room?.meta||{}){const n=Number(m.battle||1);return m.mode==='math-exam'?'Proportional / Antiproportional · Klassenarbeit 1':m.mode==='fractions'?FRACTION_MODULES[n-1]?.title||'Bruchrechnung':m.subject==='math'?RATIONAL_MATH_TITLES[n-1]||RATIONAL_MATH_TITLES[0]:`Englisch-Battle ${n}`;}
function players(){return Object.entries(room?.slots||{}).map(([id,p])=>({id,...p})).sort((a,b)=>(b.score||0)-(a.score||0));}
function roster(){return players().map((p,i)=>`<div class="player row"><span>${i+1}. ${esc(p.name)}</span><span class="score">${p.score||0}</span></div>`).join('')||'<p>Noch keine Spieler.</p>';}
function chooseBattle(){app.innerHTML=card(`<h2>🎮 Battle auswählen</h2><p>Welches Battle soll gespielt werden?</p><label>Battle<select id="battle-choice"><option value="1">Battle 1 – 30 Fragen</option><option value="2">Battle 2 – 30 Fragen</option><option value="3">Battle 3 – 30 Fragen</option></select></label>${btn('Raum erstellen','createRoom')}`)+card(btn('Zurück','home','alt'));}
function countdown(){const m=room?.meta||{};if(m.stage!=='question'&&m.stage!=='reveal')return '';const remaining=Math.max(0,Math.ceil((Number(m.deadline||0)-Date.now())/1000));return m.stage==='question'?`⏱️ Noch ${remaining} Sekunden`:`⏳ Weiter in ${remaining} Sekunden`;}
function render(){if(!room)return;const m=room.meta||{},q=current(),stage=m.stage||'lobby',questionNumber=m.mode==='math-exam'||m.mode==='fractions'?Number(m.index||0)+1:Number(m.index||0)%30+1;const stageKey=`${m.battle}:${m.index}:${stage}`;let s=card(`<p class="muted">Raumcode</p><div class="big">${esc(code)}</div><p>${esc(roomTitle(m))} · ${stage==='lobby'?'Warteraum':stage==='question'?`Frage ${questionNumber} von ${roomQuestionCount(m)}`:stage==='reveal'?'Auswertung':'Battle beendet'}</p>${roster()}`);
if(role==='host'){
 if(stage==='lobby')s+=card(`<h2>Schiedsrichter</h2><p>Battle ${m.battle} starten – 30 Fragen mit je 15 Sekunden. Danach erscheint die Rangliste.</p>${btn('▶️ Battle starten','start')}`);
 if(stage==='question'){const a=room.answers?.[m.index]||{};s+=card(`<h2>Frage ${Number(m.index)%30+1}</h2><p>${m.subject==='math'?mathText(q?.q||''):esc(q?.q||'')}</p><h2 id="countdown">${countdown()}</h2><p>Antworten: ${Object.keys(a).length} von ${players().length}</p><p class="muted">Automatische Auswertung nach 15 Sekunden</p>`);}
 if(stage==='reveal')s+=card(`<h2>Richtige Antwort</h2><p class="good">${m.subject==='math'?mathText(q?.options[q.correct]??''):esc(q?.options[q.correct]??'')}</p><h2 id="countdown">${countdown()}</h2>`);
 if(stage==='finished')s+=card(`<h2>🏆 Battle ${m.battle} beendet!</h2><p>Rangliste nach 30 Fragen:</p>${roster()}${btn('🔄 Neues Spiel','reset')}`);
 s+=card(btn('Zur Startseite','home','alt'));
}else{
 const myAnswer=room.answers?.[m.index]?.[uid];
 if(stage==='lobby')s+=card('<h2>Warteraum</h2><p>Warte, bis der Schiedsrichter das Battle startet.</p>');
 if(stage==='question'&&q){const answered=myAnswer!==undefined;s+=card(`<h2>${m.subject==='math'?mathText(q.q):esc(q.q)}</h2><h2 id="countdown">${countdown()}</h2><div class="answers">${q.options.map((o,i)=>`<button ${answered||Date.now()>=Number(m.deadline||0)?'disabled':''} data-answer="${i}" class="${answered&&Number(myAnswer.choice)===i?'picked':''}">${m.subject==='math'?mathText(o):esc(o)}</button>`).join('')}</div><p class="muted">${answered?'Antwort abgegeben. Warte auf die Auswertung.':'Wähle eine Antwort innerhalb von 15 Sekunden.'}</p>`);}
 if(stage==='reveal')s+=card(`<h2>Auflösung</h2><p>Richtig: <strong class="good">${m.subject==='math'?mathText(q?.options[q.correct]??''):esc(q?.options[q.correct]??'')}</strong></p><h2 id="countdown">${countdown()}</h2>`);
 if(stage==='finished')s+=card('<h2>🏆 Battle ${m.battle} geschafft!</h2><p>Die Rangliste steht oben.</p>');
 s+=card(btn('Zur Startseite','home','alt'));
}
app.innerHTML=s;
if(stageKey!==previousStageKey){previousStageKey=stageKey;lastClockText='';}
if(stage==='question'||stage==='reveal'){if(clock===null)clock=setInterval(tick,250);tick();}else stopClock();}
function tick(){if(!room)return;const m=room.meta||{},stage=m.stage;if(stage!=='question'&&stage!=='reveal'){stopClock();return;}const text=countdown();if(text!==lastClockText){const el=document.querySelector('#countdown');if(el)el.textContent=text;lastClockText=text;}if(stage==='question'&&Date.now()>=Number(m.deadline||0)){document.querySelectorAll('[data-answer]').forEach(el=>el.disabled=true);}if(role!=='host'||busy||!m.deadline||Date.now()<Number(m.deadline))return;if(stage==='question')void automaticReveal();else if(stage==='reveal')void automaticNext();}
async function makeRoom(){const battle=Number(document.querySelector('#battle-choice')?.value||1);if(!uid){msg('Verbindung wird hergestellt. Bitte kurz warten.',true);return;}code=String(Math.floor(100000+Math.random()*900000));role='host';slot='';try{await set(ref(db,`rooms/${code}/meta`),{hostUid:uid,stage:'lobby',battle,index:(battle-1)*30,createdAt:Date.now()});listen();}catch(e){msg('Raum konnte nicht erstellt werden: '+e.message,true);}}
function joinForm(label='Spiel beitreten',expectedRoomType=''){joinExpectedRoomType=expectedRoomType;app.innerHTML=card(`<h2>${esc(label)}</h2><label>Raumcode<input id="roomcode" inputmode="numeric" maxlength="6" placeholder="6-stelliger Code"></label><label>Dein Name<select id="playername">${names.map(n=>`<option>${n}</option>`).join('')}</select></label>${btn('Beitreten','enter')}`)+card(btn('Zurück','home','alt'));}
async function enter(){const c=document.querySelector('#roomcode').value.trim(),name=document.querySelector('#playername').value;if(!uid){msg('Anmeldung läuft. Bitte kurz warten.',true);return;}if(!/^\d{6}$/.test(c)){msg('Bitte sechsstelligen Code eingeben.',true);return;}try{const snap=await get(ref(db,`rooms/${c}`));if(!snap.exists()){msg('Raumcode nicht gefunden.',true);return;}const r=snap.val();const meta=r.meta||{};if(joinExpectedRoomType){const isMath=meta.subject==='math';const matches=joinExpectedRoomType==='fractions'?isMath&&meta.mode==='fractions':joinExpectedRoomType==='math-exam'?isMath&&meta.mode==='math-exam':isMath&&(meta.mode==='vocab'||meta.mode==='rational'||!meta.mode);if(!matches){msg('Dieser Code gehört zu einem anderen Battle. Bitte nimm den Code für den ausgewählten Button.',true);return;}}let s=Object.keys(r.slots||{}).find(k=>r.slots[k]?.name===name&&r.slots[k]?.uid===uid);if(!s){if(r.meta?.stage!=='lobby'){msg('Das Battle läuft bereits. Bitte einen neuen Raum im Warteraum öffnen.',true);return;}s=String(names.indexOf(name)+1);if(r.slots?.[s]){msg('Dieser Name ist schon vergeben. Bitte anderen Namen wählen.',true);return;}await set(ref(db,`rooms/${c}/slots/${s}`),{name,uid,score:0});}code=c;role='player';slot=s;listen();}catch(e){msg('Beitritt fehlgeschlagen: '+e.message,true);}}
async function automaticReveal(){if(busy||role!=='host'||!room||room.meta?.hostUid!==uid||room.meta.stage!=='question')return;busy=true;const battle=room.meta.battle,index=room.meta.index;try{const q=current();if(!q)throw new Error('Frage nicht gefunden');const ans=room.answers?.[index]||{};for(const p of players()){if(Number(ans[p.uid]?.choice)===q.correct){await runTransaction(ref(db,`rooms/${code}/slots/${p.id}/score`),x=>(Number(x)||0)+10);}}if(room?.meta?.battle===battle&&room?.meta?.index===index&&room?.meta?.stage==='question')await update(ref(db,`rooms/${code}/meta`),{stage:'reveal',deadline:Date.now()+REVEAL_MS});}catch(e){msg('Automatische Auswertung fehlgeschlagen: '+e.message,true);}finally{busy=false;}}
async function automaticNext(){if(busy||role!=='host'||!room||room.meta?.hostUid!==uid||room.meta.stage!=='reveal')return;busy=true;const m={...room.meta},index=Number(m.index)||0;try{const special=m.mode==='math-exam'||m.mode==='fractions',lastQuestion=special?index>=roomQuestionCount(m)-1:index%30>=roomQuestionCount(m)-1;if(lastQuestion)await update(ref(db,`rooms/${code}/meta`),{stage:'finished',deadline:0});else {const nextIndex=index+1;await update(ref(db,`rooms/${code}/meta`),{stage:'question',index:nextIndex,battle:Number(m.battle),deadline:Date.now()+QUESTION_MS});}}catch(e){msg('Nächste Frage konnte nicht gestartet werden: '+e.message,true);}finally{busy=false;}}
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
 const vocabPages=VOCAB_WORK_PAGES.map((page,i)=>firstMistakeSection('vocab',i,page.title,page.items.map(x=>x.accepted))).join('');
 app.innerHTML=card(`<h2>📕 ${esc(soloName)} · Meine Fehlerliste</h2><p>Alle Fehler aus Battles sowie die ersten kontrollierten Versuche bei Vokabelarbeit, Grammatik und Lückentexten. Übungen mit selbst geschriebenen Antworten werden hier auf diesem Handy gespeichert.</p><h2>🎮 Battles</h2>${battles}<h2>📝 Vokabelarbeit</h2>${vocabPages}<h2>📘 Grammatik</h2>${grammar}<h2>✍️ Lückentexte</h2>${gaps}`)+card(btn('Zur Battle-Auswahl','soloHome','alt'));
}
function soloKey(b){return `${key}_${soloName}_battle_${b+1}`;}
function soloSave(){if(!solo)return;solo.updatedAt=Date.now();localStorage.setItem(soloKey(solo.battle),JSON.stringify(solo));touchLearningActivity(soloName,`english_vocab_battle${solo.battle+1}`);void syncSolo();}
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
  if(!resetReady||solo!==currentSolo||soloName!==name||savedAt<=resetStamp(name,'english'))return;
  await set(ref(db,`soloProgress/${device}/${name}/battle${currentSolo.battle+1}`),{
   name,battle:currentSolo.battle+1,done:currentSolo.index,
   correct:Math.floor(currentSolo.score/10),score:currentSolo.score,
   finished:!!currentSolo.finished,mistakes:cleanMistakes(currentSolo.mistakes),updatedAt:savedAt
  });
 }catch(e){msg('Online-Speicherung noch nicht möglich: '+e.message,true);}
}
function soloChooseName(){if(!resetReady){msg('Lernstände werden abgeglichen. Bitte kurz warten.',true);return;}stopSoloHeartbeat();app.innerHTML=card(`<h2>📚 Wer lernt gerade?</h2><p>Wähle deinen Namen, damit der Schiedsrichter deinen Lernfortschritt sehen kann.</p><div class="buttons">${SOLO_NAMES.map((n,i)=>btn(esc(n),`soloName${i}`)).join('')}</div>`)+card(btn('Zurück','home','alt'));}
function soloSetName(i){soloName=SOLO_NAMES[i];localStorage.setItem('vb2solo_name',soloName);soloHome();}
function soloHome(){
 grammarCollect();stopSoloHeartbeat();if(!soloName){soloChooseName();return;}solo=null;
 const battles=[0,1,2].map(b=>{const saved=soloSaved(b),done=saved?.index||0,reviewing=saved&&!saved.finished&&saved.review&&saved.wrong.length;return `<div class="solo-game"><div class="row"><h3>Battle ${b+1}</h3><span class="small">${done} von 30</span></div><p>Fragen erledigt${reviewing?` · 🔁 ${saved.wrong.length} wiederholen`:''}${saved?.finished?' · abgeschlossen':''}</p><div class="solo-actions">${btn(saved?'Neu beginnen':'Starten',`soloStart${b}`)}${saved&&!saved.finished?btn('Fortsetzen',`soloResume${b}`,'alt'):''}</div></div>`;}).join('');
 const clozeCards=[
  ['✍️ Lückentext 1 · Station 1','Übe passende Vokabeln aus Station 1 direkt im Text.','gap0','Lückentext 1 öffnen'],
  ['✍️ Lückentext 2 · Station 2','Übe passende Vokabeln aus Station 2 direkt im Text.','gap1','Lückentext 2 öffnen']
 ].map(([title,description,action,label])=>`<div class="solo-game"><h3>${esc(title)}</h3><p>${esc(description)}</p><div class="solo-actions">${btn(label,action)}</div></div>`).join('');
 const vocabWorkCards=[0,1].map(page=>{const data=VOCAB_WORK_PAGES[page],saved=vocabValues(page),filled=saved.filter(v=>String(v||'').trim()).length,checked=vocabChecked(page);return `<div class="solo-game"><h3>📝 ${esc(data.title)}</h3><p>${page===0?'Aufgaben 1–3 · Sportarten, Gegenteile und Sätze.':'Aufgabe 4 · Julies Nachricht vervollständigen.'} ${filled?`${filled} Antworten eingetragen${checked?' · geprüft':''}.`:'Schreibe die Antworten selbst wie auf dem Arbeitsblatt.'}</p><div class="solo-actions">${btn('Seite öffnen',`vocabPage${page}`)}</div></div>`;}).join('');
 const grammarCards=[
  ['📘 Grammatik · Station 1','Aufgaben 1–4 aus Station 1 selbstständig üben.','grammarStation0','Station 1 öffnen'],
  ['📘 Grammatik · Station 2','Aufgaben 1–7 aus Station 2 selbstständig üben.','grammarStation1','Station 2 öffnen']
 ].map(([title,description,action,label])=>`<div class="solo-game"><h3>${esc(title)}</h3><p>${esc(description)}</p><div class="solo-actions">${btn(label,action)}</div></div>`).join('');
 const listening=listenLoad(),writing=writingLoad(),writingDone=WRITING_TASKS.filter(t=>writing.complete?.[t.id]).length;
 const moreCards=`${grammarCards}<div class="solo-game"><h3>🎧 Listening · Activity weekend in Cardiff</h3><p>${listening?.index||0} von ${LISTENING_QUESTIONS.length} Fragen${listening?.finished?' · abgeschlossen':''}. Höre den Beitrag an und übe die Fragen.</p><div class="solo-actions">${btn(listening?'Neu beginnen':'Listening starten','listenStart')}${listening&&!listening.finished?btn('Fortsetzen','listenResume','alt'):''}</div></div><div class="solo-game"><h3>✍️ Writing · Unit 2</h3><p>${writingDone} von ${WRITING_TASKS.length} Schreibaufgaben selbst geprüft. Plane, schreibe und vergleiche mit Beispielen.</p><div class="solo-actions">${btn('Writing lernen','writingMenu')}</div></div>`;
 app.innerHTML=card(`<h2>📚 ${esc(soloName)} · Englisch lernen</h2><p class="solo-note">Wähle ein Vokabel-Battle oder übe die passenden Vokabeltexte. Dein Fortschritt wird auf diesem Handy und online gespeichert.</p><section class="solo-section"><h3>Vokabel-Battles &amp; passende Texte</h3>${battles}${vocabWorkCards}${clozeCards}</section><section class="solo-section"><h3>Weitere Übungen</h3>${moreCards}</section><section class="solo-section"><h3>Dein Lernbereich</h3><div class="solo-actions solo-utility">${btn('📕 Meine Fehlerliste','soloMistakes','alt')}${btn('📊 Tages-/Wochenauswertung','errorEnglish','alt')}${btn('Anderen Namen wählen','soloChangeName','alt')}</div></section>`)+card(`<div class="solo-actions">${btn('Zurück','home','alt')}</div>`);
}
function soloStart(b){if(!resetReady){msg('Bitte kurz auf den Reset-Abgleich warten.',true);return;}const previous=soloSaved(b);solo={battle:b,index:0,score:0,finished:false,wrong:[],review:false,reviewPos:0,mistakes:cleanMistakes(previous?.mistakes)};void recordLearningActivity(soloName,`english_vocab_battle${b+1}`);soloSave();soloQuestion();}
function soloResume(b){if(!resetReady){msg('Bitte kurz auf den Reset-Abgleich warten.',true);return;}solo=soloSaved(b);if(!solo){soloStart(b);return;}void recordLearningActivity(soloName,`english_vocab_battle${b+1}`);void syncSolo();if(solo.finished)soloFinished();else soloQuestion();}
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
 void recordLearningError(soloName,'english',`english_vocab_battle${solo.battle+1}`,questionIndex,`Vokabel-Battle ${solo.battle+1}`,q,ok);
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

function listeningKey(){return `vb2listen_${soloName}_unit2`;}
function listenLoad(){try{const s=JSON.parse(localStorage.getItem(listeningKey())||'null');if(!s||!Number.isInteger(s.index)||s.index<0||s.index>LISTENING_QUESTIONS.length)return null;s.mistakes=cleanMistakes(s.mistakes);return s;}catch{return null;}}
function listenSave(){if(!listeningRun||!soloName)return;listeningRun.updatedAt=Date.now();localStorage.setItem(listeningKey(),JSON.stringify(listeningRun));touchLearningActivity(soloName,'english_listening');void syncListeningProgress();}
async function syncListeningProgress(){if(!db||!uid||!soloName||!listeningRun)return;const run=listeningRun,now=Date.now();try{await set(ref(db,`soloProgress/${uid}/${soloName}/listeningUnit2`),{done:run.index,total:LISTENING_QUESTIONS.length,score:run.score||0,finished:!!run.finished,mistakes:cleanMistakes(run.mistakes),runId:run.runId,updatedAt:now,timestamp:now});listeningSyncWarned=false;}catch(e){if(!listeningSyncWarned){listeningSyncWarned=true;msg('Listening bleibt auf diesem Handy gespeichert; Online-Speicherung ist gerade nicht verfügbar.',true);}}}
function listenStart(){const old=listenLoad();listeningRun={index:0,score:0,finished:false,mistakes:cleanMistakes(old?.mistakes),runId:`solo-${Date.now()}`};void recordLearningActivity(soloName,'english_listening');listenSave();listenQuestion();}
function listenResume(){listeningRun=listenLoad();if(!listeningRun){listenStart();return;}void recordLearningActivity(soloName,'english_listening');if(listeningRun.finished){listenFinish();return;}listenQuestion();}
function listenQuestion(){if(!listeningRun)return;if(listeningRun.index>=LISTENING_QUESTIONS.length){listenFinish();return;}const q=LISTENING_QUESTIONS[listeningRun.index];app.innerHTML=card(`<h2>🎧 ${esc(soloName)} · Listening</h2><p>Activity weekend in Cardiff · Frage ${listeningRun.index+1} von ${LISTENING_QUESTIONS.length} · ${listeningRun.score} Punkte</p><audio controls preload="none" style="width:100%"><source src="./rl3_track3.mp3" type="audio/mpeg">Dein Browser unterstützt die Audiowiedergabe nicht.</audio><p class="muted">Höre dir den Beitrag an und wähle die passende Antwort. Du kannst die Aufnahme erneut starten.</p><h3>${esc(q.q)}</h3><div class="answers">${q.options.map((o,i)=>`<button data-listenanswer="${i}">${esc(o)}</button>`).join('')}</div>`)+card(btn('Zur Englisch-Auswahl','soloHome','alt'));}
function listenAnswer(i){if(!listeningRun||listeningRun.finished)return;const q=LISTENING_QUESTIONS[listeningRun.index];if(!q||!Number.isInteger(i)||i<0||i>=q.options.length)return;document.querySelectorAll('[data-listenanswer]').forEach(el=>el.disabled=true);const ok=i===q.correct;void recordLearningError(soloName,'english','english_listening',listeningRun.index,'Listening · Activity weekend in Cardiff',q,ok);if(ok)listeningRun.score+=10;else listeningRun.mistakes[listeningRun.index]=(listeningRun.mistakes[listeningRun.index]||0)+1;listeningRun.index++;listenSave();app.innerHTML=card(`<h2>${ok?'✅ Richtig!':'❌ Leider falsch'}</h2><p>Richtige Antwort: <strong>${esc(q.options[q.correct])}</strong></p><p>${listeningRun.score} Punkte</p>${btn('Weiter ➜','listenNext')}`);}
function listenFinish(){if(!listeningRun)return;listeningRun.finished=true;listeningRun.index=LISTENING_QUESTIONS.length;listenSave();app.innerHTML=card(`<h2>🏆 Listening geschafft!</h2><p>Activity weekend in Cardiff</p><p class="score">${listeningRun.score} von ${LISTENING_QUESTIONS.length*10} Punkten</p>${btn('Listening wiederholen','listenStart')}`)+card(btn('Zur Englisch-Auswahl','soloHome','alt'));}
function listenNext(){listenQuestion();}

const writingKey=()=>`vb2writing_${soloName}_unit2`;
function writingLoad(){try{return JSON.parse(localStorage.getItem(writingKey())||'null')||{texts:{},plans:{},checks:{},complete:{}};}catch{return {texts:{},plans:{},checks:{},complete:{}};}}
async function syncWritingProgress(s=writingLoad()){if(!db||!uid||!soloName)return;const done=WRITING_TASKS.filter(t=>s.complete?.[t.id]).length,now=Date.now();try{await set(ref(db,`soloProgress/${uid}/${soloName}/writingUnit2`),{done,total:WRITING_TASKS.length,completed:s.complete||{},currentTask:WRITING_TASKS[writingIndex]?.title||'',active:true,updatedAt:now,timestamp:now});}catch{msg('Writing bleibt auf diesem Handy gespeichert; Online-Speicherung ist gerade nicht verfügbar.',true);}}
function writingSaveField(field,value){const s=writingLoad(),t=WRITING_TASKS[writingIndex];if(!t)return;s[field]=s[field]||{};if(field==='checks'){s[field][t.id]=s[field][t.id]||[];s[field][t.id][value.index]=value.checked;}else s[field][t.id]=value;localStorage.setItem(writingKey(),JSON.stringify(s));if(writingSyncTimer)clearTimeout(writingSyncTimer);writingSyncTimer=setTimeout(()=>void syncWritingProgress(s),700);}
function writingMenu(){if(!soloName){soloChooseName();return;}const s=writingLoad(),done=WRITING_TASKS.filter(t=>s.complete?.[t.id]).length;app.innerHTML=card(`<h2>✍️ Writing · Unit 2</h2><p>Übe Schritt für Schritt: planen, schreiben, mit einem Beispiel vergleichen und selbst prüfen.</p><div class="solo-game"><h3>💡 Adjektiv oder Adverb?</h3><p><strong>Adjektive</strong> beschreiben Dinge oder Personen: <em>a fast sport</em> (ein schneller Sport).</p><p><strong>Adverbien</strong> beschreiben, wie jemand etwas tut: <em>run quickly</em> (schnell laufen).</p><p>Oft kommt <strong>-ly</strong> dazu: careful → carefully, slow → slowly, easy → easily. Merke: fast → fast, hard → hard, good → well.</p></div><p>${done} von ${WRITING_TASKS.length} Aufgaben selbst geprüft</p>${WRITING_TASKS.map((t,i)=>`<div class="solo-game"><h3>${esc(t.title)} ${s.complete?.[t.id]?'✅':''}</h3><p>${esc(t.goal)}</p><p class="muted">${esc(t.focus)}</p><div class="solo-actions">${btn(s.complete?.[t.id]?'Weiter üben':'Aufgabe öffnen',`writingOpen${i}`)}</div></div>`).join('')}`)+card(btn('Zur Englisch-Auswahl','soloHome','alt'));}
function writingOpen(i){if(!WRITING_TASKS[i])return;writingIndex=i;writingModelVisible=false;void recordLearningActivity(soloName,`english_writing_task${i+1}`);writingRender();void syncWritingProgress();}
function writingRender(){const t=WRITING_TASKS[writingIndex];if(!t){writingMenu();return;}const s=writingLoad(),text=String(s.texts?.[t.id]||''),plan=String(s.plans?.[t.id]||''),checks=s.checks?.[t.id]||[];app.innerHTML=card(`<h2>✍️ ${esc(t.title)}</h2><p><strong>Deine Aufgabe:</strong> ${esc(t.goal)}</p><p class="muted">${esc(t.focus)}</p><div class="solo-game"><h3>So gehst du vor</h3><ol>${t.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><h3>Satzanfänge als Hilfe</h3>${t.frames.map(x=>`<p><code>${esc(x)}</code></p>`).join('')}</div>${t.id==='article'?`<label>Meine Stichpunkte<textarea data-writingplan rows="4" maxlength="1500" placeholder="Sportart · was ist daran toll? · was tut man? · was braucht man? · wie sollte man sein?" style="width:100%;padding:12px;border-radius:10px;font:inherit">${esc(plan)}</textarea></label>`:''}<label>Dein Text<textarea data-writingtext rows="10" maxlength="5000" placeholder="Schreibe deinen eigenen Text hier …" style="width:100%;padding:12px;border-radius:10px;font:inherit">${esc(text)}</textarea></label><p class="muted">Dein Text wird automatisch auf diesem Handy gespeichert.</p>${btn(writingModelVisible?'Musterlösung ausblenden':'Musterlösung ansehen','writingModel','alt')}${writingModelVisible?`<div class="solo-game"><h3>Musterlösung</h3><p style="white-space:pre-wrap;line-height:1.6">${esc(t.model)}</p><p class="muted">Vergleiche die Ideen und schreibe deine eigene Version.</p></div>`:''}<div class="solo-game"><h3>Meine Checkliste</h3>${t.checklist.map((x,i)=>`<label style="display:flex;gap:10px;align-items:flex-start;margin:10px 0"><input type="checkbox" data-writingcheck="${i}" ${checks[i]?'checked':''} style="width:auto;margin-top:4px"> <span>${esc(x)}</span></label>`).join('')}</div><div class="solo-actions">${btn(s.complete?.[t.id]?'Als noch offen markieren':'Ich habe geprüft – Aufgabe abschließen','writingComplete')}${writingIndex>0?btn('← Vorige Aufgabe',`writingOpen${writingIndex-1}`,'alt'):''}${writingIndex<WRITING_TASKS.length-1?btn('Nächste Aufgabe →',`writingOpen${writingIndex+1}`,'alt'):''}</div>`)+card(btn('Zur Writing-Übersicht','writingMenu','alt'));}
function writingToggleComplete(){const t=WRITING_TASKS[writingIndex],s=writingLoad();if(!t)return;s.complete=s.complete||{};if(s.complete[t.id])delete s.complete[t.id];else{if(!String(s.texts?.[t.id]||'').trim()){msg('Schreibe erst deinen Text und vergleiche ihn mit der Musterlösung.',true);return;}if((s.checks?.[t.id]||[]).filter(Boolean).length<t.checklist.length){msg('Prüfe alle Punkte in der Checkliste, bevor du die Aufgabe abschließt.',true);return;}s.complete[t.id]=true;}localStorage.setItem(writingKey(),JSON.stringify(s));void syncWritingProgress(s);writingRender();}
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
let mathName='',mathRun=null,mathView='',mathPracticeGroup='proportional',mathPendingAction='',mathPendingSolution=null,fractionPendingSolution=null;
const mathKey=(n,b)=>`vb2math_${n}_battle_${b+1}`;
const MATH_CARDS=[
 ['Was sind rationale Zahlen?','Rationale Zahlen lassen sich als Bruch schreiben: Zähler und Nenner sind ganze Zahlen, der Nenner ist nicht 0.'],
 ['Wie schreibt man −3 als rationale Zahl?','−3 = −3/1.'],
 ['Was ist ein Bruch?','Ein Bruch besteht aus Zähler (oben) und Nenner (unten).'],
 ['Wie addiert man Brüche?','Auf einen gemeinsamen Nenner bringen, dann die Zähler addieren.'],
 ['Berechne: 1/4 + 2/4','(1 + 2)/4 = 3/4.'],
 ['Wie subtrahiert man Brüche?','Auf einen gemeinsamen Nenner bringen, dann die Zähler subtrahieren.'],
 ['Berechne: 5/6 − 1/3','1/3 = 2/6, also 5/6 − 2/6 = 3/6 = 1/2.'],
 ['Wie multipliziert man Brüche?','Zähler mal Zähler und Nenner mal Nenner.'],
 ['Berechne: 2/3 × 3/4','(2 × 3)/(3 × 4) = 6/12 = 1/2.'],
 ['Wie dividiert man Brüche?','Den ersten Bruch mit dem Kehrwert des zweiten multiplizieren.'],
 ['Berechne: 3/5 ÷ 2/7','3/5 × 7/2 = 21/10 = 2 1/10.'],
 ['Was ist der Kehrwert einer Zahl?','Der Bruch, bei dem Zähler und Nenner vertauscht sind.'],
 ['Wie vergleicht man rationale Zahlen?','Auf einen gemeinsamen Nenner bringen oder als Dezimalzahlen schreiben.'],
 ['Was ist größer: 3/4 oder 5/8?','3/4 = 6/8 und 6/8 > 5/8. Also ist 3/4 größer.'],
 ['Wie wird eine gemischte Zahl zum unechten Bruch?','Ganze Zahl × Nenner + Zähler. Das Ergebnis wird der neue Zähler; der Nenner bleibt gleich.'],
 ['Wandle 2 1/3 in einen unechten Bruch um.','2 × 3 + 1 = 7, also 7/3.'],
 ['Wie wird ein unechter Bruch zur gemischten Zahl?','Zähler durch Nenner teilen. Der Quotient ist die ganze Zahl, der Rest wird der Zähler.'],
 ['Wandle 9/4 in eine gemischte Zahl um.','9 ÷ 4 = 2 Rest 1, also 2 1/4.'],
 ['Was bedeutet Kürzen?','Zähler und Nenner durch dieselbe Zahl teilen, am besten durch einen gemeinsamen Teiler.'],
 ['Kürze 8/12.','8/12 = (8 ÷ 4)/(12 ÷ 4) = 2/3.']
];
function mathLoad(n,b){try{return JSON.parse(localStorage.getItem(mathKey(n,b))||'null');}catch{return null;}}
function mathSave(){if(!mathRun)return;mathRun.updatedAt=Date.now();localStorage.setItem(mathKey(mathName,mathRun.b),JSON.stringify(mathRun));touchLearningActivity(mathName,mathActivityId(mathRun.b));void mathSync();}
async function mathSync(){
 if(!db||!uid||!mathRun||!mathName||!resetReady)return;
 const currentRun=mathRun,name=mathName,device=uid,savedAt=Number(mathRun.updatedAt)||0;
 try{
  const rs=await get(ref(db,'learningResets'));
  applyResetState(rs.val());
  const moduleStamp=currentRun.b===5?(Number(resetState[name+'__math_battle6'])||0):currentRun.b===6?(Number(resetState[name+'__math_proportional'])||0):currentRun.b>=7&&currentRun.b<=9?(Number(resetState[name+'__math_proportional_exam'+(currentRun.b-6)])||0):currentRun.b>=10&&currentRun.b<=18?(Number(resetState[name+'__math_proportional_practice_'+MATH_PROPORTIONAL_PRACTICE_BLOCKS[currentRun.b-10]?.id])||0):0;
  if(!resetReady||mathRun!==currentRun||mathName!==name||savedAt<=Math.max(resetStamp(name,'math'),moduleStamp))return;
  await set(ref(db,`mathProgress/${device}/${name}/battle${currentRun.b+1}`),{done:currentRun.index,score:currentRun.score,mistakes:currentRun.mistakes,updatedAt:savedAt,finished:!!currentRun.finished});
 }catch(e){msg('Mathe online noch nicht verfügbar – der Fortschritt bleibt auf diesem Gerät gespeichert.',true);}
}
function mathChoose(){mathRun=null;mathView='';app.innerHTML=card('<h2>🔢 Mathe · Klasse 7 NRW</h2><p>Wähle ein Kapitel zum Lernen oder eine Klassenarbeit.</p><div class="name-actions">'+btn('➗ Bruchrechnung','mathViewFractions','math-choice-fractions')+btn('🔢 Rationale Zahlen','mathViewRational','math-choice-rational')+btn('📈 Proportional / Antiproportional','mathViewProportional','math-choice-proportional')+btn('📝 Klassenarbeit Brüche','mathViewExam','math-choice-exam-fractions')+btn('📝 Klassenarbeit Rationale Zahlen','mathViewRationalExam','math-choice-exam-rational')+btn('📝 Klassenarbeit Proportional / Antiproportional','mathViewProportionalExam','math-choice-proportional-exam')+'</div>'+btn('📊 Tages-/Wochenauswertung Mathe','errorMath','alt'))+card(btn('Zur Fächerauswahl','home','alt'));}
function mathSelectView(view){mathView=view;mathHome();if(view==='proportional')window.scrollTo(0,0);}
function mathNeedName(action){if(mathName)return false;mathPendingAction=action;app.innerHTML=card('<h2>📚 Wer lernt gerade?</h2><p>Wähle deinen Namen, damit dein Lernstand gespeichert wird.</p><div class="name-actions">'+SOLO_NAMES.map((n,i)=>btn(esc(n),`mathName${i}`)).join('')+'</div>')+card(btn('Zur Aufgabenübersicht','mathHome','alt'));return true;}
function mathSetName(i){mathName=SOLO_NAMES[i];const action=mathPendingAction;mathPendingAction='';if(action)mathAction(action);else mathHome();}
function mathHome(){mathRun=null;const back=card(btn('Zur Mathe-Auswahl','mathChoose','alt'))+card(btn('Fach wechseln','home','alt'));
 if(mathView==='fractions'){const fractions=FRACTION_MODULES.map(m=>{const v=fractionLoad(mathName,m.id);return '<div class="player"><h3>'+esc(m.title)+'</h3><p>'+Math.min(m.questions.length,Number(v?.index)||0)+'/'+m.questions.length+' Aufgaben · '+(Number(v?.score)||0)+' Punkte'+(v?.finished?' · abgeschlossen':'')+'</p>'+btn(v?.index&&!v.finished?'Weiterlernen':v?.finished?'Noch einmal üben':'Erklärung & Start','fractionOpen_'+m.id)+'</div>';}).join('');app.innerHTML=card('<h2>➗ Bruchrechnung · Klasse 7'+(mathName?' · '+esc(mathName):'')+'</h2><p>Erklärungen und Übungsfragen zu allen sieben Themen.</p>'+fractions+btn('📕 Meine Mathe-Fehlerliste','mathMistakes','alt'))+back;return;}
 if(mathView==='exam'){const x=mathLoad(mathName,4),done=Math.min(MATH_EXAM_BATTLE.length,Number(x?.index)||0);app.innerHTML=card('<h2>📝 Klassenarbeit Brüche & Rationale Zahlen'+(mathName?' · '+esc(mathName):'')+'</h2><p>20 gemischte Aufgaben zu rationalen Zahlen und Bruchrechnung.</p><div class="player"><h3>Klassenarbeit Brüche & Rationale Zahlen</h3><p>'+done+'/'+MATH_EXAM_BATTLE.length+' Aufgaben · '+(Number(x?.score)||0)+' Punkte'+(x?.finished?' · abgeschlossen':'')+'</p>'+btn(x?.finished?'Noch einmal üben':done>0?'Neu beginnen':'Klassenarbeit starten','mathStart4')+(x&&!x.finished&&done>0?btn('Fortsetzen','mathResume4','alt'):'')+'</div>')+back;return;}
 if(mathView==='rationalExam'){const x=mathLoad(mathName,5),done=Math.min(MATH_RATIONAL_EXAM_BATTLE.length,Number(x?.index)||0);app.innerHTML=card('<h2>📝 Mathe Klassenarbeit Rationale Zahlen'+(mathName?' · '+esc(mathName):'')+'</h2><p>20 Aufgaben zu Vergleichen, Betrag, Rechenregeln und gemischten Rechnungen mit rationalen Zahlen.</p><div class="player"><h3>Klassenarbeit Rationale Zahlen</h3><p>'+done+'/'+MATH_RATIONAL_EXAM_BATTLE.length+' Aufgaben · '+(Number(x?.score)||0)+' Punkte'+(x?.finished?' · abgeschlossen':'')+'</p>'+btn(x?.finished?'Noch einmal üben':done>0?'Neu beginnen':'Klassenarbeit starten','mathStart5')+(x&&!x.finished&&done>0?btn('Fortsetzen','mathResume5','alt'):'')+'</div>')+back;return;}
 if(mathView==='proportionalExam'){
 const classworks=MATH_PROPORTIONAL_CLASSWORKS.map((exam,index)=>{const b=7+index,s=mathLoad(mathName,b),finished=!!s?.finished,completed=Math.min(exam.questions.length,Number(s?.index)||0);return '<div class="player proportional-test-card"><h3>📝 '+esc(exam.title)+'</h3><p>Empfohlene Arbeitszeit: 45 Minuten · 15 Aufgaben · 30 Punkte</p><p>'+completed+'/15 Aufgaben · '+(Number(s?.score)||0)+'/30 Punkte'+(finished?' · abgeschlossen':'')+'</p>'+btn(finished?'Noch einmal üben':completed?'Neu beginnen':'Klassenarbeit starten','mathStart'+b)+(s&&!finished&&completed?btn('Fortsetzen','mathResume'+b,'alt'):'')+'</div>';}).join('');
 app.innerHTML=card('<h2>📝 Klassenarbeiten · Proportional / Antiproportional'+(mathName?' · '+esc(mathName):'')+'</h2><p>Wähle eine der drei Arbeiten. Jede umfasst 15 Aufgaben, 30 Punkte und 45 Minuten. Bei falschen Antworten werden Lösung und Rechenweg angezeigt.</p>'+classworks)+back;return;
 }
 if(mathView==='proportionalPractice'){
  const firstIndex=mathPracticeGroup==='proportional'?0:mathPracticeGroup==='antiproportional'?3:6;
  const chosenBlocks=MATH_PROPORTIONAL_PRACTICE_BLOCKS.slice(firstIndex,firstIndex+3).map((block,choiceIndex)=>{const index=firstIndex+choiceIndex,b=10+index,s=mathLoad(mathName,b),done=Math.min(block.questions.length,Number(s?.index)||0),finished=!!s?.finished,button=finished?'Block '+(choiceIndex+1)+' noch einmal':done?'Block '+(choiceIndex+1)+' neu starten':'Block '+(choiceIndex+1)+' starten';return '<div class="player proportional-test-card"><h3>'+esc(block.title)+'</h3><p>15 Lernaufgaben · 15 Punkte</p><p>'+done+'/15 Aufgaben · '+(Number(s?.score)||0)+'/15 Punkte'+(finished?' · abgeschlossen':'')+'</p>'+btn(button,'mathStart'+b)+(s&&!finished&&done?btn('Fortsetzen','mathResume'+b,'alt'):'')+'</div>';}).join('');
  const heading=mathPracticeGroup==='proportional'?'↗ Proportional':mathPracticeGroup==='antiproportional'?'↕ Antiproportional':'🟣 Gemischte Aufgaben';
  app.innerHTML=card('<h2>'+heading+' · Aufgaben auswählen</h2><p>Wähle einen der drei Blöcke.</p>'+chosenBlocks)+card(btn('Zurück zu Formeln und Auswahl','mathViewProportional','alt'))+card(btn('Zur Mathe-Auswahl','mathChoose','alt'));return;
 }
 if(mathView==='proportional'){
 const practiceCards=MATH_PROPORTIONAL_PRACTICE_BLOCKS.map((block,index)=>{const b=10+index,s=mathLoad(mathName,b),done=Math.min(block.questions.length,Number(s?.index)||0),finished=!!s?.finished,button=finished?'Noch einmal üben':done?'Neu beginnen':'Übung starten';return '<div class="player proportional-test-card"><h3>'+esc(block.title)+'</h3><p>15 Lernaufgaben · 15 Punkte</p><p>'+done+'/15 Aufgaben · '+(Number(s?.score)||0)+'/15 Punkte'+(finished?' · abgeschlossen':'')+'</p>'+btn(button,'mathStart'+b)+(s&&!finished&&done?btn('Fortsetzen','mathResume'+b,'alt'):'')+'</div>';});
 const practiceTabs='<div class="proportional-practice-tabs" role="group" aria-label="Übungsart auswählen"><button type="button" class="proportional-practice-button proportional-practice-pro" data-action="mathPracticePro">↗ Proportional</button><button type="button" class="proportional-practice-button proportional-practice-anti" data-action="mathPracticeAnti">↕ Antiproportional</button><button type="button" class="proportional-practice-button proportional-practice-mixed" data-action="mathPracticeMixed">⚖️ Gemischte Aufgaben</button></div>';
 const practicePanel='<section class="proportional-practice-panel"><h3>Übungswege</h3><p>Wähle, was du üben möchtest.</p>'+practiceTabs+'</section>';
 const proportionalTable='<div class="proportional-table-wrap"><table class="proportional-table"><caption>Gleicher Preis: 2 € pro Heft</caption><tbody><tr><th scope="row">Anzahl Hefte (x)</th><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><th scope="row">Preis in € (y)</th><td>2</td><td>4</td><td>6</td><td>8</td></tr><tr class="table-rule"><th scope="row">Quotient y : x</th><td>2</td><td>2</td><td>2</td><td>2</td></tr></tbody></table></div>';
 const antiproportionalTable='<div class="proportional-table-wrap"><table class="proportional-table"><caption>Dieselbe Arbeit: 12 Arbeiterstunden</caption><tbody><tr><th scope="row">Arbeiter (x)</th><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><th scope="row">Zeit in Stunden (y)</th><td>12</td><td>6</td><td>4</td><td>3</td></tr><tr class="table-rule"><th scope="row">Produkt x · y</th><td>12</td><td>12</td><td>12</td><td>12</td></tr></tbody></table></div>';
 const proportionalVideo='<a class="proportional-video-link" href="https://studyflix.de/mathematik/proportionale-zuordnung-3238/video" target="_blank" rel="noopener noreferrer">▶️ Erklärvideo starten: Proportional</a>';
 const antiproportionalVideo='<a class="proportional-video-link" href="https://studyflix.de/mathematik/antiproportionale-zuordnung-3254/video" target="_blank" rel="noopener noreferrer">▶️ Erklärvideo starten: Antiproportional</a>';
 app.innerHTML=card('<h2>📈 Proportional / Antiproportional'+(mathName?' · '+esc(mathName):'')+'</h2><p class="proportional-meta">Klasse 7 · NRW</p>'+practicePanel+'<div class="proportional-notes"><article class="proportional-note proportional-card"><div class="proportional-note-heading"><span class="proportional-note-icon">↗</span><div><span class="proportional-kicker">Verstehen</span><h3>Proportional</h3></div><strong class="proportional-formula">y : x = k</strong></div><p>Beide Größen verändern sich im gleichen Verhältnis. Der Quotient bleibt gleich.</p><div class="proportional-example"><strong>Beispiel</strong><p>2 Stunden → 140 km. Pro Stunde sind das 140 : 2 = 70 km. In 3,5 Stunden sind es 70 · 3,5 = 245 km.</p><p>So sieht eine proportionale Tabelle aus: Je mehr Hefte, desto höher der Preis. Der Quotient bleibt immer 2.</p>'+proportionalTable+proportionalVideo+'</div></article><article class="proportional-note antiproportional-card"><div class="proportional-note-heading"><span class="proportional-note-icon">↕</span><div><span class="proportional-kicker">Verstehen</span><h3>Antiproportional</h3></div><strong class="proportional-formula">x · y = k</strong></div><p>Wird eine Größe größer, wird die andere entsprechend kleiner. Das Produkt bleibt gleich.</p><div class="proportional-example"><strong>Beispiel</strong><p>4 Arbeiter · 12 Stunden = 48 Arbeiterstunden. Mit 6 Arbeitern dauert es 48 : 6 = 8 Stunden.</p><p>In dieser Tabelle bleibt das Produkt aus Arbeiterzahl und Zeit immer 12.</p>'+antiproportionalTable+antiproportionalVideo+'</div></article></div><div class="proportional-material-panel"><h3>Erklärungen und Lernmaterial</h3><p>Zum Verstehen und Wiederholen.</p><div class="proportional-material-buttons">'+btn('📄 Arbeitsblatt','mathProportionalWorksheet')+btn('📖 Lernkarten','mathProportionalFlashcards')+'</div></div>'+btn('📕 Meine Mathe-Fehlerliste','mathMistakes','alt'))+back;return;
}
 const titles=['Zahlen vergleichen, addieren und subtrahieren','Multiplizieren und dividieren','Klammern und gemischte Rechnungen'];const battles=titles.map((t,b)=>{const x=mathLoad(mathName,b);return '<div class="player"><h3>'+RATIONAL_MATH_TITLES[b]+'</h3><p>'+esc(t)+'</p><p>'+(x?.index||0)+'/30 Aufgaben · '+(x?.score||0)+' Punkte</p>'+btn('Neu beginnen','mathStart'+b)+((x&&!x.finished)?btn('Fortsetzen','mathResume'+b,'alt'):'')+'</div>';}).join('');const x=mathLoad(mathName,3);const exercise='<div class="player"><h3>'+RATIONAL_MATH_TITLES[3]+'</h3><p>Merkkarten zu Brüchen, Rechenregeln, Vergleichen und Umwandeln</p><p>'+Math.min(MATH_CARDS.length,Number(x?.index)||0)+'/'+MATH_CARDS.length+' Karten · '+(Number(x?.score)||0)+' Punkte'+(x?.finished?' · abgeschlossen':'')+(x?.missed?.length?' · 🔁 '+x.missed.length+' zum Wiederholen':'')+'</p>'+btn(x&&x.index>0&&!x.finished?'Weiterlernen':x?.finished?'Noch einmal üben':'Starten','mathFlashStart')+(x&&x.index>0&&!x.finished?btn('Fortsetzen','mathFlashResume','alt'):'')+'</div>';app.innerHTML=card('<h2>🔢 Rationale Zahlen · Klasse 7'+(mathName?' · '+esc(mathName):'')+'</h2><p>Zahlen vergleichen, rechnen und umwandeln.</p>'+exercise+battles+btn('📕 Meine Mathe-Fehlerliste','mathMistakes','alt'))+back;}
let fractionRun=null;
function fractionLoad(name,id){try{return JSON.parse(localStorage.getItem('vb2math_'+name+'_fraction_'+id)||'null');}catch{return null;}}
function fractionSave(){if(!fractionRun||!mathName)return;fractionRun.updatedAt=Date.now();localStorage.setItem('vb2math_'+mathName+'_fraction_'+fractionRun.id,JSON.stringify(fractionRun));touchLearningActivity(mathName,'math_fraction_'+fractionRun.id);void fractionSync();}
async function fractionSync(){if(!db||!uid||!fractionRun||!mathName||!resetReady)return;try{const stamp=Number(resetState[mathName+'__math_fraction_'+fractionRun.id])||resetStamp(mathName,'math');if(fractionRun.updatedAt<=stamp)return;await set(ref(db,'mathProgress/'+uid+'/'+mathName+'/fraction_'+fractionRun.id),{done:fractionRun.index,score:fractionRun.score,mistakes:fractionRun.mistakes,updatedAt:fractionRun.updatedAt,finished:!!fractionRun.finished});}catch(e){msg('Bruch-Fortschritt online noch nicht verfügbar. Lokal bleibt er gespeichert.',true);}}
function fractionOpen(id){const m=FRACTION_MODULES.find(x=>x.id===id);if(!m)return;fractionRun=null;const v=fractionLoad(mathName,id);app.innerHTML=card('<h2>➗ '+esc(m.title)+'</h2><h3>So geht’s</h3><p>'+mathText(m.lesson)+'</p><div class="player"><strong>Beispiel:</strong><p>'+mathText(m.example)+'</p></div><p>'+(v?Math.min(m.questions.length,Number(v.index)||0)+'/'+m.questions.length+' Aufgaben · '+(Number(v.score)||0)+' Punkte':'')+'</p>'+btn(v?.index&&!v.finished?'Weiterlernen':v?.finished?'Noch einmal üben':'Übung starten','fractionStart_'+id))+card(btn('Zur Mathe-Übersicht','mathHome','alt'));}
function fractionStart(id){if(mathNeedName('fractionStart_'+id))return;const old=fractionLoad(mathName,id),m=FRACTION_MODULES.find(x=>x.id===id);if(!m)return;fractionRun=old&&!old.finished?old:{id:id,index:0,score:0,finished:false,mistakes:{}};void recordLearningActivity(mathName,'math_fraction_'+id);fractionSave();fractionQuestion();}
function fractionQuestion(){if(!fractionRun)return;const m=FRACTION_MODULES.find(x=>x.id===fractionRun.id);if(!m)return;if(fractionRun.index>=m.questions.length){fractionRun.finished=true;fractionSave();app.innerHTML=card('<h2>🏁 '+esc(m.title)+' geschafft!</h2><p>'+fractionRun.score+' von '+(m.questions.length*10)+' Punkten</p>'+btn('Zur Mathe-Übersicht','mathHome'));return;}const q=m.questions[fractionRun.index];app.innerHTML=card('<h2>➗ '+esc(m.shortTitle)+'</h2><p>Aufgabe '+(fractionRun.index+1)+' von '+m.questions.length+' · '+fractionRun.score+' Punkte</p><h3>'+mathText(q.q)+'</h3><div class="answers">'+q.options.map((o,i)=>'<button data-fractionanswer="'+i+'">'+mathText(o)+'</button>').join('')+'</div>')+card(btn('Zur Übersicht','mathHome','alt'));}
function fractionAnswer(i){if(!fractionRun)return;const m=FRACTION_MODULES.find(x=>x.id===fractionRun.id),questionIndex=fractionRun.index,q=m?.questions[questionIndex];if(!q||!Number.isInteger(i)||i<0||i>=q.options.length)return;document.querySelectorAll('[data-fractionanswer]').forEach(el=>el.disabled=true);const ok=i===q.correct;void recordLearningError(mathName,'math',`math_fraction_${m.id}`,questionIndex,`Bruchrechnung · ${m.title}`,q,ok);if(ok)fractionRun.score+=10;else fractionRun.mistakes[questionIndex]=(fractionRun.mistakes[questionIndex]||0)+1;fractionRun.index++;fractionSave();if(!ok){fractionPendingSolution={q};app.innerHTML=card('<h2>❌ Schau noch einmal auf die Regel</h2><p>💡 Tipp: Überlege, ob du zuerst gleichnamig machen, kürzen oder die passende Rechenregel anwenden musst.</p>'+btn('Lösung und Rechenweg ansehen','fractionShowSolution'));return;}app.innerHTML=card('<h2>✅ Richtig!</h2><p>'+fractionRun.score+' Punkte</p>'+btn('Weiter ➜','fractionNext'));}
function fractionShowSolution(){if(!fractionPendingSolution)return;const q=fractionPendingSolution.q;fractionPendingSolution=null;app.innerHTML=card('<h2>❌ Richtige Lösung</h2><p><strong>Antwort:</strong> '+mathText(q.options[q.correct])+'</p><p style="white-space:pre-line"><strong>Rechenweg:</strong> '+mathText(q.explain)+'</p><p>'+fractionRun.score+' Punkte</p>'+btn('Weiter ➜','fractionNext'));}
function mathStart(b,resume=false){if(mathNeedName((resume?'mathResume':'mathStart')+b))return;const s=resume?mathLoad(mathName,b):null;mathRun=s&&s.index>=0?s:{b,index:0,score:0,finished:false,mistakes:{}};void recordLearningActivity(mathName,mathActivityId(b));mathSave();mathQuestion();}
function mathExamData(b){
 if(b===4)return {title:'Mathe-Klassenarbeit',questions:MATH_EXAM_BATTLE};
 if(b===5)return {title:'Mathe Klassenarbeit Rationale Zahlen',questions:MATH_RATIONAL_EXAM_BATTLE};
 if(b===6)return {title:'Proportional / Antiproportional · Übungsbattle',questions:MATH_PROPORTIONAL_EXAM_BATTLE};
 if(b>=7&&b<=9){const exam=MATH_PROPORTIONAL_CLASSWORKS[b-7];return exam?{title:exam.title,questions:exam.questions,points:exam.points}:null;}
 if(b>=10&&b<=18){const block=MATH_PROPORTIONAL_PRACTICE_BLOCKS[b-10];return block?{title:block.title,questions:block.questions,points:block.points}:null;}
 return null;
}
function mathQuestion(){
 if(!mathRun)return;
 const exam=mathExamData(mathRun.b),questions=exam?.questions,total=questions?.length||30,maxPoints=exam?.points||total*10;
 if(mathRun.index>=total){mathRun.finished=true;mathSave();app.innerHTML=card('<h2>🏆 '+esc(exam?.title||RATIONAL_MATH_TITLES[mathRun.b]+' geschafft!')+'</h2><p>'+mathRun.score+' von '+maxPoints+' Punkten</p>'+btn('Zur Übersicht','mathHome'));return;}
 const q=questions?questions[mathRun.index]:MATH_BATTLES[mathRun.b][mathRun.index],title=exam?.title||RATIONAL_MATH_TITLES[mathRun.b];
 app.innerHTML=card('<h2>🔢 '+esc(title)+'</h2><p>Aufgabe '+(mathRun.index+1)+'/'+total+' · '+mathRun.score+'/'+maxPoints+' Punkte</p><h2>'+mathText(q.q)+'</h2><div class="answers">'+q.options.map((o,i)=>'<button data-mathanswer="'+i+'">'+mathText(o)+'</button>').join('')+'</div>')+card(btn('Zur Mathe-Übersicht','mathHome','alt'));
}
function mathAnswer(i){
 if(!mathRun)return;
 const exam=mathExamData(mathRun.b),questions=exam?.questions,total=questions?.length||30;
 if(mathRun.index>=total)return;
 const q=questions?questions[mathRun.index]:MATH_BATTLES[mathRun.b][mathRun.index],ok=i===q.correct;
 document.querySelectorAll('[data-mathanswer]').forEach(el=>el.disabled=true);
 const exercise=mathActivityId(mathRun.b),topic=mathExamData(mathRun.b)?.title||RATIONAL_MATH_TITLES[mathRun.b]||'Mathe';void recordLearningError(mathName,'math',exercise,mathRun.index,topic,q,ok);if(ok)mathRun.score+=Number(q.points)||10;else mathRun.mistakes[mathRun.index]=(mathRun.mistakes[mathRun.index]||0)+1;
 mathRun.index++;mathSave();
 if(!ok){mathPendingSolution={q};app.innerHTML=card('<h2>❌ Noch nicht richtig</h2><p>💡 Tipp: Lies die Aufgabe noch einmal und überlege, welche Regel oder Rechnung dazu passt. Rechne Schritt für Schritt.</p>'+btn('Lösung und Rechenweg ansehen','mathShowSolution'));return;}
 app.innerHTML=card('<h2>✅ Richtig!</h2><p>'+mathRun.score+' Punkte</p>'+btn('Weiter ➜','mathNext'));
}
function mathShowSolution(){if(!mathPendingSolution)return;const q=mathPendingSolution.q;mathPendingSolution=null;app.innerHTML=card('<h2>❌ Richtige Lösung</h2><p><strong>Antwort:</strong> '+mathText(q.options[q.correct])+'</p><p><strong>Rechenweg:</strong> '+mathText(q.explanation||q.explain||'')+'</p><p>'+mathRun.score+' Punkte</p>'+btn('Weiter ➜','mathNext'));}
function mathFlashStart(){if(mathNeedName('mathFlashStart'))return;mathRun={b:3,index:0,score:0,finished:false,mistakes:{},missed:[],review:false,reviewPos:0,revealed:false};void recordLearningActivity(mathName,'math_rational_cards');mathSave();mathFlashShow();}
function mathFlashResume(){if(mathNeedName('mathFlashResume'))return;const s=mathLoad(mathName,3);if(!s){mathFlashStart();return;}void recordLearningActivity(mathName,'math_rational_cards');mathRun={...s,b:3,missed:Array.isArray(s.missed)?s.missed:[],mistakes:s.mistakes||{},review:!!s.review,reviewPos:Number(s.reviewPos)||0,revealed:false};mathFlashShow();}
function mathFlashShow(){if(!mathRun)return;const cards=MATH_CARDS;if(!mathRun.review&&mathRun.index>=cards.length){if(mathRun.missed.length){mathRun.review=true;mathRun.reviewPos=0;mathRun.revealed=false;mathSave();}else{mathRun.finished=true;mathSave();app.innerHTML=card(`<h2>🏁 ${RATIONAL_MATH_TITLES[3]} geschafft!</h2><p>Du hast alle ${cards.length} Karten gelernt.</p><p class="score">${mathRun.score} von ${cards.length*10} Punkten</p>${btn('Zur Mathe-Übersicht','mathHome')}`);return;}}
 if(mathRun.review&&!mathRun.missed.length){mathRun.review=false;mathRun.finished=true;mathSave();app.innerHTML=card(`<h2>🏆 ${RATIONAL_MATH_TITLES[3]} geschafft!</h2><p>Du hast alle Karten noch einmal geübt.</p><p class="score">${mathRun.score} von ${cards.length*10} Punkten</p>${btn('Zur Mathe-Übersicht','mathHome')}`);return;}
 const index=mathRun.review?mathRun.missed[mathRun.reviewPos]:mathRun.index,[q,a]=cards[index];const num=mathRun.review?`Wiederholung ${mathRun.reviewPos+1} von ${mathRun.missed.length}`:`Karte ${mathRun.index+1} von ${cards.length}`;app.innerHTML=card(`<p class="muted">🔢 ${RATIONAL_MATH_TITLES[3]} · ${num} · ${mathRun.score} Punkte</p><div class="bar"><div class="fill" style="width:${mathRun.index/cards.length*100}%"></div></div><h2 style="margin-top:20px">${mathText(q)}</h2>${mathRun.revealed?`<div class="player"><strong>Antwort</strong><p>${mathText(a)}</p></div>${mathRun.review?btn('✅ Jetzt sicher','mathFlashReviewKnown'):btn('✅ Das kann ich','mathFlashKnown')}${mathRun.review?btn('🔁 Noch einmal','mathFlashReviewAgain','alt'):btn('🔁 Noch üben','mathFlashAgain','alt')}`:btn('💡 Antwort aufdecken','mathFlashReveal')}`)+card(btn('Zur Mathe-Übersicht','mathHome','alt'));}
function mathFlashReveal(){if(!mathRun)return;mathRun.revealed=true;mathSave();mathFlashShow();}
function mathFlashKnown(){if(!mathRun||mathRun.review)return;const index=mathRun.index,[prompt,answer]=MATH_CARDS[index]||[];void recordLearningError(mathName,'math','math_rational_cards',index,RATIONAL_MATH_TITLES[3],{prompt,accepted:[answer||'']},true);mathRun.score+=10;mathRun.index++;mathRun.revealed=false;mathSave();mathFlashShow();}
function mathFlashAgain(){if(!mathRun||mathRun.review)return;const i=mathRun.index,[prompt,answer]=MATH_CARDS[i]||[];void recordLearningError(mathName,'math','math_rational_cards',i,RATIONAL_MATH_TITLES[3],{prompt,accepted:[answer||'']},false);if(!mathRun.missed.includes(i))mathRun.missed.push(i);mathRun.mistakes[i]=(Number(mathRun.mistakes[i])||0)+1;mathRun.index++;mathRun.revealed=false;mathSave();mathFlashShow();}
function mathFlashReviewKnown(){if(!mathRun||!mathRun.review)return;const i=mathRun.missed[mathRun.reviewPos],[prompt,answer]=MATH_CARDS[i]||[];void recordLearningError(mathName,'math','math_rational_cards',i,RATIONAL_MATH_TITLES[3],{prompt,accepted:[answer||'']},true);mathRun.missed=mathRun.missed.filter(x=>x!==i);if(mathRun.reviewPos>=mathRun.missed.length)mathRun.reviewPos=0;mathRun.revealed=false;mathSave();mathFlashShow();}
function mathFlashReviewAgain(){if(!mathRun||!mathRun.review||!mathRun.missed.length)return;mathRun.reviewPos=(mathRun.reviewPos+1)%mathRun.missed.length;mathRun.revealed=false;mathSave();mathFlashShow();}
function mathMistakes(){
 const content=[0,1,2].map(b=>{const s=mathLoad(mathName,b),m=s?.mistakes||{};return '<h3>'+RATIONAL_MATH_TITLES[b]+'</h3>'+(Object.keys(m).length?Object.entries(m).map(([i,c])=>'<p>'+mathText(MATH_BATTLES[b][Number(i)].q)+' → <strong>'+mathText(MATH_BATTLES[b][Number(i)].options[MATH_BATTLES[b][Number(i)].correct])+'</strong> · '+c+'× falsch</p>').join(''):'<p>Noch keine Fehler.</p>');}).join('');
 const s=mathLoad(mathName,3),m=s?.mistakes||{},cardErrors=Object.keys(m).map(i=>'<p>'+mathText(MATH_CARDS[Number(i)]?.[0]||'')+' → <strong>'+mathText(MATH_CARDS[Number(i)]?.[1]||'')+'</strong> · '+m[i]+'× zum Wiederholen markiert</p>').join('')||'<p>Noch keine Karten zum Wiederholen.</p>';
 const examErrors=(b,questions,title)=>{const state=mathLoad(mathName,b),items=Object.entries(state?.mistakes||{}).map(([i,count])=>{const q=questions[Number(i)];return q?'<p>'+mathText(q.q)+' → <strong>'+mathText(q.options[q.correct])+'</strong> · '+count+'× falsch</p>':'';}).join('')||'<p>Keine Fehler erfasst.</p>';return '<h3>'+esc(title)+'</h3>'+items;};
 const classworkErrors=MATH_PROPORTIONAL_CLASSWORKS.map((exam,index)=>examErrors(7+index,exam.questions,exam.title)).join('');
 const practiceErrors=MATH_PROPORTIONAL_PRACTICE_BLOCKS.map((block,index)=>examErrors(10+index,block.questions,block.title)).join('');
 app.innerHTML=card('<h2>📕 '+esc(mathName)+' · Mathe-Fehlerliste</h2>'+content+'<h3>'+RATIONAL_MATH_TITLES[3]+'</h3>'+cardErrors+examErrors(4,MATH_EXAM_BATTLE,'Klassenarbeit Brüche')+examErrors(5,MATH_RATIONAL_EXAM_BATTLE,'Klassenarbeit Rationale Zahlen')+examErrors(6,MATH_PROPORTIONAL_EXAM_BATTLE,'Proportional / Antiproportional · Übungsbattle')+classworkErrors+practiceErrors)+card(btn('Zur Mathe-Übersicht','mathHome','alt'));
}
let proportionalStudyDeck='',proportionalStudyIndex=0,proportionalStudyRevealed=false;
function mathProportionalStudyStart(deck){proportionalStudyDeck=deck;proportionalStudyIndex=0;proportionalStudyRevealed=false;void recordLearningActivity(mathName,`math_proportional_${deck}`);mathProportionalStudyShow();window.scrollTo(0,0);}
function mathProportionalStudyShow(){
 const cards=proportionalStudyDeck==='worksheet'?PROPORTIONAL_WORKSHEET_CARDS:PROPORTIONAL_FLASH_CARDS;
 const isWorksheet=proportionalStudyDeck==='worksheet';
 const title=isWorksheet?'Arbeitsblatt · Begriffe lernen':'Lernkarten · Frage und Antwort';
 const item=cards[proportionalStudyIndex];
 const frontLabel=isWorksheet?'Begriff':'Frage';
 const backLabel=isWorksheet?'Erklärung':'Antwort';
 const percent=Math.round((proportionalStudyIndex+1)/cards.length*100);
 const answer=proportionalStudyRevealed?'<div class="proportional-learning-side proportional-learning-answer"><strong>'+backLabel+'</strong><p>'+esc(item.back)+'</p></div>':btn('💡 '+backLabel+' anzeigen','mathProportionalReveal');
 const navigation=proportionalStudyRevealed?'<div class="proportional-card-nav">'+(proportionalStudyIndex>0?btn('← Zurück','mathProportionalPrevious','alt'):'<span></span>')+btn(proportionalStudyIndex+1<cards.length?'Nächste Karte →':'Fertig','mathProportionalNext')+'</div>':'';
 app.innerHTML=card('<h2>'+title+'</h2><p class="muted">Karte '+(proportionalStudyIndex+1)+' von '+cards.length+'</p><div class="bar"><div class="fill" style="width:'+percent+'%"></div></div><div class="proportional-learning-side proportional-learning-front"><strong>'+frontLabel+'</strong><h3>'+esc(item.front)+'</h3></div>'+answer+navigation)+card(btn('Zurück zum Kapitel','mathViewProportional','alt'));
}
function mathProportionalReveal(){proportionalStudyRevealed=true;mathProportionalStudyShow();}
function mathProportionalNext(){const cards=proportionalStudyDeck==='worksheet'?PROPORTIONAL_WORKSHEET_CARDS:PROPORTIONAL_FLASH_CARDS;if(proportionalStudyIndex+1>=cards.length){mathSelectView('proportional');return;}proportionalStudyIndex++;proportionalStudyRevealed=false;mathProportionalStudyShow();}
function mathProportionalPrevious(){if(proportionalStudyIndex>0)proportionalStudyIndex--;proportionalStudyRevealed=false;mathProportionalStudyShow();}
function mathAction(v){if(v.startsWith('fractionOpen_')){fractionOpen(v.slice(13));return true;}if(v.startsWith('fractionStart_')){fractionStart(v.slice(14));return true;}if(v==='fractionNext'){fractionQuestion();return true;}if(v==='mathChoose')mathChoose();else if(v==='mathViewFractions')mathSelectView('fractions');else if(v==='mathViewRational')mathSelectView('rational');else if(v==='mathViewExam')mathSelectView('exam');else if(v==='mathViewRationalExam')mathSelectView('rationalExam');else if(v==='mathViewProportional')mathSelectView('proportional');else if(v==='mathViewProportionalExam')mathSelectView('proportionalExam');else if(v==='mathPracticePro'){mathPracticeGroup='proportional';mathView='proportionalPractice';mathHome();}else if(v==='mathPracticeAnti'){mathPracticeGroup='antiproportional';mathView='proportionalPractice';mathHome();}else if(v==='mathPracticeMixed'){mathPracticeGroup='mixed';mathView='proportionalPractice';mathHome();}else if(v==='mathProportionalWorksheet')mathProportionalStudyStart('worksheet');else if(v==='mathProportionalFlashcards')mathProportionalStudyStart('flashcards');else if(v==='mathProportionalReveal')mathProportionalReveal();else if(v==='mathProportionalNext')mathProportionalNext();else if(v==='mathProportionalPrevious')mathProportionalPrevious();else if(v==='mathHome')mathHome();else if(v==='mathMistakes')mathMistakes();else if(v==='mathShowSolution')mathShowSolution();else if(v==='fractionShowSolution')fractionShowSolution();else if(v==='mathNext')mathQuestion();else if(v==='mathFlashStart')mathFlashStart();else if(v==='mathFlashResume')mathFlashResume();else if(v==='mathFlashReveal')mathFlashReveal();else if(v==='mathFlashKnown')mathFlashKnown();else if(v==='mathFlashAgain')mathFlashAgain();else if(v==='mathFlashReviewKnown')mathFlashReviewKnown();else if(v==='mathFlashReviewAgain')mathFlashReviewAgain();else if(/^mathName[0-3]$/.test(v))mathSetName(Number(v.slice(-1)));else if(/^mathStart\d+$/.test(v))mathStart(Number(v.slice(9)));else if(/^mathResume\d+$/.test(v))mathStart(Number(v.slice(10)),true);else return false;return true;}

document.addEventListener('click',e=>{const ea=e.target.closest('[data-error-answer]');if(ea){void errorPracticeAnswer(ea.dataset.errorAnswer);return;}const ma=e.target.closest('[data-mathanswer]');if(ma){mathAnswer(Number(ma.dataset.mathanswer));return;}const mathButton=e.target.closest('[data-action]');if(mathButton&&(errorEvaluationAction(mathButton.dataset.action)||mathAction(mathButton.dataset.action)))return;const fa=e.target.closest('[data-fractionanswer]');if(fa){fractionAnswer(Number(fa.dataset.fractionanswer));return;}const a=e.target.closest('[data-action]'),ans=e.target.closest('[data-answer]'),sa=e.target.closest('[data-soloanswer]'),la=e.target.closest('[data-listenanswer]');if(ans){answer(Number(ans.dataset.answer));return;}if(sa){soloAnswer(Number(sa.dataset.soloanswer));return;}if(la){listenAnswer(Number(la.dataset.listenanswer));return;}if(!a)return;const v=a.dataset.action;if(v==='home')home();else if(v==='host'||v==='createRoom'||v==='dashboard'||v==='start'||v==='reset')return;else if(v==='join')joinForm();else if(v==='joinMathFractions')joinForm('1 · Bruchrechnung-Battle beitreten','fractions');else if(v==='joinMathRational')joinForm('2 · Rationale-Zahlen-Battle beitreten','rational');else if(v==='joinMathExam')joinForm('3 · Proportional-/Antiproportional-Klassenarbeit beitreten','math-exam');else if(v==='enter')enter();else if(['start','reset'].includes(v))hostAction(v);else if(v==='solo')soloChooseName();else if(v==='dashboard')void showDashboard();else if(v==='soloChangeName')soloChooseName();else if(v==='soloMistakes')showMyMistakes();else if(v==='soloHome')soloHome();else if(v==='grammarMenu')grammarMenu();else if(v==='grammarStation0')grammarStationMenu(0);else if(v==='grammarStation1')grammarStationMenu(1);else if(/^grammarTask\d+$/.test(v)){const n=Number(v.slice(11));if(grammarStation!==null&&n<GRAMMAR[grammarStation].tasks.length){void recordLearningActivity(soloName,`english_grammar_${grammarStation+1}_task${n+1}`);grammarRender(grammarStation,n);}}else if(v==='grammarCheck')grammarCheck();else if(v==='grammarReveal')grammarReveal();else if(v==='grammarClear')grammarClear();else if(v==='grammarBack')grammarStationMenu(grammarStation);else if(/^vocabPage[01]$/.test(v)){vocabPage=Number(v.slice(-1));void recordLearningActivity(soloName,`english_vocab_station1_page${vocabPage+1}`);vocabRender(vocabPage);}else if(v==='vocabCheck')vocabCheck();else if(v==='vocabClear')vocabClear();else if(v==='gap0'){void recordLearningActivity(soloName,'english_gap1');gapRender(0);}else if(v==='gap1'){void recordLearningActivity(soloName,'english_gap2');gapRender(1);}else if(v==='gapCheck')gapCheck();else if(v==='gapClear')gapClear();else if(v==='writingMenu')writingMenu();else if(v==='writingModel'){writingModelVisible=!writingModelVisible;writingRender();}else if(v==='writingComplete')writingToggleComplete();else if(/^writingOpen[0-2]$/.test(v))writingOpen(Number(v.slice(-1)));else if(v==='listenStart')listenStart();else if(v==='listenResume')listenResume();else if(v==='listenNext')listenNext();else if(/^soloName[0-3]$/.test(v))soloSetName(Number(v.slice(-1)));else if(/^soloStart[012]$/.test(v))soloStart(Number(v.slice(-1)));else if(/^soloResume[012]$/.test(v))soloResume(Number(v.slice(-1)));else if(v==='soloNext')soloNext();});
document.addEventListener('input',e=>{if(e.target.matches('[data-vocab]'))vocabCollect();if(e.target.matches('[data-gap]'))gapCollect();if(e.target.matches('[data-grammar]'))grammarCollect();if(e.target.matches('[data-writingtext]'))writingSaveField('texts',e.target.value);if(e.target.matches('[data-writingplan]'))writingSaveField('plans',e.target.value);});
document.addEventListener('change',e=>{if(e.target.matches('[data-grammar]'))grammarCollect();if(e.target.matches('[data-writingcheck]'))writingSaveField('checks',{index:Number(e.target.dataset.writingcheck),checked:e.target.checked});});
document.addEventListener('focusout',e=>{if(e.target.matches('[data-grammar]'))grammarCollect();});
window.addEventListener('pagehide',()=>{grammarCollect();vocabCollect();});
home();try{const fb=initializeApp(firebaseConfig),auth=getAuth(fb);db=getDatabase(fb);onAuthStateChanged(auth,u=>{if(u){uid=u.uid;watchResets();}else{uid='';resetReady=false;if(resetUnsubscribe){resetUnsubscribe();resetUnsubscribe=null;}signInAnonymously(auth).catch(e=>msg('Anmeldung fehlgeschlagen: '+e.message,true));}});}catch(e){msg('Firebase-Konfiguration fehlerhaft: '+e.message,true);}
