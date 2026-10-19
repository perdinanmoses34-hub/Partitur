/**
 * SATB Composer Studio - SATB Arrangement Engine
 * Automatic 4-part choir voicing (Soprano, Alto, Tenor, Bass) based on
 * classical counterpoint, church hymnal harmonic principles, and style guidelines.
 */

import {
  ArrangementStyle,
  KeyName,
  Measure,
  ScoreNote,
  TimeSignature,
  VocalRangeSettings,
  VoicePart
} from '../types/music';
import {
  DEFAULT_VOCAL_RANGES,
  KEYS_INFO,
  midiToNotAngka,
  midiToPitch,
  parseChord,
  pitchToMidi
} from './musicTheory';

/**
 * Standard chord progression degrees in a given key
 * (I, ii, iii, IV, V, vi, vii°)
 */
export function getDiatonicChords(keyName: KeyName): string[] {
  const info = KEYS_INFO[keyName] || KEYS_INFO['C'];
  if (info.mode === 'minor') {
    return [
      `${info.scaleNames[0]}m`,
      `${info.scaleNames[1]}dim`,
      `${info.scaleNames[2]}`,
      `${info.scaleNames[3]}m`,
      `${info.scaleNames[4]}`,
      `${info.scaleNames[5]}`,
      `${info.scaleNames[6]}dim`,
    ];
  }
  // Major: I, ii, iii, IV, V, vi, vii°
  return [
    `${info.scaleNames[0]}`,     // I
    `${info.scaleNames[1]}m`,    // ii
    `${info.scaleNames[2]}m`,    // iii
    `${info.scaleNames[3]}`,     // IV
    `${info.scaleNames[4]}`,     // V
    `${info.scaleNames[5]}m`,    // vi
    `${info.scaleNames[6]}dim`,  // vii°
  ];
}

/**
 * Automatically infer the best chord for a note or beat in a measure
 */
export function inferChordForMelody(
  midi: number,
  keyName: KeyName,
  measureIndex: number,
  totalMeasures: number,
  isLastBeat: boolean,
  previousChord?: string
): string {
  const diatonic = getDiatonicChords(keyName);
  const I = diatonic[0];
  const ii = diatonic[1];
  const IV = diatonic[3];
  const V = diatonic[4];
  const vi = diatonic[5];

  const pc = ((midi % 12) + 12) % 12;
  const keyInfo = KEYS_INFO[keyName] || KEYS_INFO['C'];
  const rootPc = keyInfo.rootPitchClass;

  // Degree: 0=1, 2=2, 4=3, 5=4, 7=5, 9=6, 11=7
  const degree = ((pc - rootPc) + 12) % 12;

  // Last measure cadence logic
  if (measureIndex >= totalMeasures - 1) {
    if (isLastBeat || degree === 0 || degree === 4) return I;
    return V;
  }
  if (measureIndex === totalMeasures - 2) {
    // Penultimate measure: often IV or V
    if (degree === 11 || degree === 2 || degree === 7) return `${V}7`;
    return V;
  }

  // Harmonic choice based on melody note degree
  switch (degree) {
    case 0: // 1 (Do)
      return measureIndex === 0 ? I : (previousChord === V ? I : (Math.random() > 0.4 ? I : IV));
    case 2: // 2 (Re)
      return Math.random() > 0.5 ? V : ii;
    case 4: // 3 (Mi)
      return Math.random() > 0.3 ? I : vi;
    case 5: // 4 (Fa)
      return Math.random() > 0.4 ? IV : ii;
    case 7: // 5 (Sol)
      return previousChord === IV ? I : (Math.random() > 0.5 ? I : V);
    case 9: // 6 (La)
      return Math.random() > 0.5 ? IV : vi;
    case 11: // 7 (Si - Leading tone)
      return V;
    default:
      return I;
  }
}

/**
 * Generate 3 accompanying voices (Alto, Tenor, Bass) given the melody (usually Soprano)
 */
