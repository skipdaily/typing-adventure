export interface BackgroundOption {
  id: string;
  emoji: string;
  label: string;
  className: string;
}

export interface ShopAvatar {
  id: string;
  emoji: string;
  price: number;
  reqCount: number;
}

export interface ShopBackground extends BackgroundOption {
  price: number;
  reqCount: number;
}

export const DEFAULT_AVATARS = ['🐶', '🐱', '🦄', '🐸', '🐰', '🐯', '🐼', '🦊'];
export const DEFAULT_BACKGROUNDS = [
  { id: 'paper', emoji: '📝', label: 'Paper', className: 'bg-[#FDFCF0]' },
  { id: 'ocean', emoji: '🌊', label: 'Ocean', className: 'bg-gradient-to-b from-cyan-200 to-blue-300' },
  { id: 'candy', emoji: '🍬', label: 'Candy', className: 'bg-gradient-to-br from-fuchsia-200 to-pink-200' },
  { id: 'space', emoji: '🚀', label: 'Space', className: 'bg-gradient-to-b from-slate-800 to-indigo-950' },
  { id: 'forest', emoji: '🌲', label: 'Forest', className: 'bg-gradient-to-br from-emerald-200 to-green-300' },
];

export const SECRET_BACKGROUNDS = [
  { id: 'magic', emoji: '🌈', label: 'Rainbow', className: 'bg-gradient-to-r from-red-400 via-orange-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400' },
  { id: 'hacker', emoji: '💻', label: 'Hacker', className: 'bg-black text-green-500' },
  { id: 'ninja', emoji: '🥷', label: 'Dojo', className: 'bg-gradient-to-b from-slate-900 to-red-900' }
];

