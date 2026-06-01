/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Native synthesizer utilizing browser's Web Audio API for nostalgic early-2000s MSN Messenger sounds
class MsnAudioSynthesizer {
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

  // Authentic retro MSN notification/message chime: a gorgeous "ba-ding!" bell ring
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
      console.warn("MSN notification sound failed:", e);
    }
  }

  // MSN Nudge Sound: A mechanical vibration sound mixed with a rapid warning frequency
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
      console.warn("MSN nudge sound failed to synthesize:", e);
    }
  }

  // Dramatic MSN crown buzz - we can alias to an extra loud Nudge!
  public playCrownBuzz() {
    this.playNudge(0.8);
  }
}

export const hiveAudio = new MsnAudioSynthesizer();
