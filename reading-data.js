// Reading material and tasks supplied by the user in the attached classroom worksheet.
export const READING_TEXT_EN = `Our class trip to Cardiff Castle

[1] Everyone at our school knows that our History teacher, Mr Oldman, is interested in history. But did you know that Mr Oldman also owns a private collection of knight’s armour and other things from the past? He even has a 34-year-old car. What a crazy hobby! We found out about that in our History lessons during the last two weeks. We learned a lot about knights, castles, swords and armour too. We even put on costumes in class! It was really exciting and great fun. Finally our class went on a day trip to visit Cardiff Castle.

[2] Cardiff Castle is in the city centre of the Welsh capital. There are lots of big trees and colourful plants in the park around it. When we arrived there, the weather was nice and sunny. First we had a break in the park and enjoyed our picnic. Suddenly we saw a knight in armour ride through the park. Two knights were behind him and shouted some strange words. Two other knights jousted with each other. It looked so real! Mr Oldman said the actors were practising for a play by Shakespeare.

[3] Cardiff Castle is about 2,000 years old. It has dark corridors and a tall clock tower. We went up to the tower: There are lots of small steps and it was difficult to walk up. Mr Oldman was happy that no one fell down or got hurt or got lost. At the end Mr Oldman himself hit his head. But it wasn’t too bad. He just needed a plaster.

[4] In the park around the castle there is a famous wall: the Animal Wall. When you stand there and look up, you will look right into the eyes of lions, a bear, monkeys, raccoons and other animals. First I jumped because I thought a real wild animal would come down the wall. It was scary! But then I looked again and laughed. Mr Oldman saw that and smiled too.

We all loved the trip to Cardiff Castle and had a great day.

by Mike Sheffield, Year 9`;

export const READING_TEXT_DE = `Unser Klassenausflug zum Cardiff Castle

[1] An unserer Schule weiß jeder, dass unser Geschichtslehrer Mr Oldman sich für Geschichte interessiert. Aber wusstest du, dass Mr Oldman auch eine private Sammlung mit Ritterrüstungen und anderen Dingen aus der Vergangenheit besitzt? Er hat sogar ein 34 Jahre altes Auto. Was für ein verrücktes Hobby! In den letzten zwei Wochen haben wir in unserem Geschichtsunterricht davon erfahren. Wir haben auch viel über Ritter, Burgen, Schwerter und Rüstungen gelernt. Sogar Kostüme haben wir im Unterricht angezogen! Das war richtig spannend und hat großen Spaß gemacht. Schließlich machte unsere Klasse einen Tagesausflug zum Cardiff Castle.

[2] Cardiff Castle liegt im Stadtzentrum der walisischen Hauptstadt. Im Park ringsherum gibt es viele große Bäume und bunte Pflanzen. Als wir ankamen, war das Wetter schön und sonnig. Zuerst machten wir eine Pause im Park und aßen unser Picknick. Plötzlich sahen wir einen Ritter in Rüstung durch den Park reiten. Zwei Ritter ritten hinter ihm und riefen merkwürdige Worte. Zwei weitere Ritter kämpften auf Pferden gegeneinander. Es sah echt aus! Mr Oldman erklärte, dass die Schauspieler eine Szene für ein Stück von Shakespeare probten.

[3] Cardiff Castle ist ungefähr 2.000 Jahre alt. Dort gibt es dunkle Gänge und einen hohen Uhrenturm. Wir stiegen zum Turm hinauf. Es gab viele kleine Stufen und der Aufstieg war schwierig. Mr Oldman war froh, dass niemand hingefallen, verletzt oder verloren gegangen war. Am Ende stieß er sich selbst den Kopf. Es war aber nicht so schlimm. Er brauchte nur ein Pflaster.

[4] Im Park rund um die Burg steht eine berühmte Mauer: die Animal Wall. Wenn man dort steht und nach oben schaut, blickt man Löwen, einem Bären, Affen, Waschbären und anderen Tieren direkt in die Augen. Zuerst zuckte ich zusammen, weil ich dachte, ein echtes wildes Tier würde von der Mauer herunterkommen. Das war unheimlich! Dann schaute ich noch einmal hin und musste lachen. Mr Oldman sah das und lächelte auch.

Uns allen gefiel der Ausflug zum Cardiff Castle und wir hatten einen tollen Tag.

Von Mike Sheffield, Klasse 9`;

export const READING_ILLUSTRATION = `<figure style="margin:12px 0;text-align:center"><img src="./reading-cardiff-castle.jpg" alt="Cardiff Castle" style="width:100%;height:auto;border-radius:12px"><img src="./reading-animal-wall.jpg" alt="Steinerne Tierfigur an der Animal Wall" style="display:block;width:min(58%,280px);height:auto;margin:12px auto 0;border-radius:12px"><figcaption class="muted small">Bilder aus dem bereitgestellten Arbeitsblatt</figcaption></figure>`;

const choices = ['Right', 'Wrong', 'Not in the text'];
const headings = ['Paragraph 1', 'Paragraph 2', 'Paragraph 3', 'Paragraph 4', '–'];
export const READING_QUIZ = [
 {type:'heading',q:'The way up',options:headings,correct:2},
 {type:'heading',q:'Like real eyes',options:headings,correct:3},
 {type:'heading',q:'Adventure in the park',options:headings,correct:1},
 {type:'heading',q:'The king’s family',options:headings,correct:4},
 {type:'heading',q:'History at school',options:headings,correct:0},
 {type:'statement',q:'Mr Oldman is a teacher at Llanelli Southwest School.',options:choices,correct:0},
 {type:'statement',q:'He collects old clocks too.',options:choices,correct:2},
 {type:'statement',q:'Cardiff is the capital of Wales.',options:choices,correct:0},
 {type:'statement',q:'It rained all the time during their day trip.',options:choices,correct:1},
 {type:'statement',q:'There were five real knights in the park.',options:choices,correct:1},
 {type:'statement',q:'One of them looked like Shakespeare.',options:choices,correct:2},
 {type:'statement',q:'The clock tower was hard to climb.',options:choices,correct:0},
 {type:'statement',q:'The students saw a real wild animal on the wall.',options:choices,correct:1}
];

export const READING_TEXT_TASKS = [
 {q:'What’s Mr Oldman’s favourite subject? Give 2 details from the text.',sample:'He is interested in history and owns a private collection of knight’s armour and other things from the past.'},
 {q:'Why did Mike jump when he saw the Animal Wall?',sample:'He was scared/afraid of a stone animal. / He thought the animal was real.'},
 {q:'What do you think about Mike’s report and the class trip to Cardiff Castle? Write a short message in the guestbook of the school website.',sample:'I think Year 9 had a very exciting class trip to Cardiff Castle. Mike’s report is interesting. I really like the photos. I want to visit Cardiff Castle in my next summer holidays.\n\nMelanie'}
];
