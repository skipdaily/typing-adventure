const fs = require('fs');

const bigEmojis = [
  ...[
    ["🔥🐶", "hotdog", "A baseball game snack"], ["🍎🥧", "apple pie", "A fruit dessert"],
    ["❄️👨", "snowman", "Made of freezing water"], ["🌧️🏹", "rainbow", "Colorful arc in the sky"],
    ["⭐🐟", "starfish", "Has 5 arms in the ocean"], ["🌻", "sunflower", "A tall yellow plant"],
    ["🕸️👨", "spiderman", "A superhero with webs"], ["🦇👨", "batman", "A dark knight superhero"],
    ["🥞🍯", "pancakes", "Breakfast food with syrup"], ["🐢🥷", "ninja turtle", "Heroes in a half shell"],
    ["🍔🍟", "fast food", "Quick meal"], ["🧊☕", "iced coffee", "Cold morning drink"],
    ["📱🍎", "iphone", "A popular smartphone"], ["🍦🚌", "ice cream truck", "Sells sweet cold treats"],
    ["🚗⚡", "electric car", "Vehicle that uses batteries"], ["🌲🐻", "forest bear", "Wild animal in woods"],
    ["🚢🧊", "titanic", "Famous sunken ship"], ["🏠👻", "haunted house", "Scary building"],
    ["⚽🏟️", "soccer match", "Game played on a pitch"], ["🍿🎥", "movie theater", "Where you watch films"],
    ["🚀🌕", "moon landing", "Space exploration event"], ["👽🛸", "ufo", "Alien spaceship"],
    ["🕷️🕸️", "spider web", "Sticky bug trap"], ["🐝🍯", "honey", "Sweet bee product"],
    ["👨‍🍳🍳", "chef", "Someone who cooks"], ["🐶🦴", "dog bone", "Puppy treat"],
    ["🐱🐭", "tom and jerry", "Cat and mouse cartoon"], ["🐰🥕", "bugs bunny", "Famous cartoon rabbit"],
    ["👸🐸", "princess and the frog", "Fairytale story"], ["🍎👸", "snow white", "Eats a poisoned fruit"],
    ["👠🕕", "cinderella", "Loses a glass slipper"], ["🧜‍♀️🐟", "little mermaid", "Ariel"],
    ["🦁👑", "lion king", "Hakuna matata"], ["🧸🤠", "toy story", "Woody and Buzz"],
    ["❄️👸", "frozen", "Let it go"], ["🚗🏁", "cars", "Lightning McQueen"],
    ["🦸‍♂️🦸‍♀️", "avengers", "Earths mightiest heroes"], ["🧙‍♂️⚡", "harry potter", "The boy who lived"],
    ["🦖🏞️", "jurassic park", "Dinosaur zoo"], ["🐼🥋", "kung fu panda", "Martial arts bear"],
    ["👴🎈🏠", "up", "Flying house"], ["🐀👨‍🍳", "ratatouille", "Cooking rat"],
    ["🐟🔎", "finding nemo", "Lost fish"], ["👹🧅", "shrek", "Ogre with layers"],
    ["🤠🐎", "cowboy", "Rides horses in the wild west"], ["🏴‍☠️🦜", "pirate", "Sails the seas for treasure"],
    ["👨‍🚀🌌", "astronaut", "Explores space"], ["👮‍♂️🚓", "police officer", "Catches bad guys"],
    ["👨‍🚒🚒", "firefighter", "Puts out fires"], ["👨‍⚕️🩺", "doctor", "Helps sick people"],
    ["👨‍🏫📚", "teacher", "Helps you learn at school"], ["👨‍🌾🚜", "farmer", "Grows food"],
    ["👨‍🎨🖌️", "artist", "Paints pictures"], ["👨‍🎤🎤", "singer", "Performs music"],
    ["🕵️‍♂️🔍", "detective", "Solves mysteries"], ["🥷⚔️", "ninja", "Sneaky warrior"],
    ["🧛‍♂️🦇", "vampire", "Dracula"], ["🧟‍♂️🧠", "zombie", "Eats brains"],
    ["🧞‍♂️🪔", "genie", "Grants 3 wishes"], ["🧜‍♂️🔱", "merman", "Ocean king"],
    ["🎅🦌", "santa claus", "Brings presents on christmas"], ["🐰🥚", "easter bunny", "Hides eggs"],
    ["🧚‍♀️✨", "fairy", "Has wings and magic dust"], ["🧙‍♀️🧹", "witch", "Rides a broom"],
    ["👸🏰", "princess", "Lives in a castle"], ["🤴👑", "prince", "Son of a king"],
    ["🐉🔥", "dragon", "Breathes fire"], ["🦄🌈", "unicorn", "Magical horse with a horn"],
    ["🐶🏠", "doghouse", "Where a dog sleeps"], ["🐱🧶", "cat toy", "Yarn for a kitten"],
    ["🐭🧀", "mouse trap", "Catches rodents"], ["🐹🎡", "hamster wheel", "Exercise for a small pet"],
    ["🐰🐇", "bunny rabbit", "Hops around"], ["🦊🐔", "fox and hen", "Predator and prey"],
    ["🐻🍯", "winnie the pooh", "Bear that loves honey"], ["🐼🎋", "panda bear", "Eats bamboo"],
    ["🐨🌿", "koala", "Eats eucalyptus leaves"], ["🐯🥩", "tiger", "Big striped cat"],
    ["🦁🦓", "lion and zebra", "African animals"], ["🐮🥛", "cow milk", "Dairy drink"],
    ["🐷泥", "pig in mud", "Farm animal"]
  ].map(a => `{ prompt: "${a[0]}", answer: "${a[1]}", hint: "${a[2]}" }`)
];

