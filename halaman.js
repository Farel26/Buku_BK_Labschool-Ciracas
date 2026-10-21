/* Gerak halaman: elemen .muncul naik perlahan saat terlihat, akordeon "Cara main" membuka satu panel. */
(function () {
  "use strict";
  var els = [].slice.call(document.querySelectorAll(".muncul"));
  function tampil(el) { el.classList.add("tampak"); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sib = [].slice.call(e.target.parentNode.children).filter(function (x) { return x.classList.contains("muncul"); });
        var i = Math.max(0, sib.indexOf(e.target));
        setTimeout(function () { tampil(e.target); }, Math.min(i, 6) * 80);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(tampil);
  /* cadangan: apa pun yang terjadi, semua konten tampil setelah 2,5 detik */
  setTimeout(function () { els.forEach(tampil); }, 2500);

  var panels = [].slice.call(document.querySelectorAll(".akordeon .panel"));
  panels.forEach(function (p) {
    p.addEventListener("click", function () {
      panels.forEach(function (x) { x.setAttribute("aria-expanded", x === p ? "true" : "false"); });
    });
  });
})();
