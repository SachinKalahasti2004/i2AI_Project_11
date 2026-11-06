// Shared header, footer and small rendering helpers.
(function () {
  const HB = window.HB;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const domainName = (k) => (HB.domains.find((d) => d.key === k) || {}).name || k;
  const pill = (lvl) => `<span class="pill ${lvl}">${HB.levels[lvl].label}</span>`;
  const tag = (o) => `<span class="tag ${o}">${HB.outcomes[o]}</span>`;

  /** Assist → Encourage → Require strip with Expected / Model markers. */
  function motif(exp, mod) {
    return `<div class="motif" role="img" aria-label="Expected: ${HB.levels[exp].label}. Model: ${mod ? HB.levels[mod].label : "not shown"}.">` +
      HB.order.map((l) => {
        const on = l === exp || l === mod;
        const marks = (l === exp ? `<span class="mark exp">Expected</span>` : "") + (mod && l === mod ? `<span class="mark">Model</span>` : "");
        return `<div class="seg-step ${l} ${on ? "on" : ""}">${HB.levels[l].short}<div class="marks">${marks}</div></div>`;
      }).join("") + `</div>`;
  }

  const nav = [
    ["index.html", "Home"],
    ["methodology.html", "Methodology"],
    ["benchmark.html", "Benchmark"],
    ["results.html", "Results"],
    ["analysis.html", "Analysis"]
  ];

  function chrome() {
    const here = location.pathname.split("/").pop() || "index.html";
    const h = document.getElementById("site-header");
    if (h) h.outerHTML = `
      <header class="site-header">
        <div class="wrap">
          <a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true"><i style="background:var(--none)"></i><i style="background:var(--enc)"></i><i style="background:var(--req)"></i></span>Handoff Bench</a>
          <nav class="site-nav" aria-label="Main">
            ${nav.map(([href, label]) => `<a href="${href}"${href === here ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
            <a class="cta" href="data/benchmark.json" download>Dataset</a>
          </nav>
        </div>
      </header>
      <div class="note-bar"><div class="wrap">Content note: includes synthetic scenarios about distress, harm and unsafe requests. A research resource for adults, not a service for children.</div></div>`;
    const idx = nav.findIndex(([href]) => href === here);
    const pg = document.getElementById("pager");
    if (pg && idx >= 0) {
      const prev = nav[idx - 1], next = nav[idx + 1];
      pg.outerHTML = `<nav class="pager" aria-label="Page order">
        ${prev ? `<a href="${prev[0]}"><span>Previous</span>← ${prev[1]}</a>` : "<span></span>"}
        ${next ? `<a class="next" href="${next[0]}"><span>Next</span>${next[1]} →</a>` : "<span></span>"}
      </nav>`;
    }
    const f = document.getElementById("site-footer");
    if (f) f.outerHTML = `
      <footer class="site-footer">
        <div class="wrap">
          <span>Handoff Bench v0.1 · Module 1 of a child-centered AI evaluation suite · [Team / course]</span>
          <span><a href="methodology.html#cite">Cite</a> · <a href="#">GitHub</a> · License [CC-BY-4.0] · Not for model training</span>
        </div>
      </footer>`;
  }

  window.UI = { esc, domainName, pill, tag, motif };
  chrome();
})();
