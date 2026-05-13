(function () {
  try {
    var stored = localStorage.getItem("theme");
    var systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || (!stored && systemDark)) {
      document.documentElement.classList.add("dark");
    }
    if (localStorage.getItem("promo-only25k-dismissed")) {
      document.documentElement.classList.add("promo-dismissed");
    }
  } catch (e) {
    /* ignore — fail open */
  }
})();
