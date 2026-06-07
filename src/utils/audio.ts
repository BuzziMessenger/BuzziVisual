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

  private getActiveScheme(): string {
    if (typeof window !== "undefined") {
      return localStorage.getItem("buzzi_sound_scheme") || "default";
    }
    return "default";
  }

  // Authentic retro Buzzi notification/message chime: a gorgeous "ba-ding!" bell ring
  public playHoneyPop() {
    this.playNotification();
  }

  public playNotification() {
    const scheme = this.getActiveScheme();
    if (scheme === "mute") return;

    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;

      if (scheme === "classic_messenger") {
        // Authentic Retro Messenger receive message tone ("tu-dut!")
        const osc1 = actx.createOscillator();
        const gain1 = actx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(1046.50, now); // C6 note
        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.linearRampToValueAtTime(0.12, now + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc1.connect(gain1);
        gain1.connect(actx.destination);

        const osc2 = actx.createOscillator();
        const gain2 = actx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1318.51, now + 0.07); // E6 note
        gain2.gain.setValueAtTime(0.001, now + 0.07);
        gain2.gain.linearRampToValueAtTime(0.12, now + 0.09);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc2.connect(gain2);
        gain2.connect(actx.destination);

        osc1.start(now);
        osc1.stop(now + 0.2);
        osc2.start(now + 0.07);
        osc2.stop(now + 0.4);
      } else if (scheme === "retro_synth") {
        // Electronic bubble pop / coin ring
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } else {
        // Standard Buzzi Chime
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
      }
    } catch (e) {
      console.warn("Buzzi notification sound failed:", e);
    }
  }

  // Buzzi Nudge Sound: A mechanical vibration sound mixed with a rapid warning frequency
  public playWorkerBuzz(duration = 0.6) {
    this.playNudge(duration);
  }

  public playNudge(duration = 0.65) {
    const scheme = this.getActiveScheme();
    if (scheme === "mute") return;

    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;

      if (scheme === "classic_messenger") {
        // Authentic Retro Messenger Nudge - shaking rattle with alarm chimes
        const bufferSize = actx.sampleRate * 0.4;
        const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = actx.createBufferSource();
        noise.buffer = buffer;

        const filter = actx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.linearRampToValueAtTime(1600, now + 0.38);

        const noiseGain = actx.createGain();
        noiseGain.gain.setValueAtTime(0.12, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(actx.destination);
        noise.start(now);

        // Fast pitch modulation shaker
        const osc1 = actx.createOscillator();
        const osc2 = actx.createOscillator();
        const gainNode = actx.createGain();

        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(180, now);
        osc1.frequency.linearRampToValueAtTime(130, now + 0.35);

        osc2.type = "square";
        osc2.frequency.setValueAtTime(200, now);
        osc2.frequency.linearRampToValueAtTime(150, now + 0.35);

        const lfo = actx.createOscillator();
        const lfoGain = actx.createGain();
        lfo.frequency.setValueAtTime(48, now);
        lfoGain.gain.setValueAtTime(32, now);

        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(actx.destination);

        osc1.start(now);
        osc2.start(now);
        lfo.start(now);

        osc1.stop(now + 0.4);
        osc2.stop(now + 0.4);
        lfo.stop(now + 0.4);

        // Retro nudge double accent bells
        const bell1 = actx.createOscillator();
        const bgain1 = actx.createGain();
        bell1.type = "triangle";
        bell1.frequency.setValueAtTime(880, now + 0.12);
        bgain1.gain.setValueAtTime(0.001, now + 0.12);
        bgain1.gain.linearRampToValueAtTime(0.15, now + 0.14);
        bgain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        bell1.connect(bgain1);
        bgain1.connect(actx.destination);
        bell1.start(now + 0.12);
        bell1.stop(now + 0.45);

        const bell2 = actx.createOscillator();
        const bgain2 = actx.createGain();
        bell2.type = "sine";
        bell2.frequency.setValueAtTime(1174.66, now + 0.2); // D6
        bgain2.gain.setValueAtTime(0.001, now + 0.2);
        bgain2.gain.linearRampToValueAtTime(0.12, now + 0.22);
        bgain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        bell2.connect(bgain2);
        bgain2.connect(actx.destination);
        bell2.start(now + 0.2);
        bell2.stop(now + 0.55);

      } else if (scheme === "retro_synth") {
        // Chunky 8-bit crash/power-bump
        const osc = actx.createOscillator();
        const gainNode = actx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(50, now + duration);

        const lfo = actx.createOscillator();
        const lfoGain = actx.createGain();
        lfo.frequency.setValueAtTime(12, now);
        lfoGain.gain.setValueAtTime(100, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gainNode);
        gainNode.connect(actx.destination);

        osc.start(now);
        lfo.start(now);
        osc.stop(now + duration);
        lfo.stop(now + duration);
      } else {
        // Base Buzzi vibration rattle
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
      }
    } catch (e) {
      console.warn("Buzzi nudge sound failed to synthesize:", e);
    }
  }

  // Authentic/Nostalgic sign-in sounds played upon connection / authentication success
  public playLogin() {
    const scheme = this.getActiveScheme();
    if (scheme === "mute") return;

    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;

      if (scheme === "classic_messenger") {
        // Beautiful ascending chime arpeggio - classic online messenger sound!
        const notes = [659.25, 783.99, 987.77, 1318.51, 1567.98, 1975.53]; // E5, G5, B5, E6, G6, B6
        notes.forEach((freq, idx) => {
          const t = now + (idx * 0.038);
          const osc = actx.createOscillator();
          const gain = actx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, t);
          
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.09, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

          osc.connect(gain);
          gain.connect(actx.destination);
          
          osc.start(t);
          osc.stop(t + 0.38);
        });
      } else if (scheme === "retro_synth") {
        // Retro chiptune victory level-up chord
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const t = now + (idx * 0.08);
          const osc = actx.createOscillator();
          const gain = actx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, t);
          
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          
          osc.connect(gain);
          gain.connect(actx.destination);
          osc.start(t);
          osc.stop(t + 0.3);
        });
      } else {
        // Buzzi standard sign-in (cheerful double chime)
        const osc1 = actx.createOscillator();
        const gain1 = actx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(523.25, now); // C5
        gain1.gain.setValueAtTime(0.1, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc1.connect(gain1);
        gain1.connect(actx.destination);

        const osc2 = actx.createOscillator();
        const gain2 = actx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(783.99, now + 0.1); // G5
        gain2.gain.setValueAtTime(0.12, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc2.connect(gain2);
        gain2.connect(actx.destination);

        osc1.start(now);
        osc1.stop(now + 0.21);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.5);
      }
    } catch (e) {
      console.warn("Buzzi login sound failed:", e);
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

  // Ghostly spooky sweep synthesizer sound
  public playGhostWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;

      // Spooky rising modulator sweep
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(750, now + 1.2);
      osc.frequency.linearRampToValueAtTime(300, now + 1.8);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 1.8);
    } catch (e) {
      console.warn("Ghost sweep failed:", e);
    }
  }

  // Squeaky pop / kiss smack sound
  public playKissWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;

      // Two rapid high-pitched squeaks
      [0, 0.2].forEach((offset) => {
        const t = now + offset;
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(1500, t + 0.12);

        gain.gain.setValueAtTime(0.09, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(t);
        osc.stop(t + 0.13);
      });
    } catch (e) {
      console.warn("Kiss sound failed:", e);
    }
  }

  // Upbeat synth arpeggio disco beat
  public playDiscoWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;

      // Multi-note arpeggiator chord sequence matching retro synthesizer patterns
      const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63];
      notes.forEach((freq, idx) => {
        const t = now + (idx * 0.12);
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(t);
        osc.stop(t + 0.16);
      });
    } catch (e) {
      console.warn("Disco synth failed:", e);
    }
  }

  public playLaserWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.6);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      console.warn("Laser sound failed:", e);
    }
  }

  public playAlienWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      for (let i = 0; i < 8; i++) {
        const t = now + (i * 0.15);
        osc.frequency.setValueAtTime(400 + (i % 2 === 0 ? 150 : -150), t);
      }
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 1.25);
    } catch (e) {
      console.warn("Alien sound failed:", e);
    }
  }

  public playBananaWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;
      const melody = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25];
      melody.forEach((freq, idx) => {
        const t = now + (idx * 0.14);
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(t);
        osc.stop(t + 0.13);
      });
    } catch (e) {
      console.warn("Banana sound failed:", e);
    }
  }

  public playCatWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.45);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    } catch (e) {
      console.warn("Cat sound failed:", e);
    }
  }

  public playDogWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;
      [0, 0.22].forEach((delay) => {
        const t = now + delay;
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(380, t + 0.15);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(t);
        osc.stop(t + 0.19);
      });
    } catch (e) {
      console.warn("Dog sound failed:", e);
    }
  }

  public playPoopWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.55);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch (e) {
      console.warn("Poop sound failed:", e);
    }
  }

  public playMoneyWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;
      const notes = [587.33, 659.25, 783.99, 880.00, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const t = now + (idx * 0.05);
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(t);
        osc.stop(t + 0.16);
      });
    } catch (e) {
      console.warn("Money sound failed:", e);
    }
  }

  public playPinguinWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;
      // High-pitched penguins tango tap arpeggio
      const notes = [440, 554.37, 659.25, 880, 659.25, 554.37, 440];
      notes.forEach((freq, idx) => {
        const t = now + (idx * 0.1);
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.linearRampToValueAtTime(freq + (idx % 2 === 0 ? 20 : -20), t + 0.08);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
      });
    } catch (e) {
      console.warn("Pinguin sound failed:", e);
    }
  }

  public playHeartbreakerWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;
      // Cracking glass dissonant chord followed by sliding teardrop frequency
      const chord = [293.66, 311.13, 349.23, 415.30]; // Dissonant flat
      chord.forEach((freq) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      });

      // Teardrop slide sliding down
      const tear = actx.createOscillator();
      const tearGain = actx.createGain();
      tear.type = "sine";
      tear.frequency.setValueAtTime(880, now + 0.35);
      tear.frequency.linearRampToValueAtTime(220, now + 1.1);
      tearGain.gain.setValueAtTime(0.001, now + 0.35);
      tearGain.gain.linearRampToValueAtTime(0.06, now + 0.45);
      tearGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      tear.connect(tearGain);
      tearGain.connect(actx.destination);
      tear.start(now + 0.35);
      tear.stop(now + 1.1);
    } catch (e) {
      console.warn("Heartbreaker sound failed:", e);
    }
  }

  public playMatrixWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;
      // Synthesized retro high-speed computing data chimes
      for (let i = 0; i < 15; i++) {
        const t = now + (i * 0.05);
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "sine";
        // Alternating rising sci-fi scale
        const freq = 600 + (i * 80) % 900;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
      }
    } catch (e) {
      console.warn("Matrix sound failed:", e);
    }
  }

  public playBeeWink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;
      // Vibrating high buzz frequency
      const osc = actx.createOscillator();
      const gainNode = actx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      // Fast pitch vibrato
      const lfo = actx.createOscillator();
      const lfoGain = actx.createGain();
      lfo.frequency.setValueAtTime(45, now);
      lfoGain.gain.setValueAtTime(10, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 1.0);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

      osc.connect(gainNode);
      gainNode.connect(actx.destination);

      osc.start(now);
      lfo.start(now);
      osc.stop(now + 1.25);
      lfo.stop(now + 1.25);

      // Sweet honey splat chime
      const chime = actx.createOscillator();
      const chimeGain = actx.createGain();
      chime.type = "triangle";
      chime.frequency.setValueAtTime(523.25, now + 0.8); // C5 splat
      chimeGain.gain.setValueAtTime(0.12, now + 0.8);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      chime.connect(chimeGain);
      chimeGain.connect(actx.destination);
      chime.start(now + 0.8);
      chime.stop(now + 1.25);
    } catch (e) {
      console.warn("Bee sound failed:", e);
    }
  }

  public playOnlineAlert() {
    this.playLogin();
  }

  public playOfflineAlert() {
    const scheme = this.getActiveScheme();
    if (scheme === "mute") return;

    try {
      this.initCtx();
      if (!this.ctx) return;
      const actx = this.ctx;
      const now = actx.currentTime;

      if (scheme === "classic_messenger") {
        // Beautiful descending chime arpeggio - classic offline MSN sound!
        const notes = [1975.53, 1567.98, 1318.51, 987.77, 783.99, 659.25];
        notes.forEach((freq, idx) => {
          const t = now + (idx * 0.038);
          const osc = actx.createOscillator();
          const gain = actx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, t);
          
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.09, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

          osc.connect(gain);
          gain.connect(actx.destination);
          
          osc.start(t);
          osc.stop(t + 0.38);
        });
      } else {
        // Standard Buzzi offline sound - cheerful double descending chime
        const osc1 = actx.createOscillator();
        const gain1 = actx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(783.99, now); // G5
        gain1.gain.setValueAtTime(0.1, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc1.connect(gain1);
        gain1.connect(actx.destination);

        const osc2 = actx.createOscillator();
        const gain2 = actx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(523.25, now + 0.1); // C5
        gain2.gain.setValueAtTime(0.12, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc2.connect(gain2);
        gain2.connect(actx.destination);

        osc1.start(now);
        osc1.stop(now + 0.21);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.5);
      }
    } catch (e) {
      console.warn("Buzzi offline sound failed:", e);
    }
  }
}

export const hiveAudio = new BuzziAudioSynthesizer();
