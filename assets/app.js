(function () {
  const emojiAssetVersion = "apple-emoji-safe-2";
  const root = document.documentElement;
  const modeToggle = document.querySelector("[data-mode-toggle]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const hero = document.querySelector(".hero");
  const discoMoon = document.querySelector("[data-disco-moon]");
  const stars = document.querySelector("[data-stars]");
  const scene = document.querySelector("[data-disco-scene]");
  let heroInView = true;
  let glimmerTimer = 0;
  const browserChromeColors = {
    day: "#fdf3d3",
    night: "#160b34"
  };
  const emojiSources = {
    backpack: "assets/emoji/webp/backpack.webp",
    banjo: "assets/emoji/webp/banjo.webp",
    blossom: "assets/emoji/webp/blossom.webp",
    cherryBlossom: "assets/emoji/webp/cherry_blossom.webp",
    cow: "assets/emoji/webp/cow.webp",
    crescentMoon: "assets/emoji/webp/crescent_moon.webp",
    discoBall: "assets/emoji/webp/disco_ball.webp",
    fire: "assets/emoji/webp/fire.webp",
    herb: "assets/emoji/webp/herb.webp",
    headphones: "assets/emoji/webp/headphones.webp",
    manDancing: "assets/emoji/webp/man_dancing.webp",
    moonFace: "assets/emoji/webp/moon_face.webp",
    musicalNote: "assets/emoji/webp/musical_note.webp",
    musicalNotes: "assets/emoji/webp/musical_notes.webp",
    seedling: "assets/emoji/webp/seedling.webp",
    sparkles: "assets/emoji/webp/sparkles.webp",
    sun: "assets/emoji/webp/sun.webp",
    sunSymbol: "assets/emoji/webp/sun_symbol.webp",
    sunflower: "assets/emoji/webp/sunflower.webp",
    trumpet: "assets/emoji/webp/trumpet.webp",
    womanDancing: "assets/emoji/webp/woman_dancing.webp"
  };
  const sceneSets = {
    day: [
      ["cow", 8, 12, 1.1],
      ["trumpet", 20, 19, 1.25],
      ["banjo", 31, 23, 1.15],
      ["manDancing", 14, 52, 1.2],
      ["cow", 25, 59, 1.05],
      ["cow", 36, 56, 1.08],
      ["womanDancing", 56, 43, 1.16],
      ["sunflower", 66, 39, 1.22],
      ["sunSymbol", 79, 45, 1.42],
      ["blossom", 52, 68, 1.2],
      ["herb", 63, 70, 1.24],
      ["cherryBlossom", 74, 69, 1.24]
    ],
    night: [
      ["cow", 8, 12, 1.08],
      ["trumpet", 20, 19, 1.18],
      ["banjo", 31, 23, 1.12],
      ["discoBall", 45, 16, 1.18],
      ["headphones", 57, 22, 1.12],
      ["musicalNotes", 69, 16, 1.05],
      ["crescentMoon", 82, 25, 1.2],
      ["manDancing", 17, 56, 1.22],
      ["womanDancing", 39, 51, 1.18],
      ["fire", 56, 67, 1.25],
      ["sparkles", 70, 63, 1.08],
      ["cow", 84, 58, 1.1]
    ]
  };

  function createEmojiImage(name) {
    const img = document.createElement("img");
    img.className = "emoji-img";
    img.src = `${emojiSources[name]}?v=${emojiAssetVersion}`;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.setAttribute("aria-hidden", "true");
    return img;
  }

  function readStoredMode() {
    try {
      return localStorage.getItem("mooncow-mode");
    } catch {
      return null;
    }
  }

  function writeStoredMode(mode) {
    try {
      localStorage.setItem("mooncow-mode", mode);
    } catch {
      // Browsing contexts with blocked storage should still be able to switch modes.
    }
  }

  function preferredMode() {
    const stored = readStoredMode();
    if (stored === "day" || stored === "night") return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day";
  }

  function setMode(mode) {
    const isNight = mode === "night";
    root.classList.toggle("night", isNight);
    root.classList.toggle("day", !isNight);
    syncBrowserChrome(mode);
    if (modeToggle) {
      modeToggle.setAttribute("aria-label", isNight ? "Switch to day" : "Switch to night");
      modeToggle.setAttribute("aria-pressed", String(isNight));
      const dayIcon = modeToggle.querySelector(".mode-toggle__icon--day");
      const nightIcon = modeToggle.querySelector(".mode-toggle__icon--night");
      if (dayIcon) dayIcon.hidden = isNight;
      if (nightIcon) nightIcon.hidden = !isNight;
    }
    updateHeroMotion();
  }

  function updateHeroMotion() {
    const isNight = root.classList.contains("night");
    const active = isNight && heroInView && document.visibilityState !== "hidden";
    root.classList.toggle("hero-motion-paused", !active);
    if (!active) {
      clearHeroGlimmer();
    } else if (!root.classList.contains("hero-glimmer-active") && !glimmerTimer) {
      glimmerTimer = window.setTimeout(() => {
        glimmerTimer = 0;
        if (root.classList.contains("night") && !root.classList.contains("hero-motion-paused")) {
          root.classList.add("hero-glimmer-active");
        }
      }, 450);
    }
  }

  function clearHeroGlimmer() {
    if (glimmerTimer) {
      window.clearTimeout(glimmerTimer);
      glimmerTimer = 0;
    }
    root.classList.remove("hero-glimmer-active");
  }

  function setupHeroMotionObserver() {
    if (!hero) return;
    document.addEventListener("visibilitychange", updateHeroMotion);
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      heroInView = Boolean(entry && entry.isIntersecting);
      updateHeroMotion();
    }, { rootMargin: "180px 0px 180px 0px", threshold: 0 });
    observer.observe(hero);
  }

  function syncBrowserChrome(mode) {
    const color = browserChromeColors[mode] || browserChromeColors.day;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const iosMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    root.style.backgroundColor = color;
    if (document.body) document.body.style.backgroundColor = color;
    if (themeMeta) themeMeta.setAttribute("content", color);
    if (iosMeta) iosMeta.setAttribute("content", mode === "night" ? "black-translucent" : "default");

    window.setTimeout(() => {
      if (themeMeta) themeMeta.setAttribute("content", color);
    }, 80);
  }

  function buildDiscoMoon() {
    if (!discoMoon || discoMoon.dataset.ready) return;
    discoMoon.dataset.ready = "true";
    const face = document.createElement("span");
    face.className = "moon-face";
    discoMoon.appendChild(face);
    const svgNS = "http://www.w3.org/2000/svg";
    const clipId = "moon-disco-clip";
    const svg = document.createElementNS(svgNS, "svg");
    svg.classList.add("moon-svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    const defs = document.createElementNS(svgNS, "defs");
    defs.innerHTML = `
      <radialGradient id="moon-base-gradient" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#fff8d4"></stop>
        <stop offset="42%" stop-color="#f7d96e"></stop>
        <stop offset="72%" stop-color="#c69a3c"></stop>
        <stop offset="100%" stop-color="#6d4b3a"></stop>
      </radialGradient>
      <radialGradient id="moon-top-shine" cx="31%" cy="22%" r="32%">
        <stop offset="0%" stop-color="#fff" stop-opacity=".88"></stop>
        <stop offset="42%" stop-color="#fff" stop-opacity=".22"></stop>
        <stop offset="100%" stop-color="#fff" stop-opacity="0"></stop>
      </radialGradient>
      <linearGradient id="moon-diagonal-shine" x1="10%" y1="8%" x2="90%" y2="92%">
        <stop offset="0%" stop-color="#fff" stop-opacity=".55"></stop>
        <stop offset="32%" stop-color="#fff" stop-opacity=".04"></stop>
        <stop offset="52%" stop-color="#fff" stop-opacity=".26"></stop>
        <stop offset="70%" stop-color="#fff" stop-opacity=".03"></stop>
        <stop offset="100%" stop-color="#fff" stop-opacity="0"></stop>
      </linearGradient>
      <linearGradient id="moon-reflection-gradient" x1="0%" y1="25%" x2="100%" y2="75%">
        <stop offset="0%" stop-color="#fff" stop-opacity="0"></stop>
        <stop offset="38%" stop-color="#fff" stop-opacity="0"></stop>
        <stop offset="48%" stop-color="#fff" stop-opacity=".36"></stop>
        <stop offset="58%" stop-color="#fff6b1" stop-opacity=".18"></stop>
        <stop offset="72%" stop-color="#fff" stop-opacity="0"></stop>
        <stop offset="100%" stop-color="#fff" stop-opacity="0"></stop>
      </linearGradient>
      <clipPath id="${clipId}">
        <circle cx="50" cy="50" r="50"></circle>
      </clipPath>
    `;
    svg.appendChild(defs);

    const clipped = document.createElementNS(svgNS, "g");
    clipped.setAttribute("clip-path", `url(#${clipId})`);
    svg.appendChild(clipped);

    const base = document.createElementNS(svgNS, "circle");
    base.classList.add("moon-svg-base");
    base.setAttribute("cx", "50");
    base.setAttribute("cy", "50");
    base.setAttribute("r", "50");
    base.setAttribute("fill", "url(#moon-base-gradient)");
    clipped.appendChild(base);

    const facetGroup = document.createElementNS(svgNS, "g");
    facetGroup.classList.add("moon-facet-grid");
    clipped.appendChild(facetGroup);
    const colors = ["#fff8c7", "#ffe99a", "#f6d66e", "#fffdf0", "#d9e6ff", "#f4cfd8", "#dbc4ff", "#f0f4ff"];
    const cols = 18;
    const rows = 18;
    const facets = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const rowCurve = Math.abs(r - (rows - 1) / 2) / rows;
        const colCurve = Math.abs(c - (cols - 1) / 2) / cols;
        const x = (c / cols) * 100 + 0.45 + rowCurve * 1.5;
        const y = (r / rows) * 100 + 0.55;
        const width = 100 / cols - 0.9 - rowCurve * 3;
        const height = 100 / rows - 1.1;
        const opacity = 0.5 + ((c + r) % 4) * 0.07 - colCurve * 0.08;
        const delay = -((c / cols) * 4.8 + (r % 4) * 0.12);
        const liveClass = (r * 7 + c * 11) % 3 === 0 ? " moon-facet--live" : "";
        facets.push(`<rect class="moon-facet${liveClass}" x="${x}" y="${y}" width="${width}" height="${height}" rx="1.1" fill="${colors[(r * 5 + c * 3) % colors.length]}" style="opacity: ${opacity}; animation-delay: ${delay}s"></rect>`);
      }
    }
    facetGroup.innerHTML = facets.join("");

    const craterA = document.createElementNS(svgNS, "circle");
    craterA.classList.add("moon-crater");
    craterA.setAttribute("cx", "64");
    craterA.setAttribute("cy", "69");
    craterA.setAttribute("r", "8");
    clipped.appendChild(craterA);

    const craterB = document.createElementNS(svgNS, "circle");
    craterB.classList.add("moon-crater", "moon-crater-small");
    craterB.setAttribute("cx", "36");
    craterB.setAttribute("cy", "60");
    craterB.setAttribute("r", "6");
    clipped.appendChild(craterB);

    const shineA = document.createElementNS(svgNS, "circle");
    shineA.classList.add("moon-svg-shine");
    shineA.setAttribute("cx", "31");
    shineA.setAttribute("cy", "22");
    shineA.setAttribute("r", "31");
    shineA.setAttribute("fill", "url(#moon-top-shine)");
    clipped.appendChild(shineA);

    const lines = document.createElementNS(svgNS, "g");
    lines.classList.add("moon-grid-lines");
    const lineMarkup = [];
    for (let i = 1; i < 7; i += 1) {
      const x = [7.8, 19.9, 33.9, 48.9, 64.9, 80.9][i - 1];
      lineMarkup.push(`<rect x="${x}" y="0" width="1" height="100"></rect>`);
    }
    for (let i = 1; i < 8; i += 1) {
      lineMarkup.push(`<rect x="0" y="${i * 12.5}" width="100" height=".7"></rect>`);
    }
    lines.innerHTML = lineMarkup.join("");
    clipped.appendChild(lines);

    const diagonal = document.createElementNS(svgNS, "rect");
    diagonal.classList.add("moon-diagonal-shine");
    diagonal.setAttribute("x", "0");
    diagonal.setAttribute("y", "0");
    diagonal.setAttribute("width", "100");
    diagonal.setAttribute("height", "100");
    diagonal.setAttribute("fill", "url(#moon-diagonal-shine)");
    clipped.appendChild(diagonal);

    const reflection = document.createElementNS(svgNS, "rect");
    reflection.classList.add("moon-reflection");
    reflection.setAttribute("x", "-10");
    reflection.setAttribute("y", "-10");
    reflection.setAttribute("width", "120");
    reflection.setAttribute("height", "120");
    reflection.setAttribute("fill", "url(#moon-reflection-gradient)");
    clipped.appendChild(reflection);

    face.appendChild(svg);

    const sparkleFragment = document.createDocumentFragment();
    for (let i = 0; i < 26; i += 1) {
      const sparkle = document.createElement("span");
      const angle = (i / 26) * Math.PI * 2;
      const radius = 72 + (i % 3) * 13;
      const size = 10 + (i % 4) * 4;
      sparkle.className = "moon-sparkle";
      sparkle.textContent = "✦";
      sparkle.style.left = `calc(50% + ${Math.cos(angle) * radius}px - ${size / 2}px)`;
      sparkle.style.top = `calc(50% + ${Math.sin(angle) * radius}px - ${size / 2}px)`;
      sparkle.style.fontSize = `${size}px`;
      sparkle.style.animationDelay = `${(i * 0.13) % 2}s`;
      sparkleFragment.appendChild(sparkle);
    }
    discoMoon.appendChild(sparkleFragment);
  }

  function buildStars() {
    if (!stars || stars.dataset.ready) return;
    stars.dataset.ready = "true";
    const starFragment = document.createDocumentFragment();
    for (let i = 0; i < 40; i += 1) {
      const star = document.createElement("span");
      let top = (i * 73) % 55 + 2;
      let left = (i * 157) % 96 + 1;
      if (left < 58 && top > 32 && top < 54) {
        top -= 12;
        left += 30;
      }
      star.className = "star";
      star.textContent = "✦";
      star.style.top = `${top}%`;
      star.style.left = `${left}%`;
      star.style.fontSize = `${6 + (i % 4) * 3}px`;
      star.style.animationDelay = `${(i * 0.13) % 2}s`;
      starFragment.appendChild(star);
    }
    stars.appendChild(starFragment);
  }

  function buildScene() {
    if (!scene || scene.dataset.ready) return;
    scene.dataset.ready = "true";
    Object.entries(sceneSets).forEach(([mode, emojis]) => {
      const layer = document.createElement("span");
      const fragment = document.createDocumentFragment();
      layer.className = `scene-layer scene-layer--${mode}`;
      layer.setAttribute("aria-hidden", "true");
      emojis.forEach(([emojiName, left, top, scale], i) => {
        const actor = document.createElement("span");
        actor.className = `scene-actor ${["mc-bob", "mc-shimmy", "mc-bounce", "mc-drift", "mc-flicker"][i % 5]}`;
        actor.appendChild(createEmojiImage(emojiName));
        actor.style.left = `${left}%`;
        actor.style.top = `${top}%`;
        actor.style.setProperty("--scale", String(scale));
        actor.style.animationDelay = `${(i * 0.31) % 1.7}s`;
        fragment.appendChild(actor);
      });
      layer.appendChild(fragment);
      scene.appendChild(layer);
    });
  }

  function setupModeToggleIcons() {
    const knob = modeToggle && modeToggle.querySelector(".mode-toggle__knob");
    if (!knob || knob.dataset.ready) return;
    knob.dataset.ready = "true";
    const dayIcon = createEmojiImage("sun");
    const nightIcon = createEmojiImage("moonFace");
    dayIcon.classList.add("mode-toggle__icon", "mode-toggle__icon--day");
    nightIcon.classList.add("mode-toggle__icon", "mode-toggle__icon--night");
    knob.replaceChildren(dayIcon, nightIcon);
  }

  function closeMobileNav() {
    if (!mobileNav || !menuToggle) return;
    mobileNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  }

  function setupMobileNav() {
    if (!menuToggle || !mobileNav) return;
    menuToggle.addEventListener("click", () => {
      const open = !mobileNav.classList.contains("is-open");
      mobileNav.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    mobileNav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) closeMobileNav();
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMobileNav();
    });
  }

  function setupMediaObserver() {
    const videos = Array.from(document.querySelectorAll("video"));
    if (!videos.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (!(video instanceof HTMLVideoElement)) return;
        if (entry.isIntersecting) {
          const promise = video.play();
          if (promise && promise.catch) promise.catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.35 });
    videos.forEach((video) => observer.observe(video));
  }

  function setupSoundcloudEmbed() {
    const embed = document.querySelector("[data-soundcloud-embed]");
    const iframe = embed && embed.querySelector("iframe[data-src]");
    if (!(iframe instanceof HTMLIFrameElement)) return;

    const loadEmbed = () => {
      if (!iframe.dataset.src) return;
      iframe.src = iframe.dataset.src;
      iframe.removeAttribute("data-src");
      embed.classList.add("is-loaded");
    };

    if (!("IntersectionObserver" in window)) {
      window.addEventListener("load", loadEmbed, { once: true });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      loadEmbed();
      observer.disconnect();
    }, { rootMargin: "700px 0px" });

    observer.observe(embed);
  }

  buildDiscoMoon();
  buildStars();
  buildScene();
  setupHeroMotionObserver();
  setupModeToggleIcons();
  setupMobileNav();
  setupMediaObserver();
  setupSoundcloudEmbed();
  setMode(preferredMode());

  if (modeToggle) {
    modeToggle.addEventListener("click", () => {
      const next = root.classList.contains("night") ? "day" : "night";
      writeStoredMode(next);
      setMode(next);
    });
  }

  // ── Carousel ───────────────────────────────────────────────
  document.querySelectorAll("[data-carousel-next], [data-carousel-prev]").forEach(btn => {
    const carouselId = btn.dataset.carouselNext || btn.dataset.carouselPrev;
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;

    const slides = carousel.querySelectorAll(".carousel-slide");
    const dotsContainer = document.querySelector(`[data-carousel-dots="${carouselId}"]`);

    // Build dots
    if (dotsContainer) {
      slides.forEach((_, i) => {
        const dot = document.createElement("span");
        dot.className = "carousel-dot" + (i === 0 ? " is-active" : "");
        dotsContainer.appendChild(dot);
      });
    }

    const updateDots = () => {
      if (!dotsContainer) return;
      const slideWidth = slides[0].offsetWidth + 16; // gap = 1rem = 16px
      const activeIdx = Math.round(carousel.scrollLeft / slideWidth);
      dotsContainer.querySelectorAll(".carousel-dot").forEach((dot, i) => {
        dot.classList.toggle("is-active", i === activeIdx);
      });
    };

    carousel.addEventListener("scroll", updateDots, { passive: true });

    btn.addEventListener("click", () => {
      const slideWidth = slides[0].offsetWidth + 16;
      const dir = btn.dataset.carouselNext !== undefined ? 1 : -1;
      carousel.scrollBy({ left: dir * slideWidth, behavior: "smooth" });
    });
  });
})();
