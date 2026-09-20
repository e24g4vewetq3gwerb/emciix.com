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
var PRICES = [
  ["2% milk","4 L"],
  ["Large eggs","12 ct"],
  ["Salted butter","454 g"],
  ["White bread","675 g"],
  ["Bananas","1 kg"],
  ["Tims coffee","340 g"],
  ["Tide liquid","~4.4 L"],
  ["Paper towel","6 pk"],
  ["Chicken breast","1 kg"],
  ["Rolled oats","1 kg"],
  ["White rice","2 kg"],
  ["Peanut butter","1 kg"],
  ["Cheddar","400 g"],
  ["Spaghetti","900 g"],
  ["Canned tomatoes","796 ml"]
];
var app = document.getElementById("app");
var screen = "home";
var song = 0;
var line = "";
try { line = localStorage.getItem("needLine") || ""; } catch (e) {}
function thumb(id){ return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"; }
function go(name){ screen = name; draw(); }
function draw(){
  if (screen === "song") return songScreen();
  if (screen === "place") return placeScreen();
  if (screen === "shop") return shopScreen();
  homeScreen();
}
function homeScreen(){
  app.innerHTML =
    '<div class="lock"><div class="mark">N</div><h1>Need</h1></div>' +
    '<p class="tag">A song. A town. A price.</p>' +
    '<div class="doors">' +
    door("Song","30-second preview. Keep or skip.","song") +
    door("This place","Sault Ste. Marie. Read a town. Leave a line.","place") +
    door("Shop","Need Price. Sault staples this week.","shop") +
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
  for (var i=0;i<doors.length;i++){
    doors[i].onclick = function(){ go(this.getAttribute("data-to")); };
  }
}
function bar(title){
  return '<div class="topbar"><button class="back" type="button" id="back">Need</button><b>'+title+'</b></div>';
}
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
    '<textarea id="line" placeholder="What does this place need?">'+line.replace(/</g,"")+'</textarea>'+
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
  var rows = "";
  for (var i=0;i<PRICES.length;i++){
    rows += '<div class="line"><span>'+PRICES[i][0]+' <span class="muted">'+PRICES[i][1]+'</span></span><span class="muted">walk</span></div>';
  }
  app.innerHTML =
    '<div class="screen">'+bar("Shop")+
    '<div class="card"><div class="pad"><b>Need Price</b>'+
    '<p class="muted" style="margin:6px 0 12px">Sault · week of Sep 20 · Walmart 446 Great Northern · No Frills 519 Korah</p>'+
    rows+
    '<p class="muted" style="margin-top:12px">$5 Interac to n.nafis98@gmail.com · Need Price Sep 20</p>'+
    '</div></div></div>';
  document.getElementById("back").onclick = function(){ go("home"); };
}
draw();
