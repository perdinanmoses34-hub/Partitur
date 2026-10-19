/**
 * SATB Composer Studio - Indonesian Not Angka 4-Voice Choral Viewer
 * Formatted authentically like church hymnals (Kidung Jemaat, Nyanyikanlah Kidung Baru,
 * Pelengkap Kidung Jemaat, Buku Ende, Puji Syukur).
 * Features parallel S, A, T, B rows, chords, bar lines, octave dots, durations, and lyrics.
 */

import React from 'react';
import { SATBScore, VoicePart } from '../types/music';

interface NotAngkaViewerProps {
  score: SATBScore;
  currentMeasure: number;
  zoom: number;
  onSelectMeasure?: (measureNumber: number) => void;
  onSelectNote?: (voice: VoicePart, measureNumber: number, noteIndex: number) => void;
  selectedVoice?: VoicePart;
  selectedMeasure?: number;
  selectedNoteIndex?: number;
}

export const NotAngkaViewer: React.FC<NotAngkaViewerProps> = ({
  score,
  currentMeasure,
  zoom,
  onSelectMeasure,
  onSelectNote,
  selectedVoice,
  selectedMeasure,
  selectedNoteIndex,
}) => {
  const { metadata, measures } = score;
  const timeSig = `${metadata.timeSignature.numerator}/${metadata.timeSignature.denominator}`;

  // Break measures into systems (typically 2-4 measures per system)
  const measuresPerSystem = 2;
  const systems: (typeof measures)[] = [];
  for (let i = 0; i < measures.length; i += measuresPerSystem) {
    systems.push(measures.slice(i, i + measuresPerSystem));
  }

  const voiceRows: { key: VoicePart; label: string; badgeColor: string }[] = [
    { key: 'soprano', label: 'S', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
    { key: 'alto',    label: 'A', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
    { key: 'tenor',   label: 'T', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { key: 'bass',    label: 'B', badgeColor: 'bg-sky-100 text-sky-800 border-sky-200' },
  ];

  return (
    <div
      className="w-full bg-white rounded-xl shadow-xs border border-slate-200 p-4 transition-all"
      style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
    >
      <div className="max-w-[1000px] mx-auto text-slate-800">
        {/* Sacred Choral Header */}
        <div className="text-center mb-6 pb-4 border-b border-slate-200">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase font-serif">
            {metadata.title}
          </h2>
          <p className="text-sm text-slate-600 mt-1 font-serif">
            1 = {metadata.key} &bull; {timeSig} &bull; MM &plusmn; {metadata.tempoBpm} BPM ({metadata.tempoMarking || 'Andante'})
          </p>
          <div className="flex justify-between items-center text-xs font-medium text-slate-600 mt-3 px-3">
            <span>Syair & Lagu: {metadata.composer || 'Tradisional'}</span>
            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-semibold border border-blue-200">
              Partitur Paduan Suara 4 Suara (S.A.T.B)
            </span>
            <span>Tata Suara: {metadata.arranger || 'SATB Studio'}</span>
          </div>
        </div>

        {/* Not Angka Systems */}
        <div className="space-y-8">
          {systems.map((systemMeasures, sysIdx) => {
            return (
              <div
                key={`system_${sysIdx}`}
                className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 shadow-xs"
              >
                {/* Chords and measure numbers row */}
                <div className="flex items-center pl-10 pr-2 mb-2 font-mono text-xs">
                  {systemMeasures.map((measure) => (
                    <div key={`m_hdr_${measure.number}`} className="flex-1 flex justify-between items-center px-3">
                      <span className="text-slate-400 font-sans font-bold">
                        Birama {measure.number}
                      </span>
                      {measure.chord && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold rounded-md text-xs shadow-xs border border-blue-200">
                          {measure.chord}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* 4 Voice Rows: S, A, T, B */}
                <div className="space-y-2">
                  {voiceRows.map(({ key, label, badgeColor }) => (
                    <div key={`voice_${key}`} className="flex items-center">
                      {/* Voice Label Badge */}
                      <div className="w-9 shrink-0 flex items-center justify-center">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold border shadow-2xs ${badgeColor}`}>
                          {label}
                        </span>
                      </div>

                      {/* Measures in this system */}
                      <div className="flex-1 flex items-stretch border-y border-slate-300 bg-white rounded-md overflow-hidden">
                        {systemMeasures.map((measure, mIdx) => {
                          const isMeasureActive = measure.number === currentMeasure;
                          const isMeasureSelected = measure.number === selectedMeasure;
                          const notes = measure.notes[key] || [];

                          return (
                            <div
                              key={`v_${key}_m_${measure.number}`}
                              onClick={() => onSelectMeasure && onSelectMeasure(measure.number)}
                              className={`flex-1 flex items-center justify-around py-2 px-2 border-r border-slate-300 cursor-pointer transition-colors relative ${
                                isMeasureActive
                                  ? 'bg-sky-100/70'
                                  : isMeasureSelected
                                  ? 'bg-blue-50/50'
                                  : 'hover:bg-slate-50'
                              } ${mIdx === 0 ? 'border-l border-slate-300' : ''}`}
                            >
                              {notes.map((note, nIdx) => {
                                const isNoteSelected =
                                  isMeasureSelected &&
                                  selectedVoice === key &&
                                  selectedNoteIndex === nIdx;

                                return (
                                  <div
                                    key={`note_${key}_${measure.number}_${nIdx}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectNote && onSelectNote(key, measure.number, nIdx);
                                    }}
                                    className={`relative flex flex-col items-center justify-center min-w-[26px] py-1 px-1 rounded-md transition-transform hover:scale-110 ${
                                      isNoteSelected
                                        ? 'bg-blue-600 text-white shadow-xs font-black'
                                        : 'hover:bg-blue-100/60'
                                    }`}
                                  >
                                    {/* Octave dot above if needed */}
                                    {note.solfege && note.solfege.includes('̇') && (
                                      <span className="text-[14px] leading-[6px] font-black -mb-1 text-slate-800">
                                        &bull;
                                      </span>
                                    )}

                                    {/* Solfege number or rest 0 */}
                                    <span
                                      className={`font-mono text-base font-bold tracking-widest ${
                                        note.isRest
                                          ? 'text-slate-400'
                                          : isNoteSelected
                                          ? 'text-white'
                                          : 'text-slate-900'
                                      }`}
                                    >
                                      {note.solfege || (note.isRest ? '0' : '.')}
                                    </span>

                                    {/* Octave dot below if needed */}
                                    {note.solfege && note.solfege.includes('̣') && (
                                      <span className="text-[14px] leading-[6px] font-black -mt-0.5 text-slate-800">
                                        &bull;
                                      </span>
                                    )}

                                    {/* Underline beam for 1/8 note (half beat) */}
                                    {note.duration === '1/8' && (
                                      <div className={`w-full h-[2px] mt-0.5 rounded-full ${isNoteSelected ? 'bg-white' : 'bg-slate-900'}`} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lyrics row underneath system */}
                <div className="flex items-center pl-10 pr-2 mt-2">
                  <div className="flex-1 flex">
                    {systemMeasures.map((measure) => {
                      const sNotes = measure.notes.soprano || [];
                      return (
                        <div key={`lyric_m_${measure.number}`} className="flex-1 flex justify-around px-2">
                          {sNotes.map((note, nIdx) => (
                            <span
                              key={`lyr_${measure.number}_${nIdx}`}
                              className="text-xs text-slate-600 italic font-serif truncate max-w-[60px] text-center"
                            >
                              {note.lyric || '\u00A0'}
                            </span>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
