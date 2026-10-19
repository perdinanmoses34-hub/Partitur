/**
 * SATB Composer Studio - Transposition Engine
 * Transposes entire 4-part score or individual voices by semitones or target key.
 * Accurately updates pitches, enharmonics, Not Angka solfege relative to the new tonic,
 * and chord symbols.
 */

import { KeyName, Measure, SATBScore, ScoreNote, VoicePart } from '../types/music';
import {
  KEYS_INFO,
  midiToNotAngka,
  midiToPitch,
  parseChord,
  pitchToMidi,
  STEP_SEMITONES
} from './musicTheory';

/**
 * Transpose a single score note by semitones into a new key
 */
export function transposeNote(note: ScoreNote, semitones: number, targetKey: KeyName): ScoreNote {
  if (note.isRest || !note.pitch) {
    return { ...note };
  }

  const currentMidi = pitchToMidi(note.pitch);
  const newMidi = currentMidi + semitones;
  const newPitch = midiToPitch(newMidi, targetKey);
  const notAngka = midiToNotAngka(newMidi, targetKey);

  return {
    ...note,
    pitch: newPitch,
    solfege: notAngka.display,
  };
}

/**
 * Transpose a chord name (e.g. "C" + 2 = "D", "Am" + 2 = "Bm", "G7" + 2 = "A7")
 */
export function transposeChordName(chordStr: string, semitones: number, targetKey: KeyName): string {
  const parsed = parseChord(chordStr);
  if (!parsed) return chordStr;

  const newRootPc = ((parsed.rootPc + semitones) % 12 + 12) % 12;
  const keyInfo = KEYS_INFO[targetKey] || KEYS_INFO['C'];
  
  // Find name of this pitch class in target key scale or standard chromatic
  const scaleIdx = keyInfo.scalePitches.indexOf(newRootPc);
  let rootName = '';
  if (scaleIdx !== -1) {
    rootName = keyInfo.scaleNames[scaleIdx];
  } else {
    // Sharp or flat preference
    const sharps = keyInfo.fifths >= 0;
    const sharpNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const flatNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    rootName = sharps ? sharpNames[newRootPc] : flatNames[newRootPc];
  }

  // Suffix (e.g., "m", "7", "maj7", "dim", "sus4")
  const suffix = chordStr.replace(/^[A-G][#b]?/, '');
  return `${rootName}${suffix}`;
}

/**
 * Calculate semitones difference between two keys
 */
export function getSemitoneDistanceBetweenKeys(fromKey: KeyName, toKey: KeyName): number {
  const fromInfo = KEYS_INFO[fromKey] || KEYS_INFO['C'];
  const toInfo = KEYS_INFO[toKey] || KEYS_INFO['C'];
  let diff = toInfo.rootPitchClass - fromInfo.rootPitchClass;
  // Choose shortest path or natural octave
  if (diff > 6) diff -= 12;
  if (diff < -5) diff += 12;
  return diff;
}

/**
 * Transpose entire SATB score to a new Key or by semitones
 */
export function transposeScore(
  score: SATBScore,
  targetKey: KeyName,
  voiceToTranspose: VoicePart | 'all' = 'all'
): SATBScore {
  const semitones = getSemitoneDistanceBetweenKeys(score.metadata.key, targetKey);
  if (semitones === 0 && score.metadata.key === targetKey) {
    return score;
  }

  const voices: VoicePart[] = voiceToTranspose === 'all'
    ? ['soprano', 'alto', 'tenor', 'bass']
    : [voiceToTranspose];

  const newMeasures: Measure[] = score.measures.map(measure => {
    const newNotes = { ...measure.notes };

    voices.forEach(v => {
      newNotes[v] = measure.notes[v].map(note => transposeNote(note, semitones, targetKey));
    });

    const newChord = measure.chord ? transposeChordName(measure.chord, semitones, targetKey) : undefined;

    return {
      ...measure,
      chord: newChord,
      keySignature: targetKey,
      notes: newNotes,
    };
  });

  return {
    ...score,
    metadata: {
      ...score.metadata,
      key: targetKey,
      updatedAt: Date.now(),
    },
    measures: newMeasures,
  };
}

/**
 * Transpose score by relative semitone delta (+1, -1, +2, -2)
 */
export function transposeBySemitones(
  score: SATBScore,
  deltaSemitones: number,
  voiceToTranspose: VoicePart | 'all' = 'all'
): SATBScore {
  if (deltaSemitones === 0) return score;

  const currentKeyInfo = KEYS_INFO[score.metadata.key] || KEYS_INFO['C'];
  const newRootPc = ((currentKeyInfo.rootPitchClass + deltaSemitones) % 12 + 12) % 12;

  // Find corresponding key name
  const isMinor = currentKeyInfo.mode === 'minor';
  let targetKey: KeyName = score.metadata.key;
  for (const [k, info] of Object.entries(KEYS_INFO)) {
    if (info.rootPitchClass === newRootPc && (isMinor ? info.mode === 'minor' : info.mode === 'major')) {
      targetKey = k as KeyName;
      break;
    }
  }

  const voices: VoicePart[] = voiceToTranspose === 'all'
    ? ['soprano', 'alto', 'tenor', 'bass']
    : [voiceToTranspose];

  const newMeasures: Measure[] = score.measures.map(measure => {
    const newNotes = { ...measure.notes };

    voices.forEach(v => {
      newNotes[v] = measure.notes[v].map(note => transposeNote(note, deltaSemitones, targetKey));
    });

    const newChord = measure.chord ? transposeChordName(measure.chord, deltaSemitones, targetKey) : undefined;

    return {
      ...measure,
      chord: newChord,
      keySignature: targetKey,
      notes: newNotes,
    };
  });

  return {
    ...score,
    metadata: {
      ...score.metadata,
      key: targetKey,
      updatedAt: Date.now(),
    },
    measures: newMeasures,
  };
}