export function harmonizeSATB(
  measures: Measure[],
  keyName: KeyName,
  style: ArrangementStyle = 'hymn_satb',
  melodyVoice: VoicePart = 'soprano',
  ranges: VocalRangeSettings = DEFAULT_VOCAL_RANGES,
  seedVariation = 0
): Measure[] {
  const result: Measure[] = JSON.parse(JSON.stringify(measures));
  const totalMeasures = result.length;

  let prevMidi = {
    soprano: 0,
    alto: 0,
    tenor: 0,
    bass: 0,
  };

  for (let mIdx = 0; mIdx < totalMeasures; mIdx++) {
    const measure = result[mIdx];
    const melodyNotes = measure.notes[melodyVoice];
    if (!melodyNotes || melodyNotes.length === 0) continue;

    // Determine measure chord if not specified
    let chord = measure.chord;
    if (!chord) {
      const firstValidNote = melodyNotes.find(n => !n.isRest && n.pitch);
      if (firstValidNote && firstValidNote.pitch) {
        const midi = pitchToMidi(firstValidNote.pitch);
        chord = inferChordForMelody(
          midi,
          keyName,
          mIdx,
          totalMeasures,
          false,
          mIdx > 0 ? result[mIdx - 1].chord : undefined
        );
        measure.chord = chord;
      } else {
        chord = getDiatonicChords(keyName)[0];
        measure.chord = chord;
      }
    }

    const chordInfo = parseChord(chord);
    const chordPcs = chordInfo
      ? chordInfo.intervals.map(i => (chordInfo.rootPc + i) % 12)
      : [0, 4, 7];
    const rootPc = chordInfo ? chordInfo.rootPc : 0;
    const thirdPc = chordPcs[1] !== undefined ? chordPcs[1] : (rootPc + 4) % 12;
    const fifthPc = chordPcs[2] !== undefined ? chordPcs[2] : (rootPc + 7) % 12;
    const seventhPc = chordPcs[3]; // if 7th chord

    const altoNotes: ScoreNote[] = [];
    const tenorNotes: ScoreNote[] = [];
    const bassNotes: ScoreNote[] = [];

    // Harmonize note by note matching melody rhythmic positions
    for (let nIdx = 0; nIdx < melodyNotes.length; nIdx++) {
      const mNote = melodyNotes[nIdx];
      const dur = mNote.duration;
      const durBeats = mNote.durationBeats;
      const idBase = `${measure.number}_${nIdx}`;

      if (mNote.isRest || !mNote.pitch) {
        altoNotes.push({ id: `A_${idBase}`, isRest: true, duration: dur, durationBeats: durBeats, solfege: '0' });
        tenorNotes.push({ id: `T_${idBase}`, isRest: true, duration: dur, durationBeats: durBeats, solfege: '0' });
        bassNotes.push({ id: `B_${idBase}`, isRest: true, duration: dur, durationBeats: durBeats, solfege: '0' });
        continue;
      }

      const sMidi = pitchToMidi(mNote.pitch);
      const sPc = ((sMidi % 12) + 12) % 12;

      // 1. Choose Bass note
      // Bass usually takes root (root position), or 3rd (1st inversion) in passing
      let bassTargetPc = rootPc;
      // Cadence: last chord always root in Bass
      const isFinal = mIdx === totalMeasures - 1 && nIdx === melodyNotes.length - 1;
      if (!isFinal && (style === 'classical' || style === 'advanced_choral') && Math.random() > 0.7) {
        bassTargetPc = thirdPc; // 1st inversion
      }

      let bMidi = findBestMidiForPitchClass(bassTargetPc, ranges.bass.minMidi, ranges.bass.maxMidi, prevMidi.bass || 48);

      // Check for voice crossing with Soprano (Bass must be strictly below Soprano)
      if (bMidi >= sMidi - 12) {
        bMidi = Math.max(ranges.bass.minMidi, bMidi - 12);
      }

      // 2. Identify remaining chord pitches needed to complete the triad
      // Rule: Triad needs root, 3rd, 5th.
      // Already have: Soprano (sPc), Bass (bPc).
      const bPc = ((bMidi % 12) + 12) % 12;
      const usedPcs = [sPc, bPc];

      // Missing pitches
      let remainingPcs = chordPcs.filter(pc => !usedPcs.includes(pc));

      if (remainingPcs.length === 0) {
        // Double root or 5th (never double leading tone)
        const keyInfo = KEYS_INFO[keyName] || KEYS_INFO['C'];
        const leadingTonePc = (keyInfo.rootPitchClass + 11) % 12;
        if (rootPc !== leadingTonePc) {
          remainingPcs = [rootPc, fifthPc];
        } else {
          remainingPcs = [fifthPc, thirdPc];
        }
      } else if (remainingPcs.length === 1) {
        // One note missing: add root or 5th as 2nd option
        remainingPcs.push(rootPc);
      }

      // Assign to Tenor and Alto
      let targetAltoPc = remainingPcs[0] !== undefined ? remainingPcs[0] : thirdPc;
      let targetTenorPc = remainingPcs[1] !== undefined ? remainingPcs[1] : fifthPc;

      // If style is modern_praise, add color tone (9th or suspended)
      if (style === 'modern_praise' && Math.random() > 0.6 && !isFinal) {
        const add9 = (rootPc + 2) % 12;
        targetTenorPc = add9;
      }

      let aMidi = findBestMidiForPitchClass(targetAltoPc, ranges.alto.minMidi, ranges.alto.maxMidi, prevMidi.alto || 64);
      let tMidi = findBestMidiForPitchClass(targetTenorPc, ranges.tenor.minMidi, ranges.tenor.maxMidi, prevMidi.tenor || 55);

      // Classical Voice-leading checks:
      // S >= A >= T >= B
      if (aMidi >= sMidi) {
        aMidi = aMidi - 12 >= ranges.alto.minMidi ? aMidi - 12 : aMidi;
      }
      if (tMidi >= aMidi) {
        tMidi = tMidi - 12 >= ranges.tenor.minMidi ? tMidi - 12 : tMidi;
      }
      if (bMidi >= tMidi) {
        bMidi = bMidi - 12 >= ranges.bass.minMidi ? bMidi - 12 : bMidi;
      }

      // Parallel 5th & Octave Prevention (Classical & Church Hymn styles)
      if (prevMidi.soprano > 0 && (style === 'classical' || style === 'hymn_satb' || style === 'church_traditional')) {
        const prevIntervalSB = (prevMidi.soprano - prevMidi.bass) % 12;
        const curIntervalSB = (sMidi - bMidi) % 12;
        if ((curIntervalSB === 7 || curIntervalSB === 0) && curIntervalSB === prevIntervalSB && sMidi !== prevMidi.soprano) {
          // Parallel 5th or 8ve detected! Invert or shift inner voices
          if (bMidi - 12 >= ranges.bass.minMidi) {
            bMidi -= 12;
          } else {
            tMidi = ((tMidi - prevMidi.tenor) > 0) ? tMidi - 12 : tMidi;
          }
        }
      }

      // Leading tone resolution in final cadence: scale degree 7 must resolve to 1
      const keyInfo = KEYS_INFO[keyName] || KEYS_INFO['C'];
      const leadingTonePc = (keyInfo.rootPitchClass + 11) % 12;
      if (isFinal) {
        // Final chord: Soprano or Bass on tonic, Alto on 3rd, Tenor on 5th or doubled tonic
        if (((aMidi % 12) + 12) % 12 === leadingTonePc) {
          aMidi += 1; // resolve 7 -> 1
        }
        if (((tMidi % 12) + 12) % 12 === leadingTonePc) {
          tMidi += 1;
        }
      }

      // Convert back to NotePitch & Not Angka
      const aPitch = midiToPitch(aMidi, keyName);
      const tPitch = midiToPitch(tMidi, keyName);
      const bPitch = midiToPitch(bMidi, keyName);

      const aSolfege = midiToNotAngka(aMidi, keyName).display;
      const tSolfege = midiToNotAngka(tMidi, keyName).display;
      const bSolfege = midiToNotAngka(bMidi, keyName).display;

      altoNotes.push({
        id: `A_${idBase}`,
        isRest: false,
        pitch: aPitch,
        duration: dur,
        durationBeats: durBeats,
        solfege: aSolfege,
        lyric: mNote.lyric,
      });

      tenorNotes.push({
        id: `T_${idBase}`,
        isRest: false,
        pitch: tPitch,
        duration: dur,
        durationBeats: durBeats,
        solfege: tSolfege,
        lyric: mNote.lyric,
      });

      bassNotes.push({
        id: `B_${idBase}`,
        isRest: false,
        pitch: bPitch,
        duration: dur,
        durationBeats: durBeats,
        solfege: bSolfege,
        lyric: mNote.lyric,
      });

      prevMidi = { soprano: sMidi, alto: aMidi, tenor: tMidi, bass: bMidi };
    }

    measure.notes.alto = altoNotes;
    measure.notes.tenor = tenorNotes;
    measure.notes.bass = bassNotes;
  }

  return result;
}

