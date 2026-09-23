(function () {
  var searchQ = "";
  var grid = document.getElementById("grid");
  var search = document.getElementById("shelfSearch");
  var countEl = document.getElementById("shelfCount");
  if (!grid) return;

  function songs() {
    try {
      return typeof SONGS !== "undefined" ? SONGS : [];
    } catch (e) {
      return [];
    }
  }

  function viewsMap() {
    try {
      if (window.EmciixLiveYtViews && Object.keys(window.EmciixLiveYtViews).length) {
        return window.EmciixLiveYtViews;
      }
      return {};
    } catch (e) {
      return {};
    }
  }

  function viewCount(id) {
    var n = Number(viewsMap()[id]);
    return isFinite(n) ? n : -1;
  }

  function titleOf(card) {
    var p = card.querySelector("p");
    return (p && p.textContent) || "";
  }

  function matches(card) {
    if (!searchQ) return true;
    return titleOf(card).toLowerCase().indexOf(searchQ) !== -1;
  }

  function sortCards() {
    var list = Array.prototype.slice.call(grid.querySelectorAll(".card"));
    list.sort(function (a, b) {
      var ia = +a.getAttribute("data-i");
      var ib = +b.getAttribute("data-i");
      var sa = songs();
      var ida = a.getAttribute("data-id") || (sa[ia] && sa[ia].id) || "";
      var idb = b.getAttribute("data-id") || (sa[ib] && sa[ib].id) || "";
      var va = viewCount(ida);
      var vb = viewCount(idb);
      if (vb !== va) return vb - va;
      return ia - ib;
    });
    list.forEach(function (el, rank) {
      grid.appendChild(el);
      var badge = el.querySelector(".n");
      if (badge) badge.textContent = (rank + 1 < 10 ? "0" : "") + (rank + 1);
    });
    var playing = grid.querySelector(".card.playing");
    var badge = playing && playing.querySelector(".n");
    if (badge) {
      var label = badge.textContent.trim() + " / " + (list.length < 10 ? "0" : "") + list.length;
      var hud = document.querySelector(".stagehud");
      var kick = document.querySelector(".kicker-idx");
      if (hud) hud.textContent = label;
      if (kick) kick.textContent = label;
    }
  }

  function applyFilter() {
    var cards = grid.querySelectorAll(".card");
    var total = cards.length;
    var shown = 0;
    for (var i = 0; i < cards.length; i++) {
      var ok = matches(cards[i]);
      cards[i].classList.toggle("filtered", !ok);
      if (ok) shown++;
    }
    if (countEl) countEl.textContent = shown + " of " + total;
  }

  function refresh() {
    sortCards();
    applyFilter();
  }

  window.EmciixShelfRefresh = refresh;

  if (search) {
    search.addEventListener("input", function () {
      searchQ = (search.value || "").trim().toLowerCase();
      applyFilter();
    });
  }

  refresh();
})();
