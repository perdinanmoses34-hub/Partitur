/**
 * SATB Composer Studio - Score Validator & Quality Checker
 * Inspects SATB scores for rhythm balance, vocal range comfort,
 * parallel 5ths/octaves, voice crossings, large leaps, and cadence resolutions.
 */

import { SATBScore, ValidationIssue, VoicePart } from '../types/music';
import { KEYS_INFO, pitchToMidi, semitoneDistance } from './musicTheory';

export function validateScore(score: SATBScore): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { metadata, measures, vocalRanges } = score;
  const timeSig = metadata.timeSignature;
  const expectedBeatsPerMeasure = timeSig.numerator;
  const keyInfo = KEYS_INFO[metadata.key] || KEYS_INFO['C'];
  const rootPc = keyInfo.rootPitchClass;
  const leadingTonePc = (rootPc + 11) % 12;

  const voices: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];

  let prevMeasureNotes: Record<VoicePart, number[]> = {
    soprano: [],
    alto: [],
    tenor: [],
    bass: [],
  };

  measures.forEach((measure) => {
    const mNum = measure.number;

    // 1. Check Measure Beat Totals for each voice
    voices.forEach(voice => {
      const notes = measure.notes[voice] || [];
      if (notes.length === 0) {
        issues.push({
          id: `empty_${voice}_m${mNum}`,
          category: 'error',
          measureNumber: mNum,
          voice,
          title: `Suara ${capitalize(voice)} kosong di Birama ${mNum}`,
          description: `Tidak ada nada atau tanda istirahat yang terdaftar untuk suara ${capitalize(voice)}.`,
          autoFixable: true,
        });
        return;
      }

      const totalBeats = notes.reduce((sum, n) => sum + (n.durationBeats || 1), 0);
      const diff = Math.abs(totalBeats - expectedBeatsPerMeasure);
      if (diff > 0.05) {
        issues.push({
          id: `rhythm_${voice}_m${mNum}`,
          category: 'warning',
          measureNumber: mNum,
          voice,
          title: `Ketukan Birama ${mNum} (${capitalize(voice)}) Tidak Penuh`,
          description: `Total ketukan adalah ${totalBeats.toFixed(2)} dari seharusnya ${expectedBeatsPerMeasure} ketukan (${timeSig.numerator}/${timeSig.denominator}).`,
        });
      }

      // 2. Vocal Range Check
      const range = vocalRanges[voice];
      notes.forEach((note) => {
        if (!note.isRest && note.pitch) {
          const midi = pitchToMidi(note.pitch);
          if (midi < range.minMidi) {
            issues.push({
              id: `range_low_${voice}_m${mNum}`,
              category: 'warning',
              measureNumber: mNum,
              voice,
              title: `Nada ${capitalize(voice)} Terlalu Rendah di Birama ${mNum}`,
              description: `Nada bernilai MIDI ${midi} berada di bawah batas nyaman suara ${capitalize(voice)} (${range.minNote}).`,
              autoFixable: true,
            });
          } else if (midi > range.maxMidi) {
            issues.push({
              id: `range_high_${voice}_m${mNum}`,
              category: 'warning',
              measureNumber: mNum,
              voice,
              title: `Nada ${capitalize(voice)} Terlalu Tinggi di Birama ${mNum}`,
              description: `Nada bernilai MIDI ${midi} berada di atas batas nyaman suara ${capitalize(voice)} (${range.maxNote}).`,
              autoFixable: true,
            });
          }
        }
      });

      // 3. Large Melodic Leap Check within Voice
      for (let i = 1; i < notes.length; i++) {
        const prev = notes[i - 1];
        const cur = notes[i];
        if (!prev.isRest && !cur.isRest && prev.pitch && cur.pitch) {
          const leap = semitoneDistance(pitchToMidi(prev.pitch), pitchToMidi(cur.pitch));
          if (leap > 12) {
            issues.push({
              id: `leap_${voice}_m${mNum}_${i}`,
              category: 'suggestion',
              measureNumber: mNum,
              voice,
              title: `Lompatan Interval Besar pada Suara ${capitalize(voice)}`,
              description: `Terdapat lompatan interval sebesar ${leap} semiton (lebih dari satu oktaf) yang mungkin sulit dinyanyikan.`,
            });
          } else if (leap === 6) {
            issues.push({
              id: `tritone_${voice}_m${mNum}_${i}`,
              category: 'suggestion',
              measureNumber: mNum,
              voice,
              title: `Lompatan Tritone (Diminished 5th / Augmented 4th)`,
              description: `Lompatan tritone (6 semiton) pada suara ${capitalize(voice)} cenderung canggung dalam paduan suara tradisonal.`,
            });
          }
        }
      }
    });

    // 4. Voice Crossing Check (Soprano >= Alto >= Tenor >= Bass)
    const sNotes = measure.notes.soprano || [];
    const aNotes = measure.notes.alto || [];
    const tNotes = measure.notes.tenor || [];
    const bNotes = measure.notes.bass || [];

    const minLen = Math.min(sNotes.length, aNotes.length, tNotes.length, bNotes.length);
    for (let i = 0; i < minLen; i++) {
      const s = sNotes[i];
      const a = aNotes[i];
      const t = tNotes[i];
      const b = bNotes[i];

      if (!s.isRest && !a.isRest && s.pitch && a.pitch) {
        if (pitchToMidi(a.pitch) > pitchToMidi(s.pitch)) {
          issues.push({
            id: `crossing_sa_m${mNum}_${i}`,
            category: 'warning',
            measureNumber: mNum,
            title: `Voice Crossing: Alto Lebih Tinggi dari Sopran`,
            description: `Di birama ${mNum}, nada Alto melampaui nada Sopran.`,
            autoFixable: true,
          });
        }
      }

      if (!a.isRest && !t.isRest && a.pitch && t.pitch) {
        if (pitchToMidi(t.pitch) > pitchToMidi(a.pitch)) {
          issues.push({
            id: `crossing_at_m${mNum}_${i}`,
            category: 'warning',
            measureNumber: mNum,
            title: `Voice Crossing: Tenor Lebih Tinggi dari Alto`,
            description: `Di birama ${mNum}, nada Tenor melampaui nada Alto.`,
            autoFixable: true,
          });
        }
      }

      if (!t.isRest && !b.isRest && t.pitch && b.pitch) {
        if (pitchToMidi(b.pitch) > pitchToMidi(t.pitch)) {
          issues.push({
            id: `crossing_tb_m${mNum}_${i}`,
            category: 'warning',
            measureNumber: mNum,
            title: `Voice Crossing: Bass Lebih Tinggi dari Tenor`,
            description: `Di birama ${mNum}, nada Bass melampaui nada Tenor.`,
            autoFixable: true,
          });
        }
      }

      // Parallel 5ths & Octaves Check with previous chord
      const curMidis = {
        soprano: !s.isRest && s.pitch ? pitchToMidi(s.pitch) : 0,
        alto: !a.isRest && a.pitch ? pitchToMidi(a.pitch) : 0,
        tenor: !t.isRest && t.pitch ? pitchToMidi(t.pitch) : 0,
        bass: !b.isRest && b.pitch ? pitchToMidi(b.pitch) : 0,
      };

      if (i > 0) {
        const prevS = sNotes[i - 1];
        const prevB = bNotes[i - 1];
        if (!prevS.isRest && !prevB.isRest && prevS.pitch && prevB.pitch && curMidis.soprano && curMidis.bass) {
          const pS = pitchToMidi(prevS.pitch);
          const pB = pitchToMidi(prevB.pitch);
          const prevDist = (pS - pB) % 12;
          const curDist = (curMidis.soprano - curMidis.bass) % 12;
          if (curDist === prevDist && (curDist === 7 || curDist === 0) && pS !== curMidis.soprano) {
            issues.push({
              id: `parallel_sb_m${mNum}_${i}`,
              category: metadata.arrangementStyle === 'classical' ? 'warning' : 'info',
              measureNumber: mNum,
              title: curDist === 7 ? 'Paralel Kuint (Parallel Fifth) S-B' : 'Paralel Oktaf (Parallel Octave) S-B',
              description: `Gerakan searah kuint/oktaf sempurna antara Sopran dan Bass di birama ${mNum}.`,
            });
          }
        }
      }
    }
  });

  // Final Cadence Resolution Check
  const lastMeasure = measures[measures.length - 1];
  if (lastMeasure) {
    const sNotes = lastMeasure.notes.soprano || [];
    const bNotes = lastMeasure.notes.bass || [];
    const lastS = sNotes[sNotes.length - 1];
    const lastB = bNotes[bNotes.length - 1];
    if (lastB && !lastB.isRest && lastB.pitch) {
      const bMidi = pitchToMidi(lastB.pitch);
      const bPc = ((bMidi % 12) + 12) % 12;
      if (bPc !== rootPc) {
        issues.push({
          id: `cadence_bass_tonic`,
          category: 'suggestion',
          measureNumber: lastMeasure.number,
          voice: 'bass',
          title: `Nada Akhir Bass Bukan Nada Dasar (Tonic)`,
          description: `Untuk kadensa autentik yang kokoh, nada penutup Bass biasanya jatuh pada nada dasar (Do = ${metadata.key}).`,
        });
      }
    }
  }

  return issues;
}