const bigOpposites = [
  ...[
    ["hot", "cold"], ["up", "down"], ["fast", "slow"], ["big", "small"],
    ["happy", "sad"], ["day", "night"], ["good", "bad"], ["inside", "outside"],
    ["left", "right"], ["boy", "girl"], ["start", "stop"], ["hard", "soft"],
    ["high", "low"], ["near", "far"], ["wet", "dry"], ["empty", "full"],
    ["young", "old"], ["new", "old"], ["rich", "poor"], ["thick", "thin"],
    ["wide", "narrow"], ["heavy", "light"], ["dark", "light"], ["loud", "quiet"],
    ["sweet", "sour"], ["clean", "dirty"], ["smooth", "rough"], ["sharp", "dull"],
    ["early", "late"], ["first", "last"], ["front", "back"], ["top", "bottom"],
    ["open", "closed"], ["on", "off"], ["true", "false"], ["yes", "no"],
    ["always", "never"], ["all", "none"], ["many", "few"], ["more", "less"],
    ["add", "subtract"], ["multiply", "divide"], ["win", "lose"], ["pass", "fail"],
    ["push", "pull"], ["throw", "catch"], ["buy", "sell"], ["give", "take"],
    ["come", "go"], ["arrive", "depart"], ["enter", "exit"], ["rise", "fall"],
    ["sink", "float"], ["build", "destroy"], ["create", "destroy"], ["live", "die"],
    ["love", "hate"], ["laugh", "cry"], ["smile", "frown"], ["shout", "whisper"],
    ["sleep", "wake"], ["stand", "sit"], ["work", "play"], ["study", "play"],
    ["remember", "forget"], ["know", "guess"], ["ask", "answer"], ["question", "answer"],
    ["lead", "follow"], ["teach", "learn"], ["borrow", "lend"],
    ["save", "spend"], ["earn", "spend"], ["find", "lose"], ["keep", "give"],
    ["hide", "seek"], ["attack", "defend"], ["fight", "peace"], ["war", "peace"]
  ].map(a => `{ prompt: "${a[0]}", answer: "${a[1]}", hint: "Opposite of ${a[0]}" }`)
];

