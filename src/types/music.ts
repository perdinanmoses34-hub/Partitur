/**
 * SATB Composer Studio - Music Data Models
 */

export type VoicePart = 'soprano' | 'alto' | 'tenor' | 'bass';

export type KeyName = 
  | 'C' | 'G' | 'D' | 'A' | 'E' | 'B' | 'F#' | 'Gb' 
  | 'Db' | 'Ab' | 'Eb' | 'Bb' | 'F'
  | 'Am' | 'Em' | 'Bm' | 'F#m' | 'C#m' | 'G#m' | 'D#m' | 'Ebm'
  | 'Bbm' | 'Fm' | 'Cm' | 'Gm' | 'Dm';

export type KeyMode = 'major' | 'minor';

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export type NoteDuration = '1' | '1/2' | '1/4' | '1/8' | '1/16' | '1/4.' | '1/2.' | '1/8.';

export interface NotePitch {
  step: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
  alter?: number; // -1 flat, 0 natural, 1 sharp, etc.
  octave: number; // 2 to 6
}

export interface ScoreNote {
  id: string;
  isRest: boolean;
  pitch?: NotePitch;
  duration: NoteDuration; // in fractions of a whole note or beats
  durationBeats: number; // e.g., 1 for quarter note in 4/4, 2 for half note
  solfege?: string; // e.g. "1", "3", "5.", "5,", "0"
  accidentalSolfege?: string; // e.g. "4/", "7b"
  lyric?: string;
  isTied?: boolean;
  isDotted?: boolean;
  velocity?: number; // 1-127
}

export interface Measure {
  number: number;
  timeSignature?: TimeSignature;
  keySignature?: KeyName;
  chord?: string; // e.g. "C", "G7", "Am", "F"
  notes: {
    soprano: ScoreNote[];
    alto: ScoreNote[];
    tenor: ScoreNote[];
    bass: ScoreNote[];
  };
}

export type ArrangementStyle = 
  | 'church_traditional' 
  | 'hymn_satb' 
  | 'classical' 
  | 'modern_praise' 
  | 'simple_congregation' 
  | 'advanced_choral';

export interface VocalRange {
  minMidi: number;
  maxMidi: number;
  minNote: string;
  maxNote: string;
}

export interface VocalRangeSettings {
  soprano: VocalRange;
  alto: VocalRange;
  tenor: VocalRange;
  bass: VocalRange;
}

export interface ScoreMetadata {
  id: string;
  title: string;
  composer: string;
  arranger: string;
  lyricist?: string;
  key: KeyName;
  originalKey: KeyName;
  timeSignature: TimeSignature;
  tempoBpm: number;
  tempoMarking?: string; // e.g. "Andante maestoso"
  arrangementStyle: ArrangementStyle;
  melodyVoice: VoicePart;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  notesDescription?: string;
}

export interface SATBScore {
  metadata: ScoreMetadata;
  vocalRanges: VocalRangeSettings;
  measures: Measure[];
}

export interface ValidationIssue {
  id: string;
  category: 'error' | 'warning' | 'suggestion' | 'info';
  measureNumber: number;
  voice?: VoicePart | 'all';
  title: string;
  description: string;
  autoFixable?: boolean;
}

export type NotationViewMode = 'both' | 'standard' | 'not_angka';
