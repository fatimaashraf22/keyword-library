// ---- Live GSAP demos ----
// Instead of a static picture, some Motion-tab cards show the actual named
// animation, running live and looping, coded with the real GSAP library.
// Each function takes the empty .card-media (or #modal-media) element and
// builds + animates its own small scene inside it.

gsap.registerPlugin(ScrollTrigger);

function dot(container, extraClass) {
  const d = document.createElement("div");
  d.className = "demo-dot" + (extraClass ? " " + extraClass : "");
  container.appendChild(d);
  return d;
}

// A centered "stage" with an inner fixed-size scene, used by the concept demos
// (entrances, exits, transitions) so a coloured card can be animated inside it.
function scene(container, extraClass) {
  container.classList.add("demo-stage");
  const s = document.createElement("div");
  s.className = "demo-scene" + (extraClass ? " " + extraClass : "");
  container.appendChild(s);
  return s;
}

function card2(sceneEl, extraClass) {
  const el = document.createElement("div");
  el.className = "demo-card2" + (extraClass ? " " + extraClass : "");
  sceneEl.appendChild(el);
  return el;
}

window.KEYWORD_DEMOS = {
  tween(container) {
    container.classList.add("demo-stage");
    const d = dot(container);
    gsap.fromTo(d, { x: -60 }, { x: 60, duration: 1.2, ease: "power2.inOut", yoyo: true, repeat: -1 });
  },

  timeline(container) {
    container.classList.add("demo-stage", "demo-timeline");
    const boxes = [1, 2, 3].map(() => {
      const b = document.createElement("span");
      b.className = "demo-block";
      container.appendChild(b);
      return b;
    });
    gsap.set(boxes, { opacity: 0, y: 16 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .to(boxes[0], { opacity: 1, y: 0, duration: 0.4 })
      .to(boxes[1], { opacity: 1, y: 0, duration: 0.4 }, "+=0.1")
      .to(boxes[2], { opacity: 1, y: 0, duration: 0.4 }, "+=0.1")
      .to(boxes, { opacity: 0, y: -16, duration: 0.4, delay: 0.6 });
  },

  easing(container) {
    container.classList.add("demo-stage", "demo-easing");
    const rowLinear = document.createElement("div");
    rowLinear.className = "ease-track";
    rowLinear.innerHTML = '<span class="ease-label">linear</span>';
    const dotA = document.createElement("span");
    dotA.className = "demo-dot";
    rowLinear.appendChild(dotA);

    const rowEased = document.createElement("div");
    rowEased.className = "ease-track";
    rowEased.innerHTML = '<span class="ease-label">eased</span>';
    const dotB = document.createElement("span");
    dotB.className = "demo-dot";
    rowEased.appendChild(dotB);

    container.appendChild(rowLinear);
    container.appendChild(rowEased);

    gsap
      .timeline({ repeat: -1, repeatDelay: 0.5 })
      .fromTo(dotA, { x: 0 }, { x: 110, duration: 1.3, ease: "none" }, 0)
      .fromTo(dotB, { x: 0 }, { x: 110, duration: 1.3, ease: "power2.inOut" }, 0)
      .set([dotA, dotB], { x: 0 }, "+=0.5");
  },

  stagger(container) {
    container.classList.add("demo-stage", "demo-stagger");
    const dots = [1, 2, 3, 4, 5].map(() => dot(container));
    gsap.set(dots, { y: 16, opacity: 0 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .to(dots, { y: 0, opacity: 1, duration: 0.35, stagger: 0.12 })
      .to(dots, { y: -16, opacity: 0, duration: 0.3, delay: 0.5 });
  },

  scrolltrigger(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="demo-scroll-hint">scroll me ↕</div>
      <div class="demo-scroll-box">
        <div class="demo-scroll-content">
          <div class="demo-scroll-fill"></div>
        </div>
      </div>`;
    const scrollBox = container.querySelector(".demo-scroll-box");
    const content = container.querySelector(".demo-scroll-content");
    const fill = container.querySelector(".demo-scroll-fill");
    gsap.set(fill, { scaleY: 0, transformOrigin: "top" });
    gsap.to(fill, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { trigger: content, scroller: scrollBox, start: "top top", end: "bottom bottom", scrub: true },
    });
  },

  "elastic-ease"(container) {
    container.classList.add("demo-stage");
    const d = dot(container);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.8 })
      .fromTo(d, { x: -70 }, { x: 70, duration: 1.2, ease: "elastic.out(1, 0.4)" })
      .set(d, { x: -70 }, "+=0.4");
  },

  "bounce-ease"(container) {
    container.classList.add("demo-stage");
    const d = dot(container);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.8 })
      .fromTo(d, { y: -50 }, { y: 50, duration: 1, ease: "bounce.out" })
      .set(d, { y: -50 }, "+=0.4");
  },

  "back-ease"(container) {
    container.classList.add("demo-stage");
    const d = dot(container);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.8 })
      .fromTo(d, { x: -70 }, { x: 70, duration: 1, ease: "back.out(3)" })
      .set(d, { x: -70 }, "+=0.4");
  },

  keyframes(container) {
    container.classList.add("demo-stage");
    const d = dot(container);
    gsap.to(d, {
      keyframes: [
        { x: 50, y: -18, rotation: 90, duration: 0.5 },
        { x: 90, y: 18, rotation: 180, duration: 0.5 },
        { x: 0, y: 0, rotation: 360, duration: 0.5 },
      ],
      repeat: -1,
      repeatDelay: 0.5,
    });
  },

  "from-fromto"(container) {
    container.classList.add("demo-stage");
    const b = document.createElement("div");
    b.className = "demo-block demo-block--solo";
    container.appendChild(b);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.7 })
      .fromTo(b, { scale: 0.3, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 0.7, ease: "power2.out" })
      .to(b, { scale: 0.3, opacity: 0.3, duration: 0.4, delay: 0.5 });
  },

  "draw-on-stroke"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <svg viewBox="0 0 100 100" class="demo-svg">
        <path d="M10,50 Q50,10 90,50 Q50,90 10,50 Z" fill="none" stroke="var(--accent)" stroke-width="4" />
      </svg>`;
    const path = container.querySelector("path");
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, { strokeDashoffset: 0, duration: 1.4, ease: "power1.inOut", repeat: -1, repeatDelay: 0.6 });
  },

  "stagger-reveal"(container) {
    container.classList.add("demo-stage", "demo-stagger-reveal");
    const rows = [1, 2, 3, 4].map(() => {
      const r = document.createElement("div");
      r.className = "demo-reveal-row";
      container.appendChild(r);
      return r;
    });
    gsap.set(rows, { x: -24, opacity: 0 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .to(rows, { x: 0, opacity: 1, duration: 0.35, stagger: 0.18 })
      .to(rows, { x: 24, opacity: 0, duration: 0.3, delay: 0.6 });
  },

  "morph-path"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <svg viewBox="0 0 100 100" class="demo-svg">
        <rect x="30" y="30" width="40" height="40" rx="4" fill="var(--accent)" class="morph-square" />
        <circle cx="50" cy="50" r="22" fill="var(--accent)" class="morph-circle" />
      </svg>`;
    const square = container.querySelector(".morph-square");
    const circle = container.querySelector(".morph-circle");
    gsap.set(circle, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" });
    gsap.set(square, { transformOrigin: "50% 50%" });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .to(square, { opacity: 0, scale: 0.6, rotation: 90, duration: 0.6 })
      .to(circle, { opacity: 1, scale: 1, duration: 0.6 }, "<")
      .to(circle, { opacity: 0, scale: 0.6, duration: 0.6, delay: 0.6 })
      .to(square, { opacity: 1, scale: 1, rotation: 0, duration: 0.6 }, "<");
  },

  // Interactive: one prebuilt timeline, played on mouse-enter and reversed on
  // mouse-leave (the GSAP "interaction events" pattern). Hover the dark box and
  // the dialogue springs up; leave and it tucks back down.
  "hover-reveal"(container) {
    container.classList.add("demo-stage", "demo-hover");
    container.innerHTML = `
      <div class="hover-trigger">
        <div class="hover-tip">Hello there 👋</div>
        <div class="hover-box">hover me</div>
      </div>`;
    const trigger = container.querySelector(".hover-trigger");
    const tip = container.querySelector(".hover-tip");
    gsap.set(tip, { opacity: 0, y: 8, scale: 0.9, transformOrigin: "50% 100%" });
    const tl = gsap
      .timeline({ paused: true })
      .to(tip, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(2)" });
    trigger.addEventListener("mouseenter", () => tl.play());
    trigger.addEventListener("mouseleave", () => tl.reverse());
  },

  // ---- Motion Graphics Elements (live) ----

  // Text that IS the animation — words pop in one by one, then blow out.
  "kinetic-typography"(container) {
    container.classList.add("demo-stage", "demo-kinetic");
    const spans = ["MAKE", "IT", "MOVE"].map((w) => {
      const s = document.createElement("span");
      s.className = "kt-word";
      s.textContent = w;
      container.appendChild(s);
      return s;
    });
    gsap.set(spans, { opacity: 0, scale: 0.3, y: 18 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.5 })
      .to(spans, { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.22, ease: "back.out(2)" })
      .to(spans, { opacity: 0, scale: 1.5, duration: 0.35, stagger: 0.1, delay: 0.6 });
  },

  // ---- Text Animation (live) ----

  // Each letter animates in on its own — flipping up from its baseline.
  "character-animation"(container) {
    container.classList.add("demo-stage", "demo-textline");
    const letters = "MOTION".split("").map((ch) => {
      const s = document.createElement("span");
      s.className = "tl-char";
      s.textContent = ch;
      container.appendChild(s);
      return s;
    });
    gsap.set(letters, { transformOrigin: "50% 100%" });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.7 })
      .fromTo(
        letters,
        { rotationX: -95, y: 12, opacity: 0 },
        { rotationX: 0, y: 0, opacity: 1, duration: 0.5, stagger: 0.09, ease: "back.out(2)" }
      )
      .to(letters, { y: -12, opacity: 0, duration: 0.35, stagger: 0.05, delay: 0.8 });
  },

  // A line built one word at a time, in reading order.
  "word-by-word"(container) {
    container.classList.add("demo-stage", "demo-textline");
    const words = ["read", "it", "word", "by", "word"].map((w) => {
      const s = document.createElement("span");
      s.className = "tl-word";
      s.textContent = w;
      container.appendChild(s);
      return s;
    });
    gsap.set(words, { opacity: 0, y: 12 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.7 })
      .to(words, { opacity: 1, y: 0, duration: 0.4, stagger: 0.18, ease: "power2.out" })
      .to(words, { opacity: 0, y: -12, duration: 0.35, stagger: 0.08, delay: 1 });
  },

  // Letters cascade in with a small delay between each.
  "letter-stagger"(container) {
    container.classList.add("demo-stage", "demo-textline");
    const letters = "STAGGER".split("").map((ch) => {
      const s = document.createElement("span");
      s.className = "tl-char";
      s.textContent = ch;
      container.appendChild(s);
      return s;
    });
    gsap.set(letters, { opacity: 0, y: 20 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.7 })
      .to(letters, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" })
      .to(letters, { opacity: 0, y: 20, duration: 0.3, stagger: 0.04, delay: 1 });
  },

  // One word cross-dissolves into another — letters blurring between the two.
  "text-morph"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="morph-text">
        <span class="mt-word mt-a">shape</span>
        <span class="mt-word mt-b">motion</span>
      </div>`;
    const a = container.querySelector(".mt-a");
    const b = container.querySelector(".mt-b");
    gsap.set(b, { opacity: 0, filter: "blur(8px)", scale: 1.15 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.4 })
      .to(a, { opacity: 0, filter: "blur(8px)", scale: 0.85, duration: 0.7, ease: "power2.inOut", delay: 0.6 })
      .to(b, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.7, ease: "power2.inOut" }, "<")
      .to(b, { opacity: 0, filter: "blur(8px)", scale: 0.85, duration: 0.7, ease: "power2.inOut", delay: 0.6 })
      .to(a, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.7, ease: "power2.inOut" }, "<");
  },

  // Text emerges from behind an edge as a mask slides away.
  "mask-reveal-text"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `<div class="mask-text"><span>REVEAL</span></div>`;
    const word = container.querySelector(".mask-text span");
    gsap.set(word, { yPercent: 115 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .to(word, { yPercent: 0, duration: 0.7, ease: "power4.out" })
      .to(word, { yPercent: -115, duration: 0.6, delay: 1, ease: "power4.in" })
      .set(word, { yPercent: 115 });
  },

  // Letters flicker and split into RGB channels — a broken-signal look.
  "glitch-text"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="glitch-demo">
        <span class="gl gl-r">GLITCH</span>
        <span class="gl gl-b">GLITCH</span>
        <span class="gl gl-main">GLITCH</span>
      </div>`;
    const r = container.querySelector(".gl-r");
    const b = container.querySelector(".gl-b");
    const main = container.querySelector(".gl-main");
    const jitter = () => {
      gsap.to(r, { x: gsap.utils.random(-4, 4), y: gsap.utils.random(-2, 2), duration: 0.08 });
      gsap.to(b, { x: gsap.utils.random(-4, 4), y: gsap.utils.random(-2, 2), duration: 0.08 });
      gsap.to(main, { x: gsap.utils.random(-2, 2), skewX: gsap.utils.random(-6, 6), opacity: gsap.utils.random(0.75, 1), duration: 0.08 });
    };
    gsap.to({}, { duration: 0.09, repeat: -1, onRepeat: jitter });
  },

  // One number counting up to its final value.
  "stat-card"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `<div class="stat-card-demo"><div class="stat-num">0%</div><div class="stat-label">faster</div></div>`;
    const num = container.querySelector(".stat-num");
    const obj = { v: 0 };
    const write = () => (num.textContent = Math.round(obj.v) + "%");
    gsap
      .timeline({ repeat: -1, repeatDelay: 1 })
      .to(obj, { v: 95, duration: 1.4, ease: "power1.out", onUpdate: write })
      .to(obj, { v: 0, duration: 0.3, delay: 1.2, onUpdate: write });
  },

  // Bars that grow up into place.
  charts(container) {
    container.classList.add("demo-stage", "demo-chart");
    const heights = [42, 68, 52, 88, 60];
    const bars = heights.map(() => {
      const b = document.createElement("span");
      b.className = "chart-bar";
      container.appendChild(b);
      return b;
    });
    gsap.set(bars, { height: 2 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.8 })
      .to(bars, { height: (i) => heights[i], duration: 0.7, stagger: 0.1, ease: "power2.out" })
      .to(bars, { height: 2, duration: 0.4, stagger: 0.06, delay: 0.8 });
  },

  // Pieces assemble into a mark, then the wordmark appears.
  "logo-reveal"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="logo-scene">
        <span class="logo-piece logo-p1"></span>
        <span class="logo-piece logo-p2"></span>
        <span class="logo-piece logo-p3"></span>
        <span class="logo-piece logo-p4"></span>
        <span class="logo-word">BRAND</span>
      </div>`;
    const pieces = container.querySelectorAll(".logo-piece");
    const word = container.querySelector(".logo-word");
    gsap.set(pieces, { scale: 0, rotation: -90, opacity: 0, transformOrigin: "50% 50%" });
    gsap.set(word, { opacity: 0, y: 10 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.8 })
      .to(pieces, { scale: 1, rotation: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(2)" })
      .to(word, { opacity: 1, y: 0, duration: 0.4 }, "-=0.1")
      .to([pieces, word], { opacity: 0, duration: 0.4, delay: 0.9 });
  },

  // Speaker name/title banner sliding in from the left.
  "lower-third"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="lt-demo">
        <div class="lt-bar">
          <div class="lt-name">Jane Doe</div>
          <div class="lt-title">Motion Designer</div>
        </div>
      </div>`;
    const bar = container.querySelector(".lt-bar");
    const name = container.querySelector(".lt-name");
    const title = container.querySelector(".lt-title");
    gsap.set(bar, { xPercent: -130, opacity: 0 });
    gsap.set([name, title], { opacity: 0, x: -10 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 1 })
      .to(bar, { xPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" })
      .to(name, { opacity: 1, x: 0, duration: 0.3 }, "-=0.1")
      .to(title, { opacity: 1, x: 0, duration: 0.3 }, "-=0.15")
      .to(bar, { xPercent: -130, opacity: 0, duration: 0.4, delay: 1 });
  },

  // A line + label drawing out to point at something.
  callout(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="co-scene">
        <span class="co-target"></span>
        <span class="co-line"></span>
        <span class="co-label">this!</span>
      </div>`;
    const target = container.querySelector(".co-target");
    const line = container.querySelector(".co-line");
    const label = container.querySelector(".co-label");
    gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(label, { opacity: 0, x: -6 });
    gsap.set(target, { scale: 0.6, opacity: 0.4 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.9 })
      .to(target, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" })
      .to(line, { scaleX: 1, duration: 0.35, ease: "power2.out" })
      .to(label, { opacity: 1, x: 0, duration: 0.3 })
      .to([target, line, label], { opacity: 0, duration: 0.4, delay: 0.9 });
  },

  // A bar filling from 0 to 100%.
  "progress-bar"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `<div class="pb-track"><div class="pb-fill"></div></div>`;
    const fill = container.querySelector(".pb-fill");
    gsap.set(fill, { width: "0%" });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .to(fill, { width: "100%", duration: 1.4, ease: "power1.inOut" })
      .to(fill, { width: "0%", duration: 0.5, delay: 0.6 });
  },

  // A line draws across and event nodes pop on along it.
  "mg-timeline"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="tl-scene">
        <div class="tl-line"></div>
        <span class="tl-node"></span><span class="tl-node"></span>
        <span class="tl-node"></span><span class="tl-node"></span>
      </div>`;
    const line = container.querySelector(".tl-line");
    const nodes = container.querySelectorAll(".tl-node");
    gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(nodes, { scale: 0, opacity: 0 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.9 })
      .to(line, { scaleX: 1, duration: 0.8, ease: "power2.out" })
      .to(nodes, { scale: 1, opacity: 1, duration: 0.3, stagger: 0.15, ease: "back.out(2.5)" }, "-=0.5")
      .to([line, nodes], { opacity: 0, duration: 0.4, delay: 0.9 });
  },

  // Audio bars pulsing at their own rhythm.
  waveform(container) {
    container.classList.add("demo-stage", "demo-wave");
    for (let i = 0; i < 9; i++) {
      const b = document.createElement("span");
      b.className = "wave-bar";
      container.appendChild(b);
      gsap.to(b, {
        scaleY: gsap.utils.random(0.4, 1),
        duration: gsap.utils.random(0.3, 0.6),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.05,
      });
    }
  },

  // ---- Animation Concepts (live) ----

  "pop-in"(container) {
    const s = scene(container);
    const a = card2(s);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.5 })
      .fromTo(a, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2.5)" })
      .to(a, { scale: 0, opacity: 0, duration: 0.3, delay: 0.7, ease: "power1.in" });
  },

  "slide-in"(container) {
    const s = scene(container);
    const a = card2(s);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.5 })
      .fromTo(a, { xPercent: -180, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" })
      .to(a, { xPercent: 180, opacity: 0, duration: 0.45, delay: 0.7, ease: "power2.in" });
  },

  "fade-in"(container) {
    const s = scene(container);
    const a = card2(s);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.5 })
      .fromTo(a, { opacity: 0 }, { opacity: 1, duration: 0.6 })
      .to(a, { opacity: 0, duration: 0.5, delay: 0.8 });
  },

  // One card wipes across to cover the other.
  wipe(container) {
    const s = scene(container);
    card2(s);
    const b = card2(s, "demo-card2--b");
    gsap.set(b, { clipPath: "inset(0 0 0 100%)" });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .to(b, { clipPath: "inset(0 0 0 0%)", duration: 0.6, ease: "power2.inOut" })
      .to(b, { clipPath: "inset(0 100% 0 0)", duration: 0.6, delay: 0.8, ease: "power2.inOut" })
      .set(b, { clipPath: "inset(0 0 0 100%)" });
  },

  // A masked card unmasking, then re-masking.
  reveal(container) {
    const s = scene(container);
    const a = card2(s);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .fromTo(a, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "power2.out" })
      .to(a, { clipPath: "inset(0 0 0 100%)", duration: 0.5, delay: 0.8, ease: "power2.in" });
  },

  // Moves in, then a deliberate still beat (labelled), then moves on.
  hold(container) {
    container.classList.add("demo-stage", "demo-hold");
    const d = dot(container);
    const tag = document.createElement("span");
    tag.className = "hold-tag";
    tag.textContent = "hold";
    container.appendChild(tag);
    gsap.set(tag, { opacity: 0 });
    gsap
      .timeline({ repeat: -1 })
      .fromTo(d, { x: -60 }, { x: 0, duration: 0.5, ease: "power2.out" })
      .to(tag, { opacity: 1, duration: 0.2 })
      .to(tag, { opacity: 1, duration: 0.9 })
      .to(tag, { opacity: 0, duration: 0.2 })
      .to(d, { x: 60, duration: 0.5, ease: "power2.in" })
      .set(d, { x: -60 }, "+=0.3");
  },

  "count-up"(container) {
    container.classList.add("demo-stage");
    const n = document.createElement("div");
    n.className = "stat-num";
    n.textContent = "0";
    container.appendChild(n);
    const obj = { v: 0 };
    const write = () => (n.textContent = Math.round(obj.v));
    gsap
      .timeline({ repeat: -1, repeatDelay: 1 })
      .to(obj, { v: 100, duration: 1.3, ease: "power1.out", onUpdate: write })
      .to(obj, { v: 0, duration: 0.3, delay: 1, onUpdate: write });
  },

  "scale-swap"(container) {
    const s = scene(container);
    const a = card2(s);
    const b = card2(s, "demo-card2--b");
    gsap.set(b, { scale: 0 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .to(a, { scale: 0, duration: 0.5, ease: "power2.in" })
      .to(b, { scale: 1, duration: 0.5, ease: "back.out(1.7)" }, "<")
      .to(b, { scale: 0, duration: 0.5, ease: "power2.in", delay: 0.8 })
      .to(a, { scale: 1, duration: 0.5, ease: "back.out(1.7)" }, "<");
  },

  // Overshoots huge, snaps to size with a little shake.
  slam(container) {
    const s = scene(container);
    const a = card2(s);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .fromTo(a, { scale: 2.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "power4.out" })
      .fromTo(s, { x: -5 }, { x: 0, duration: 0.5, ease: "elastic.out(1.5, 0.3)" })
      .to(a, { scale: 2.6, opacity: 0, duration: 0.3, delay: 0.8, ease: "power2.in" });
  },

  // Springs into place with an elastic overshoot, then wobbles and settles.
  "elastic-bounce"(container) {
    const s = scene(container);
    const a = card2(s);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.5 })
      .fromTo(
        a,
        { scale: 0, y: -28 },
        { scale: 1, y: 0, duration: 1.1, ease: "elastic.out(1, 0.35)" }
      )
      .to(a, { scale: 0, opacity: 0, duration: 0.35, delay: 0.9, ease: "power2.in" })
      .set(a, { opacity: 1 });
  },

  // Three stacked layers drifting at different speeds = parallax depth.
  "depth-layers"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="depth-scene">
        <span class="depth-layer depth-back"></span>
        <span class="depth-layer depth-mid"></span>
        <span class="depth-layer depth-front"></span>
      </div>`;
    const back = container.querySelector(".depth-back");
    const mid = container.querySelector(".depth-mid");
    const front = container.querySelector(".depth-front");
    gsap.to(back, { x: 12, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(mid, { x: 24, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(front, { x: 40, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
  },

  // A solid shape floating over a transparency checkerboard.
  "alpha-overlay"(container) {
    container.classList.add("demo-stage", "demo-alpha");
    container.innerHTML = `
      <div class="alpha-checker"></div>
      <span class="alpha-shape"></span>
      <span class="alpha-tag">alpha</span>`;
    const shape = container.querySelector(".alpha-shape");
    gsap.to(shape, { y: -14, duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(shape, { rotation: 360, duration: 4, ease: "none", repeat: -1 });
  },

  "fade-out"(container) {
    const s = scene(container);
    const a = card2(s);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.4 })
      .set(a, { opacity: 1 })
      .to(a, { opacity: 0, duration: 0.7, delay: 0.6, ease: "power1.in" });
  },

  "slide-out"(container) {
    const s = scene(container);
    const a = card2(s);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.4 })
      .set(a, { xPercent: 0, opacity: 1 })
      .to(a, { xPercent: 180, opacity: 0, duration: 0.55, delay: 0.6, ease: "power2.in" });
  },

  "scale-out"(container) {
    const s = scene(container);
    const a = card2(s);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.4 })
      .set(a, { scale: 1, opacity: 1 })
      .to(a, { scale: 0, opacity: 0, duration: 0.55, delay: 0.6, ease: "power2.in" });
  },

  "fly-out"(container) {
    const s = scene(container);
    const a = card2(s);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.4 })
      .set(a, { x: 0, y: 0, rotation: 0, opacity: 1 })
      .to(a, { x: 150, y: -45, rotation: 40, opacity: 0, duration: 0.5, delay: 0.6, ease: "power3.in" });
  },

  // Card breaks into particles that scatter and fade.
  dissolve(container) {
    const s = scene(container);
    const a = card2(s);
    const bits = [];
    for (let i = 0; i < 12; i++) {
      const p = document.createElement("span");
      p.className = "demo-bit";
      s.appendChild(p);
      bits.push(p);
    }
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.5 })
      .set(a, { opacity: 1 })
      .set(bits, { opacity: 0, x: 0, y: 0 })
      .to(a, { opacity: 0, duration: 0.35, delay: 0.6 })
      .to(bits, { opacity: 1, duration: 0.05 }, "<")
      .to(
        bits,
        {
          x: () => gsap.utils.random(-55, 55),
          y: () => gsap.utils.random(-40, 40),
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
        },
        "<"
      );
  },

  "cross-fade"(container) {
    const s = scene(container);
    const a = card2(s);
    const b = card2(s, "demo-card2--b");
    gsap.set(b, { opacity: 0 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .to(a, { opacity: 0, duration: 0.7 })
      .to(b, { opacity: 1, duration: 0.7 }, "<")
      .to(b, { opacity: 0, duration: 0.7, delay: 0.8 })
      .to(a, { opacity: 1, duration: 0.7 }, "<");
  },

  // One card slides in and shoves the other out the same way.
  push(container) {
    const s = scene(container);
    const a = card2(s);
    const b = card2(s, "demo-card2--b");
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .fromTo(a, { xPercent: 0 }, { xPercent: -110, duration: 0.7, ease: "power2.inOut" }, 0)
      .fromTo(b, { xPercent: 110 }, { xPercent: 0, duration: 0.7, ease: "power2.inOut" }, 0)
      .fromTo(b, { xPercent: 0 }, { xPercent: -110, duration: 0.7, ease: "power2.inOut", delay: 0.8, immediateRender: false })
      .fromTo(a, { xPercent: 110 }, { xPercent: 0, duration: 0.7, ease: "power2.inOut", immediateRender: false }, "<");
  },

  // The whole frame turns over like a card to show the other side.
  flip(container) {
    container.classList.add("demo-stage", "demo-perspective");
    const s = scene(container, "demo-flip");
    const a = card2(s);
    const b = card2(s, "demo-card2--b");
    gsap.set(s, { transformStyle: "preserve-3d" });
    gsap.set(a, { backfaceVisibility: "hidden" });
    gsap.set(b, { backfaceVisibility: "hidden", rotationY: 180 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .fromTo(s, { rotationY: 0 }, { rotationY: 180, duration: 0.9, ease: "power2.inOut" })
      .fromTo(s, { rotationY: 180 }, { rotationY: 360, duration: 0.9, ease: "power2.inOut", delay: 0.6, immediateRender: false });
  },

  // ================= Motion — GSAP properties (live) =================

  // The three flavours of the default ease, racing side by side.
  "power-ease"(container) {
    container.classList.add("demo-stage", "demo-easing");
    const eases = ["in", "out", "inOut"];
    const dots = eases.map((label) => {
      const row = document.createElement("div");
      row.className = "ease-track";
      row.innerHTML = `<span class="ease-label">power.${label}</span>`;
      const d = document.createElement("span");
      d.className = "demo-dot";
      row.appendChild(d);
      container.appendChild(row);
      return d;
    });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
    eases.forEach((label, i) =>
      tl.fromTo(dots[i], { x: 0 }, { x: 110, duration: 1.3, ease: "power2." + label }, 0)
    );
    tl.set(dots, { x: 0 }, "+=0.5");
  },

  // A dot tracing the x then y axes (an L-shaped path).
  xy(container) {
    container.classList.add("demo-stage");
    const d = dot(container);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.4 })
      .fromTo(d, { x: -50, y: -30 }, { x: 50, duration: 0.7, ease: "power2.inOut" })
      .to(d, { y: 30, duration: 0.7, ease: "power2.inOut" })
      .to(d, { x: -50, duration: 0.7, ease: "power2.inOut" })
      .to(d, { y: -30, duration: 0.7, ease: "power2.inOut" });
  },

  scale(container) {
    container.classList.add("demo-stage");
    const b = document.createElement("div");
    b.className = "demo-block demo-block--solo";
    container.appendChild(b);
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.3 })
      .fromTo(b, { scale: 0.4 }, { scale: 1.5, duration: 0.9, ease: "power1.inOut" })
      .to(b, { scale: 0.4, duration: 0.9, ease: "power1.inOut" });
  },

  rotation(container) {
    container.classList.add("demo-stage");
    const b = document.createElement("div");
    b.className = "demo-block demo-block--solo";
    container.appendChild(b);
    gsap.to(b, { rotation: 360, duration: 2, ease: "none", repeat: -1 });
  },

  opacity(container) {
    container.classList.add("demo-stage");
    const b = document.createElement("div");
    b.className = "demo-block demo-block--solo";
    container.appendChild(b);
    gsap.fromTo(b, { opacity: 1 }, { opacity: 0.1, duration: 1, ease: "sine.inOut", yoyo: true, repeat: -1 });
  },

  // A square rotating around a pivot pinned to its top-left corner.
  "transform-origin"(container) {
    container.classList.add("demo-stage");
    const wrap = document.createElement("div");
    wrap.className = "to-scene";
    wrap.innerHTML = `<span class="to-box"></span><span class="to-pivot"></span>`;
    container.appendChild(wrap);
    gsap.set(wrap.querySelector(".to-box"), { transformOrigin: "0% 0%" });
    gsap.to(wrap.querySelector(".to-box"), { rotation: 360, duration: 2.6, ease: "power1.inOut", repeat: -1 });
  },

  // Bits bursting outward from the centre on a loop.
  "particle-effects"(container) {
    container.classList.add("demo-stage");
    const bits = [];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("span");
      p.className = "pfx-bit";
      container.appendChild(p);
      bits.push(p);
    }
    const fire = () => {
      bits.forEach((p) => {
        const a = gsap.utils.random(0, Math.PI * 2);
        const dist = gsap.utils.random(28, 68);
        gsap.set(p, { x: 0, y: 0, opacity: 1, scale: gsap.utils.random(0.5, 1.2) });
        gsap.to(p, { x: Math.cos(a) * dist, y: Math.sin(a) * dist, opacity: 0, duration: gsap.utils.random(0.8, 1.4), ease: "power2.out" });
      });
    };
    fire();
    gsap.to({}, { duration: 1.5, repeat: -1, onRepeat: fire });
  },

  // ================= UI Components (live) =================

  typewriter(container) {
    container.classList.add("demo-stage");
    const wrap = document.createElement("div");
    wrap.className = "type-demo";
    wrap.innerHTML = `<span class="type-text"></span><span class="type-caret"></span>`;
    container.appendChild(wrap);
    const el = wrap.querySelector(".type-text");
    const full = "Hello, world!";
    const obj = { n: 0 };
    const write = () => (el.textContent = full.slice(0, Math.round(obj.n)));
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.4 })
      .to(obj, { n: full.length, duration: 1.6, ease: "none", onUpdate: write })
      .to(obj, { n: 0, duration: 0.6, delay: 1, ease: "none", onUpdate: write });
    gsap.to(wrap.querySelector(".type-caret"), { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(1)" });
  },

  hud(container) {
    container.classList.add("demo-stage", "demo-hud");
    container.innerHTML = `
      <span class="hud-corner hud-tl"></span><span class="hud-corner hud-tr"></span>
      <span class="hud-corner hud-bl"></span><span class="hud-corner hud-br"></span>
      <span class="hud-reticle"></span>
      <span class="hud-readout">SYS 90%</span>`;
    gsap.to(container.querySelector(".hud-reticle"), { rotation: 360, duration: 6, ease: "none", repeat: -1 });
    gsap.fromTo(container.querySelectorAll(".hud-corner"), { opacity: 0.3 }, { opacity: 1, duration: 1, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.1 });
    const obj = { v: 90 };
    const ro = container.querySelector(".hud-readout");
    gsap.to(obj, { v: 99, duration: 1.5, ease: "none", repeat: -1, yoyo: true, onUpdate: () => (ro.textContent = "SYS " + Math.round(obj.v) + "%") });
  },

  "chat-bubble"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="chat-bubble">
        <span class="chat-dots"><i></i><i></i><i></i></span>
        <span class="chat-msg">Hi! How can I help? 🤖</span>
      </div>`;
    const bubble = container.querySelector(".chat-bubble");
    const dots = container.querySelector(".chat-dots");
    const msg = container.querySelector(".chat-msg");
    gsap.to(container.querySelectorAll(".chat-dots i"), { y: -4, duration: 0.35, stagger: 0.12, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.set(msg, { autoAlpha: 0 });
    gsap.set(dots, { autoAlpha: 1 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.5 })
      .fromTo(bubble, { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(2)" })
      .to(dots, { autoAlpha: 0, duration: 0.3, delay: 1 })
      .to(msg, { autoAlpha: 1, duration: 0.3 }, "<0.1")
      .to(bubble, { autoAlpha: 0, scale: 0.7, duration: 0.3, delay: 1.6 })
      .set(dots, { autoAlpha: 1 })
      .set(msg, { autoAlpha: 0 });
  },

  terminal(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="term-win">
        <div class="term-bar"><span></span><span></span><span></span></div>
        <div class="term-body"><span class="term-line"></span></div>
      </div>`;
    const line = container.querySelector(".term-line");
    const full = "$ npm run build  ✓ done";
    const obj = { n: 0 };
    const write = () => (line.innerHTML = full.slice(0, Math.round(obj.n)) + '<i class="term-caret">▋</i>');
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .to(obj, { n: full.length, duration: 1.7, ease: "none", onUpdate: write })
      .to(obj, { n: 0, duration: 0.4, delay: 1.2, ease: "none", onUpdate: write });
  },

  "code-snippet"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <pre class="code-demo"><span class="cl"><b class="k">const</b> <b class="v">sum</b> = (a, b) =&gt;</span><span class="cl">  a + b;</span><span class="cl"><b class="k">export</b> <b class="k">default</b> sum;</span></pre>`;
    const lines = container.querySelectorAll(".code-demo .cl");
    gsap.set(lines, { opacity: 0, x: -12 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 1 })
      .to(lines, { opacity: 1, x: 0, duration: 0.4, stagger: 0.25, ease: "power2.out" })
      .to(lines, { opacity: 0, x: -12, duration: 0.3, stagger: 0.1, delay: 1.2 });
  },

  notification(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="notif-demo">
        <span class="notif-icon">🔔</span>
        <div class="notif-text"><b>New message</b><small>Tap to open</small></div>
      </div>`;
    const n = container.querySelector(".notif-demo");
    gsap.set(n, { xPercent: 150, opacity: 0 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .to(n, { xPercent: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" })
      .to(n, { xPercent: 150, opacity: 0, duration: 0.4, delay: 1.6, ease: "power2.in" });
  },

  widget(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="widget-demo">
        <div class="widget-top"><span>Weather</span><span>⛅</span></div>
        <div class="widget-num">0°</div>
        <div class="widget-sub">San Francisco</div>
      </div>`;
    const card = container.querySelector(".widget-demo");
    const num = container.querySelector(".widget-num");
    const obj = { v: 0 };
    gsap.set(card, { scale: 0.6, opacity: 0 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 1 })
      .to(card, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" })
      .to(obj, { v: 21, duration: 0.9, ease: "power1.out", onUpdate: () => (num.textContent = Math.round(obj.v) + "°") }, "<0.2")
      .to(card, { scale: 0.6, opacity: 0, duration: 0.4, delay: 1.4 })
      .set(obj, { v: 0 });
  },

  dashboard(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="dash-demo">
        <div class="dash-tile dash-wide"><span class="dash-bar"></span><span class="dash-bar"></span><span class="dash-bar"></span><span class="dash-bar"></span></div>
        <div class="dash-tile"><span class="dash-ring"></span></div>
        <div class="dash-tile"><span class="dash-ring"></span></div>
      </div>`;
    const tiles = container.querySelectorAll(".dash-tile");
    const bars = container.querySelectorAll(".dash-bar");
    gsap.set(tiles, { opacity: 0, y: 12 });
    gsap.set(bars, { scaleY: 0.1, transformOrigin: "bottom" });
    gsap
      .timeline({ repeat: -1, repeatDelay: 1 })
      .to(tiles, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 })
      .to(bars, { scaleY: () => gsap.utils.random(0.4, 1), duration: 0.5, stagger: 0.05 }, "-=0.2")
      .to(tiles, { opacity: 0, y: 12, duration: 0.3, delay: 1.4 });
  },

  bento(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="bento-demo">
        <span class="bento-a"></span><span class="bento-b"></span>
        <span class="bento-c"></span><span class="bento-d"></span>
      </div>`;
    const cells = container.querySelectorAll(".bento-demo span");
    gsap.set(cells, { scale: 0.5, opacity: 0 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 1 })
      .to(cells, { scale: 1, opacity: 1, duration: 0.45, stagger: 0.1, ease: "back.out(1.7)" })
      .to(cells, { scale: 0.5, opacity: 0, duration: 0.3, stagger: 0.06, delay: 1.4 });
  },

  cursor(container) {
    container.classList.add("demo-stage", "demo-cursor");
    container.innerHTML = `
      <button class="cur-btn">Click</button>
      <span class="cur-ripple"></span>
      <svg class="cur-ptr" viewBox="0 0 24 24" width="20" height="20"><path d="M4 2 L4 20 L9 15 L13 22 L16 20 L12 14 L19 14 Z" fill="#fff" stroke="#000" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
    const ptr = container.querySelector(".cur-ptr");
    const btn = container.querySelector(".cur-btn");
    const ripple = container.querySelector(".cur-ripple");
    gsap.set(ptr, { x: 46, y: 30 });
    gsap.set(ripple, { scale: 0, opacity: 0 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.5 })
      .to(ptr, { x: 0, y: 4, duration: 0.9, ease: "power2.inOut" })
      .to(btn, { scale: 0.9, duration: 0.12, yoyo: true, repeat: 1 })
      .fromTo(ripple, { scale: 0, opacity: 0.6 }, { scale: 1.6, opacity: 0, duration: 0.5 }, "<")
      .to(ptr, { x: 46, y: 30, duration: 0.8, delay: 0.9, ease: "power2.inOut" });
  },

  icons(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <svg class="icon-demo" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="none" stroke="var(--accent)" stroke-width="3"/>
        <path class="icon-check" d="M15 25 l7 7 l12 -15" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    const svg = container.querySelector(".icon-demo");
    const ring = container.querySelector("circle");
    const check = container.querySelector(".icon-check");
    const rlen = ring.getTotalLength();
    const clen = check.getTotalLength();
    gsap.set(ring, { strokeDasharray: rlen, strokeDashoffset: rlen });
    gsap.set(check, { strokeDasharray: clen, strokeDashoffset: clen });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.8 })
      .to(ring, { strokeDashoffset: 0, duration: 0.6, ease: "power2.out" })
      .to(check, { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }, "-=0.1")
      .to(svg, { scale: 1.15, duration: 0.15, yoyo: true, repeat: 1, transformOrigin: "50% 50%" })
      .to(ring, { strokeDashoffset: rlen, duration: 0.3, delay: 1 }, "reset")
      .to(check, { strokeDashoffset: clen, duration: 0.3 }, "reset");
  },

  monospace(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="mono-demo">
        <div class="mono-row"><span>id</span><span>0x1F</span></div>
        <div class="mono-row"><span>cpu</span><span>42%</span></div>
        <div class="mono-row"><span>net</span><span>1.2Gb</span></div>
      </div>`;
    const rows = container.querySelectorAll(".mono-row");
    gsap.set(rows, { opacity: 0, x: -10 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 1 })
      .to(rows, { opacity: 1, x: 0, duration: 0.35, stagger: 0.15 })
      .to(rows, { opacity: 0, x: -10, duration: 0.3, stagger: 0.08, delay: 1.4 });
  },

  "svg-diagram"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <svg class="diag-demo" viewBox="0 0 160 80">
        <line class="diag-edge" x1="40" y1="21" x2="112" y2="21"/>
        <line class="diag-edge" x1="40" y1="59" x2="112" y2="59"/>
        <line class="diag-edge" x1="27" y1="28" x2="27" y2="52"/>
        <rect class="diag-node" x="14" y="14" width="26" height="14" rx="3"/>
        <rect class="diag-node" x="14" y="52" width="26" height="14" rx="3"/>
        <rect class="diag-node" x="112" y="12" width="34" height="18" rx="3"/>
        <rect class="diag-node" x="112" y="50" width="34" height="18" rx="3"/>
      </svg>`;
    const nodes = container.querySelectorAll(".diag-node");
    const edges = container.querySelectorAll(".diag-edge");
    gsap.set(nodes, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
    edges.forEach((e) => {
      const l = e.getTotalLength();
      gsap.set(e, { strokeDasharray: l, strokeDashoffset: l });
    });
    gsap
      .timeline({ repeat: -1, repeatDelay: 1 })
      .to(nodes, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.12, ease: "back.out(1.7)" })
      .to(edges, { strokeDashoffset: 0, duration: 0.5, stagger: 0.1 }, "-=0.2")
      .to([nodes, edges], { opacity: 0, duration: 0.4, delay: 1.3 });
  },

  // ================= UI Styles & Surfaces (live) =================

  glassmorphism(container) {
    container.classList.add("demo-stage", "demo-glass");
    container.innerHTML = `
      <span class="glass-blob glass-b1"></span>
      <span class="glass-blob glass-b2"></span>
      <div class="glass-card">frosted</div>`;
    gsap.to(container.querySelector(".glass-b1"), { x: 30, y: 14, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(container.querySelector(".glass-b2"), { x: -26, y: -12, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
  },

  neumorphism(container) {
    container.classList.add("demo-stage", "demo-neu");
    container.innerHTML = `<button class="neu-btn">◉</button>`;
    const btn = container.querySelector(".neu-btn");
    let pressed = false;
    gsap.timeline({ repeat: -1 }).call(() => btn.classList.toggle("neu-pressed", (pressed = !pressed))).to({}, { duration: 1.1 });
  },

  glow(container) {
    container.classList.add("demo-stage");
    const orb = document.createElement("div");
    orb.className = "glow-orb";
    container.appendChild(orb);
    gsap.to(orb, { boxShadow: "0 0 46px 12px rgba(124,140,255,0.9)", scale: 1.12, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
  },

  "gradient-mesh"(container) {
    container.classList.add("demo-stage");
    const wrap = document.createElement("div");
    wrap.className = "mesh-demo";
    wrap.innerHTML = `<span class="mesh-b mesh-b1"></span><span class="mesh-b mesh-b2"></span><span class="mesh-b mesh-b3"></span>`;
    container.appendChild(wrap);
    gsap.to(wrap.querySelector(".mesh-b1"), { x: 24, y: 18, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(wrap.querySelector(".mesh-b2"), { x: -20, y: 20, duration: 4.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(wrap.querySelector(".mesh-b3"), { x: 16, y: -22, duration: 5.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
  },

  "linear-gradient"(container) {
    container.classList.add("demo-stage");
    const g = document.createElement("div");
    g.className = "lin-demo";
    container.appendChild(g);
    const obj = { a: 0 };
    gsap.to(obj, { a: 360, duration: 6, ease: "none", repeat: -1, onUpdate: () => (g.style.background = `linear-gradient(${obj.a}deg, #7c8cff, #4ec98a)`) });
  },

  "radial-gradient"(container) {
    container.classList.add("demo-stage");
    const g = document.createElement("div");
    g.className = "rad-demo";
    container.appendChild(g);
    const obj = { r: 18 };
    gsap.to(obj, { r: 70, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1, onUpdate: () => (g.style.background = `radial-gradient(circle at 50% 50%, #ffd36b, #7c8cff ${obj.r}%, #171922)`) });
  },

  "hand-drawn"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <svg class="sketch-demo" viewBox="0 0 120 80">
        <path class="sk" d="M14 16 q -2 20 1 44 q 40 4 92 -1 q 3 -22 -1 -42 q -46 -3 -92 -1 Z"/>
        <path class="sk sk2" d="M30 46 l40 1"/>
        <path class="sk sk2" d="M30 58 l58 -1"/>
      </svg>`;
    const paths = container.querySelectorAll(".sk");
    paths.forEach((p) => {
      const l = p.getTotalLength();
      gsap.set(p, { strokeDasharray: l, strokeDashoffset: l });
    });
    gsap
      .timeline({ repeat: -1, repeatDelay: 1 })
      .to(paths, { strokeDashoffset: 0, duration: 0.9, stagger: 0.3, ease: "power1.inOut" })
      .to(paths, { strokeDashoffset: (i) => paths[i].getTotalLength(), duration: 0.4, delay: 1.2 });
  },

  // ================= Extra motion vocabulary (live) =================

  // A spinning arc — the universal "loading" indicator.
  spinner(container) {
    container.classList.add("demo-stage");
    const s = document.createElement("div");
    s.className = "spin-demo";
    container.appendChild(s);
    gsap.to(s, { rotation: 360, duration: 0.9, ease: "none", repeat: -1 });
  },

  // A card that grows open to reveal its body, then collapses.
  "expand-card"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `
      <div class="expc">
        <div class="expc-head"></div>
        <div class="expc-body"><span></span><span></span></div>
      </div>`;
    const body = container.querySelector(".expc-body");
    gsap.set(body, { height: 0, opacity: 0 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.6 })
      .to(body, { height: 42, opacity: 1, duration: 0.5, ease: "power2.out" })
      .to(body, { height: 0, opacity: 0, duration: 0.4, delay: 1.2, ease: "power2.in" });
  },

  // A button that depresses and springs back — the classic press micro-interaction.
  "button-press"(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `<button class="press-btn">Get started</button>`;
    const btn = container.querySelector(".press-btn");
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.7 })
      .to(btn, { scale: 0.9, y: 3, duration: 0.12, ease: "power2.out" })
      .to(btn, { scale: 1, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  },

  // A side panel sliding in over a dimmed backdrop, then out.
  drawer(container) {
    container.classList.add("demo-stage", "demo-drawer");
    container.innerHTML = `<div class="drw-scrim"></div><div class="drw-panel"><span></span><span></span><span></span></div>`;
    const scrim = container.querySelector(".drw-scrim");
    const panel = container.querySelector(".drw-panel");
    gsap.set(panel, { xPercent: 100 });
    gsap.set(scrim, { opacity: 0 });
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.5 })
      .to(scrim, { opacity: 1, duration: 0.3 })
      .to(panel, { xPercent: 0, duration: 0.5, ease: "power3.out" }, "<")
      .to(panel, { xPercent: 100, duration: 0.4, delay: 1.4, ease: "power2.in" })
      .to(scrim, { opacity: 0, duration: 0.3 }, "<");
  },

  // A block streaking across, stretched + blurred while it moves.
  "motion-blur"(container) {
    container.classList.add("demo-stage");
    const d = document.createElement("div");
    d.className = "demo-block demo-block--solo";
    container.appendChild(d);
    gsap.set(d, { x: -60 });
    gsap
      .timeline({ repeat: -1 })
      .to(d, { filter: "blur(6px)", scaleX: 2.2, duration: 0.05 })
      .to(d, { x: 60, duration: 0.5, ease: "power2.inOut" })
      .to(d, { filter: "blur(0px)", scaleX: 1, duration: 0.15 })
      .to({}, { duration: 0.35 })
      .to(d, { filter: "blur(6px)", scaleX: 2.2, duration: 0.05 })
      .to(d, { x: -60, duration: 0.5, ease: "power2.inOut" })
      .to(d, { filter: "blur(0px)", scaleX: 1, duration: 0.15 })
      .to({}, { duration: 0.35 });
  },

  // Layers gently bobbing in place — the "floating UI" idle look.
  float(container) {
    container.classList.add("demo-stage");
    container.innerHTML = `<div class="float-scene"><span class="float-card"></span><span class="float-badge">✦</span></div>`;
    gsap.to(container.querySelector(".float-card"), { y: -10, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(container.querySelector(".float-badge"), { y: -14, duration: 1.9, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.2 });
  },
};
