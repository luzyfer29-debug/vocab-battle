import {FRACTION_MODULES} from './fractions-data.js';

// Original task bank aligned to the eight visible Sofatutor chapter headings
// for rationale numbers, fractions, decimals and powers of ten (Grade 7 NRW).
// Stable topic/task IDs support solo learning, battles and per-topic progress.
const rawTopics = [
  {
    id: "rationale", title: "Rationale Zahlen – Einführung, Betrag und Grundrechenarten",
    learnHint: "Rationale Zahlen lassen sich als Bruch ganzer Zahlen schreiben. Dazu gehören negative und positive Brüche, endliche und periodische Dezimalzahlen sowie ganze und natürliche Zahlen. Auf der Zahlengeraden werden negative Zahlen links von 0 eingetragen. Der Betrag ist der Abstand zu 0.",
    tasks: [
      ["Welche Zahl ist rational?", ["√2", "π", "−3/8", "Keine davon"], 2, "−3/8 ist ein Bruch aus ganzen Zahlen mit Nenner ungleich 0."],
      ["Welche Zahl liegt am weitesten links?", ["−1,5", "−4", "0", "2"], 1, "Je kleiner eine Zahl ist, desto weiter links liegt sie. −4 ist die kleinste Zahl."],
      ["Was ist |−6,2|?", ["−6,2", "6,2", "0", "12,4"], 1, "Der Betrag ist der Abstand zu 0: 6,2."],
      ["Was ist die Gegenzahl von −9?", ["−9", "0", "9", "18"], 2, "Die Gegenzahl hat dasselbe Vorzeichen gewechselt: 9."],
      ["Welche Zahl liegt auf der Zahlengeraden zwischen −1 und 0?", ["−1/2", "−3/2", "1/2", "−2"], 0, "−1/2 = −0,5 liegt zwischen −1 und 0."],
      ["Berechne −7 + 12.", ["−19", "−5", "5", "19"], 2, "12 Schritte nach rechts von −7 führen zu 5."],
      ["Berechne 4 − 11.", ["−15", "−7", "7", "15"], 1, "4 − 11 = −7."],
      ["Berechne (−5) · 3.", ["−15", "−8", "8", "15"], 0, "Verschiedene Vorzeichen ergeben ein negatives Produkt: 5 · 3 = 15."],
      ["Berechne (−24) : (−6).", ["−4", "−3", "3", "4"], 3, "Gleiche Vorzeichen ergeben ein positives Ergebnis: 24 : 6 = 4."],
      ["Berechne |−3| + (−8).", ["−11", "−5", "5", "11"], 1, "|−3| = 3; 3 + (−8) = −5."],
    ],
  },
  {
    id: "verhaeltnisse", title: "Brüche als Verhältnisse",
    learnHint: "Ein Bruch vergleicht Teile mit dem Ganzen. Zähler und Nenner geben an, wie viele Teile gemeint sind und in wie viele gleich große Teile geteilt wird.",
    tasks: [
      ["Eine Pizza ist in 8 gleich große Stücke geteilt. 3 Stücke sind belegt. Welcher Anteil ist belegt?", ["3/8", "8/3", "5/8", "3/5"], 0, "3 von insgesamt 8 Stücken entsprechen 3/8."],
      ["In einer Klasse sind 12 von 30 Kindern im Sportverein. Welcher Anteil ist das?", ["12/30", "30/12", "18/30", "12/18"], 0, "Der Anteil ist Anzahl im Verein / Anzahl insgesamt = 12/30."],
      ["Ein Verhältnis 2 : 5 bedeutet als Bruch:", ["5/2", "2/5", "2/7", "5/7"], 1, "2 : 5 wird als 2/5 geschrieben."],
      ["Welche Schreibweise beschreibt 4 rote zu 3 blauen Kugeln?", ["4/3", "3/4", "4/7", "3/7"], 0, "Rot zu Blau ist 4 zu 3, also 4/3."],
      ["Ein Saft wird aus 1 Teil Sirup und 4 Teilen Wasser gemischt. Welcher Anteil der Mischung ist Sirup?", ["1/4", "1/5", "4/5", "4/1"], 1, "Insgesamt sind es 5 Teile; davon ist 1 Teil Sirup: 1/5."],
      ["Welche Zahl ist gleich dem Anteil 6 von 10?", ["3/5", "5/3", "6/5", "4/10"], 0, "6/10 lässt sich durch 2 kürzen: 3/5."],
      ["Von 24 Murmeln sind 6 grün. Welcher Anteil ist grün?", ["1/4", "1/6", "3/4", "6/18"], 0, "6/24 = 1/4."],
      ["Ein Rezept nutzt 2 Tassen Mehl auf 3 Tassen Milch. Wie ist das Verhältnis Mehl zu Milch?", ["3 : 2", "2 : 3", "2 : 5", "3 : 5"], 1, "Mehl zu Milch ist 2 zu 3."],
      ["Welche Aussage passt zu 3/5?", ["3 von 5 gleich großen Teilen", "5 von 3 Teilen", "3 plus 5 Teile", "5 Teile fehlen von 3"], 0, "Der Nenner 5 nennt die Gesamtzahl gleich großer Teile, der Zähler 3 die betrachteten Teile."],
      ["In einer Gruppe sind 9 Mädchen und 6 Jungen. Welcher Bruchteil der Gruppe sind Jungen?", ["6/9", "9/15", "6/15", "9/6"], 2, "Insgesamt 15 Kinder; davon 6 Jungen: 6/15."],
    ],
  },
  {
    id: "kuerzen-erweitern", title: "Brüche kürzen und erweitern",
    learnHint: "Beim Kürzen oder Erweitern teilst oder multiplizierst du Zähler und Nenner mit derselben Zahl. Der Wert des Bruchs bleibt gleich.",
    tasks: [
      ["Kürze 12/18 vollständig.", ["2/3", "3/2", "6/9", "4/6"], 0, "12 und 18 lassen sich durch 6 teilen: 12/18 = 2/3."],
      ["Erweitere 3/5 mit 4.", ["7/9", "12/20", "12/5", "3/20"], 1, "Zähler und Nenner mal 4: 3/5 = 12/20."],
      ["Welche Zahl ist gleich 2/7?", ["6/21", "4/21", "2/14", "7/2"], 0, "2/7 · 3/3 = 6/21."],
      ["Kürze 21/35 vollständig.", ["3/5", "5/3", "7/15", "1/5"], 0, "Beide Zahlen durch 7 teilen: 3/5."],
      ["Erweitere 5/8 mit 3.", ["8/11", "15/24", "15/8", "5/24"], 1, "5 · 3 = 15 und 8 · 3 = 24."],
      ["Welcher Bruch ist vollständig gekürzt?", ["6/9", "8/12", "7/10", "15/25"], 2, "7 und 10 haben keinen gemeinsamen Teiler außer 1."],
      ["Kürze 24/30 mit dem größtmöglichen gemeinsamen Teiler.", ["4/5", "8/10", "12/15", "5/4"], 0, "Der größte gemeinsame Teiler ist 6: 24/30 = 4/5."],
      ["Welche Erweiterung von 4/9 hat den Nenner 45?", ["20/45", "16/45", "4/45", "45/36"], 0, "9 · 5 = 45, also auch 4 · 5 = 20."],
      ["Kürze 16/40 vollständig.", ["2/5", "4/10", "8/20", "5/2"], 0, "16/40 durch 8 kürzen ergibt 2/5."],
      ["Fülle aus: 3/4 = __/20", ["12", "15", "16", "18"], 1, "4 · 5 = 20, also 3 · 5 = 15."],
    ],
  },
  {
    id: "bruch-add-sub", title: "Brüche addieren und subtrahieren",
    learnHint: "Bei gleichem Nenner addierst oder subtrahierst du die Zähler. Bei verschiedenen Nennern machst du die Brüche zuerst gleichnamig.",
    tasks: [
      ["Berechne 2/7 + 3/7.", ["5/7", "5/14", "1/7", "6/7"], 0, "Gleicher Nenner: (2 + 3)/7 = 5/7."],
      ["Berechne 5/9 − 2/9.", ["3/9", "7/9", "3/18", "−3/9"], 0, "Gleicher Nenner: (5 − 2)/9 = 3/9 = 1/3."],
      ["Berechne 1/2 + 1/4.", ["2/6", "3/4", "1/6", "2/4"], 1, "1/2 = 2/4; dann 2/4 + 1/4 = 3/4."],
      ["Berechne 3/4 − 1/2.", ["1/4", "2/2", "1/2", "−1/4"], 0, "1/2 = 2/4; 3/4 − 2/4 = 1/4."],
      ["Berechne 2/3 + 1/6.", ["3/9", "5/6", "1/2", "3/6"], 1, "2/3 = 4/6; 4/6 + 1/6 = 5/6."],
      ["Berechne 7/8 − 1/4.", ["6/4", "5/8", "3/4", "6/8"], 1, "1/4 = 2/8; 7/8 − 2/8 = 5/8."],
      ["Berechne 1/3 + 1/5.", ["2/8", "8/15", "2/15", "1/15"], 1, "Mit Nenner 15: 5/15 + 3/15 = 8/15."],
      ["Berechne 5/6 − 1/3.", ["4/3", "1/2", "2/3", "1/3"], 1, "1/3 = 2/6; 5/6 − 2/6 = 3/6 = 1/2."],
      ["Berechne 3/10 + 4/5.", ["7/15", "11/10", "7/10", "1/2"], 1, "4/5 = 8/10; 3/10 + 8/10 = 11/10."],
      ["Berechne 7/12 − 1/8.", ["13/24", "6/4", "1/24", "11/24"], 3, "Hauptnenner 24: 14/24 − 3/24 = 11/24."],
    ],
  },
  {
    id: "bruch-mult-div", title: "Brüche multiplizieren und dividieren",
    learnHint: "Beim Multiplizieren rechnest du Zähler mal Zähler und Nenner mal Nenner. Beim Dividieren multiplizierst du mit dem Kehrwert des zweiten Bruchs.",
    tasks: [
      ["Berechne 2/3 · 3/5.", ["2/5", "6/8", "5/2", "1/5"], 0, "2 · 3 / (3 · 5) = 6/15 = 2/5."],
      ["Berechne 4/7 · 1/2.", ["4/9", "2/7", "4/14", "5/9"], 1, "4/14 lässt sich zu 2/7 kürzen."],
      ["Berechne 3/4 : 1/2.", ["3/8", "3/2", "2/3", "1/2"], 1, "3/4 · 2/1 = 6/4 = 3/2."],
      ["Berechne 2/5 : 4/5.", ["8/25", "1/2", "2", "1/5"], 1, "2/5 · 5/4 = 10/20 = 1/2."],
      ["Berechne 5/6 · 3/10.", ["1/4", "8/16", "15/16", "1/2"], 0, "15/60 = 1/4."],
      ["Berechne 7/8 : 7/4.", ["2", "1/2", "49/32", "7/2"], 1, "7/8 · 4/7 = 28/56 = 1/2."],
      ["Berechne 3/5 · 10.", ["6", "6/5", "30/5", "13/5"], 0, "3/5 · 10/1 = 30/5 = 6."],
      ["Berechne 2/3 : 4.", ["8/3", "1/6", "2/7", "3/8"], 1, "2/3 · 1/4 = 2/12 = 1/6."],
      ["Berechne 5/9 · 3/5.", ["1/3", "15/45", "8/14", "3/5"], 0, "15/45 = 1/3."],
      ["Berechne 4/5 : 2/3.", ["8/15", "6/5", "5/6", "2/5"], 1, "4/5 · 3/2 = 12/10 = 6/5."],
    ],
  },
  {
    id: "bruch-dezimal", title: "Brüche und Dezimalzahlen ineinander umwandeln",
    learnHint: "Teile den Zähler durch den Nenner, um einen Bruch als Dezimalzahl zu schreiben. Endliche Dezimalzahlen lassen sich als Brüche mit 10, 100, 1000 usw. im Nenner notieren.",
    tasks: [
      ["Schreibe 1/2 als Dezimalzahl.", ["0,2", "0,5", "1,2", "2,0"], 1, "1 : 2 = 0,5."],
      ["Schreibe 3/4 als Dezimalzahl.", ["0,34", "0,75", "1,25", "0,8"], 1, "3 : 4 = 0,75."],
      ["Schreibe 0,6 als vollständig gekürzten Bruch.", ["6/100", "3/5", "1/6", "6/5"], 1, "0,6 = 6/10 = 3/5."],
      ["Schreibe 0,25 als vollständig gekürzten Bruch.", ["1/4", "25/10", "1/25", "2/5"], 0, "0,25 = 25/100 = 1/4."],
      ["Welche Dezimalzahl entspricht 7/10?", ["0,07", "0,7", "7,0", "0,17"], 1, "Zehntel stehen an der ersten Stelle nach dem Komma: 0,7."],
      ["Schreibe 9/20 als Dezimalzahl.", ["0,45", "0,9", "0,29", "0,20"], 0, "9/20 = 45/100 = 0,45."],
      ["Schreibe 1,25 als vollständig gekürzten Bruch.", ["125/10", "5/4", "1/25", "25/12"], 1, "1,25 = 125/100 = 5/4."],
      ["Welche Dezimalzahl entspricht 1/3?", ["0,3", "0,(3)", "0,13", "3,0"], 1, "1 : 3 = 0,333…; die 3 wiederholt sich periodisch, also 0,(3)."],
      ["Schreibe 2/5 als Dezimalzahl.", ["0,2", "0,4", "0,5", "2,5"], 1, "2/5 = 4/10 = 0,4."],
      ["Welche Dezimalzahl entspricht 11/4?", ["2,25", "2,5", "2,75", "4,11"], 2, "11 : 4 = 2,75."],
    ],
  },
  {
    id: "dezimal-rechnen", title: "Mit Dezimalzahlen rechnen",
    learnHint: "Bei Addition und Subtraktion stehen die Kommas untereinander. Bei Multiplikation und Division kannst du zunächst ohne Komma rechnen und danach den Stellenwert beachten.",
    tasks: [
      ["Berechne 3,45 + 2,7.", ["3,72", "6,15", "6,42", "0,75"], 1, "3,45 + 2,70 = 6,15."],
      ["Berechne 8,2 − 3,75.", ["4,45", "5,55", "4,55", "11,95"], 0, "8,20 − 3,75 = 4,45."],
      ["Berechne 1,2 · 0,4.", ["4,8", "0,48", "0,048", "1,6"], 1, "12 · 4 = 48; zusammen zwei Nachkommastellen ergeben 0,48."],
      ["Berechne 3,6 : 0,6.", ["0,6", "6", "60", "2,16"], 1, "Beide Zahlen mal 10: 36 : 6 = 6."],
      ["Berechne 0,75 + 1,08.", ["1,13", "1,83", "1,8", "0,183"], 1, "0,75 + 1,08 = 1,83."],
      ["Berechne 5 − 2,38.", ["2,62", "3,38", "2,72", "7,38"], 0, "5,00 − 2,38 = 2,62."],
      ["Berechne 2,5 · 3.", ["0,75", "5,5", "7,5", "75"], 2, "25 · 3 = 75; eine Nachkommastelle ergibt 7,5."],
      ["Berechne 4,2 : 0,7.", ["0,6", "6", "60", "3,5"], 1, "Beide Zahlen mal 10: 42 : 7 = 6."],
      ["Berechne 0,09 · 0,3.", ["0,27", "0,027", "0,0027", "2,7"], 1, "9 · 3 = 27; insgesamt drei Nachkommastellen: 0,027."],
      ["Berechne 6,4 : 0,08.", ["0,8", "8", "80", "800"], 2, "Beide Zahlen mal 100: 640 : 8 = 80."],
    ],
  },
  {
    id: "zehnerpotenzen", title: "Zehnerpotenzen",
    learnHint: "Beim Multiplizieren mit 10, 100, 1000 wandert das Komma nach rechts; beim Dividieren nach links. Die Anzahl der Stellen entspricht der Zahl der Nullen.",
    tasks: [
      ["Berechne 3,47 · 10.", ["0,347", "34,7", "347", "3,470"], 1, "Beim Malnehmen mit 10 rückt das Komma eine Stelle nach rechts."],
      ["Berechne 52,8 : 100.", ["5,28", "0,528", "5280", "0,0528"], 1, "Beim Teilen durch 100 rückt das Komma zwei Stellen nach links."],
      ["Wie viel ist 10³?", ["30", "100", "1000", "10000"], 2, "10³ = 10 · 10 · 10 = 1000."],
      ["Schreibe 0,006 · 1000 als Dezimalzahl.", ["0,6", "6", "60", "0,000006"], 1, "Das Komma rückt drei Stellen nach rechts: 6."],
      ["Welche Zahl ist 4,2 · 100?", ["42", "420", "0,042", "4200"], 1, "Zwei Stellen nach rechts: 420."],
      ["Berechne 730 : 10.", ["73", "7,3", "7300", "0,73"], 0, "Beim Teilen durch 10 rückt das Komma eine Stelle nach links: 73."],
      ["Welche Schreibweise entspricht 10⁴?", ["100", "1000", "10000", "100000"], 2, "10⁴ ist eine 1 mit vier Nullen: 10000."],
      ["Berechne 0,35 · 100.", ["0,0035", "3,5", "35", "350"], 2, "Das Komma rückt zwei Stellen nach rechts: 35."],
      ["Berechne 8,1 : 1000.", ["0,81", "0,081", "0,0081", "8100"], 2, "Drei Stellen nach links: 0,0081."],
      ["Welche Rechnung ergibt 56?", ["5,6 · 10", "5,6 : 10", "560 : 100", "0,56 · 10"], 0, "5,6 · 10 = 56."],
    ],
  },
];

