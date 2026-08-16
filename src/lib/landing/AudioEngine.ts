// Web Audio API Synthesizer for Drone Propellers & Coin Sounds
export class AudioEngine {
  ctx: AudioContext | null = null;
  droneOsc: OscillatorNode | null = null;
  droneGain: GainNode | null = null;
  chopLfo: OscillatorNode | null = null;
  chopGain: GainNode | null = null;
  filter: BiquadFilterNode | null = null;
  isMuted: boolean = false;

  initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  startDroneSound() {
    this.initContext();
    if (!this.ctx || this.droneOsc) return;

    try {
      const t = this.ctx.currentTime;

      // Base Motor Oscillator (RPM hum)
      this.droneOsc = this.ctx.createOscillator();
      this.droneOsc.type = "sawtooth";
      this.droneOsc.frequency.setValueAtTime(40, t);

      // Propeller Blade Chop LFO (simulates rotating quadcopter blades)
      this.chopLfo = this.ctx.createOscillator();
      this.chopLfo.type = "sine";
      this.chopLfo.frequency.setValueAtTime(15, t);

      this.chopGain = this.ctx.createGain();
      this.chopGain.gain.setValueAtTime(0.3, t);

      // Lowpass filter for realistic acoustic air resistance
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.setValueAtTime(250, t);

      // Master drone gain node
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.008, t);

      // Connect LFO modulation to motor gain node
      this.chopLfo.connect(this.chopGain);
      this.chopGain.connect(this.droneGain.gain);

      this.droneOsc.connect(this.filter);
      this.filter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);

      this.droneOsc.start(t);
      this.chopLfo.start(t);
    } catch (e) {
      // Audio autoplay blocked or unsupported
    }
  }

  updateDroneSound(speed: number, isHoverMode: boolean, isGround: boolean, isAccelerating: boolean) {
    if (!this.ctx || !this.droneOsc || !this.filter || !this.droneGain) return;

    const t = this.ctx.currentTime;

    if (isGround) {
      this.droneGain.gain.setTargetAtTime(0, t, 0.1);
      return;
    }

    // Dynamic pitch pitch based on drone velocity & throttle
    let baseFreq = 50 + speed * 12;
    if (isAccelerating) baseFreq += 25;
    if (isHoverMode) baseFreq = 42;

    this.droneOsc.frequency.setTargetAtTime(baseFreq, t, 0.1);

    // Dynamic lowpass filter cutoff modulation
    const filterCutoff = Math.min(800, 200 + speed * 60);
    this.filter.frequency.setTargetAtTime(filterCutoff, t, 0.1);

    // Dynamic master gain volume
    const targetGain = this.isMuted ? 0 : 0.04;
    this.droneGain.gain.setTargetAtTime(targetGain, t, 0.1);
  }

  stopDroneSound() {
    if (this.droneGain && this.ctx) {
      try {
        this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  playCoinSound() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(987.77, t); // B5 note
      osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6 note

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    } catch (e) {}
  }

  playCollisionSound() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }

  playLandingSound() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.setValueAtTime(659.25, t + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, t + 0.2); // G5

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.4);
    } catch (e) {}
  }
}
