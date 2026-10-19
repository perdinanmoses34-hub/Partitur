/**
 * SATB Composer Studio - Music Theory Engine
 * Handles MIDI pitches, enharmonics, scales, solfege / Not Angka conversions,
 * chord structures and durations.
 */

import { KeyName, NotePitch, ScoreNote, TimeSignature, VocalRangeSettings } from '../types/music';

export const PITCH_STEPS: ('C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B')[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export const STEP_SEMITONES: Record<string, number> = {
  'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
};

export interface KeyInfo {
  name: KeyName;
  rootPitchClass: number; // 0=C, 1=C#, 2=D, ... 11=B
  fifths: number; // -7 to +7
  mode: 'major' | 'minor';
  scalePitches: number[]; // relative semitones
  scaleNames: string[];
}

export const KEYS_INFO: Record<KeyName, KeyInfo> = {
  'C':  { name: 'C',  rootPitchClass: 0,  fifths: 0,  mode: 'major', scalePitches: [0, 2, 4, 5, 7, 9, 11], scaleNames: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  'G':  { name: 'G',  rootPitchClass: 7,  fifths: 1,  mode: 'major', scalePitches: [7, 9, 11, 0, 2, 4, 6], scaleNames: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'] },
  'D':  { name: 'D',  rootPitchClass: 2,  fifths: 2,  mode: 'major', scalePitches: [2, 4, 6, 7, 9, 11, 1], scaleNames: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'] },
  'A':  { name: 'A',  rootPitchClass: 9,  fifths: 3,  mode: 'major', scalePitches: [9, 11, 1, 2, 4, 6, 8], scaleNames: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'] },
  'E':  { name: 'E',  rootPitchClass: 4,  fifths: 4,  mode: 'major', scalePitches: [4, 6, 8, 9, 11, 1, 3], scaleNames: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'] },
  'B':  { name: 'B',  rootPitchClass: 11, fifths: 5,  mode: 'major', scalePitches: [11, 1, 3, 4, 6, 8, 10], scaleNames: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'] },
  'F#': { name: 'F#', rootPitchClass: 6,  fifths: 6,  mode: 'major', scalePitches: [6, 8, 10, 11, 1, 3, 5], scaleNames: ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'] },
  'F':  { name: 'F',  rootPitchClass: 5,  fifths: -1, mode: 'major', scalePitches: [5, 7, 9, 10, 0, 2, 4], scaleNames: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'] },
  'Bb': { name: 'Bb', rootPitchClass: 10, fifths: -2, mode: 'major', scalePitches: [10, 0, 2, 3, 5, 7, 9], scaleNames: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'] },
  'Eb': { name: 'Eb', rootPitchClass: 3,  fifths: -3, mode: 'major', scalePitches: [3, 5, 7, 8, 10, 0, 2], scaleNames: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'] },
  'Ab': { name: 'Ab', rootPitchClass: 8,  fifths: -4, mode: 'major', scalePitches: [8, 10, 0, 1, 3, 5, 7], scaleNames: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'] },
  'Db': { name: 'Db', rootPitchClass: 1,  fifths: -5, mode: 'major', scalePitches: [1, 3, 5, 6, 8, 10, 0], scaleNames: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'] },
  'Gb': { name: 'Gb', rootPitchClass: 6,  fifths: -6, mode: 'major', scalePitches: [6, 8, 10, 11, 1, 3, 5], scaleNames: ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'] },
  
  // Minor keys
  'Am': { name: 'Am', rootPitchClass: 9,  fifths: 0,  mode: 'minor', scalePitches: [9, 11, 0, 2, 4, 5, 7], scaleNames: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
  'Em': { name: 'Em', rootPitchClass: 4,  fifths: 1,  mode: 'minor', scalePitches: [4, 6, 7, 9, 11, 0, 2], scaleNames: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'] },
  'Bm': { name: 'Bm', rootPitchClass: 11, fifths: 2,  mode: 'minor', scalePitches: [11, 1, 2, 4, 6, 7, 9], scaleNames: ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'] },
  'F#m':{ name: 'F#m',rootPitchClass: 6,  fifths: 3,  mode: 'minor', scalePitches: [6, 8, 9, 11, 1, 2, 4], scaleNames: ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'] },
  'C#m':{ name: 'C#m',rootPitchClass: 1,  fifths: 4,  mode: 'minor', scalePitches: [1, 3, 4, 6, 8, 9, 11], scaleNames: ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'] },
  'G#m':{ name: 'G#m',rootPitchClass: 8,  fifths: 5,  mode: 'minor', scalePitches: [8, 10, 11, 1, 3, 4, 6], scaleNames: ['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F#'] },
  'D#m':{ name: 'D#m',rootPitchClass: 3,  fifths: 6,  mode: 'minor', scalePitches: [3, 5, 6, 8, 10, 11, 1], scaleNames: ['D#', 'E#', 'F#', 'G#', 'A#', 'B', 'C#'] },
  'Dm': { name: 'Dm', rootPitchClass: 2,  fifths: -1, mode: 'minor', scalePitches: [2, 4, 5, 7, 9, 10, 0], scaleNames: ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'] },
  'Gm': { name: 'Gm', rootPitchClass: 7,  fifths: -2, mode: 'minor', scalePitches: [7, 9, 10, 0, 2, 3, 5], scaleNames: ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'] },
  'Cm': { name: 'Cm', rootPitchClass: 0,  fifths: -3, mode: 'minor', scalePitches: [0, 2, 3, 5, 7, 8, 10], scaleNames: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'] },
  'Fm': { name: 'Fm', rootPitchClass: 5,  fifths: -4, mode: 'minor', scalePitches: [5, 7, 8, 10, 0, 1, 3], scaleNames: ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb'] },
  'Bbm':{ name: 'Bbm',rootPitchClass: 10, fifths: -5, mode: 'minor', scalePitches: [10, 0, 1, 3, 5, 6, 8], scaleNames: ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'] },
  'Ebm':{ name: 'Ebm',rootPitchClass: 3,  fifths: -6, mode: 'minor', scalePitches: [3, 5, 6, 8, 10, 11, 1], scaleNames: ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb', 'Db'] },
};

export const DEFAULT_VOCAL_RANGES: VocalRangeSettings = {
  soprano: { minMidi: 60, maxMidi: 81, minNote: 'C4', maxNote: 'A5' }, // C4 to A5
  alto:    { minMidi: 55, maxMidi: 74, minNote: 'G3', maxNote: 'D5' }, // G3 to D5
  tenor:   { minMidi: 48, maxMidi: 67, minNote: 'C3', maxNote: 'G4' }, // C3 to G4
  bass:    { minMidi: 40, maxMidi: 60, minNote: 'E2', maxNote: 'C4' }, // E2 to C4
};

/**
 * Convert NotePitch to MIDI number (Middle C = C4 = 60)
 */
export function pitchToMidi(pitch: NotePitch): number {
  const base = STEP_SEMITONES[pitch.step];
  const alter = pitch.alter || 0;
  return (pitch.octave + 1) * 12 + base + alter;
}

/**
 * Convert MIDI number to NotePitch with consideration of the key signature
 */
export function midiToPitch(midi: number, keyName: KeyName = 'C'): NotePitch {
  const octave = Math.floor(midi / 12) - 1;
  const pitchClass = ((midi % 12) + 12) % 12;
  const keyInfo = KEYS_INFO[keyName] || KEYS_INFO['C'];

  // Check if matches standard pitch in key
  const scaleIdx = keyInfo.scalePitches.indexOf(pitchClass);
  if (scaleIdx !== -1) {
    const rawName = keyInfo.scaleNames[scaleIdx];
    const step = rawName[0] as NotePitch['step'];
    let alter = 0;
    if (rawName.includes('#')) alter = 1;
    else if (rawName.includes('b')) alter = -1;
    return { step, alter, octave };
  }

  // Fallback chromatic naming based on key fifths
  const sharps = keyInfo.fifths >= 0;
  const sharpMap: Record<number, { step: NotePitch['step']; alter: number }> = {
    0: { step: 'C', alter: 0 },
    1: { step: 'C', alter: 1 },
    2: { step: 'D', alter: 0 },
    3: { step: 'D', alter: 1 },
    4: { step: 'E', alter: 0 },
    5: { step: 'F', alter: 0 },
    6: { step: 'F', alter: 1 },
    7: { step: 'G', alter: 0 },
    8: { step: 'G', alter: 1 },
    9: { step: 'A', alter: 0 },
    10: { step: 'A', alter: 1 },
    11: { step: 'B', alter: 0 },
  };

  const flatMap: Record<number, { step: NotePitch['step']; alter: number }> = {
    0: { step: 'C', alter: 0 },
    1: { step: 'D', alter: -1 },
    2: { step: 'D', alter: 0 },
    3: { step: 'E', alter: -1 },
    4: { step: 'E', alter: 0 },
    5: { step: 'F', alter: 0 },
    6: { step: 'G', alter: -1 },
    7: { step: 'G', alter: 0 },
    8: { step: 'A', alter: -1 },
    9: { step: 'A', alter: 0 },
    10: { step: 'B', alter: -1 },
    11: { step: 'B', alter: 0 },
  };

  const mapping = sharps ? sharpMap[pitchClass] : flatMap[pitchClass];
  return {
    step: mapping.step,
    alter: mapping.alter,
    octave,
  };
}

/**
 * Format pitch as string (e.g. "C4", "F#5", "Bb3")
 */
export function pitchToString(pitch: NotePitch): string {
  let acc = '';
  if (pitch.alter === 1) acc = '#';
  else if (pitch.alter === -1) acc = 'b';
  else if (pitch.alter === 2) acc = '##';
  else if (pitch.alter === -2) acc = 'bb';
  return `${pitch.step}${acc}${pitch.octave}`;
}

/**
 * Convert MIDI note to formatted string
 */
export function midiToString(midi: number, keyName: KeyName = 'C'): string {
  const p = midiToPitch(midi, keyName);
  return pitchToString(p);
}

/**
 * Parse string like "C4", "G#5", "Bb3" to NotePitch
 */
export function stringToPitch(str: string): NotePitch | null {
  const match = str.trim().match(/^([A-G])([#b]{0,2})(-?\d+)$/i);
  if (!match) return null;
  const step = match[1].toUpperCase() as NotePitch['step'];
  const acc = match[2];
  const octave = parseInt(match[3], 10);
  let alter = 0;
  if (acc === '#') alter = 1;
  else if (acc === '##') alter = 2;
  else if (acc === 'b') alter = -1;
  else if (acc === 'bb') alter = -2;
  return { step, alter, octave };
}

/**
 * Convert a MIDI pitch to Indonesian Not Angka (solfege notation) relative to Key
 * 1 = Do, 2 = Re, 3 = Mi, 4 = Fa, 5 = Sol, 6 = La, 7 = Si, 0 = Rest
 * With octave indicators (dots above/below) and chromatic modifiers (/)
 */
export function midiToNotAngka(
  midi: number,
  keyName: KeyName = 'C'
): { numberStr: string; octaveDots: number; display: string } {
  const keyInfo = KEYS_INFO[keyName] || KEYS_INFO['C'];
  const rootMidi = 60 + keyInfo.rootPitchClass; // Middle octave tonic
  
  // Calculate semitone distance from key root
  const diff = midi - rootMidi;
  const octavesOffset = Math.floor(diff / 12);
  const semitoneInOctave = ((diff % 12) + 12) % 12;

  // Major scale degrees: 0->1, 2->2, 4->3, 5->4, 7->5, 9->6, 11->7
  const degreeMap: Record<number, { num: string; isChromatic?: boolean }> = {
    0: { num: '1' },
    1: { num: '1/', isChromatic: true },
    2: { num: '2' },
    3: { num: '2/', isChromatic: true },
    4: { num: '3' },
    5: { num: '4' },
    6: { num: '4/', isChromatic: true },
    7: { num: '5' },
    8: { num: '5/', isChromatic: true },
    9: { num: '6' },
    10: { num: '6/', isChromatic: true },
    11: { num: '7' },
  };

  const entry = degreeMap[semitoneInOctave] || { num: '?' };
  const num = entry.num;

  // Indonesian notation display with unicode dots:
  // dot above: \u0307 (combining dot above)
  // dot below: \u0323 (combining dot below)
  let display = num;
  if (octavesOffset > 0) {
    display = num + '̇'.repeat(octavesOffset);
  } else if (octavesOffset < 0) {
    display = num + '̣'.repeat(Math.abs(octavesOffset));
  }

  return {
    numberStr: num,
    octaveDots: octavesOffset,
    display,
  };
}

/**
 * Convert Not Angka symbol (e.g. "1", "3", "5.", "5,", "1̇", "5̣", "4/") back to MIDI pitch
 */
export function notAngkaToMidi(
  token: string,
  keyName: KeyName = 'C'
): number | null {
  const cleaned = token.trim();
  if (cleaned === '0' || cleaned === '') return null; // Rest

  const keyInfo = KEYS_INFO[keyName] || KEYS_INFO['C'];
  const rootMidi = 60 + keyInfo.rootPitchClass;

  // Check dots
  let octaveShift = 0;
  // Check dots above / below
  const dotAboveCount = (cleaned.match(/[\.̇]/g) || []).length;
  const dotBelowCount = (cleaned.match(/[,̣]/g) || []).length;
  // If dot is punctuation dot at end or combining dot
  if (cleaned.includes('̇') || cleaned.includes('.')) {
    octaveShift += dotAboveCount;
  }
  if (cleaned.includes('̣') || cleaned.includes(',')) {
    octaveShift -= dotBelowCount;
  }

  const baseChar = cleaned.replace(/[^1-7/b#]/g, '');
  const semitonesByDegree: Record<string, number> = {
    '1': 0,
    '1/': 1,
    '1#': 1,
    '2b': 1,
    '2': 2,
    '2/': 3,
    '2#': 3,
    '3b': 3,
    '3': 4,
    '4': 5,
    '4/': 6,
    '4#': 6,
    '5b': 6,
    '5': 7,
    '5/': 8,
    '5#': 8,
    '6b': 8,
    '6': 9,
    '6/': 10,
    '6#': 10,
    '7b': 10,
    '7': 11,
  };

  const semitone = semitonesByDegree[baseChar];
  if (semitone === undefined) return null;

  return rootMidi + octaveShift * 12 + semitone;
}

/**
 * Standard Triad & 7th Chords Notes (Pitch Classes 0..11 relative to Key or Absolute)
 */
export const CHORD_DEFINITIONS: Record<string, number[]> = {
  // Major
  '': [0, 4, 7],
  'maj': [0, 4, 7],
  'M': [0, 4, 7],
  // Minor
  'm': [0, 3, 7],
  'min': [0, 3, 7],
  // Dominant 7th
  '7': [0, 4, 7, 10],
  // Major 7th
  'maj7': [0, 4, 7, 11],
  // Minor 7th
  'm7': [0, 3, 7, 10],
  // Diminished
  'dim': [0, 3, 6],
  '°': [0, 3, 6],
  // Augmented
  'aug': [0, 4, 8],
  // Suspended
  'sus4': [0, 5, 7],
  'sus2': [0, 2, 7],
};

/**
 * Parse chord symbol (e.g., "C", "G7", "Am", "F#m", "Bb")
 * returns root pitch class (0-11) and notes in semitones relative to root
 */
export function parseChord(chordName: string): { rootPc: number; intervals: number[]; name: string } | null {
  if (!chordName || chordName.trim() === '') return null;
  const match = chordName.trim().match(/^([A-G][#b]?)(.*)$/);
  if (!match) return null;

  const rootName = match[1];
  const quality = match[2];

  const rootInfo = KEYS_INFO[rootName as KeyName];
  const rootPc = rootInfo ? rootInfo.rootPitchClass : STEP_SEMITONES[rootName[0]];

  const intervals = CHORD_DEFINITIONS[quality] || CHORD_DEFINITIONS[''];
  return {
    rootPc,
    intervals,
    name: chordName,
  };
}

/**
 * Check if a MIDI note belongs to a chord
 */
export function isNoteInChord(midi: number, chordName: string): boolean {
  const parsed = parseChord(chordName);
  if (!parsed) return true;
  const notePc = ((midi % 12) + 12) % 12;
  const chordPcs = parsed.intervals.map(i => (parsed.rootPc + i) % 12);
  return chordPcs.includes(notePc);
}

/**
 * Calculate distance in semitones
 */
export function semitoneDistance(midi1: number, midi2: number): number {
  return Math.abs(midi1 - midi2);
}
