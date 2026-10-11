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

// Progress fields used by the existing per-child, per-battle mathProgress view.
export const MATH_PROGRESS_FIELDS = ["done", "score", "mistakes", "finished", "updatedAt"];
