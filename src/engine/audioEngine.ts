/**
 * SATB Composer Studio - 4-Part Audio Playback Engine
 * Built with Tone.js for high-fidelity 4-voice polyphonic playback.
 * Supports Piano, Church Organ, and Synthetic Vocal Choir sounds,
 * individual S/A/T/B volume, mute, solo controls, and playhead tracking.
 */

import * as Tone from 'tone';
import { SATBScore, VoicePart } from '../types/music';
import { pitchToMidi } from './musicTheory';

export type InstrumentType = 'piano' | 'organ' | 'choir';

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentMeasure: number;
  currentBeat: number;
  tempoBpm: number;
}

export interface VoiceVolumeControl {
  soprano: number; // 0 to 1
  alto: number;
  tenor: number;
  bass: number;
  sopranoMute: boolean;
  altoMute: boolean;
  tenorMute: boolean;
  bassMute: boolean;
  sopranoSolo: boolean;
  altoSolo: boolean;
  tenorSolo: boolean;
  bassSolo: boolean;
}

export class AudioEngine {
  private synths: Record<VoicePart, Tone.PolySynth | null> = {
    soprano: null,
    alto: null,
    tenor: null,
    bass: null,
  };

  private channelGains: Record<VoicePart, Tone.Gain | null> = {
    soprano: null,
    alto: null,
    tenor: null,
    bass: null,
  };

  private masterGain: Tone.Gain | null = null;
  private reverb: Tone.Reverb | null = null;
  private isInitialized = false;
  private currentScore: SATBScore | null = null;
  private instrument: InstrumentType = 'piano';
  private scheduledEvents: number[] = [];
  private onPositionUpdate: ((measureNum: number, beat: number) => void) | null = null;
  private onPlayEnd: (() => void) | null = null;

  public voiceControls: VoiceVolumeControl = {
    soprano: 0.85,
    alto: 0.85,
    tenor: 0.85,
    bass: 0.9,
    sopranoMute: false,
    altoMute: false,
    tenorMute: false,
    bassMute: false,
    sopranoSolo: false,
    altoSolo: false,
    tenorSolo: false,
    bassSolo: false,
  };

  /**
   * Initialize Tone.js audio context and synthesis chain
   */
  public async initAudio(): Promise<void> {
    if (this.isInitialized) return;
    await Tone.start();

    // Master reverb for sacred cathedral acoustic ambience
    this.reverb = new Tone.Reverb({
      decay: 2.2,
      preDelay: 0.05,
      wet: 0.25,
    }).toDestination();
    await this.reverb.generate();

    this.masterGain = new Tone.Gain(0.9).connect(this.reverb);

    const voices: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];
    voices.forEach(voice => {
      const gain = new Tone.Gain(this.voiceControls[voice]);
      gain.connect(this.masterGain!);
      this.channelGains[voice] = gain;
    });

