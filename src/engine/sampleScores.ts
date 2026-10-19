/**
 * SATB Composer Studio - Preloaded Sacred Choral Scores
 * Authentic 4-part SATB hymns and spiritual songs with lyrics, chords, and proper voice leading.
 */

import { SATBScore } from '../types/music';
import { DEFAULT_VOCAL_RANGES } from './musicTheory';

export const SAMPLE_SCORES: SATBScore[] = [
  {
    metadata: {
      id: 'sample_malam_kudus',
      title: 'Malam Kudus (Silent Night)',
      composer: 'Franz Gruber',
      arranger: 'SATB Studio',
      lyricist: 'Joseph Mohr',
      key: 'Bb',
      originalKey: 'Bb',
      timeSignature: { numerator: 3, denominator: 4 },
      tempoBpm: 76,
      tempoMarking: 'Andante con moto',
      arrangementStyle: 'hymn_satb',
      melodyVoice: 'soprano',
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      tags: ['Natal', 'Himne', 'Klasik'],
      notesDescription: 'Himne Natal legendaris dalam birama 3/4 dengan tekstur paduan suara 4 suara khidmat.'
    },
    vocalRanges: DEFAULT_VOCAL_RANGES,
    measures: [
      {
        number: 1,
        chord: 'Bb',
        notes: {
          soprano: [
            { id: 'S_1_1', isRest: false, pitch: { step: 'F', octave: 4 }, duration: '1/4.', durationBeats: 1.5, solfege: '5', lyric: 'Ma' },
            { id: 'S_1_2', isRest: false, pitch: { step: 'G', octave: 4 }, duration: '1/8', durationBeats: 0.5, solfege: '6', lyric: 'lam' },
            { id: 'S_1_3', isRest: false, pitch: { step: 'F', octave: 4 }, duration: '1/4', durationBeats: 1, solfege: '5', lyric: 'ku' },
          ],
          alto: [
            { id: 'A_1_1', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/4.', durationBeats: 1.5, solfege: '3', lyric: 'Ma' },
            { id: 'A_1_2', isRest: false, pitch: { step: 'E', alter: -1, octave: 4 }, duration: '1/8', durationBeats: 0.5, solfege: '4', lyric: 'lam' },
            { id: 'A_1_3', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/4', durationBeats: 1, solfege: '3', lyric: 'ku' },
          ],
          tenor: [
            { id: 'T_1_1', isRest: false, pitch: { step: 'B', alter: -1, octave: 3 }, duration: '1/4.', durationBeats: 1.5, solfege: '1', lyric: 'Ma' },
            { id: 'T_1_2', isRest: false, pitch: { step: 'B', alter: -1, octave: 3 }, duration: '1/8', durationBeats: 0.5, solfege: '1', lyric: 'lam' },
            { id: 'T_1_3', isRest: false, pitch: { step: 'B', alter: -1, octave: 3 }, duration: '1/4', durationBeats: 1, solfege: '1', lyric: 'ku' },
          ],
          bass: [
            { id: 'B_1_1', isRest: false, pitch: { step: 'B', alter: -1, octave: 2 }, duration: '1/2.', durationBeats: 3, solfege: '1̣', lyric: 'Ma' },
          ]
        }
      },
      {
        number: 2,
        chord: 'Bb',
        notes: {
          soprano: [
            { id: 'S_2_1', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/2.', durationBeats: 3, solfege: '3', lyric: 'dus' },
          ],
          alto: [
            { id: 'A_2_1', isRest: false, pitch: { step: 'B', alter: -1, octave: 3 }, duration: '1/2.', durationBeats: 3, solfege: '1', lyric: 'dus' },
          ],
          tenor: [
            { id: 'T_2_1', isRest: false, pitch: { step: 'F', octave: 3 }, duration: '1/2.', durationBeats: 3, solfege: '5̣', lyric: 'dus' },
          ],
          bass: [
            { id: 'B_2_1', isRest: false, pitch: { step: 'B', alter: -1, octave: 2 }, duration: '1/2.', durationBeats: 3, solfege: '1̣', lyric: 'dus' },
          ]
        }
      },
      {
        number: 3,
        chord: 'Bb',
        notes: {
          soprano: [
            { id: 'S_3_1', isRest: false, pitch: { step: 'F', octave: 4 }, duration: '1/4.', durationBeats: 1.5, solfege: '5', lyric: 'su' },
            { id: 'S_3_2', isRest: false, pitch: { step: 'G', octave: 4 }, duration: '1/8', durationBeats: 0.5, solfege: '6', lyric: 'nyi' },
            { id: 'S_3_3', isRest: false, pitch: { step: 'F', octave: 4 }, duration: '1/4', durationBeats: 1, solfege: '5', lyric: 'se' },
          ],
          alto: [
            { id: 'A_3_1', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/4.', durationBeats: 1.5, solfege: '3', lyric: 'su' },
            { id: 'A_3_2', isRest: false, pitch: { step: 'E', alter: -1, octave: 4 }, duration: '1/8', durationBeats: 0.5, solfege: '4', lyric: 'nyi' },
            { id: 'A_3_3', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/4', durationBeats: 1, solfege: '3', lyric: 'se' },
          ],
          tenor: [
            { id: 'T_3_1', isRest: false, pitch: { step: 'B', alter: -1, octave: 3 }, duration: '1/4.', durationBeats: 1.5, solfege: '1', lyric: 'su' },
            { id: 'T_3_2', isRest: false, pitch: { step: 'B', alter: -1, octave: 3 }, duration: '1/8', durationBeats: 0.5, solfege: '1', lyric: 'nyi' },
            { id: 'T_3_3', isRest: false, pitch: { step: 'B', alter: -1, octave: 3 }, duration: '1/4', durationBeats: 1, solfege: '1', lyric: 'se' },
          ],
          bass: [
            { id: 'B_3_1', isRest: false, pitch: { step: 'B', alter: -1, octave: 2 }, duration: '1/2.', durationBeats: 3, solfege: '1̣', lyric: 'su' },
          ]
        }
      },
      {
        number: 4,
        chord: 'Bb',
        notes: {
          soprano: [
            { id: 'S_4_1', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/2.', durationBeats: 3, solfege: '3', lyric: 'nyap' },
          ],
          alto: [
            { id: 'A_4_1', isRest: false, pitch: { step: 'B', alter: -1, octave: 3 }, duration: '1/2.', durationBeats: 3, solfege: '1', lyric: 'nyap' },
          ],
          tenor: [
            { id: 'T_4_1', isRest: false, pitch: { step: 'F', octave: 3 }, duration: '1/2.', durationBeats: 3, solfege: '5̣', lyric: 'nyap' },
          ],
          bass: [
            { id: 'B_4_1', isRest: false, pitch: { step: 'B', alter: -1, octave: 2 }, duration: '1/2.', durationBeats: 3, solfege: '1̣', lyric: 'nyap' },
          ]
        }
      },
      {
        number: 5,
        chord: 'F7',
        notes: {
          soprano: [
            { id: 'S_5_1', isRest: false, pitch: { step: 'C', octave: 5 }, duration: '1/2', durationBeats: 2, solfege: '2̇', lyric: 'Bintang' },
            { id: 'S_5_2', isRest: false, pitch: { step: 'C', octave: 5 }, duration: '1/4', durationBeats: 1, solfege: '2̇', lyric: 'Mu' },
          ],
          alto: [
            { id: 'A_5_1', isRest: false, pitch: { step: 'A', octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '7', lyric: 'Bintang' },
            { id: 'A_5_2', isRest: false, pitch: { step: 'A', octave: 4 }, duration: '1/4', durationBeats: 1, solfege: '7', lyric: 'Mu' },
          ],
          tenor: [
            { id: 'T_5_1', isRest: false, pitch: { step: 'E', alter: -1, octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '4', lyric: 'Bintang' },
            { id: 'T_5_2', isRest: false, pitch: { step: 'E', alter: -1, octave: 4 }, duration: '1/4', durationBeats: 1, solfege: '4', lyric: 'Mu' },
          ],
          bass: [
            { id: 'B_5_1', isRest: false, pitch: { step: 'F', octave: 3 }, duration: '1/2.', durationBeats: 3, solfege: '5̣', lyric: 'Bintang' },
          ]
        }
      },
      {
        number: 6,
        chord: 'Bb',
        notes: {
          soprano: [
            { id: 'S_6_1', isRest: false, pitch: { step: 'B', alter: -1, octave: 4 }, duration: '1/2.', durationBeats: 3, solfege: '1̇', lyric: 'terang' },
          ],
          alto: [
            { id: 'A_6_1', isRest: false, pitch: { step: 'F', octave: 4 }, duration: '1/2.', durationBeats: 3, solfege: '5', lyric: 'terang' },
          ],
          tenor: [
            { id: 'T_6_1', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/2.', durationBeats: 3, solfege: '3', lyric: 'terang' },
          ],
          bass: [
            { id: 'B_6_1', isRest: false, pitch: { step: 'B', alter: -1, octave: 2 }, duration: '1/2.', durationBeats: 3, solfege: '1̣', lyric: 'terang' },
          ]
        }
      },
      {
        number: 7,
        chord: 'Eb',
        notes: {
          soprano: [
            { id: 'S_7_1', isRest: false, pitch: { step: 'G', octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '6', lyric: 'Gemur' },
            { id: 'S_7_2', isRest: false, pitch: { step: 'G', octave: 4 }, duration: '1/4', durationBeats: 1, solfege: '6', lyric: 'lap' },
          ],
          alto: [
            { id: 'A_7_1', isRest: false, pitch: { step: 'E', alter: -1, octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '4', lyric: 'Gemur' },
            { id: 'A_7_2', isRest: false, pitch: { step: 'E', alter: -1, octave: 4 }, duration: '1/4', durationBeats: 1, solfege: '4', lyric: 'lap' },
          ],
          tenor: [
            { id: 'T_7_1', isRest: false, pitch: { step: 'B', alter: -1, octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '1', lyric: 'Gemur' },
            { id: 'T_7_2', isRest: false, pitch: { step: 'B', alter: -1, octave: 3 }, duration: '1/4', durationBeats: 1, solfege: '1', lyric: 'lap' },
          ],
          bass: [
            { id: 'B_7_1', isRest: false, pitch: { step: 'E', alter: -1, octave: 3 }, duration: '1/2.', durationBeats: 3, solfege: '4̣', lyric: 'Gemur' },
          ]
        }
      },
      {
        number: 8,
        chord: 'Bb',
        notes: {
          soprano: [
            { id: 'S_8_1', isRest: false, pitch: { step: 'F', octave: 4 }, duration: '1/2.', durationBeats: 3, solfege: '5', lyric: 'lah' },
          ],
          alto: [
            { id: 'A_8_1', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/2.', durationBeats: 3, solfege: '3', lyric: 'lah' },
          ],
          tenor: [
            { id: 'T_8_1', isRest: false, pitch: { step: 'B', alter: -1, octave: 3 }, duration: '1/2.', durationBeats: 3, solfege: '1', lyric: 'lah' },
          ],
          bass: [
            { id: 'B_8_1', isRest: false, pitch: { step: 'B', alter: -1, octave: 2 }, duration: '1/2.', durationBeats: 3, solfege: '1̣', lyric: 'lah' },
          ]
        }
      }
    ]
  },
  {
    metadata: {
      id: 'sample_kasih_pasti_lemah_lembut',
      title: 'Kasih Yang Ajaib (Amazing Grace)',
      composer: 'John Newton',
      arranger: 'SATB Studio',
      lyricist: 'John Newton',
      key: 'G',
      originalKey: 'G',
      timeSignature: { numerator: 3, denominator: 4 },
      tempoBpm: 80,
      tempoMarking: 'Maestoso con devozione',
      arrangementStyle: 'church_traditional',
      melodyVoice: 'soprano',
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      tags: ['Himne', 'Syukur', 'Ibadah'],
      notesDescription: 'Himne rohani agung 4 suara dengan harmoni paduan suara gereja yang menyentuh.'
    },
    vocalRanges: DEFAULT_VOCAL_RANGES,
    measures: [
      {
        number: 1,
        chord: 'G',
        notes: {
          soprano: [
            { id: 'S_1_1', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/4', durationBeats: 1, solfege: '5̣', lyric: 'A' },
            { id: 'S_1_2', isRest: false, pitch: { step: 'G', octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '1', lyric: 'ma' },
          ],
          alto: [
            { id: 'A_1_1', isRest: false, pitch: { step: 'B', octave: 3 }, duration: '1/4', durationBeats: 1, solfege: '3̣', lyric: 'A' },
            { id: 'A_1_2', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '5̣', lyric: 'ma' },
          ],
          tenor: [
            { id: 'T_1_1', isRest: false, pitch: { step: 'G', octave: 3 }, duration: '1/4', durationBeats: 1, solfege: '1', lyric: 'A' },
            { id: 'T_1_2', isRest: false, pitch: { step: 'B', octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '3', lyric: 'ma' },
          ],
          bass: [
            { id: 'B_1_1', isRest: false, pitch: { step: 'G', octave: 2 }, duration: '1/4', durationBeats: 1, solfege: '1̣', lyric: 'A' },
            { id: 'B_1_2', isRest: false, pitch: { step: 'G', octave: 2 }, duration: '1/2', durationBeats: 2, solfege: '1̣', lyric: 'ma' },
          ]
        }
      },
      {
        number: 2,
        chord: 'G',
        notes: {
          soprano: [
            { id: 'S_2_1', isRest: false, pitch: { step: 'B', octave: 4 }, duration: '1/8', durationBeats: 0.5, solfege: '3', lyric: 'zing' },
            { id: 'S_2_2', isRest: false, pitch: { step: 'G', octave: 4 }, duration: '1/8', durationBeats: 0.5, solfege: '1', lyric: 'grace' },
            { id: 'S_2_3', isRest: false, pitch: { step: 'B', octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '3', lyric: 'how' },
          ],
          alto: [
            { id: 'A_2_1', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/4', durationBeats: 1, solfege: '5̣', lyric: 'zing' },
            { id: 'A_2_2', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '5̣', lyric: 'how' },
          ],
          tenor: [
            { id: 'T_2_1', isRest: false, pitch: { step: 'G', octave: 3 }, duration: '1/4', durationBeats: 1, solfege: '1', lyric: 'zing' },
            { id: 'T_2_2', isRest: false, pitch: { step: 'G', octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '1', lyric: 'how' },
          ],
          bass: [
            { id: 'B_2_1', isRest: false, pitch: { step: 'G', octave: 2 }, duration: '1/4', durationBeats: 1, solfege: '1̣', lyric: 'zing' },
            { id: 'B_2_2', isRest: false, pitch: { step: 'G', octave: 2 }, duration: '1/2', durationBeats: 2, solfege: '1̣', lyric: 'how' },
          ]
        }
      },
      {
        number: 3,
        chord: 'C',
        notes: {
          soprano: [
            { id: 'S_3_1', isRest: false, pitch: { step: 'A', octave: 4 }, duration: '1/2.', durationBeats: 3, solfege: '2', lyric: 'sweet' },
          ],
          alto: [
            { id: 'A_3_1', isRest: false, pitch: { step: 'E', octave: 4 }, duration: '1/2.', durationBeats: 3, solfege: '6̣', lyric: 'sweet' },
          ],
          tenor: [
            { id: 'T_3_1', isRest: false, pitch: { step: 'C', octave: 4 }, duration: '1/2.', durationBeats: 3, solfege: '4', lyric: 'sweet' },
          ],
          bass: [
            { id: 'B_3_1', isRest: false, pitch: { step: 'C', octave: 3 }, duration: '1/2.', durationBeats: 3, solfege: '4̣', lyric: 'sweet' },
          ]
        }
      },
      {
        number: 4,
        chord: 'G',
        notes: {
          soprano: [
            { id: 'S_4_1', isRest: false, pitch: { step: 'G', octave: 4 }, duration: '1/2.', durationBeats: 3, solfege: '1', lyric: 'sound' },
          ],
          alto: [
            { id: 'A_4_1', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/2.', durationBeats: 3, solfege: '5̣', lyric: 'sound' },
          ],
          tenor: [
            { id: 'T_4_1', isRest: false, pitch: { step: 'B', octave: 3 }, duration: '1/2.', durationBeats: 3, solfege: '3', lyric: 'sound' },
          ],
          bass: [
            { id: 'B_4_1', isRest: false, pitch: { step: 'G', octave: 2 }, duration: '1/2.', durationBeats: 3, solfege: '1̣', lyric: 'sound' },
          ]
        }
      }
    ]
  },
  {
    metadata: {
      id: 'sample_suci_suci_suci',
      title: 'Suci, Suci, Suci (Holy, Holy, Holy)',
      composer: 'John Bacchus Dykes',
      arranger: 'SATB Studio',
      lyricist: 'Reginald Heber',
      key: 'D',
      originalKey: 'D',
      timeSignature: { numerator: 4, denominator: 4 },
      tempoBpm: 88,
      tempoMarking: 'Maestoso',
      arrangementStyle: 'hymn_satb',
      melodyVoice: 'soprano',
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      tags: ['Kidung Jemaat', 'Trinitas', 'Ibadah Minggu'],
      notesDescription: 'Himne Nicaea yang megah, aransemen empat suara SATB padat homofonik.'
    },
    vocalRanges: DEFAULT_VOCAL_RANGES,
    measures: [
      {
        number: 1,
        chord: 'D',
        notes: {
          soprano: [
            { id: 'S_1_1', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '1', lyric: 'Su' },
            { id: 'S_1_2', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '1', lyric: 'ci' },
          ],
          alto: [
            { id: 'A_1_1', isRest: false, pitch: { step: 'A', octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '5̣', lyric: 'Su' },
            { id: 'A_1_2', isRest: false, pitch: { step: 'A', octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '5̣', lyric: 'ci' },
          ],
          tenor: [
            { id: 'T_1_1', isRest: false, pitch: { step: 'F', alter: 1, octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '3', lyric: 'Su' },
            { id: 'T_1_2', isRest: false, pitch: { step: 'F', alter: 1, octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '3', lyric: 'ci' },
          ],
          bass: [
            { id: 'B_1_1', isRest: false, pitch: { step: 'D', octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '1̣', lyric: 'Su' },
            { id: 'B_1_2', isRest: false, pitch: { step: 'D', octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '1̣', lyric: 'ci' },
          ]
        }
      },
      {
        number: 2,
        chord: 'F#m',
        notes: {
          soprano: [
            { id: 'S_2_1', isRest: false, pitch: { step: 'F', alter: 1, octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '3', lyric: 'su' },
            { id: 'S_2_2', isRest: false, pitch: { step: 'F', alter: 1, octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '3', lyric: 'ci' },
          ],
          alto: [
            { id: 'A_2_1', isRest: false, pitch: { step: 'C', alter: 1, octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '7̣', lyric: 'su' },
            { id: 'A_2_2', isRest: false, pitch: { step: 'C', alter: 1, octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '7̣', lyric: 'ci' },
          ],
          tenor: [
            { id: 'T_2_1', isRest: false, pitch: { step: 'A', octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '5', lyric: 'su' },
            { id: 'T_2_2', isRest: false, pitch: { step: 'A', octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '5', lyric: 'ci' },
          ],
          bass: [
            { id: 'B_2_1', isRest: false, pitch: { step: 'F', alter: 1, octave: 2 }, duration: '1/2', durationBeats: 2, solfege: '3̣', lyric: 'su' },
            { id: 'B_2_2', isRest: false, pitch: { step: 'F', alter: 1, octave: 2 }, duration: '1/2', durationBeats: 2, solfege: '3̣', lyric: 'ci' },
          ]
        }
      },
      {
        number: 3,
        chord: 'G',
        notes: {
          soprano: [
            { id: 'S_3_1', isRest: false, pitch: { step: 'A', octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '5', lyric: 'Tu' },
            { id: 'S_3_2', isRest: false, pitch: { step: 'A', octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '5', lyric: 'han' },
          ],
          alto: [
            { id: 'A_3_1', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '1', lyric: 'Tu' },
            { id: 'A_3_2', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '1', lyric: 'han' },
          ],
          tenor: [
            { id: 'T_3_1', isRest: false, pitch: { step: 'B', octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '6', lyric: 'Tu' },
            { id: 'T_3_2', isRest: false, pitch: { step: 'B', octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '6', lyric: 'han' },
          ],
          bass: [
            { id: 'B_3_1', isRest: false, pitch: { step: 'G', octave: 2 }, duration: '1/2', durationBeats: 2, solfege: '4̣', lyric: 'Tu' },
            { id: 'B_3_2', isRest: false, pitch: { step: 'G', octave: 2 }, duration: '1/2', durationBeats: 2, solfege: '4̣', lyric: 'han' },
          ]
        }
      },
      {
        number: 4,
        chord: 'A7',
        notes: {
          soprano: [
            { id: 'S_4_1', isRest: false, pitch: { step: 'G', octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '4', lyric: 'Ma' },
            { id: 'S_4_2', isRest: false, pitch: { step: 'F', alter: 1, octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '3', lyric: 'ha' },
          ],
          alto: [
            { id: 'A_4_1', isRest: false, pitch: { step: 'C', alter: 1, octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '7̣', lyric: 'Ma' },
            { id: 'A_4_2', isRest: false, pitch: { step: 'D', octave: 4 }, duration: '1/2', durationBeats: 2, solfege: '1', lyric: 'ha' },
          ],
          tenor: [
            { id: 'T_4_1', isRest: false, pitch: { step: 'E', octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '2', lyric: 'Ma' },
            { id: 'T_4_2', isRest: false, pitch: { step: 'A', octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '5', lyric: 'ha' },
          ],
          bass: [
            { id: 'B_4_1', isRest: false, pitch: { step: 'A', octave: 2 }, duration: '1/2', durationBeats: 2, solfege: '5̣', lyric: 'Ma' },
            { id: 'B_4_2', isRest: false, pitch: { step: 'D', octave: 3 }, duration: '1/2', durationBeats: 2, solfege: '1̣', lyric: 'ha' },
          ]
        }
      }
    ]
  }
];