/**
 * Find best MIDI note matching a pitch class within a min/max vocal range,
 * minimizing step distance from previous note
 */
function findBestMidiForPitchClass(pc: number, minMidi: number, maxMidi: number, prevMidi: number): number {
  const candidates: number[] = [];
  for (let midi = minMidi; midi <= maxMidi; midi++) {
    if (((midi % 12) + 12) % 12 === pc) {
      candidates.push(midi);
    }
  }

  if (candidates.length === 0) {
    // If not in range, clamp to closest octave
    const base = 60 + pc;
    let clamped = base;
    while (clamped > maxMidi) clamped -= 12;
    while (clamped < minMidi) clamped += 12;
    return clamped;
  }

  // Choose candidate with smallest distance to previous note
  candidates.sort((a, b) => Math.abs(a - prevMidi) - Math.abs(b - prevMidi));
  return candidates[0];
}

/**
 * Generate a brand new sacred 4-part SATB composition from scratch based on Key and Time Signature
 */
export function generateNewSATBComposition(
  keyName: KeyName,
  timeSignature: TimeSignature,
  style: ArrangementStyle = 'hymn_satb',
  tempoBpm = 84,
  measuresCount = 8
): Measure[] {
  const keyInfo = KEYS_INFO[keyName] || KEYS_INFO['C'];
  const rootPc = keyInfo.rootPitchClass;
  const diatonic = getDiatonicChords(keyName);
  const I = diatonic[0];
  const ii = diatonic[1];
  const IV = diatonic[3];
  const V = diatonic[4];
  const vi = diatonic[5];

  // Standard inspiring church hymnal chord progression (8 measures)
  // e.g.: I - IV - I - V | vi - IV - V - I (4/4 or 3/4)
  const progressions = [
    [I, IV, I, V, vi, IV, `${V}7`, I],
    [I, V, vi, IV, I, ii, V, I],
    [I, vi, IV, V, I, IV, V, I],
  ];
  const chosenProg = progressions[Math.floor(Math.random() * progressions.length)];

  // Scale degrees in key (0=1, 2=2, 4=3, 5=4, 7=5, 9=6, 11=7)
  const tonicMidi = 60 + rootPc; // C4 + root

  const measures: Measure[] = [];
  const beatsPerMeasure = timeSignature.numerator;

  for (let m = 0; m < measuresCount; m++) {
    const chord = chosenProg[m % chosenProg.length];
    const sopranoNotes: ScoreNote[] = [];

    if (beatsPerMeasure === 4) {
      // 2 half notes or 4 quarter notes
      const pattern = m % 2 === 1 && m !== measuresCount - 1 ? 'quarters' : 'half_and_half';
      if (pattern === 'quarters') {
        for (let b = 0; b < 4; b++) {
          const sMidi = tonicMidi + [0, 4, 7, 12, 11, 9, 7, 4][(m * 2 + b) % 8];
          const pitch = midiToPitch(sMidi, keyName);
          const solfege = midiToNotAngka(sMidi, keyName).display;
          sopranoNotes.push({
            id: `S_${m + 1}_${b}`,
            isRest: false,
            pitch,
            duration: '1/4',
            durationBeats: 1,
            solfege,
          });
        }
      } else {
        // Two half notes
        for (let b = 0; b < 2; b++) {
          const sMidi = (m === measuresCount - 1 && b === 1) ? tonicMidi : tonicMidi + [0, 4, 7, 9, 7, 4, 2, 0][(m + b) % 8];
          const pitch = midiToPitch(sMidi, keyName);
          const solfege = midiToNotAngka(sMidi, keyName).display;
          sopranoNotes.push({
            id: `S_${m + 1}_${b}`,
            isRest: false,
            pitch,
            duration: '1/2',
            durationBeats: 2,
            solfege,
          });
        }
      }
    } else if (beatsPerMeasure === 3) {
      // 3/4 time (hymn waltz / gentle andante)
      // 1 dotted half note or 3 quarter notes
      if (m === measuresCount - 1) {
        // Final long chord
        const sMidi = tonicMidi;
        const pitch = midiToPitch(sMidi, keyName);
        const solfege = midiToNotAngka(sMidi, keyName).display;
        sopranoNotes.push({
          id: `S_${m + 1}_0`,
          isRest: false,
          pitch,
          duration: '1/2.',
          durationBeats: 3,
          solfege,
        });
      } else {
        for (let b = 0; b < 3; b++) {
          const sMidi = tonicMidi + [0, 2, 4, 5, 7, 9, 7, 4][(m * 3 + b) % 8];
          const pitch = midiToPitch(sMidi, keyName);
          const solfege = midiToNotAngka(sMidi, keyName).display;
          sopranoNotes.push({
            id: `S_${m + 1}_${b}`,
            isRest: false,
            pitch,
            duration: '1/4',
            durationBeats: 1,
            solfege,
          });
        }
      }
    } else {
      // 2/4 time
      for (let b = 0; b < 2; b++) {
        const sMidi = tonicMidi + [0, 4, 7, 4][(m + b) % 4];
        const pitch = midiToPitch(sMidi, keyName);
        const solfege = midiToNotAngka(sMidi, keyName).display;
        sopranoNotes.push({
          id: `S_${m + 1}_${b}`,
          isRest: false,
          pitch,
          duration: '1/4',
          durationBeats: 1,
          solfege,
        });
      }
    }

    measures.push({
      number: m + 1,
      chord,
      notes: {
        soprano: sopranoNotes,
        alto: [],
        tenor: [],
        bass: [],
      },
    });
  }

  // Now run SATB harmonization engine
  return harmonizeSATB(measures, keyName, style, 'soprano', DEFAULT_VOCAL_RANGES);
}
