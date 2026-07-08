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
};
