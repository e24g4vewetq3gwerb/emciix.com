import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const ledgerPath = "calls/ledger.json";
const listUrl = "https://firestore.googleapis.com/v1/projects/emciix-com/databases/(default)/documents/galacticCalls?pageSize=100";

function readLedger() {
  try {
    const data = JSON.parse(readFileSync(ledgerPath, "utf8"));
    return {
      since: Number(data.since) || 0,
      calls: Array.isArray(data.calls) ? data.calls : [],
    };
  } catch {
    return { since: 0, calls: [] };
  }
}

// Mirror of the screen in portal/galactic-call.js (keep in sync) so explicit, hateful or link entries never reach the public ledger.
// ---- Strict safe search + no links -------------------------------------------------------------
// Invidious (YouTube channel search) has no SafeSearch/Restricted Mode switch, so every query and every
// result is screened here. X posts carry X's own possibly_sensitive flag, which is honoured as well.
// Text is normalised first: invisible characters stripped, NFKC (fullwidth/styled letters), accents
// removed, Cyrillic/Greek/small-cap/emoji-letter homoglyphs mapped, leetspeak mapped, url-escapes decoded.
// Terms match with repeated letters (seeexxx) and fully spaced/punctuated spellings (s e x, s.e.x, p-o-r-n).
var SAFE_WORDS = [
  // English: sexual / adult
  "sex", "sexy", "sexting", "sexcam", "sexcams", "seggs", "segs", "secks", "porn", "porno", "pornz", "pron", "prawn porn", "xxx", "nsfw", "nsfl", "nude", "nudes", "nudez", "noods", "noodz", "nudies", "nudity", "nudist", "naked", "boob", "boobs", "boobies", "tits", "titty", "titties", "tiddies", "pussy", "cock", "cocks", "dick", "dicks", "dickpic", "cum", "cumming", "cumshot", "cunt", "blowjob", "handjob", "footjob", "anal", "milf", "dilf", "fetish", "bdsm", "bondage", "erotic", "erotica", "hentai", "hentia", "ecchi", "ahegao", "futanari", "futa", "lewd", "lewds", "rule34", "r34", "camgirl", "cam girl", "cam girls", "cam show", "webcam girl", "webcam girls", "stripper", "strippers", "striptease", "strip club", "stripclub", "horny", "slut", "sluts", "whore", "whores", "hooker", "hookers", "escorts", "escort girl", "escort girls", "escort service", "call girl", "call girls", "prostitute", "prostitutes", "prostitution", "fuck", "fucks", "fucking", "fucked", "fucker", "fuk", "fuq", "fck", "fcking", "phuck", "phuk", "orgasm", "dildo", "incest", "gangbang", "threesome", "lingerie", "onlyfans", "onlyfan", "only fans", "only fan", "fansly", "xnxx", "xvideos", "xhamster", "pornhub", "redtube", "youporn", "brazzers", "chaturbate", "stripchat", "bangbros", "hardcore", "softcore", "uncensored", "playboy", "hot video", "hot videos", "blue film", "adult video", "adult videos", "adult content", "18 plus", "booty", "ass", "asses", "butt", "twerk", "twerking", "vagina", "vulva", "penis", "nipple", "nipples", "panties", "upskirt", "cleavage", "busty", "thot", "thots", "desi bhabhi", "lesbian kiss", "lesbian kissing", "big ass", "feet lover", "foot lover", "feet pics", "kinky", "squirt", "creampie", "deepthroat", "bukkake", "stepsis", "step sis", "barely legal", "18yo", "jailbait", "loli", "lolicon", "shota", "shotacon", "pthc", "spicy accountant", "spicy content", "thirst trap", "leaked of", "of leaks", "nutaku", "camsoda", "myfreecams", "manyvids", "clips4sale", "spankbang", "eporner", "youjizz", "tube8", "jav", "ullu", "kooku", "primeshots", "gandi baat", "mms scandal", "desi mms", "pinay scandal",
  // Spanish / Portuguese / French / Italian / German
  "sexo", "desnuda", "desnudas", "desnudo", "desnudos", "tetas", "culo", "putas", "puta", "puto", "cono", "follar", "follando", "cachonda", "cachondas", "prostituta", "prostitutas", "mamada", "verga", "chicas calientes", "encuerada", "pornografia", "pelada", "peladas", "pelado", "nua", "nuas", "buceta", "bucetas", "putaria", "gostosa", "gostosas", "porra", "foda", "fodendo", "safada", "safadas", "piroca", "caralho", "sexe", "nue", "nues", "seins nus", "salope", "salopes", "baise", "baiseuse", "pute", "putes", "branlette", "coquine", "coquines", "nichons", "encule", "partouze", "sodomie", "fellation", "nackt", "fotze", "ficken", "nuda", "nude", "scopata", "troia",
  // Hinglish / Bangla (romanised) / Tagalog / Indonesian
  "chudai", "choot", "gaand", "nangi", "chodna", "chod", "bhosdi", "bhosdike", "madarchod", "behenchod", "bhenchod", "choti", "bangla choti", "chuda", "choda", "chodachudi", "khanki", "kantot", "kantutan", "iyot", "hubad", "jakol", "pekpek", "tite", "burat", "libog", "malibog", "pokpok", "bokep", "ngentot", "entot", "memek", "kontol", "telanjang", "bugil", "colmek",
  // Violence / gore / self-harm
  "gore video", "gore videos", "real gore", "extreme gore", "gore compilation", "gore site", "beheading", "beheadings", "beheaded", "behead", "decapitation", "decapitated", "dismember", "dismembered", "dismemberment", "snuff", "bestgore", "real death", "death video", "murder video", "execution video", "suicide video", "live suicide", "necrophilia", "torture video", "kill myself", "kill yourself", "kys", "suicide method", "suicide methods", "self harm", "how to make a bomb",
  // Drugs
  "cocaine", "heroin", "meth", "methamphetamine", "crystal meth", "fentanyl", "mdma", "oxycodone", "ketamine", "buy weed", "buy drugs", "smoke crack", "crack pipe",
  // Hate slurs / hate phrases
  "nigger", "niggers", "nigga", "niggas", "nigguh", "negro", "faggot", "faggots", "fag", "fags", "retard", "retards", "retarded", "chink", "chinks", "spic", "spics", "kike", "kikes", "tranny", "trannies", "wetback", "wetbacks", "gook", "gooks", "beaner", "beaners", "towelhead", "raghead", "sandnigger", "paki", "pakis", "heil hitler", "sieg heil", "white power", "gas the jews", "kill all jews", "kill all muslims", "kkk", "white genocide"
];
// Unique strings matched anywhere once everything but letters is removed (catches p o r n, x-n-x-x, pornhub.fr ...).
var SAFE_PARTS = ["porn", "xnxx", "xvideo", "xhamster", "pornhub", "redtube", "youporn", "onlyfans", "brazzers", "chaturbate", "stripchat", "hentai", "nsfw", "blowjob", "cumshot", "gangbang", "masturbat", "sexvideo", "sexyvideo", "xxxvideo", "nudevideo", "naughtyamerica", "realitykings", "bangbros", "digitalplayground", "evilangel", "julesjordan", "teamskeet", "fakehub", "puretaboo", "adulttime", "livejasmin", "bongacams", "myfreecams", "camsoda", "manyvids", "clips4sale", "spankbang", "eporner", "youjizz", "fansly", "justforfans", "loyalfans", "fancentro", "sandnigger", "jailbait", "lolicon", "shotacon", "bestgore", "feetgirl", "footgirl", "feetfetish", "footfetish", "feetworship", "footworship", "feetmodel", "solesgirl"];
// Known adult-brand accounts (exact X handles).
var SAFE_HANDLES = ["vixen", "blacked", "blackedraw", "tushy", "tushyraw", "deeper", "slayed", "milfy", "vixenplus", "naughtyamerica", "realitykings", "mofos", "bangbros", "brazzers", "evilangel", "digitalplayground", "penthouse", "hustler", "wickedpictures", "kink", "kinkcom", "teamskeet", "nubiles", "fakehub", "privatecom", "julesjordan", "adulttime", "puretaboo", "girlsway", "dorcel", "marcdorcel", "camsoda", "myfreecams", "manyvids", "clips4sale", "chaturbate", "stripchat", "bongacams", "livejasmin", "onlyfans", "fansly", "justforfans", "loyalfans", "fancentro", "pornhub", "xvideos", "xhamster", "xnxx", "spankbang", "eporner", "redtube", "youporn", "avn", "xbiz", "playboy", "playboyplus"];
var SAFE_COMBOS = [
  /(?:^|[^a-z0-9])(?:hot|sexy|bold|naked|nude|spicy) (?:[a-z0-9]+ )?(?:girl|girls|gf|woman|women|lady|ladies|babe|babes|aunty|auntie|aunties|bhabhi|bhabi|maid|maids|diva|divas|wife|wives|teen|teens|model|models|kiss|kisses|kissing|reel|reels|actress|actresses|mom|moms|mommy)(?![a-z0-9])/,
  /(?:^|[^a-z0-9])(?:hot|sexy|bold|naked|nude|spicy|uncut) (?:video|videos|film|films|clip|clips|scene|scenes|photo|photos|pic|pics|dance|dances|body|figure|romance|web series|webseries)(?![a-z0-9])/,
  /(?:^|[^a-z0-9])(?:desi|romantic|hot|sexy|bold) (?:[a-z]+ )?(?:bhabhi|bhabi|aunty|auntie|aunties)(?![a-z0-9])/,
  /(?:^|[^a-z0-9])(?:hot|bold|uncut|romantic|adult|erotic) (?:hindi |indian |desi )?web ?series(?![a-z0-9])/,
  /(?:^|[^a-z0-9])how to (?:kill|hurt|cut) (?:myself|yourself|someone|people|a person)(?![a-z0-9])/,
  /(?:^|[^a-z0-9])how to (?:make|cook|buy) (?:meth|crack|cocaine|heroin|fentanyl|drugs|a bomb|bombs)(?![a-z0-9])/,
  /^\W*(?:gore|gory|sx)\W*$/,
  /(?:^|[^a-z0-9])(?:hot|xx|desi|indian) sx(?![a-z0-9])|(?:^|[^a-z0-9])sx (?:film|films|video|videos|movie|girl|girls|clip|clips)(?![a-z0-9])/,
  /(?:^|[^a-z0-9])ru[l1i]+[e3]*\W?34(?![0-9])/,
  /(?:^|[^a-z0-9])(?:feet|foot|barefoot|soles|toes) (?:girl|girls|model|models|worship|tease|lover|lovers|fetish|pics|mom|queen|goddess|domination)(?![a-z0-9])/,
  /(?:^|[^a-z0-9])(?:f[*#@%$!?.]{1,2}(?:ck|k)|s[*#@%]x|p[*#@%]{1,2}(?:rn|n)|p[o0][*#@%]n|d[*#@%]ck|c[*#@%]ck|c[*#@%]nt|n[*#@%]{1,2}(?:gg|g)(?:a|er)s?|f[*#@%]g(?:got)?)(?![a-z0-9])/
];
// Non-Latin scripts. Parts: substring (CJK has no word breaks). Words: whole word. Stems: word start.
var INTL_PARTS = ["ポルノ", "アダルト", "セックス", "無修正", "ヌード", "変態", "av女優", "おっぱい", "巨乳", "全裸", "裸体", "痴漢", "中出し", "風俗", "援交", "エロ動画", "エロい", "エロ画像", "야동", "섹스", "포르노", "성인방송", "야한", "누드", "보지", "자지", "벗방", "19금", "노출방송", "조건만남", "색정", "色情", "性爱", "性愛", "做爱", "做愛", "裸体", "裸體", "黄片", "黃片", "毛片", "三级片", "三級片", "口交", "妓女", "成人视频", "成人影片", "约炮", "約炮", "自慰", "av女优", "无码", "無碼", "肏", "屄", "鸡巴", "雞巴", "порно", "секс", "эротик", "хентай", "онлифанс", "سكس", "اباحي", "إباحي", "اباحية", "إباحية", "بورن", "شرموطة", "شراميط", "سيكس", "सेक्स", "चुदाई", "पोर्न", "ब्लू फिल्म", "সেক্স", "চুদা", "চোদা", "পর্ন", "চটি"];
var INTL_WORDS = ["エロ", "голая", "голые", "голых", "голый", "шлюха", "шлюхи", "сиськи", "минет", "проститутка", "проститутки", "نيك", "عارية", "عاريات", "زب", "كس", "चूत", "लंड", "रंडी", "नंगी", "नंगा", "नग्न", "মাগী", "খানকি", "নগ্ন", "চুদি"];
var INTL_STEMS = ["трах", "ебат", "ебал", "ебля", "выеб", "дроч", "пизд", "хуй"];
// Harmless phrases that contain a listed word; removed before matching.
var SAFE_ALLOW = ["al gore", "gore tex", "goretex", "gore vidal", "lesley gore", "cum laude", "summa cum laude", "magna cum laude", "moby dick", "philip k dick", "dick s sporting goods", "dicks sporting goods", "dick van dyke", "dick tracy", "dick cheney", "dick clark", "john lee hooker", "hooker valley", "butt head", "beavis and butt head", "kick ass", "jackass", "sex pistols x", "meth lab x"];
var SAFE_EMOJI = /\u{1F51E}|\u{1F346}|(?:\u{1F351}|\u{1F445}|\u{1F975}|\u{1F352}|\u{1F608}|\u{1F924})[\s\S]{0,6}\u{1F4A6}|\u{1F4A6}[\s\S]{0,6}(?:\u{1F351}|\u{1F445}|\u{1F975}|\u{1F352}|\u{1F608}|\u{1F924})|\u{1F445}[\s\S]{0,6}\u{1F351}|\u{1F351}[\s\S]{0,6}\u{1F445}/u;
var HOMOGLYPHS = { "а": "a", "в": "b", "е": "e", "ё": "e", "к": "k", "м": "m", "н": "h", "о": "o", "р": "p", "с": "c", "т": "t", "у": "y", "х": "x", "ѕ": "s", "і": "i", "ї": "i", "ј": "j", "ԁ": "d", "ԛ": "q", "ԝ": "w", "ɡ": "g", "α": "a", "β": "b", "ε": "e", "η": "n", "ι": "i", "κ": "k", "ν": "v", "ο": "o", "ρ": "p", "τ": "t", "υ": "u", "χ": "x", "ω": "w", "ᴀ": "a", "ʙ": "b", "ᴄ": "c", "ᴅ": "d", "ᴇ": "e", "ꜰ": "f", "ɢ": "g", "ʜ": "h", "ɪ": "i", "ᴊ": "j", "ᴋ": "k", "ʟ": "l", "ᴍ": "m", "ɴ": "n", "ᴏ": "o", "ᴘ": "p", "ǫ": "q", "ʀ": "r", "ꜱ": "s", "ᴛ": "t", "ᴜ": "u", "ᴠ": "v", "ᴡ": "w", "ʏ": "y", "ᴢ": "z", "×": "x", "ⅹ": "x", "ı": "i", "ł": "l", "ø": "o", "đ": "d", "ß": "ss", "æ": "ae", "œ": "oe", "þ": "p" };
var INVISIBLE = /[\u00ad\u034f\u061c\u115f\u1160\u17b4\u17b5\u180b-\u180e\u200b-\u200f\u202a-\u202e\u2060-\u206f\u3164\ufe00-\ufe0f\ufeff\uffa0]|\udb40[\udc00-\udc7f]/g;
function safeRx(term) {
  var runs = term.match(/([a-z0-9])\1*|[^a-z0-9]+/g) || [];
  var tight = "", spaced = "", letters = 0;
  runs.forEach(function (run) {
    if (/^[a-z0-9]/.test(run)) {
      letters++;
      var one = run.charAt(0) + (run.length > 1 ? "{" + run.length + ",}" : "+");
      tight += one;
      spaced += (spaced ? "[^a-z0-9]{1,3}" : "") + run.split("").join("[^a-z0-9]{1,3}").replace(/([a-z0-9])(?=$)/, "$1+");
    } else {
      tight += "[^a-z0-9]+";
      spaced += "[^a-z0-9]+";
    }
  });
  var body = letters >= 3 && term.indexOf(" ") < 0 ? "(?:" + tight + "|" + spaced + ")" : tight;
  return new RegExp("(?:^|[^a-z0-9])" + body + "(?:e?s+|z+)?(?![a-z0-9])");
}
var SAFE_RX = SAFE_WORDS.map(safeRx);
var ALLOW_RX = SAFE_ALLOW.map(function (p) { return new RegExp("(^|[^a-z0-9])" + p.replace(/ /g, "[^a-z0-9]*") + "(?![a-z0-9])", "g"); });
function intlBound(word, stem) {
  try { return new RegExp("(?:^|[^\\p{L}\\p{M}\\p{N}])" + word + (stem ? "" : "(?![\\p{L}\\p{M}\\p{N}])"), "u"); } catch (err) { return new RegExp(word); }
}
var INTL_RX = INTL_WORDS.map(function (w) { return intlBound(w, false); }).concat(INTL_STEMS.map(function (w) { return intlBound(w, true); }));
function mapChars(text) {
  var out = "";
  for (var i = 0; i < text.length; i++) {
    var code = text.codePointAt(i);
    var ch = String.fromCodePoint(code);
    if (code > 0xffff) i++;
    if (code >= 0x1f1e6 && code <= 0x1f1ff) out += String.fromCharCode(97 + code - 0x1f1e6);
    else if (code >= 0x1f170 && code <= 0x1f189) out += String.fromCharCode(97 + code - 0x1f170);
    else if (code >= 0x1f150 && code <= 0x1f169) out += String.fromCharCode(97 + code - 0x1f150);
    else out += HOMOGLYPHS[ch] || ch;
  }
  return out;
}
function plainText(value) {
  var text = String(value || "").replace(INVISIBLE, "");
  if (/%[0-9a-f]{2}/i.test(text)) { try { text = text + " " + decodeURIComponent(text.replace(/\+/g, " ")); } catch (err) {} }
  try { text = text.normalize("NFKC").toLowerCase().normalize("NFKD").replace(/([a-z])[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]+/g, "$1").normalize("NFC"); } catch (err) { text = text.toLowerCase(); }
  return text;
}
function leetText(text) {
  return text.replace(/[0@4]/g, function (c) { return c === "0" ? "o" : "a"; }).replace(/[$5§]/g, "s").replace(/[3€]/g, "e").replace(/[1!|]/g, "i").replace(/7/g, "t").replace(/¢/g, "c");
}
function safeForms(raw) {
  var plain = plainText(raw);
  var mapped = mapChars(plain);
  var forms = [plain, mapped, leetText(mapped)];
  return forms.map(function (form) {
    for (var a = 0; a < ALLOW_RX.length; a++) form = form.replace(ALLOW_RX[a], "$1 ");
    return form;
  });
}
function isExplicit() {
  for (var a = 0; a < arguments.length; a++) {
    var raw = String(arguments[a] || "");
    if (!raw) continue;
    var bare = raw.replace(INVISIBLE, "");
    if (SAFE_EMOJI.test(bare)) return true;
    var forms = safeForms(raw);
    if (/(^|[^a-z0-9])18\s*\+/.test(forms[1]) || /(^|[^a-z0-9])x{3,}($|[^a-z0-9])/.test(forms[1]) || /(^|[^0-9])14\W?88($|[^0-9])/.test(forms[0])) return true;
    for (var p = 0; p < INTL_PARTS.length; p++) if (forms[0].indexOf(INTL_PARTS[p]) >= 0) return true;
    for (var n = 0; n < INTL_RX.length; n++) if (INTL_RX[n].test(forms[0])) return true;
    for (var f = 0; f < forms.length; f++) {
      var form = forms[f];
      for (var w = 0; w < SAFE_RX.length; w++) if (SAFE_RX[w].test(form)) return true;
      for (var c = 0; c < SAFE_COMBOS.length; c++) if (SAFE_COMBOS[c].test(form.replace(/[^a-z0-9*#@%$!?.]+/g, " "))) return true;
      var packed = form.replace(/[^a-z]+/g, "");
      for (var q = 0; q < SAFE_PARTS.length; q++) if (packed.indexOf(SAFE_PARTS[q]) >= 0) return true;
    }
  }
  return false;
}
function isAdultHandle(handle) {
  return SAFE_HANDLES.indexOf(String(handle || "").replace(/^@/, "").toLowerCase()) >= 0;
}
// No links: scheme://, hxxp, www., bare domain.tld (also "dot com", spaced/bracketed/unicode dots,
// url-escapes), javascript:/data: style schemes, IPv4/IPv6 and localhost.
var LINK_TLDS = "com|net|org|edu|gov|mil|int|io|co|app|dev|xyz|info|biz|site|online|live|link|links|club|shop|store|blog|news|page|art|one|fun|click|win|vip|pro|mobi|name|tech|space|website|zip|mov|lol|wtf|porn|sex|xxx|adult|onion|top|red|blue|pink|video|watch|stream|social|chat|games|game|media|music|world|today|life|cloud|host|email|network|digital|agency|studio|design|codes|download|free|gay|sexy|tube|cam|webcam|dating|bet|casino|poker|men|work|works|best|cool|rocks|ninja|guru|wiki|help|photo|photos|pics|pictures|gallery|land|city|country|global|group|team|systems|services|solutions|company|finance|money|cash|loan|market|trade|exchange|crypto|nft|bot|run|now|new|plus|lat|asia|cyou|icu|buzz|monster|quest|sbs|cfd|rest|bar|uno|mom|lgbt|love|date|fans|tips|ai|ac|ad|ae|af|ag|ai|al|am|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw";
var LINK_BARE = new RegExp("(^|[^a-z0-9-])[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\\.(?:" + LINK_TLDS + ")(?![a-z0-9-])");
var LINK_NARROW = "com|net|org|io|xyz|ru|biz|ly";
function linkText(raw) {
  var text = String(raw || "").replace(INVISIBLE, "");
  if (/%[0-9a-f]{2}/i.test(text)) { try { text = text + " " + decodeURIComponent(text); } catch (err) {} }
  try { text = text.normalize("NFKC"); } catch (err) {}
  text = mapChars(text.toLowerCase());
  text = text.replace(/[\u3002\uff0e\uff61\u2024\u2e33\u00b7\u2219\u22c5\u2022\u2027\ufe52\u0701\u0702\u06d4]/g, ".").replace(/[\uff0f\u2044\u2215\u29f8]/g, "/");
  text = text.replace(/\s*[\[\(\{<]\s*(?:\.|dot|d0t)\s*[\]\)\}>]\s*/g, ".").replace(/\s*[\[\(\{]\s*:\s*[\]\)\}]\s*/g, ":");
  text = text.replace(new RegExp("\\s*(?:\\.|\\bdot\\b|\\bd0t\\b)\\s*(?=(?:" + LINK_NARROW + ")(?![a-z0-9]))", "g"), function (m) { return /\S\s*$/.test(m) || /\s/.test(m) ? "." : m; });
  text = text.replace(/\bh(?:tt|xx|\*\*|t\*|\*t|x\*|\*x|xt|tx)p(s?)\b/g, "http$1");
  return text;
}
function hasLink() {
  for (var a = 0; a < arguments.length; a++) {
    var raw = String(arguments[a] || "");
    if (!raw) continue;
    var text = linkText(raw);
    if (/[a-z][a-z0-9+.-]*\s*:\s*\/\s*\//.test(text) || /\bhttps?\s*[:;]/.test(text)) return true;
    if (/(^|[^a-z0-9])(?:javascript|vbscript|data|file|mailto|blob|intent|about|tel|sms|itms-apps|market|ftp)\s*:\s*\S/.test(text)) return true;
    if (/(^|[^a-z0-9])www\d{0,3}\s*\./.test(text) || new RegExp("(^|[^a-z0-9])www\\s+[a-z0-9-]+\\s+(?:" + LINK_NARROW + ")(?![a-z0-9])").test(text) || /(^|[^a-z0-9])xn--/.test(text)) return true;
    if (/(^|[^0-9.])\d{1,3}(?:\s*\.\s*\d{1,3}){3}(?![0-9])/.test(text) || /\[[0-9a-f:]{3,}\]/.test(text) || /(^|[^a-z0-9])localhost(?![a-z0-9])/.test(text)) return true;
    if (/(^|[^a-z0-9-])[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?::\d+)?\//.test(text)) return true;
    if (new RegExp("(^|[^a-z0-9-])[a-z0-9-]{2,}\\s+(?:" + LINK_NARROW + ")\\s*/").test(text)) return true;
    if (LINK_BARE.test(text)) return true;
  }
  return false;
}
function queryOf(url) {
  try { const u = new URL(String(url || "")); return u.searchParams.get("search_query") || u.searchParams.get("q") || ""; } catch { return ""; }
}

function keep(list) {
  const best = new Map();
  list
    .filter((row) => row && row.handle && row.handle !== "x" && row.handle !== "ledgerprobe" && row.handle !== "probe2" && row.handle !== "smoketest")
    .filter((row) => !isExplicit(row.handle, row.name, row.post, queryOf(row.url)) && !isAdultHandle(row.handle))
    .filter((row) => !hasLink(row.handle, row.name, row.post))
    .forEach((row) => {
      row.at = Number(row.at) || 0;
      const id = String(row.handle).replace(/^@/, "").toLowerCase();
      if (!id) return;
      const urlName = String(row.url || "").match(/(?:x|twitter|fxtwitter)\.com\/([^/?#]+)\/status\//i);
      if (urlName && urlName[1].toLowerCase() !== id) return;
      const prev = best.get(id);
      if (!prev || row.at >= prev.at) best.set(id, row);
    });
  // No links in the public ledger: the url field is dropped (the call display is text only).
  return [...best.values()].map((row) => ({ ...row, url: "" })).sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 20);
}

const res = await fetch(listUrl);
let data = { documents: [] };
if (!res.ok) {
  console.log("firestore list", res.status, (await res.text()).slice(0, 240));
} else {
  data = await res.json();
}
const found = [];
if (process.env.CALL_JSON && process.env.CALL_JSON !== "null") {
  try {
    const extra = JSON.parse(process.env.CALL_JSON);
    if (extra && extra.handle) found.push(extra);
  } catch {}
}
try {
  const inbox = await fetch("https://ntfy.sh/emciix-galactic-ledger-9f3c/json?poll=1&since=12h");
  const text = await inbox.text();
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      if (!msg || msg.event !== "message" || !msg.message) continue;
      const extra = JSON.parse(msg.message);
      if (extra && extra.handle) found.push(extra);
    } catch {}
  }
} catch (err) {
  console.log("inbox", String(err).slice(0, 180));
}
for (const doc of data.documents || []) {
  if (String(doc.name || "").endsWith("/board")) continue;
  const fields = doc.fields || {};
  const handle = fields.handle && fields.handle.stringValue || "";
  if (!handle) continue;
  found.push({
    handle,
    name: (fields.name && fields.name.stringValue) || handle,
    avatar: (fields.avatar && fields.avatar.stringValue) || "",
    post: (fields.post && fields.post.stringValue) || "",
    url: (fields.url && fields.url.stringValue) || "",
    at: fields.at && fields.at.integerValue != null ? Number(fields.at.integerValue) || 0 : 0,
  });
}
const saved = readLedger();
const incoming = found.filter((row) => !saved.since || Number(row.at) >= saved.since);
const calls = keep(incoming.concat(saved.calls));
const next = JSON.stringify({ since: saved.since, calls }, null, 2) + "\n";
mkdirSync("calls", { recursive: true });
let prev = "";
try { prev = readFileSync(ledgerPath, "utf8"); } catch {}
if (prev === next) {
  console.log("ledger unchanged", calls.length);
  process.exit(0);
}
writeFileSync(ledgerPath, next);
console.log("ledger", calls.map((row) => row.handle).join(","));
