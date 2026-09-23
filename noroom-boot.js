(function () {
  try {
    if (typeof SONGS !== "undefined" && Array.isArray(SONGS)) {
      var exists = false;
      for (var i = 0; i < SONGS.length; i++) {
        if (SONGS[i] && (SONGS[i].id === "noroom4me01" || SONGS[i].title === "No Room for Me")) exists = true;
      }
      if (!exists) SONGS.unshift({ id: "noroom4me01", title: "No Room for Me" });
    }
  } catch (e) {}
  try {
    if (typeof DRIVE_MAP === "object" && DRIVE_MAP) {
      for (var k in DRIVE_MAP) {
        if (!Object.prototype.hasOwnProperty.call(DRIVE_MAP, k)) continue;
        var e = DRIVE_MAP[k];
        if (e && e.src && /\/media\/.+\.mp4(\?|$)/.test(e.src) && String(e.src).indexOf("no-room") < 0) {
          delete DRIVE_MAP[k];
        }
      }
      DRIVE_MAP.noroom4me01 = {
        title: "No Room for Me",
        driveId: "1VW7tUHPv_9EPp7-kguBQ3HJ95Bp37Qok",
        src: "/media/no-room-for-me.mp3",
        source: "drive"
      };
    }
  } catch (e2) {}
})();