function makeTask(topicId, n, [question, options, correctIndex, explanation]) {
  return { id: `${topicId}-${String(n).padStart(2, "0")}`, question, options,
    correctIndex, answer: options[correctIndex], explanation, modes: ["lernen", "battle"] };
}

export const MATH_TOPICS = rawTopics.map(({ id, title, learnHint, tasks }) => ({
  id, title, learnHint,
  tasks: tasks.map((item, i) => makeTask(id, i + 1, item)),
}));

export const MATH_CHAPTERS = MATH_TOPICS.map(({ id, title, tasks }) => ({
  id, title, taskIds: tasks.map(({ id: taskId }) => taskId),
}));

const reviewTasks = [
  ["Berechne −3/4 + 1/2.", ["−1/4", "1/4", "−5/4", "5/4"], 0, "1/2 = 2/4; −3/4 + 2/4 = −1/4."],
  ["Wie viel sind 3/5 von 20?", ["8", "12", "15", "17"], 1, "20 : 5 · 3 = 4 · 3 = 12."],
  ["Berechne 0,6 + 0,25.", ["0,31", "0,65", "0,85", "0,625"], 2, "0,60 + 0,25 = 0,85."],
  ["Berechne 4,5 : 0,5.", ["0,9", "9", "90", "2,25"], 1, "Beide Zahlen mal 10: 45 : 5 = 9."],
  ["Berechne 7/8 − 1/4.", ["5/8", "6/4", "3/4", "1/8"], 0, "1/4 = 2/8; 7/8 − 2/8 = 5/8."],
  ["Welche Zahl ist rational?", ["−0,35", "√3", "π", "Keine davon"], 0, "−0,35 ist eine endliche Dezimalzahl und lässt sich als Bruch schreiben."],
  ["Schreibe 0,2 als vollständig gekürzten Bruch.", ["2/100", "1/5", "1/2", "2/5"], 1, "0,2 = 2/10 = 1/5."],
  ["Wie viel ist 10²?", ["20", "100", "1000", "10000"], 1, "10² = 10 · 10 = 100."],
  ["Was ist |−2,5|?", ["−2,5", "2,5", "0", "5"], 1, "Der Betrag ist der Abstand zu 0 und damit 2,5."],
  ["Berechne 2/3 : 4/3.", ["1/2", "8/9", "2", "1/6"], 0, "2/3 · 3/4 = 6/12 = 1/2."],
].map((item, i) => makeTask("wiederholung", i + 1, item));

const appQuestions = MATH_TOPICS.flatMap(topic => topic.tasks.map(task => ({
  id: task.id, topicId: topic.id, topicTitle: topic.title,
  q: task.question, options: task.options, correct: task.correctIndex,
  explanation: task.explanation,
})));
const reviewQuestions = reviewTasks.map(task => ({
  id: task.id, topicId: "wiederholung", topicTitle: "Gemischte Wiederholung",
  q: task.question, options: task.options, correct: task.correctIndex,
  explanation: task.explanation,
}));

// The existing referee and kids app expects three 30-question battle arrays.
// Keep this export name and shape so the existing app continues to load.
export const MATH_BATTLES = [
  appQuestions.slice(0, 30),
  appQuestions.slice(30, 60),
  [...appQuestions.slice(60, 80), ...reviewQuestions],
];

// Mixed multiplayer class test used by both referee and kids pages.
const examRationalQuestions = [
  ...MATH_BATTLES[0].slice(0, 5),
  ...MATH_BATTLES[1].slice(5, 10),
];
const examFractionQuestions = FRACTION_MODULES.slice(0, 5).flatMap(module =>
  module.questions.slice(0, 2).map(question => ({
    q: question.q, options: question.options, correct: question.correct,
    explanation: question.explain,
  })),
);
export const MATH_EXAM_BATTLE = [...examRationalQuestions, ...examFractionQuestions];

