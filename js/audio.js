// WebAudio Synthesizer + Background Music Controller for CritterCraft: Moonless Night
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.bgm = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  tone(freq = 440, dur = 0.12, type = 'sine', vol = 0.12, slideTo = null) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + dur);
    }
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }

  click() {
    this.tone(660, 0.07, 'triangle', 0.10, 880);
  }

  place() {
    this.tone(440, 0.09, 'sine', 0.12, 660);
    setTimeout(() => this.tone(880, 0.11, 'triangle', 0.10), 45);
  }

  shoot() {
    this.tone(720, 0.08, 'triangle', 0.07, 360);
  }

  sun() {
    this.tone(587, 0.08, 'sine', 0.11, 880);
  }

  shard() {
    this.tone(659, 0.10, 'sine', 0.14, 987);
    setTimeout(() => this.tone(1318, 0.16, 'triangle', 0.12), 70);
  }

  roar() {
    this.tone(150, 0.45, 'sawtooth', 0.14, 55);
  }

  explosion() {
    this.tone(110, 0.38, 'sawtooth', 0.18, 32);
  }

  victory() {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.22, 'triangle', 0.14), i * 110);
    });
  }

  startMusic() {
    if (!this.musicEnabled) return;
    try {
      if (!this.bgm) {
        this.bgm = new Audio('music/voxel_village.mp3');
        this.bgm.loop = true;
        this.bgm.volume = 0.28;
      }
      this.bgm.play().catch(() => {});
    } catch (_) {}
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.bgm) {
      if (this.musicEnabled) this.bgm.play().catch(() => {});
      else this.bgm.pause();
    }
    return this.musicEnabled;
  }

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }
}

export const sound = new SoundEngine();
