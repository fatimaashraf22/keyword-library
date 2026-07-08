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
};