// Independent 20-question class test focused only on rational numbers.
export const MATH_RATIONAL_EXAM_BATTLE = [
  {q:'Welche Zahl ist am größten?',options:['−3,2','−2,8','−4','−3'],correct:1,explanation:'Bei negativen Zahlen ist die Zahl am größten, die am nächsten an 0 liegt. Es gilt −2,8 > −3 > −3,2 > −4.'},
  {q:'Wie groß ist der Betrag von −7,5?',options:['−7,5','7,5','0','15'],correct:1,explanation:'Der Betrag ist der Abstand von 0. Deshalb gilt |−7,5| = 7,5.'},
  {q:'Was ist die Gegenzahl von 3/4?',options:['3/4','−3/4','4/3','−4/3'],correct:1,explanation:'Bei der Gegenzahl wird nur das Vorzeichen umgekehrt. Die Gegenzahl von 3/4 ist −3/4.'},
  {q:'Welche Zahl liegt zwischen −2 und −1?',options:['−2,5','−1,5','−0,5','1,5'],correct:1,explanation:'−1,5 liegt auf der Zahlengeraden genau zwischen −2 und −1.'},
  {q:'Berechne: −8 + 13',options:['−21','−5','5','21'],correct:2,explanation:'Von −8 gehst du 13 Schritte nach rechts: −8 + 8 = 0, dann bleiben 5 Schritte. Ergebnis: 5.'},
  {q:'Berechne: 6 + (−14)',options:['20','−20','8','−8'],correct:3,explanation:'6 + (−14) = 6 − 14. Da 14 um 8 größer als 6 ist, ist das Ergebnis −8.'},
  {q:'Berechne: −3,5 + 1,2',options:['−4,7','−2,3','2,3','4,7'],correct:1,explanation:'Die Beträge vergleichen: 3,5 − 1,2 = 2,3. Die größere Zahl im Betrag ist 3,5 und gehört zur negativen Zahl. Ergebnis: −2,3.'},
  {q:'Berechne: 4,8 − 7,1',options:['11,9','−11,9','2,3','−2,3'],correct:3,explanation:'4,8 − 7,1 = 4,8 + (−7,1). 7,1 − 4,8 = 2,3; die negative Zahl hat den größeren Betrag. Ergebnis: −2,3.'},
  {q:'Berechne: −5 − (−9)',options:['−14','−4','4','14'],correct:2,explanation:'Minus eine negative Zahl wird zu plus: −5 − (−9) = −5 + 9 = 4.'},
  {q:'Berechne: −12 − 5',options:['−17','−7','7','17'],correct:0,explanation:'−12 − 5 = −12 + (−5). Beide Zahlen sind negativ, also Beträge addieren und das Minuszeichen behalten: −(12 + 5) = −17.'},
  {q:'Berechne: (−4) · 6',options:['−24','−10','10','24'],correct:0,explanation:'Unterschiedliche Vorzeichen ergeben ein negatives Produkt. 4 · 6 = 24, also ist (−4) · 6 = −24.'},
  {q:'Berechne: (−7) · (−3)',options:['−21','−10','10','21'],correct:3,explanation:'Gleiche Vorzeichen ergeben ein positives Produkt. 7 · 3 = 21, also ist (−7) · (−3) = 21.'},
  {q:'Berechne: (−56) : 8',options:['−8','−7','7','8'],correct:1,explanation:'Unterschiedliche Vorzeichen ergeben ein negatives Ergebnis. 56 : 8 = 7, daher ist (−56) : 8 = −7.'},
  {q:'Berechne: (−72) : (−9)',options:['−9','−8','8','9'],correct:2,explanation:'Gleiche Vorzeichen ergeben ein positives Ergebnis. 72 : 9 = 8, also ist (−72) : (−9) = 8.'},
  {q:'Berechne: −3/4 + 1/2',options:['−1/4','1/4','−5/4','5/4'],correct:0,explanation:'Gemeinsamer Nenner 4: 1/2 = 2/4. Dann −3/4 + 2/4 = −1/4.'},
  {q:'Berechne: −2/3 + 5/6',options:['−1/6','1/6','−3/2','3/2'],correct:1,explanation:'Gemeinsamer Nenner 6: −2/3 = −4/6. Dann −4/6 + 5/6 = 1/6.'},
  {q:'Berechne: (−3/5) · 10',options:['−6','−3/50','6','3/50'],correct:0,explanation:'Schreibe 10 als 10/1: (−3/5) · (10/1) = −30/5. Kürzen durch 5 ergibt −6.'},
  {q:'Berechne: (−4/7) : (2/7)',options:['−2','−8/49','2','2/7'],correct:0,explanation:'Beim Teilen durch einen Bruch multiplizierst du mit dem Kehrwert: (−4/7) · (7/2). Die 7 kürzt sich, −4/2 = −2.'},
  {q:'Berechne: −3 + 4 · (−2)',options:['−14','−11','2','14'],correct:1,explanation:'Punktrechnung vor Strichrechnung: Zuerst 4 · (−2) = −8. Danach −3 + (−8) = −11.'},
  {q:'Berechne: (−18 + 6) : (−3)',options:['−8','−4','4','8'],correct:2,explanation:'Zuerst die Klammer: −18 + 6 = −12. Danach −12 : (−3) = 4, weil gleiche Vorzeichen ein positives Ergebnis ergeben.'},
];

// Probeklassenarbeit „Proportional und antiproportional“ aus dem bereitgestellten PDF.
// Im Kids-Bereich werden die Aufgaben einzeln angezeigt; bei falscher Antwort
// sehen die Kinder Lösung und vollständigen Rechenweg.
export const MATH_PROPORTIONAL_EXAM_BATTLE = [
  {q:'Welche Zuordnung ist proportional?',options:['Die Strecke wächst im gleichen Verhältnis wie die Fahrzeit.','Der Gesamtpreis bleibt gleich, egal wie viele Äpfel gekauft werden.','Je mehr Arbeiter mithelfen, desto kürzer ist die Arbeitszeit.','Die Seitenzahl eines Buches bleibt gleich, egal wie schnell man liest.'],correct:0,explanation:'Bei einer proportionalen Zuordnung werden beide Größen mit demselben Faktor vervielfacht. Verdoppelt sich die Fahrzeit bei gleichbleibender Geschwindigkeit, verdoppelt sich auch die Strecke. Die Arbeitszeit bei mehr Arbeitern ist antiproportional; die anderen Aussagen beschreiben keine proportionale Zuordnung.'},
  {q:'Ein Auto fährt gleichbleibend schnell. In 2 Stunden fährt es 140 km. Wie weit fährt es in 3,5 Stunden?',options:['210 km','245 km','280 km','490 km'],correct:1,explanation:'Proportionale Zuordnung: zuerst den Wert für 1 Stunde berechnen. 140 km : 2 = 70 km pro Stunde. Dann auf 3,5 Stunden hochrechnen: 70 · 3,5 = 245 km.'},
  {q:'Vier Arbeiter brauchen 12 Stunden. Wie lange brauchen 6 Arbeiter für dieselbe Arbeit?',options:['6 Stunden','8 Stunden','18 Stunden','24 Stunden'],correct:1,explanation:'Mehr Arbeiter brauchen weniger Zeit: antiproportionale Zuordnung. Die Arbeiterstunden bleiben gleich: 4 · 12 = 48. Für 6 Arbeiter: 48 : 6 = 8 Stunden. Probe: 6 · 8 = 48.'},
  {q:'Ergänze die Regeln: Bei einer proportionalen Zuordnung bleiben die ______ gleich. Wird eine Größe größer, wird die andere im selben Verhältnis ______. Bei einer antiproportionalen Zuordnung wird die andere Größe ______.',options:['Summen · kleiner · größer','Quotienten · größer · kleiner','Produkte · größer · größer','Quotienten · kleiner · kleiner'],correct:1,explanation:'Bei proportionalen Zuordnungen bleibt der Quotient gleich: y : x = k. Beide Größen wachsen oder schrumpfen im selben Verhältnis. Bei antiproportionalen Zuordnungen bleibt das Produkt gleich: x · y = k. Wird eine Größe größer, wird die andere kleiner.'},
  {q:'Ein Wasserhahn füllt einen Tank in 8 Stunden, ein zweiter in 12 Stunden. Wie lange brauchen beide zusammen? Welche Gleichung passt?',options:['x · (1/8 + 1/12) = 1; x = 4,8 Stunden','x · (8 + 12) = 1; x = 20 Stunden','1/8 + 1/12 = x; x = 5/24 Stunden','x · (1/8 − 1/12) = 1; x = 24 Stunden'],correct:0,explanation:'Die erste Leitung füllt pro Stunde 1/8 des Tanks, die zweite 1/12. Zusammen füllen sie pro Stunde 1/8 + 1/12 = 3/24 + 2/24 = 5/24 des Tanks. Gleichung: x · 5/24 = 1. Also x = 24/5 = 4,8 Stunden = 4 Stunden 48 Minuten.'},
];