export const SHOP_AVATARS = [
  {
    "id": "robot",
    "emoji": "🤖",
    "price": 100,
    "reqCount": 0
  },
  {
    "id": "alien",
    "emoji": "👽",
    "price": 150,
    "reqCount": 0
  },
  {
    "id": "ghost",
    "emoji": "👻",
    "price": 200,
    "reqCount": 0
  },
  {
    "id": "dino",
    "emoji": "🦖",
    "price": 250,
    "reqCount": 0
  },
  {
    "id": "dragon",
    "emoji": "🐉",
    "price": 300,
    "reqCount": 0
  },
  {
    "id": "shark",
    "emoji": "🦈",
    "price": 350,
    "reqCount": 0
  },
  {
    "id": "octopus",
    "emoji": "🐙",
    "price": 400,
    "reqCount": 0
  },
  {
    "id": "squid",
    "emoji": "🦑",
    "price": 450,
    "reqCount": 0
  },
  {
    "id": "butterfly",
    "emoji": "🦋",
    "price": 500,
    "reqCount": 1
  },
  {
    "id": "snail",
    "emoji": "🐌",
    "price": 550,
    "reqCount": 1
  },
  {
    "id": "bug",
    "emoji": "🐛",
    "price": 600,
    "reqCount": 1
  },
  {
    "id": "ant",
    "emoji": "🐜",
    "price": 650,
    "reqCount": 1
  },
  {
    "id": "bee",
    "emoji": "🐝",
    "price": 700,
    "reqCount": 2
  },
  {
    "id": "beetle",
    "emoji": "🪲",
    "price": 750,
    "reqCount": 2
  },
  {
    "id": "ladybug",
    "emoji": "🐞",
    "price": 800,
    "reqCount": 2
  },
  {
    "id": "spider",
    "emoji": "🕷️",
    "price": 850,
    "reqCount": 2
  },
  {
    "id": "scorpion",
    "emoji": "🦂",
    "price": 900,
    "reqCount": 3
  },
  {
    "id": "crab",
    "emoji": "🦀",
    "price": 950,
    "reqCount": 3
  },
  {
    "id": "lobster",
    "emoji": "🦞",
    "price": 1000,
    "reqCount": 3
  },
  {
    "id": "turtle",
    "emoji": "🐢",
    "price": 1050,
    "reqCount": 3
  },
  {
    "id": "snake",
    "emoji": "🐍",
    "price": 1100,
    "reqCount": 4
  },
  {
    "id": "lizard",
    "emoji": "🦎",
    "price": 1150,
    "reqCount": 4
  },
  {
    "id": "trex",
    "emoji": "🦖",
    "price": 1200,
    "reqCount": 4
  },
  {
    "id": "sauropod",
    "emoji": "🦕",
    "price": 1250,
    "reqCount": 4
  },
  {
    "id": "swan",
    "emoji": "🦢",
    "price": 1300,
    "reqCount": 5
  },
  {
    "id": "owl",
    "emoji": "🦉",
    "price": 1350,
    "reqCount": 5
  },
  {
    "id": "peacock",
    "emoji": "🦚",
    "price": 1400,
    "reqCount": 5
  },
  {
    "id": "parrot",
    "emoji": "🦜",
    "price": 1450,
    "reqCount": 5
  },
  {
    "id": "crocodile",
    "emoji": "🐊",
    "price": 1500,
    "reqCount": 6
  },
  {
    "id": "whale",
    "emoji": "🐳",
    "price": 1550,
    "reqCount": 6
  },
  {
    "id": "dolphin",
    "emoji": "🐬",
    "price": 1600,
    "reqCount": 6
  },
  {
    "id": "seal",
    "emoji": "🦭",
    "price": 1650,
    "reqCount": 6
  },
  {
    "id": "tropical",
    "emoji": "🐠",
    "price": 1700,
    "reqCount": 7
  },
  {
    "id": "blowfish",
    "emoji": "🐡",
    "price": 1750,
    "reqCount": 7
  },
  {
    "id": "leopard",
    "emoji": "🐆",
    "price": 1800,
    "reqCount": 7
  },
  {
    "id": "zebra",
    "emoji": "🦓",
    "price": 1850,
    "reqCount": 7
  },
  {
    "id": "gorilla",
    "emoji": "🦍",
    "price": 1900,
    "reqCount": 8
  },
  {
    "id": "orangutan",
    "emoji": "🦧",
    "price": 1950,
    "reqCount": 8
  },
  {
    "id": "elephant",
    "emoji": "🐘",
    "price": 2000,
    "reqCount": 8
  },
  {
    "id": "hippo",
    "emoji": "🦛",
    "price": 2050,
    "reqCount": 8
  },
  {
    "id": "rhino",
    "emoji": "🦏",
    "price": 2100,
    "reqCount": 9
  },
  {
    "id": "camel",
    "emoji": "🐪",
    "price": 2150,
    "reqCount": 9
  },
  {
    "id": "giraffe",
    "emoji": "🦒",
    "price": 2200,
    "reqCount": 9
  },
  {
    "id": "kangaroo",
    "emoji": "🦘",
    "price": 2250,
    "reqCount": 9
  },
  {
    "id": "sloth",
    "emoji": "🦥",
    "price": 2300,
    "reqCount": 10
  },
  {
    "id": "otter",
    "emoji": "🦦",
    "price": 2350,
    "reqCount": 10
  },
  {
    "id": "skunk",
    "emoji": "🦨",
    "price": 2400,
    "reqCount": 10
  },
  {
    "id": "badger",
    "emoji": "🦡",
    "price": 2450,
    "reqCount": 10
  },
  {
    "id": "mouse",
    "emoji": "🐁",
    "price": 2500,
    "reqCount": 11
  },
  {
    "id": "rat",
    "emoji": "🐀",
    "price": 2550,
    "reqCount": 11
  },
  {
    "id": "hedgehog",
    "emoji": "🦔",
    "price": 2600,
    "reqCount": 11
  },
  {
    "id": "bat",
    "emoji": "🦇",
    "price": 2650,
    "reqCount": 11
  },
  {
    "id": "eagle",
    "emoji": "🦅",
    "price": 2700,
    "reqCount": 12
  },
  {
    "id": "duck",
    "emoji": "🦆",
    "price": 2750,
    "reqCount": 12
  },
  {
    "id": "rooster",
    "emoji": "🐓",
    "price": 2800,
    "reqCount": 12
  },
  {
    "id": "turkey",
    "emoji": "🦃",
    "price": 2850,
    "reqCount": 12
  },
  {
    "id": "penguin",
    "emoji": "🐧",
    "price": 2900,
    "reqCount": 13
  },
  {
    "id": "flamingo",
    "emoji": "🦩",
    "price": 2950,
    "reqCount": 13
  },
  {
    "id": "wizard",
    "emoji": "🧙",
    "price": 3000,
    "reqCount": 13
  },
  {
    "id": "fairy",
    "emoji": "🧚",
    "price": 3050,
    "reqCount": 13
  },
  {
    "id": "vampire",
    "emoji": "🧛",
    "price": 3100,
    "reqCount": 14
  },
  {
    "id": "merperson",
    "emoji": "🧜",
    "price": 3150,
    "reqCount": 14
  },
  {
    "id": "elf",
    "emoji": "🧝",
    "price": 3200,
    "reqCount": 14
  },
  {
    "id": "genie",
    "emoji": "🧞",
    "price": 3250,
    "reqCount": 14
  },
  {
    "id": "zombie",
    "emoji": "🧟",
    "price": 3300,
    "reqCount": 15
  },
  {
    "id": "clown",
    "emoji": "🤡",
    "price": 3350,
    "reqCount": 15
  },
  {
    "id": "cowboy",
    "emoji": "🤠",
    "price": 3400,
    "reqCount": 15
  },
  {
    "id": "crown",
    "emoji": "👑",
    "price": 3450,
    "reqCount": 15
  },
  {
    "id": "astronaut",
    "emoji": "🧑‍🚀",
    "price": 3500,
    "reqCount": 16
  },
  {
    "id": "scientist",
    "emoji": "🧑‍🔬",
    "price": 3550,
    "reqCount": 16
  },
  {
    "id": "artist",
    "emoji": "🧑‍🎨",
    "price": 3600,
    "reqCount": 16
  },
  {
    "id": "chef",
    "emoji": "🧑‍🍳",
    "price": 3650,
    "reqCount": 16
  },
  {
    "id": "firefighter",
    "emoji": "🧑‍🚒",
    "price": 3700,
    "reqCount": 17
  },
  {
    "id": "pilot",
    "emoji": "🧑‍✈️",
    "price": 3750,
    "reqCount": 17
  },
  {
    "id": "judge",
    "emoji": "🧑‍⚖️",
    "price": 3800,
    "reqCount": 17
  },
  {
    "id": "farmer",
    "emoji": "🧑‍🌾",
    "price": 3850,
    "reqCount": 17
  },
  {
    "id": "singer",
    "emoji": "🧑‍🎤",
    "price": 3900,
    "reqCount": 18
  },
  {
    "id": "mechanic",
    "emoji": "🧑‍🔧",
    "price": 3950,
    "reqCount": 18
  },
  {
    "id": "teacher",
    "emoji": "🧑‍🏫",
    "price": 4000,
    "reqCount": 18
  },
  {
    "id": "detective",
    "emoji": "🕵️",
    "price": 4050,
    "reqCount": 18
  },
  {
    "id": "superhero",
    "emoji": "🦸",
    "price": 4100,
    "reqCount": 19
  },
  {
    "id": "supervillain",
    "emoji": "🦹",
    "price": 4150,
    "reqCount": 19
  },
  {
    "id": "guard",
    "emoji": "💂",
    "price": 4200,
    "reqCount": 19
  },
  {
    "id": "ninja_star",
    "emoji": "🥷",
    "price": 4250,
    "reqCount": 19
  },
  {
    "id": "prince",
    "emoji": "🤴",
    "price": 4300,
    "reqCount": 20
  },
  {
    "id": "princess",
    "emoji": "👸",
    "price": 4350,
    "reqCount": 20
  },
  {
    "id": "baby",
    "emoji": "👶",
    "price": 4400,
    "reqCount": 20
  },
  {
    "id": "elder",
    "emoji": "🧓",
    "price": 4450,
    "reqCount": 20
  },
  {
    "id": "mind_blown",
    "emoji": "🤯",
    "price": 4500,
    "reqCount": 21
  },
  {
    "id": "skull",
    "emoji": "💀",
    "price": 4550,
    "reqCount": 21
  },
  {
    "id": "jack_o_lantern",
    "emoji": "🎃",
    "price": 4600,
    "reqCount": 21
  },
  {
    "id": "snowperson",
    "emoji": "☃️",
    "price": 4650,
    "reqCount": 21
  },
  {
    "id": "hot_face",
    "emoji": "🥵",
    "price": 4700,
    "reqCount": 22
  },
  {
    "id": "cold_face",
    "emoji": "🥶",
    "price": 4750,
    "reqCount": 22
  },
  {
    "id": "star_struck",
    "emoji": "🤩",
    "price": 4800,
    "reqCount": 22
  },
  {
    "id": "party_face",
    "emoji": "🥳",
    "price": 4850,
    "reqCount": 22
  },
  {
    "id": "robot_arm",
    "emoji": "🦾",
    "price": 4900,
    "reqCount": 23
  },
  {
    "id": "brain",
    "emoji": "🧠",
    "price": 4950,
    "reqCount": 23
  },
  {
    "id": "eye",
    "emoji": "👁️",
    "price": 5000,
    "reqCount": 23
  },
  {
    "id": "crystal_ball",
    "emoji": "🔮",
    "price": 5050,
    "reqCount": 23
  },
  {
    "id": "magic_wand",
    "emoji": "🪄",
    "price": 5100,
    "reqCount": 24
  },
  {
    "id": "sparkles",
    "emoji": "✨",
    "price": 5150,
    "reqCount": 24
  },
  {
    "id": "comet",
    "emoji": "☄️",
    "price": 5200,
    "reqCount": 24
  },
  {
    "id": "saturn",
    "emoji": "🪐",
    "price": 5250,
    "reqCount": 24
  },
  {
    "id": "rocket",
    "emoji": "🚀",
    "price": 5300,
    "reqCount": 25
  },
  {
    "id": "flying_saucer",
    "emoji": "🛸",
    "price": 5350,
    "reqCount": 25
  },
  {
    "id": "locomotive",
    "emoji": "🚂",
    "price": 5400,
    "reqCount": 25
  },
  {
    "id": "race_car",
    "emoji": "🏎️",
    "price": 5450,
    "reqCount": 25
  },
  {
    "id": "hot_air_balloon",
    "emoji": "🎈",
    "price": 5500,
    "reqCount": 26
  },
  {
    "id": "kite",
    "emoji": "🪁",
    "price": 5550,
    "reqCount": 26
  },
  {
    "id": "trophy_star",
    "emoji": "🏆",
    "price": 5600,
    "reqCount": 26
  },
  {
    "id": "medal",
    "emoji": "🏅",
    "price": 5650,
    "reqCount": 26
  },
  {
    "id": "diamond",
    "emoji": "💎",
    "price": 5700,
    "reqCount": 27
  },
  {
    "id": "gemstone",
    "emoji": "🔷",
    "price": 5750,
    "reqCount": 27
  },
  {
    "id": "shield",
    "emoji": "🛡️",
    "price": 5800,
    "reqCount": 27
  },
  {
    "id": "crossed_swords",
    "emoji": "⚔️",
    "price": 5850,
    "reqCount": 27
  },
  {
    "id": "jester",
    "emoji": "🃏",
    "price": 5900,
    "reqCount": 28
  },
  {
    "id": "final_boss",
    "emoji": "👹",
    "price": 5950,
    "reqCount": 28
  }
];


