// Keyboard, mouse and gamepad input, merged into one control state.
MOM.Input = (() => {
  const keys = new Set();
  const pressed = new Set();
  const mouse = { x: 0, y: 0, left: false, right: false, active: false, lastMove: 0, wheel: 0 };
  let canvas = null;

  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (!keys.has(k)) pressed.add(k);
    keys.add(k);
    if (MOM.Input.capture && [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys.delete(k);
  });
  window.addEventListener('blur', () => { keys.clear(); mouse.left = mouse.right = false; });

  function attach(cv) {
    canvas = cv;
    cv.addEventListener('mousemove', (e) => {
      const r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      mouse.active = true; mouse.lastMove = performance.now();
    });
    cv.addEventListener('mousedown', (e) => {
      if (e.button === 0) mouse.left = true;
      if (e.button === 2) { mouse.right = true; pressed.add('mouse2'); }
      mouse.active = true; mouse.lastMove = performance.now();
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) mouse.left = false;
      if (e.button === 2) mouse.right = false;
    });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    cv.addEventListener('wheel', (e) => { mouse.wheel += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
  }

  // Gamepad state (standard mapping).
  const padPrev = {};
  function readPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) {
      if (!p || !p.connected) continue;
      const dz = (v) => (Math.abs(v) < 0.2 ? 0 : v);
      const b = (i) => !!(p.buttons[i] && p.buttons[i].pressed);
      const st = {
        lx: dz(p.axes[0] || 0), ly: dz(p.axes[1] || 0),
        rx: dz(p.axes[2] || 0), ry: dz(p.axes[3] || 0),
        fire: b(7), melee: b(0), dash: b(1) || b(6),
        prev: b(4), next: b(5), start: b(9),
      };
      const edge = {};
      for (const k of ['melee', 'dash', 'prev', 'next', 'start']) { edge[k] = st[k] && !padPrev[k]; padPrev[k] = st[k]; }
      st.edge = edge;
      return st;
    }
    return null;
  }

  function wasPressed(k) { return pressed.has(k); }
  function endFrame() { pressed.clear(); mouse.wheel = 0; }

  return { keys, mouse, attach, readPad, wasPressed, endFrame, capture: false, down: (k) => keys.has(k) };
})();