// Übungsblöcke für den Lernbereich. Die Klassenarbeiten bleiben separat.
const learnQ = (q, options, correct, explanation) => ({q, options, correct, explanation, points:1});
export const MATH_PROPORTIONAL_PRACTICE_BLOCKS = [
 {id:'proportional_1',title:'Proportional · Block 1 · Grundlagen',kind:'proportional',points:15,questions:[
  learnQ('3 gleiche Hefte kosten 6 €. Was kostet ein Heft?',['1 €','2 €','3 €','6 €'],1,'Den Preis für ein Heft erhältst du durch Teilen: 6 € : 3 = 2 €.'),
  learnQ('Welche Zuordnung ist proportional?',['Anzahl gleicher Brötchen und Gesamtpreis','Arbeiterzahl und Arbeitszeit für denselben Auftrag','Alter und Körpergröße','Uhrzeit und Temperatur'],0,'Bei gleichem Stückpreis wächst der Gesamtpreis im gleichen Verhältnis wie die Anzahl.'),
  learnQ('Bei y : x = 4. Wie groß ist y für x = 3?',['7','12','16','24'],1,'y : x = 4 bedeutet y = 4 · x. Also y = 4 · 3 = 12.'),
  learnQ('5 Flaschen kosten 10 €. Was kosten 8 Flaschen?',['13 €','15 €','16 €','18 €'],2,'Eine Flasche kostet 10 € : 5 = 2 €. Acht Flaschen kosten 8 · 2 € = 16 €.'),
  learnQ('Bei einer proportionalen Zuordnung bleibt welcher Wert gleich?',['Die Summe','Das Produkt','Der Quotient y : x','Die Differenz'],2,'Bei proportionalen Zuordnungen ist y : x konstant.'),
  learnQ('Ein Radfahrer fährt in 2 Stunden 30 km. Wie weit fährt er in 5 Stunden bei gleicher Geschwindigkeit?',['60 km','65 km','75 km','90 km'],2,'Pro Stunde fährt er 30 : 2 = 15 km. In 5 Stunden: 15 · 5 = 75 km.'),
  learnQ('Welche Tabelle ist proportional?',['x: 2, 4, 6 · y: 3, 6, 9','x: 2, 4, 6 · y: 8, 4, 2','x: 1, 2, 3 · y: 2, 5, 8','x: 2, 4, 6 · y: 3, 7, 10'],0,'In der ersten Tabelle ist y : x immer 1,5.'),
  learnQ('Eine Kinokarte kostet 7 €. Was kosten 4 Karten?',['21 €','24 €','28 €','32 €'],2,'4 · 7 € = 28 €.'),
  learnQ('Bei y = 2,5 · x. Wie groß ist y für x = 8?',['10,5','16','20','24'],2,'Setze x = 8 ein: y = 2,5 · 8 = 20.'),
  learnQ('Verdoppelt sich x bei einer proportionalen Zuordnung, dann …',['halbiert sich y','bleibt y gleich','verdoppelt sich y','wird y um 2 größer'],2,'Beide Größen ändern sich mit demselben Faktor.'),
  learnQ('4 kg Birnen kosten 12 €. Wie viel kostet 1 kg?',['2 €','3 €','4 €','8 €'],1,'12 € : 4 = 3 € pro Kilogramm.'),
  learnQ('Ein Drucker druckt 60 Seiten in 3 Minuten. Wie viele Seiten druckt er in 7 Minuten?',['120','140','180','210'],1,'Pro Minute sind es 60 : 3 = 20 Seiten. In 7 Minuten: 20 · 7 = 140.'),
  learnQ('Welche Gleichung beschreibt eine proportionale Zuordnung mit Faktor 6?',['y = x + 6','y = 6 : x','y = 6x','x · y = 6'],2,'Bei Faktor 6 gilt y : x = 6, also y = 6x.'),
  learnQ('8 m Geschenkband kosten 4 €. Was kosten 3 m?',['1 €','1,50 €','2 €','2,50 €'],1,'1 m kostet 4 € : 8 = 0,50 €. Drei Meter kosten 1,50 €.'),
  learnQ('Eine proportionale Gerade geht durch (2|10). Wie lautet ihr Faktor k?',['2','5','8','10'],1,'k = y : x = 10 : 2 = 5.')
 ]},
 {id:'proportional_2',title:'Proportional · Block 2 · Tabellen und Faktoren',kind:'proportional',points:15,questions:[
  learnQ('Welche Tabelle hat den konstanten Quotienten y : x = 3?',['x: 1, 2, 4 · y: 3, 6, 12','x: 1, 2, 4 · y: 12, 6, 3','x: 1, 2, 4 · y: 3, 5, 12','x: 1, 2, 4 · y: 4, 8, 11'],0,'Die Quotienten sind 3 : 1 = 3, 6 : 2 = 3 und 12 : 4 = 3.'),
  learnQ('Bei y = 7x. Welcher y-Wert gehört zu x = 5?',['12','30','35','40'],2,'y = 7 · 5 = 35.'),
  learnQ('x = 4 gehört zu y = 18. Wie groß ist der Proportionalitätsfaktor?',['4,5','14','22','72'],0,'k = y : x = 18 : 4 = 4,5.'),
  learnQ('Ergänze: x: 3, 6, 9 · y: 12, __, 36',['18','20','24','30'],2,'Der Faktor ist 12 : 3 = 4. Für x = 6 gilt y = 6 · 4 = 24.'),
  learnQ('Eine proportionale Zuordnung hat k = 0,8. Wie groß ist y bei x = 15?',['8','12','15,8','18,75'],1,'y = k · x = 0,8 · 15 = 12.'),
  learnQ('Welcher Punkt liegt auf y = 4x?',['(2|6)','(3|12)','(4|12)','(5|25)'],1,'Für x = 3 ist y = 4 · 3 = 12.'),
  learnQ('Ein Graph geht durch den Ursprung und (6|9). Wie lautet die Gleichung?',['y = 1,5x','y = 6x','y = 9x','y = x + 3'],0,'Der Faktor ist 9 : 6 = 1,5.'),
  learnQ('Bei einer proportionalen Zuordnung wird x verdreifacht. Was passiert mit y?',['y wird durch 3 geteilt','y bleibt gleich','y wird verdreifacht','y wird um 3 größer'],2,'Bei Proportionalität werden beide Werte mit demselben Faktor vervielfacht.'),
  learnQ('Welche Wertetabelle passt zu y = 2x?',['x: 0, 2, 5 · y: 0, 4, 10','x: 0, 2, 5 · y: 2, 4, 7','x: 0, 2, 5 · y: 0, 1, 2,5','x: 0, 2, 5 · y: 0, 4, 12'],0,'Einsetzen ergibt 2·0=0, 2·2=4 und 2·5=10.'),
  learnQ('Bei y : x = 1,2. Wie groß ist x, wenn y = 6 ist?',['5','6,2','7,2','8'],0,'6 : x = 1,2. Also x = 6 : 1,2 = 5.'),
  learnQ('Eine Gerade durch den Ursprung geht auch durch (8|20). Welcher Punkt gehört dazu?',['(4|8)','(4|10)','(10|8)','(16|20)'],1,'k = 20 : 8 = 2,5. Für x = 4 ist y = 10.'),
  learnQ('x: 5, 10, 15 und y: 4, 8, 12. Wie groß ist k?',['0,8','1,25','4','20'],0,'y : x ist jeweils 4 : 5 = 0,8.'),
  learnQ('Zu x = 12 gehört y = 30. Welcher y-Wert gehört zu x = 2?',['2,5','5','12','18'],1,'k = 30 : 12 = 2,5. Dann y = 2,5 · 2 = 5.'),
  learnQ('Ein Graph einer proportionalen Zuordnung geht durch …',['(0|1)','(0|0)','(1|0) immer','(2|0) immer'],1,'Jede proportionale Zuordnung y = kx verläuft durch den Ursprung (0|0).'),
  learnQ('Welche Aussage zu k = y : x stimmt?',['k ändert sich bei jedem Wertepaar','k ist bei Proportionalität immer gleich','k ist immer 1','k ist das Produkt x · y'],1,'Der Quotient k bleibt bei allen Wertepaaren einer proportionalen Zuordnung konstant.')
 ]},
 {id:'proportional_3',title:'Proportional · Block 3 · Dreisatz und Alltag',kind:'proportional',points:15,questions:[
  learnQ('6 Brötchen kosten 3 €. Was kosten 14 Brötchen?',['6 €','7 €','8 €','9 €'],1,'Ein Brötchen kostet 0,50 €. 14 · 0,50 € = 7 €.'),
  learnQ('Für 4 Personen braucht man 300 g Reis. Wie viel braucht man für 10 Personen?',['600 g','650 g','700 g','750 g'],3,'300 : 4 = 75 g pro Person. 75 · 10 = 750 g.'),
  learnQ('Ein Auto fährt in 1,5 Stunden 120 km. Wie weit fährt es in 4 Stunden gleich schnell?',['240 km','300 km','320 km','360 km'],2,'Pro Stunde: 120 : 1,5 = 80 km. In 4 Stunden: 320 km.'),
  learnQ('5 Hefte kosten 8,50 €. Was kosten 12 Hefte?',['17,40 €','20,40 €','22,40 €','24,50 €'],1,'Ein Heft kostet 8,50 : 5 = 1,70 €. 12 · 1,70 € = 20,40 €.'),
  learnQ('Ein Wasserhahn füllt 18 Liter in 3 Minuten. Wie viel in 8 Minuten?',['36 l','42 l','48 l','54 l'],2,'Pro Minute fließen 18 : 3 = 6 Liter. In 8 Minuten sind es 48 Liter.'),
  learnQ('2,5 kg Äpfel kosten 6 €. Was kosten 4 kg?',['8 €','9,60 €','10 €','12 €'],1,'1 kg kostet 6 : 2,5 = 2,40 €. 4 kg kosten 9,60 €.'),
  learnQ('Ein Rezept braucht für 6 Muffins 180 g Mehl. Wie viel für 15 Muffins?',['360 g','400 g','450 g','540 g'],2,'Pro Muffin sind es 180 : 6 = 30 g. Für 15: 450 g.'),
  learnQ('Ein Zug fährt in 2 Stunden 150 km. Wie lange braucht er für 225 km bei gleicher Geschwindigkeit?',['2,5 h','3 h','3,5 h','4 h'],1,'Geschwindigkeit: 150 : 2 = 75 km/h. Zeit: 225 : 75 = 3 Stunden.'),
  learnQ('9 m Stoff kosten 27 €. Wie viel kosten 2,5 m?',['6 €','7,50 €','8 €','9 €'],1,'1 m kostet 3 €. 2,5 m kosten 2,5 · 3 € = 7,50 €.'),
  learnQ('Ein Kopierer schafft 240 Seiten in 4 Minuten. Wie viele in 9 Minuten?',['480','520','540','600'],2,'Pro Minute: 240 : 4 = 60 Seiten. In 9 Minuten: 540 Seiten.'),
  learnQ('12 Eintrittskarten kosten 90 €. Was kosten 5 Karten?',['30 €','35 €','37,50 €','45 €'],2,'Eine Karte kostet 90 : 12 = 7,50 €. Fünf Karten kosten 37,50 €.'),
  learnQ('Für 7 Liter Farbe reicht es für 56 m². Wie viele m² schafft man mit 3 Litern?',['21','24','28','32'],1,'Ein Liter reicht für 56 : 7 = 8 m². Drei Liter reichen für 24 m².'),
  learnQ('Ein Fahrrad fährt in 20 Minuten 6 km. Wie weit in 1 Stunde bei gleichem Tempo?',['12 km','15 km','18 km','20 km'],2,'Eine Stunde sind 60 Minuten, also dreimal so lang. 3 · 6 = 18 km.'),
  learnQ('4 Packungen kosten 5,20 €. Wie viel kosten 10 Packungen?',['10 €','12 €','13 €','15 €'],2,'Eine Packung kostet 1,30 €. Zehn Packungen kosten 13 €.'),
  learnQ('Eine Karte zeigt 2 cm für 5 km. Welche Strecke sind 7 cm?',['12,5 km','15 km','17,5 km','20 km'],2,'1 cm entspricht 2,5 km. 7 cm entsprechen 17,5 km.')
 ]},
 {id:'antiproportional_1',title:'Antiproportional · Block 1 · Grundlagen',kind:'antiproportional',points:15,questions:[
  learnQ('Welche Zuordnung ist antiproportional?',['Anzahl gleicher Brötchen und Preis','Arbeiterzahl und Arbeitszeit für dieselbe Arbeit','Fahrzeit und Strecke bei gleicher Geschwindigkeit','Kilogramm und Preis bei gleichem Kilopreis'],1,'Mehr Arbeiter benötigen für dieselbe Arbeit weniger Zeit.'),
  learnQ('Bei einer antiproportionalen Zuordnung bleibt welcher Wert gleich?',['Die Summe','Der Quotient','Das Produkt x · y','Die Differenz'],2,'Bei Antiproportionalität gilt x · y = k.'),
  learnQ('4 Arbeiter brauchen 6 Stunden. Wie lange brauchen 8 Arbeiter?',['2 Stunden','3 Stunden','6 Stunden','12 Stunden'],1,'4 · 6 = 24 Arbeiterstunden. 24 : 8 = 3 Stunden.'),
  learnQ('x · y = 40. Wie groß ist y für x = 5?',['5','8','10','35'],1,'y = 40 : 5 = 8.'),
  learnQ('Wird x verdoppelt, was geschieht mit y bei Antiproportionalität?',['y verdoppelt sich','y halbiert sich','y bleibt gleich','y wird um 2 größer'],1,'Das Produkt bleibt gleich. Daher muss y bei doppeltem x halb so groß sein.'),
  learnQ('6 Maschinen erledigen eine Arbeit in 10 Stunden. Wie lange brauchen 3 Maschinen?',['5 Stunden','10 Stunden','15 Stunden','20 Stunden'],3,'6 · 10 = 60 Maschinenstunden. 60 : 3 = 20 Stunden.'),
  learnQ('Welche Tabelle ist antiproportional?',['x: 2, 4, 8 · y: 12, 6, 3','x: 2, 4, 8 · y: 3, 6, 12','x: 2, 4, 8 · y: 12, 7, 3','x: 2, 4, 8 · y: 6, 6, 6'],0,'Die Produkte sind 24, 24 und 24.'),
  learnQ('x · y = 72. Wie groß ist x bei y = 9?',['6','8','9','63'],1,'x = 72 : 9 = 8.'),
  learnQ('12 Personen haben Vorräte für 5 Tage. Wie lange reichen sie für 10 Personen?',['4 Tage','5 Tage','6 Tage','10 Tage'],2,'12 · 5 = 60 Personentage. 60 : 10 = 6 Tage.'),
  learnQ('Bei y = 24 : x. Wie groß ist y für x = 6?',['3','4','18','30'],1,'y = 24 : 6 = 4.'),
  learnQ('9 gleiche Pumpen leeren einen Tank in 4 Stunden. Wie lange brauchen 6 Pumpen?',['3 h','5 h','6 h','7 h'],2,'9 · 4 = 36 Pumpenstunden. 36 : 6 = 6 Stunden.'),
  learnQ('Eine antiproportionale Tabelle hat x = 3 und y = 20. Wie groß ist y bei x = 12?',['5','8','17','80'],0,'Das Produkt ist 3 · 20 = 60. Dann y = 60 : 12 = 5.'),
  learnQ('Welche Gleichung passt zu Produkt 30?',['y = 30x','y = x + 30','y = 30 : x','y = x : 30'],2,'Aus x · y = 30 folgt y = 30 : x.'),
  learnQ('5 Helfer brauchen 12 Minuten. Wie lange brauchen 10 Helfer?',['6 Minuten','10 Minuten','17 Minuten','24 Minuten'],0,'5 · 12 = 60 Helferminuten. 60 : 10 = 6 Minuten.'),
  learnQ('Bei x = 2 ist y = 15. Welcher Wert bleibt konstant?',['17','13','30','7,5'],2,'Das konstante Produkt beträgt 2 · 15 = 30.')
 ]},
 {id:'antiproportional_2',title:'Antiproportional · Block 2 · Tabellen und Faktoren',kind:'antiproportional',points:15,questions:[
  learnQ('x: 2, 4, 10 und y: 18, 9, 3,6. Welches Produkt ist konstant?',['20','36','40','72'],1,'2 · 18 = 36; 4 · 9 = 36; 10 · 3,6 = 36.'),
  learnQ('x · y = 96. Wie groß ist y bei x = 12?',['6','8','12','84'],0,'96 : 12 = 8.'),
  learnQ('Bei y = 60 : x. Welcher Wert gehört zu x = 15?',['3','4','5','45'],1,'60 : 15 = 4.'),
  learnQ('Welche Tabelle zeigt x · y = 24?',['x: 2, 3, 6 · y: 12, 8, 4','x: 2, 3, 6 · y: 4, 8, 12','x: 2, 3, 6 · y: 12, 7, 4','x: 2, 3, 6 · y: 10, 8, 4'],0,'Die Produkte sind 24, 24 und 24.'),
  learnQ('Ein Graph enthält (4|8). Welche Gleichung passt?',['y = 2x','y = 32 : x','y = 8 : x','y = x + 4'],1,'Das Produkt ist 4 · 8 = 32. Also gilt y = 32 : x.'),
  learnQ('Bei x = 5 ist y = 14. Wie groß ist y bei x = 10?',['7','9','14','28'],0,'x verdoppelt sich, daher halbiert sich y: 14 : 2 = 7.'),
  learnQ('x · y = 45. Wie groß ist x, wenn y = 3?',['12','15','18','42'],1,'x = 45 : 3 = 15.'),
  learnQ('Welche Punkte gehören zu y = 20 : x?',['(2|10) und (4|5)','(2|5) und (4|10)','(2|10) und (4|6)','(2|20) und (4|20)'],0,'2 · 10 = 20 und 4 · 5 = 20.'),
  learnQ('x: 3, 6, 12 · y: 16, 8, __. Welche Zahl fehlt?',['2','4','6','8'],1,'Das Produkt ist 3 · 16 = 48. Für x = 12 ist y = 48 : 12 = 4.'),
  learnQ('Eine antiproportionale Zuordnung hat k = 120. Wie lautet die Gleichung?',['y = 120x','y = x + 120','y = 120 : x','y = x : 120'],2,'Bei x · y = 120 folgt nach y aufgelöst: y = 120 : x.'),
  learnQ('Wenn x von 4 auf 12 steigt, wie verändert sich y?',['y verdreifacht sich','y wird dreimal so groß','y wird durch 3 geteilt','y bleibt gleich'],2,'x wird verdreifacht. Damit das Produkt konstant bleibt, wird y durch 3 geteilt.'),
  learnQ('Welche Punkte haben dasselbe konstante Produkt?',['(2|12), (3|8), (6|4)','(2|12), (3|9), (6|4)','(2|6), (3|8), (6|4)','(2|12), (3|8), (6|5)'],0,'Jedes Produkt ist 24.'),
  learnQ('x · y = 150. Welcher x-Wert gehört zu y = 10?',['5','10','15','25'],2,'x = 150 : 10 = 15.'),
  learnQ('Ein Graph einer antiproportionalen Zuordnung geht durch (6|5). Welcher Punkt passt?',['(3|10)','(3|5)','(10|6)','(12|5)'],0,'Das Produkt ist 6 · 5 = 30. Für x = 3 muss y = 10 sein.'),
  learnQ('Welche Aussage stimmt bei konstantem Produkt 48?',['Bei x = 6 ist y = 8','Bei x = 6 ist y = 6','Bei x = 8 ist y = 8','Bei x = 12 ist y = 6'],0,'48 : 6 = 8.')
 ]},
 {id:'antiproportional_3',title:'Antiproportional · Block 3 · Dreisatz und Alltag',kind:'antiproportional',points:15,questions:[
  learnQ('6 Arbeiter brauchen 8 Tage. Wie lange brauchen 4 Arbeiter?',['10 Tage','12 Tage','14 Tage','16 Tage'],1,'6 · 8 = 48 Arbeitertage. 48 : 4 = 12 Tage.'),
  learnQ('Ein Vorrat reicht für 8 Personen 15 Tage. Wie lange für 12 Personen?',['8 Tage','10 Tage','12 Tage','22,5 Tage'],1,'8 · 15 = 120 Personentage. 120 : 12 = 10 Tage.'),
  learnQ('4 Wasserhähne füllen ein Becken in 18 Minuten. Wie lange brauchen 6 gleiche Hähne?',['9 Minuten','12 Minuten','15 Minuten','27 Minuten'],1,'4 · 18 = 72 Hahnminuten. 72 : 6 = 12 Minuten.'),
  learnQ('5 Maschinen brauchen 24 Stunden. Wie lange brauchen 8 Maschinen?',['12 Stunden','15 Stunden','19 Stunden','38,4 Stunden'],1,'5 · 24 = 120 Maschinenstunden. 120 : 8 = 15 Stunden.'),
  learnQ('9 Personen teilen eine Arbeit und brauchen 6 Stunden. Wie lange brauchen 3 Personen?',['2 h','9 h','12 h','18 h'],3,'9 · 6 = 54 Personenstunden. 54 : 3 = 18 Stunden.'),
  learnQ('12 Pumpen leeren einen Pool in 5 Stunden. Wie lange brauchen 10 Pumpen?',['4 h','5 h','6 h','7 h'],2,'12 · 5 = 60 Pumpenstunden. 60 : 10 = 6 Stunden.'),
  learnQ('7 Helfer bauen eine Bühne in 9 Stunden. Wie lange brauchen 21 Helfer?',['2 h','3 h','6 h','27 h'],1,'Die Helferzahl verdreifacht sich, daher wird die Zeit gedrittelt: 9 : 3 = 3 Stunden.'),
  learnQ('Ein Futtervorrat reicht für 4 Pferde 18 Tage. Wie lange für 6 Pferde?',['9 Tage','12 Tage','15 Tage','27 Tage'],1,'4 · 18 = 72 Pferdetage. 72 : 6 = 12 Tage.'),
  learnQ('8 Drucker drucken einen Auftrag in 30 Minuten. Wie lange brauchen 12 Drucker?',['15 min','20 min','24 min','45 min'],1,'8 · 30 = 240 Druckerminuten. 240 : 12 = 20 Minuten.'),
  learnQ('15 Personen haben Essen für 4 Tage. Wie lange reicht es für 10 Personen?',['5 Tage','6 Tage','7,5 Tage','9 Tage'],1,'15 · 4 = 60 Personentage. 60 : 10 = 6 Tage.'),
  learnQ('3 gleiche Geräte erledigen eine Arbeit in 16 Stunden. Zeit für 4 Geräte?',['8 h','12 h','20 h','21 h'],1,'3 · 16 = 48 Gerätestunden. 48 : 4 = 12 Stunden.'),
  learnQ('20 Arbeiter brauchen 9 Tage. Wie lange brauchen 12 Arbeiter?',['5,4 Tage','12 Tage','15 Tage','18 Tage'],2,'20 · 9 = 180 Arbeitertage. 180 : 12 = 15 Tage.'),
  learnQ('6 Maschinen brauchen 7 Stunden. Zeit für 14 Maschinen?',['2 h','3 h','4 h','5 h'],1,'6 · 7 = 42 Maschinenstunden. 42 : 14 = 3 Stunden.'),
  learnQ('Ein Team aus 5 Personen braucht 14 Stunden. Wie lange bei 7 Personen?',['8 h','10 h','12 h','19,6 h'],2,'5 · 14 = 70 Personenstunden. 70 : 7 = 10 Stunden.'),
  learnQ('10 gleiche Pumpen brauchen 3 Stunden. Wie lange brauchen 2 Pumpen?',['6 h','10 h','15 h','30 h'],2,'10 · 3 = 30 Pumpenstunden. 30 : 2 = 15 Stunden.')
 ]},
 {id:'mixed',title:'Gemischt · Block 1 · Grundlagen',kind:'mixed',points:15,questions:[
  learnQ('Welche Zuordnung ist proportional?',['Anzahl gleicher Bücher und Gesamtpreis','Arbeiterzahl und Arbeitszeit','Geschwindigkeit und Fahrzeit für dieselbe Strecke','Personenzahl und Vorratsdauer'],0,'Bei gleichem Preis pro Buch wächst der Gesamtpreis proportional zur Anzahl.'),
  learnQ('Welche Zuordnung ist antiproportional?',['Zeit und Strecke bei gleichbleibender Geschwindigkeit','Anzahl gleicher Flaschen und Gesamtpreis','Arbeiterzahl und Dauer derselben Arbeit','Menge und Preis bei gleichem Kilopreis'],2,'Bei derselben Arbeit bedeutet mehr Arbeiter weniger Zeit; das Produkt bleibt gleich.'),
  learnQ('4 kg kosten 12 €. Was kosten 7 kg?',['18 €','20 €','21 €','24 €'],2,'Das ist proportional: 12 : 4 = 3 € pro kg. 7 · 3 = 21 €.'),
  learnQ('4 Arbeiter brauchen 15 Stunden. Wie lange brauchen 10 Arbeiter?',['4 h','6 h','10 h','37,5 h'],1,'Das ist antiproportional: 4 · 15 = 60 Arbeiterstunden. 60 : 10 = 6 Stunden.'),
  learnQ('In welcher Zuordnung bleibt der Quotient y : x gleich?',['Antiproportional','Proportional','In beiden immer','In keiner'],1,'Bei proportionalen Zuordnungen ist y : x konstant.'),
  learnQ('In welcher Zuordnung bleibt das Produkt x · y gleich?',['Proportional','Antiproportional','In beiden immer','In keiner'],1,'Bei antiproportionalen Zuordnungen ist x · y konstant.'),
  learnQ('Ein Auto fährt in 3 Stunden 240 km. Wie weit in 5 Stunden gleich schnell?',['320 km','360 km','400 km','480 km'],2,'Proportional: 240 : 3 = 80 km/h. 80 · 5 = 400 km.'),
  learnQ('6 Pumpen brauchen 8 Stunden. Wie lange brauchen 4 Pumpen?',['6 h','10 h','12 h','14 h'],2,'Antiproportional: 6 · 8 = 48 Pumpenstunden. 48 : 4 = 12 Stunden.'),
  learnQ('Welche Tabelle ist proportional?',['x: 2, 4, 8 · y: 6, 12, 24','x: 2, 4, 8 · y: 24, 12, 6','x: 2, 4, 8 · y: 6, 10, 24','x: 2, 4, 8 · y: 5, 12, 20'],0,'Der Quotient ist immer 3.'),
  learnQ('Welche Tabelle ist antiproportional?',['x: 3, 6, 9 · y: 18, 9, 6','x: 3, 6, 9 · y: 6, 12, 18','x: 3, 6, 9 · y: 18, 8, 6','x: 3, 6, 9 · y: 9, 6, 3'],0,'Die Produkte betragen jeweils 54.'),
  learnQ('8 Hefte kosten 12 €. Preis für 3 Hefte?',['3 €','4,50 €','6 €','9 €'],1,'Proportional: ein Heft kostet 12 : 8 = 1,50 €. Drei kosten 4,50 €.'),
  learnQ('12 Personen haben Vorräte für 10 Tage. Dauer für 15 Personen?',['6 Tage','8 Tage','12 Tage','15 Tage'],1,'Antiproportional: 12 · 10 = 120 Personentage. 120 : 15 = 8 Tage.'),
  learnQ('Der Graph einer proportionalen Zuordnung muss durch …',['(0|0)','(0|1)','(1|0)','(2|2)'],0,'Eine proportionale Zuordnung hat die Form y = kx und geht deshalb durch den Ursprung.'),
  learnQ('Bei x · y = 56. Wie groß ist y bei x = 7?',['7','8','49','63'],1,'Antiproportional: y = 56 : 7 = 8.'),
  learnQ('Eine Tabelle hat x: 2, 4, 8 und y: 5, 10, 20. Welche Art?',['Proportional','Antiproportional','Keine von beiden','Konstant'],0,'Die Quotienten y : x sind jeweils 2,5. Daher proportional.')
 ]},
 {id:'mixed_2',title:'Gemischt · Block 2 · Tabellen und Faktoren',kind:'mixed',points:15,questions:[
  learnQ('4 kg Äpfel kosten 10 €. Was kosten 7 kg?',['15 €','17,50 €','20 €','25 €'],1,'Proportional: 10 € : 4 = 2,50 € pro kg. Dann 7 · 2,50 € = 17,50 €.'),
  learnQ('8 Arbeiter brauchen 6 Stunden. Wie lange brauchen 12 Arbeiter für dieselbe Arbeit?',['3 h','4 h','8 h','9 h'],1,'Antiproportional: 8 · 6 = 48 Arbeiterstunden. 48 : 12 = 4 Stunden.'),
  learnQ('Bei welcher Zuordnung bleibt y : x gleich?',['Proportional','Antiproportional','Bei beiden immer','Bei keiner'],0,'Bei proportionalen Zuordnungen bleibt der Quotient y : x konstant.'),
  learnQ('Bei x · y = 90. Wie groß ist y bei x = 15?',['5','6','15','75'],1,'Antiproportional: y = 90 : 15 = 6.'),
  learnQ('Welche Tabelle ist proportional?',['x: 2, 4, 6 · y: 5, 10, 15','x: 2, 4, 6 · y: 12, 6, 4','x: 2, 4, 6 · y: 5, 9, 15','x: 2, 4, 6 · y: 4, 8, 15'],0,'In der ersten Tabelle ist y : x immer 2,5.'),
  learnQ('5 Maschinen brauchen 18 Minuten. Wie lange brauchen 15 Maschinen?',['3 min','6 min','12 min','54 min'],1,'Antiproportional: 5 · 18 = 90 Maschinenminuten. 90 : 15 = 6 Minuten.'),
  learnQ('Eine proportionale Zuordnung hat den Faktor k = 3,5. Wie groß ist y bei x = 8?',['11,5','24','28','32'],2,'y = k · x = 3,5 · 8 = 28.'),
  learnQ('Welche Tabelle ist antiproportional?',['x: 2, 4, 8 · y: 24, 12, 6','x: 2, 4, 8 · y: 3, 6, 12','x: 2, 4, 8 · y: 24, 10, 6','x: 2, 4, 8 · y: 2, 4, 8'],0,'Die Produkte sind 2 · 24 = 48, 4 · 12 = 48 und 8 · 6 = 48.'),
  learnQ('Bei einer antiproportionalen Zuordnung gilt x = 7 und y = 12. Welcher y-Wert gehört zu x = 3?',['4','16','28','36'],2,'Das Produkt ist 7 · 12 = 84. Für x = 3 gilt y = 84 : 3 = 28.'),
  learnQ('6 Flaschen kosten 9 €. Was kosten 10 Flaschen?',['12 €','15 €','18 €','24 €'],1,'Proportional: 9 € : 6 = 1,50 € pro Flasche. 10 · 1,50 € = 15 €.'),
  learnQ('10 Personen reicht ein Vorrat 9 Tage. Wie lange reicht er für 15 Personen?',['4 Tage','6 Tage','9 Tage','13,5 Tage'],1,'Antiproportional: 10 · 9 = 90 Personentage. 90 : 15 = 6 Tage.'),
  learnQ('x: 3, 6, 9 und y: 12, 24, 36. Welche Art ist das?',['Proportional','Antiproportional','Keine von beiden','Konstant'],0,'Die Quotienten y : x sind jeweils 4. Die Zuordnung ist proportional.'),
  learnQ('Ein Wasserhahn füllt 1/6 eines Beckens pro Stunde. Ein zweiter füllt 1/3 pro Stunde. Wie lange füllen beide zusammen das Becken?',['1 Stunde','2 Stunden','3 Stunden','6 Stunden'],1,'Zusammen füllen sie 1/6 + 1/3 = 1/2 des Beckens pro Stunde. Für ein ganzes Becken brauchen sie 2 Stunden.'),
  learnQ('12 Arbeiter brauchen 15 Tage. Wie lange brauchen 20 Arbeiter?',['6 Tage','9 Tage','12 Tage','25 Tage'],1,'Antiproportional: 12 · 15 = 180 Arbeitertage. 180 : 20 = 9 Tage.'),
  learnQ('Welche Aussage passt zu einer proportionalen Zuordnung?',['Das Produkt bleibt gleich.','Der Quotient y : x bleibt gleich.','Eine Größe steigt, die andere muss sinken.','Der Graph geht nie durch den Ursprung.'],1,'Bei proportionalen Zuordnungen bleibt der Quotient y : x konstant.')
 ]},
 {id:'mixed_3',title:'Gemischt · Block 3 · Sachaufgaben und Dreisatz',kind:'mixed',points:15,questions:[
  learnQ('1 kg Käse kostet 14 €. Was kosten 2,5 kg?',['21 €','28 €','35 €','42 €'],2,'Proportional: 14 € · 2,5 = 35 €.'),
  learnQ('9 Helfer brauchen 8 Stunden. Wie lange brauchen 6 Helfer?',['4 h','10 h','12 h','14 h'],2,'Antiproportional: 9 · 8 = 72 Helferstunden. 72 : 6 = 12 Stunden.'),
  learnQ('Ein Maßstab zeigt: 2 cm entsprechen 5 km. Wie weit sind 7 cm?',['12 km','15 km','17,5 km','20 km'],2,'Proportional: 5 km : 2 = 2,5 km pro cm. 7 · 2,5 = 17,5 km.'),
  learnQ('Ein Graph geht durch den Ursprung und durch (3|12). Welcher Punkt liegt auch darauf?',['(5|15)','(5|20)','(6|18)','(8|24)'],1,'Der Faktor ist 12 : 3 = 4. Bei x = 5 gilt y = 4 · 5 = 20.'),
  learnQ('4 Pumpen leeren einen Pool in 30 Minuten. Wie lange brauchen 10 Pumpen?',['8 min','12 min','15 min','75 min'],1,'Antiproportional: 4 · 30 = 120 Pumpenminuten. 120 : 10 = 12 Minuten.'),
  learnQ('8 m Stoff kosten 36 €. Was kosten 5 m?',['18 €','20 €','22,50 €','24 €'],2,'Proportional: 36 € : 8 = 4,50 € pro Meter. 5 · 4,50 € = 22,50 €.'),
  learnQ('18 Personen teilen eine Arbeit und brauchen 4 Stunden. Wie lange brauchen 12 Personen?',['3 h','6 h','8 h','12 h'],1,'Antiproportional: 18 · 4 = 72 Personenstunden. 72 : 12 = 6 Stunden.'),
  learnQ('x: 4, 8, 12 und y: 30, 15, 10. Welche Art ist das?',['Proportional','Antiproportional','Keine von beiden','Konstant'],1,'Die Produkte sind 4 · 30 = 120, 8 · 15 = 120 und 12 · 10 = 120.'),
  learnQ('Für 6 Personen braucht man 450 g Nudeln. Wie viel braucht man für 10 Personen?',['600 g','700 g','750 g','900 g'],2,'Proportional: 450 g : 6 = 75 g pro Person. 10 · 75 g = 750 g.'),
  learnQ('Bei x · y = 144. Wie groß ist x bei y = 12?',['8','10','12','24'],2,'x = 144 : 12 = 12.'),
  learnQ('Ein Fahrrad fährt 18 km in 1,5 Stunden. Wie weit fährt es in 4 Stunden bei gleicher Geschwindigkeit?',['36 km','42 km','48 km','54 km'],2,'Proportional: 18 : 1,5 = 12 km/h. 12 · 4 = 48 km.'),
  learnQ('5 gleiche Geräte erledigen einen Auftrag in 16 Minuten. Wie lange brauchen 8 Geräte?',['8 min','10 min','12 min','25,6 min'],1,'Antiproportional: 5 · 16 = 80 Geräteminuten. 80 : 8 = 10 Minuten.'),
  learnQ('Bei einer proportionalen Zuordnung gilt y : x = 2,4. Wie groß ist y bei x = 15?',['17,4','24','36','42'],2,'y = 2,4 · 15 = 36.'),
  learnQ('Ein Vorrat reicht für 16 Tiere 12 Tage. Wie lange reicht er für 24 Tiere?',['6 Tage','8 Tage','10 Tage','18 Tage'],1,'Antiproportional: 16 · 12 = 192 Tier-Tage. 192 : 24 = 8 Tage.'),
  learnQ('Welche Aussage unterscheidet die beiden Zuordnungen richtig?',['Proportional: Quotient konstant; antiproportional: Produkt konstant.','Proportional: Produkt konstant; antiproportional: Quotient konstant.','Bei beiden bleibt immer die Summe gleich.','Bei beiden müssen beide Größen steigen.'],0,'Proportional gilt y : x = k. Antiproportional gilt x · y = k.')
 ]}
];