export const SHOP_BACKGROUNDS = [
  {
    "id": "desert",
    "emoji": "🌵",
    "label": "Desert",
    "className": "bg-gradient-to-b from-yellow-200 to-orange-300",
    "price": 150,
    "reqCount": 0
  },
  {
    "id": "lava",
    "emoji": "🌋",
    "label": "Lava",
    "className": "bg-gradient-to-b from-orange-600 to-red-900",
    "price": 200,
    "reqCount": 0
  },
  {
    "id": "ice",
    "emoji": "❄️",
    "label": "Ice Cave",
    "className": "bg-gradient-to-br from-cyan-100 to-blue-200",
    "price": 250,
    "reqCount": 0
  },
  {
    "id": "stars",
    "emoji": "✨",
    "label": "Starry",
    "className": "bg-slate-900 text-yellow-100",
    "price": 300,
    "reqCount": 0
  },
  {
    "id": "sunset",
    "emoji": "🌇",
    "label": "Sunset",
    "className": "bg-gradient-to-b from-purple-500 to-orange-400 text-white",
    "price": 350,
    "reqCount": 0
  },
  {
    "id": "rainbow",
    "emoji": "🌈",
    "label": "Magic",
    "className": "bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 text-white",
    "price": 400,
    "reqCount": 0
  },
  {
    "id": "ocean_deep",
    "emoji": "🌊",
    "label": "Deep Ocean",
    "className": "bg-gradient-to-b from-blue-800 to-blue-950 text-white",
    "price": 450,
    "reqCount": 0
  },
  {
    "id": "sky",
    "emoji": "☁️",
    "label": "Cloud Sky",
    "className": "bg-gradient-to-b from-sky-200 to-white",
    "price": 500,
    "reqCount": 0
  },
  {
    "id": "jungle",
    "emoji": "🌿",
    "label": "Jungle",
    "className": "bg-gradient-to-br from-green-700 to-emerald-950 text-white",
    "price": 550,
    "reqCount": 1
  },
  {
    "id": "fire",
    "emoji": "🔥",
    "label": "Fire",
    "className": "bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 text-black",
    "price": 600,
    "reqCount": 1
  },
  {
    "id": "matrix",
    "emoji": "🕶️",
    "label": "Matrix",
    "className": "bg-black text-green-400",
    "price": 650,
    "reqCount": 1
  },
  {
    "id": "cyberpunk",
    "emoji": "🏙️",
    "label": "Neon City",
    "className": "bg-gradient-to-br from-purple-900 via-pink-800 to-blue-900 text-cyan-200",
    "price": 700,
    "reqCount": 1
  },
  {
    "id": "gold",
    "emoji": "🏆",
    "label": "Solid Gold",
    "className": "bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-200 text-yellow-900",
    "price": 750,
    "reqCount": 2
  },
  {
    "id": "silver",
    "emoji": "🥈",
    "label": "Silver",
    "className": "bg-gradient-to-b from-slate-300 to-slate-500 text-slate-900",
    "price": 800,
    "reqCount": 2
  },
  {
    "id": "bronze",
    "emoji": "🥉",
    "label": "Bronze",
    "className": "bg-gradient-to-b from-amber-700 to-orange-900 text-orange-200",
    "price": 850,
    "reqCount": 2
  },
  {
    "id": "strawberry",
    "emoji": "🍓",
    "label": "Berry",
    "className": "bg-gradient-to-br from-rose-400 to-pink-600 text-white",
    "price": 900,
    "reqCount": 2
  },
  {
    "id": "blueberry",
    "emoji": "🫐",
    "label": "Blueberry",
    "className": "bg-gradient-to-b from-blue-400 to-indigo-600 text-white",
    "price": 950,
    "reqCount": 3
  },
  {
    "id": "lemon",
    "emoji": "🍋",
    "label": "Lemonade",
    "className": "bg-gradient-to-r from-yellow-100 to-yellow-300 text-yellow-900",
    "price": 1000,
    "reqCount": 3
  },
  {
    "id": "watermelon",
    "emoji": "🍉",
    "label": "Melon",
    "className": "bg-gradient-to-b from-green-500 via-white to-red-500 text-black",
    "price": 1050,
    "reqCount": 3
  },
  {
    "id": "grape",
    "emoji": "🍇",
    "label": "Grape",
    "className": "bg-gradient-to-t from-purple-600 to-purple-800 text-white",
    "price": 1100,
    "reqCount": 3
  },
  {
    "id": "mint",
    "emoji": "🌿",
    "label": "Mint",
    "className": "bg-gradient-to-br from-teal-100 to-emerald-200 text-teal-900",
    "price": 1150,
    "reqCount": 4
  },
  {
    "id": "choco",
    "emoji": "🍫",
    "label": "Chocolate",
    "className": "bg-gradient-to-b from-amber-900 to-stone-900 text-amber-200",
    "price": 1200,
    "reqCount": 4
  },
  {
    "id": "marshmallow",
    "emoji": "🍡",
    "label": "Marshmallow",
    "className": "bg-gradient-to-r from-pink-100 via-white to-sky-100 text-slate-800",
    "price": 1250,
    "reqCount": 4
  },
  {
    "id": "unicorn",
    "emoji": "🦄",
    "label": "Unicorn",
    "className": "bg-gradient-to-tr from-fuchsia-300 via-purple-300 to-pink-300 text-purple-900",
    "price": 1300,
    "reqCount": 4
  },
  {
    "id": "pirate",
    "emoji": "🏴‍☠️",
    "label": "Pirate",
    "className": "bg-gradient-to-b from-stone-800 to-stone-950 text-amber-200",
    "price": 1350,
    "reqCount": 5
  },
  {
    "id": "alien_planet",
    "emoji": "🛸",
    "label": "Xenon",
    "className": "bg-gradient-to-br from-lime-500 to-purple-700 text-lime-100",
    "price": 1400,
    "reqCount": 5
  },
  {
    "id": "moon",
    "emoji": "🌕",
    "label": "Moon Light",
    "className": "bg-slate-800 text-slate-200",
    "price": 1450,
    "reqCount": 5
  },
  {
    "id": "sun",
    "emoji": "☀️",
    "label": "Sun Burst",
    "className": "bg-gradient-to-tr from-yellow-300 to-orange-500 text-orange-950",
    "price": 1500,
    "reqCount": 5
  },
  {
    "id": "volcano",
    "emoji": "🌋",
    "label": "Magma",
    "className": "bg-gradient-to-t from-red-800 to-slate-900 text-red-200",
    "price": 1550,
    "reqCount": 6
  },
  {
    "id": "bubble",
    "emoji": "🫧",
    "label": "Bubbles",
    "className": "bg-gradient-to-br from-cyan-50 to-blue-200 text-blue-900",
    "price": 1600,
    "reqCount": 6
  },
  {
    "id": "sand",
    "emoji": "🏖️",
    "label": "Sand Castle",
    "className": "bg-gradient-to-b from-amber-100 to-yellow-200 text-amber-900",
    "price": 1650,
    "reqCount": 6
  },
  {
    "id": "snow",
    "emoji": "⛄",
    "label": "Snowfall",
    "className": "bg-slate-50 text-slate-800",
    "price": 1700,
    "reqCount": 6
  },
  {
    "id": "fall",
    "emoji": "🍁",
    "label": "Autumn",
    "className": "bg-gradient-to-bl from-orange-400 to-red-600 text-white",
    "price": 1750,
    "reqCount": 7
  },
  {
    "id": "spring",
    "emoji": "🌸",
    "label": "Spring",
    "className": "bg-gradient-to-r from-pink-200 to-rose-300 text-rose-900",
    "price": 1800,
    "reqCount": 7
  },
  {
    "id": "royal",
    "emoji": "👑",
    "label": "Velvet",
    "className": "bg-gradient-to-b from-purple-800 to-indigo-900 text-yellow-300",
    "price": 1850,
    "reqCount": 7
  },
  {
    "id": "gothic",
    "emoji": "🦇",
    "label": "Gothic",
    "className": "bg-stone-950 text-stone-300",
    "price": 1900,
    "reqCount": 7
  },
  {
    "id": "crystal",
    "emoji": "💎",
    "label": "Crystal",
    "className": "bg-gradient-to-br from-indigo-300 to-cyan-300 text-indigo-900",
    "price": 1950,
    "reqCount": 8
  },
  {
    "id": "slime",
    "emoji": "🦠",
    "label": "Slime Time",
    "className": "bg-gradient-to-b from-lime-400 to-green-600 text-green-950",
    "price": 2000,
    "reqCount": 8
  },
  {
    "id": "galaxy",
    "emoji": "🌌",
    "label": "Spaced",
    "className": "bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-purple-200",
    "price": 2050,
    "reqCount": 8
  },
  {
    "id": "sunset_beach",
    "emoji": "🏝️",
    "label": "Beach",
    "className": "bg-gradient-to-t from-blue-400 via-orange-300 to-purple-400 text-white",
    "price": 2100,
    "reqCount": 8
  },
  {
    "id": "aurora",
    "emoji": "🌟",
    "label": "Aurora",
    "className": "bg-gradient-to-r from-green-400 via-teal-500 to-blue-600 text-white",
    "price": 2150,
    "reqCount": 9
  },
  {
    "id": "electric",
    "emoji": "⚡",
    "label": "Electric",
    "className": "bg-gradient-to-br from-blue-600 to-cyan-400 text-white",
    "price": 2200,
    "reqCount": 9
  },
  {
    "id": "toxic",
    "emoji": "☣️",
    "label": "Toxic",
    "className": "bg-gradient-to-b from-lime-500 to-yellow-400 text-stone-900",
    "price": 2250,
    "reqCount": 9
  },
  {
    "id": "vampire",
    "emoji": "🧛",
    "label": "Dracula",
    "className": "bg-gradient-to-r from-red-900 to-slate-900 text-red-100",
    "price": 2300,
    "reqCount": 9
  },
  {
    "id": "angel",
    "emoji": "👼",
    "label": "Heavenly",
    "className": "bg-gradient-to-b from-sky-100 to-white text-sky-800",
    "price": 2350,
    "reqCount": 10
  },
  {
    "id": "demon",
    "emoji": "😈",
    "label": "Underworld",
    "className": "bg-gradient-to-t from-red-700 to-black text-rose-200",
    "price": 2400,
    "reqCount": 10
  },
  {
    "id": "dragon_lair",
    "emoji": "🐉",
    "label": "Lair",
    "className": "bg-gradient-to-tr from-amber-700 to-red-900 text-amber-100",
    "price": 2450,
    "reqCount": 10
  },
  {
    "id": "fairy",
    "emoji": "🧚",
    "label": "Fairy Dust",
    "className": "bg-gradient-to-br from-pink-200 to-purple-200 text-purple-800",
    "price": 2500,
    "reqCount": 10
  },
  {
    "id": "woodland",
    "emoji": "🦌",
    "label": "Woodland",
    "className": "bg-gradient-to-b from-stone-400 to-emerald-800 text-stone-100",
    "price": 2550,
    "reqCount": 11
  },
  {
    "id": "tundra",
    "emoji": "🧊",
    "label": "Tundra",
    "className": "bg-gradient-to-r from-slate-200 to-blue-300 text-slate-800",
    "price": 2600,
    "reqCount": 11
  },
  {
    "id": "neon",
    "emoji": "🪩",
    "label": "Neon Lights",
    "className": "bg-gradient-to-br from-fuchsia-600 to-blue-600 text-white",
    "price": 2650,
    "reqCount": 11
  },
  {
    "id": "pastel",
    "emoji": "🎨",
    "label": "Pastel",
    "className": "bg-gradient-to-tr from-red-100 via-blue-100 to-green-100 text-slate-700",
    "price": 2700,
    "reqCount": 11
  },
  {
    "id": "obsidian",
    "emoji": "🪨",
    "label": "Obsidian",
    "className": "bg-slate-950 text-fuchsia-300",
    "price": 2750,
    "reqCount": 12
  },
  {
    "id": "paper",
    "emoji": "📄",
    "label": "Origami",
    "className": "bg-stone-100 text-stone-800",
    "price": 2800,
    "reqCount": 12
  },
  {
    "id": "coral_reef",
    "emoji": "🪸",
    "label": "Coral Reef",
    "className": "bg-gradient-to-br from-cyan-300 via-teal-200 to-rose-300 text-cyan-950",
    "price": 2850,
    "reqCount": 13
  },
  {
    "id": "rainforest",
    "emoji": "🌳",
    "label": "Rainforest",
    "className": "bg-gradient-to-b from-emerald-300 to-green-900 text-emerald-50",
    "price": 2900,
    "reqCount": 13
  },
  {
    "id": "canyon",
    "emoji": "🏜️",
    "label": "Canyon",
    "className": "bg-gradient-to-br from-orange-300 via-red-400 to-amber-800 text-orange-950",
    "price": 2950,
    "reqCount": 13
  },
  {
    "id": "meteor_shower",
    "emoji": "☄️",
    "label": "Meteor",
    "className": "bg-gradient-to-br from-slate-950 via-indigo-950 to-orange-900 text-orange-100",
    "price": 3000,
    "reqCount": 13
  },
  {
    "id": "starship",
    "emoji": "🚀",
    "label": "Starship",
    "className": "bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-800 text-cyan-100",
    "price": 3050,
    "reqCount": 14
  },
  {
    "id": "moonbase",
    "emoji": "🪐",
    "label": "Moonbase",
    "className": "bg-gradient-to-b from-slate-300 via-slate-600 to-slate-950 text-slate-50",
    "price": 3100,
    "reqCount": 14
  },
  {
    "id": "nebula",
    "emoji": "🌠",
    "label": "Nebula",
    "className": "bg-gradient-to-tr from-fuchsia-900 via-indigo-700 to-cyan-700 text-fuchsia-100",
    "price": 3150,
    "reqCount": 14
  },
  {
    "id": "black_hole",
    "emoji": "🕳️",
    "label": "Black Hole",
    "className": "bg-gradient-to-br from-black via-slate-900 to-purple-950 text-purple-200",
    "price": 3200,
    "reqCount": 14
  },
  {
    "id": "circuit",
    "emoji": "💾",
    "label": "Circuit",
    "className": "bg-gradient-to-br from-zinc-950 via-emerald-950 to-black text-emerald-300",
    "price": 3250,
    "reqCount": 15
  },
  {
    "id": "hologram",
    "emoji": "🔷",
    "label": "Hologram",
    "className": "bg-gradient-to-r from-cyan-200 via-indigo-200 to-fuchsia-200 text-indigo-900",
    "price": 3300,
    "reqCount": 15
  },
  {
    "id": "arcade",
    "emoji": "🕹️",
    "label": "Arcade",
    "className": "bg-gradient-to-b from-violet-900 via-fuchsia-800 to-slate-950 text-pink-200",
    "price": 3350,
    "reqCount": 15
  },
  {
    "id": "pixel",
    "emoji": "🎮",
    "label": "Pixel",
    "className": "bg-gradient-to-br from-slate-800 via-blue-700 to-lime-500 text-lime-100",
    "price": 3400,
    "reqCount": 15
  },
  {
    "id": "library",
    "emoji": "📚",
    "label": "Library",
    "className": "bg-gradient-to-b from-amber-100 via-orange-200 to-stone-500 text-stone-900",
    "price": 3450,
    "reqCount": 16
  },
  {
    "id": "laboratory",
    "emoji": "🧪",
    "label": "Lab",
    "className": "bg-gradient-to-br from-slate-100 via-cyan-100 to-emerald-200 text-emerald-950",
    "price": 3500,
    "reqCount": 16
  },
  {
    "id": "workshop",
    "emoji": "🛠️",
    "label": "Workshop",
    "className": "bg-gradient-to-r from-zinc-300 via-stone-400 to-orange-300 text-zinc-950",
    "price": 3550,
    "reqCount": 16
  },
  {
    "id": "bakery",
    "emoji": "🥐",
    "label": "Bakery",
    "className": "bg-gradient-to-br from-orange-100 via-amber-200 to-pink-200 text-amber-950",
    "price": 3600,
    "reqCount": 16
  },
  {
    "id": "festival",
    "emoji": "🎪",
    "label": "Festival",
    "className": "bg-gradient-to-r from-red-300 via-yellow-200 to-sky-300 text-red-950",
    "price": 3650,
    "reqCount": 17
  },
  {
    "id": "fireworks",
    "emoji": "🎆",
    "label": "Fireworks",
    "className": "bg-gradient-to-b from-indigo-950 via-purple-900 to-pink-900 text-yellow-200",
    "price": 3700,
    "reqCount": 17
  },
  {
    "id": "carnival",
    "emoji": "🎡",
    "label": "Carnival",
    "className": "bg-gradient-to-br from-sky-300 via-rose-300 to-yellow-200 text-sky-950",
    "price": 3750,
    "reqCount": 17
  },
  {
    "id": "theater",
    "emoji": "🎭",
    "label": "Theater",
    "className": "bg-gradient-to-b from-red-950 via-rose-900 to-stone-950 text-amber-200",
    "price": 3800,
    "reqCount": 17
  },
  {
    "id": "royal_hall",
    "emoji": "🏰",
    "label": "Royal Hall",
    "className": "bg-gradient-to-br from-indigo-900 via-purple-800 to-yellow-600 text-yellow-100",
    "price": 3850,
    "reqCount": 18
  },
  {
    "id": "clocktower",
    "emoji": "🕰️",
    "label": "Clocktower",
    "className": "bg-gradient-to-b from-slate-700 via-stone-700 to-amber-900 text-amber-100",
    "price": 3900,
    "reqCount": 18
  },
  {
    "id": "city_lights",
    "emoji": "🌃",
    "label": "City Lights",
    "className": "bg-gradient-to-t from-black via-slate-900 to-blue-800 text-yellow-100",
    "price": 3950,
    "reqCount": 18
  },
  {
    "id": "subway",
    "emoji": "🚇",
    "label": "Subway",
    "className": "bg-gradient-to-r from-zinc-800 via-slate-600 to-zinc-900 text-zinc-100",
    "price": 4000,
    "reqCount": 18
  },
  {
    "id": "garden",
    "emoji": "🌷",
    "label": "Garden",
    "className": "bg-gradient-to-br from-lime-100 via-green-200 to-pink-200 text-green-950",
    "price": 4050,
    "reqCount": 19
  },
  {
    "id": "orchard",
    "emoji": "🍎",
    "label": "Orchard",
    "className": "bg-gradient-to-b from-red-100 via-green-200 to-lime-500 text-green-950",
    "price": 4100,
    "reqCount": 19
  },
  {
    "id": "sunflower",
    "emoji": "🌻",
    "label": "Sunflower",
    "className": "bg-gradient-to-br from-yellow-200 via-amber-300 to-green-400 text-amber-950",
    "price": 4150,
    "reqCount": 19
  },
  {
    "id": "lavender",
    "emoji": "🪻",
    "label": "Lavender",
    "className": "bg-gradient-to-r from-violet-200 via-purple-300 to-indigo-300 text-purple-950",
    "price": 4200,
    "reqCount": 19
  },
  {
    "id": "mist",
    "emoji": "🌫️",
    "label": "Mist",
    "className": "bg-gradient-to-b from-slate-100 via-slate-300 to-blue-200 text-slate-800",
    "price": 4250,
    "reqCount": 20
  },
  {
    "id": "storm",
    "emoji": "⛈️",
    "label": "Storm",
    "className": "bg-gradient-to-b from-slate-800 via-gray-700 to-blue-950 text-slate-100",
    "price": 4300,
    "reqCount": 20
  },
  {
    "id": "monsoon",
    "emoji": "🌧️",
    "label": "Monsoon",
    "className": "bg-gradient-to-br from-blue-900 via-cyan-700 to-slate-600 text-cyan-100",
    "price": 4350,
    "reqCount": 20
  },
  {
    "id": "heatwave",
    "emoji": "🌡️",
    "label": "Heatwave",
    "className": "bg-gradient-to-t from-orange-600 via-yellow-300 to-red-500 text-red-950",
    "price": 4400,
    "reqCount": 20
  },
  {
    "id": "glacier",
    "emoji": "🧊",
    "label": "Glacier",
    "className": "bg-gradient-to-b from-cyan-50 via-sky-200 to-blue-500 text-blue-950",
    "price": 4450,
    "reqCount": 21
  },
  {
    "id": "northern_lights",
    "emoji": "🌌",
    "label": "Northern",
    "className": "bg-gradient-to-r from-slate-950 via-emerald-700 to-indigo-900 text-emerald-100",
    "price": 4500,
    "reqCount": 21
  },
  {
    "id": "crystal_cave",
    "emoji": "💎",
    "label": "Gem Cave",
    "className": "bg-gradient-to-br from-cyan-300 via-indigo-300 to-purple-600 text-indigo-950",
    "price": 4550,
    "reqCount": 21
  },
  {
    "id": "underground",
    "emoji": "⛏️",
    "label": "Underground",
    "className": "bg-gradient-to-b from-stone-500 via-zinc-800 to-black text-stone-200",
    "price": 4600,
    "reqCount": 21
  },
  {
    "id": "treasure_room",
    "emoji": "💰",
    "label": "Treasure",
    "className": "bg-gradient-to-br from-yellow-200 via-amber-500 to-orange-900 text-yellow-950",
    "price": 4650,
    "reqCount": 22
  },
  {
    "id": "dojo",
    "emoji": "🥋",
    "label": "Training",
    "className": "bg-gradient-to-b from-red-200 via-stone-100 to-slate-800 text-red-950",
    "price": 4700,
    "reqCount": 22
  },
  {
    "id": "arena",
    "emoji": "🏟️",
    "label": "Arena",
    "className": "bg-gradient-to-t from-green-700 via-stone-300 to-sky-300 text-green-950",
    "price": 4750,
    "reqCount": 22
  },
  {
    "id": "raceway",
    "emoji": "🏁",
    "label": "Raceway",
    "className": "bg-gradient-to-br from-zinc-900 via-red-700 to-yellow-400 text-yellow-100",
    "price": 4800,
    "reqCount": 22
  },
  {
    "id": "airship",
    "emoji": "🎈",
    "label": "Airship",
    "className": "bg-gradient-to-b from-sky-200 via-blue-300 to-indigo-400 text-blue-950",
    "price": 4850,
    "reqCount": 23
  },
  {
    "id": "cloud_castle",
    "emoji": "☁️",
    "label": "Cloud Keep",
    "className": "bg-gradient-to-br from-white via-sky-100 to-violet-200 text-slate-700",
    "price": 4900,
    "reqCount": 23
  },
  {
    "id": "sky_bridge",
    "emoji": "🌁",
    "label": "Sky Bridge",
    "className": "bg-gradient-to-r from-cyan-100 via-slate-200 to-blue-300 text-slate-800",
    "price": 4950,
    "reqCount": 23
  },
  {
    "id": "dragon_peak",
    "emoji": "⛰️",
    "label": "Dragon Peak",
    "className": "bg-gradient-to-b from-stone-300 via-emerald-600 to-red-900 text-stone-100",
    "price": 5000,
    "reqCount": 23
  },
  {
    "id": "time_portal",
    "emoji": "🌀",
    "label": "Portal",
    "className": "bg-gradient-to-tr from-cyan-400 via-violet-700 to-black text-cyan-100",
    "price": 5050,
    "reqCount": 24
  },
  {
    "id": "dreamscape",
    "emoji": "💤",
    "label": "Dreamscape",
    "className": "bg-gradient-to-br from-indigo-200 via-pink-200 to-yellow-100 text-indigo-950",
    "price": 5100,
    "reqCount": 24
  },
  {
    "id": "mirror_world",
    "emoji": "🪞",
    "label": "Mirror",
    "className": "bg-gradient-to-r from-slate-200 via-cyan-100 to-slate-400 text-slate-900",
    "price": 5150,
    "reqCount": 24
  },
  {
    "id": "spellbook",
    "emoji": "📖",
    "label": "Spellbook",
    "className": "bg-gradient-to-b from-purple-200 via-indigo-400 to-slate-900 text-purple-50",
    "price": 5200,
    "reqCount": 24
  },
  {
    "id": "rainbow_road",
    "emoji": "🌈",
    "label": "Rainbow Rd",
    "className": "bg-gradient-to-r from-red-400 via-yellow-300 via-green-300 via-blue-400 to-purple-500 text-white",
    "price": 5250,
    "reqCount": 25
  },
  {
    "id": "prism",
    "emoji": "🔺",
    "label": "Prism",
    "className": "bg-gradient-to-tr from-rose-200 via-cyan-200 to-amber-200 text-slate-900",
    "price": 5300,
    "reqCount": 25
  }
];
