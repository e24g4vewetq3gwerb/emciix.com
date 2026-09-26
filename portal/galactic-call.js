    (function () {
      var form = document.getElementById("galacticCall");
      var input = document.getElementById("callerProfile");
      var ask = document.getElementById("galacticAsk");
      if (!form || !input) return;
      var photo = document.getElementById("callerPhoto");
      var yt = document.getElementById("callerYt");
      var refresh = document.getElementById("callerRefresh");
      var key = "emciix-caller-profile";
      var source = "";
      var mode = "x";
      var heldName = "";
      var heldAvatar = "";
      // ---- Strict safe search + no links -------------------------------------------------------------
      // Invidious (YouTube channel search) has no SafeSearch/Restricted Mode switch, so every query and every
      // result is screened here. X posts carry X's own possibly_sensitive flag, which is honoured as well.
      // Text is normalised first: invisible characters stripped, NFKC (fullwidth/styled letters), accents
      // removed, Cyrillic/Greek/small-cap/emoji-letter homoglyphs mapped, leetspeak mapped, url-escapes decoded.
      // Terms match with repeated letters (seeexxx) and fully spaced/punctuated spellings (s e x, s.e.x, p-o-r-n).
      var SAFE_WORDS = [
        // English: sexual / adult
        "sex", "sexy", "sexting", "sexcam", "sexcams", "seggs", "segs", "secks", "porn", "porno", "pornz", "pron", "prawn porn", "xxx", "nsfw", "nsfl", "nude", "nudes", "nudez", "noods", "nudies", "nudity", "nudist", "naked", "boob", "boobs", "boobies", "tits", "titty", "titties", "tiddies", "pussy", "cock", "cocks", "dick", "dicks", "dickpic", "cum", "cumming", "cumshot", "cunt", "blowjob", "handjob", "footjob", "anal", "milf", "dilf", "fetish", "bdsm", "bondage", "erotic", "erotica", "hentai", "hentia", "ecchi", "ahegao", "futanari", "futa", "lewd", "lewds", "rule34", "r34", "camgirl", "cam girl", "cam girls", "cam show", "webcam girl", "webcam girls", "stripper", "strippers", "striptease", "strip club", "stripclub", "horny", "slut", "sluts", "whore", "whores", "hooker", "hookers", "escorts", "escort girl", "escort girls", "escort service", "call girl", "call girls", "prostitute", "prostitutes", "prostitution", "fuck", "fucks", "fucking", "fucked", "fucker", "fuk", "fuq", "fck", "fcking", "phuck", "phuk", "orgasm", "dildo", "incest", "gangbang", "threesome", "lingerie", "onlyfans", "onlyfan", "only fans", "only fan", "fansly", "xnxx", "xvideos", "xhamster", "pornhub", "redtube", "youporn", "brazzers", "chaturbate", "stripchat", "bangbros", "hardcore", "softcore", "uncensored", "playboy", "hot video", "hot videos", "blue film", "adult video", "adult videos", "adult content", "18 plus", "booty", "ass", "asses", "butt", "twerk", "twerking", "vagina", "vulva", "penis", "nipple", "nipples", "panties", "upskirt", "cleavage", "busty", "thot", "thots", "desi bhabhi", "lesbian kiss", "lesbian kissing", "big ass", "feet lover", "foot lover", "feet pics", "kinky", "squirt", "creampie", "deepthroat", "bukkake", "stepsis", "step sis", "barely legal", "18yo", "jailbait", "loli", "lolicon", "shota", "shotacon", "pthc", "spicy accountant", "spicy content", "thirst trap", "leaked of", "of leaks", "nutaku", "camsoda", "myfreecams", "manyvids", "clips4sale", "spankbang", "eporner", "youjizz", "tube8", "jav", "ullu", "kooku", "primeshots", "gandi baat", "mms scandal", "desi mms", "pinay scandal",
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
      var SAFE_PARTS = ["porn", "xnxx", "xvideo", "xhamster", "pornhub", "redtube", "youporn", "onlyfans", "brazzers", "chaturbate", "stripchat", "hentai", "nsfw", "blowjob", "cumshot", "gangbang", "masturbat", "sexvideo", "sexyvideo", "xxxvideo", "nudevideo", "naughtyamerica", "realitykings", "bangbros", "digitalplayground", "evilangel", "julesjordan", "teamskeet", "fakehub", "puretaboo", "adulttime", "livejasmin", "bongacams", "myfreecams", "camsoda", "manyvids", "clips4sale", "spankbang", "eporner", "youjizz", "fansly", "justforfans", "loyalfans", "fancentro", "sandnigger", "jailbait", "lolicon", "shotacon", "bestgore"];
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
        // Only the human-typed part of a link is screened (e.g. a YouTube search_query), not random video/post ids.
        try { var u = new URL(String(url || "")); return u.searchParams.get("search_query") || u.searchParams.get("q") || ""; } catch (err) { return ""; }
      }
      function safeCard(card) {
        if (!card) return card;
        return isExplicit(card.name, card.title, card.post, card.handle, card.label, card.source, queryOf(card.url), card.description) ? null : card;
      }
      window.emciixIsExplicit = isExplicit;
      window.emciixHasLink = hasLink;
      function paint(card) {
        card = card || {};
        if (card.source) {
          source = card.source;
          form.setAttribute("data-query", card.source);
          if (refresh) refresh.setAttribute("data-handle", card.source);
          try { localStorage.setItem("emciix-x-handle", card.source); } catch (err) {}
        }
        if (card.title) input.value = card.title;
        if (card.post) input.setAttribute("data-title", card.post);
        else if (card.title) input.setAttribute("data-title", card.title);
        if (card.name) heldName = card.name;
        else if (!card.keepName) heldName = "";
        var shown = card.label || heldName || "Have Fun";
        if (shown === "Galactic call:" || shown === "Galactic call") shown = heldName || "Have Fun";
        if (ask) ask.textContent = shown;
        if (card.avatar) heldAvatar = card.avatar;
        else if (!card.keepPhoto) heldAvatar = "";
        if (photo) {
          photo.classList.toggle("is-on", mode !== "youtube");
          photo.classList.toggle("has-photo", mode !== "youtube" && !!heldAvatar);
          photo.style.backgroundImage = mode !== "youtube" && heldAvatar ? "url(\"" + String(heldAvatar).replace(/"/g, "") + "\")" : "";
          photo.textContent = "";
        }
        if (yt) {
          yt.classList.toggle("is-on", mode === "youtube");
          yt.classList.toggle("has-photo", mode === "youtube" && !!heldAvatar);
          yt.style.backgroundImage = mode === "youtube" && heldAvatar ? "url(\"" + String(heldAvatar).replace(/"/g, "") + "\")" : "";
          yt.textContent = "";
        }
        try {
          localStorage.setItem(key, JSON.stringify({ title: input.value, name: heldName, avatar: heldAvatar, source: source, label: ask ? ask.textContent : "Have Fun" }));
        } catch (err) {}
        form.classList.add("is-saved");
      }
      try {
        var saved = JSON.parse(localStorage.getItem(key) || "null");
        if (saved && typeof saved === "object" && safeCard(saved) && !hasLink(saved.title, saved.name, saved.label, saved.source)) paint(saved);
        else if (typeof saved === "string" && saved && !isExplicit(saved) && !hasLink(saved)) paint({ title: saved });
      } catch (e) {
        try {
          var plain = localStorage.getItem(key);
          if (plain && plain.charAt(0) !== "{" && !isExplicit(plain) && !hasLink(plain)) paint({ title: plain });
        } catch (err) {}
      }
      function focusEmpty() {
        input.focus();
      }
      if (ask) ask.addEventListener("click", focusEmpty);
      form.addEventListener("click", function (event) {
        if (event.target === form) focusEmpty();
      });
      function firstLine(text) {
        var line = String(text || "").split(/\n/).map(function (part) { return part.trim(); }).filter(Boolean)[0] || "";
        return line.replace(/\s+/g, " ").slice(0, 180);
      }
      function hostOf(url) {
        return url.hostname.replace(/^www\./, "").toLowerCase();
      }
      function parseLink(raw) {
        var value = String(raw || "").trim();
        if (!/^https?:\/\//i.test(value)) {
          if (/^(?:www\.)?(?:youtube\.com|youtu\.be|music\.youtube\.com|x\.com|twitter\.com|linkedin\.com|facebook\.com|fb\.com|m\.facebook\.com|fb\.watch)\//i.test(value)) {
            value = "https://" + value;
          } else return null;
        }
        try { return new URL(value); } catch (e) { return null; }
      }
      function siteOf(url) {
        var host = hostOf(url);
        if (host === "youtu.be" || host === "youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com" || host.endsWith(".youtube.com")) return "youtube";
        if (host === "x.com" || host === "twitter.com" || host.endsWith(".x.com") || host.endsWith(".twitter.com")) return "x";
        if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "linkedin";
        if (host === "facebook.com" || host === "fb.com" || host === "fb.watch" || host.endsWith(".facebook.com")) return "facebook";
        return "";
      }
      function videoId(url) {
        var host = hostOf(url);
        if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || "";
        var parts = url.pathname.split("/").filter(Boolean);
        if (parts[0] === "watch") return url.searchParams.get("v") || "";
        if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") return parts[1] || "";
        return "";
      }
      function channelId(url) {
        var parts = url.pathname.split("/").filter(Boolean);
        if (parts[0] === "channel" && /^UC[\w-]{20,}$/.test(parts[1] || "")) return parts[1];
        return "";
      }
      function thumbUrl(list) {
        if (!Array.isArray(list) || !list.length) return "";
        var best = list[list.length - 1] || list[0];
        var url = (best && best.url) || "";
        if (url.indexOf("//") === 0) url = "https:" + url;
        return url;
      }
      async function channelLookup(query) {
        var q = String(query || "").replace(/^@/, "").trim();
        if (!q) return null;
        if (isExplicit(q)) return { blocked: true };
        var hosts = ["https://invidious.f5.si", "https://invidious.darkness.services"];
        var list = [];
        for (var h = 0; h < hosts.length; h++) {
          try {
            var res = await fetch(hosts[h] + "/api/v1/search?type=channel&q=" + encodeURIComponent(q));
            if (!res.ok) continue;
            var data = await res.json();
            if (Array.isArray(data) && data.length) { list = data; break; }
          } catch (err) {}
        }
        var needle = q.toLowerCase().replace(/\s+/g, "");
        var exact = null;
        var first = null;
        var dropped = 0;
        for (var i = 0; i < list.length; i++) {
          if (!list[i] || !/^UC[\w-]{20,}$/.test(list[i].authorId || "")) continue;
          if (isExplicit(list[i].author, list[i].channelHandle, list[i].description)) { dropped++; continue; }
          var hit = { id: list[i].authorId, name: list[i].author || q, avatar: thumbUrl(list[i].authorThumbnails) };
          if (!first) first = hit;
          if ((hit.name || "").toLowerCase().replace(/\s+/g, "") === needle) exact = hit;
        }
        // A query whose result page is largely adult channels is itself steering there: block it outright.
        if (dropped && ((!exact && !first) || dropped >= 3 || dropped * 10 >= list.length * 3)) return { blocked: true };
        return exact || first;
      }
      async function youtubeByName(query) {
        var found = await channelLookup(query);
        if (found && found.blocked) return found;
        if (!found || !found.id) return null;
        try {
          var rss = "https://www.youtube.com/feeds/videos.xml?channel_id=" + found.id;
          var feed = await fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rss));
          var json = await feed.json();
          var info = json && json.feed || {};
          var item = json && json.items && json.items[0];
          if (isExplicit(info.title, info.author, item && item.title)) return { blocked: true };
          var dirty = ((json && json.items) || []).slice(0, 8).filter(function (row) { return row && isExplicit(row.title); }).length;
          if (dirty >= 2) return { blocked: true };
          if (item && item.title) return { name: found.name || info.title || query, avatar: found.avatar || info.image || "", title: item.title, url: item.link || "" };
        } catch (err) {}
        try {
          var alt = await fetch("https://invidious.f5.si/api/v1/channels/" + encodeURIComponent(found.id) + "/videos?sort_by=newest");
          var body = await alt.json();
          var video = body && body.videos && body.videos[0];
          if (video && isExplicit(video.title, video.author)) return { blocked: true };
          if (video && video.title) return { name: found.name || video.author || query, avatar: found.avatar || "", title: video.title, url: video.videoId ? "https://www.youtube.com/watch?v=" + video.videoId : "" };
        } catch (err) {}
        return null;
      }
      async function xByHandle(handle) {
        var profile = await fetch("https://api.fxtwitter.com/2/profile/" + encodeURIComponent(handle));
        if (!profile.ok) return null;
        var user = (await profile.json()).user || {};
        if (!user.screen_name) return null;
        var site = user.website ? (user.website.display_url || "") + " " + (user.website.url || "") : "";
        if (isAdultHandle(user.screen_name) || isAdultHandle(handle) || isExplicit(user.name, user.screen_name, user.description, site, user.location)) return { blocked: true };
        var posts = await fetch("https://api.fxtwitter.com/2/profile/" + encodeURIComponent(handle) + "/statuses?count=8");
        var results = posts.ok ? (((await posts.json()).results) || []) : [];
        var fetchedRows = results.length;
        var mine = String(user.screen_name).toLowerCase();
        // X's own sensitive-media flag: an account whose posts are flagged is treated as adult and blocked.
        var flagged = results.filter(function (row) { return row && row.possibly_sensitive; });
        var ownFlagged = flagged.filter(function (row) { return String((row.author && row.author.screen_name) || "").toLowerCase() === mine; });
        var ownExplicit = results.filter(function (row) { return row && String((row.author && row.author.screen_name) || "").toLowerCase() === mine && isExplicit(row.text); });
        if (ownFlagged.length >= 2 || flagged.length >= 3 || ownExplicit.length >= 2) return { blocked: true };
        results = results.filter(function (row) { return row && !row.possibly_sensitive && !isExplicit(row.text, row.author && row.author.name, row.author && row.author.description) && !hasLink(row.text); });
        var latest = results.find(function (row) {
          var author = String((row.author && row.author.screen_name) || "").toLowerCase();
          return author === mine && !row.retweet && !row.retweeted_status;
        }) || results.find(function (row) {
          var author = String((row.author && row.author.screen_name) || "").toLowerCase();
          return author === mine;
        }) || {};
        var postUrl = latest.url || (latest.id ? "https://x.com/" + user.screen_name + "/status/" + latest.id : "https://x.com/" + user.screen_name);
        // If the posts could not be checked (fetch failed / empty), show the name only, not the photo.
        var checked = posts.ok && fetchedRows > 0;
        return { name: user.name || handle, handle: user.screen_name, avatar: checked ? biggerAvatar(user.avatar_url) : "", title: firstLine(latest.text), url: postUrl };
      }
      async function lookupEither(value) {
        var handle = asHandle(value);
        if (!handle) return null;
        try { return await xByHandle(handle); } catch (e) { return null; }
      }
      function asHandle(value) {
        var raw = String(value || "").trim();
        var url = parseLink(raw);
        if (url && siteOf(url) === "x") {
          var parts = url.pathname.split("/").filter(Boolean);
          if (parts[0] === "status" || parts[0] === "i" || parts[0] === "intent" || parts[0] === "search" || parts[0] === "home") return "";
          return (parts[0] || "").replace(/^@/, "");
        }
        var handle = raw.replace(/^@/, "");
        return /^[A-Za-z0-9_]{1,15}$/.test(handle) ? handle : "";
      }
      function kindOf(value) {
        var raw = String(value || "").trim();
        var url = parseLink(raw);
        var site = url && siteOf(url);
        if (site === "youtube") return { site: "youtube", raw: url.href };
        if (site === "x") {
          var fromUrl = asHandle(raw);
          if (fromUrl) return { site: "x", raw: fromUrl };
        }
        var tagged = raw.match(/^(?:yt|youtube)\s*:\s*(.+)$/i);
        if (tagged) return { site: "youtube", raw: tagged[1].trim() };
        var handle = asHandle(raw);
        if (handle) return { site: "x", raw: handle };
        var bare = raw.replace(/^@/, "").trim();
        if (bare) return { site: "youtube", raw: bare };
        return null;
      }
      async function youtubeCall(raw) {
        var url = parseLink(raw);
        if (isExplicit(raw)) return { blocked: true };
        var card = url ? await youtubeCard(url) : await youtubeByName(raw);
        if (card && card.blocked) return card;
        if (!card || !card.title) return null;
        if (!safeCard(card)) return { blocked: true };
        if (hasLink(card.name, card.title)) return null;
        var who = card.name || raw;
        return { handle: who.replace(/\s+/g, ""), name: who, avatar: card.avatar || "", title: card.title, url: card.url || (url ? url.href : "") };
      }
      function resetCall() {
        source = "";
        heldName = "";
        heldAvatar = "";
        form.removeAttribute("data-query");
        input.value = "";
        input.disabled = false;
        input.removeAttribute("data-title");
        input.placeholder = "";
        mode = "x";
        if (photo) {
          photo.classList.add("is-on");
          photo.classList.remove("has-photo");
          photo.style.backgroundImage = "";
          photo.textContent = "x";
        }
        if (yt) {
          yt.classList.remove("is-on", "has-photo");
          yt.style.backgroundImage = "";
          yt.textContent = "yt";
        }
        if (ask) ask.textContent = "Have Fun";
        if (refresh) refresh.removeAttribute("data-handle");
        form.classList.remove("is-saved");
        try {
          localStorage.removeItem(key);
          localStorage.removeItem("emciix-x-handle");
        } catch (err) {}
        input.focus();
      }
      async function youtubeCard(url) {
        var id = videoId(url);
        var name = "";
        var avatar = "";
        var title = "";
        if (id) {
          var video = await fetch("https://noembed.com/embed?url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + id));
          var meta = await video.json();
          if (meta && meta.title && !meta.error) title = meta.title;
          name = meta && meta.author_name || "";
          if (isExplicit(title, name)) return { blocked: true };
          if (meta && meta.author_url) {
            try {
              var author = new URL(meta.author_url);
              var handle = (author.pathname.split("/").filter(Boolean)[0] || "").replace(/^@/, "");
              if (handle) {
                var found = await channelLookup(handle);
                if (found && found.blocked) return found;
                if (found) { name = found.name || name; avatar = found.avatar || avatar; }
              }
            } catch (e) {}
          }
          if (title) return { name: name, avatar: avatar, title: title, url: "https://www.youtube.com/watch?v=" + id };
        }
        var list = url.searchParams.get("list");
        if (!id && list) {
          try {
            var listed = await fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent("https://www.youtube.com/feeds/videos.xml?playlist_id=" + list));
            var listedJson = await listed.json();
            var listedInfo = listedJson && listedJson.feed || {};
            var listedItem = listedJson && listedJson.items && listedJson.items[0];
            if (isExplicit(listedInfo.title, listedInfo.author, listedItem && listedItem.title)) return { blocked: true };
            if (listedInfo.title || (listedItem && listedItem.title)) {
              return {
                name: listedInfo.title || "",
                avatar: listedInfo.image || "",
                title: (listedItem && listedItem.title) || listedInfo.title || "",
                url: (listedItem && listedItem.link) || ("https://www.youtube.com/playlist?list=" + list)
              };
            }
          } catch (e) {}
        }
        var channel = channelId(url);
        var looked = null;
        if (!channel) {
          var parts = url.pathname.split("/").filter(Boolean);
          var handle = "";
          if ((parts[0] || "").charAt(0) === "@") handle = parts[0].slice(1);
          else if (parts[0] === "c" || parts[0] === "user") handle = parts[1] || "";
          if (handle) looked = await channelLookup(handle);
          if (looked && looked.blocked) return looked;
          channel = looked && looked.id;
          if (looked) { name = looked.name; avatar = looked.avatar; }
        }
        if (!channel) return { name: name, avatar: avatar, title: title };
        var rss = "https://www.youtube.com/feeds/videos.xml?channel_id=" + channel;
        var feed = await fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rss));
        var json = await feed.json();
        var info = json && json.feed || {};
        var item = json && json.items && json.items[0];
        if (isExplicit(info.title, info.author, item && item.title)) return { blocked: true };
        return {
          name: name || info.title || "",
          avatar: avatar || info.image || "",
          title: (item && item.title) || title,
          url: (item && item.link) || url.href
        };
      }
      function biggerAvatar(url) {
        return String(url || "").replace("_normal.", "_200x200.");
      }
      async function xCard(url) {
        var parts = url.pathname.split("/").filter(Boolean);
        var at = parts.indexOf("status");
        if (at >= 0 && parts[at + 1]) {
          var one = await fetch("https://api.fxtwitter.com/2/status/" + encodeURIComponent(parts[at + 1]));
          var post = await one.json();
          var status = post && post.status || {};
          var author = status.author || {};
          return { name: author.name || "", avatar: biggerAvatar(author.avatar_url), title: firstLine(status.text) };
        }
        var handle = (parts[0] || "").replace(/^@/, "");
        if (!handle || handle === "home" || handle === "search" || handle === "i" || handle === "intent") return { name: "", avatar: "", title: "" };
        var profile = await fetch("https://api.fxtwitter.com/2/profile/" + encodeURIComponent(handle));
        var user = (await profile.json()).user || {};
        var posts = await fetch("https://api.fxtwitter.com/2/profile/" + encodeURIComponent(handle) + "/statuses?count=1");
        var latest = ((await posts.json()).results || [])[0] || {};
        var who = latest.author || user;
        return { name: who.name || user.name || "", avatar: biggerAvatar(who.avatar_url || user.avatar_url), title: firstLine(latest.text) };
      }
      async function socialCard(href) {
        var res = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent(href));
        var data = await res.json();
        var html = data && data.contents ? String(data.contents) : "";
        var desc = metaContent(html, "og:description");
        var title = metaContent(html, "og:title");
        var image = metaContent(html, "og:image");
        var name = String(title || "").replace(/\s*[|–-]\s*(LinkedIn|Facebook)\s*$/i, "").trim();
        var post = "";
        if (desc && !/log in|sign in|join linkedin|facebook/i.test(desc)) post = firstLine(desc);
        return { name: name, avatar: image, title: post };
      }
      async function fetchCard(raw) {
        var url = parseLink(raw);
        var site = url && siteOf(url);
        if (!site) return null;
        var card = site === "youtube" ? await youtubeCard(url) : site === "x" ? await xCard(url) : await socialCard(url.href);
        return card && card.blocked ? null : safeCard(card);
      }
      function metaContent(html, key) {
        var pattern = new RegExp("(?:property|name)=[\"']" + key + "[\"'][^>]*content=[\"']([^\"']+)[\"']|content=[\"']([^\"']+)[\"'][^>]*(?:property|name)=[\"']" + key + "[\"']", "i");
        var match = String(html || "").match(pattern);
        return match ? (match[1] || match[2] || "") : "";
      }
      function promptFor(next) {
        mode = next === "youtube" ? "youtube" : "x";
        input.value = "";
        input.disabled = false;
        input.placeholder = "";
        if (ask) ask.textContent = "Have Fun";
        if (photo) photo.classList.toggle("is-on", mode !== "youtube");
        if (yt) yt.classList.toggle("is-on", mode === "youtube");
        if (input.offsetParent) input.focus();
      }
      if (photo) photo.addEventListener("click", function (event) {
        event.preventDefault();
        promptFor("x");
      });
      if (yt) yt.addEventListener("click", function (event) {
        event.preventDefault();
        promptFor("youtube");
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        runLookup((input.value || "").trim());
      });
      function runLookup(value) {
        if (!value) return;
        if (hasLink(value)) { blockCall("No links"); return; }
        if (isExplicit(value) || isAdultHandle(value)) { blockCall(); return; }
        var kind = kindOf(value);
        if (!kind) return;
        var site = kind.site;
        mode = site;
        var handle = kind.raw;
        if (!handle) return;
        var shown = site === "x" ? "@" + handle : "YouTube";
        source = handle;
        form.setAttribute("data-query", handle);
        input.disabled = true;
        input.placeholder = "";
        if (ask) ask.textContent = shown;
        var job = site === "youtube" ? youtubeCall(handle) : xByHandle(handle);
        var fallback = "";
        job.then(function (card) {
          if (card && (card.blocked || !safeCard(card))) { blockCall(); return; }
          input.disabled = false;
          var who = (card && card.handle) || handle;
          shown = site === "x" ? "@" + who : ((card && card.name) || "YouTube");
          var post = (card && card.title) || "";
          paint({
            name: (card && card.name) || who,
            avatar: card && card.avatar,
            title: post,
            post: post,
            source: who,
            label: shown,
            keepPhoto: !(card && card.avatar)
          });
          input.value = post || value;
          input.placeholder = "";
          if (ask) ask.textContent = shown;
          publishCall({
            handle: who,
            name: (card && card.name) || who,
            avatar: (card && card.avatar) || "",
            post: post,
            url: (card && card.url) || fallback,
            at: Date.now()
          });
        }).catch(function () {
          input.disabled = false;
          input.value = "";
          input.placeholder = "";
          if (ask) ask.textContent = shown;
          paint({ source: handle, label: shown, keepPhoto: true, keepName: true });
          publishCall({
            handle: site === "x" ? handle : shown,
            name: shown,
            avatar: "",
            post: "",
            url: fallback,
            at: Date.now()
          });
        });
      }
      function blockCall(note) {
        source = "";
        heldName = "";
        heldAvatar = "";
        form.removeAttribute("data-query");
        input.disabled = false;
        input.value = "";
        input.removeAttribute("data-title");
        input.placeholder = note || "Try something else";
        if (ask) ask.textContent = "Have Fun";
        if (photo) { photo.classList.remove("has-photo"); photo.style.backgroundImage = ""; }
        if (yt) { yt.classList.remove("has-photo"); yt.style.backgroundImage = ""; }
        form.classList.remove("is-saved");
        try { localStorage.removeItem(key); localStorage.removeItem("emciix-x-handle"); } catch (err) {}
        if (input.offsetParent) input.focus();
      }
      input.addEventListener("input", function () {
        if (input.placeholder) input.placeholder = "";
      });
      window.emciixRefresh = function (event) {
        if (event) { event.preventDefault(); event.stopPropagation(); }
        resetCall();
      };
      if (refresh) refresh.addEventListener("click", window.emciixRefresh, true);
      var songsNav = document.getElementById("songsNav");
      var playlistCards = document.getElementById("grid");
      if (songsNav && playlistCards) {
        songsNav.addEventListener("click", function (event) {
          event.preventDefault();
          var open = playlistCards.hidden;
          playlistCards.hidden = !open;
          songsNav.setAttribute("aria-expanded", open ? "true" : "false");
          if (open) playlistCards.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      }
      var callStore = "emciix-call-history";
      var callUrl = "https://firestore.googleapis.com/v1/projects/emciix-com/databases/(default)/documents/galacticCalls";
      function readCalls() {
        try {
          var list = JSON.parse(localStorage.getItem(callStore) || "[]");
          return Array.isArray(list) ? list : [];
        } catch (err) { return []; }
      }
      function latestCalls(list) {
        var best = {};
        (list || []).forEach(function (row) {
          if (!row || !row.handle) return;
          var id = String(row.handle).replace(/^@/, "").toLowerCase();
          if (!id) return;
          var urlName = String(row.url || "").match(/(?:x|twitter|fxtwitter)\.com\/([^/?#]+)\/status\//i);
          if (urlName && urlName[1].toLowerCase() !== id) return;
          var prev = best[id];
          if (!prev || (Number(row.at) || 0) >= (Number(prev.at) || 0)) best[id] = row;
        });
        return Object.keys(best).map(function (id) { return best[id]; }).sort(function (a, b) {
          return (b.at || 0) - (a.at || 0);
        }).slice(0, 20);
      }
      function renderCalls(list) {
        var ol = document.getElementById("callHistory");
        var kicker = document.getElementById("callKicker");
        if (!ol) return;
        var rows = latestCalls(list);
        ol.textContent = "";
        if (!rows.length) {
          ol.hidden = false;
          if (kicker) kicker.hidden = false;
          var empty = document.createElement("li");
          empty.className = "call-empty";
          empty.textContent = "Fresh ledger";
          ol.appendChild(empty);
          return;
        }
        ol.hidden = false;
        if (kicker) kicker.hidden = false;
        rows.forEach(function (row) {
          var li = document.createElement("li");
          // Text only: no anchors or hrefs to channels, videos or X posts.
          var ava = document.createElement("span");
          ava.className = "call-ava";
          if (row.avatar) ava.style.backgroundImage = "url(\"" + String(row.avatar).replace(/"/g, "") + "\")";
          else ava.textContent = "x";
          var copy = document.createElement("span");
          copy.className = "call-copy";
          var who = document.createElement("strong");
          who.className = "call-who";
          who.textContent = "@" + String(row.handle).replace(/^@/, "");
          var post = document.createElement("span");
          post.className = "call-post";
          post.textContent = row.post || "No post";
          copy.appendChild(who);
          copy.appendChild(post);
          li.appendChild(ava);
          li.appendChild(copy);
          ol.appendChild(li);
        });
      }
      function parseCallDoc(doc) {
        var fields = doc && doc.fields || {};
        var at = fields.at && fields.at.integerValue != null ? parseInt(fields.at.integerValue, 10) || 0 : 0;
        return {
          handle: fields.handle && fields.handle.stringValue || "",
          name: fields.name && fields.name.stringValue || "",
          avatar: fields.avatar && fields.avatar.stringValue || "",
          post: fields.post && fields.post.stringValue || "",
          at: at
        };
      }
      var ledgerUrl = "https://raw.githubusercontent.com/e24g4vewetq3gwerb/emciix.com/main/calls/ledger.json";
      var inboxUrl = "https://ntfy.sh/emciix-galactic-ledger-9f3c";
      var ledgerCalls = [];
      var pendingCalls = [];
      function liveCall(row) {
        if (!row || !row.handle) return null;
        if (row.handle === "x" || row.handle === "smoketest" || row.handle === "probe2" || row.handle === "ledgerprobe") return null;
        if (isExplicit(row.handle, row.name, row.post, queryOf(row.url))) return null;
        if (hasLink(row.handle, row.name, row.post)) return null;
        row.url = "";
        row.at = Number(row.at) || 0;
        return row;
      }
      function showLedger() {
        var seen = {};
        ledgerCalls.forEach(function (row) { seen[row.handle + "|" + row.at] = 1; });
        var extra = pendingCalls.filter(function (row) { return row && !seen[row.handle + "|" + row.at]; });
        renderCalls(extra.concat(ledgerCalls));
      }
      var ledgerSince = 0;
      function applyLedger(data) {
        ledgerSince = Number(data && data.since) || 0;
        var rows = ((data && data.calls) || []).map(liveCall).filter(Boolean);
        ledgerCalls = latestCalls(rows);
        showLedger();
      }
      function addLive(row) {
        row = liveCall(row);
        if (!row) return;
        if (ledgerSince && row.at < ledgerSince) return;
        ledgerCalls = latestCalls([row].concat(ledgerCalls));
        showLedger();
      }
      function pullInbox() {
        fetch(inboxUrl + "/json?poll=1&since=12h", { cache: "no-store" }).then(function (res) {
          if (!res.ok) throw new Error("inbox");
          return res.text();
        }).then(function (text) {
          var rows = [];
          String(text || "").split("\n").forEach(function (line) {
            if (!line.trim()) return;
            try {
              var msg = JSON.parse(line);
              if (!msg || msg.event !== "message" || !msg.message) return;
              var extra = liveCall(JSON.parse(msg.message));
              if (extra && (!ledgerSince || extra.at >= ledgerSince)) rows.push(extra);
            } catch (err) {}
          });
          if (rows.length) {
            ledgerCalls = latestCalls(rows.concat(ledgerCalls));
            showLedger();
          }
        }).catch(function () {});
      }
      function pullLedger() {
        function take(url) {
          return fetch(url, { cache: "no-store" }).then(function (res) {
            if (!res.ok) throw new Error("ledger");
            return res.json();
          });
        }
        take("/calls/ledger.json?t=" + Date.now()).catch(function () {
          return take(ledgerUrl + "?t=" + Date.now());
        }).then(function (data) {
          applyLedger(data);
          pullInbox();
        }).catch(function () {});
      }
      function publishCall(entry) {
        if (!entry || !entry.handle || !liveCall({ handle: entry.handle })) return;
        if (isExplicit(entry.handle, entry.name, entry.post, queryOf(entry.url))) return;
        if (hasLink(entry.handle, entry.name, entry.post)) return;
        entry.avatar = String(entry.avatar || "").slice(0, 480);
        entry.post = String(entry.post || "").slice(0, 180);
        entry.name = String(entry.name || entry.handle).slice(0, 70);
        entry.url = "";
        entry.at = entry.at || Date.now();
        addLive(entry);
        fetch(inboxUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain", "Title": "call" },
          body: JSON.stringify({
            handle: entry.handle,
            name: entry.name,
            avatar: entry.avatar,
            post: entry.post,
            url: entry.url,
            at: entry.at
          })
        }).catch(function () {});
      }
      pullLedger();
      setInterval(pullInbox, 3000);
      setInterval(pullLedger, 15000);
      try {
        var live = new EventSource(inboxUrl + "/sse");
        live.onmessage = function (event) {
          try {
            var msg = JSON.parse(event.data);
            if (!msg || !msg.message) return;
            addLive(JSON.parse(msg.message));
          } catch (err) {}
        };
      } catch (err) {}
    })();