    this.setupSynths(this.instrument);
    this.isInitialized = true;
  }

  /**
   * Set up synthesis presets
   */
  public setInstrument(type: InstrumentType): void {
    this.instrument = type;
    if (this.isInitialized) {
      this.setupSynths(type);
    }
  }

  private setupSynths(type: InstrumentType): void {
    const voices: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];

    voices.forEach(voice => {
      if (this.synths[voice]) {
        this.synths[voice]?.dispose();
      }

      let synth: Tone.PolySynth;

      if (type === 'organ') {
        // Church Organ: harmonic richness, slow decay, additive pipes
        synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle8' },
          envelope: {
            attack: 0.08,
            decay: 0.3,
            sustain: 0.85,
            release: 0.5,
          },
        });
      } else if (type === 'choir') {
        // Synthetic Choir / Vocal Pad: soft attack, gentle choral resonance
        synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine4' },
          envelope: {
            attack: 0.15,
            decay: 0.5,
            sustain: 0.75,
            release: 0.8,
          },
        });
      } else {
        // Piano: percussive attack, exponential decay
        synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: {
            attack: 0.015,
            decay: 1.2,
            sustain: 0.35,
            release: 0.6,
          },
        });
      }

      const gain = this.channelGains[voice];
      if (gain) {
        synth.connect(gain);
      }
      this.synths[voice] = synth;
    });

    this.updateGains();
  }

  /**
   * Update gain values considering volume sliders, mute, and solo states
   */
  public updateGains(): void {
    if (!this.isInitialized) return;

    const {
      soprano, alto, tenor, bass,
      sopranoMute, altoMute, tenorMute, bassMute,
      sopranoSolo, altoSolo, tenorSolo, bassSolo,
    } = this.voiceControls;

    const anySolo = sopranoSolo || altoSolo || tenorSolo || bassSolo;

    const computeGain = (vol: number, mute: boolean, solo: boolean) => {
      if (mute) return 0;
      if (anySolo) return solo ? vol : 0;
      return vol;
    };

    if (this.channelGains.soprano) this.channelGains.soprano.gain.rampTo(computeGain(soprano, sopranoMute, sopranoSolo), 0.05);
    if (this.channelGains.alto) this.channelGains.alto.gain.rampTo(computeGain(alto, altoMute, altoSolo), 0.05);
    if (this.channelGains.tenor) this.channelGains.tenor.gain.rampTo(computeGain(tenor, tenorMute, tenorSolo), 0.05);
    if (this.channelGains.bass) this.channelGains.bass.gain.rampTo(computeGain(bass, bassMute, bassSolo), 0.05);
  }

  public setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.rampTo(Math.max(0, Math.min(1, volume)), 0.05);
    }
  }

  /**
   * Schedule score notes on Tone.Transport
   */
  public prepareScore(score: SATBScore): void {
    this.currentScore = score;
    this.clearSchedule();

    const bpm = score.metadata.tempoBpm || 84;
    Tone.getTransport().bpm.value = bpm;
    const secondsPerBeat = 60 / bpm;

    let currentScoreTime = 0;
    const voices: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];

    score.measures.forEach((measure) => {
      const measureStartTime = currentScoreTime;
      const measureNum = measure.number;

      // Event for UI playhead tracking at measure start
      const trackingEventId = Tone.getTransport().schedule((time) => {
        Tone.getDraw().schedule(() => {
          if (this.onPositionUpdate) {
            this.onPositionUpdate(measureNum, 1);
          }
        }, time);
      }, measureStartTime);
      this.scheduledEvents.push(trackingEventId);

      let maxMeasureDuration = 0;

      // Schedule each voice
      voices.forEach((voice) => {
        const notes = measure.notes[voice];
        if (!notes) return;

        let voiceTimeOffset = 0;

        notes.forEach((note) => {
          const noteDurationSec = (note.durationBeats || 1) * secondsPerBeat;
          const noteStartTime = measureStartTime + voiceTimeOffset;

          if (!note.isRest && note.pitch && this.synths[voice]) {
            const midi = pitchToMidi(note.pitch);
            // Tenor voices convention: Tone.js plays absolute MIDI pitch
            const freq = Tone.Frequency(midi, 'midi').toFrequency();
            const synth = this.synths[voice]!;

            const eventId = Tone.getTransport().schedule((time) => {
              synth.triggerAttackRelease(freq, Math.max(0.08, noteDurationSec * 0.92), time);
            }, noteStartTime);

            this.scheduledEvents.push(eventId);
          }

          voiceTimeOffset += noteDurationSec;
        });

        if (voiceTimeOffset > maxMeasureDuration) {
          maxMeasureDuration = voiceTimeOffset;
        }
      });

      // Advance time by measure duration
      const beats = measure.timeSignature?.numerator || score.metadata.timeSignature.numerator || 4;
      currentScoreTime += Math.max(maxMeasureDuration, beats * secondsPerBeat);
    });

    // Schedule stop at end
    const endEventId = Tone.getTransport().schedule(() => {
      Tone.getDraw().schedule(() => {
        this.stop();
        if (this.onPlayEnd) {
          this.onPlayEnd();
        }
      }, Tone.now());
    }, currentScoreTime + 0.5);
    this.scheduledEvents.push(endEventId);
  }

  public async play(score?: SATBScore): Promise<void> {
    await this.initAudio();
    if (score && score !== this.currentScore) {
      this.prepareScore(score);
    }
    Tone.getTransport().start();
  }

  public pause(): void {
    Tone.getTransport().pause();
  }

  public stop(): void {
    Tone.getTransport().stop();
    Tone.getTransport().seconds = 0;
    if (this.onPositionUpdate) {
      this.onPositionUpdate(1, 1);
    }
  }

  public seekToMeasure(measureNumber: number, score: SATBScore): void {
    const bpm = score.metadata.tempoBpm || 84;
    const secondsPerBeat = 60 / bpm;
    let targetTime = 0;

    for (let i = 0; i < score.measures.length; i++) {
      const m = score.measures[i];
      if (m.number === measureNumber) break;
      const beats = m.timeSignature?.numerator || score.metadata.timeSignature.numerator || 4;
      targetTime += beats * secondsPerBeat;
    }

    Tone.getTransport().seconds = targetTime;
  }

  public setTempo(bpm: number): void {
    Tone.getTransport().bpm.rampTo(bpm, 0.1);
  }

  public setCallbacks(
    onPositionUpdate: (measureNum: number, beat: number) => void,
    onPlayEnd: () => void
  ): void {
    this.onPositionUpdate = onPositionUpdate;
    this.onPlayEnd = onPlayEnd;
  }

  private clearSchedule(): void {
    this.scheduledEvents.forEach(id => Tone.getTransport().clear(id));
    this.scheduledEvents = [];
    Tone.getTransport().cancel();
  }

  public dispose(): void {
    this.clearSchedule();
    Object.values(this.synths).forEach(s => s?.dispose());
    Object.values(this.channelGains).forEach(g => g?.dispose());
    this.masterGain?.dispose();
    this.reverb?.dispose();
    this.isInitialized = false;
  }
}

export const audioPlayer = new AudioEngine();