/**
 * Automatically fix safe issues (clamp out-of-range notes to nearest valid octave, fix empty voices)
 */
export function autoFixScore(score: SATBScore): SATBScore {
  const fixed: SATBScore = JSON.parse(JSON.stringify(score));
  const { vocalRanges } = fixed;
  const voices: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];

  fixed.measures.forEach(measure => {
    voices.forEach(voice => {
      const notes = measure.notes[voice];
      const range = vocalRanges[voice];

      if (!notes || notes.length === 0) {
        // Fill empty voice with whole measure rest
        measure.notes[voice] = [{
          id: `${voice.toUpperCase()[0]}_${measure.number}_0`,
          isRest: true,
          duration: '1',
          durationBeats: fixed.metadata.timeSignature.numerator,
          solfege: '0'
        }];
        return;
      }

      notes.forEach(note => {
        if (!note.isRest && note.pitch) {
          let midi = pitchToMidi(note.pitch);
          let changed = false;

          while (midi < range.minMidi) {
            midi += 12;
            changed = true;
          }
          while (midi > range.maxMidi) {
            midi -= 12;
            changed = true;
          }

          if (changed) {
            const newPitch = {
              step: note.pitch.step,
              alter: note.pitch.alter,
              octave: Math.floor(midi / 12) - 1,
            };
            note.pitch = newPitch;
          }
        }
      });
    });
  });

  return fixed;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
