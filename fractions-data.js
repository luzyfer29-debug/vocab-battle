// Bruchrechnung · Klasse 7 Realschule NRW
// Die Aufgaben werden im Solo-Training und im Live-Battle identisch verwendet.
export const FRACTION_MODULES = [
  {
    id: 'basics', title: 'Brüche verstehen · echt und unecht', shortTitle: 'Brüche verstehen',
    lesson: 'Der Zähler steht oben und sagt, wie viele Teile genommen werden. Der Nenner steht unten und sagt, in wie viele gleich große Teile das Ganze geteilt ist. Ein echter Bruch ist kleiner als 1: Der Zähler ist kleiner als der Nenner. Ein unechter Bruch ist mindestens 1: Der Zähler ist gleich groß oder größer als der Nenner. Unechte Brüche kannst du als gemischte Zahl schreiben.',
    example: '7/3 = 2 Rest 1, also 2 1/3. Umgekehrt: 2 1/3 = (2 · 3 + 1)/3 = 7/3.',
    questions: [
      {q:'Welcher Bruch ist echt?',options:['7/5','3/8','9/9','11/6'],correct:1,explain:'3 ist kleiner als 8. Deshalb ist 3/8 echt und kleiner als 1.'},
      {q:'Welcher Bruch ist unecht?',options:['2/7','4/9','5/5','3/8'],correct:2,explain:'Bei 5/5 sind Zähler und Nenner gleich. Der Bruch ist 1 und damit unecht.'},
      {q:'Schreibe 7/3 als gemischte Zahl.',options:['1 2/3','2 1/3','3 1/2','2 2/3'],correct:1,explain:'7 : 3 = 2 Rest 1. Also sind es 2 Ganze und 1/3.'},
      {q:'Schreibe 2 2/5 als unechten Bruch.',options:['10/5','12/5','7/5','12/10'],correct:1,explain:'2 Ganze sind 10/5. Dazu 2/5: 10/5 + 2/5 = 12/5.'},
      {q:'Was ist 9/4 als gemischte Zahl?',options:['1 1/4','2 1/4','2 2/4','3 1/4'],correct:1,explain:'9 : 4 = 2 Rest 1. Daher 9/4 = 2 1/4.'},
      {q:'Welche Aussage zu 5/8 stimmt?',options:['Der Bruch ist unecht.','Der Bruch ist echt und kleiner als 1.','Der Bruch ist gleich 1.','Der Nenner ist kleiner als der Zähler.'],correct:1,explain:'5 ist kleiner als 8. Also ist 5/8 ein echter Bruch kleiner als 1.'},
      {q:'Schreibe 11/5 als gemischte Zahl.',options:['1 1/5','2 1/5','2 2/5','3 1/5'],correct:1,explain:'11 : 5 = 2 Rest 1. Somit 11/5 = 2 1/5.'},
      {q:'Schreibe 3 1/4 als unechten Bruch.',options:['7/4','12/4','13/4','13/3'],correct:2,explain:'3 Ganze sind 12/4. Plus 1/4 ergibt 13/4.'}
    ]
  },
  {
    id: 'add', title: 'Brüche addieren', shortTitle: 'Addition',
    lesson: 'Haben die Brüche denselben Nenner, addierst du nur die Zähler. Der Nenner bleibt gleich. Bei verschiedenen Nennern erweiterst du zuerst auf einen gemeinsamen Nenner. Am Ende kürzt du das Ergebnis, wenn möglich. Ist der Zähler größer als der Nenner, kannst du das Ergebnis zusätzlich als gemischte Zahl schreiben.',
    example: '1/3 + 1/6: gemeinsamer Nenner 6. Also 2/6 + 1/6 = 3/6 = 1/2.',
    questions: [
      {q:'Berechne: 1/4 + 2/4',options:['3/4','3/8','1/2','1'],correct:0,explain:'Gleicher Nenner: 1 + 2 = 3. Ergebnis: 3/4.'},
      {q:'Berechne: 1/3 + 1/6',options:['2/9','1/2','2/6','1/3'],correct:1,explain:'Erweitere 1/3 auf 2/6. Dann 2/6 + 1/6 = 3/6 = 1/2.'},
      {q:'Berechne: 3/4 + 2/3',options:['5/7','17/12','13/12','1 1/12'],correct:1,explain:'Gemeinsamer Nenner 12: 9/12 + 8/12 = 17/12 = 1 5/12.'},
      {q:'Berechne: 5/8 + 1/4',options:['6/12','7/8','3/4','6/8'],correct:1,explain:'Erweitere 1/4 auf 2/8. Dann 5/8 + 2/8 = 7/8.'},
      {q:'Berechne: 2/5 + 7/10',options:['9/15','11/10','9/10','1 2/10'],correct:1,explain:'Erweitere 2/5 auf 4/10. Dann 4/10 + 7/10 = 11/10 = 1 1/10.'},
      {q:'Berechne: 3/7 + 5/14',options:['8/21','11/14','8/14','1'],correct:1,explain:'Erweitere 3/7 auf 6/14. Dann 6/14 + 5/14 = 11/14.'},
      {q:'Berechne: 7/9 + 5/6',options:['12/15','29/18','17/18','1 1/18'],correct:1,explain:'Gemeinsamer Nenner 18: 14/18 + 15/18 = 29/18 = 1 11/18.'},
      {q:'Berechne: 4/3 + 1/2',options:['5/5','11/6','9/6','1 1/6'],correct:1,explain:'Gemeinsamer Nenner 6: 8/6 + 3/6 = 11/6 = 1 5/6.'}
    ]
  },
  {
    id: 'sub', title: 'Brüche subtrahieren', shortTitle: 'Subtraktion',
    lesson: 'Beim Subtrahieren gilt dieselbe Nenner-Regel wie beim Addieren: Erst gleichnamig machen. Danach ziehst du die Zähler ab und lässt den gemeinsamen Nenner stehen. Kürze das Ergebnis. Bei gemischten Zahlen kannst du sie zuerst in unechte Brüche umwandeln.',
    example: '5/6 − 1/3: Erweitere 1/3 auf 2/6. Dann 5/6 − 2/6 = 3/6 = 1/2.',
    questions: [
      {q:'Berechne: 3/4 − 1/4',options:['2/4','1/2','2/8','1/4'],correct:1,explain:'Gleicher Nenner: (3 − 1)/4 = 2/4 = 1/2.'},
      {q:'Berechne: 5/6 − 1/3',options:['4/3','1/2','2/3','4/6'],correct:1,explain:'Erweitere 1/3 auf 2/6. Dann 5/6 − 2/6 = 3/6 = 1/2.'},
      {q:'Berechne: 7/5 − 2/5',options:['5/5','5/10','1','1/5'],correct:2,explain:'(7 − 2)/5 = 5/5 = 1.'},
      {q:'Berechne: 5/4 − 2/3',options:['3/1','7/12','3/12','11/12'],correct:1,explain:'Gemeinsamer Nenner 12: 15/12 − 8/12 = 7/12.'},
      {q:'Berechne: 11/10 − 3/5',options:['8/5','1/2','8/10','4/5'],correct:1,explain:'Erweitere 3/5 auf 6/10. Dann 11/10 − 6/10 = 5/10 = 1/2.'},
      {q:'Berechne: 9/8 − 1/4',options:['8/4','7/8','8/8','1/8'],correct:1,explain:'Erweitere 1/4 auf 2/8. Dann 9/8 − 2/8 = 7/8.'},
      {q:'Berechne: 2 − 5/6',options:['7/6','1 1/6','1 5/6','5/6'],correct:0,explain:'Schreibe 2 als 12/6. Dann 12/6 − 5/6 = 7/6 = 1 1/6.'},
      {q:'Berechne: 7/3 − 5/4',options:['2/1','13/12','2/12','11/12'],correct:1,explain:'Gemeinsamer Nenner 12: 28/12 − 15/12 = 13/12 = 1 1/12.'}
    ]
  },
  {
    id: 'mul', title: 'Brüche multiplizieren', shortTitle: 'Multiplikation',
    lesson: 'Beim Multiplizieren von Brüchen rechnest du Zähler mal Zähler und Nenner mal Nenner. Kürze vorher über Kreuz, wenn es geht; so werden die Zahlen kleiner. Unechte Brüche rechnest du genauso. Kürze das Ergebnis am Schluss vollständig.',
    example: '2/3 · 3/4: Kürze 3 gegen 3 und 2 gegen 4. Es bleibt 1/2.',
    questions: [
      {q:'Berechne: 2/3 · 3/4',options:['6/7','1/2','5/12','6/12'],correct:1,explain:'(2 · 3)/(3 · 4) = 6/12 = 1/2.'},
      {q:'Berechne: 5/6 · 3/10',options:['15/60','1/4','8/16','1/3'],correct:1,explain:'(5 · 3)/(6 · 10) = 15/60 = 1/4.'},
      {q:'Berechne: 7/4 · 2/7',options:['14/28','1/2','9/11','2/4'],correct:1,explain:'Kürze 7 gegen 7. Dann bleibt 2/4 = 1/2.'},
      {q:'Berechne: 3/5 · 10/9',options:['30/45','2/3','13/14','3/9'],correct:1,explain:'Kürze 10 gegen 5 und 3 gegen 9: 1/1 · 2/3 = 2/3.'},
      {q:'Berechne: 2/3 · 3/2',options:['6/6','1','5/6','6/5'],correct:1,explain:'Zähler und Nenner ergeben jeweils 6: 6/6 = 1.'},
      {q:'Berechne: 4/3 · 3/8',options:['12/24','1/2','7/11','3/8'],correct:1,explain:'Kürze 3 gegen 3. Es bleibt 4/8 = 1/2.'},
      {q:'Berechne: 5/4 · 2/5',options:['10/20','1/2','7/9','2/4'],correct:1,explain:'Kürze 5 gegen 5. Es bleibt 2/4 = 1/2.'},
      {q:'Berechne: 7/3 · 9/14',options:['63/42','3/2','2/3','9/14'],correct:1,explain:'Kürze 7 gegen 14 und 9 gegen 3: 1/2 · 3/1 = 3/2.'}
    ]
  },
  {
    id: 'div', title: 'Brüche dividieren', shortTitle: 'Division',
    lesson: 'Beim Dividieren durch einen Bruch multiplizierst du mit seinem Kehrwert. Nur der zweite Bruch wird umgedreht. Danach multiplizierst du wie gewohnt und kürzt das Ergebnis. Denkregel: „Durch einen Bruch teilen heißt mit seinem Kehrwert malnehmen.“',
    example: '3/4 : 1/2 = 3/4 · 2/1 = 6/4 = 3/2 = 1 1/2.',
    questions: [
      {q:'Berechne: 1/2 : 1/4',options:['1/8','2','1/2','4'],correct:1,explain:'Kehrwert des zweiten Bruchs: 1/2 · 4/1 = 4/2 = 2.'},
      {q:'Berechne: 3/4 : 1/2',options:['3/8','3/2','2/3','1/2'],correct:1,explain:'3/4 · 2/1 = 6/4 = 3/2 = 1 1/2.'},
      {q:'Berechne: 2/3 : 4/5',options:['8/15','5/6','6/5','2/5'],correct:1,explain:'Kehrwert bilden: 2/3 · 5/4 = 10/12 = 5/6.'},
      {q:'Berechne: 5/6 : 10/9',options:['50/54','3/4','4/3','5/9'],correct:1,explain:'5/6 · 9/10 = 45/60 = 3/4.'},
      {q:'Berechne: 3/2 : 3/4',options:['9/8','2','1/2','4/3'],correct:1,explain:'3/2 · 4/3 = 12/6 = 2.'},
      {q:'Berechne: 7/4 : 7/8',options:['49/32','2','1/2','7/8'],correct:1,explain:'7/4 · 8/7 = 56/28 = 2.'},
      {q:'Berechne: 4/5 : 2/5',options:['8/25','2','1/2','5/2'],correct:1,explain:'4/5 · 5/2 = 20/10 = 2.'},
      {q:'Berechne: 5/3 : 10/9',options:['50/27','3/2','2/3','5/9'],correct:1,explain:'5/3 · 9/10 = 45/30 = 3/2 = 1 1/2.'}
    ]
  },
  {
    id: 'mixed', title: 'Klammern und gemischte Rechnungen', shortTitle: 'Klammern & gemischt',
    lesson: 'Mit Klammern rechnest du zuerst den Klammerinhalt. Ohne Klammern gilt Punktrechnung vor Strichrechnung: Multiplikation und Division kommen vor Addition und Subtraktion. Rechne bei gleichrangigen Rechenarten von links nach rechts. Wandle gemischte Zahlen vor dem Rechnen in unechte Brüche um.',
    example: 'Ohne Klammer: 1/2 + 1/3 · 3/4. Erst malnehmen: 1/3 · 3/4 = 1/4. Dann 1/2 + 1/4 = 3/4. Mit Klammer: (1/2 + 1/3) · 3/5 = 5/6 · 3/5 = 1/2.',
    questions: [
      {q:'Berechne ohne Klammern: 1/2 + 1/3 · 3/4',options:['5/8','3/4','1','7/12'],correct:1,explain:'Punkt vor Strich: 1/3 · 3/4 = 1/4. Danach 1/2 + 1/4 = 3/4.'},
      {q:'Berechne mit Klammern: (1/2 + 1/3) · 3/5',options:['1/2','5/6','3/10','1/3'],correct:0,explain:'Zuerst die Klammer: 1/2 + 1/3 = 5/6. Dann 5/6 · 3/5 = 1/2.'},
      {q:'Berechne ohne Klammern: 3/4 − 1/2 : 2/3',options:['3/8','0','1/2','1/4'],correct:1,explain:'Punkt vor Strich: 1/2 : 2/3 = 3/4. Dann 3/4 − 3/4 = 0.'},
      {q:'Berechne mit Klammern: (3/4 − 1/4) : 1/2',options:['1/2','1','2','1/4'],correct:1,explain:'Klammer zuerst: 3/4 − 1/4 = 1/2. Dann 1/2 : 1/2 = 1.'},
      {q:'Berechne: 2/3 + (1/2 − 1/6)',options:['5/6','1','2/3','1 1/6'],correct:1,explain:'Klammer: 1/2 − 1/6 = 1/3. Danach 2/3 + 1/3 = 1.'},
      {q:'Berechne: 1/2 · (2/3 + 1/3)',options:['1/2','1','1/3','2/3'],correct:0,explain:'Klammer zuerst: 2/3 + 1/3 = 1. Dann 1/2 · 1 = 1/2.'},
      {q:'Berechne ohne Klammern: 2/3 + 1/3 · 1/2',options:['1/2','5/6','1','2/3'],correct:1,explain:'Zuerst 1/3 · 1/2 = 1/6. Dann 2/3 + 1/6 = 4/6 + 1/6 = 5/6.'},
      {q:'Berechne mit Klammern: (2/3 + 1/3) : 1/2',options:['1','2','1/2','3/2'],correct:1,explain:'Klammer: 2/3 + 1/3 = 1. Dann 1 : 1/2 = 1 · 2 = 2.'}
    ]
  }
];
