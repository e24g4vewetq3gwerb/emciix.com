    (function () {
      var sopqgctet28973499mwrmwdwdx1060 = document.getElementById("galacticCall");
      var hrluaigr16106189qsijqunorp6469 = document.getElementById("callerProfile");
      var ekmihs05977354vnuamqugfrvx8192 = document.getElementById("galacticAsk");
      if (!sopqgctet28973499mwrmwdwdx1060 || !hrluaigr16106189qsijqunorp6469) return;
      var ckvqeghunfg90345383jadskvw2735 = document.getElementById("callerPhoto");
      var qyffrl47381679pnivtllmhjlp7058 = document.getElementById("callerYt");
      var kqyesnu77607123cgjkaeqwjim0168 = document.getElementById("callerRefresh");
      var obobojcwomsily81645021gruf0136 = "emciix-caller-profile";
      var sqekwiiaic43984539dljmtlrd3071 = "";
      var huavxkxwslyobr75710782gmud2432 = "x";
      var sxwtzjpefotp18741252vmmekc1074 = "";
      var efxzways42219521rnxvkfnhce4762 = "";
      // ---- Strict safe search + no links -------------------------------------------------------------
      // Invidious (YouTube channel search) has no SafeSearch/Restricted Mode switch, so every query and every
      // result is screened here. X posts carry X's own possibly_sensitive flag, which is honoured as well.
      // Text is normalised first: invisible characters stripped, NFKC (fullwidth/styled letters), accents
      // removed, Cyrillic/Greek/small-cap/emoji-letter homoglyphs mapped, leetspeak mapped, url-escapes decoded.
      // Terms match with repeated letters (seeexxx) and fully spaced/punctuated spellings (s e x, s.e.x, p-o-r-n).
      var uvffitocdulbj39989157cphdx7298 = [
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
      var egacocdg70204242estjlnbwcv4839 = ["porn", "xnxx", "xvideo", "xhamster", "pornhub", "redtube", "youporn", "onlyfans", "brazzers", "chaturbate", "stripchat", "hentai", "nsfw", "blowjob", "cumshot", "gangbang", "masturbat", "sexvideo", "sexyvideo", "xxxvideo", "nudevideo", "naughtyamerica", "realitykings", "bangbros", "digitalplayground", "evilangel", "julesjordan", "teamskeet", "fakehub", "puretaboo", "adulttime", "livejasmin", "bongacams", "myfreecams", "camsoda", "manyvids", "clips4sale", "spankbang", "eporner", "youjizz", "fansly", "justforfans", "loyalfans", "fancentro", "sandnigger", "jailbait", "lolicon", "shotacon", "bestgore", "feetgirl", "footgirl", "feetfetish", "footfetish", "feetworship", "footworship", "feetmodel", "solesgirl"];
      // Known adult-brand accounts (exact X handles).
      var karexdtxnh72548687tuibfdis5727 = ["vixen", "blacked", "blackedraw", "tushy", "tushyraw", "deeper", "slayed", "milfy", "vixenplus", "naughtyamerica", "realitykings", "mofos", "bangbros", "brazzers", "evilangel", "digitalplayground", "penthouse", "hustler", "wickedpictures", "kink", "kinkcom", "teamskeet", "nubiles", "fakehub", "privatecom", "julesjordan", "adulttime", "puretaboo", "girlsway", "dorcel", "marcdorcel", "camsoda", "myfreecams", "manyvids", "clips4sale", "chaturbate", "stripchat", "bongacams", "livejasmin", "onlyfans", "fansly", "justforfans", "loyalfans", "fancentro", "pornhub", "xvideos", "xhamster", "xnxx", "spankbang", "eporner", "redtube", "youporn", "avn", "xbiz", "playboy", "playboyplus"];
      var fbnlqya42806187ohspezxozbs7244 = [
        /(?:^|[^a-z0-9])(?:hot|sexy|bold|naked|nude|spicy) (?:[a-z0-9]+ )?(?:girl|girls|gf|woman|women|lady|ladies|babe|babes|aunty|auntie|aunties|bhabhi|bhabi|maid|maids|diva|divas|wife|wives|teen|teens|model|models|kiss|kisses|kissing|reel|reels|actress|actresses|mom|moms|mommy)(?![a-z0-9])/,
        /(?:^|[^a-z0-9])(?:hot|sexy|bold|naked|nude|spicy|uncut) (?:video|videos|film|films|clip|clips|scene|scenes|ckvqeghunfg90345383jadskvw2735|photos|pic|pics|dance|dances|body|figure|romance|web series|webseries)(?![a-z0-9])/,
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
      var mcyugqs12599374jklhvevszsu5199 = ["ポルノ", "アダルト", "セックス", "無修正", "ヌード", "変態", "av女優", "おっぱい", "巨乳", "全裸", "裸体", "痴漢", "中出し", "風俗", "援交", "エロ動画", "エロい", "エロ画像", "야동", "섹스", "포르노", "성인방송", "야한", "누드", "보지", "자지", "벗방", "19금", "노출방송", "조건만남", "색정", "色情", "性爱", "性愛", "做爱", "做愛", "裸体", "裸體", "黄片", "黃片", "毛片", "三级片", "三級片", "口交", "妓女", "成人视频", "成人影片", "约炮", "約炮", "自慰", "av女优", "无码", "無碼", "肏", "屄", "鸡巴", "雞巴", "порно", "секс", "эротик", "хентай", "онлифанс", "سكس", "اباحي", "إباحي", "اباحية", "إباحية", "بورن", "شرموطة", "شراميط", "سيكس", "सेक्स", "चुदाई", "पोर्न", "ब्लू फिल्म", "সেক্স", "চুদা", "চোদা", "পর্ন", "চটি"];
      var tbmusyfhbxv21897666mgzlsni6984 = ["エロ", "голая", "голые", "голых", "голый", "шлюха", "шлюхи", "сиськи", "минет", "проститутка", "проститутки", "نيك", "عارية", "عاريات", "زب", "كس", "चूत", "लंड", "रंडी", "नंगी", "नंगा", "नग्न", "মাগী", "খানকি", "নগ্ন", "চুদি"];
      var mmcwmgjx32606594eomtjawfky4601 = ["трах", "ебат", "ебал", "ебля", "выеб", "дроч", "пизд", "хуй"];
      // Harmless phrases that contain a listed word; removed before matching.
      var vfclqm92598781sefpzufsfqma9226 = ["al gore", "gore tex", "goretex", "gore vidal", "lesley gore", "cum laude", "summa cum laude", "magna cum laude", "moby dick", "philip k dick", "dick s sporting goods", "dicks sporting goods", "dick van dyke", "dick tracy", "dick cheney", "dick clark", "john lee hooker", "hooker valley", "butt head", "beavis and butt head", "kick ass", "jackass", "sex pistols x", "meth lab x"];
      var blubjrekf48558885vngjvhxbc0388 = /\u{1F51E}|\u{1F346}|(?:\u{1F351}|\u{1F445}|\u{1F975}|\u{1F352}|\u{1F608}|\u{1F924})[\s\S]{0,6}\u{1F4A6}|\u{1F4A6}[\s\S]{0,6}(?:\u{1F351}|\u{1F445}|\u{1F975}|\u{1F352}|\u{1F608}|\u{1F924})|\u{1F445}[\s\S]{0,6}\u{1F351}|\u{1F351}[\s\S]{0,6}\u{1F445}/u;
      var cvslmla10820341daneclxweeo3936 = { "а": "a", "в": "b", "е": "e", "ё": "e", "к": "k", "м": "m", "н": "h", "о": "o", "р": "p", "с": "c", "т": "t", "у": "y", "х": "x", "ѕ": "s", "і": "i", "ї": "i", "ј": "j", "ԁ": "d", "ԛ": "q", "ԝ": "w", "ɡ": "g", "α": "a", "β": "b", "ε": "e", "η": "n", "ι": "i", "κ": "k", "ν": "v", "ο": "o", "ρ": "p", "τ": "t", "υ": "u", "χ": "x", "ω": "w", "ᴀ": "a", "ʙ": "b", "ᴄ": "c", "ᴅ": "d", "ᴇ": "e", "ꜰ": "f", "ɢ": "g", "ʜ": "h", "ɪ": "i", "ᴊ": "j", "ᴋ": "k", "ʟ": "l", "ᴍ": "m", "ɴ": "n", "ᴏ": "o", "ᴘ": "p", "ǫ": "q", "ʀ": "r", "ꜱ": "s", "ᴛ": "t", "ᴜ": "u", "ᴠ": "v", "ᴡ": "w", "ʏ": "y", "ᴢ": "z", "×": "x", "ⅹ": "x", "ı": "i", "ł": "l", "ø": "o", "đ": "d", "ß": "ss", "æ": "ae", "œ": "oe", "þ": "p" };
      var mwcdgdpyiiikww72719339nyjs9527 = /[\u00ad\u034f\u061c\u115f\u1160\u17b4\u17b5\u180b-\u180e\u200b-\u200f\u202a-\u202e\u2060-\u206f\u3164\ufe00-\ufe0f\ufeff\uffa0]|\udb40[\udc00-\udc7f]/g;
      function hpkdccpmlv40258930djcfzvoj8281(term) {
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
      var itaxewkqdrkq94383629blosin7493 = uvffitocdulbj39989157cphdx7298.map(hpkdccpmlv40258930djcfzvoj8281);
      var hkpalp43399441ygxydygwvwvt2239 = vfclqm92598781sefpzufsfqma9226.map(function (p) { return new RegExp("(^|[^a-z0-9])" + p.replace(/ /g, "[^a-z0-9]*") + "(?![a-z0-9])", "g"); });
      function gtyndndbtbwwmb02729221eitk3002(word, stem) {
        try { return new RegExp("(?:^|[^\\p{L}\\p{M}\\p{N}])" + word + (stem ? "" : "(?![\\p{L}\\p{M}\\p{N}])"), "u"); } catch (err) { return new RegExp(word); }
      }
      var ohpnoktrgadpl24234191avfhi0218 = tbmusyfhbxv21897666mgzlsni6984.map(function (w) { return gtyndndbtbwwmb02729221eitk3002(w, false); }).concat(mmcwmgjx32606594eomtjawfky4601.map(function (w) { return gtyndndbtbwwmb02729221eitk3002(w, true); }));
      function cbtocou83377432ybujcgosrda5921(text) {
        var out = "";
        for (var i = 0; i < text.length; i++) {
          var code = text.codePointAt(i);
          var ch = String.fromCodePoint(code);
          if (code > 0xffff) i++;
          if (code >= 0x1f1e6 && code <= 0x1f1ff) out += String.fromCharCode(97 + code - 0x1f1e6);
          else if (code >= 0x1f170 && code <= 0x1f189) out += String.fromCharCode(97 + code - 0x1f170);
          else if (code >= 0x1f150 && code <= 0x1f169) out += String.fromCharCode(97 + code - 0x1f150);
          else out += cvslmla10820341daneclxweeo3936[ch] || ch;
        }
        return out;
      }
      function komkytocpzadw76566893wunxy6821(value) {
        var text = String(value || "").replace(mwcdgdpyiiikww72719339nyjs9527, "");
        if (/%[0-9a-f]{2}/i.test(text)) { try { text = text + " " + decodeURIComponent(text.replace(/\+/g, " ")); } catch (err) {} }
        try { text = text.normalize("NFKC").toLowerCase().normalize("NFKD").replace(/([a-z])[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]+/g, "$1").normalize("NFC"); } catch (err) { text = text.toLowerCase(); }
        return text;
      }
      function xloecltusb77854637jmbmqrym3706(text) {
        return text.replace(/[0@4]/g, function (c) { return c === "0" ? "o" : "a"; }).replace(/[$5§]/g, "s").replace(/[3€]/g, "e").replace(/[1!|]/g, "i").replace(/7/g, "t").replace(/¢/g, "c");
      }
      function erijaptt82285031vhvqesunkz2003(raw) {
        var plain = komkytocpzadw76566893wunxy6821(raw);
        var mapped = cbtocou83377432ybujcgosrda5921(plain);
        var forms = [plain, mapped, xloecltusb77854637jmbmqrym3706(mapped)];
        return forms.map(function (sopqgctet28973499mwrmwdwdx1060) {
          for (var a = 0; a < hkpalp43399441ygxydygwvwvt2239.length; a++) sopqgctet28973499mwrmwdwdx1060 = sopqgctet28973499mwrmwdwdx1060.replace(hkpalp43399441ygxydygwvwvt2239[a], "$1 ");
          return sopqgctet28973499mwrmwdwdx1060;
        });
      }
      function htylrmofq93660117dipvseurh9634() {
        for (var a = 0; a < arguments.length; a++) {
          var raw = String(arguments[a] || "");
          if (!raw) continue;
          var bare = raw.replace(mwcdgdpyiiikww72719339nyjs9527, "");
          if (blubjrekf48558885vngjvhxbc0388.test(bare)) return true;
          var forms = erijaptt82285031vhvqesunkz2003(raw);
          if (/(^|[^a-z0-9])18\s*\+/.test(forms[1]) || /(^|[^a-z0-9])x{3,}($|[^a-z0-9])/.test(forms[1]) || /(^|[^0-9])14\W?88($|[^0-9])/.test(forms[0])) return true;
          for (var p = 0; p < mcyugqs12599374jklhvevszsu5199.length; p++) if (forms[0].indexOf(mcyugqs12599374jklhvevszsu5199[p]) >= 0) return true;
          for (var n = 0; n < ohpnoktrgadpl24234191avfhi0218.length; n++) if (ohpnoktrgadpl24234191avfhi0218[n].test(forms[0])) return true;
          for (var f = 0; f < forms.length; f++) {
            var sopqgctet28973499mwrmwdwdx1060 = forms[f];
            for (var w = 0; w < itaxewkqdrkq94383629blosin7493.length; w++) if (itaxewkqdrkq94383629blosin7493[w].test(sopqgctet28973499mwrmwdwdx1060)) return true;
            for (var c = 0; c < fbnlqya42806187ohspezxozbs7244.length; c++) if (fbnlqya42806187ohspezxozbs7244[c].test(sopqgctet28973499mwrmwdwdx1060.replace(/[^a-z0-9*#@%$!?.]+/g, " "))) return true;
            var packed = sopqgctet28973499mwrmwdwdx1060.replace(/[^a-z]+/g, "");
            for (var q = 0; q < egacocdg70204242estjlnbwcv4839.length; q++) if (packed.indexOf(egacocdg70204242estjlnbwcv4839[q]) >= 0) return true;
          }
        }
        return false;
      }
      function mdnmjrqpdgswao02284145cxwa2597(handle) {
        return karexdtxnh72548687tuibfdis5727.indexOf(String(handle || "").replace(/^@/, "").toLowerCase()) >= 0;
      }
      // No links: scheme://, hxxp, www., bare domain.tld (also "dot com", spaced/bracketed/unicode dots,
      // url-escapes), javascript:/data: style schemes, IPv4/IPv6 and localhost.
      var rlvopdkcsi34882302pynaklpm7425 = "com|net|org|edu|gov|mil|int|io|co|app|dev|xyz|info|biz|site|online|live|link|links|club|shop|store|blog|news|page|art|one|fun|click|win|vip|pro|mobi|name|tech|space|website|zip|mov|lol|wtf|porn|sex|xxx|adult|onion|top|red|blue|pink|video|watch|stream|social|chat|games|game|media|music|world|today|life|cloud|host|email|network|digital|agency|studio|design|codes|download|free|gay|sexy|tube|cam|webcam|dating|bet|casino|poker|men|work|works|best|cool|rocks|ninja|guru|wiki|help|photo|photos|pics|pictures|gallery|land|city|country|global|group|team|systems|services|solutions|company|finance|money|cash|loan|market|trade|exchange|crypto|nft|bot|run|now|new|plus|lat|asia|cyou|icu|buzz|monster|quest|sbs|cfd|rest|bar|uno|mom|lgbt|love|date|fans|tips|ai|ac|ad|ae|af|ag|ai|al|am|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw";
      var cteegrwipqd11962363ebnwvsg3879 = new RegExp("(^|[^a-z0-9-])[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\\.(?:" + rlvopdkcsi34882302pynaklpm7425 + ")(?![a-z0-9-])");
      var zjcolifzyrmqp33382077dgipp7462 = "com|net|org|io|xyz|ru|biz|ly";
      function otsifxq65003781lytttjdnotz4380(raw) {
        var text = String(raw || "").replace(mwcdgdpyiiikww72719339nyjs9527, "");
        if (/%[0-9a-f]{2}/i.test(text)) { try { text = text + " " + decodeURIComponent(text); } catch (err) {} }
        try { text = text.normalize("NFKC"); } catch (err) {}
        text = cbtocou83377432ybujcgosrda5921(text.toLowerCase());
        text = text.replace(/[\u3002\uff0e\uff61\u2024\u2e33\u00b7\u2219\u22c5\u2022\u2027\ufe52\u0701\u0702\u06d4]/g, ".").replace(/[\uff0f\u2044\u2215\u29f8]/g, "/");
        text = text.replace(/\s*[\[\(\{<]\s*(?:\.|dot|d0t)\s*[\]\)\}>]\s*/g, ".").replace(/\s*[\[\(\{]\s*:\s*[\]\)\}]\s*/g, ":");
        text = text.replace(new RegExp("\\s*(?:\\.|\\bdot\\b|\\bd0t\\b)\\s*(?=(?:" + zjcolifzyrmqp33382077dgipp7462 + ")(?![a-z0-9]))", "g"), function (m) { return /\S\s*$/.test(m) || /\s/.test(m) ? "." : m; });
        text = text.replace(/\bh(?:tt|xx|\*\*|t\*|\*t|x\*|\*x|xt|tx)p(s?)\b/g, "http$1");
        return text;
      }
      function ghpufcrpmydv84040670jjkjai8028() {
        for (var a = 0; a < arguments.length; a++) {
          var raw = String(arguments[a] || "");
          if (!raw) continue;
          var text = otsifxq65003781lytttjdnotz4380(raw);
          if (/[a-z][a-z0-9+.-]*\s*:\s*\/\s*\//.test(text) || /\bhttps?\s*[:;]/.test(text)) return true;
          if (/(^|[^a-z0-9])(?:javascript|vbscript|data|file|mailto|blob|intent|about|tel|sms|itms-apps|market|ftp)\s*:\s*\S/.test(text)) return true;
          if (/(^|[^a-z0-9])www\d{0,3}\s*\./.test(text) || new RegExp("(^|[^a-z0-9])www\\s+[a-z0-9-]+\\s+(?:" + zjcolifzyrmqp33382077dgipp7462 + ")(?![a-z0-9])").test(text) || /(^|[^a-z0-9])xn--/.test(text)) return true;
          if (/(^|[^0-9.])\d{1,3}(?:\s*\.\s*\d{1,3}){3}(?![0-9])/.test(text) || /\[[0-9a-f:]{3,}\]/.test(text) || /(^|[^a-z0-9])localhost(?![a-z0-9])/.test(text)) return true;
          if (/(^|[^a-z0-9-])[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?::\d+)?\//.test(text)) return true;
          if (new RegExp("(^|[^a-z0-9-])[a-z0-9-]{2,}\\s+(?:" + zjcolifzyrmqp33382077dgipp7462 + ")\\s*/").test(text)) return true;
          if (cteegrwipqd11962363ebnwvsg3879.test(text)) return true;
        }
        return false;
      }
      function uxhjeqoeawytmv13629527gqrf4495(url) {
        // Only the human-typed part of a link is screened (e.g. a YouTube search_query), not random video/post ids.
        try { var u = new URL(String(url || "")); return u.searchParams.get("search_query") || u.searchParams.get("q") || ""; } catch (err) { return ""; }
      }
      function ldptoitfwljwgv92419038kmgg4339(card) {
        if (!card) return card;
        return htylrmofq93660117dipvseurh9634(card.name, card.title, card.post, card.handle, card.label, card.sqekwiiaic43984539dljmtlrd3071, uxhjeqoeawytmv13629527gqrf4495(card.url), card.description) ? null : card;
      }
      window.emciixIsExplicit = htylrmofq93660117dipvseurh9634;
      window.emciixHasLink = ghpufcrpmydv84040670jjkjai8028;
      function ibzmsheqvf85173603rkvjgbel0524(text) {
        var ch = String(text || "").replace(/^[@\s]+/, "").match(/[\p{L}\p{N}]/u);
        return ch ? ch[0].toUpperCase() : "";
      }
      function ytcfocacak62759417okgakgnk5741(card) {
        card = card || {};
        if (card.sqekwiiaic43984539dljmtlrd3071) {
          sqekwiiaic43984539dljmtlrd3071 = card.sqekwiiaic43984539dljmtlrd3071;
          sopqgctet28973499mwrmwdwdx1060.setAttribute("data-query", card.sqekwiiaic43984539dljmtlrd3071);
          if (kqyesnu77607123cgjkaeqwjim0168) kqyesnu77607123cgjkaeqwjim0168.setAttribute("data-handle", card.sqekwiiaic43984539dljmtlrd3071);
          try { localStorage.setItem("emciix-x-handle", card.sqekwiiaic43984539dljmtlrd3071); } catch (err) {}
        }
        if (card.title) hrluaigr16106189qsijqunorp6469.value = card.title;
        if (card.post) hrluaigr16106189qsijqunorp6469.setAttribute("data-title", card.post);
        else if (card.title) hrluaigr16106189qsijqunorp6469.setAttribute("data-title", card.title);
        if (card.name) sxwtzjpefotp18741252vmmekc1074 = card.name;
        else if (!card.keepName) sxwtzjpefotp18741252vmmekc1074 = "";
        var shown = card.label || sxwtzjpefotp18741252vmmekc1074 || "Have Fun";
        if (shown === "Galactic call:" || shown === "Galactic call") shown = sxwtzjpefotp18741252vmmekc1074 || "Have Fun";
        if (ekmihs05977354vnuamqugfrvx8192) ekmihs05977354vnuamqugfrvx8192.textContent = shown;
        // Text only: avatars / photos / thumbnails are never shown or fetched; a local initial badge stands in.
        efxzways42219521rnxvkfnhce4762 = "";
        var badge = ibzmsheqvf85173603rkvjgbel0524(sxwtzjpefotp18741252vmmekc1074 || sqekwiiaic43984539dljmtlrd3071);
        if (ckvqeghunfg90345383jadskvw2735) {
          ckvqeghunfg90345383jadskvw2735.classList.toggle("is-on", huavxkxwslyobr75710782gmud2432 !== "youtube");
          ckvqeghunfg90345383jadskvw2735.classList.remove("has-photo");
          ckvqeghunfg90345383jadskvw2735.style.backgroundImage = "";
          ckvqeghunfg90345383jadskvw2735.textContent = badge || "x";
        }
        if (qyffrl47381679pnivtllmhjlp7058) {
          qyffrl47381679pnivtllmhjlp7058.classList.toggle("is-on", huavxkxwslyobr75710782gmud2432 === "youtube");
          qyffrl47381679pnivtllmhjlp7058.classList.remove("has-photo");
          qyffrl47381679pnivtllmhjlp7058.style.backgroundImage = "";
          qyffrl47381679pnivtllmhjlp7058.textContent = badge || "yt";
        }
        try {
          localStorage.setItem(obobojcwomsily81645021gruf0136, JSON.stringify({ title: hrluaigr16106189qsijqunorp6469.value, name: sxwtzjpefotp18741252vmmekc1074, sqekwiiaic43984539dljmtlrd3071: sqekwiiaic43984539dljmtlrd3071, label: ekmihs05977354vnuamqugfrvx8192 ? ekmihs05977354vnuamqugfrvx8192.textContent : "Have Fun" }));
        } catch (err) {}
        sopqgctet28973499mwrmwdwdx1060.classList.add("is-saved");
      }
      try {
        var saved = JSON.parse(localStorage.getItem(obobojcwomsily81645021gruf0136) || "null");
        if (saved && typeof saved === "object") delete saved.avatar;
        if (saved && typeof saved === "object" && ldptoitfwljwgv92419038kmgg4339(saved) && !ghpufcrpmydv84040670jjkjai8028(saved.title, saved.name, saved.label, saved.sqekwiiaic43984539dljmtlrd3071)) ytcfocacak62759417okgakgnk5741(saved);
        else if (typeof saved === "string" && saved && !htylrmofq93660117dipvseurh9634(saved) && !ghpufcrpmydv84040670jjkjai8028(saved)) ytcfocacak62759417okgakgnk5741({ title: saved });
      } catch (e) {
        try {
          var plain = localStorage.getItem(obobojcwomsily81645021gruf0136);
          if (plain && plain.charAt(0) !== "{" && !htylrmofq93660117dipvseurh9634(plain) && !ghpufcrpmydv84040670jjkjai8028(plain)) ytcfocacak62759417okgakgnk5741({ title: plain });
        } catch (err) {}
      }
      function kcrzlw11128574fdxmdewzosir8301() {
        hrluaigr16106189qsijqunorp6469.focus();
      }
      if (ekmihs05977354vnuamqugfrvx8192) ekmihs05977354vnuamqugfrvx8192.addEventListener("click", kcrzlw11128574fdxmdewzosir8301);
      sopqgctet28973499mwrmwdwdx1060.addEventListener("click", function (event) {
        if (event.target === sopqgctet28973499mwrmwdwdx1060) kcrzlw11128574fdxmdewzosir8301();
      });
      function wgizodzhqga43806590dlvphrp3829(text) {
        var line = String(text || "").split(/\n/).map(function (part) { return part.trim(); }).filter(Boolean)[0] || "";
        return line.replace(/\s+/g, " ").slice(0, 180);
      }
      function auhqwjal44453773avjxhdxuoh5791(url) {
        return url.hostname.replace(/^www\./, "").toLowerCase();
      }
      function ncxtkunkdzo47277769axdbbcx1191(raw) {
        var value = String(raw || "").trim();
        if (!/^https?:\/\//i.test(value)) {
          if (/^(?:www\.)?(?:youtube\.com|youtu\.be|music\.youtube\.com|x\.com|twitter\.com|linkedin\.com|facebook\.com|fb\.com|m\.facebook\.com|fb\.watch)\//i.test(value)) {
            value = "https://" + value;
          } else return null;
        }
        try { return new URL(value); } catch (e) { return null; }
      }
      function luoiyyldjyxp64395244ajvnnj8768(url) {
        var host = auhqwjal44453773avjxhdxuoh5791(url);
        if (host === "youtu.be" || host === "youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com" || host.endsWith(".youtube.com")) return "youtube";
        if (host === "x.com" || host === "twitter.com" || host.endsWith(".x.com") || host.endsWith(".twitter.com")) return "x";
        if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "linkedin";
        if (host === "facebook.com" || host === "fb.com" || host === "fb.watch" || host.endsWith(".facebook.com")) return "facebook";
        return "";
      }
      function nsbujnzohpdaql85477579knqv0434(url) {
        var host = auhqwjal44453773avjxhdxuoh5791(url);
        if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || "";
        var parts = url.pathname.split("/").filter(Boolean);
        if (parts[0] === "watch") return url.searchParams.get("v") || "";
        if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") return parts[1] || "";
        return "";
      }
      function zqhogvmxe06586442zkfkweipa1260(url) {
        var parts = url.pathname.split("/").filter(Boolean);
        if (parts[0] === "channel" && /^UC[\w-]{20,}$/.test(parts[1] || "")) return parts[1];
        return "";
      }
      function qjcitdsl63517241idjdzfylun4941(list) {
        return ""; // text only: channel thumbnails are not used
      }
      async function vlrfwz84471283vbfwybwrzsir0814(query) {
        var q = String(query || "").replace(/^@/, "").trim();
        if (!q) return null;
        if (htylrmofq93660117dipvseurh9634(q)) return { blocked: true };
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
          if (htylrmofq93660117dipvseurh9634(list[i].author, list[i].channelHandle, list[i].description)) { dropped++; continue; }
          var hit = { id: list[i].authorId, name: list[i].author || q, avatar: qjcitdsl63517241idjdzfylun4941(list[i].authorThumbnails) };
          if (!first) first = hit;
          if ((hit.name || "").toLowerCase().replace(/\s+/g, "") === needle) exact = hit;
        }
        // A query whose result page is largely adult channels is itself steering there: block it outright.
        if (dropped && ((!exact && !first) || dropped >= 3 || dropped * 10 >= list.length * 3)) return { blocked: true };
        return exact || first;
      }
      async function kknoaynriwht75365996oaobrs5589(query) {
        var found = await vlrfwz84471283vbfwybwrzsir0814(query);
        if (found && found.blocked) return found;
        if (!found || !found.id) return null;
        try {
          var rss = "https://www.youtube.com/feeds/videos.xml?channel_id=" + found.id;
          var feed = await fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rss));
          var json = await feed.json();
          var info = json && json.feed || {};
          var item = json && json.items && json.items[0];
          if (htylrmofq93660117dipvseurh9634(info.title, info.author, item && item.title)) return { blocked: true };
          var dirty = ((json && json.items) || []).slice(0, 8).filter(function (row) { return row && htylrmofq93660117dipvseurh9634(row.title); }).length;
          if (dirty >= 2) return { blocked: true };
          if (item && item.title) return { name: found.name || info.title || query, avatar: "", title: item.title, url: item.link || "" };
        } catch (err) {}
        try {
          var alt = await fetch("https://invidious.f5.si/api/v1/channels/" + encodeURIComponent(found.id) + "/videos?sort_by=newest");
          var body = await alt.json();
          var video = body && body.videos && body.videos[0];
          if (video && htylrmofq93660117dipvseurh9634(video.title, video.author)) return { blocked: true };
          if (video && video.title) return { name: found.name || video.author || query, avatar: found.avatar || "", title: video.title, url: video.nsbujnzohpdaql85477579knqv0434 ? "https://www.youtube.com/watch?v=" + video.nsbujnzohpdaql85477579knqv0434 : "" };
        } catch (err) {}
        return null;
      }
      async function clncgmxen94137901roiwcfkuj1455(handle) {
        var profile = await fetch("https://api.fxtwitter.com/2/profile/" + encodeURIComponent(handle));
        if (!profile.ok) return null;
        var user = (await profile.json()).user || {};
        if (!user.screen_name) return null;
        var site = user.website ? (user.website.display_url || "") + " " + (user.website.url || "") : "";
        if (mdnmjrqpdgswao02284145cxwa2597(user.screen_name) || mdnmjrqpdgswao02284145cxwa2597(handle) || htylrmofq93660117dipvseurh9634(user.name, user.screen_name, user.description, site, user.location)) return { blocked: true };
        var posts = await fetch("https://api.fxtwitter.com/2/profile/" + encodeURIComponent(handle) + "/statuses?count=8");
        var results = posts.ok ? (((await posts.json()).results) || []) : [];
        var fetchedRows = results.length;
        var mine = String(user.screen_name).toLowerCase();
        // X's own sensitive-media flag: an account whose posts are flagged is treated as adult and blocked.
        var flagged = results.filter(function (row) { return row && row.possibly_sensitive; });
        var ownFlagged = flagged.filter(function (row) { return String((row.author && row.author.screen_name) || "").toLowerCase() === mine; });
        var ownExplicit = results.filter(function (row) { return row && String((row.author && row.author.screen_name) || "").toLowerCase() === mine && htylrmofq93660117dipvseurh9634(row.text); });
        if (ownFlagged.length >= 2 || flagged.length >= 3 || ownExplicit.length >= 2) return { blocked: true };
        results = results.filter(function (row) { return row && !row.possibly_sensitive && !htylrmofq93660117dipvseurh9634(row.text, row.author && row.author.name, row.author && row.author.description) && !ghpufcrpmydv84040670jjkjai8028(row.text); });
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
        return { name: user.name || handle, handle: user.screen_name, avatar: checked ? hskyvpfhfpsen04262903pfdda1177(user.avatar_url) : "", title: wgizodzhqga43806590dlvphrp3829(latest.text), url: postUrl };
      }
      async function sjaxlswrpwfwxu52931734jtog7193(value) {
        var handle = zjtvkulgxfjag17350642gpzgu1441(value);
        if (!handle) return null;
        try { return await clncgmxen94137901roiwcfkuj1455(handle); } catch (e) { return null; }
      }
      function zjtvkulgxfjag17350642gpzgu1441(value) {
        var raw = String(value || "").trim();
        var url = ncxtkunkdzo47277769axdbbcx1191(raw);
        if (url && luoiyyldjyxp64395244ajvnnj8768(url) === "x") {
          var parts = url.pathname.split("/").filter(Boolean);
          if (parts[0] === "status" || parts[0] === "i" || parts[0] === "intent" || parts[0] === "search" || parts[0] === "home") return "";
          return (parts[0] || "").replace(/^@/, "");
        }
        var handle = raw.replace(/^@/, "");
        return /^[A-Za-z0-9_]{1,15}$/.test(handle) ? handle : "";
      }
      function njtuebsbqny18740734idiniah4537(value) {
        var raw = String(value || "").trim();
        var url = ncxtkunkdzo47277769axdbbcx1191(raw);
        var site = url && luoiyyldjyxp64395244ajvnnj8768(url);
        if (site === "youtube") return { site: "youtube", raw: url.href };
        if (site === "x") {
          var fromUrl = zjtvkulgxfjag17350642gpzgu1441(raw);
          if (fromUrl) return { site: "x", raw: fromUrl };
        }
        var tagged = raw.match(/^(?:qyffrl47381679pnivtllmhjlp7058|youtube)\s*:\s*(.+)$/i);
        if (tagged) return { site: "youtube", raw: tagged[1].trim() };
        var handle = zjtvkulgxfjag17350642gpzgu1441(raw);
        if (handle) return { site: "x", raw: handle };
        var bare = raw.replace(/^@/, "").trim();
        if (bare) return { site: "youtube", raw: bare };
        return null;
      }
      async function zjwayg18855304crlgshhktbrk8294(raw) {
        var url = ncxtkunkdzo47277769axdbbcx1191(raw);
        if (htylrmofq93660117dipvseurh9634(raw)) return { blocked: true };
        var card = url ? await wjfxjwssbidjz84520807rpsou9354(url) : await kknoaynriwht75365996oaobrs5589(raw);
        if (card && card.blocked) return card;
        if (!card || !card.title) return null;
        if (!ldptoitfwljwgv92419038kmgg4339(card)) return { blocked: true };
        if (ghpufcrpmydv84040670jjkjai8028(card.name, card.title)) return null;
        var who = card.name || raw;
        return { handle: who.replace(/\s+/g, ""), name: who, avatar: card.avatar || "", title: card.title, url: card.url || (url ? url.href : "") };
      }
      function cnealtobgh14391618pwborzma4718() {
        sqekwiiaic43984539dljmtlrd3071 = "";
        sxwtzjpefotp18741252vmmekc1074 = "";
        efxzways42219521rnxvkfnhce4762 = "";
        sopqgctet28973499mwrmwdwdx1060.removeAttribute("data-query");
        hrluaigr16106189qsijqunorp6469.value = "";
        hrluaigr16106189qsijqunorp6469.disabled = false;
        hrluaigr16106189qsijqunorp6469.removeAttribute("data-title");
        hrluaigr16106189qsijqunorp6469.placeholder = "";
        huavxkxwslyobr75710782gmud2432 = "x";
        if (ckvqeghunfg90345383jadskvw2735) {
          ckvqeghunfg90345383jadskvw2735.classList.add("is-on");
          ckvqeghunfg90345383jadskvw2735.classList.remove("has-photo");
          ckvqeghunfg90345383jadskvw2735.style.backgroundImage = "";
          ckvqeghunfg90345383jadskvw2735.textContent = "x";
        }
        if (qyffrl47381679pnivtllmhjlp7058) {
          qyffrl47381679pnivtllmhjlp7058.classList.remove("is-on", "has-photo");
          qyffrl47381679pnivtllmhjlp7058.style.backgroundImage = "";
          qyffrl47381679pnivtllmhjlp7058.textContent = "yt";
        }
        if (ekmihs05977354vnuamqugfrvx8192) ekmihs05977354vnuamqugfrvx8192.textContent = "Have Fun";
        if (kqyesnu77607123cgjkaeqwjim0168) kqyesnu77607123cgjkaeqwjim0168.removeAttribute("data-handle");
        sopqgctet28973499mwrmwdwdx1060.classList.remove("is-saved");
        try {
          localStorage.removeItem(obobojcwomsily81645021gruf0136);
          localStorage.removeItem("emciix-x-handle");
        } catch (err) {}
        hrluaigr16106189qsijqunorp6469.focus();
      }
      async function wjfxjwssbidjz84520807rpsou9354(url) {
        var id = nsbujnzohpdaql85477579knqv0434(url);
        var name = "";
        var avatar = "";
        var title = "";
        if (id) {
          var video = await fetch("https://noembed.com/embed?url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + id));
          var meta = await video.json();
          if (meta && meta.title && !meta.error) title = meta.title;
          name = meta && meta.author_name || "";
          if (htylrmofq93660117dipvseurh9634(title, name)) return { blocked: true };
          if (meta && meta.author_url) {
            try {
              var author = new URL(meta.author_url);
              var handle = (author.pathname.split("/").filter(Boolean)[0] || "").replace(/^@/, "");
              if (handle) {
                var found = await vlrfwz84471283vbfwybwrzsir0814(handle);
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
            if (htylrmofq93660117dipvseurh9634(listedInfo.title, listedInfo.author, listedItem && listedItem.title)) return { blocked: true };
            if (listedInfo.title || (listedItem && listedItem.title)) {
              return {
                name: listedInfo.title || "",
                avatar: "",
                title: (listedItem && listedItem.title) || listedInfo.title || "",
                url: (listedItem && listedItem.link) || ("https://www.youtube.com/playlist?list=" + list)
              };
            }
          } catch (e) {}
        }
        var channel = zqhogvmxe06586442zkfkweipa1260(url);
        var looked = null;
        if (!channel) {
          var parts = url.pathname.split("/").filter(Boolean);
          var handle = "";
          if ((parts[0] || "").charAt(0) === "@") handle = parts[0].slice(1);
          else if (parts[0] === "c" || parts[0] === "user") handle = parts[1] || "";
          if (handle) looked = await vlrfwz84471283vbfwybwrzsir0814(handle);
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
        if (htylrmofq93660117dipvseurh9634(info.title, info.author, item && item.title)) return { blocked: true };
        return {
          name: name || info.title || "",
          avatar: "",
          title: (item && item.title) || title,
          url: (item && item.link) || url.href
        };
      }
      function hskyvpfhfpsen04262903pfdda1177(url) {
        return ""; // text only: X profile photos are not used
      }
      async function zclcynathzlhc65610371jifgd9357(url) {
        var parts = url.pathname.split("/").filter(Boolean);
        var at = parts.indexOf("status");
        if (at >= 0 && parts[at + 1]) {
          var one = await fetch("https://api.fxtwitter.com/2/status/" + encodeURIComponent(parts[at + 1]));
          var post = await one.json();
          var status = post && post.status || {};
          var author = status.author || {};
          return { name: author.name || "", avatar: hskyvpfhfpsen04262903pfdda1177(author.avatar_url), title: wgizodzhqga43806590dlvphrp3829(status.text) };
        }
        var handle = (parts[0] || "").replace(/^@/, "");
        if (!handle || handle === "home" || handle === "search" || handle === "i" || handle === "intent") return { name: "", avatar: "", title: "" };
        var profile = await fetch("https://api.fxtwitter.com/2/profile/" + encodeURIComponent(handle));
        var user = (await profile.json()).user || {};
        var posts = await fetch("https://api.fxtwitter.com/2/profile/" + encodeURIComponent(handle) + "/statuses?count=1");
        var latest = ((await posts.json()).results || [])[0] || {};
        var who = latest.author || user;
        return { name: who.name || user.name || "", avatar: hskyvpfhfpsen04262903pfdda1177(who.avatar_url || user.avatar_url), title: wgizodzhqga43806590dlvphrp3829(latest.text) };
      }
      async function mhbirmquibntbc16984906oktt6684(href) {
        var res = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent(href));
        var data = await res.json();
        var html = data && data.contents ? String(data.contents) : "";
        var desc = zouzebb17321645nlnnybwcgat2622(html, "og:description");
        var title = zouzebb17321645nlnnybwcgat2622(html, "og:title");
        var name = String(title || "").replace(/\s*[|–-]\s*(LinkedIn|Facebook)\s*$/i, "").trim();
        var post = "";
        if (desc && !/log in|sign in|join linkedin|facebook/i.test(desc)) post = wgizodzhqga43806590dlvphrp3829(desc);
        return { name: name, avatar: "", title: post };
      }
      async function uhwqmsdc84962084gjyrihjddp4412(raw) {
        var url = ncxtkunkdzo47277769axdbbcx1191(raw);
        var site = url && luoiyyldjyxp64395244ajvnnj8768(url);
        if (!site) return null;
        var card = site === "youtube" ? await wjfxjwssbidjz84520807rpsou9354(url) : site === "x" ? await zclcynathzlhc65610371jifgd9357(url) : await mhbirmquibntbc16984906oktt6684(url.href);
        return card && card.blocked ? null : ldptoitfwljwgv92419038kmgg4339(card);
      }
      function zouzebb17321645nlnnybwcgat2622(html, obobojcwomsily81645021gruf0136) {
        var pattern = new RegExp("(?:property|name)=[\"']" + obobojcwomsily81645021gruf0136 + "[\"'][^>]*content=[\"']([^\"']+)[\"']|content=[\"']([^\"']+)[\"'][^>]*(?:property|name)=[\"']" + obobojcwomsily81645021gruf0136 + "[\"']", "i");
        var match = String(html || "").match(pattern);
        return match ? (match[1] || match[2] || "") : "";
      }
      function wxnlnttfuihuf85858819vlgli9030(next) {
        huavxkxwslyobr75710782gmud2432 = next === "youtube" ? "youtube" : "x";
        hrluaigr16106189qsijqunorp6469.value = "";
        hrluaigr16106189qsijqunorp6469.disabled = false;
        hrluaigr16106189qsijqunorp6469.placeholder = "";
        if (ekmihs05977354vnuamqugfrvx8192) ekmihs05977354vnuamqugfrvx8192.textContent = "Have Fun";
        if (ckvqeghunfg90345383jadskvw2735) ckvqeghunfg90345383jadskvw2735.classList.toggle("is-on", huavxkxwslyobr75710782gmud2432 !== "youtube");
        if (qyffrl47381679pnivtllmhjlp7058) qyffrl47381679pnivtllmhjlp7058.classList.toggle("is-on", huavxkxwslyobr75710782gmud2432 === "youtube");
        if (hrluaigr16106189qsijqunorp6469.offsetParent) hrluaigr16106189qsijqunorp6469.focus();
      }
      if (ckvqeghunfg90345383jadskvw2735) ckvqeghunfg90345383jadskvw2735.addEventListener("click", function (event) {
        event.preventDefault();
        wxnlnttfuihuf85858819vlgli9030("x");
      });
      if (qyffrl47381679pnivtllmhjlp7058) qyffrl47381679pnivtllmhjlp7058.addEventListener("click", function (event) {
        event.preventDefault();
        wxnlnttfuihuf85858819vlgli9030("youtube");
      });
      sopqgctet28973499mwrmwdwdx1060.addEventListener("submit", function (event) {
        event.preventDefault();
        qjdiyvm00191721amcfwtauque8188((hrluaigr16106189qsijqunorp6469.value || "").trim());
      });
      function qjdiyvm00191721amcfwtauque8188(value) {
        if (!value) return;
        if (ghpufcrpmydv84040670jjkjai8028(value)) { pawkofyzrlyip55338805vpxqv6785("No links"); return; }
        if (htylrmofq93660117dipvseurh9634(value) || mdnmjrqpdgswao02284145cxwa2597(value)) { pawkofyzrlyip55338805vpxqv6785(); return; }
        var kind = njtuebsbqny18740734idiniah4537(value);
        if (!kind) return;
        var site = kind.site;
        huavxkxwslyobr75710782gmud2432 = site;
        var handle = kind.raw;
        if (!handle) return;
        var shown = site === "x" ? "@" + handle : "YouTube";
        sqekwiiaic43984539dljmtlrd3071 = handle;
        sopqgctet28973499mwrmwdwdx1060.setAttribute("data-query", handle);
        hrluaigr16106189qsijqunorp6469.disabled = true;
        hrluaigr16106189qsijqunorp6469.placeholder = "";
        if (ekmihs05977354vnuamqugfrvx8192) ekmihs05977354vnuamqugfrvx8192.textContent = shown;
        var job = site === "youtube" ? zjwayg18855304crlgshhktbrk8294(handle) : clncgmxen94137901roiwcfkuj1455(handle);
        var fallback = "";
        job.then(function (card) {
          if (card && (card.blocked || !ldptoitfwljwgv92419038kmgg4339(card))) { pawkofyzrlyip55338805vpxqv6785(); return; }
          hrluaigr16106189qsijqunorp6469.disabled = false;
          var who = (card && card.handle) || handle;
          shown = site === "x" ? "@" + who : ((card && card.name) || "YouTube");
          var post = (card && card.title) || "";
          ytcfocacak62759417okgakgnk5741({
            name: (card && card.name) || who,
            avatar: card && card.avatar,
            title: post,
            post: post,
            sqekwiiaic43984539dljmtlrd3071: who,
            label: shown,
            keepPhoto: !(card && card.avatar)
          });
          hrluaigr16106189qsijqunorp6469.value = post || value;
          hrluaigr16106189qsijqunorp6469.placeholder = "";
          if (ekmihs05977354vnuamqugfrvx8192) ekmihs05977354vnuamqugfrvx8192.textContent = shown;
          vsqpdlxsocn08128670ewaspjg6513({
            handle: who,
            name: (card && card.name) || who,
            avatar: (card && card.avatar) || "",
            post: post,
            url: (card && card.url) || fallback,
            at: Date.now()
          });
        }).catch(function () {
          hrluaigr16106189qsijqunorp6469.disabled = false;
          hrluaigr16106189qsijqunorp6469.value = "";
          hrluaigr16106189qsijqunorp6469.placeholder = "";
          if (ekmihs05977354vnuamqugfrvx8192) ekmihs05977354vnuamqugfrvx8192.textContent = shown;
          ytcfocacak62759417okgakgnk5741({ sqekwiiaic43984539dljmtlrd3071: handle, label: shown, keepPhoto: true, keepName: true });
          vsqpdlxsocn08128670ewaspjg6513({
            handle: site === "x" ? handle : shown,
            name: shown,
            avatar: "",
            post: "",
            url: fallback,
            at: Date.now()
          });
        });
      }
      function pawkofyzrlyip55338805vpxqv6785(note) {
        sqekwiiaic43984539dljmtlrd3071 = "";
        sxwtzjpefotp18741252vmmekc1074 = "";
        efxzways42219521rnxvkfnhce4762 = "";
        sopqgctet28973499mwrmwdwdx1060.removeAttribute("data-query");
        hrluaigr16106189qsijqunorp6469.disabled = false;
        hrluaigr16106189qsijqunorp6469.value = "";
        hrluaigr16106189qsijqunorp6469.removeAttribute("data-title");
        hrluaigr16106189qsijqunorp6469.placeholder = note || "Try something else";
        if (ekmihs05977354vnuamqugfrvx8192) ekmihs05977354vnuamqugfrvx8192.textContent = "Have Fun";
        if (ckvqeghunfg90345383jadskvw2735) { ckvqeghunfg90345383jadskvw2735.classList.remove("has-photo"); ckvqeghunfg90345383jadskvw2735.style.backgroundImage = ""; }
        if (qyffrl47381679pnivtllmhjlp7058) { qyffrl47381679pnivtllmhjlp7058.classList.remove("has-photo"); qyffrl47381679pnivtllmhjlp7058.style.backgroundImage = ""; }
        sopqgctet28973499mwrmwdwdx1060.classList.remove("is-saved");
        try { localStorage.removeItem(obobojcwomsily81645021gruf0136); localStorage.removeItem("emciix-x-handle"); } catch (err) {}
        if (hrluaigr16106189qsijqunorp6469.offsetParent) hrluaigr16106189qsijqunorp6469.focus();
      }
      hrluaigr16106189qsijqunorp6469.addEventListener("input", function () {
        if (hrluaigr16106189qsijqunorp6469.placeholder) hrluaigr16106189qsijqunorp6469.placeholder = "";
      });
      window.emciixRefresh = function (event) {
        if (event) { event.preventDefault(); event.stopPropagation(); }
        cnealtobgh14391618pwborzma4718();
      };
      if (kqyesnu77607123cgjkaeqwjim0168) kqyesnu77607123cgjkaeqwjim0168.addEventListener("click", window.emciixRefresh, true);
      var optmxkasusy94411527fshwbdq5715 = document.getElementById("songsNav");
      var dwicyvws47221075vrkpdzzyke6295 = document.getElementById("grid");
      if (optmxkasusy94411527fshwbdq5715 && dwicyvws47221075vrkpdzzyke6295) {
        optmxkasusy94411527fshwbdq5715.addEventListener("click", function (event) {
          event.preventDefault();
          var open = dwicyvws47221075vrkpdzzyke6295.hidden;
          dwicyvws47221075vrkpdzzyke6295.hidden = !open;
          optmxkasusy94411527fshwbdq5715.setAttribute("aria-expanded", open ? "true" : "false");
          if (open) dwicyvws47221075vrkpdzzyke6295.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      }
      var ltmcxdddxcjzi73035102eggth6828 = "emciix-call-history";
      var jumfvnzfvrfi52182374ukpydn7269 = "https://firestore.googleapis.com/v1/projects/emciix-com/databases/(default)/documents/galacticCalls";
      function nlgkglguwvpolc75067823yguh0844() {
        try {
          var list = JSON.parse(localStorage.getItem(ltmcxdddxcjzi73035102eggth6828) || "[]");
          return Array.isArray(list) ? list : [];
        } catch (err) { return []; }
      }
      function cuwixdetz67256928vyxfepesn1285(list) {
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
      function ohhlhjduegoe30596459qeujlh8727(list) {
        var ol = document.getElementById("callHistory");
        var kicker = document.getElementById("callKicker");
        if (!ol) return;
        var rows = cuwixdetz67256928vyxfepesn1285(list);
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
          ava.textContent = ibzmsheqvf85173603rkvjgbel0524(row.name || row.handle) || "x";
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
      function zwvuxd89015507tlluzdaqclzb8077(doc) {
        var fields = doc && doc.fields || {};
        var at = fields.at && fields.at.integerValue != null ? parseInt(fields.at.integerValue, 10) || 0 : 0;
        return {
          handle: fields.handle && fields.handle.stringValue || "",
          name: fields.name && fields.name.stringValue || "",
          avatar: "",
          post: fields.post && fields.post.stringValue || "",
          at: at
        };
      }
      var dmixsuft52782118cyvldiqjie6611 = "https://raw.githubusercontent.com/e24g4vewetq3gwerb/emciix.com/main/calls/ledger.json";
      var twaybr45057914echloccwrcge4914 = "https://ntfy.sh/emciix-galactic-ledger-9f3c";
      var xfzanmomhjk31150221nxylxdn0159 = [];
      var yococxk80150771iguoasmurvg1842 = [];
      function zeyvfvzccipiws96700255uedw4258(row) {
        if (!row || !row.handle) return null;
        if (row.handle === "x" || row.handle === "smoketest" || row.handle === "probe2" || row.handle === "ledgerprobe") return null;
        if (htylrmofq93660117dipvseurh9634(row.handle, row.name, row.post, uxhjeqoeawytmv13629527gqrf4495(row.url))) return null;
        if (ghpufcrpmydv84040670jjkjai8028(row.handle, row.name, row.post)) return null;
        row.url = "";
        row.avatar = "";
        row.at = Number(row.at) || 0;
        return row;
      }
      function cyoikwde48444645uwhrtqamuj4235() {
        var seen = {};
        xfzanmomhjk31150221nxylxdn0159.forEach(function (row) { seen[row.handle + "|" + row.at] = 1; });
        var extra = yococxk80150771iguoasmurvg1842.filter(function (row) { return row && !seen[row.handle + "|" + row.at]; });
        ohhlhjduegoe30596459qeujlh8727(extra.concat(xfzanmomhjk31150221nxylxdn0159));
      }
      var vunpifrbfs57801975mcjiouak7572 = 0;
      function snsyhhzgwh57127153xsgmiyrv7152(data) {
        vunpifrbfs57801975mcjiouak7572 = Number(data && data.since) || 0;
        var rows = ((data && data.calls) || []).map(zeyvfvzccipiws96700255uedw4258).filter(Boolean);
        xfzanmomhjk31150221nxylxdn0159 = cuwixdetz67256928vyxfepesn1285(rows);
        cyoikwde48444645uwhrtqamuj4235();
      }
      function hicuop76266284gdetlfrvzqvg5995(row) {
        row = zeyvfvzccipiws96700255uedw4258(row);
        if (!row) return;
        if (vunpifrbfs57801975mcjiouak7572 && row.at < vunpifrbfs57801975mcjiouak7572) return;
        xfzanmomhjk31150221nxylxdn0159 = cuwixdetz67256928vyxfepesn1285([row].concat(xfzanmomhjk31150221nxylxdn0159));
        cyoikwde48444645uwhrtqamuj4235();
      }
      function llhajc00140768oopmgpystobn4110() {
        fetch(twaybr45057914echloccwrcge4914 + "/json?poll=1&since=12h", { cache: "no-store" }).then(function (res) {
          if (!res.ok) throw new Error("inbox");
          return res.text();
        }).then(function (text) {
          var rows = [];
          String(text || "").split("\n").forEach(function (line) {
            if (!line.trim()) return;
            try {
              var msg = JSON.parse(line);
              if (!msg || msg.event !== "message" || !msg.message) return;
              var extra = zeyvfvzccipiws96700255uedw4258(JSON.parse(msg.message));
              if (extra && (!vunpifrbfs57801975mcjiouak7572 || extra.at >= vunpifrbfs57801975mcjiouak7572)) rows.push(extra);
            } catch (err) {}
          });
          if (rows.length) {
            xfzanmomhjk31150221nxylxdn0159 = cuwixdetz67256928vyxfepesn1285(rows.concat(xfzanmomhjk31150221nxylxdn0159));
            cyoikwde48444645uwhrtqamuj4235();
          }
        }).catch(function () {});
      }
      function wyebyx92949772jrbmnhkmzwfr6435() {
        function vigeklapn57085578tpkmhvzpl6059(url) {
          return fetch(url, { cache: "no-store" }).then(function (res) {
            if (!res.ok) throw new Error("ledger");
            return res.json();
          });
        }
        vigeklapn57085578tpkmhvzpl6059("/calls/ledger.json?t=" + Date.now()).catch(function () {
          return vigeklapn57085578tpkmhvzpl6059(dmixsuft52782118cyvldiqjie6611 + "?t=" + Date.now());
        }).then(function (data) {
          snsyhhzgwh57127153xsgmiyrv7152(data);
          llhajc00140768oopmgpystobn4110();
        }).catch(function () {});
      }
      function vsqpdlxsocn08128670ewaspjg6513(entry) {
        if (!entry || !entry.handle || !zeyvfvzccipiws96700255uedw4258({ handle: entry.handle })) return;
        if (htylrmofq93660117dipvseurh9634(entry.handle, entry.name, entry.post, uxhjeqoeawytmv13629527gqrf4495(entry.url))) return;
        if (ghpufcrpmydv84040670jjkjai8028(entry.handle, entry.name, entry.post)) return;
        entry.avatar = "";
        entry.post = String(entry.post || "").slice(0, 180);
        entry.name = String(entry.name || entry.handle).slice(0, 70);
        entry.url = "";
        entry.at = entry.at || Date.now();
        hicuop76266284gdetlfrvzqvg5995(entry);
        fetch(twaybr45057914echloccwrcge4914, {
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
      wyebyx92949772jrbmnhkmzwfr6435();
      setInterval(llhajc00140768oopmgpystobn4110, 3000);
      setInterval(wyebyx92949772jrbmnhkmzwfr6435, 15000);
      try {
        var live = new EventSource(twaybr45057914echloccwrcge4914 + "/sse");
        live.onmessage = function (event) {
          try {
            var msg = JSON.parse(event.data);
            if (!msg || !msg.message) return;
            hicuop76266284gdetlfrvzqvg5995(JSON.parse(msg.message));
          } catch (err) {}
        };
      } catch (err) {}
    })();