// Progress fields used by the existing per-child, per-battle mathProgress view.
export const MATH_PROGRESS_FIELDS = ["done", "score", "mistakes", "finished", "updatedAt"];

// Three interactive, classwork-style tests for proportional and
// antiproportional relationships. Each item is worth two points.
export const MATH_PROPORTIONAL_CLASSWORKS = [
 {
  title:'Proportional / Antiproportional · Klassenarbeit 1 · Grundlagen und Tabellen',duration:45,points:30,questions:[
   {q:'Welche Zuordnung ist proportional?',options:['Anzahl der Brötchen und Gesamtpreis bei gleichem Stückpreis','Anzahl der Arbeiter und benötigte Arbeitszeit','Alter einer Person und Körpergröße','Uhrzeit und Temperatur'],correct:0,explanation:'Bei gleichem Stückpreis wächst der Gesamtpreis im selben Verhältnis wie die Anzahl der Brötchen.',points:2},
   {q:'Welche Zuordnung ist antiproportional?',options:['Kilogramm Äpfel und Preis bei gleichem Kilopreis','Anzahl der Arbeiter und Arbeitszeit für dieselbe Arbeit','Fahrzeit und Strecke bei gleicher Geschwindigkeit','Anzahl gleicher Hefte und Gesamtpreis'],correct:1,explanation:'Je mehr Arbeiter mithelfen, desto weniger Arbeitszeit wird benötigt. Das Produkt aus Arbeiterzahl und Zeit bleibt gleich.',points:2},
   {q:'Bei einer proportionalen Zuordnung gilt: 4 Hefte kosten 10 €. Wie viel kostet ein Heft?',options:['2 €','2,50 €','4 €','6 €'],correct:1,explanation:'Preis für ein Heft: 10 € : 4 = 2,50 €.',points:2},
   {q:'Ein Heft kostet 2,50 €. Was kosten 7 Hefte?',options:['15 €','17,50 €','20 €','22,50 €'],correct:1,explanation:'Ein Heft kostet 2,50 €. Daher: 7 · 2,50 € = 17,50 €.',points:2},
   {q:'3 Arbeiter brauchen 8 Stunden. Wie lange brauchen 6 Arbeiter für dieselbe Arbeit?',options:['2 Stunden','4 Stunden','8 Stunden','16 Stunden'],correct:1,explanation:'Das Produkt bleibt gleich: 3 · 8 = 24 Arbeiterstunden. 24 : 6 = 4 Stunden.',points:2},
   {q:'Bei einer proportionalen Zuordnung ist y : x = 3. Welcher y-Wert gehört zu x = 7?',options:['10','18','21','24'],correct:2,explanation:'Der Faktor ist 3. Also y = 3 · 7 = 21.',points:2},
   {q:'Bei einer antiproportionalen Zuordnung gilt x · y = 36. Wie groß ist y bei x = 9?',options:['3','4','9','27'],correct:1,explanation:'Das Produkt bleibt 36. Daher y = 36 : 9 = 4.',points:2},
   {q:'Welche Tabelle zeigt eine proportionale Zuordnung?',options:['x: 2, 4, 6 · y: 5, 10, 15','x: 2, 4, 6 · y: 12, 6, 4','x: 1, 2, 3 · y: 4, 5, 7','x: 2, 4, 6 · y: 3, 8, 10'],correct:0,explanation:'In der ersten Tabelle ist y : x immer 2,5. Der Quotient bleibt konstant.',points:2},
   {q:'Bei einer proportionalen Zuordnung wird x verdoppelt. Was passiert mit y?',options:['y halbiert sich','y bleibt gleich','y verdoppelt sich','y vervierfacht sich'],correct:2,explanation:'Bei Proportionalität ändern sich beide Größen im gleichen Verhältnis. Wird x verdoppelt, verdoppelt sich auch y.',points:2},
   {q:'5 Flaschen kosten 7,50 €. Wie viel kosten 2 Flaschen?',options:['2 €','3 €','3,50 €','5 €'],correct:1,explanation:'Eine Flasche kostet 7,50 € : 5 = 1,50 €. Für 2 Flaschen: 2 · 1,50 € = 3 €.',points:2},
   {q:'Bei einer antiproportionalen Zuordnung bleibt welcher Wert gleich?',options:['Die Summe','Die Differenz','Der Quotient','Das Produkt'],correct:3,explanation:'Bei antiproportionalen Zuordnungen ist das Produkt konstant: x · y = k.',points:2},
   {q:'4 Maschinen erledigen einen Auftrag in 15 Minuten. Wie lange brauchen 10 gleiche Maschinen?',options:['4 Minuten','6 Minuten','10 Minuten','37,5 Minuten'],correct:1,explanation:'4 · 15 = 60 Maschinenminuten. 60 : 10 = 6 Minuten.',points:2},
   {q:'Welche Rechnung passt zu 6 kg Kartoffeln für 9 € und 10 kg zum gleichen Kilopreis?',options:['9 : 6 · 10','9 · 6 : 10','6 + 9 + 10','10 : 9 · 6'],correct:0,explanation:'Zuerst den Preis pro Kilogramm berechnen: 9 : 6. Danach mit 10 kg multiplizieren: 9 : 6 · 10 = 15 €.',points:2},
   {q:'Zu einer antiproportionalen Tabelle gehören x = 2 und y = 18. Welcher y-Wert gehört zu x = 6?',options:['3','6','12','54'],correct:1,explanation:'Das Produkt ist 2 · 18 = 36. Für x = 6 gilt y = 36 : 6 = 6.',points:2},
   {q:'Der Graph einer proportionalen Zuordnung verläuft durch den Ursprung und durch (2|6). Welcher Faktor k gehört dazu?',options:['2','3','4','6'],correct:1,explanation:'k = y : x = 6 : 2 = 3. Der Graph gehört zur Gleichung y = 3x.',points:2}
  ]
 },
 {
  title:'Proportional / Antiproportional · Klassenarbeit 2 · Dreisatz und Sachaufgaben',duration:45,points:30,questions:[
   {q:'3 kg Äpfel kosten 7,50 €. Was kosten 8 kg?',options:['15 €','18 €','20 €','22,50 €'],correct:2,explanation:'1 kg kostet 7,50 € : 3 = 2,50 €. Für 8 kg: 8 · 2,50 € = 20 €.',points:2},
   {q:'Für 4 Personen braucht man 300 g Nudeln. Wie viel braucht man für 7 Personen?',options:['450 g','500 g','525 g','600 g'],correct:2,explanation:'Pro Person: 300 g : 4 = 75 g. Für 7 Personen: 75 · 7 = 525 g.',points:2},
   {q:'5 Arbeiter brauchen 12 Stunden. Wie lange brauchen 8 Arbeiter für dieselbe Arbeit?',options:['6 Stunden','7,5 Stunden','8 Stunden','19,2 Stunden'],correct:1,explanation:'5 · 12 = 60 Arbeiterstunden. 60 : 8 = 7,5 Stunden.',points:2},
   {q:'Ein Zug fährt mit gleichbleibender Geschwindigkeit in 2,5 Stunden 200 km. Wie weit fährt er in 4 Stunden?',options:['250 km','300 km','320 km','400 km'],correct:2,explanation:'Pro Stunde fährt der Zug 200 : 2,5 = 80 km. In 4 Stunden: 80 · 4 = 320 km.',points:2},
   {q:'6 Notizbücher kosten 10,80 €. Was kosten 11 Notizbücher?',options:['16,80 €','18 €','19,80 €','21,60 €'],correct:2,explanation:'Ein Notizbuch kostet 10,80 € : 6 = 1,80 €. Für 11 Stück: 11 · 1,80 € = 19,80 €.',points:2},
   {q:'Ein Vorrat reicht für 12 Personen 10 Tage. Wie lange reicht er für 15 Personen?',options:['6 Tage','8 Tage','9 Tage','12,5 Tage'],correct:1,explanation:'Der Vorrat umfasst 12 · 10 = 120 Personentage. 120 : 15 = 8 Tage.',points:2},
   {q:'Ein Auto verbraucht auf 100 km 6 Liter. Wie viel verbraucht es auf 350 km?',options:['18 l','21 l','24 l','35 l'],correct:1,explanation:'350 km sind das 3,5-Fache von 100 km. 6 · 3,5 = 21 Liter.',points:2},
   {q:'4 gleiche Pumpen leeren ein Becken in 18 Minuten. Wie lange brauchen 6 Pumpen?',options:['9 Minuten','12 Minuten','15 Minuten','27 Minuten'],correct:1,explanation:'4 · 18 = 72 Pumpenminuten. 72 : 6 = 12 Minuten.',points:2},
   {q:'Auf einer Karte entsprechen 3 cm genau 12 km. Wie weit sind 7 cm in Wirklichkeit?',options:['21 km','24 km','28 km','36 km'],correct:2,explanation:'1 cm entspricht 12 : 3 = 4 km. 7 cm entsprechen 7 · 4 = 28 km.',points:2},
   {q:'Der Graph einer proportionalen Zuordnung geht durch (0|0) und (4|12). Welche Gleichung passt?',options:['y = 3x','y = 4x','y = x + 8','y = 12x'],correct:0,explanation:'Der Faktor ist 12 : 4 = 3. Deshalb lautet die Gleichung y = 3x.',points:2},
   {q:'Welche Aussage beschreibt eine antiproportionale Zuordnung?',options:['Bei doppelter Strecke verdoppelt sich bei gleicher Geschwindigkeit die Zeit.','Bei doppelter Arbeiterzahl halbiert sich die benötigte Zeit.','Bei doppelter Warenmenge verdoppelt sich der Preis.','Bei doppelter Zeit verdoppelt sich die Strecke.'],correct:1,explanation:'Bei einer festen Arbeit bleibt Arbeiterzahl · Zeit gleich. Verdoppelt sich die Arbeiterzahl, halbiert sich die Zeit.',points:2},
   {q:'6 m Stoff kosten 42 €. Was kosten 2,5 m?',options:['15 €','17,50 €','21 €','24,50 €'],correct:1,explanation:'1 m kostet 42 € : 6 = 7 €. Für 2,5 m: 2,5 · 7 € = 17,50 €.',points:2},
   {q:'8 Handwerker brauchen 9 Tage. Wie viele Tage brauchen 12 Handwerker?',options:['4 Tage','6 Tage','8 Tage','13,5 Tage'],correct:1,explanation:'8 · 9 = 72 Handwerkertage. 72 : 12 = 6 Tage.',points:2},
   {q:'Bei einer antiproportionalen Zuordnung gilt x · y = 84. Welcher Wert gehört zu x = 7?',options:['7','12','21','77'],correct:1,explanation:'y = 84 : 7 = 12.',points:2},
   {q:'Ein Graph geht durch (1|8), (2|4) und (4|2). Welche Zuordnung passt?',options:['Proportional, denn y : x = 8','Antiproportional, denn x · y = 8','Proportional, denn x · y = 8','Keine Zuordnung'],correct:1,explanation:'Die Produkte sind 1 · 8 = 8, 2 · 4 = 8 und 4 · 2 = 8. Der Graph gehört zu einer antiproportionalen Zuordnung.',points:2}
  ]
 },
 {
  title:'Proportional / Antiproportional · Klassenarbeit 3 · Gemischte Prüfung',duration:45,points:30,questions:[
   {q:'Eine Zuordnung hat die Tabelle x: 2, 5, 8 · y: 6, 15, 24. Welche Art liegt vor?',options:['Proportional','Antiproportional','Keine der beiden','Konstant'],correct:0,explanation:'Die Quotienten sind 6 : 2 = 3, 15 : 5 = 3 und 24 : 8 = 3. Der Quotient bleibt gleich: proportional.',points:2},
   {q:'Eine Zuordnung hat x: 3, 6, 9 · y: 24, 12, 8. Welche Art liegt vor?',options:['Proportional','Antiproportional','Keine der beiden','Konstant'],correct:1,explanation:'Die Produkte sind 3 · 24 = 72, 6 · 12 = 72 und 9 · 8 = 72. Das Produkt bleibt gleich: antiproportional.',points:2},
   {q:'7 gleiche Eintrittskarten kosten 56 €. Wie viel kosten 12 Karten?',options:['84 €','92 €','96 €','112 €'],correct:2,explanation:'Eine Karte kostet 56 € : 7 = 8 €. Für 12 Karten: 12 · 8 € = 96 €.',points:2},
   {q:'9 Personen brauchen 4 Stunden für eine Arbeit. Wie lange brauchen 6 Personen?',options:['2 Stunden','6 Stunden','7 Stunden','12 Stunden'],correct:1,explanation:'9 · 4 = 36 Personenstunden. 36 : 6 = 6 Stunden.',points:2},
   {q:'Bei einer proportionalen Zuordnung gilt y = 4x. Wie groß ist y bei x = 6,5?',options:['10,5','24','26','30'],correct:2,explanation:'y = 4 · 6,5 = 26.',points:2},
   {q:'Bei einer antiproportionalen Zuordnung ist x · y = 60. Wie groß ist x bei y = 5?',options:['10','12','15','55'],correct:1,explanation:'x = 60 : 5 = 12.',points:2},
   {q:'Welche Tabelle gehört zu y = 2,5x?',options:['x: 2, 4, 8 · y: 5, 10, 20','x: 2, 4, 8 · y: 20, 10, 5','x: 2, 4, 8 · y: 4, 8, 10','x: 2, 4, 8 · y: 5, 12, 20'],correct:0,explanation:'Setze die x-Werte ein: 2,5 · 2 = 5; 2,5 · 4 = 10; 2,5 · 8 = 20.',points:2},
   {q:'Welche Gleichung passt zu einer antiproportionalen Zuordnung mit Produkt 48?',options:['y = 48x','y = x + 48','y = 48 : x','y = x : 48'],correct:2,explanation:'Bei antiproportionaler Zuordnung gilt x · y = 48. Nach y aufgelöst: y = 48 : x.',points:2},
   {q:'Ein Graph einer proportionalen Zuordnung verläuft durch (3|12). Welcher weitere Punkt liegt darauf?',options:['(4|16)','(4|15)','(6|18)','(12|3)'],correct:0,explanation:'Der Faktor k = 12 : 3 = 4. Für x = 4 gilt y = 4 · 4 = 16.',points:2},
   {q:'Ein Graph einer antiproportionalen Zuordnung geht durch (4|9). Welcher Punkt gehört ebenfalls dazu?',options:['(6|6)','(6|12)','(8|5)','(9|9)'],correct:0,explanation:'Das Produkt beträgt 4 · 9 = 36. Für x = 6 ist y = 36 : 6 = 6.',points:2},
   {q:'10 Personen stellen Tische in 15 Minuten auf. Wie lange brauchen 6 Personen für dieselbe Arbeit?',options:['9 Minuten','15 Minuten','25 Minuten','30 Minuten'],correct:2,explanation:'Personenzahl und Zeit sind antiproportional. 10 · 15 = 150 Personenminuten. 150 : 6 = 25 Minuten.',points:2},
   {q:'Ein Rezept für 5 Personen enthält 750 ml Milch. Wie viel Milch braucht man für 8 Personen?',options:['900 ml','1.000 ml','1.200 ml','1.500 ml'],correct:2,explanation:'Pro Person: 750 ml : 5 = 150 ml. Für 8 Personen: 150 · 8 = 1.200 ml.',points:2},
   {q:'Bei welcher Situation ist der Dreisatz antiproportional?',options:['Mehr Kilometer bei gleicher Geschwindigkeit brauchen mehr Zeit.','Mehr gleiche Waren kosten mehr Geld.','Mehr Arbeiter erledigen dieselbe Arbeit in kürzerer Zeit.','Mehr Liter pro Minute füllen einen Tank schneller.'],correct:2,explanation:'Bei gleicher Arbeit bleibt Arbeiterzahl · Zeit konstant. Mehr Arbeiter bedeuten weniger benötigte Zeit.',points:2},
   {q:'Eine Maschine füllt 240 Flaschen in 6 Minuten. Wie viele Flaschen füllt sie in 15 Minuten?',options:['400','480','600','720'],correct:2,explanation:'Pro Minute: 240 : 6 = 40 Flaschen. In 15 Minuten: 40 · 15 = 600 Flaschen.',points:2},
   {q:'Eine proportionale Gerade geht durch (0|0) und (5|20). Wie lautet ihre Gleichung?',options:['y = 4x','y = 5x','y = x + 15','y = 20x'],correct:0,explanation:'Der Proportionalitätsfaktor ist 20 : 5 = 4. Die Gleichung lautet y = 4x.',points:2}
  ]
 }
];