const mathEquations = [
  ...Array.from({ length: 15 }, (_, i) => [i + 5 + " + " + (i + 2) + " =", String((i + 5) + (i + 2))]),
  ...Array.from({ length: 15 }, (_, i) => [i + 15 + " - " + (i + 2) + " =", String((i + 15) - (i + 2))]),
  ...Array.from({ length: 15 }, (_, i) => [i + 2 + " * " + (i + 3) + " =", String((i + 2) * (i + 3))]),
  ...Array.from({ length: 10 }, (_, i) => [(i + 2) * (i + 4) + " / " + (i + 2) + " =", String(i + 4)])
].map(a => `{ prompt: "${a[0]}", answer: "${a[1]}" }`);

let f = "export interface GameItem {\n  prompt: string;\n  answer: string;\n  hint?: string;\n}\n\n";
f += "export const EQUATIONS_LIST: GameItem[] = [\n  " + mathEquations.join(",\n  ") + "\n];\n\n";
f += "export const EMOJI_LIST: GameItem[] = [\n  " + bigEmojis.join(",\n  ") + "\n];\n\n";
f += "export const OPPOSITES_LIST: GameItem[] = [\n  " + bigOpposites.join(",\n  ") + "\n];\n\n";
f += "export const FLIPPER_LIST: GameItem[] = [\n  { prompt: \"apple\", answer: \"elppa\", hint: \"Just type it backwards!\" },\n";
f += "  { prompt: \"dog\", answer: \"god\", hint: \"Just type it backwards!\" },\n";
f += "  { prompt: \"spider\", answer: \"redips\", hint: \"Just type it backwards!\" },\n";
f += "  { prompt: \"lemon\", answer: \"nomel\", hint: \"Just type it backwards!\" },\n";
f += "  { prompt: \"racecar\", answer: \"racecar\", hint: \"It is a palindrome\" },\n";
f += "  { prompt: \"elephant\", answer: \"tnahpele\", hint: \"Just type it backwards!\" },\n";
f += "  { prompt: \"world\", answer: \"dlrow\", hint: \"Just type it backwards!\" },\n";
f += "  { prompt: \"kids\", answer: \"sdik\", hint: \"Just type it backwards!\" },\n";
f += "  { prompt: \"galaxy\", answer: \"yxalag\", hint: \"Just type it backwards!\" },\n";
f += "  { prompt: \"puzzle\", answer: \"elzzup\", hint: \"Just type it backwards!\" },\n";
f += "  { prompt: \"magic\", answer: \"cigam\", hint: \"Just type it backwards!\" },\n";
f += "  { prompt: \"water\", answer: \"retaw\", hint: \"Just type it backwards!\" },\n";
f += "  { prompt: \"time\", answer: \"emit\", hint: \"Just type it backwards!\" }\n];\n\n";
f += "export const SCRAMBLE_LIST: GameItem[] = [\n";
f += "  { prompt: \"tac\", answer: \"cat\", hint: \"Meow\" },\n";
f += "  { prompt: \"gdo\", answer: \"dog\", hint: \"Woof\" },\n";
f += "  { prompt: \"iksd\", answer: \"kids\", hint: \"Children\" },\n";
f += "  { prompt: \"nuf\", answer: \"fun\", hint: \"Good times\" },\n";
f += "  { prompt: \"hoto\", answer: \"hoot\", hint: \"Owl sound\" },\n";
f += "  { prompt: \"iktn\", answer: \"knit\", hint: \"Make a sweater\" },\n";
f += "  { prompt: \"thbae\", answer: \"bathe\", hint: \"To wash\" },\n";
f += "  { prompt: \"mnoo\", answer: \"moon\", hint: \"White rock in night sky\" },\n";
f += "  { prompt: \"kboo\", answer: \"book\", hint: \"To read\" },\n";
f += "  { prompt: \"snu\", answer: \"sun\", hint: \"Yellow star in sky\" },\n";
f += "  { prompt: \"trse\", answer: \"rest\", hint: \"To sleep or relax\" }\n];\n";

fs.writeFileSync("src/data.ts", f);
