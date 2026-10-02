// Tiny synthesized sound effects — no audio files needed.
MOM.Audio = (() => {
  let ctx = null, master = null, noiseBuf = null;
  let muted = false;
  try { muted = localStorage.getItem('mom_muted') === '1'; } catch (e) {}
  const lastPlay = {};

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.35;
    master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  function tone({ type = 'square', f0 = 440, f1 = f0, dur = 0.12, vol = 0.3, delay = 0 }) {
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise({ dur = 0.2, vol = 0.3, f = 1200, q = 1, type = 'lowpass', f1 = f, delay = 0 }) {
    const t = ctx.currentTime + delay;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const flt = ctx.createBiquadFilter(); flt.type = type; flt.Q.value = q;
    flt.frequency.setValueAtTime(f, t);
    flt.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(flt); flt.connect(g); g.connect(master);
    s.start(t); s.stop(t + dur + 0.02);
  }

  const SFX = {
    click:   () => tone({ type: 'square', f0: 660, f1: 880, dur: 0.05, vol: 0.12 }),
    buy:     () => { tone({ type: 'square', f0: 880, dur: 0.07, vol: 0.15 }); tone({ type: 'square', f0: 1320, dur: 0.12, vol: 0.15, delay: 0.07 }); },
    error:   () => tone({ type: 'sawtooth', f0: 180, f1: 120, dur: 0.2, vol: 0.15 }),
    bite:    () => { noise({ dur: 0.08, vol: 0.4, f: 2500, f1: 400 }); tone({ type: 'square', f0: 140, f1: 60, dur: 0.1, vol: 0.2 }); },
    swing:   () => noise({ dur: 0.1, vol: 0.15, f: 3000, f1: 800, type: 'bandpass', q: 2 }),
    hit:     () => { noise({ dur: 0.1, vol: 0.35, f: 1500, f1: 200 }); tone({ type: 'triangle', f0: 220, f1: 80, dur: 0.12, vol: 0.25 }); },
    spit:    () => noise({ dur: 0.12, vol: 0.2, f: 1800, f1: 600, type: 'bandpass', q: 4 }),
    laser:   () => tone({ type: 'sawtooth', f0: 1600, f1: 300, dur: 0.09, vol: 0.1 }),
    eye:     () => tone({ type: 'sine', f0: 1200, f1: 500, dur: 0.15, vol: 0.15 }),
    flame:   () => noise({ dur: 0.1, vol: 0.1, f: 900, f1: 500 }),
    freeze:  () => { tone({ type: 'sine', f0: 2400, f1: 1200, dur: 0.2, vol: 0.12 }); tone({ type: 'sine', f0: 3000, f1: 1600, dur: 0.2, vol: 0.08 }); },
    rocket:  () => noise({ dur: 0.3, vol: 0.25, f: 600, f1: 2000, type: 'bandpass', q: 1 }),
    mine:    () => tone({ type: 'square', f0: 400, f1: 400, dur: 0.06, vol: 0.12 }),
    roar:    () => { tone({ type: 'sawtooth', f0: 120, f1: 50, dur: 0.6, vol: 0.35 }); noise({ dur: 0.6, vol: 0.3, f: 800, f1: 100 }); },
    boom:    () => { noise({ dur: 0.6, vol: 0.55, f: 1200, f1: 60 }); tone({ type: 'sine', f0: 90, f1: 30, dur: 0.5, vol: 0.5 }); },
    crumble: () => { noise({ dur: 0.45, vol: 0.35, f: 700, f1: 80 }); },
    pickup:  () => { tone({ type: 'triangle', f0: 600, f1: 1200, dur: 0.15, vol: 0.2 }); },
    cash:    () => { tone({ type: 'square', f0: 1500, dur: 0.05, vol: 0.12 }); tone({ type: 'square', f0: 2000, dur: 0.1, vol: 0.12, delay: 0.05 }); },
    dash:    () => noise({ dur: 0.18, vol: 0.2, f: 400, f1: 3000, type: 'bandpass', q: 1.5 }),
    ko:      () => { tone({ type: 'sawtooth', f0: 400, f1: 40, dur: 0.9, vol: 0.3 }); noise({ dur: 0.5, vol: 0.3, f: 2000, f1: 100 }); },
    flag:    () => { [523, 659, 784].forEach((f, i) => tone({ type: 'square', f0: f, dur: 0.1, vol: 0.15, delay: i * 0.08 })); },
    win:     () => { [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'square', f0: f, dur: 0.18, vol: 0.18, delay: i * 0.12 })); },
    lose:    () => { [392, 330, 262, 196].forEach((f, i) => tone({ type: 'triangle', f0: f, dur: 0.25, vol: 0.2, delay: i * 0.18 })); },
    levelup: () => { [659, 784, 988, 1319].forEach((f, i) => tone({ type: 'triangle', f0: f, dur: 0.14, vol: 0.2, delay: i * 0.07 })); },
    wave:    () => { tone({ type: 'sawtooth', f0: 220, f1: 440, dur: 0.4, vol: 0.2 }); tone({ type: 'sawtooth', f0: 330, f1: 660, dur: 0.4, vol: 0.15, delay: 0.1 }); },
    beep:    () => tone({ type: 'square', f0: 880, dur: 0.08, vol: 0.15 }),
    go:      () => tone({ type: 'square', f0: 1320, dur: 0.3, vol: 0.18 }),
  };

  function play(name, minGap = 0.03) {
    if (!ctx || muted || !SFX[name]) return;
    const now = ctx.currentTime;
    if (lastPlay[name] && now - lastPlay[name] < minGap) return;
    lastPlay[name] = now;
    try { SFX[name](); } catch (e) {}
  }

  function setMuted(m) {
    muted = m;
    try { localStorage.setItem('mom_muted', m ? '1' : '0'); } catch (e) {}
    if (master) master.gain.value = m ? 0 : 0.35;
  }

  return { init, play, setMuted, isMuted: () => muted };
})();
