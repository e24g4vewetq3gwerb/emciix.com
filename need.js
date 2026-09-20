var SONGS = [
  ["dG8z3nQeDSI","Need Hired by Me."],
  ["txA5vV_9XG4","Unemployed in Love"],
  ["05AgmKvd3NI","Make up shit"],
  ["MP9AIxzx55o","Everybody But Me"],
  ["RFqKvFDB0Hg","I Took Credit"],
  ["o040u9wAZns","Two phones, zero social life"],
  ["oq1c9I9T_tw","Which phone is it? iPhone or Android"],
  ["53Jny0alg9g","Still here"],
  ["cWy-1DZsHDg","XCode Swift Song"],
  ["9-nGIe8mQ0M","Wake you up Avicii"],
  ["Id4HSb9j8RA","You're Not Alone"],
  ["oCWCYVTs3vM","IDK What I'm Doing"],
  ["R7BunIbGheI","One More Light On"],
  ["m6cxgKh5QgE","Grid Run"],
  ["qZZuGfqancc","Solar System Party"],
  ["KhGqJCTO1Hc","Come Closer"]
];
var VENDORS = {
  "walmart-ca": { name:"Walmart", search:"https://www.walmart.ca/en/search?q={q}", country:"CA" },
  nofrills: { name:"No Frills", search:"https://www.nofrills.ca/search?search-bar={q}", country:"CA" },
  foodbasics: { name:"Food Basics", search:"https://www.foodbasics.ca/search?search-bar={q}", country:"CA" },
  freshco: { name:"FreshCo", search:"https://www.freshco.com/search?search-bar={q}", country:"CA" },
  loblaws: { name:"Loblaws", search:"https://www.loblaws.ca/search?search-bar={q}", country:"CA" },
  metro: { name:"Metro", search:"https://www.metro.ca/en/search?filter={q}", country:"CA" },
  superstore: { name:"Superstore", search:"https://www.realcanadiansuperstore.ca/search?search-bar={q}", country:"CA" },
  "amazon-ca": { name:"Amazon.ca", search:"https://www.amazon.ca/s?k={q}", country:"CA" },
  "walmart-us": { name:"Walmart", search:"https://www.walmart.com/search?q={q}", country:"US" },
  aldi: { name:"Aldi", search:"https://www.aldi.us/en/search/?q={q}", country:"US" },
  kroger: { name:"Kroger", search:"https://www.kroger.com/search?query={q}", country:"US" },
  target: { name:"Target", search:"https://www.target.com/s?searchTerm={q}", country:"US" }
};
function P(id,name,size,unit,offers){ return {id:id,name:name,size:size,unit:unit,offers:offers}; }
var PRODUCTS = [
  P("milk-2pct-4l","2% milk","4","L",[["walmart-ca",5.27,"Toronto"],["nofrills",5.49,"Toronto"],["foodbasics",5.19,"Toronto"],["freshco",5.37,"Toronto"],["loblaws",6.49,"Toronto"],["metro",6.29,"Montreal"],["superstore",5.69,"Toronto"],["amazon-ca",7.49,""],["walmart-us",3.24,"Chicago"],["aldi",2.89,"Chicago"],["kroger",3.49,"Austin"]]),
  P("eggs-12","large eggs","12","ct",[["walmart-ca",4.47,"Toronto"],["nofrills",4.69,"Toronto"],["foodbasics",4.19,"Toronto"],["freshco",4.33,"Toronto"],["metro",5.29,"Montreal"],["walmart-us",2.92,"Chicago"],["aldi",2.47,"Chicago"]]),
  P("butter-454","salted butter","454","g",[["walmart-ca",5.97,"Toronto"],["nofrills",6.49,"Toronto"],["loblaws",6.99,"Toronto"],["freshco",6.27,"Vancouver"],["walmart-us",4.48,"Chicago"]]),
  P("bread-white-675","white bread","675","g",[["walmart-ca",2.47,"Toronto"],["nofrills",2.99,"Toronto"],["foodbasics",2.33,"Toronto"],["walmart-us",1.98,"Chicago"],["aldi",1.49,"Chicago"]]),
  P("bananas-1kg","bananas","1","kg",[["walmart-ca",1.47,"Toronto"],["nofrills",1.54,"Toronto"],["foodbasics",1.29,"Toronto"],["freshco",1.33,"Vancouver"],["walmart-us",0.62,"Chicago"]]),
  P("coffee-340","ground coffee","340","g",[["walmart-ca",8.97,"Toronto"],["nofrills",9.99,"Toronto"],["loblaws",11.49,"Toronto"],["walmart-us",7.48,"Chicago"]]),
  P("tide-443","Tide liquid","4.43","L",[["walmart-ca",16.97,"Toronto"],["superstore",17.49,"Toronto"],["loblaws",18.99,"Toronto"],["walmart-us",11.97,"Chicago"]]),
  P("paper-towel-6","paper towel","6","pk",[["walmart-ca",8.47,"Toronto"],["nofrills",9.99,"Toronto"],["superstore",9.49,"Toronto"],["walmart-us",7.48,"Chicago"]]),
  P("chicken-1kg","chicken breast","1","kg",[["walmart-ca",11.47,"Toronto"],["nofrills",12.99,"Toronto"],["superstore",12.49,"Calgary"],["walmart-us",4.98,"Chicago"]]),
  P("oats-1kg","rolled oats","1","kg",[["walmart-ca",3.97,"Toronto"],["nofrills",4.49,"Toronto"],["freshco",4.19,"Toronto"],["walmart-us",2.98,"Chicago"]]),
  P("rice-2kg","white rice","2","kg",[["walmart-ca",4.97,"Toronto"],["nofrills",5.99,"Toronto"],["freshco",5.49,"Toronto"],["walmart-us",3.48,"Chicago"]]),
  P("peanut-butter-1kg","peanut butter","1","kg",[["walmart-ca",6.47,"Toronto"],["nofrills",7.49,"Toronto"],["freshco",6.99,"Toronto"],["walmart-us",5.28,"Chicago"]]),
  P("cheddar-400","cheddar","400","g",[["walmart-ca",5.97,"Toronto"],["nofrills",6.99,"Toronto"],["loblaws",7.49,"Toronto"],["walmart-us",3.98,"Chicago"]]),
  P("spaghetti-900","spaghetti","900","g",[["walmart-ca",1.97,"Toronto"],["nofrills",2.49,"Toronto"],["foodbasics",1.79,"Toronto"],["walmart-us",1.28,"Chicago"]]),
  P("tomatoes-796","canned tomatoes","796","ml",[["walmart-ca",1.47,"Toronto"],["nofrills",1.99,"Toronto"],["foodbasics",1.33,"Toronto"],["walmart-us",1.12,"Chicago"]])
];
var KEY = "needShop.v1";
var shop = loadShop();
var app = document.getElementById("app");
var screen = "home";
var song = 0;
var line = "";
var query = "";
var openId = null;
try { line = localStorage.getItem("needLine") || ""; } catch (e) {}
function loadShop(){
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { country:"CA", watching:{}, reports:{}, targets:{} };
}
function saveShop(){ try { localStorage.setItem(KEY, JSON.stringify(shop)); } catch (e) {} }
function money(n, country){
  var v = Number(n);
  if (!isFinite(v)) return "";
  return new Intl.NumberFormat(country==="US"?"en-US":"en-CA", {style:"currency", currency:country==="US"?"USD":"CAD"}).format(v);
}
function taxRate(country, city){
  var p = String(city||"").toLowerCase();
  if (country==="US") {
    if (/new york/.test(p)) return 0.08875;
    if (/chicago/.test(p)) return 0.1025;
    return 0.07;
  }
  if (/calgary|edmonton/.test(p)) return 0.05;
  if (/montreal|quebec/.test(p)) return 0.14975;
  if (/vancouver/.test(p)) return 0.12;
  return 0.13;
}
function productById(id){
  for (var i=0;i<PRODUCTS.length;i++) if (PRODUCTS[i].id===id) return PRODUCTS[i];
  return null;
}
function fold(s){ return String(s||"").toLowerCase(); }
function matches(p, q){
  if (!q) return true;
  var n = fold(q);
  return fold(p.name).indexOf(n)!==-1 || fold(p.id).indexOf(n)!==-1;
}
function rowsFor(p){
  var out = [];
  var offers = p.offers || [];
  for (var i=0;i<offers.length;i++){
    var o = offers[i];
    var v = VENDORS[o[0]];
    if (!v || v.country !== shop.country) continue;
    out.push({ vendorId:o[0], store:v.name, price:o[1], city:o[2], source:"typical", url:v.search.replace("{q}", encodeURIComponent(p.name)) });
  }
  var reps = shop.reports[p.id] || [];
  for (var j=0;j<reps.length;j++){
    var r = reps[j];
    if (r.country && r.country !== shop.country) continue;
    out.push({ vendorId:"", store:r.store, price:r.price, city:r.city, source:"you", url:"" });
  }
  out.sort(function(a,b){ return a.price - b.price; });
  return out;
}
function bestOf(p){
  var rows = rowsFor(p);
  return rows.length ? rows[0] : null;
}
function go(name){ screen = name; if (name!=="item") openId = null; draw(); }
function draw(){
  if (screen==="song") return songScreen();
  if (screen==="place") return placeScreen();
  if (screen==="shop") return shopScreen();
  if (screen==="item") return itemScreen();
  homeScreen();
}
function homeScreen(){
  app.innerHTML =
    '<div class="lock"><div class="mark">N</div><h1>Need</h1></div>' +
    '<p class="tag">A song. A town. A price.</p>' +
    '<div class="doors">' +
    door("Song","30-second preview. Keep or skip.","song") +
    door("This place","Sault Ste. Marie. Read a town. Leave a line.","place") +
    door("Shop","Live store prices. Search. Watch. Log a shelf.","shop") +
    '</div>' +
    '<p class="foot">No account. Pick one.</p>' +
    '<p class="foot"><a href="index.html" style="color:#007AFF;text-decoration:none;font-weight:700">Back to Emciix</a></p>';
  bindDoors();
}
function door(title, copy, to){
  return '<button class="door" data-to="'+to+'" type="button"><span class="ico">+</span><span class="copy"><span class="title">'+title+'</span><span class="sub">'+copy+'</span></span></button>';
}
function bindDoors(){
  var doors = app.querySelectorAll(".door");
  for (var i=0;i<doors.length;i++) doors[i].onclick = function(){ go(this.getAttribute("data-to")); };
}
function bar(title){
  return '<div class="topbar"><button class="back" type="button" id="back">Need</button><b>'+title+'</b></div>';
}
function thumb(id){ return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"; }
function songScreen(){
  var s = SONGS[song];
  app.innerHTML =
    '<div class="screen">'+bar("Song")+
    '<div class="card"><img alt="" src="'+thumb(s[0])+'">'+ 
    '<div class="pad"><div class="row"><div><b>'+s[1]+'</b><div class="muted">'+(song+1)+' / '+SONGS.length+' · 30 seconds</div></div>'+
    '<button class="p" type="button" id="play">Play</button></div>'+
    '<div id="stage"></div>'+
    '<div class="row" style="margin-top:12px"><button class="g" type="button" id="prev">Skip back</button>'+
    '<button class="g" type="button" id="next">Skip</button></div></div></div></div>';
  document.getElementById("back").onclick = function(){ go("home"); };
  document.getElementById("play").onclick = function(){
    document.getElementById("stage").innerHTML = '<iframe src="https://www.youtube.com/embed/'+s[0]+'?rel=0&modestbranding=1&playsinline=1&autoplay=1&end=30" allow="autoplay; encrypted-media" title="'+s[1]+'"></iframe>';
  };
  document.getElementById("next").onclick = function(){ song = (song+1)%SONGS.length; songScreen(); };
  document.getElementById("prev").onclick = function(){ song = (song-1+SONGS.length)%SONGS.length; songScreen(); };
}
function placeScreen(){
  app.innerHTML =
    '<div class="screen">'+bar("This place")+
    '<div class="card"><div class="pad"><b>Sault Ste. Marie</b>'+
    '<p class="muted" style="margin:6px 0 12px">Ontario. Leave a line for the town.</p>'+
    '<textarea id="line" placeholder="What does this place need?">'+String(line).replace(/</g,"")+'</textarea>'+
    '<div class="row" style="margin-top:12px"><button class="p" type="button" id="save">Keep line</button></div>'+
    '<p class="muted" id="saved" style="margin-top:10px"></p></div></div></div>';
  document.getElementById("back").onclick = function(){ go("home"); };
  document.getElementById("save").onclick = function(){
    line = document.getElementById("line").value || "";
    try { localStorage.setItem("needLine", line); } catch (e) {}
    document.getElementById("saved").textContent = "Kept on this phone.";
  };
}
function shopScreen(){
  var list = PRODUCTS.filter(function(p){ return matches(p, query); });
  var cards = "";
  for (var i=0;i<list.length;i++){
    var p = list[i];
    var best = bestOf(p);
    var watch = shop.watching[p.id] ? " · watching" : "";
    var price = best ? money(best.price, shop.country) : "No price yet";
    var where = best ? (best.store + (best.city?" · "+best.city:"")) : "";
    cards += '<button class="prod" type="button" data-id="'+p.id+'"><span><b>'+p.name+'</b><span class="muted">'+p.size+' '+p.unit+(where?" · "+where:"")+watch+'</span></span><b>'+price+'</b></button>';
  }
  app.innerHTML =
    '<div class="screen">'+bar("Shop")+
    '<div class="row" style="margin-bottom:10px">'+
    '<button class="g" type="button" id="ca">Canada</button>'+
    '<button class="g" type="button" id="us">United States</button></div>'+
    '<input class="search" id="q" type="search" placeholder="Milk, eggs, Tide, UPC…" value="'+String(query).replace(/"/g,"")+'" />'+
    '<p class="muted" style="margin:8px 0 12px">Typical shelf rates. Log what you saw. Watch a price. Open the store.</p>'+
    '<div class="list">'+cards+'</div></div>';
  document.getElementById("back").onclick = function(){ go("home"); };
  document.getElementById("ca").onclick = function(){ shop.country="CA"; saveShop(); shopScreen(); };
  document.getElementById("us").onclick = function(){ shop.country="US"; saveShop(); shopScreen(); };
  document.getElementById("q").oninput = function(){ query = this.value; };
  document.getElementById("q").onchange = function(){ query = this.value; shopScreen(); };
  document.getElementById("q").onkeydown = function(e){ if (e.key==="Enter") { query = this.value; shopScreen(); } };
  var prods = app.querySelectorAll(".prod");
  for (var k=0;k<prods.length;k++){
    prods[k].onclick = function(){ openId = this.getAttribute("data-id"); go("item"); };
  }
}
function itemScreen(){
  var p = productById(openId);
  if (!p) return shopScreen();
  var rows = rowsFor(p);
  var html = "";
  for (var i=0;i<rows.length;i++){
    var r = rows[i];
    var taxed = r.price * (1 + taxRate(shop.country, r.city));
    var link = r.url ? '<a href="'+r.url+'" target="_blank" rel="noopener">Search '+r.store+'</a>' : "";
    html += '<div class="offer"><div class="row"><div><b>'+r.store+(r.city?" · "+r.city:"")+'</b>'+
      '<div class="muted">'+(r.source==="you"?"you saw":"typical")+(r.source!=="you"?" · "+money(taxed, shop.country)+" after typical tax":"")+'</div></div>'+
      '<b>'+money(r.price, shop.country)+'</b></div>'+link+'</div>';
  }
  var watched = !!shop.watching[p.id];
  var tgt = shop.targets[p.id] || "";
  app.innerHTML =
    '<div class="screen">'+bar(p.name)+
    '<p class="muted" style="margin:-6px 0 12px">'+p.size+' '+p.unit+' · '+shop.country+'</p>'+
    html+
    '<div class="card" style="margin-top:14px"><div class="pad"><b>I saw this</b>'+
    '<p class="muted" style="margin:6px 0 10px">Shelf tag on this phone. Not a flyer.</p>'+
    '<input class="search" id="priceIn" inputmode="decimal" placeholder="Price" />'+
    '<input class="search" id="storeIn" placeholder="Store" style="margin-top:8px" />'+
    '<input class="search" id="cityIn" placeholder="City" style="margin-top:8px" />'+
    '<button class="p" type="button" id="log" style="margin-top:10px">Log sighting</button></div></div>'+
    '<div class="card" style="margin-top:12px"><div class="pad"><b>Watch</b>'+
    '<p class="muted" style="margin:6px 0 10px">Ping this phone when a logged price beats your target.</p>'+
    '<input class="search" id="targetIn" inputmode="decimal" placeholder="Target price" value="'+tgt+'" />'+
    '<div class="row" style="margin-top:10px"><button class="p" type="button" id="watch">'+(watched?"Watching":"Watch")+'</button>'+
    '<button class="g" type="button" id="clearw">Clear</button></div></div></div></div>';
  document.getElementById("back").onclick = function(){ go("shop"); };
  document.getElementById("log").onclick = function(){
    var price = Number(String(document.getElementById("priceIn").value).replace(/[^\d.]/g,""));
    var store = document.getElementById("storeIn").value.trim();
    var city = document.getElementById("cityIn").value.trim();
    if (!isFinite(price) || price < 0.01 || !store) return;
    if (!shop.reports[p.id]) shop.reports[p.id] = [];
    shop.reports[p.id].unshift({ price:Math.round(price*100)/100, store:store, city:city, country:shop.country, at:Date.now() });
    var t = Number(shop.targets[p.id]);
    if (shop.watching[p.id] && isFinite(t) && price <= t) {
      try { if (window.Notification && Notification.permission==="granted") new Notification(p.name + " is " + money(price, shop.country)); } catch (e) {}
    }
    saveShop();
    itemScreen();
  };
  document.getElementById("watch").onclick = function(){
    var t = Number(String(document.getElementById("targetIn").value).replace(/[^\d.]/g,""));
    shop.watching[p.id] = true;
    if (isFinite(t) && t > 0) shop.targets[p.id] = Math.round(t*100)/100;
    try { if (window.Notification && Notification.permission!=="granted") Notification.requestPermission(); } catch (e) {}
    saveShop();
    itemScreen();
  };
  document.getElementById("clearw").onclick = function(){
    delete shop.watching[p.id];
    delete shop.targets[p.id];
    saveShop();
    itemScreen();
  };
}
draw();