// Lernkarten aus dem Arbeitsblatt-PDF: Begriff aufdecken, Erklärung anzeigen.
export const PROPORTIONAL_WORKSHEET_CARDS = [
 {front:'Proportionale Zuordnung',back:'Eine proportionale Zuordnung liegt vor, wenn zwei Größen in einem konstanten Verhältnis zueinander stehen. Vervielfacht sich eine Größe, vervielfacht sich die andere im gleichen Verhältnis.'},
 {front:'Antiproportionale Zuordnung',back:'Eine antiproportionale Zuordnung liegt vor, wenn das Produkt zweier Größen konstant bleibt. Wird eine Größe größer, wird die andere entsprechend kleiner.'},
 {front:'Konstanter Faktor bei Proportionalität',back:'Der Proportionalitätsfaktor gibt an, um wie viel sich eine Größe ändert, wenn sich die andere um eine Einheit ändert.'},
 {front:'Beispiel für proportionale Zuordnung',back:'Bleibt der Preis pro Kilogramm Äpfel gleich, ist der Gesamtpreis proportional zur gekauften Menge.'},
 {front:'Beispiel für antiproportionale Zuordnung',back:'Erledigen 4 Arbeiter eine Arbeit in 6 Stunden, brauchen 2 Arbeiter doppelt so lange. Arbeit × Zeit bleibt gleich.'},
 {front:'Graphische Darstellung der Proportionalität',back:'Der Graph einer proportionalen Zuordnung ist eine Gerade durch den Ursprung (0, 0).'},
 {front:'Graphische Darstellung der Antiproportionalität',back:'Der Graph einer antiproportionalen Zuordnung ist eine Hyperbel. Das Produkt der beiden Größen bleibt konstant.'},
 {front:'Formel für Proportionalität',back:'y = k × x. Dabei ist k der Proportionalitätsfaktor.'},
 {front:'Formel für Antiproportionalität',back:'x × y = c. Dabei ist c eine konstante Zahl.'},
 {front:'Unterschied zwischen proportional und antiproportional',back:'Bei proportionalen Zuordnungen ändern sich beide Größen im gleichen Verhältnis. Bei antiproportionalen Zuordnungen wird eine Größe größer, während die andere so kleiner wird, dass das Produkt gleich bleibt.'}
];

