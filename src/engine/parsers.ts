/**
 * SATB Composer Studio - Melody & Text Notation Parsers
 * Parses Indonesian Not Angka text notation, letter note names,
 * and handles Web Audio melody transcription via autocorrelation.
 */

import { KeyName, Measure, ScoreNote, TimeSignature } from '../types/music';
import { midiToNotAngka, notAngkaToMidi, stringToPitch } from './musicTheory';

/**
 * Parse an Indonesian Not Angka input string into structured measures and notes.
 * Example input:
 * "| 1 1 5 5 | 6 6 5 . | 4 4 3 3 | 2 2 1 . |"
 */
export function parseNotAngkaText(
  text: string,
  keyName: KeyName,
  timeSignature: TimeSignature
): Measure[] {
  const cleaned = text.trim();
  if (!cleaned) return [];

  // Split by measure bars '|'
  let rawMeasures = cleaned.split('|').map(s => s.trim()).filter(s => s.length > 0);
  if (rawMeasures.length === 0) {
    rawMeasures = [cleaned];
  }

  const measures: Measure[] = [];
  const beatsPerMeasure = timeSignature.numerator || 4;

  rawMeasures.forEach((measureStr, mIdx) => {
    // Split tokens by whitespace
    const tokens = measureStr.split(/\s+/).filter(t => t.length > 0);
    const sopranoNotes: ScoreNote[] = [];

    // Calculate default duration per token if evenly spaced
    const baseDurationBeats = Math.max(0.25, beatsPerMeasure / Math.max(1, tokens.length));

    tokens.forEach((token, tIdx) => {
      const id = `S_${mIdx + 1}_${tIdx}`;

      // Check if token is a dot extension '.' (extends previous note duration)
      if (token === '.' && sopranoNotes.length > 0) {
        const lastNote = sopranoNotes[sopranoNotes.length - 1];
        lastNote.durationBeats += 1;
        lastNote.isDotted = true;
        return;
      }

      // Check if rest '0'
      if (token === '0' || token === '-') {
        sopranoNotes.push({
          id,
          isRest: true,
          duration: '1/4',
          durationBeats: 1,
          solfege: '0',
        });
        return;
      }

      // Parse pitch from not angka
      const midi = notAngkaToMidi(token, keyName);
      if (midi !== null) {
        const formatted = midiToNotAngka(midi, keyName);
        const pitch = stringToPitch(midiToNoteString(midi));

        sopranoNotes.push({
          id,
          isRest: false,
          pitch: pitch || { step: 'C', octave: 4 },
          duration: baseDurationBeats >= 2 ? '1/2' : (baseDurationBeats <= 0.5 ? '1/8' : '1/4'),
          durationBeats: baseDurationBeats,
          solfege: formatted.display,
        });
      }
    });

    if (sopranoNotes.length > 0) {
      measures.push({
        number: mIdx + 1,
        chord: '',
        notes: {
          soprano: sopranoNotes,
          alto: [],
          tenor: [],
          bass: [],
        },
      });
    }
  });

  return measures;
}

/**
 * Parse letter note names text (e.g. "C4 D4 E4 F4 | G4 G4 C5 .")
 */
export function parseNoteNamesText(
  text: string,
  keyName: KeyName,
  timeSignature: TimeSignature
): Measure[] {
  const cleaned = text.trim();
  if (!cleaned) return [];

  let rawMeasures = cleaned.split('|').map(s => s.trim()).filter(s => s.length > 0);
  if (rawMeasures.length === 0) rawMeasures = [cleaned];

  const measures: Measure[] = [];

  rawMeasures.forEach((measureStr, mIdx) => {
    const tokens = measureStr.split(/\s+/).filter(t => t.length > 0);
    const sopranoNotes: ScoreNote[] = [];

    tokens.forEach((token, tIdx) => {
      const id = `S_${mIdx + 1}_${tIdx}`;
      if (token.toUpperCase() === 'R' || token === '0') {
        sopranoNotes.push({
          id,
          isRest: true,
          duration: '1/4',
          durationBeats: 1,
          solfege: '0',
        });
        return;
      }

      const pitch = stringToPitch(token);
      if (pitch) {
        const midi = (pitch.octave + 1) * 12 + 0; // rough, pitchToMidi will resolve
        const solfege = midiToNotAngka(midi, keyName).display;
        sopranoNotes.push({
          id,
          isRest: false,
          pitch,
          duration: '1/4',
          durationBeats: 1,
          solfege,
        });
      }
    });

    if (sopranoNotes.length > 0) {
      measures.push({
        number: mIdx + 1,
        notes: { soprano: sopranoNotes, alto: [], tenor: [], bass: [] }
      });
    }
  });

  return measures;
}

function midiToNoteString(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${noteNames[pc]}${octave}`;
}

/**
 * Pitch detection via Autocorrelation for Audio / Whistle / Singing melody input
 */
export function autoCorrelateAudioBuffer(buffer: Float32Array, sampleRate: number): number | null {
  const SIZE = buffer.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // Signal is too quiet
  if (rms < 0.015) return null;

  // Autocorrelation algorithm
  let r1 = 0;
  let r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }
  }

  const buf = buffer.slice(r1, r2);
  const c = new Array(buf.length).fill(0);
  for (let i = 0; i < buf.length; i++) {
    for (let j = 0; j < buf.length - i; j++) {
      c[i] = c[i] + buf[j] * buf[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < buf.length; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;
  // Parabolic interpolation
  const x1 = c[T0 - 1];
  const x2 = c[T0];
  const x3 = c[T0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  const freq = sampleRate / T0;
  if (freq < 65 || freq > 1200) return null; // Human vocal range ~C2 to D6

  return freq;
}

/**
 * Frequency to MIDI pitch
 */
export function frequencyToMidi(freq: number): number {
  return Math.round(12 * (Math.log2(freq / 440)) + 69);
}
