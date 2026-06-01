/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Native synthesizer utilizing browser's Web Audio API for nostalgic early-2000s Buzzi Messenger sounds
class BuzziAudioSynthesizer {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    // Resume context if suspended (common browser interaction safety policy)
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Authentic retro Buzzi notification/message chime: a gorgeous "ba-ding!" bell ring
  public playHoneyPop() {
    this.playNotification();
  }

  public playNotification() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const actx = this.ctx;
      const now = actx.currentTime;

      // Note 1: soft bell chime
      const osc1 = actx.createOscillator();
      const gain1 = actx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now); // A5 note
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc1.connect(gain1);
      gain1.connect(actx.destination);

      // Note 2: high bright chime "ding" (staggered slightly for "ba-ding" effect)
      const osc2 = actx.createOscillator();
      const gain2 = actx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1318.51, now + 0.05); // E6 note
      gain2.gain.setValueAtTime(0.001, now + 0.05);
      gain2.gain.linearRampToValueAtTime(0.15, now + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc2.connect(gain2);
      gain2.connect(actx.destination);

      osc1.start(now);
      osc1.stop(now + 0.15);

      osc2.start(now + 0.05);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn("Buzzi notification sound failed:", e);
    }
  }

  // Buzzi Nudge Sound: A mechanical vibration sound mixed with a rapid warning frequency
  public playWorkerBuzz(duration = 0.6) {
    this.playNudge(duration);
  }

  public playNudge(duration = 0.65) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const actx = this.ctx;
      const now = actx.currentTime;

      // Primary vibration oscillator
      const osc = actx.createOscillator();
      const gainNode = actx.createGain();
      const lfo = actx.createOscillator();
      const lfoGain = actx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(130, now); // base frequency rattle
      osc.frequency.linearRampToValueAtTime(150, now + duration / 2);
      osc.frequency.linearRampToValueAtTime(110, now + duration);

      // Fast modulation for rattle effect
      lfo.type = "square";
      lfo.frequency.setValueAtTime(35, now); // 35Hz vibration pulses
      lfoGain.gain.setValueAtTime(0.35, now);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.05); // very snappy onset
      gainNode.gain.setValueAtTime(0.25, now + duration - 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);
      osc.connect(gainNode);
      gainNode.connect(actx.destination);

      // High pitch alarm element overlay to make the shake noticeable
      const warningOsc = actx.createOscillator();
      const warningGain = actx.createGain();
      warningOsc.type = "sine";
      warningOsc.frequency.setValueAtTime(320, now);
      warningOsc.frequency.linearRampToValueAtTime(280, now + duration);
      
      warningGain.gain.setValueAtTime(0.001, now);
      warningGain.gain.linearRampToValueAtTime(0.07, now + 0.05);
      warningGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      warningOsc.connect(warningGain);
      warningGain.connect(actx.destination);

      osc.start(now);
      lfo.start(now);
      warningOsc.start(now);

      osc.stop(now + duration);
      lfo.stop(now + duration);
      warningOsc.stop(now + duration);
    } catch (e) {
      console.warn("Buzzi nudge sound failed to synthesize:", e);
    }
  }

  // Dramatic Buzzi crown buzz - we can alias to an extra loud Nudge!
  public playCrownBuzz() {
    this.playNudge(0.8);
  }

  // Pink Pig Snort slide sound for the Pig Wink
  public playPigWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;

      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(640, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.6);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.6);

      // Pig snort chatter squeaks
      for (let i = 0; i < 3; i++) {
        const time = now + 0.35 + (i * 0.09);
        const oscS = actx.createOscillator();
        const gainS = actx.createGain();
        oscS.type = "sawtooth";
        oscS.frequency.setValueAtTime(110, time);
        gainS.gain.setValueAtTime(0.04, time);
        gainS.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        oscS.connect(gainS);
        gainS.connect(actx.destination);
        oscS.start(time);
        oscS.stop(time + 0.05);
      }
    } catch (e) {
      console.warn("Pig sound failed:", e);
    }
  }

  // Laughing sound for Crazy Face Wink
  public playCrazyWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;

      const notes = [380, 520, 410, 580, 480, 640, 520, 720];
      notes.forEach((freq, i) => {
        const time = now + (i * 0.07);
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.linearRampToValueAtTime(freq - 80, time + 0.06);

        gain.gain.setValueAtTime(0.09, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(time);
        osc.stop(time + 0.07);
      });
    } catch (e) {
      console.warn("Crazy laughter sound failed:", e);
    }
  }

  // Splash sound for Water Balloon Wink
  public playWaterWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;

      // Bouncy launch slide whoosh
      const launch = actx.createOscillator();
      const launchGain = actx.createGain();
      launch.type = "sine";
      launch.frequency.setValueAtTime(140, now);
      launch.frequency.exponentialRampToValueAtTime(750, now + 0.38);

      launchGain.gain.setValueAtTime(0.001, now);
      launchGain.gain.linearRampToValueAtTime(0.08, now + 0.15);
      launchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      launch.connect(launchGain);
      launchGain.connect(actx.destination);
      launch.start(now);
      launch.stop(now + 0.38);

      // Splat explosion splash pop
      const splashTime = now + 0.38;
      const splash = actx.createOscillator();
      const splashGain = actx.createGain();
      splash.type = "triangle";
      splash.frequency.setValueAtTime(130, splashTime);
      splash.frequency.exponentialRampToValueAtTime(32, splashTime + 0.3);

      splashGain.gain.setValueAtTime(0.18, splashTime);
      splashGain.gain.exponentialRampToValueAtTime(0.001, splashTime + 0.3);

      splash.connect(splashGain);
      splashGain.connect(actx.destination);
      splash.start(splashTime);
      splash.stop(splashTime + 0.32);

      // Drip wet sound effect
      const drip = actx.createOscillator();
      const dripGain = actx.createGain();
      drip.type = "sine";
      drip.frequency.setValueAtTime(1400, splashTime + 0.12);
      dripGain.gain.setValueAtTime(0.04, splashTime + 0.12);
      dripGain.gain.exponentialRampToValueAtTime(0.001, splashTime + 0.18);
      drip.connect(dripGain);
      dripGain.connect(actx.destination);
      drip.start(splashTime + 0.12);
      drip.stop(splashTime + 0.2);
    } catch (e) {
      console.warn("Water balloon sound failed:", e);
    }
  }

  // Power metal chord sound for Air Guitar Wink
  public playGuitarWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;

      // Power chords frequency stack
      const chord = [146.83, 220.00, 293.66, 392.00, 440.00];
      chord.forEach((freq) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq + (Math.random() * 2.5 - 1.25), now);
        osc.frequency.linearRampToValueAtTime(freq - 12, now + 1.1);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 1.1);
      });
    } catch (e) {
      console.warn("Guitar chord sound failed:", e);
    }
  }

  // Heartbeat bump & arpeggio chord for Heartburst Wink
  public playHeartWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;

      // Double pulse beat
      [0, 0.22].forEach((offset) => {
        const time = now + offset;
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(68, time);
        osc.frequency.exponentialRampToValueAtTime(32, time + 0.15);

        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(time);
        osc.stop(time + 0.18);
      });

      // Shimmering chord arpeggio
      const chimeTime = now + 0.45;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const t = chimeTime + (idx * 0.06);
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch (e) {
      console.warn("Heart arpeggio sound failed:", e);
    }
  }
}

export const hiveAudio = new BuzziAudioSynthesizer();