// Frage-Antwort-Karten aus dem Lernkarten-PDF.
export const PROPORTIONAL_FLASH_CARDS = [
 {front:'Was bedeutet ein proportionaler Zusammenhang?',back:'Zwei Größen ändern sich im gleichen Verhältnis. Verdoppelt sich die eine Größe, verdoppelt sich auch die andere.'},
 {front:'Wie erkennt man eine proportionale Zuordnung an Zahlenwerten?',back:'Der Quotient aus den beiden Größen bleibt immer gleich: y : x = k.'},
 {front:'Was ist eine antiproportionale Zuordnung?',back:'Das Produkt aus zwei Größen bleibt gleich: x × y = k. Wird eine Größe größer, wird die andere entsprechend kleiner.'},
 {front:'Nenne ein Beispiel für eine proportionale Beziehung im Alltag.',back:'Bei gleichbleibendem Kilopreis kosten doppelt so viele Äpfel auch doppelt so viel.'},
 {front:'Nenne ein Beispiel für eine antiproportionale Beziehung im Alltag.',back:'Bei einer festen Strecke gilt: Je schneller man fährt, desto kürzer ist die Fahrzeit. Geschwindigkeit × Zeit bleibt konstant.'},
 {front:'Wie lautet die Formel für eine proportionale Beziehung?',back:'y = k × x. k ist der Proportionalitätsfaktor.'},
 {front:'Wie lautet die Formel für eine antiproportionale Beziehung?',back:'x × y = k. k ist ein konstanter Wert.'},
 {front:'Wie berechnet man k bei einer proportionalen Zuordnung?',back:'Man teilt y durch x: k = y : x.'},
 {front:'Wie berechnet man k bei einer antiproportionalen Zuordnung?',back:'Man multipliziert die beiden Größen: k = x × y.'},
 {front:'Was passiert, wenn sich bei einer antiproportionalen Zuordnung eine Größe verdoppelt?',back:'Die andere Größe halbiert sich, damit das Produkt konstant bleibt.'},
 {front:'Wie erkennt man eine proportionale Funktion im Koordinatensystem?',back:'Ihr Graph ist eine Gerade, die durch den Ursprung (0, 0) verläuft.'},
 {front:'Wie sieht der Graph einer antiproportionalen Funktion aus?',back:'Er ist eine Hyperbel, die sich den Achsen asymptotisch nähert.'},
 {front:'Warum ist eine proportionale Zuordnung auch eine lineare Funktion?',back:'Ihr Graph ist eine Gerade durch den Ursprung und ihre Gleichung hat die Form y = kx.'},
 {front:'Was bedeutet der Proportionalitätsfaktor k?',back:'k gibt an, um wie viel sich die zweite Größe ändert, wenn sich die erste Größe um eine Einheit ändert.'},
 {front:'Wozu hilft das Verständnis proportionaler und antiproportionaler Zusammenhänge?',back:'Damit lassen sich Alltagssituationen wie Preise, Geschwindigkeiten und Arbeitszeiten besser verstehen und berechnen.'}
];
